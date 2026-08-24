/**
 * AAC Sinhala tester group bridge.
 *
 * Official GroupsApp is query-only:
 * https://developers.google.com/apps-script/reference/groups/groups-app
 *
 * Supported here:
 *   GroupsApp.getGroupByEmail(email)
 *   group.hasUser(email)
 *   group.getRole(email)
 *
 * There is NO GroupsApp method to add, invite, or remove members.
 *
 * Mutation is attempted only through Admin SDK Directory Members.insert /
 * Members.remove, which Google documents for Google Workspace domain admins:
 * https://developers.google.com/apps-script/advanced/admin-sdk-directory
 * https://developers.google.com/workspace/admin/directory/reference/rest/v1/members/insert
 *
 * Consumer @googlegroups.com groups are not Workspace Directory resources.
 * If AdminDirectory is missing or returns domain/group-not-found, this script
 * returns MUTATION_UNAVAILABLE and does not pretend the member was added.
 */

var GROUP_EMAIL_DEFAULT = "aac-sinhala-testers@googlegroups.com";

function doPost(e) {
  try {
    var body = parseBody(e);
    var expected = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    var provided = String(body.sharedSecret || headerValue(e, "X-AAC-Script-Secret") || "");
    if (!expected || !provided || expected !== provided) {
      return jsonOutput({ ok: false, code: "AUTH_FAILURE", isMember: false, mutated: false });
    }
    var email = String(body.email || "").trim().toLowerCase();
    var groupEmail = String(body.groupEmail || GROUP_EMAIL_DEFAULT).trim().toLowerCase();
    var action = String(body.action || "check");
    var enableAdminDirectory = body.enableAdminDirectory === true;

    if (!isSimpleEmail(email)) {
      return jsonOutput({ ok: false, code: "INVALID_EMAIL", isMember: false, mutated: false });
    }

    if (action === "check") {
      return jsonOutput(checkMembership(email, groupEmail));
    }
    if (action === "invite") {
      return jsonOutput(inviteMember(email, groupEmail, enableAdminDirectory));
    }
    if (action === "remove") {
      return jsonOutput(removeMember(email, groupEmail, enableAdminDirectory));
    }
    return jsonOutput({ ok: false, code: "GROUP_FAILURE", isMember: false, mutated: false });
  } catch (error) {
    return jsonOutput({
      ok: false,
      code: classifyError(error),
      isMember: false,
      mutated: false,
    });
  }
}

function checkMembership(email, groupEmail) {
  var group = GroupsApp.getGroupByEmail(groupEmail);
  var isMember = group.hasUser(email);
  var role = null;
  if (isMember) {
    try {
      role = String(group.getRole(email));
    } catch (error) {
      role = null;
    }
  }
  var code = "NOT_MEMBER";
  if (isMember && (role === "INVITED" || role === "PENDING")) code = role;
  else if (isMember) code = "MEMBER";
  return {
    ok: true,
    code: code,
    isMember: isMember,
    role: role,
    mutated: false,
  };
}

function inviteMember(email, groupEmail, enableAdminDirectory) {
  var checked = checkMembership(email, groupEmail);
  if (checked.isMember) {
    return {
      ok: true,
      code: "ALREADY_MEMBER",
      isMember: true,
      role: checked.role,
      mutated: false,
    };
  }

  if (!enableAdminDirectory || typeof AdminDirectory === "undefined") {
    return {
      ok: false,
      code: "MUTATION_UNAVAILABLE",
      isMember: false,
      role: null,
      mutated: false,
    };
  }

  try {
    AdminDirectory.Members.insert({ email: email, role: "MEMBER" }, groupEmail);
    var after = checkMembership(email, groupEmail);
    return {
      ok: true,
      code: after.isMember ? "ADDED" : "INVITED",
      isMember: after.isMember,
      role: after.role,
      mutated: true,
    };
  } catch (error) {
    return {
      ok: false,
      code: classifyError(error),
      isMember: false,
      role: null,
      mutated: false,
    };
  }
}

function removeMember(email, groupEmail, enableAdminDirectory) {
  var checked = checkMembership(email, groupEmail);
  if (!checked.isMember) {
    return {
      ok: true,
      code: "NOT_MEMBER",
      isMember: false,
      role: null,
      mutated: false,
    };
  }
  if (!enableAdminDirectory || typeof AdminDirectory === "undefined") {
    return {
      ok: false,
      code: "MUTATION_UNAVAILABLE",
      isMember: checked.isMember,
      role: checked.role,
      mutated: false,
    };
  }
  try {
    AdminDirectory.Members.remove(groupEmail, email);
    return {
      ok: true,
      code: "NOT_MEMBER",
      isMember: false,
      role: null,
      mutated: true,
    };
  } catch (error) {
    return {
      ok: false,
      code: classifyError(error),
      isMember: checked.isMember,
      role: checked.role,
      mutated: false,
    };
  }
}

function classifyError(error) {
  var message = "";
  if (error && error.message) message = String(error.message);
  else message = String(error || "");
  var lower = message.toLowerCase();
  if (
    lower.indexOf("domain not found") !== -1 ||
    lower.indexOf("resource not found") !== -1 ||
    lower.indexOf("not a valid") !== -1 ||
    lower.indexOf("admin sdk") !== -1
  ) {
    return "MUTATION_UNAVAILABLE";
  }
  if (lower.indexOf("auth") !== -1 || lower.indexOf("permission") !== -1) {
    return "AUTH_FAILURE";
  }
  if (lower.indexOf("backend") !== -1 || lower.indexOf("unavailable") !== -1) {
    return "TEMPORARY_FAILURE";
  }
  return "GROUP_FAILURE";
}

function isSimpleEmail(email) {
  return /^[a-z0-9._%+\-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function headerValue(e, name) {
  if (e && e.headers && e.headers[name]) return e.headers[name];
  if (e && e.parameter && e.parameter[name]) return e.parameter[name];
  return "";
}

function jsonOutput(payload, status) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

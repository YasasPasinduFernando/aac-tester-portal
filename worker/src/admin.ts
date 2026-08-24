import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AdminIdentity {
  email: string;
}

export async function authenticateAdmin(input: {
  request: Request;
  teamDomain?: string;
  audience?: string;
  environment: string;
}): Promise<AdminIdentity | null> {
  const assertion = input.request.headers.get("Cf-Access-Jwt-Assertion");
  if (assertion && input.teamDomain && input.audience) {
    try {
      const issuer = `https://${input.teamDomain}`;
      const jwks = createRemoteJWKSet(
        new URL(`${issuer}/cdn-cgi/access/certs`),
      );
      const { payload } = await jwtVerify(assertion, jwks, {
        issuer,
        audience: input.audience,
      });
      const email = typeof payload.email === "string" ? payload.email : null;
      if (!email) return null;
      return { email };
    } catch {
      return null;
    }
  }

  // Local development only. Never a production password bypass.
  if (input.environment === "development") {
    const headerEmail = input.request.headers.get("X-Admin-Dev-Email");
    if (headerEmail && headerEmail.includes("@")) {
      return { email: headerEmail.trim().toLowerCase() };
    }
  }

  return null;
}

import { useState } from "react";
import { useT } from "../locale";
import AssistantPanel from "./AssistantPanel";

export default function AssistantHost() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="assistant-host">
      {open ? <AssistantPanel onClose={() => setOpen(false)} /> : null}
      <button
        type="button"
        className="assistant-fab"
        aria-expanded={open}
        aria-controls="assistant-title"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t.chatClose : t.chatTitle}
      </button>
    </div>
  );
}

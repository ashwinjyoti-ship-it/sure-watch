"use client";

import { useCallback, useEffect, useState } from "react";
import { checkApiKey, saveApiKey, deleteApiKey } from "@/lib/api";

type Status = "idle" | "saving" | "deleting" | "error";

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await checkApiKey();
      setKeyExists(res.exists);
      setUpdatedAt(res.updatedAt ?? null);
    } catch {
      // Silently fail — key status unknown
    }
  }, []);

  useEffect(() => {
    if (open) fetchStatus();
  }, [open, fetchStatus]);

  async function handleSave() {
    if (!draft.trim()) return;
    setStatus("saving");
    setErrorMsg("");

    try {
      await saveApiKey(draft.trim());
      setKeyExists(true);
      setDraft("");
      setEditing(false);
      await fetchStatus();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to save key");
    }
  }

  async function handleDelete() {
    setStatus("deleting");
    setErrorMsg("");

    try {
      await deleteApiKey();
      setKeyExists(false);
      setUpdatedAt(null);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove key");
    }
  }

  const showInput = !keyExists || editing;

  return (
    <div className="border-t border-ink/10 mt-6 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="font-heading text-xs uppercase tracking-wider text-ink/50 hover:text-ink transition-colors flex items-center gap-1"
      >
        <span
          className="inline-block transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          &#9656;
        </span>
        Settings
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <label className="font-heading text-[10px] uppercase tracking-wider text-ink/50 block">
            Anthropic API Key
          </label>

          {keyExists && !editing && (
            <div className="space-y-2">
              <p className="font-heading text-xs text-ink/70">
                API key configured
                {updatedAt && (
                  <span className="text-ink/40">
                    {" "}
                    &middot; updated{" "}
                    {new Date(updatedAt + "Z").toLocaleDateString()}
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="border-2 border-ink/20 text-ink/70 font-heading text-xs uppercase tracking-wider px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  disabled={status === "deleting"}
                  className="border-2 border-ink/20 text-ink/70 font-heading text-xs uppercase tracking-wider px-3 py-1.5 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {status === "deleting" ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          )}

          {showInput && (
            <div className="space-y-2">
              <input
                type="password"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="bg-transparent border-b-2 border-ink/20 focus:border-ink py-1 px-0 font-heading text-sm outline-none w-full tabular-nums transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!draft.trim() || status === "saving"}
                  className="border-2 border-ink bg-ink text-paper font-heading text-xs uppercase tracking-wider px-4 py-2 hover:bg-transparent hover:text-ink transition-colors disabled:opacity-50"
                >
                  {status === "saving" ? "Saving..." : "Save Key"}
                </button>
                {editing && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      setDraft("");
                      setErrorMsg("");
                    }}
                    className="border-2 border-ink/20 text-ink/70 font-heading text-xs uppercase tracking-wider px-3 py-2 hover:border-ink hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {status === "error" && errorMsg && (
            <p className="font-heading text-xs text-accent">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}

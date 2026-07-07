"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AIConfig, AIModel } from "@/types/ai-config";
import { OPENAI_MODELS, COMPATIBLE_PRESETS } from "@/types/ai-config";

type Props = {
  open: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
};

export function SettingsPanel({ open, onClose, config, onSave }: Props) {
  const [draft, setDraft] = useState<AIConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [customModel, setCustomModel] = useState("");

  // Sync when parent config changes (e.g. first hydration)
  useEffect(() => {
    setDraft(config);
    if (config.model && !OPENAI_MODELS.find((m) => m.value === config.model)) {
      setCustomModel(config.model);
    }
  }, [config]);

  const isCustomModel = draft.model === "custom" || (
    draft.model !== "" &&
    !OPENAI_MODELS.find((m) => m.value === draft.model)
  );

  function handleSave() {
    const finalModel = isCustomModel ? (customModel.trim() || "gpt-4o") : draft.model;
    const finalConfig = { ...draft, model: finalModel };
    onSave(finalConfig);
    onClose();
  }

  async function handleTest() {
    setTestStatus("testing");
    setTestMessage("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: "ping",
          aiConfig: { ...draft, model: isCustomModel ? customModel.trim() || "gpt-4o" : draft.model },
        }),
      });
      // Any non-network response (even 400/500) means the server reached the LLM layer
      const data = await res.json() as Record<string, unknown>;
      if (res.ok || (data.code && data.code !== "CONFIG_ERROR")) {
        setTestStatus("ok");
        setTestMessage("Connection successful!");
      } else {
        setTestStatus("fail");
        setTestMessage(String(data.error ?? "Connection failed"));
      }
    } catch {
      setTestStatus("fail");
      setTestMessage("Network error — is the dev server running?");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="settings"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 z-40 flex h-full w-105 flex-col border-l border-white/10 bg-[#0a0f17] shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-13 shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-[13px] font-semibold text-white">AI Provider Settings</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Stored locally in your browser
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/3 text-white/50 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Provider selector */}
              <Field label="Provider">
                <div className="grid grid-cols-2 gap-2">
                  {(["openai", "openai-compatible"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraft((d) => ({ ...d, provider: p }))}
                      className={[
                        "rounded-md border px-3 py-2.5 text-left text-[12px] transition-colors",
                        draft.provider === p
                          ? "border-sky-400/60 bg-sky-400/10 text-sky-200"
                          : "border-white/10 bg-white/3 text-white/60 hover:border-white/20 hover:text-white/80",
                      ].join(" ")}
                    >
                      {p === "openai" ? (
                        <>
                          <div className="font-medium text-inherit">OpenAI</div>
                          <div className="mt-0.5 text-[10px] text-white/40">platform.openai.com</div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-inherit">Self-hosted / Compatible</div>
                          <div className="mt-0.5 text-[10px] text-white/40">Ollama · LM Studio · Groq…</div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </Field>

              {/* API Key */}
              <Field label="API Key" hint={draft.provider === "openai" ? "Never sent to anyone except OpenAI" : "Required by most providers"}>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={draft.apiKey}
                    onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
                    placeholder={draft.provider === "openai" ? "sk-proj-…" : "Your provider key"}
                    spellCheck={false}
                    autoComplete="off"
                    className="h-9 w-full rounded-md border border-white/10 bg-white/3 px-3 pr-10 text-[13px] text-white placeholder:text-white/25 focus:border-sky-400/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/30 hover:text-white/60"
                    tabIndex={-1}
                  >
                    {showKey ? "hide" : "show"}
                  </button>
                </div>
              </Field>

              {/* Model */}
              <Field label="Model">
                <select
                  value={isCustomModel ? "custom" : (draft.model as AIModel)}
                  onChange={(e) => {
                    const val = e.target.value as AIModel;
                    setDraft((d) => ({ ...d, model: val }));
                    if (val !== "custom") setCustomModel("");
                  }}
                  className="h-9 w-full rounded-md border border-white/10 bg-[#0d1420] px-3 text-[13px] text-white focus:border-sky-400/50 focus:outline-none"
                >
                  {OPENAI_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                {isCustomModel && (
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. llama3, mistral, deepseek-coder…"
                    className="mt-2 h-9 w-full rounded-md border border-white/10 bg-white/3 px-3 text-[13px] text-white placeholder:text-white/25 focus:border-sky-400/50 focus:outline-none"
                  />
                )}
              </Field>

              {/* Base URL — only for compatible provider */}
              {draft.provider === "openai-compatible" && (
                <Field label="Base URL" hint="The /v1-compatible endpoint of your server">
                  <input
                    type="url"
                    value={draft.baseURL ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, baseURL: e.target.value }))}
                    placeholder="http://localhost:11434/v1"
                    spellCheck={false}
                    className="h-9 w-full rounded-md border border-white/10 bg-white/3 px-3 text-[13px] text-white placeholder:text-white/25 focus:border-sky-400/50 focus:outline-none"
                  />
                  {/* Presets */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {COMPATIBLE_PRESETS.map((p) => (
                      <button
                        key={p.baseURL}
                        onClick={() => setDraft((d) => ({ ...d, baseURL: p.baseURL }))}
                        title={p.note}
                        className="rounded border border-white/10 bg-white/3 px-2 py-0.5 text-[10px] text-white/50 transition-colors hover:border-sky-400/30 hover:text-sky-300"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {/* Security note */}
              <div className="rounded-md border border-amber-400/20 bg-amber-400/4 px-3 py-2.5 text-[11.5px] leading-relaxed text-amber-200/70">
                <span className="font-semibold text-amber-300/90">Security note:</span> Your API key
                is stored only in this browser's localStorage and sent directly to the AI provider
                via your local server. It is never stored on any third-party service.
              </div>

              {/* Test result */}
              {testStatus !== "idle" && (
                <div className={[
                  "rounded-md border px-3 py-2 text-[12px]",
                  testStatus === "testing" ? "border-white/10 text-white/50" :
                  testStatus === "ok"      ? "border-emerald-400/30 bg-emerald-400/6 text-emerald-300" :
                                             "border-rose-400/30 bg-rose-400/6 text-rose-300",
                ].join(" ")}>
                  {testStatus === "testing" ? "Testing connection…" : testMessage}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-5 py-4">
              <button
                onClick={handleTest}
                disabled={!draft.apiKey.trim() || testStatus === "testing"}
                className="h-9 rounded-md border border-white/10 bg-white/3 px-4 text-[12px] font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {testStatus === "testing" ? "Testing…" : "Test connection"}
              </button>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="h-9 rounded-md border border-white/10 bg-white/3 px-4 text-[12px] font-medium text-white/60 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-9 rounded-md border border-sky-400/40 bg-sky-400/15 px-4 text-[12px] font-medium text-sky-200 transition-colors hover:border-sky-400/60 hover:bg-sky-400/25"
              >
                Save
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          {label}
        </div>
        {hint && <div className="text-[10px] text-white/25">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

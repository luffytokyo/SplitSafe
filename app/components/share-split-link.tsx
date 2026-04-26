"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

export function ShareSplitLink({
  splitId,
  title,
}: {
  splitId: string;
  title: string;
}) {
  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");

  const shareUrl = useMemo(() => {
    return origin ? `${origin}/split/${splitId}` : `/split/${splitId}`;
  }, [origin, splitId]);

  const resetStatus = () => {
    window.setTimeout(() => setStatus("idle"), 1600);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
      resetStatus();
    } catch {
      setStatus("error");
      resetStatus();
    }
  };

  const shareLink = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        text: "Pay your share for this private split.",
        title,
        url: shareUrl,
      });
      setStatus("shared");
      resetStatus();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setStatus("error");
      resetStatus();
    }
  };

  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lime)]">
            Share link
          </p>
          <p className="mt-2 break-all font-mono text-sm text-[var(--ink)]">{shareUrl}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="secondary-action" onClick={copyLink} type="button">
            {status === "copied" ? "Copied" : "Copy"}
          </button>
          <button className="primary-action" onClick={shareLink} type="button">
            {status === "shared" ? "Shared" : "Share"}
          </button>
        </div>
      </div>
      {status === "error" ? (
        <p className="mt-3 text-sm text-red-200">Could not share the link. Select and copy it manually.</p>
      ) : null}
    </div>
  );
}

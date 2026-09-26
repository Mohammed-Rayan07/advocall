"use client";

import type { Lang } from "@/types";
import { formatTime } from "@/lib/core/format";
import { MessageSquare, Smartphone, CheckCheck } from "lucide-react";

interface SmsPreviewProps {
  messages: { at: string; to: string; language: Lang; text: string }[];
  lang?: Lang;
}

export default function SmsPreview({ messages }: SmsPreviewProps) {
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="rounded-card border border-line bg-surface p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
            SMS Dispatched to User
          </h3>
        </div>
        {lastMessage && (
          <span className="font-mono text-[11px] text-muted">
            {formatTime(lastMessage.at)}
          </span>
        )}
      </div>

      {!lastMessage ? (
        <div className="flex flex-col items-center justify-center py-5 text-center text-muted">
          <MessageSquare className="h-6 w-6 text-line mb-1.5" />
          <p className="text-xs">Awaiting SMS outcome dispatch</p>
          <p className="text-[11px] text-muted/70 mt-0.5">
            Advocall automatically texts the customer with the ticket number and promised date.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-accent-2/30 bg-surface-2/80 p-3.5 space-y-2">
          {/* Notification Header */}
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span className="font-mono font-medium text-accent-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />
              <span>Advocall SMS · {lastMessage.to}</span>
            </span>
            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent border border-line">
              {lastMessage.language}
            </span>
          </div>

          {/* SMS Body Bubble */}
          <div className="rounded-lg bg-surface border border-line/80 p-3 text-xs leading-[1.6] text-ink font-sans select-all">
            {lastMessage.text}
          </div>

          {/* Delivery receipt status */}
          <div className="flex items-center justify-end gap-1 text-[11px] text-good font-medium pt-0.5">
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Delivered to handset</span>
          </div>
        </div>
      )}
    </div>
  );
}

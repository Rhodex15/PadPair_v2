import { cn } from "../../../lib/cn";

/**
 * @param {{ text: string, time: string, isOwn?: boolean, avatar?: string, seen?: boolean }} props
 */
export default function ChatBubble({ text, time, isOwn, avatar, seen }) {
  return (
    <div className={cn("flex items-end gap-2 max-w-[85%]", isOwn ? "self-end flex-row-reverse" : "self-start")}>
      {!isOwn && avatar && <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover mb-1" />}
      <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
        <div
          className={cn(
            "p-3 rounded-2xl shadow-sm",
            isOwn
              ? "bg-primary/10 text-on-surface rounded-br-sm border border-primary/20"
              : "bg-surface-container-high text-on-surface rounded-bl-sm border border-outline-variant/30"
          )}
        >
          <p className="font-body-md text-body-md">{text}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">{time}</span>
          {isOwn && seen && <span className="material-symbols-outlined filled text-primary text-[14px]">done_all</span>}
        </div>
      </div>
    </div>
  );
}

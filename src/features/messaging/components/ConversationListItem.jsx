import { cn } from "../../../lib/cn";

/**
 * @param {{ name: string, avatar?: string, lastMessage: string, time: string,
 *   active?: boolean, unreadCount?: number, onClick?: () => void }} props
 */
export default function ConversationListItem({ name, avatar, lastMessage, time, active, unreadCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left border-l-4 transition-colors",
        active ? "bg-surface-container-highest border-primary" : "border-transparent hover:bg-surface-container"
      )}
    >
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-surface-charcoal" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline-sm">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={cn("font-label-lg text-label-lg text-on-surface truncate", unreadCount && "font-bold")}>{name}</h3>
          <span className={cn("font-label-sm text-label-sm shrink-0 ml-2", active || unreadCount ? "text-primary" : "text-on-surface-variant")}>
            {time}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <p className={cn("font-body-sm text-body-sm truncate", unreadCount ? "text-on-surface font-semibold" : "text-on-surface-variant")}>
            {lastMessage}
          </p>
          {unreadCount ? (
            <span className="bg-secondary text-on-secondary w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-label-sm shrink-0">
              {unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

import Icon from "./Icon";
import { cn } from "../utils/cn";

/**
 * @param {{ icon: string, label: string, tone?: "verified" | "primary" | "secondary" | "neutral" }} props
 */
export default function InfoPill({ icon, label, tone = "neutral" }) {
  const toneClasses = {
    verified: "bg-verified-green/10 text-verified-green",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    neutral: "bg-surface-container text-on-surface-variant",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm", toneClasses[tone])}>
      <Icon name={icon} size={14} filled />
      {label}
    </span>
  );
}

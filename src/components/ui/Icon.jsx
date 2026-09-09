import { cn } from "../../lib/cn";

/**
 * Wraps a Material Symbols Outlined glyph. The mockups use this icon font
 * throughout (not an SVG icon library), so we keep that for visual fidelity.
 * Pass the icon's name exactly as it appears at fonts.google.com/icons.
 */
export default function Icon({ name, filled = false, size = 20, className = "" }) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

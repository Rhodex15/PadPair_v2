// Tiny classnames combiner — avoids pulling in clsx for something this small.
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

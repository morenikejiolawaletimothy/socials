import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const tones = {
  neutral: "text-secondary hover:bg-primary-50 hover:text-primary-700",
  danger: "text-secondary hover:bg-danger-bg hover:text-danger",
};

/**
 * Round icon-only action in a row or tile (download, remove, more). 36px target, grey until hovered.
 * `label` is required: it is what screen readers say and the tooltip.
 */
export function IconButton({
  icon: IconCmp,
  label,
  tone = "neutral",
  loading = false,
  className = "",
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { icon: Icon; label: string; tone?: keyof typeof tones; loading?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={props.disabled || loading}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    >
      {loading ? <CircleNotch className="size-5 animate-spin" aria-hidden /> : <IconCmp className="size-5" aria-hidden />}
    </button>
  );
}

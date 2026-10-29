import Image from "next/image";

const sizes = {
  xs: "size-6 text-caption",
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-14 text-body-lg",
  xl: "size-20 font-display text-display-xl",
};

/** Round avatar: the photo when there is one, otherwise initials. */
export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string;
  /** Photo; initials show until there is one. */
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-900 ${sizes[size]} ${className}`}
    >
      {src ? <Image src={src} alt="" fill unoptimized className="object-cover" /> : initials}
    </span>
  );
}

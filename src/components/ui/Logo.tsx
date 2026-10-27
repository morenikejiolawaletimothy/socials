import Image from "next/image";

/** Primary blue mark. Light surfaces only; a light variant for dark surfaces is not supplied yet. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/brand/bluecut-mark.png"
      alt="Bluecut Socials"
      width={size}
      height={size}
      className="rounded-full"
      priority
    />
  );
}

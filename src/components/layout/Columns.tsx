/**
 * LinkedIn-style page columns for client and manager pages. Shares the top bar's container,
 * so the left column lines up with the logo and the right column with the "Me" menu.
 *
 * - left + right: 3 / 6 / 3 (feed pages such as Home)
 * - right only:   8 / 4    (content, messages, profile-style pages)
 * - left only:    3 / 9    (settings pages with a menu on the left)
 *
 * On mobile everything stacks into one column. Rails are hidden unless asked for.
 */
export function Columns({
  left,
  right,
  leftLabel = "Side panel",
  rightLabel = "More",
  children,
  leftOnMobile = "hide",
  rightOnMobile = "hide",
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Names for the side columns, so screen reader users can tell them apart. */
  leftLabel?: string;
  rightLabel?: string;
  children: React.ReactNode;
  leftOnMobile?: "hide" | "show";
  rightOnMobile?: "hide" | "show";
}) {
  const span = left && right ? "lg:col-span-6" : left || right ? (left ? "lg:col-span-9" : "lg:col-span-8") : "lg:col-span-12";
  const leftSpan = right ? "lg:col-span-3" : "lg:col-span-3";
  const rightSpan = left ? "lg:col-span-3" : "lg:col-span-4";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {left && (
        <aside aria-label={leftLabel} className={`${leftOnMobile === "hide" ? "hidden lg:flex" : "flex"} flex-col gap-4 ${leftSpan}`}>{left}</aside>
      )}
      <div className={`flex min-w-0 flex-col gap-4 ${span}`}>{children}</div>
      {right && (
        <aside aria-label={rightLabel} className={`${rightOnMobile === "hide" ? "hidden lg:flex" : "flex"} flex-col gap-4 ${rightSpan}`}>{right}</aside>
      )}
    </div>
  );
}

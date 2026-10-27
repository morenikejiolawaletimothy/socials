/** Progress for multi-step flows. Shows "Step x of y" plus labelled steps. No arrows, no icons. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <p className="mb-4 text-body-sm font-medium text-secondary">
        Step {current + 1} of {steps.length}
      </p>
      <ol className="flex items-start gap-2">
        {steps.map((label, i) => {
          const state = i < current ? "done" : i === current ? "current" : "upcoming";
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-[15px] left-[calc(-50%+16px)] h-0.5 w-[calc(100%-32px)] ${state === "upcoming" ? "bg-neutral-150" : "bg-primary-600"}`}
                />
              )}
              <span
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-body-sm font-semibold ${
                  state === "done"
                    ? "border-primary-600 bg-primary-600 text-inverse"
                    : state === "current"
                      ? "border-primary-600 bg-card text-primary-700 shadow-focus"
                      : "border-neutral-200 bg-card text-secondary"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-2 text-caption sm:text-body-sm ${
                  state === "current"
                    ? "font-semibold text-primary"
                    : state === "done"
                      ? "text-primary"
                      : "text-secondary"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

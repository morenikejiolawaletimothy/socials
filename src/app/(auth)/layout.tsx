import { AuthShowcase } from "./AuthShowcase";

/**
 * Sign-up, sign-in, reset and invite pages, laid out like Lovable's: the form on the left, a brand panel on the right.
 * On phones only the form shows.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-dvh bg-card">
        <main className="flex w-full flex-col justify-center px-4 py-12 sm:px-8 lg:w-1/2">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </main>
        <aside aria-hidden className="hidden lg:block lg:w-1/2">
          <div className="sticky top-0 h-dvh p-4">
            <AuthShowcase />
          </div>
        </aside>
      </div>
    </>
  );
}

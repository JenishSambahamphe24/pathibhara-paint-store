import { Logo } from "#/components/Logo/Logo";

import { m } from "#/paraglide/messages";

export function LoginHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <Logo onLight className="mb-8" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {m.login_page_title()}
      </h1>
      <p className="mt-2 text-sm text-foreground-subtle">
        {m.login_page_subtitle()}
      </p>
    </div>
  );
}

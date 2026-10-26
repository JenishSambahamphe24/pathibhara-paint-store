import { LoginForm } from "./LoginForm";
import { LoginHeader } from "./LoginHeader";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
}

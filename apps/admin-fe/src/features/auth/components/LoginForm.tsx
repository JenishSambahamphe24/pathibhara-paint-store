import { LogIn } from "lucide-react";

import { Button } from "#/components/Button/Button";

import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const { form, handleSubmit } = useLogin();

  return (
    <form.AppForm>
      <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border">
        <form
          onSubmit={FormHelper.submitHandler(handleSubmit)}
          noValidate
          className="space-y-5"
        >
          <form.AppField name="email">
            {(field) => (
              <field.FormInput
                label={m.login_email_label()}
                type="email"
                placeholder={m.login_email_placeholder()}
                autoComplete="email"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.FormInput
                label={m.login_password_label()}
                type="password"
                placeholder={m.login_password_placeholder()}
                autoComplete="current-password"
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                endIcon={<LogIn size={16} />}
                className="mt-2"
              >
                {isSubmitting ? m.login_submitting() : m.login_submit_button()}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </form.AppForm>
  );
}

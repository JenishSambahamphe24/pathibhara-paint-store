import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { adminLoginSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";

import { AuthApi } from "../api";
import { AuthSession } from "../session.helper";
import { authStore } from "../store/authStore";

export function useLogin() {
  const hasSubmittedRef = useRef(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: AuthApi.login,
    onSuccess: async (tokens) => {
      await AuthSession.store(tokens);
      authStore.setState(() => ({
        isAuthenticated: true,
        admin: tokens.admin,
      }));
      await navigate({ to: "/dashboard" });
    },
  });

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: adminLoginSchema,
      onChange: FormHelper.gatedSchema(adminLoginSchema, hasSubmittedRef),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        FormHelper.handleSubmitError(error, formApi);
      }
    },
  });

  function handleSubmit() {
    hasSubmittedRef.current = true;
    form.handleSubmit();
  }

  return { form, handleSubmit };
}

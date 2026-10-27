import type { IPost, TPostFormValues } from "../types";
import type { PostInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { postInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { PostApi } from "../api";
import { PostFormHelper } from "../helpers/postForm.helper";
import { POST_DETAIL_QUERY_KEY, POST_LIST_QUERY_KEY } from "./usePosts";

export function usePostForm(post: IPost | null) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (value: TPostFormValues) => {
      const body = value as unknown as PostInput;
      return post ? PostApi.update(post.id, body) : PostApi.create(body);
    },
    onSuccess: async (saved) => {
      toaster.success({ description: post ? m.blog_saved() : m.blog_created() });
      queryClient.setQueryData([POST_DETAIL_QUERY_KEY, saved.id], saved);
      await queryClient.invalidateQueries({ queryKey: [POST_LIST_QUERY_KEY] });
      if (!post) await navigate({ to: "/blog/$postId", params: { postId: saved.id } });
    },
  });

  const form = useAppForm({
    defaultValues: PostFormHelper.defaults(post),
    validators: {
      onSubmit: FormHelper.validator<TPostFormValues>(postInputSchema),
      onChange: FormHelper.gatedSchema(FormHelper.validator<TPostFormValues>(postInputSchema), hasSubmittedRef),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await mutation.mutateAsync(value);
        formApi.reset(PostFormHelper.defaults(saved));
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

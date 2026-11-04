import type { IPublicPost } from "../types";

import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";

import { ContactHelper } from "#/lib/helpers/contact.helper";
import { DateHelper } from "#/lib/helpers/date.helper";

import { ArticleBody } from "./ArticleBody";
import { GuideCover } from "./GuideCover";

interface ArticlePageProps {
  post: IPublicPost;
}

export function ArticlePage({ post }: ArticlePageProps) {
  return (
    <div className="mx-auto max-w-[768px] px-4 pt-4 pb-6 lg:px-6 lg:pt-7 lg:pb-[72px]">
      <Link
        to="/guides"
        className="mb-2 inline-flex min-h-tap items-center font-bold text-accent hover:text-accent-hover"
      >
        ← All guides
      </Link>
      <article className="flex flex-col gap-[18px]">
        <header className="flex flex-col gap-2.5">
          <span className="text-[13px] font-bold tracking-[0.12em] text-brand uppercase">
            <time dateTime={post.publishedAt}>
              {DateHelper.bsLong(post.publishedAt)}
            </time>
          </span>
          <h1 className="m-0 font-display text-5xl leading-[0.86] font-semibold text-balance uppercase lg:text-[72px]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="m-0 text-[19px] leading-normal text-ink-soft">
              {post.excerpt}
            </p>
          )}
        </header>
        {post.coverImage && (
          <GuideCover
            image={post.coverImage}
            size="lg"
            eager
            className="aspect-video rounded-card"
          />
        )}

        <ArticleBody html={post.contentHtml} />

        <div className="flex flex-col gap-2.5 border-t-2 border-ink pt-4">
          <span className="font-display text-[28px] leading-none font-semibold uppercase">
            Work out what you need
          </span>
          <Link
            to="/calculator"
            className={`${BUTTON_CLASSES.primary} min-h-[52px] text-[22px]`}
          >
            Open the cost calculator
          </Link>
          <a
            href={ContactHelper.whatsappHref(
              `Hello, I read your guide "${post.title}" and have a question.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES.whatsapp} min-h-[50px] text-[22px]`}
          >
            <MessageCircle size={18} aria-hidden="true" />
            Ask us on WhatsApp
          </a>
        </div>
      </article>
    </div>
  );
}

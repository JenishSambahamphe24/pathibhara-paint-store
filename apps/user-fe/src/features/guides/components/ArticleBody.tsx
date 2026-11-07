interface ArticleBodyProps {
  // Rendered and sanitized by the API when the post was saved.
  html: string;
}

// Styles the tags the admin editor can produce (see the API's
// PostHtmlRenderer); a blockquote is drawn as the design's callout box.
const PROSE = [
  "flex flex-col gap-[18px] text-[17px] leading-[1.65]",
  "[&_p]:m-0",
  "[&_h2]:mt-2.5 [&_h2]:mb-0 [&_h2]:font-display [&_h2]:text-[34px] [&_h2]:leading-[0.95] [&_h2]:font-semibold [&_h2]:uppercase",
  "[&_h3]:mt-1.5 [&_h3]:mb-0 [&_h3]:font-display [&_h3]:text-[26px] [&_h3]:leading-none [&_h3]:font-semibold [&_h3]:uppercase",
  "[&_ul]:m-0 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-[22px]",
  "[&_ol]:m-0 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-1.5 [&_ol]:pl-[22px]",
  "[&_blockquote]:m-0 [&_blockquote]:rounded-field [&_blockquote]:border [&_blockquote]:border-line [&_blockquote]:bg-surface [&_blockquote]:px-3.5 [&_blockquote]:py-3 [&_blockquote]:text-base",
  "[&_a]:font-semibold [&_a]:text-accent [&_a]:underline [&_a:hover]:text-accent-hover",
  "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-card",
  "[&_hr]:my-2 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-line",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-field [&_pre]:bg-surface-2 [&_pre]:p-3 [&_pre]:text-sm",
  "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1",
].join(" ");

export function ArticleBody({ html }: ArticleBodyProps) {
  return <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />;
}

import { SignBoard } from "#/components/SignBoard/SignBoard";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

// Stands in for a page whose design isn't approved yet, so the navigation and
// URLs can exist from the start. Routes using it are noindex.
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-4 px-4 py-12 lg:px-6">
      <SignBoard kicker="Coming soon" title={title} as="h1" />
      <p className="m-0 max-w-xl text-base text-muted">{description}</p>
    </div>
  );
}

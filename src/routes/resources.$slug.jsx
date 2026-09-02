import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getGuide } from "@/lib/resources";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title || "Resource"} | Property Mogul` },
      { name: "description", content: loaderData?.summary || "Property Mogul safety resource." },
    ],
  }),
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const guide = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-on-surface md:px-10">
      <article className="mx-auto max-w-3xl">
        <Link to="/resources" className="text-sm text-primary-container hover:underline">
          ← All resources
        </Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-widest text-primary-container">
          {guide.category} · {guide.readingTime}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{guide.title}</h1>
        <p className="mt-5 text-lg text-on-surface-variant">{guide.summary}</p>
        <div className="mt-10 space-y-6 text-base leading-8 text-on-surface-variant">
          {guide.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}

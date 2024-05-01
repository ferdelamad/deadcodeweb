// import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { increment } from 'app/db/actions';
import { unstable_noStore as noStore } from 'next/cache';
import { getPost } from 'app/db/queries';

function formatDate(date: string) {
  noStore();
  let currentDate = new Date().getTime();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date).getTime();
  let timeDifference = Math.abs(currentDate - targetDate);
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
  let fullDate = new Date(date).toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (daysAgo < 1) {
    return 'Today';
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7)
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30)
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365)
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}

export default async function Blog({ params }) {
  let post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const incrementViews = cache(increment);
  incrementViews(params.slug);

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.createdAt,
            dateModified: post.createdAt,
            description: post.summary,
            image: post.img
              ? `https://leerob.io${post.img}`
              : `https://leerob.io/og?title=${post.title}`,
            url: `https://leerob.io/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'DeadCode',
            },
          }),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(post.createdAt.toISOString())}
          </p>
        </Suspense>
        <p className="text-neutral-600 dark:text-neutral-400">
          {`${post.views} views`}
        </p>
      </div>
      <article className="prose prose-quoteless prose-neutral dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
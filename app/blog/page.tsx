import Link from 'next/link';
import { getPosts } from 'app/db/queries';

export const metadata = {
  title: 'Blog',
  description: 'Read my thoughts on software development, design, and more.',
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        thoughts from the grave
      </h1>
      {posts
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/blog/${post.slug}`}
          >
            <div className="w-full flex flex-col">
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.title}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
               {`${post.views} views`}
              </p>
            </div>
          </Link>
        ))}
    </section>
  );
}

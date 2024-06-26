'use server';

import { auth, youtube } from '@googleapis/youtube';
import { sql } from '@vercel/postgres';
import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from 'next/cache';
import prisma from 'db';

let googleAuth = new auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
});

let yt = youtube({
  version: 'v3',
  auth: googleAuth,
});

export async function getBlogViews() {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  let views = await sql`
    SELECT count
    FROM views
  `;

  return views.rows.reduce((acc, curr) => acc + Number(curr.count), 0);
}

export type ViewT = { slug: string; count: number; };

export async function getViewsCount(): Promise<ViewT[]> {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  const query = await sql`SELECT slug, count FROM views`

  return query.rows as ViewT[]
}

export const getLeeYouTubeSubs = cache(
  async () => {
    let response = await yt.channels.list({
      id: ['UCZMli3czZnd1uoc1ShTouQw'],
      part: ['statistics'],
    });

    let channel = response.data.items![0];
    return Number(channel?.statistics?.subscriberCount).toLocaleString();
  },
  ['leerob-youtube-subs'],
  {
    revalidate: 3600,
  }
);

export const getVercelYouTubeSubs = cache(
  async () => {
    let response = await yt.channels.list({
      id: ['UCLq8gNoee7oXM7MvTdjyQvA'],
      part: ['statistics'],
    });

    let channel = response.data.items![0];
    return Number(channel?.statistics?.subscriberCount).toLocaleString();
  },
  ['vercel-youtube-subs'],
  {
    revalidate: 3600,
  }
);

export async function getGuestbookEntries() {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  const query = await sql`
    SELECT id, body, created_by, updated_at
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return query.rows;
}

export async function getPosts() {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();

  const posts = await prisma.post.findMany();
  return posts;
}

export async function getPost(slug: string) {
  if (!process.env.POSTGRES_URL) {
    return undefined;
  }

  noStore();

  const post = await prisma.post.findUnique({
    where: {
      slug
    }
  })
  return post;
}
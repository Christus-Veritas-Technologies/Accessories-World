import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface PostFrontmatter {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface PostData extends PostMeta {
  content: string;
}

export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx?$/, ''));
}

export function getSortedPostsData(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostMeta[] = fileNames
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        pubDate: new Date(data.pubDate as string),
        updatedDate: data.updatedDate
          ? new Date(data.updatedDate as string)
          : undefined,
        heroImage: data.heroImage as string | undefined,
      };
    });

  return allPostsData.sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
  );
}

export function getPostData(slug: string): PostData {
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);

  const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    pubDate: new Date(data.pubDate as string),
    updatedDate: data.updatedDate
      ? new Date(data.updatedDate as string)
      : undefined,
    heroImage: data.heroImage as string | undefined,
    content,
  };
}

// ID ролика из ссылки YouTube: watch?v=, youtu.be/, shorts/, embed/. null — не YouTube
export function youtubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url
    .trim()
    .match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

import type { ShowItem } from "./do-spaces";
import { getShowsMetadata, saveShowsMetadata } from "./do-spaces";

export type { ShowItem };

export async function getShows(): Promise<ShowItem[]> {
  const items = await getShowsMetadata();
  return items.sort((a, b) => a.order - b.order);
}

export async function getShow(id: string): Promise<ShowItem | null> {
  const items = await getShowsMetadata();
  return items.find((item) => item.id === id) ?? null;
}

export async function createShow(
  title: string,
  imageUrl: string,
  featuredOnHomepage: boolean = true,
  linkUrl?: string,
  linkLabel?: string,
  startDate?: string,
  endDate?: string
): Promise<ShowItem> {
  const items = await getShowsMetadata();
  const newItem: ShowItem = {
    id: Date.now().toString(),
    title,
    imageUrl,
    order: items.length,
    featuredOnHomepage,
    ...(linkUrl ? { linkUrl } : {}),
    ...(linkLabel ? { linkLabel } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveShowsMetadata([...items, newItem]);
  return newItem;
}

export async function updateShow(
  id: string,
  updates: Partial<Pick<ShowItem, "title" | "imageUrl" | "order" | "featuredOnHomepage" | "linkUrl" | "linkLabel" | "startDate" | "endDate">>
): Promise<ShowItem | null> {
  const items = await getShowsMetadata();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveShowsMetadata(items);
  return items[idx];
}

export async function deleteShow(id: string): Promise<boolean> {
  const items = await getShowsMetadata();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  filtered.forEach((item, i) => { item.order = i; });
  await saveShowsMetadata(filtered);
  return true;
}

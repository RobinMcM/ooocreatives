import type { CarouselItem } from "./do-spaces";
import { getCarouselMetadata, saveCarouselMetadata } from "./do-spaces";

export type { CarouselItem };

export async function getCarouselItems(): Promise<CarouselItem[]> {
  const items = await getCarouselMetadata();
  return items.sort((a, b) => a.order - b.order);
}

export async function getCarouselItem(id: string): Promise<CarouselItem | null> {
  const items = await getCarouselMetadata();
  return items.find((item) => item.id === id) ?? null;
}

export async function createCarouselItem(
  title: string,
  imageUrl: string
): Promise<CarouselItem> {
  const items = await getCarouselMetadata();
  const newItem: CarouselItem = {
    id: Date.now().toString(),
    title,
    imageUrl,
    order: items.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveCarouselMetadata([...items, newItem]);
  return newItem;
}

export async function updateCarouselItem(
  id: string,
  updates: Partial<Pick<CarouselItem, "title" | "imageUrl" | "order">>
): Promise<CarouselItem | null> {
  const items = await getCarouselMetadata();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveCarouselMetadata(items);
  return items[idx];
}

export async function deleteCarouselItem(id: string): Promise<boolean> {
  const items = await getCarouselMetadata();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  filtered.forEach((item, i) => { item.order = i; });
  await saveCarouselMetadata(filtered);
  return true;
}

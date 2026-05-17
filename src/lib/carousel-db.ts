import fs from "fs/promises";
import path from "path";

export interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".carousel-data");
const DATA_FILE = path.join(DATA_DIR, "carousel.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Read all carousel items
export async function getCarouselItems(): Promise<CarouselItem[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get a single carousel item
export async function getCarouselItem(id: string): Promise<CarouselItem | null> {
  const items = await getCarouselItems();
  return items.find((item) => item.id === id) || null;
}

// Create a new carousel item
export async function createCarouselItem(
  title: string,
  imageUrl: string
): Promise<CarouselItem> {
  const items = await getCarouselItems();
  const newItem: CarouselItem = {
    id: Date.now().toString(),
    title,
    imageUrl,
    order: items.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.push(newItem);
  await saveCarouselItems(items);
  return newItem;
}

// Update a carousel item
export async function updateCarouselItem(
  id: string,
  updates: Partial<Pick<CarouselItem, "title" | "imageUrl" | "order">>
): Promise<CarouselItem | null> {
  const items = await getCarouselItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveCarouselItems(items);
  return items[index];
}

// Delete a carousel item
export async function deleteCarouselItem(id: string): Promise<boolean> {
  const items = await getCarouselItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);

  // Reorder remaining items
  items.forEach((item, i) => {
    item.order = i;
  });

  await saveCarouselItems(items);
  return true;
}

// Save carousel items
async function saveCarouselItems(items: CarouselItem[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
}

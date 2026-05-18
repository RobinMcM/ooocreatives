import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const spacesClient = new S3Client({
  region: process.env.DO_SPACES_REGION || "nyc3",
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT || "nyc3.digitaloceanspaces.com"}`,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || "",
  },
});

const SPACES_NAME = process.env.DO_SPACES_NAME || "";
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT || "nyc3.digitaloceanspaces.com";

export async function uploadCarouselImage(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  try {
    const key = `carousel/${Date.now()}-${filename}`;

    await spacesClient.send(
      new PutObjectCommand({
        Bucket: SPACES_NAME,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: "public-read",
      })
    );

    return `https://${SPACES_NAME}.${SPACES_ENDPOINT}/${key}`;
  } catch (error) {
    console.error("Error uploading to DO Spaces:", error);
    throw error;
  }
}

export async function deleteCarouselImage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    await spacesClient.send(
      new DeleteObjectCommand({
        Bucket: SPACES_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Error deleting from DO Spaces:", error);
    throw error;
  }
}

const METADATA_KEY = "carousel/metadata.json";

export interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export async function getCarouselMetadata(): Promise<CarouselItem[]> {
  try {
    const response = await spacesClient.send(
      new GetObjectCommand({ Bucket: SPACES_NAME, Key: METADATA_KEY })
    );
    const body = await response.Body?.transformToString();
    return body ? JSON.parse(body) : [];
  } catch (error: any) {
    if (error.name === "NoSuchKey") return [];
    throw error;
  }
}

export async function saveCarouselMetadata(items: CarouselItem[]): Promise<void> {
  await spacesClient.send(
    new PutObjectCommand({
      Bucket: SPACES_NAME,
      Key: METADATA_KEY,
      Body: JSON.stringify(items, null, 2),
      ContentType: "application/json",
    })
  );
}

// ── Actors ────────────────────────────────────────────────────────────────────

export interface Actor {
  id: string;
  name: string;
  photoUrl: string;
  createdAt: string;
}

export async function getActorsMetadata(showId: string): Promise<Actor[]> {
  try {
    const response = await spacesClient.send(
      new GetObjectCommand({ Bucket: SPACES_NAME, Key: `shows/${showId}/actors.json` })
    );
    const body = await response.Body?.transformToString();
    return body ? JSON.parse(body) : [];
  } catch (error: any) {
    if (error.name === "NoSuchKey") return [];
    throw error;
  }
}

export async function saveActorsMetadata(showId: string, actors: Actor[]): Promise<void> {
  await spacesClient.send(
    new PutObjectCommand({
      Bucket: SPACES_NAME,
      Key: `shows/${showId}/actors.json`,
      Body: JSON.stringify(actors, null, 2),
      ContentType: "application/json",
    })
  );
}

export async function uploadActorPhoto(
  showId: string,
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const key = `shows/${showId}/actors/${Date.now()}-${filename}`;
  await spacesClient.send(
    new PutObjectCommand({
      Bucket: SPACES_NAME,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: "public-read",
    })
  );
  return `https://${SPACES_NAME}.${SPACES_ENDPOINT}/${key}`;
}

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "amae-recordings";
const DB_VERSION = 1;
const META_STORE = "recording-meta";
const BLOB_STORE = "recording-blobs";

export interface RecordingMeta {
  id: string;
  name: string;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  size: number;
}

interface BlobRecord {
  id: string;
  blob: Blob;
}

function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(META_STORE)) {
        const meta = db.createObjectStore(META_STORE, { keyPath: "id" });
        meta.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
    },
  });
}

export async function saveRecording(
  blob: Blob,
  durationMs: number,
  name?: string,
): Promise<RecordingMeta> {
  const id = crypto.randomUUID();
  const meta: RecordingMeta = {
    id,
    name: name ?? `Recording ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    durationMs,
    mimeType: blob.type || "audio/mpeg",
    size: blob.size,
  };

  const db = await getDB();
  const tx = db.transaction([META_STORE, BLOB_STORE], "readwrite");
  await tx.objectStore(META_STORE).put(meta);
  await tx.objectStore(BLOB_STORE).put({ id, blob });
  await tx.done;

  return meta;
}

export async function listRecordings(): Promise<RecordingMeta[]> {
  const db = await getDB();
  const all = (await db.getAll(META_STORE)) as RecordingMeta[];
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRecordingBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = (await db.get(BLOB_STORE, id)) as BlobRecord | undefined;
  return record?.blob;
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([META_STORE, BLOB_STORE], "readwrite");
  await tx.objectStore(META_STORE).delete(id);
  await tx.objectStore(BLOB_STORE).delete(id);
  await tx.done;
}

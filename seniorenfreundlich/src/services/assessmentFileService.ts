import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { db } from "@/src/db/db";
import { assessmentFiles } from "@/src/db/schema";

export type AssessmentFileRow = typeof assessmentFiles.$inferSelect;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadAssessmentFile(
  answerId: string,
  file: File,
  options?: { accept?: string[]; maxSizeMb?: number }
): Promise<AssessmentFileRow> {
  const maxBytes = (options?.maxSizeMb ?? 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `Datei zu groß. Maximale Größe: ${options?.maxSizeMb ?? 10} MB.`
    );
  }

  const allowed = options?.accept ?? ALLOWED_MIME_TYPES;
  const mimeOk = allowed.some((pattern) => {
    if (pattern.endsWith("/*")) {
      return file.type.startsWith(pattern.slice(0, -1));
    }
    return file.type === pattern || file.name.endsWith(pattern);
  });
  if (!mimeOk) {
    throw new Error("Dateityp nicht erlaubt.");
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const blobPath = `assessment-files/${answerId}/${crypto.randomUUID()}.${ext}`;
  const blob = await put(blobPath, file, {
    access: "public",
    contentType: file.type,
  });

  const [row] = await db
    .insert(assessmentFiles)
    .values({
      answerId,
      blobUrl: blob.url,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    })
    .returning();
  return row;
}

export async function deleteAssessmentFile(fileId: string): Promise<void> {
  const [file] = await db
    .select()
    .from(assessmentFiles)
    .where(eq(assessmentFiles.id, fileId))
    .limit(1);
  if (!file) throw new Error("File not found.");

  await del(file.blobUrl);
  await db.delete(assessmentFiles).where(eq(assessmentFiles.id, fileId));
}

export async function getFilesForAnswer(
  answerId: string
): Promise<AssessmentFileRow[]> {
  return db
    .select()
    .from(assessmentFiles)
    .where(eq(assessmentFiles.answerId, answerId));
}

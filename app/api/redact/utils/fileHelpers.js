import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export function generateTmpPath(filename) {
  const id = randomUUID();
  return path.join("/tmp", `redactor-${id}-${filename}`);
}

export async function saveTmpFile(buffer, filename) {
  const filePath = generateTmpPath(filename);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function readTmpFile(filePath) {
  return readFile(filePath);
}

export async function deleteTmpFile(filePath) {
  try {
    await unlink(filePath);
  } catch {
    // Ignore – file may already be gone
  }
}

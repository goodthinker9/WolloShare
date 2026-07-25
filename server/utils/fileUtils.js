import fs from 'fs';
import path from 'path';

// ──────────────────────────────────────────────
// Generate a full file path for a given filename
// inside the resources upload directory.
// Scans year/month subdirectories.
// ──────────────────────────────────────────────

const generateFilePath = (filename, baseDir) => {
  if (fs.existsSync(path.resolve(baseDir, filename))) {
    return path.resolve(baseDir, filename);
  }

  // Scan year/month subdirectories
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const yearDir = path.resolve(baseDir, entry.name);
    const monthEntries = fs.readdirSync(yearDir, { withFileTypes: true });

    for (const monthEntry of monthEntries) {
      if (!monthEntry.isDirectory()) continue;

      const filePath = path.resolve(yearDir, monthEntry.name, filename);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
  }

  return null;
};

// ──────────────────────────────────────────────
// Check if a file exists at the given path
// ──────────────────────────────────────────────

const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// ──────────────────────────────────────────────
// Delete a file at the given path
// Returns true if deleted, false if not found
// ──────────────────────────────────────────────

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export { deleteFile, checkFileExists, generateFilePath };


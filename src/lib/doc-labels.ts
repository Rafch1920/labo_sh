export const CATEGORY_LABELS: Record<string, string> = {
  identity_document: "Pièce d'identité",
  prescription: "Prescription médicale",
  medical_report: "Compte-rendu médical",
  stone_image: "Image du calcul",
  additional: "Autre document",
};

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS));

/**
 * Extracts the file category from a storage path.
 * Path format: `{userId}/{category}/{fileId}-{name}`
 */
export function categoryFromPath(filePath: string): string {
  const parts = filePath.split("/");
  if (parts.length >= 2 && VALID_CATEGORIES.has(parts[1])) {
    return parts[1];
  }
  return "additional";
}

/**
 * Resolves the actual file category, falling back to extracting it from the
 * storage path when the DB value is `additional`.
 */
export function resolveFileCategory(
  fileCategory: string,
  filePath: string
): string {
  if (fileCategory !== "additional") return fileCategory;
  return categoryFromPath(filePath);
}

export function docLabel(
  fileCategory: string,
  filePath: string
): string {
  const cat = resolveFileCategory(fileCategory, filePath);
  return CATEGORY_LABELS[cat] ?? cat;
}

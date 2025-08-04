export function getLocalizedValue(field, lang = "uz") {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field["uz"] || "";
}

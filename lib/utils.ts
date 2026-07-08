// lib/utils.ts
export const TYPE_ACCENT: Record<string, string> = {
  BOOKS:    "#FFDE59",
  VIDEOS:   "#FF66C4",
  PODCASTS: "#C58FFF",
  LINKS:    "#5CE1E6",
  MOVIES:   "#FF914D", // Letterboxd Orange
  ALL:      "#9BDBAF",
};

export const getAccent = (type: string) => TYPE_ACCENT[type] ?? "#7ED957";

export const TYPE_THEME: Record<string, { rgba: string; bg: { light: string; dark: string } }> = {
  ALL:      { rgba: "rgba(155, 219, 175, 1)", bg: { light: "#f0fdf4", dark: "#0f1712" } },
  BOOKS:    { rgba: "rgba(255, 222, 89,  1)", bg: { light: "#fffdf0", dark: "#1a190f" } },
  VIDEOS:   { rgba: "rgba(255, 102, 196, 1)", bg: { light: "#fff5fc", dark: "#1a0b14" } },
  PODCASTS: { rgba: "rgba(197, 143, 255, 1)", bg: { light: "#f8f0ff", dark: "#130e1a" } },
  LINKS:    { rgba: "rgba(92,  225, 230, 1)", bg: { light: "#edfafb", dark: "#0e1a1a" } },
  MOVIES:   { rgba: "rgba(255, 145, 77, 1)", bg: { light: "#fce8dc", dark: "#0e0105" } },
};

export const getDomain = (url?: string, type?: string, author?: string) => {
  if (author) return author.toLowerCase();
  if (!url) return type?.toLowerCase() ?? "item";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "link";
  }
};
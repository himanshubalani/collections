import { XMLParser } from "fast-xml-parser";
import { Item } from "@/types"; // Adjust import path if necessary

export async function getLatestMovies(): Promise<Item[]> {
  try {
    const response = await fetch("https://letterboxd.com/himanshubalani/rss/");

    const xmlText = await response.text();

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(xmlText);

    const items = result.rss?.channel?.item || [];

    // Sort by watched date descending
    const sortedItems = [...items].sort(
      (a: any, b: any) =>
        Date.parse(b["letterboxd:watchedDate"]) -
        Date.parse(a["letterboxd:watchedDate"])
    );

    // Slice first 4 and map to our internal Item type
    return sortedItems.slice(0, 4).map((item: any) => {
      let poster = "";
      // Extract poster <img> src from HTML description
      if (item.description) {
        const match = item.description.match(/src="([^"]+)"/);
        if (match) poster = match[1];
      }

      const guid = typeof item.guid === "string"
        ? item.guid
        : item.guid?.["#text"] ?? item.guid?.["@_isPermaLink"] ?? item.link;

      return {
        id: String(guid),
        title: item["letterboxd:filmTitle"],
        url: item.link,
        image: poster,
        type: "MOVIES",
        createdAt: item["letterboxd:watchedDate"],
      };
    });
  } catch (error) {
    console.error("Failed to fetch Letterboxd movies:", error);
    return [];
  }
}
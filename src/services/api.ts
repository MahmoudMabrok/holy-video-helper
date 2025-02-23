
export interface Video {
  title: string;
  url: string;
}

export interface Playlist {
  name: string;
  thunmbnail: string;
  videos: Video[];
}

export interface Section {
  title: string;
  playlists: Playlist[];
}

export interface ApiItem {
  category: string;
  title: string;
  url: string;
}

export interface SectionApiItem {
  categories: CateogryApi[];
  title: string;
}

export interface CateogryApi {
  title: string;
  url: string;
}

export async function fetchContent(): Promise<Section[]> {
  try {
    const dataUrl = localStorage.getItem('data_url') || 
      "https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/ramadan.json";
    const response = await fetch(dataUrl);

    if (!response.ok) throw new Error("Failed to fetch content");
    const data = await response.json();

    const items: ApiItem[] = data.items;

    if (!items) {
      console.error("API response is empty:", items);
      throw new Error("API response is empty");
    }

    const sections = data.sections.map((section: SectionApiItem) => {
      return {
        title: section.title,
        playlists: section.categories.map((category: CateogryApi) => {
          return {
            name: category.title,
            thunmbnail: category.url,
            videos: items.filter(
              (i: ApiItem) => i.category == category.title
            ).map((i: ApiItem) => ({
              title: i.title,
              url: i.url,
            })),
          };
        }),
      };
    });

    return sections;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

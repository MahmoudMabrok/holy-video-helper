export interface Video {
  title: string;
  url: string;
}

export interface Playlist {
  name: string;
  videos: Video[];
}

export interface Section {
  title: string;
  playlists: Playlist[];
}

export interface ApiItem {
  subCategory: string;
  category: string;
  title: string;
  url: string;
}

export async function fetchContent(): Promise<Section[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/ramadan.json"
    );
  

    if (!response.ok) throw new Error("Failed to fetch content");
    const data = await response.json();

    const items: ApiItem[] = data.data;

    if (!items) {
      console.error("API response is empty:", items);
      throw new Error("API response is empty");
    }

    const sections: Section[] = items.reduce(
      (acc: Section[], item: ApiItem) => {
        let section = acc.find((sec) => sec.title === item.category);
        if (!section) {
          section = { title: item.category, playlists: [] };
          acc.push(section);

          let playlist = section.playlists.find(
            (pl) => pl.name === item.subCategory
          );
          if (!playlist) {
            playlist = {
              name: item.subCategory,
              videos: items.filter(
                (i: ApiItem) =>
                  i.subCategory === item.subCategory &&
                  i.category === item.category
              ).map((i: ApiItem) => ({
                title: i.title,
                url: i.url,
              })),
            };
            section.playlists.push(playlist);
          }
        }
        return acc;
      },
      []
    );

    console.log("sections:", sections);
    return sections;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

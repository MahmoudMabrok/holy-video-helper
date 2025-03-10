
export interface Video {
  title: string;
  url: string;
  playlist_id: string;
}

export interface Playlist {
  name: string;
  thunmbnail: string;
  playlist_id: string;
  videos: Video[];
}

export interface Section {
  title: string;
  playlists: Playlist[];
}

export interface ApiItem {
  title: string;
  url: string;
}

export interface SectionApiItem {
  title: string;
  categories: CategoryApi[];
}

export interface CategoryApi {
  title: string;
  url: string;
  playlist_id: string;
}

export interface Content {
  sections: Section[];
  playlist_count: number;
  total_video_count: number;
}

export async function fetchContent(): Promise<Content> {
  try {
    const baseUrl = localStorage.getItem('data_url') || 
      "https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/";
    const dataUrl = `${baseUrl}data.json`;
    console.log(`Fetching content from: ${dataUrl}`);
    
    const response = await fetch(dataUrl);

    if (!response.ok) throw new Error("Failed to fetch content");
    const data = await response.json();

    if (!data.sections) {
      console.error("API response is missing sections:", data);
      throw new Error("API response is missing sections");
    }

    const sections = data.sections.map((section: SectionApiItem) => {
      return {
        title: section.title,
        playlists: section.categories.map((category: CategoryApi) => {
          return {
            name: category.title,
            thunmbnail: category.url,
            playlist_id: category.playlist_id || "",
            videos: [], // Videos will be fetched on demand in the detail screen
          };
        }),
      };
    });

    return { sections , playlist_count: data.playlist_count , total_video_count: data.total_video_count };
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

export async function fetchPlaylistVideos(playlistId: string): Promise<Video[]> {
  try {
    const baseUrl = localStorage.getItem('data_url') || 
      "https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/";
    
    const playlistUrl = `${baseUrl}playlists/${playlistId}.json`;
    console.log(`Fetching playlist from: ${playlistUrl}`);
    
    const response = await fetch(playlistUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch playlist data: ${response.status}`);
      throw new Error(`Failed to fetch playlist data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      console.error("Playlist data missing items array:", data);
      throw new Error("Playlist data missing items array");
    }
    
    return data.map((item: ApiItem) => ({
      title: item.title,
      url: item.url,
      playlist_id: playlistId
    }));
  } catch (error) {
    console.error(`Error fetching playlist videos for ${playlistId}:`, error);
    throw error;
  }
}

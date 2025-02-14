
export interface Video {
  id: string;
  title: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
}

export interface Section {
  id: string;
  title: string;
  playlists: Playlist[];
}

export async function fetchContent(): Promise<Section[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/MahmoudMabrok/MyDataCenter/main/ramadan.json');
    if (!response.ok) throw new Error('Failed to fetch content');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

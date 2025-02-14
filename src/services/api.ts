
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
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('API response is not an array:', data);
      throw new Error('Invalid API response format');
    }

    // Validate the data structure
    const validatedData = data.map((section: any) => {
      if (!section.id || !section.title || !Array.isArray(section.playlists)) {
        console.error('Invalid section format:', section);
        throw new Error('Invalid section format in API response');
      }
      return section;
    });

    return validatedData;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

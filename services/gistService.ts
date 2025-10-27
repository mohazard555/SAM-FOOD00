
import type { AppData } from '../types';

const GIST_FILENAME = 'recipe-hub-data.json';

export const fetchGistData = async (gistId: string): Promise<AppData | null> => {
  if (!gistId) return null;
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch Gist: ${response.status} ${response.statusText}.`;
        try {
            const errorJson = JSON.parse(errorText);
            if(errorJson.message) {
                errorMessage += ` GitHub API message: ${errorJson.message}`;
            }
        } catch(e) {
            // Not a JSON response, do nothing
        }
      throw new Error(errorMessage);
    }
    const gist = await response.json();
    if (gist.files && gist.files[GIST_FILENAME]) {
      const content = gist.files[GIST_FILENAME].content;
      return JSON.parse(content);
    }
    throw new Error(`Gist found, but the file '${GIST_FILENAME}' is missing.`);
  } catch (error) {
    console.error("Error fetching Gist data:", error);
    throw error; // Re-throw to be caught by the UI
  }
};

export const updateGistData = async (gistId: string, token: string, data: AppData): Promise<void> => {
  if (!gistId || !token) {
    throw new Error("Gist ID and GitHub Token are required to update data.");
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: data.settings.siteDescription,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update Gist: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown API error'}`);
    }
  } catch (error) {
    console.error("Error updating Gist data:", error);
    throw error;
  }
};

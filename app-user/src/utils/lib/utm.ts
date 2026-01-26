import AsyncStorage from "@react-native-async-storage/async-storage";

type UTM = Partial<{
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}>;

export async function saveUtmFromUrl(url?: string) {
  if (!url) return;
  try {
    // Extract query string from URL
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return;
    
    const queryString = url.substring(queryIndex + 1);
    
    // Helper function to manually parse query params
    const getParam = (key: string): string | undefined => {
      const regex = new RegExp(`[?&]${key}=([^&]*)`);
      const match = queryString.match(regex);
      return match ? decodeURIComponent(match[1]) : undefined;
    };
    
    const utm: UTM = {
      source: getParam("utm_source"),
      medium: getParam("utm_medium"),
      campaign: getParam("utm_campaign"),
      term: getParam("utm_term"),
      content: getParam("utm_content"),
    };
    if (Object.values(utm).some(Boolean)) {
      await AsyncStorage.setItem("utm", JSON.stringify(utm));
    }
  } catch (error) {
    console.warn('Failed to parse UTM from URL:', error);
  }
}

async function getUtm(): Promise<UTM | undefined> {
  const raw = await AsyncStorage.getItem("utm");
  return raw ? (JSON.parse(raw) as UTM) : undefined;
}

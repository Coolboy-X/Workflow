import { GoogleGenAI } from "@google/genai";
import { RedemptionCode, GroundingSource, CachedCodes, UpcomingBanner, CachedBanners, SourcesUpdateCallback } from '../types';
import { db } from './firebase';
import { ref, get, set } from 'firebase/database';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CODE_CACHE_KEY = 'cachedCodes';
const BANNER_CACHE_KEY = 'cachedBanners';
export const CODE_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const BANNER_CACHE_DURATION_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

const noOpCallback: SourcesUpdateCallback = () => {};

// =========================================
// FETCH REDEMPTION CODES
// =========================================

const fetchCodesFromAI = async (onSourcesUpdate: SourcesUpdateCallback): Promise<{ codes: RedemptionCode[]; sources: GroundingSource[] }> => {
  const currentDate = new Date().toUTCString();
  const systemInstruction = `You are an expert AI assistant specializing in finding and verifying Genshin Impact redemption codes. Your goal is to provide accurate, up-to-date information in a structured JSON format. Your absolute priority is to use official HoYoverse sources: the official Genshin Impact website, official social media, HoYoLAB, and official YouTube channels. You must be diligent in verifying codes against the current date to exclude any that are expired.`;

  const prompt = `
    Using the current date of ${currentDate}, please perform a web search to find all active Genshin Impact redemption codes for the Asia server.

    Follow these instructions carefully:
    1.  **Source Reliability**: You MUST prioritize official HoYoverse sources. These include the official Genshin Impact website (genshin.hoyoverse.com), official social media accounts (like Twitter/X, Facebook), the official HoYoLAB community forums, and official YouTube channel announcements. Do not use unverified fan-run wikis or news sites as primary sources.
    2.  **Verification**: Critically, you must verify that each code has not expired. Any code with an expiry date before ${currentDate} must be excluded.
    3.  **Region**: Ensure every code is valid for the "Asia" region.
    4.  **Deduplication**: Provide each unique code only once.

    For each valid code found, format it as a JSON object with these exact fields:
    - code: The redemption code string.
    - rewards: A brief summary of the rewards.
    - regions: An array of server regions, which must include "Asia".
    - expiry: The exact expiration date and time in UTC as a full ISO 8601 string (e.g., "YYYY-MM-DDTHH:mm:ssZ").
    - firstSeen: The date the code was first publicly available, as an ISO 8601 string. Use today's date if you cannot determine the original date.

    Your final output must be only the raw JSON array. Do not include any explanatory text or markdown formatting. If no active codes for Asia are found after a thorough search, return an empty array \`[]\`.
  `;
    
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{googleSearch: {}}],
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 1500 },
    },
  });

  let accumulatedText = '';
  const allSources: GroundingSource[] = [];
  const seenUris = new Set<string>();

  for await (const chunk of responseStream) {
    accumulatedText += chunk.text;
    
    const newGroundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    if (newGroundingChunks.length > 0) {
      const newSources = newGroundingChunks
        .filter(chunk => chunk.web?.uri && !seenUris.has(chunk.web.uri))
        .map(chunk => {
          seenUris.add(chunk.web!.uri!);
          return {
            web: {
              uri: chunk.web!.uri!,
              title: chunk.web!.title || new URL(chunk.web!.uri!).hostname,
            },
          };
        });
      
      if (newSources.length > 0) {
        allSources.push(...newSources);
        onSourcesUpdate([...allSources]);
      }
    }
  }

  const rawText = accumulatedText.trim();
  let jsonString;

  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1];
  } else {
    jsonString = rawText;
  }

  // Handle empty or non-json responses gracefully
  let jsonResponse = [];
  try {
    if (jsonString) {
      jsonResponse = JSON.parse(jsonString);
    }
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", e);
    jsonResponse = [];
  }
    
  if (!Array.isArray(jsonResponse)) {
    console.error("AI response was not a JSON array:", jsonResponse);
    throw new Error("Received invalid data format from AI.");
  }

  const codes = jsonResponse as RedemptionCode[];
  return { codes, sources: allSources };
};

export const fetchCodes = async (onSourcesUpdate: SourcesUpdateCallback = noOpCallback): Promise<{ codes: RedemptionCode[]; sources: GroundingSource[]; lastUpdatedAt: string | null }> => {
  try {
    const cacheRef = ref(db, `cache/${CODE_CACHE_KEY}`);
    const snapshot = await get(cacheRef);
    
    if (snapshot.exists()) {
      const cached = snapshot.val();
      const updatedAt = cached.updated_at as string;
      const isCacheValid = (Date.now() - new Date(updatedAt).getTime()) < CODE_CACHE_DURATION_MS;
      
      if (isCacheValid) {
        console.log("Serving codes from Firebase cache.");
        const cachedData = cached.data as CachedCodes | undefined;
        const allCachedSources = cachedData?.sources || [];
        
        // Simulate streaming for the UI from cached sources
        if (onSourcesUpdate !== noOpCallback && allCachedSources.length > 0) {
            allCachedSources.forEach((_, i) => {
              setTimeout(() => {
                onSourcesUpdate(allCachedSources.slice(0, i + 1));
              }, i * 150);
            });
        }

        const now = new Date();
        const activeCodes = (cachedData?.codes || []).filter(code => new Date(code.expiry) > now);
        return { codes: activeCodes, sources: allCachedSources, lastUpdatedAt: updatedAt };
      }
    }

    console.log("Code cache invalid or empty. Fetching from AI.");
    const { codes, sources } = await fetchCodesFromAI(onSourcesUpdate);
    
    const dataToCache: CachedCodes = { codes, sources };
    const now = new Date().toISOString();

    try {
        await set(ref(db, `cache/${CODE_CACHE_KEY}`), {
            data: dataToCache,
            updated_at: now,
        });
    } catch (error) {
        console.error("Failed to cache codes to Firebase:", error);
    }
    
    return { codes, sources, lastUpdatedAt: now };

  } catch (error) {
    console.error("Failed to fetch codes from Firebase or AI:", error);
    return { codes: [], sources: [], lastUpdatedAt: null };
  }
};

// =========================================
// FETCH UPCOMING BANNERS
// =========================================

const fetchBannersFromAI = async (onSourcesUpdate: SourcesUpdateCallback): Promise<{banners: UpcomingBanner[], sources: GroundingSource[]}> => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const systemInstruction = `You are an AI assistant specialized in finding official Genshin Impact banner information. Your primary directive is to use only 100% official HoYoverse sources (official website, social media, YouTube channel, HoYoLAB) and to avoid all leaks, rumors, and unofficial sources. Your output must be a clean JSON array.`;
    
    const prompt = `
      As of ${currentDate}, find detailed information on Genshin Impact character banners.

      Your search process must be as follows:
      1.  **Source Restriction**: You must ONLY use official HoYoverse sources: the official Genshin Impact website, official social media (Twitter/X, Facebook), the official YouTube channel, and HoYoLAB. Do not use any leaks, rumors, or unofficial fan wikis.
      2.  **Search Priority**:
          a. First, search for banners of the *next* game version that has been officially announced but is not yet live.
          b. If no upcoming banner information is available, search for banners of the *currently active* game version.
      3.  **Banner Composition**: For each phase (Phase 1 or Phase 2), you must find the complete list of featured characters. A standard banner phase includes **one or two 5-star characters** and **three 4-star characters**. It is critical that you find all characters for the phase.

      For each featured character found, create a JSON object with these exact fields:
      - name: The character's full name.
      - rarity: The character's rarity as a number (5 or 4).
      - element: The character's element (e.g., "Pyro", "Hydro").
      - weapon: The character's weapon type (e.g., "Sword", "Claymore").
      - version: The game version the banner is for (e.g., "4.8").
      - phase: The banner phase as a number (1 or 2).
      - status: Set to "upcoming" if you found information for the next version, or "active" if you found information for the current version.

      Your final output must be a valid JSON array only. Do not include any surrounding text or markdown. If no official information for either upcoming or active banners can be found, return an empty array \`[]\`.
    `;
      
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{googleSearch: {}}],
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 1500 },
      },
    });
  
    let accumulatedText = '';
    const allSources: GroundingSource[] = [];
    const seenUris = new Set<string>();

    for await (const chunk of responseStream) {
        accumulatedText += chunk.text;
        
        const newGroundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        if (newGroundingChunks.length > 0) {
            const newSources = newGroundingChunks
                .filter(chunk => chunk.web?.uri && !seenUris.has(chunk.web.uri))
                .map(chunk => {
                    seenUris.add(chunk.web!.uri!);
                    return {
                        web: {
                            uri: chunk.web!.uri!,
                            title: chunk.web!.title || new URL(chunk.web!.uri!).hostname,
                        },
                    };
                });
            
            if (newSources.length > 0) {
                allSources.push(...newSources);
                onSourcesUpdate([...allSources]);
            }
        }
    }

    const rawText = accumulatedText.trim();
    let jsonString;

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
      jsonString = rawText;
    }
      
    let jsonResponse: any[] = [];
    try {
        if (jsonString) {
          jsonResponse = JSON.parse(jsonString);
        }
    } catch(e) {
        console.error("Failed to parse JSON from AI banner response:", e);
        jsonResponse = [];
    }
      
    if (!Array.isArray(jsonResponse)) {
      console.error("AI response for banners was not a JSON array:", jsonResponse);
      throw new Error("Received invalid banner data format from AI.");
    }
    
    const banners: UpcomingBanner[] = jsonResponse.map(item => ({
      ...item,
    }));
    
    return { banners, sources: allSources };
};
  
export const fetchBanners = async (onSourcesUpdate: SourcesUpdateCallback = noOpCallback): Promise<{ banners: UpcomingBanner[], sources: GroundingSource[], lastUpdatedAt: string | null }> => {
    try {
      const cacheRef = ref(db, `cache/${BANNER_CACHE_KEY}`);
      const snapshot = await get(cacheRef);

      if (snapshot.exists()) {
        const cached = snapshot.val();
        const updatedAt = cached.updated_at as string;
        const isCacheValid = (Date.now() - new Date(updatedAt).getTime()) < BANNER_CACHE_DURATION_MS;
        if (isCacheValid) {
          console.log("Serving banners from Firebase cache.");
          const cachedData = cached.data as CachedBanners | undefined;
          const allCachedSources = cachedData?.sources || [];

          // Simulate streaming for the UI from cached sources
          if (onSourcesUpdate !== noOpCallback && allCachedSources.length > 0) {
              allCachedSources.forEach((_, i) => {
                  setTimeout(() => {
                    onSourcesUpdate(allCachedSources.slice(0, i + 1));
                  }, i * 150);
              });
          }

          return { banners: cachedData?.banners || [], sources: allCachedSources, lastUpdatedAt: updatedAt };
        }
      }

      console.log("Banner cache invalid or empty. Fetching from AI.");
      const { banners, sources } = await fetchBannersFromAI(onSourcesUpdate);
      const dataToCache: CachedBanners = { banners, sources };
      const now = new Date().toISOString();
      
      try {
        await set(ref(db, `cache/${BANNER_CACHE_KEY}`), {
            data: dataToCache,
            updated_at: now
        });
      } catch (upsertError) {
        console.error("Failed to cache banners to Firebase:", upsertError);
      }

      return { banners, sources, lastUpdatedAt: now };

    } catch (error) {
      console.error("Failed to fetch banners:", error);
      return { banners: [], sources: [], lastUpdatedAt: null };
    }
};
import { GoogleGenAI, Type } from "@google/genai";
import { Story } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A captivating title for the YouTube short, enclosed in quotes. e.g., "The Girl Who Remembered Tomorrow".',
    },
    styleInstruction: {
      type: Type.STRING,
      description: 'Instructions on the delivery tone, starting with "Read aloud this in a...". e.g., "Read aloud this in a calm, mysterious tone — soft, emotional delivery with a sense of wonder and quiet sadness."',
    },
    script: {
      type: Type.STRING,
      description: `The full script for the YouTube short, formatted precisely as requested. It must start with "[SCRIPT – {duration} seconds]" on the first line. Subsequent lines must be structured with timed sections: (Hook – 0–5s), (Build), (Cliffhanger), and (Ending). The script must end with a call to action to "like" and "subscribe".`,
    },
    characters: {
      type: Type.ARRAY,
      description: "A list of all characters in the script, with the main character listed first. Each character should have a name and a short role description.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The character's name."
          },
          description: {
            type: Type.STRING,
            description: "A short (2-4 word) description of the character's role or archetype (e.g., 'The Conflicted Hero')."
          }
        },
        required: ['name', 'description']
      }
    }
  },
  required: ['title', 'styleInstruction', 'script', 'characters'],
};

export const generateStory = async (prompt: string, narration: string, duration: string, characterCount: string): Promise<Story> => {
  const durationToWordCount: { [key: string]: string } = {
    '30 seconds': '65–75 words',
    '35 seconds': '75–90 words',
    '40 seconds': '90–100 words',
    '45 seconds': '100–115 words',
    '50 seconds': '115–125 words',
    '60 seconds': '130–150 words',
  };
  
  const durationToTimings: { [key: string]: string } = {
    '30 seconds': `(Hook – 0–5s)\n(Build – 5–18s)\n(Cliffhanger – 18–24s)\n(Ending – 24–30s)`,
    '35 seconds': `(Hook – 0–5s)\n(Build – 5–20s)\n(Cliffhanger – 20–28s)\n(Ending – 28–35s)`,
    '40 seconds': `(Hook – 0–5s)\n(Build – 5–25s)\n(Cliffhanger – 25–33s)\n(Ending – 33–40s)`,
    '45 seconds': `(Hook – 0–5s)\n(Build – 5–28s)\n(Cliffhanger – 28–38s)\n(Ending – 38–45s)`,
    '50 seconds': `(Hook – 0–5s)\n(Build – 5–30s)\n(Cliffhanger – 30–42s)\n(Ending – 42–50s)`,
    '60 seconds': `(Hook – 0–5s)\n(Build – 5–38s)\n(Cliffhanger – 38–50s)\n(Ending – 50–60s)`,
  };

  const wordCount = durationToWordCount[duration] || '90–100 words'; // Default to 40s if not found
  const timings = durationToTimings[duration] || durationToTimings['40 seconds'];
  const durationInSeconds = duration.split(' ')[0];

  const characterConstraint = characterCount === 'Any'
      ? '- **Number of Characters:** Any number of characters is acceptable.'
      : `- **Number of Characters:** The story must feature ${characterCount.replace('+', ' or more')} characters.`;


  try {
    const fullPrompt = `
      Act as a professional scriptwriter for viral YouTube shorts.
      Your task is to create a sophisticated and emotionally resonant story script based on the user's idea and constraints.

      **User's Idea:** "${prompt}"

      **Writing Style:**
      - **Human Touch:** Write with a deeply human touch. The narrative should feel authentic and relatable, not robotic or formulaic.
      - **Natural Language:** Use natural, conversational language. Avoid jargon or overly formal phrasing.
      - **Emotional Depth:** Focus on genuine emotions and believable character motivations. Show, don't just tell. Let actions and subtle cues reveal feelings.

      **Constraints:**
      - **Narration Style:** Write the story from a ${narration} perspective.
      - **Length:** Approximately ${duration}. This should correspond to a word count of about ${wordCount}.
      ${characterConstraint}

      **Target Audience:** 14-35 years old, living in the USA.
      **Platform:** Faceless YouTube shorts video.

      **Core Requirements:**
      1.  **Strong Intro Hook:** The first 5 seconds must be incredibly engaging to stop viewers from scrolling.
      2.  **Emotional Triggers:** Weave in elements of mystery, sadness, wonder, or suspense to create a strong emotional connection.
      3.  **Twist or Revelation:** Incorporate a twist or surprising revelation in the "Cliffhanger" section to keep viewers hooked until the very end.
      4.  **No Visuals:** The script should be powerful enough for a "faceless" video, relying solely on narration and maybe background music.
      5.  **Character Identification:** Identify all characters. For each, provide their name and a short role description (2-4 words, e.g., "The Conflicted Hero"). **The first character in the array must be the main character.** If there are no characters, provide an empty array.

      **Script Structure:**
      1.  **Header:** The script must begin *exactly* with the text: \`[SCRIPT – ${durationInSeconds} seconds]\` on its own line.
      2.  **Sections:** The narrative must be divided into four distinct sections, each marked with a specific timed heading on its own line, like this:
          ${timings}
      3.  **Content:** Write the narrative under these headings.
      4.  **Call to Action:** The script must conclude, within the "(Ending...)" section, with a direct call to like the video and subscribe for more content.

      **Output Format:**
      You must respond with a a valid JSON object that strictly adheres to the provided schema. The script section must be a single string, formatted with natural line breaks for readability and strictly following the **Script Structure** defined above. The 'characters' field must be an array of objects, each containing a 'name' and a 'description'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const jsonString = response.text.trim();
    const parsedStory: Omit<Story, 'id' | 'createdAt' | 'duration'> = JSON.parse(jsonString);

    // Clean up potential markdown artifacts from the JSON response
    if (parsedStory.script) {
        parsedStory.script = parsedStory.script.replace(/\\n/g, '\n');
    }
    
    return {
      ...parsedStory,
      id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      duration: duration
    } as Story;

  } catch (error) {
    console.error("Error generating story with Gemini API:", error);
    throw new Error(
      "Failed to generate story. The model may be unavailable or the request failed. Please try again."
    );
  }
};

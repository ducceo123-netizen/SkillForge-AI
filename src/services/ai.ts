import { GoogleGenAI } from "@google/genai";
import { Skill, BrandProfile } from '../types';

// Use VITE_ prefix for client-side environment variables in production (e.g. Vercel)
// Use process.env for AI Studio environment
const DEFAULT_KEY = 'AIzaSyBnWfSD44xPIm3LXPf1UZaRZkHqCOjW0jo';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || DEFAULT_KEY;

if (!apiKey || apiKey === DEFAULT_KEY) {
  console.log("Using API Key:", apiKey === DEFAULT_KEY ? "HARDCODED_TEST_KEY" : "PROVIDED_ENV_KEY");
}

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: apiKey });
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
  // Fallback to dummy to avoid crash on load
  ai = new GoogleGenAI({ apiKey: 'dummy' });
}

export async function generateSkillContent(
  skill: Skill, 
  inputs: Record<string, string>, 
  brandProfiles?: BrandProfile | BrandProfile[]
) {
  try {
    let userPrompt = skill.systemPromptTemplate || '';
    
    Object.entries(inputs).forEach(([key, value]) => {
      userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const profiles = brandProfiles ? (Array.isArray(brandProfiles) ? brandProfiles : [brandProfiles]) : [];

    const systemInstruction = `
ROLE: You are an expert AI Editorial Assistant.
GOAL: Transform the provided input into a high-quality outcome based on the specific instructions below.

BRAND VOICE & GUIDELINES:
${profiles.length > 0 ? profiles.map(p => `
Brand: ${p.name}
Core Attributes: ${p.attributes?.join(', ') || 'N/A'}
Guidelines: ${p.guidelines}
Connected Materials: ${p.knowledgeFiles?.map(f => f.name).join(', ') || 'None'}
`).join('\n---\n') : 'Professional, clear, and engaging.'}

SKILL CONTEXT:
${skill.description}

STRICT OUTPUT RULES:
1. Provide ONLY the final transformed content.
2. DO NOT include introductory text.
3. DO NOT include commentary.
4. Maintain consistent formatting.

### INPUT DATA FOR PROCESSING:
${Object.entries(inputs).map(([key, val]) => `${key.toUpperCase()}: ${val}`).join('\n')}
`.trim();

    const contents = userPrompt.trim() || "Please process the provided input data according to your instructions and brand voice.";

    console.log("Calling Gemini with model:", skill.model || "gemini-3-flash-preview");
    const response = await ai.models.generateContent({
      model: skill.model || "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        temperature: skill.temperature || 0.7,
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error (Fixed):", error);
    throw error;
  }
}

export async function* generateSkillContentStream(
  skill: Skill, 
  inputs: Record<string, string>, 
  brandProfiles?: BrandProfile | BrandProfile[]
) {
  try {
    let userPrompt = skill.systemPromptTemplate || '';
    
    // Replace variables in template
    Object.entries(inputs).forEach(([key, value]) => {
      userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const profiles = brandProfiles ? (Array.isArray(brandProfiles) ? brandProfiles : [brandProfiles]) : [];

    // Construct a robust system instruction
    const systemInstruction = `
ROLE: You are an expert AI Editorial Assistant.
GOAL: Transform the provided input into a high-quality outcome based on the specific instructions below.

BRAND VOICE & GUIDELINES:
${profiles.length > 0 ? profiles.map(p => `
Brand: ${p.name}
Core Attributes: ${p.attributes?.join(', ') || 'N/A'}
Guidelines: ${p.guidelines}
Connected Materials: ${p.knowledgeFiles?.map(f => f.name).join(', ') || 'None'}
`).join('\n---\n') : 'Professional, clear, and engaging.'}

SKILL CONTEXT:
${skill.description}

STRICT OUTPUT RULES:
1. Provide ONLY the final transformed content.
2. DO NOT include introductory text (e.g., "Here is your summary...").
3. DO NOT include commentary or meta-talk.
4. If the input is missing or invalid, provide a helpful error message instead of generating fluff.
5. Maintain consistent formatting (Markdown is preferred).

### INPUT DATA FOR PROCESSING:
${Object.entries(inputs).map(([key, val]) => `${key.toUpperCase()}: ${val}`).join('\n')}
`.trim();

    // If the user prompt is empty, we should still provide a basic trigger
    const contents = userPrompt.trim() || "Please process the provided input data according to your instructions and brand voice.";

    console.log("Streaming Gemini with model:", skill.model || "gemini-3-flash-preview");
    const response = await ai.models.generateContentStream({
      model: skill.model || "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        temperature: skill.temperature || 0.7,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Stream Error:", error);
    throw error;
  }
}

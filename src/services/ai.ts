import { GoogleGenAI } from "@google/genai";
import { Skill, BrandProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSkillContent(
  skill: Skill, 
  inputs: Record<string, string>, 
  brandProfiles?: BrandProfile | BrandProfile[]
) {
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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction,
      temperature: skill.temperature || 0.7,
    },
  });

  return response.text;
}

export async function* generateSkillContentStream(
  skill: Skill, 
  inputs: Record<string, string>, 
  brandProfiles?: BrandProfile | BrandProfile[]
) {
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

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
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
}

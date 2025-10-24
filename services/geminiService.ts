import { GoogleGenAI, Type } from "@google/genai";
import type { StoryboardScene } from '../types';

// FIX: Initialize GoogleGenAI with API_KEY from environment variable directly, without fallbacks or checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storyboardSchema = {
    type: Type.OBJECT,
    properties: {
        scenes: {
            type: Type.ARRAY,
            description: "An array of storyboard scenes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    sceneNumber: { type: Type.INTEGER, description: "The sequential number of the scene." },
                    cameraAngle: { type: Type.STRING, description: "e.g., 'Close-up', 'Wide shot', 'Over-the-shoulder'." },
                    setting: { type: Type.STRING, description: "Description of the location and time." },
                    action: { type: Type.STRING, description: "What is happening in the scene, the visual description for image generation." },
                    dialogue: { type: Type.STRING, description: "Any dialogue spoken by characters in the scene." },
                },
                required: ["sceneNumber", "cameraAngle", "setting", "action", "dialogue"]
            }
        }
    },
    required: ["scenes"]
};

export const generateStory = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story:", error);
        throw error;
    }
};

export const formatStory = async (story: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please format the following story with proper paragraph breaks, spacing, and punctuation. Do not add or remove any content, just format it for better readability.\n\nSTORY:\n${story}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error formatting story:", error);
        throw error;
    }
};

export const generateStoryboard = async (story: string): Promise<StoryboardScene[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Based on the following story, create a professional short video storyboard. Break it down into logical scenes.\n\nStory: ${story}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storyboardSchema
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.scenes || [];
    } catch (error) {
        console.error("Error generating storyboard:", error);
        throw error;
    }
};

export const generateImageForScene = async (sceneDescription: string): Promise<string> => {
    try {
        const fullPrompt = `Generate a cinematic, photorealistic image for a video storyboard scene with the following description: ${sceneDescription}`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image?.imageBytes) {
            throw new Error("Image generation failed. The model may have blocked the request for safety reasons.");
        }
        
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};

export const optimizeTemplate = async (templateContent: string): Promise<string> => {
    try {
        const prompt = `You are an expert in creating effective prompts for generative AI.
        Optimize the following story prompt template to be more evocative, detailed, and to produce higher-quality, more creative stories.
        Retain the original {{variable}} placeholders, but feel free to add new ones if it enhances the template.
        Return only the optimized template content. Do not include any explanatory text before or after the template.

        ORIGINAL TEMPLATE:
        "${templateContent}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error optimizing template:", error);
        throw error;
    }
};
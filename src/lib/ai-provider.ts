import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

export type AIProvider = "gemini" | "groq";

interface AIContentOptions {
    systemPrompt?: string;
    temperature?: number;
    jsonMode?: boolean;
}

export async function getActiveProvider(): Promise<AIProvider> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "ai_provider" },
        });

        if (setting?.value) {
            return setting.value as AIProvider;
        }
    } catch (error) {
        console.warn("Failed to fetch AI provider setting, falling back to defaults", error);
    }

    // Default priority: Groq -> Gemini
    if (process.env.GROQ_API_KEY) return "groq";
    return "gemini";
}

export async function generateAIContent(prompt: string, options: AIContentOptions = {}, apiKey?: string): Promise<string> {
    const provider = await getActiveProvider();

    if (provider === "groq") {
        return generateGroqContent(prompt, options, apiKey);
    } else {
        return generateGeminiContent(prompt, options, apiKey);
    }
}

async function generateGroqContent(prompt: string, options: AIContentOptions, apiKey?: string): Promise<string> {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) {
        throw new Error("Missing GROQ_API_KEY");
    }

    const groq = new Groq({ apiKey: key });

    const messages: any[] = [];

    if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile", // Using a capable model
        temperature: options.temperature ?? 0.7,
        response_format: options.jsonMode ? { type: "json_object" } : undefined,
    });

    return completion.choices[0]?.message?.content || "";
}

async function generateGeminiContent(prompt: string, options: AIContentOptions, apiKey?: string): Promise<string> {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: options.jsonMode ? "application/json" : "text/plain",
        }
    });

    let fullPrompt = prompt;
    if (options.systemPrompt) {
        // Gemini doesn't have a strict system prompt in the same way as OpenAI/Groq in the simple API, 
        // but we can prepend it.
        // Actually, newer Gemini models support systemInstruction.
        // For now, prepending is safe or using systemInstruction if available in the SDK version.
        // Let's prepend for compatibility or check SDK version. 
        // The installed version is ^0.24.1 which supports systemInstruction.
        // But let's stick to prepending for now to be safe with existing logic patterns unless we update instantiation.
        fullPrompt = `${options.systemPrompt}\n\nUser: ${prompt}`;
    }

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
}

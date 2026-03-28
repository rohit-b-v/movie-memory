import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize both AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { favoriteMovie: true },
    });

    if (!dbUser?.favoriteMovie) {
      return NextResponse.json(
        { error: "No favorite movie set" },
        { status: 400 }
      );
    }

    let factContent = "";

    // Attempt 1: Try OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a movie trivia expert. Provide a short, fascinating and obscure fun fact about the requested movie. Keep it under two sentences.",
          },
          {
            role: "user",
            content: `Tell me a fun fact about the movie "${dbUser.favoriteMovie}".`,
          },
        ],
        temperature: 0.7,
      });
      
      factContent = response.choices[0]?.message?.content || "";
      if (!factContent) throw new Error("OpenAI returned an empty response");
      
    } catch (openAiError) {
      console.warn("OpenAI failed, falling back to Gemini...", openAiError);
      
      // Attempt 2: Fallback to Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are a movie trivia expert. Tell me a short, fascinating and obscure fun fact about the movie "${dbUser.favoriteMovie}". Keep it under two sentences.`;
      
      const result = await model.generateContent(prompt);
      factContent = result.response.text();
      
      if (!factContent) throw new Error("Gemini returned an empty response");
    }

    await prisma.fact.create({
      data: {
        userId: session.user.id,
        movie: dbUser.favoriteMovie,
        content: factContent,
      },
    });

    return NextResponse.json({ fact: factContent });
  } catch (error) {
    console.error("Error generating fact (both APIs failed):", error);
    return NextResponse.json(
      { error: "Failed to generate movie fact. Please try again later." },
      { status: 500 }
    );
  }
}
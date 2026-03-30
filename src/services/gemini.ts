import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "YOUR_GEMINI_API_KEY"; // Use an .env file for production!
const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function askSynapse(prompt: string) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
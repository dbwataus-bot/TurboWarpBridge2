// index.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Make sure to set your OpenAI API key in Railway or environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory session memory
const conversations = {};

// POST endpoint for TurboWarp to send messages
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: "Missing message or sessionId" });
  }

  // Initialize conversation memory for this session
  if (!conversations[sessionId]) {
    conversations[sessionId] = [
      {
        role: "system",
        content: "You are Nova, a fast, playful AI inside a Scratch/TurboWarp project."
      }
    ];
  }

  // Add user message
  conversations[sessionId].push({ role: "user", content: message });

  try {
    // Create chat completion
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversations[sessionId],
      max_tokens: 150,
      temperature: 0.7,
      stream: true
    });

    res.setHeader("Content-Type", "text/plain");

    let fullReply = "";

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullReply += content;
        res.write(content);
      }
    }

    // Save AI response to conversation
    conversations[sessionId].push({
      role: "assistant",
      content: fullReply
    });

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Use the environment port (Railway, Render, etc.)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 TurboWarp AI Bridge Running on port ${port}`));

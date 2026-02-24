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
// index.js
import express from "express";
import OpenAI from "openai";

// Initialize Express
const app = express();

// Parse JSON
app.use(express.json());

// Make sure your OpenAI API key is read from the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Example route your Scratch/TurboWarp can call
app.get("/ping", (req, res) => {
  res.json({ message: "Bridge is alive!" });
});

// Example route for your bridge functionality
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Key part: Listen on the Railway-assigned port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bridge running on port ${port}`);
});

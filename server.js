import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors()); // Allows TurboWarp to talk to the server

app.get("/ask", async (req, res) => {
  const userMessage = req.query.q; // Gets the 'answer' from your TurboWarp URL

  if (!userMessage) return res.json({ reply: "Ask me something!" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Fast and cheap model
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    
    // Extracting the text from OpenAI's response
    const aiReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't think of anything.";
    
    // Sending the clean 'reply' back to your TurboWarp blocks
    res.json({ reply: aiReply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error. Check your API key!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));

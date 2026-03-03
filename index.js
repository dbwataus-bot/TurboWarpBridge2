import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// This matches your TurboWarp URL: .../ask?q=message
app.get("/ask", async (req, res) => {
  const userMessage = req.query.q;

  if (!userMessage) {
    return res.json({ reply: "Ask me something!" });
  }

  try {
    const response = await fetch("https://api.openai.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      return res.json({ reply: "OpenAI Error: " + data.error.message });
    }

    const aiReply = data.choices[0].message.content;
    res.json({ reply: aiReply });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Server error. Check your API key!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));

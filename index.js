import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// This creates the "/ask" room that TurboWarp is looking for
app.get("/ask", async (req, res) => {
  const userMessage = req.query.q;

  if (!userMessage) return res.json({ reply: "Say something!" });

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
    
    // This sends the AI's answer back as a clean JSON package
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.json({ reply: "Server Error: " + error.message });
  }
});

// Use Railway's port or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Bridge Online on Port ${PORT}`));

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// This is the "door" TurboWarp is knocking on (/ask)
app.get("/ask", async (req, res) => {
  const userMessage = req.query.q; // This grabs your 'answer' from the URL

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
    
    // Check if OpenAI sent an error
    if (data.error) {
      return res.json({ reply: "OpenAI Error: " + data.error.message });
    }

    // Send the AI's reply back to TurboWarp
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.json({ reply: "Server Error: " + error.message });
  }
});

// Railway will tell the server which port to use
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 AI Bridge Online on port ${PORT}`));

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// This creates the "/ask" door your blocks are knocking on
app.get("/ask", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ reply: "Ask me something!" });

  try {
    const response = await fetch("https://api.openai.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: q }]
      })
    });

    const data = await response.json();
    
    // This sends the AI's answer back to your "reply of response" block
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.json({ reply: "Server Error: " + error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Bridge Online`));

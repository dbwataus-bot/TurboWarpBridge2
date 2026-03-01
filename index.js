import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/ask", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ reply: "Ask me something!" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: q }],
    });

    // We need choices[0] to get the first answer!
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.json({ reply: "Error: " + error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Bridge Online on ${port}`));

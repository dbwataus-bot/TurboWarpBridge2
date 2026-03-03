import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors()); // Allows TurboWarp to talk to your server

app.get("/ask", async (req, res) => {
    const userMessage = req.query.q; // Gets message from the URL query

    if (!userMessage) {
        return res.json({ reply: "Please ask a question!" });
    }

    try {
        const response = await fetch("https://api.openai.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // Keep your key in a .env file
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast and cheap for Scratch projects
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 100
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.json({ reply: "OpenAI Error: " + data.error.message });
        }

        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.json({ reply: "Server error. Check your Railway logs." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

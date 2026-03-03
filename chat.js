
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // This allows TurboWarp to talk to your server
app.use(express.json());

// This matches your TurboWarp URL: .../ask?q=message
app.get('/ask', async (req, res) => {
    const userMessage = req.query.q;

    if (!userMessage) {
        return res.json({ reply: "Please ask a question!" });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com',
            {
                model: "gpt-4o-mini", // Fast and cheap
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Get the AI's text and send it back to TurboWarp
        const aiText = response.data.choices[0].message.content;
        res.json({ reply: aiText });

    } catch (error) {
        console.error("Error calling OpenAI:", error.message);
        res.json({ reply: "Error: Could not connect to AI." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

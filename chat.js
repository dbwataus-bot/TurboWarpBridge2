// ==========================
// Production Chat Client
// ==========================

const fetch = require("node-fetch");

const API_URL = "https://turbowarpbridge2-production.up.railway.app" 
// 🔁 Replace with your real Railway URL

let conversationHistory = [];

async function sendMessage(userMessage) {
    try {
        conversationHistory.push({
            role: "user",
            content: userMessage
        });

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        const botReply = data.reply || "No reply received.";

        conversationHistory.push({
            role: "assistant",
            content: botReply
        });

        console.log("\n🤖 Bot:", botReply);
        return botReply;

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

// CLI mode
async function startChat() {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function ask() {
        readline.question("\nYou: ", async (input) => {
            await sendMessage(input);
            ask();
        });
    }

    ask();
}

startChat();


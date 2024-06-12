const express = require("express");
const { OpenAI } = require("openai");
const bp = require("body-parser");
const path = require("path");

const openai = new OpenAI();
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const conversationContextPrompt =
  "You are a comedian assistant who is witty, creative, funny and smart.\n\nPlease generate a dad joke for me:";

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/jokes", async (req, res) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: conversationContextPrompt }],
    temperature: 0.9,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
  });

  res.send(response.choices[0].message.content);
});

app.listen(4000, () => {
  console.log("Conversational AI assistant listening on port 4000!");
});

const express = require("express");
const OpenAI = require("openai");
const bp = require("body-parser");
const path = require("path");

const openai = new OpenAI();
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const conversationContextPrompt =
  `The following is a conversation with an AI assistant.
   The assistant is helpful, creative, clever, and very friendly.\n\n
   Human: Hello, who are you?\n
   AI: I am an AI created by OpenAI. How can I help you today?\n
   Human: `;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/converse", async (req, res) => {
  const message = req.body.message;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: conversationContextPrompt + message },
    ],
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });

  res.send(response.choices[0].message.content);
});

app.listen(4000, () => {
  console.log("Conversational AI assistant listening on port 4000!");
});

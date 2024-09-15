const express = require("express");
const { OpenAI } = require("openai");
const bp = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const openai = new OpenAI();
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const db = new sqlite3.Database("conversations.db");

function init() {
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        ai_response TEXT
  )`);

  db.exec(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        role TEXT
  );
  INSERT INTO users (name, email, role) VALUES ('John Doe', 'john@example.com', 'user');
  `
  );
}

const conversationContextPrompt =
  `The following is a conversation with an AI assistant.
  The assistant is helpful, creative, clever, and very friendly.\n\n
  Human: Hello, who are you?\n
  AI: I am an AI created by OpenAI. How can I help you today?\n
  Human: `;

app.post("/converse", async (req, res) => {
  const message = req.body.message;

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: conversationContextPrompt + message },
      ],
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }

  let responseText = response.choices[0].message.content;

  const logQuery = 'INSERT INTO conversations (ai_response) VALUES ("' + responseText + '")';
  db.exec(
    logQuery,
    (err) => {
      if (err) {
        console.error("Error saving conversation to database:", err);
      }
    }
  );

  res.send(responseText);
});

init();

app.listen(4000, () => {
  console.log("Conversational AI assistant listening on port 4000!");
});

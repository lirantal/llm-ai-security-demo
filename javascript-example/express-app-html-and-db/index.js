const express = require("express");
const OpenAI = require("openai");
const bp = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const openai = new OpenAI();
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Connect to the SQLite database
const db = new sqlite3.Database("conversations.db");

function init() {
  // Create a table to store conversations if not exists
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        ai_response TEXT
  )`);

  // Create a users table to serve as an example
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
  "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: ";

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

  // const aiResponse = ;/

  // The user's message as input may contain SQL injection attacks
  // so we sanitize it before saving it to the database:
  const sanitizedMessage = message.replace(/'/g, "''");
  // but does it help??

  db.exec(
    `INSERT INTO conversations (user_message, ai_response) VALUES ('${sanitizedMessage}', '${response.choices[0].message.content}'`,
    (err) => {
      if (err) {
        console.error("Error saving conversation to database:", err);
        console.log(err);
      }
    }
  );

  res.send(aiResponse);
});

init();

app.listen(4000, () => {
  console.log("Conversational AI assistant listening on port 4000!");
});

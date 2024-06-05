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

const jwt = require("jsonwebtoken");

function authenticateUser(req, res) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, "secretKey");
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
}

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
  });

  let responseText = response.data.choices[0].message.content;

  db.exec(
    'INSERT INTO conversations (ai_response) VALUES ("' + responseText + '")',
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

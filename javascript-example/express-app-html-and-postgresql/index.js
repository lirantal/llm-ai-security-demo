const express = require("express");
const { OpenAI } = require("openai");
const bp = require("body-parser");
const { Client } = require("pg");

const openai = new OpenAI();
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Initialize PostgreSQL client
const client = new Client({
  user: "your_username",
  host: "localhost",
  database: "your_database_name",
  password: "your_password",
  port: 5432, // Default PostgreSQL port
});
client.connect();

async function init() {
  try {
    // Create a table to store conversations if not exists
    await client.query(`CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_message TEXT,
      ai_response TEXT
    )`);

    // Create a users table to serve as an example
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        role TEXT
      )`);

    // Insert sample data into the users table
    await client.query(`
      INSERT INTO users (name, email, role)
      VALUES ('John Doe', 'john@example.com', 'user')
      ON CONFLICT DO NOTHING;`);

    console.log("Database initialization successful");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
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

  // Execute raw SQL query to insert conversation into PostgreSQL
  const query = `INSERT INTO conversations (user_message, ai_response)
    VALUES ('${sanitizedMessage}', '${response.data.choices[0].message.content}')`;
  try {
    await client.query(query, values);
    console.log("Conversation saved successfully");
  } catch (error) {
    console.error("Error saving conversation to database:", error);
  }

  res.send(aiResponse);
});

init();

app.listen(4000, () => {
  console.log("Conversational AI assistant listening on port 4000!");
});

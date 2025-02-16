# Install

```bash
npm install
```

Add the following to the `.env` file:

```bash
OPENAI_API_KEY=your-openai-api-key
```

# Run

```bash
npm run dev
```

# Snyk detection

Snyk detects that the code used in the Express application is flowing from a user input to the API response of the server, which could potentially impact XSS and other security vulnerabilities, depending on the context.

Vulnerable path 1, the Express Node.js application response which is sourced directly from the OpenAI API:

![Snyk Code detects vulnerable code path from OpenAI API response flowing into the HTTP response of the server](image.png)

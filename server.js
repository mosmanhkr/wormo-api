require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: 'https://wormogpt.com' }));
app.use(express.json());

async function callWormoGPT(messages) {
  const payload = {
    messages: [{ role: 'system', content: process.env.SYSTEM_PROMPT }, ...messages],
    model: process.env.WORMOGPT_MODEL,
  };
  const response = await fetch(process.env.WORMOGPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': process.env.API_HEADER_ORIGIN,
      'Referer': process.env.API_HEADER_REFERER,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`WormoGPT API error: ${response.status}`);
  const data = await response.json();
  return data.response || data.message || data.content || data.text || 'WormoGPT processing error.';
}

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });
    const reply = await callWormoGPT(messages);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`WormoGPT model server running on port ${PORT}`));

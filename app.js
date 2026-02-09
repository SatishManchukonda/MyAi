const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  const { message, apiKey } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const key = apiKey || process.env.GROQ_API_KEY;
  
  if (!key) {
    return res.status(400).json({ error: 'No API key. Add GROQ_API_KEY to environment.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: message }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'API Error' 
      });
    }

    const botMessage = data.choices[0]?.message?.content || 'No response';
    res.json({ response: botMessage });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function callLLM({ messages, model = 'gpt-5-nano', temperature = 0.0, max_tokens = 4000 }) {
  const provider = process.env.PRIMARY_PROVIDER || 'openai';

  if (provider === 'openai') {
    const url = 'https://api.openai.com/v1/chat/completions';
    const res = await axios.post(url, {
      model,
      messages,
      temperature,
      max_tokens
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.data.choices[0].message.content;
  }

  if (provider === 'google') {
    throw new Error('Google provider not implemented in prototype. Set PRIMARY_PROVIDER=openai');
  }

  throw new Error('No LLM provider configured');
}

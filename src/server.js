import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { callLLM } from './llmAdapter.js';
import { validateProject } from './validate.js';
import { requireAuth } from './auth.js';
import { supabase } from './supabaseClient.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/generate', requireAuth, async (req, res) => {
  try {
    const { brief, model = 'gpt-5-nano' } = req.body;
    if (!brief) return res.status(400).json({ error: 'brief is required' });

    const system = `You are a JSON-only UI generator. Output EXACTLY valid JSON matching schema v1. If you cannot produce it, output {}.`;

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: brief }
    ];

    const output = await callLLM({ messages, model, temperature: 0.0, max_tokens: 12000 });

    let projectJSON;
    try { projectJSON = JSON.parse(output); }
    catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from model', raw: output });
    }

    const valid = validateProject(projectJSON);
    if (!valid.valid) {
      const correctionPrompt = `Previous output failed schema validation. Errors: ${JSON.stringify(valid.errors)}. Please regenerate EXACT JSON following schema v1.`;
      const retryOutput = await callLLM({
        messages: [
          ...messages,
          { role: 'assistant', content: output },
          { role: 'user', content: correctionPrompt }
        ],
        model,
        temperature: 0.0,
        max_tokens: 12000
      });
      try { projectJSON = JSON.parse(retryOutput); }
      catch (e) { return res.status(500).json({ error: 'Model failed validation twice', raw: retryOutput }); }
    }

    // Save to Supabase (best-effort)
    try {
      const name = projectJSON.meta?.title || 'Untitled';
      const { error: dbError } = await supabase
        .from('projects')
        .insert({ name, data: projectJSON });
      if (dbError) {
        console.error('Supabase insert error:', dbError);
      }
    } catch (e) {
      console.error('Supabase insert threw:', e);
    }

    return res.json({ project: projectJSON });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { customAlphabet } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const DB_PATH = process.env.VERCEL ? '/tmp/db.json' : path.join(__dirname, 'db.json');

// Initialize Simple JSON Database
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ generations: [] }, null, 2));
}

function getDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveToDB(data) {
  const db = getDB();
  db.generations.push({
    id: db.generations.length + 1,
    ...data,
    created_at: new Date().toISOString()
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function findInDB(code) {
  const db = getDB();
  return db.generations.find(g => g.short_code === code);
}

app.use(cors());
app.use(express.json());

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

function generateShortCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let code = '';
  for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 3; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return code;
}

// Prompt Enhancement Logic
function enhancePrompt(userPrompt) {
  // Rule-based enhancement to maintain neutral style unless specified
  const base = userPrompt.trim();
  const additions = "detailed, high resolution, sharp focus, accurate anatomy, natural lighting";
  
  // If the user didn't specify a style, we keep it realistic/natural
  if (!base.toLowerCase().includes('style') && !base.toLowerCase().includes('art')) {
    return `${base}, realistic, ${additions}`;
  }
  return `${base}, ${additions}`;
}

const HF_TOKEN = process.env.HF_TOKEN; // User must provide this in .env
const MODEL_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

function generateImageUrls(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  // Using multiple sources and seeds to ensure diversity and avoid rate limits
  return [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&width=1024&height=1024&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&width=1024&height=1024&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&width=1024&height=1024&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&width=1024&height=1024&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(Math.random() * 100000)}&width=1024&height=1024&nologo=true`
  ];
}

app.post('/api/generate', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const enhancedPrompt = enhancePrompt(prompt);
  console.log('Generating URLs for:', enhancedPrompt);

  try {
    const urls = generateImageUrls(enhancedPrompt);
    
    res.json({
      prompt,
      enhancedPrompt,
      images: urls
    });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save', (req, res) => {
  const { prompt, enhancedPrompt, images, selectedImage } = req.body;
  const shortCode = generateShortCode();

  try {
    saveToDB({
      prompt,
      enhanced_prompt: enhancedPrompt,
      images,
      selected_image: selectedImage,
      short_code: shortCode
    });
    
    res.json({ shortCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/share/:code', (req, res) => {
  const { code } = req.params;
  const result = findInDB(code);

  if (!result) return res.status(404).json({ error: 'Not found' });

  res.json(result);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`ImagineX Server running at http://localhost:${port}`);
  });
}

// Export for Vercel Serverless
export default app;

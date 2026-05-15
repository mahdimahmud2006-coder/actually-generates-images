# ImagineX — Free AI Image Generation System

ImagineX is a premium full-stack AI image generation platform that uses only free and open-source models.

## Features
- **Pure Text-to-Image**: No scraping, no paid APIs.
- **Cinematic UX**: 5-second loading experience with dynamic status updates.
- **Premium UI**: Glassmorphism, dark mode, and smooth Framer Motion animations.
- **Shareable Links**: Generate unique short URLs for your favorite creations.
- **Free Stack**: Powered by Hugging Face Inference API (Stable Diffusion XL).

## Setup Instructions

### 1. Backend Setup
1. Go to the `server` directory.
2. Create a `.env` file (one has been provided as a template).
3. Get a **FREE** API Token from [Hugging Face](https://huggingface.co/settings/tokens).
4. Add your token to the `.env` file: `HF_TOKEN=your_token_here`.
5. Run:
   ```bash
   npm install
   npm start
   ```

### 2. Frontend Setup
1. Go to the `client` directory.
2. Run:
   ```bash
   npm install
   npm run dev
   ```

## Technology Stack
- **Frontend**: React, Vite, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, Better-SQLite3, Nanoid.
- **AI**: Hugging Face Inference API (Stable Diffusion XL).

## Critical Rules Followed
- **No Scraping**: All images are generated from scratch.
- **Free Models Only**: Uses open-source diffusion models.
- **Parallel Generation**: Generates 5 images asynchronously for speed.

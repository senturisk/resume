import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser with generous limit for PDF base64 payloads
  app.use(express.json({ limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'sen-resume-server' });
  });

  // Universal Resume Parsing endpoint powered by Gemini 3.8 Flash
  app.post('/api/parse-resume', async (req, res) => {
    try {
      const { text, fileBase64, mimeType, fileName } = req.body;

      if (!text && !fileBase64) {
        return res.status(400).json({
          success: false,
          error: 'Neither text nor fileBase64 was provided in the request.',
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured on the server. Falling back to local heuristic extraction.',
        });
      }

      const ai = getAI();
      const prompt = `You are a principal Applicant Tracking System (ATS) resume ingestion engine.
Analyze this resume carefully and extract all information into a clean, complete, structured JSON object with the following schema:

{
  "personalInfo": {
    "fullName": "string",
    "headline": "string (target professional title or current headline)",
    "email": "string",
    "phone": "string",
    "location": "string (city, state/province, country)",
    "website": "string (URL if present)",
    "linkedin": "string (LinkedIn URL if present)",
    "github": "string (GitHub URL if present)",
    "summary": "string (comprehensive executive summary / profile narrative)"
  },
  "workExperiences": [
    {
      "id": "string",
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string (YYYY-MM or YYYY)",
      "endDate": "string (YYYY-MM or empty if current)",
      "isCurrent": boolean,
      "highlights": ["string (each bullet point with action verb and metrics)"],
      "technologies": ["string"]
    }
  ],
  "educations": [
    {
      "id": "string",
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "location": "string",
      "gpa": "string",
      "honors": ["string"]
    }
  ],
  "skills": [
    {
      "id": "string",
      "name": "string",
      "category": "string (e.g. Core Languages, Cloud & Infrastructure, Design & UX, Marketing & Strategy)",
      "level": "Expert | Advanced | Intermediate | Beginner",
      "yearsOfExperience": number
    }
  ],
  "projects": [
    {
      "id": "string",
      "title": "string",
      "role": "string",
      "organization": "string",
      "url": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "highlights": ["string"],
      "technologies": ["string"]
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string",
      "issuer": "string",
      "issueDate": "string",
      "expiryDate": "string",
      "credentialId": "string",
      "credentialUrl": "string"
    }
  ],
  "customSections": [
    {
      "id": "string",
      "title": "Languages or other section title",
      "items": [
        {
          "id": "string",
          "heading": "string",
          "subheading": "string",
          "date": "string",
          "description": "string",
          "bullets": []
        }
      ]
    }
  ]
}

Instructions:
1. Extract ALL roles, dates, bullets, educations, skills, and languages thoroughly without skipping items.
2. If text contains action verbs and metrics, preserve them accurately in the highlights array.
3. Return ONLY the valid JSON object.`;

      let contents: any;
      if (fileBase64) {
        contents = [
          {
            inlineData: {
              mimeType: mimeType || 'application/pdf',
              data: fileBase64,
            },
          },
          { text: prompt },
        ];
      } else {
        contents = [{ text: `${prompt}\n\nResume Document Content:\n${text}` }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const jsonStr = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonStr);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Error during AI resume parsing:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error processing resume.',
      });
    }
  });

  // Vite middleware for development vs Static file server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sen Resume Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

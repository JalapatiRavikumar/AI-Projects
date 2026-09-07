import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import mongoose, { Schema, model, connect } from 'mongoose';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ============================================
// CLIENTS
// ============================================
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.index(process.env.PINECONE_INDEX!);

// ============================================
// DATABASE
// ============================================
interface IFile {
  userId: string;
  fileName: string;
  filePath: string;
  status: string;
  uploadedAt: number;
  chunkCount?: number;
  vectorCount?: number;
  processingError?: string;
}

await connect(process.env.MONGODB_URI!);

const FileModel = model<IFile>(
  'File',
  new Schema({
    userId: String,
    fileName: String,
    filePath: String,
    status: { type: String, default: 'processing' },
    uploadedAt: { type: Number, default: () => Date.now() },
    chunkCount: Number,
    vectorCount: Number,
    processingError: String,
  })
);

// ============================================
// SERVE FILES (Dynamic Fallback)
// ============================================
app.get('/uploads/:fileName', async (req, res) => {
  try {
    const file = await FileModel.findOne({ fileName: req.params.fileName }).sort({ uploadedAt: -1 });
    if (file && fs.existsSync(file.filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
      return res.sendFile(path.resolve(file.filePath));
    }
    res.status(404).send('Cannot GET /uploads/' + req.params.fileName);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ============================================
// PDF TEXT EXTRACTION
// ============================================
async function extractText(filePath: string) {
  console.log('📄 Extracting PDF text...');

  const fileBuffer = fs.readFileSync(filePath);
  const data = new Uint8Array(fileBuffer);

  const pdf = await pdfjsLib.getDocument({ data, verbosity: 0 }).promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    pageTexts.push(content.items.map((item: any) => item.str).join(' '));
    page.cleanup();
  }

  await pdf.cleanup();
  await pdf.destroy();

  return {
    text: pageTexts.join('\n').trim(),
    pages: numPages,
  };
}




// ============================================
// EMBEDDINGS (GOOGLE)
// ============================================
async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-embedding-2',
  });

  const result = await model.embedContent({
    content: {
      parts: [{ text: text.slice(0, 8000) }],
    },
  });

  return result.embedding.values;
}


// ============================================
// FILE UPLOAD
// ============================================
const upload = multer({ dest: 'uploads/' }).single('file');

app.post('/api/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({ error: 'Upload failed' });
    }

    const userId = req.body.userId || 'anonymous';

    const file = await FileModel.create({
      userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      status: 'processing',
    });

    res.json({ success: true, fileId: file._id });

    // ================= BACKGROUND PROCESS =================
    (async () => {
      try {
        console.log(`🔄 Starting processing: ${file.fileName}`);
        const { text, pages } = await extractText(file.filePath);
        const cleanText = text.replace(/\s+/g, ' ').trim();
        console.log(`📝 Extracted ${cleanText.length} chars from ${pages} pages`);

        const CHUNK_SIZE = 4000;
        const OVERLAP = 500;

        let start = 0;
        let chunkIndex = 0;
        let totalVectors = 0;

        const textChunks: string[] = [];
        while (start < cleanText.length) {
          let end = Math.min(start + CHUNK_SIZE, cleanText.length);
          const chunk = cleanText.slice(start, end).trim();
          if (chunk.length >= 100) {
            textChunks.push(chunk);
          }
          
          if (end >= cleanText.length) {
            break;
          }
          
          start = end - OVERLAP;
          if (start < 0) start = end;
        }

        const totalChunks = textChunks.length;
        console.log(`🧩 Created ${totalChunks} chunks — embedding in batches of 5`);

        // Batch size of 5 to stay well within rate limits
        const BATCH_SIZE = 5;
        for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
          const batchTexts = textChunks.slice(i, i + BATCH_SIZE);

          let embeddings: number[][];
          try {
            embeddings = await Promise.all(
              batchTexts.map((t) => generateEmbedding(t))
            );
          } catch (embErr: any) {
            console.error(`❌ Embedding batch ${i}–${i+BATCH_SIZE} failed:`, embErr.message);
            throw embErr;
          }

          const vectors = batchTexts.map((t, idx) => ({
            id: `${file._id}_chunk_${chunkIndex + idx}`,
            values: embeddings[idx],
            metadata: {
              text: t.slice(0, 40000),
              userId,
              fileId: file._id.toString(),
              fileName: file.fileName,
              page: Math.floor(((i + idx) / totalChunks) * pages) + 1,
              chunkIndex: chunkIndex + idx,
            },
          }));

          chunkIndex += batchTexts.length;

          try {
            await index.upsert(vectors);
            totalVectors += vectors.length;
            console.log(`✅ Upserted batch ${i}–${i + BATCH_SIZE} | Total vectors: ${totalVectors}`);
          } catch (upsertErr: any) {
            console.error(`❌ Pinecone upsert failed:`, upsertErr.message);
            throw upsertErr;
          }

          await FileModel.findByIdAndUpdate(file._id, {
            chunkCount: totalChunks,
            vectorCount: totalVectors,
          });
        }

        await FileModel.findByIdAndUpdate(file._id, {
          status: 'ready',
          chunkCount: totalChunks,
          vectorCount: totalVectors,
        });

        console.log(`🎉 Done processing ${file.fileName} — ${totalVectors} vectors stored`);
      } catch (e: any) {
        console.error('❌ PDF Processing Error:', e.message);
        await FileModel.findByIdAndUpdate(file._id, {
          status: 'error',
          processingError: e.message,
        });
      }
    })();
  });
});

// ============================================
// FILES LIST
// ============================================
app.get('/api/files/:userId', async (req, res) => {
  try {
    const files = await FileModel.find({ userId: req.params.userId }).sort({ uploadedAt: -1 });
    res.json({
      files: files.map(f => ({
        id: f._id,
        name: f.fileName,
        status: f.status,
        uploadedAt: f.uploadedAt,
        chunkCount: f.chunkCount,
        vectorCount: f.vectorCount,
        processingError: f.processingError,
      }))
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// DELETE FILE
// ============================================
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const file = await FileModel.findByIdAndDelete(req.params.fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });
    // Delete from Pinecone
    try {
      await index.deleteMany({ fileId: file._id.toString() });
    } catch (_) {}
    // Delete from disk
    try {
      fs.unlinkSync(file.filePath);
    } catch (_) {}
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// CHAT
// ============================================
app.post('/api/chat', async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const queryEmbedding = await generateEmbedding(message);

    const result = await index.query({
      vector: queryEmbedding,
      topK: 10,
      filter: { userId: { $eq: userId } },
      includeMetadata: true,
    });

    const sources = result.matches
      .filter((m) => (m.score || 0) >= 0.4)
      .slice(0, 5);

    console.log(`🔍 Matched ${result.matches.length} vectors, ${sources.length} above threshold`);

    const context = sources.length > 0
      ? sources.map((s, i) =>
          `[Source ${i + 1}: ${s.metadata?.fileName}, Page ${s.metadata?.page}]\n${s.metadata?.text}`
        ).join('\n\n')
      : 'No relevant context found in your uploaded documents.';

    res.write(`data: ${JSON.stringify({ sources: sources.map(s => ({
      fileName: s.metadata?.fileName,
      page: s.metadata?.page,
      score: s.score,
    })) })}\n\n`);

    const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are a helpful research assistant. Answer using ONLY the context below.\nIf the context does not contain the answer, say "I don't have enough information in the uploaded documents to answer this."\n\nContext:\n${context}\n\nQuestion: ${message}\n\nAnswer clearly and cite page numbers where relevant.`;

    try {
      // Try streaming
      const streamResult = await chatModel.generateContentStream(prompt);
      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    } catch (_: any) {
      // Fallback to non-streaming
      console.log('⚠️  Falling back to non-streaming generation');
      const response = await chatModel.generateContent(prompt);
      const text = response.response.text();
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e: any) {
    console.error('Chat error:', e.message);
    res.write(`data: ${JSON.stringify({ content: 'Sorry, an error occurred: ' + e.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ============================================
// SUMMARIZE
// ============================================
app.post('/api/summarize', async (req, res) => {
  const { fileName, userId } = req.body;
  if (!fileName || !userId) return res.status(400).json({ error: 'Missing fields' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Fetch all chunks for this file from Pinecone via a dummy embedding query
    const dummyEmbedding = await generateEmbedding(`Summary of ${fileName}`);
    const result = await index.query({
      vector: dummyEmbedding,
      topK: 20,
      filter: { userId: { $eq: userId }, fileName: { $eq: fileName } },
      includeMetadata: true,
    });

    const context = result.matches
      .sort((a, b) => ((a.metadata?.chunkIndex as number) || 0) - ((b.metadata?.chunkIndex as number) || 0))
      .map(m => m.metadata?.text)
      .join('\n\n');

    if (!context) {
      res.write(`data: ${JSON.stringify({ content: 'No content found for this document.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are a research assistant. Provide a comprehensive, structured summary of the following document content.\n\nInclude:\n- **Main Topic & Purpose**\n- **Key Findings or Arguments** (bullet points)\n- **Methodology** (if applicable)\n- **Conclusions**\n\nDocument: "${fileName}"\n\nContent:\n${context.slice(0, 30000)}\n\nProvide a detailed but clear summary:`;

    try {
      const streamResult = await chatModel.generateContentStream(prompt);
      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    } catch (_) {
      const response = await chatModel.generateContent(prompt);
      res.write(`data: ${JSON.stringify({ content: response.response.text() })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ content: 'Error: ' + e.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ============================================
// COMPARE
// ============================================
app.post('/api/compare', async (req, res) => {
  const { fileNames, userId } = req.body;
  if (!fileNames || fileNames.length < 2 || !userId) return res.status(400).json({ error: 'Missing fields' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const contexts: Record<string, string> = {};
    for (const fileName of fileNames.slice(0, 2)) {
      const dummyEmbedding = await generateEmbedding(`Key points of ${fileName}`);
      const result = await index.query({
        vector: dummyEmbedding,
        topK: 10,
        filter: { userId: { $eq: userId }, fileName: { $eq: fileName } },
        includeMetadata: true,
      });
      contexts[fileName] = result.matches.map(m => m.metadata?.text).join('\n\n');
    }

    const [file1, file2] = fileNames;
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are a research analyst. Compare and contrast the following two documents.\n\nStructure your response as:\n- **Overview of each document**\n- **Key Similarities**\n- **Key Differences**\n- **Which is better suited for [purpose]** (if applicable)\n\n---\n**Document 1: ${file1}**\n${contexts[file1]?.slice(0, 15000)}\n\n---\n**Document 2: ${file2}**\n${contexts[file2]?.slice(0, 15000)}\n\nProvide a thorough comparative analysis:`;

    try {
      const streamResult = await chatModel.generateContentStream(prompt);
      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    } catch (_) {
      const response = await chatModel.generateContent(prompt);
      res.write(`data: ${JSON.stringify({ content: response.response.text() })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ content: 'Error: ' + e.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ============================================
// FOLLOW-UP QUESTIONS
// ============================================
app.post('/api/followup', async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.json({ questions: [] });
  try {
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await chatModel.generateContent(
      `Based on this Q&A, suggest exactly 3 short follow-up questions a researcher would ask next. Return ONLY a JSON array of strings, no markdown, no other text.\n\nQ: ${question}\nA: ${answer.slice(0, 800)}\n\nJSON array:`
    );
    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*\]/);
    const questions = match ? JSON.parse(match[0]) : [];
    res.json({ questions: questions.slice(0, 3) });
  } catch { res.json({ questions: [] }); }
});

// ============================================
// HEALTH
// ============================================
app.get('/api/health', async (_req, res) => {
  const stats = await index.describeIndexStats();
  res.json({
    status: 'ok',
    vectors: stats.totalRecordCount,
    dimension: stats.dimension,
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 RAG Server Running                ║
║   📍 Port: ${PORT}                      ║
║   📄 PDF Parse: ESM Safe               ║
║   🧠 Gemini + Pinecone                 ║
╚════════════════════════════════════════╝
`);
});

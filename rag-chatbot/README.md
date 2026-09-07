# 🧠 Research Paper RAG Chatbot

A full-stack **AI-powered Research Paper Chatbot** built using **Retrieval-Augmented Generation (RAG)** architecture.

This system allows users to upload research papers and interact with them conversationally using AI while receiving **accurate answers grounded in document context with page-level citations**.

---

## 🚀 Tech Stack

### 🔹 Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* NextAuth.js (Google OAuth)
* React Markdown
* Remark GFM

### 🔹 Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* Multer (File Upload)
* pdfjs-dist (PDF Parsing)
* CORS
* dotenv

### 🔹 AI & RAG Stack

* Google Gemini API
* Google Embedding Model
* Pinecone Vector Database
* Semantic Similarity Search
* Retrieval-Augmented Generation (RAG)

---

## ✨ Features

### 📄 Research Paper Management

* Upload research papers (PDF)
* Automatic text extraction
* Background document processing
* Smart chunking with overlap strategy
* Processing status tracking

### 🧠 AI Chat System

* Ask questions from uploaded papers
* Context-aware AI responses
* Semantic document retrieval
* Multi-document querying
* Reduced hallucinations using RAG grounding

### 📚 Citation-Based Answers

* Page-level source citations
* Inline PDF viewer
* Reference highlighting
* Research-focused responses

### 🔐 Authentication

* Google OAuth Login
* Secure user sessions
* User-specific document isolation

---

## 🏗️ System Architecture

```
User
  ↓
Next.js Frontend
  ↓
Express Backend API
  ↓
PDF Upload & Parsing
  ↓
Text Chunking
  ↓
Embedding Generation (Gemini)
  ↓
Pinecone Vector Database
  ↓
Semantic Similarity Retrieval
  ↓
Gemini LLM
  ↓
Grounded Response + Citations
```

---

## 🧩 RAG Pipeline Workflow

1. User uploads a research paper (PDF).
2. PDF text is extracted using **pdfjs**.
3. Content is divided into semantic chunks.
4. Embeddings are generated using Google Embedding Model.
5. Embeddings stored inside **Pinecone Vector Database**.
6. User query converted into embedding.
7. Relevant document chunks retrieved via similarity search.
8. Retrieved context injected into Gemini prompt.
9. Gemini generates grounded response with citations.

---

## 📸 Application Screenshots

> *(Add screenshots after deployment)*

* Login Page
* Research Paper Upload Dashboard
* AI Chat Interface
* Citation Highlighting
* Inline PDF Viewer

---

## ⚡ Technical Challenges Solved

* Reduced AI hallucinations using Retrieval-Augmented Generation
* Implemented efficient semantic chunking strategy
* Page-level citation tracking for research accuracy
* Background document processing pipeline
* Secure multi-user document isolation
* Optimized vector similarity search performance

---

## 📂 Project Folder Structure

```bash
rag-chatbot/
│
├── backend/                     # Express + RAG Backend
│   ├── dist/
│   ├── uploads/
│   ├── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── api/auth/[...nextauth]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── auth.ts
│   ├── package.json
│   └── .env.local
│
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| POST   | `/upload`       | Upload research paper    |
| POST   | `/chat`         | Ask question from papers |
| GET    | `/documents`    | Fetch uploaded papers    |
| DELETE | `/document/:id` | Delete document          |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/JalapatiRavikumar/AI-Projects.git
cd AI-Projects/rag-chatbot
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```
PORT=5000
MONGODB_URI=your_mongodb_uri
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

Run backend:

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

(Open new terminal)

```bash
cd frontend
npm install
```

Create `.env.local`

```
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🌍 Deployment (Recommended)

| Service        | Platform         |
| -------------- | ---------------- |
| Frontend       | Vercel           |
| Backend        | Render / Railway |
| Database       | MongoDB Atlas    |
| Vector DB      | Pinecone Cloud   |
| Authentication | Google OAuth     |

---

## 🔮 Future Improvements

* Streaming AI responses
* Research paper summarization
* Multi-modal understanding (tables & figures)
* Local embedding models
* Agentic research assistant
* Citation confidence scoring
* Knowledge graph integration

---

## 👨‍💻 Author

**Sujal Papalkar**
Full Stack Developer | AI Systems Enthusiast

🔗 GitHub: https://github.com/sujalpapalkar

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

## 📜 License

This project is licensed under the **MIT License**.

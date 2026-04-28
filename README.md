# DevSnippet 🚀

DevSnippet is a modern, high-performance platform for developers to store, manage, share, and discover code snippets. Built with a sleek dark-mode UI, it features real-time telemetry, collaborative sharing, and AI-powered snippet summarization.

## ✨ Features

- **Advanced Snippet Management**: Create, edit, and organize your code snippets with full syntax highlighting.
- **AI Summarization**: Instantly generate explanations for complex code snippets using AI.
- **Real-Time Dashboard**: Track your workspace metrics, including total snippets, language distribution, and active discussions.
- **Explore & Trending**: Discover public snippets from other developers, complete with a dynamically calculated trending tags algorithm.
- **Collaboration & Sharing**: Securely share snippets via secure links or collaborate on snippets via the comments system.
- **Robust Access Control**: Snippets can be Private, Public, or selectively Shared.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Lucide Icons, react-syntax-highlighter.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT) for authentication.
- **Database**: MySQL (relational schema for users, snippets, comments, and shares).
- **AI Integration**: Google GenAI SDK (Gemini).

## 📋 Prerequisites

- **Node.js** (v18+ recommended)
- **MySQL Server** (e.g., XAMPP, WAMP, or standalone MySQL)
- **Git**

## 🚀 Setup & Installation

### 1. Database Setup
1. Ensure your MySQL server is running.
2. Create a new database (e.g., `devsnippet`).
3. Import the `backend/schema.sql` file into your MySQL database to create the required tables (`users`, `snippets`, `comments`, `shares`).

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on the following template:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=devsnippet
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *(The server should run on `http://localhost:5000`)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(The app should run on `http://localhost:5173`)*

## 🌿 Git Workflow

This project adheres to a standard branching model:
- **`main`**: Stable, production-ready releases.
- **`develop`**: The active integration branch for features.
- **`feature/*`**: Individual branches for new features or bug fixes. Always merge into `develop` via Pull Requests.

**Commit Format:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.


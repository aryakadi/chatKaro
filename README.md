# ChatKaro 💬

![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=flat&logo=spring-boot) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

ChatKaro is a full-stack real-time chat application built with a modern web tech stack. It features instant messaging via WebSockets, customized room creation, and an integrated **AI Chat Summary** feature powered by Google's Gemini API to quickly catch up on missed conversations.

🚀 **Live Demo:** [https://chat-karo-red.vercel.app/](https://chat-karo-red.vercel.app/)

## ✨ Features

- **Real-Time Messaging:** Instant, bi-directional communication using WebSockets (SockJS & STOMP).
- **Room-Based Chat:** Create a new custom room or join an existing one using a unique Room ID.
- **AI Chat Summary:** Uses Google Gemini API to read recent room messages and generate a smart, concise summary of the conversation—perfect for catching up.
- **Beautiful UI:** Responsive, modern dark-mode user interface styled with Tailwind CSS.
- **Persistent Chat History:** Messages and rooms are securely stored in MongoDB.

## 🛠️ Tech Stack

### Frontend (`/chatkaro frontend`)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Networking:** Axios for HTTP requests, SockJS/STOMP for WebSockets

### Backend (`/chatKaro backend`)
- **Framework:** Spring Boot (Java 21)
- **Database:** MongoDB
- **AI Integration:** Google Gemini API
- **Hosting:** Render

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Java 21+ and Maven
- MongoDB (Local or Atlas URL)
- Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd "chatKaro backend"
   ```
2. Create a `.env` file in the root of the backend folder and add your Gemini API Key and MongoDB URI:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017/chatapp
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will run on `http://localhost:8080`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd "chatkaro frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend folder (optional, if you want to override the default local API URL):
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

## 🚀 Deployment

- **Frontend:** Deployed on Vercel. Make sure `VITE_API_BASE_URL` is set in your Vercel Environment Variables to point to your live backend URL.
- **Backend:** Deployed on Render. Make sure environment variables (like `GEMINI_API_KEY` and `MONGODB_URI`) are set in your Render dashboard.

## 📄 License
This project is licensed under the MIT License.
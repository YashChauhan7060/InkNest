# 🖋️ InkNest 

**A highly scalable, full-stack microservices publishing platform.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

InkNest is a modern, full-stack blogging platform engineered for high availability, low latency, and zero data loss. Moving beyond traditional monolithic design, InkNest employs a decoupled **Next.js** frontend powered by a backend **Microservices Architecture** with a CQRS-inspired separation of Read and Write operations.

---
<img width="1900" height="767" alt="InkNest Architecture" src="https://github.com/user-attachments/assets/1d5b48e0-4056-46a8-b59a-b77d7f007f2c" />

## 🏗️ System Architecture

InkNest is separated into a modern Client interface and three distinct, independently scalable backend microservices:

1. **Client Interface (Next.js):** A server-side rendered frontend utilizing the Next.js App Router for optimal SEO and fast page loads, styled with Tailwind CSS.
2. **User Service (Identity Node):** Manages seamless Google OAuth authentication, JWT issuance, profile state, and hardens the platform against brute-force attacks.
3. **Blog Service (Read & Interact Node):** A heavily optimized public-facing service designed to serve content and handle high-throughput user engagement (comments, saves). 
4. **Author Service (Write & Compute Node):** A protected environment handling expensive computing operations like database writes, AI content generation, and cloud media uploads.

---

## ✨ Core Features

### 🔐 Seamless Authentication & Security
Integrated with **Google OAuth** for frictionless user onboarding. The User Service issues secure JSON Web Tokens (JWTs) to maintain session state across the isolated microservices, ensuring protected routes (like creating or saving blogs) strictly verify user identity before execution.

### 🚦 Advanced Rate Limiting (Sliding Window)
The API Gateway implements layered Sliding Window rate limiting tailored to specific operational costs, effectively isolating public traffic from expensive backend processes:
* **Brute Force Guard:** Capped at 5 req/min on the Login route.
* **Write/Spam Guard:** Capped at 10 req/min on Author routes to prevent database/Cloudinary flooding.
* **Viral Traffic Handling:** Capped at 100 req/min on public Blog feeds, allowing massive horizontal scaling for readers without impacting authors.

### ⚡ Event-Driven Cache Invalidation
Uses **RabbitMQ** to achieve asynchronous communication between services. When a blog is created, updated, or deleted, a persistent message (`durable: true`) is fired to invalidate specific **Redis** cache keys (`blogs:*`, `blog:${id}`). This decouples heavy background tasks from the user's request cycle, keeping API response times under 150ms.

### ☁️ Ephemeral Cloud Storage Pipeline
Solves Docker's ephemeral local-storage limitations by utilizing **Multer** (Memory Storage) and custom `DataUri` parsing. Files are intercepted as raw binary buffers in the server's RAM, translated into Base64 strings, and securely uploaded directly to **Cloudinary**—completely bypassing the local hard drive.

### 🧠 AI-Powered Author Tools
Integrates the **Google Gemini 2.5 Flash** model to provide authors with high-speed content assistance:
* **SEO & Grammar Engine:** Generates optimized titles and summaries with custom temperature controls (`0.3`) for strict analytical output.
* **Rich-Text Preservation:** Employs advanced prompting and Regex sanitization to correct spelling and grammar while flawlessly preserving all raw HTML and inline styles from the frontend Jodit Editor.

### 🗄️ Serverless Database Scaling
Integrated with **Neon Serverless PostgreSQL**. Instead of maintaining heavy, persistent TCP connection pools that crash during container scaling, the database uses lightweight HTTP/WebSocket connections to effortlessly scale from zero to massive traffic spikes without connection timeouts.

---

## 📂 Project Structure

```bash
InkNest/
├── frontend/             # Next.js App Router Client
│   ├── src/
│   │   ├── admin/        # Admin dashboard views
│   │   ├── blog/         # Blog reading interfaces
│   │   ├── login/        # Google OAuth integration
│   │   └── profile/      # User settings & saved blogs
│   ├── components/ui/    # Reusable Tailwind/shadcn components
│   └── lib/              # Frontend utilities and API hooks
│
├── backend/
│   ├── author/           # The Author Microservice (Write/AI)
│   ├── blog/             # The Public Read Microservice
│   └── user/             # The Authentication Microservice

```
## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* RabbitMQ (Local or Cloud instance via CloudAMQP)
* PostgreSQL (Neon Serverless recommended)
* Redis
* Cloudinary Account
* Google Cloud Console Account (For OAuth Credentials)
* Google Gemini API Key

### Environment Variables
You will need `.env` files for the frontend and each microservice.

**Backend (`.env`):**
```env
PORT=5000 # (Use 5001, 5002 for other services)
JWT_SEC=your_super_secret_jwt_key
DB_URL=postgres://user:password@endpoint.neon.tech/inknest
RABBITMQ_URL=amqp://localhost:5672
Cloud_Name=your_cloud_name
Cloud_Api_Key=your_api_key
Cloud_Api_Secret=your_api_secret
Gemini_Api_Key=your_gemini_key
```

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_USER_API=http://localhost:5000/api/v1
NEXT_PUBLIC_BLOG_API=http://localhost:5001/api/v1
NEXT_PUBLIC_AUTHOR_API=http://localhost:5002/api/v1
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Installation & Execution
```bash
# 1. Clone the repository
git clone [https://github.com/YashChauhan7060/InkNest.git](https://github.com/YashChauhan7060/InkNest.git)
cd InkNest

# 2. Start the Frontend
cd frontend
npm install
npm run dev

# 3. Start the Microservices (In separate terminals)
cd backend/user && npm install && npm run dev
cd backend/author && npm install && npm run dev
cd backend/blog && npm install && npm run dev
```

---

## 🤝 Contributors
* **Yash Chauhan**
* **Mahi Agnihotri**
* **Ansh Maheshwari**

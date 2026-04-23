# GEN-AI-interview-preparation-project
# 🚀 AI Resume Matcher & Interview Prep Platform

A full-stack AI-powered web application that analyzes resumes against job descriptions and generates **match scores, interview questions, skill gaps, preparation plans, and a professional resume PDF**.

---

## ✨ Key Features

* 📄 Upload Resume (PDF parsing supported)
* 🎯 AI-based Match Score with Job Description
* 💡 Technical & Behavioral Interview Questions (detailed answers included)
* 📊 Skill Gap Analysis with severity levels
* 📅 Personalized Preparation Plan (day-wise)
* 📥 Download Professional Resume (PDF)
* 🔐 User Authentication (JWT-based login/register)
* 🗂️ View and manage past interview reports

---

## 🛠️ Tech Stack

### Frontend

* Angular
* HTML, CSS, TypeScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### AI & Tools

* OpenRouter API (AI generation)
* Puppeteer (PDF generation)
* pdf-parse (Resume parsing)
* JWT Authentication

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/your-username/ai-resume-matcher.git
cd ai-resume-matcher
```

---

### 2. Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
OPENROUTER_API_KEY=your_api_key
JWT_SECRET=your_secret
```

Run backend:

```
npm start
```

---

### 3. Frontend Setup

```
cd frontend
npm install
ng serve
```

---

## 🚀 How It Works

1. Enter Job Description
2. Enter Self Description
3. Upload Resume (PDF)
4. Click **Generate Report**

➡️ AI processes data and generates:

* Match Score
* Interview Questions
* Skill Gaps
* Preparation Plan

➡️ You can:

* View reports anytime
* Download AI-generated Resume PDF

---

## 📂 Project Structure

```
/frontend
  /components
  /services

/backend
  /controllers
  /models
  /routes
  /services
```

---

## 📸 Screenshots

> Add screenshots here (very important for recruiters)

* Home Page (Upload + Input)
* Generated Report UI
* Resume PDF Output

---

## 🎯 Future Improvements

* 🌐 Deploy on cloud (AWS / Vercel)
* 📑 Multiple resume templates
* ⚡ Faster PDF generation
* 📊 Advanced analytics dashboard
* 🤖 Improved AI accuracy

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**
GitHub: https://github.com/your-username
LinkedIn: (add your profile)

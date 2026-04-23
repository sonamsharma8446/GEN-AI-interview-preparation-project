const axios = require("axios");
const { z } = require("zod");
const puppeteer = require('puppeteer')
const interviewReportZodSchema = z.object({
  matchScore: z.number().default(0),

  technicalQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })).default([]),

  behavioralQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })).default([]),

  skillGaps: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"])
  })).default([]),

  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string())
  })).max(6).default([]),

  title: z.string().default("Untitled Interview Report")
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
Return ONLY valid JSON. No text, no explanation.

STRICT SCHEMA:

{
  "matchScore": number (0-100),
  "technicalQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "behavioralQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "skillGaps": [
    { "skill": string, "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": number, "focus": string, "tasks": array of strings }
  ],
  "title": string
}
there must be at least 15-20 technical questions and 10-15 behavioral questions. Provide detailed, specific questions and answers based on the job description and resume.
Job Description: ${jobDescription}
Resume: ${resume}
Self Description: ${selfDescription}
`;

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  let content = res.data.choices[0].message.content;

  // ✅ Extract JSON safely
  let parsed;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    parsed = {};
  }

  // ✅ NORMALIZATION
  parsed.technicalQuestions = (parsed.technicalQuestions || []).map(q => ({
    question: typeof q.question === "string" ? q.question : q.question?.text || "",
    intention: q.intention || "",
    answer: typeof q.answer === "string" ? q.answer : q.answer?.text || ""
  }));

  parsed.behavioralQuestions = (parsed.behavioralQuestions || []).map(q => ({
    question: typeof q.question === "string" ? q.question : q.question?.text || "",
    intention: q.intention || "",
    answer: typeof q.answer === "string" ? q.answer : q.answer?.text || ""
  }));

  parsed.skillGaps = (parsed.skillGaps || []).map(s => ({
    skill: typeof s === "string" ? s : s.skill || "",
    severity: s.severity || "medium"
  }));

  parsed.preparationPlan = (parsed.preparationPlan || []).map((p, i) => ({
    day: p.day || i + 1,
    focus: p.focus || p.title || "",
    tasks: Array.isArray(p.tasks)
      ? p.tasks
      : ["Study concepts", "Practice questions", "Revise topics"]
  }));

  parsed.title = parsed.title || "Untitled Interview Report";

  // ✅ FINAL SHAPE
  parsed = {
    matchScore: parsed.matchScore || 0,
    technicalQuestions: parsed.technicalQuestions,
    behavioralQuestions: parsed.behavioralQuestions,
    skillGaps: parsed.skillGaps,
    preparationPlan: parsed.preparationPlan,
    title: parsed.title
  };

  // ✅ Zod validation
  try {
    return interviewReportZodSchema.parse(parsed);
  } catch {
    return parsed;
  }
}

async function generatePdfFromHtml(htmlContent) {
  console.log("🚀 Starting Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  console.log("📄 Setting HTML content...");
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  console.log("📑 Generating PDF...");
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close(); // rather than leaving the browser open, we close it after generating the PDF to free up resources
  console.log("✅ PDF generated successfully");
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  const resumePdfSchema = z.object({
    html: z.string().describe("HTML content for the resume PDF")
  })

  const prompt = `
Return ONLY valid JSON. No explanation, no markdown.

STRICT SCHEMA:
{
  "html": string
}

Generate a PROFESSIONAL, ATS-friendly resume using EXACT structure and styling below.

❗ VERY IMPORTANT:
- Follow HTML structure EXACTLY
- Do NOT change layout
- Only replace content
- Keep design compact and clean
- Output must be ready for PDF (no overflow)

--------------------------
HTML STRUCTURE (STRICT)
--------------------------

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
}

.container {
  width: 800px;
  margin: 30px auto;
  background: #fff;
  padding: 30px 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #222;
}

/* HEADER */
.header {
  text-align: center;
  margin-bottom: 16px;
}

.header h1 {
  font-size: 24px;
  margin: 0;
}

.header p {
  font-size: 13px;
  color: #555;
  margin: 4px 0;
}

/* SECTION */
.section {
  margin-top: 16px;
}

.section h2 {
  font-size: 12px;
  letter-spacing: 1px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

/* TEXT */
p {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

/* SKILLS */
.skills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 20px;
  font-size: 13px;
}

/* EXPERIENCE */
.item {
  margin-bottom: 10px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 13px;
}

.sub {
  font-size: 12px;
  color: #666;
}

/* LIST */
ul {
  padding-left: 16px;
}

li {
  font-size: 13px;
  margin-bottom: 4px;
}

.section, .item {
  page-break-inside: avoid;
}

</style>
</head>

<body>
<div class="container">

<div class="header">
  <h1>FULL NAME</h1>
  <p>Location | Phone</p>
  <p>Email | LinkedIn | GitHub</p>
</div>

<div class="section">
  <h2>PROFESSIONAL SUMMARY</h2>
  <p>2–3 line strong summary</p>
</div>

<div class="section">
  <h2>TECHNICAL SKILLS</h2>
  <div class="skills">
    <div><strong>Languages:</strong> ...</div>
    <div><strong>Frontend:</strong> ...</div>
    <div><strong>Backend:</strong> ...</div>
    <div><strong>Tools:</strong> ...</div>
  </div>
</div>

<div class="section">
  <h2>PROFESSIONAL EXPERIENCE</h2>

  <div class="item">
    <div class="item-header">
      <span>Role</span>
      <span>Date</span>
    </div>
    <div class="sub">Company</div>
    <ul>
      <li>Impact-based bullet</li>
    </ul>
  </div>

</div>

<div class="section">
  <h2>KEY PROJECTS</h2>

  <div class="item">
    <div class="item-header">
      <span>Project Name</span>
    </div>
    <ul>
      <li>Project impact</li>
    </ul>
  </div>

</div>

<div class="section">
  <h2>EDUCATION</h2>
  <p>Degree, College, Year</p>
</div>

</div>
</body>
</html>
--------------------------
CONTENT RULES (STRICT)
--------------------------

- Replace placeholders with real content
- Keep resume within 1 page (but do NOT make content too short)
- Use strong action verbs (Built, Developed, Optimized, Designed)
- Include measurable impact (%, performance, users, speed)

SUMMARY:
- 2–3 concise but impactful lines

SKILLS:
- MUST be inline (NOT bullet list)
- Keep compact and clean

PROFESSIONAL EXPERIENCE:
- Each role MUST have 3–4 bullet points
- Each bullet MUST be at least 10–15 words
- Include impact or improvement (performance, efficiency, etc.)

KEY PROJECTS (VERY IMPORTANT):
- Each project MUST have 3–4 bullet points (STRICT)
- Each bullet MUST be 12–18 words
- Each project MUST include:
  • What was built
  • Technologies used
  • Real-world usage or users
  • Measurable impact (if possible)

- DO NOT write short or generic bullets
- DO NOT repeat same sentence structure
- Make each bullet meaningful and slightly detailed

GOOD EXAMPLE:
- Developed a full-stack MERN application enabling 100+ users to access courses with secure authentication and optimized backend APIs.
- Improved backend performance by 30% through efficient database schema design and query optimization techniques.
- Designed responsive UI using React and Tailwind CSS, enhancing user engagement across mobile and desktop devices.

GENERAL:
- Avoid repetition
- Avoid filler words
- Keep sentences clear, strong, and professional

--------------------------
INPUT DATA
--------------------------

Job Description: ${jobDescription}
Resume: ${resume}
Self Description: ${selfDescription}
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  let content = response.data.choices[0].message.content;
  let parsed;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    parsed = {};
  }

  const validated = {
    html: parsed.html || "<h1>No content generated</h1>"
  };
  let safeHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body>
${validated.html}
</body>
</html>
`;
  console.log("HTML LENGTH:", safeHtml.length);
  const pdfBuffer = await generatePdfFromHtml(safeHtml);
  return pdfBuffer;

}


module.exports = { generateInterviewReport, generateResumePdf };
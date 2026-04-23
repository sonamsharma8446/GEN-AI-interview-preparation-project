const pdfParse = require("pdf-parse")
const interviewReportModel = require("../models/interviewReport.model")
const {generateInterviewReport, generateResumePdf} = require("../src/services/ai.service");

/**
 * @description Controller to get interview report based on user self description, resume and job description
 */
async function generateInterviewReportController(req, res) {

  const resumeContent = await(new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
  const { selfDescription, jobDescription } = req.body

  const interViewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription
  })

  // Normalize AI keys to match Mongoose schema (behavioural vs behavioral)
  const normalized = Object.assign({}, interViewReportByAi, {
    behaviouralQuestions: interViewReportByAi.behavioralQuestions || interViewReportByAi.behaviouralQuestions || []
  })

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...normalized
  })

  res.status(201).json({
    message:"Interview report generated successfully",
    interviewReport
  })
}

/**
 * @description Controller to get interview report based on user self description, resume and job description
 */
async function generateInterviewReportByIdController(req, res){
  const {interviewId} = req.params

  const interviewReport = await interviewReportModel.findOne({_id: interviewId })

  if(!interviewReport){
    return res.status(404).json({
      message:"Interview report not found."
    })
  }

  res.status(200).json({
    message:"Interview report fetched successfully.",
    interviewReport
  })
}

/**
 * @description Controller to get all interview reports of logged in user
 */
async function getAllInterviewsController(req, res){

const interviewReports = await (interviewReportModel.find({ user: req.user.id })).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviouralQuestions -skillGaps -preparationPlan") // Exclude large fields from the response to reduce payload size

if(!interviewReports){ 
  return res.status(404).json({
    message:"No interview reports found."
  })
}

res.status(200).json({
  message:"Interview reports fetched successfully.",
  interviewReports
})

} 

/**
 * @description Controller to generate resume PDF from HTML content (if needed in future)
 */
async function generateResumePdfController(req, res) {

  const {interviewId} = req.params;
  const interviewReport = await interviewReportModel.findById(interviewId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found."
    });
  }
  const {resume, selfDescription, jobDescription} = interviewReport;

  const pdfBuffer = await generateResumePdf({resume, selfDescription, jobDescription});

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=resume_${interviewId}.pdf`,
    'Content-Length': pdfBuffer.length
  });
  res.end(pdfBuffer);
}

module.exports = { generateInterviewReportController, generateInterviewReportByIdController, getAllInterviewsController, generateResumePdfController }
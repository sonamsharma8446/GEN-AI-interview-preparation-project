const express = require("express");
const authMiddleware= require("../middleware/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middleware/file.middleware")
const {generateResumePdfController} = require("../controllers/interview.controller");

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self decription, resume pdf and job description
 * @access private 
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController)


/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by ID
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.generateInterviewReportByIdController)

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewsController)

/**
 * @route POST /api/interview/resume-pdf
 * @description generate resume PDF based on user self description, resume and job description
 * @access private 
 */
interviewRouter.post("/resume/pdf/:interviewId", authMiddleware.authUser,generateResumePdfController)

module.exports = interviewRouter
// its two major works are:
// -> to initiate server 
// -> all middlewares, routes, apis that we create are used here

const express = require("express");

const app = express();

const cookieParser = require('cookie-parser')

const cors = require('cors')

app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
})
)

// require all the routes here
const authRouter = require("../routes/auth.route")
const interviewRouter = require("../routes/interview.routes")

// using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;
// all logic that how a user will register written here
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require('../models/blacklist.model')

/**
 * @name registerUserController
 * @description Register a new user, expects username, email, password in the request body
 * @access Public
 */

async function registerUserController(req, res) {

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "please provide username, email and password"
    })
  }
  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }]
  })
  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "Account already exists with this email or username"
    })
  }

  const hash = await bcrypt.hash(password, 10)

  const user = await userModel.create({
    username,
    email,
    password: hash
  })

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" })

  res.cookie("token", token)


  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}

/** @name: loginUserController
 * @description:login a user, expects email and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
  const { email, password } = req.body;

  // now check either this account even exists or not 

  const user = await userModel.findOne({ email })

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password"
    })
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.password)

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password"
    })
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.cookie("token", token)
  res.status(200).json({
    message: "User loggedIn successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add token in the blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
  const token = req.cookies.token

  if (token) {
    await tokenBlacklistModel.create({ token })
  }

  res.clearCookie("token")

  res.status(200).json({
    message: "User logged out successfully"
  })
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access private
 */
async function getMeController(req, res) {

  const user = await userModel.findById(req.user.id)

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}
module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }
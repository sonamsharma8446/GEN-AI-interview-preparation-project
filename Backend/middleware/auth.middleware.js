const jwt = require("jsonwebtoken")
const blacklistModel = require('../models/blacklist.model')
const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({
      message: "Token not provided."
    })
  }

  const isTokeBlackListed = await tokenBlacklistModel.findOne({token})

  if(isTokeBlackListed){
    return res.status(401).json({
      message:"token is invalid"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token."
    })
  }

}

module.exports = { authUser }
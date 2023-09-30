const { PrismaClient } = require("@prisma/client");
let { timestampNow } = require("../utility/time");
let { hashPassword, comparePassword } = require("../utility/password");
let { getToken, exposeToken } = require("../utility/jwt");

const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({
      message: "Unauthorized",
    });
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const userEmail = decodedToken.email;
      const foundUser = await prisma.user.findFirst({
        where:{
            email:userEmail,
            isActive:true
        }
      })
      
      if (!foundUser) {
        throw "Invalid token";
      } else {
        next();
      }

    } catch (err) {
      res.status(401).json({
        message: err.message,
      });
    }
  }
};

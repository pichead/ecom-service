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
      const userUsername = decodedToken.username;
      const userPassword = decodedToken.password;
      
      if (decodedToken.role === "client" && userEmail && userPassword && userUsername) {
        const foundUser = await prisma.user.findFirst({
          where: {
            email: userEmail,
            username:userUsername,
            isActive: true,
            password: userPassword,
          },
        });
        if (foundUser) {
          next();
        } else {
          throw "Invalid token";
        }
      } else {
        throw "Invalid token";
      }
    } catch (err) {
      res.status(401).json({
        message: "can not validate token",
      });
    }
  }
};

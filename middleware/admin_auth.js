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
      const username = decodedToken.username;
      const password = decodedToken.password;
      const role = decodedToken.role;


      if (role === "admin" ) {

        const foundUser = await prisma.admin.findUnique({
          where: {
            username: username,
          },
        });
        
        if (foundUser && foundUser.username === username && foundUser.password === password && foundUser.role === role) {
          next();
        } else {
          throw "Invalid token";
        }

      } else {
        throw "Invalid token";
      }

    } catch (err) {
      res.status(401).json({
        message: "system error",
      });
    }
  }
};

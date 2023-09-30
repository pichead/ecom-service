const { PrismaClient } = require("@prisma/client");
// import { hashPassword,timestampNow,comparePassword,getToken,exposeToken } from 'utils';
let { timestampNow } = require("../utility/time");
let { hashPassword, comparePassword } = require("../utility/password");
let { getToken, exposeToken } = require("../utility/jwt");
const multer = require("multer");
const admin_auth = require("../middleware/admin_auth");
const client_auth = require("../middleware/client_auth");
const auth = require("../middleware/auth");
let axios = require("axios");
let sanitizeHtml = require("sanitize-html");
const { v4: uuidv4 } = require("uuid");
const qs = require("qs");
let { mailNoti, mailNotiCloseTicket } = require("../utility/html");
let nodemailer = require("nodemailer");

const IncidentLineNotiToken = process.env.LINE_NOTI_TOKEN;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./file/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, `${Math.round(Date.now() / 1000)}_${uuidv4()}.${file.originalname.match(/\.(.*?)$/)[1]}`);
  },
});
const upload = multer({ storage });

var express = require("express");
var router = express.Router();
const prisma = new PrismaClient();

// create client
router.post("/create", async function (req, res, next) {
  try {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;


    let findUser = await prisma.user.findUnique({
      where: {
        email: email,
        username:username
      },
    });
    if (!findUser) {
      let hash = await hashPassword(password);
      let createClient = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hash,
        },
      });

      if (createClient) {
        await prisma.$disconnect();
        res.status(200).send({
          statusCode: 200,
          message: "Success failed creating user",
          messageTH: "สร้าง user สำเร็จ",
          data: createClient,
        });
        return;
      } else {
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error failed creating user",
          messageTH: "สร้าง user ไม่สำเร็จ",
        });
        return;
      }
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error user already exists",
        messageTH: "user คนนี้ถูกสร้างแล้ว",
      });
      return;
    }
  } catch (error) {
    await prisma.$disconnect();
    console.log(error)
    res.status(400).json({
      message: "system error",
    });
    return;
  }
});
// end create client

// client login
router.post("/login", async function (req, res, next) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    let findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(findUser)
    if (findUser && findUser.isActive === true) {
      let compare = await comparePassword(password, findUser.password);
      if (compare) {
        let token = await getToken({
          id: findUser.id,
          email: findUser.email,
          username: findUser.username,
          password: findUser.password,
          role: findUser.role,
          permissions: findUser.permissions,
          isActive: findUser.isActive,
        });

        if (token) {
          await prisma.$disconnect();
          res.status(200).send({
            statusCode: 200,
            message: "Success login",
            messageTH: "login สำเร็จ",
            data: token,
          });
          return;
        } else {
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error generating token",
            messageTH: "สร้าง token ไม่สำเร็จ",
          });
          return;
        }
      } else {
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error wrong username or password",
          messageTH: "username หรือ password ไม่ถูกต้อง",
        });
        return;
      }
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error wrong username or password",
        messageTH: "username หรือ password ไม่ถูกต้อง",
      });
      return;
    }
  } catch (error) {
    await prisma.$disconnect();
    res.status(400).json({
      message: "system error",
    });
    return;
  }
});
// end client login

// client login
router.get("/validate", client_auth, async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await exposeToken(token);
    const foundClient = await prisma.user.findUnique({
      where: {
        username: decodedToken.username,
        email: decodedToken.email
      },
    });

    if(foundClient){
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success validate",
        messageTH: "ตรวจสอบ user สำเร็จ",
        data:foundClient
      });
      return;
    }
    else{
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error validate",
        messageTH: "ตรวจสอบ user ไม่สำเร็จ",
      });
      return;
    }

  } catch (error) {
    await prisma.$disconnect();
    console.log(error);
    res.status(400).json({
      message: "system error",
    });
    return;
  }
});
// end client login



module.exports = router;

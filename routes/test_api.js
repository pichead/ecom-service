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
    cb(
      null,
      `${Math.round(Date.now() / 1000)}_${uuidv4()}.${
        file.originalname.match(/\.(.*?)$/)[1]
      }`
    );
  },
});
const upload = multer({ storage: storage });

const uploadFirebase = multer({ storage: multer.memoryStorage() });

var express = require("express");
const { saveFiles, testSave,testCheck } = require("../utility/firebase/storage");
var router = express.Router();
const prisma = new PrismaClient();

// create admin
router.post(
  "/test_save",
  uploadFirebase.array("softwareFile"),
  async function (req, res, next) {
    try {
      let fileSoftware = req.files;

      const uploadFile = await testSave(fileSoftware);

      if (uploadFile) {
        
        // console.log("uploadFile : ",uploadFile)
        res.status(200).send(uploadFile)

      } else {
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error upload file",
          messageTH: "upload file ไม่สำเร็จ",
        });
        return;
      }

    } catch (error) {
      await prisma.$disconnect();
      console.log("error : ", error);
      res.status(400).json({
        message: "system error",
      });
      return;
    }
  }
);
// end create admin

router.get(
  "/storage-check",
  async function (req, res, next) {
    try {
      let testCheck = await testCheck();
      console.log("testCheck : ",testCheck)
      res.status(200).send("ok")

    } catch (error) {
      await prisma.$disconnect();
      console.log("error : ", error);
      res.status(400).json({
        message: "system error",
      });
      return;
    }
  }
);

module.exports = router;

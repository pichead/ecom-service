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
const { saveFiles } = require("../utility/firebase/storage");
var router = express.Router();
const prisma = new PrismaClient();

// create admin
router.post(
  "/create",
  admin_auth,
  uploadFirebase.array("softwareFile"),
  async function (req, res, next) {
    try {
      let name = req.body.name;
      let shortName = req.body.shortName;
      let shortDes = req.body.shortDes;
      let des = req.body.des;
      let vdoLink = req.body.vdoLink;
      let fileSoftware = req.files;

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const foundAdmin = await prisma.admin.findUnique({
        where: {
          username: decodedToken.username,
        },
      });

      if (foundAdmin) {
        const uploadFile = await saveFiles(fileSoftware);

        if (uploadFile) {
          let uploadres = uploadFile[0];

          let createSoftware = async () => {
            try {
              let data = await prisma.store_software_rent.create({
                data: {
                  name: undefined,
                  shortName: shortName,
                  shortDes: shortDes,
                  des: des,
                  vdoLink: vdoLink,
                  downloadUrl: uploadres.src,
                  downloadName: uploadres.name,
                  adminId: foundAdmin.id,
                },
              });
              return data;
            } catch (error) {
              console.log("return")
              return null;
            }
          };

          if (createSoftware()) {
            await prisma.$disconnect();
            res.status(200).send({
              statusCode: 200,
              message: "Success create new software rent",
              messageTH: "สร้าง software rent สำเร็จ",
              data: createNewSoftware,
            });
            return;
          } else {
            await prisma.$disconnect();
            res.status(400).send({
              statusCode: 400,
              message: "Error create new software rent",
              messageTH: "สร้าง software rent ไม่สำเร็จ",
            });
            return;
          }
        } else {
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error upload file",
            messageTH: "upload file ไม่สำเร็จ",
          });
          return;
        }
      } else {
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error admin not found",
          messageTH: "ยืนยันตัวตนไม่สำเร็จ",
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

// admin login
router.post("/login", async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let findUser = await prisma.admin.findUnique({
      where: {
        username: username,
      },
    });

    if (findUser && findUser.isActive === true) {
      let compare = await comparePassword(password, findUser.password);
      if (compare) {
        let token = await getToken({
          id: findUser.id,
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
// end admin login

// admin login
router.get("/validate", admin_auth, async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await exposeToken(token);
    const foundAdmin = await prisma.admin.findUnique({
      where: {
        username: decodedToken.username,
      },
    });

    if (foundAdmin) {
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success validate",
        messageTH: "ตรวจสอบ user สำเร็จ",
        data: foundAdmin,
      });
      return;
    } else {
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
// end admin login

module.exports = router;

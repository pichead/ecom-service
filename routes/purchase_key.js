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

const LineNotiToken = process.env.LINE_NOTI_TOKEN;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./file/store");
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
const upload = multer({ storage });

var express = require("express");
var router = express.Router();
const prisma = new PrismaClient();

// create store key by admin
router.post("/create-order", client_auth, async function (req, res, next) {
  try {
    let StoreKeyId = parseInt(req.body.id);
    let amount = parseInt(req.body.amount);
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await exposeToken(token);
    const foundClient = await prisma.user.findUnique({
      where: {
        username: decodedToken.username,
        email: decodedToken.email,
      },
    });

    if (foundClient) {
      let creditAmount = foundClient.credit;

      let findStoreKey = await prisma.store_key.findUnique({
        where: {
          id: StoreKeyId,
        },
        include: {
          store_has_key: {
            where: {
              isActive: true,
            },
          },
        },
      });

      if (
        findStoreKey &&
        creditAmount >= findStoreKey.price * amount &&
        amount <= findStoreKey.store_has_key.length
      ) {

        let listKeyArr = findStoreKey.store_has_key
        .slice(0, amount)
        .map((data) => data.id);

        let updateCredit = await prisma.user.update({
          where: {
            id: foundClient.id,
          },
          data: {
            credit: creditAmount - findStoreKey.price * amount,
          },
        });

        let updateCreditTransaction = await prisma.credit_transaction.create({
          data: {
            userId: foundClient.id,
            type: "reduce",
            credit: findStoreKey.price * amount,
            detail: `reduce by purchase in key store , id of product key is ${listKeyArr.toString()}`,
            remark: "operation by system",
          },
        });

        let updateKeyToUser = await prisma.store_has_key.updateMany({
          where: {
            id: { in: listKeyArr },
          },
          data:{
            userId:foundClient.id,
            isActive: false,
          }
        });


        if(updateCredit && updateCreditTransaction && updateKeyToUser){
          await prisma.$disconnect();
          res.status(200).send({
            statusCode: 200,
            message: "Success purchase item",
            messageTH: "การสั่งซื้อสำเร็จ",
            data:{
              updateKeyToUser
            }
          });
          return;
        }
        else{


          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error purchase not complete, please contact admin",
            messageTH: "การสั่งซื้อล้มเหลว กรุณาติดต่อ admin",
          });
          return;
        }

      } else {
        console.log("findStoreKey : ",findStoreKey)
        console.log("creditAmount ",creditAmount)
        console.log("findStoreKey.price * amount ",findStoreKey.price * amount)
        console.log("creditAmount >= findStoreKey.price * amount : ",creditAmount >= findStoreKey.price * amount)
        console.log("amount < findStoreKey.store_has_key.length : ",amount <= findStoreKey.store_has_key.length)
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error not enough products or not enough credit",
          messageTH: "สินค้ามีไม่เพียงพอ หรือ เครดิตมีไม่เพียงพอ",
        });
        return;
      }
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error user not found",
        messageTH: "ไม่พบ user",
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
// end create store key by admin

module.exports = router;

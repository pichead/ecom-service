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
// const upload = multer({ storage });
const uploadFirebase = multer({ storage: multer.memoryStorage() });

const { saveFiles } = require("../utility/firebase/storage");

var express = require("express");
var router = express.Router();
const prisma = new PrismaClient();

// create store key
router.post(
  "/create",
  admin_auth,
  uploadFirebase.array("Img"),
  async function (req, res, next) {
    try {
      let name = req.body.name;
      let shortDes = req.body.shortDes;
      let des = req.body.des;
      let filesimg = req.files;
      let vdoLink = req.body.vdoLink;
      let price = parseFloat(req.body.price);
      let time = parseInt(req.body.time);

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const foundAdmin = await prisma.admin.findUnique({
        where: {
          username: decodedToken.username,
        },
      });


      if (foundAdmin) {

        let imgArr = await saveFiles(filesimg)

        let createStoreKey = await prisma.store_key.create({
          data: {
            name: name,
            adminId: foundAdmin.id,
            shortDes: shortDes,
            des: des,
            imgArr: imgArr,
            vdoLink: vdoLink,
            price: price,
            time:time
          },
        });

        if (createStoreKey) {
          await prisma.$disconnect();
          res.status(200).send({
            statusCode: 200,
            message: "Success create new product",
            messageTH: "สร้าง product ใหม่ไม่สำเร็จ",
            data: createStoreKey,
          });
          return;
        } else {
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error create new product",
            messageTH: "สร้าง product ใหม่ไม่สำเร็จ",
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
  }
);
// end create store key

// create store key
router.put(
  "/update",
  admin_auth,
  async function (req, res, next) {
    try {
      let id = parseFloat(req.body.id)
      let name = req.body.name;
      let shortDes = req.body.shortDes;
      let des = req.body.des;
      let vdoLink = req.body.vdoLink;
      let price = parseFloat(req.body.price);

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const foundAdmin = await prisma.admin.findUnique({
        where: {
          username: decodedToken.username,
        },
      });


      if (foundAdmin) {

        let updateStoreKey = await prisma.store_key.update({
          where:{
            id:id
          },
          data: {
            name: name,
            adminId: foundAdmin.id,
            shortDes: shortDes,
            des: des,
            vdoLink: vdoLink,
            price: price,
          },
        });

        if (updateStoreKey) {
          await prisma.$disconnect();
          res.status(200).send({
            statusCode: 200,
            message: "Success update product",
            messageTH: "update product สำเร็จ",
            data: updateStoreKey,
          });
          return;
        } else {
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error update product",
            messageTH: "update product ไม่สำเร็จ",
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
  }
);
// end create store key


// remove img store key
router.put(
  "/remove_img",
  admin_auth,
  async function (req, res, next) {
    try {
      let id = parseFloat(req.body.id)
      let nameImg = req.body.nameImg;

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const foundAdmin = await prisma.admin.findUnique({
        where: {
          username: decodedToken.username,
        },
      });


      if (foundAdmin) {

        let findStoreKey = await prisma.store_key.findUnique({
          where:{
            id:id
          },
        });

        if(findStoreKey){
          let removeimg = findStoreKey.imgArr.filter((data)=>(data.name !== nameImg))

          let update = await prisma.store_key.update({
            where:{
              id:id
            },
            data:{
              imgArr:removeimg
            }
          });

          if(update){
            await prisma.$disconnect();
            res.status(200).send({
              statusCode: 200,
              message: "Success store update img",
              messageTH: "update รูป store สำเร็จ",
              data:update
            });
            return;
          }
          else{
            await prisma.$disconnect();
            res.status(400).send({
              statusCode: 400,
              message: "Error store update",
              messageTH: "update store ไม่สำเร็จ",
            });
            return;
          }

        }
        else{
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error store not found",
            messageTH: "ไม่พบ store",
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
  }
);
// end remove img store key

// add img store key
router.put(
  "/add_img",
  admin_auth,
  uploadFirebase.array("Img"),
  async function (req, res, next) {
    try {
      let id = parseFloat(req.body.id)
      let filesimg = req.files;

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await exposeToken(token);
      const foundAdmin = await prisma.admin.findUnique({
        where: {
          username: decodedToken.username,
        },
      });


      if (foundAdmin) {

        let findStoreKey = await prisma.store_key.findUnique({
          where:{
            id:id
          },
        });

        if(findStoreKey){
          let lenOld = 8 - findStoreKey.imgArr.length

          let imgArr = await saveFiles(filesimg.slice(0,lenOld))
          let update = await prisma.store_key.update({
            where:{
              id:id
            },
            data:{
              imgArr:[...findStoreKey.imgArr,...imgArr]
            }
          });

          if(update){
            await prisma.$disconnect();
            res.status(200).send({
              statusCode: 200,
              message: "Success store update img",
              messageTH: "update รูป store สำเร็จ",
              data:update
            });
            return;
          }
          else{
            await prisma.$disconnect();
            res.status(400).send({
              statusCode: 400,
              message: "Error store update",
              messageTH: "update store ไม่สำเร็จ",
            });
            return;
          }

        }
        else{
          await prisma.$disconnect();
          res.status(400).send({
            statusCode: 400,
            message: "Error store not found",
            messageTH: "ไม่พบ store",
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
  }
);
// end add img store key

// create store key by admin
router.get("/findall", admin_auth, async function (req, res, next) {
  try {
    let getAllStoreKey = await prisma.store_key.findMany({
      include: {
        store_has_key: {
          include: {
            user: true,
          },
        },
        admin: true,
      },
    });

    if (getAllStoreKey) {
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success get all key store",
        messageTH: "ดึงข้อมูล key store สำเร็จ",
        data: getAllStoreKey,
      });
      return;
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error failed to get key store",
        messageTH: "ดึงข้อมูล key store ไม่สำเร็จ",
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
// end create store key by admin

// create store key by admin
router.get("/findone/:id", admin_auth, async function (req, res, next) {

  let id = parseInt(req.params.id);

  try {oneStoreKey = await prisma.store_key.findUnique({
      where:{
        id: id,
      },
      include: {
        store_has_key: {
          include: {
            user: true,
          },
        },
        admin: true,
      },
    });

    if (oneStoreKey) {
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success get one key store",
        messageTH: "ดึงข้อมูล key store สำเร็จ",
        data: oneStoreKey,
      });
      return;
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error failed to get key store",
        messageTH: "ดึงข้อมูล key store ไม่สำเร็จ",
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
// end create store key by admin

// add key to store key
router.post("/add_key", admin_auth, async function (req, res, next) {
  try {
    let store_keyId = parseInt(req.body.store_keyId);
    let key = req.body.key;
    let des = req.body.des;

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await exposeToken(token);
    const foundAdmin = await prisma.admin.findUnique({
      where: {
        username: decodedToken.username,
      },
    });

    if (foundAdmin) {
      let hash = await getToken(key);

      let addNewKey = await prisma.store_has_key.create({
        data: {
          store_keyId: store_keyId,
          key: hash,
          des: des,
        },
      });

      if (addNewKey) {
        await prisma.$disconnect();
        res.status(200).send({
          statusCode: 200,
          message: "Success add new key",
          messageTH: "เพิ่ม key ใหม่ไม่สำเร็จ",
          data: addNewKey,
        });
        return;
      } else {
        await prisma.$disconnect();
        res.status(400).send({
          statusCode: 400,
          message: "Error add new key",
          messageTH: "เพิ่ม key ใหม่ไม่สำเร็จ",
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
// end add key to store key

// get all key store client
router.get("/get-all", async function (req, res, next) {
  try {
    let getAllStoreKey = await prisma.store_key.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            store_has_key: {
              where: {
                isActive: true,
              },
            },
          },
        },
        admin: {
          select: {
            fname: true,
            lname: true,
          },
        },
      },
    });

    if (getAllStoreKey) {
      console.log(getAllStoreKey)
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success get all key store1",
        messageTH: "ดึงข้อมูล key store สำเร็จ",
        data: getAllStoreKey,
      });
      return;
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error failed to get key store",
        messageTH: "ดึงข้อมูล key store ไม่สำเร็จ",
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
// end get all key store client

// get key store client by id
router.get("/get-one/:id", async function (req, res, next) {
  try {

    let store_keyId = parseInt(req.params.id)

    let getStoreKey = await prisma.store_key.findUnique({
      where: {
        id: store_keyId,
      },
      include: {
        _count: {
          select: {
            store_has_key: {
              where: {
                isActive: true,
              },
            },
          },
        },
        admin: {
          select: {
            fname: true,
            lname: true,
          },
        },
      },
    });

    if (getStoreKey) {
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success get key store",
        messageTH: "ดึงข้อมูล key store สำเร็จ",
        data: getStoreKey,
      });
      return;
    } else {
      await prisma.$disconnect();
      res.status(400).send({
        statusCode: 400,
        message: "Error failed to get key store",
        messageTH: "ดึงข้อมูล key store ไม่สำเร็จ",
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
// end get key store client by id

module.exports = router;

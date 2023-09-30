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

// create admin
router.post("/create", admin_auth, async function (req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let findUser = await prisma.admin.findUnique({
      where: {
        username: username,
      },
    });

    if (!findUser) {
      let hash = await hashPassword(password);
      let createAdmin = await prisma.admin.create({
        data: {
          username: username,
          password: hash,
        },
      });

      if (createAdmin) {
        await prisma.$disconnect();
        res.status(200).send({
          statusCode: 200,
          message: "Success creating user",
          messageTH: "สร้าง user สำเร็จ",
          data: createAdmin,
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
    res.status(400).json({
      message: "system error",
    });
    return;
  }
});
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

    if(foundAdmin){
      await prisma.$disconnect();
      res.status(200).send({
        statusCode: 200,
        message: "Success validate",
        messageTH: "ตรวจสอบ user สำเร็จ",
        data:foundAdmin
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
// end admin login

// // create ticket
// router.post(
//   "/create",
//   auth,
//   upload.fields([{ name: "ticketfile", maxCount: 1 }]),
//   async function (req, res, next) {
//     try {
//       let filename = req.files.ticketfile
//         ? req.files.ticketfile[0].filename
//         : null;
//       let path = req.files.ticketfile ? req.files.ticketfile[0].path : null;
//       let subject = req.body.subject;
//       let des = req.body.des;
//       let type = req.body.type;
//       let priority = req.body.priority;
//       let projectId = req.body.projectId ? parseInt(req.body.projectId) : null;
//       let assign = req.body.assign ? parseInt(req.body.assign) : null;
//       let status = req.body.status
//       const token = req.headers.authorization.split(" ")[1];
//       const decodedToken = await exposeToken(token);
//       let projectbyId = projectId
//         ? await prisma.project.findFirstOrThrow({
//           where: {
//             id: projectId,
//             visible: true,
//           },
//         })
//         : null;

//       let userhasproject = projectbyId ? await prisma.project_has_User.findMany({
//         where: {
//           projectId: projectbyId.id,
//           user: {
//             OR:[
//               {
//                 role: "admin",
//               },
//               {
//                 role: "superadmin",
//               }
//             ]

//           },
//         },
//       }) : null
//       let alluserInProject = userhasproject ? (userhasproject.map((data) => data.userId)) : []

//       if (alluserInProject && projectbyId) {
//         alluserInProject.push(projectbyId.adminId)
//       }

//       let checkAssign = assign ? alluserInProject.includes(assign) : null

//       let findUser = await prisma.user.findUnique({
//         where: {
//           email: decodedToken.email
//         }
//       })

//       let ticket = await prisma.ticket.create({
//         data: {
//           filename: filename,
//           path: path,
//           subject: subject,
//           des: des,
//           status:status,
//           statusHistory: [{ status: status, time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }],
//           type: type,
//           priority: priority,
//           userId: decodedToken.id,
//           projectId: projectbyId ? projectbyId.id : null,
//           assign: checkAssign ? assign : null
//         },
//         include:{
//           project:true
//         }
//       });

//       if (ticket && findUser) {
//         const year = new Date(ticket.createdAt).toLocaleString("en-EN", {
//           year: "2-digit",
//         });
//         const month = new Date(ticket.createdAt).toLocaleString("en-EN", {
//           month: "2-digit",
//         });
//         const ticketNumber =
//           "#" + year + month + ticket.id.toLocaleString().padStart(5, "0");

//         // const ticketNumber = "#".concat(ticket.id.toString().padStart(5, "0"));
//         const customerName = findUser.fname + ` ` + findUser.lname;
//         const datetime = (new Date()).toLocaleString();;
//         const problemDetails = ticket.subject;
//         const problemDetailsDes = sanitizeHtml(ticket.des, {
//           allowedTags: [], // Allow no HTML tags
//           allowedAttributes: {}, // Allow no attributes
//         });;
//         const project = ticket.project.projectname

//         const message = `แจ้งปัญหาใหม่ 🆘\n\n` +
//           `หมายเลข Ticket: ${ticketNumber}\n` +
//           `ผู้แจ้ง: ${customerName}\n` +
//           `วันที่และเวลา: ${datetime}\n\n` +
//           `ปัญหา:\n${problemDetails}\n\n` +
//           `รายละเอียด:\n${problemDetailsDes}\n\n` +
//           `โปรเจค:\n${project}\n\n` +
//           `Link:\n${"https://incident-web.perfectcomsolutions.com/ticket/"+ticket.id}\n\n` +

//           `กรุณาตรวจสอบและแก้ไขปัญหาด้วยค่ะ 🙏`;

//         let data = qs.stringify({
//           'message': message
//         });

//         let config = {
//           method: 'post',
//           maxBodyLength: Infinity,
//           url: 'https://notify-api.line.me/api/notify',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': 'Bearer ' + IncidentLineNotiToken
//           },
//           data: data
//         };

//         const to = 'weare33we@gmail.com';
//         const subject = "New Ticket Open!";
//         const text = "New Ticket Open!";

//         const transporter = nodemailer.createTransport({
//           host: 'smtp.gmail.com',
//           port: 465,
//           secure: true,
//           auth: {
//             user: 'weare33we@gmail.com',
//             pass: 'kixuncfkcljlbsig',
//           },
//         });

//         const messageMail = {
//           from: '"NoreplyIncident" <weare33we@gmail.com>',
//           to,
//           subject,
//           text,
//           html: mailNoti({ subject: problemDetails, date: datetime, custumer: customerName, id: ticketNumber }),
//         };

//         let resmail = await transporter.sendMail(messageMail);
//         let resLine = await axios(config);
//         await prisma.$disconnect();
//         res.status(200).send({
//           statusCode: 200,
//           message: "Success create ticket",
//           messageTH: "สร้าง ticket สำเร็จ",
//           data: ticket,
//           noti: resLine.status == 200 ? "ok" : "error",
//           mail: resmail.response ? "ok" : "error"

//         });
//         return;
//       } else {
//         await prisma.$disconnect();
//         res.status(400).send({
//           statusCode: 400,
//           message: "Error create ticket",
//           messageTH: "สร้าง ticket ไม่สำเร็จ",
//         });
//         return;
//       }

//     } catch (error) {
//       await prisma.$disconnect();
//       console.log(error);
//       res.status(400).send("system error");
//       return;
//     }
//   }
// );
// // end create ticket

// // edit ticket
// router.put("/edit", admin_auth, upload.fields([{ name: "completeFile", maxCount: 1 }]), async function (req, res, next) {
//   try {
//     let id = parseInt(req.body.id)
//     let subject = req.body.subject;
//     let des = req.body.des;
//     let assign = req.body.assign ? parseInt(req.body.assign) : null;
//     let type = req.body.type;
//     let priority = req.body.priority;
//     let status = req.body.status
//     let projectId = req.body.projectId ? parseInt(req.body.projectId) : null;

//     let completeFileName = req.files.completeFile
//       ? req.files.completeFile[0].filename
//       : null;
//     let completePath = req.files.completeFile ? req.files.completeFile[0].path : null;
//     let completeDes = req.body.completeDes?req.body.completeDes:null
//     let completeCause = req.body.completeCause?req.body.completeCause:null
//     let completeSolution = req.body.completeSolution?req.body.completeSolution:null

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);
//     let projectbyId = projectId
//       ? await prisma.project.findFirstOrThrow({
//         where: {
//           id: projectId,
//           visible: true,
//         },
//       })
//       : null;

//     let findTicket = await prisma.ticket.findFirst({
//       where: {
//         id: id
//       }
//     })

//     if (findTicket) {
//       if (projectbyId) {
//         let userhasproject = await prisma.project_has_User.findMany({
//           where: {
//             projectId: projectbyId.id,
//             user: {
//               OR:[
//                 {
//                   role: "admin",
//                 },
//                 {
//                   role: "superadmin",
//                 }
//               ]
//             },
//           },
//         })
//         let alluserInProject = (userhasproject.map((data) => data.userId))
//         alluserInProject.push(projectbyId.adminId)

//         let checkAssign = assign ? alluserInProject.includes(assign) : null

//         let updateData = {
//           subject: subject,
//           des: des,
//           assign: checkAssign ? assign : undefined,
//           type: type,
//           projectId: projectbyId.id,
//           priority: priority,
//           status: status,
//           statusHistory: findTicket.statusHistory ? [...findTicket.statusHistory, { status: status, time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }] : [{ status: status, time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }]
//         };

//         if (completeFileName) {
//           updateData.completeFileName = completeFileName;
//         }

//         if (completePath) {
//           updateData.completePath = completePath;
//         }

//         if (completeDes) {
//           updateData.completeDes = completeDes;
//         }

//         if (completeCause) {
//           updateData.completeCause = completeCause;
//         }

//         if (completeSolution) {
//           updateData.completeSolution = completeSolution;
//         }

//         let ticket = await prisma.ticket.update({
//           where: {
//             id: id
//           },
//           data: updateData,
//         });

//         if (ticket) {
//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success update ticket",
//             messageTH: "อัพเดต ticket สำเร็จ",
//             data: ticket,
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error update ticket",
//             messageTH: "อัพเดต ticket ไม่สำเร็จ"
//           });
//           return;
//         }

//       }
//       else {
//         let ticket = await prisma.ticket.update({
//           where: {
//             id: id
//           },
//           data: {
//             subject: subject,
//             des: des,
//             assign: null,
//             type: type,
//             projectId: null,
//             priority: priority,
//             status: status,
//             statusHistory: findTicket.statusHistory?[...findTicket.statusHistory, { status: status, time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }]:[{ status: status, time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }],
//             completeFileName:completeFileName,
//             completePath:completePath,
//             completeDes:completeDes,
//             completeCause:completeCause,
//             completeSolution:completeSolution
//           },
//         });

//         if (ticket) {
//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success update ticket",
//             messageTH: "อัพเดต ticket สำเร็จ",
//             data: ticket,
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error update ticket",
//             messageTH: "อัพเดต ticket ไม่สำเร็จ"
//           });
//           return;
//         }
//       }
//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error ticket not found",
//         messageTH: "ไม่พบ ticket"
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end edit ticket

// // edit ticket
// router.put("/close", auth, async function (req, res, next) {
//   try {
//     let id = parseInt(req.body.id)

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);
//     let findUser = await prisma.user.findUnique({
//       where: {
//         email: decodedToken.email
//       }
//     })

//     let findTicket = await prisma.ticket.findFirst({
//       where: {
//         id: id,
//         userId: decodedToken.id
//       },
//       include:{
//         project:true
//       }
//     })

//     if (findTicket) {
//       let closeTicket = await prisma.ticket.update({
//         where: {
//           id: findTicket.id,
//         },
//         data: {
//           status: "closed",
//           statusHistory: findTicket.statusHistory?[...findTicket.statusHistory, { status: "closed", time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }]:[{ status: "closed", time: Math.floor(Date.now() / 1000), updateBy: decodedToken.id }],
//         }
//       })

//       if (closeTicket && findUser) {

//           const year = new Date(closeTicket.createdAt).toLocaleString("en-EN", {
//             year: "2-digit",
//           });
//           const month = new Date(closeTicket.createdAt).toLocaleString("en-EN", {
//             month: "2-digit",
//           });
//           const ticketNumber =
//             "#" + year + month + closeTicket.id.toLocaleString().padStart(5, "0");

//           const customerName = findUser.fname + ` ` + findUser.lname;
//           const datetime = (new Date()).toLocaleString();;
//           const problemDetails = closeTicket.subject;
//           const problemDetailsDes = sanitizeHtml(closeTicket.des, {
//             allowedTags: [], // Allow no HTML tags
//             allowedAttributes: {}, // Allow no attributes
//           });;
//           const project = findTicket.project.projectname

//           const message = `แจ้งปิด Ticket ✅\n\n` +
//             `หมายเลข Ticket: ${ticketNumber}\n` +
//             `ผู้แจ้ง: ${customerName}\n` +
//             `วันที่และเวลา: ${datetime}\n\n` +
//             `ปัญหา:\n${problemDetails}\n\n` +
//             `รายละเอียด:\n${problemDetailsDes}\n\n` +
//             `โปรเจค:\n${project}\n\n` +
//             `Link:\n${"https://incident-web.perfectcomsolutions.com/ticket/"+closeTicket.id}\n\n` +
//             `Rootcause:\n${closeTicket.completeCause}\n\n` +
//             `Workaround:\n${closeTicket.completeDes}\n\n` +
//             `Solutions:\n${closeTicket.completeSolution}\n\n` +

//             `ปัญหานี้ถูกแก้ไขเรียบร้อย 🙏`;

//         let data = qs.stringify({
//           'message': message
//         });

//         let config = {
//           method: 'post',
//           maxBodyLength: Infinity,
//           url: 'https://notify-api.line.me/api/notify',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': 'Bearer ' + IncidentLineNotiToken
//           },
//           data: data
//         };

//         const to = 'weare33we@gmail.com';
//         const subject = "Ticket Close!";
//         const text = "Ticket Close!";

//         const transporter = nodemailer.createTransport({
//           host: 'smtp.gmail.com',
//           port: 465,
//           secure: true,
//           auth: {
//             user: 'weare33we@gmail.com',
//             pass: 'kixuncfkcljlbsig',
//           },
//         });

//         const messageMail = {
//           from: '"NoreplyIncident" <weare33we@gmail.com>',
//           to,
//           subject,
//           text,
//           html: mailNotiCloseTicket({ subject: problemDetails, date: datetime, custumer: customerName, id: ticketNumber }),
//         };

//         let resmail = await transporter.sendMail(messageMail);
//         let resLine = await axios(config);

//         await prisma.$disconnect();
//         res.status(200).send({
//           statusCode: 200,
//           message: "Success close ticket",
//           messageTH: "ปิด ticket สำเร็จ",
//           data: closeTicket,
//           noti: resLine.status == 200 ? "ok" : "error",
//           mail: resmail.response ? "ok" : "error"
//         });
//         return;
//       }
//       else {
//         await prisma.$disconnect();
//         res.status(400).send({
//           statusCode: 400,
//           message: "Error close ticket",
//           messageTH: "ปิด ticket ไม่สำเร็จ",
//         });
//         return;
//       }

//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error ticket not found",
//         messageTH: "ค้นหา ticket ไม่สำเร็จ",
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end edit ticket

// // find all ticket in project
// router.get("/findall-project", auth, async function (req, res, next) {
//   try {

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);

//     if (decodedToken) {
//       let findallProject = await prisma.project.findMany({
//         where: {
//           adminId: decodedToken.id,
//         },
//         include: {
//           ticket: true
//         }
//       })

//       let findallProjectUser = await prisma.project_has_User.findMany({
//         where: {
//           userId: decodedToken.id,
//         },
//         select: {
//           project: {
//             include: {
//               ticket: true,
//             },
//           },
//         }
//       })

//       let allProject = [...findallProject.map((data) => data), ...findallProjectUser.map((data) => data.project)]

//       let uniqueProject = Array.from(new Set(allProject.map(obj => obj.id))).map(id => allProject.find(obj => obj.id === id));

//       if (uniqueProject && findallProjectUser) {
//         await prisma.$disconnect();
//         res.status(200).send({
//           statusCode: 200,
//           message: "Success findall ticket",
//           messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//           data: decodedToken.role === "admin" ? uniqueProject : findallProjectUser,
//         });
//         return;
//       }
//       else {
//         await prisma.$disconnect();
//         res.status(400).send({
//           statusCode: 400,
//           message: "Error findall ticket",
//           messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//         });
//         return;
//       }

//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error Token not valid",
//         messageTH: "ยินยัน token ไม่สำเร็จ",
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end find all ticket in project

// // find one ticket in project
// router.get("/findone-project/:id", auth, async function (req, res, next) {
//   try {
//     let id = parseInt(req.params.id);
//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);

//     if (decodedToken) {
//       let findProject = await prisma.project.findFirst({
//         where: {
//           id: id,
//           adminId: decodedToken.id,
//         },
//         include: {
//           ticket: true
//         }
//       })

//       let findallProjectUser = await prisma.project_has_User.findFirst({
//         where: {
//           projectId: id,
//           userId: decodedToken.id,

//         },
//         select: {
//           project: {
//             include: {
//               ticket: true,
//             },
//           },
//         }
//       })

//       if (findProject || findallProjectUser) {
//         await prisma.$disconnect();
//         res.status(200).send({
//           statusCode: 200,
//           message: "Success findall ticket",
//           messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//           data: decodedToken.role == "admin" ? (findProject ? findProject : findallProjectUser.project) : findallProjectUser.project
//         });
//         return;
//       }
//       else {
//         await prisma.$disconnect();
//         res.status(400).send({
//           statusCode: 400,
//           message: "Error findall ticket",
//           messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//         });
//         return;
//       }

//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error Token not valid",
//         messageTH: "ยินยัน token ไม่สำเร็จ",
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end find one ticket in project

// // find all ticket
// router.get("/findall", auth, async function (req, res, next) {
//   try {

//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);

//     if (decodedToken) {

//       if (decodedToken.role == "admin" || decodedToken.role == "superadmin") {
//         let findallTicket = await prisma.ticket.findMany({
//           include: {
//             user: true,
//             admin: true,
//             project: true,
//             Answer: true,
//           }
//         });

//         if (findallTicket) {
//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//             data: findallTicket
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//           });
//           return;
//         }

//       }
//       else {
//         let findallTicket = await prisma.ticket.findMany({
//           where: {
//             userId: decodedToken.id
//           },
//           include: {
//             user: true,
//             project: true,
//             Answer: true,
//           }
//         })

//         if (findallTicket) {
//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//             data: findallTicket
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//           });
//           return;
//         }

//       }

//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error Token not valid",
//         messageTH: "ยินยัน token ไม่สำเร็จ",
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end find all ticket

// // find all ticket
// router.get("/findone/:id", auth, async function (req, res, next) {
//   try {
//     let id = parseInt(req.params.id);
//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = await exposeToken(token);

//     if (decodedToken) {

//       if (decodedToken.role == "admin" || decodedToken.role == "superadmin") {
//         let findallTicket = await prisma.ticket.findFirst({
//           where: {
//             id: id
//           },
//           include: {
//             user: true,
//             admin: true,
//             project: true,
//             Answer: true,
//           }
//         })

//         if (findallTicket) {

//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//             data: findallTicket
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//           });
//           return;
//         }

//       }
//       else {
//         let findallTicket = await prisma.ticket.findFirst({
//           where: {
//             userId: decodedToken.id,
//             id: id
//           },
//           include: {
//             user: true,
//             project: true,
//             Answer: true,
//           }
//         })

//         if (findallTicket) {
//           await prisma.$disconnect();
//           res.status(200).send({
//             statusCode: 200,
//             message: "Success find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด สำเร็จ",
//             data: findallTicket
//           });
//           return;
//         }
//         else {
//           await prisma.$disconnect();
//           res.status(400).send({
//             statusCode: 400,
//             message: "Error find all ticket",
//             messageTH: "ดึง ticket ทั้งหมด ไม่สำเร็จ",
//           });
//           return;
//         }

//       }

//     }
//     else {
//       await prisma.$disconnect();
//       res.status(400).send({
//         statusCode: 400,
//         message: "Error Token not valid",
//         messageTH: "ยินยัน token ไม่สำเร็จ",
//       });
//       return;
//     }

//   } catch (error) {
//     await prisma.$disconnect();
//     console.log(error);
//     res.status(400).send("system error");
//     return;
//   }
// }
// );
// // end find all ticket

module.exports = router;

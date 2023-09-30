var resetpassword = (linkReset) => {
  return `
  <html>
  
  <head>
    <title>Password Reset</title>
    <style>
    a {
      text-decoration:none  !important;
    }

    p {
      text-align: center !important;
    }

      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        text-align: center !important;
      }
  
      .container {
        max-width: 400px;
        margin: 0 auto;
        padding: 40px;
        background-color: #B3DDFC;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center !important;
      }
  
      h2 {
        color: #333;
      }
  
      .button-link {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: #fff !important;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }


  
      .button-link:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  
  <body>
    <div class="container">
      <h2>Reset passsword</h2>
      <p>คุณได้รับอีเมลนี้เนื่องจากคำขอรีเซ็ตรหัสผ่านบัญชีของคุณในเว็บไซต์ของเรา</p>
      <p>หากคุณไม่ได้ทำคำขอนี้ กรุณาเพิกเฉยต่ออีเมลนี้และไม่ต้องดำเนินการใด ๆ</p>
      <b>หากคุณต้องการรีเซ็ตรหัสผ่านของคุณ กรุณาคลิกที่ปุ่มด้านล่าง:</b>
      <br/>
      <br/>

      <a class="button-link" href="${linkReset}">Reset Password</a>
      <br/>
      <br/>

      <b>กรุณาเปลี่ยนรหัสผ่านภายใน 10 นาที ก่อน link จะหมดอายุ</b>
      <p>ขอบคุณที่ใช้บริการเรา!</p>
      <b>Incident</b>
      </div>
  </body>
  
  </html>
  `;
};


var mailNoti = (data) => {
  return `
  <html>
  
  <head>
    <title>Password Reset</title>
    <style>
    a {
      text-decoration:none  !important;
    }

    p {
      text-align: center !important;
    }

      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        text-align: center !important;
      }
  
      .container {
        max-width: 400px;
        margin: 0 auto;
        padding: 40px;
        background-color: #B3DDFC;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center !important;
      }
  
      h2 {
        color: #333;
      }
  
      .button-link {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: #fff !important;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }


  
      .button-link:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  
  <body>
    <div class="container">
      <h2>New Ticket!!</h2>
      <p>มี Ticket เปิดใหม่</p>
      <b>หมายเลข Ticket: ${data.id}</b>
      <p>รายละเอียดปัญหา : ${data.subject}</p>
      <p>ผู้แจ้ง : ${data.custumer}</b>
      <p>วันที่ : ${data.date}</b>
      <br/>
      <br/>
      <p>ขอบคุณที่ใช้บริการเรา!</p>
      <b>Incident</b>
    </div>
  </body>
  
  </html>
  `;
};

var mailNotiCloseTicket = (data) => {
  return `
  <html>
  
  <head>
    <title>Password Reset</title>
    <style>
    a {
      text-decoration:none  !important;
    }

    p {
      text-align: center !important;
    }

      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        text-align: center !important;
      }
  
      .container {
        max-width: 400px;
        margin: 0 auto;
        padding: 40px;
        background-color: #B3DDFC;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center !important;
      }
  
      h2 {
        color: #333;
      }
  
      .button-link {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: #fff !important;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }


  
      .button-link:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  
  <body>
    <div class="container">
      <h2>Close Ticket!</h2>
      <p>Ticket ถูกปิดแล้ว</p>
      <b>หมายเลข Ticket: ${data.id}</b>
      <p>รายละเอียดปัญหา : ${data.subject}</p>
      <p>ผู้แจ้ง : ${data.custumer}</b>
      <p>วันที่ : ${data.date}</b>
      <br/>
      <br/>
      <p>ขอบคุณที่ใช้บริการเรา!</p>
      <b>Incident</b>
    </div>
  </body>
  
  </html>
  `;
};

module.exports = {
  resetpassword,mailNoti,mailNotiCloseTicket
};

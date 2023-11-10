const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const Recaptcha = require("express-recaptcha").RecaptchaV2;
const cors = require("cors");
const requestIp = require("request-ip");

const upload = multer();
const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());

const recaptcha = new Recaptcha(
  "6Lddu_woAAAAAOGvRaBRgYvFM7Ww4Z8t-FCImy7v",
  "6Lddu_woAAAAAIKRkMbYjVfcxzmfbvcJUZDK_3hN"
);
// Middleware to parse JSON data
app.use(bodyParser.json());

// Use the express-ip middleware
app.use(requestIp.mw());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "no-reply@doublezero.ae",
    pass: "esal ebzc xshs slgx   ",
    name: "DoubleZero Form",
  },
});

// async..await is not allowed in global scope, must use a wrapper

app.post(
  "/send-mail",
  upload.none(),
  recaptcha.middleware.verify,
  async (req, res) => {
    console.log(req.body);
    try {
      if (!req.recaptcha.error) {
        // Handle recaptcha verification failure

        const { name, email, subject, message } = req.body;

        const remoteIp = req.clientIp;

        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: `DoubleZero Forms ${email}`, // sender address
          to: "info@doublezero.ae", // list of receivers
          subject: "Doublezero Forms", // Subject line
          // text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nPhone: ${phone}\nSubject: ${subject}`, // plain text body
          html: `
      <p>You have a new form submission on <a href="http://doublezero.ae/">DoubleZero</a></p> site. </p>
     
      <p>--------------------------------------------------------------------------</p>
      <p><strong>Name:</strong> ${name}</p><br/>
      <p><strong>Email:</strong> ${email}</p><br/>
      <p><strong>Message:</strong> ${message}</p><br/>
      <p><strong>Subject:</strong> ${subject}</p><br/>
      <p><strong>Remote IP:</strong> ${remoteIp}</p>
      
     <p>----------------------------------------------------------</p>
      <p>Designed by <a href="http://doublezero.ae/">DoubleZero</a></p>
    `, // html body
        });

        res.status(200).json(info);
      } else {
        // Handle recaptcha verification failure
        console.log(req.recaptcha.error);

        res.status(400).json({ error: "Failed recaptcha verification" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

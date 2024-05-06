const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const PORT = 3000;
const SECRET_TOKEN = "glpat-ruZ-sjP7nzsskfiqq7Up";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "v.arustomyan1996@gmail.com",
    pass: "xsga wgql bhrh pcqc",
  },
});

const mailOptions = (currentBranch, lastCommit) => ({
  from: "v.arustomyan1996@gmail.com",
  to: "task+3607@placebo25.planfix.ru",
  subject: `Ветка: ${currentBranch}`,
  text: `Коммит: 
  ${lastCommit}`,
});

// Логирование подключения
app.use((req, res, next) => {
  console.log(`Incoming request method: ${req.method}, URL: ${req.url}`);
  next();
});

// Парсинг тела запроса в формате JSON
app.use(bodyParser.json());

// Обработчик для POST-запросов на /gitlab-webhook
app.post("/gitlab-push-commit", (req, res) => {
  // Валидация подписи (если установлен секретный токен)
  const signature = req.headers["x-gitlab-token"];
  if (SECRET_TOKEN && signature !== SECRET_TOKEN) {
    console.error("Invalid token");
    return res.status(401).send("Invalid token");
  }

  // Парсинг JSON из тела запроса
  const payload = req.body;

  if (!payload) {
    console.error("Empty payload");
    return res.status(400).send("Empty payload");
  }

  // Обработка полученных данных
  console.log("Received webhook payload:", payload);

  payload.commits.forEach((element) => {
    transporter.sendMail(mailOptions(payload.ref, element.message), function (error, info) {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  });

  // Отправка ответа
  res.status(200).send("Webhook received successfully");
});

// Обработчик для всех остальных запросов
app.use((req, res) => {
  res.status(404).send("Not found");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

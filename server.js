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

// Логирование подключения
app.use((req, res, next) => {
  console.log(`Incoming request method: ${req.method}, URL: ${req.url}`);
  next();
});

// Парсинг тела запроса в формате JSON
app.use(bodyParser.json());

function extractTaskNumber(str) {
  const regex = /task\+(\d+)/;
  const match = str.match(regex);
  return match ? match[1] : null;
}

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

  const taskId = extractTaskNumber(payload.ref);

  payload.commits.forEach((commit) => {
    console.log({
      from: "v.arustomyan1996@gmail.com",
      to: `task+${taskId}@placebo25.planfix.ru`,
      subject: `Ветка: ${payload.ref}`,
      text: `
        Автор: ${payload.user_name}
        Дата: ${new Date(commit.timestamp).toLocaleString()}
        Cсылка: ${commit.url}
        Коммит:
        ${commit.message} `,
    });
    transporter.sendMail(
      {
        from: "v.arustomyan1996@gmail.com",
        to: `task+${taskId}@placebo25.planfix.ru`,
        subject: `Ветка: ${payload.ref}`,
        text: `
        Автор: ${payload.user_name}
        Дата: ${new Date("2024-05-07T01:34:11+03:00").toLocaleString()}
        Cсылка: ${commit.url}
        Коммит:
        ${commit.message} `,
      },

      function (error, info) {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      }
    );
  });

  // Отправка ответа
  res.status(200).send("Webhook received successfully");
});

const STATUS_MR = {
  close: "Закрыт",
  open: "Открыт",
};

app.post("/gitlab-create-mr", (req, res) => {
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

  const nameAuthor = payload.user.name;
  const branchName = payload.object_attributes.source_branch;
  const taskId = extractTaskNumber(payload.object_attributes.source_branch);
  const targetBranch = payload.object_attributes.target_branch;
  const titleMR = payload.object_attributes.title;
  const date = new Date(payload.object_attributes.created_at);

  const message = {
    from: "v.arustomyan1996@gmail.com",
    to: `task+${taskId}@placebo25.planfix.ru`,
    subject: `${
      STATUS_MR[payload.object_attributes.action] ||
      payload.object_attributes.action
    } MR: ${titleMR}`,
    text: `
        Автор: ${nameAuthor}
        Ветка: ${branchName}
        Дата: ${new Date(date).toLocaleString()}
        Cсылка: ${payload.object_attributes.url} `,
  };

  console.log(message);

  transporter.sendMail(message, function (error, info) {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });

  // Отправка ответа
  res.status(200).send("Webhook received successfully");
});

// Обработчик для всех остальных запросов
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.post("/any", (req, res) => {
  console.log(req);

  // Отправка ответа
  res.status(200).send("Webhook received successfully");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

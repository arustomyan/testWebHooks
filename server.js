const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const SECRET_TOKEN = "your_secret_token";

// Логирование подключения
app.use((req, res, next) => {
  console.log(`Incoming request method: ${req.method}, URL: ${req.url}`);
  next();
});

// Парсинг тела запроса в формате JSON
app.use(bodyParser.json());

// Обработчик для POST-запросов на /gitlab-webhook
app.post("/gitlab-webhook", (req, res) => {
  // Валидация подписи (если установлен секретный токен)
  // const signature = req.headers["x-gitlab-token"];
  // if (SECRET_TOKEN && signature !== SECRET_TOKEN) {
  //   console.error("Invalid token");
  //   return res.status(401).send("Invalid token");
  // }

  // Парсинг JSON из тела запроса
  const payload = req.body;

  // if (!payload) {
  //   console.error("Empty payload");
  //   return res.status(400).send("Empty payload");
  // }

  // Обработка полученных данных
  console.log("Received webhook payload:", payload);

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

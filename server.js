const express = require("express");
const app = express();
const PORT = 3000;

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Привет, мир!");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}!`);
});

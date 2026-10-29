const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productsRouter = require('./routes/products');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение кастомного логгера
app.use(logger);

// Статика для доступа к загруженным изображениям
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Подключение маршрутов
app.use('/api/products', productsRouter);

// Глобальный обработчик ошибок (всегда в конце)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
});
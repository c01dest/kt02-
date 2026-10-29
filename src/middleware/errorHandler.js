const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  // Перехват кривого JSON в теле запроса
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Некорректный формат JSON в теле запроса' });
  }

  // Ошибки загрузки файлов Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла превышает 2 МБ' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Разрешены только форматы JPEG и PNG') {
    return res.status(400).json({ error: err.message });
  }

  console.error(err.stack || err.message);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

module.exports = errorHandler;
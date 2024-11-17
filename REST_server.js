const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Файлы данных
const resultsFilePath = path.join(__dirname, 'results.json');
const relatedTermsFilePath = path.join(__dirname, 'related_terms.json');

// Вспомогательная функция для чтения JSON из файла
function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

// Middleware для отключения кеширования
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store'); // Запрещаем кеширование
  res.setHeader('Pragma', 'no-cache');        // Для старых браузеров
  res.setHeader('Expires', '0');              // Устанавливаем дату истечения в 0
  next();
});

// Маршрут для поиска по термину
app.get('/search', async (req, res) => {
  const startTime = Date.now(); // Начало измерения времени выполнения
  const term = req.query.term;

  if (!term) {
    return res.status(400).json({ error: 'Term parameter is required' });
  }

  try {
    // Загружаем результаты из файла
    const results = await readJsonFile(resultsFilePath);
    // Фильтруем по термину
    const filteredResults = results.filter(item => item.name.toLowerCase() === term.toLowerCase());

    const executionTime = Date.now() - startTime; // Вычисляем время выполнения запроса
    res.json({
      searchTerm: term,
      results: filteredResults,
      executionTimeMs: executionTime // Время выполнения запроса
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read results file' });
  }
});

// Маршрут для получения связанных терминов
app.get('/ml', async (req, res) => {
  const startTime = Date.now(); // Начало измерения времени выполнения
  const term = req.query.term; // Получаем параметр "term" из запроса

  if (!term) {
    return res.status(400).json({ error: 'Term parameter is required' });
  }
  try {
    console.log(`Reading related terms from file: ${relatedTermsFilePath}`);
    // Загружаем связанные термины из файла
    const relatedTerms = await readJsonFile(relatedTermsFilePath);
    console.log('Related terms loaded successfully');

    // Фильтруем связанные термины по запрашиваемому термину
    const filteredRelatedTerms = relatedTerms.filter(item => item.term.toLowerCase().includes(term.toLowerCase()));

    const executionTime = Date.now() - startTime; // Вычисляем время выполнения запроса
    res.json({
      relatedTerms: filteredRelatedTerms, // Возвращаем только связанные термины для запрашиваемого термина
      executionTimeMs: executionTime // Время выполнения запроса
    });
  } catch (err) {
    console.error('Error reading related terms file:', err);
    res.status(500).json({ error: 'Failed to read related terms file' });
  }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const axios = require('axios');
const fs = require('fs');

// Массив для хранения времени выполнения запросов
const executionTimes = [];

// Читаем данные из файла results.json
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

// Функция для отправки одного запроса и получения времени выполнения
async function sendRequest(term) {
    const start = Date.now(); // Сохраняем время начала запроса

    try {
        await axios.get('http://localhost:3000/search', {
            params: { term: term } // Используем term из аргумента
        });

        const executionTime = Date.now() - start; // Время выполнения запроса
        executionTimes.push(executionTime); // Добавляем время в массив

        console.log(`Request for term: "${term}" took ${executionTime} ms`); // Выводим время выполнения запроса
    } catch (error) {
        console.error(`Error during request for term: "${term}"`, error);
    }
}

// Функция для выполнения запросов для каждого элемента в results.json
async function runRequests() {
    try {
        // Читаем данные из файла results.json
        const results = await readJsonFile('results.json');

        // Пробегаем по каждому элементу массива и отправляем запрос
        for (let item of results) {
            await sendRequest(item.name); // Отправляем запрос для каждого термина
        }

        // Записываем только массив времен выполнения в файл
        fs.writeFileSync('executionTimes_REST.json', JSON.stringify(executionTimes, null, 2));
        console.log('Execution times saved to executionTimes_REST.json');
    } catch (error) {
        console.error('Error reading results.json:', error);
    }
}

// Запуск выполнения запросов
runRequests();

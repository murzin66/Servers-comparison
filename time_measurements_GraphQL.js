const fetch = require('node-fetch');
const fs = require('fs');
const { performance } = require('perf_hooks'); // Для точного измерения времени

const serverUrl = 'http://localhost:3000/graphql';
const query = `
  query {
    search(term: "physics", includeRelated: "true") {
      term
      description
    }
  }
`;

async function testQueryExecution() {
  const executionTimes = []; // Массив для хранения времени выполнения каждого запроса

  for (let i = 0; i < 50; i++) {
    const start = performance.now(); // Начало измерения времени

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json(); // Получаем данные из ответа
      const end = performance.now(); // Конец измерения времени

      if (data.errors) {
        console.error(`Error on request ${i + 1}:`, data.errors);
      } else {
        const executionTime = end - start; // Время выполнения запроса
        executionTimes.push(executionTime); // Добавляем время выполнения в массив
        console.log(`Request ${i + 1} executed in ${executionTime.toFixed(2)} ms`);
      }
    } catch (error) {
      console.error(`Error executing query ${i + 1}:`, error);
    }
  }

  // Записываем массив времени выполнения в файл
  fs.writeFileSync('execution_time_graphQL.json', JSON.stringify(executionTimes, null, 2), 'utf-8');
  console.log('Execution times saved to execution_time_graphQL.json');
}

// Запускаем тест
testQueryExecution();

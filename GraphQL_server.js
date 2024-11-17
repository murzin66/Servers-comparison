const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const fs = require('fs');
const path = require('path');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');

const app = express();

// Файлы данных
const resultsFilePath = path.join(__dirname, 'results.json');
const relatedTermsFilePath = path.join(__dirname, 'related_terms.json');

// Вспомогательная функция для чтения JSON из файла
function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file at ${filePath}:`, err);
        reject(err);
      } else {
        try {
          const parsedData = JSON.parse(data);
          console.log(`File read successfully: ${filePath}`);
          resolve(parsedData);
        } catch (parseError) {
          console.error(`Error parsing JSON from file ${filePath}:`, parseError);
          reject(parseError);
        }
      }
    });
  });
}

// Тип данных для результата поиска
const ResultType = new GraphQLObjectType({
  name: 'Result',
  fields: {
    term: { type: GraphQLString },
    description: { type: GraphQLString },
    executionTimeMs: { type: GraphQLString },
  },
});

// Главный Query Type
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Запрос для получения результатов поиска по основному термину и связанным терминам
    search: {
      type: new GraphQLList(ResultType),
      args: {
        term: { type: GraphQLString }, // Основной термин для поиска
        includeRelated: { type: GraphQLString }, // Флаг для включения результатов для связанных терминов
      },
      resolve: async (parent, args) => {
        const { term, includeRelated } = args;
        if (!term) {
          throw new Error('Term parameter is required');
        }

        const startTime = Date.now(); // Начало измерения времени выполнения запроса
        console.log(`Search started for term: ${term}`);

        try {
          // Считываем данные из файлов
          const results = await readJsonFile(resultsFilePath);
          const relatedTerms = await readJsonFile(relatedTermsFilePath);

          console.log('Results file:', results);
          console.log('Related terms file:', relatedTerms);

          // Сначала ищем основной термин в файле с результатами
          const resultEntry = results.find(item => item.name && item.name.toLowerCase() === term.toLowerCase());
          if (!resultEntry) {
            throw new Error(`No results found for the term: ${term}`);
          }

          console.log(`Found result for term: ${resultEntry.name}`);

          // Сначала добавляем основной термин в результаты
          const searchResults = [{
            term: resultEntry.name,
            description: resultEntry.description,
            executionTimeMs: Date.now() - startTime, // Время выполнения запроса
          }];

          if (includeRelated === 'true') {
            console.log('Include related terms: true');

            // Если нужно включить связанные термины, ищем их в related_terms.json
            const relatedTermsEntry = relatedTerms.find(item => item.term && item.term.toLowerCase() === term.toLowerCase());

            if (relatedTermsEntry && Array.isArray(relatedTermsEntry.related)) {
              console.log(`Found related terms for ${term}:`, relatedTermsEntry.related);

              // Для каждого связанного термина ищем его результаты в results.json
              const relatedResults = await Promise.all(
                relatedTermsEntry.related.map(async (relatedTerm) => {
                  if (typeof relatedTerm !== 'string') {
                    console.log(`Skipping invalid related term: ${relatedTerm}`);
                    return null; // Пропускаем, если связанный термин не является строкой
                  }

                  const relatedTermEntry = results.find(item => item.name && item.name.toLowerCase() === relatedTerm.toLowerCase());
                  if (relatedTermEntry) {
                    return {
                      term: relatedTermEntry.name,
                      description: relatedTermEntry.description,
                      executionTimeMs: Date.now() - startTime, // Время выполнения запроса
                    };
                  } else {
                    console.log(`No result found for related term: ${relatedTerm}`);
                    return null; // Если связанный термин не найден в results.json
                  }
                })
              );

              // Добавляем результаты для связанных терминов
              searchResults.push(...relatedResults.filter(Boolean));
            } else {
              console.log(`No related terms found for ${term}`);
            }
          }

          console.log('Final search results:', searchResults);
          return searchResults;

        } catch (err) {
          console.error('Error in search resolution:', err);
          throw new Error('Failed to process search');
        }
      },
    },
  },
});

// Создание схемы GraphQL
const schema = new GraphQLSchema({
  query: RootQuery,
});

// Настроим Express сервер для работы с GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true, // Включаем интерфейс GraphiQL
  })
);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});

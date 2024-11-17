import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import shapiro

# Чтение данных из JSON файлов
def read_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Загрузка данных из файлов
rest_times = read_json('executionTimes_REST.json')
graphql_times = read_json('execution_time_graphQL.json')

# 1. Построение графика плотности для REST API
plt.figure(figsize=(8, 6))
sns.histplot(rest_times, kde=True, stat="density", bins=20, color='blue', label='REST', linewidth=0)
plt.title('Density Plot of Execution Times for REST API')
plt.xlabel('Execution Time (ms)')
plt.ylabel('Density')

# Сохранение графика плотности REST API в файл
plt.tight_layout()
plt.savefig('density_plot_rest.png')  # Сохраняем в формате PNG
print("Density plot for REST API saved as 'density_plot_rest.png'")

# Покажем график
plt.show()

# 2. Построение графика плотности для GraphQL API
plt.figure(figsize=(8, 6))
sns.histplot(graphql_times, kde=True, stat="density", bins=20, color='red', label='GraphQL', linewidth=0)
plt.title('Density Plot of Execution Times for GraphQL API')
plt.xlabel('Execution Time (ms)')
plt.ylabel('Density')

# Сохранение графика плотности GraphQL API в файл
plt.tight_layout()
plt.savefig('density_plot_graphql.png')  # Сохраняем в формате PNG
print("Density plot for GraphQL API saved as 'density_plot_graphql.png'")

# Покажем график
plt.show()

# 3. Построение графиков с усами (Box Plots)
plt.figure(figsize=(14, 6))

# Ящик с усами для REST API
plt.subplot(1, 2, 1)
sns.boxplot(data=rest_times, color='blue', width=0.5)
plt.title('Boxplot of Execution Times for REST API')
plt.xlabel('REST API')
plt.ylabel('Execution Time (ms)')

# Ящик с усами для GraphQL API
plt.subplot(1, 2, 2)
sns.boxplot(data=graphql_times, color='red', width=0.5)
plt.title('Boxplot of Execution Times for GraphQL API')
plt.xlabel('GraphQL API')
plt.ylabel('Execution Time (ms)')

# Сохранение графика с усами в файл
plt.tight_layout()
plt.savefig('boxplot.png')  # Сохраняем в формате PNG
print("Boxplot saved as 'boxplot.png'")

# Покажем график
plt.show()

# 4. Проверка на нормальность с помощью теста Шапиро
# Тест на нормальность для REST
stat_rest, p_value_rest = shapiro(rest_times)
print(f'Rest API: Shapiro-Wilk Test Statistic = {stat_rest}, p-value = {p_value_rest}')

# Тест на нормальность для GraphQL
stat_graphql, p_value_graphql = shapiro(graphql_times)
print(f'GraphQL API: Shapiro-Wilk Test Statistic = {stat_graphql}, p-value = {p_value_graphql}')

# Если p-value меньше 0.05, то распределение статистически отличается от нормального

# 5. Вывод медианы для каждого распределения
median_rest = np.median(rest_times)
median_graphql = np.median(graphql_times)

# Вывод медиан
print(f"Медиана для REST API: {median_rest}")
print(f"Медиана для GraphQL API: {median_graphql}")

# 🚀 Полная Настройка Tutor Platform

## 📋 Анализ проблем и решения

### ❌ Проблема 1: 404 на `/api/auth/login`
**Причина:** Не было auth-service
**Решение:** Создан новый модуль auth-service с JWT аутентификацией ✅

### ❌ Проблема 2: 503 Service Unavailable
**Причина:** API Gateway не находит auth-service в Eureka
**Решение:** 
- Добавлены явные маршруты в API Gateway ✅
- Отключена форма логина в auth-service ✅
- Настроена безопасность для JWT ✅

### ❌ Проблема 3: Сервисы в Docker используют localhost
**Причина:** Connection strings указывают на localhost вместо имён контейнеров
**Решение:** Обновлен docker-compose.yml с правильными хостами ✅

---

## 🐳 Вариант 1: Запуск через Docker Compose (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Создайте Dockerfiles для каждого сервиса

**auth-service/Dockerfile:**
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**user-service/Dockerfile:** (аналогично, EXPOSE 8081)
**lesson-service/Dockerfile:** (аналогично, EXPOSE 8082)
**payment-service/Dockerfile:** (аналогично, EXPOSE 8083)
**notification-service/Dockerfile:** (аналогично, EXPOSE 8084)
**integration-service/Dockerfile:** (аналогично, EXPOSE 8085)
**api-gateway/Dockerfile:** (аналогично, EXPOSE 8080)
**service-registry/Dockerfile:** (аналогично, EXPOSE 8761)

### Шаг 2: Запустите все сервисы

```bash
# Из корня проекта
docker-compose down -v  # Очистить старые контейнеры
docker-compose up -d   # Запустить в фоне
```

### Шаг 3: Проверьте статус

```bash
docker-compose ps
```

Должны быть все сервисы в статусе `Up`

### Шаг 4: Проверьте Eureka

Откройте: **http://localhost:8761/** (admin/admin123)

Должны быть видны все сервисы:
- AUTH-SERVICE ✅
- USER-SERVICE ✅
- LESSON-SERVICE ✅
- PAYMENT-SERVICE ✅
- NOTIFICATION-SERVICE ✅
- INTEGRATION-SERVICE ✅
- API-GATEWAY ✅

---

## 🖥️ Вариант 2: Запуск на локальной машине

### Шаг 1: Запустите PostgreSQL и RabbitMQ

```bash
docker-compose up postgres rabbitmq
```

### Шаг 2: В отдельных окнах терминала запустите сервисы ПО ПОРЯДКУ

**Окно 1 - Service Registry:**
```bash
cd service-registry
mvn spring-boot:run
```

**Окно 2 - User Service:**
```bash
cd user-service
mvn spring-boot:run
```

**Окно 3 - Auth Service:**
```bash
cd auth-service
mvn clean install
mvn spring-boot:run
```

**Окно 4 - Lesson Service:**
```bash
cd lesson-service
mvn spring-boot:run
```

**Окно 5 - Payment Service:**
```bash
cd payment-service
mvn spring-boot:run
```

**Окно 6 - Notification Service:**
```bash
cd notification-service
mvn spring-boot:run
```

**Окно 7 - Integration Service:**
```bash
cd integration-service
mvn spring-boot:run
```

**Окно 8 - API Gateway:**
```bash
cd api-gateway
mvn spring-boot:run
```

### Шаг 3: Дождитесь регистрации в Eureka (10-15 секунд)

Проверьте: http://admin:admin123@localhost:8761/

---

## 🧪 Тестирование Authentication

### Логин через API Gateway

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Ожидаемый ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "role": "STUDENT",
    "expiresIn": 86400
  }
}
```

### Регистрация нового пользователя

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Использование токена для авторизованных запросов

```bash
curl -X GET http://localhost:8080/api/lessons \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

---

## 📝 Конфигурация

### JWT Secret (ВАЖНО!)

По умолчанию используется:
```
your-super-secret-jwt-key-min-256-bits-here-change-in-production
```

⚠️ **В production ОБЯЗАТЕЛЬНО измените на безопасное значение!**

### Параметры JWT

- **Срок жизни токена:** 24 часа (86400000 мс)
- **Алгоритм:** HS512
- **Claims:** userId, email, role

---

## 🔌 Архитектура Микросервисов

```
┌─────────────────────────────────────────┐
│        API Gateway (8080)               │
│   ┌──────────────────────────────────┐  │
│   │  Routes:                         │  │
│   │  /api/auth/** → auth-service    │  │
│   │  /api/users/** → user-service   │  │
│   │  /api/lessons/** → lesson-svc   │  │
│   └──────────────────────────────────┘  │
└─────────────┬──────────────────────────┘
              │
    ┌─────────┼──────────┬───────────┬─────────┐
    │         │          │           │         │
    ↓         ↓          ↓           ↓         ↓
  Auth    User       Lesson      Payment   Notification
  (8086)  (8081)     (8082)      (8083)    (8084)
                      │           │
                      └─────┬─────┘
                            ↓
                      ┌─────────────┐
                      │  RabbitMQ   │
                      │  (5672)     │
                      └─────────────┘
                            ↓
                      ┌─────────────┐
                      │ PostgreSQL  │
                      │ (5432)      │
                      └─────────────┘
                            ↓
                  ┌──────────┴──────────┐
                  ↓                     ↓
              userdb                lessondb
```

**Service Registry (Eureka) на 8761** - регистрирует все сервисы

---

## ✅ Чек-лист после запуска

- [ ] Все сервисы запущены (проверьте логи на `Started XXXApplication`)
- [ ] Eureka показывает все сервисы в статусе UP
- [ ] Можно логиниться через `/api/auth/login`
- [ ] Получается JWT токен
- [ ] Токен работает с авторизованными эндпоинтами
- [ ] RabbitMQ получает события от сервисов
- [ ] PostgreSQL содержит данные пользователей

---

## 🐛 Troubleshooting

### 503 Service Unavailable
- Проверьте, что auth-service зарегистрирована в Eureka (могут быть задержки 10-15 сек)
- Убедитесь, что auth-service запущена без ошибок
- Посмотрите логи API Gateway

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущена: `docker-compose ps`
- Проверьте credentials в `application.yml`
- Убедитесь, что базы созданы: `init-db.sh`

### JWT ошибки
- Проверьте, что secret одинаков во всех сервисах
- Убедитесь, что токен в формате: `Bearer <token>`
- Проверьте срок жизни токена (не истек ли)

### Сервис не видна в Eureka
- Убедитесь, что Eureka запущена первой
- Дождитесь регистрации (10-15 секунд)
- Проверьте логи на ошибки подключения к Eureka

---

## 📚 Документация API

### Auth Service
- `POST /api/auth/login` - Логин
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/validate` - Проверка токена

### User Service
- `GET /api/users/{id}` - Получить пользователя
- `GET /api/users/by-email` - Получить по email
- `POST /api/users` - Создать пользователя

### Lesson Service
- `GET /api/lessons` - Список уроков
- `GET /api/lessons/{id}` - Получить урок
- `POST /api/lessons` - Создать урок
- `PUT /api/lessons/{id}` - Обновить урок
- `POST /api/lessons/{id}/complete` - Завершить урок

---

## 🎉 Проект готов к использованию!

Если возникнут проблемы, проверьте:
1. Логи каждого сервиса
2. Статус в Eureka
3. Доступность портов
4. Конфигурацию БД

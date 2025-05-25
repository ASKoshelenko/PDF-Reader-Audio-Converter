# PDF Reader & Audio Converter

Конвертер PDF книг в аудио формат с поддержкой русского и английского языков.

## Требования

- Node.js 18.x или выше
- Azure CLI
- Azure Subscription
- Visual Studio Code с расширениями:
  - Azure Functions
  - Azure Account
  - Azure Storage
  - Azure App Service

## Установка

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## Разработка

### Frontend

```bash
cd frontend
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

### Backend

```bash
cd backend
npm start
```

API будет доступно по адресу: http://localhost:7071/api

## Тестирование

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
npm test
```

## Сборка

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

## Развертывание

### Azure Functions

```bash
cd backend
func azure functionapp publish <app-name>
```

### Frontend (Azure Static Web Apps)

```bash
cd frontend
npm run build
swa deploy
```

## Структура проекта

```
.
├── frontend/                # React приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # API сервисы
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Утилиты
│   │   └── types/         # TypeScript типы
│   └── public/            # Статические файлы
│
├── backend/                # Azure Functions
│   ├── src/
│   │   ├── functions/     # Azure Functions
│   │   ├── services/      # Бизнес-логика
│   │   ├── utils/         # Утилиты
│   │   └── types/         # TypeScript типы
│   └── tests/             # Тесты
│
└── docs/                  # Документация
```

## Переменные окружения

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_AZURE_AD_CLIENT_ID=<client-id>
REACT_APP_AZURE_AD_TENANT_ID=<tenant-id>
```

### Backend (local.settings.json)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "<storage-connection-string>",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_OPENAI_API_KEY": "<openai-api-key>",
    "AZURE_SPEECH_KEY": "<speech-key>",
    "AZURE_SPEECH_REGION": "<speech-region>",
    "AZURE_STORAGE_CONNECTION_STRING": "<storage-connection-string>"
  }
}
```

## Безопасность

- Все API endpoints защищены JWT аутентификацией
- Используется Azure AD B2C для аутентификации
- Данные шифруются при передаче и хранении
- Реализована защита от CSRF и XSS атак

## Мониторинг

- Azure Application Insights для мониторинга
- Логирование через Winston
- Метрики производительности
- Алерты при ошибках

## Лицензия

MIT 
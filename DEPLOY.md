# Инструкция по развертыванию

Это руководство описывает шаги для развертывания приложения на производственном сервере с использованием Docker Compose.

## Предварительные требования

- У вас должен быть сервер с установленным Docker и Docker Compose.
- Ваш сервер должен быть доступен по доменному имени (`misishacks.misishacks.ru` в данном случае).
- На сервере должен быть настроен обратный прокси (например, Nginx или Traefik) для терминирования SSL-соединений и перенаправления трафика на порт 80.

## 1. Клонирование репозитория

Подключитесь к вашему серверу по SSH и клонируйте репозиторий:

```bash
git clone <URL вашего репозитория>
cd maxhack
```

## 2. Настройка переменных окружения

Создайте файл `.env` в корневой директории проекта:

```bash
touch .env
```

Откройте файл в текстовом редакторе и заполните его следующими значениями для вашей производственной среды:

```env
# Backend
# Замените user, password и dbname на ваши реальные данные для PostgreSQL
DATABASE_URL=postgresql://user:password@db:5432/dbname
BOT_TOKEN=9LHodD0cOIwUEVN8hm_yV7QGfH1X80fgT9-5cw4hWW82VW0E-oW1dTnaaHhaNYnBvZb7P30srhWnBtaWYAx

# Frontend
# URL, по которому фронтенд будет обращаться к бэкенду
VITE_API_URL=https://misishacks.misishacks.ru/api

# Common
DOMAIN=misishacks.misishacks.ru

# Postgres
# Учетные данные для сервиса PostgreSQL в Docker
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname
```

**Важно:**
- `DATABASE_URL` должен указывать на сервис `db`, как определено в `docker-compose.yml`.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` должны совпадать с данными в `DATABASE_URL`.
- `BOT_TOKEN` - это ваш токен бота из платформы MAX.

## 3. Сборка и запуск контейнеров

Выполните следующую команду для сборки образов и запуска контейнеров в фоновом режиме:

```bash
docker-compose up --build -d
```

- `docker-compose up`: запускает сервисы, определенные в `docker-compose.yml`.
- `--build`: принудительно пересобирает Docker-образы перед запуском.
- `-d`: запускает контейнеры в фоновом (detached) режиме.

После выполнения этой команды приложение будет доступно по адресу `http://<IP вашего сервера>:80`. Ваш внешний обратный прокси должен быть настроен для перенаправления HTTPS-трафика с домена `misishacks.misishacks.ru` на этот адрес.

## 4. Проверка состояния

Вы можете проверить состояние запущенных контейнеров с помощью команды:

```bash
docker-compose ps
```

Для просмотра логов сервисов используйте:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

На этом развертывание завершено.

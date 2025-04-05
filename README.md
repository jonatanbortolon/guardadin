# GuardaDin

Your personal financial manager on Whatsapp.

## Getting started

### Prerequisites

- Docker
- Docker Compose
- Node.js (20.x)

### Runing the project

1. Clone the project
2. Run `docker compose up -d` to start the project
3. Run `docker compose exec ollama-1 ollama run llama3.1` to install the model
4. Run `npm ci` to install the dependencies
5. Run `npm run database:migrate` to create the database and the tables
6. Run `npm run database:seed` to seed the database
7. On another terminal run `npm run dev` to start the project
8. Open the application on http://localhost:3000 and login with the credentials `admin@admin.com` and `admin`

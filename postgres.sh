docker run --name pg-template-bun-elysia \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -v pgdata-template-bun-elysia:/var/lib/postgresql/data \
  -d postgres:18-alpine

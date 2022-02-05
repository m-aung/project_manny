# ORM Steps

#### We are gonna use TS for Prisma with PostgresQL

### Initialization

[] install prisma from node 'npm'
`npm i -D prisma typescript express nodemon @types/node @types/express`
[] initialize the prisma CLI
`npx prisma`
[] initialize the prisma schema
`npx prisma init`
[] optional: install VS code extension for prisma

### Migration

`npx prisma migrate dev --name init`

### Attribute Argument Types

- String => double quotes `""`
- Expression => `42.0, "", Bob, now(), cuid()`

## seed data

## migrations

# Sequalize

## Installation

- `npm install --save sequelize pg pg-hstore`
- `npm install --save-dev sequelize-cli`
- `npx sequelize-cli init`

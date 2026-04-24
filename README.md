# Backend Challenge

You hace to build a microservice that exposes a REST api with two different
tables, users and states. Both tables should be open to creation, deletion,
or update. Every request must only accept this. `Content-type: application-json`

### Badges

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/franciscoporta/take-challenge/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/franciscoporta/take-challenge/tree/main)

[![Coverage Status](https://coveralls.io/repos/github/franciscoporta/take-challenge/badge.svg?branch=main)](https://coveralls.io/github/franciscoporta/take-challenge?branch=main)

### Features

- Create new Users with their Pokemon Ids
- Get Users list
- Get User by Id and also gathering Pokemon Names from Poke Api
- Update User
- Delete User

## Pre-Requisites

- Docker installed without SUDO Permission
- Docker compose installe without SUDO
- Ports free: 3306 and 3010

## How run the APP

```
chmod 711 ./up_dev.sh
./up_dev.sh
```

## How to run the tests

```
chmod 711 ./up_test.sh
./up_test.sh
```

## Areas to improve

- Data should be moved from test to an external file
- Generic method should be used to mock endpoints
- Error handling could be improved

## Techs

- Nest: 11
- Node: Node22.18.0
- TypeORM
- Postgress

## Decissions made

- Clean architecture: To be able to handle further changes in the future in a proper way.
- TypeORM: Because it is the already integrated ORM in the Nest Framework and it is the most popular ORM so it is easy to finde fixes and people tha know how to use it.
- Docker: To make portable
- Jest: Jest is the most used testing framework of JS. Same argument as above.

## Route

- [![API Swagger]](http://localhost:3010/api)

## Env vars should be defined

To find an example of the values you can use .env.example

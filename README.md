# Http Server in Typescript

## Project Overview

This project is a guided backend exercise from [Boot.dev](https://boot.dev) focused on building an HTTP server in express. It demonstrates core backend concepts such as RESTful CRUD operations, authentication & authorization, and handling webhook requets.

## Learning Objectives

- Understanding HTTP request/response lifecycle
- Designing RESTful endpoints
- Handling request validation and error responses
- Implementing authentication and authorization with JWT using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library
- Verifying and handling webhook payloads
- Persist data in a real database using [drizzle](https://orm.drizzle.team)

## API Design Overview

### CRUD endpoints

`POST /api/users`: Creates an users record and saves it to the database

Request body:

```json
{
  "email": "user@example.com",
  "password": "1234"
}
```

It returns a user

```json
{
  "id": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e",
  "createdAt": "2026-01-04T00:10:36.943Z",
  "updatedAt": "2026-01-04T00:10:36.943Z",
  "email": "user@example.com",
  "isChirpyRed": false
}
```

`PUT /api/user`: Updates an existing user with the given email and password

```json
{
  "email": "newemail@example.com",
  "password": "newpassword"
}
```

It returns an updated user

```json
{
  "id": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e",
  "createdAt": "2026-01-04T00:10:36.943Z",
  "updatedAt": "2026-01-02:15:08.746Z",
  "email": "newemail@example.com",
  "isChirpyRed": false
}
```

`GET /api/chirps`: Retrieves a list of chirps, You can also pass a query parameter to only retrieve chirps associated to a certain user `?authorId=45a3a5a2-88c0-4637-ad4f-89c6a927b59e`, and specify the sorting order `sort=desc`.

`POST /api/chirps`: Creates a chirps and saves it to the database

Request body:

{
"body": "hello world!"
}

It return a chirp:

```json
{
  "id": "4d82f55e-4bd3-4f7a-861e-f3458a54c2d1",
  "createdAt": "2026-01-04T01:12:29.518Z",
  "updatedAt": "2026-01-04T01:12:29.518Z",
  "body": "Hello world!",
  "userId": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e"
}
```

`GET /api/chirps/4d82f55e-4bd3-4f7a-861e-f3458a54c2d1`: Retrieves chirp with id 4d82f55e-4bd3-4f7a-861e-f3458a54c2d1

It return a chirp:

```json
{
  "id": "4d82f55e-4bd3-4f7a-861e-f3458a54c2d1",
  "createdAt": "2026-01-04T01:12:29.518Z",
  "updatedAt": "2026-01-04T01:12:29.518Z",
  "body": "Hello world!",
  "userId": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e"
}
```

`DELETE /api/chirps/4d82f55e-4bd3-4f7a-861e-f3458a54c2d1`: Deletes chirp with id 4d82f55e-4bd3-4f7a-861e-f3458a54c2d1

### Authentication & Authorization

`POST /api/login`: Logs in an existing user

Request body:

```json
{
  "email": "user@example.com",
  "password": "1234"
}
```

It return this payload:

```json
{
  "id": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e",
  "createdAt": "2026-01-04T00:10:36.943Z",
  "updatedAt": "2026-01-04T00:10:36.943Z",
  "email": "user@example.com",
  "isChirpyRed": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJleHAiOjE3Njc0ODkxMTUsImlhdCI6MTc2NzQ4NTUxNSwic3ViIjoiNDVhM2E1YTItODhjMC00NjM3LWFkNGYtODljNmE5MjdiNTllIn0.5nDh2bxJzoBOBNINtUMhsFwi9FNnJzKVWXzNFtXhm3o",
  "refreshToken": "3c276e9f55dd0a26b222666a1e60a30434fb6dc56e5213db347d60d69f5ee7d8"
}
```

`POST /api/refresh`: issues a new access token if the refresh token is valid, passing it in authorization header within the request object

It return a new access token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJleHAiOjE3Njc0ODk4ODgsImlhdCI6MTc2NzQ4NjI4OCwic3ViIjoiNDVhM2E1YTItODhjMC00NjM3LWFkNGYtODljNmE5MjdiNTllIn0.E6wlYG4uMJMV-T4bxdZ6PBfw24oii2ESv9wTvjNytWM"
}
```

`POST /api/revoke`: Revoke an existing refresh token, passing it in authorization header within the request object

### Webhook

`POST /api/polka/webhooks`: Ugrade user membership by getting a webhook request from a 3rd party service

Request body:

```json
{
  "event": "user.upgraded",
  "data": {
    "userId": "45a3a5a2-88c0-4637-ad4f-89c6a927b59e"
  }
}
```

## Error handling

Implement an middleware to handle error with appropriate status code

# QuickNotes API Design

This is the **real** QuickNotes REST API the backend team should build (not JSONPlaceholder). Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON (`Content-Type: application/json`). Protected endpoints need `Authorization: Bearer <token>`.

## Endpoints

| # | Method | Path | Description | Success status |
|---|--------|------|-------------|----------------|
| 1 | GET | `/notes` | List the signed-in user's notes (supports `?limit=`, `?cursor=`, `?tag=`) | 200 OK |
| 2 | POST | `/notes` | Create a note | 201 Created |
| 3 | GET | `/notes/{id}` | Get one note | 200 OK |
| 4 | PUT | `/notes/{id}` | Replace a note (title, body, tags) | 200 OK |
| 5 | PATCH | `/notes/{id}` | Partially update a note | 200 OK |
| 6 | DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| 7 | GET | `/tags` | List the user's tags | 200 OK |
| 8 | POST | `/notes/{id}/tags` | Attach a tag to a note | 201 Created |
| 9 | DELETE | `/notes/{id}/tags/{tagId}` | Remove a tag from a note | 204 No Content |
| 10 | POST | `/auth/login` | Exchange email and password for a token | 200 OK |

Design choices: nouns in plural form for resources, HTTP verbs for actions, nesting only for the note-to-tag relationship, versioned path (`/v1`), cursor pagination so lists stay fast with millions of rows.

## Example: create a note

`POST /v1/notes`

Request:

```json
{
  "title": "Buy milk",
  "body": "2 litres, full cream",
  "tags": ["shopping", "home"]
}
```

Response `201 Created` with header `Location: /v1/notes/9001`:

```json
{
  "id": 9001,
  "userId": 42,
  "title": "Buy milk",
  "body": "2 litres, full cream",
  "tags": ["shopping", "home"],
  "createdAt": "2026-11-03T08:15:00Z",
  "updatedAt": "2026-11-03T08:15:00Z"
}
```

## Example: list notes

`GET /v1/notes?limit=2`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 9001,
      "title": "Buy milk",
      "body": "2 litres, full cream",
      "tags": ["shopping", "home"],
      "createdAt": "2026-11-03T08:15:00Z"
    },
    {
      "id": 8990,
      "title": "Call the bank",
      "body": "",
      "tags": [],
      "createdAt": "2026-11-02T14:02:00Z"
    }
  ],
  "nextCursor": "eyJpZCI6ODk5MH0"
}
```

## Error status codes

| Status | Meaning | When it happens |
|--------|---------|-----------------|
| 400 Bad Request | Invalid input | Missing title, title longer than 100 characters, malformed JSON |
| 401 Unauthorized | Not authenticated | Missing, expired or invalid token |
| 403 Forbidden | Authenticated but not allowed | Trying to read or delete another user's note |
| 404 Not Found | Resource does not exist | Unknown note id |
| 429 Too Many Requests | Rate limit exceeded | Too many requests from one client |
| 500 Internal Server Error | Server bug or outage | Unexpected failure; safe to retry later |

Example error body (same shape for every error):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title must be between 1 and 100 characters",
    "status": 400,
    "requestId": "req_7f3a9c"
  }
}
```

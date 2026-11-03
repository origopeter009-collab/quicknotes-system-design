# QuickNotes System Design

QuickNotes is moving from a browser-only app to an online service for 1 million users. This repository has two halves: a small browser client that proves the front end can talk to a REST API (using the JSONPlaceholder practice API), and the design documents the backend team will build from.

## How to run the API client

1. Clone the repository: `git clone https://github.com/origopeter009-collab/quicknotes-system-design.git`
2. Open `index.html` in any modern browser (double-click it, or use the VS Code Live Server extension). No build step or install is needed; an internet connection is required.
3. Click **Load notes** to fetch 10 notes (GET), fill in the form and click **Add note** to create one (POST), and click **Delete** on a note to remove it (DELETE).

Note: JSONPlaceholder does not really store changes, so created or deleted notes reappear or vanish only in the page, and a reload restores the original 10 notes.

## Files

- `index.html`, `api.js`, `style.css`: the API client (GET, POST, DELETE, loading/success/error/empty states, validation, disabled buttons, `textContent` only)
- [docs/api-design.md](docs/api-design.md): REST endpoints, JSON examples and error codes
- [docs/data-model.md](docs/data-model.md): tables, keys, relationships, SQL, indexes and the SQL vs NoSQL decision
- [docs/architecture.md](docs/architecture.md): requirements, load estimate, diagram, request flows, trade-offs

## What I learned

- A reusable `request()` function that checks `response.ok` keeps error handling in one place, because `fetch` only rejects on network failures, not on 404 or 500 responses.
- Good API design uses plural nouns, the right HTTP verbs and meaningful status codes (201 for create, 204 for delete, 400/401/403/404 for client errors), and a consistent error body.
- A many-to-many relationship (notes and tags) needs a join table, and indexes should match the most common query (the newest notes of one user).
- Back-of-the-envelope estimates (about 100 reads/s and 17 writes/s on average for 1 million users) decide which components are really needed, and caches, replicas and queues each solve one specific problem.
- Every design choice is a trade-off (for example cache speed vs. freshness), and removing single points of failure means running at least two of everything important.

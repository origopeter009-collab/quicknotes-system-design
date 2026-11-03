# QuickNotes Data Model

## Entities

### users

| Column | Type | Key / constraint |
|--------|------|------------------|
| id | BIGINT | **PK**, auto increment |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| display_name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, default now |

### notes

| Column | Type | Key / constraint |
|--------|------|------------------|
| id | BIGINT | **PK**, auto increment |
| user_id | BIGINT | **FK** -> users(id), NOT NULL |
| title | VARCHAR(100) | NOT NULL |
| body | TEXT | optional |
| created_at | TIMESTAMP | NOT NULL, default now |
| updated_at | TIMESTAMP | NOT NULL, default now |

### tags

| Column | Type | Key / constraint |
|--------|------|------------------|
| id | BIGINT | **PK**, auto increment |
| user_id | BIGINT | **FK** -> users(id), NOT NULL |
| name | VARCHAR(50) | NOT NULL, UNIQUE per user |

### note_tags (join table)

| Column | Type | Key / constraint |
|--------|------|------------------|
| note_id | BIGINT | **PK (part 1)**, **FK** -> notes(id) |
| tag_id | BIGINT | **PK (part 2)**, **FK** -> tags(id) |

## Relationships

- **One-to-many: users -> notes.** One user owns many notes; each note belongs to exactly one user (`notes.user_id`).
- **One-to-many: users -> tags.** Each user keeps their own tag list (`tags.user_id`).
- **Many-to-many: notes <-> tags.** A note can have many tags and a tag can label many notes. A relational database cannot store this directly, so the join table `note_tags` holds one row per (note, tag) pair; its composite primary key prevents duplicates.

## CREATE TABLE statements (PostgreSQL)

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id      BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  BIGINT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

## Example queries

1. Latest 10 notes of a user (powers `GET /notes`):

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 10;
```

2. Notes with a given tag (uses a **JOIN** across the many-to-many relationship):

```sql
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 42 AND t.name = 'shopping'
ORDER BY n.created_at DESC;
```

3. Create a note (powers `POST /notes`):

```sql
INSERT INTO notes (user_id, title, body)
VALUES (42, 'Buy milk', '2 litres, full cream')
RETURNING id;
```

4. How many notes each user has:

```sql
SELECT user_id, COUNT(*) AS note_count
FROM notes
GROUP BY user_id
ORDER BY note_count DESC;
```

## Indexes

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags (tag_id);
```

- `idx_notes_user_created`: almost every read is "the newest notes of one user". Without it the database scans the whole notes table (hundreds of millions of rows); with it the query reads only that user's rows, already sorted.
- `idx_note_tags_tag`: the primary key already covers lookups by note; this index makes "all notes with tag X" fast.

## SQL or NoSQL?

I chose **SQL (PostgreSQL)**. QuickNotes data is clearly relational (users own notes, notes have tags through a many-to-many link), and we need integrity guarantees such as foreign keys, unique emails and transactions (creating a note and its tags must succeed or fail together). The scale, around 550 GB per year and a few hundred requests per second, is well within what one primary with read replicas can handle, so we do not need NoSQL's horizontal write scaling yet. If the data ever outgrows one primary, we can shard by `user_id`, since notes are almost always accessed per user.

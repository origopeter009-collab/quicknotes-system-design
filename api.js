// QuickNotes API client (Tasks 1-2: GET + POST)
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE = 100;

const loadBtn = document.getElementById("load-btn");
const submitBtn = document.getElementById("submit-btn");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("notes-list");

// Reusable request helper: calls fetch, checks response.ok, throws on errors.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}

function setStatus(message, type) {
  statusEl.textContent = message; // textContent only: never innerHTML
  statusEl.className = type || "";
}

// Disable the main controls while any request is running.
function setBusy(isBusy) {
  loadBtn.disabled = isBusy;
  submitBtn.disabled = isBusy;
}

function removeEmpty() {
  const empty = listEl.querySelector(".empty");
  if (empty) empty.remove();
}

function showEmpty() {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet. Click \"Load notes\" or add one.";
  listEl.appendChild(li);
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.dataset.id = note.id;
  const title = document.createElement("h3");
  title.className = "note-title";
  title.textContent = note.title;
  const body = document.createElement("p");
  body.className = "note-body";
  body.textContent = note.body || "";
  li.append(title, body);
  return li;
}

function renderNotes(notes) {
  listEl.replaceChildren();
  if (notes.length === 0) {
    showEmpty();
    return;
  }
  notes.forEach((note) => listEl.appendChild(createNoteElement(note)));
}

// GET: load 10 notes
async function loadNotes() {
  setStatus("Loading notes...", "info");
  setBusy(true);
  try {
    const { data } = await request(API_URL + "?_limit=10");
    renderNotes(data);
    setStatus("Loaded " + data.length + " notes from the server.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we could not load your notes. Please check your connection and try again.", "error");
  } finally {
    setBusy(false);
  }
}

// Validation: title required, max 100 characters. Returns an error message or "".
function validateTitle(title) {
  if (title.length === 0) return "Please enter a title.";
  if (title.length > MAX_TITLE) {
    return "Title is too long (" + title.length + "/" + MAX_TITLE + " characters).";
  }
  return "";
}

// POST: create a note
async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  const problem = validateTitle(title);
  if (problem) {
    setStatus(problem, "error");
    titleInput.focus();
    return;
  }

  setStatus("Saving note...", "info");
  setBusy(true);
  try {
    const { status, data } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    removeEmpty();
    listEl.prepend(createNoteElement(data)); // newest note at the top
    setStatus("Note created (status " + status + ", id " + data.id + ").", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    setStatus("Sorry, your note could not be saved. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);
showEmpty();

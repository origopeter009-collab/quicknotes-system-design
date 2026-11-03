// QuickNotes API client (Task 1: GET)
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
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

async function loadNotes() {
  setStatus("Loading notes...", "info");
  loadBtn.disabled = true;
  try {
    const { data } = await request(API_URL + "?_limit=10");
    renderNotes(data);
    setStatus("Loaded " + data.length + " notes from the server.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we could not load your notes. Please check your connection and try again.", "error");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
showEmpty();

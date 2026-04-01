import {
  getPerson,
  getParents,
  getChildren,
  getSiblings,
  getSpouses
} from "./api.js";

/* ---------- Helpers ---------- */
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function linkToPerson(p) {
  const name = escapeHtml(p.first_name || "Unknown");
  const year = p.birth_year ? ` (${p.birth_year})` : "";
  return `<a href="person.html?id=${p.id}">${name}${year}</a>`;
}

function renderList(listId, people = []) {
  const ul = document.getElementById(listId);
  ul.innerHTML = "";
  if (!people.length) {
    ul.innerHTML = `<li><em>No Data</em></li>`;
    return;
  }
  for (const p of people) {
    const li = document.createElement("li");
    li.innerHTML = linkToPerson(p);
    ul.appendChild(li);
  }
}

function sortByBirthYearThenName(people = []) {
  return [...people].sort((a, b) => {
    // If both have birth_year
    if (a.birth_year != null && b.birth_year != null) {
      return a.birth_year - b.birth_year;
    }
    // If only a has birth_year → a first
    if (a.birth_year != null) return -1;
    // If only b has birth_year → b first
    if (b.birth_year != null) return 1;
    // Neither has birth_year → fallback to name
    return (a.first_name || "").localeCompare(b.first_name || "");
  });
}

/* ---------- Read URL ---------- */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = `
    <h2>No person selected</h2>
    <p>index.htmlGo Home</a></p>
  `;
  throw new Error("No person ID");
}

/* ---------- Load person ---------- */
const { data: person, error: personErr } = await getPerson(id);
if (personErr || !person) {
  document.body.innerHTML = `
    <h2>Error loading person</h2>
    <p>${personErr?.message || "Person not found"}</p>
    <p>index.htmlGo Home</a></p>
  `;
  throw new Error(personErr?.message || "Person not found");
}

document.getElementById("name").textContent = person.first_name;

/* ---------- Wire add actions ---------- */
/* IMPORTANT: match add.html parameter names */
document.getElementById("editPerson").href = `edit.html?id=${id}`;
document.getElementById("addChild").href  = `link.html?type=child&of=${id}`;
document.getElementById("addParent").href = `link.html?type=parent&of=${id}`;
document.getElementById("addSpouse").href = `link.html?type=spouse&of=${id}`;

/* ---------- Load & render sections ---------- */

// Parents
const { data: parents } = await getParents(id);
renderList("parents", parents || []);

// Children
const { data: children } = await getChildren(id);
renderList("children", sortByBirthYearThenName(children || []));

// Siblings
const { data: siblings } = await getSiblings(id);
renderList("siblings", sortByBirthYearThenName(siblings || []));

// Spouses
const { data: spouses } = await getSpouses(id);
renderList("spouses", sortByBirthYearThenName(spouses || []));

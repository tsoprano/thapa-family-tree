import { getPerson, getParents, getChildren } from "./api.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = `
    <h2>No person selected</h2>
    <a href="index.html">Go back</a>
  `;
  throw new Error("No person ID in URL");
}

// Load person
const { data: person, error } = await getPerson(id);
if (error) {
  document.body.innerHTML = `<p>Error loading person</p>`;
  throw error;
}

document.getElementById("name").textContent = person.first_name;

// Load parents
const { data: parents } = await getParents(id);
parents.forEach(p => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="person.html?id=${p.people.id}">
    ${p.people.first_name}
  </a>`;
  document.getElementById("parents").appendChild(li);
});

// Load children
const { data: children } = await getChildren(id);
children.forEach(c => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="person.html?id=${c.people.id}">
    ${c.people.first_name}
  </a>`;
  document.getElementById("children").appendChild(li);
});
``

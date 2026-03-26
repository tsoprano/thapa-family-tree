import { getPerson, getParents, getChildren } from "./api.js";

const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  document.body.innerHTML += "<p>No person selected</p>";
}

const person = await getPerson(id);
document.getElementById("name").textContent = person.data.first_name;

const parents = await getParents(id);
parents.data.forEach(p => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="person.html?id=${p.people.id}">${p.people.first_name}</a>`;
  document.getElementById("parents").appendChild(li);
});

const children = await getChildren(id);
children.data.forEach(c => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="person.html?id=${c.people.id}">${c.people.first_name}</a>`;
  document.getElementById("children").appendChild(li);
});
``
import { supabase } from "./supabase.js";

/*
  Duplicate strategy (initial, conservative):
  - Same exact first_name
  - Count > 1
*/

const statusEl = document.getElementById("status");
const container = document.getElementById("duplicates");

//helper functions
function renderPeopleList(label, people = []) {
  if (!people.length) return `<div><strong>${label}:</strong> None</div>`;

  const items = people
    .map(p =>
      `<a href=person.html?id=${p.id}>${p.first_name}${p.birth_year ? ` (${p.birth_year})` : ""}</a>`
    )
    .join(", ");

  return `<div><strong>${label}:</strong> ${items}</div>`;
}

//main functions
function shortId(id) {
  return id.slice(0, 8) + "…";
}

async function getRelationshipDetails(personId) {
  // Parent relationships: someone is parent of THIS person
  const { data: parentsRel } = await supabase
    .from("relationships")
    .select("related_person_id")
    .eq("person_id", personId)
    .eq("relationship_type", "parent");

  // Children relationships: THIS person is parent of someone
  const { data: childrenRel } = await supabase
    .from("relationships")
    .select("person_id")
    .eq("related_person_id", personId)
    .eq("relationship_type", "parent");

  // Spouses: bidirectional
  const { data: spouseA } = await supabase
    .from("relationships")
    .select("related_person_id")
    .eq("person_id", personId)
    .eq("relationship_type", "spouse");

  const { data: spouseB } = await supabase
    .from("relationships")
    .select("person_id")
    .eq("related_person_id", personId)
    .eq("relationship_type", "spouse");

  async function loadPeople(ids) {
    if (!ids.length) return [];
    const { data } = await supabase
      .from("people")
      .select("id, first_name, birth_year")
      .in("id", ids);
    return data || [];
  }

  return {
    parents: await loadPeople(parentsRel?.map(r => r.related_person_id) || []),
    children: await loadPeople(childrenRel?.map(r => r.person_id) || []),
    spouses: await loadPeople([
      ...(spouseA?.map(r => r.related_person_id) || []),
      ...(spouseB?.map(r => r.person_id) || [])
    ])
  };
}

async function loadDuplicates() {
  // 1) Find duplicate names
const { data, error } = await supabase
  .from("duplicate_people")
  .select("first_name, count");

  if (error) {
    statusEl.textContent = "Error loading duplicates.";
    console.error(error);
    return;
  }

  if (!data.length) {
    statusEl.textContent = "✅ No duplicate names found.";
    return;
  }

  statusEl.textContent = `Found ${data.length} duplicate name group(s).`;

  // 2) Load details for each group
  for (const group of data) {
    const { data: people } = await supabase
      .from("people")
      .select("id, first_name, birth_year")
      .eq("first_name", group.first_name);

    const groupDiv = document.createElement("div");
    groupDiv.className = "group";

    const title = document.createElement("h3");
    title.innerHTML = `
      ${group.first_name}
      <span class="danger">(×${people.length})</span>
    `;
    groupDiv.appendChild(title);

    // Load relationship summary per person
    for (const p of people) {
        const details = await getRelationshipDetails(p.id);

        const row = document.createElement("div");
        row.className = "person"


        row.innerHTML = `
        <strong>${p.first_name}</strong>
        ${p.birth_year ? `(${p.birth_year})` : ""}
        <br/>
        ID: ${shortId(p.id)}

        <div class="counts">
            ${renderPeopleList("Parents", details.parents)}
            ${renderPeopleList("Children", details.children)}
            ${renderPeopleList("Spouses", details.spouses)}
        </div>
        `;
        groupDiv.appendChild(row);
    }

    // Future hook (merge wizard)
    const btn = document.createElement("button");
    btn.textContent = "Review for Merge";
    btn.onclick = () => {
    window.location.href = `merge.html?name=${encodeURIComponent(group.first_name)}`;
    };
    btn.disabled = false;
    btn.style.marginTop = "0.5rem";
    btn.title = "Merge wizard will be added later";
    groupDiv.appendChild(btn);

    container.appendChild(groupDiv);
  }
}

loadDuplicates();

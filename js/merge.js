import { supabase } from "./supabase.js";

const params = new URLSearchParams(location.search);
const name = params.get("name");

const candidatesEl = document.getElementById("candidates");
const previewEl = document.getElementById("preview");
const mergeBtn = document.getElementById("mergeBtn");

let primary = null;
let secondary = null;
let people = [];

function cardHtml(p) {
  return `
    <strong>${p.first_name}</strong>
    ${p.birth_year ? `(${p.birth_year})` : ""}
    <br/>
    <small>ID: ${p.id.slice(0,8)}…</small>
  `;
}

function renderCandidates() {
  candidatesEl.innerHTML = "";
  people.forEach(p => {
    const div = document.createElement("div");
    div.className = "person-card";
    div.innerHTML = cardHtml(p);

    div.onclick = () => {
      if (!primary || (primary && secondary)) {
        primary = p;
        secondary = null;
      } else if (!secondary && p.id !== primary.id) {
        secondary = p;
      }

      updateUI();
    };

    if (primary?.id === p.id) div.classList.add("selected-primary");
    if (secondary?.id === p.id) div.classList.add("selected-secondary");

    candidatesEl.appendChild(div);
  });
}

async function loadRelationships(id) {
  const asP = await supabase.from("relationships").select("*").eq("person_id", id);
  const asR = await supabase.from("relationships").select("*").eq("related_person_id", id);
  return { asP: asP.data || [], asR: asR.data || [] };
}

async function updateUI() {
  renderCandidates();

  if (!primary || !secondary) {
    previewEl.innerHTML = "<em>Select a Primary and Secondary to preview.</em>";
    mergeBtn.disabled = true;
    return;
  }

  const pRel = await loadRelationships(primary.id);
  const sRel = await loadRelationships(secondary.id);

  previewEl.innerHTML = `
    <p><strong>Primary (keep):</strong> ${primary.first_name}</p>
    <p><strong>Secondary (merge):</strong> ${secondary.first_name}</p>

    <p>Primary relationships: ${pRel.asP.length + pRel.asR.length}</p>
    <p>Secondary relationships to move: ${sRel.asP.length + sRel.asR.length}</p>

    <p class="warn">
      Secondary person will be permanently removed after merge.
    </p>
  `;

  mergeBtn.disabled = false;
}

async function executeMerge() {
  if (!confirm("This operation is IRREVERSIBLE. Proceed?")) return;

  const payload = {
    primary_id: primary.id,
    duplicate_id: secondary.id
  };

  const { error } = await supabase.rpc("merge_people", payload);

  if (error) {
    alert("Merge failed: " + error.message);
  } else {
    alert("Merge completed successfully.");
    location.href = "duplicates.html";
  }
}

// ---------- Load candidates ----------
async function init() {
  if (!name) {
    candidatesEl.textContent = "No name specified.";
    return;
  }

  const { data } = await supabase
    .from("people")
    .select("id, first_name, birth_year")
    .eq("first_name", name);

  people = data || [];
  renderCandidates();
}

mergeBtn.onclick = executeMerge;
init();

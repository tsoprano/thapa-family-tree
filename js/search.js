import { supabase } from "./supabase.js";

const input = document.getElementById("personSearch");
const resultsEl = document.getElementById("searchResults");

if (input) {
  let debounce;

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 300);
  });
}

async function runSearch() {
  const q = input.value.trim();
  resultsEl.innerHTML = "";

  if (q.length < 2) return;

  const { data, error } = await supabase
    .from("people")
    .select("id, first_name, birth_year")
    .ilike("first_name", `%${q}%`)
    .order("first_name")
    .limit(10);

  if (error || !data?.length) return;

  for (const p of data) {
    const li = document.createElement("li");
    li.innerHTML = `
      person.html?id=${p.id}
        ${p.first_name}${p.birth_year ? ` (${p.birth_year})` : ""}
      </a>
    `;
    resultsEl.appendChild(li);
  }
}
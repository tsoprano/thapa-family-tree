import { supabase } from "./supabase.js";

/**
 * Returns { data: person|null, error: object|null }
 * Never throws, never leaves data undefined.
 */
export async function getPerson(id) {
  //console.log("[getPerson] id =", id); // debug

  const res = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .limit(1); // safe

  // Network / RLS / SQL error
  if (res.error) {
    console.error("[getPerson] error =", res.error);
    return { data: null, error: res.error };
  }

  // No rows found
  if (!res.data || res.data.length === 0) {
    console.warn("[getPerson] no person found for id", id);
    return { data: null, error: { message: "No person found for this ID." } };
  }

  // Exactly one row
  return { data: res.data[0], error: null };
}

/* OPTIONAL: You can harden the other functions later too */
export async function getParents(id) {
  const rel = await supabase
    .from("relationships")
    .select("related_person_id")
    .eq("person_id", id)
    .eq("relationship_type", "parent");

  if (rel.error) return { data: [], error: rel.error };
  const parentIds = rel.data.map(r => r.related_person_id);
  if (parentIds.length === 0) return { data: [], error: null };

  const people = await supabase
    .from("people")
    .select("*")
    .in("id", parentIds);

  return { data: people.data || [], error: people.error || null };
}

export async function getChildren(id) {
  const rel = await supabase
    .from("relationships")
    .select("person_id")
    .eq("related_person_id", id)
    .eq("relationship_type", "parent");

  if (rel.error) return { data: [], error: rel.error };
  const childIds = rel.data.map(r => r.person_id);
  if (childIds.length === 0) return { data: [], error: null };

  const people = await supabase
    .from("people")
    .select("*")
    .in("id", childIds);

  return { data: people.data || [], error: people.error || null };
}

/** Siblings (share >=1 parent). Excludes the person. Deduplicated. */
export async function getSiblings(id) {
  // Step 1: parent IDs of the current person
  const parentRel = await supabase
    .from("relationships")
    .select("related_person_id")
    .eq("person_id", id)
    .eq("relationship_type", "parent");

  if (parentRel.error) return { data: [], error: parentRel.error };
  const parentIds = (parentRel.data || []).map(r => r.related_person_id);

  if (parentIds.length === 0) {
    // No parents recorded => no way to derive siblings
    return { data: [], error: null };
  }

  // Step 2: all children of those parent(s)
  const childRel = await supabase
    .from("relationships")
    .select("person_id")
    .in("related_person_id", parentIds)
    .eq("relationship_type", "parent");

  if (childRel.error) return { data: [], error: childRel.error };

  // Step 3: unique child IDs minus self
  const siblingIdSet = new Set(
    (childRel.data || []).map(r => r.person_id).filter(pid => pid !== id)
  );
  const siblingIds = Array.from(siblingIdSet);
  if (siblingIds.length === 0) return { data: [], error: null };

  // Step 4: fetch sibling people rows
  const res = await supabase
    .from("people")
    .select("id, first_name")
    .in("id", siblingIds);

  return { data: res.data || [], error: res.error || null };
}

/** Spouses: anyone connected via 'spouse' either direction */
export async function  getSpouses(id) {
  // spouse links where this person is the source
  const relA = await supabase
    .from("relationships")
    .select("related_person_id")
    .eq("person_id", id)
    .eq("relationship_type", "spouse");

  // spouse links where this person is the target
  const relB = await supabase
    .from("relationships")
    .select("person_id")
    .eq("related_person_id", id)
    .eq("relationship_type", "spouse");

  if (relA.error || relB.error) {
    return { data: [], error: relA.error || relB.error };
  }

  const ids = new Set();
  (relA.data || []).forEach(r => ids.add(r.related_person_id));
  (relB.data || []).forEach(r => ids.add(r.person_id));
  const spouseIds = Array.from(ids);

  if (spouseIds.length === 0) return { data: [], error: null };

  const res = await supabase
    .from("people")
    .select("id, first_name")
    .in("id", spouseIds);

  return { data: res.data || [], error: res.error || null };
}

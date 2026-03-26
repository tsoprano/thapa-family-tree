import { supabase } from "./supabase.js";

export async function getPerson(id) {
  const res = await supabase
    .from("people")
    .select("*")
    .eq("id", id);

  if (res.error) return res;

  return {
    data: res.data[0],
    error: null
  };
}

export async function getChildren(id) {
  return supabase
    .from("relationships")
    .select("people!relationships_person_id_fkey(*)")
    .eq("related_person_id", id)
    .eq("relationship_type", "parent");
}

export async function getParents(id) {
  return supabase
    .from("relationships")
    .select("people!relationships_related_person_id_fkey(*)")
    .eq("person_id", id)
    .eq("relationship_type", "parent");
}

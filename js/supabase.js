import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://wjxvwicglqvkprvhnghh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeHZ3aWNnbHF2a3BydmhuZ2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTcyNjIsImV4cCI6MjA5MDEzMzI2Mn0.MjUpI1mUyGE4ngoA0gvqocQW-o0UO77P0YL2pNGmQr4",
  {
    db: {
      schema: "public"
    }
  }
);


// Expose for debugging in DevTools
if (typeof window !== "undefined") {
  window.supabase = supabase;
}

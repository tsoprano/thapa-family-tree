import { getCurrentUser, isAdmin, logout } from "./auth.js";

export async function renderAuthNav() {
  const nav = document.getElementById("authNav");

  if (!nav) return;

  const user = await getCurrentUser();

  if (!user) {
    nav.innerHTML = `
      <a href="login.html">Login</a>
    `;
    return;
  }

  const admin = await isAdmin();

  nav.innerHTML = `
    <span>
      Logged in as ${user.email}
      ${admin ? "<strong> (Admin)</strong>" : ""}
    </span>

    ${admin ? `
      <a href="duplicates.html" style="margin-left:1rem;">
        Duplicates
      </a>
    ` : ""}

    <button id="logoutBtn" style="margin-left:1rem;">
      Logout
    </button>
  `;

  document.getElementById("logoutBtn").onclick = logout;
}
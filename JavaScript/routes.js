// ==========================================
// Asprients Route Configuration
// Works on Localhost & GitHub Pages
// ==========================================

const BASE =
  location.hostname === "architraj499.github.io"
    ? "/Asprients"
    : "";

export const ROUTES = {
  // Main Pages
  HOME: `${BASE}/index.html`,
  DASHBOARD: `${BASE}/dashboard/home.html`,
  PROFILE: `${BASE}/dashboard/profile.html`,
  PERSONAL: `${BASE}/dashboard/personal.html`,

  // Legal
  PRIVACY: `${BASE}/legal/privacy.html`,
  TERMS: `${BASE}/legal/tou.html`,
  CONTACT: `${BASE}/legal/contactus.html`,
  ACCOUNT_DELETION: `${BASE}/legal/acd.html`,

  // Common
  MAINTENANCE: `${BASE}/common/maintenance.html`,
  COMING_SOON: `${BASE}/common/soon.html`,

  // Sections
  BOARDS: `${BASE}/boards/boards.html`,
  CUET: `${BASE}/cuet/cuet.html`,
  CA: `${BASE}/ca/cafoundation.html`,
};
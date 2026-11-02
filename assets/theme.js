const STORAGE_KEY = "practicumflow-theme";

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  } catch {
    return "light";
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  icon.textContent = isDark ? "\u2600" : "\u263e";
  label.textContent = isDark ? "Light mode" : "Dark mode";

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The mode still works for this page if browser storage is unavailable.
  }
}

document.documentElement.dataset.theme = getSavedTheme();

const toggle = document.createElement("button");
toggle.type = "button";
toggle.className = "theme-toggle";
toggle.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span><span class="theme-toggle-label"></span>';
const icon = toggle.querySelector(".theme-toggle-icon");
const label = toggle.querySelector(".theme-toggle-label");

toggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

document.body.append(toggle);
setTheme(document.documentElement.dataset.theme);

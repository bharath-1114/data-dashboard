// app.js


if (localStorage.getItem("hasData") === "true") {
  document.body.classList.add("has-file");
}


// ===== GLOBAL STATE =====
window.isFileUploaded = localStorage.getItem("hasData") === "true";
window.isUploading = false;

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("hasData") === "true") {
    window.isFileUploaded = true;
  }
});


// ===== PAGE STATE HANDLER =====
function updatePageState(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const emptyState = section.querySelector(".empty-state");

  // Map section → actual content container
  const contentMap = {
    table: "#pageTable",
    fulltable: "#pageFulltable",
    charts: "#pageCharts",
    custom: "#customPage",
    chatbot: "#chatarea"
  };

  const contentSelector = contentMap[sectionId];
  const content = contentSelector
    ? section.querySelector(contentSelector)
    : null;

  // UPLOAD page → skip logic
  if (sectionId === "upload") return;

  if (window.isFileUploaded) {
    emptyState?.classList.add("hidden");
    content?.classList.remove("hidden");
  } else {
    emptyState?.classList.remove("hidden");
    content?.classList.add("hidden");
  }

  const customEmpty = document.getElementById("customEmptyState");
  const customPage = document.getElementById("customPage");

  if (window.isFileUploaded) {
    customEmpty.classList.add("hidden");
    customPage.classList.remove("hidden");
  } else {
    customEmpty.classList.remove("hidden");
    customPage.classList.add("hidden");
  }

}
  





// ===== SHOW SECTION =====
window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  const section = document.getElementById(id);
  if (!section) return;

  section.classList.remove("hidden");
  localStorage.setItem("lastSection", id);

  updatePageState(section);
};

// ===== ROUTER =====
function handleRoute() {
  const section =
    location.hash.replace("#", "") ||
    localStorage.getItem("lastSection") ||
    "upload";

  showSection(section);
}

// ===== NAV =====
document.querySelectorAll(".nav-item").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    location.hash = link.dataset.section;
  });
});

function openUpgradeModal() {
  document.getElementById("upgradeModal")?.classList.remove("hidden");
}

function closeUpgradeModal() {
  document.getElementById("upgradeModal")?.classList.add("hidden");
}

function goLogin() {
  window.location.href = "auth.html?mode=login";
}

function goSignup() {
  window.location.href = "auth.html?mode=signup";
}


// ===== INIT =====
document.addEventListener("DOMContentLoaded", handleRoute);
window.addEventListener("hashchange", handleRoute);

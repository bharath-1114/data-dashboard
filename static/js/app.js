// app.js


// if (localStorage.getItem("hasData") === "true") {
//   document.body.classList.add("has-file");
// }
function hasUploadedData(){
  return localStorage.getItem("hasData") == "true";
}

if(hasUploadedData()){
  document.body.classList.add('has-file');
}

// ===== GLOBAL STATE =====
// window.isFileUploaded = localStorage.getItem("hasData") === "true";
window.isFileUploaded = hasUploadedData();
window.isUploading = false;

document.addEventListener("DOMContentLoaded", () => {
  // if (localStorage.getItem("hasData") === "true") {
  //   window.isFileUploaded = true;
  // }
  window.isFileUploaded = hasUploadedData();
});


// ===== PAGE STATE HANDLER =====
function updatePageState(sectionId) {
  // const section = document.getElementById(sectionId);
  const section = typeof sectionId === "string" ? document.getElementById(sectionId): sectionId;
  if (!section) return;
  const sectionKey = section.id;

  const emptyState = section.querySelector(".empty-state");

  // Map section → actual content container
  const contentMap = {
    table: "#pageTable",
    fulltable: "#pageFulltable",
    charts: "#pageCharts",
    custom: "#customPage",
    chatbot: "#botpage"
  };

  const contentSelector = contentMap[sectionKey];
  const content = contentSelector
    ? section.querySelector(contentSelector)
    : null;

  // UPLOAD page → skip logic
  if (sectionKey === "upload") return;

  if (hasUploadedData()) {
    emptyState?.classList.add("hidden");
    content?.classList.remove("hidden");
  } else {
    emptyState?.classList.remove("hidden");
    content?.classList.add("hidden");
  }

  const customEmpty = document.getElementById("customEmptyState");
  const customPage = document.getElementById("customPage");

  if (hasUploadedData()) {
    customEmpty.classList.add("hidden");
    customPage.classList.remove("hidden");
  } else {
    customEmpty.classList.remove("hidden");
    customPage.classList.add("hidden");
  }

}
  





// ===== SHOW SECTION =====
window.canAccesssSection = function (id) {
  const fileDependentSections = new Set(["table","fulltable","charts","custom","chatbot"]);
  if (!hasUploadedData() && fileDependentSections.has(id)) {
    // openUpgradeModal();
    // alert("Please upload a file")
    return
  }
  return hasUploadedData() || !fileDependentSections.has(id);
};


function applySection(id) {
  // Hide all sections 
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  const section = document.getElementById(id);
  if (!section) return;

  section.classList.remove("hidden");
  localStorage.setItem("lastSection", id);

  updatePageState(section);
}

window.showSection = function (id) {
  if (!window.canAccessSection?.(id)) {
    // openUpgradeModal();
    // alert("Please upload a file")
    if (location.hash.replace("#", "") !== "upload") {
      location.hash = "upload";
    }
    return;
  }

  if (location.hash.replace("#", "") !== id) {
    location.hash = id;
    return;
  }

  applySection(id);
}


// ===== ROUTER =====
function handleRoute() {
  const section =
    location.hash.replace("#", "") ||
    localStorage.getItem("lastSection") ||
    "upload";
  
    if (!window.canAccessSection?.(section)) {
      applySection("upload");
      return;
    }
  
    applySection(section);
}

// ===== NAV =====
document.querySelectorAll(".nav-item").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    // location.hash = link.dataset.section;
    showSection(link.dataset.section);
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

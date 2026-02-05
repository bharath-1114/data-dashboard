



let pageCount = 0;
let currentPageCanvas = null;
let activePage = null;

function renumberPages() {
  const pages = document.querySelectorAll(".a4-page");

  pages.forEach((page, index) => {
    const pageNo = index + 1;

    page.dataset.page = pageNo;
    page.querySelector(".a4-header").innerText =
      `Custom Dashboard – Page ${pageNo}`;

    page.querySelector(".a4-footer").innerText =
      `Page ${pageNo}`;
  });
}


document.addEventListener("click", e => {
  const page = e.target.closest(".a4-page");
  if (!page) return;

  document.querySelectorAll(".a4-page").forEach(p => {
    p.classList.remove("active-print-page");
  });

  page.classList.add("active-print-page");
  activePage = page;
  currentPageCanvas = page.querySelector(".a4-canvas");
});

const deleteBtn = document.getElementById("deletePageBtn");
if (deleteBtn) deleteBtn.addEventListener("click", () => {
  if (!activePage) {
    alert("Please select a page to delete");
    return;
  }
  
  // confirmation (optional but recommended)
  const confirmDelete = confirm("Delete selected page?");
  if (!confirmDelete) return;
  
  activePage.remove();
  activePage = null;
  
  renumberPages();     // 🔁 fix numbering
  selectFirstPage(); // ⭐ select first page after deletion
  
  console.log("Selected page deleted");
});


function selectFirstPage() {
  const pages = document.querySelectorAll(".a4-page");

  document.querySelectorAll(".a4-page").forEach(p => {
    p.classList.remove("active-print-page");
  });

  if (pages.length > 0) {
    pages[0].classList.add("active-print-page");
    activePage = pages[0];
    currentPageCanvas = pages[0].querySelector(".a4-canvas");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // create default first page
  createA4Page("landscape");
});


/* CREATE A4 PAGE */
function createA4Page(orientation = "portrait") {
  const page = document.createElement("div");
  page.className = "a4-page";
  if (orientation === "landscape") page.classList.add("landscape");

  const header = document.createElement("div");
  header.className = "a4-header";

  const canvas = document.createElement("div");
  canvas.className = "a4-canvas";

  const footer = document.createElement("div");
  footer.className = "a4-footer";

  page.append(header, canvas, footer);
  document.getElementById("customContainer").appendChild(page);

  currentPageCanvas = canvas;
  activePage = page;

  renumberPages();       // 🔁 IMPORTANT
  selectFirstPage();     // ⭐ default behavior
}



/* Buttons */

document.getElementById("addPortrait").onclick = () => {
  createA4Page("portrait");
  console.log("Page added");
};
document.getElementById("addLandscape").onclick = () => {
  createA4Page("landscape");
  console.log("addLandscape clicked");
};



/* INIT FIRST PAGE */
(function () {
  const addPageBtn = document.getElementById("addPageBtn");
  if (addPageBtn) {
    addPageBtn.addEventListener("click", () => createA4Page());
  }
})();





function addCardToCustom(card) {
  card.classList.add("custom-card");

  card.style.left = "10px";
  card.style.top = "10px";
  card.style.width = "300px";
  card.style.height = "fit-content";

  currentPageCanvas.appendChild(card);

  enableFreeMove(card);
  enableResize(card);

  checkOverflow(card);
}

function checkOverflow(card) {
  const rect = card.getBoundingClientRect();
  const canvasRect = currentPageCanvas.getBoundingClientRect();

  if (rect.bottom > canvasRect.bottom) {
    // Move to next page
    const nextCanvas = createA4Page();

    card.style.top = "50px";
    card.style.left = "50px";

    nextCanvas.appendChild(card);
    currentPageCanvas = nextCanvas;
  }
}

function enableFreeMove(card) {
  let startX, startY, startLeft, startTop;

  card.addEventListener("mousedown", e => {
    if (e.target.closest(".resize-handle")) return;

    const canvas = card.parentElement;
    const cRect = canvas.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    startLeft = card.offsetLeft;
    startTop = card.offsetTop;

    function onMove(ev) {
      let newLeft = startLeft + (ev.clientX - startX);
      let newTop = startTop + (ev.clientY - startY);

      /* 🔒 Boundaries */
      newLeft = Math.max(0, Math.min(newLeft, cRect.width - cardRect.width));
      newTop = Math.max(0, Math.min(newTop, cRect.height - cardRect.height));

      card.style.left = newLeft + "px";
      card.style.top = newTop + "px";
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", onMove);
    }, { once: true });
  });
}


function enableResize(card) {
  const handle = document.createElement("div");
  handle.className = "resize-handle";
  card.appendChild(handle);

  handle.addEventListener("mousedown", e => {
    e.stopPropagation();
    const canvas = card.parentElement;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = card.offsetWidth;
    const startH = card.offsetHeight;

    function onMove(ev) {
      let newW = startW + (ev.clientX - startX);
      let newH = startH + (ev.clientY - startY);

      newW = Math.min(newW, canvas.clientWidth - card.offsetLeft);
      newH = Math.min(newH, canvas.clientHeight - card.offsetTop);

      card.style.width = newW + "px";
      card.style.height = newH + "px";
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", onMove);
    }, { once: true });
  });
}


function printAllPages() {
  document.querySelectorAll(".a4-page").forEach(p => {
    p.style.display = "block";
  });

  // 🔁 redraw all charts
  if (window.Chart) {
    Chart.helpers.each(Chart.instances, function(chart) {
      chart.resize();
      chart.update();
    });
  }

  setTimeout(() => {
    window.print();
  }, 300);
}



function printAllPages() {
  document.body.classList.add("print-landscape");
  window.print();
  document.body.classList.remove("print-landscape");
}



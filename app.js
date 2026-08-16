/* =========================================================
   BOOKSWAGON LABEL STUDIO — FINAL JS
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL DATA
   ========================================================= */

const FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Courier New",
  "Lucida Console",
  "Lucida Sans",
  "Palatino Linotype",
  "Book Antiqua",
  "Garamond",
  "Cambria",
  "Calibri",
  "Candara",
  "Consolas",
  "Constantia",
  "Corbel",
  "Segoe UI",
  "Segoe UI Light",
  "Segoe UI Semibold",
  "Century Gothic",
  "Franklin Gothic Medium",
  "Gill Sans",
  "Impact",
  "Rockwell",
  "Baskerville",
  "Didot",
  "Copperplate",
  "Futura",
  "Optima",
  "Avenir",
  "Monaco",
  "Menlo",
  "Courier",
  "System UI",
  "Sans Serif",
  "Serif",
  "Monospace"
];

const BORDER_STYLES = [
  ["none", "No Border"],
  ["solid", "Solid"],
  ["dashed", "Dashed"],
  ["dotted", "Dotted"],
  ["double", "Double"],
  ["groove", "Groove"],
  ["ridge", "Ridge"],
  ["inset", "Inset"],
  ["outset", "Outset"],
  ["thin", "Thin Solid"],
  ["medium", "Medium Solid"],
  ["thick", "Thick Solid"],
  ["thin-double", "Thin Double"],
  ["thick-double", "Thick Double"],
  ["short-dash", "Short Dash"],
  ["long-dash", "Long Dash"],
  ["dash-dot", "Dash Dot"],
  ["dash-dot-dot", "Dash Dot Dot"],
  ["triple", "Triple"],
  ["quadruple", "Quadruple"],
  ["soft", "Soft"],
  ["bold", "Bold"],
  ["extra", "Extra Bold"],
  ["minimal", "Minimal"],
  ["classic", "Classic"],
  ["modern", "Modern"],
  ["decorative", "Decorative"],
  ["shadow", "Shadow"],
  ["rounded", "Rounded"],
  ["square", "Square"],
  ["double-soft", "Double Soft"],
  ["double-bold", "Double Bold"],
  ["groove-thin", "Thin Groove"],
  ["ridge-thin", "Thin Ridge"],
  ["classic-double", "Classic Double"]
];

/* =========================================================
   SHORT HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(type, title, message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.className = `toast ${type}`;

  const icon = $("#toastIcon");
  const toastTitle = $("#toastTitle");
  const toastText = $("#toastText");

  if (icon) {
    icon.textContent = type === "green" ? "✓" : "!";
  }

  if (toastTitle) {
    toastTitle.textContent = title;
  }

  if (toastText) {
    toastText.textContent = message;
  }

  void toast.offsetWidth;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================================================
   FONT DROPDOWNS
   ========================================================= */

function populateFontSelect(select) {
  if (!select || select.options.length > 0) return;

  FONTS.forEach(font => {
    const option = document.createElement("option");

    option.value = font;
    option.textContent = font;

    select.appendChild(option);
  });
}

function initFonts() {
  $$("#poFont, #boxFont, .fontSelect").forEach(populateFontSelect);
}

/* =========================================================
   BORDER DROPDOWNS
   ========================================================= */

function populateBorderSelect(select) {
  if (!select || select.options.length > 0) return;

  BORDER_STYLES.forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;

    select.appendChild(option);
  });
}

function initBorders() {
  $$(
    "#pageBorderStyle, #poBorderStyle, #boxBorderStyle, #allBorderStyle, .borderSelect"
  ).forEach(populateBorderSelect);
}

/* =========================================================
   MODULE SWITCHING
   ========================================================= */

function initModules() {
  $$(".module").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.panel;

      $$(".module").forEach(item => {
        item.classList.remove("active");
      });

      $$(".panel").forEach(panel => {
        panel.classList.remove("active");
      });

      button.classList.add("active");

      const target = document.getElementById(targetId);

      if (target) {
        target.classList.add("active");
      }

      const title =
        button.querySelector(".module-info strong")?.textContent ||
        "Tool";

      showToast(
        "green",
        "Tool Enabled",
        `${title} has been enabled.`
      );
    });
  });

  $$(".close").forEach(button => {
    button.addEventListener("click", () => {
      const panel = button.closest(".panel");

      if (panel) {
        panel.classList.remove("active");
      }

      $$(".module").forEach(item => {
        item.classList.remove("active");
      });

      showToast(
        "red",
        "Tool Disabled",
        "The selected tool has been disabled."
      );
    });
  });
}

/* =========================================================
   COCOBLUE TABS
   ========================================================= */

function initTabs() {
  $$("#cocoPanel .tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$("#cocoPanel .tab").forEach(item => {
        item.classList.remove("active");
      });

      $$("#cocoPanel .coco-tab").forEach(section => {
        section.style.display = "none";
      });

      tab.classList.add("active");

      const target = document.getElementById(tab.dataset.tab);

      if (target) {
        target.style.display = "block";
      }

      showToast(
        "green",
        "Input Mode Enabled",
        `${tab.textContent.trim()} has been enabled.`
      );
    });
  });
}

/* =========================================================
   MANUAL PO — 20 FIELDS
   ========================================================= */

function initManualFields() {
  const grid = $("#manualGrid");

  if (!grid || grid.children.length) return;

  for (let i = 1; i <= 20; i++) {
    const item = document.createElement("div");

    item.className = "manual-item";

    item.innerHTML = `
      <small>PO ${i}</small>
      <input
        class="manualPO"
        type="text"
        placeholder="PO Number"
      >
    `;

    grid.appendChild(item);
  }
}

/* =========================================================
   BULK PO
   ========================================================= */

function getBulkPOs() {
  const input = $("#bulkInput");

  if (!input) return [];

  return input.value
    .split(/[,\n\r]+/)
    .map(value => value.trim())
    .filter(Boolean);
}

function initBulk() {
  const input = $("#bulkInput");
  const count = $("#bulkCount");

  if (!input) return;

  input.addEventListener("input", () => {
    const values = getBulkPOs();

    if (count) {
      count.textContent = `${values.length} PO numbers`;
    }

    updateCocoPreview();
  });
}

/* =========================================================
   EXCEL
   ========================================================= */

function initExcel() {
  const input = $("#excelInput");
  const status = $("#excelStatus");

  if (!input) return;

  input.addEventListener("change", () => {
    if (!input.files.length) {
      if (status) {
        status.textContent = "No Excel file selected.";
      }

      return;
    }

    const file = input.files[0];

    if (status) {
      status.textContent =
        `${file.name} selected — first row will be treated as header.`;
    }

    showToast(
      "green",
      "Excel Enabled",
      "Excel input has been enabled."
    );
  });
}

/* =========================================================
   RANGE VALIDATION
   ========================================================= */

function validateBoxRange(startSelector, endSelector) {
  const startInput = $(startSelector);
  const endInput = $(endSelector);

  if (!startInput || !endInput) return true;

  if (
    startInput.value.trim() === "" ||
    endInput.value.trim() === ""
  ) {
    startInput.setCustomValidity("");
    endInput.setCustomValidity("");
    return true;
  }

  const start = safeNumber(startInput.value);
  const end = safeNumber(endInput.value);

  if (start > end) {
    const message =
      "Start Box Number must be less than End Box Number.";

    startInput.setCustomValidity(message);
    endInput.setCustomValidity(message);

    showToast(
      "red",
      "Invalid Box Range",
      "Start Box Number is greater than End Box Number."
    );

    return false;
  }

  startInput.setCustomValidity("");
  endInput.setCustomValidity("");

  return true;
}

/* =========================================================
   CUSTOM PAGE
   ========================================================= */

function initCustomPage() {
  const pageSize = $("#pageSize");
  const customPage = $("#customPage");

  if (pageSize) {
    pageSize.addEventListener("change", () => {
      const custom = pageSize.value === "custom";

      customPage?.classList.toggle("open", custom);

      showToast(
        custom ? "green" : "red",
        custom
          ? "Custom Page Enabled"
          : "Custom Page Disabled",
        custom
          ? "Custom width and height fields are now available."
          : "Custom page fields are hidden."
      );

      updateCocoPreview();
    });
  }

  const labelsPerPage = $("#labelsPerPage");
  const customLabels = $("#customLabels");

  if (labelsPerPage) {
    labelsPerPage.addEventListener("change", () => {
      const custom = labelsPerPage.value === "custom";

      customLabels?.classList.toggle("open", custom);

      updateCocoPreview();
    });
  }
}

/* =========================================================
   ALL BORDER
   ========================================================= */

function initAllBorder() {
  const allBorder = $("#allBorder");

  if (!allBorder) return;

  allBorder.addEventListener("change", () => {
    const enabled = allBorder.checked;

    const controls = [
      "#pageBorder",
      "#poBorder",
      "#boxBorder"
    ];

    controls.forEach(selector => {
      const checkbox = $(selector);

      if (!checkbox) return;

      checkbox.checked = enabled;
      checkbox.disabled = enabled;

      checkbox
        .closest(".border-card")
        ?.classList.toggle("frozen", enabled);
    });

    showToast(
      enabled ? "green" : "red",
      enabled
        ? "All Border Enabled"
        : "All Border Disabled",
      enabled
        ? "Page, PO and Box borders are selected and frozen."
        : "Individual border controls are available again."
    );

    updateCocoPreview();
  });
}

/* =========================================================
   BORDER CSS
   ========================================================= */

function getBorderCSS(style) {
  const map = {
    none: "none",
    solid: "1px solid #111",
    dashed: "2px dashed #111",
    dotted: "2px dotted #111",
    double: "3px double #111",
    groove: "3px groove #111",
    ridge: "3px ridge #111",
    inset: "3px inset #111",
    outset: "3px outset #111",
    thin: "1px solid #111",
    medium: "2px solid #111",
    thick: "4px solid #111",
    "thin-double": "2px double #111",
    "thick-double": "5px double #111",
    "short-dash": "2px dashed #111",
    "long-dash": "3px dashed #111",
    "dash-dot": "2px dashed #111",
    "dash-dot-dot": "2px dashed #111",
    triple: "5px double #111",
    quadruple: "6px double #111",
    soft: "1px solid #94a3b8",
    bold: "4px solid #111",
    extra: "6px solid #111",
    minimal: "1px solid #cbd5e1",
    classic: "2px solid #111",
    modern: "2px solid #2563eb",
    decorative: "3px double #111",
    shadow: "1px solid #111",
    rounded: "2px solid #111",
    square: "2px solid #111",
    "double-soft": "3px double #64748b",
    "double-bold": "5px double #111",
    "groove-thin": "2px groove #64748b",
    "ridge-thin": "2px ridge #64748b",
    "classic-double": "4px double #111"
  };

  return map[style] || "none";
}

/* =========================================================
   LABEL COUNT
   ========================================================= */

function getCocoLabelCount() {
  const select = $("#labelsPerPage");

  if (!select) return 1;

  if (select.value === "custom") {
    return Math.max(
      1,
      safeNumber(
        $("#customLabelCount")?.value,
        1
      )
    );
  }

  return Math.max(
    1,
    safeNumber(select.value, 1)
  );
}

/* =========================================================
   PAGE SIZE
   ========================================================= */

function applyPreviewPageSize(page) {
  if (!page) return;

  const pageSize = $("#pageSize")?.value;

  if (pageSize === "4x6") {
    page.style.width = "508px";
    page.style.minHeight = "762px";
  }

  else if (pageSize === "70x35") {
    page.style.width = "420px";
    page.style.minHeight = "210px";
  }

  else if (pageSize === "a4") {
    page.style.width = "595px";
    page.style.minHeight = "842px";
  }

  else {
    const width = Math.max(
      20,
      safeNumber(
        $("#customWidth")?.value,
        70
      )
    );

    const height = Math.max(
      20,
      safeNumber(
        $("#customHeight")?.value,
        35
      )
    );

    page.style.width =
      `${Math.max(200, width * 5)}px`;

    page.style.minHeight =
      `${Math.max(150, height * 5)}px`;
  }
}

/* =========================================================
   GET COCO PO
   ========================================================= */

function getSelectedCocoPO() {
  const activeTab =
    $("#cocoPanel .tab.active")?.dataset.tab;

  if (activeTab === "bulkTab") {
    return getBulkPOs()[0] || "BWG123";
  }

  if (activeTab === "manualTab") {
    return (
      $(".manualPO")?.value.trim() ||
      "BWG123"
    );
  }

  return (
    $("#poNumber")?.value.trim() ||
    "BWG123"
  );
}

/* =========================================================
   BOX FLOW
   ========================================================= */

function getBoxNumber(index, start, end) {
  const flow =
    document.querySelector(
      'input[name="boxFlow"]:checked'
    )?.value || "sequential";

  if (flow === "same") {
    return start;
  }

  if (flow === "alternate") {
    return index % 2 === 0
      ? start
      : Math.min(start + 1, end);
  }

  return start + index;
}

/* =========================================================
   COCO PREVIEW
   ========================================================= */

function updateCocoPreview() {
  const page = $("#cocoPreview");

  if (!page) return;

  applyPreviewPageSize(page);

  const count = Math.min(
    getCocoLabelCount(),
    1000
  );

  let columns = 1;

  if (count >= 2) columns = 2;
  if (count >= 6) columns = 3;
  if (count >= 12) columns = 4;

  page.style.gridTemplateColumns =
    `repeat(${columns}, minmax(0,1fr))`;

  page.innerHTML = "";

  const po = getSelectedCocoPO();

  const poPrefix =
    $("#poPrefix")?.value.trim() || "";

  const boxPrefix =
    $("#boxPrefix")?.value.trim() ||
    "BOX NO.";

  const start = safeNumber(
    $("#startBox")?.value,
    121
  );

  const end = safeNumber(
    $("#endBox")?.value,
    start + count - 1
  );

  const contentMode =
    document.querySelector(
      'input[name="contentMode"]:checked'
    )?.value || "po";

  const lineMode =
    document.querySelector(
      'input[name="lineMode"]:checked'
    )?.value || "separate";

  /* Page border */

  const pageBorderEnabled =
    $("#pageBorder")?.checked ||
    $("#allBorder")?.checked;

  if (pageBorderEnabled) {
    const style =
      $("#allBorder")?.checked
        ? $("#allBorderStyle")?.value
        : $("#pageBorderStyle")?.value;

    page.style.border =
      getBorderCSS(style);
  } else {
    page.style.border = "none";
  }

  /* Create labels */

  for (let i = 0; i < count; i++) {
    const label = document.createElement("div");

    label.className = "label";

    label.style.flexDirection =
      lineMode === "same"
        ? "row"
        : "column";

    /* PO */

    const poElement =
      document.createElement("div");

    poElement.className =
      "po-preview";

    poElement.textContent =
      `${poPrefix}${po}`;

    /* Box */

    const boxElement =
      document.createElement("div");

    boxElement.className =
      "box-preview";

    const boxNumber =
      getBoxNumber(
        i,
        start,
        end
      );

    boxElement.textContent =
      `${boxPrefix}${boxNumber}`;

    /* Content mode */

    if (contentMode === "po") {
      boxElement.style.display = "none";
    }

    if (contentMode === "box") {
      poElement.style.display = "none";
    }

    /* PO font */

    poElement.style.fontFamily =
      $("#poFont")?.value ||
      "Arial";

    poElement.style.fontSize =
      `${safeNumber(
        $("#poSize")?.value,
        20
      )}px`;

    poElement.style.opacity =
      safeNumber(
        $("#poOpacity")?.value,
        100
      ) / 100;

    poElement.style.fontWeight =
      $("#poBold")?.checked
        ? "700"
        : "400";

    poElement.style.fontStyle =
      $("#poItalic")?.checked
        ? "italic"
        : "normal";

    poElement.style.textDecoration =
      $("#poUnderline")?.checked
        ? "underline"
        : "none";

    /* Box font */

    boxElement.style.fontFamily =
      $("#boxFont")?.value ||
      "Arial";

    boxElement.style.fontSize =
      `${safeNumber(
        $("#boxSize")?.value,
        17
      )}px`;

    boxElement.style.opacity =
      safeNumber(
        $("#boxOpacity")?.value,
        100
      ) / 100;

    boxElement.style.fontWeight =
      $("#boxBold")?.checked
        ? "700"
        : "400";

    boxElement.style.fontStyle =
      $("#boxItalic")?.checked
        ? "italic"
        : "normal";

    boxElement.style.textDecoration =
      $("#boxUnderline")?.checked
        ? "underline"
        : "none";

    /* PO border */

    if (
      $("#poBorder")?.checked ||
      $("#allBorder")?.checked
    ) {
      const style =
        $("#allBorder")?.checked
          ? $("#allBorderStyle")?.value
          : $("#poBorderStyle")?.value;

      poElement.style.border =
        getBorderCSS(style);

      poElement.style.padding =
        "3px 6px";
    }

    /* Box border */

    if (
      $("#boxBorder")?.checked ||
      $("#allBorder")?.checked
    ) {
      const style =
        $("#allBorder")?.checked
          ? $("#allBorderStyle")?.value
          : $("#boxBorderStyle")?.value;

      boxElement.style.border =
        getBorderCSS(style);

      boxElement.style.padding =
        "3px 6px";
    }

    label.appendChild(poElement);
    label.appendChild(boxElement);

    page.appendChild(label);
  }
}

/* =========================================================
   OTHER PO PREVIEW
   ========================================================= */

function updateOtherPreview() {
  const po =
    $("#otherPO")?.value.trim() ||
    "BWG123";

  const box =
    safeNumber(
      $("#otherStart")?.value,
      121
    );

  const boxPrefix =
    $("#otherBoxPrefix")?.value.trim() ||
    "BOX NO.";

  const poPreview =
    $("#otherPOPreview");

  const boxPreview =
    $("#otherBoxPreview");

  if (poPreview) {
    poPreview.textContent = po;
  }

  if (boxPreview) {
    boxPreview.textContent =
      `${boxPrefix}${box}`;
  }
}

/* =========================================================
   ISBN
   ========================================================= */

function initISBN() {
  const input = $("#isbnNumber");
  const preview = $("#isbnPreview");

  if (!input || !preview) return;

  input.addEventListener("input", () => {
    preview.textContent =
      input.value.trim() ||
      "Enter ISBN";
  });
}

/* =========================================================
   ADDRESS
   ========================================================= */

function updateAddressPreview() {
  const preview = $("#addressPreview");

  if (!preview) return;

  const address =
    $("#addressInput")?.value.trim() ||
    "Your address will appear here.";

  const email =
    $("#addressEmail")?.value.trim() ||
    "";

  let html =
    escapeHTML(address)
      .replace(/\n/g, "<br>");

  if (email) {
    html +=
      `<br><br>✉️ ${escapeHTML(email)}`;
  }

  preview.innerHTML = html;

  const alignment =
    $("#addressAlign")?.value ||
    "Left";

  preview.style.textAlign =
    alignment.toLowerCase();
}

function initAddress() {
  [
    "#addressInput",
    "#addressEmail",
    "#addressAlign"
  ].forEach(selector => {
    const element = $(selector);

    if (!element) return;

    element.addEventListener(
      "input",
      updateAddressPreview
    );

    element.addEventListener(
      "change",
      updateAddressPreview
    );
  });

  updateAddressPreview();
}

/* =========================================================
   ACTIVE PREVIEW
   ========================================================= */

function getActivePreview() {
  const panel = $(".panel.active");

  if (!panel) {
    showToast(
      "red",
      "No Tool Selected",
      "Please select a tool first."
    );

    return null;
  }

  const page =
    $(".preview-page", panel);

  if (!page) {
    showToast(
      "red",
      "Preview Missing",
      "Live preview could not be found."
    );

    return null;
  }

  return {
    panel,
    page
  };
}

/* =========================================================
   PDF SIZE
   ========================================================= */

function getPDFSize(panel) {
  if (!panel) {
    return {
      width: 210,
      height: 297
    };
  }

  /* CocoBlue */

  if (panel.id === "cocoPanel") {
    const size =
      $("#pageSize")?.value ||
      "4x6";

    if (size === "4x6") {
      return {
        width: 101.6,
        height: 152.4
      };
    }

    if (size === "70x35") {
      return {
        width: 70,
        height: 35
      };
    }

    if (size === "a4") {
      return {
        width: 210,
        height: 297
      };
    }

    return {
      width: Math.max(
        20,
        safeNumber(
          $("#customWidth")?.value,
          70
        )
      ),
      height: Math.max(
        20,
        safeNumber(
          $("#customHeight")?.value,
          35
        )
      )
    };
  }

  /* Other modules */

  const select =
    $(".generic-page-size", panel);

  const value =
    select?.value ||
    "a4";

  if (value === "4x6") {
    return {
      width: 101.6,
      height: 152.4
    };
  }

  if (value === "70x35") {
    return {
      width: 70,
      height: 35
    };
  }

  if (value === "a4") {
    return {
      width: 210,
      height: 297
    };
  }

  return {
    width: 70,
    height: 35
  };
}

/* =========================================================
   GENERATE PDF
   ========================================================= */

async function generatePDF(
  moduleName = "BooksWagon_Label"
) {
  const result =
    getActivePreview();

  if (!result) return;

  if (
    typeof window.html2pdf !==
    "function"
  ) {
    showToast(
      "red",
      "PDF Engine Missing",
      "html2pdf.js is not loaded. Check the script URL."
    );

    return;
  }

  const page =
    result.page;

  const panel =
    result.panel;

  const pdfSize =
    getPDFSize(panel);

  showToast(
    "green",
    "Generating PDF",
    "Creating your PDF..."
  );

  const oldShadow =
    page.style.boxShadow;

  const oldPosition =
    page.style.position;

  page.style.boxShadow =
    "none";

  /*
   * IMPORTANT:
   *
   * The actual visible preview is captured.
   * No hidden clone.
   * No display:none.
   * No negative left position.
   */

  try {
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    const options = {
      margin: 0,

      filename:
        `${moduleName}.pdf`,

      image: {
        type: "jpeg",
        quality: 0.98
      },

      html2canvas: {
        scale: 2,

        useCORS: true,

        allowTaint: true,

        backgroundColor: "#ffffff",

        logging: false,

        scrollX: 0,

        scrollY: 0
      },

      jsPDF: {
        unit: "mm",

        format: [
          pdfSize.width,
          pdfSize.height
        ],

        orientation:
          pdfSize.width >
          pdfSize.height
            ? "landscape"
            : "portrait",

        compress: true
      },

      pagebreak: {
        mode: [
          "css",
          "legacy"
        ]
      }
    };

    await window.html2pdf()
      .set(options)
      .from(page)
      .save();

    showToast(
      "green",
      "PDF Generated",
      `${moduleName}.pdf has been downloaded.`
    );
  }

  catch (error) {
    console.error(
      "PDF Generation Error:",
      error
    );

    showToast(
      "red",
      "PDF Generation Failed",
      error?.message ||
      "Could not generate the PDF."
    );
  }

  finally {
    page.style.boxShadow =
      oldShadow;

    page.style.position =
      oldPosition;
  }
}

/* =========================================================
   PRINT PDF
   ========================================================= */

function printPDF() {
  const result =
    getActivePreview();

  if (!result) return;

  const page =
    result.page;

  const panel =
    result.panel;

  const pdfSize =
    getPDFSize(panel);

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

  if (!printWindow) {
    showToast(
      "red",
      "Popup Blocked",
      "Please allow popups for Print PDF."
    );

    return;
  }

  const pageHTML =
    page.outerHTML;

  printWindow.document.open();

  printWindow.document.write(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
BooksWagon Label Studio - Print
</title>

<style>

*{
  box-sizing:border-box;
}

html,
body{
  margin:0;
  padding:0;
  background:#fff;
}

body{
  width:${pdfSize.width}mm;
  min-height:${pdfSize.height}mm;
}

.preview-page{
  width:${pdfSize.width}mm !important;
  min-height:${pdfSize.height}mm !important;
  margin:0 !important;
  box-shadow:none !important;
  background:#fff !important;
}

.label{
  break-inside:avoid;
  page-break-inside:avoid;
}

@page{
  size:${pdfSize.width}mm ${pdfSize.height}mm;
  margin:0;
}

@media print{

  html,
  body{
    margin:0;
    padding:0;
  }

}

</style>

</head>

<body>

${pageHTML}

<script>

window.onload = function(){

  setTimeout(function(){

    window.focus();

    window.print();

  },500);

};

<\/script>

</body>

</html>
`);

  printWindow.document.close();

  showToast(
    "green",
    "Print PDF",
    "Print dialog is opening..."
  );
}

/* =========================================================
   COCO RESET
   ========================================================= */

function resetCoco() {
  const ids = [
    "poNumber",
    "poPrefix",
    "startBox",
    "endBox"
  ];

  ids.forEach(id => {
    const element = $("#" + id);

    if (element) {
      element.value = "";
    }
  });

  if ($("#boxPrefix")) {
    $("#boxPrefix").value = "BOX NO.";
  }

  if ($("#poOnly")) {
    $("#poOnly").checked = true;
  }

  if ($("#pageSize")) {
    $("#pageSize").value = "4x6";
  }

  if ($("#labelsPerPage")) {
    $("#labelsPerPage").value = "2";
  }

  $("#customPage")
    ?.classList.remove("open");

  $("#customLabels")
    ?.classList.remove("open");

  if ($("#allBorder")) {
    $("#allBorder").checked = false;
  }

  [
    "pageBorder",
    "poBorder",
    "boxBorder"
  ].forEach(id => {
    const element = $("#" + id);

    if (!element) return;

    element.checked = false;
    element.disabled = false;

    element
      .closest(".border-card")
      ?.classList.remove("frozen");
  });

  updateCocoPreview();

  showToast(
    "green",
    "Settings Reset",
    "CocoBlue settings have been reset."
  );
}

/* =========================================================
   LIVE COCO INPUTS
   ========================================================= */

function initCocoLive() {
  $$("#cocoPanel input, #cocoPanel select")
    .forEach(element => {
      element.addEventListener(
        "input",
        updateCocoPreview
      );

      element.addEventListener(
        "change",
        updateCocoPreview
      );
    });
}

/* =========================================================
   LIVE OTHER PO
   ========================================================= */

function initOtherLive() {
  $$("#otherPanel input, #otherPanel select")
    .forEach(element => {
      element.addEventListener(
        "input",
        updateOtherPreview
      );

      element.addEventListener(
        "change",
        updateOtherPreview
      );
    });

  updateOtherPreview();
}

/* =========================================================
   FEATURE ENABLE / DISABLE TOAST
   ========================================================= */

function initFeatureToast() {
  $$('input[type="checkbox"]')
    .forEach(input => {

      if (input.id === "allBorder") {
        return;
      }

      input.addEventListener(
        "change",
        () => {

          const parent =
            input.closest(
              ".choice, .format, .border-card"
            );

          const label =
            parent?.querySelector(
              "label, strong"
            );

          const name =
            label?.textContent.trim() ||
            "Feature";

          showToast(
            input.checked
              ? "green"
              : "red",

            input.checked
              ? "Feature Enabled"
              : "Feature Disabled",

            `${name} has been ${
              input.checked
                ? "enabled"
                : "disabled"
            }.`
          );

          updateCocoPreview();
        }
      );
    });
}

/* =========================================================
   RANGE EVENTS
   ========================================================= */

function initRangeEvents() {
  const cocoStart = $("#startBox");
  const cocoEnd = $("#endBox");

  if (cocoStart) {
    cocoStart.addEventListener(
      "input",
      () => {
        validateBoxRange(
          "#startBox",
          "#endBox"
        );

        updateCocoPreview();
      }
    );
  }

  if (cocoEnd) {
    cocoEnd.addEventListener(
      "input",
      () => {
        validateBoxRange(
          "#startBox",
          "#endBox"
        );

        updateCocoPreview();
      }
    );
  }

  const otherStart = $("#otherStart");
  const otherEnd = $("#otherEnd");

  if (otherStart) {
    otherStart.addEventListener(
      "input",
      () => {
        validateBoxRange(
          "#otherStart",
          "#otherEnd"
        );

        updateOtherPreview();
      }
    );
  }

  if (otherEnd) {
    otherEnd.addEventListener(
      "input",
      () => {
        validateBoxRange(
          "#otherStart",
          "#otherEnd"
        );

        updateOtherPreview();
      }
    );
  }
}

/* =========================================================
   BUTTONS
   ========================================================= */

function initButtons() {
  const generateButton =
    $("#generateCoco");

  const printButton =
    $("#printCoco");

  const resetButton =
    $("#resetCoco");

  if (generateButton) {
    generateButton.addEventListener(
      "click",
      () => {
        if (
          !validateBoxRange(
            "#startBox",
            "#endBox"
          )
        ) {
          return;
        }

        generatePDF(
          "CocoBlue_Label"
        );
      }
    );
  }

  if (printButton) {
    printButton.addEventListener(
      "click",
      () => {

        if (
          !validateBoxRange(
            "#startBox",
            "#endBox"
          )
        ) {
          return;
        }

        printPDF();
      }
    );
  }

  if (resetButton) {
    resetButton.addEventListener(
      "click",
      resetCoco
    );
  }
}

/* =========================================================
   OTHER PO BUTTONS
   ========================================================= */

function initOtherButtons() {
  $$("#otherPanel .btn.primary")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {

          if (
            !validateBoxRange(
              "#otherStart",
              "#otherEnd"
            )
          ) {
            return;
          }

          generatePDF(
            "Other_PO_Label"
          );
        }
      );
    });

  $$("#otherPanel .btn.print")
    .forEach(button => {
      button.addEventListener(
        "click",
        printPDF
      );
    });
}

/* =========================================================
   ISBN BUTTONS
   ========================================================= */

function initISBNButtons() {
  $$("#isbnPanel .btn.primary")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          generatePDF(
            "ISBN_Barcode"
          );
        }
      );
    });

  $$("#isbnPanel .btn.print")
    .forEach(button => {
      button.addEventListener(
        "click",
        printPDF
      );
    });
}

/* =========================================================
   ADDRESS BUTTONS
   ========================================================= */

function initAddressButtons() {
  $$("#addressPanel .btn.primary")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          generatePDF(
            "Address_Label"
          );
        }
      );
    });

  $$("#addressPanel .btn.print")
    .forEach(button => {
      button.addEventListener(
        "click",
        printPDF
      );
    });
}

/* =========================================================
   GENERIC MODULE PAGE SIZE
   ========================================================= */

function initGenericPageSizes() {
  $$(".generic-page-size")
    .forEach(select => {
      select.addEventListener(
        "change",
        () => {

          const panel =
            select.closest(".panel");

          if (!panel) return;

          const preview =
            $(".preview-page", panel);

          if (!preview) return;

          /*
           * Generic visual sizing.
           */

          if (select.value === "4x6") {
            preview.style.width = "508px";
            preview.style.minHeight = "762px";
          }

          else if (select.value === "70x35") {
            preview.style.width = "420px";
            preview.style.minHeight = "210px";
          }

          else if (select.value === "a4") {
            preview.style.width = "595px";
            preview.style.minHeight = "842px";
          }

          showToast(
            "green",
            "Page Size Changed",
            `${select.options[select.selectedIndex].text} selected.`
          );
        }
      );
    });
}

/* =========================================================
   GLOBAL OPTION FEEDBACK
   ========================================================= */

function initOptionFeedback() {
  $$("select")
    .forEach(select => {

      select.addEventListener(
        "change",
        () => {

          /*
           * Avoid excessive duplicate
           * notifications for every
           * typing interaction.
           */

          if (
            select.id === "pageSize" ||
            select.id === "labelsPerPage"
          ) {
            return;
          }

          const label =
            select
              .closest(".field")
              ?.querySelector("label")
              ?.textContent
              .trim();

          if (!label) return;

          showToast(
            "green",
            "Option Enabled",
            `${label} updated successfully.`
          );
        }
      );
    });
}

/* =========================================================
   INITIALIZE
   ========================================================= */

function initApp() {

  initFonts();

  initBorders();

  initModules();

  initTabs();

  initManualFields();

  initBulk();

  initExcel();

  initCustomPage();

  initAllBorder();

  initCocoLive();

  initOtherLive();

  initISBN();

  initAddress();

  initFeatureToast();

  initRangeEvents();

  initButtons();

  initOtherButtons();

  initISBNButtons();

  initAddressButtons();

  initGenericPageSizes();

  initOptionFeedback();

  updateCocoPreview();

  updateOtherPreview();

  updateAddressPreview();
}

/* =========================================================
   START APP
   ========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initApp
  );
} else {
  initApp();
}
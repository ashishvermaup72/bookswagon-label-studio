"use strict";

/* =========================================================
   ASHISH VERMA LABEL STUDIO
   FINAL JS
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let activeSection = "coco";
let activeMode = "manual";

let otherMode = "manual";
let isbnMode = "manual";
let addressMode = "manual";

let excelData = [];
let otherExcelData = [];
let isbnExcelData = [];
let addressExcelData = [];

let history = [];
let historyIndex = -1;
let historyTimer = null;

const STORAGE_KEY =
  "AshishVermaLabelStudio";

const MAX_HISTORY = 60;


/* =========================================================
   HELPERS
========================================================= */

const $ = id =>
  document.getElementById(id);

const $$ = selector =>
  Array.from(
    document.querySelectorAll(selector)
  );


function safeNumber(value, fallback = 0){

  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}


function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function debounce(fn, delay = 250){

  let timer;

  return (...args) => {

    clearTimeout(timer);

    timer = setTimeout(
      () => fn(...args),
      delay
    );

  };
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "green",
  duration = 2400
){

  const toast =
    $("toast");

  const text =
    $("toastText");

  if(!toast || !text){
    return;
  }

  text.textContent =
    message;

  toast.className =
    `toast ${type} show`;

  clearTimeout(
    window.__ashishToastTimer
  );

  window.__ashishToastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, duration);

}


/* =========================================================
   LIBRARY CHECK
========================================================= */

function librariesStatus(){

  return {

    xlsx:
      typeof XLSX !== "undefined",

    qr:
      typeof QRCode !== "undefined",

    barcode:
      typeof JsBarcode !== "undefined",

    pdf:
      !!(
        window.jspdf &&
        typeof window.jspdf.jsPDF === "function"
      )

  };

}


function checkPDFLibrary(){

  const status =
    librariesStatus();

  if(!status.pdf){

    showToast(
      "PDF library is not loaded. Please check internet connection.",
      "red",
      4000
    );

    return false;
  }

  return true;
}


/* =========================================================
   MAIN NAVIGATION
========================================================= */

function setupMainNavigation(){

  $$(".nav-card").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const nextSection =
          button.dataset.section;

        if(!nextSection){
          return;
        }

        const previous =
          activeSection;

        activeSection =
          nextSection;

        $$(".nav-card")
          .forEach(btn => {

            btn.classList.toggle(
              "active",
              btn === button
            );

          });


        $$(".section")
          .forEach(section => {

            section.classList.toggle(
              "active",
              section.id ===
                `section-${activeSection}`
            );

          });


        if(previous !== activeSection){

          const title =
            button.querySelector(
              ".nav-title"
            )?.textContent ||
            activeSection;

          showToast(
            `${title} Enabled`,
            "green"
          );

        }

        updatePreview();

      }
    );

  });

}


/* =========================================================
   COCO MODE
========================================================= */

function setupCocoModes(){

  const buttons =
    $$("[data-mode]");

  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const mode =
          button.dataset.mode;

        if(!mode){
          return;
        }

        activeMode =
          mode;

        buttons.forEach(btn => {

          btn.classList.toggle(
            "active",
            btn === button
          );

        });


        $$(".mode-panel")
          .forEach(panel => {

            panel.classList.remove(
              "active"
            );

          });


        const panel =
          $(`mode-${mode}`);

        if(panel){

          panel.classList.add(
            "active"
          );

        }


        showToast(
          `${mode.toUpperCase()} mode enabled`,
          "green"
        );

        updatePreview();

      }
    );

  });

}


/* =========================================================
   OTHER PO MODE
========================================================= */

function setupOtherModes(){

  $$("[data-other-mode]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          otherMode =
            button.dataset.otherMode;

          const card =
            button.closest(".card");

          if(card){

            card
              .querySelectorAll(
                "[data-other-mode]"
              )
              .forEach(btn => {

                btn.classList.toggle(
                  "active",
                  btn === button
                );

              });

          }


          toggleDisplay(
            "otherManual",
            otherMode === "manual"
          );

          toggleDisplay(
            "otherMultiple",
            otherMode === "multiple"
          );

          toggleDisplay(
            "otherExcel",
            otherMode === "excel"
          );


          showToast(
            `${otherMode.toUpperCase()} mode enabled`,
            "green"
          );

          updatePreview();

        }
      );

    });

}


/* =========================================================
   ISBN MODE
========================================================= */

function setupISBNModes(){

  $$("[data-isbn-mode]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          isbnMode =
            button.dataset.isbnMode;

          const card =
            button.closest(".card");

          if(card){

            card
              .querySelectorAll(
                "[data-isbn-mode]"
              )
              .forEach(btn => {

                btn.classList.toggle(
                  "active",
                  btn === button
                );

              });

          }


          toggleDisplay(
            "isbnManual",
            isbnMode === "manual"
          );

          toggleDisplay(
            "isbnMultiple",
            isbnMode === "multiple"
          );

          toggleDisplay(
            "isbnExcel",
            isbnMode === "excel"
          );


          showToast(
            `${isbnMode.toUpperCase()} mode enabled`,
            "green"
          );

          updatePreview();

        }
      );

    });

}


/* =========================================================
   ADDRESS MODE
========================================================= */

function setupAddressModes(){

  $$("[data-address-mode]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          addressMode =
            button.dataset.addressMode;

          const card =
            button.closest(".card");

          if(card){

            card
              .querySelectorAll(
                "[data-address-mode]"
              )
              .forEach(btn => {

                btn.classList.toggle(
                  "active",
                  btn === button
                );

              });

          }


          toggleDisplay(
            "addressManual",
            addressMode === "manual"
          );

          toggleDisplay(
            "addressMultiple",
            addressMode === "multiple"
          );

          toggleDisplay(
            "addressExcel",
            addressMode === "excel"
          );


          showToast(
            `${addressMode.toUpperCase()} mode enabled`,
            "green"
          );

          updatePreview();

        }
      );

    });

}


/* =========================================================
   DISPLAY HELPER
========================================================= */

function toggleDisplay(
  id,
  visible
){

  const element =
    $(id);

  if(!element){
    return;
  }

  element.style.display =
    visible
      ? "block"
      : "none";

}


/* =========================================================
   PAGE SIZE
========================================================= */

function getPageSizeMM(){

  const value =
    $("pageSize")?.value ||
    "4x6";


  if(value === "4x6"){

    return [
      101.6,
      152.4
    ];

  }


  if(value === "70x35"){

    return [
      70,
      35
    ];

  }


  if(value === "a4"){

    return [
      210,
      297
    ];

  }


  return [

    Math.max(
      1,
      safeNumber(
        $("customWidth")?.value,
        101.6
      )
    ),

    Math.max(
      1,
      safeNumber(
        $("customHeight")?.value,
        152.4
      )
    )

  ];

}


function getOrientedPageSize(){

  let [
    width,
    height
  ] = getPageSizeMM();


  if(
    $("orientation")?.value ===
    "landscape"
  ){

    [
      width,
      height
    ] = [
      height,
      width
    ];

  }


  return [
    width,
    height
  ];

}


/* =========================================================
   CUSTOM PAGE SIZE
========================================================= */

function setupPageSize(){

  const pageSize =
    $("pageSize");

  if(!pageSize){
    return;
  }


  const updateCustom =
    () => {

      const custom =
        pageSize.value ===
        "custom";


      const box =
        $("customSizeBox");

      if(box){

        box.style.display =
          custom
            ? "block"
            : "none";

      }


      if(custom){

        showToast(
          "Custom page size enabled",
          "green"
        );

      }
      else{

        showToast(
          "Custom page size disabled",
          "red"
        );

      }


      updatePreview();

    };


  pageSize.addEventListener(
    "change",
    updateCustom
  );


  updateCustom();

}


/* =========================================================
   PAPER SIZE + LABEL GRID
========================================================= */

function updatePaper(){

  const paper =
    $("paper");

  const grid =
    $("paperGrid");

  if(!paper || !grid){
    return;
  }


  let [
    widthMM,
    heightMM
  ] = getOrientedPageSize();


  const previewMaxWidth =
    640;

  const previewMaxHeight =
    700;


  const scale =
    Math.min(
      previewMaxWidth / widthMM,
      previewMaxHeight / heightMM
    );


  const widthPX =
    Math.max(
      220,
      widthMM * scale
    );

  const heightPX =
    Math.max(
      220,
      heightMM * scale
    );


  paper.style.width =
    `${widthPX}px`;

  paper.style.height =
    `${heightPX}px`;


  const count =
    Math.max(
      1,
      safeNumber(
        $("labelsPerPage")?.value,
        1
      )
    );


  let columns = 1;


  if(count === 2){
    columns = 2;
  }
  else if(
    count === 4 ||
    count === 6
  ){
    columns = 2;
  }
  else if(
    count === 9 ||
    count === 12
  ){
    columns = 3;
  }


  grid.style.gridTemplateColumns =
    `repeat(${columns}, minmax(0,1fr))`;


  grid.style.gap =
    `${Math.max(
      0,
      safeNumber(
        $("labelGap")?.value,
        3
      )
    )}px`;


  renderPreviewLabels();

}


/* =========================================================
   PREVIEW LABEL TEMPLATE
========================================================= */

function createLabelTemplate(){

  const label =
    document.createElement(
      "div"
    );

  label.className =
    "label-preview";


  const po =
    document.createElement(
      "div"
    );

  po.className =
    "po-preview";

  po.textContent =
    "ABC123";


  const box =
    document.createElement(
      "div"
    );

  box.className =
    "box-preview";

  box.textContent =
    "BOX NO. 1";


  const combined =
    document.createElement(
      "div"
    );

  combined.className =
    "combined-preview";


  label.appendChild(po);
  label.appendChild(box);
  label.appendChild(combined);


  return label;

}


/* =========================================================
   LIVE MULTI-LABEL PREVIEW
========================================================= */

function renderPreviewLabels(){

  const grid =
    $("paperGrid");

  if(!grid){
    return;
  }


  grid.innerHTML = "";


  const count =
    Math.max(
      1,
      safeNumber(
        $("labelsPerPage")?.value,
        1
      )
    );


  for(
    let i = 0;
    i < count;
    i++
  ){

    const label =
      createLabelTemplate();

    grid.appendChild(
      label
    );

  }


  applyPreviewContent();

}


/* =========================================================
   FONT STYLES
========================================================= */

function getTextDecoration(
  underline
){

  return underline
    ? "underline"
    : "none";

}


function applyFontStyles(){

  const poFont =
    $("poFont")?.value ||
    "Arial";

  const poSize =
    safeNumber(
      $("poFontSize")?.value,
      24
    );


  const boxFont =
    $("boxFont")?.value ||
    "Arial";

  const boxSize =
    safeNumber(
      $("boxFontSize")?.value,
      20
    );


  const poBold =
    $("poBold")?.checked;

  const poItalic =
    $("poItalic")?.checked;

  const poUnderline =
    $("poUnderline")?.checked;


  const boxBold =
    $("boxBold")?.checked;

  const boxItalic =
    $("boxItalic")?.checked;


  $$(".po-preview")
    .forEach(el => {

      el.style.fontFamily =
        poFont;

      el.style.fontSize =
        `${poSize}px`;

      el.style.fontWeight =
        poBold
          ? "700"
          : "400";

      el.style.fontStyle =
        poItalic
          ? "italic"
          : "normal";

      el.style.textDecoration =
        getTextDecoration(
          poUnderline
        );

    });


  $$(".box-preview")
    .forEach(el => {

      el.style.fontFamily =
        boxFont;

      el.style.fontSize =
        `${boxSize}px`;

      el.style.fontWeight =
        boxBold
          ? "700"
          : "400";

      el.style.fontStyle =
        boxItalic
          ? "italic"
          : "normal";

    });


  const combinedFont =
    poFont;

  const combinedSize =
    poSize;


  $$(".combined-preview")
    .forEach(el => {

      el.style.fontFamily =
        combinedFont;

      el.style.fontSize =
        `${combinedSize}px`;

      el.style.fontWeight =
        poBold
          ? "700"
          : "400";

      el.style.fontStyle =
        poItalic
          ? "italic"
          : "normal";

    });


  const other =
    $("otherPreview");

  if(other){

    other.style.fontFamily =
      $("otherFont")?.value ||
      "Arial";

    other.style.fontSize =
      `${safeNumber(
        $("otherFontSize")?.value,
        20
      )}px`;

    other.style.fontWeight =
      $("otherBold")?.checked
        ? "700"
        : "400";

  }


  const isbn =
    $("isbnPreview");

  if(isbn){

    isbn.style.fontFamily =
      $("isbnFont")?.value ||
      "Arial";

    isbn.style.fontSize =
      `${safeNumber(
        $("isbnFontSize")?.value,
        14
      )}px`;

  }


  const address =
    $("addressPreview");

  if(address){

    address.style.fontFamily =
      $("addressFont")?.value ||
      "Arial";

    address.style.fontSize =
      `${safeNumber(
        $("addressFontSize")?.value,
        12
      )}px`;

  }

}


/* =========================================================
   BORDER ENGINE
========================================================= */

function borderCSS(style){

  const colors = {

    blue:"#2563eb",
    red:"#dc2626",
    green:"#16a34a",
    gray:"#64748b",
    black:"#111827",
    navy:"#1e3a8a",
    purple:"#7c3aed",
    orange:"#f97316",
    teal:"#0f766e",
    gold:"#ca8a04",
    silver:"#94a3b8"

  };


  if(!style || style === "none"){

    return {
      border:"none",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "thin"){

    return {
      border:"1px solid #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "medium"){

    return {
      border:"3px solid #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "thick"){

    return {
      border:"5px solid #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "double-thin"){

    return {
      border:"2px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "double-medium"){

    return {
      border:"4px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "double-thick"){

    return {
      border:"7px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "shadow"){

    return {
      border:"2px solid #222",
      radius:"0",
      shadow:
        "5px 5px 0 rgba(0,0,0,.30)"
    };

  }


  if(style === "soft-shadow"){

    return {
      border:"1px solid #555",
      radius:"0",
      shadow:
        "0 4px 12px rgba(0,0,0,.25)"
    };

  }


  if(style === "rounded"){

    return {
      border:"2px solid #222",
      radius:"8px",
      shadow:"none"
    };

  }


  if(style === "double-rounded"){

    return {
      border:"4px double #222",
      radius:"8px",
      shadow:"none"
    };

  }


  if(style === "double-color"){

    return {
      border:"4px double #2563eb",
      radius:"0",
      shadow:"none"
    };

  }


  if(colors[style]){

    return {
      border:
        `2px solid ${colors[style]}`,
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "wave"){

    return {
      border:"3px solid #222",
      radius:"4px",
      shadow:"none"
    };

  }


  if(style === "double-wave"){

    return {
      border:"5px double #222",
      radius:"4px",
      shadow:"none"
    };

  }


  if(style === "zigzag"){

    return {
      border:"3px solid #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "triple"){

    return {
      border:"6px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "triple-thin"){

    return {
      border:"3px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(style === "triple-thick"){

    return {
      border:"8px double #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(
    style === "dash-dot" ||
    style === "dash-dot-dot" ||
    style === "long-dash"
  ){

    return {
      border:"2px dashed #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(
    style === "short-dash"
  ){

    return {
      border:"1px dashed #222",
      radius:"0",
      shadow:"none"
    };

  }


  if(
    style === "short-dot" ||
    style === "dot-dash" ||
    style === "dot-dot-dash"
  ){

    return {
      border:"2px dotted #222",
      radius:"0",
      shadow:"none"
    };

  }


  const supported = [
    "solid",
    "double",
    "dashed",
    "dotted",
    "groove",
    "ridge",
    "inset",
    "outset"
  ];


  if(supported.includes(style)){

    return {
      border:
        `2px ${style} #222`,
      radius:"0",
      shadow:"none"
    };

  }


  return {

    border:"2px solid #222",
    radius:"0",
    shadow:"none"

  };

}


function applyBorder(
  element,
  style
){

  if(!element){
    return;
  }

  const css =
    borderCSS(style);


  element.style.border =
    css.border;

  element.style.borderRadius =
    css.radius;

  element.style.boxShadow =
    css.shadow;

}


/* =========================================================
   COCO MERGE / FREEZE
========================================================= */

function applyMergeState(
  showNotification = false
){

  const merged =
    $("mergePOBox")?.checked ||
    false;


  const ids = [

    "poFontCard",
    "boxFontCard",
    "poBorderCard",
    "boxBorderCard"

  ];


  ids.forEach(id => {

    const card =
      $(id);

    if(!card){
      return;
    }


    card.classList.toggle(
      "freeze-box",
      merged
    );


    card
      .querySelectorAll(
        "input,select,textarea"
      )
      .forEach(control => {

        control.disabled =
          merged;

      });

  });


  const combinedCard =
    $("combinedCard");


  if(combinedCard){

    combinedCard.style.display =
      "block";

  }


  if(showNotification){

    if(merged){

      showToast(
        "PO + Box Combined — individual controls frozen",
        "green"
      );

    }
    else{

      showToast(
        "PO + Box controls unfrozen",
        "red"
      );

    }

  }


  applyPreviewContent();

}


/* =========================================================
   COCO PREVIEW DATA
========================================================= */

function getCocoEntries(){

  let values = [];


  if(activeMode === "multiple"){

    values =
      String(
        $("multiplePO")?.value ||
        ""
      )
      .split(",")

      .map(
        value =>
          value.trim()
      )

      .filter(Boolean);

  }


  else if(activeMode === "excel"){

    values =
      excelData
        .map(row => {

          if(
            Array.isArray(row)
          ){

            return String(
              row[0] ?? ""
            ).trim();

          }

          return String(
            row ?? ""
          ).trim();

        })
        .filter(Boolean);

  }


  else{

    const value =
      $("poInput")?.value
        ?.trim();

    if(value){
      values = [value];
    }

  }


  if(!values.length){

    values = [
      "ABC123"
    ];

  }


  return values;

}


/* =========================================================
   OTHER PO DATA
========================================================= */

function getOtherEntries(){

  if(
    otherMode === "multiple"
  ){

    return String(
      $("otherMultiplePO")
        ?.value || ""
    )
    .split(",")

    .map(
      value =>
        value.trim()
    )

    .filter(Boolean);

  }


  if(
    otherMode === "excel"
  ){

    return otherExcelData
      .map(row => {

        if(
          Array.isArray(row)
        ){

          return String(
            row[0] ?? ""
          ).trim();

        }

        return String(
          row ?? ""
        ).trim();

      })
      .filter(Boolean);

  }


  return [

    $("otherPO")
      ?.value
      ?.trim() ||
    "ABC123"

  ];

}


/* =========================================================
   ISBN DATA
========================================================= */

function getISBNEntries(){

  if(
    isbnMode === "multiple"
  ){

    return String(
      $("multipleISBN")
        ?.value || ""
    )
    .split(",")

    .map(
      value =>
        value.trim()
    )

    .filter(Boolean);

  }


  if(
    isbnMode === "excel"
  ){

    return isbnExcelData
      .map(row => {

        if(
          Array.isArray(row)
        ){

          return String(
            row[0] ?? ""
          ).trim();

        }

        return String(
          row ?? ""
        ).trim();

      })
      .filter(Boolean);

  }


  return [

    $("isbn")
      ?.value
      ?.trim() ||
    "9781234567890"

  ];

}


/* =========================================================
   ADDRESS DATA
========================================================= */

function getAddressEntries(){

  if(
    addressMode === "multiple"
  ){

    return String(
      $("multipleAddress")
        ?.value || ""
    )
    .split(/\n+/)

    .map(
      value =>
        value.trim()
    )

    .filter(Boolean);

  }


  if(
    addressMode === "excel"
  ){

    return addressExcelData
      .map(row => {

        if(
          Array.isArray(row)
        ){

          return String(
            row[0] ?? ""
          ).trim();

        }

        return String(
          row ?? ""
        ).trim();

      })
      .filter(Boolean);

  }


  return [

    $("toAddress")
      ?.value
      ?.trim() ||
    "TO ADDRESS"

  ];

}


/* =========================================================
   COMBINED TEXT
========================================================= */

function getCombinedText(
  po,
  box
){

  const format =
    $("combinedFormat")
      ?.value ||
    "po-box";


  const boxText =
    `BOX NO. ${box}`;


  if(
    format === "box-po"
  ){

    return `${boxText} — ${po}`;

  }


  if(
    format === "po-slash-box"
  ){

    return `${po} / ${boxText}`;

  }


  if(
    format === "po-newline-box"
  ){

    return `${po}\n${boxText}`;

  }


  return `${po} — ${boxText}`;

}


/* =========================================================
   APPLY COCO LABEL
========================================================= */

function applyCocoLabel(
  label,
  index
){

  if(!label){
    return;
  }


  const poElement =
    label.querySelector(
      ".po-preview"
    );

  const boxElement =
    label.querySelector(
      ".box-preview"
    );

  const combinedElement =
    label.querySelector(
      ".combined-preview"
    );


  const entries =
    getCocoEntries();


  const po =
    entries[
      index % entries.length
    ] ||
    "ABC123";


  const startingBox =
    Math.max(
      1,
      safeNumber(
        $("boxInput")?.value,
        1
      )
    );


  const box =
    startingBox + index;


  if(poElement){

    poElement.textContent =
      po;

  }


  if(boxElement){

    boxElement.textContent =
      `BOX NO. ${box}`;

  }


  const merged =
    $("mergePOBox")?.checked ||
    false;


  const showPO =
    $("showPO")?.checked !== false;

  const showBox =
    $("showBox")?.checked !== false;


  if(merged){

    if(poElement){
      poElement.style.display =
        "none";
    }

    if(boxElement){
      boxElement.style.display =
        "none";
    }


    if(combinedElement){

      combinedElement.style.display =
        "block";

      combinedElement.classList.add(
        "show"
      );

      combinedElement.textContent =
        getCombinedText(
          po,
          box
        );

      combinedElement.style.whiteSpace =
        $("combinedFormat")?.value ===
        "po-newline-box"
          ? "pre-line"
          : "normal";

      applyBorder(
        combinedElement,
        $("combinedBorder")?.value
      );

    }


    applyBorder(
      label,
      $("combinedBorder")?.value
    );

  }
  else{

    if(combinedElement){

      combinedElement.style.display =
        "none";

      combinedElement.classList.remove(
        "show"
      );

    }


    if(poElement){

      poElement.style.display =
        showPO
          ? "block"
          : "none";

      applyBorder(
        poElement,
        $("poBorder")?.value
      );

    }


    if(boxElement){

      boxElement.style.display =
        showBox
          ? "block"
          : "none";

      applyBorder(
        boxElement,
        $("boxBorder")?.value
      );

    }


    applyBorder(
      label,
      "none"
    );

  }

}


/* =========================================================
   OTHER PREVIEW
========================================================= */

function updateOtherPreview(){

  const element =
    $("otherPreview");

  if(!element){
    return;
  }


  const entries =
    getOtherEntries();


  element.textContent =
    entries[0] ||
    "ABC123";


  applyBorder(
    element,
    $("otherBorder")?.value
  );

}


/* =========================================================
   ISBN PREVIEW
========================================================= */

function updateISBNPreview(){

  const preview =
    $("isbnPreview");

  if(!preview){
    return;
  }


  const entries =
    getISBNEntries();


  const isbn =
    entries[0] ||
    "9781234567890";


  const title =
    $("bookTitle")?.value ||
    "Book Title";


  const titlePreview =
    $("isbnTitlePreview");

  const numberPreview =
    $("isbnNumberPreview");


  if(titlePreview){

    titlePreview.textContent =
      title;

  }


  if(numberPreview){

    numberPreview.textContent =
      isbn;

  }


  applyBorder(
    preview,
    $("isbnBorder")?.value
  );


  generateISBNBarcode(
    isbn
  );

}


/* =========================================================
   ISBN BARCODE
========================================================= */

function generateISBNBarcode(
  value
){

  const svg =
    $("isbnBarcode");

  if(!svg){
    return;
  }


  svg.innerHTML = "";


  if(
    !value ||
    typeof JsBarcode ===
      "undefined"
  ){

    return;

  }


  try{

    JsBarcode(
      svg,
      value,
      {
        format:"auto",
        width:1.4,
        height:50,
        displayValue:true,
        margin:4,
        fontSize:11
      }
    );

  }
  catch(error){

    console.warn(
      "ISBN barcode error:",
      error
    );

  }

}


/* =========================================================
   ADDRESS PREVIEW
========================================================= */

function updateAddressPreview(){

  const preview =
    $("addressPreview");

  if(!preview){
    return;
  }


  const from =
    $("fromAddress")?.value ||
    "FROM ADDRESS";


  const to =
    $("toAddress")?.value ||
    "TO ADDRESS";


  const email =
    $("email")?.value ||
    "";


  const fromPreview =
    $("fromPreview");

  const toPreview =
    $("toPreview");

  const emailPreview =
    $("emailPreview");


  if(fromPreview){

    fromPreview.textContent =
      from;

  }


  if(toPreview){

    toPreview.textContent =
      to;

  }


  if(emailPreview){

    emailPreview.textContent =
      email
        ? `Email: ${email}`
        : "";

  }


  applyBorder(
    preview,
    $("addressBorder")?.value
  );

}


/* =========================================================
   APPLY PREVIEW CONTENT
========================================================= */

function applyPreviewContent(){

  const grid =
    $("paperGrid");

  if(!grid){
    return;
  }


  const labels =
    grid.querySelectorAll(
      ".label-preview"
    );


  labels.forEach(
    (label, index) => {

      applyCocoLabel(
        label,
        index
      );

    }
  );


  applyFontStyles();


  if(activeSection === "other"){

    updateOtherPreview();

  }


  if(activeSection === "isbn"){

    updateISBNPreview();

  }


  if(activeSection === "address"){

    updateAddressPreview();

  }

}


/* =========================================================
   MAIN PREVIEW UPDATE
========================================================= */

function updatePreview(){

  updatePaper();

  applyPreviewContent();


  const label =
    $("labelPreview");

  const other =
    $("otherPreview");

  const isbn =
    $("isbnPreview");

  const address =
    $("addressPreview");


  if(label){

    label.style.display =
      activeSection === "coco"
        ? "flex"
        : "none";

  }


  if(other){

    other.style.display =
      activeSection === "other"
        ? "flex"
        : "none";

  }


  if(isbn){

    isbn.style.display =
      activeSection === "isbn"
        ? "flex"
        : "none";

  }


  if(address){

    address.style.display =
      activeSection === "address"
        ? "block"
        : "none";

  }


  if(activeSection === "coco"){

    applyMergeState(
      false
    );

  }

}


/* =========================================================
   LIVE INPUT BINDING
========================================================= */

function setupLiveInputs(){

  const elements =
    $$(
      "input:not([type='file']), select, textarea"
    );


  elements.forEach(element => {

    element.addEventListener(
      "input",
      () => {

        updatePreview();

        scheduleHistory();

      }
    );


    element.addEventListener(
      "change",
      () => {

        handleControlChange(
          element
        );

        updatePreview();

        scheduleHistory();

      }
    );

  });

}


/* =========================================================
   ENABLE / DISABLE POPUPS
========================================================= */

function setupEnableDisableControls(){

  [
    "showPO",
    "showBox",
    "mergePOBox"
  ]
  .forEach(id => {

    const element =
      $(id);

    if(!element){
      return;
    }


    element.addEventListener(
      "change",
      () => {

        if(element.checked){

          if(id === "showPO"){

            showToast(
              "PO Number Enabled",
              "green"
            );

          }
          else if(
            id === "showBox"
          ){

            showToast(
              "Box Number Enabled",
              "green"
            );

          }
          else{

            showToast(
              "PO + Box Combine Enabled",
              "green"
            );

          }

        }
        else{

          if(id === "showPO"){

            showToast(
              "PO Number Disabled",
              "red"
            );

          }
          else if(
            id === "showBox"
          ){

            showToast(
              "Box Number Disabled",
              "red"
            );

          }
          else{

            showToast(
              "PO + Box Combine Disabled",
              "red"
            );

          }

        }


        if(
          id === "mergePOBox"
        ){

          applyMergeState(
            false
          );

        }


        updatePreview();

      }
    );

  });

}


/* =========================================================
   CONTROL CHANGE HANDLER
========================================================= */

function handleControlChange(
  element
){

  if(!element){
    return;
  }


  if(
    element.id ===
    "pageSize"
  ){

    const custom =
      element.value ===
      "custom";

    toggleDisplay(
      "customSizeBox",
      custom
    );

  }


  if(
    element.id ===
    "mergePOBox"
  ){

    applyMergeState(
      true
    );

  }

}


/* =========================================================
   EXCEL READER
========================================================= */

async function processExcelFile(
  file,
  type
){

  if(!file){
    return;
  }


  if(
    typeof XLSX ===
    "undefined"
  ){

    showToast(
      "Excel library is not loaded. Check internet connection.",
      "red",
      4000
    );

    return;

  }


  try{

    const buffer =
      await file.arrayBuffer();


    const workbook =
      XLSX.read(
        buffer,
        {
          type:"array"
        }
      );


    if(
      !workbook.SheetNames.length
    ){

      throw new Error(
        "No worksheet found"
      );

    }


    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];


    const rows =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          header:1,
          defval:"",
          raw:false
        }
      );


    if(!rows.length){

      showToast(
        "Excel file is empty",
        "red"
      );

      return;

    }


    /*
      IMPORTANT:
      FIRST ROW IS HEADER
      FIRST ROW IS IGNORED
    */

    const header =
      rows[0];

    const data =
      rows.slice(1);


    if(type === "coco"){

      excelData =
        data;

    }


    if(type === "other"){

      otherExcelData =
        data;

    }


    if(type === "isbn"){

      isbnExcelData =
        data;

    }


    if(type === "address"){

      addressExcelData =
        data;

    }


    renderExcelPreview(
      type,
      header,
      data
    );


    /*
      First column becomes
      comma-separated values
    */

    const firstColumn =
      data
        .map(row => {

          if(
            Array.isArray(row)
          ){

            return String(
              row[0] ?? ""
            ).trim();

          }

          return "";

        })
        .filter(Boolean);


    if(
      type === "coco" &&
      $("multiplePO")
    ){

      $("multiplePO").value =
        firstColumn.join(", ");

    }


    if(
      type === "other" &&
      $("otherMultiplePO")
    ){

      $("otherMultiplePO").value =
        firstColumn.join(", ");

    }


    if(
      type === "isbn" &&
      $("multipleISBN")
    ){

      $("multipleISBN").value =
        firstColumn.join(", ");

    }


    if(
      type === "address" &&
      $("multipleAddress")
    ){

      $("multipleAddress").value =
        firstColumn.join("\n");

    }


    showToast(
      "Excel loaded — first/header row ignored",
      "green"
    );


    updatePreview();

    saveHistory();

  }
  catch(error){

    console.error(
      "Excel error:",
      error
    );


    showToast(
      `Excel read failed: ${error.message}`,
      "red",
      4000
    );

  }

}


/* =========================================================
   EXCEL PREVIEW
========================================================= */

function renderExcelPreview(
  type,
  header,
  data
){

  const targetMap = {

    coco:"excelPreview",

    other:"otherExcelPreview",

    isbn:"isbnExcelPreview",

    address:"addressExcelPreview"

  };


  const target =
    $(targetMap[type]);


  if(!target){
    return;
  }


  let html =
    "<table><thead><tr>";


  if(
    Array.isArray(header)
  ){

    header.forEach(
      value => {

        html +=
          `<th>${escapeHTML(
            value
          )}</th>`;

      }
    );

  }
  else{

    html +=
      "<th>Column 1</th>";

  }


  html +=
    "</tr></thead><tbody>";


  data
    .slice(0,250)
    .forEach(row => {

      html +=
        "<tr>";


      const values =
        Array.isArray(row)
          ? row
          : [row];


      const length =
        Math.max(
          Array.isArray(header)
            ? header.length
            : 1,
          values.length
        );


      for(
        let i = 0;
        i < length;
        i++
      ){

        html +=
          `<td>${escapeHTML(
            values[i] ?? ""
          )}</td>`;

      }


      html +=
        "</tr>";

    });


  html +=
    "</tbody></table>";


  target.innerHTML =
    html;

}


/* =========================================================
   EXCEL INPUTS
========================================================= */

function setupExcelInputs(){

  const map = [

    [
      "excelInput",
      "coco"
    ],

    [
      "otherExcelInput",
      "other"
    ],

    [
      "isbnExcelInput",
      "isbn"
    ],

    [
      "addressExcelInput",
      "address"
    ]

  ];


  map.forEach(
    ([id,type]) => {

      const input =
        $(id);

      if(!input){
        return;
      }


      input.addEventListener(
        "change",
        () => {

          processExcelFile(
            input.files?.[0],
            type
          );

        }
      );

    }
  );

}


/* =========================================================
   QR GENERATION
========================================================= */

async function generateQR(
  targetId,
  value
){

  const target =
    $(targetId);

  if(!target){
    return false;
  }


  target.innerHTML =
    "";


  if(
    typeof QRCode ===
    "undefined"
  ){

    showToast(
      "QR library is not loaded. Check internet connection.",
      "red",
      4000
    );

    return false;

  }


  if(!value){

    showToast(
      "Nothing to encode in QR",
      "red"
    );

    return false;

  }


  try{

    const canvas =
      document.createElement(
        "canvas"
      );


    target.appendChild(
      canvas
    );


    await QRCode.toCanvas(
      canvas,
      value,
      {
        width:120,
        margin:2
      }
    );


    return true;

  }
  catch(error){

    console.error(
      "QR error:",
      error
    );


    showToast(
      "QR generation failed",
      "red"
    );

    return false;

  }

}


/* =========================================================
   QR BUTTONS
========================================================= */

function setupQR(){

  const addressButton =
    $("addressQRBtn");


  if(addressButton){

    addressButton.addEventListener(
      "click",
      async () => {

        const from =
          $("fromAddress")
            ?.value
            ?.trim() ||
          "";

        const to =
          $("toAddress")
            ?.value
            ?.trim() ||
          "";


        const value =
          [
            from,
            to
          ]
          .filter(Boolean)
          .join("\n");


        const success =
          await generateQR(
            "addressQR",
            value
          );


        if(success){

          showToast(
            "Address QR generated",
            "green"
          );

        }

      }
    );

  }


  const emailButton =
    $("emailQRBtn");


  if(emailButton){

    emailButton.addEventListener(
      "click",
      async () => {

        const email =
          $("email")
            ?.value
            ?.trim() ||
          "";


        if(!email){

          showToast(
            "Enter email address first",
            "red"
          );

          return;

        }


        const success =
          await generateQR(
            "emailQR",
            `mailto:${email}`
          );


        if(success){

          showToast(
            "Email QR generated",
            "green"
          );

        }

      }
    );

  }

}


/* =========================================================
   HISTORY SNAPSHOT
========================================================= */

function getSnapshot(){

  const data = {};


  $$(
    "input, select, textarea"
  )
  .forEach(element => {

    if(
      !element.id ||
      element.type === "file"
    ){

      return;

    }


    if(
      element.type ===
      "checkbox"
    ){

      data[element.id] =
        element.checked;

    }
    else{

      data[element.id] =
        element.value;

    }

  });


  return data;

}


/* =========================================================
   RESTORE SNAPSHOT
========================================================= */

function restoreSnapshot(
  snapshot
){

  if(!snapshot){
    return;
  }


  Object.keys(snapshot)
    .forEach(id => {

      const element =
        $(id);

      if(!element){
        return;
      }


      if(
        element.type ===
        "checkbox"
      ){

        element.checked =
          Boolean(
            snapshot[id]
          );

      }
      else{

        element.value =
          snapshot[id];

      }

    });


  updateCustomPageVisibility();
  applyMergeState(false);
  updatePreview();

}


/* =========================================================
   HISTORY SAVE
========================================================= */

function saveHistory(){

  const snapshot =
    JSON.stringify(
      getSnapshot()
    );


  if(
    historyIndex >= 0 &&
    history[historyIndex] ===
      snapshot
  ){

    return;

  }


  history =
    history.slice(
      0,
      historyIndex + 1
    );


  history.push(
    snapshot
  );


  if(
    history.length >
    MAX_HISTORY
  ){

    history.shift();

  }


  historyIndex =
    history.length - 1;

}


function scheduleHistory(){

  clearTimeout(
    historyTimer
  );


  historyTimer =
    setTimeout(
      saveHistory,
      450
    );

}


/* =========================================================
   UNDO
========================================================= */

function undo(){

  if(
    historyIndex <= 0
  ){

    showToast(
      "Nothing to undo",
      "orange"
    );

    return;

  }


  historyIndex--;


  restoreSnapshot(
    JSON.parse(
      history[
        historyIndex
      ]
    )
  );


  showToast(
    "Undo applied",
    "green"
  );

}


/* =========================================================
   REDO
========================================================= */

function redo(){

  if(
    historyIndex >=
    history.length - 1
  ){

    showToast(
      "Nothing to redo",
      "orange"
    );

    return;

  }


  historyIndex++;


  restoreSnapshot(
    JSON.parse(
      history[
        historyIndex
      ]
    )
  );


  showToast(
    "Redo applied",
    "green"
  );

}


/* =========================================================
   DEFAULT
========================================================= */

function resetToDefault(){

  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings(){

  try{

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        getSnapshot()
      )
    );


    showToast(
      "Current settings saved",
      "green"
    );

  }
  catch(error){

    showToast(
      "Could not save settings",
      "red"
    );

  }

}


/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings(){

  try{

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if(!saved){
      return;
    }


    const data =
      JSON.parse(
        saved
      );


    restoreSnapshot(
      data
    );

  }
  catch(error){

    console.warn(
      "Settings load failed:",
      error
    );

  }

}


/* =========================================================
   PDF SIZE
========================================================= */

function getPDFPageSize(){

  const [
    width,
    height
  ] = getOrientedPageSize();


  return [
    width,
    height
  ];

}


/* =========================================================
   PDF COLOR
========================================================= */

function getBorderColor(
  style
){

  const colors = {

    blue:[37,99,235],
    red:[220,38,38],
    green:[22,163,74],
    gray:[100,116,139],
    black:[17,24,39],
    navy:[30,58,138],
    purple:[124,58,237],
    orange:[249,115,22],
    teal:[15,118,110],
    gold:[202,138,4],
    silver:[148,163,184]

  };


  return colors[style] ||
    [30,30,30];

}


/* =========================================================
   PDF BORDER
========================================================= */

function drawPDFBorder(
  doc,
  x,
  y,
  width,
  height,
  style
){

  if(
    !style ||
    style === "none"
  ){

    return;

  }


  const color =
    getBorderColor(
      style
    );


  doc.setDrawColor(
    color[0],
    color[1],
    color[2]
  );


  let lineWidth =
    0.5;


  if(
    style === "thin"
  ){

    lineWidth =
      0.25;

  }


  if(
    style === "medium"
  ){

    lineWidth =
      0.75;

  }


  if(
    style === "thick"
  ){

    lineWidth =
      1.2;

  }


  if(
    style === "double-thick"
  ){

    lineWidth =
      1;

  }


  doc.setLineWidth(
    lineWidth
  );


  if(
    style === "dashed" ||
    style === "long-dash" ||
    style === "short-dash" ||
    style === "dash-dot" ||
    style === "dash-dot-dot"
  ){

    doc.setLineDashPattern(
      [3,2],
      0
    );

  }
  else if(
    style === "dotted" ||
    style === "short-dot" ||
    style === "dot-dash" ||
    style === "dot-dot-dash"
  ){

    doc.setLineDashPattern(
      [1,2],
      0
    );

  }
  else{

    doc.setLineDashPattern(
      [],
      0
    );

  }


  doc.rect(
    x,
    y,
    width,
    height
  );


  if(
    style === "double" ||
    style === "double-thin" ||
    style === "double-medium" ||
    style === "double-thick" ||
    style === "double-rounded" ||
    style === "double-color" ||
    style === "triple" ||
    style === "triple-thin" ||
    style === "triple-thick"
  ){

    const inset =
      Math.max(
        1,
        lineWidth * 2
      );


    doc.rect(
      x + inset,
      y + inset,
      width - inset * 2,
      height - inset * 2
    );

  }


  if(
    style === "shadow"
  ){

    doc.setDrawColor(
      150,
      150,
      150
    );

    doc.rect(
      x + 2,
      y + 2,
      width,
      height
    );

  }


  doc.setLineDashPattern(
    [],
    0
  );

}


/* =========================================================
   PDF FONT
========================================================= */

function pdfFontStyle(
  bold,
  italic
){

  if(
    bold &&
    italic
  ){

    return "bolditalic";

  }

  if(bold){

    return "bold";

  }

  if(italic){

    return "italic";

  }

  return "normal";

}


/* =========================================================
   PDF DATA
========================================================= */

function getPDFEntries(){

  if(
    activeSection ===
    "coco"
  ){

    return getCocoEntries();

  }


  if(
    activeSection ===
    "other"
  ){

    return getOtherEntries();

  }


  if(
    activeSection ===
    "isbn"
  ){

    return getISBNEntries();

  }


  if(
    activeSection ===
    "address"
  ){

    return getAddressEntries();

  }


  return [
    "ABC123"
  ];

}


/* =========================================================
   PDF LABEL POSITION
========================================================= */

function getLabelLayout(
  pageWidth,
  pageHeight
){

  const count =
    Math.max(
      1,
      safeNumber(
        $("labelsPerPage")?.value,
        1
      )
    );


  let columns = 1;


  if(count === 2){

    columns = 2;

  }
  else if(
    count === 4 ||
    count === 6
  ){

    columns = 2;

  }
  else if(
    count === 9 ||
    count === 12
  ){

    columns = 3;

  }


  const rows =
    Math.ceil(
      count / columns
    );


  const margin =
    6;


  const gap =
    Math.max(
      0,
      safeNumber(
        $("labelGap")?.value,
        3
      )
    );


  const cellWidth =
    (
      pageWidth -
      margin * 2 -
      gap * (columns - 1)
    ) / columns;


  const cellHeight =
    (
      pageHeight -
      margin * 2 -
      gap * (rows - 1)
    ) / rows;


  return {

    count,
    columns,
    rows,
    margin,
    gap,
    cellWidth,
    cellHeight

  };

}


/* =========================================================
   PDF: COCO
========================================================= */

function drawCocoPDFLabel(
  doc,
  x,
  y,
  w,
  h,
  value,
  index
){

  const merged =
    $("mergePOBox")?.checked ||
    false;


  const box =
    Math.max(
      1,
      safeNumber(
        $("boxInput")?.value,
        1
      )
    ) + index;


  if(merged){

    const combinedStyle =
      $("combinedBorder")
        ?.value ||
      "solid";


    drawPDFBorder(
      doc,
      x,
      y,
      w,
      h,
      combinedStyle
    );


    doc.setFont(
      "helvetica",
      pdfFontStyle(
        $("poBold")?.checked,
        $("poItalic")?.checked
      )
    );


    doc.setFontSize(
      safeNumber(
        $("poFontSize")?.value,
        24
      ) * 0.72
    );


    const text =
      getCombinedText(
        value,
        box
      );


    const lines =
      doc.splitTextToSize(
        text,
        w - 10
      );


    const lineHeight =
      doc.getFontSize() * 0.3528;


    const totalHeight =
      lines.length *
      lineHeight;


    doc.text(
      lines,
      x + w / 2,
      y + h / 2 -
      totalHeight / 2 +
      lineHeight,
      {
        align:"center"
      }
    );


    return;

  }


  if(
    $("showPO")?.checked !== false
  ){

    drawPDFBorder(
      doc,
      x + 2,
      y + 2,
      w - 4,
      h / 2 - 4,
      $("poBorder")?.value
    );


    doc.setFont(
      "helvetica",
      pdfFontStyle(
        $("poBold")?.checked,
        $("poItalic")?.checked
      )
    );


    doc.setFontSize(
      safeNumber(
        $("poFontSize")?.value,
        24
      ) * 0.72
    );


    doc.text(
      value,
      x + w / 2,
      y + h * 0.36,
      {
        align:"center"
      }
    );

  }


  if(
    $("showBox")?.checked !== false
  ){

    drawPDFBorder(
      doc,
      x + 2,
      y + h / 2 + 2,
      w - 4,
      h / 2 - 4,
      $("boxBorder")?.value
    );


    doc.setFont(
      "helvetica",
      pdfFontStyle(
        $("boxBold")?.checked,
        $("boxItalic")?.checked
      )
    );


    doc.setFontSize(
      safeNumber(
        $("boxFontSize")?.value,
        20
      ) * 0.72
    );


    doc.text(
      `BOX NO. ${box}`,
      x + w / 2,
      y + h * 0.68,
      {
        align:"center"
      }
    );

  }

}


/* =========================================================
   PDF: OTHER PO
========================================================= */

function drawOtherPDFLabel(
  doc,
  x,
  y,
  w,
  h,
  value
){

  drawPDFBorder(
    doc,
    x,
    y,
    w,
    h,
    $("otherBorder")?.value
  );


  doc.setFont(
    "helvetica",
    $("otherBold")?.checked
      ? "bold"
      : "normal"
  );


  doc.setFontSize(
    safeNumber(
      $("otherFontSize")?.value,
      20
    ) * 0.72
  );


  const lines =
    doc.splitTextToSize(
      value,
      w - 10
    );


  doc.text(
    lines,
    x + w / 2,
    y + h / 2,
    {
      align:"center",
      baseline:"middle"
    }
  );

}


/* =========================================================
   PDF: ISBN
========================================================= */

function drawISBNPDFLabel(
  doc,
  x,
  y,
  w,
  h,
  value
){

  drawPDFBorder(
    doc,
    x,
    y,
    w,
    h,
    $("isbnBorder")?.value
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(
    safeNumber(
      $("isbnFontSize")?.value,
      14
    ) * 0.72
  );


  const title =
    $("bookTitle")?.value ||
    "Book Title";


  doc.text(
    title,
    x + w / 2,
    y + 18,
    {
      align:"center",
      maxWidth:w - 10
    }
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(9);


  doc.text(
    value,
    x + w / 2,
    y + h - 12,
    {
      align:"center"
    }
  );


  /*
    jsPDF does not directly create
    a real barcode here.
    The browser preview uses JsBarcode.
    PDF keeps ISBN text safely.
  */

}


/* =========================================================
   PDF: ADDRESS
========================================================= */

function drawAddressPDFLabel(
  doc,
  x,
  y,
  w,
  h,
  value
){

  drawPDFBorder(
    doc,
    x,
    y,
    w,
    h,
    $("addressBorder")?.value
  );


  const from =
    $("fromAddress")?.value ||
    "";


  const to =
    value ||
    $("toAddress")?.value ||
    "";


  const email =
    $("email")?.value ||
    "";


  const fontSize =
    Math.max(
      7,
      safeNumber(
        $("addressFontSize")?.value,
        12
      ) * 0.72
    );


  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    fontSize
  );


  doc.text(
    "FROM",
    x + 5,
    y + 10
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  const fromLines =
    doc.splitTextToSize(
      from,
      w - 10
    );


  doc.text(
    fromLines,
    x + 5,
    y + 16
  );


  const fromHeight =
    fromLines.length *
    (fontSize * 0.42);


  const toY =
    Math.min(
      y + h * 0.55,
      y + 20 + fromHeight
    );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.text(
    "TO",
    x + 5,
    toY
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  const toLines =
    doc.splitTextToSize(
      to,
      w - 10
    );


  doc.text(
    toLines,
    x + 5,
    toY + 6
  );


  if(email){

    doc.setFontSize(
      Math.max(
        6,
        fontSize - 1
      )
    );


    doc.text(
      `Email: ${email}`,
      x + 5,
      y + h - 6,
      {
        maxWidth:
          w - 10
      }
    );

  }

}


/* =========================================================
   GENERATE PDF
========================================================= */

async function generatePDF(){

  if(
    !checkPDFLibrary()
  ){

    return;

  }


  try{

    const {
      jsPDF
    } = window.jspdf;


    const [
      pageWidth,
      pageHeight
    ] = getPDFPageSize();


    const orientation =
      $("orientation")?.value ||
      "portrait";


    const doc =
      new jsPDF({

        orientation,

        unit:"mm",

        format:[
          pageWidth,
          pageHeight
        ],

        compress:true

      });


    const layout =
      getLabelLayout(
        pageWidth,
        pageHeight
      );


    let entries =
      getPDFEntries();


    if(
      !entries.length
    ){

      entries = [
        "ABC123"
      ];

    }


    const totalPages =
      Math.ceil(
        entries.length /
        layout.count
      );


    for(
      let page = 0;
      page < totalPages;
      page++
    ){

      if(page > 0){

        doc.addPage(
          [
            pageWidth,
            pageHeight
          ],
          orientation
        );

      }


      for(
        let slot = 0;
        slot < layout.count;
        slot++
      ){

        const index =
          page *
          layout.count +
          slot;


        if(
          index >=
          entries.length
        ){

          break;

        }


        const row =
          Math.floor(
            slot /
            layout.columns
          );


        const col =
          slot %
          layout.columns;


        const x =
          layout.margin +
          col *
          (
            layout.cellWidth +
            layout.gap
          );


        const y =
          layout.margin +
          row *
          (
            layout.cellHeight +
            layout.gap
          );


        const value =
          entries[index];


        if(
          activeSection ===
          "coco"
        ){

          drawCocoPDFLabel(
            doc,
            x,
            y,
            layout.cellWidth,
            layout.cellHeight,
            value,
            index
          );

        }


        else if(
          activeSection ===
          "other"
        ){

          drawOtherPDFLabel(
            doc,
            x,
            y,
            layout.cellWidth,
            layout.cellHeight,
            value
          );

        }


        else if(
          activeSection ===
          "isbn"
        ){

          drawISBNPDFLabel(
            doc,
            x,
            y,
            layout.cellWidth,
            layout.cellHeight,
            value
          );

        }


        else if(
          activeSection ===
          "address"
        ){

          drawAddressPDFLabel(
            doc,
            x,
            y,
            layout.cellWidth,
            layout.cellHeight,
            value
          );

        }

      }

    }


    const filename =
      [
        "Ashish-Verma",
        activeSection,
        "Labels",
        Date.now()
      ]
      .join("-") +
      ".pdf";


    doc.save(
      filename
    );


    showToast(
      `PDF generated — ${entries.length} label(s)`,
      "green",
      3000
    );

  }
  catch(error){

    console.error(
      "PDF generation error:",
      error
    );


    showToast(
      `PDF generation failed: ${error.message}`,
      "red",
      5000
    );

  }

}


/* =========================================================
   PDF BUTTONS
========================================================= */

function setupPDFButtons(){

  [
    "generatePDF",
    "generateOtherPDF",
    "generateISBNPDF",
    "generateAddressPDF"
  ]
  .forEach(id => {

    const button =
      $(id);

    if(!button){
      return;
    }


    button.addEventListener(
      "click",
      () => {

        /*
          The same generator uses
          currently active main section.
        */

        generatePDF();

      }
    );

  });

}


/* =========================================================
   UNDO / REDO / DEFAULT / SAVE
========================================================= */

function setupHistoryButtons(){

  $("undoBtn")
    ?.addEventListener(
      "click",
      undo
    );


  $("redoBtn")
    ?.addEventListener(
      "click",
      redo
    );


  $("defaultBtn")
    ?.addEventListener(
      "click",
      resetToDefault
    );


  $("saveDefaultBtn")
    ?.addEventListener(
      "click",
      saveSettings
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts(){

  document.addEventListener(
    "keydown",
    event => {

      if(
        event.ctrlKey &&
        !event.shiftKey &&
        event.key.toLowerCase() ===
          "z"
      ){

        event.preventDefault();

        undo();

      }


      if(
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "y"
      ){

        event.preventDefault();

        redo();

      }


      if(
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() ===
          "z"
      ){

        event.preventDefault();

        redo();

      }

    }
  );

}


/* =========================================================
   CUSTOM SIZE VISIBILITY
========================================================= */

function updateCustomPageVisibility(){

  const custom =
    $("pageSize")?.value ===
    "custom";


  const box =
    $("customSizeBox");


  if(box){

    box.style.display =
      custom
        ? "block"
        : "none";

  }

}


/* =========================================================
   INITIAL DEFAULT STATE
========================================================= */

function setInitialState(){

  /*
    Ensure Coco Blue is selected.
  */

  activeSection =
    "coco";


  const cocoButton =
    document.querySelector(
      '.nav-card[data-section="coco"]'
    );


  if(cocoButton){

    $$(".nav-card")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button === cocoButton
        );

      });

  }


  $$(".section")
    .forEach(section => {

      section.classList.toggle(
        "active",
        section.id ===
        "section-coco"
      );

    });


  /*
    Make sure first Coco mode
    is Manual.
  */

  activeMode =
    "manual";


  $$("[data-mode]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.mode ===
        "manual"
      );

    });


  $$(".mode-panel")
    .forEach(panel => {

      panel.classList.toggle(
        "active",
        panel.id ===
        "mode-manual"
      );

    });

}


/* =========================================================
   INITIALIZATION
========================================================= */

function init(){

  setupMainNavigation();

  setupCocoModes();

  setupOtherModes();

  setupISBNModes();

  setupAddressModes();

  setupPageSize();

  setupLiveInputs();

  setupEnableDisableControls();

  setupExcelInputs();

  setupQR();

  setupPDFButtons();

  setupHistoryButtons();

  setupKeyboardShortcuts();


  loadSettings();


  updateCustomPageVisibility();

  updatePaper();

  applyMergeState(false);

  updatePreview();


  /*
    Save initial state only if
    there is no history.
  */

  if(
    history.length === 0
  ){

    saveHistory();

  }


  /*
    Library warning is only shown
    when a relevant function is used.
    No annoying popup on startup.
  */

  console.log(
    "Ashish Verma Label Studio initialized.",
    librariesStatus()
  );

}


/* =========================================================
   DOM READY
========================================================= */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

}
else{

  init();

}

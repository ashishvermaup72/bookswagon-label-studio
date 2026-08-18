(() => {
"use strict";

const $ = id => document.getElementById(id);
const $$ = s => [...document.querySelectorAll(s)];
let excelPOs = [];

function toast(message, type="ok"){
  const el=$("toast");
  el.textContent=message;
  el.className="toast show "+type;
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>el.className="toast",2800);
}

const borderOptions = [
  ["none","No Border"],["solid","Solid"],["dashed","Dashed"],["dotted","Dotted"],
  ["double","Double"],["groove","Groove"],["ridge","Ridge"],["inset","Inset"],
  ["outset","Outset"],["bold","Bold"],["thin","Thin"],["medium","Medium"],
  ["thick","Thick"],["dashdot","Dash-Dot"],["longdash","Long Dash"]
];

function fillBorders(){
  ["poBorder","boxBorder","bothBorder","otherPOBorder","otherBoxBorder","otherBothBorder"].forEach(id=>{
    const s=$(id); if(!s)return;
    s.innerHTML=borderOptions.map(([v,t])=>`<option value="${v}">${t}</option>`).join("");
  });
}
fillBorders();

function activate(panel){
  $$(".tab").forEach(x=>x.classList.toggle("active",x.dataset.panel===panel));
  $$(".panel").forEach(x=>x.classList.toggle("active",x.id===panel));
  const coco=panel==="cocoTool";
  $("workspaceTitle").textContent=coco?"CocoBlu PO Label Maker":"Others PO Label Maker";
  $("workspaceSub").textContent=coco?"Create PO and Box labels using Manual, Bulk or Excel / CSV input.":"Create labels for other purchase orders.";
}

$$(".category").forEach(card=>{
  card.addEventListener("click",()=>{
    $$(".category").forEach(x=>x.classList.remove("active"));
    card.classList.add("active");
    if(card.dataset.future){
      toast(card.dataset.future+" module is planned for the next phase.","bad");
      return;
    }
    activate(card.dataset.tool);
  });
});
$$(".tab").forEach(t=>t.addEventListener("click",()=>activate(t.dataset.panel)));

function mode(){
  return document.querySelector(".mode.active")?.dataset.mode || "manual";
}
$$(".mode").forEach(m=>{
  m.addEventListener("click",()=>{
    $$(".mode").forEach(x=>x.classList.remove("active"));
    m.classList.add("active");
    ["manual","bulk","excel"].forEach(x=>$(`${x}Area`).classList.toggle("hidden",x!==m.dataset.mode));
    renderCoco();
  });
});

function cocoPOs(){
  if(mode()==="bulk"){
    return $("bulkPO").value.split(/[\n,\r]+/).map(x=>x.trim()).filter(Boolean);
  }
  if(mode()==="excel") return excelPOs;
  return $("manualPO").value.trim() ? [$("manualPO").value.trim()] : [];
}

$("bulkPO").addEventListener("input",()=>{
  const n=cocoPOs().length;
  $("bulkCount").textContent=`${n} PO number${n===1?"":"s"} detected.`;
  renderCoco();
});

$("excelFile").addEventListener("change", async e=>{
  const file=e.target.files[0]; if(!file)return;
  const name=file.name.toLowerCase();
  try{
    if(name.endsWith(".csv")){
      const text=await file.text();
      excelPOs=text.split(/\r?\n/).map(r=>r.split(",")[0].trim().replace(/^"|"$/g,"")).filter(Boolean).slice(1);
    }else{
      if(!window.XLSX) throw new Error("Excel library unavailable");
      const data=await file.arrayBuffer();
      const wb=XLSX.read(data,{type:"array"});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      excelPOs=rows.slice(1).map(r=>String(r[0]??"").trim()).filter(Boolean);
    }
    excelPOs=[...new Set(excelPOs)];
    $("excelCount").textContent=`${excelPOs.length} PO numbers loaded from Column A.`;
    toast("Excel / CSV loaded successfully.");
    renderCoco();
  }catch(err){
    console.error(err);
    excelPOs=[];
    $("excelCount").textContent="Unable to read file.";
    toast("Could not read this Excel/CSV file.","bad");
  }
});

function range(){
  return {start:Number($("startBox").value),end:Number($("endBox").value)};
}
function validRange(){
  const {start,end}=range();
  const ok=Number.isFinite(start)&&Number.isFinite(end)&&start<=end;
  $("rangeError").classList.toggle("hidden",ok||(!Number.isFinite(start)&&!Number.isFinite(end)));
  return ok;
}
$("startBox").addEventListener("input",renderCoco);
$("endBox").addEventListener("input",renderCoco);

function borderCSS(v){
  const map={
    none:"none",solid:"1px solid #172033",dashed:"1px dashed #172033",dotted:"1px dotted #172033",
    double:"3px double #172033",groove:"3px groove #172033",ridge:"3px ridge #172033",
    inset:"3px inset #172033",outset:"3px outset #172033",bold:"3px solid #172033",
    thin:"1px solid #172033",medium:"2px solid #172033",thick:"4px solid #172033",
    dashdot:"1px dashed #172033",longdash:"2px dashed #172033"
  };
  return map[v]||"none";
}

function makeLabel(po,box,content,poB,boxB,bothB){
  const el=document.createElement("div"); el.className="preview-label";
  const p=document.createElement("div"); p.className="preview-po"; p.textContent=po;
  const b=document.createElement("div"); b.className="preview-box"; b.textContent="BOX NO. "+box;
  if(content==="po")b.style.display="none";
  if(content==="box")p.style.display="none";
  if(bothB!=="none"){
    el.style.border=borderCSS(bothB);
  }else{
    if(poB!=="none"){p.style.border=borderCSS(poB);p.style.padding="4px 8px";}
    if(boxB!=="none"){b.style.border=borderCSS(boxB);b.style.padding="4px 8px";}
  }
  el.append(p,b);
  return el;
}

function renderCoco(){
  const page=$("labelPage"); page.innerHTML="";
  const pos=cocoPOs(), {start,end}=range();
  if(!pos.length||!Number.isFinite(start)||!Number.isFinite(end)||start>end){
    page.innerHTML=`<div style="grid-column:1/-1;display:grid;place-items:center;min-height:350px;color:#94a3b8;text-align:center">Enter PO number and Box Start / End number to see live preview.</div>`;
    $("previewStatus").textContent="Ready. Enter PO and Box range.";
    return;
  }
  let box=start;
  const content=$("contentType").value;
  for(let i=0;i<8;i++){
    page.appendChild(makeLabel(pos[i%pos.length],Math.min(box,end),content,$("poBorder").value,$("boxBorder").value,$("bothBorder").value));
    if(box<end)box++;
  }
  $("previewStatus").textContent=`${pos.length} PO number${pos.length===1?"":"s"} • ${end-start+1} Box number${end-start+1===1?"":"s"} • Previewing first 8 labels.`;
}

["manualPO","contentType","poBorder","boxBorder","bothBorder"].forEach(id=>$(id).addEventListener("input",renderCoco));
["contentType","poBorder","boxBorder","bothBorder"].forEach(id=>$(id).addEventListener("change",renderCoco));

function clearCoco(){
  ["manualPO","bulkPO","startBox","endBox"].forEach(id=>$(id).value="");
  $("excelFile").value=""; excelPOs=[];
  $("bulkCount").textContent="0 PO numbers detected.";
  $("excelCount").textContent="No file selected.";
  $("contentType").value="po";
  $("poBorder").value=$("boxBorder").value=$("bothBorder").value="none";
  renderCoco(); toast("CocoBlu form cleared.");
}
$("clearCoco").addEventListener("click",clearCoco);

function makePDF(po, start, end, content, poB, boxB, bothB, filename){
  if(!window.jspdf){toast("PDF engine is not loaded. Check internet connection.","bad");return;}
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:[100,150]});
  let first=true;
  for(let n=start;n<=end;n++){
    if(!first)pdf.addPage([100,150],"portrait");
    first=false;
    if(bothB!=="none"){pdf.setLineWidth(bothB==="bold"||bothB==="thick"?1:.5);pdf.rect(5,5,90,140);}
    if(content==="po"||content==="both"){
      pdf.setFont("helvetica","bold");pdf.setFontSize(22);
      pdf.text(String(po),50,content==="both"?68:75,{align:"center"});
      if(poB!=="none"&&bothB==="none"){pdf.setLineWidth(poB==="bold"||poB==="thick"?1:.5);pdf.rect(15,48,70,38);}
    }
    if(content==="box"||content==="both"){
      pdf.setFont("helvetica","bold");pdf.setFontSize(25);
      pdf.text("BOX NO. "+n,50,content==="both"?88:78,{align:"center"});
      if(boxB!=="none"&&bothB==="none"){pdf.setLineWidth(boxB==="bold"||boxB==="thick"?1:.5);pdf.rect(15,60,70,38);}
    }
  }
  pdf.save(filename);
  toast("PDF generated successfully.");
}

$("generateCoco").addEventListener("click",()=>{
  const pos=cocoPOs(); const {start,end}=range();
  if(!pos.length){toast("Please enter at least one PO number.","bad");return;}
  if(!validRange()){toast("Please correct the Box range.","bad");return;}
  const content=$("contentType").value;
  // Generate one PDF containing the selected PO list and box range.
  // Each PO gets the full requested box range.
  if(!window.jspdf){toast("PDF engine is not loaded.","bad");return;}
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:[100,150]});
  let first=true;
  for(const po of pos){
    for(let n=start;n<=end;n++){
      if(!first)pdf.addPage([100,150],"portrait"); first=false;
      const both=$("bothBorder").value;
      if(both!=="none"){pdf.setLineWidth(both==="bold"||both==="thick"?1:.5);pdf.rect(5,5,90,140);}
      const content=$("contentType").value;
      if(content==="po"||content==="both"){
        pdf.setFont("helvetica","bold");pdf.setFontSize(22);
        pdf.text(String(po),50,content==="both"?68:75,{align:"center"});
        if($("poBorder").value!=="none"&&both==="none"){pdf.rect(15,48,70,38);}
      }
      if(content==="box"||content==="both"){
        pdf.setFont("helvetica","bold");pdf.setFontSize(25);
        pdf.text("BOX NO. "+n,50,content==="both"?88:78,{align:"center"});
        if($("boxBorder").value!=="none"&&both==="none"){pdf.rect(15,60,70,38);}
      }
    }
  }
  pdf.save("CocoBlu_Labels.pdf"); toast("CocoBlu PDF generated successfully.");
});

function printLabels(title, po, start, end, content, poB, boxB, bothB){
  if(!po||!Number.isFinite(start)||!Number.isFinite(end)||start>end){toast("Enter valid PO and Box range.","bad");return;}
  const w=window.open("","_blank");
  if(!w){toast("Popup blocked. Allow popups for Print PDF.","bad");return;}
  let labels="";
  for(let n=start;n<=Math.min(end,start+99);n++){
    const p=(content==="po"||content==="both")?`<div class="po">${po}</div>`:"";
    const b=(content==="box"||content==="both")?`<div class="box">BOX NO. ${n}</div>`:"";
    labels+=`<div class="label" style="${bothB!=="none"?"border:2px solid #172033":""}">${p}${b}</div>`;
  }
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>@page{size:A4;margin:10mm}body{font-family:Arial;margin:0}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm}.label{min-height:45mm;border:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;page-break-inside:avoid}.po{font-size:18pt;font-weight:800;padding:4px 8px}.box{font-size:15pt;font-weight:700;margin-top:4mm;padding:4px 8px}</style></head><body><div class="grid">${labels}</div><script>onload=()=>setTimeout(()=>print(),400)<\/script></body></html>`);
  w.document.close();
}
$("printCoco").addEventListener("click",()=>{
  const pos=cocoPOs(); const {start,end}=range();
  if(!pos.length){toast("Please enter a PO number.","bad");return;}
  if(!validRange()){toast("Please correct the Box range.","bad");return;}
  printLabels("CocoBlu Labels",pos[0],start,end,$("contentType").value,$("poBorder").value,$("boxBorder").value,$("bothBorder").value);
});

function renderOther(){
  const page=$("otherLabelPage"); page.innerHTML="";
  const po=$("otherPO").value.trim(), start=Number($("otherStartBox").value), end=Number($("otherEndBox").value);
  if(!po||!Number.isFinite(start)||!Number.isFinite(end)||start>end){
    page.innerHTML=`<div style="grid-column:1/-1;display:grid;place-items:center;min-height:350px;color:#94a3b8;text-align:center">Enter PO number and Box Start / End number.</div>`;
    return;
  }
  for(let n=start;n<=Math.min(end,start+7);n++){
    page.appendChild(makeLabel(po,n,$("otherContentType").value,$("otherPOBorder").value,$("otherBoxBorder").value,$("otherBothBorder").value));
  }
  $("otherStatus").textContent=`Previewing ${Math.min(8,end-start+1)} of ${end-start+1} labels.`;
}
["otherPO","otherStartBox","otherEndBox","otherContentType","otherPOBorder","otherBoxBorder","otherBothBorder"].forEach(id=>$(id).addEventListener("input",renderOther));
["otherContentType","otherPOBorder","otherBoxBorder","otherBothBorder"].forEach(id=>$(id).addEventListener("change",renderOther));

$("clearOther").addEventListener("click",()=>{
  ["otherPO","otherStartBox","otherEndBox"].forEach(id=>$(id).value="");
  $("otherContentType").value="po";
  $("otherPOBorder").value=$("otherBoxBorder").value=$("otherBothBorder").value="none";
  renderOther();toast("Others PO form cleared.");
});
$("generateOther").addEventListener("click",()=>{
  const po=$("otherPO").value.trim(),start=Number($("otherStartBox").value),end=Number($("otherEndBox").value);
  if(!po||!Number.isFinite(start)||!Number.isFinite(end)||start>end){toast("Enter valid PO and Box range.","bad");return;}
  makePDF(po,start,end,$("otherContentType").value,$("otherPOBorder").value,$("otherBoxBorder").value,$("otherBothBorder").value,"Other_PO_Labels.pdf");
});
$("printOther").addEventListener("click",()=>{
  const po=$("otherPO").value.trim(),start=Number($("otherStartBox").value),end=Number($("otherEndBox").value);
  printLabels("Other PO Labels",po,start,end,$("otherContentType").value,$("otherPOBorder").value,$("otherBoxBorder").value,$("otherBothBorder").value);
});

$$(".nav").forEach(n=>n.addEventListener("click",()=>{
  $$(".nav").forEach(x=>x.classList.remove("active")); n.classList.add("active");
  if(n.textContent.includes("Create Labels")) window.scrollTo({top:0,behavior:"smooth"});
  else toast(n.textContent.trim()+" section will be connected in the next phase.");
}));

renderCoco();
renderOther();
})();
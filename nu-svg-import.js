/* N.U SVG Import — local-only, allowlisted SVG sanitization before rasterization. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUSVGImport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const ELEMENTS=new Set(["svg","g","path","rect","circle","ellipse","line","polyline","polygon","defs","linearGradient","radialGradient","stop","clipPath","mask","use","title","desc"]);
 const ATTRS=new Set(["id","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","width","height","viewBox","preserveAspectRatio","d","points","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","fill-rule","clip-rule","opacity","fill-opacity","stroke-opacity","transform","offset","stop-color","stop-opacity","gradientUnits","gradientTransform","spreadMethod","clipPathUnits","maskUnits","maskContentUnits","version","xmlns","xmlns:xlink","href","xlink:href","vector-effect","shape-rendering"]);
 const STYLE_PROPS=new Set(["fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","fill-rule","clip-rule","opacity","fill-opacity","stroke-opacity","stop-color","stop-opacity","transform","clip-path","mask"]);
 function isSVGFile(file){
  return !!file&&((file.type||"").toLowerCase()==="image/svg+xml"||/\.svg$/i.test(file.name||""));
 }
 function safeReference(value){
  return /^url\(\s*#[-\w:.]+\s*\)$/i.test(value)||/^#[\w:.-]+$/.test(value);
 }
 function safeStyle(value){
  const kept=[];
  for(const part of String(value).split(";")){
   const colon=part.indexOf(":");if(colon<1)continue;
   const name=part.slice(0,colon).trim().toLowerCase(),v=part.slice(colon+1).trim();
   if(!STYLE_PROPS.has(name)||!v||/javascript:|data:|https?:|\/\//i.test(v)||/expression\s*\(/i.test(v))continue;
   if(/url\s*\(/i.test(v)&&!safeReference(v))continue;
   kept.push(name+":"+v);
  }
  return kept.join(";");
 }
 function sanitize(source){
  if(typeof source!=="string"||!source.trim()||source.length>20*1024*1024)throw new TypeError("SVG source is empty or exceeds the 20 MB safety limit.");
  if(typeof DOMParser==="undefined"||typeof XMLSerializer==="undefined")throw new Error("This browser does not provide a safe XML parser.");
  const doc=new DOMParser().parseFromString(source,"image/svg+xml");
  if(doc.querySelector("parsererror"))throw new TypeError("The selected file is not valid SVG/XML.");
  const root=doc.documentElement;
  if(!root||root.localName!=="svg")throw new TypeError("The selected XML document does not have an SVG root.");
  function cleanAttributes(node){
   for(const attr of Array.from(node.attributes)){
    const name=attr.name,value=attr.value.trim();
    if(name.toLowerCase().startsWith("on")||(!ATTRS.has(name)&&name!=="style")){node.removeAttribute(name);continue;}
    if(name==="style"){const v=safeStyle(value);if(v)node.setAttribute("style",v);else node.removeAttribute(name);continue;}
    if(name==="href"||name==="xlink:href"){if(!value.startsWith("#")||!/^#[\w:.-]+$/.test(value))node.removeAttribute(name);continue;}
    if(/javascript:|data:|https?:|\/\//i.test(value)&&name!=="xmlns"&&name!=="xmlns:xlink")node.removeAttribute(name);
    if(/url\s*\(/i.test(value)&&!safeReference(value))node.removeAttribute(name);
   }
  }
  function clean(parent){
   cleanAttributes(parent);
   for(const node of Array.from(parent.childNodes)){
    if(node.nodeType===8||node.nodeType===7){node.remove();continue;}
    if(node.nodeType!==1){if(node.nodeType!==3)node.remove();continue;}
    if(!ELEMENTS.has(node.localName)){node.remove();continue;}
    clean(node);
   }
  }
  clean(root);
  const vb=(root.getAttribute("viewBox")||"").trim().split(/[\s,]+/).map(Number);
  const parsePx=v=>{const m=/^\s*(\d+(?:\.\d+)?)(?:px)?\s*$/i.exec(v||"");return m?Number(m[1]):0;};
  let w=parsePx(root.getAttribute("width")),h=parsePx(root.getAttribute("height"));
  if((!w||!h)&&vb.length===4&&vb.every(Number.isFinite)&&vb[2]>0&&vb[3]>0){w=w||vb[2];h=h||vb[3];}
  if(!w||!h){w=w||300;h=h||150;}
  root.setAttribute("width",String(Math.max(1,Math.min(16384,Math.ceil(w)))));
  root.setAttribute("height",String(Math.max(1,Math.min(16384,Math.ceil(h)))));
  if(!root.hasAttribute("viewBox"))root.setAttribute("viewBox","0 0 "+w+" "+h);
  root.setAttribute("xmlns","http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(root);
 }
 async function toRasterBlob(file){
  if(!isSVGFile(file))return file;
  const source=await file.text();
  const cleanSource=sanitize(source);
  return new Blob([cleanSource],{type:"image/svg+xml"});
 }
 return {isSVGFile,sanitize,toRasterBlob};
});

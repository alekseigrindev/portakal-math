// Снимок листа с примером: разметка (точная, 1–2 КБ) и, если получится, PNG.
//
// Разметка — основное: просмотрщик открывает её с теми же стилями и получает
// пиксель в пиксель. PNG нужен только чтобы увидеть отчёт, не открывая просмотрщик,
// поэтому любая неудача при его сборке не должна мешать отправке.
import {buildItem,fitSheet} from '../view/item.js';

const THEME_VARS=['--bg','--grid-faint','--paper','--grid','--surface','--line',
  '--fg','--muted','--ink','--ink-fg','--red','--green','--orange','--hand','--ui'];

const visibleSheet=()=>document.querySelector('#play').hidden
  ? document.querySelector('#setup .sheet')
  : document.querySelector('#play .sheet');

// Жалобу часто пишут, уже уйдя с примера. Тогда рисуем нужный пример заново
// за пределами экрана — иначе в кадр попадёт не то, на что жалуются.
function offscreenSheet(item,vals){
  const sheet=document.createElement('div');
  sheet.className='sheet';
  sheet.style.cssText='position:absolute;left:-10000px;top:0;width:26rem';
  const host=document.createElement('div');
  sheet.append(host);
  document.body.append(sheet);
  fitSheet(host,item);
  host.append(buildItem(item,{typed:(vals||[])[0]||'',vals:vals||[],active:0,cursor:false}));
  return sheet;
}
const release=node=>{ if(node&&node.parentNode===document.body) node.remove(); };

// Значения переменных темы на момент снимка: в клоне :root недоступен.
function themeVars(node){
  const root=getComputedStyle(document.documentElement);
  const vars={};
  for(const v of THEME_VARS) vars[v]=root.getPropertyValue(v).trim();
  if(node) vars['--cell']=getComputedStyle(node).getPropertyValue('--cell').trim();
  return vars;
}

function markupOf(node){
  if(!node) return null;
  const r=node.getBoundingClientRect();
  // со служебным «за экраном» снимок и в просмотрщике уедет за экран,
  // поэтому чистим стиль на копии, а не вырезаем строкой из разметки
  const clone=node.cloneNode(true);
  for(const prop of ['position','left','top','width']) clone.style.removeProperty(prop);
  if(!clone.getAttribute('style')) clone.removeAttribute('style');
  return {
    html:clone.outerHTML,
    vars:themeVars(node),
    width:Math.round(r.width),
    height:Math.round(r.height)
  };
}

/* ---------- PNG ---------- */

let cssCache=null, fontCache=null;

// Свои таблицы стилей лежат рядом, их можно просто прочитать.
async function appCss(){
  if(cssCache!==null) return cssCache;
  const hrefs=[...document.querySelectorAll('link[rel="stylesheet"]')]
    .map(l=>l.getAttribute('href'))
    .filter(h=>h&&!/^https?:/i.test(h));
  const parts=await Promise.all(hrefs.map(h=>fetch(h).then(r=>r.text()).catch(()=>'')));
  cssCache=parts.join('\n');
  return cssCache;
}

const toBase64=buf=>{
  const b=new Uint8Array(buf);
  let s='';
  for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
  return btoa(s);
};

// Внутри foreignObject внешние шрифты не грузятся, поэтому их надо вшить.
// Если не вышло — рисуем запасным шрифтом: это портит PNG, но не отчёт.
async function fontCss(){
  if(fontCache!==null) return fontCache;
  fontCache='';
  try{
    const link=[...document.querySelectorAll('link[rel="stylesheet"]')]
      .map(l=>l.href).find(h=>h.includes('fonts.googleapis.com'));
    if(!link) return fontCache;
    let css=await fetch(link).then(r=>r.text());
    const urls=[...new Set(css.match(/https:\/\/fonts\.gstatic\.com[^)'"]+/g)||[])];
    let budget=400*1024;
    for(const u of urls){
      if(budget<=0) break;
      const buf=await fetch(u).then(r=>r.arrayBuffer()).catch(()=>null);
      if(!buf||buf.byteLength>budget) continue;
      budget-=buf.byteLength;
      css=css.split(u).join('data:font/woff2;base64,'+toBase64(buf));
    }
    // ссылки, которые вшить не удалось, убираем: иначе рендер их ждёт
    fontCache=css.replace(/@font-face\s*\{[^}]*fonts\.gstatic\.com[^}]*\}/g,'');
  }catch(e){ fontCache=''; }
  return fontCache;
}

async function toPng(node){
  const r=node.getBoundingClientRect();
  const w=Math.ceil(r.width), h=Math.ceil(r.height);
  if(!w||!h) return null;
  const vars=themeVars(node);

  const clone=node.cloneNode(true);
  clone.style.position='static';
  clone.style.left='auto';

  const holder=document.createElementNS('http://www.w3.org/1999/xhtml','div');
  holder.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
  holder.setAttribute('style',
    Object.entries(vars).map(([k,v])=>`${k}:${v}`).join(';')+`;width:${w}px;height:${h}px`);
  const style=document.createElementNS('http://www.w3.org/1999/xhtml','style');
  style.textContent=(await fontCss())+'\n'+(await appCss());
  holder.append(style,clone);

  const body=new XMLSerializer().serializeToString(holder);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`+
    `<foreignObject x="0" y="0" width="${w}" height="${h}">${body}</foreignObject></svg>`;

  const img=new Image();
  const loaded=new Promise((res,rej)=>{
    img.onload=res;
    img.onerror=()=>rej(new Error('svg не отрисовался'));
    setTimeout(()=>rej(new Error('таймаут отрисовки')),5000);
  });
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  await loaded;

  const scale=Math.min(2,window.devicePixelRatio||1);
  const canvas=document.createElement('canvas');
  canvas.width=Math.round(w*scale);
  canvas.height=Math.round(h*scale);
  const ctx=canvas.getContext('2d');
  ctx.scale(scale,scale);
  ctx.fillStyle=vars['--bg']||'#fff';
  ctx.fillRect(0,0,w,h);
  ctx.drawImage(img,0,0,w,h);
  return await new Promise(res=>canvas.toBlob(res,'image/png'));
}

// PNG — необязательная часть отчёта: ошибку глотаем и отдаём null.
async function pngOf(node){
  try{ return node?await toPng(node):null; }catch(e){ return null; }
}

export {visibleSheet,offscreenSheet,release,markupOf,pngOf};

// QR-код открытой языковой версии: навёл камеру телефона — и тренажёр уже на
// нужном языке. Ссылка берётся из адреса языка, а не из location.href: настройки
// и прочее в ?/# сюда не нужны, а сам адрес короче — и код крупнее.
import {S} from '../state.js';
import {t} from '../i18n/index.js';
import {langHref} from './langurl.js';
import {pauseRound,resumeRound} from './round.js';
import qrcode from '../vendor/qrcode.mjs';

const NS='http://www.w3.org/2000/svg';
let dlg=null, title=null, pic=null, link=null, okBtn=null;

const pageUrl=()=>new URL(langHref(S.lang),location.href).href;

// Каждый тёмный модуль — квадрат 1×1 в одном пути. Поля в 4 модуля требует
// стандарт: без них камера путает край кода с тем, что вокруг.
function qrSvg(text){
  const q=qrcode(0,'M');
  q.addData(text);
  q.make();
  const n=q.getModuleCount(), pad=4;
  let d='';
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d+=`M${c+pad} ${r+pad}h1v1h-1z`;
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox',`0 0 ${n+pad*2} ${n+pad*2}`);
  svg.setAttribute('shape-rendering','crispEdges');
  svg.setAttribute('role','img');
  const bg=document.createElementNS(NS,'rect');
  bg.setAttribute('width','100%'); bg.setAttribute('height','100%');
  bg.setAttribute('fill','#fff');      // и в тёмной теме: светлые коды на тёмном читают не все камеры
  const p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);
  p.setAttribute('fill','#000');
  svg.append(bg,p);
  return svg;
}

function build(){
  dlg=document.createElement('dialog');
  dlg.className='hint-dlg qr-dlg';
  const body=document.createElement('div');
  body.className='hint-body';

  title=document.createElement('h2');
  title.className='hint-title';

  pic=document.createElement('div');
  pic.className='qr-pic';

  link=document.createElement('a');
  link.className='qr-link';

  const row=document.createElement('div');
  row.className='fb-row';
  okBtn=document.createElement('button');
  okBtn.className='btn';
  okBtn.type='button';
  okBtn.addEventListener('click',()=>dlg.close());
  row.append(okBtn);

  body.append(title,pic,link,row);
  dlg.append(body);
  dlg.addEventListener('close',resumeRound);
  // щелчок по затемнению вокруг окна тоже закрывает
  dlg.addEventListener('click',e=>{ if(e.target===dlg) dlg.close(); });
  document.body.append(dlg);
}

function openQr(){
  if(!dlg) build();
  const url=pageUrl();
  title.textContent=t('qr.title');
  okBtn.textContent=t('qr.ok');
  const svg=qrSvg(url);
  svg.setAttribute('aria-label',t('qr.title'));
  pic.replaceChildren(svg);
  link.href=url;
  link.textContent=url.replace(/^https?:\/\//,'');
  pauseRound();
  dlg.showModal();
}

export {openQr};

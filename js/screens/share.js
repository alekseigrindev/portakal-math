// «Поделиться»: ссылка на открытую языковую версию — в соцсеть, мессенджер или
// в буфер обмена. Соцсети открываются обычными ссылками на их страницы
// «поделиться»: никаких чужих скриптов на странице и никаких данных, кроме
// адреса сайта и его названия.
import {S} from '../state.js';
import {t} from '../i18n/index.js';
import {pageUrl} from './langurl.js';
import {pauseRound,resumeRound} from './round.js';

const e=encodeURIComponent;
// [название, цвет метки, адрес по ссылке u и тексту s]. Названия не переводятся.
const NETS=[
  ['Telegram','#229ed9',(u,s)=>`https://t.me/share/url?url=${e(u)}&text=${e(s)}`],
  ['WhatsApp','#25d366',(u,s)=>`https://wa.me/?text=${e(s+' '+u)}`],
  ['Viber','#7360f2',(u,s)=>`viber://forward?text=${e(s+' '+u)}`],
  ['Facebook','#1877f2',u=>`https://www.facebook.com/sharer/sharer.php?u=${e(u)}`],
  ['X','#111111',(u,s)=>`https://x.com/intent/post?url=${e(u)}&text=${e(s)}`],
  ['Threads','#000000',(u,s)=>`https://www.threads.com/intent/post?text=${e(s+' '+u)}`]
];

let dlg=null, title=null, list=null, copyBtn=null, okBtn=null, url='';

// Буфер обмена из async API есть не везде (старый Safari, http без TLS) —
// тогда старый способ через выделенное поле.
async function copy(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(err){
    const ta=document.createElement('textarea');
    ta.value=text; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.opacity='0';
    dlg.append(ta); ta.select();
    let ok=false;
    try{ ok=document.execCommand('copy'); }catch(e2){}
    ta.remove();
    return ok;
  }
}

function build(){
  dlg=document.createElement('dialog');
  dlg.className='hint-dlg share-dlg';
  const body=document.createElement('div');
  body.className='hint-body';

  title=document.createElement('h2');
  title.className='hint-title';

  list=document.createElement('div');
  list.className='share-list';

  copyBtn=document.createElement('button');
  copyBtn.className='chip share-copy';
  copyBtn.type='button';
  copyBtn.addEventListener('click',async()=>{
    if(await copy(url)) copyBtn.textContent=t('share.copied');
  });

  const row=document.createElement('div');
  row.className='fb-row';
  okBtn=document.createElement('button');
  okBtn.className='btn';
  okBtn.type='button';
  okBtn.addEventListener('click',()=>dlg.close());
  row.append(okBtn);

  body.append(title,list,copyBtn,row);
  dlg.append(body);
  dlg.addEventListener('close',resumeRound);
  // щелчок по затемнению вокруг окна тоже закрывает
  dlg.addEventListener('click',ev=>{ if(ev.target===dlg) dlg.close(); });
  document.body.append(dlg);
}

function openShare(){
  if(!dlg) build();
  url=pageUrl(S.lang);
  const text='portakal-math — '+t('title');
  title.textContent=t('share.title');
  copyBtn.textContent=t('share.copy');
  okBtn.textContent=t('ok');
  list.replaceChildren(...NETS.map(([name,color,href])=>{
    const a=document.createElement('a');
    a.className='chip share-net';
    a.href=href(url,text);
    // viber:// открывает приложение, новая вкладка ему не нужна
    if(a.protocol.startsWith('http')){ a.target='_blank'; a.rel='noopener noreferrer'; }
    a.style.setProperty('--net',color);
    a.textContent=name;
    return a;
  }));
  pauseRound();
  dlg.showModal();
}

export {openShare};

// Страница «Данные и cookie».
// Отдельная страница, а не экран приложения: на неё должно быть можно дать
// ссылку, в том числе из магазина приложений или письма, не заставляя человека
// сначала открывать тренажёр.
import {LANGS,CODES,detectLang,setLang,t} from './i18n/index.js';
import {$} from './view/dom.js';
import {renderFooter} from './screens/footer.js';

// Дата последнего изменения текста. Руками: меняется вместе со смыслом, а не
// вместе с любой правкой вёрстки.
const UPDATED='2026-10-20';

const SECTIONS=['local','cookie','third','report','kids'];

// Язык: из адреса, иначе из сохранённых настроек приложения, иначе из браузера.
function startLang(){
  const q=new URLSearchParams(location.search).get('lang');
  if(CODES.includes(q)) return q;
  try{
    const c=JSON.parse(localStorage.getItem('schetnik-v1')||'{}').cfg;
    if(c&&CODES.includes(c.lang)) return c.lang;
  }catch(e){}
  return detectLang();
}

let lang=startLang();

function renderLangs(){
  const host=$('#langs'); host.replaceChildren();
  const sel=document.createElement('select');
  sel.className='lang-select';
  sel.setAttribute('aria-label',t('langLabel'));
  sel.title=t('langLabel');
  for(const [code,name] of LANGS){
    const o=document.createElement('option');
    o.value=code; o.textContent=name; o.lang=code;
    if(lang===code) o.selected=true;
    sel.append(o);
  }
  sel.addEventListener('change',()=>{
    lang=sel.value;
    const u=new URL(location.href);
    u.searchParams.set('lang',lang);
    history.replaceState(null,'',u);
    render();
  });
  host.append(sel);
}



function render(){
  setLang(lang);
  document.documentElement.lang=lang;
  document.title='portakal-math — '+t('pp.title');

  $('#ppTitle').textContent=t('pp.title');
  $('#ppDate').textContent=t('pp.updated',{d:UPDATED});
  $('#ppLead').textContent=t('pp.lead');

  const body=$('#ppBody'); body.replaceChildren();
  for(const key of SECTIONS){
    const h=document.createElement('h2');
    h.textContent=t('pp.'+key+'.h');
    const p=document.createElement('p');
    p.textContent=t('pp.'+key+'.b');
    body.append(h,p);
  }

  const back=$('#ppBack');
  back.textContent=t('pp.back');
  back.href=lang+'/';
  $('#home').href=lang+'/';

  renderLangs();
  renderFooter();
}

render();

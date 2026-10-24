// Языки интерфейса.
// Текущий язык живёт здесь, а не в состоянии, иначе i18n и state ссылались бы друг на друга.
import en from './en.js';
import ka from './ka.js';
import kk from './kk.js';
import pt from './pt.js';
import ru from './ru.js';
import tr from './tr.js';
import uk from './uk.js';

const I18N={en,ka,kk,pt,ru,tr,uk};

// Порядок в списке — по самоназванию, то есть по тому, что человек читает.
// Сортировка по кодам выглядела бы для него случайной.
const LANGS=[
  ['en','English'],
  ['ka','ქართული'],
  ['kk','Қазақша'],
  ['pt','Português'],
  ['ru','Русский'],
  ['tr','Türkçe'],
  ['uk','Українська']
].sort((a,b)=>a[1].localeCompare(b[1]));

const CODES=LANGS.map(l=>l[0]);
const FALLBACK='en';

function detectLang(){
  const list=(typeof navigator!=='undefined'&&navigator.languages)||
    [(typeof navigator!=='undefined'&&navigator.language)||''];
  for(const raw of list){
    const code=String(raw).toLowerCase().split('-')[0];
    if(CODES.includes(code)) return code;
  }
  return FALLBACK;
}

let lang=FALLBACK;
const setLang=code=>{ if(I18N[code]) lang=code; };
const getLang=()=>lang;

function t(k,v){
  const d=I18N[lang]||I18N[FALLBACK];
  let s=d[k];
  if(s===undefined) s=I18N[FALLBACK][k];
  if(s===undefined) s=k;
  return v?s.replace(/\{(\w+)\}/g,(m,n)=>v[n]!==undefined?v[n]:m):s;
}
const sayOp=op=>t(op==='+'?'say.plus':op==='−'?'say.minus':op==='×'?'say.times':'say.div');

export {I18N,LANGS,CODES,detectLang,setLang,getLang,t,sayOp};

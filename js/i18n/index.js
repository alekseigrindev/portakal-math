// Языки интерфейса: русский, турецкий, португальский.
// Текущий язык живёт здесь, а не в состоянии, иначе i18n и state ссылались бы друг на друга.
import ru from './ru.js';
import tr from './tr.js';
import pt from './pt.js';

const I18N={ru,tr,pt};
const LANGS=[['ru','RU','Русский'],['tr','TR','Türkçe'],['pt','PT','Português']];

/* ---------- языки: русский, турецкий, португальский ---------- */
function detectLang(){
  const n=((typeof navigator!=='undefined'&&navigator.language)||'').toLowerCase();
  return n.startsWith('tr')?'tr':n.startsWith('pt')?'pt':'ru';
}

let lang='ru';
const setLang=code=>{ if(I18N[code]) lang=code; };
const getLang=()=>lang;

function t(k,v){
  const d=I18N[lang]||I18N.ru;
  let s=d[k];
  if(s===undefined) s=I18N.ru[k];
  if(s===undefined) s=k;
  return v?s.replace(/\{(\w+)\}/g,(m,n)=>v[n]!==undefined?v[n]:m):s;
}
const sayOp=op=>t(op==='+'?'say.plus':op==='−'?'say.minus':op==='×'?'say.times':'say.div');

export {I18N,LANGS,detectLang,setLang,getLang,t,sayOp};

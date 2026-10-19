// Панель ввода. Какая нужна — решает сам пример: цифры или выбор из вариантов.
// Обработчики приходят снаружи один раз, поэтому экран раунда зависит от панели,
// а панель от него — нет.
import {$} from '../view/dom.js';
import {t} from '../i18n/index.js';

let H={press(){},back(){},go(){},choose(){}};
let sig=null;

function initPad(handlers){ H=handlers; sig=null; }
function invalidatePad(){ sig=null; }

function key(pad,txt,cls,fn,label){
  const b=document.createElement('button');
  b.type='button';
  b.className='key'+(cls?' '+cls:'');
  b.textContent=txt;
  if(label) b.setAttribute('aria-label',label);
  b.addEventListener('click',fn);
  pad.append(b);
  return b;
}
function digitsPad(pad){
  for(let d=1;d<=9;d++) key(pad,String(d),'',()=>H.press(String(d)));
  key(pad,'⌫','sm',()=>H.back(),t('erase')).id='bsKey';
  key(pad,'0','',()=>H.press('0'));
  key(pad,t('go.check'),'go',()=>H.go()).id='goKey';
}
function choicePad(pad,it,chosen){
  pad.classList.add('choice');
  for(const c of it.choices){
    const b=key(pad,t(it.lk+c),'word',()=>H.choose(c));
    b.setAttribute('aria-pressed',String(chosen===c));
  }
  key(pad,t('go.check'),'go',()=>H.go()).id='goKey';
}

// Перерисовываем только когда панель действительно другая: иначе каждый ввод
// пересоздавал бы кнопки под пальцем.
function renderPad(it,chosen){
  const next=it&&it.choices?'choice:'+it.choices.join(',')+':'+(chosen||''):'digits';
  if(next===sig) return;
  sig=next;
  const pad=$('#pad');
  pad.className='pad';
  pad.replaceChildren();
  if(it&&it.choices) choicePad(pad,it,chosen);
  else digitsPad(pad);
}

export {initPad,invalidatePad,renderPad};

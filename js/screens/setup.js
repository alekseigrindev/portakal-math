// Экран настроек: вкладки режимов, варианты из config.js, пример-образец и статистика.
import {MODES,OPTS,COUNT_OPT} from '../config.js';
import {S,stats,save} from '../state.js';
import {LANGS,t,setLang} from '../i18n/index.js';
import {gen} from '../core/index.js';
import {$} from '../view/dom.js';
import {fitSheet,buildItem} from '../view/item.js';
import {applyStatic} from './shell.js';

function chip(text,pressed,onclick,disabled){
  const b=document.createElement('button');
  b.type='button'; b.className='chip'; b.textContent=text;
  b.setAttribute('aria-pressed',String(!!pressed));
  if(disabled) b.disabled=true;
  b.addEventListener('click',onclick);
  return b;
}
function renderTabs(){
  const host=$('#tabs'); host.replaceChildren();
  for(const [id,label] of MODES){
    const b=document.createElement('button');
    b.type='button'; b.className='tab'; b.textContent=t(label);
    b.setAttribute('role','tab'); b.setAttribute('aria-selected',String(S.mode===id));
    b.addEventListener('click',()=>{S.mode=id;save();renderSetup();});
    host.append(b);
  }
}
function renderOpts(){
  const host=$('#opts'); host.replaceChildren();
  const cfg=S[S.mode];
  for(const o of [...OPTS[S.mode],COUNT_OPT]){
    if(o.show && !o.show(cfg)) continue;
    const g=document.createElement('div'); g.className='group';
    const l=document.createElement('div'); l.className='glabel'; l.textContent=t(o.label);
    const chips=document.createElement('div'); chips.className='chips';
    if(o.multi){
      const sel=cfg[o.key];
      const same=v=>v.length===sel.length&&v.every((x,i)=>x===sel[i]);
      for(const [text,vals] of (o.presets||[['c.all_n',o.list]])){
        chips.append(chip(t(text),same(vals),()=>{cfg[o.key]=vals.slice();save();renderSetup();}));
      }
      for(const v of o.list){
        // o.labels — для списков, где значение не само себе подпись (задания, фигуры)
        chips.append(chip(o.labels?t(o.labels[v]):String(v),sel.includes(v),()=>{
          const has=sel.includes(v);
          if(has && sel.length===1) return;
          // порядок всегда как в o.list: работает и для чисел, и для названий
          cfg[o.key]=o.list.filter(x=>x===v?!has:sel.includes(x));
          save();renderSetup();
        }));
      }
    }else{
      const target=o.key==='count'?S:cfg;
      const disabled=o.needs?!o.needs(cfg):false;
      for(const [val,text] of o.choices){
        chips.append(chip(t(text),target[o.key]===val,()=>{target[o.key]=val;save();renderSetup();},disabled));
      }
    }
    g.append(l,chips);
    if(o.hint && o.needs && !o.needs(cfg)){
      const h=document.createElement('p'); h.className='hint'; h.textContent=t(o.hint); g.append(h);
    }
    if(o.note && o.note(cfg)){
      const h=document.createElement('p'); h.className='hint'; h.textContent=t(o.note(cfg)); g.append(h);
    }
    host.append(g);
  }
}
function renderSample(){
  const host=$('#sample'); host.replaceChildren();
  const it=gen(S.mode,S);
  fitSheet(host,it);
  host.append(buildItem(it,{vals:[],cursor:false}));
}
function renderStat(){
  const s=stats[S.mode];
  $('#stat').textContent=s.done
    ? t('stat',{done:s.done,pct:Math.round(100*s.first/s.done)})
    : t('statEmpty');
}
function renderSetup(){
  renderLangs(); renderTabs(); renderOpts(); renderSample(); renderStat();
  $('#start').textContent=t('start',{n:S.count});
}

function renderLangs(){
  const host=$('#langs'); host.replaceChildren();
  host.setAttribute('aria-label',t('langLabel'));
  for(const [code,short,name] of LANGS){
    const b=document.createElement('button');
    b.type='button'; b.className='lang'; b.textContent=short; b.lang=code; b.title=name;
    b.setAttribute('aria-label',name); b.setAttribute('aria-pressed',String(S.lang===code));
    b.addEventListener('click',()=>{ S.lang=code; save(); setLang(code); applyStatic(); renderSetup(); });
    host.append(b);
  }
}

export {renderSetup};

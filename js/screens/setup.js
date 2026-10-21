// Экран настроек: вкладки режимов, варианты из config.js, пример-образец и статистика.
import {SHOWN,OPTS,COUNT_OPT} from '../config.js';
import {S,stats,save,progress,streakDays} from '../state.js';
import {LANGS,t,setLang} from '../i18n/index.js';
import {gen} from '../core/index.js';
import {$} from '../view/dom.js';
import {fitSheet,buildItem} from '../view/item.js';
import {applyStatic} from './shell.js';
import {syncLangUrl} from './langurl.js';

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
  for(const [id,label] of SHOWN){
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
      const target=o.global?S:cfg;
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
// Что выбрано сейчас — коротко, в заголовке свёрнутых настроек.
// Берём первые три значащих пункта: полный список был бы длиннее самой панели.
function renderOptsNow(){
  const cfg=S[S.mode], parts=[];
  for(const o of [...OPTS[S.mode],COUNT_OPT]){
    if(o.show&&!o.show(cfg)) continue;
    if(o.multi){
      const sel=cfg[o.key]||[];
      parts.push(sel.length===o.list.length?t('c.all_n'):sel.length+'/'+o.list.length);
    }else{
      const target=o.global?S:cfg;
      const hit=o.choices.find(([v])=>v===target[o.key]);
      if(hit) parts.push(t(hit[1]));
    }
    if(parts.length>=3) break;
  }
  $('#optsNow').textContent=parts.join(' · ');
}

function renderToday(){
  const food=$('#food'), streak=$('#streak');

  food.hidden=!progress.food;
  food.textContent=progress.food?'\u{1F408} '+progress.food:'';
  food.setAttribute('aria-label',t('food.total',{n:progress.food}));

  // Один день — это ещё не серия, показываем начиная с двух.
  const days=streakDays();
  streak.hidden=days<2;
  streak.textContent=days<2?'':'\u{1F525} '+days;
  streak.setAttribute('aria-label',t('today.streak',{n:days}));

}
function renderStat(){
  const s=stats[S.mode], el=$('#stat');
  // пока ничего не решали, строки нет вовсе — пустое обещание статистики
  // только занимало место под кнопкой
  el.hidden=!s.done;
  el.textContent=s.done?t('stat',{done:s.done,pct:Math.round(100*s.first/s.done)}):'';
}
function renderSetup(){
  // пояснение показываем, пока ребёнок ещё ни разу не занимался
  $('#intro').hidden=progress.food>0;
  renderLangs(); renderTabs(); renderOpts(); renderSample(); renderStat(); renderToday(); renderOptsNow();
  $('#start').textContent=t('start',{n:S.count});
}

// Языков семь, кнопками они занимали бы две строки — выпадающий список компактнее
// и на телефоне открывается системным выбором.
// В шапке место дорого: видимой подписи нет, название остаётся для чтения с экрана.
// В списке — двухбуквенный код: самоназвание вроде «Українська» не влезало и
// обрезалось. Раз читают коды, по ним и сортируем. Полное имя — в подсказке
// и для чтения с экрана.
function renderLangs(){
  const host=$('#langs'); host.replaceChildren();
  const sel=document.createElement('select');
  sel.className='lang-select';
  sel.id='langSelect';
  sel.setAttribute('aria-label',t('langLabel'));
  sel.title=t('langLabel');
  for(const [code,name] of [...LANGS].sort((a,b)=>a[0].localeCompare(b[0]))){
    const o=document.createElement('option');
    o.value=code; o.textContent=code.toUpperCase(); o.lang=code;
    o.title=name; o.setAttribute('aria-label',name);
    if(S.lang===code) o.selected=true;
    sel.append(o);
  }
  sel.addEventListener('change',()=>{
    S.lang=sel.value; save(); setLang(sel.value); syncLangUrl(sel.value);
    applyStatic(); renderSetup();
    $('#langSelect').focus();   // после перерисовки фокус не должен падать в начало страницы
  });
  host.append(sel);
}

export {renderSetup};

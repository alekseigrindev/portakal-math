// Светлая и тёмная тема.
//
// Пока человек не выбрал сам, S.theme === 'auto' и тема следует системной —
// за это отвечают правила @media в base.css. Явный выбор ставит атрибут
// data-theme на <html>, и он перебивает системную настройку.
// Начальное значение атрибута выставляет крошечный скрипт в <head>:
// иначе при сохранённой тёмной теме страница успевала мигнуть светлой.
import {S,save} from '../state.js';
import {t} from '../i18n/index.js';
import {$} from '../view/dom.js';

const ICONS={
  // показываем значок того режима, в который переключимся
  dark:'M21.2 13.4A9 9 0 1 1 10.6 2.8a7 7 0 0 0 10.6 10.6z',
  light:'M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6M4.8 4.8l1.9 1.9'+
        'M17.3 17.3l1.9 1.9M19.2 4.8l-1.9 1.9M6.7 17.3l-1.9 1.9'
};

const systemDark=()=>matchMedia('(prefers-color-scheme:dark)').matches;
const effectiveTheme=()=>S.theme==='auto'?(systemDark()?'dark':'light'):S.theme;

function renderToggle(){
  const b=$('#themeToggle');
  if(!b) return;
  const next=effectiveTheme()==='dark'?'light':'dark';
  b.setAttribute('aria-label',t(next==='dark'?'theme.toDark':'theme.toLight'));
  b.title=b.getAttribute('aria-label');
  b.replaceChildren();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  if(next==='dark'){
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',ICONS.dark);
    p.setAttribute('fill','currentColor');
    svg.append(p);
  }else{
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx','12'); c.setAttribute('cy','12'); c.setAttribute('r','4.4');
    c.setAttribute('fill','currentColor');
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',ICONS.light);
    p.setAttribute('fill','none');
    p.setAttribute('stroke','currentColor');
    p.setAttribute('stroke-width','2');
    p.setAttribute('stroke-linecap','round');
    svg.append(c,p);
  }
  b.append(svg);
}

function applyTheme(){
  const el=document.documentElement;
  if(S.theme==='auto') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme',S.theme);
  renderToggle();
}

function toggleTheme(){
  S.theme=effectiveTheme()==='dark'?'light':'dark';
  save();
  applyTheme();
}

export {applyTheme,toggleTheme,renderToggle,effectiveTheme};

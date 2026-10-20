// Сборка приложения: панель ввода, горячие клавиши, кнопки экранов и запуск.
import {S, loadSaved} from './state.js';
import {setLang} from './i18n/index.js';
import {makeItems} from './core/index.js';
import {$} from './view/dom.js';
import {show} from './screens/nav.js';
import {initPad} from './screens/pad.js';
import {applyStatic} from './screens/shell.js';
import {renderSetup} from './screens/setup.js';
import {renderCats} from './screens/cats.js';
import {startRound, press, back, go, choose, again, redo, quit} from './screens/round.js';
import {openDialog} from './feedback/dialog.js';
import {flushQueue} from './feedback/send.js';
import {applyTheme,toggleTheme} from './screens/theme.js';

/* ---------- горячие клавиши ---------- */
document.addEventListener('keydown',e=>{
  if($('#play').hidden||e.ctrlKey||e.metaKey||e.altKey) return;
  // С открытым окном обратной связи цифры уходили бы и в текст, и в пример
  if(document.querySelector('dialog[open]')) return;
  const t=e.target;
  if(t&&(t.tagName==='TEXTAREA'||t.tagName==='INPUT'||t.isContentEditable)) return;
  if(/^[0-9]$/.test(e.key)){ press(e.key); e.preventDefault(); }
  else if(e.key==='Backspace'){ back(); e.preventDefault(); }
  else if(e.key==='Enter'){ if(document.activeElement&&document.activeElement.id==='back') return; go(); e.preventDefault(); }
});

/* ---------- кнопки экранов ---------- */
function toSetup(){ quit(); show('setup'); renderSetup(); }
$('#start').addEventListener('click',()=>startRound(makeItems(S.mode,S,S.count),S.mode));
$('#back').addEventListener('click',toSetup);
$('#again').addEventListener('click',again);
$('#redo').addEventListener('click',redo);
$('#toSetup').addEventListener('click',toSetup);
for(const b of document.querySelectorAll('.fb-open')) b.addEventListener('click',openDialog);
$('#themeToggle').addEventListener('click',toggleTheme);
$('#food').addEventListener('click',()=>{ renderCats(); show('cats'); });
$('#catsBack').addEventListener('click',toSetup);

/* ---------- запуск ---------- */
loadSaved();
setLang(S.lang);
applyTheme();
initPad({press,back,go,choose});
applyStatic();          // здесь же собирается панель ввода — уже на нужном языке
renderSetup();
flushQueue();           // отчёты, не ушедшие в прошлый раз

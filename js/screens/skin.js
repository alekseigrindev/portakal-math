// Футбольное оформление.
//
// Работает поверх светлой и тёмной темы, а не вместо них: атрибут data-skin на
// <html> меняет палитру и фон (правила в base.css), а здесь — то, что CSS не
// достать: значок награды и подписи. Подписи подменяет сам t(): у ключа есть
// вариант football:<ключ> — берётся он. Начальное значение атрибута, как и у
// темы, ставит скрипт в <head>, чтобы страница не мигала обычным видом.
import {S,save} from '../state.js';
import {t,setSkin} from '../i18n/index.js';
import {$} from '../view/dom.js';

const football=()=>S.skin==='football';
// корм за решённые примеры в футбольном виде — голы
const foodIcon=()=>football()?'\u26BD':'\u{1F408}';

const BALL='M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z';
const PATCH='M12 7.6l3.3 2.4-1.3 3.9h-4l-1.3-3.9z';
const SEAMS='M12 7.6V3M15.3 10l4.3-1.4M14 13.9l2.7 3.7M10 13.9l-2.7 3.7M8.7 10L4.4 8.6';

function renderSkinToggle(){
  const b=$('#skinToggle');
  if(!b) return;
  const v=t(football()?'skin.toBase':'skin.toFootball');
  b.setAttribute('aria-label',v);
  b.title=v;
  b.setAttribute('aria-pressed',String(football()));
}

function applySkin(){
  const el=document.documentElement;
  if(football()) el.dataset.skin='football';
  else delete el.dataset.skin;
  setSkin(football()?'football':'');
  renderSkinToggle();
}

function toggleSkin(){
  S.skin=football()?'base':'football';
  save();
  applySkin();
}

export {applySkin,toggleSkin,renderSkinToggle,foodIcon,football,BALL,PATCH,SEAMS};

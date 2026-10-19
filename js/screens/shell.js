// Перевод статичной разметки при смене языка.
import {S} from '../state.js';
import {t} from '../i18n/index.js';
import {$} from '../view/dom.js';
import {updateGoLabel} from './round.js';
import {invalidatePad,renderPad} from './pad.js';
import {renderFooter} from './footer.js';
import {renderToggle} from './theme.js';

function applyStatic(){
  // панель пересобирается целиком: её подписи тоже переводятся
  invalidatePad(); renderPad(null);
  document.documentElement.lang=S.lang;
  document.title=t('title');
  const desc=document.querySelector('meta[name="description"]');
  if(desc) desc.content=t('lead');   // с экрана убрали, для ссылок и поиска оставили
  for(const el of document.querySelectorAll('[data-i18n]')) el.textContent=t(el.dataset.i18n);
  const bs=$('#bsKey'); if(bs) bs.setAttribute('aria-label',t('erase'));
  renderFooter();
  renderToggle();
  updateGoLabel();
}

export {applyStatic};

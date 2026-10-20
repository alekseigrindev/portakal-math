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
  // То же, что в <title> языковых страниц: иначе краулер и человек видели бы
  // у одной страницы разные заголовки.
  document.title='portakal-math — '+t('title');
  const desc=document.querySelector('meta[name="description"]');
  if(desc) desc.content=t('lead');   // с экрана убрали, для ссылок и поиска оставили
  for(const el of document.querySelectorAll('[data-i18n]')) el.textContent=t(el.dataset.i18n);
  // для элементов, у которых подпись прячется на узком экране: смысл остаётся
  // в aria-label и во всплывающей подсказке
  for(const el of document.querySelectorAll('[data-i18n-label]')){
    const v=t(el.dataset.i18nLabel);
    el.setAttribute('aria-label',v);
    el.title=v;
  }
  const bs=$('#bsKey'); if(bs) bs.setAttribute('aria-label',t('erase'));
  renderFooter();
  renderToggle();
  updateGoLabel();
}

export {applyStatic};

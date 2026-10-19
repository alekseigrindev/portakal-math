// Римская запись и рамка под ответ: XIV = □
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {t} from '../i18n/index.js';

function buildRoman(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const wrap=document.createElement('div');
  wrap.className='eq'+(state?' '+state:'');
  for(const ch of it.roman) wrap.append(cell(ch));
  wrap.append(cell('=','sign'));
  wrap.append(blankBox(it.n,reveal?String(it.n):typed,{cursor:cursor&&!reveal}));
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',[...it.roman].join(' ')+' '+t('say.eq')+' '+t('say.blank'));
  return wrap;
}

export {buildRoman};

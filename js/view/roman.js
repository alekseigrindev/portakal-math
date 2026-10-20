// Римская запись и рамка под ответ: XIV = □
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {t} from '../i18n/index.js';

function buildRoman(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const wrap=document.createElement('div');
  wrap.className='eq'+(state?' '+state:'');
  for(const ch of it.roman) wrap.append(cell(ch,'rn'));
  wrap.append(cell('=','sign'));
  wrap.append(blankBox(it.n,reveal?String(it.n):typed,{cursor:cursor&&!reveal}));
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',[...it.roman].join(' ')+' '+t('say.eq')+' '+t('say.blank'));
  return wrap;
}

// Картинка подсказки: таблица «буква — цена» и два разбора.
// Разборы намеренно на одних и тех же буквах в разном порядке: VI — это 6,
// IV — это 4. Правило вычитания так видно целиком, без второго примера.
const KEYS=[[1,'I'],[5,'V'],[10,'X'],[50,'L'],[100,'C']];

// line: [['V',''],['I',''],['=','sign'],…] — вторым полем класс клетки
function romanLine(parts){
  const row=document.createElement('div');
  row.className='eq rline';
  for(const [ch,cls] of parts) row.append(cell(ch,cls));
  return row;
}

function buildRomanHint(cfg={}){
  const limit=cfg.limit||100;
  const wrap=document.createElement('div');
  wrap.className='rhint';

  // Буквы крупнее нужных только путают: до 12 и до 20 хватает I, V и X.
  const keys=document.createElement('div');
  keys.className='rkeys';
  for(const [v,sym] of KEYS){
    if(v>limit) continue;
    const k=document.createElement('div');
    k.className='rkey';
    const a=document.createElement('span'); a.className='rsym'; a.textContent=sym;
    const b=document.createElement('span'); b.className='rval'; b.textContent=String(v);
    k.append(a,b);
    keys.append(k);
  }
  wrap.append(keys);

  wrap.append(romanLine([['V','rn'],['I','rn'],['=','sign'],['5',''],['+','sign'],['1',''],['=','sign'],['6','']]));
  // вычитаемая буква красная — глаз находит её раньше, чем читается подпись
  wrap.append(romanLine([['I','rn rsub'],['V','rn'],['=','sign'],['5',''],['−','sign'],['1','rsub'],['=','sign'],['4','']]));
  return wrap;
}

export {buildRoman,buildRomanHint};

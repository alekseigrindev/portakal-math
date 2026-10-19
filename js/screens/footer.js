// Подвал: копирайт и контакты.
import {t} from '../i18n/index.js';
import {$} from '../view/dom.js';

const OWNER='AlekseiGrinDev';

// Telegram адресуется по нику. WhatsApp с 2026 года тоже понимает имена
// пользователей: wa.me/<имя> уходит на api.whatsapp.com с type=username,
// wa.me/<цифры> — с type=phone_number. Имена только строчными.
// Сюда можно вписать имя пользователя, номер в международном формате
// или готовую ссылку целиком. Пусто — ссылка не выводится.
const WHATSAPP='alekseigrindev';

const LINKEDIN='https://www.linkedin.com/in/alekseigrindev';

// wa.me по виду строки сам решает, имя это или номер, поэтому разбирать не нужно
const waLink=v=>!v?'':/^https?:/i.test(v)?v:'https://wa.me/'+v;

const LINKS=[
  {name:'Telegram', href:'https://t.me/'+OWNER, icon:
    'M9.04 15.47 8.9 19.4c.4 0 .58-.17.79-.37l1.9-1.81 3.93 2.88c.72.4 1.24.19 1.43-.67'+
    'l2.6-12.17c.26-1.1-.4-1.53-1.1-1.27L2.9 10.9c-1.07.42-1.05 1.02-.18 1.29l4.2 1.31'+
    ' 9.76-6.15c.46-.3.88-.14.53.17z'},
  {name:'WhatsApp', href:waLink(WHATSAPP), icon:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5.05-1.32A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14'+
    'l-.3-.18-3.1.81.83-3.02-.2-.31A8.2 8.2 0 1 1 12 20.2zm4.7-5.47c-.26-.13-1.52-.75-1.76-.84'+
    '-.23-.08-.4-.13-.58.13-.17.26-.66.84-.81 1.01-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.07-1.28'+
    '-.77-.68-1.28-1.52-1.43-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43'+
    '.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.91-.21-.5-.42-.44-.58-.44h-.5c-.17 0-.45.06-.69.32'+
    '-.23.26-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.82 2.78 4.41 3.9.62.26 1.1.42 1.47.54'+
    '.62.2 1.18.17 1.63.1.5-.07 1.52-.62 1.73-1.22.21-.6.21-1.11.15-1.22-.06-.11-.23-.17-.5-.3z'},
  {name:'LinkedIn', href:LINKEDIN, icon:
    'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34v-7.9'+
    'H5.72v7.9h2.62zM7.03 9.36a1.52 1.52 0 1 0 0-3.05 1.52 1.52 0 0 0 0 3.05zM18.3 18.34v-4.33'+
    'c0-2.34-1.25-3.43-2.92-3.43-1.35 0-1.95.74-2.29 1.26v-1.4h-2.62c.03.74 0 7.9 0 7.9h2.62'+
    'v-4.41c0-.24.02-.47.09-.64.19-.47.62-.96 1.34-.96.95 0 1.33.72 1.33 1.78v4.23h2.62z'}
];

function renderFooter(){
  $('#copy').textContent='© '+new Date().getFullYear()+' '+OWNER;
  const host=$('#contacts');
  host.replaceChildren();
  host.setAttribute('aria-label',t('foot.contact'));
  for(const l of LINKS){
    if(!l.href) continue;            // контакт без адреса не показываем
    const a=document.createElement('a');
    a.href=l.href;
    a.target='_blank';
    a.rel='noopener noreferrer';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',l.icon);
    svg.append(path);
    const label=document.createElement('span');
    label.textContent=l.name;
    a.append(svg,label);
    host.append(a);
  }
}

export {renderFooter,OWNER,WHATSAPP,LINKEDIN};

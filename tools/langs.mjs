// Собирает языковые страницы /<код>/index.html из index.html.
//
// Зачем они нужны. Превью ссылки в мессенджере рисует краулер, а он не
// исполняет js: он скачивает html и читает <title> и og:*. Переключатель языка
// на странице до него не доходит, поэтому язык превью может задать только
// адрес. Отправляя ссылку турку, отправляем /tr/ — и превью приходит турецкое.
//
// Запускать после правки <head> в index.html:  node tools/langs.mjs
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {I18N,CODES} from '../js/i18n/index.js';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');

// Адрес сайта без слеша на конце. Пусто — ссылки в hreflang и og:image
// остаются относительными: так они работают на любом хосте и в подкаталоге,
// но og:image с относительным адресом понимают не все краулеры (Telegram
// понимает, Facebook требует полный). Появится домен — впишите его сюда и
// перезапустите сборку.
const SITE='';

const BRAND='portakal-math';
const LOCALE={en:'en_US',ka:'ka_GE',kk:'kk_KZ',pt:'pt_BR',ru:'ru_RU',tr:'tr_TR',uk:'uk_UA'};

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Адреса в og:* и hreflang краулер разрешает от адреса страницы, а <base> он
// не обязан учитывать. Языковая страница лежит на уровень глубже корня, поэтому
// здесь явный ../ — он же верен и в подкаталоге GitHub Pages, где адрес от
// корня домена увёл бы на чужой сайт.
const href=path=>{
  const rel=path==='./'?'':path;
  return SITE?SITE+'/'+rel:'../'+rel;
};

function shareBlock(code,title,desc){
  const alt=['x-default',...CODES]
    .map(c=>`<link rel="alternate" hreflang="${c}" href="${esc(href(c==='x-default'?'./':c+'/'))}">`);
  return ['<!-- share:start -->',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:locale" content="${LOCALE[code]}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    // Своя картинка на каждый язык: в превью должно быть написано то же, что
    // увидит человек, открыв ссылку. Рисует их tools/og.html.
    `<meta property="og:image" content="${esc(href('og/og-'+code+'.png'))}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(title)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    ...alt,
    '<!-- share:end -->'].join('\n');
}

// Одна замена — одна проверка: молча не сработавший replace даёт страницу,
// которая выглядит целой, но раздаёт краулеру чужой язык. Проверяем, что
// образец нашёлся, а не что строка изменилась: у русского подстановка
// совпадает с тем, что уже в index.html, и «ничего не изменилось» — норма.
function swap(s,from,to,what){
  const found=typeof from==='string'?s.includes(from):from.test(s);
  if(!found) throw new Error('не нашлось в index.html: '+what);
  return s.replace(from,to);
}

const src=await readFile(join(ROOT,'index.html'),'utf8');
for(const code of CODES){
  const d=I18N[code];
  const title=`${BRAND} — ${d.title}`;
  let out=src;
  out=swap(out,'<html lang="ru">',`<html lang="${code}" data-lang="${code}">`,'lang');
  // Страница лежит на уровень глубже корня, <base> уводит все относительные
  // ссылки наверх — иначе пришлось бы править каждую по отдельности.
  out=swap(out,'<meta charset="utf-8">','<meta charset="utf-8">\n<base href="../">','base');
  out=swap(out,/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`,'title');
  out=swap(out,/<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${esc(d.lead)}">`,'description');
  out=swap(out,/<!-- share:start -->[\s\S]*?<!-- share:end -->/,
    shareBlock(code,title,d.lead),'share');
  await mkdir(join(ROOT,code),{recursive:true});
  await writeFile(join(ROOT,code,'index.html'),out);
  console.log(code+'/index.html');
}
console.log('страниц:',CODES.length);

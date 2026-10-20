// Язык в адресе страницы.
//
// Превью ссылки в мессенджере собирает краулер, а он не исполняет js: что
// написано в скачанном html, то и покажет. Поэтому язык превью задаётся
// адресом — /tr/ раздаёт турецкие <title> и og:*, собранные tools/langs.mjs.
// Отсюда два правила: адрес сильнее сохранённого выбора, а смена языка на
// странице переписывает адрес, чтобы его можно было скопировать и отправить.
import {CODES} from '../i18n/index.js';

// Язык, заданный адресом: data-lang проставляет сборщик языковых страниц.
function pageLang(){
  const c=document.documentElement.dataset.lang;
  return CODES.includes(c)?c:null;
}

// Каталог сайта: от текущего пути, а не от корня домена. Иначе на GitHub Pages,
// где проект живёт в подкаталоге, ссылки уехали бы на чужой адрес.
//
// Считается один раз при загрузке модуля и больше не пересчитывается: дальше
// адрес переписывает syncLangUrl, и с корня, где data-lang нет, второй расчёт
// принял бы уже подставленный /ka/ за каталог сайта и выдал бы /ka/tr/.
const BASE=(()=>{
  const dir=location.pathname.replace(/[^/]*$/,'');
  return pageLang()?dir.replace(/[^/]+\/$/,''):dir;
})();

const langHref=code=>BASE+code+'/';

// Переход на языковую версию по-настоящему, с перезагрузкой. Нужен только на
// корне: там в адресе языка нет, а значит и <html lang>, и заголовок, и
// превью — от шаблона, а не от человека. replace, а не assign: голый корень не
// должен оставаться в истории, иначе «назад» возвращает на него, он снова
// перебрасывает, и кнопка «назад» перестаёт работать.
function goToLang(code){
  if(!CODES.includes(code)) return;
  location.replace(langHref(code)+location.search+location.hash);
}

// Адрес меняем без перезагрузки: раунд и набранный ответ смену языка переживают.
function syncLangUrl(code){
  if(!CODES.includes(code)) return;
  try{ history.replaceState(history.state,'',langHref(code)+location.search+location.hash); }
  catch(e){}                       // file:// и прочие адреса, где история запрещена
}

export {pageLang,langHref,goToLang,syncLangUrl};

// Приём отчётов об ошибках: создаёт задачу в GitHub.
//
// Это обычная serverless-функция Vercel — папку api/ она подхватывает и у
// статического проекта, Next.js для неё не нужен. Если проект всё же переедет
// на Next.js, тело handler переносится в app/api/feedback/route.js
// как `export async function POST(req)` почти без правок.
//
// Расширение .mjs, а не .js, намеренно: без package.json файл .js на Node 18 и 20
// считается CommonJS, и `export default` там не разберётся. Путь остаётся
// /api/feedback — расширение в адресе не участвует.
//
// Переменные окружения:
//   GITHUB_TOKEN  — токен с правом issues:write и contents:write (обязательно)
//   GITHUB_REPO   — "владелец/репозиторий"; можно не задавать, если проект
//                   связан с GitHub: тогда берём из системных VERCEL_GIT_*
//   MEDIA_BRANCH  — ветка для картинок (по умолчанию feedback-media)

const API='https://api.github.com';
const MAX_BODY=2*1024*1024;
const MAX_PNG=400*1024;

const gh=(token)=>async (path,init={})=>{
  const r=await fetch(API+path,{
    ...init,
    headers:{
      authorization:'Bearer '+token,
      accept:'application/vnd.github+json',
      'content-type':'application/json',
      'user-agent':'portakal-math-feedback',
      ...(init.headers||{})
    }
  });
  const text=await r.text();
  if(!r.ok) throw new Error(`GitHub ${path} → ${r.status}: ${text.slice(0,300)}`);
  return text?JSON.parse(text):{};
};

// Отчёт присылает кто угодно, поэтому доверяем только форме, а не содержимому.
function clean(report){
  const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  const json=v=>{
    try{ return JSON.stringify(v).length<120*1024?v:'(слишком большое)'; }
    catch(e){ return '(не сериализуется)'; }
  };
  return {
    version:str(report.version,40),
    at:str(report.at,40),
    screen:str(report.screen,20),
    lang:str(report.lang,5),
    mode:str(report.mode,20),
    text:str(report.text,2000),
    kind:report.kind==='idea'?'idea':'problem',
    cfg:json(report.cfg),
    round:json(report.round),
    log:json(report.log),
    stats:json(report.stats),
    env:json(report.env),
    markup:report.markup&&{
      html:str(report.markup.html,60*1024),
      vars:json(report.markup.vars),
      width:Number(report.markup.width)||0,
      height:Number(report.markup.height)||0
    }
  };
}

const block=(title,value)=>
  `<details><summary>${title}</summary>\n\n\`\`\`json\n${JSON.stringify(value,null,1)}\n\`\`\`\n\n</details>`;

function issueBody(r,imageUrl,commit){
  const item=r.round&&r.round.item;
  const lines=[];
  if(r.text) lines.push(r.text.replace(/^/gm,'> '),'');
  if(imageUrl) lines.push(`![экран](${imageUrl})`,'');
  lines.push(
    `**Раздел:** \`${r.mode}\` · **экран:** \`${r.screen}\` · **язык:** \`${r.lang}\` · **версия:** \`${r.version}\``+
      (commit?` · **коммит:** ${commit}`:''),
    '');
  if(item) lines.push(block('Пример, на котором возникла ошибка',item));
  if(r.round) lines.push(block('Состояние раунда',r.round));
  lines.push(block('Настройки',r.cfg));
  lines.push(block('Последние шаги',r.log));
  lines.push(block('Окружение',r.env));
  if(r.markup) lines.push(
    `<details><summary>Снимок разметки (открывается в tools/replay.html)</summary>\n\n`+
    `\`\`\`json\n${JSON.stringify(r.markup)}\n\`\`\`\n\n</details>`);
  return lines.join('\n');
}

// Картинку кладём отдельной веткой: в истории кода ей не место,
// а raw-ссылка на неё в задаче показывается как обычное изображение.
async function uploadImage(api,repo,branch,id,dataUrl){
  const m=/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl||'');
  if(!m) return null;
  const content=m[1];
  if(content.length*0.75>MAX_PNG) return null;

  const repoInfo=await api(`/repos/${repo}`);
  try{
    await api(`/repos/${repo}/git/ref/heads/${branch}`);
  }catch(e){
    const base=await api(`/repos/${repo}/git/ref/heads/${repoInfo.default_branch}`);
    await api(`/repos/${repo}/git/refs`,{method:'POST',
      body:JSON.stringify({ref:`refs/heads/${branch}`,sha:base.object.sha})});
  }
  const path=`media/${id}.png`;
  await api(`/repos/${repo}/contents/${path}`,{method:'PUT',
    body:JSON.stringify({message:`feedback ${id}`,content,branch})});
  return `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}

// Связь проекта с GitHub даёт системные переменные Vercel — имя репозитория
// из них и берём, чтобы не задавать его руками вторым местом.
function targetRepo(){
  if(process.env.GITHUB_REPO) return process.env.GITHUB_REPO;
  const {VERCEL_GIT_REPO_OWNER:owner,VERCEL_GIT_REPO_SLUG:slug}=process.env;
  return owner&&slug?`${owner}/${slug}`:null;
}

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('allow','POST');
    return res.status(405).json({error:'только POST'});
  }
  const {GITHUB_TOKEN,MEDIA_BRANCH='feedback-media'}=process.env;
  const repo=targetRepo();
  if(!GITHUB_TOKEN||!repo) return res.status(500).json({error:'сервис не настроен'});

  let body=req.body;
  if(typeof body==='string'){
    if(body.length>MAX_BODY) return res.status(413).json({error:'слишком большой отчёт'});
    try{ body=JSON.parse(body); }catch(e){ return res.status(400).json({error:'не JSON'}); }
  }
  if(!body||typeof body!=='object') return res.status(400).json({error:'пустой отчёт'});

  const r=clean(body);
  const api=gh(GITHUB_TOKEN);
  const id=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  // сборки у проекта нет, поэтому версию кода берём из коммита, который задеплоен
  const commit=(process.env.VERCEL_GIT_COMMIT_SHA||'').slice(0,7);

  try{
    let imageUrl=null;
    if(body.png){
      try{ imageUrl=await uploadImage(api,repo,MEDIA_BRANCH,id,body.png); }
      catch(e){ imageUrl=null; }   // без картинки задачу всё равно создаём
    }
    const first=(r.text||'').split('\n')[0].slice(0,60);
    const issue=await api(`/repos/${repo}/issues`,{method:'POST',
      body:JSON.stringify({
        title:`[${r.kind==='idea'?'идея':'ошибка'}] ${r.mode}${first?': '+first:''}`,
        body:issueBody(r,imageUrl,commit),
        labels:['feedback',r.kind,`mode:${r.mode}`]
      })});
    return res.status(200).json({ok:true,url:issue.html_url});
  }catch(e){
    return res.status(502).json({error:'не удалось создать задачу'});
  }
}

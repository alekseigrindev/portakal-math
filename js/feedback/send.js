// Отправка отчёта. Единственное место, знающее про внешний сервис:
// смена транспорта — правка этого файла, остальной код её не замечает.
const ENDPOINT='/api/feedback';
const QKEY='schetnik-feedback-queue';
const MAX_PNG=400*1024;       // больше в задачу GitHub класть незачем
const MAX_QUEUE=2;

const blobToDataUrl=blob=>new Promise(res=>{
  const fr=new FileReader();
  fr.onload=()=>res(fr.result);
  fr.onerror=()=>res(null);
  fr.readAsDataURL(blob);
});

function readQueue(){
  try{ return JSON.parse(localStorage.getItem(QKEY)||'[]'); }catch(e){ return []; }
}
function writeQueue(list){
  try{ localStorage.setItem(QKEY,JSON.stringify(list)); }catch(e){}
}
function enqueue(payload){
  // в очередь кладём без картинки: место в localStorage дороже, чем PNG
  const {png,...light}=payload;
  const list=readQueue();
  list.push(light);
  writeQueue(list.slice(-MAX_QUEUE));
}

async function post(payload){
  const r=await fetch(ENDPOINT,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(payload)
  });
  if(!r.ok) throw new Error('HTTP '+r.status);
  return await r.json().catch(()=>({}));
}

async function send(report,pngBlob){
  const payload={...report};
  if(pngBlob&&pngBlob.size<=MAX_PNG) payload.png=await blobToDataUrl(pngBlob);
  try{
    return await post(payload);
  }catch(e){
    enqueue(payload);
    throw e;
  }
}

// Отложенные отчёты уходят при следующем запуске: связи могло не быть.
async function flushQueue(){
  const list=readQueue();
  if(!list.length) return;
  const left=[];
  for(const item of list){
    try{ await post(item); }catch(e){ left.push(item); }
  }
  writeQueue(left);
}

export {send,flushQueue,readQueue};

// Сидящий кот. Все восемь котов — одна фигура с разной окраской и отметинами:
// рисовать восемь отдельных силуэтов незачем, узнаваемость даёт поза.
import {mk} from './svg.js';

// Футболки для футбольного оформления: у каждого кота своя команда, номер —
// его место в коллекции. На жёлтой белый номер не читается, поэтому цвет
// номера задан к каждой футболке.
const KITS=[
  ['#d62828','#fff'],['#1d4ed8','#fff'],['#f6c90e','#1b1b1b'],['#15803d','#fff'],
  ['#7c3aed','#fff'],['#111827','#fff'],['#ea580c','#fff'],['#0e7490','#fff']
];

// kit — номер на футболке (1…8); 0 — без футболки. Запертому коту она не
// положена: силуэт должен оставаться силуэтом.
function buildCat(cat,opt={}){
  const {locked=false,kit=0}=opt;
  const svg=mk('svg',{viewBox:'0 0 64 64','aria-hidden':'true'});
  const fur=locked?'var(--grid)':cat.fur;
  const belly=locked?'var(--grid)':cat.belly;
  const g=mk('g',{},svg);

  // Хвост рисуем первым и толстой линией: тонкий завиток сбоку читался
  // как отдельная закорючка, а не как часть кота.
  mk('path',{d:'M44 56c9-2 14-9 12-16-1-5-7-6-9-1-1 4 2 6 4 3',
    fill:'none',stroke:fur,'stroke-width':5,'stroke-linecap':'round'},g);

  mk('path',{d:'M32 28c-10 0-16 12-17 24 0 3 4 5 17 5s17-2 17-5c-1-12-7-24-17-24z',fill:fur},g);
  if(!locked) mk('path',{d:'M32 38c-5 0-8 8-8 15 0 2 2 3 8 3s8-1 8-3c0-7-3-15-8-15z',fill:belly},g);
  if(!locked&&kit){
    const [shirt,num]=KITS[(kit-1)%KITS.length];
    // Футболка до головы: ворот закрывает голова, рукава торчат по бокам.
    mk('path',{d:'M24 35l-7 4.5 2.6 5.5 3.6-1.8V54h17.6V43.2l3.6 1.8 2.6-5.5-7-4.5z',fill:shirt},g);
    const n=mk('text',{x:32,y:51,'text-anchor':'middle','font-size':9,'font-weight':800,
      'font-family':'Nunito,system-ui,sans-serif',fill:num},g);
    n.textContent=String(kit);
  }

  // Уши крупные и вынесены за край головы, иначе на 70 пикселях сливаются с ней
  mk('path',{d:'M17 7l3 19 14-9zM47 7l-3 19-14-9z',fill:fur},g);
  if(!locked) mk('path',{d:'M21 13l1.6 10 7.4-5zM43 13l-1.6 10-7.4-5z',fill:belly,opacity:'.65'},g);

  mk('ellipse',{cx:32,cy:24,rx:15,ry:13,fill:fur},g);

  if(!locked){
    if(cat.pattern==='stripes'){
      const st={fill:'none',stroke:'rgba(0,0,0,.22)','stroke-width':2.4,'stroke-linecap':'round'};
      mk('path',{...st,d:'M25 13.5l2 4M32 12v4.4M39 13.5l-2 4'},g);
      mk('path',{...st,d:'M19 44h6M45 44h-6'},g);
    }
    if(cat.pattern==='tuxedo') mk('path',{d:'M32 30c5 0 9 4 10 9-6 4-14 4-20 0 1-5 5-9 10-9z',fill:belly},g);
    if(cat.pattern==='patch') mk('path',{d:'M19 20a9 9 0 0 1 9-9c-1 6-4 8-9 11z',fill:'rgba(0,0,0,.2)'},g);
    if(cat.pattern==='siam'){
      mk('ellipse',{cx:32,cy:30,rx:8,ry:6,fill:'rgba(0,0,0,.22)'},g);
      mk('path',{d:'M17 7l3 19 14-9zM47 7l-3 19-14-9z',fill:'rgba(0,0,0,.22)'},g);
    }
    mk('ellipse',{cx:25.5,cy:23,rx:2.6,ry:3.2,fill:cat.eye},g);
    mk('ellipse',{cx:38.5,cy:23,rx:2.6,ry:3.2,fill:cat.eye},g);
    mk('path',{d:'M32 28.5l-2.2 2h4.4z',fill:'rgba(0,0,0,.5)'},g);
    const wh={fill:'none',stroke:'rgba(0,0,0,.28)','stroke-width':1.4,'stroke-linecap':'round'};
    mk('path',{...wh,d:'M29 31.5l-11-2M29 33l-10 3M35 31.5l11-2M35 33l10 3'},g);
  }
  return svg;
}

export {buildCat};

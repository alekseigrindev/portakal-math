// Коллекция котов. Коты даются за общий корм, а не за отдельные разделы:
// привязка к разделам толкала бы ребёнка туда, где кот ещё не получен,
// вместо того, что ему надо тренировать.
//
// Пороги подобраны под дневную цель в 10 примеров: первый кот приходит
// за один раунд, восьмой примерно за полтора месяца при одном раунде в день.
const CATS=[
  {at:10,  fur:'#e08a3c', belly:'#f6d7b0', eye:'#2e7d4f', pattern:'stripes'},
  {at:25,  fur:'#8c9199', belly:'#e3e6ea', eye:'#3f7fbf', pattern:'none'},
  {at:50,  fur:'#f3f0ea', belly:'#ffffff', eye:'#4a90c2', pattern:'none'},
  {at:90,  fur:'#3a3f46', belly:'#5a606a', eye:'#d6b84a', pattern:'none'},
  {at:140, fur:'#a9793f', belly:'#e8cfa6', eye:'#6ca84a', pattern:'stripes'},
  {at:210, fur:'#2f3238', belly:'#f3f0ea', eye:'#d9a441', pattern:'tuxedo'},
  {at:300, fur:'#d9955c', belly:'#f7e3c8', eye:'#59a06b', pattern:'patch'},
  {at:420, fur:'#d8cfc0', belly:'#f6f1e7', eye:'#4f8fd0', pattern:'siam'}
];

const earnedCount=food=>CATS.filter(c=>food>=c.at).length;

// Следующий кот и сколько до него осталось; null, когда собраны все.
function nextCat(food){
  const i=earnedCount(food);
  if(i>=CATS.length) return null;
  return {index:i, cat:CATS[i], left:CATS[i].at-food};
}

export {CATS,earnedCount,nextCat};

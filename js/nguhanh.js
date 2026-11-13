'use strict';
// ───────────────────────── Ngũ hành tương sinh: chiêu khác hành phối hợp trên yêu quái
// Trúng chiêu hành A → yêu quái mang "ấn" A trong 2.5 giây. Trúng tiếp chiêu hành B mà A sinh B → bùng phản ứng.
const SINH={moc:'hoa',hoa:'tho',tho:'kim',kim:'thuy',thuy:'moc'};
const NH={
  moc:{k:'lietdiem',n:'Liệt Diễm',a:'moc',b:'hoa',d:'Mộc sinh Hỏa: yêu quái bốc cháy, lửa lan theo dây leo.',c:'#ff7a1f'},
  hoa:{k:'dungnham',n:'Dung Nham',a:'hoa',b:'tho',d:'Hỏa sinh Thổ: đất chảy thành dung nham, đốt và làm chậm.',c:'#ff5a1f'},
  tho:{k:'kimthach',n:'Kim Thạch',a:'tho',b:'kim',d:'Thổ sinh Kim: đá vỡ, bắn ra sáu mảnh kim quang.',c:'#ffd45a'},
  kim:{k:'loithuy',n:'Lôi Thủy',a:'kim',b:'thuy',d:'Kim sinh Thủy: sét dẫn qua nước, lan sang yêu quái gần đó.',c:'#9fe8ff'},
  thuy:{k:'sinhco',n:'Sinh Cơ',a:'thuy',b:'moc',d:'Thủy sinh Mộc: cây cỏ trỗi dậy, trói yêu quái và hồi máu cho bạn.',c:'#7bff9a'},
};
const NH_ORDER=['moc','hoa','tho','kim','thuy'];
const MARK_T=2.5;
let nhBudget=0;
function nhHit(e,el){
  if(!EL[el])return;
  if(e.mk&&e.mk.t>0&&SINH[e.mk.el]===el&&(e.rxT||0)<=0&&nhBudget>0){const a=e.mk.el;e.mk=null;e.rxT=0.8;nhBudget--;nhReact(e,a);return}
  if(!e.mk||e.mk.el!==el||e.mk.t<1.5)e.mk={el,t:MARK_T};
}
function nhTick(dt){nhBudget=Math.min(14,nhBudget+dt*14);for(const e of G.e){if(e.mk){e.mk.t-=dt;if(e.mk.t<=0)e.mk=null}if(e.rxT>0)e.rxT-=dt}}
function nhDmg(){return 12+G.realm*6}
function nhReact(e,a){
  const R=NH[a],x=e.x,y=e.y-e.r*0.5,o=G.src,base=nhDmg();G.src='tuongsinh';
  G.rx=G.rx||{};G.rx[R.k]=(G.rx[R.k]||0)+1;
  SAVE.combos=SAVE.combos||{};if(!SAVE.combos[R.k]){SAVE.combos[R.k]=1;saveSave();announce(i18nf('tb.tuongsinh','Tương sinh · {0}!',R.n),'realm');if(typeof buzz==='function')buzz([20,30,20])}
  G.fx.push({k:'nhrx',x,y,el:a,t:0,dur:0.6});
  if(a==='moc'){ // Liệt Diễm
    forNear(x,y,40,t=>{if(Math.hypot(t.x-x,t.y-y)<34+t.r)hurtE(t,base*1.2,'hoa',{rx:1,kb:20,kx:x,ky:y})});
    G.zones.push({k:'burn',x,y,r:30,t:0,dur:3,dps:base*0.9,el:'hoa',tick:0,src:'tuongsinh'});
    for(const z of G.zones)if(z.k==='vine'&&!z.lit&&Math.hypot(z.x-x,z.y-y)<z.r+90){z.lit=1;G.later.push({t:0.15+rand()*0.2,f:()=>{G.src='tuongsinh';G.zones.push({k:'burn',x:z.x,y:z.y,r:z.r*0.9,t:0,dur:2.5,dps:base*0.8,el:'hoa',tick:0,src:'tuongsinh'});G.fx.push({k:'boom',x:z.x,y:z.y,r:z.r*0.6,t:0,dur:0.35})}})}
    if(rand()<0.5)sfx('fire')}
  else if(a==='hoa'){ // Dung Nham
    G.zones.push({k:'lava',x:e.x,y:e.y,r:26,t:0,dur:3.5,dps:base*1.1,el:'tho',tick:0,src:'tuongsinh'});
    forNear(x,y,34,t=>{if(Math.hypot(t.x-x,t.y-y)<28+t.r)hurtE(t,base*0.8,'tho',{rx:1})});if(rand()<0.5)sfx('boom')}
  else if(a==='tho'){ // Kim Thạch
    const o0=rand()*TAU;for(let i=0;i<6;i++){const an=o0+i/6*TAU;G.pr.push({k:'sword',x,y,vx:Math.cos(an)*230,vy:Math.sin(an)*230,dmg:base*0.75,el:'kim',pierce:2,life:0.45,r:4,hit:[e],gold:1,rx:1,src:'tuongsinh'})}
    hurtE(e,base*0.6,'kim',{rx:1});if(rand()<0.5)sfx('sword')}
  else if(a==='kim'){ // Lôi Thủy
    const pts=[[x,y]],hit=new Set([e]);let cur=e;hurtE(e,base,'thuy',{rx:1});
    for(let i=0;i<6;i++){let best=null,bd=75;forNear(cur.x,cur.y,80,t=>{if(hit.has(t)||t.dead)return;const d=Math.hypot(t.x-cur.x,t.y-cur.y);const wet=(t.mk&&t.mk.el==='thuy')||t.slowT>0;if(d<(wet?80:50)&&d<bd){bd=d;best=t}});if(!best)break;hit.add(best);pts.push([best.x,best.y-best.r*0.5]);hurtE(best,base*0.8,'thuy',{rx:1});best.slowT=Math.max(best.slowT,1);cur=best}
    if(pts.length>1)G.fx.push({k:'bolt',pts,t:0,dur:0.25});if(rand()<0.5)sfx('zap')}
  else if(a==='thuy'){ // Sinh Cơ
    G.zones.push({k:'vine',x:e.x,y:e.y,r:24,t:0,dur:1.6,dps:base*0.6,el:'moc',tick:0,seed:rand()*1000,leech:1,src:'tuongsinh'});
    const P=G.p,h=1+G.realm*0.4;P.hp=Math.min(P.mhp,P.hp+h);if(G.nums.length<70)G.nums.push({x:P.x,y:P.y-30,v:'+'+h.toFixed(1),t:0,c:'#6dff8a'});
    if(typeof vp==='function')for(let i=0;i<8;i++)vp(x+(rand()-.5)*10,y,{vx:(P.x-x)*2+(rand()-.5)*30,vy:(P.y-12-y)*2+(rand()-.5)*30,life:0.5,s:1.8,c:'#7bff9a',drag:0})}
  G.src=o;
}
// gợi ý trên thẻ công pháp
function nhHint(k){
  const el=WEAP[k].el,L=[];const owned=new Set(Object.keys(G.w).map(w=>WEAP[w].el));
  for(const a of NH_ORDER){const R=NH[a];let other=null;if(R.a===el)other=R.b;else if(R.b===el)other=R.a;else continue;
    const ok=owned.has(other)&&other!==el;L.push(`<span class="nh${ok?' ok':''}" style="--c:${R.c}">${EL[R.a].n}→${EL[R.b].n} ${R.n}${ok?' ✓':''}</span>`)}
  return L.length?`<div class="nhs">${L.join('')}</div>`:''
}

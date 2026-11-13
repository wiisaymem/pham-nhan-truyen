'use strict';
// ───────────────────────── Đại chiêu (Bộc phát): mỗi tu sĩ một chiêu riêng theo hành, 5 cấp mở bằng linh thạch
const ULT={
  lamphong:{n:'Vạn Kiếm Triều Tông',k:'kim',sum:'ic_sum_sword',emb:'ult_kiem',c:['#fff6c0','#ffd45a','#ff9a1f']},
  linhnhi:{n:'Vạn Mộc Hồi Xuân',k:'moc',sum:'ic_sum_tree',emb:'ult_moc',c:['#e8ffe0','#7bff9a','#2f9e36']},
  hanbang:{n:'Băng Phong Thiên Địa',k:'thuy',sum:'ic_sum_dragon',emb:'ult_bang',c:['#ffffff','#9fe8ff','#2a8fe0']},
  loichan:{n:'Lôi Thần Giáng Thế',k:'loi',sum:'ic_sum_hammer',emb:'ult_loi',c:['#ffffff','#c8a8ff','#6a4ae0']},
  modung:{n:'Hỏa Phượng Liệu Nguyên',k:'hoa',sum:'ic_sum_phoenix',emb:'ult_hoa',c:['#fff6c0','#ffb02e','#d4341a']},
  bachho:{n:'Cửu Vĩ Huyễn Thiên',k:'ho',sum:'ic_sum_fox',emb:'ult_ho',c:['#ffffff','#ffd0f0','#b48cff']},
};
const ULT_COST=[0,0,400,1000,2200,4500]; // giá mở cấp n
const ULT_LV_D=['','Nhảy lên, dậm xuống tạo sóng chấn','Vùng rộng hơn, thêm đòn theo hành','Phủ toàn màn hình, thời gian chậm lại','Triệu hồi pháp tướng khổng lồ, sát thương x1.5','Dư chấn lần hai, để lại trường hành trên đất'];
for(const k in ULT)ULT[k].n=i18n('ult.'+k,ULT[k].n);
function ultSave(){if(!SAVE.ult)SAVE.ult={};return SAVE.ult}
const ultLv=ch=>Math.max(1,ultSave()[ch]|0);
function ultUp(ch){const lv=ultLv(ch);if(lv>=5)return false;const c=ULT_COST[lv+1];if(SAVE.lt<c)return false;SAVE.lt-=c;ultSave()[ch]=lv+1;saveSave();return true}

// thay hàm bộc phát cũ
useBurst=function(){
  if(!G||G.over||G.paused||G.burst<100||G.ult)return false;
  const U=ULT[G.ch]||ULT.lamphong,lv=ultLv(G.ch);G.burst=0;
  G.ult={t:0,lv,U,dur:[0,1.3,1.6,2.0,2.4,2.8][lv],slam:false,wave2:false,fx:0};
  G.p.inv=Math.max(G.p.inv,G.ult.dur+0.6);for(const b of G.es)if(Math.hypot(b.x-G.p.x,b.y-G.p.y)<260)b.dead=true;
  sfx('level');if(typeof buzz==='function')buzz([20,40,20]);return true};
function ultRadius(lv){return lv>=3?Math.max(VW,VH)*0.75:lv===2?200:150}
function ultDmg(lv){return 60*(1+G.realm*0.6)*(1+0.4*(lv-1))*(lv>=4?1.5:1)}
function ultHit(x,y,R,dmg,el,kb){G.src='burst';forNear(x,y,R+20,e=>{if(Math.hypot(e.x-x,e.y-y)<R+e.r)hurtE(e,e.d.boss?dmg*3:dmg,el,{kb,kx:x,ky:y,rx:1})})}
const ULT_EL={kim:'kim',moc:'moc',thuy:'thuy',loi:'kim',hoa:'hoa',ho:'thuy'};
// cập nhật (thời gian thật, gọi trong update trước khi làm chậm)
function updateUlt(dt){
  const u=G.ult;if(!u)return 1;u.t+=dt;const P=G.p,lv=u.lv,R=ultRadius(lv),el=ULT_EL[u.U.k];
  if(!u.slam&&u.t>=0.55){u.slam=true;ultHit(P.x,P.y,R,ultDmg(lv),el,140);shake(0.5+lv*0.12);flash(u.U.c[1],0.35+lv*0.08);sfx('realm');sfx('boom');if(typeof buzz==='function')buzz([60,30,90+lv*20]);
    G.fx.push({k:'ultslam',x:P.x,y:P.y,r:R,lv,c:u.U.c,t:0,dur:0.9})}
  // đòn theo hành (cấp 2+)
  if(u.slam&&lv>=2&&u.t<u.dur-0.3){u.fx-=dt;if(u.fx<=0){u.fx=lv>=4?0.05:0.09;ultElem(u,R)}}
  if(lv>=5&&!u.wave2&&u.t>=1.35){u.wave2=true;ultHit(P.x,P.y,R*1.1,ultDmg(lv)*0.6,el,90);shake(0.6);G.fx.push({k:'ultslam',x:P.x,y:P.y,r:R*1.1,lv,c:u.U.c,t:0,dur:0.8});
    const zk={kim:'array',moc:'vine',thuy:'vine',loi:'array',hoa:'burn',ho:'burn'}[u.U.k];G.zones.push({k:zk,x:P.x,y:P.y,r:70,t:0,dur:5,dps:ultDmg(1)*0.4,dmg:ultDmg(1)*0.12,el,tick:0,seed:rand()*999,follow:zk==='array'?1:0,leech:u.U.k==='moc'?1:0,src:'burst'})}
  if(u.t>=u.dur){G.ult=null;return 1}
  // làm chậm thời gian khi bay lên (cấp 3+), chậm nhẹ ở cấp thấp
  return u.t<0.55?(lv>=3?0.15:0.35):u.t<0.9?(lv>=3?0.4:0.7):1;
}
function ultElem(u,R){
  const P=G.p,k=u.U.k,d=ultDmg(u.lv)*0.35,a=rand()*TAU,r=Math.sqrt(rand())*R,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r*0.75;
  // ưu tiên đánh vào yêu quái
  let tg=null;if(G.e.length&&rand()<0.7){tg=G.e[(rand()*G.e.length)|0];if(Math.hypot(tg.x-P.x,tg.y-P.y)>R)tg=null}
  const X=tg?tg.x:x,Y=tg?tg.y:y;
  if(k==='kim'){G.fx.push({k:'ultsword',x:X,y:Y,t:0,dur:0.45,c:u.U.c});G.later.push({t:0.22,f:()=>{ultHit(X,Y,20,d,'kim',30)}})}
  else if(k==='loi'){G.fx.push({k:'strike',x:X,y:Y,r:18,t:0,dur:0.35,gold:0});ultHit(X,Y,22,d,'kim',20)}
  else if(k==='thuy'){G.fx.push({k:'ultice',x:X,y:Y,t:0,dur:0.8});ultHit(X,Y,22,d,'thuy',10);forNear(X,Y,30,e=>{if(!e.d.boss)e.rootT=Math.max(e.rootT,1.5);e.slowT=Math.max(e.slowT,2)})}
  else if(k==='moc'){G.fx.push({k:'ultvine',x:X,y:Y,t:0,dur:0.9,seed:rand()*999});ultHit(X,Y,24,d,'moc',0);forNear(X,Y,30,e=>{if(!e.d.boss)e.rootT=Math.max(e.rootT,1.2)});if(rand()<0.3){P.hp=Math.min(P.mhp,P.hp+1)}}
  else if(k==='hoa'){G.fx.push({k:'boom',x:X,y:Y,r:24,t:0,dur:0.35});ultHit(X,Y,26,d,'hoa',30)}
  else if(k==='ho'){G.fx.push({k:'ultfox',x:P.x,y:P.y-10,tx:X,ty:Y,t:0,dur:0.5});G.later.push({t:0.45,f:()=>{G.fx.push({k:'boom',x:X,y:Y,r:20,t:0,dur:0.3});ultHit(X,Y,22,d,'thuy',20)}})}
}

'use strict';
// ───────────────────────── vẽ: nền tươi sáng, sprite, hiệu ứng công pháp
const cv=document.getElementById('game'), ctx=cv.getContext('2d');
let SCALE=2, Z=2, camX=0, camY=0;
// chất lượng hiệu ứng: 2 cao, 1 vừa, 0 thấp (SAVE.opt.fxq: 'auto' | 0 | 1 | 2)
let FXQ=2, FXAUTO=true, fxFr=[], fxT=0;
function fxqInit(){const o=SAVE.opt.fxq??'auto';FXAUTO=o==='auto';FXQ=FXAUTO?((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=3?1:2):+o;if(typeof VP!=='undefined')vfxQ()}
function fxqTick(dt){if(!FXAUTO||!G||G.paused||G.over||FXQ===0||dt<=0)return;fxFr.push(dt);fxT+=dt;if(fxT<2.5)return;const avg=fxFr.reduce((a,b)=>a+b,0)/fxFr.length;fxFr=[];fxT=0;if(1/avg<46){FXQ--;vfxQ();resize()}}
function resize(){
  // pixel art sắc nét: (1) khung vẽ = độ nét thật của màn hình chia cho một số nguyên k, để trình duyệt chỉ phóng ×k tròn;
  // (2) mỗi điểm của thế giới game = đúng Z điểm khung vẽ, Z nguyên. Hệ số lẻ (×2.6, ×4.2…) làm điểm to nhỏ không đều, nhìn vỡ nét.
  const w=Math.max(1,innerWidth), h=Math.max(1,innerHeight), real=window.devicePixelRatio||1;
  let k=FXQ===0?Math.max(1,Math.round(real)):FXQ===1&&real>=2.5?2:1;
  // trần điểm ảnh (11/2026, học từ game Saltline): màn hình rất to (4K, siêu rộng, Retina lớn) không vẽ quá ~4,2 triệu điểm ảnh; vẫn chia theo số nguyên nên pixel art giữ nét
  while(w*h*(real/k)*(real/k)>4.2e6&&real/(k+1)>=0.45)k++;
  const b=real/k;
  const want=Math.max(1.4,Math.min(w,h)/(typeof G!=='undefined'&&G&&G.camZ?G.camZ[w>h?1:0]:195));   // G.camZ=[dọc,ngang]: chế độ nào muốn máy quay gần hơn thì đặt (Trấn Ấn Lộ)
  Z=Math.max(2,Math.round(want*b)); SCALE=Z/b;
  VW=w/SCALE; VH=h/SCALE;
  cv.width=Math.round(w*b); cv.height=Math.round(h*b);
}

// ── atlas
let ATLAS=null;
const SPR={};
function loadArt(cb){
  const im=new Image(); let done=false;
  const fin=()=>{if(done)return;done=true;cb()};
  im.onload=()=>{ATLAS=im;for(const k in ART_MAN)SPR[k]=ART_MAN[k];fin()};
  im.onerror=fin; setTimeout(fin,30000);
  im.src='assets/atlas.webp?v='+(typeof ATLAS_V!=='undefined'?ATLAS_V:VER);
}
function drawS(k,x,y,o){ // o: {flip,sc,alpha}
  const m=SPR[k]; if(!m||!ATLAS)return false;
  const r=m.r, sc=o&&o.sc||1, w=m.ww*sc, h=m.wh*sc;
  const src=o&&o.white?whiteOf(k):(m.img||ATLAS), sx=o&&o.white?0:r[0], sy=o&&o.white?0:r[1];
  if(o&&o.alpha!==undefined)ctx.globalAlpha=o.alpha;
  if(m.smooth)ctx.imageSmoothingEnabled=true; // hình Cartoon vẽ mịn
  if(o&&o.flip){ctx.scale(-1,1);ctx.drawImage(src,sx,sy,r[2],r[3],-x-m.ax*sc,y-m.ay*sc,w,h);ctx.scale(-1,1)}   // lật bằng scale hai lần: rẻ hơn save/restore khi đông quái
  else ctx.drawImage(src,sx,sy,r[2],r[3],x-m.ax*sc,y-m.ay*sc,w,h);
  if(o&&o.alpha!==undefined)ctx.globalAlpha=1;
  if(m.smooth)ctx.imageSmoothingEnabled=false;
  return true;
}
const WHITE={};
function whiteOf(k){if(WHITE[k])return WHITE[k];const r=SPR[k].r,c=mk(r[2],r[3]),x=c.getContext('2d');x.drawImage(SPR[k].img||ATLAS,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);x.globalCompositeOperation='source-atop';x.fillStyle='#ffffff';x.fillRect(0,0,r[2],r[3]);return WHITE[k]=c}
const TINT={};
function tintOf(k,col,a){const id=k+col+a;if(TINT[id])return TINT[id];const r=SPR[k].r,c=mk(r[2],r[3]),x=c.getContext('2d');x.drawImage(SPR[k].img||ATLAS,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);x.globalCompositeOperation='source-atop';x.globalAlpha=a;x.fillStyle=col;x.fillRect(0,0,r[2],r[3]);return TINT[id]=c}
function drawTint(k,x,y,col,a,flip,sc=1,alpha=1){const m=SPR[k];if(!m)return;const c=tintOf(k,col,a),w=m.ww*sc,h=m.wh*sc;ctx.globalAlpha=alpha;if(m.smooth)ctx.imageSmoothingEnabled=true;
  if(flip){ctx.save();ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(c,-m.ax*sc,-m.ay*sc,w,h);ctx.restore()}else ctx.drawImage(c,x-m.ax*sc,y-m.ay*sc,w,h);ctx.globalAlpha=1;if(m.smooth)ctx.imageSmoothingEnabled=false}

// ── nền: chunk 128 đơn vị, 2 px/đơn vị, có LRU
const CH=128, CPX=2, CHUNKS=new Map();
function hash2(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return lerp(lerp(hash2(xi,yi,s),hash2(xi+1,yi,s),u),lerp(hash2(xi,yi+1,s),hash2(xi+1,yi+1,s),u),v)}
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function getChunk(ci,cj){
  const key=ci*1000+cj; let c=CHUNKS.get(key);
  if(c){CHUNKS.delete(key);CHUNKS.set(key,c);return c}
  const MP=MAPS[G.mapId], S=G.world.seed&0xffff, P=CH*CPX;
  c=mk(P,P); const x=c.getContext('2d'), img=x.createImageData(P,P), D=img.data;
  const pal=MP.g.map(hexRgb), g2=hexRgb(MP.g2), wa=hexRgb(MP.water), wb=hexRgb(MP.water2), sky=hexRgb(MP.sky);
  const ponds=G.world.obs.filter(o=>o.k==='pond'&&o.x+o.r+8>ci*CH&&o.x-o.r-8<(ci+1)*CH&&o.y+o.r+8>cj*CH&&o.y-o.r-8<(cj+1)*CH);
  for(let py=0;py<CH;py++)for(let px=0;px<CH;px++){
    const wx=ci*CH+px, wy=cj*CH+py; let col;
    if(wx<0||wy<0||wx>=WORLD||wy>=WORLD){const n=vnoise(wx/24,wy/24,S+9);col=n>0.55?[255,255,255]:sky}
    else{
      const n=vnoise(wx/22,wy/22,S)*0.6+vnoise(wx/7,wy/7,S+1)*0.4, d=hash2(wx>>1,wy>>1,S+2);
      const tt=clamp((n-0.2)*1.6,0,0.999)*3,i0=tt|0,f=tt-i0+(d-0.5)*0.35,a=pal[i0],b=pal[Math.min(3,i0+1)],ff=clamp(f,0,1);col=[a[0]+(b[0]-a[0])*ff,a[1]+(b[1]-a[1])*ff,a[2]+(b[2]-a[2])*ff]; if(d<0.03)col=g2;
      // viền bản đồ: mây
      const edge=Math.min(wx,wy,WORLD-1-wx,WORLD-1-wy);
      if(edge<10){const k=edge/10;col=[lerp(255,col[0],k),lerp(255,col[1],k),lerp(255,col[2],k)]}
      for(const o of ponds){const dd=Math.hypot(wx-o.x,wy-o.y),rr=o.r+(vnoise(Math.atan2(wy-o.y,wx-o.x)*3+o.w,o.w,S)-0.5)*8;
        if(dd<rr){const sh=dd>rr-3;col=sh?wb:(hash2(wx>>2,wy,S+3)<0.04?wb:wa);break}
        else if(dd<rr+3){col=MP.ice?[250,254,255]:[lerp(col[0],255,0.35),lerp(col[1],245,0.35),lerp(col[2],200,0.35)]}}
    }
    for(let yy=0;yy<CPX;yy++)for(let xx=0;xx<CPX;xx++){const i=((py*CPX+yy)*P+px*CPX+xx)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255}
  }
  x.putImageData(img,0,0);
  // hoa và cỏ
  const R=mulberry32(S*31+ci*977+cj*131);
  x.scale(CPX,CPX);
  for(let i=0;i<46;i++){const px=R()*CH,py=R()*CH,wx=ci*CH+px,wy=cj*CH+py;if(wx<4||wy<4||wx>WORLD-4||wy>WORLD-4)continue;
    if(ponds.some(o=>Math.hypot(wx-o.x,wy-o.y)<o.r+5))continue;
    const t=R();
    if(t<0.5){const c=MP.deco[(R()*MP.deco.length)|0];x.fillStyle=c;x.fillRect(px|0,py|0,1,1);x.fillRect((px|0)+1,(py|0),1,1);x.fillStyle='#fff6a8';x.fillRect((px|0)+0.5,(py|0)-0.5,0.5,0.5)}
    else{x.fillStyle=MP.ice?'#c2dceb':'rgba(40,110,40,0.45)';x.fillRect(px|0,py|0,0.5,2);x.fillRect((px|0)+1,(py|0)-0.5,0.5,2.5);x.fillRect((px|0)+2,(py|0)+0.5,0.5,1.5)}}
  CHUNKS.set(key,c); if(CHUNKS.size>28)CHUNKS.delete(CHUNKS.keys().next().value);
  return c;
}

function dot(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function ring(x,y,r,col,w,a=1){ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
function ell(x,y,rx,ry,col,a=1){ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.globalAlpha=1}

// ── vật thể
function enemyFrame(e){
  const s=e.d.spr;
  if(e.dead){const f=Math.min(3,(e.dieT/0.15)|0);return `e_${s}_die${f}`}
  if(e.flash>0.02&&SPR[`e_${s}_hurt0`])return `e_${s}_hurt${((e.flash*20)|0)%2}`;
  if(e.atkT>0&&SPR[`e_${s}_atk0`])return `e_${s}_atk${Math.min(3,((0.5-e.atkT)*8)|0)}`;
  return `e_${s}_walk${((e.anim|0)%4)}`;
}
// tối ưu khi đông quái (10/11/2026): bóng dưới chân và dấu ngũ hành vẽ sẵn một lần rồi dán, không dựng đường vẽ cho từng con
let ESHADOW=null;const EMARK={};
function eShadow(){if(ESHADOW)return ESHADOW;const c=mk(24,10),x=c.getContext('2d');x.fillStyle='#23402a';x.beginPath();x.ellipse(12,5,12,5,0,0,TAU);x.fill();return ESHADOW=c}
function eMark(el){if(EMARK[el])return EMARK[el];const c=mk(24,28),x=c.getContext('2d');x.scale(4,4);x.translate(3,3.5);
  x.fillStyle=EL[el].d;x.beginPath();x.moveTo(0,-3);x.lineTo(2.6,0);x.lineTo(0,3);x.lineTo(-2.6,0);x.fill();x.fillStyle=EL[el].c;x.beginPath();x.moveTo(0,-2);x.lineTo(1.6,0);x.lineTo(0,2);x.lineTo(-1.6,0);x.fill();return EMARK[el]=c}
let ECROWD=0;   // số yêu quái trong khung hình ở khung trước: trên 260 con thì bỏ bóng của quái thường
function drawEnemy(e){
  const d=e.d, sc=d.sc*(e.elite?1.3:1), z=(e.hopZ||0)+(d.ai==='fly'&&!e.dead?5+Math.sin(G.t*4+e.ph)*1.5:0);
  if(e.t==='tamma'&&!d.spr){drawPlayerSprite(e.x,e.y,dirOf(e.vx,e.vy),e.anim,{tint:'#4b1b8c',ta:0.55,flash:e.flash>0,sc:1.15});return}
  const fr=enemyFrame(e), al=d.alpha??1;
  if(!e.dead&&(ECROWD<260||e.elite||d.boss)){const rx=e.r*1.1,ry=e.r*0.45;ctx.globalAlpha=0.22;ctx.drawImage(eShadow(),e.x-rx,e.y-ry,rx*2,ry*2);ctx.globalAlpha=1}
  if(e.elite&&!e.dead)ell(e.x,e.y,e.r*1.4,e.r*0.6,'#ffd84a',0.35+Math.sin(G.t*6)*0.1);
  const flip=e.face<0, a=e.dead?Math.max(0,1-e.dieT/0.6)*al:al;
  if(!drawS(fr,e.x,e.y-z,{flip,sc,alpha:a}))dot(e.x,e.y-e.r,e.r,EL[e.el].c);
  if(e.flash>0&&!e.dead)drawS(fr,e.x,e.y-z,{flip,sc,alpha:0.7,white:1});
  if(e.slowT>0&&!e.dead)ell(e.x,e.y-2,e.r*1.2,e.r*0.5,'#9fe8ff',0.45);
  if(e.rootT>0&&!e.dead){e.rootE=(e.rootE||0)+(typeof VDT==='number'?VDT:0.016);const f=e.rootE<0.07?0:e.rootE<0.15?1:e.rootT<0.22?3:2,bs=Math.max(0.42,Math.min(1.1,e.r*sc/13));
    if(!drawS('mc_bind'+f,e.x,e.y+2,{sc:bs,alpha:f===3?0.7:0.85})){ctx.strokeStyle='#3fae3a';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(e.x,e.y-e.r*0.6,e.r,0,TAU);ctx.stroke()}}
  else if(e.rootE)e.rootE=0;
  if(!e.dead&&e.el){const m=SPR[fr],hy=e.y-z-(m?m.ay*sc:e.r*2)-3;ctx.drawImage(eMark(e.el),e.x-3,hy-3.5,6,7);
    if(e.elite||(d.heavy&&e.hp<e.mhp)){const w=e.r*2;ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(e.x-w/2,hy+4,w,1.6);ctx.fillStyle='#ff5a5a';ctx.fillRect(e.x-w/2,hy+4,w*Math.max(0,e.hp/e.mhp),1.6)}}
}
const dirOf=(vx,vy)=>Math.abs(vx)<1&&Math.abs(vy)<1?'D':Math.abs(vx)>Math.abs(vy)*0.9?(vx>0?'R':'L'):(vy>0?'D':'U');
function drawPlayerSprite(x,y,dir,anim,o={}){
  const id=CHARS[o.ch||G.ch].spr, d=dir==='L'?'R':dir, f=anim>0?((anim|0)%4):0, k=`${id}_w_${d}${f}`, flip=dir==='L', sc=o.sc||1;
  if(o.dieT!==undefined&&SPR[`${id}_die0`]){const nd=SPR[`${id}_die3`]?4:2;drawS(`${id}_die${Math.min(nd-1,(o.dieT/(0.7/nd))|0)}`,x,y,{flip,sc});return}
  if(o.hurt&&SPR[`${id}_hurt0`]&&!o.tint){drawS(`${id}_hurt${o.hurt>0.12?0:1}`,x,y,{flip,sc});return}
  if(o.tint)drawTint(k,x,y,o.tint,o.ta,flip,sc,o.alpha??1);
  else drawS(k,x,y,{flip,sc,alpha:o.alpha});
  if(o.flash)drawS(k,x,y,{flip,sc,alpha:0.6,white:1});
}
function drawPlayer(){
  const P=G.p;
  ell(P.x,P.y,7,2.8,'#23402a',0.25);
  // hào quang cảnh giới
  if(P.dead){drawPlayerSprite(P.x,P.y,P.dir,0,{dieT:P.deadT});return}
  const blink=P.inv>0.1&&((G.t*20)|0)%2;
  drawPlayerSprite(P.x,P.y,P.dir,P.mv?P.anim:0,{flash:P.hurtT>0.15,alpha:blink?0.5:1,hurt:!P.mv&&P.hurtT>0?P.hurtT:0});
}
function drawObs(o){
  if(!o.deco&&o.r)ell(o.x,o.y,o.r*1.4,o.r*0.5,'#1f4a2a',0.22);
  drawS(o.spr,o.x,o.y+1,{sc:o.sc||1});
}

// ── hiệu ứng kỹ năng: xem js/vfx.js
function drawGem(g){const b=Math.sin(g.t*4)*1,big=g.v>=25,mid=g.v>=5,s=big?4:mid?3.2:2.4,c=big?'#ffd23f':mid?'#4cc3ff':'#5effa8',cd=big?'#b07a0c':mid?'#1a6fb0':'#1d9e5a';
  const x=g.x,y=g.y-3+b;ctx.fillStyle=cd;ctx.beginPath();ctx.moveTo(x,y-s-0.8);ctx.lineTo(x+s*0.75+0.8,y);ctx.lineTo(x,y+s+0.8);ctx.lineTo(x-s*0.75-0.8,y);ctx.fill();
  ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s*0.75,y);ctx.lineTo(x,y+s);ctx.lineTo(x-s*0.75,y);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(x-1,y-s*0.5,1,1.4)}
function drawItem(it){const b=Math.sin(it.t*4)*1.2,x=it.x,y=it.y-5+b;ell(it.x,it.y,5,2,'#23402a',0.25);
  if(it.k==='heal'){dot(x,y+1,3.6,'#c8202a');dot(x,y-2.6,2.2,'#e83a44');ctx.fillStyle='#5ee05a';ctx.fillRect(x-0.5,y-6,1,2);ctx.fillRect(x,y-6,2,1);ctx.fillStyle='#ffd0d0';ctx.fillRect(x-1.6,y-0.5,1,1)}
  else if(it.k==='magnet'){ctx.fillStyle='#ffe066';ctx.fillRect(x-3,y-5,6,10);ctx.fillStyle='#2a6fd4';ctx.fillRect(x-1,y-4,2,8);ctx.fillRect(x-2,y-1,4,1)}
  else if(it.k==='chest'){const gl=0.5+Math.sin(it.t*5)*0.3;ell(x,y,12,7,'#fff1a0',gl*0.5);ctx.fillStyle='#8a4a1a';ctx.fillRect(x-7,y-5,14,10);ctx.fillStyle='#c46a2a';ctx.fillRect(x-7,y-5,14,4);ctx.fillStyle='#ffd23f';ctx.fillRect(x-7,y-1.5,14,1.5);ctx.fillRect(x-1.5,y-2.5,3,4);ctx.fillRect(x-7,y-5,1.5,10);ctx.fillRect(x+5.5,y-5,1.5,10)}
}
function drawOrb(o){ctx.fillStyle='#7a5a32';ctx.beginPath();ctx.arc(o.x,o.y+1,5,0,TAU);ctx.fill();ctx.fillStyle='#c99a55';ctx.beginPath();ctx.arc(o.x,o.y,4.6,0,TAU);ctx.fill();ctx.fillStyle='#ecc98a';ctx.fillRect(o.x-2.5,o.y-3,2.5,2);ctx.fillStyle='#e8d36a';ctx.fillRect(o.x+0.5,o.y,1.5,1.5)}

// ── hạt bay (cánh hoa, tuyết)
const PET=[];
function drawAmbient(dt){
  const MP=MAPS[G.mapId];
  const pn=Math.round((MP.ice?40:26)*[0.35,0.7,1][FXQ]);if(PET.length>pn)PET.length=pn;
  while(PET.length<pn)PET.push({x:rand()*VW,y:rand()*VH,s:0.6+rand()*0.8,p:rand()*TAU});
  ctx.fillStyle=MP.petal;
  for(const p of PET){p.y+=dt*(10+p.s*8);p.x+=dt*(Math.sin(G.t+p.p)*8+6);p.p+=dt;if(p.y>VH+4){p.y=-4;p.x=rand()*VW}if(p.x>VW+4)p.x=-4;
    ctx.globalAlpha=0.75;if(MP.ice)ctx.fillRect(p.x,p.y,1.2*p.s+0.4,1.2*p.s+0.4);else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.p*2);ctx.fillRect(-1.2*p.s,-0.6,2.4*p.s,1.2);ctx.restore()}}
  ctx.globalAlpha=1;
}

// ── vẽ khung hình
let lastR=0;
// số sát thương: fillText rất chậm trên điện thoại khi có vài chục số mỗi khung, nên mỗi (số, màu, cỡ) chỉ vẽ chữ một lần
let NUMC=new Map(),NUMZ=0;
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{NUMC=new Map()});
function numSpr(n){
  if(NUMZ!==Z||NUMC.size>500){NUMC=new Map();NUMZ=Z}
  const id=n.v+'|'+n.c+(n.big?'B':''),h=NUMC.get(id);if(h)return h;
  const px=n.big?11:8,font=`${px}px VT323, monospace`;ctx.font=font;const w=Math.ceil(ctx.measureText(n.v).width)+3,hh=px+3,c=mk(w*Z,hh*Z),x=c.getContext('2d');
  x.scale(Z,Z);x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#2a1a10';x.fillText(n.v,w/2+0.7,hh/2+0.7);x.fillStyle=n.c;x.fillText(n.v,w/2,hh/2);
  c.ww=w;c.wh=hh;NUMC.set(id,c);return c;
}
function render(now){
  const dt=Math.min(0.05,(now-lastR)/1000||0); lastR=now; fxqTick(dt);
  ctx.setTransform(1,0,0,1,0,0);
  if(!G){ctx.clearRect(0,0,cv.width,cv.height);return}
  ctx.setTransform(Z,0,0,Z,0,0); ctx.imageSmoothingEnabled=false;
  const P=G.p; let sx=0,sy=0; if(G.shake>0){sx=(rand()-.5)*G.shake*8;sy=(rand()-.5)*G.shake*8}
  {let fx=P.x,fy=P.y-8;const R=G.camR;   // hầm ngục tròn (Trấn Ấn Lộ): máy quay không trôi ra ngoài vùng tối, người chơi lệch khỏi tâm màn hình khi ra sát mép
    if(R){const C0=WORLD/2,dx=fx-C0,dy=fy-C0,ex=Math.max(0,R-VW*0.36),ey=Math.max(0,R-VH*0.36),k=Math.hypot(dx/(ex||1),dy/(ey||1));if(k>1){fx=C0+dx/k;fy=C0+dy/k}if(!ex)fx=C0;if(!ey)fy=C0}
    camX=Math.round((fx-VW/2+sx)*Z)/Z; camY=Math.round((fy-VH/2+sy)*Z)/Z}
  const c0x=Math.floor(camX/CH),c1x=Math.floor((camX+VW)/CH),c0y=Math.floor(camY/CH),c1y=Math.floor((camY+VH)/CH);
  for(let cj=c0y;cj<=c1y;cj++)for(let ci=c0x;ci<=c1x;ci++){const c=getChunk(ci,cj);ctx.drawImage(c,ci*CH-camX,cj*CH-camY,CH,CH)}
  ctx.translate(-camX,-camY);
  const inV=(x,y,m)=>x>camX-m&&x<camX+VW+m&&y>camY-m&&y<camY+VH+m+30;
  if(typeof mapUnder==='function')mapUnder();
  for(const z of G.zones)if(inV(z.x,z.y,z.r))drawZone(z);
  if(G.kiep)for(const s of G.kiep.strikes)drawWarn(s);
  for(const f of G.fx)drawFxUnder(f);
  for(const g of G.gems)if(inV(g.x,g.y,6))drawGem(g);
  for(const it of G.items)if(inV(it.x,it.y,10))drawItem(it);
  // y-sort
  const L=[];
  for(const o of visObs())L.push(o);
  {const n0=L.length;for(const e of G.e)if(inV(e.x,e.y,40))L.push(e);ECROWD=L.length-n0}
  for(const e of G.dying)if(inV(e.x,e.y,40))L.push(e);
  L.push(P); if(G.pet)L.push(G.pet);
  // quái đang áp sát người chơi mà đứng phía dưới thì vẽ TRƯỚC người chơi, để hình nhân vật không bị che (1.0.74)
  {const ky=o=>(o!==P&&o!==G.pet&&!o.k&&!o.dead&&o.y>P.y&&Math.hypot(o.x-P.x,o.y-P.y)<o.r+P.r+12)?P.y-0.01:o.y;for(const o of L)o._zy=ky(o);L.sort((a,b)=>a._zy-b._zy)}
  for(const o of L){if(o===P)drawPlayer();else if(o===G.pet)drawPet();else if(o.k)drawObs(o);else drawEnemy(o)}
  if(G.w.thothuan)for(const o of G.w.thothuan.orb)if(o)drawOrb(o);
  for(const p of G.pr)drawProj(p);
  for(const b of G.es)drawEShot(b);
  for(const f of G.fx)drawFxOver(f);
  VDT=G.paused||G.over&&G.t2>3?0:dt*(G.cine&&G.cine.t<1.5?0.3:G.bt&&G.bt.t<1.1?0.5:1); updateVfx(VDT); drawVfx('over');
  if(typeof mapOver==='function')mapOver();
  // số sát thương
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const n of G.nums){const k=n.t/0.7,c=numSpr(n);ctx.globalAlpha=1-k*k;ctx.drawImage(c,n.x-c.ww/2,n.y-k*12-c.wh/2,c.ww,c.wh)}
  ctx.globalAlpha=1;
  ctx.setTransform(Z,0,0,Z,0,0);
  if(G.kiep||G.kiepFade>0)drawKiepSky(dt);
  if(typeof mapScreen==='function')mapScreen(G.paused?0:dt);
  drawAmbient(dt);
  // chỉ hướng boss
  if(G.boss&&!G.boss.dead){const b=G.boss,dx=b.x-P.x,dy=b.y-P.y;if(Math.abs(dx)>VW/2||Math.abs(dy)>VH/2){const a=Math.atan2(dy,dx),x=clamp(VW/2+Math.cos(a)*VW,14,VW-14),y=clamp(VH/2+Math.sin(a)*VH,40,VH-60);
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#ff3d6e';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-5);ctx.lineTo(-4,5);ctx.fill();ctx.restore()}}
  if(G.flash>0){ctx.globalAlpha=Math.min(0.8,G.flash);ctx.fillStyle=G.flashC;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(P.hurtT>0){ctx.globalAlpha=P.hurtT*1.2;const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.7);g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,'rgba(255,40,40,0.6)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(G.bt)btScreen(G.bt);
  if(G.ult)ultScreen(G.ult);
  if(G.cine)drawCine(G.cine);
  drawJoy();
}
function visObs(){const W=G.world,out=[],x0=Math.max(0,((camX-30)/OCELL)|0),x1=Math.min(W.gw-1,((camX+VW+30)/OCELL)|0),y0=Math.max(0,((camY-10)/OCELL)|0),y1=Math.min(W.gw-1,((camY+VH+50)/OCELL)|0),seen=new Set();
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)for(const o of W.grid[y*W.gw+x])if(o.k!=='pond'&&!seen.has(o)){seen.add(o);out.push(o)}return out}
function drawJoy(){if(!JOY.on)return;const a=JOY;ctx.globalAlpha=0.35;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(a.ox/SCALE,a.oy/SCALE,26,0,TAU);ctx.fill();ctx.globalAlpha=0.7;ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(a.ox/SCALE+INPUT.x*20,a.oy/SCALE+INPUT.y*20,11,0,TAU);ctx.fill();ctx.globalAlpha=1}

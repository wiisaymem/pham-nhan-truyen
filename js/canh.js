'use strict';
// ───────────────────────── Cánh (chỉ để trang trí)
// Lấy được trong Bí cảnh Vũ Điện (giải đố thắp đèn giữa bầy yêu quái). Có cánh thì nhân vật bay vào trận và cánh vỗ theo bước chạy.
// Hình gốc: tools/art_src/kyvat.png hàng 4 (Google Flow). Hoạt ảnh vỗ cánh dựng từ chính ảnh mẫu: tách hai nửa, xoay quanh vai.
const WINGS={
  hac:{n:'Cánh Hạc Trắng',spr:'wing_hac',c:'#ffffff',amp:0.32,fx:'#e8f8ff'},
  phuong:{n:'Cánh Hỏa Phượng',spr:'wing_phuong',c:'#ffb02e',amp:0.3,fx:'#ffb02e'},
  buom:{n:'Cánh Điệp Linh',spr:'wing_buom',c:'#7fd8ff',amp:0.42,fx:'#bff4ff'},
  long:{n:'Cánh Kim Long',spr:'wing_long',c:'#ffd45a',amp:0.26,fx:'#ffe680'},
};
const WING_ORDER=['hac','phuong','buom','long'];
for(const k in WINGS)WINGS[k].n=i18n('canh.'+k,WINGS[k].n);
function wingSave(){if(!SAVE.wing)SAVE.wing={own:{},eq:null};return SAVE.wing}

// vẽ đôi cánh: góc vỗ a (rad, dương = nâng lên), sx = co ngang khi nhìn nghiêng
function drawWing(k,x,y,w,a,sx,alpha){const m=SPR[WINGS[k].spr];if(!m||!ATLAS)return;const r=m.r,s=w/r[2],hw=r[2]/2,py=r[3]*0.42;
  ctx.save();ctx.translate(x,y);ctx.scale(s*(sx||1),s);ctx.globalAlpha=alpha??1;ctx.imageSmoothingEnabled=false;
  const fold=1-Math.max(0,-a)*0.6;
  ctx.save();ctx.rotate(a);ctx.scale(fold,1);ctx.drawImage(ATLAS,r[0],r[1],hw,r[3],-hw,-py,hw,r[3]);ctx.restore();
  ctx.save();ctx.rotate(-a);ctx.scale(fold,1);ctx.drawImage(ATLAS,r[0]+hw,r[1],hw,r[3],0,-py,hw,r[3]);ctx.restore();
  ctx.restore();ctx.globalAlpha=1}
function wingAngle(k,t,fast){const W=WINGS[k],f=fast?9:2.6,amp=W.amp*(fast?1:0.45);return Math.sin(t*f)*amp+(fast?0.05:0.08)}
// gắn cánh vào nhân vật chính
const _dpsW=drawPlayerSprite;
drawPlayerSprite=function(x,y,dir,anim,o){o=o||{};
  if(!G||!G.wing||o.dieT!==undefined||x!==G.p.x||y!==G.p.y){_dpsW(x,y,dir,anim,o);return}
  const k=G.wing,P=G.p,I=G.wingIn,lift=I?wingLift(I):0,fast=!!(P.mv||I),a=wingAngle(k,G.t,fast)+(I?0.25:0),wy=y-14-lift;
  const side=dir==='L'||dir==='R',sx=side?0.55:1,ox=side?(dir==='R'?-3:3):0,front=dir==='U',al=o.alpha??1;
  if(!front){drawWing(k,x+ox,wy,30,a,sx,al)}
  if(lift){ctx.save();ctx.translate(0,-lift);_dpsW(x,y,dir,I.t<I.dur-0.25?1:anim,o);ctx.restore()}else _dpsW(x,y,dir,anim,o);
  if(front)drawWing(k,x,wy+2,30,a,1,al);
  if(fast&&rand()<0.15)vp(x+(rand()-.5)*24,wy+rand()*6,{vy:12,vx:(rand()-.5)*10,life:0.6,s:1.6,c:WINGS[k].fx,drag:1})};
// bay vào trận
function wingLift(I){const k=Math.min(1,I.t/I.dur);return 150*(1-k)*(1-k)+Math.sin(k*Math.PI)*6}
const _nrW=newRun;newRun=function(...a){const r=_nrW(...a);const S=wingSave();G.wing=S.eq&&S.own[S.eq]?S.eq:null;if(G.wing){G.wingIn={t:0,dur:1.7,x:G.p.x,y:G.p.y};G.p.inv=Math.max(G.p.inv,2.2)}return r};
const _upW=update;update=function(dt){
  const I=G&&!G.paused&&G.wingIn;if(I){const P=G.p;I.t+=dt;if(rand()<0.6)vp(P.x+(rand()-.5)*30,P.y-14-wingLift(I),{vy:20,vx:(rand()-.5)*20,life:0.7,s:2,c:WINGS[G.wing].fx,drag:1});
    if(I.t>=I.dur){G.wingIn=null;sfx('level');shake(0.25);burstP(P.x,P.y,30,['#ffffff',WINGS[G.wing].c,'#e8dcc0'],{spd:110,life:0.6,flat:1});G.fx.push({k:'ultslam',x:P.x,y:P.y,r:50,lv:1,c:['#ffffff',WINGS[G.wing].c,WINGS[G.wing].c],t:0,dur:0.7})}}
  _upW(dt);
  if(I&&G&&G.wingIn){G.p.x=I.x;G.p.y=I.y}};
// bóng đổ nhỏ dần khi đang bay xuống
const _dpW=drawPlayer;drawPlayer=function(){const I=G&&G.wingIn;if(I){const k=Math.min(1,I.t/I.dur);ell(G.p.x,G.p.y,4+k*5,1.5+k*1.5,'#23402a',0.15+k*0.15)}_dpW()};

// ── Bí cảnh Vũ Điện
function vuPick(M){const S=wingSave(),left=WING_ORDER.filter(k=>!S.own[k]);if(!left.length)return false;const L=bcLog(),solved=Object.values(L.pz).reduce((a,b)=>a+b,0);
  if(!Object.keys(S.own).length&&solved>=2)return true;return rand()<0.22}
function vuSetup(){const C=WORLD/2,B=G.bc,S=wingSave();const left=WING_ORDER.filter(k=>!S.own[k]);B.wing=left[(rand()*left.length)|0];B.lamps=[];B.spT=2;
  for(let i=0;i<3;i++){const a=-Math.PI/2+(i-1)*1.3+(i===1?Math.PI:0);B.lamps.push(pzAdd({k:'pz',part:'vulamp',x:C+Math.cos(a)*150,y:C+Math.sin(a)*105,spr:'p_slantern_off',r:5,lit:0,hold:0}))}
  B.altar=pzAdd({k:'pz',part:'vualtar',x:C,y:C-30,spr:'p_altar',r:12});
  announce(i18n('vu.goi','Thắp sáng ba ngọn đèn để giải phong ấn đôi cánh'),'good')}
function vuTick(dt){const B=G.bc;if(B.done)return;let lit=0;
  for(const l of B.lamps){if(l.lit){lit++;continue}if(pzD(l)<26){l.hold+=dt;if(l.hold>1){l.lit=1;l.spr='p_slantern_on';sfx('ignite');burstP(l.x,l.y-24,20,['#fff6c0',WINGS[B.wing].c],{spd:80,life:0.6});pzZap(l.x,l.y-24,B.altar.x,B.altar.y-30,WINGS[B.wing].c)}}else l.hold=Math.max(0,l.hold-dt)}
  B.spT-=dt;if(B.spT<=0&&G.e.length<14){B.spT=2.6;const C=WORLD/2;for(let i=0;i<3;i++){const a=rand()*TAU;spawnEnemy(rollType(),C+Math.cos(a)*220,C+Math.sin(a)*170,{})}}
  if(lit>=3){B.done=1;const k=B.wing,S=wingSave();S.own[k]=1;if(!S.eq)S.eq=k;saveSave();sfx('wing');setTimeout(()=>sfx('relic'),250);for(const e of G.e)if(!e.dead)killE(e);
    G.cine={t:0,dur:2.8,wing:k};sfx('realm');flash('#ffffff',0.6);if(typeof buzz==='function')buzz([60,40,120]);G.kvNew&&G.kvNew.push('wing:'+k)}}
const _doW=drawObs;drawObs=function(o){
  if(o.part==='vulamp'){drawS(o.spr,o.x,o.y+1,{sc:0.6});if(o.lit)glow(o.x,o.y-22,18,'#fff6c0',0.6);if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,16,'#ffffff',2,0.3+o.hold*0.7);ctx.restore()}return}
  if(o.part==='vualtar'){const B=G.bc;drawS('p_altar',o.x,o.y+1,{sc:0.8});if(B&&B.wing&&!B.done){const n=B.lamps.filter(l=>l.lit).length;glow(o.x,o.y-34,26,WINGS[B.wing].c,0.35+n*0.15);drawWing(B.wing,o.x,o.y-36+Math.sin(G.t*2)*2,34,wingAngle(B.wing,G.t,false),1,0.55+n*0.15);
      fxD('fx_c_bang',o.x,o.y-34,46-n*8,{rot:G.t*2,alpha:0.8-n*0.25,add:1,tint:'pink'})}return}
  _doW(o)};
// màn nhận cánh
const _dcW=drawCine;
drawCine=function(c){if(!c.wing){_dcW(c);return}const t=c.t,A=Math.min(1,t/0.25)*(t>2.3?Math.max(0,1-(t-2.3)/0.5):1),W=WINGS[c.wing],cx=VW/2,cy=VH*0.44;
  ctx.globalAlpha=0.6*A;ctx.fillStyle='#120a20';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;glow(cx,cy,90,W.c,0.7*A);
  const k=Math.min(1,t/0.7);drawWing(c.wing,cx,cy,170*(0.6+0.4*(1-(1-k)**3)),wingAngle(c.wing,t,true)*0.6+0.1,1,A);
  if(t>0.5){const q=Math.min(1,(t-0.5)/0.35);ctx.save();ctx.translate(VW/2,VH*0.2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=A*q;
    ctx.font="800 11px 'Baloo 2',sans-serif";ctx.fillStyle='#ffe9a8';ctx.fillText(i18n('canh.moi','— ĐÔI CÁNH —'),0,-16);
    ctx.font="800 20px 'Baloo 2',sans-serif";ctx.lineWidth=4;ctx.strokeStyle='#2a1a4a';ctx.strokeText(W.n,0,4);ctx.fillStyle='#ffffff';ctx.fillText(W.n,0,4);ctx.restore();
    pzPanelAt(i18n('canh.mota','Chỉ để trang trí. Có cánh thì nhân vật bay vào trận. Đổi cánh ở màn chọn nhân vật.'),VH*0.66,A*q)}
  ctx.globalAlpha=1};
// ── màn chọn nhân vật: chọn cánh
function wingIcon(k){const id='wing_'+k;if(ICON[id])return ICON[id];const m=SPR[WINGS[k].spr];if(!m||!ATLAS)return'';const r=m.r,c=mk(r[2]+2,r[3]+2),x=c.getContext('2d');x.drawImage(ATLAS,r[0],r[1],r[2],r[3],1,1,r[2],r[3]);return ICON[id]=c.toDataURL()}
const _selW=buildSelect;
buildSelect=function(){_selW();const box=$('cdInfo');if(!box)return;const S=wingSave(),owned=WING_ORDER.filter(k=>S.own[k]);
  const d=document.createElement('div');d.className='kvbox';d.style.borderColor='#7fd8ff';
  d.innerHTML=`<small>${i18n('canh.tieude','Cánh')} ${owned.length}/${WING_ORDER.length}</small><div class="kvrow">${WING_ORDER.map(k=>`<button data-w="${k}" class="${S.own[k]?'own':''}${S.eq===k?' on':''}">${S.own[k]?`<img src="${wingIcon(k)}" alt="">`:'<b class="q">?</b>'}</button>`).join('')}</div><p>${S.eq&&S.own[S.eq]?'<b>'+WINGS[S.eq].n+'</b>: '+i18n('canh.dangdeo','đang đeo, bay vào trận'):(owned.length?i18n('canh.chon','Chạm để đeo cánh'):i18n('canh.chuaco','Chưa có cánh. Tìm Bí cảnh Vũ Điện sau khi giải cơ quan bí ẩn'))}</p>`;
  d.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.w;if(!S.own[k])return;S.eq=S.eq===k?null:k;saveSave();sfx('gem');buildSelect()});
  box.appendChild(d)};
const _bkW=buildBikip;
buildBikip=function(){_bkW();const L=$('bkList'),S=wingSave();L.appendChild(elx('div','osec',i18nf('bk.canh','Cánh ({0}/{1})',WING_ORDER.filter(k=>S.own[k]).length,WING_ORDER.length)));
  for(const k of WING_ORDER){const ok=S.own[k];L.appendChild(elx('div','bkrow bkkv'+(ok?' seen':''),`${ok?`<img src="${wingIcon(k)}" alt="">`:'<b class="pl">?</b>'}<div class="bke"><b>${ok?WINGS[k].n:'???'}</b><p>${ok?i18n('canh.mota2','Trang trí, bay vào trận'):i18n('bk.canhan','Giải phong ấn trong Bí cảnh Vũ Điện')}</p></div>`))}};

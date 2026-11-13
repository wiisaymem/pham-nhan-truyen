'use strict';
// ───────────────────────── Môi trường sống động: cây đung đưa theo gió, cỏ lay, bóng mây, mặt hồ lấp lánh, và thời tiết đổi trong trận.
// Thuần trang trí, không ảnh hưởng lối chơi. Mức hiệu ứng theo FXQ (0 thấp, 1 vừa, 2 cao).
// Hình vẽ từ Google Flow (tools/art_src/wx_particles.png, wx_critters.png, wx_grass.png → wx_*, g_* trong atlas).

// độ mềm của từng loại cây (0 = đứng yên) và màu lá rơi khi bị chạm
const SWAY={p_peach:1,p_peach2:1.1,p_pine:0.65,p_snowpine:0.55,p_bamboo:1.5,p_maple:0.95,p_deadtree:0.3,p_sapling:1.35,p_bush:0.55};
const LEAFK={p_peach:'fx_petal',p_peach2:'fx_petal',p_pine:'wx_leaf',p_bamboo:'wx_bamboo',p_maple:'wx_maple',p_sapling:'wx_maple',p_bush:'wx_leaf'};
const LEAF={p_peach:'#ffb3cf',p_peach2:'#ff9fc2',p_pine:'#3f8a4a',p_snowpine:'#ffffff',p_bamboo:'#8acb5e',p_maple:'#e8452a',p_sapling:'#ff8a3a',p_bush:'#5aa84a'};
// thời tiết từng bản đồ: [loại, trọng số]
const WX_TABLE={
  daohoa:[['clear',3],['gio',2],['mua',2],['giong',1]],
  vandinh:[['clear',2],['suong',2],['mua',2],['giong',1]],
  banghoa:[['tuyet',3],['bao',1],['clear',1]],
  hoason:[['tro',3],['lua',1],['clear',1]],
};
const WX_NAME={gio:['wx.gio','Gió nổi, hoa đào bay đầy trời'],mua:['wx.mua','Trời đổ mưa'],giong:['wx.giong','Giông tố kéo đến'],suong:['wx.suong','Sương mù giăng kín núi'],bao:['wx.bao','Bão tuyết nổi lên'],lua:['wx.lua','Mưa lửa từ miệng núi'],tro:['wx.tro','Tro bụi phủ trời']};
const WX={t:0,kind:'clear',to:'clear',int:0,next:60,wind:0.3,dir:1,flash:0,bolt:null,boltT:0,thunder:8,rain:[],splash:[],fx:[],lv:[],clouds:[],dt:0};
function wxReset(mapId){Object.assign(WX,{t:0,kind:'clear',to:'clear',int:0,next:45+rand()*30,flash:0,bolt:null,boltT:0,thunder:8,rain:[],splash:[],fx:[],lv:[],clouds:[]});
  const T=WX_TABLE[mapId];if(T&&T[0][0]!=='clear'){WX.kind=WX.to=T[0][0];WX.int=0.55}WX.dir=rand()<0.5?-1:1}
function wxPick(mapId){const T=WX_TABLE[mapId];if(!T)return 'clear';let s=T.reduce((a,b)=>a+b[1],0),r=rand()*s;for(const [k,w] of T){r-=w;if(r<=0)return k}return T[0][0]}
const wxOn=()=>G&&!G.over&&!G.bc&&MAPS[G.mapId];
// cường độ đích của từng loại (đang kiếp thì tắt dần)
const wxTarget=()=>G.kiep||G.kiepFade>0?0:WX.kind==='clear'?0:WX.kind==='tuyet'||WX.kind==='tro'?0.6:1;
function wxUpdate(dt){
  WX.dt=dt;if(!dt)return;WX.t+=dt;
  // gió: nền theo loại thời tiết + cơn gió giật
  const base={clear:0.25,gio:0.95,mua:0.45,giong:0.85,suong:0.12,tuyet:0.35,bao:1,tro:0.3,lua:0.55}[WX.kind]||0.3;
  const gust=Math.max(0,Math.sin(WX.t*0.31)*Math.sin(WX.t*0.13+1.3))*0.6;
  WX.wind+=(base*(0.6+gust)*(0.3+WX.int*0.7)+0.12-WX.wind)*Math.min(1,dt*0.8);
  // đổi thời tiết
  if(WX.kind!==WX.to){WX.int-=dt/4;if(WX.int<=0){WX.int=0;WX.kind=WX.to;if(WX.kind!=='clear'){WX.dir=rand()<0.5?-1:1;const n=WX_NAME[WX.kind];if(n&&typeof toast==='function')toast(i18n(n[0],n[1]))}}}
  else{const tg=wxTarget();WX.int+=Math.sign(tg-WX.int)*Math.min(Math.abs(tg-WX.int),dt/6)}
  WX.next-=dt;if(WX.next<=0){WX.next=70+rand()*60;const k=wxPick(G.mapId);if(k!==WX.kind)WX.to=k}
  // sét
  if(WX.kind==='giong'&&WX.int>0.6){WX.thunder-=dt;if(WX.thunder<=0){WX.thunder=6+rand()*9;wxBolt()}}
  WX.flash=Math.max(0,WX.flash-dt*2.2);WX.boltT=Math.max(0,WX.boltT-dt);
  wxSound();
}
function wxBolt(){WX.flash=0.55;WX.boltT=0.26;WX.bolt={x:VW*(0.15+rand()*0.7),gy:VH*(0.35+rand()*0.4),fork:rand()<0.5,seed:rand()};
  setTimeout(()=>wxThunder(),250+rand()*700)}

// ── cây đung đưa: nghiêng phần thân theo gió, gốc đứng yên; người chơi đi ngang làm cây rung và rụng lá
const _dObsWX=drawObs;
drawObs=function(o){
  const k=SWAY[o.spr];
  if(!k||FXQ===0||!G){_dObsWX(o);return}
  const ph=o.x*0.021+o.y*0.013,t=WX.t,w=WX.wind;
  let s=(Math.sin(t*(1.3+k*0.4)+ph)*0.6+Math.sin(t*2.9+ph*1.7)*0.25)*(0.03+w*0.05)*k+w*0.035*k*WX.dir;
  // rung khi bị chạm (lò xo tắt dần)
  const P=G.p,dt=WX.dt;if(dt){if(o.wa===undefined){o.wa=0;o.wv=0}
    const d=Math.hypot(P.x-o.x,P.y-o.y);if(P.mv&&d<(o.r||5)+9&&!o.hit){o.hit=1;o.wv+=(P.x<o.x?1:-1)*(1.6+k);wxLeaves(o,3)}else if(d>(o.r||5)+14)o.hit=0;
    o.wv+=(-o.wa*70-o.wv*5)*dt;o.wa+=o.wv*dt}
  s+=(o.wa||0)*0.1;
  if(!o.deco&&o.r)ell(o.x,o.y,o.r*1.4,o.r*0.5,'#1f4a2a',0.22);
  const by=o.y+1;ctx.save();ctx.transform(1,0,s,1,-s*by,0);drawS(o.spr,o.x,by,{sc:o.sc||1});ctx.restore();
  // gió mạnh: thỉnh thoảng lá tự rụng
  if(dt&&w>0.55&&LEAF[o.spr]&&rand()<dt*w*0.25)wxLeaves(o,1);
};
function wxLeaves(o,n){const c=LEAF[o.spr];if(!c||WX.lv.length>60)return;const m=SPR[o.spr],h=m?m.wh*(o.sc||1):30;
  const k=LEAFK[o.spr]&&SPR[LEAFK[o.spr]]?LEAFK[o.spr]:null;
  for(let i=0;i<n;i++)WX.lv.push({x:o.x+(rand()-.5)*h*0.7,y:o.y,z:h*(0.45+rand()*0.45),vx:(rand()-.5)*14,vz:-6-rand()*6,p:rand()*TAU,t:0,c,k,sz:k==='fx_petal'?3.6:4.6+rand()*1.2})}

// ── cỏ lay: vẽ bằng code theo mẫu Flow (tools/art_src/wx_grass.png lấy bảng màu và dáng), từng điểm ảnh 1:1 nên nét sạch;
// nghiêng theo gió, rẽ ra khi người chơi đi qua
const GPAL={daohoa:{c:['#2f8a2a','#46ad34','#66cc44','#a6ec72'],f:['#ffb3cf','#ffffff','#ff8fb8']},
  vandinh:{c:['#4f8a3a','#6aa84c','#8cc466','#c8eaa0'],f:['#ffffff','#ffe066']},
  hoason:{c:['#4a2216','#7a3420','#a84e26','#ff9a3a'],f:['#ffd45a'],glow:1},
  banghoa:{c:['#6f9fc0','#9fcfe8','#cdeefa','#ffffff'],f:['#e8fbff']}};
const GT={};
function grassTufts(map){if(GT[map])return GT[map];const P=GPAL[map],out=[];
  for(let v=0;v<6;v++){const R=mulberry32(v*977+map.length*31),W=13,H=12,c=mk(W,H),x=c.getContext('2d'),n=5+((R()*4)|0);
    const blades=[];for(let i=0;i<n;i++)blades.push({x0:W/2+(i-(n-1)/2)*1.35+(R()-.5),h:4+R()*(H-5),l:(i-(n-1)/2)*0.32+(R()-.5)*0.5,back:R()<0.35});
    blades.sort((a,b)=>(b.back?1:0)-(a.back?1:0));
    for(const B of blades){for(let y=0;y<B.h;y++){const k=y/B.h,xx=Math.round(B.x0+B.l*k*k*B.h*0.55),ci=B.back?Math.min(1,(k*2)|0):k<0.3?0:k<0.6?1:k<0.88?2:3;
        x.fillStyle=P.c[ci];x.fillRect(xx,H-1-y,1,1);if(y<2&&!B.back){x.fillStyle=P.c[0];x.fillRect(xx+1,H-1-y,1,1)}}}
    // hoa nhỏ trên ngọn (một số chòm)
    if(P.f&&R()<(map==='hoason'?0.6:0.45)){const B=blades[blades.length-1-((R()*2)|0)],tx=Math.round(B.x0+B.l*B.h*0.55),ty=H-1-Math.ceil(B.h);const fc=P.f[(R()*P.f.length)|0];
      if(P.glow){x.fillStyle=fc;x.fillRect(tx,ty,1,2)}else{x.fillStyle=fc;x.fillRect(tx-1,ty,3,1);x.fillRect(tx,ty-1,1,3);x.fillStyle='#ffe066';x.fillRect(tx,ty,1,1)}}
    out.push(c)}
  return GT[map]=out}
function wxGrass(){const P0=GPAL[G.mapId];if(!P0||FXQ===0||G.bc)return;const T=grassTufts(G.mapId);
  const S=22,x0=Math.floor((camX-8)/S),x1=Math.floor((camX+VW+8)/S),y0=Math.floor(camY/S),y1=Math.floor((camY+VH+12)/S),t=WX.t,w=WX.wind,dens=FXQ===2?0.3:0.18,P=G.p,sd=G.world.seed|0;
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){const h=hash2(i,j,sd);if(h>dens)continue;
    const x=Math.round(i*S+hash2(i,j,7)*S),y=Math.round(j*S+hash2(i,j,11)*S);if(inPond(x,y,6))continue;
    let sh=(Math.sin(t*1.9+x*0.05+y*0.03)*0.09+0.05)*(0.4+w*1.6)*WX.dir;
    const dx=x-P.x,dy=y-P.y,pd=Math.hypot(dx,dy);if(pd<12)sh+=(dx>0?1:-1)*0.4*(1-pd/12);
    const c=T[(hash2(i,j,13)*T.length)|0],fl=hash2(i,j,19)<0.5;
    ctx.save();ctx.transform(fl?-1:1,0,sh,1,fl?2*x-sh*y:-sh*y,0);ctx.drawImage(c,x-c.width/2,y-c.height+1);ctx.restore()}
}

// ── mặt hồ: lấp lánh, gợn mưa, bọt dung nham
function wxPonds(){const W=G.world,MP=MAPS[G.mapId];if(!W||!MP||G.bc)return;const t=WX.t;
  for(const o of W.obs){if(o.k!=='pond'||o.x+o.r<camX||o.x-o.r>camX+VW||o.y+o.r<camY||o.y-o.r>camY+VH)continue;
    const n=FXQ===2?6:3;
    for(let i=0;i<n;i++){const a=hash2(i,o.x|0,3)*TAU,d=o.r*0.75*Math.sqrt(hash2(i,o.y|0,5)),ph=t*(1.5+i*0.3)+i*2.1,v=Math.sin(ph);if(v<0.6)continue;
      const x=o.x+Math.cos(a)*d*1.0,y=o.y+Math.sin(a)*d*0.55;
      if(MP.lava){const f=Math.min(3,((v-0.6)/0.4*4)|0);fxD('wx_lb'+f,x,y,[3,5,6,7][f],{alpha:f===3?0.7:1})}
      else fxD('wx_glint',x,y,2.5+(v-0.6)*6,{alpha:Math.min(1,(v-0.6)*3),add:1})}
    ctx.globalAlpha=1}
}

// ── vật thể bay trên màn hình
const BLOB={};
function blob(col){if(BLOB[col])return BLOB[col];const c=mk(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return BLOB[col]=c}
function wxScreen(dt){
  const MP=MAPS[G.mapId],I=WX.int,K=WX.kind,w=WX.wind*WX.dir,q=[0.35,0.65,1][FXQ];
  // bóng mây trôi trên mặt đất (neo theo thế giới)
  if(FXQ>0&&K!=='bao'){const cl=WX.clouds;while(cl.length<5)cl.push({x:camX+rand()*VW*2-VW*0.5,y:camY+rand()*VH*1.4-VH*0.2,r:90+rand()*80,s:0.6+rand()*0.6});
    const dark=K==='mua'||K==='giong'?0.05:0.12;
    for(const c of cl){c.x+=dt*(8+WX.wind*26)*WX.dir*c.s;const sx=c.x-camX,sy=c.y-camY;
      if(sx<-c.r*2.2||sx>VW+c.r*2.2||sy<-c.r*2||sy>VH+c.r*2){c.x=camX+(WX.dir>0?-c.r*1.5:VW+c.r*1.5);c.y=camY+rand()*VH;continue}
      ctx.globalAlpha=dark;ctx.drawImage(blob(MP.lava?'rgba(40,10,0,1)':'rgba(10,30,40,1)'),sx-c.r*1.4,sy-c.r*0.8,c.r*2.8,c.r*1.6)}
    ctx.globalAlpha=1}
  // lá rụng (thế giới → màn hình)
  for(let i=WX.lv.length-1;i>=0;i--){const l=WX.lv[i];l.t+=dt;l.vz+=dt*(l.z>0?14:0);l.z=Math.max(0,l.z-l.vz*dt-dt*6);l.x+=(l.vx+w*18+Math.sin(l.t*4+l.p)*6)*dt;l.p+=dt*3;
    if(l.z<=0&&l.t>2.2||l.t>6){WX.lv.splice(i,1);continue}
    const sx=l.x-camX,sy=l.y-l.z-camY,al=Math.min(1,(6-l.t)/1.5);
    if(l.k)fxD(l.k,sx,sy,l.sz,{rot:l.p,alpha:al,flip:Math.sin(l.p*0.7)<0});else{ctx.globalAlpha=al;ctx.fillStyle=l.c;ctx.save();ctx.translate(sx,sy);ctx.rotate(l.p);ctx.fillRect(-1.4,-0.7,2.8,1.4);ctx.restore()}}
  ctx.globalAlpha=1;
  if(I<=0.01&&WX.flash<=0)return;
  // màu trời
  const tint={mua:'rgba(30,45,80,0.16)',giong:'rgba(16,22,50,0.3)',suong:'rgba(235,240,245,0.12)',bao:'rgba(230,242,255,0.22)',tro:'rgba(70,50,40,0.12)',lua:'rgba(120,30,0,0.14)',gio:'rgba(255,220,235,0.05)',tuyet:'rgba(230,242,255,0.06)'}[K];
  if(tint){ctx.globalAlpha=I;ctx.fillStyle=tint;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  // mưa
  if(K==='mua'||K==='giong'){const R=WX.rain,n=Math.round((K==='giong'?240:150)*q*I);while(R.length<n)R.push({x:rand()*VW*1.3-VW*0.15,y:rand()*VH,v:260+rand()*120,l:9+rand()*7});if(R.length>n)R.length=n;
    const sl=w*0.55+0.1*WX.dir;ctx.strokeStyle='#e2efff';ctx.lineWidth=1;ctx.globalAlpha=0.62;ctx.beginPath();
    for(const r of R){r.y+=r.v*dt;r.x+=r.v*sl*dt;if(r.y>VH){if(rand()<0.35&&WX.splash.length<40)WX.splash.push({x:r.x,y:VH*0.2+rand()*VH*0.8,t:0});r.y=-r.l-rand()*20;r.x=rand()*VW*1.3-VW*0.15}
      ctx.moveTo(r.x,r.y);ctx.lineTo(r.x-sl*r.l,r.y-r.l)}
    ctx.stroke();ctx.globalAlpha=1;
    // giọt bắn trên mặt đất
    for(let i=WX.splash.length-1;i>=0;i--){const s=WX.splash[i];s.t+=dt;if(s.t>0.35){WX.splash.splice(i,1);continue}const f=Math.min(2,(s.t/0.35*3)|0);fxD('wx_sp'+(f+1),s.x,s.y,[4,6.5,7.5][f],{alpha:f===2?0.55:0.8})}
    ctx.globalAlpha=1}
  // sương mù: những mảng trắng trôi chậm
  if(K==='suong'||K==='bao'){const F=WX.fx;while(F.length<(K==='bao'?7:6))F.push({x:rand()*VW*1.6-VW*0.3,y:rand()*VH,r:70+rand()*60,s:0.5+rand()});
    for(const f of F){f.x+=dt*(K==='bao'?60:9)*WX.dir*f.s;if(f.x>VW+f.r*1.5)f.x=-f.r*1.5;if(f.x<-f.r*1.5)f.x=VW+f.r*1.5;if(K==='bao'){ctx.globalAlpha=0.22*I;ctx.drawImage(blob('rgba(255,255,255,1)'),f.x-f.r*1.5,f.y-f.r*0.7,f.r*3,f.r*1.4)}else{ctx.globalAlpha=0.26*I;ctx.drawImage(blob('rgba(255,255,255,1)'),f.x-f.r*1.5,f.y-f.r*0.7,f.r*3,f.r*1.4);fxD(f.s>1?'wx_mist':'wx_puff',f.x+f.r*0.3,f.y+f.r*0.2,f.s>1?56:34,{alpha:0.3*I,flip:WX.dir<0})}}
    ctx.globalAlpha=1}
  // bão tuyết: bông tuyết bay ngang
  if(K==='bao'){const R=WX.rain,n=Math.round(140*q*I);while(R.length<n)R.push({x:rand()*VW,y:rand()*VH,v:30+rand()*60,s:0.6+rand()*1.2,p:rand()*TAU});if(R.length>n)R.length=n;
    ctx.fillStyle='#ffffff';ctx.globalAlpha=0.85;for(const r of R){r.x+=(140+r.v)*WX.dir*dt;r.y+=(30+r.v*0.5+Math.sin(WX.t*3+r.p)*20)*dt;if(r.x>VW+4)r.x=-4;if(r.x<-4)r.x=VW+4;if(r.y>VH+4)r.y=-4;ctx.fillRect(r.x,r.y,r.s+0.4,r.s+0.4)}
    ctx.globalAlpha=1;const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.25,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,`rgba(235,245,255,${0.45*I})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  // tro bụi và mưa lửa
  if(K==='tro'||K==='lua'){const R=WX.rain,n=Math.round((K==='lua'?70:55)*q*I);while(R.length<n)R.push({x:rand()*VW,y:rand()*VH,v:8+rand()*16,s:0.6+rand()*1,p:rand()*TAU,e:rand()<(K==='lua'?0.55:0.2)});if(R.length>n)R.length=n;
    for(const r of R){r.p+=dt*2;if(r.e){r.y-=(r.v*1.6)*dt;r.x+=(Math.sin(r.p)*10+w*20)*dt;if(r.y<-4){r.y=VH+4;r.x=rand()*VW}
        const f=0.55+Math.sin(r.p*3)*0.35;fxD('wx_ember',r.x,r.y,2.5+r.s*2,{alpha:f,add:1,rot:r.p*0.3})}
      else{r.y+=r.v*dt;r.x+=(Math.sin(r.p)*6+w*22)*dt;if(r.y>VH+4){r.y=-4;r.x=rand()*VW}if(r.x>VW+4)r.x=-4;if(r.x<-4)r.x=VW+4;fxD('wx_ash',r.x,r.y,2.2+r.s*1.8,{alpha:0.8,rot:r.p})}}
    ctx.globalAlpha=1;
    if(K==='lua'){const g=ctx.createLinearGradient(0,0,0,VH*0.5);g.addColorStop(0,`rgba(255,80,20,${0.18*I})`);g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH*0.5)}}
  // tia chớp
  if(WX.boltT>0&&WX.bolt){const B=WX.bolt,al=Math.min(1,WX.boltT*6),m=SPR.wx_bolt1;
    if(m){const sc=1.7,h=m.wh*sc;let y=B.gy,i=0;while(y>-h*0.3){fxD('wx_bolt1',B.x,y-h/2,h,{alpha:al,flip:i%2===1,add:1});y-=h*0.92;i++}
      if(B.fork)fxD('wx_bolt2',B.x+(B.seed<0.5?-14:14),B.gy-h*1.5,h*0.9,{alpha:al*0.8,add:1,flip:B.seed<0.5})}
    glow(B.x,B.gy,34,'#cfe0ff',al*0.9);fxD('wx_glint',B.x,B.gy,14,{alpha:al,add:1})}
  if(WX.flash>0){ctx.globalAlpha=WX.flash*0.6;ctx.fillStyle='#eef4ff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
}

// gió làm cánh hoa, bông tuyết bay theo hướng gió; gió mạnh thì nhiều hơn
drawAmbient=function(dt){
  const MP=MAPS[G.mapId];if(!MP)return;if(G.paused)dt=0;
  const more=WX.kind==='gio'?3.5:WX.kind==='tuyet'?1.6:1,pn=Math.round((MP.ice?40:26)*[0.35,0.7,1][FXQ]*(1+(more-1)*WX.int));if(PET.length>pn)PET.length=pn;
  while(PET.length<pn)PET.push({x:rand()*VW,y:rand()*VH,s:0.6+rand()*0.8,p:rand()*TAU});
  const wv=WX.wind*WX.dir*70;ctx.fillStyle=MP.petal;
  for(const p of PET){p.y+=dt*(10+p.s*8);p.x+=dt*(Math.sin(G.t+p.p)*8+wv*(0.6+p.s*0.5));p.p+=dt*(1+WX.wind*2);if(p.y>VH+4){p.y=-4;p.x=rand()*VW}if(p.x>VW+4)p.x=-4;if(p.x<-4)p.x=VW+4;
    ctx.globalAlpha=0.75;if(MP.ice)ctx.fillRect(p.x,p.y,1.2*p.s+0.4,1.2*p.s+0.4);else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.p*2);ctx.fillRect(-1.2*p.s,-0.6,2.4*p.s,1.2);ctx.restore()}}
  ctx.globalAlpha=1;
};


// ── sinh vật nền (Flow): bướm bay quanh, cá chép nhảy khỏi hồ, hạc bay ngang trời, đom đóm trong sương
const CR={bf:[],koi:null,koiT:5,crane:[],craneT:12,fly:[]};
const calm=()=>!G.kiep&&!G.boss&&(WX.kind==='clear'||WX.kind==='gio'||WX.int<0.3);
function wxCritWorld(){if(FXQ===0||G.bc)return;const MP=MAPS[G.mapId],dt=WX.dt,P=G.p,t=WX.t,green=G.mapId==='daohoa'||G.mapId==='vandinh';
  // bướm
  const nb=green&&calm()?(FXQ===2?5:3):0;while(CR.bf.length<nb){const a=rand()*TAU,d=140+rand()*60;CR.bf.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d*0.8,tx:0,ty:0,rt:0,c:rand()<0.55?'wx_bf':'wx_bb',ph:rand()*9,out:0})}
  for(let i=CR.bf.length-1;i>=0;i--){const b=CR.bf[i];
    if(i>=nb)b.out=1;
    if(dt){b.rt-=dt;if(b.rt<=0){b.rt=1.5+rand()*2.5;const a=rand()*TAU,d=b.out?400:30+rand()*110;b.tx=P.x+Math.cos(a)*d;b.ty=P.y+Math.sin(a)*d*0.8}
      const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy)||1,v=b.out?60:22;b.x+=(dx/d*v+Math.sin(t*3+b.ph)*14+WX.wind*WX.dir*16)*dt;b.y+=(dy/d*v+Math.cos(t*2.3+b.ph)*10)*dt}
    const far=Math.hypot(b.x-P.x,b.y-P.y);if(far>320||far>200&&b.out){CR.bf.splice(i,1);continue}
    const z=10+Math.sin(t*2+b.ph)*3,open=((t*9+b.ph)|0)%2===0;
    ell(b.x,b.y,2.2,0.8,'#1f4a2a',0.18);drawS(b.c+(open?'0':'1'),b.x,b.y-z,{flip:b.tx<b.x})}
  // cá chép nhảy khỏi hồ
  if(green&&!MP.lava&&!MP.ice){if(!CR.koi&&dt){CR.koiT-=dt;if(CR.koiT<=0){CR.koiT=5+rand()*8;
      const L=G.world.obs.filter(o=>o.k==='pond'&&o.x>camX+10&&o.x<camX+VW-10&&o.y>camY+20&&o.y<camY+VH-10);
      if(L.length){const o=L[(rand()*L.length)|0],a=rand()*TAU,d=o.r*0.35,dir=rand()<0.5?-1:1;CR.koi={x:o.x+Math.cos(a)*d,y:o.y+Math.sin(a)*d*0.5,dir,t:0}}}}
    const k=CR.koi;if(k){k.t+=dt;const T=1.1,u=k.t/T;
      if(u<1){const x=k.x+k.dir*(u-0.5)*16,z=Math.sin(u*Math.PI)*14,f=u<0.38?0:u<0.62?1:2;fxD('wx_sp3',k.x+k.dir*-8,k.y,6,{alpha:Math.max(0,1-u*3)*0.7});drawS('wx_koi'+f,x,k.y-z,{flip:k.dir<0})}
      else if(u<1.5){const v=(u-1)/0.5;fxD('wx_koisp',k.x+k.dir*8,k.y-1,5,{alpha:1-v});fxD('wx_sp3',k.x+k.dir*8,k.y,4+v*5,{alpha:(1-v)*0.6})}
      else CR.koi=null}}
  // đom đóm: sương mù hoặc trời âm u
  const nf=(WX.kind==='suong'||WX.kind==='mua')&&WX.int>0.3&&green?(FXQ===2?14:8):0;while(CR.fly.length<nf)CR.fly.push({x:P.x+(rand()-.5)*VW,y:P.y+(rand()-.5)*VH*0.8,ph:rand()*9});if(CR.fly.length>nf)CR.fly.length=nf;
  for(const f of CR.fly){if(dt){f.x+=Math.sin(t*0.7+f.ph)*8*dt;f.y+=Math.cos(t*0.9+f.ph*1.3)*6*dt;if(Math.abs(f.x-P.x)>VW*0.6)f.x=P.x-(f.x-P.x)*0.9;if(Math.abs(f.y-P.y)>VH*0.55)f.y=P.y-(f.y-P.y)*0.9}
    const a=Math.max(0,Math.sin(t*2.2+f.ph));if(a<0.05)continue;glow(f.x,f.y-6,5,'#d8ff6a',a*0.55*WX.int);drawS('wx_fly',f.x,f.y-6,{alpha:a})}
}
function wxCritScreen(dt){if(FXQ===0||G.bc)return;const green=G.mapId==='daohoa'||G.mapId==='vandinh'||G.mapId==='banghoa';
  if(green&&calm()&&dt){CR.craneT-=dt;if(CR.craneT<=0){CR.craneT=22+rand()*30;const x=VW*(0.2+rand()*0.6),n=2+((rand()*2)|0);
    for(let i=0;i<n;i++)CR.crane.push({x:x+(i%2?1:-1)*Math.ceil(i/2)*20,y:VH+30+Math.ceil(i/2)*22,dir:rand()<0.5?1:-1,ph:rand()*4,v:38+rand()*5})}}
  for(let i=CR.crane.length-1;i>=0;i--){const c=CR.crane[i];c.y-=c.v*dt;c.x+=(Math.sin(WX.t*0.8+c.ph)*4+WX.wind*WX.dir*8)*dt;if(c.y<-60){CR.crane.splice(i,1);continue}
    const f=((WX.t*5+c.ph)|0)%4;
    ctx.globalAlpha=0.14;ctx.fillStyle='#10202a';ctx.beginPath();ctx.ellipse(c.x+10,c.y+44,7,2.6,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
    fxD('wx_crane'+f,c.x,c.y,22)}
}

// ── móc vào vòng vẽ
const _muWX=mapUnder;mapUnder=function(){_muWX();if(!G||!MAPS[G.mapId])return;try{wxPonds();wxGrass()}catch(e){}};
const _msWX=mapScreen;mapScreen=function(dt){_msWX(dt);if(!G||!MAPS[G.mapId])return;try{if(!G.over)wxUpdate(dt);if(!G.bc){wxCritScreen(G.paused?0:dt);wxScreen(dt)}}catch(e){}};
const _moWX=mapOver;mapOver=function(){_moWX();if(!G||!MAPS[G.mapId])return;try{wxCritWorld()}catch(e){}};
const _nrWX=newRun;newRun=function(...a){const r=_nrWX(...a);try{if(G){wxReset(G.mapId);CR.bf=[];CR.koi=null;CR.crane=[];CR.fly=[]}}catch(e){}return r};

// ── âm thanh: mưa rào, gió bão (tiếng ồn lọc), sấm
let wxNoise=null,wxRainG=null,wxWindG=null;
function wxNoiseBuf(){const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;l=(l+0.02*w)/1.02;d[i]=w*0.6+l*3}return b}
function wxSound(){
  if(!AC||!sfxBus)return;const on=wxOn()&&!G.paused&&SAVE.opt.sfx;
  const rain=on&&(WX.kind==='mua'||WX.kind==='giong')?WX.int*(WX.kind==='giong'?0.32:0.22):0;
  const wind=on&&(WX.kind==='bao'||WX.kind==='gio'||WX.kind==='giong')?WX.int*Math.min(1,WX.wind)*0.22:0;
  if(!wxNoise&&(rain>0||wind>0)){try{const buf=wxNoiseBuf();
      const mkLoop=(type,f,Q)=>{const s=AC.createBufferSource();s.buffer=buf;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=Q;const g=AC.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(sfxBus);s.start(0,Math.random()*1.5);return g};
      wxRainG=mkLoop('highpass',900,0.5);wxWindG=mkLoop('lowpass',380,1.2);wxNoise=1}catch(e){wxNoise=-1}}
  if(wxNoise===1){const t=AC.currentTime;wxRainG.gain.setTargetAtTime(rain,t,0.4);wxWindG.gain.setTargetAtTime(wind*(0.7+Math.sin(WX.t*0.9)*0.3),t,0.3)}
}
function wxThunder(){if(!AC||!sfxBus||!wxOn()||!SAVE.opt.sfx)return;try{const n=AC.sampleRate*2.5,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;
  for(let i=0;i<n;i++){l=(l+0.04*(Math.random()*2-1))/1.04;const k=i/n;d[i]=l*6*Math.pow(1-k,2)*(k<0.04?k/0.04:1)*(1+0.5*Math.sin(i/900))}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=260;g.gain.value=0.9;s.connect(f);f.connect(g);g.connect(sfxBus);s.start()}catch(e){}}
setInterval(()=>{try{if(!G||G.over||G.paused)wxSound()}catch(e){}},400);

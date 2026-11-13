'use strict';
// ───────────────────────── Thiên Kiếp dùng hình Google Flow (tools/art_src/kiep_fx.png → kf_*, kiep_banner.png → assets/ban_*.png, tok_*.png)
// lôi trận báo trước, cột lôi tụ, sét giáng, hố cháy, hào quang Tâm Ma, cột sáng phi thăng, bảng thông báo, ấn lôi đếm đợt.

// vẽ một ảnh trong atlas kéo giãn theo khung (x,y là tâm đáy)
function kfStretch(k,x,yBot,w,h,a,add){const m=SPR[k];if(!m||!ATLAS||h<=1)return;const r=m.r;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,a));if(add)ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;
  ctx.drawImage(ATLAS,r[0],r[1],r[2],r[3],x-w/2,yBot-h,w,h);ctx.restore()}

// ── lôi trận trên mặt đất: ấn phù nạp dần 4 khung, cột lôi từ trời rót xuống
function kfWarn(s,A){const k=Math.min(1,s.t/s.dur),R=s.r,f=k<0.35?0:k<0.62?1:k<0.86?2:3,W=R*2.5;
  fxD('kf_sig'+f,s.x,s.y,W,{alpha:(0.8+0.2*k)*A});
  // vòng trong lớn dần cho biết còn bao lâu
  fxD('kf_sig1',s.x,s.y,W*k,{alpha:0.55*k*A,add:1});
  if(f===3&&((G.t*20)|0)%2)fxD('kf_sig3',s.x,s.y,W*1.06,{alpha:0.5*A,add:1});
  if(k>0.4){const kk=(k-0.4)/0.6,top=camY-20;kfStretch('kf_beam',s.x,s.y+R*0.25,6+kk*16,s.y+R*0.25-top,(0.25+kk*0.55)*A,1);glow(s.x,s.y,R*0.5*kk+6,'#c9b0ff',kk*A)}}
const _dwKA=drawWarn;
drawWarn=function(s){if(!SPR.kf_sig0)return _dwKA(s);kfWarn(s,1);
  if(rand()<0.4){const an=rand()*TAU,d=s.r*(0.8+rand()*0.4),sx=s.x+Math.cos(an)*d,sy=s.y+Math.sin(an)*d*0.6;vp(sx,sy,{vx:(s.x-sx)*3,vy:(s.y-sy)*3-10,life:0.3,s:1.3,c:rand()<0.5?'#ffb8f0':'#e6dcff',drag:0})}};
// lớp trời tối vẽ lại vòng báo cho rõ: dùng cùng hình
function kiepWarnTop(st,A){if(!SPR.kf_sig0)return false;const k=Math.min(1,st.t/st.dur);fxD('kf_sig'+(k<0.35?0:k<0.62?1:k<0.86?2:3),st.x,st.y,st.r*2.5,{alpha:0.55*A,add:1});return true}

// ── sét giáng, hố cháy, cột sáng phi thăng
const _foKA=drawFxOver;
drawFxOver=function(f){const k=f.t/f.dur;
  if(f.k==='strike'&&!f.gold&&SPR.kf_hit0){
    emitOnce(f,()=>{burstP(f.x,f.y,22,PAL.loi,{spd:120,life:0.45,s:2,flat:1});for(let i=0;i<6;i++)vp(f.x+(rand()-.5)*f.r,f.y,{vx:(rand()-.5)*30,vy:-10-rand()*20,life:0.8,s:4,c:'#a0a0b0',k:1,add:0})});
    if(k<0.45){const a=1-k/0.45,top=camY-20,b='ks_b'+(((f.x*13)|0)%4);if(SPR[b])kfStretch(b,f.x,f.y+2,f.r*1.3,f.y+2-top,a,1);kfStretch('kf_beam',f.x,f.y+4,f.r*0.9*(1-k),f.y-top,a*0.6,1);glow(f.x,f.y,f.r*1.8,'#b39bff',a*0.8)}
    fxD('kf_hit'+Math.min(3,(k*4)|0),f.x,f.y-4,f.r*(2.2+k*1.2),{alpha:k>0.75?(1-k)*4:1,add:k<0.5?1:0});return}
  if(f.k==='pillar'&&SPR.kf_gold){const a=Math.sin(Math.min(1,k*1.2)*Math.PI),w=34*(1-k*0.4);
    emitOnce(f,()=>{for(let i=0;i<60;i++)vp(f.x+(rand()-.5)*40,f.y-rand()*20,{vy:-80-rand()*120,vx:(rand()-.5)*20,life:1+rand()*0.8,s:1.8,c:rand()<0.5?f.c:'#ffffff',drag:0.5})});
    kfStretch('kf_gold',f.x,f.y+4,w,f.y+4-camY+20,a*0.9,1);glow(f.x,f.y-10,40,'#fff1a0',a*0.7);fxD('ks_gold',f.x,f.y-4,60,{alpha:a*0.8,sq:0.5});return}
  _foKA(f)};
const _fuKA=drawFxUnder;
drawFxUnder=function(f){
  if(f.k==='scorch'&&SPR.kf_cr0){const a=Math.min(1,(f.dur-f.t)/1.5),hot=Math.max(0,1-f.t/1.2);
    fxD((f.sd|0)%2?'kf_cr0':'kf_cr1',f.x,f.y,f.r*((f.sd|0)%2?2.3:1.9),{alpha:a*0.9});if(hot>0)fxD('kf_cr0',f.x,f.y,f.r*2.3,{alpha:hot*0.6,add:1});
    if(f.t<1.5&&rand()<0.3)vp(f.x+(rand()-.5)*f.r,f.y,{vy:-12,vx:(rand()-.5)*4,life:0.9,s:2.2,c:'#8a7a9a',k:1,add:0,a:0.4,drag:1});
    if(f.t<0.8&&rand()<0.4)vp(f.x+(rand()-.5)*f.r,f.y,{vy:-30,life:0.4,s:1.2,c:'#e6dcff'});return}
  _fuKA(f)};

// ── Tâm Ma: lửa ma tím đen bốc quanh chân
const _deKA=drawEnemy;
drawEnemy=function(e){if(e.t==='tamma'&&!e.dead&&SPR.kf_aura0){const f=((G.t*9)|0)%4;glow(e.x,e.y-12,22,'#7a2ad0',0.45);drawS('kf_aura'+f,e.x,e.y+4,{sc:1.25,alpha:0.95})}
  _deKA(e);
  if(e.t==='tamma'&&!e.dead&&SPR.kf_aura0)drawS('kf_aura'+(((G.t*9)|0)+2)%4,e.x,e.y+5,{sc:1.05,alpha:0.45})};

// ── bảng thông báo Thiên Kiếp: khung Flow theo loại (lôi kiếp tím, Tâm Ma đỏ, phi thăng vàng)
const _annKA=announce;
announce=function(t,k){if(G&&G.kiep&&!G.tower){if(k==='kiep')k='kiep';else if(k==='boss')k='kiepma';else if(k==='realm')k='kiepwin'}_annKA(t,k)};
(function(){const st=document.createElement('style');st.textContent=`
#ann.kiep,#ann.kiepma,#ann.kiepwin{left:50%;right:auto;width:min(94vw,440px);transform:translate(-50%,0) scale(.85);aspect-ratio:226/60;display:flex;align-items:center;justify-content:center;padding:0 min(13vw,62px);box-sizing:border-box;
  background:url(assets/ban_kiep.png) center/100% 100% no-repeat;image-rendering:pixelated;font-size:clamp(18px,5.6vw,26px);color:#efe2ff;text-shadow:0 0 6px #9b6bff,2px 2px 0 #1a0838,-2px -2px 0 #1a0838,2px -2px 0 #1a0838,-2px 2px 0 #1a0838;letter-spacing:.5px}
#ann.kiep.show,#ann.kiepma.show,#ann.kiepwin.show{transform:translate(-50%,0) scale(1);animation:kaShake .45s steps(6) 1}
#ann.kiepma{aspect-ratio:214/77;background-image:url(assets/ban_ma.png);color:#ffd8e4;text-shadow:0 0 6px #ff3d7a,2px 2px 0 #2a0610,-2px -2px 0 #2a0610,2px -2px 0 #2a0610,-2px 2px 0 #2a0610}
#ann.kiepwin{aspect-ratio:227/55;background-image:url(assets/ban_vang.png);color:#fff8d8;font-size:clamp(18px,5.4vw,25px);text-shadow:0 0 8px #ffd45a,2px 2px 0 #6a3a08,-2px -2px 0 #6a3a08,2px -2px 0 #6a3a08,-2px 2px 0 #6a3a08}
@keyframes kaShake{0%{filter:brightness(2.2)}30%{margin-left:-3px}50%{margin-left:3px;filter:brightness(1.4)}70%{margin-left:-2px}100%{margin-left:0;filter:none}}
#kiepPips{position:absolute;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 98px);display:flex;gap:2px;pointer-events:none;z-index:5}
#kiepPips i{width:18px;height:18px;background:url(assets/tok_off.png) center/contain no-repeat;image-rendering:pixelated;opacity:.85}
#kiepPips i.on{background-image:url(assets/tok_on.png);opacity:1}
#kiepPips i.now{animation:kaPip .8s steps(4) infinite}
@keyframes kaPip{50%{filter:brightness(1.8) drop-shadow(0 0 4px #b98bff)}}`;document.head.appendChild(st)})();
// ── 9 ấn lôi dưới đồng hồ: sáng dần theo đợt
let kpLast=-1;
function kiepPips(){let el=$('kiepPips');const on=G&&G.kiep&&!G.over;
  if(!on){if(el&&!el.hidden){el.hidden=true;kpLast=-1}return}
  if(!el){el=document.createElement('div');el.id='kiepPips';for(let i=0;i<9;i++)el.appendChild(document.createElement('i'));($('hud')||document.body).appendChild(el)}
  el.hidden=false;const w=G.kiep.wave;if(w===kpLast)return;kpLast=w;[...el.children].forEach((c,i)=>{c.className=i<w?(i===w-1?'on now':'on'):''})}
const _hudKA=hud;hud=function(dt){_hudKA(dt);try{kiepPips()}catch(e){}};

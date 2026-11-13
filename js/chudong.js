'use strict';
// ───────────────────────── Chiêu chủ động ở chế độ cũ (10/11/2026, Kent duyệt mục A6 + A4 của kế hoạch)
// Thân pháp: lướt né theo hướng đang chạy, bất tử trong lúc lướt, chém/đẩy yêu quái trên đường. Phím Shift hoặc K.
// Tuyệt kỹ: mỗi tu sĩ một chiêu bấm tay, tự ngắm yêu quái gần nhất (không có thì theo hướng mặt). Phím J hoặc E.
// Khựng hình: thế giới đứng lại một nhịp khi hạ tinh anh, thủ lĩnh hoặc khi tuyệt kỹ trúng.
// Tắt cả cụm: mở game với ?cd=0 (nhớ trong máy), bật lại ?cd=1.
const CHUDONG=(()=>{try{const q=new URLSearchParams(location.search).get('cd');if(q!==null)localStorage.setItem('vktt_cd',q==='1'?'1':'0');return localStorage.getItem('vktt_cd')!=='0'}catch(e){return true}})();
const TP_D={len:92,dur:0.17,cd:2.6,n:1,dmg:0.6,kb:70};
const TP={lamphong:{dmg:1.5,slash:1},linhnhi:{heal:0.03},hanbang:{slow:2.5},loichan:{dmg:1.2,kb:190,quake:1},modung:{len:125,dur:0.07,boom:1},bachho:{n:2,cd:2.2}};
const TK={
  lamphong:{n:()=>i18n('cd.tk.lp','Kiếm Khí Trảm'),ic:'kiemkhi',cd:9,c:'#ffe9a0'},
  linhnhi:{n:()=>i18n('cd.tk.ln','Vạn Đằng Phược'),ic:'vine',cd:11,c:'#8dff9a'},
  hanbang:{n:()=>i18n('cd.tk.hb','Băng Phong Vạn Lý'),ic:'ice',cd:10,c:'#bfe8ff'},
  loichan:{n:()=>i18n('cd.tk.lc','Kim Chung Chấn'),ic:'bell',cd:11,c:'#ffd45a'},
  modung:{n:()=>i18n('cd.tk.md','Bạo Viêm Phù'),ic:'talisman',cd:9,c:'#ff9a4a'},
  bachho:{n:()=>i18n('cd.tk.bh','Hồ Ảnh Liên Trảm'),ic:'hohoa',cd:10,c:'#d9c8ff'}};
function cdHS(v){if(!G||G.t-(G.hsT??-9)<0.3)return;G.hs=Math.max(G.hs||0,v);G.hsT=G.t}
if(CHUDONG){
  const tpOf=()=>{const T=Object.assign({},TP_D,TP[G.ch]||{});T.len*=1+BM('tpLen');T.dmg*=1+BM('tpDmg');return T},tkOf=()=>TK[G.ch]||TK.lamphong;
  const elOf=()=>WEAP[CHARS[G.ch].w].el;
  const B=()=>(22*(1+G.realm*0.6)+G.lv*0.8)*(G.hd?G.hd.pow:1);
  const BM=k=>typeof bm==='function'?bm(k):0,EMIT=(ev,c)=>{if(typeof bmEmit==='function')bmEmit(ev,c)};   // Bản Mệnh Đồ (js/tranan/banmenh.js)
  const ok=()=>G&&!G.over&&!G.paused&&G.p&&!G.p.dead&&!G.bt&&!G.ult&&!G.cine&&G.cdx;
  const fx=(o)=>{o.cd=1;o.t=0;G.fx.push(o);return o};
  const later=(t,f)=>G.later.push({t,f});
  const dirOf=a=>{const x=Math.cos(a),y=Math.sin(a);return Math.abs(x)>Math.abs(y)*0.9?(x>0?'R':'L'):(y>0?'D':'U')};
  function hitC(x,y,r,dmg,o,fn){const s=G.src;G.src='tuyetky';let n=0;dmg*=1+BM('tkDmg');forNear(x,y,r+24,e=>{if(Math.hypot(e.x-x,e.y-y)<r+e.r){n++;hurtE(e,dmg,elOf(),o);if(fn&&!e.dead)fn(e)}});G.src=s;return n}
  const ghost=(c,a=0.5)=>{const P=G.p;fx({x:P.x,y:P.y,dir:P.dir,dur:0.26,o(f){drawPlayerSprite(f.x,f.y,f.dir,2,{tint:c,ta:0.8,alpha:a*(1-f.t/f.dur)})}})};
  // ── vào trận
  const _newRunCD=newRun;
  newRun=function(a,b,c,d){_newRunCD(a,b,c,d);const T=tpOf(),n=T.n+(BM('tpN')|0);G.cdx={tp:{n,max:n,t:0,cd:T.cd*(1-BM('tpCd'))},tk:{t:2,cd:tkOf().cd*(1-BM('tkCd'))}};G.cdo=[];G.hs=0};
  // ── khựng hình
  const _updCD=update;
  update=function(dt){if(G&&!G.paused&&!G.over&&G.hs>0){G.hs-=dt;dt*=0.04}_updCD(dt)};
  const _killCD=killE;
  killE=function(e){const was=e.dead;_killCD(e);if(!was&&e.dead)EMIT('kill',{e,src:G.src});if(!was&&e.dead&&(e.elite||e.d.boss)){cdHS(e.d.boss?0.22:0.09);if(!e.d.boss)shake(0.25)}};
  // ── Thân pháp
  function cdDash(){
    if(!ok())return false;const P=G.p,C=G.cdx.tp;if(P.dash||C.n<=0)return false;const T=tpOf();
    let dx=INPUT.x,dy=INPUT.y;if(!isFinite(dx)||!isFinite(dy)||Math.hypot(dx,dy)<0.15){dx=P.fx||0;dy=P.fy||0}
    if(!dx&&!dy){dx=P.dir==='L'?-1:P.dir==='R'?1:0;dy=P.dir==='U'?-1:P.dir==='D'?1:0}
    const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;
    C.n--;if(C.t<=0)C.t=C.cd;
    P.dash={t:0,dur:T.dur,dx,dy,spd:T.len/T.dur,hit:new Set(),g:0,x0:P.x,y0:P.y,T};P.inv=Math.max(P.inv,T.dur+0.2);P.act=null;
    sfx('dash');if(typeof buzz==='function')buzz(12);EMIT('dash',{dx,dy});
    if(T.heal){const h=Math.ceil(P.mhp*T.heal);P.hp=Math.min(P.mhp,P.hp+h);G.nums.push({x:P.x,y:P.y-30,v:'+'+h,t:0,c:'#6dff8a'});
      fx({x:P.x,y:P.y,dur:0.9,u(f){const k=f.t/f.dur;fxD('fx_lotus',f.x,f.y,26+k*14,{alpha:1-k*k,sq:0.6})}})}
    if(T.boom){const x=P.x,y=P.y;fx({x,y,dur:0.45,o(f){fxD('fx_tali',f.x,f.y-6,22,{rot:-0.3,alpha:1})}});
      later(0.45,()=>{hitC(x,y,46,B()*1.2,{kb:60,kx:x,ky:y});boom(x,y,90);sfx('no')})}
    return true;
  }
  function boom(x,y,size){fx({x,y,dur:0.34,o(f){const k=f.t/f.dur;glow(f.x,f.y,size*0.45,'#ffb347',0.6*(1-k));fxD('fx_ex'+Math.min(3,(k*4)|0),f.x,f.y-4,size,{add:1,alpha:1-k*0.4})}});
    burstP(x,y,10,['#fff3c0','#ffb347','#ff5a2a'],{spd:110,life:0.4,s:2})}
  function dashStep(dt){
    const P=G.p,D=P.dash,T=D.T,tc=tkOf().c;D.t+=dt;
    P.x=clamp(P.x+D.dx*D.spd*dt,12,WORLD-12);P.y=clamp(P.y+D.dy*D.spd*dt,12,WORLD-12);collideObs(P,P.r);
    P.mv=true;P.anim=2;P.fx=D.dx;P.fy=D.dy;P.dir=Math.abs(D.dx)>Math.abs(D.dy)*0.9?(D.dx>0?'R':'L'):(D.dy>0?'D':'U');
    D.g-=dt;if(D.g<=0){D.g=0.028;ghost(tc)}
    const s=G.src;G.src='thanphap';
    forNear(P.x,P.y,30,e=>{if(D.hit.has(e)||Math.hypot(e.x-P.x,e.y-P.y)>15+e.r)return;D.hit.add(e);hurtE(e,B()*T.dmg,elOf(),{kb:T.kb});if(T.slow)e.slowT=Math.max(e.slowT,T.slow);
      if(T.slash)fx({x:e.x,y:e.y-e.r,a:Math.atan2(D.dy,D.dx),dur:0.2,o(f){fxD('fx_sl'+Math.min(3,(f.t/f.dur*4)|0),f.x,f.y,34,{rot:f.a,add:1})}})});
    G.src=s;
    if(T.slow&&FXQ>0)vp(P.x,P.y-2,{vx:(rand()-.5)*20,vy:-10,life:0.5,c:'#cfefff',s:1.6});
    if(D.t>=D.dur){P.dash=null;
      if(T.quake){hitC(P.x,P.y,48,B()*0.8,{kb:150});shake(0.3);sfx('stone');fx({x:P.x,y:P.y,dur:0.35,u(f){const k=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);ring(0,0,12+k*40,'#ffe48a',3*(1-k),1-k);ctx.restore();ctx.globalAlpha=1}})}
      if(T.slash&&D.hit.size)cdHS(0.05)}
  }
  // ── Tuyệt kỹ
  const SK={
    lamphong(a){const P=G.p;fx({x:P.x,y:P.y,dur:0.6,u(f){const k=f.t/f.dur;fxD('fx_c_kiem',f.x,f.y,50+k*24,{alpha:1-k,sq:0.6,rot:k*2})}});sfx('tk_kiem');later(0.1,()=>{sfx('a_kiem3');shake(0.25);
      [0,-0.3,0.3].forEach((da,i)=>{const an=a+da,w={x:P.x+Math.cos(an)*12,y:P.y-8+Math.sin(an)*12,a:an,spd:i?300:350,life:i?0.42:0.62,r:i?20:32,dmg:B()*(i?1.1:2.8),hit:new Set(),big:!i};
        G.cdo.push({upd(dt){w.life-=dt;w.x+=Math.cos(w.a)*w.spd*dt;w.y+=Math.sin(w.a)*w.spd*dt;const s=G.src;G.src='tuyetky';
          forNear(w.x,w.y,w.r+24,e=>{if(w.hit.has(e)||Math.hypot(e.x-w.x,e.y-w.y)>w.r+e.r)return;w.hit.add(e);hurtE(e,w.dmg,'kim',{kb:w.big?110:50,kx:w.x-Math.cos(w.a)*20,ky:w.y-Math.sin(w.a)*20});if(w.big&&w.hit.size===1)cdHS(0.07)});
          G.src=s;if(FXQ>0&&rand()<0.7)vp(w.x,w.y,{vx:-Math.cos(w.a)*40,vy:-Math.sin(w.a)*40,life:0.3,c:'#fff3c0',s:1.5});return w.life>0}});
        fx({dur:w.life+0.05,o(f){const al=Math.min(1,w.life*5);glow(w.x,w.y,w.r*1.3,'#ffe9a0',0.45*al);fxD('fx_sl1',w.x,w.y,w.r*2.7,{rot:w.a+Math.PI,alpha:al,add:1});fxD('fx_sl2',w.x,w.y,w.r*2.5,{rot:w.a+Math.PI,alpha:al})}})})})},
    linhnhi(a,tg){const P=G.p,x=tg?tg.x:P.x+Math.cos(a)*80,y=tg?tg.y:P.y+Math.sin(a)*80,R=74,dur=3.6,z={t:0,tk:0};
      const h=Math.ceil(P.mhp*0.12);P.hp=Math.min(P.mhp,P.hp+h);G.nums.push({x:P.x,y:P.y-30,v:'+'+h,t:0,c:'#6dff8a'});sfx('tk_hoi');
      G.cdo.push({upd(dt){z.t+=dt;z.tk-=dt;if(z.tk<=0){z.tk=0.35;hitC(x,y,R,B()*0.36,{rx:1},e=>{if(e.d.boss)e.slowT=Math.max(e.slowT,0.6);else e.rootT=Math.max(e.rootT,0.55)})}return z.t<dur}});
      fx({x,y,dur,u(f){const k=f.t/f.dur,al=Math.min(1,f.t*4)*Math.min(1,(1-k)*5);ell(f.x,f.y,R,R*0.6,'#1f7a3a',0.28*al);ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,R,'#8dff9a',1.5,0.7*al);ctx.restore();ctx.globalAlpha=1;
          fxD('mc_bind'+(((G.t*8)|0)%4),f.x,f.y,R*1.1,{alpha:0.7*al,sq:0.7})},
        o(f){const k=f.t/f.dur,al=Math.min(1,(1-k)*5),g=Math.min(1,f.t*3.5);for(let i=0;i<9;i++){const an=i/9*TAU+0.3,vx=f.x+Math.cos(an)*R*0.82,vy=f.y+Math.sin(an)*R*0.5,s=38*g*(0.85+0.15*Math.sin(G.t*3+i));fxD(i%2?'fx_vine':'fx_root',vx,vy-s*0.42,s,{alpha:al,flip:i%3===0})}}})},
    hanbang(a){const P=G.p,px=P.x,py=P.y;sfx('ice');
      fx({x:px,y:py,dur:0.8,u(f){const k=f.t/f.dur;fxD('fx_c_bang',f.x,f.y,70+k*30,{alpha:1-k,sq:0.6,rot:k})}});
      later(0.12,()=>{sfx('freeze');shake(0.3);const s=G.src;G.src='tuyetky';let n=0;
        forNear(px,py,200,e=>{const d=Math.hypot(e.x-px,e.y-py);if(d>178+e.r)return;let da=Math.atan2(e.y-py,e.x-px)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>0.62&&d>26)return;
          n++;hurtE(e,B()*1.9,'thuy',{kb:30,kx:px,ky:py});if(!e.dead){if(e.d.boss)e.slowT=Math.max(e.slowT,3);else e.rootT=Math.max(e.rootT,2.2)}});G.src=s;if(n)cdHS(0.07);
        for(let i=1;i<=5;i++){const m=i+1;for(let j=0;j<m;j++){const an=a+(m>1?(j/(m-1)-0.5):0)*1.05,d=i*33+(rand()-.5)*8;
          fx({x:px+Math.cos(an)*d,y:py+Math.sin(an)*d,dl:i*0.045,dur:0.75+i*0.045,sz:30+rand()*14+i*2,fl:rand()<0.5,o(f){const t=f.t-f.dl;if(t<0)return;const g=Math.min(1,t*9),al=Math.min(1,(f.dur-f.t)*4);fxD('fx_is'+Math.min(2,(t*14)|0),f.x,f.y-f.sz*0.4*g,f.sz*g,{alpha:al,flip:f.fl})}})}}})},
    loichan(a){const P=G.p;P.inv=Math.max(P.inv,1.5);sfx('bell');
      fx({dur:1.5,o(f){const k=f.t/f.dur,g=Math.min(1,f.t*6),al=Math.min(1,(1-k)*4)*0.8;glow(P.x,P.y-16,34,'#ffd45a',0.4*al);fxD('fx_bell',P.x,P.y-20+(1-g)*-30,62,{alpha:al*0.65})}});
      later(0.32,()=>{const x=P.x,y=P.y,R=125;const n=hitC(x,y,R,B()*2.4,{kb:210},e=>{if(!e.d.boss)e.rootT=Math.max(e.rootT,1.2)});for(const b of G.es)if(Math.hypot(b.x-x,b.y-y)<R)b.dead=true;
        shake(0.55);sfx('no');if(n)cdHS(0.09);if(typeof buzz==='function')buzz(40);burstP(x,y-6,16,['#fff3c0','#ffd45a','#c98a1a'],{spd:170,life:0.5,s:2});
        fx({x,y,dur:0.5,u(f){const k=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.58);ctx.globalCompositeOperation='lighter';ring(0,0,R*k,'#ffe48a',7*(1-k)+1,1-k);ring(0,0,R*k*0.7,'#fff8d0',3*(1-k),0.7*(1-k));ctx.globalCompositeOperation='source-over';ctx.restore();ctx.globalAlpha=1}})})},
    modung(a,tg){const P=G.p,d0=tg?clamp(Math.hypot(tg.x-P.x,tg.y-P.y),60,150):105;sfx('tali');
      for(let i=0;i<5;i++){const an=a+(i-2)*0.3,d=d0*(i===2?1:0.92)+(i%2?14:0),x0=P.x,y0=P.y-10,x=P.x+Math.cos(an)*d,y=P.y+Math.sin(an)*d,T=0.62+i*0.05;
        fx({dur:T,o(f){const k=Math.min(1,f.t/0.22),e=1-(1-k)*(1-k),cx=x0+(x-x0)*e,cy=y0+(y-y0)*e-Math.sin(k*Math.PI)*14;
          if(k>=1){const p=0.5+0.5*Math.sin(f.t*30);glow(x,y,14+p*6,'#ff7a2a',0.5)}fxD('fx_tali',cx,cy,22,{rot:k<1?an+f.t*14:an*0.2})},
          u(f){if(f.t<0.22)return;ctx.save();ctx.translate(x,y);ctx.scale(1,0.58);ring(0,0,46*Math.min(1,(f.t-0.22)*5),'#ff7a2a',1.2,0.75);ctx.restore();ctx.globalAlpha=1}});
        later(T,()=>{const n=hitC(x,y,48,B()*1.5,{kb:70,kx:x,ky:y});boom(x,y,100);if(i===0){sfx('no');shake(0.35)}if(n&&i===2)cdHS(0.06)})}},
    bachho(a){const P=G.p,hit=new Set(),c=TK.bachho.c;P.inv=Math.max(P.inv,1);sfx('tk_ho');
      for(let j=0;j<5;j++)later(0.02+j*0.11,()=>{if(P.dead||G.over)return;let tg=null,bd=235*235;for(const e of G.e){if(e.dead||hit.has(e))continue;const d=(e.x-P.x)**2+(e.y-P.y)**2;if(d<bd){bd=d;tg=e}}
        if(!tg&&j>0)return;ghost(c,0.7);
        if(tg){hit.add(tg);const an=Math.atan2(tg.y-P.y,tg.x-P.x);P.dir=dirOf(an);P.x=clamp(tg.x-Math.cos(an)*(tg.r+8),12,WORLD-12);P.y=clamp(tg.y-Math.sin(an)*(tg.r+8),12,WORLD-12);collideObs(P,P.r);P.fx=Math.cos(an);P.fy=Math.sin(an)}
        const x=tg?tg.x:P.x+Math.cos(a)*20,y=tg?tg.y:P.y+Math.sin(a)*20;hitC(x,y,44,B()*1.25,{kb:30});sfx('a_trao');shake(0.15);if(j===4||!tg)cdHS(0.06);
        if(SPR[CHARS.bachho.spr+'_a_R0'])P.act={k:'a',d:P.dir,t0:G.t,dur:0.14};
        fx({x,y:y-8,a:rand()*TAU,dur:0.22,o(f){const k=f.t/f.dur;glow(f.x,f.y,26,c,0.4*(1-k));fxD('fx_sl'+Math.min(3,(k*4)|0),f.x,f.y,70,{rot:f.a,add:1});fxD('fx_foxfire',f.x,f.y-6-k*10,18,{alpha:1-k,add:1})}})})}};
  function cdSkill(){
    if(!ok())return false;const P=G.p,C=G.cdx.tk;if(C.t>0||P.dash)return false;
    const tg=nearestE(P.x,P.y,190);let a;
    if(tg)a=Math.atan2(tg.y-P.y,tg.x-P.x);else{let dx=P.fx||0,dy=P.fy||0;if(!dx&&!dy){dx=P.dir==='L'?-1:P.dir==='R'?1:0;dy=P.dir==='U'?-1:P.dir==='D'?1:0}a=Math.atan2(dy,dx)}
    C.t=C.cd;P.dir=dirOf(a);const id=CHARS[G.ch].spr,kind=G.ch==='lamphong'?'a':'c',d=P.dir==='L'?'R':P.dir;
    if(SPR[`${id}_${kind}_${d}0`])P.act={k:kind,d:P.dir,t0:G.t,dur:kind==='a'?0.32:0.5};
    if(!G.hd)announce(tkOf().n(),'realm');   // Trấn Ấn Lộ bấm chiêu liên tục, không hiện tên chiêu giữa màn hìnhif(typeof buzz==='function')buzz(20);
    const ov=typeof bmOn==='function'&&bmOn('skillOverride');EMIT('skill',{a,tg});if(ov)ov({a,tg});else(SK[G.ch]||SK.lamphong)(a,tg);return true;
  }
  // ── cập nhật theo khung
  const _upCD=updatePlayer;
  updatePlayer=function(dt){
    const P=G.p;
    if(P.dash&&!P.dead){const ox=INPUT.x,oy=INPUT.y;INPUT.x=0;INPUT.y=0;_upCD(dt);INPUT.x=ox;INPUT.y=oy;dashStep(dt)}else _upCD(dt);
    if(!G.cdx)return;const C=G.cdx.tp;if(C.n<C.max){C.t-=dt;if(C.t<=0){C.n++;C.t=C.n<C.max?C.cd:0}}
    if(G.cdx.tk.t>0)G.cdx.tk.t-=dt;
    if(G.cdo.length)G.cdo=G.cdo.filter(o=>o.upd(dt));
  };
  const _dfuCD=drawFxUnder,_dfoCD=drawFxOver;
  drawFxUnder=function(f){if(f.cd){if(f.u)f.u(f);return}_dfuCD(f)};
  drawFxOver=function(f){if(f.cd){if(f.o)f.o(f);return}_dfoCD(f)};
  // ── nút bấm
  const css=document.createElement('style');
  css.textContent=`#cdBox{position:absolute;right:8px;bottom:calc(max(8px,env(safe-area-inset-bottom)) + 82px);display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none}
.cdb{pointer-events:auto;position:relative;width:58px;height:58px;border-radius:50%;border:2px solid #f3e2b0;background:radial-gradient(circle,rgba(30,44,52,.9) 60%,rgba(10,16,20,.9));box-shadow:0 2px 0 rgba(0,0,0,.5);padding:0;overflow:hidden;touch-action:none;-webkit-tap-highlight-color:transparent}
.cdb img{width:38px;height:38px;image-rendering:pixelated;display:block;margin:auto;pointer-events:none}
.cdb i{position:absolute;inset:0;border-radius:50%;background:conic-gradient(rgba(0,0,0,.72) var(--p,0%),transparent 0);pointer-events:none}
.cdb b{position:absolute;left:0;right:0;bottom:1px;font:800 11px var(--font);color:#fff;text-shadow:1px 1px 0 #000;text-align:center;pointer-events:none}
.cdb.rdy{border-color:#ffd45a;box-shadow:0 0 8px 1px #ffe48a}.cdb:active{transform:scale(.92)}
#tkB{width:62px;height:62px;margin-right:52px;margin-bottom:-34px}`;
  document.head.appendChild(css);
  const box=document.createElement('div');box.id='cdBox';
  box.innerHTML='<button id="tkB" class="cdb" aria-label="Tuyệt kỹ"><img alt=""><i></i><b></b></button><button id="tpB" class="cdb" aria-label="Thân pháp"><img alt=""><i></i><b></b></button>';
  $('bot').appendChild(box);
  const press=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(typeof audioInit==='function')audioInit();f()});
  press('tpB',cdDash);press('tkB',cdSkill);
  addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')cdDash();else if((e.code==='KeyJ'&&!(G&&G.hd))||e.code==='KeyE'||e.code==='KeyL')cdSkill()});
  const _startCD=startGame;
  startGame=function(){_startCD();if(!G||!G.cdx)return;$('tpB').firstChild.src=iconURL('p_boot');$('tkB').firstChild.src=iconURL(tkOf().ic);$('tpB').dataset.n=i18n('cd.nut.tp','Lướt');$('tkB').dataset.n=i18n('cd.nut.tk','Tuyệt kỹ');
    if(!SAVE.cdHint){SAVE.cdHint=1;saveSave();setTimeout(()=>{if(G&&!G.over)announce(i18n('cd.goiy','Mới: nút Thân pháp để lướt né, nút Tuyệt kỹ để tung chiêu'),'good')},5200)}};
  const _hudCD=hud;
  hud=function(dt){_hudCD(dt);if(!G||!G.cdx)return;const tp=G.cdx.tp,tk=G.cdx.tk,a=$('tpB'),b=$('tkB');
    a.style.setProperty('--p',(tp.n>0?0:Math.max(0,tp.t/tp.cd)*100)+'%');a.classList.toggle('rdy',tp.n>0);a.lastChild.textContent=tp.max>1?tp.n:'';
    b.style.setProperty('--p',Math.max(0,tk.t/tk.cd)*100+'%');b.classList.toggle('rdy',tk.t<=0);b.lastChild.textContent=tk.t>0?Math.ceil(tk.t):''};
  window.CDX={dash:cdDash,skill:cdSkill,hitC,fx,B,ghost,boom,later,dirOf,elOf,tpOf,tkOf};   // cho chế độ Trấn Ấn Lộ (js/tranan/) dùng lại
  if(typeof SRC_N!=='undefined'){SRC_N.thanphap=[i18n('cd.tp','Thân Pháp'),'p_boot'];SRC_N.tuyetky=[i18n('cd.tk','Tuyệt Kỹ'),'kiemkhi']}
}

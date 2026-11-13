'use strict';
// ───────────────────────── Đồ rơi, Tâm Ma, đại chiêu Mộc lúc gieo hạt và nút giao diện trong trận: hình Google Flow
// tools/art_src/drops.png → it_*, tamma.png → e_tamma_*, moc_ult.png → mu_*, hud_ui.png → assets/ui_*.png

// ── đồ rơi
const _dgVP=drawGem;
drawGem=function(g){const k=g.v>=25?'it_gem2':g.v>=5?'it_gem1':'it_gem0';if(!SPR[k])return _dgVP(g);
  const b=Math.sin(g.t*4)*1,y=g.y-3+b;ell(g.x,g.y,g.v>=25?3.5:2.5,1,'#23402a',0.2);drawS(k,g.x,y);
  const tw=Math.sin(g.t*3+g.x*0.1);if(tw>0.85)drawS('it_glint',g.x+2,y-3,{alpha:(tw-0.85)*6})};
const _diVP=drawItem;
drawItem=function(it){const K={heal:'it_heal',magnet:'it_mag',chest:'it_ch0'}[it.k];if(!K||!SPR[K])return _diVP(it);
  const b=Math.sin(it.t*4)*1.2,x=it.x,y=it.y-5+b;ell(it.x,it.y,it.k==='chest'?8:5,2,'#23402a',0.25);
  if(it.k==='chest'){const gl=0.5+Math.sin(it.t*5)*0.3;glow(x,y,14,'#ffe680',gl*0.6);drawS(K,x,y-1,{sc:0.85});
    if(((it.t*2)|0)%3===0)drawS('it_sp2',x+5,y-8,{sc:0.5,alpha:0.9})}
  else{glow(x,y,7,it.k==='heal'?'#ff8a96':'#ffe680',0.35);drawS(K,x,y)}};
const _doVP=drawOrb;drawOrb=function(o){if(!SPR.it_orb)return _doVP(o);drawS('it_orb',o.x,o.y,{sc:1.1})};

// ── Tâm Ma có hình riêng (thay hình nhân vật tô tím)
if(ART_MAN.e_tamma_walk0&&ENEMY.tamma)ENEMY.tamma.spr='tamma';

// ── đại chiêu Mộc lúc gieo hạt: vòng hạt mầm và linh khí tụ về (thay vòng tròn vẽ bằng code)
if(typeof ULTS!=='undefined'&&ULTS.moc){const _muVP=ULTS.moc.under;
  ULTS.moc.under=function(u){const P=G.p,t=u.t;
    if(t<0.5&&SPR.mu_seed0){const k=t/0.45,f=Math.min(3,(k*4)|0);fxD('mu_seed'+f,P.x,P.y,30+k*40,{alpha:Math.min(1,k*3)});fxD('mu_gat'+f,P.x,P.y-10,18+k*10,{alpha:0.9,add:1});
      const save=u.t;u.t=0.6;try{_muVP(u)}finally{u.t=save};return}
    _muVP(u)};
  // hoa sen hồi máu nở ở gốc cây linh
  const _mwVP=ULTS.moc.world;ULTS.moc.world=function(u){_mwVP(u);const S=u.st;if(S.tree===undefined||!SPR.mu_lot0)return;const k=(u.t-S.tree)/0.9,e=uEnd(u);if(k<0)return;
    fxD('mu_lot'+Math.min(3,(k*4)|0),S.ox,S.oy+2,26,{alpha:e})}}

// ── nút và khung giao diện
(function(){const st=document.createElement('style');st.textContent=`
#pauseB{background:url(assets/ui_pause.png) center/contain no-repeat!important;border:0!important;width:34px!important;height:34px!important;color:transparent!important;image-rendering:pixelated}
#burstB{background:url(assets/ui_ult.png) center/100% 100% no-repeat,radial-gradient(circle,rgba(20,40,30,.85) 55%,transparent 58%)!important;border:0!important;width:72px!important;height:72px!important;image-rendering:pixelated;overflow:visible!important}
#burstB.ready{background:url(assets/ui_ultR.png) center/100% 100% no-repeat,radial-gradient(circle,rgba(40,40,10,.85) 55%,transparent 58%)!important;box-shadow:none!important;filter:drop-shadow(0 0 8px #ffe48a)}
#burstI{inset:13px!important;width:calc(100% - 26px)!important;height:calc(100% - 26px)!important;border-radius:50%}
#burstF{border-radius:50%}
.slot{background:url(assets/ui_slot.png) center/100% 100% no-repeat,rgba(255,248,230,.55)!important;background-clip:padding-box;border:0!important;border-radius:4px!important;width:32px!important;height:32px!important;image-rendering:pixelated}
.slot img{position:absolute;inset:5px;width:calc(100% - 10px)!important;height:calc(100% - 10px)!important}
.slot.evo,.slot.ready{background-image:url(assets/ui_slotH.png)!important}
.slot.lock{background:url(assets/ui_lock.png) center/100% 100% no-repeat!important}.slot.lock img{display:none}
.slot.sm{background:url(assets/ui_pslot.png) center/100% 100% no-repeat!important;border:0!important;width:24px!important;height:24px!important;border-radius:50%!important}
.slot.sm img{inset:4px;width:calc(100% - 8px)!important;height:calc(100% - 8px)!important}
#mini{border:0!important;border-radius:3px!important;padding:6px;background:url(assets/ui_mini.png) center/100% 100% no-repeat,rgba(240,250,240,.8);background-origin:border-box;box-sizing:border-box;width:74px!important;height:74px!important;box-shadow:none!important}
#kills::before{content:''!important;display:inline-block;width:15px;height:15px;margin-right:3px;vertical-align:-2px;background:url(assets/ui_skull.png) center/contain no-repeat;image-rendering:pixelated}
`;document.head.appendChild(st)})();
// cần điều khiển ảo: vòng ngọc và viên ngọc
const JOYI={b:new Image(),k:new Image()};JOYI.b.src='assets/ui_joy.png';JOYI.k.src='assets/ui_knob.png';
const _djVP=drawJoy;drawJoy=function(){if(!JOY.on)return;if(!JOYI.b.complete||!JOYI.b.naturalWidth)return _djVP();const a=JOY,x=a.ox/SCALE,y=a.oy/SCALE;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=0.6;ctx.drawImage(JOYI.b,x-30,y-30,60,60);ctx.globalAlpha=0.95;ctx.drawImage(JOYI.k,x+INPUT.x*20-11,y+INPUT.y*20-11,22,22);ctx.restore()};

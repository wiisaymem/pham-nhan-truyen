'use strict';
// ───────────────────────── Đại chiêu: phần hình dùng ảnh mẫu Flow (fx_*, ic_sum_*) thay cho nét vẽ tay
if(typeof ULTS!=='undefined'){
const S0=k=>SPR[k]?k:null;
// KIM
ULTS.kim.under=function(u){const P=G.p,t=u.t;if(t<0.7){const k=Math.min(1,t/0.4)*Math.min(1,(0.7-t)/0.15);fxD('fx_c_kiem',P.x,P.y,90*(0.6+k*0.4),{sq:0.5,rot:t*3,alpha:0.85*k,add:1});if(u.lv>=3)fxD('fx_c_bagua',P.x,P.y,56,{sq:0.5,rot:-t*4,alpha:0.7*k,add:1})}};
ULTS.kim.world=function(u){const S=u.st,C=u.U.c,t=u.t;if(!S.sw)return;
  for(const s of S.sw){const a=s.fly?Math.atan2(Math.sin(s.dir)*0.8,Math.cos(s.dir)):-Math.PI/2;glow(s.x,s.y,10,C[1],s.fly?0.6:0.45);fxD('fx_swordg',s.x,s.y,s.fly?21:17,{rot:a});
    if(s.fly&&rand()<0.6)vp(s.x,s.y,{life:0.25,s:1.8,c:C[(rand()*2)|0],drag:4})}
  if(S.gx!==undefined&&t<1.6){const k=Math.min(1,(t-1.0)/0.25),y=S.gy-260+260*k*k,a=t<1.25?1:Math.max(0,1-(t-1.25)/0.35);
    glow(S.gx,y-30,40+u.lv*8,C[1],0.7*a);
    if(u.lv>=4)uSpr(u.U.sum,S.gx,y-55,120,a);else fxD('fx_gsword',S.gx,y-50,100,{alpha:a});
    if(t<1.25)fxD('fx_c_kiem',S.gx,S.gy,140*(1-k)+30,{sq:0.5,rot:t*4,alpha:k*0.9,add:1})}};
ULTS.kim.screen=function(u){const t=u.t;if(u.st.slash===undefined)return;const k=(t-u.st.slash)/0.35;if(k>=1)return;
  for(const s of [1,-1])fxD('fx_sl'+Math.min(3,1+((k*3)|0)),VW/2,VH/2,Math.max(VW,VH)*1.1,{rot:s*Math.PI/4+(s>0?0:Math.PI),alpha:(1-k)*0.9,add:1})};
// MỘC
ULTS.moc.under=function(u){const P=G.p,S=u.st,t=u.t;
  if(t<0.5){const k=t/0.45;glow(P.x,P.y-2,8+k*16,'#7bff9a',0.5+k*0.4);fxD('fx_vine',P.x,P.y-8*k,4+14*k,{alpha:Math.min(1,k*2)});
    for(let i=0;i<2;i++){const a=rand()*TAU,d=40+rand()*50;vp(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.5,{vx:-Math.cos(a)*d*2.5,vy:-Math.sin(a)*d*1.2-20,life:0.35,s:1.8,c:rand()<0.5?'#7bff9a':'#ffd45a',drag:0})}}
  if(!S.roots)return;const fade=uEnd(u);
  for(const r of S.roots){const st=15,N=(S.len/st)|0;
    for(let i=1;i<=N;i++){const [x,y]=mocTip(S,r,i*st),[x0,y0]=mocTip(S,r,(i-1)*st),an=Math.atan2(y-y0,x-x0);fxD('fx_root',(x+x0)/2,(y+y0)/2,20,{rot:an-Math.PI/2+((i*7+r.seed)%3-1)*0.15,alpha:fade,flip:i%2})}
    const [tx,ty]=mocTip(S,r,S.len);if(S.len<ultRadius(u.lv)-1){glow(tx,ty-2,10,'#7bff9a',0.7);fxD('mc_seed',tx,ty-4,8,{alpha:fade,rot:G.t*3})}}};
ULTS.moc.world=function(u){const S=u.st,t=u.t;if(S.tree===undefined)return;const k=Math.min(1,(t-S.tree)/0.3),e=uEnd(u),x=S.ox,y=S.oy-4,h=(u.lv>=4?140:95)*(0.4+k*0.6);
  glow(x,y-h*0.45,30+u.lv*10,'#7bff9a',0.5*e);uSpr(u.U.sum,x,y-h*0.48,h,0.95*e);
  if(rand()<0.5)vp(x+(rand()-.5)*80,y-60-rand()*40,{vx:(rand()-.5)*20,vy:20,g:10,life:1.2,s:2,c:rand()<0.5?'#ffb3cf':'#ffffff',add:0,drag:0.5})};
ULTS.moc.screen=function(u){const t=u.t,S=u.st;if(S.tree===undefined)return;const e=uEnd(u),k=Math.min(1,(t-S.tree)/0.3)*e;
  const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(120,255,140,0)');g.addColorStop(1,`rgba(60,180,80,${0.3*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  for(let i=0;i<(u.lv>=3?36:16);i++){const sp=40+(i*37)%50,x=((i*97.3+Math.sin(t*2+i)*30+(t-S.tree)*20)%VW+VW)%VW,y=((i*61.7)%VH+(t-S.tree)*sp*2)%VH;fxD('fx_petal',x,y,7+(i%3)*2,{rot:t*3+i,alpha:0.9*k})}};
// THỦY
ULTS.thuy.under=function(u){const P=G.p,t=u.t,R=ultRadius(u.lv),k=Math.min(1,t/0.7),e=uEnd(u);fxD('fx_c_bang',P.x,P.y,Math.min(200,R*2*k),{sq:0.55,rot:t*0.6,alpha:0.75*e,add:1});for(let i=0;i<16;i++){const an=i/16*TAU,rr=R*k;fxD(FX_IS[i%3],P.x+Math.cos(an)*rr,P.y+Math.sin(an)*rr*0.55-6,14,{alpha:0.85*e})}};
ULTS.thuy.world=function(u){const P=G.p,t=u.t,S=u.st;
  if(t<0.75)for(let i=0;i<6;i++){const a=t*4+i/6*TAU,x=P.x+Math.cos(a)*24,y=P.y-14+Math.sin(a)*10;fxD('fx_is0',x,y,9,{rot:a});glow(x,y,6,'#9fe8ff',0.5)}
  if(S.fz&&t<1.3){const a=t<1.25?1:1-(t-1.25)/0.05;for(const e of S.fz){if(e.dead)continue;fxD('fx_iceblock',e.x,e.y-e.r,e.r*2.6+8,{alpha:0.8*a})}}
  if(t<0.7&&rand()<0.9){const a=rand()*TAU,d=rand()*ultRadius(u.lv);vp(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.6-60,{vx:-60,vy:90,life:0.6,s:1.8,c:'#ffffff',add:0,drag:0})}};
ULTS.thuy.screen=function(u){const t=u.t,lv=u.lv,S=u.st,e=uEnd(u),k=Math.min(1,t/0.7)*e;
  const g=ctx.createRadialGradient(VW/2,VH/2,VH*(0.55-0.25*k),VW/2,VH/2,VH*0.8);g.addColorStop(0,'rgba(220,248,255,0)');g.addColorStop(1,`rgba(220,248,255,${0.7*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  if(t>0.7&&t<1.25){ctx.fillStyle='rgba(150,220,255,0.16)';ctx.fillRect(0,0,VW,VH)}
  for(let i=0;i<(lv>=3?44:22);i++){const sp=240+(i*53)%240,x=((i*71.3-t*sp*0.6)%(VW+80)+VW+80)%(VW+80)-40,y=((i*43.9+t*sp)%(VH+40)+VH+40)%(VH+40)-20;fxD('fx_snow',x,y,5+(i%4)*2,{rot:t*4+i,alpha:0.85*k})}
  if(lv>=4&&t>0.72&&t<1.3){const q=(t-0.72)/0.55,x=-VW*0.4+q*VW*1.8,y=VH*0.42+Math.sin(q*Math.PI*2)*VH*0.05;
    for(let i=1;i<9;i++)fxD('fx_snow',x-i*24,y+Math.sin(q*12-i*0.6)*10,14-i,{rot:t*6+i,alpha:0.8*(1-i/9)});
    glow(x,y,VH*0.18,'#9fe8ff',0.7);uSpr(u.U.sum,x,y,VH*0.32,1,true)}
  if(S.crack!==undefined){const q=(t-S.crack)/0.45;if(q<1){ctx.globalAlpha=(1-q)*0.55;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
    for(let i=0;i<8;i++){const a=i/8*TAU;fxD('fx_is2',VW/2+Math.cos(a)*q*VW*0.6,VH/2+Math.sin(a)*q*VH*0.4,40,{rot:a,alpha:1-q})}}}};
// LÔI: mây giông bằng ảnh mẫu
const _loiScr=ULTS.loi.screen;
ULTS.loi.screen=function(u,px,py){const t=u.t,e=uEnd(u),lv=u.lv,h=VH*(lv>=3?0.3:0.18)*Math.min(1,t/0.25)*e;
  const g=ctx.createLinearGradient(0,0,0,h*1.4);g.addColorStop(0,'rgba(30,18,60,0.85)');g.addColorStop(1,'rgba(30,18,60,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,h*1.4);
  for(let i=0;i<7;i++){const x=((i*VW/5+t*25)%(VW+120))-60;fxD('fx_cloud',x,h*0.35+(i%2)*h*0.25,VW*0.42,{alpha:0.95*e,flip:i%2})}
  const S=u.st;if(S.fl!==undefined&&t-S.fl<0.08){ctx.globalAlpha=0.3;ctx.fillStyle='#e8e0ff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(lv>=4){const k=Math.min(1,t/0.45),drop=t<0.45?0:Math.min(1,(t-0.45)/0.12),hh=VH*0.42*(0.7+k*0.3),y=py-VH*0.32+drop*VH*0.18,a=Math.min(1,k*1.4)*(t>0.6?Math.max(0,e*(1-(t-0.6)/1.2)):1)*0.9;glow(px,y,hh*0.6,u.U.c[1],0.5*k*e);uSpr(u.U.sum,px,y,hh,a)}
  if(t>=0.55&&t<0.75){const k=1-(t-0.55)/0.2;ctx.globalAlpha=k*(lv>=3?0.7:0.4);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}};
// HỎA: phượng hoàng dùng ảnh pháp tướng ở mọi cấp, cánh lửa, tàn lửa
ULTS.hoa.world=function(u){const S=u.st,t=u.t,P=G.p,C=u.U.c;
  if(!S.ph){if(t<0.4)for(let i=0;i<3;i++){const a=t*10+i/3*TAU;vp(P.x+Math.cos(a)*20,P.y-12+Math.sin(a)*10,{vy:-40,life:0.4,s:2.2,c:C[(rand()*3)|0],drag:1})}return}
  for(const f of S.ph){const fl=f.x<f.px,fx=f.x,fy=f.y-20,sz=u.lv>=4?66:46;
    for(let i=0;i<3;i++)vp(fx+(rand()-.5)*14,fy+(rand()-.5)*10,{vx:(f.px-f.x)*20+(rand()-.5)*30,vy:-20-rand()*30,life:0.5,s:2.4,c:C[(rand()*3)|0],drag:1.5});
    if(rand()<0.3)vp(fx,fy,{vx:(rand()-.5)*20,vy:30,life:0.8,s:3,c:'#ffb02e',k:3,vr:4});
    glow(fx,fy,sz*0.55,C[1],0.75);uSpr(u.U.sum,fx,fy,sz,1,fl)}};
ULTS.hoa.player=function(u,base){const P=G.p,t=u.t,C=u.U.c,l=t<0.35?t/0.35*10:t<1.45?10:10*Math.max(0,1-(t-1.45)/0.2),e=uEnd(u);
  fxD('fx_fwing',P.x,P.y-20-l,42,{alpha:0.9*e,sy:0.85+Math.sin(t*18)*0.15});glow(P.x,P.y-12-l,26,C[1],0.55*e);ctx.save();ctx.translate(0,-l);base();ctx.restore()};
ULTS.hoa.under=function(u){const S=u.st,t=u.t,P=G.p;if(u.nova&&t<1.85){const k=(t-1.45)/0.4;fxD('fx_c_hoa',P.x,P.y,ultRadius(u.lv)*1.6*(0.4+k*0.6),{sq:0.55,rot:k*2,alpha:1-k,add:1})}};
ULTS.hoa.screen=function(u){const t=u.t,e=uEnd(u),k=Math.min(1,t/0.3)*e,lv=u.lv;
  const g=ctx.createLinearGradient(0,VH,0,VH*0.4);g.addColorStop(0,`rgba(255,110,30,${0.4*k})`);g.addColorStop(1,'rgba(255,110,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  for(let i=0;i<(lv>=3?40:20);i++){const sp=60+(i*29)%90,x=((i*89.7+Math.sin(t*3+i)*20)%VW+VW)%VW,y=VH-(((i*53.1)+t*sp*2)%(VH*0.9));fxD(i%5?'fx_ember':'fx_feather',x,y,i%5?6:12,{rot:t*2+i,alpha:0.85*k,add:i%5?1:0})}};
// HỒ: chín đuôi, xoáy mị hoặc, cánh hoa
ULTS.ho.under=function(u){const S=u.st,t=u.t;if(S.vx===undefined||t>1.7)return;const k=Math.min(1,(t-1.05)/0.2),q=t<1.55?1:1-(t-1.55)/0.15,R=ultRadius(u.lv)*0.6*(1-(t-1.05)/0.6*0.6);
  fxD('fx_c_bang',S.vx,S.vy,R*2,{sq:0.55,rot:-t*7,alpha:0.85*k*q,add:1,tint:'pink'});fxD('fx_ftail',S.vx,S.vy,R*1.1,{sq:0.55,rot:t*5,alpha:0.7*k*q});glow(S.vx,S.vy-6,30,'#ffb0e8',0.7*k*q)};
ULTS.ho.player=function(u,base){const P=G.p,t=u.t,e=uEnd(u),k=Math.min(1,t/0.4)*e;
  if(u.lv>=4&&t<1.6){const a=Math.min(1,t/0.4)*Math.max(0,1-(t-1.2)/0.4);glow(P.x,P.y-60,70,'#d0a8ff',0.4*a);uSpr(u.U.sum,P.x,P.y-62,110,0.75*a)}
  const n=u.lv>=3?1:0.75;fxD('fx_ftail',P.x,P.y-22,(30+u.lv*5)*k*n,{alpha:0.9*k,rot:Math.sin(t*5)*0.08});base()};
ULTS.ho.screen=function(u){const t=u.t,e=uEnd(u),k=Math.min(1,t/0.3)*e,S=u.st;
  const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.25,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(255,170,230,0)');g.addColorStop(1,`rgba(150,90,220,${0.4*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  if(S.sp!==undefined&&t-S.sp<0.25){const q=(t-S.sp)/0.25;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-q)*0.3;ctx.fillStyle='#ff60c0';ctx.fillRect(-6*(1-q),0,VW,VH);ctx.fillStyle='#6090ff';ctx.fillRect(6*(1-q),0,VW,VH);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
  for(let i=0;i<(u.lv>=3?28:14);i++){const x=((i*113.1+Math.sin(t*1.5+i)*40)%VW+VW)%VW,y=((i*67.3-t*(30+i%5*10))%VH+VH)%VH;fxD('fx_petal',x,y,7+(i%3)*2,{rot:t*2+i,alpha:0.85*k,tint:i%2?'pink':null})}};
}

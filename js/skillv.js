'use strict';
// ───────────────────────── Hình công pháp theo cấp (1→5), dùng ảnh mẫu Flow (fx_*), chồng lên bản tiến hóa
// Mỗi đạn/vùng/hiệu ứng do công pháp tạo ra được gắn cấp lúc xuất chiêu (wl).
const _fwSV=fireWeapon;
fireWeapon=function(k,w){const a=G.pr.length,b=G.zones.length,c=G.fx.length,r=_fwSV(k,w);
  for(let i=a;i<G.pr.length;i++)G.pr[i].wl=w.lv;for(let i=b;i<G.zones.length;i++)G.zones[i].wl=w.lv;for(let i=c;i<G.fx.length;i++)G.fx[i].wl=w.lv;return r};
const svL=o=>Math.max(1,Math.min(5,o.wl|0||1));

// ── đạn
const _dpSV=drawProj;
drawProj=function(p){if(!SPR.fx_sword){_dpSV(p);return}const L=p.rx?1:svL(p);
  if(p.k==='sword'){const a=Math.atan2(p.vy,p.vx),K=p.gold?'fx_swordg':'fx_sword',sz=15+L*1.4,T=trail(p,5+L),col=p.gold?'#ffd45a':L>=4?'#7fe8ff':'#9fd8ff',px=-Math.sin(a),py=Math.cos(a);
    for(let i=T.length-1;i>0;i--)fxD(K,T[i][0],T[i][1],sz,{rot:a,alpha:0.26*(1-i/T.length),add:1});
    glow(p.x,p.y,8+L*1.5,col,0.45+L*0.05);
    if(L>=4){const o=5+Math.sin(G.t*20+p.x);for(const s of [1,-1])fxD(K,p.x+px*o*s-Math.cos(a)*4,p.y+py*o*s-Math.sin(a)*4,sz*0.65,{rot:a,alpha:0.6,add:1})}
    if(L>=3)fxD(K,p.x-Math.cos(a)*7,p.y-Math.sin(a)*7,sz*1.15,{rot:a,alpha:0.35,add:1});
    fxD(K,p.x,p.y,sz,{rot:a});
    if(L>=5)fxD('fx_c_kiem',p.x,p.y,16,{sq:0.55,rot:G.t*10,alpha:0.85,add:1});
    if(rand()<VDT*(30+L*10))vp(p.x-p.vx*0.02,p.y-p.vy*0.02,{vx:-p.vx*0.1+(rand()-.5)*10,vy:-p.vy*0.1+(rand()-.5)*10,life:0.3,s:1.4+L*0.1,c:p.gold?'#ffe680':'#e8f8ff'});return}
  if(p.k==='fire'){const T=trail(p,5+L),blue=p.burn,c0=blue?'#4c8fff':L>=4?'#ff3a1a':'#ff5a1f',sz=(14+L*2.2),a=Math.atan2(p.vy,p.vx),fr='fx_fb'+(1+(((G.t*14+p.x*0.1)|0)%3)),tn=blue?'blue':null;
    for(let i=T.length-1;i>0;i--){const k=1-i/T.length;glow(T[i][0],T[i][1],(4+k*4)*(1+L*0.08),c0,0.32*k)}
    if(L>=5)fxD('fx_fwing',p.x-Math.cos(a)*4,p.y-Math.sin(a)*4,sz*1.1,{rot:a+Math.PI/2,alpha:0.85,add:1,sy:0.8+Math.sin(G.t*30+p.x)*0.2,tint:tn});
    glow(p.x,p.y,11*(1+L*0.08),c0,0.55+L*0.04);
    fxD(fr,p.x-Math.cos(a)*sz*0.2,p.y-Math.sin(a)*sz*0.2,sz,{rot:a,tint:tn});
    if(L>=4)glow(p.x,p.y,5,'#ffffff',0.6);
    if(L>=3)for(let i=0;i<3;i++){const an=G.t*14+i/3*TAU;fxD('fx_ember',p.x+Math.cos(an)*7,p.y+Math.sin(an)*5,5,{add:1,tint:tn})}
    if(rand()<VDT*(50+L*12))vp(p.x+(rand()-.5)*4,p.y+(rand()-.5)*4,{vx:-p.vx*0.15+(rand()-.5)*20,vy:-p.vy*0.15-10-rand()*15,life:0.45,s:1.6+L*0.15,c:blue?PAL.thuy[(rand()*3)|0]:PAL.hoa[(rand()*4)|0]});return}
  if(p.k==='ice'){const a=Math.atan2(p.vy,p.vx),T=trail(p,4+L),sz=15+L*1.6,px=-Math.sin(a),py=Math.cos(a);
    for(let i=T.length-1;i>0;i--)fxD('fx_icespear',T[i][0],T[i][1],sz,{rot:a,alpha:0.24*(1-i/T.length),add:1});
    glow(p.x,p.y,7+L*1.6,L>=5?'#bff4ff':'#6fd6ff',0.45+L*0.05);
    if(L>=4)for(const s of [1,-1])fxD('fx_icespear',p.x+px*5*s-Math.cos(a)*5,p.y+py*5*s-Math.sin(a)*5,sz*0.6,{rot:a,alpha:0.85});
    fxD('fx_icespear',p.x,p.y,sz,{rot:a});
    if(L>=3)fxD('fx_snow',p.x-Math.cos(a)*sz*0.55,p.y-Math.sin(a)*sz*0.55,6+L,{rot:G.t*8,alpha:0.9});
    if(L>=5)fxD('fx_c_bang',p.x,p.y,14,{sq:0.7,rot:G.t*6,alpha:0.7,add:1});
    if(rand()<VDT*(25+L*12))vp(p.x,p.y,{vx:(rand()-.5)*14,vy:(rand()-.5)*14,life:0.5,s:1.3+L*0.1,c:rand()<0.5?'#ffffff':'#c8f4ff',drag:4});return}
  if(p.k==='tali'){const stuck=p.stick>=0,a=stuck?Math.sin(G.t*30)*0.15:G.t*14,sz=11+L*1.2,cg=p.chain?'#ff6bd0':L>=3?'#ffd45a':'#ff7a1f',tn=p.chain?'pink':null;
    if(!stuck){const T=trail(p,5+L);for(let i=T.length-1;i>0;i--)glow(T[i][0],T[i][1],4+L*0.5,cg,0.3*(1-i/T.length))}
    if(L>=5&&rand()<VDT*40)vp(p.x+(rand()-.5)*8,p.y+(rand()-.5)*8,{vy:-30-rand()*20,life:0.4,s:2,c:PAL.hoa[(rand()*4)|0]});
    glow(p.x,p.y,stuck?10+(0.35-p.stick)*20+L:6+L,cg,stuck?0.8:0.5);
    fxD('fx_tali',p.x,p.y,sz,{rot:a,tint:tn});
    if(L>=4)for(let i=0;i<2;i++){const an=G.t*10+i*Math.PI;fxD('fx_tali',p.x+Math.cos(an)*10,p.y+Math.sin(an)*6,sz*0.5,{rot:an,tint:tn})}
    if(stuck){const k=(0.35-p.stick)*30;fxD(L>=3?'fx_c_hoa':'fx_c_kiem',p.x,p.y+2,10+k*1.6,{sq:0.6,rot:G.t*5,alpha:0.85,add:1});
      if(rand()<VDT*40)vp(p.x+(rand()-.5)*6,p.y,{vy:-20-rand()*20,vx:(rand()-.5)*10,life:0.4,s:1.4,c:PAL.hoa[(rand()*3)|0]})}
    return}
  _dpSV(p)};

// ── vùng
const _dzSV=drawZone;
drawZone=function(z){if(!SPR.fx_vine||(z.k!=='vine'&&z.k!=='array')||z.src){_dzSV(z);return}const L=svL(z);
  const k=1-z.t/z.dur,a=Math.min(1,z.t*5)*Math.min(1,k*4),grow=Math.min(1,z.t/0.3);
  if(z.k==='vine'){const R=mulberry32(z.seed|0);
    ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.6);ctx.globalAlpha=0.16*a;ctx.fillStyle=z.leech?'#3fffa0':'#3fcf4a';ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;
    // mọc cây dây leo từ ảnh mẫu, cấp càng cao càng dày
    const n=5+L*2;for(let i=0;i<n;i++){const an=R()*TAU,rr=Math.sqrt(R())*z.r,x=z.x+Math.cos(an)*rr,y=z.y+Math.sin(an)*rr*0.6,h=(12+R()*8+L)*grow,sw=Math.sin(G.t*4+i)*0.12;
      const gt=z.t-i*0.03,f=gt<0.08?0:gt<0.18?1:(L>=3&&i%3===0)?3:2,fl=R()<0.5;ctx.save();ctx.translate(x,y);ctx.transform(1,0,sw,1,0,0);drawS('mc_vine'+f,0,0,{sc:(0.5+L*0.04)*Math.max(0.4,grow),flip:fl,alpha:a});ctx.restore()}
    if(L>=4)for(let i=0;i<10;i++){const an=i/10*TAU+0.3;drawS(i%2?'mc_thorn':'mc_thorn3',z.x+Math.cos(an)*z.r*grow,z.y+Math.sin(an)*z.r*0.6*grow,{sc:0.45*grow,alpha:a*0.95,flip:i%2===0})}
    if(L>=5){fxD('fx_lotus',z.x,z.y,z.r*0.6,{sq:0.6,rot:G.t*0.5,alpha:a*0.55,add:1});if(rand()<VDT*25)vp(z.x+(rand()-.5)*z.r*1.6,z.y+(rand()-.5)*z.r,{vy:-18,vx:(rand()-.5)*6,life:1,s:1.6,c:'#e8ffb0',drag:0.5})}
    if(rand()<VDT*15)vp(z.x+(rand()-.5)*z.r*1.6,z.y+(rand()-.5)*z.r,{vy:-12,vx:(rand()-.5)*8,life:0.8,s:2,c:PAL.moc[(rand()*3)|0],add:0});
    if(z.leech&&rand()<VDT*30){const P=G.p,sx=z.x+(rand()-.5)*z.r,sy=z.y+(rand()-.5)*z.r*0.6;vp(sx,sy,{vx:(P.x-sx)*2,vy:(P.y-8-sy)*2,life:0.5,s:1.6,c:'#9fffc0',drag:0})}
    return}
  // Kiếm Trận: vòng trận từ ảnh mẫu, cấp 3 thêm bát quái, cấp 4 vòng kiếm ngược, cấp 5 cột sáng
  const big=z.follow,c1=big?'#ffe680':'#ffd23f',D=z.r*2*grow*(1+L*0.04);
  glow(z.x,z.y,z.r*0.9,c1,0.18*a);
  fxD('fx_c_kiem',z.x,z.y,D,{sq:0.6,rot:G.t*1.2,alpha:0.8*a,add:1,tint:big?'gold':null});
  if(L>=3)fxD('fx_c_bagua',z.x,z.y,D*0.62,{sq:0.6,rot:-G.t*1.6,alpha:0.8*a,add:1});
  const n=(big?8:6)+(L>=2?L-1:0);for(let i=0;i<n;i++){const an=G.t*(big?6:5)+i/n*TAU,x=z.x+Math.cos(an)*z.r*0.85,y=z.y+Math.sin(an)*z.r*0.51;fxD(big?'fx_swordg':'fx_sword',x,y-7,13,{rot:-Math.PI/2,alpha:a});glow(x,y-6,5,c1,0.3*a)}
  if(L>=4)for(let i=0;i<4;i++){const an=-G.t*4+i/4*TAU,x=z.x+Math.cos(an)*z.r*0.4,y=z.y+Math.sin(an)*z.r*0.24;fxD('fx_swordg',x,y-6,10,{rot:an,alpha:a*0.9})}
  if(L>=5){fxD('fx_gsword',z.x,z.y-24*grow,40*grow,{alpha:0.8*a});glow(z.x,z.y-14,18,c1,0.55*a);if(rand()<VDT*30)vp(z.x+(rand()-.5)*8,z.y,{vy:-70-rand()*40,life:0.6,s:1.6,c:rand()<0.5?'#ffffff':c1,drag:0})}
  if(rand()<VDT*20){const an=rand()*TAU;vp(z.x+Math.cos(an)*z.r*0.8,z.y+Math.sin(an)*z.r*0.48,{vy:-25,life:0.5,s:1.4,c:c1})}
};

// ── chuông, hồ lô (dưới chân)
const _fuSV=drawFxUnder;
drawFxUnder=function(f){if(!SPR.fx_bell||(f.k!=='bell'&&f.k!=='gourd')){_fuSV(f);return}const L=svL(f),k=f.t/f.dur;
  if(f.k==='bell'){emitOnce(f,()=>{burstP(f.x,f.y-6,16+L*4,PAL.kim,{spd:f.r*2.2,life:0.5,s:2,flat:1})});
    if(L>=5)fxD('fx_lotus',f.x,f.y,f.r*1.1*(0.6+k*0.4),{sq:0.55,rot:k*0.6,alpha:(1-k)*0.7,add:1});
    fxD('fx_dust'+Math.min(3,(k*4)|0),f.x,f.y,f.r*2*(0.4+k*0.7),{sq:0.6,alpha:(1-k)*0.8,tint:'gold'});
    if(L>=3)fxD('fx_c_bagua',f.x,f.y,f.r*(1+k)*0.9,{sq:0.62,rot:k*2,alpha:(1-k)*0.7,add:1});
    if(L>=4){const kk=Math.max(0,(k-0.25)/0.75);if(kk>0)fxD('fx_dust'+Math.min(3,(kk*4)|0),f.x,f.y,f.r*2*(0.3+kk*0.9),{sq:0.6,alpha:(1-kk)*0.7,tint:'gold'})}
    return}
  // hồ lô: xoáy hút hồn
  fxD('fx_c_bang',f.x,f.y,f.r*2*(1-k*0.5),{sq:0.6,rot:-f.t*6,alpha:0.7*(1-k),add:1,tint:'pink'});
  if(L>=3)fxD('fx_c_bang',f.x,f.y,f.r*1.2*(1-k*0.5),{sq:0.6,rot:f.t*9,alpha:0.6*(1-k),add:1,tint:'pink'});
  const n=2+L;if(rand()<0.9)for(let i=0;i<n;i++){const an=rand()*TAU,d=f.r*(0.7+rand()*0.5),sx=f.x+Math.cos(an)*d,sy=f.y+Math.sin(an)*d*0.6;vp(sx,sy,{vx:(f.x-sx)*2.6-Math.sin(an)*40,vy:(f.y-22-sy)*2.6+Math.cos(an)*24,life:0.42,s:1.8,c:PAL.hon[(rand()*3)|0],drag:0})}};
// ── sét, chuông, hồ lô (trên)
const _foSV=drawFxOver;
drawFxOver=function(f){if(!SPR.fx_bell){_foSV(f);return}const L=svL(f),k=f.t/f.dur;
  if(f.k==='bolt'&&f.wl){emitOnce(f,()=>{for(let i=1;i<f.pts.length;i++)burstP(f.pts[i][0],f.pts[i][1],4+L*2,PAL.loi,{spd:70+L*10,life:0.3,s:1.6})});
    const w=1.4+(L-1)*0.35;if(L>=5)drawBolt(f.pts,(1-k)*0.8,['#ffffff','#ffe680','#ffb02e'],w*0.8);
    drawBolt(f.pts,1-k,PAL.loi,w);if(L>=3)drawBolt(f.pts,(1-k)*0.7,['#ffffff','#e6dcff','#b39bff'],w*0.45);
    for(let i=1;i<f.pts.length;i++){const [x,y]=f.pts[i];fxD('fx_lt'+Math.min(3,(k*4)|0),x,y,14+L*3,{add:1});if(L>=4)fxD('fx_c_kiem',x,y+6,14+k*14,{sq:0.55,rot:G.t*6,alpha:1-k,add:1,tint:'pink'})}
    glow(f.pts[0][0],f.pts[0][1],10+L*2,'#e6dcff',1-k);return}
  if(f.k==='bellspr'){const drop=Math.min(1,k*4),y=f.y-30+drop*14,sz=(f.big?32:24)+L*2.5,wob=Math.sin(k*20)*0.12*(1-k);
    if(L>=4)fxD('fx_c_hoa',f.x,y,sz*1.6,{rot:G.t*2,alpha:(1-k)*0.5,add:1,tint:'gold'});
    glow(f.x,y,sz*0.9,'#ffd23f',(1-k)*0.7);fxD('fx_bell',f.x,y,sz,{rot:wob,alpha:Math.min(1,(1-k)*3)});return}
  if(f.k==='gourdspr'){const y=f.y-36,t2=Math.min(1,k*3),sz=(f.big?18:14)+L*1.5;glow(f.x,y,sz*0.8+L*2,'#9b8cff',(1-k)*0.85);fxD('fx_gourd',f.x,y,sz,{rot:-0.7*t2,alpha:Math.min(1,(1-k)*3)});return}
  _foSV(f)};

// ── khiên đá Thổ Thuẫn
const _orbSV=drawOrb;
drawOrb=function(o){if(!SPR.fx_rock){_orbSV(o);return}const w=G.w.thothuan,L=w?w.lv:1,ev=w&&w.evo,sz=11+L*1.3;
  ell(o.x,o.y+6,5+L*0.4,2,'#1f3a1a',0.22);
  if(L>=3||ev)glow(o.x,o.y,9+L,ev?'#ffc83a':'#ff9a3a',0.3+L*0.05);
  if(L>=4)for(let i=0;i<3;i++){const an=G.t*5+i/3*TAU+o.a;fxD('fx_rock',o.x+Math.cos(an)*9,o.y+Math.sin(an)*5,4,{rot:an})}
  fxD('fx_rock',o.x,o.y,sz,{rot:o.a*0.5,tint:ev?'gold':null});
  if(L>=5&&rand()<VDT*12)vp(o.x+(rand()-.5)*8,o.y+(rand()-.5)*8,{life:0.35,s:1.6,c:'#ffffff',drag:3})};

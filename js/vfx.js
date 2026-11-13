'use strict';
// ───────────────────────── hiệu ứng kỹ năng: hệ hạt, sprite pháp khí, vụ nổ, sét, băng, trận pháp
// Tải sau render.js: thay drawProj / drawZone / drawFxUnder / drawFxOver bằng bản đẹp hơn.
const VP=[]; let VP_MAX=1100, VPK=1;
function vfxQ(){VP_MAX=[300,650,1100][FXQ];VPK=[0.3,0.6,1][FXQ];if(VP.length>VP_MAX)VP.splice(0,VP.length-VP_MAX)}
const PAL={
  kim:['#fffbe0','#ffe680','#ffc83a','#c8901a'], hoa:['#fff6c0','#ffc23a','#ff7a1f','#d4341a'], thuy:['#ffffff','#c8f4ff','#6fd6ff','#2a8fe0'],
  moc:['#f0ffd0','#9ff06a','#4fcf4a','#23802a'], tho:['#fff0c8','#e8c27a','#b8843a','#6a4a22'], loi:['#ffffff','#e6dcff','#b39bff','#6a4ae0'],
  hon:['#ffffff','#e0d6ff','#9b8cff','#5a3ab0'], burst:['#ffffff','#fff4c0','#ffd45a','#ff9a3a'],
};
// p: {x,y,vx,vy,life,max,s,c,add,g,drag,k}
function vp(x,y,o){if(VPK<1&&rand()>VPK)return null;if(VP.length>=VP_MAX)VP.shift();const p=Object.assign({x,y,vx:0,vy:0,life:0.5,s:1.5,c:'#fff',add:1,g:0,drag:2,k:0,rot:0,vr:0},o);p.max=p.life;VP.push(p);return p}
function burstP(x,y,n,pal,o={}){for(let i=0;i<n;i++){const a=rand()*TAU,s=(o.spd||60)*(0.3+rand()*0.8);vp(x,y,{vx:Math.cos(a)*s,vy:Math.sin(a)*s*(o.flat?0.6:1)-(o.up||0),life:(o.life||0.45)*(0.6+rand()*0.7),s:(o.s||1.6)*(0.6+rand()*0.8),c:pal[(rand()*pal.length)|0],g:o.g||0,drag:o.drag??3,k:o.k||0,add:o.add??1})}}
function updateVfx(dt){
  hitT-=dt;
  for(const p of VP){p.life-=dt;const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy*=d;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt}
  let w=0;for(let i=0;i<VP.length;i++)if(VP[i].life>0)VP[w++]=VP[i];VP.length=w;
}
function drawVfx(layer){
  for(const p of VP){if((p.k===2)!==(layer==='under'))continue;const k=p.life/p.max;
    ctx.globalCompositeOperation=p.add?'lighter':'source-over';ctx.globalAlpha=Math.min(1,k*1.6)*(p.a??1);ctx.fillStyle=p.c;
    if(p.k===1){const s=p.s*(1.8-k*0.8);ctx.globalAlpha*=0.45;ctx.beginPath();ctx.arc(p.x,p.y,s,0,TAU);ctx.fill()} // khói/bụi
    else if(p.k===3){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.s,-p.s*0.35,p.s*2,p.s*0.7);ctx.restore()} // mảnh dài (băng, cánh hoa)
    else{const s=p.s*(0.4+k*0.6);ctx.fillRect(p.x-s/2,p.y-s/2,s,s)}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
}
// quầng sáng dựng sẵn theo màu
const GLOW={};
function glowSpr(c){if(GLOW[c])return GLOW[c];const s=64,cv=mk(s,s),x=cv.getContext('2d'),g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,c);g.addColorStop(0.35,c+'99');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,s,s);return GLOW[c]=cv}
function glow(x,y,r,c,a=1){if(FXQ===0&&a<0.3)return;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.drawImage(glowSpr(c),x-r,y-r,r*2,r*2);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}

// ── sprite pháp khí vẽ bằng ma trận pixel
function pixSpr(rows,pal){const h=rows.length,w=rows[0].length,c=mk(w,h),x=c.getContext('2d');for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];if(ch!=='.'&&pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,j,1,1)}}return c}
const PS={};
function buildPS(){
  const sword=['......................','.k...................',  'kgk..............wwww.','kGGdddddddddddddwWWWWw','kgk..............wwww.','.k...................'];
  PS.sword=pixSpr(['..........oooo..','.k.......owwwwo.','kgkddddddwWWWWWo','kGgDDDDDDWWWWWWW','kgkddddddwWWWWWo','.k.......owwwwo.','..........oooo..'].map(r=>r.slice(0,16)),{k:'#5a3a1a',g:'#ffcf3a',G:'#fff3a0',d:'#9ac0e0',D:'#c8e4ff',w:'#e8f4ff',W:'#ffffff',o:'#7aa0c8'});
  PS.swordG=pixSpr(['..........oooo..','.k.......owwwwo.','kgkddddddwWWWWWo','kGgDDDDDDWWWWWWW','kgkddddddwWWWWWo','.k.......owwwwo.','..........oooo..'],{k:'#7a3a0a',g:'#ffffff',G:'#fff3a0',d:'#ffb02e',D:'#ffd45a',w:'#ffe680',W:'#fffbe0',o:'#c8801a'});
  PS.ice=pixSpr(['....oo....','..owWWo...','owWWWWWWo.','oWWbbbWWWo','.obbbbbbo.','...oooo...'],{o:'#2a8fe0',w:'#c8f4ff',W:'#ffffff',b:'#6fd6ff'});
  PS.tali=pixSpr(['yyyyyyy','yrrrrry','yyyryyy','yrrrrry','yyyryyy','yyrryyy','yryyryy','yyyryyy','yyrrryy','yyyyyyy','.y.y.y.'],{y:'#ffe066',r:'#d42a2a'});
  PS.taliG=pixSpr(['yyyyyyy','yrrrrry','yyyryyy','yrrrrry','yyyryyy','yyrryyy','yryyryy','yyyryyy','yyrrryy','yyyyyyy','.y.y.y.'],{y:'#fff3b0',r:'#ff3a8a'});
  PS.rock=pixSpr(['...kkkk...','..kbbbbk..','.kbBBBbbk.','kbBBWBbbbk','kbBBBbbbak','kbbbbbbaak','.kbbbbaak.','..kkkkkk..'],{k:'#4a3018',b:'#b8843a',B:'#e8c27a',W:'#fff0c8',a:'#8a5a2a'});
  PS.rockG=pixSpr(['...kkkk...','..kbbbbk..','.kbBBBbbk.','kbBBWBbbbk','kbBBBbbbak','kbbbbbbaak','.kbbbbaak.','..kkkkkk..'],{k:'#6a4a0a',b:'#ffc83a',B:'#ffe680',W:'#ffffff',a:'#c8901a'});
  PS.bell=pixSpr(['.......kk.......','......kyyk......','....kkyyyykk....','...kyyYYYYyyk...','...kyYWWYYyyk...','..kyyYWYYYyyyk..','..kyyYYYYYyyyk..','..kyyYYYYyyyak..','.kyyyYYYyyyyaak.','.kyyyyyyyyyaaak.','kyyyyyyyyyyyaaak','krrrrrrrrrrrrrrk','kyyyyyyyyyyyyyyk','.kkkkkkkkkkkkkk.','.......kk.......','......kyyk......'],{k:'#7a4a0a',y:'#ffc83a',Y:'#ffe680',W:'#ffffff',a:'#c8901a',r:'#d42a2a'});
  PS.gourd=pixSpr(['....kkkk....','....kbbk....','...krrrrk...','...kyyYyk...','..kyyYYyyk..','..kyYWYyyk..','..kyyyyyak..','...kyyyak...','..kyyyyyak..','.kyyYYyyyak.','kyyYWYyyyyak','kyyYYyyyyyak','kyyyyyyyyaak','.kyyyyyyaak.','..kkaaaakk..','....kkkk....'],{k:'#5a3a1a',b:'#8a5a2a',r:'#d42a2a',y:'#e0a03a',Y:'#ffd08a',W:'#fff6e0',a:'#a8701a'});
  PS.glyph=['卍','☯','✦','✧'];
}
function drawRot(spr,x,y,a,sc=1,alpha=1,add=false){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=alpha;if(add)ctx.globalCompositeOperation='lighter';ctx.drawImage(spr,-spr.width*sc/2,-spr.height*sc/2,spr.width*sc,spr.height*sc);ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

// ── vệt đuôi cho đạn (lưu vị trí cũ)
function trail(p,n=5){if(FXQ<2)n=FXQ?Math.ceil(n*0.6):2;if(!p.tr)p.tr=[];p.tr.unshift([p.x,p.y]);if(p.tr.length>n)p.tr.length=n;return p.tr}
let VDT=0;
function drawProj(p){
  if(p.k==='sword'){const a=Math.atan2(p.vy,p.vx),S=p.gold?PS.swordG:PS.sword,T=trail(p,6),col=p.gold?'#ffd45a':'#9fd8ff';
    for(let i=T.length-1;i>0;i--)drawRot(S,T[i][0],T[i][1],a,0.9,0.22*(1-i/T.length),true);
    glow(p.x,p.y,9,col,0.55);drawRot(S,p.x,p.y,a,0.9);
    if(rand()<VDT*40)vp(p.x-p.vx*0.02,p.y-p.vy*0.02,{vx:-p.vx*0.1+(rand()-.5)*10,vy:-p.vy*0.1+(rand()-.5)*10,life:0.3,s:1.4,c:p.gold?'#ffe680':'#e8f8ff'})}
  else if(p.k==='fire'){const T=trail(p,7),blue=p.burn,c1=blue?'#9fe8ff':'#ffb02e',c2=blue?'#ffffff':'#fff6c0',c0=blue?'#4c8fff':'#ff5a1f';
    for(let i=T.length-1;i>0;i--){const k=1-i/T.length;glow(T[i][0],T[i][1],(5+k*4),c0,0.35*k)}
    glow(p.x,p.y,13,c0,0.6);
    const f=Math.sin(G.t*40+p.x)*0.8;dot(p.x,p.y,4.6+f*0.4,c0);dot(p.x+0.3,p.y-0.3,3.2,c1);dot(p.x+0.6,p.y-0.8,1.6+f*0.2,c2);
    if(rand()<VDT*70)vp(p.x+(rand()-.5)*4,p.y+(rand()-.5)*4,{vx:-p.vx*0.15+(rand()-.5)*20,vy:-p.vy*0.15-10-rand()*15,life:0.45,s:1.8,c:blue?PAL.thuy[(rand()*3)|0]:PAL.hoa[(rand()*4)|0]});
    if(rand()<VDT*12)vp(p.x,p.y,{vx:(rand()-.5)*8,vy:-8,life:0.7,s:3,c:'#8a8a9a',k:1,add:0})}
  else if(p.k==='ice'){const a=Math.atan2(p.vy,p.vx),T=trail(p,5);
    for(let i=T.length-1;i>0;i--)drawRot(PS.ice,T[i][0],T[i][1],a,0.8,0.2*(1-i/T.length),true);
    glow(p.x,p.y,8,'#6fd6ff',0.5);drawRot(PS.ice,p.x,p.y,a,0.8);
    if(rand()<VDT*30)vp(p.x,p.y,{vx:(rand()-.5)*14,vy:(rand()-.5)*14,life:0.5,s:1.3,c:rand()<0.5?'#ffffff':'#c8f4ff',drag:4})}
  else if(p.k==='tali'){const S=p.chain?PS.taliG:PS.tali,stuck=p.stick>=0,a=stuck?Math.sin(G.t*30)*0.15:G.t*14;
    if(!stuck){const T=trail(p,6);for(let i=T.length-1;i>0;i--)glow(T[i][0],T[i][1],4,p.chain?'#ff6bd0':'#ff7a1f',0.3*(1-i/T.length))}
    glow(p.x,p.y,stuck?10+(0.35-p.stick)*20:7,p.chain?'#ff6bd0':'#ff9a3a',stuck?0.8:0.45);drawRot(S,p.x,p.y,a,0.85);
    if(stuck){ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,0.6);ring(0,0,5+(0.35-p.stick)*30,p.chain?'#ff6bd0':'#ffd45a',1,0.8);ctx.restore();if(rand()<VDT*40)vp(p.x+(rand()-.5)*6,p.y,{vy:-20-rand()*20,vx:(rand()-.5)*10,life:0.4,s:1.4,c:PAL.hoa[(rand()*3)|0]})}}
}
function drawZone(z){
  const k=1-z.t/z.dur, a=Math.min(1,z.t*5)*Math.min(1,k*4), grow=Math.min(1,z.t/0.3);
  if(z.k==='vine'){const R=mulberry32(z.seed|0),lc=z.leech?'#9fffc0':'#7ef06a';
    ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.6);ctx.globalAlpha=0.16*a;ctx.fillStyle=z.leech?'#3fffa0':'#3fcf4a';ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.fill();ring(0,0,z.r*grow,lc,1,0.5*a);ctx.restore();
    ctx.lineCap='round';
    for(let i=0;i<16;i++){const an=R()*TAU,rr=Math.sqrt(R())*z.r,x=z.x+Math.cos(an)*rr,y=z.y+Math.sin(an)*rr*0.6,h=(7+R()*9)*grow,sw=Math.sin(G.t*4+i)*2;
      ctx.globalAlpha=a;ctx.strokeStyle='#1f6a26';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sw-3,y-h*0.6,x+sw*1.5,y-h);ctx.stroke();
      ctx.strokeStyle='#4fcf4a';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=lc;ctx.fillRect(x+sw*1.5-1.5,y-h-1,3,2);ctx.fillStyle='#2f9e36';ctx.fillRect(x+sw-2,y-h*0.5,2,1);ctx.fillRect(x+sw+1,y-h*0.7,2,1)}
    ctx.globalAlpha=1;ctx.lineCap='butt';
    if(rand()<VDT*20)vp(z.x+(rand()-.5)*z.r*1.6,z.y+(rand()-.5)*z.r,{vy:-12,vx:(rand()-.5)*8,life:0.8,s:2,c:PAL.moc[(rand()*3)|0],k:3,vr:4,add:0});
    if(z.leech&&rand()<VDT*30){const P=G.p,sx=z.x+(rand()-.5)*z.r,sy=z.y+(rand()-.5)*z.r*0.6;vp(sx,sy,{vx:(P.x-sx)*2,vy:(P.y-8-sy)*2,life:0.5,s:1.6,c:'#9fffc0',drag:0})}}
  else if(z.k==='array'){const big=z.follow,c1=big?'#ffe680':'#ffd23f';
    ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.6);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.07*a;ctx.fillStyle=c1;ctx.beginPath();ctx.arc(0,0,z.r*grow,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.rotate(G.t*1.2);ring(0,0,z.r*grow,c1,1.6,0.85*a);for(let i=0;i<12;i++){const an=i/12*TAU;ctx.globalAlpha=0.8*a;ctx.fillStyle=c1;ctx.fillRect(Math.cos(an)*z.r*0.9-1,Math.sin(an)*z.r*0.9-1,2,2)}ctx.restore();
    ctx.save();ctx.rotate(-G.t*2);ring(0,0,z.r*0.66*grow,'#fff3a0',1,0.7*a);ctx.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU*2;const x=Math.cos(an)*z.r*0.66,y=Math.sin(an)*z.r*0.66;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.strokeStyle='#fff3a0';ctx.lineWidth=0.8;ctx.globalAlpha=0.5*a;ctx.stroke();ctx.restore();
    ctx.restore();ctx.globalAlpha=1;
    const n=big?8:6;for(let i=0;i<n;i++){const an=G.t*(big?6:5)+i/n*TAU,x=z.x+Math.cos(an)*z.r*0.8,y=z.y+Math.sin(an)*z.r*0.48;drawRot(big?PS.swordG:PS.sword,x,y-6,an+Math.PI/2,0.75,a);glow(x,y-6,6,c1,0.35*a)}
    if(rand()<VDT*25){const an=rand()*TAU;vp(z.x+Math.cos(an)*z.r*0.8,z.y+Math.sin(an)*z.r*0.48,{vy:-25,life:0.5,s:1.4,c:c1})}}
  else if(z.k==='burn'){const c=z.blue?'#4c8fff':'#ff6b1f';glow(z.x,z.y,z.r*1.1,c,0.35*a);ell(z.x,z.y,z.r,z.r*0.55,'#3a1a0a',0.25*a);
    if(rand()<VDT*40){const an=rand()*TAU,d=rand()*z.r*0.8;vp(z.x+Math.cos(an)*d,z.y+Math.sin(an)*d*0.55,{vy:-25-rand()*25,vx:(rand()-.5)*6,life:0.5,s:2.2,c:PAL.hoa[(rand()*4)|0]})}}
  else if(z.k==='poison'){ell(z.x,z.y,z.r,z.r*0.55,'#8a3fd0',0.3*a);ell(z.x,z.y,z.r*0.6,z.r*0.33,'#b7ff4a',0.25*a);
    if(rand()<VDT*10)vp(z.x+(rand()-.5)*z.r,z.y+(rand()-.5)*z.r*0.5,{vy:-8,life:0.9,s:1.8,c:'#b7ff4a',a:0.7})}
}
function emitOnce(f,fn){if(!f.em){f.em=1;fn()}}
function drawFxUnder(f){
  const k=f.t/f.dur;
  if(f.k==='bell'){emitOnce(f,()=>{burstP(f.x,f.y-6,26,PAL.kim,{spd:f.r*2.2,life:0.5,s:2,flat:1})});
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.62);for(let i=0;i<3;i++){const kk=Math.min(1,k*1.4-i*0.18);if(kk<=0)continue;ring(0,0,f.r*(0.25+kk*0.75),i?'#fff3a0':'#ffd23f',(3-i)*(1-kk),1-kk)}
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.22*(1-k);ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(0,0,f.r*(0.3+k*0.7),0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  else if(f.k==='gourd'){ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);for(let i=0;i<4;i++)ring(0,0,f.r*(1-((k*1.5+i/4)%1)),'#9b8cff',1.5,0.7*(1-k));ctx.restore();
    if(rand()<0.9){for(let i=0;i<3;i++){const an=rand()*TAU,d=f.r*(0.7+rand()*0.5),sx=f.x+Math.cos(an)*d,sy=f.y+Math.sin(an)*d*0.6;vp(sx,sy,{vx:(f.x-sx)*2.6-Math.sin(an)*40,vy:(f.y-22-sy)*2.6+Math.cos(an)*24,life:0.42,s:1.8,c:PAL.hon[(rand()*3)|0],drag:0})}}}
  else if(f.k==='frost'){emitOnce(f,()=>{for(let i=0;i<40;i++){const an=i/40*TAU;vp(f.x+Math.cos(an)*10,f.y+Math.sin(an)*6,{vx:Math.cos(an)*f.r*2.6,vy:Math.sin(an)*f.r*1.6,life:0.45,s:2.4,c:i%2?'#ffffff':'#9fe8ff',k:3,rot:an,drag:3})}});
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.3*(1-k);ctx.fillStyle='#bff4ff';ctx.beginPath();ctx.arc(0,0,f.r*Math.min(1,k*3),0,TAU);ctx.fill();ctx.restore();ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;ring(f.x,f.y,f.r*Math.min(1,k*3),'#e8fbff',2,1-k);
    for(let i=0;i<14;i++){const an=i/14*TAU,rr=f.r*Math.min(1,k*3)*0.9,x=f.x+Math.cos(an)*rr,y=f.y+Math.sin(an)*rr*0.6;ctx.globalAlpha=1-k;ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x,y-9*(1-k));ctx.lineTo(x+2,y);ctx.fill()}ctx.globalAlpha=1}
  else if(f.k==='scorch'){const a=Math.min(1,(f.dur-f.t)/1.5)*0.42,R=mulberry32(f.sd|0);ell(f.x,f.y,f.r*1.05,f.r*0.55,'#2a1830',a);ell(f.x,f.y,f.r*0.6,f.r*0.3,'#120818',a);
    ctx.globalAlpha=a;ctx.strokeStyle='#1a0c22';ctx.lineWidth=1;for(let i=0;i<7;i++){const an=R()*TAU,l=f.r*(0.9+R()*0.6);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(an)*l*0.6,f.y+Math.sin(an)*l*0.35);ctx.lineTo(f.x+Math.cos(an+0.2)*l,f.y+Math.sin(an+0.2)*l*0.55);ctx.stroke()}ctx.globalAlpha=1;
    if(f.t<1.5&&rand()<0.3)vp(f.x+(R()-.5)*f.r,f.y,{vy:-12,vx:(rand()-.5)*4,life:0.9,s:2.2,c:'#8a7a9a',k:1,add:0,a:0.4,drag:1});
    if(f.t<0.8&&rand()<0.4)vp(f.x+(rand()-.5)*f.r,f.y,{vy:-30,life:0.4,s:1.2,c:'#e6dcff'})}
  else if(f.k==='btcrack'){const C=BT_PAL[f.r],a=Math.min(1,(f.dur-f.t)/1.5),R=mulberry32(f.sd|0);ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);
    for(let i=0;i<10;i++){let an=R()*TAU,x=0,y=0;const L=28+R()*36,gl=Math.max(0,1-f.t*0.8);ctx.beginPath();ctx.moveTo(0,0);for(let j=0;j<5;j++){an+=(R()-.5)*0.6;x+=Math.cos(an)*L/5;y+=Math.sin(an)*L/5;ctx.lineTo(x,y)}
      ctx.globalAlpha=0.28*a;ctx.strokeStyle='#3a2a20';ctx.lineWidth=1.2;ctx.stroke();if(gl>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=gl*a;ctx.strokeStyle=C[0];ctx.lineWidth=0.9;ctx.stroke();ctx.globalCompositeOperation='source-over'}}
    ctx.restore();ctx.globalAlpha=1}
  else if(f.k==='btwave'){const C=BT_PAL[f.r];emitOnce(f,()=>{burstP(f.x,f.y-10,140,[C[0],C[1],'#ffffff'],{spd:300,life:1,s:2.4,flat:1});for(let i=0;i<40;i++){const an=i/40*TAU;vp(f.x+Math.cos(an)*10,f.y+Math.sin(an)*5,{vx:Math.cos(an)*200,vy:Math.sin(an)*110,life:0.7,s:3,c:'#e8dcc0',k:1,add:0,a:0.5,drag:3})}});
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);for(let i=0;i<4;i++){const kk=Math.min(1,k*1.4-i*0.12);if(kk<=0)continue;ring(0,0,15+kk*(200+i*20),i%2?C[0]:'#ffffff',6*(1-kk)+0.5,(1-kk)*0.9)}
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.35*(1-k);ctx.fillStyle=C[0];ctx.beginPath();ctx.arc(0,0,40+k*120,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  else if(f.k==='heal'){ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,f.r*k,'#7bff9a',2,1-k);ctx.restore();emitOnce(f,()=>burstP(f.x,f.y-6,14,['#7bff9a','#d0ffd8','#ffffff'],{spd:40,up:20,life:0.7}))}
  else if(f.k==='burst'){emitOnce(f,()=>{burstP(f.x,f.y-8,80,PAL.burst,{spd:260,life:0.6,s:2.4,flat:1});for(let i=0;i<12;i++)f['a'+i]=rand()*TAU});
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.62);ring(0,0,210*k,'#fff4c0',7*(1-k),1-k);ring(0,0,180*k,'#ffd23f',3*(1-k),1-k);ctx.restore();
    // kiếm khí hình lưỡi liềm quét ra 8 hướng
    for(let i=0;i<8;i++){const an=i/8*TAU+0.2,d=40+k*170,x=f.x+Math.cos(an)*d,y=f.y-8+Math.sin(an)*d*0.62;ctx.save();ctx.translate(x,y);ctx.rotate(an);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-k)*0.9;ctx.strokeStyle='#fff4c0';ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.arc(-6,0,14,-1.1,1.1);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();ctx.restore()}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
}
// tia sét phân nhánh
function boltPath(x0,y0,x1,y1,dev,depth,out){if(depth<=0){out.push([x1,y1]);return}const mx=(x0+x1)/2+(rand()-.5)*dev,my=(y0+y1)/2+(rand()-.5)*dev;boltPath(x0,y0,mx,my,dev/2,depth-1,out);boltPath(mx,my,x1,y1,dev/2,depth-1,out)}
function drawBolt(pts,a,cols,w){
  const P=[pts[0]];for(let i=1;i<pts.length;i++){boltPath(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])*0.35,4,P)}
  ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';
  const L=[[w*3.2,cols[2],0.35],[w*1.6,cols[1],0.8],[w*0.6,cols[0],1]];
  for(const [lw,c,al] of L){ctx.globalAlpha=a*al;ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}
  // nhánh phụ
  ctx.globalAlpha=a*0.6;ctx.strokeStyle=cols[1];ctx.lineWidth=w*0.6;for(let i=2;i<P.length-2;i+=5){if(rand()<0.5)continue;const [x,y]=P[i],an=rand()*TAU,L2=6+rand()*10,Q=[[x,y]];boltPath(x,y,x+Math.cos(an)*L2,y+Math.sin(an)*L2,5,2,Q);ctx.beginPath();Q.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineJoin='miter';
}
function drawFxOver(f){
  const k=f.t/f.dur;
  if(f.k==='bolt'){emitOnce(f,()=>{for(let i=1;i<f.pts.length;i++)burstP(f.pts[i][0],f.pts[i][1],6,PAL.loi,{spd:70,life:0.3,s:1.6})});
    drawBolt(f.pts,1-k,PAL.loi,1.6);for(let i=1;i<f.pts.length;i++)glow(f.pts[i][0],f.pts[i][1],12,'#b39bff',(1-k)*0.8);glow(f.pts[0][0],f.pts[0][1],10,'#e6dcff',(1-k))}
  else if(f.k==='boom'){const r=f.r,R=mulberry32((f.x*7+f.y*13)|0);
    emitOnce(f,()=>{burstP(f.x,f.y,Math.min(28,10+r),PAL.hoa,{spd:r*4,life:0.5,s:2.2});for(let i=0;i<3;i++)vp(f.x+(rand()-.5)*r,f.y+(rand()-.5)*r*0.5,{vx:(rand()-.5)*20,vy:-10-rand()*20,life:0.6+rand()*0.3,s:r*0.1+1.2,c:rand()<0.5?"#b8b0c0":"#d0c8d8",a:0.4,k:1,add:0,drag:1.5})});
    if(k<0.2)glow(f.x,f.y,r*1.1,'#fff6c8',(0.2-k)*3.5);
    glow(f.x,f.y,r*1.15,'#ff6a1f',(1-k)*0.6);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<9;i++){const an=i/9*TAU+R(),d=r*(0.15+k*0.55)*(0.6+R()*0.6),br=r*(0.45-k*0.3)*(0.6+R()*0.6),x=f.x+Math.cos(an)*d,y=f.y+Math.sin(an)*d*0.75-k*6;
      ctx.globalAlpha=(1-k)*0.9;ctx.fillStyle=k<0.3?'#ffe680':k<0.6?'#ff9a3a':'#d4341a';ctx.beginPath();ctx.arc(x,y,Math.max(0.5,br),0,TAU);ctx.fill()}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,r*(0.5+k*0.9),'#ffe08a',2.5*(1-k),1-k);ctx.restore()}
  else if(f.k==='spark'){glow(f.x,f.y,6*(1-k)+2,f.c||'#ffffff',1-k);emitOnce(f,()=>burstP(f.x,f.y,4,[f.c||'#ffffff','#ffffff'],{spd:50,life:0.25,s:1.2}))}
  else if(f.k==='soul'){emitOnce(f,()=>burstP(f.x,f.y-8,16,PAL.hon,{spd:30,up:40,life:0.8,s:1.8,drag:1}));glow(f.x,f.y-10-k*20,10*(1-k)+3,'#9b8cff',1-k)}
  else if(f.k==='slash'){const a=f.a;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=2.4*(1-k)+0.6;ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(8,3);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=0.8;ctx.stroke();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  else if(f.k==='strike'){const top=camY-10,col=f.gold?'#ffd45a':'#b39bff';
    emitOnce(f,()=>{burstP(f.x,f.y,22,f.gold?PAL.kim:PAL.loi,{spd:120,life:0.45,s:2,flat:1});for(let i=0;i<6;i++)vp(f.x+(rand()-.5)*f.r,f.y,{vx:(rand()-.5)*30,vy:-10-rand()*20,life:0.8,s:4,c:'#a0a0b0',k:1,add:0})});
    if(k<0.55){const a=1-k/0.55;drawBolt([[f.x+(rand()-.5)*20,top],[f.x,f.y]],a,f.gold?PAL.kim:PAL.loi,f.gold?2.6:3.2);glow(f.x,f.y,f.r*1.6,col,a*0.7)}
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,f.r*(0.6+k*1.4),'#ffffff',2*(1-k),1-k);ctx.restore();ell(f.x,f.y,f.r*1.1,f.r*0.55,'#2a1a3a',0.18*(1-k))}
  else if(f.k==='pillar'){const a=Math.sin(Math.min(1,k*1.2)*Math.PI);const w=26*(1-k*0.5);const g=ctx.createLinearGradient(f.x-w,0,f.x+w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,f.c);g.addColorStop(1,'rgba(255,255,255,0)');
    emitOnce(f,()=>{for(let i=0;i<60;i++)vp(f.x+(rand()-.5)*40,f.y-rand()*20,{vy:-80-rand()*120,vx:(rand()-.5)*20,life:1+rand()*0.8,s:1.8,c:rand()<0.5?f.c:'#ffffff',drag:0.5})});
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.75*a;ctx.fillStyle=g;ctx.fillRect(f.x-w,camY-20,w*2,f.y-camY+20);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,30+k*170,f.c,4*(1-k),1-k);ring(0,0,20+k*120,'#ffffff',2*(1-k),1-k);ctx.restore();
    if(rand()<0.5)vp(f.x+(rand()-.5)*w*1.6,f.y,{vy:-140,life:0.8,s:1.6,c:'#ffffff',drag:0})}
  else if(f.k==='bossdie'){const A=BAURA[f.bt]||PAL[f.el]||PAL.kim;const col=Array.isArray(A)?A[0]:'#ffd45a';
    emitOnce(f,()=>{burstP(f.x,f.y-f.r,90,[col,'#ffffff','#ffe680'],{spd:240,life:1,s:2.6});for(let i=0;i<14;i++)vp(f.x+(rand()-.5)*f.r*2,f.y-rand()*f.r,{vx:(rand()-.5)*30,vy:-20-rand()*30,life:0.9+rand()*0.5,s:f.r*0.18,c:'#d8d0e0',k:1,add:0,a:0.35,drag:1.2})});
    if(k<0.2)glow(f.x,f.y-f.r,f.r*3.5,'#ffffff',(0.2-k)*3);
    glow(f.x,f.y-f.r,f.r*2.4,col,(1-k)*0.55);
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);for(let i=0;i<3;i++){const kk=Math.min(1,k*1.6-i*0.15);if(kk>0)ring(0,0,f.r*(1+kk*8),i?col:'#ffffff',5*(1-kk),1-kk)}ctx.restore();
    ctx.save();ctx.translate(f.x,f.y-f.r);ctx.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const an=i/10*TAU+f.x;ctx.globalAlpha=(1-k)*0.5;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an-0.06)*f.r*9*Math.min(1,k*3),Math.sin(an-0.06)*f.r*9*Math.min(1,k*3));ctx.lineTo(Math.cos(an+0.06)*f.r*9*Math.min(1,k*3),Math.sin(an+0.06)*f.r*9*Math.min(1,k*3));ctx.fill()}ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  else if(f.k==='scorch'){}
  else if(f.k==='bellspr'){const drop=Math.min(1,k*4),y=f.y-30+drop*14,sc=(f.big?1.5:1.1)*(1+Math.sin(k*30)*0.03*(1-k));glow(f.x,y,24*sc,'#ffd23f',(1-k)*0.7);drawRot(PS.bell,f.x,y,Math.sin(k*20)*0.12*(1-k),sc,Math.min(1,(1-k)*3))}
  else if(f.k==='gourdspr'){const y=f.y-30,t2=Math.min(1,k*3);glow(f.x,y,20,'#9b8cff',(1-k)*0.8);drawRot(PS.gourd,f.x,y,-0.7*t2,f.big?1.3:1,Math.min(1,(1-k)*3))}
}
// ── hook nhẹ gọi từ logic trận đấu
let hitT=0;
// khiên đá Thổ Thuẫn
function drawOrb(o){const ev=G.w.thothuan&&G.w.thothuan.evo;ell(o.x,o.y+6,5,2,'#1f3a1a',0.22);if(ev)glow(o.x,o.y,10,'#ffc83a',0.45);drawRot(ev?PS.rockG:PS.rock,o.x,o.y,o.a*0.5,1.1);
  if(rand()<VDT*6)vp(o.x,o.y+3,{vx:(rand()-.5)*6,vy:4,life:0.5,s:1.6,c:ev?'#ffe680':'#c99a55',k:1,add:0,a:0.6})}
function vfxHit(e,el,crit,src){
  if(hitT>0&&!crit)return;hitT=0.012;
  const pal=PAL[el]||PAL.burst,y=e.y-e.r;
  burstP(e.x,y,crit?8:3,pal,{spd:crit?90:55,life:0.25,s:crit?2:1.4});
  if(crit)G.fx.push({k:'slash',x:e.x,y,a:rand()*TAU,c:pal[1],t:0,dur:0.22});
  if(el==='thuy'&&rand()<0.5)for(let i=0;i<3;i++)vp(e.x,y,{vx:(rand()-.5)*60,vy:-20-rand()*30,g:120,life:0.5,s:2.2,c:'#e8fbff',k:3,vr:10,rot:rand()*3,add:0})
}
function vfxKill(e){const pal=PAL[e.el]||PAL.hon;burstP(e.x,e.y-e.r,e.d.boss?60:8,pal,{spd:e.d.boss?160:60,life:e.d.boss?0.9:0.4,s:e.d.boss?2.6:1.6});if(rand()<0.35||e.d.boss)vp(e.x,e.y-e.r,{vy:-30,life:0.7,s:3,c:'#c8b8ff',drag:1})}
function vfxPick(x,y,c){burstP(x,y,4,[c,'#ffffff'],{spd:30,life:0.3,s:1.2})}
function vfxLevel(){const P=G.p;for(let i=0;i<30;i++){const an=i/30*TAU;vp(P.x+Math.cos(an)*12,P.y+Math.sin(an)*6,{vx:Math.cos(an)*30,vy:-60-rand()*40,life:0.8,s:1.6,c:i%2?'#3fe0a6':'#ffffff',drag:1.2})}}
// ── cảnh tiến hóa (thần thông): chậm thời gian, tia sáng, tên chiêu
const CIMG={};
function cineImg(ic){if(CIMG[ic])return CIMG[ic];const im=new Image();if(typeof iconURL==='function')im.src=iconURL(ic);return CIMG[ic]=im}
function drawCine(c){
  const t=c.t,P=G.p,W=WEAP[c.k],E=EVO[c.k],px=P.x-camX,py=P.y-8-camY;
  const inA=Math.min(1,t/0.25),outA=t>2.1?Math.max(0,1-(t-2.1)/0.5):1,A=inA*outA;
  // nền tối + tia sáng xoay
  ctx.globalAlpha=0.55*A;ctx.fillStyle='#120a20';ctx.fillRect(0,0,VW,VH);
  ctx.save();ctx.translate(px,py);ctx.rotate(t*0.6);ctx.globalCompositeOperation='lighter';
  for(let i=0;i<14;i++){const a=i/14*TAU;ctx.globalAlpha=(i%2?0.18:0.32)*A;ctx.fillStyle=i%2?'#fff3a0':'#ffc83a';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a-0.09)*VH,Math.sin(a-0.09)*VH);ctx.lineTo(Math.cos(a+0.09)*VH,Math.sin(a+0.09)*VH);ctx.fill()}
  ctx.restore();ctx.globalCompositeOperation='source-over';
  glow(px,py,60+Math.sin(t*8)*4,'#ffd45a',0.8*A);
  // hai biểu tượng hợp nhất
  const im=cineImg(W.ic),ip=cineImg(PASS[E.p].ic),m=Math.min(1,t/0.9),ease=1-(1-m)**3,sz=30;
  ctx.imageSmoothingEnabled=false;
  if(t<1.0){const off=(1-ease)*60;ctx.globalAlpha=A;if(im.complete)ctx.drawImage(im,px-off-sz/2,py-40-sz/2,sz,sz);if(ip.complete)ctx.drawImage(ip,px+off-sz/2,py-40-sz/2,sz,sz)}
  else{const k=Math.min(1,(t-1)/0.25),sc=1+Math.sin(Math.min(1,k)*Math.PI)*0.5;if(k<1&&!c.boom){c.boom=1;burstP(P.x,P.y-48,70,PAL.kim,{spd:200,life:0.9,s:2.4});shake(0.4)}
    ctx.globalAlpha=A;if(im.complete)ctx.drawImage(im,px-sz*sc*0.7,py-40-sz*sc*0.7,sz*sc*1.4,sz*sc*1.4);glow(px,py-40,40*sc,'#ffffff',0.6*A*(1-k*0.5))}
  // chữ
  if(t>0.9){const k=Math.min(1,(t-0.9)/0.35),y=VH*0.26,sc=1+(1-k)*0.6;
    ctx.save();ctx.translate(VW/2,y);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=A*k;
    ctx.font=`800 11px 'Baloo 2',system-ui,sans-serif`;ctx.fillStyle='#ffe9a8';ctx.fillText(i18n('ui.vfx.thanThong','— THẦN THÔNG —'),0,-16);
    ctx.font=`800 ${E.n.length>16?17:20}px 'Baloo 2',system-ui,sans-serif`;ctx.lineWidth=4;ctx.strokeStyle='#5a2a0a';ctx.strokeText(E.n,0,2);
    const g=ctx.createLinearGradient(0,-10,0,12);g.addColorStop(0,'#ffffff');g.addColorStop(0.5,'#ffe066');g.addColorStop(1,'#ffa62a');ctx.fillStyle=g;ctx.fillText(E.n,0,2);
    ctx.font=`600 9px 'Baloo 2',system-ui,sans-serif`;ctx.fillStyle='#fff6d0';ctx.fillText(`${W.n} + ${PASS[E.p].n}`,0,20);ctx.restore()}
  ctx.globalAlpha=1;
}
buildPS();

// ── đạn của yêu quái và boss
const ESC={orb:['#f0d8ff','#c86bff','#7a2ad0'],foxfire:['#fff2c0','#ff9a3a','#d4341a'],iceshard:['#ffffff','#9fe8ff','#2a8fe0'],petal:['#ffe0ec','#ff4f8b','#a0144a'],blade:['#ffffff','#b89bff','#4b1b8c']};
function drawEShot(b){
  const P=ESC[b.k]||[ '#ffffff',b.c,b.c],a=Math.atan2(b.vy,b.vx),T=trail(b,5);
  glow(b.x,b.y,b.r*3.2,P[1],0.55);
  if(b.k==='foxfire'){for(let i=T.length-1;i>0;i--)glow(T[i][0],T[i][1],b.r*1.6*(1-i/T.length)+1,P[2],0.4);
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a+Math.PI/2);const f=Math.sin(b.t*30)*0.6;
    ctx.fillStyle=P[2];ctx.beginPath();ctx.moveTo(0,-b.r*1.1);ctx.quadraticCurveTo(b.r*1.2,0,0,b.r*2.4+f);ctx.quadraticCurveTo(-b.r*1.2,0,0,-b.r*1.1);ctx.fill();
    ctx.fillStyle=P[1];ctx.beginPath();ctx.arc(0,0,b.r*0.8,0,TAU);ctx.fill();ctx.fillStyle=P[0];ctx.beginPath();ctx.arc(0,-0.5,b.r*0.4,0,TAU);ctx.fill();ctx.restore();
    if(rand()<VDT*25)vp(b.x,b.y,{vx:-b.vx*0.2+(rand()-.5)*10,vy:-b.vy*0.2-10,life:0.35,s:1.4,c:P[rand()*3|0]})}
  else if(b.k==='iceshard'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);
    for(let i=1;i<4;i++){ctx.globalAlpha=0.25/i;ctx.fillStyle=P[1];ctx.fillRect(-b.r*2-i*4,-b.r*0.4,b.r*2,b.r*0.8)}ctx.globalAlpha=1;
    ctx.fillStyle=P[2];ctx.beginPath();ctx.moveTo(b.r*1.8,0);ctx.lineTo(0,-b.r*0.9);ctx.lineTo(-b.r*1.4,0);ctx.lineTo(0,b.r*0.9);ctx.fill();
    ctx.fillStyle=P[1];ctx.beginPath();ctx.moveTo(b.r*1.4,0);ctx.lineTo(0,-b.r*0.5);ctx.lineTo(-b.r,0);ctx.lineTo(0,b.r*0.5);ctx.fill();ctx.fillStyle=P[0];ctx.fillRect(-1,-0.6,b.r*1.2,1.2);ctx.restore();
    if(rand()<VDT*15)vp(b.x,b.y,{vx:(rand()-.5)*10,vy:(rand()-.5)*10,life:0.4,s:1.2,c:'#e8fbff'})}
  else if(b.k==='petal'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.t*9);
    for(let i=0;i<5;i++){ctx.rotate(TAU/5);ctx.fillStyle=i%2?P[1]:P[2];ctx.beginPath();ctx.ellipse(0,-b.r*0.8,b.r*0.55,b.r*0.95,0,0,TAU);ctx.fill()}
    ctx.fillStyle=P[0];ctx.beginPath();ctx.arc(0,0,b.r*0.45,0,TAU);ctx.fill();ctx.restore();
    if(rand()<VDT*8)vp(b.x,b.y,{vx:(rand()-.5)*14,vy:6,life:0.6,s:1.8,c:P[1],k:3,vr:6,add:0})}
  else if(b.k==='blade'){for(let i=T.length-1;i>0;i--)drawCres(T[i][0],T[i][1],a,b.r,P[2],0.3*(1-i/T.length));drawCres(b.x,b.y,a,b.r,P[1],1);drawCres(b.x,b.y,a,b.r*0.6,P[0],1)}
  else{for(let i=T.length-1;i>0;i--)glow(T[i][0],T[i][1],b.r*1.4*(1-i/T.length)+1,P[1],0.35);
    const pu=1+Math.sin(b.t*18)*0.12;dot(b.x,b.y,b.r*1.1*pu,P[2]);dot(b.x,b.y,b.r*0.75*pu,P[1]);dot(b.x-0.6,b.y-0.6,b.r*0.35,P[0]);
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.t*6);ctx.strokeStyle=P[0];ctx.globalAlpha=0.6;ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(0,0,b.r*1.6,0,1.6);ctx.stroke();ctx.beginPath();ctx.arc(0,0,b.r*1.6,3.14,4.7);ctx.stroke();ctx.restore();ctx.globalAlpha=1}
}
function drawCres(x,y,a,r,c,al){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=al;ctx.fillStyle=c;ctx.beginPath();ctx.arc(-r*0.4,0,r*1.6,-1.2,1.2);ctx.arc(-r*1.3,0,r*1.5,1.0,-1.0,true);ctx.fill();ctx.restore();ctx.globalAlpha=1}
function vfxEHit(b){const P=ESC[b.k]||['#fff',b.c,b.c];burstP(b.x,b.y,10,P,{spd:70,life:0.35,s:1.8});G.fx.push({k:'spark',x:b.x,y:b.y,t:0,dur:0.25,c:P[1]})}

// ── báo trước đòn, hào quang boss, hiệu ứng riêng khi yêu quái chết
const BAURA={cuuvi:['#ff9a3a','#ffd45a'],long:['#5ab8ff','#e8fbff'],maton:['#ff4f8b','#7a2ad0'],tamma:['#9b5cff','#2a0a4a']};
function preEnemy(e){
  if(e.dead)return;const d=e.d;
  // lao tới: vệt cảnh báo
  if((d.ai==='charge'||d.ai==='b_fox')&&e.st===1){const L=d.boss?150:110,k=1-Math.max(0,e.stT)/(d.boss?0.7:0.6);
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.cy,e.cx));ctx.globalAlpha=0.22+k*0.3;ctx.fillStyle='#ff2a6a';ctx.fillRect(0,-e.r*0.8,L,e.r*1.6);ctx.globalAlpha=0.8;ctx.fillStyle='#ff2a6a';ctx.fillRect(0,-e.r*0.8,L,0.8);ctx.fillRect(0,e.r*0.8-0.8,L,0.8);
    ctx.globalAlpha=0.7;ctx.fillStyle='#ffffff';ctx.fillRect(0,-0.5,L*k,1);ctx.beginPath();ctx.moveTo(L,-e.r);ctx.lineTo(L+8,0);ctx.lineTo(L,e.r);ctx.fill();ctx.restore();ctx.globalAlpha=1;
    if(rand()<VDT*30)vp(e.x+(rand()-.5)*e.r*2,e.y,{vx:-e.cx*30,vy:-8,life:0.4,s:2.5,c:'#e8d8b0',k:1,add:0,a:0.6})}
  if(d.ai==='charge'&&e.st===2&&rand()<VDT*40)vp(e.x,e.y-e.r*0.5,{vx:-e.vx*0.3,vy:-e.vy*0.3,life:0.3,s:2,c:'#ffd45a'});
  if(d.ai==='ranged'&&e.cd<0.6&&e.cd>0)glow(e.x+e.face*4,e.y-e.r-2,4+(0.6-e.cd)*10,'#c86bff',0.7);
  if(d.ai==='poison'&&e.cd<0.5&&e.cd>0)glow(e.x,e.y-e.r*0.5,6+(0.5-e.cd)*12,'#b7ff4a',0.5);
  if(d.ai==='heal'){const k=e.cd<0.8?(0.8-e.cd)/0.8:0;if(k>0){ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,0.6);ring(0,0,70*(1-k)+10,'#7bff9a',1.2,0.5*k);ctx.restore()}}
  if(d.ai==='hop'&&e.hopZ>0&&e.hopZ<1.5&&rand()<0.5)burstP(e.x,e.y,3,['#d8c8a0','#b8a880'],{spd:30,life:0.4,s:2.2,k:1,add:0,flat:1});
  if(d.boss){const A=BAURA[e.t]||['#ffd45a','#fff'],hard=e.hp<e.mhp*0.5;
    glow(e.x,e.y-e.r,e.r*(2.2+Math.sin(G.t*3)*0.15),A[0],hard?0.45:0.3);
    ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,0.5);ctx.rotate(G.t*(hard?1.6:0.8));ctx.globalAlpha=hard?0.7:0.45;ctx.strokeStyle=A[0];ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(0,0,e.r*1.5,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.globalAlpha=1;
    if(rand()<VDT*(hard?40:22)){const an=rand()*TAU;vp(e.x+Math.cos(an)*e.r,e.y-rand()*e.r*2,{vy:-25-rand()*20,vx:(rand()-.5)*10,life:0.8,s:1.8,c:A[rand()*2|0],drag:1})}
    // tụ lực trước khi bắn
    if(e.cd>0&&e.cd<0.7){const k=(0.7-e.cd)/0.7,y=e.y-(e.t==='maton'?20:e.t==='tamma'?12:14);glow(e.x,y,6+k*16,A[0],0.4+k*0.5);glow(e.x,y,3+k*6,'#ffffff',k);
      if(rand()<0.6){const an=rand()*TAU,dd=26*(1-k)+8;vp(e.x+Math.cos(an)*dd,y+Math.sin(an)*dd,{vx:-Math.cos(an)*dd*3,vy:-Math.sin(an)*dd*3,life:0.3,s:1.5,c:A[0],drag:0})}}}
}
const _drawEnemy=drawEnemy; drawEnemy=function(e){preEnemy(e);_drawEnemy(e)};
const KILLX={
  thi:e=>{burstP(e.x,e.y-e.r,6,['#f0e8d0','#c8b890'],{spd:70,life:0.5,s:2,k:3,add:0,g:120,up:30});burstP(e.x,e.y,5,['#d8c8a0'],{spd:30,life:0.6,s:3,k:1,add:0})},
  hon:e=>{for(let i=0;i<6;i++)vp(e.x+(rand()-.5)*8,e.y-e.r,{vx:(rand()-.5)*10,vy:-30-rand()*30,life:0.9,s:2.4,c:i%2?'#9fe8ff':'#e0f4ff',drag:1})},
  phien:e=>{for(let i=0;i<8;i++)vp(e.x+(rand()-.5)*10,e.y-e.r,{vx:(rand()-.5)*14,vy:-30-rand()*30,life:1,s:2.4,c:i%2?'#9b8cff':'#e0d6ff',drag:1})},
  quy:e=>{burstP(e.x,e.y-e.r,10,['#9a8a70','#c8b890','#6a5a48'],{spd:90,life:0.6,s:2.6,k:3,add:0,g:160,up:40})},
  trung:e=>{burstP(e.x,e.y-e.r,10,['#ffe680','#ffc83a','#c8901a'],{spd:100,life:0.5,s:2.2,k:3,add:0,g:160,up:40});burstP(e.x,e.y-e.r,8,PAL.kim,{spd:80,life:0.3,s:1.5})},
  chu:e=>{burstP(e.x,e.y,10,['#b7ff4a','#8a3fd0','#5ac81a'],{spd:60,life:0.5,s:2.2,add:0,g:100,up:20});G.zones.push({k:'poison',x:e.x,y:e.y,r:10,t:0,dur:1.2,dmg:0,tick:9})},
  buc:e=>{burstP(e.x,e.y-e.r-5,5,['#8a2a3a','#c84a5a'],{spd:40,life:0.8,s:2.2,k:3,add:0,g:40})},
  hoang:e=>{burstP(e.x,e.y-e.r,8,['#ffb030','#fff0c0','#3a2a1a'],{spd:70,life:0.5,s:2,k:3,add:0,g:80})},
  matu:e=>{burstP(e.x,e.y-e.r,10,PAL.hon,{spd:60,life:0.5,s:1.8})},
};
const _vfxKill=vfxKill; vfxKill=function(e){_vfxKill(e);const f=KILLX[e.t];if(f)f(e)};

// ── Thiên Kiếp: mây đen, mưa, chớp trời, vòng lôi trận báo trước, hố cháy
const SKY={cl:null,rain:[],nextF:2,fl:0,bolt:null};
function skyInit(){SKY.cl=[];for(let i=0;i<26;i++)SKY.cl.push({x:rand()*1.3-0.15,y:rand()*0.2-0.04,r:0.09+rand()*0.12,s:0.006+rand()*0.012,d:rand()})}
function drawKiepSky(dt){
  const K=G.kiep;if(!K)return;if(!SKY.cl)skyInit();
  if(K.clear)K.clear+=dt;
  const inA=Math.min(1,(K.age||0)/3), outA=K.clear?Math.max(0,1-K.clear/2.5):1, A=inA*outA, W=VW, H=VH, wv=K.wave||0, SW=Math.min(W,H*0.62);   // SW: cỡ mây tính theo màn hình dọc, để cửa sổ ngang rộng không bị mây che kín
  // trời tối dần, phía trên tối hơn
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,`rgba(28,8,60,${0.62*A})`);g.addColorStop(0.45,`rgba(40,14,80,${0.34*A})`);g.addColorStop(1,`rgba(30,10,60,${0.22*A})`);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // chớp trời
  SKY.nextF-=dt; if(SKY.nextF<=0&&!K.clear&&A>0.5){SKY.nextF=1.2+rand()*(4-wv*0.25);SKY.fl=1;
    const x0=rand()*W,pts=[[x0,H*0.06]];let x=x0,y=H*0.06;const ty=H*(0.25+rand()*0.35);while(y<ty){x+=(rand()-.5)*26;y+=8+rand()*10;pts.push([x,y])}SKY.bolt=pts;
    if(typeof sfx==='function'&&rand()<0.5)sfx('thunder')}
  if(SKY.fl>0){SKY.fl-=dt*3.2;const f=Math.max(0,SKY.fl);ctx.globalAlpha=f*0.35*A;ctx.fillStyle='#e8dcff';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
    if(SKY.bolt&&f>0.35){if(SPR.ks_b0){const B=SKY.bolt,b=B[0],e=B[B.length-1],h=e[1]-b[1];fxD('ks_b'+((b[0]*7|0)%4),(b[0]+e[0])/2,(b[1]+e[1])/2,h,{alpha:f*A,add:1});fxD('ks_spark',e[0],e[1],18,{alpha:f*A,add:1})}else drawBolt(SKY.bolt,f*A,['#ffffff','#e6dcff','#9b7bff'],1.3)}}
  // vòng cảnh báo vẽ lại trên lớp tối cho rõ
  ctx.save();ctx.translate(-camX,-camY);for(const st of K.strikes){if(typeof kiepWarnTop==='function'&&kiepWarnTop(st,A))continue;const k=Math.min(1,st.t/st.dur);ctx.save();ctx.translate(st.x,st.y);ctx.scale(1,0.6);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(0.25+k*0.35)*A;ctx.fillStyle='#ff4fd8';ctx.beginPath();ctx.arc(0,0,st.r*k,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=(0.7+Math.sin(G.t*20)*0.2*k)*A;ctx.strokeStyle='#ffe9ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,st.r,0,TAU);ctx.stroke();ctx.restore()}
  ctx.restore();ctx.globalAlpha=1;
  // mây cuộn
  for(const c of SKY.cl){c.x+=c.s*dt*(1+wv*0.08);if(c.x>1.2)c.x=-0.2;const x=c.x*W,y=c.y*H,r=c.r*SW*(1.1+Math.sin(G.t*0.5+c.d*6)*0.05);
    const ck=(c.d*97|0)%4;if(SPR.ks_cl0){fxD((SKY.fl>0.25&&ck%2===0?'ks_lc':'ks_cl')+ck,x,y,r*2.6,{alpha:0.95*A,flip:c.d>0.5})}
    else{ctx.globalAlpha=0.85*A;ctx.fillStyle='#1c0c36';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}}
  // xoáy mây giữa trời, quay nhanh dần theo đợt
  if(SPR.ks_vortex&&!K.clear){glow(W/2,H*0.08,60,'#9b7bff',0.35*A);fxD('ks_vortex',W/2,H*0.07,SW*0.55,{rot:G.t*(0.4+wv*0.06),alpha:0.8*A,sq:0.55})}
  ctx.globalAlpha=1;
  // mưa
  const want=Math.round((40+wv*14)*A);while(SKY.rain.length<want)SKY.rain.push({x:rand()*W*1.2,y:rand()*H,v:220+rand()*120,l:6+rand()*6});if(SKY.rain.length>want)SKY.rain.length=want;
  ctx.strokeStyle='#cfd8ff';ctx.lineWidth=0.6;ctx.globalAlpha=0.45*A;ctx.beginPath();
  for(const r of SKY.rain){r.y+=r.v*dt;r.x-=r.v*0.25*dt;if(r.y>H){r.y=-10;r.x=rand()*W*1.2}ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.l*0.25,r.y-r.l)}ctx.stroke();ctx.globalAlpha=1;
  // mây tan: tia sáng vàng xuyên qua
  if(K.clear){const k=Math.min(1,K.clear/1.2),px=G.p.x-camX,a2=Math.sin(Math.min(1,K.clear/3)*Math.PI);
    ctx.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const x=px+(i-3)*26+Math.sin(G.t+i)*4,w=10+(i%3)*6;const gg=ctx.createLinearGradient(0,0,0,H);gg.addColorStop(0,`rgba(255,240,170,${0.3*a2*k})`);gg.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.moveTo(x-w*0.3,0);ctx.lineTo(x+w*0.3,0);ctx.lineTo(x+w*1.4,H);ctx.lineTo(x-w*1.4,H);ctx.fill()}
    ctx.globalCompositeOperation='source-over';
    if(SPR.ks_ray){for(let i=0;i<3;i++)fxD('ks_ray',px+(i-1)*60,H*0.2,H*0.42,{alpha:0.22*a2*k,add:1,flip:i===2});for(let i=0;i<4;i++)fxD('ks_gold',W*(0.12+i*0.26),H*0.03+(i%2)*12,SW*0.3,{alpha:0.55*a2,flip:i%2})}}
}
function drawWarn(s){const k=Math.min(1,s.t/s.dur),R=s.r;
  // vòng lôi trận dưới đất
  ctx.save();ctx.translate(s.x,s.y);ctx.scale(1,0.6);
  ctx.globalAlpha=0.22;ctx.fillStyle='#7a3dff';ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.5;ctx.fillStyle='#ff4fd8';ctx.beginPath();ctx.arc(0,0,R*k,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';
  ctx.rotate(G.t*2);ctx.globalAlpha=0.9;ctx.strokeStyle='#ffe9ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();
  ctx.lineWidth=0.8;ctx.globalAlpha=0.7;ctx.beginPath();for(let i=0;i<=8;i++){const an=i/8*TAU*3;const x=Math.cos(an)*R*0.82,y=Math.sin(an)*R*0.82;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
  for(let i=0;i<8;i++){const an=i/8*TAU;ctx.fillStyle='#ffe9ff';ctx.fillRect(Math.cos(an)*R-1,Math.sin(an)*R-1,2,2)}
  ctx.restore();ctx.globalAlpha=1;
  // cột sáng tụ từ trời, dày dần
  if(k>0.35){const kk=(k-0.35)/0.65,w=1+kk*4;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.25+kk*0.45;
    const gg=ctx.createLinearGradient(0,camY,0,s.y);gg.addColorStop(0,'rgba(180,150,255,0)');gg.addColorStop(1,'rgba(220,200,255,1)');ctx.fillStyle=gg;ctx.fillRect(s.x-w,camY-10,w*2,s.y-camY+10);
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';glow(s.x,s.y,R*0.6*kk+4,'#e6dcff',kk)}
  if(rand()<0.5){const an=rand()*TAU,d=R*(0.8+rand()*0.4),sx=s.x+Math.cos(an)*d,sy=s.y+Math.sin(an)*d*0.6;vp(sx,sy,{vx:(s.x-sx)*3,vy:(s.y-sy)*3-10,life:0.3,s:1.3,c:rand()<0.5?'#ffb8f0':'#e6dcff',drag:0})}
}

// ── Đột phá cảnh giới
const BT_TXT=['','Đạo cơ đã thành, linh lực vững như bàn thạch','Kim đan ngưng tụ, chân nguyên cuồn cuộn','Nguyên anh xuất thế, thần thức thông thiên','Hóa thần nhập đạo, một niệm động càn khôn'];
const BT_PAL=[['#8fe3c8','#e0fff4'],['#7fd0ff','#e0f6ff','#2a8fe0'],['#ffd45a','#fff6c0','#ff9a1f'],['#ff9de0','#ffe6f6','#d44ab0'],['#ffffff','#fff6d0','#b8d8ff']];
const TRI=['☰','☱','☲','☳','☴','☵','☶','☷'];
function lotus(x,y,R,n,c1,c2,rot,open){ctx.save();ctx.translate(x,y);ctx.scale(1,0.55);ctx.rotate(rot);
  for(let L=0;L<2;L++)for(let i=0;i<n;i++){ctx.save();ctx.rotate(i/n*TAU+L*Math.PI/n);ctx.fillStyle=L?c2:c1;ctx.beginPath();ctx.ellipse(0,-R*(L?0.45:0.7)*open,R*(L?0.18:0.24),R*(L?0.4:0.55)*open,0,0,TAU);ctx.fill();ctx.restore()}
  ctx.restore()}
// vẽ trong thế giới: dưới chân và quanh người (gọi trước khi vẽ người chơi)
function btWorld(B){
  const P=G.p,t=B.t,r=B.r,C=BT_PAL[r],pre=Math.min(1,t/1.1),post=t>1.1?Math.max(0,1-(t-1.1)/2.4):1,A=pre*post;
  // vòng trận bát quái 3 lớp
  ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.55);ctx.globalCompositeOperation='lighter';
  for(let L=0;L<3;L++){const R=(26+L*16)*(0.4+pre*0.6),sp=(L%2?-1:1)*(0.6+L*0.5)*(1+pre*3);ctx.save();ctx.rotate(G.t*sp);
    ctx.globalAlpha=A*(0.9-L*0.2);ctx.strokeStyle=C[L?0:1];ctx.lineWidth=1.6-L*0.3;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();
    if(L===1){ctx.font='8px serif';ctx.fillStyle=C[0];ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<8;i++){const an=i/8*TAU;ctx.save();ctx.translate(Math.cos(an)*R,Math.sin(an)*R);ctx.rotate(an+Math.PI/2);ctx.fillText(TRI[i],0,0);ctx.restore()}}
    else{for(let i=0;i<(L?16:6);i++){const an=i/(L?16:6)*TAU;ctx.fillStyle=C[1];ctx.fillRect(Math.cos(an)*R-1,Math.sin(an)*R-1,2,2)}}
    ctx.restore()}
  if(t<1.1){ctx.globalAlpha=0.25*pre;ctx.fillStyle=C[0];ctx.beginPath();ctx.arc(0,0,60*pre,0,TAU);ctx.fill()}
  ctx.restore();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // nhịp tim
  if(t<1.1){const ph=(t*3)%1;ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.55);ring(0,0,10+ph*50,C[1],2*(1-ph),(1-ph)*0.8);ctx.restore()}
  // hình tượng riêng từng cảnh giới
  const hy=P.y-14-(B.lift||0);
  if(r===1){for(let i=0;i<6;i++){const an=i/6*TAU+G.t*0.3,x=P.x+Math.cos(an)*30,y=P.y+Math.sin(an)*16,h=(8+pre*14)*A;
      ctx.globalAlpha=0.8*A;ctx.fillStyle='#2a6fb0';ctx.fillRect(x-2.5,y-h,5,h);ctx.fillStyle='#7fd0ff';ctx.fillRect(x-2.5,y-h,2,h);ctx.fillStyle='#e0f6ff';ctx.fillRect(x-3,y-h-1.5,6,1.5);glow(x,y-h,6,'#7fd0ff',0.6*A)}ctx.globalAlpha=1}
  else if(r===2){const k=t<1.1?pre:0,R=3+k*7;if(t<1.1){glow(P.x,hy-14,R*3,'#ffc83a',0.8*k);dot(P.x,hy-14,R,'#ff9a1f');dot(P.x,hy-14,R*0.7,'#ffd45a');dot(P.x-R*0.3,hy-14-R*0.3,R*0.3,'#fffbe0');
      for(let i=0;i<3;i++){const an=G.t*6+i*2.1;ctx.globalAlpha=0.8*k;ctx.fillStyle='#fff6c0';ctx.fillRect(P.x+Math.cos(an)*R*1.8-1,hy-14+Math.sin(an)*R*0.9-1,2,2)}ctx.globalAlpha=1}
    else if(t<1.5){const k2=(t-1.1)/0.4;glow(P.x,hy-14+k2*14,10*(1-k2)+4,'#ffd45a',1-k2)}}
  else if(r===3){lotus(P.x,P.y,26,8,'#ff9de0','#ffe6f6',G.t*0.5,Math.min(1,t/1.0)*post);
    if(t>0.5){const k=Math.min(1,(t-0.5)/0.6),y=hy-10-k*14-(t>1.1?(t-1.1)*6:0),al=A;glow(P.x,y,12,'#ff9de0',0.7*al);
      ctx.globalAlpha=al;ctx.fillStyle='#ffe6f6';ctx.beginPath();ctx.arc(P.x,y-4,2.6,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(P.x,y+1.5,2.4,3.4,0,0,TAU);ctx.fill();ctx.globalAlpha=1}}
  else if(r===4){const k=pre;ctx.save();ctx.translate(P.x,hy-4);ctx.globalCompositeOperation='lighter';
      for(let s=-1;s<=1;s+=2)for(let i=0;i<5;i++){const an=(-0.9+i*0.32)*s+(s<0?Math.PI:0),L=(22+i*6)*k*A;ctx.globalAlpha=0.85*A;ctx.strokeStyle=i%2?'#ffe9a8':'#9fc8ff';ctx.lineWidth=3-i*0.3;ctx.beginPath();ctx.moveTo(s*3,0);ctx.quadraticCurveTo(Math.cos(an)*L*0.5,Math.sin(an)*L*0.5-6,Math.cos(an)*L,Math.sin(an)*L);ctx.stroke()}
      ctx.globalAlpha=0.9*A;ctx.strokeStyle='#fff6d0';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,-14,7*k,2.5*k,0,0,TAU);ctx.stroke();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  // linh khí xoáy vào người
  if(t<1.1)for(let i=0;i<7;i++){const an=rand()*TAU,d=90+rand()*80,sx=P.x+Math.cos(an)*d,sy=P.y-8+Math.sin(an)*d*0.7;vp(sx,sy,{vx:(P.x-sx)*2.2-Math.sin(an)*60,vy:(P.y-8-sy)*2.2+Math.cos(an)*40,life:0.45,s:1.6+rand(),c:C[rand()*C.length|0],drag:0})}
}
// chữ vừa khung: thu nhỏ cỡ chữ, hoặc xuống dòng
function btFit(t,px,w,maxW){ctx.font=`${w} ${px}px 'Baloo 2',system-ui,sans-serif`;const m=ctx.measureText(t).width;return m>maxW?Math.max(6,px*maxW/m):px}
function btWrap(t,px,w,maxW){ctx.font=`${w} ${px}px 'Baloo 2',system-ui,sans-serif`;if(ctx.measureText(t).width<=maxW)return{lines:[t],px};
  const ws=t.split(' '),L=[];let cur='';for(const x of ws){const tr=cur?cur+' '+x:x;if(ctx.measureText(tr).width>maxW&&cur){L.push(cur);cur=x}else cur=tr}if(cur)L.push(cur);
  if(L.length>2&&px>6.5)return btWrap(t,Math.max(6,px*0.85),w,maxW);return{lines:L,px}}
// lớp màn hình: tối dần lúc tụ khí, bảng cảnh giới sau khi nổ
function btScreen(B){
  const t=B.t,r=B.r,R=REALMS[r],C=BT_PAL[r],P=G.p,px=P.x-camX,py=P.y-8-camY;
  if(t<1.1){const k=Math.min(1,t/0.35);const g=ctx.createRadialGradient(px,py,18,px,py,VH*0.55);g.addColorStop(0,'rgba(10,5,25,0.05)');g.addColorStop(1,`rgba(10,5,25,${0.82*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  else if(t<1.6){const k=1-(t-1.1)/0.5;ctx.globalAlpha=k*0.5;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(t<1.1)return;
  const u=t-1.15,A=Math.min(1,u/0.3)*(t>B.dur-0.6?Math.max(0,(B.dur-t)/0.6):1);if(A<=0)return;
  const y0=VH*0.26,sc=1+Math.max(0,0.3-u)*0.6;
  // dải sáng ngang
  ctx.globalAlpha=0.6*A;const gb=ctx.createLinearGradient(0,0,VW,0);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(0.5,'rgba(20,10,40,0.85)');gb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gb;ctx.fillRect(0,y0-34,VW,90);
  ctx.globalAlpha=A;ctx.fillStyle=C[0];ctx.fillRect(VW*0.1,y0-34,VW*0.8*Math.min(1,u*3),1);ctx.fillRect(VW*0.9-VW*0.8*Math.min(1,u*3),y0+55,VW*0.8*Math.min(1,u*3),1);
  // ánh sáng sau chữ
  glow(VW/2,y0+2,70,C[0],0.35*A);
  ctx.save();ctx.translate(VW/2,y0);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.globalAlpha=A;ctx.font=`800 11px 'Baloo 2',system-ui,sans-serif`;ctx.fillStyle='#fff6d0';ctx.fillText(i18n('ui.vfx.dotPhaCanhGioi','— ĐỘT PHÁ CẢNH GIỚI —'),0,-22);
  ctx.font=`800 ${btFit(R.n.toUpperCase(),30,800,VW*0.86/sc)}px 'Baloo 2',system-ui,sans-serif`;ctx.lineWidth=5;ctx.strokeStyle='#1a0c2a';ctx.strokeText(R.n.toUpperCase(),0,4);
  const g=ctx.createLinearGradient(0,-12,0,18);g.addColorStop(0,'#ffffff');g.addColorStop(0.55,C[0]);g.addColorStop(1,C[2]||C[0]);ctx.fillStyle=g;ctx.fillText(R.n.toUpperCase(),0,4);
  // tia lấp lánh trên chữ
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(0.25+Math.sin(u*6)*0.15)*A;ctx.fillStyle=C[1];ctx.fillText(R.n.toUpperCase(),0,4);ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=A;ctx.fillStyle='#fff6e0';{const ls=btWrap(BT_TXT[r],9.5,600,VW*0.9/sc);ls.lines.forEach((s,i)=>{ctx.font=`600 ${ls.px}px 'Baloo 2',system-ui,sans-serif`;ctx.fillText(s,0,27+i*(ls.px+2))});B.subN=ls.lines.length}
  ctx.restore();
  // các dòng lợi ích hiện lần lượt
  const L=[i18nf('ui.vfx.mauToiDa','♥ Máu tối đa +{0}',B.gain.hp),i18n('ui.vfx.satThuong12','⚔ Sát thương +12%'),i18n('ui.vfx.bocPhatManhHon','✦ Bộc phát mạnh hơn')];if(B.gain.slot)L.push(i18nf('ui.vfx.moOCongPhap','◆ Mở ô công pháp thứ {0}',B.gain.slot));
  ctx.textAlign='center';ctx.font=`700 9px 'Baloo 2',system-ui,sans-serif`;
  L.forEach((s,i)=>{const k=Math.min(1,Math.max(0,(u-0.45-i*0.18)/0.25));if(k<=0)return;const y=y0+44+((B.subN||1)-1)*11+i*12,x=VW/2+(1-k)*20;ctx.font=`700 ${btFit(s,9,700,VW*0.92)}px 'Baloo 2',system-ui,sans-serif`;ctx.globalAlpha=A*k;ctx.lineWidth=3;ctx.strokeStyle='#1a0c2a';ctx.strokeText(s,x,y);ctx.fillStyle=i===3?'#ffe680':'#ffffff';ctx.fillText(s,x,y)});
  ctx.globalAlpha=1;
}
// hào quang thường trực theo cảnh giới
function realmAura(){
  const P=G.p,r=G.realm,C=BT_PAL[r];if(!r)return;const bob=Math.sin(G.t*3);
  ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.45);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.28+bob*0.06;ctx.fillStyle=C[0];ctx.beginPath();ctx.arc(0,0,11+r*1.5,0,TAU);ctx.fill();
  ctx.rotate(G.t*0.8);ctx.globalAlpha=0.55;ctx.strokeStyle=C[1];ctx.lineWidth=0.8;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(0,0,13+r*1.5,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(r===2){const an=G.t*2,x=P.x+Math.cos(an)*12,y=P.y-12+Math.sin(an)*5;glow(x,y,6,'#ffc83a',0.6);dot(x,y,1.8,'#ffd45a');dot(x-0.5,y-0.5,0.8,'#fffbe0')}
  if(r===3)lotus(P.x,P.y,10,6,'#ff9de0aa','#ffe6f6aa',G.t*0.6,1);
  if(r===4){ctx.save();ctx.translate(P.x,P.y-27);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.6+bob*0.15;ctx.strokeStyle='#fff6d0';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,6,2,0,0,TAU);ctx.stroke();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';glow(P.x,P.y-12,18,'#fff6d0',0.18)}
  if(rand()<VDT*(4+r*3))vp(P.x+(rand()-.5)*14,P.y-rand()*10,{vy:-18-rand()*14,vx:(rand()-.5)*6,life:0.9,s:1.2,c:C[rand()*2|0],drag:1});
}
const _drawPlayer=drawPlayer;
drawPlayer=function(){const B=G.bt;if(B)btWorld(B);else if(!G.p.dead)realmAura();
  if(B&&B.t<1.6){const lift=Math.sin(Math.min(1,B.t/1.1)*Math.PI/2)*8*(B.t<1.1?1:Math.max(0,1-(B.t-1.1)/0.5));B.lift=lift;ctx.save();ctx.translate(0,-lift);_drawPlayer();ctx.restore()}else _drawPlayer()};

// ── không khí riêng từng bản đồ
const AMB={bf:[],birds:[],mist:null,cs:null,rip:[],glint:[],gust:0,gustT:6};
function ambReset(){AMB.bf=[];AMB.birds=[];AMB.mist=null;AMB.cs=null;AMB.rip=[];AMB.glint=[];AMB.map=G.mapId}
function visRange(m){return [camX-m,camY-m,camX+VW+m,camY+VH+m]}
// dưới nhân vật: bóng mây, mặt nước lấp lánh, gợn sóng, đèn lồng, băng lóe sáng
function mapUnder(){
  if(AMB.map!==G.mapId||AMB.g!==G)ambReset(),AMB.g=G;const MP=MAPS[G.mapId],[x0,y0,x1,y1]=visRange(40),t=G.t,dt=VDT;
  // bóng mây trôi trên mặt đất
  if(FXQ>0){
  if(!AMB.cs){AMB.cs=[];for(let i=0;i<5;i++)AMB.cs.push({x:rand()*900-450,y:rand()*900-450,r:70+rand()*90,s:8+rand()*8})}
  for(const c of AMB.cs){c.x+=c.s*dt;c.y+=c.s*0.35*dt;const wx=G.p.x+c.x,wy=G.p.y+c.y;if(c.x>500){c.x=-500;c.y=rand()*900-450}
    ctx.globalAlpha=MP.ice?0.06:0.09;ctx.fillStyle='#1a3a2a';ctx.beginPath();ctx.ellipse(wx,wy,c.r,c.r*0.55,0,0,TAU);ctx.ellipse(wx+c.r*0.6,wy+c.r*0.15,c.r*0.6,c.r*0.35,0,0,TAU);ctx.fill()}
  ctx.globalAlpha=1;}
  // ao hồ
  for(const o of G.world.obs){if(o.k!=='pond'||o.x+o.r<x0||o.x-o.r>x1||o.y+o.r<y0||o.y-o.r>y1)continue;const R=mulberry32((o.x*13+o.y)|0);
    for(let i=0;i<10;i++){const a=R()*TAU,d=Math.sqrt(R())*o.r*0.7,px=o.x+Math.cos(a)*d,py=o.y+Math.sin(a)*d*0.85,ph=R()*TAU,al=Math.max(0,Math.sin(t*(1.5+R())+ph));
      if(al<0.2)continue;ctx.globalAlpha=al*(MP.ice?0.9:0.7);ctx.fillStyle='#ffffff';const w=2+R()*4;ctx.fillRect(px-w/2+Math.sin(t+ph)*1.5,py,w,1);if(MP.ice&&al>0.9){ctx.fillRect(px-0.5,py-2,1,5)}}
    ctx.globalAlpha=1;
    if(!MP.ice&&rand()<dt*0.8){const a=rand()*TAU,d=rand()*o.r*0.6;AMB.rip.push({x:o.x+Math.cos(a)*d,y:o.y+Math.sin(a)*d*0.85,t:0})}
    if(!MP.ice&&rand()<dt*0.15){const a=rand()*TAU,d=rand()*o.r*0.5,fx=o.x+Math.cos(a)*d,fy=o.y+Math.sin(a)*d*0.8;AMB.rip.push({x:fx,y:fy,t:0,fish:1});burstP(fx,fy-2,6,['#ffffff','#bff4ff'],{spd:30,life:0.5,s:1.4,g:120,up:30,add:0})}}
  for(const r of AMB.rip){r.t+=dt;const k=r.t/(r.fish?1.2:1.6);if(k>=1)continue;ctx.save();ctx.translate(r.x,r.y);ctx.scale(1,0.5);ring(0,0,2+k*(r.fish?14:9),'#e8fbff',1,(1-k)*0.8);if(r.fish)ring(0,0,1+k*7,'#ffffff',0.8,(1-k)*0.6);ctx.restore()}
  AMB.rip=AMB.rip.filter(r=>r.t<1.6);
  // băng cung: mặt đất lóe sáng
  if(MP.ice&&FXQ>0){if(rand()<dt*14)AMB.glint.push({x:camX+rand()*VW,y:camY+rand()*VH,t:0});
    for(const g of AMB.glint){g.t+=dt;const k=g.t/0.6,a=Math.sin(Math.min(1,k)*Math.PI);ctx.globalAlpha=a;ctx.fillStyle='#5ab8ff';const s=1+a*2.5;ctx.fillRect(g.x-s,g.y-0.4,s*2,0.8);ctx.fillRect(g.x-0.4,g.y-s,0.8,s*2);ctx.fillStyle='#ffffff';ctx.fillRect(g.x-0.6,g.y-0.6,1.2,1.2);ctx.globalAlpha=1}
    AMB.glint=AMB.glint.filter(g=>g.t<0.6)}
  // đèn lồng và vạc
  for(const o of visObs()){if(o.spr==='p_lantern'){const f=0.75+Math.sin(t*9+o.x)*0.1+Math.sin(t*23+o.y)*0.06;glow(o.x,o.y-14*(o.sc||1)*2,16*f,'#ffb03a',0.45*f);glow(o.x,o.y,14,'#ffb03a',0.15*f)}
    else if(o.spr==='p_cauldron'){if(rand()<dt*6)vp(o.x+(rand()-.5)*6,o.y-16,{vy:-14,vx:(rand()-.5)*6,life:1.6,s:3,c:'#e8e0f0',k:1,add:0,a:0.5,drag:0.6});glow(o.x,o.y-10,10,'#7fd0ff',0.3)}
    else if(o.spr==='p_jade'&&rand()<dt*2)vp(o.x+(rand()-.5)*10,o.y-8-rand()*10,{vy:-8,life:0.8,s:1.3,c:'#9ff0e0',drag:1})}
}
// trên nhân vật: bướm (Đào Hoa), chim bay (Vân Đỉnh)
function mapOver(){
  const MP=MAPS[G.mapId],P=G.p,t=G.t,dt=VDT;
  if(G.mapId==='daohoa'){while(AMB.bf.length<[3,6,9][FXQ]){const a=rand()*TAU,d=80+rand()*120;AMB.bf.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,tx:0,ty:0,ph:rand()*TAU,c:['#ffffff','#ffd0e8','#ffe066','#bfe6ff'][(rand()*4)|0],tt:0})}
    for(const b of AMB.bf){b.tt-=dt;if(b.tt<=0){b.tt=1+rand()*2;b.tx=b.x+(rand()-.5)*60;b.ty=b.y+(rand()-.5)*40}
      const dp=Math.hypot(P.x-b.x,P.y-b.y);if(dp<30){b.tx=b.x+(b.x-P.x)*2;b.ty=b.y+(b.y-P.y)*2-20;b.tt=0.6}
      b.x+=(b.tx-b.x)*dt*1.2+Math.sin(t*3+b.ph)*dt*12;b.y+=(b.ty-b.y)*dt*1.2+Math.cos(t*4+b.ph)*dt*8;
      if(dp>260){const a=rand()*TAU;b.x=P.x+Math.cos(a)*200;b.y=P.y+Math.sin(a)*160}
      const z=10+Math.sin(t*2+b.ph)*3,w=Math.abs(Math.sin(t*16+b.ph))*3.6+0.6,fx=b.tx>b.x?1:-1;
      ctx.globalAlpha=0.2;ctx.fillStyle='#1a3a1a';ctx.fillRect(b.x-1.5,b.y,3,1);ctx.globalAlpha=1;
      ctx.fillStyle='#5a3a2a';ctx.fillRect(b.x-w-0.8,b.y-z-2.6,w+0.5,4.2);ctx.fillRect(b.x+0.3,b.y-z-2.6,w+0.5,4.2);ctx.fillStyle=b.c;ctx.fillRect(b.x-w-0.3,b.y-z-2.1,w,3.2);ctx.fillRect(b.x+0.3,b.y-z-2.1,w,3.2);ctx.fillRect(b.x-w*0.7,b.y-z+0.8,w*0.7,1.8);ctx.fillRect(b.x+0.3,b.y-z+0.8,w*0.7,1.8);
      ctx.fillStyle='#4a3020';ctx.fillRect(b.x-0.3,b.y-z-1.5,0.8,3.2);void fx}}
  if(G.mapId==='vandinh'){if(rand()<dt*0.12&&AMB.birds.length<2){const dir=rand()<0.5?1:-1;AMB.birds.push({x:dir>0?camX-40:camX+VW+40,y:camY+30+rand()*VH*0.5,d:dir,n:3+((rand()*4)|0),t:0})}
    // đàn hạc bay ngang theo hình chữ V (dùng hình hạc vẽ sẵn, xoay theo hướng bay)
    for(const f of AMB.birds){f.t+=dt;f.x+=f.d*55*dt;f.y-=6*dt;for(let i=0;i<f.n;i++){const r=Math.ceil(i/2),sd=i%2?1:-1,bx=f.x-f.d*r*15,by=f.y+sd*r*11,fr=((t*5+i*1.3)|0)%4;
        ctx.globalAlpha=0.12;ctx.fillStyle='#10202a';ctx.beginPath();ctx.ellipse(bx-f.d*4,by+46,5,1.8,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
        fxD('wx_crane'+fr,bx,by,15,{rot:f.d*Math.PI/2})}}
    AMB.birds=AMB.birds.filter(f=>f.t<12)}
}
// lớp màn hình: sương mù (Vân Đỉnh), cực quang + gió tuyết (Băng Cung), nắng (Đào Hoa)
function mapScreen(dt){
  if(FXQ===0)return;
  const MP=MAPS[G.mapId],W=VW,H=VH,t=G.t;
  if(G.mapId==='vandinh'){if(!AMB.mist){AMB.mist=[];for(let i=0;i<7;i++)AMB.mist.push({x:rand()*W*1.6-W*0.3,y:rand()*H,r:60+rand()*80,s:5+rand()*9,a:0.12+rand()*0.12})}
    for(const m of AMB.mist){m.x+=m.s*dt-(G.p.vx||0)*dt*0.15;m.y-=(G.p.vy||0)*dt*0.15;if(m.x-m.r>W)m.x=-m.r*1.5;if(m.x+m.r*1.6<0)m.x=W+m.r;if(m.y<-m.r)m.y=H+m.r;if(m.y>H+m.r)m.y=-m.r;
      ctx.globalAlpha=m.a;ctx.drawImage(glowSpr('#ffffff'),m.x-m.r*1.6,m.y-m.r*0.6,m.r*3.2,m.r*1.2)}ctx.globalAlpha=1}
  if(MP.ice){const g=ctx.createLinearGradient(0,0,0,H*0.35);g.addColorStop(0,'rgba(40,200,170,0.28)');g.addColorStop(1,'rgba(40,200,170,0)');
    ctx.save();for(let i=0;i<3;i++){ctx.globalAlpha=0.6+Math.sin(t*0.7+i*2)*0.3;ctx.fillStyle=i===1?'rgba(120,90,230,0.14)':g;ctx.beginPath();ctx.moveTo(0,0);
      for(let x=0;x<=W;x+=12)ctx.lineTo(x,H*(0.12+i*0.05)+Math.sin(x*0.03+t*0.8+i*1.7)*12);ctx.lineTo(W,0);ctx.fill()}ctx.restore();ctx.globalAlpha=1;
    AMB.gustT-=dt;if(AMB.gustT<=0){AMB.gustT=7+rand()*8;AMB.gust=1}AMB.gust=Math.max(0,AMB.gust-dt*0.35);
    if(AMB.gust>0){ctx.strokeStyle='#ffffff';ctx.lineWidth=0.7;for(let i=0;i<14;i++){const y=(i*53+t*30)%H,x=((t*260+i*97)%(W+120))-60;ctx.globalAlpha=AMB.gust*0.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18+i%3*8,y+3);ctx.stroke()}ctx.globalAlpha=1}}
  if(G.mapId==='daohoa'){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const x=W*(0.2+i*0.3)+Math.sin(t*0.2+i)*20;ctx.globalAlpha=0.06+Math.sin(t*0.5+i*2)*0.03;ctx.fillStyle='#fff6c0';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+30,0);ctx.lineTo(x-40,H);ctx.lineTo(x-90,H);ctx.fill()}ctx.restore();ctx.globalAlpha=1}
}

// ── Ngũ hành tương sinh: ấn trên yêu quái, dung nham, vụ phản ứng
const _dz=drawZone;
drawZone=function(z){
  if(z.k!=='lava'){_dz(z);return}
  const k=1-z.t/z.dur,a=Math.min(1,z.t*5)*Math.min(1,k*3),R=mulberry32((z.x*7+z.y)|0);
  ell(z.x,z.y,z.r*1.1,z.r*0.6,'#3a1408',0.45*a);ell(z.x,z.y,z.r,z.r*0.52,'#c8341a',0.7*a);
  ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.52);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.5*a;
  for(let i=0;i<7;i++){const an=R()*TAU,d=R()*z.r*0.7,pr=(G.t*1.6+R())%1;ctx.fillStyle=pr<0.5?'#ffb03a':'#ff7a1f';ctx.beginPath();ctx.arc(Math.cos(an)*d,Math.sin(an)*d,2+R()*4,0,TAU);ctx.fill()}
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  glow(z.x,z.y,z.r*1.3,'#ff6a1f',0.3*a);
  if(rand()<VDT*10)vp(z.x+(rand()-.5)*z.r*1.4,z.y+(rand()-.5)*z.r*0.6,{vy:-16,life:0.6,s:1.8,c:rand()<0.5?'#ffb03a':'#ffe680'});
  if(rand()<VDT*3){const bx=z.x+(rand()-.5)*z.r,by=z.y+(rand()-.5)*z.r*0.5;burstP(bx,by,4,['#ff9a3a','#ffd45a'],{spd:30,up:30,life:0.4,s:1.5,g:120})}
};
const _pe=preEnemy;
preEnemy=function(e){_pe(e);if(e.dead||!e.mk||!(e.mk.t>0))return;const c=EL[e.mk.el].c,k=Math.min(1,e.mk.t/0.4);
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,0.45);ctx.rotate(G.t*3);ctx.globalAlpha=0.85*k;ctx.strokeStyle=c;ctx.lineWidth=1.4;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,e.r*1.05+2,i*2.09,i*2.09+1.3);ctx.stroke()}ctx.restore();ctx.globalAlpha=1};
const _fo=drawFxOver;
drawFxOver=function(f){
  if(f.k!=='nhrx'){_fo(f);return}
  const k=f.t/f.dur,R=NH[f.el],c1=EL[R.a].c,c2=EL[R.b].c;
  emitOnce(f,()=>{burstP(f.x,f.y,22,[c1,c2,'#ffffff'],{spd:110,life:0.5,s:2})});
  // hai vòng hai hành xoáy vào nhau
  ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);
  for(let i=0;i<2;i++){const an=G.t*10+i*Math.PI,d=18*(1-Math.min(1,k*2.5));ctx.globalAlpha=1-k;glow(f.x+Math.cos(an)*d-f.x,Math.sin(an)*d,7,i?c2:c1,1-k)}
  ring(0,0,8+k*34,c2,3*(1-k),1-k);ring(0,0,4+k*22,'#ffffff',1.5*(1-k),1-k);ctx.restore();ctx.globalAlpha=1;
  if(k<0.6){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 8px 'Baloo 2',sans-serif`;const y=f.y-18-k*10;ctx.globalAlpha=Math.min(1,(0.6-k)*4);ctx.lineWidth=2.5;ctx.strokeStyle='#2a1a10';ctx.strokeText(R.n,f.x,y);ctx.fillStyle=R.c;ctx.fillText(R.n,f.x,y);ctx.globalAlpha=1}
};

// ── Thủy Tinh: vẽ sóng nước dâng
ESC.drop=['#ffffff','#7fd0ff','#1a6fd0'];
BAURA.maton=['#3fa8ff','#bff4ff'];BAURA.long=['#2fd0c0','#e8fbff'];
function drawWaves(){if(!G.waves)return;
  for(const w of G.waves){const fade=Math.min(1,(300-w.r)/40)*Math.min(1,w.t*4);ctx.save();ctx.translate(w.x,w.y);ctx.scale(1,0.6);
    for(let i=0;i<3;i++){const a0=w.g+i*TAU/3+WAVE_GAP,a1=w.g+(i+1)*TAU/3-WAVE_GAP;
      ctx.globalAlpha=0.35*fade;ctx.strokeStyle='#1a6fd0';ctx.lineWidth=16;ctx.beginPath();ctx.arc(0,0,w.r,a0,a1);ctx.stroke();
      ctx.globalAlpha=0.85*fade;ctx.strokeStyle='#3fa8ff';ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,0,w.r,a0,a1);ctx.stroke();
      ctx.strokeStyle='#e8fbff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,w.r+2.5,a0,a1);ctx.stroke()}
    ctx.restore();ctx.globalAlpha=1;
    // bọt sóng + đánh dấu khe an toàn
    for(let k=0;k<3;k++){if(rand()<0.7){let a=w.g+rand()*TAU;if(!waveGap(w,a))vp(w.x+Math.cos(a)*w.r,w.y+Math.sin(a)*w.r*0.6,{vy:-20-rand()*20,vx:Math.cos(a)*20,life:0.4,s:1.8,c:rand()<0.5?'#ffffff':'#bff4ff',add:0,g:80})}}
    for(let i=0;i<3;i++){const a=w.g+i*TAU/3;glow(w.x+Math.cos(a)*w.r,w.y+Math.sin(a)*w.r*0.6,8,'#fff6c0',0.5*fade)}}
}
const _mu=mapUnder; mapUnder=function(){_mu();drawWaves()};

// ── Đại chiêu
function ultLift(u){const t=u.t;return t<0.45?Math.sin(t/0.45*Math.PI/2)*30:t<0.55?30*(1-(t-0.45)/0.1):0}
const _dpU=drawPlayer;
drawPlayer=function(){const u=G.ult;if(!u){_dpU();return}const P=G.p,l=ultLift(u),C=u.U.c;
  // hào quang tụ lực
  if(u.t<0.55){const k=u.t/0.55;glow(P.x,P.y-12-l,18+k*26,C[1],0.5+k*0.4);ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.5);ring(0,0,40*(1-k)+8,C[0],2,k);ctx.restore();
    for(let i=0;i<3;i++){const a=rand()*TAU,d=60+rand()*60;vp(P.x+Math.cos(a)*d,P.y-12-l+Math.sin(a)*d*0.7,{vx:-Math.cos(a)*d*3,vy:-Math.sin(a)*d*2,life:0.3,s:2,c:C[(rand()*3)|0],drag:0})}
    ell(P.x,P.y,10-k*4,4-k*1.5,'#1a2a1a',0.3)}
  ctx.save();ctx.translate(0,-l);_dpU();ctx.restore();
  if(u.t>0.4&&u.t<0.56){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.7;ctx.fillStyle=C[0];ctx.fillRect(P.x-3,P.y-60-l,6,50);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}};
function atlasDrawScreen(key,x,y,h,alpha){const m=SPR[key];if(!m||!ATLAS)return false;const r=m.r,w=h*r[2]/r[3];ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=!!m.smooth||h*Z>r[3]*2.2;ctx.drawImage(m.img||ATLAS,r[0],r[1],r[2],r[3],x-w/2,y-h/2,w,h);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;return true}
function ultScreen(u){
  const t=u.t,lv=u.lv,C=u.U.c,P=G.p,px=P.x-camX,py=P.y-8-camY,end=Math.max(0,1-(t-(u.dur-0.4))/0.4);
  // tối màn hình lúc bay lên
  if(t<0.6){const k=Math.min(1,t/0.25)*(lv>=3?0.7:0.4);const g=ctx.createRadialGradient(px,py,20,px,py,VH*0.6);g.addColorStop(0,'rgba(10,5,25,0)');g.addColorStop(1,`rgba(10,5,25,${k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  // vệt tốc độ hút vào
  if(lv>=2&&t<0.55){ctx.strokeStyle=C[0];ctx.lineWidth=1;for(let i=0;i<(lv>=3?26:14);i++){const a=i*2.4+t*3,d1=VH*0.6*(1-((t*3+i*0.13)%1)),d2=d1+30;ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(px+Math.cos(a)*d1,py+Math.sin(a)*d1);ctx.lineTo(px+Math.cos(a)*d2,py+Math.sin(a)*d2);ctx.stroke()}ctx.globalAlpha=1}
  // pháp tướng khổng lồ (cấp 4+)
  if(lv>=4){const k=Math.min(1,t/0.45),drop=t<0.45?0:Math.min(1,(t-0.45)/0.12),h=VH*0.42*(0.7+k*0.3),y=py-VH*0.32+drop*VH*0.18;
    glow(px,y,h*0.6,C[1],0.5*k*end);atlasDrawScreen(u.U.sum,px,y,h,Math.min(1,k*1.4)*(t>0.6?Math.max(0,end*(1-(t-0.6)/1.2)):1)*0.9)}
  // va chạm: chớp trắng + vạch nứt màn hình
  if(t>=0.55&&t<0.75){const k=1-(t-0.55)/0.2;ctx.globalAlpha=k*(lv>=3?0.8:0.5);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
    if(lv>=3){ctx.strokeStyle=C[1];ctx.lineWidth=2;ctx.globalAlpha=k;for(let i=0;i<10;i++){const a=i/10*TAU+0.3;ctx.beginPath();ctx.moveTo(px,py);let x=px,y=py;for(let j=0;j<5;j++){x+=Math.cos(a+(rand()-.5)*0.6)*VW*0.12;y+=Math.sin(a+(rand()-.5)*0.6)*VW*0.12;ctx.lineTo(x,y)}ctx.stroke()}ctx.globalAlpha=1}}
  // tên chiêu (cấp 3+)
  if(lv>=3&&t>0.5){const k=Math.min(1,(t-0.5)/0.25)*end,sc=1+(1-Math.min(1,(t-0.5)/0.25))*0.8;ctx.save();ctx.translate(VW/2,VH*0.2);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=k;
    ctx.font=`800 22px 'Baloo 2',sans-serif`;{const w=ctx.measureText(u.U.n).width;if(w>VW*0.88){const f=VW*0.88/w;ctx.scale(f,f)}}ctx.lineWidth=5;ctx.strokeStyle='#1a0c2a';ctx.strokeText(u.U.n,0,0);const g=ctx.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#ffffff');g.addColorStop(0.5,C[1]);g.addColorStop(1,C[2]);ctx.fillStyle=g;ctx.fillText(u.U.n,0,0);
    ctx.font=`700 9px 'Baloo 2',sans-serif`;ctx.fillStyle='#fff6d0';ctx.fillText(i18nf('ui.ult.cap','ĐẠI CHIÊU · CẤP {0}',lv),0,-20);ctx.restore();ctx.globalAlpha=1}
}
const _fo2=drawFxOver;
drawFxOver=function(f){const k=f.t/f.dur;
  if(f.k==='ultslam'){const C=f.c;emitOnce(f,()=>{burstP(f.x,f.y-4,50+f.lv*25,[C[0],C[1],'#ffffff'],{spd:180+f.lv*40,life:0.8,s:2.6,flat:1});for(let i=0;i<20+f.lv*6;i++){const a=rand()*TAU;vp(f.x+Math.cos(a)*8,f.y+Math.sin(a)*4,{vx:Math.cos(a)*(120+rand()*120),vy:Math.sin(a)*(70+rand()*60)-30,g:200,life:0.7,s:2.6,c:rand()<0.5?'#8a7050':'#b89870',k:3,vr:8,add:0})}});
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);for(let i=0;i<3+(f.lv>=3?2:0);i++){const kk=Math.min(1,k*1.3-i*0.1);if(kk<=0)continue;ring(0,0,10+kk*f.r*(1+i*0.1),i%2?C[1]:'#ffffff',(8-i)*(1-kk)+0.5,(1-kk)*0.9)}
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.4*(1-k);ctx.fillStyle=C[1];ctx.beginPath();ctx.arc(0,0,20+k*f.r*0.6,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    ell(f.x,f.y,30,14,'#2a1a10',0.35*(1-k));return}
  if(f.k==='ultsword'){const y0=f.y-140,y=k<0.5?y0+(f.y-y0)*(k/0.5)**2:f.y;glow(f.x,y-8,10,f.c[1],0.7*(1-k*0.5));drawRot(PS.swordG,f.x,y-10,Math.PI/2,1.4,1);
    if(k>=0.5)emitOnce(f,()=>{burstP(f.x,f.y,10,f.c,{spd:90,life:0.35,s:1.8});G.fx.push({k:'spark',x:f.x,y:f.y,t:0,dur:0.2,c:'#ffffff'})});return}
  if(f.k==='ultice'){const h=Math.min(1,k*5)*(1-Math.max(0,k-0.7)/0.3);for(let i=0;i<5;i++){const ox=(i-2)*4,hh=(10+((i*7)%5)*4)*h;ctx.fillStyle=i%2?'#bff4ff':'#e8fbff';ctx.beginPath();ctx.moveTo(f.x+ox-3,f.y);ctx.lineTo(f.x+ox,f.y-hh);ctx.lineTo(f.x+ox+3,f.y);ctx.fill()}
    glow(f.x,f.y-8,12,'#9fe8ff',0.5*h);if(k>0.7)emitOnce(f,()=>{for(let i=0;i<8;i++)vp(f.x,f.y-8,{vx:(rand()-.5)*80,vy:-30-rand()*40,g:160,life:0.5,s:2,c:'#e8fbff',k:3,vr:8,add:0})});return}
  if(f.k==='ultvine'){const h=Math.min(1,k*4)*(1-Math.max(0,k-0.75)/0.25),R=mulberry32(f.seed|0);ctx.lineCap='round';for(let i=0;i<5;i++){const a=R()*TAU,x=f.x+Math.cos(a)*6,sw=Math.sin(G.t*6+i)*3,hh=(16+R()*12)*h;ctx.strokeStyle='#1f6a26';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,f.y);ctx.quadraticCurveTo(x+sw*2,f.y-hh*0.5,x+sw,f.y-hh);ctx.stroke();ctx.strokeStyle='#5ee05a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffb3cf';ctx.fillRect(x+sw-1.5,f.y-hh-1.5,3,3)}ctx.lineCap='butt';return}
  if(f.k==='ultfox'){const x=f.x+(f.tx-f.x)*k,y=f.y+(f.ty-f.y)*k-Math.sin(k*Math.PI)*30;glow(x,y,10,'#d0a8ff',0.9);dot(x,y,3,'#ffffff');vp(x,y,{life:0.3,s:2,c:'#ffd0f0'});return}
  _fo2(f)};

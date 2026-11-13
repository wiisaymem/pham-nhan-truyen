'use strict';
// ───────────────────────── Hiệu ứng dùng ảnh mẫu Flow (tools/art_src/vfx1..3.png → fx_* trong atlas)
// fxD: vẽ một ảnh fx_* căn giữa, size = kích thước lớn nhất (đơn vị thế giới). o: rot, alpha, add, flip, sq (dẹt dọc, vẽ mặt đất), tint ('blue' | 'pink' | 'gold')
const FXTINT={};
function fxTintCanvas(k,t){const id=k+'|'+t;if(FXTINT[id])return FXTINT[id];const r=SPR[k].r,c=mk(r[2],r[3]),x=c.getContext('2d');x.drawImage(ATLAS,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);
  const d=x.getImageData(0,0,r[2],r[3]),a=d.data;for(let i=0;i<a.length;i+=4){const R=a[i],G2=a[i+1],B=a[i+2];
    if(t==='blue'){a[i]=B;a[i+2]=R;a[i+1]=Math.min(255,G2*1.1+20)}else if(t==='pink'){a[i]=Math.min(255,R*0.9+60);a[i+1]=G2*0.7;a[i+2]=Math.min(255,B*0.8+90)}else if(t==='gold'){const v=(R+G2+B)/3;a[i]=Math.min(255,v*1.25+30);a[i+1]=Math.min(255,v*1.05+10);a[i+2]=v*0.45}}
  x.putImageData(d,0,0);return FXTINT[id]=c}
function fxD(k,x,y,size,o){{const H=SPR[k+'_h'],m0=SPR[k];if(H&&m0&&size>Math.max(m0.r[2],m0.r[3])*1.4)k=k+'_h'}const m=SPR[k];if(!m||!ATLAS||size<=0.2)return false;const r=m.r,s=size/Math.max(r[2],r[3]);o=o||{};
  ctx.save();ctx.translate(x,y);if(o.sq)ctx.scale(1,o.sq);if(o.rot)ctx.rotate(o.rot);ctx.scale(o.flip?-s:s,s*(o.sy||1));
  ctx.globalAlpha=Math.max(0,Math.min(1,o.alpha??1));if(o.add)ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;
  if(o.tint)ctx.drawImage(fxTintCanvas(k,o.tint),-r[2]/2,-r[3]/2);else ctx.drawImage(ATLAS,r[0],r[1],r[2],r[3],-r[2]/2,-r[3]/2,r[2],r[3]);
  ctx.restore();return true}
// khung hình theo tiến độ k∈[0,1]
const fxF=(base,n,k)=>base+Math.min(n-1,Math.max(0,(k*n)|0));
function emitOnce2(f,fn){if(!f.em2){f.em2=1;fn()}}
const FX_IS=['fx_is0','fx_is1','fx_is2','fx_is2'];

// ── hiệu ứng chung (nổ, chém, sét, băng, đại chiêu phụ)
const _foFA=drawFxOver;
drawFxOver=function(f){const k=f.t/f.dur;
  if(f.k==='boom'){const r=f.r;emitOnce(f,()=>{burstP(f.x,f.y,Math.min(24,8+r),PAL.hoa,{spd:r*4,life:0.5,s:2})});
    if(k<0.2)glow(f.x,f.y,r*1.1,'#fff6c8',(0.2-k)*3.5);glow(f.x,f.y,r*1.15,'#ff6a1f',(1-k)*0.55);
    fxD(fxF('fx_ex',4,k),f.x,f.y-r*0.2,r*(1.6+k*0.8),{alpha:k>0.75?(1-k)*4:1,tint:f.blue?'blue':null});return}
  if(f.k==='slash'){fxD(fxF('fx_sl',4,k),f.x,f.y,16,{rot:f.a,alpha:1-k*0.6,add:1});return}
  if(f.k==='bolt'&&!f.wl){_foFA(f);for(let i=1;i<f.pts.length;i++)fxD('fx_lt'+Math.min(3,(k*4)|0),f.pts[i][0],f.pts[i][1],16,{add:1,alpha:1-k*0.5});return}
  if(f.k==='strike'){_foFA(f);fxD('fx_lt'+Math.min(3,(k*4)|0),f.x,f.y-4,f.r*2.4,{add:1});return}
  if(f.k==='ultslam'){emitOnce(f,()=>{burstP(f.x,f.y-4,30+f.lv*15,[f.c[0],f.c[1],'#ffffff'],{spd:180+f.lv*40,life:0.8,s:2.4,flat:1})});
    const fr='fx_dust'+Math.min(3,(k*4)|0),rr=f.r*(0.25+k*0.85);fxD(fr,f.x,f.y,Math.min(170,rr*1.4),{sq:0.55,alpha:1-k*0.7});emitOnce2(f,()=>{for(let i=0;i<20+f.lv*6;i++){const an=rand()*TAU;vp(f.x+Math.cos(an)*8,f.y+Math.sin(an)*4,{vx:Math.cos(an)*(120+rand()*140),vy:Math.sin(an)*(70+rand()*60)-30,g:200,life:0.7,s:2.6,c:rand()<0.5?'#8a7050':'#b89870',k:3,vr:8,add:0})}});glow(f.x,f.y,f.r*0.5,f.c[1],0.5*(1-k));return}
  if(f.k==='ultsword'){const y0=f.y-140,y=k<0.5?y0+(f.y-y0)*(k/0.5)**2:f.y;glow(f.x,y-8,10,f.c[1],0.7*(1-k*0.5));fxD('fx_swordg',f.x,y-12,22,{rot:Math.PI/2});
    if(k>=0.5)emitOnce(f,()=>{burstP(f.x,f.y,10,f.c,{spd:90,life:0.35,s:1.8})});return}
  if(f.k==='ultice'){fxD(FX_IS[Math.min(3,(k*4)|0)],f.x,f.y-8,18+k*6,{alpha:k>0.8?(1-k)*5:1});glow(f.x,f.y-8,12,'#9fe8ff',0.5*(1-k));return}
  if(f.k==='ultvine'){const fr=k<0.12?0:k<0.25?1:k<0.78?2:3;drawS('mc_bind'+fr,f.x,f.y+3,{sc:1.5,alpha:k>0.85?(1-k)/0.15:1});if(fr===3)fxD('mc_swirl',f.x,f.y-12,14+k*10,{rot:k*6,alpha:(1-k)*2});return}
  if(f.k==='ultfox'){const x=f.x+(f.tx-f.x)*k,y=f.y+(f.ty-f.y)*k-Math.sin(k*Math.PI)*30;glow(x,y,10,'#d0a8ff',0.9);fxD('fx_petal',x,y,9,{rot:G.t*10});vp(x,y,{life:0.3,s:2,c:'#ffd0f0'});return}
  _foFA(f)};
const _fuFA=drawFxUnder;
drawFxUnder=function(f){
  if(f.k==='frost'){const k=f.t/f.dur;emitOnce(f,()=>{for(let i=0;i<24;i++){const an=i/24*TAU;vp(f.x+Math.cos(an)*10,f.y+Math.sin(an)*6,{vx:Math.cos(an)*f.r*2.6,vy:Math.sin(an)*f.r*1.6,life:0.45,s:2.2,c:i%2?'#ffffff':'#9fe8ff',drag:3})}});
    fxD('fx_c_bang',f.x,f.y,f.r*2*Math.min(1,k*3),{sq:0.6,rot:k*1.5,alpha:1-k,add:1});
    for(let i=0;i<10;i++){const an=i/10*TAU,rr=f.r*Math.min(1,k*3)*0.9;fxD(FX_IS[Math.min(3,(k*4)|0)],f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr*0.6-6,12,{alpha:1-k})}return}
  _fuFA(f)};

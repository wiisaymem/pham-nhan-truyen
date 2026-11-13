'use strict';
// ───────────────────────── TRẤN ẤN LỘ · VẼ (js/tranan/ve.js): nền và vách hầm ngục tròn
if(TA){
  const {C,RR}=TA;
  function drawFloor(f){
    f.t=1;ctx.save();ctx.translate(C,C);ctx.scale(1,1);
    ctx.globalAlpha=0.16;ctx.fillStyle='#1a1030';ctx.beginPath();ctx.arc(0,0,RR,0,TAU);ctx.fill();ctx.globalAlpha=1;
    fxD('fx_c_bagua',0,0,120,{alpha:0.2,rot:G.t*0.05});
    ring(0,0,RR-2,'#b48cff',2.5,0.7);ring(0,0,RR-7,'#5a3a9a',1,0.6);
    for(let i=0;i<16;i++){const a=i/16*TAU+G.t*0.03,p=0.5+0.5*Math.sin(G.t*2+i);glow(Math.cos(a)*(RR-2),Math.sin(a)*(RR-2),5+p*3,'#b48cff',0.35+p*0.3)}
    ctx.restore();ctx.globalAlpha=1;
    const H=G.hd;if(H&&H.tier%10===0){const gy=C-RR+34;glow(C,gy-10,60,'#b48cff',0.35+0.1*Math.sin(G.t*1.5));fxD('ks_vortex',C,gy-14,70,{rot:G.t*0.5,alpha:0.85});fxD('p_redgate',C,gy-22,78,{alpha:0.95})}
    if(H)for(const s of H.pend){const k=Math.max(0,1-s.t/1.2),R=s.boss?26:s.elite?14:9;ctx.save();ctx.translate(s.x,s.y);ctx.scale(1,0.6);ctx.globalAlpha=0.25+k*0.4;ctx.fillStyle=s.boss?'#ff3d6e':'#9b7bff';ctx.beginPath();ctx.arc(0,0,R*k,0,TAU);ctx.fill();ring(0,0,R,s.boss?'#ffd0d8':'#e8dcff',1.2,0.8);ctx.restore();ctx.globalAlpha=1}
  }
  function drawWall(f){
    ctx.save();ctx.fillStyle='#0b0714';ctx.beginPath();ctx.rect(C-1400,C-1400,2800,2800);ctx.arc(C,C,RR+1,0,TAU,true);ctx.fill('evenodd');
    const g=ctx.createRadialGradient(C,C,RR-26,C,C,RR+1);g.addColorStop(0,'rgba(11,7,20,0)');g.addColorStop(1,'rgba(11,7,20,0.75)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(C,C,RR+1,0,TAU);ctx.fill();ctx.restore();
  }
  Object.assign(TA,{drawFloor,drawWall});
}

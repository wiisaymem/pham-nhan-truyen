'use strict';
// ───────────────────────── Lưới biến dạng cho Lâm Phong (31/10/2026, Kent duyệt từ bản demo "Lâm Phong Thở")
// Một khung sprite, phủ lưới 3 điểm ảnh; mỗi điểm có trọng số: đầu/vai đi theo nhịp thở, tà áo và tóc là chuỗi lò xo
// bay theo gió (WX) và kéo ngược hướng chạy. Giày đứng yên. Vẽ bằng lấy mẫu ngược nên điểm ảnh vẫn sắc, độ mịn ×3.
// Tắt: mở game với ?luoi=0 (nhớ trong máy), bật lại bằng ?luoi=1. Tắt luôn khi đồ họa ở mức thấp (FXQ 0).
const LUOI=(()=>{try{const q=new URLSearchParams(location.search).get('luoi');if(q!==null)localStorage.setItem('vktt_luoi',q==='1'?'1':'0');return localStorage.getItem('vktt_luoi')!=='0'}catch(e){return true}})();
if(LUOI){
  const RES=3,GS=3,PAD=3;
  const cl=v=>v<0?0:v>1?1:v,sm=(a,b,v)=>{const t=cl((v-a)/(b-a));return t*t*(3-2*t)};
  const chain=n=>({n,N:Array.from({length:n},()=>({x:0,vx:0,y:0,vy:0}))});
  const LM={last:0,ph:0,lift:0,liftV:0,px:null,py:null,vx:0,vy:0,SK:chain(5),HA:chain(4),trail:0,dt:0.016,acc:0,wind:0,flut:0,spd:0};
  const BANK={};   // theo khung: điểm ảnh nguồn + lưới trọng số + canvas đích
  function stepChain(c,F,k,d,inert,dt){for(let i=1;i<c.n;i++){const p=c.N[i-1],q=c.N[i],g=i/(c.n-1),tx=p.x+F*g,ty=p.y*0.9-Math.abs(q.x)*0.08;
    q.vx+=((tx-q.x)*k-q.vx*d)*dt;q.vy+=((ty-q.y)*k-q.vy*d-inert*g)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}}
  const at=(c,t)=>{t=cl(t)*(c.n-1);const i=Math.min(c.n-2,t|0),u=t-i;return[c.N[i].x*(1-u)+c.N[i+1].x*u,c.N[i].y*(1-u)+c.N[i+1].y*u]};
  function prep(k){
    const m=SPR[k],r=m.r,w=r[2],h=r[3],c=mk(w,h),x=c.getContext('2d');x.drawImage(m.img||ATLAS,r[0],r[1],w,h,0,0,w,h);
    const src=new Uint32Array(x.getImageData(0,0,w,h).data.buffer),FW=w+2*PAD,FH=h+2*PAD,NX=Math.ceil(FW/GS)+1,NY=Math.ceil(FH/GS)+1,d=k[k.length-2];
    const V=[];
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const xf=(i*GS-PAD)/w,yf=(j*GS-PAD)/h;
      const wB=1-sm(0.40,0.58,yf),wHead=1-sm(0.30,0.38,yf);
      const wS=sm(0.57,0.82,yf)*(1-sm(0.83,0.88,yf))*(0.75+Math.min(1,Math.abs(xf-0.5)*2)*0.5);
      let wH=0;
      if(d==='D')wH=(xf<0.3||xf>0.7?1:0)*sm(0.16,0.33,yf)*(1-sm(0.33,0.40,yf));
      else if(d==='R')wH=(1-sm(0.36,0.46,xf))*sm(0.12,0.40,yf)*(1-sm(0.42,0.48,yf));
      else wH=sm(0.22,0.30,xf)*(1-sm(0.70,0.78,xf))*sm(0.14,0.38,yf)*(1-sm(0.39,0.45,yf));
      const wSl=d!=='R'&&(xf<0.16||xf>0.84)?sm(0.48,0.64,yf)*(1-sm(0.65,0.70,yf))*0.5:0;
      const bump=d==='R'?0:Math.sin(Math.PI*cl((yf-0.33)/0.2));
      V.push({xf,yf,wB,wHead,wS,wH,wSl,bump,rip:sm(0.74,0.82,yf)*(1-sm(0.83,0.88,yf)),dx:0,dy:0})}
    const cv=mk(FW*RES,FH*RES),g=cv.getContext('2d'),img=g.createImageData(FW*RES,FH*RES);
    return BANK[k]={w,h,src,FW,FH,NX,NY,V,cv,g,img,o32:new Uint32Array(img.data.buffer)};
  }
  function physics(){
    const now=performance.now(),dt=Math.min(0.05,(now-LM.last)/1000||0.016);if(now-LM.last<4)return;LM.last=now;
    const P=G.p;if(LM.px!==null){const ivx=(P.x-LM.px)/dt,ivy=(P.y-LM.py)/dt;LM.vx+=(ivx-LM.vx)*Math.min(1,dt*10);LM.vy+=(ivy-LM.vy)*Math.min(1,dt*10)}LM.px=P.x;LM.py=P.y;
    LM.ph+=dt*(P.mv?26:15)/60*Math.PI*2;const p=LM.ph%(Math.PI*2),b=p<Math.PI*1.15?0.5-0.5*Math.cos(p/1.15):0.5+0.5*Math.cos((p-Math.PI*1.15)/0.85);
    const pv=LM.liftV;LM.liftV+=((0.7*b-LM.lift)*60-LM.liftV*12)*dt;LM.lift+=LM.liftV*dt;const acc=(LM.liftV-pv)/dt;
    const t=G.t||now/1000,wx=typeof WX!=='undefined'?WX.wind*WX.dir:0.3,breeze=0.35+0.25*Math.sin(t*0.7)+0.15*Math.sin(t*1.9+1);
    LM.wind=(wx*0.9+breeze*Math.sign(wx||1))*0.5;LM.flut=0.25*Math.sin(t*7.3)*(0.5+Math.abs(wx));
    LM.spd=Math.min(1,Math.hypot(LM.vx,LM.vy)/60);
    LM.dt=dt;LM.acc=acc;
  }
  // lực ngang trong hệ tọa độ của hình (đã tính lật trái/phải)
  function drive(d,flip){
    const sx=flip?-1:1,dt=LM.dt||0.016;let trail=-LM.vx*sx*0.022;if(d==='R')trail=-Math.abs(LM.vx)*0.03;
    trail=Math.max(-1,Math.min(1,trail));const W=LM.wind*sx+LM.flut,F=(W+trail)*0.9;
    if(LM._f===LM.last)return;LM._f=LM.last;
    for(let s=0;s<3;s++){stepChain(LM.SK,F*1.2,70,6,LM.acc*0.5,dt/3);stepChain(LM.HA,F*0.7,95,6,LM.acc*0.35,dt/3)}
  }
  function warp(B,d){
    const A=LM.lift,t=G.t||0,ripA=(Math.abs(LM.wind)+LM.spd*0.6)*0.3;
    for(const v of B.V){let dx=(v.xf-0.5)*B.w*0.03*A*v.bump,dy=-A*v.wB-0.15*v.wHead*Math.max(0,Math.sin(LM.ph-0.7));
      if(v.wS>0){const[cx,cy]=at(LM.SK,(v.yf-0.57)/0.27),g=v.wS*(1-0.5*LM.spd);dx+=cx*g;dy+=cy*g}
      if(v.rip>0){dx+=v.rip*ripA*Math.sin(v.xf*B.w*0.5-t*5.2);dy+=v.rip*ripA*0.6*Math.sin(v.xf*B.w*0.7-t*6.1+1)}
      if(v.wSl>0){const[cx,cy]=at(LM.SK,0.35);dx+=cx*0.45*v.wSl;dy+=cy*0.3*v.wSl}
      if(v.wH>0){const[hx,hy]=at(LM.HA,d==='R'||d==='U'?(v.yf-0.12)/0.33:(v.yf-0.16)/0.24);dx+=hx*v.wH;dy+=hy*v.wH}
      v.dx=dx;v.dy=dy}
    const ow=B.FW*RES,oh=B.FH*RES,o32=B.o32,src=B.src,V=B.V,NX=B.NX,NY=B.NY,w=B.w,h=B.h;o32.fill(0);
    for(let oy=0;oy<oh;oy++){const fy=(oy+0.5)/RES,gj=fy/GS,j=Math.min(NY-2,gj|0),q=gj-j;
      for(let ox=0;ox<ow;ox++){const fx=(ox+0.5)/RES,gi=fx/GS,i=Math.min(NX-2,gi|0),u=gi-i,a=V[j*NX+i],b=V[j*NX+i+1],c=V[(j+1)*NX+i],e=V[(j+1)*NX+i+1];
        const dx=(a.dx*(1-u)+b.dx*u)*(1-q)+(c.dx*(1-u)+e.dx*u)*q,dy=(a.dy*(1-u)+b.dy*u)*(1-q)+(c.dy*(1-u)+e.dy*u)*q;
        const sx=Math.floor(fx-dx-PAD),sy=Math.floor(fy-dy-PAD);if(sx>=0&&sy>=0&&sx<w&&sy<h){const p=src[sy*w+sx];if(p>>>24)o32[oy*ow+ox]=p}}}
    B.g.putImageData(B.img,0,0);
  }
  const _dSL=drawS;
  drawS=function(k,x,y,o){
    const ok=!(o&&o.white)&&ATLAS&&FXQ>0&&G&&G.p&&/^lp(8?_w|_i)_[DRU]\d$/.test(k)&&SPR[k];
    if(!ok)return _dSL(k,x,y,o);
    let B;try{B=BANK[k]||prep(k)}catch(e){return _dSL(k,x,y,o)}   // ảnh từ nơi khác không đọc được điểm ảnh: vẽ như cũ
    const d=k[k.length-2],flip=!!(o&&o.flip);physics();drive(d,flip);warp(B,d);
    const m=SPR[k],sc=o&&o.sc||1,kx=m.ww/B.w*sc,ky=m.wh/B.h*sc,W=B.FW*kx,H=B.FH*ky;
    if(o&&o.alpha!==undefined)ctx.globalAlpha=o.alpha;
    if(flip){ctx.save();ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(B.cv,-m.ax*sc-PAD*kx,-m.ay*sc-PAD*ky,W,H);ctx.restore()}
    else ctx.drawImage(B.cv,x-m.ax*sc-PAD*kx,y-m.ay*sc-PAD*ky,W,H);
    if(o&&o.alpha!==undefined)ctx.globalAlpha=1;
    return true;
  };
}

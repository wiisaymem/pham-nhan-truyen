'use strict';
// ───────────────────────── Đại chiêu v2: mỗi tu sĩ một kịch bản riêng (không còn chung kiểu nhảy lên đập xuống)
// Kim (Lâm Phong): kiếm trận xoay → bắn tỏa → cự kiếm giáng
// Mộc (Linh Nhi): gieo hạt → rễ lan trói → cổ thụ nở hoa hồi máu
// Thủy (Hàn Băng): bão tuyết → đóng băng, ngừng thời gian → vỡ vụn
// Lôi (Lôi Chấn): nhảy giữa mây giông, sét giáng → nện búa, lôi xích
// Hỏa (Mộ Dung Yên): hỏa phượng bay vòng số 8, để vệt lửa → lao về nổ
// Hồ (Bạch Hồ): chín đuôi xòe → phân thân lao chém → xoáy mị hoặc hút yêu quái rồi nổ
const ULT_D={
  kim:['','Kiếm trận xoay quanh thân rồi bắn tỏa bốn phía','Thêm loạt kiếm thứ hai, nhiều kiếm hơn','Cự kiếm từ trời giáng xuống, thời gian chậm lại','Pháp tướng Thiên Kiếm khổng lồ, sát thương x1.5','Mưa kiếm sau cú giáng, để lại kiếm trận'],
  moc:['','Gieo hạt linh mộc, rễ lan ra trói yêu quái','Nhiều rễ hơn, dây gai đâm lên từ mặt đất','Rễ phủ cả màn hình, cây linh nở hoa hồi máu','Cổ thụ pháp tướng mọc lên, sát thương x1.5','Để lại rừng dây leo hút máu'],
  thuy:['','Bão tuyết nổi lên, đóng băng rồi vỡ vụn yêu quái','Băng trùy mọc lên giữa lúc đóng băng','Băng phong cả màn hình, thời gian ngừng trôi','Băng Long bay ngang màn hình, sát thương x1.5','Để lại vùng băng giá trói chân'],
  loi:['','Nhảy lên giữa mây giông, nện búa xuống đất','Sét giáng liên hồi, lôi xích lan qua yêu quái','Giông bão cả màn hình, thời gian chậm lại','Lôi Thần chi chùy giáng xuống, sát thương x1.5','Nện lần hai, để lại lôi trận'],
  hoa:['','Hỏa phượng bay vòng số 8, để lại vệt lửa','Hai hỏa phượng bay đối xứng','Phượng bay phủ cả màn hình rồi lao về nổ tung','Phượng Hoàng pháp tướng thật sự, sát thương x1.5','Biển lửa còn cháy trên mặt đất'],
  ho:['','Phân thân hồ ảnh lao tới chém yêu quái','Thêm phân thân, mở xoáy mị hoặc hút yêu quái','Chín đuôi xòe ra, thời gian chậm lại','Cửu Vĩ Hồ pháp tướng hiện sau lưng, sát thương x1.5','Để lại hồ hỏa thiêu đốt'],
};
function ultLvD(ch,lv){const U=ULT[ch]||ULT.lamphong,L=ULT_D[U.k]||ULT_LV_D;return i18n('ult.'+U.k+'.'+lv,L[lv])}
const ULT_DUR={kim:[0,1.4,1.6,1.9,2.2,2.6],moc:[0,1.6,1.8,2.1,2.4,2.8],thuy:[0,1.7,1.9,2.1,2.4,2.8],loi:[0,1.3,1.6,2.0,2.4,2.8],hoa:[0,1.9,2.0,2.2,2.4,2.8],ho:[0,1.5,1.9,2.1,2.4,2.8]};

// ── tiện ích
function uOnce(u,key,t){if(!u[key]&&u.t>=t){u[key]=1;return true}return false}
function uHitSet(set,x,y,r,dmg,el,kb){G.src='burst';let n=0;forNear(x,y,r+20,e=>{if(set.has(e)||e.dead)return;if(Math.hypot(e.x-x,e.y-y)<r+e.r){set.add(e);n++;hurtE(e,e.d.boss?dmg*3:dmg,el,{kb,kx:x,ky:y,rx:1})}});return n}
function uBuzz(p){if(typeof buzz==='function')buzz(p)}
function uNear(x,y,R,max){const L=[];forNear(x,y,R,e=>{if(!e.dead&&Math.hypot(e.x-x,e.y-y)<R)L.push(e)});for(let i=L.length-1;i>0;i--){const j=(rand()*(i+1))|0;[L[i],L[j]]=[L[j],L[i]]}return max?L.slice(0,max):L}
// vẽ ảnh trong atlas theo chiều cao h (dùng được cả trong không gian thế giới)
function uSpr(key,x,y,h,a,flip){const m=SPR[key];if(!m||!ATLAS)return false;const r=m.r,w=h*r[2]/r[3];ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.imageSmoothingEnabled=!!m.smooth||h*Z>r[3]*2.2;ctx.drawImage(m.img||ATLAS,r[0],r[1],r[2],r[3],-w/2,-h/2,w,h);ctx.imageSmoothingEnabled=false;ctx.restore();ctx.globalAlpha=1;return true}
const uEnd=u=>Math.max(0,Math.min(1,(u.dur-u.t)/0.4));

const ULTS={
// ════════ KIM · Vạn Kiếm Triều Tông
kim:{ch:0.5,hit:0.5,
  upd(u,dt,t){const P=G.p,lv=u.lv,n=[0,8,10,12,16,20][lv],R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(!S.sw){S.sw=[];S.rot=0}S.rot+=dt*(2+Math.min(t,0.5)*16);
    while(S.sw.length<n&&t>=S.sw.length*0.4/n){const i=S.sw.length;S.sw.push({a:i/n*TAU,fly:0,hit:new Set});if(i%3===0)sfx('sword')}
    for(const s of S.sw){if(!s.fly){const a=s.a+S.rot;s.x=P.x+Math.cos(a)*34;s.y=P.y-14+Math.sin(a)*17;s.dir=a}
      else{s.d+=dt*(560+lv*40);s.x=s.ox+Math.cos(s.dir)*s.d;s.y=s.oy+Math.sin(s.dir)*s.d*0.8;if(s.d<R+60)uHitSet(s.hit,s.x,s.y+8,16,D*(lv>=3?0.6:1),'kim',60);else s.gone=1}}
    if(uOnce(u,'launch',0.5)){for(const s of S.sw){s.fly=1;s.ox=s.x;s.oy=s.y;s.d=0}S.slash=t;shake(0.35+lv*0.05);flash(u.U.c[0],0.25);sfx('boom');sfx('sword');uBuzz([30,20,40])}
    if(lv>=2&&uOnce(u,'v2',0.85)){const m=n>>1,o=rand()*TAU;for(let i=0;i<m;i++)S.sw.push({dir:o+i/m*TAU,fly:1,ox:P.x,oy:P.y-14,d:0,hit:new Set,x:P.x,y:P.y});sfx('sword');shake(0.25)}
    if(lv>=3){if(uOnce(u,'gs',1.0)){S.gx=P.x;S.gy=P.y;sfx('level')}
      if(uOnce(u,'gsHit',1.25)){ultHit(S.gx,S.gy,R,D,'kim',140);shake(0.6+lv*0.1);flash('#fff6c0',0.5);sfx('realm');sfx('boom');uBuzz([60,30,100+lv*20]);G.fx.push({k:'ultslam',x:S.gx,y:S.gy,r:R,lv,c:u.U.c,t:0,dur:0.9})}}
    if(lv>=5&&t>1.3&&t<u.dur-0.3){u.fx-=dt;if(u.fx<=0){u.fx=0.06;ultElem(u,R)}}
    S.sw=S.sw.filter(s=>!s.gone);
    return t<0.5?(lv>=3?0.2:0.4):(lv>=3&&t>1.0&&t<1.3)?0.35:1},
  under(u){const P=G.p,t=u.t;if(t<0.6){const k=Math.min(1,t/0.4);ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.5);ctx.rotate(t*3);ctx.strokeStyle='#ffd45a';ctx.globalAlpha=0.6*k;ctx.lineWidth=1.5;
      ctx.beginPath();for(let i=0;i<=8;i++){const a=i/8*TAU;i?ctx.lineTo(Math.cos(a)*44,Math.sin(a)*44):ctx.moveTo(44,0)}ctx.stroke();ring(0,0,30,'#fff6c0',1,0.5*k);ctx.restore();ctx.globalAlpha=1}},
  world(u){const S=u.st,C=u.U.c,t=u.t;if(!S.sw)return;
    for(const s of S.sw){const a=s.fly?Math.atan2(Math.sin(s.dir)*0.8,Math.cos(s.dir)):-Math.PI/2;glow(s.x,s.y,10,C[1],s.fly?0.6:0.45);drawRot(PS.swordG,s.x,s.y,a,s.fly?1.3:1.1,1);
      if(s.fly&&rand()<0.6)vp(s.x,s.y,{life:0.25,s:1.8,c:C[(rand()*2)|0],drag:4})}
    if(S.gx!==undefined&&t<1.6){const k=Math.min(1,(t-1.0)/0.25),y=S.gy-260+260*k*k,a=t<1.25?1:Math.max(0,1-(t-1.25)/0.35);
      glow(S.gx,y-30,40+u.lv*8,C[1],0.7*a);
      if(u.lv>=4)uSpr(u.U.sum,S.gx,y-55,120,a);else drawRot(PS.swordG,S.gx,y-30,Math.PI/2,5,a);
      if(t<1.25){ctx.save();ctx.translate(S.gx,S.gy);ctx.scale(1,0.5);ring(0,0,60*(1-k)+12,'#fff6c0',2,k);ctx.restore()}}},
  screen(u,px,py){const t=u.t;if(u.st.slash!==undefined){const k=(t-u.st.slash)/0.3;if(k<1){ctx.save();ctx.globalCompositeOperation='lighter';
      for(const s of [1,-1]){ctx.globalAlpha=(1-k)*0.9;ctx.strokeStyle=u.U.c[1];ctx.lineWidth=14*(1-k)+2;ctx.beginPath();ctx.moveTo(VW/2-s*VW*0.7,VH*0.5-VH*0.6);ctx.lineTo(VW/2-s*VW*0.7+s*VW*1.4*Math.min(1,k*3),VH*0.5-VH*0.6+VH*1.2*Math.min(1,k*3));ctx.stroke();
        ctx.strokeStyle='#ffffff';ctx.lineWidth=3*(1-k)+1;ctx.stroke()}ctx.restore();ctx.globalAlpha=1}}}},

// ════════ MỘC · Vạn Mộc Hồi Xuân
moc:{ch:0.45,hit:1.0,
  upd(u,dt,t){const P=G.p,lv=u.lv,R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(uOnce(u,'seed',0.45)){const m=[0,5,6,9,11,13][lv],o=rand()*TAU;S.roots=[];S.ox=P.x;S.oy=P.y;
      for(let i=0;i<m;i++)S.roots.push({a:o+i/m*TAU+(rand()-.5)*0.3,seed:rand()*99,hit:new Set,br:rand()<0.6?0.35+rand()*0.4:0});
      shake(0.25);sfx('pick');sfx('boom');burstP(P.x,P.y-2,30,['#7bff9a','#e8ffe0','#ffd45a'],{spd:120,life:0.5,flat:1})}
    if(S.roots){S.len=Math.min(R,(t-0.45)/0.55*R);
      for(const r of S.roots){const [x,y]=mocTip(S,r,S.len);G.src='burst';
        forNear(x,y,40,e=>{if(r.hit.has(e)||e.dead)return;if(Math.hypot(e.x-x,e.y-y)<18+e.r){r.hit.add(e);hurtE(e,e.d.boss?D*1.5:D*0.5,'moc',{rx:1});if(!e.d.boss)e.rootT=Math.max(e.rootT||0,2.5);e.slowT=Math.max(e.slowT||0,2.5)}})}}
    if(uOnce(u,'bloom',1.0)){ultHit(P.x,P.y,R,D*0.8,'moc',40);const h=P.mhp*(0.1+lv*0.03);P.hp=Math.min(P.mhp,P.hp+h);G.nums.push({x:P.x,y:P.y-34,v:'+'+h.toFixed(0),t:0,c:'#6dff8a'});
      S.tree=t;flash('#d8ffc8',0.4);shake(0.4+lv*0.1);sfx('realm');uBuzz([40,30,80+lv*20]);burstP(P.x,P.y-40,40+lv*12,['#ffb3cf','#ffffff','#7bff9a','#ffd0e8'],{spd:160,up:40,life:1.0,s:2.2,g:40})}
    if(lv>=2&&t>1.0&&t<u.dur-0.3){u.fx-=dt;if(u.fx<=0){u.fx=lv>=4?0.07:0.12;ultElem(u,R)}}
    return t<0.45?(lv>=3?0.25:0.5):t<1.0?(lv>=3?0.4:0.65):1},
  under(u){const P=G.p,S=u.st,t=u.t;
    if(t<0.5){const k=t/0.45;glow(P.x,P.y-2,8+k*16,'#7bff9a',0.5+k*0.4);ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.5);ring(0,0,50*(1-k)+6,'#e8ffe0',2,k);ctx.restore();
      for(let i=0;i<2;i++){const a=rand()*TAU,d=40+rand()*50;vp(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.5,{vx:-Math.cos(a)*d*2.5,vy:-Math.sin(a)*d*1.2-20,life:0.35,s:1.8,c:rand()<0.5?'#7bff9a':'#ffd45a',drag:0})}}
    if(!S.roots)return;const fade=uEnd(u);ctx.lineCap='round';ctx.lineJoin='round';
    for(const r of S.roots){const N=Math.max(2,(S.len/10)|0);
      for(const [w,c] of [[5,'#3a2410'],[2.5,'#6a4a20']]){ctx.globalAlpha=fade;ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();for(let i=0;i<=N;i++){const [x,y]=mocTip(S,r,S.len*i/N);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      if(r.br&&S.len>40){const bl=S.len*r.br,[bx,by]=mocTip(S,r,bl),a2=r.a+(r.seed%2?0.7:-0.7),L2=Math.min(60,(S.len-bl)*0.6);ctx.strokeStyle='#4a3014';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+Math.cos(a2)*L2*0.5+5,by+Math.sin(a2)*L2*0.3,bx+Math.cos(a2)*L2,by+Math.sin(a2)*L2*0.5);ctx.stroke()}
      for(let i=1;i<=N;i+=2){const [x,y]=mocTip(S,r,S.len*i/N);ctx.fillStyle=i%4===1?'#5ee05a':'#9dff8a';ctx.fillRect(x-1.5,y-3,3,3)}
      const [tx,ty]=mocTip(S,r,S.len);if(S.len<ultRadius(u.lv)-1)glow(tx,ty-2,10,'#7bff9a',0.7)}
    ctx.lineCap='butt';ctx.lineJoin='miter';ctx.globalAlpha=1},
  world(u){const S=u.st,t=u.t,P=G.p;if(S.tree===undefined)return;const k=Math.min(1,(t-S.tree)/0.3),e=uEnd(u),x=S.ox,y=S.oy-4;
    glow(x,y-50*k,40+u.lv*10,'#7bff9a',0.5*e);
    if(u.lv>=4){uSpr(u.U.sum,x,y-70*k,140*(0.4+k*0.6),0.95*e)}
    else{const h=50*k;ctx.globalAlpha=e;ctx.fillStyle='#5a3a1a';ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x-3,y-h);ctx.lineTo(x+3,y-h);ctx.lineTo(x+7,y);ctx.fill();
      const cs=[[0,-h-10,22],[-16,-h,16],[16,-h,16],[-8,-h-22,14],[10,-h-20,14]];for(const [ox,oy,r] of cs){ctx.fillStyle='#2f9e36';ctx.beginPath();ctx.arc(x+ox,y+oy,r*k+1,0,TAU);ctx.fill();ctx.fillStyle='#5ee05a';ctx.beginPath();ctx.arc(x+ox-3,y+oy-3,r*k*0.6,0,TAU);ctx.fill()}
      for(let i=0;i<10;i++){const a=i*2.4,rr=(8+(i*7)%18)*k;ctx.fillStyle=i%2?'#ffb3cf':'#ffffff';ctx.fillRect(x+Math.cos(a)*rr-1.5,y-h-8+Math.sin(a)*rr*0.8-1.5,3,3)}ctx.globalAlpha=1}
    if(rand()<0.5)vp(x+(rand()-.5)*80,y-60-rand()*40,{vx:(rand()-.5)*20,vy:20,g:10,life:1.2,s:2,c:rand()<0.5?'#ffb3cf':'#ffffff',add:0,drag:0.5})},
  player(u,base){const P=G.p,t=u.t;if(t>0.05&&t<0.55){const k=Math.sin(Math.min(1,(t-0.05)/0.4)*Math.PI/2);ctx.save();ctx.translate(P.x,P.y);ctx.scale(1+k*0.12,1-k*0.18);ctx.translate(-P.x,-P.y);base();ctx.restore()}else base()},
  screen(u){const t=u.t,S=u.st;if(S.tree===undefined)return;const e=uEnd(u),k=Math.min(1,(t-S.tree)/0.3)*e;
    const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(120,255,140,0)');g.addColorStop(1,`rgba(60,180,80,${0.35*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    for(let i=0;i<(u.lv>=3?40:18);i++){const sp=40+(i*37)%50,x=((i*97.3+Math.sin(t*2+i)*30+(t-S.tree)*20)%VW+VW)%VW,y=((i*61.7)%VH+(t-S.tree)*sp*2)%VH;ctx.globalAlpha=0.85*k;ctx.fillStyle=i%3?'#ffb3cf':'#ffffff';ctx.save();ctx.translate(x,y);ctx.rotate(t*3+i);ctx.fillRect(-2.5,-1.5,5,3);ctx.restore()}ctx.globalAlpha=1}},

// ════════ THỦY · Băng Phong Thiên Địa
thuy:{ch:0.7,hit:0.7,
  upd(u,dt,t){const P=G.p,lv=u.lv,R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(t<0.7)forNear(P.x,P.y,R,e=>{e.slowT=Math.max(e.slowT||0,1.2)});
    if(t<0.7&&rand()<0.5)sfx('gem');
    if(uOnce(u,'freeze',0.7)){S.fz=uNear(P.x,P.y,R,140);G.src='burst';for(const e of S.fz){hurtE(e,D*0.25,'thuy',{rx:1});if(!e.d.boss)e.rootT=Math.max(e.rootT||0,2.4);e.slowT=Math.max(e.slowT||0,3.5)}
      flash('#e8fbff',0.55);shake(0.3);sfx('realm');uBuzz([30,20,30])}
    if(lv>=2&&t>0.7&&t<1.25){u.fx-=dt;if(u.fx<=0){u.fx=lv>=4?0.05:0.1;ultElem(u,R)}}
    if(lv>=4&&uOnce(u,'drg',0.75))sfx('level');
    if(uOnce(u,'shatter',1.25)){G.src='burst';let c=0;for(const e of S.fz||[]){if(e.dead)continue;hurtE(e,e.d.boss?D*3:D,'thuy',{kb:60,kx:P.x,ky:P.y,rx:1});
        if(c++<40){G.fx.push({k:'ultice',x:e.x,y:e.y,t:0.5,dur:0.8});for(let i=0;i<4;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*160,vy:-40-rand()*80,g:260,life:0.6,s:2.4,c:i%2?'#e8fbff':'#9fe8ff',k:3,vr:10,add:0})}}
      ultHit(P.x,P.y,R*0.5,D*0.5,'thuy',80);S.crack=t;shake(0.55+lv*0.1);sfx('boom');sfx('bigkill');uBuzz([70,30,110+lv*15])}
    return t<0.7?(lv>=3?0.3:0.55):t<1.25?(lv>=3?0.04:0.25):1},
  under(u){const P=G.p,t=u.t,R=ultRadius(u.lv),k=Math.min(1,t/0.7),e=uEnd(u);ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.55);
    ctx.globalAlpha=0.22*e;ctx.fillStyle='#d8f6ff';ctx.beginPath();ctx.arc(0,0,R*k,0,TAU);ctx.fill();ring(0,0,R*k,'#ffffff',2,0.7*e);
    for(let i=0;i<12;i++){const a=i/12*TAU;ctx.strokeStyle='#bff4ff';ctx.globalAlpha=0.5*e;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*R*k,Math.sin(a)*R*k);ctx.stroke()}
    ctx.restore();ctx.globalAlpha=1},
  world(u){const P=G.p,t=u.t,S=u.st;
    if(t<0.75){for(let i=0;i<6;i++){const a=t*4+i/6*TAU;const x=P.x+Math.cos(a)*24,y=P.y-14+Math.sin(a)*10;drawRot(PS.ice,x,y,a+Math.PI/2,1,0.9);glow(x,y,6,'#9fe8ff',0.5)}}
    if(S.fz&&t<1.3){const a=t<1.25?1:1-(t-1.25)/0.05;for(const e of S.fz){if(e.dead)continue;const w=e.r*1.3+3,h=e.r*2.2+6,x=e.x,y=e.y-e.r;
      ctx.globalAlpha=0.55*a;ctx.fillStyle='#bff4ff';ctx.beginPath();ctx.moveTo(x,y-h*0.6);ctx.lineTo(x+w,y-h*0.2);ctx.lineTo(x+w*0.8,y+h*0.45);ctx.lineTo(x-w*0.7,y+h*0.5);ctx.lineTo(x-w,y-h*0.15);ctx.closePath();ctx.fill();
      ctx.globalAlpha=0.9*a;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#ffffff';ctx.fillRect(x-w*0.5,y-h*0.3,2,h*0.35)}ctx.globalAlpha=1}
    if(t<0.7&&rand()<0.9){const a=rand()*TAU,d=rand()*ultRadius(u.lv);vp(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.6-60,{vx:-60,vy:90,life:0.6,s:1.8,c:'#ffffff',add:0,drag:0})}},
  player(u,base){const P=G.p,t=u.t,l=t<0.7?Math.min(1,t/0.3)*8:t<1.3?8:8*Math.max(0,1-(t-1.3)/0.3);glow(P.x,P.y-12-l,20+Math.sin(t*20)*3,'#9fe8ff',0.6);ctx.save();ctx.translate(0,-l);base();ctx.restore()},
  screen(u,px,py){const t=u.t,lv=u.lv,S=u.st,e=uEnd(u),k=Math.min(1,t/0.7)*e;
    // sương giá bò vào từ mép
    const g=ctx.createRadialGradient(VW/2,VH/2,VH*(0.55-0.25*k),VW/2,VH/2,VH*0.8);g.addColorStop(0,'rgba(220,248,255,0)');g.addColorStop(1,`rgba(220,248,255,${0.75*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    if(t>0.7&&t<1.25){ctx.fillStyle='rgba(150,220,255,0.18)';ctx.fillRect(0,0,VW,VH)}
    // tuyết thổi chéo
    const n=lv>=3?60:30;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;for(let i=0;i<n;i++){const sp=300+(i*53)%300,x=((i*71.3-t*sp*0.6)%(VW+80)+VW+80)%(VW+80)-40,y=((i*43.9+t*sp)%(VH+40)+VH+40)%(VH+40)-20;ctx.globalAlpha=0.7*k;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8,y-12);ctx.stroke()}ctx.globalAlpha=1;
    // băng long bay ngang
    if(lv>=4&&t>0.72&&t<1.3){const q=(t-0.72)/0.55,x=-VW*0.4+q*VW*1.8,y=VH*0.42+Math.sin(q*Math.PI*2)*VH*0.05;
      for(let i=0;i<12;i++){ctx.globalAlpha=0.5*(1-i/12);ctx.fillStyle=i%2?'#bff4ff':'#ffffff';ctx.beginPath();ctx.arc(x-i*22,y+Math.sin(q*12-i*0.6)*8,14-i,0,TAU);ctx.fill()}ctx.globalAlpha=1;
      glow(x,y,VH*0.18,'#9fe8ff',0.7);uSpr(u.U.sum,x,y,VH*0.32,1,true)}
    // vỡ băng: vết nứt kính
    if(S.crack!==undefined){const q=(t-S.crack)/0.45;if(q<1){ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.globalAlpha=1-q;const Rn=mulberry32(77);for(let i=0;i<14;i++){const a=i/14*TAU+Rn()*0.3;let x=px,y=py;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<5;j++){x+=Math.cos(a+(Rn()-.5)*0.7)*VW*0.12;y+=Math.sin(a+(Rn()-.5)*0.7)*VW*0.12;ctx.lineTo(x,y)}ctx.stroke()}
      ctx.globalAlpha=(1-q)*0.6;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}}}},

// ════════ LÔI · Lôi Thần Giáng Thế (giữ cú nhảy-nện vì hợp với chiếc búa, thêm mây giông và lôi xích)
loi:{ch:0.55,hit:0.55,old:1,
  upd(u,dt,t){const P=G.p,lv=u.lv,R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(t<0.55){S.bt=(S.bt??0)-dt;if(S.bt<=0&&(S.nb|0)<lv*2+2){S.bt=0.07;S.nb=(S.nb|0)+1;const L=uNear(P.x,P.y,R,1),e=L[0],a=rand()*TAU,x=e?e.x:P.x+Math.cos(a)*R*0.6,y=e?e.y:P.y+Math.sin(a)*R*0.4;
      G.fx.push({k:'strike',x,y,r:20,t:0,dur:0.35,gold:0});ultHit(x,y,24,D*0.25,'kim',20);S.fl=t;if(rand()<0.6)sfx('zap')}}
    if(uOnce(u,'slam',0.55)){ultHit(P.x,P.y,R,D,'kim',140);shake(0.5+lv*0.12);flash(u.U.c[1],0.35+lv*0.08);sfx('realm');sfx('boom');uBuzz([60,30,90+lv*20]);G.fx.push({k:'ultslam',x:P.x,y:P.y,r:R,lv,c:u.U.c,t:0,dur:0.9});S.fl=t}
    if(lv>=2)for(const [key,tt] of [['ch1',0.62],['ch2',0.9]]){if(uOnce(u,key,tt)){const pts=[[P.x,P.y-20]],hit=new Set;let cx=P.x,cy=P.y;G.src='burst';
      for(let i=0;i<6+lv*2;i++){let best=null,bd=140;forNear(cx,cy,140,e=>{if(hit.has(e)||e.dead)return;const d=Math.hypot(e.x-cx,e.y-cy);if(d<bd){bd=d;best=e}});if(!best)break;hit.add(best);pts.push([best.x,best.y-best.r*0.5]);hurtE(best,best.d.boss?D*1.2:D*0.4,'kim',{rx:1});best.slowT=Math.max(best.slowT||0,1);cx=best.x;cy=best.y}
      if(pts.length>1){G.fx.push({k:'bolt',pts,t:0,dur:0.3});sfx('zap')}}}
    if(u.slam&&lv>=2&&t<u.dur-0.3){u.fx-=dt;if(u.fx<=0){u.fx=lv>=4?0.05:0.09;ultElem(u,R)}}
    if(lv>=5&&uOnce(u,'wave2',1.35)){ultHit(P.x,P.y,R*1.1,D*0.6,'kim',90);shake(0.6);G.fx.push({k:'ultslam',x:P.x,y:P.y,r:R*1.1,lv,c:u.U.c,t:0,dur:0.8})}
    return t<0.55?(lv>=3?0.15:0.35):t<0.9?(lv>=3?0.4:0.7):1},
  screen(u,px,py){const t=u.t,e=uEnd(u),lv=u.lv;
    // mây giông dải trên
    const h=VH*(lv>=3?0.32:0.2)*Math.min(1,t/0.25)*e,g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(30,18,60,0.9)');g.addColorStop(1,'rgba(30,18,60,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,h);
    for(let i=0;i<9;i++){const x=((i*83+t*30)%(VW+80))-40;ctx.globalAlpha=0.6*e;ctx.fillStyle='#3a2a6a';ctx.beginPath();ctx.ellipse(x,h*0.25,50,h*0.3,0,0,TAU);ctx.fill()}ctx.globalAlpha=1;
    const S=u.st;if(S.fl!==undefined&&t-S.fl<0.08){ctx.globalAlpha=0.3;ctx.fillStyle='#e8e0ff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
    // pháp tướng búa
    if(lv>=4){const k=Math.min(1,t/0.45),drop=t<0.45?0:Math.min(1,(t-0.45)/0.12),hh=VH*0.42*(0.7+k*0.3),y=py-VH*0.32+drop*VH*0.18,a=Math.min(1,k*1.4)*(t>0.6?Math.max(0,e*(1-(t-0.6)/1.2)):1)*0.9;glow(px,y,hh*0.6,u.U.c[1],0.5*k*e);uSpr(u.U.sum,px,y,hh,a)}
    if(t>=0.55&&t<0.75){const k=1-(t-0.55)/0.2;ctx.globalAlpha=k*(lv>=3?0.7:0.4);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}}},

// ════════ HỎA · Hỏa Phượng Liệu Nguyên
hoa:{ch:0.35,hit:1.45,
  upd(u,dt,t){const P=G.p,lv=u.lv,R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(uOnce(u,'go',0.35)){S.ph=[];S.cx=P.x;S.cy=P.y;const A=lv>=3?Math.min(VW*0.44,R*0.9):R*0.85;for(const s of lv>=2?[1,-1]:[1])S.ph.push({s,A,x:P.x,y:P.y,px:P.x,hc:new Map,dz:0});sfx('fire');sfx('level');shake(0.25);uBuzz([30])}
    if(S.ph&&t<1.5){const q=Math.min(1,(t-0.35)/1.1);
      for(const f of S.ph){f.px=f.x;f.x=S.cx+f.s*f.A*Math.sin(q*TAU);f.y=S.cy-10+f.A*0.55*Math.sin(q*TAU*2)/2*1.6;
        G.src='burst';forNear(f.x,f.y,50,e=>{if(e.dead)return;const last=f.hc.get(e)||-9;if(t-last<0.35)return;if(Math.hypot(e.x-f.x,e.y-f.y)<30+e.r){f.hc.set(e,t);hurtE(e,e.d.boss?D:D*0.35,'hoa',{kb:40,kx:f.x,ky:f.y,rx:1})}});
        f.dz-=dt;if(f.dz<=0&&G.zones.length<120){f.dz=0.08;G.zones.push({k:'burn',x:f.x,y:f.y+10,r:16,t:0,dur:1.6+lv*0.3,dps:D*0.15,el:'hoa',tick:0,src:'burst'})}
        if(rand()<0.25)sfx('fire')}}
    if(uOnce(u,'nova',1.45)){ultHit(P.x,P.y,R*0.8,D*0.9,'hoa',120);flash('#ffb02e',0.45);shake(0.5+lv*0.1);sfx('boom');sfx('realm');uBuzz([60,30,100+lv*20]);G.fx.push({k:'ultslam',x:P.x,y:P.y,r:R*0.8,lv,c:u.U.c,t:0,dur:0.9});S.ph=null}
    return t<0.35?(lv>=3?0.25:0.5):t<1.45?(lv>=3?0.6:0.85):1},
  world(u){const S=u.st,t=u.t,P=G.p,C=u.U.c;
    if(!S.ph){if(t<0.4){for(let i=0;i<3;i++){const a=t*10+i/3*TAU;vp(P.x+Math.cos(a)*20,P.y-12+Math.sin(a)*10,{vy:-40,life:0.4,s:2.2,c:C[(rand()*3)|0],drag:1})}}return}
    for(const f of S.ph){const fl=f.x<f.px,fx=f.x,fy=f.y-20;
      for(let i=0;i<4;i++)vp(fx+(rand()-.5)*14,fy+(rand()-.5)*10,{vx:(f.px-f.x)*20+(rand()-.5)*30,vy:-20-rand()*30,life:0.5,s:2.4,c:C[(rand()*3)|0],drag:1.5});
      glow(fx,fy,36,C[1],0.8);glow(fx,fy,18,'#ffffff',0.5);
      if(u.lv>=4&&uSpr(u.U.sum,fx,fy,64,1,fl))continue;
      const w=Math.sin(t*28)*0.6;ctx.save();ctx.translate(fx,fy);if(fl)ctx.scale(-1,1);ctx.globalCompositeOperation='lighter';
      for(const sg of [1,-1]){ctx.fillStyle=C[1];ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-10,sg*(-14-w*10),-26,sg*(-10-w*14));ctx.quadraticCurveTo(-12,sg*-4,-2,0);ctx.fill()}
      ctx.fillStyle=C[2];ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-30,-5);ctx.lineTo(-24,0);ctx.lineTo(-30,5);ctx.fill();
      ctx.fillStyle=C[0];ctx.beginPath();ctx.ellipse(0,0,9,5,0,0,TAU);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(7,-2,3.5,0,TAU);ctx.fill();ctx.restore();ctx.globalCompositeOperation='source-over'}},
  player(u,base){const P=G.p,t=u.t,C=u.U.c,l=t<0.35?t/0.35*10:t<1.45?10:10*Math.max(0,1-(t-1.45)/0.2),e=uEnd(u);
    // cánh lửa sau lưng
    ctx.save();ctx.translate(P.x,P.y-16-l);ctx.globalCompositeOperation='lighter';const fl=0.85+Math.sin(t*18)*0.15;
    for(const sg of [1,-1]){ctx.globalAlpha=0.6*e;ctx.fillStyle=C[1];ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(sg*18,-22*fl,sg*30,-8*fl);ctx.quadraticCurveTo(sg*16,-2,0,4);ctx.fill();ctx.fillStyle=C[2];ctx.globalAlpha=0.5*e;ctx.beginPath();ctx.moveTo(0,2);ctx.quadraticCurveTo(sg*14,4,sg*24,10*fl);ctx.quadraticCurveTo(sg*10,8,0,6);ctx.fill()}
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';glow(P.x,P.y-12-l,26,C[1],0.6*e);ctx.save();ctx.translate(0,-l);base();ctx.restore()},
  screen(u){const t=u.t,e=uEnd(u),k=Math.min(1,t/0.3)*e,lv=u.lv;
    const g=ctx.createLinearGradient(0,VH,0,VH*0.4);g.addColorStop(0,`rgba(255,110,30,${0.45*k})`);g.addColorStop(1,'rgba(255,110,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    ctx.globalCompositeOperation='lighter';for(let i=0;i<(lv>=3?50:24);i++){const sp=60+(i*29)%90,x=((i*89.7+Math.sin(t*3+i)*20)%VW+VW)%VW,y=VH-(((i*53.1)+t*sp*2)%(VH*0.9));ctx.globalAlpha=0.8*k;ctx.fillStyle=i%3?'#ffb02e':'#fff6c0';ctx.fillRect(x,y,2.5,2.5)}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}},

// ════════ HỒ · Cửu Vĩ Huyễn Thiên
ho:{ch:0.45,hit:0.45,
  upd(u,dt,t){const P=G.p,lv=u.lv,R=ultRadius(lv),D=ultDmg(lv),S=u.st;
    if(uOnce(u,'split',0.45)){const n=[0,4,5,6,8,9][lv],T=uNear(P.x,P.y,R,n*3);S.cl=[];
      for(let i=0;i<n;i++){const a=i/n*TAU;S.cl.push({x:P.x,y:P.y,tr:[],tgs:T.splice(0,1+(lv>=3?2:1)),pt:[P.x+Math.cos(a)*R*0.5,P.y+Math.sin(a)*R*0.35],ret:0,hit:0})}
      flash('#ffd0f0',0.35);sfx('level');sfx('sword');shake(0.25);uBuzz([20,20,20,20,40]);S.sp=t}
    if(S.cl){for(const c of S.cl){if(c.done)continue;let tx,ty,tg=c.tgs[0];while(tg&&tg.dead){c.tgs.shift();tg=c.tgs[0]}
      if(c.ret||(!tg&&c.hit)){tx=P.x;ty=P.y;c.ret=1}else if(tg){tx=tg.x;ty=tg.y}else{[tx,ty]=c.pt}
      const dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy)||1,v=Math.min(d,900*dt);c.x+=dx/d*v;c.y+=dy/d*v;c.f=dx<0;c.tr.push([c.x,c.y]);if(c.tr.length>7)c.tr.shift();
      if(d<12){if(c.ret){c.done=1;continue}
        if(tg){G.src='burst';hurtE(tg,tg.d.boss?D*1.5:D*(lv>=2?0.55:0.9),'thuy',{kb:50,kx:c.x,ky:c.y,rx:1});tg.slowT=Math.max(tg.slowT||0,2);c.tgs.shift();burstP(c.x,c.y-10,10,['#ffd0f0','#ffffff','#b48cff'],{spd:90,life:0.35});G.fx.push({k:'spark',x:c.x,y:c.y-10,t:0,dur:0.2,c:'#ffffff'});if(rand()<0.4)sfx('sword')}
        else{ultHit(c.x,c.y,30,D*0.4,'thuy',30);G.fx.push({k:'boom',x:c.x,y:c.y,r:18,t:0,dur:0.3})}c.hit=1;if(!c.tgs.length)c.ret=1}}
      if(t>1.35)S.cl=S.cl.filter(c=>!c.done)}
    if(lv>=2){if(uOnce(u,'vtx',1.05)){const L=uNear(P.x,P.y,R,24);let x=P.x+(P.fx||1)*70,y=P.y+(P.fy||0)*50;if(L.length){x=0;y=0;for(const e of L){x+=e.x;y+=e.y}x/=L.length;y/=L.length}S.vx=x;S.vy=y;sfx('level')}
      if(S.vx!==undefined&&t<1.55)forNear(S.vx,S.vy,R,e=>{if(e.d.boss||e.dead)return;const dx=S.vx-e.x,dy=S.vy-e.y,d=Math.hypot(dx,dy)||1;if(d>10){const v=Math.min(d-8,(160+lv*40)*dt*6);e.x+=dx/d*v*0.25+(-dy/d)*v*0.12;e.y+=dy/d*v*0.25+(dx/d)*v*0.12}});
      if(uOnce(u,'vboom',1.55)){ultHit(S.vx,S.vy,80+lv*12,D,'thuy',60);forNear(S.vx,S.vy,100+lv*12,e=>{e.slowT=Math.max(e.slowT||0,3)});flash('#ffb0e8',0.45);shake(0.5+lv*0.1);sfx('boom');sfx('realm');uBuzz([50,30,90+lv*15]);G.fx.push({k:'ultslam',x:S.vx,y:S.vy,r:80+lv*12,lv,c:u.U.c,t:0,dur:0.8})}}
    else if(uOnce(u,'small',1.0)){ultHit(P.x,P.y,R*0.6,D*0.6,'thuy',60);flash('#ffd0f0',0.3);shake(0.35);sfx('boom')}
    if(lv>=5&&t>1.6&&t<u.dur-0.3){u.fx-=dt;if(u.fx<=0){u.fx=0.08;ultElem(u,R)}}
    return t<0.45?(lv>=3?0.25:0.5):t<1.05?(lv>=3?0.45:0.8):1},
  under(u){const S=u.st,t=u.t;if(S.vx===undefined||t>1.7)return;const k=Math.min(1,(t-1.05)/0.2),q=t<1.55?1:1-(t-1.55)/0.15,R=ultRadius(u.lv)*0.6*(1-(t-1.05)/0.6*0.6);
    ctx.save();ctx.translate(S.vx,S.vy);ctx.scale(1,0.55);ctx.rotate(-t*7);
    for(let i=0;i<5;i++){ctx.strokeStyle=i%2?'#ff7ad0':'#9a6aff';ctx.globalAlpha=0.75*k*q;ctx.lineWidth=3;ctx.beginPath();for(let j=0;j<=20;j++){const r=R*(1-j/20),a=i/5*TAU+j*0.25;j?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.stroke()}
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';glow(S.vx,S.vy-6,30,'#ffb0e8',0.7*k*q)},
  world(u){const S=u.st;if(!S.cl)return;
    for(const c of S.cl){if(c.done)continue;const dir=c.f?'L':'R';
      for(let i=0;i<c.tr.length-1;i++){const [x,y]=c.tr[i];drawPlayerSprite(x,y,dir,1,{tint:'#ff9ae0',ta:0.8,alpha:0.12+i*0.05})}
      glow(c.x,c.y-12,14,'#ffb0e8',0.6);drawPlayerSprite(c.x,c.y,dir,2,{tint:'#ffd0f0',ta:0.45,alpha:0.85})}},
  player(u,base){const P=G.p,t=u.t,e=uEnd(u),n=u.lv>=3?9:[0,3,5][u.lv],k=Math.min(1,t/0.4)*e;
    // chín đuôi xòe sau lưng
    if(u.lv>=4&&t<1.6){const a=Math.min(1,t/0.4)*Math.max(0,1-(t-1.2)/0.4);glow(P.x,P.y-60,70,'#d0a8ff',0.4*a);uSpr(u.U.sum,P.x,P.y-62,110,0.75*a)}
    ctx.save();ctx.translate(P.x,P.y-8);ctx.lineCap='round';ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*0.32*k,L=(26+Math.sin(i*1.7)*4)*k,sw=Math.sin(t*6+i)*6;ctx.globalAlpha=0.55;ctx.strokeStyle=i%2?'#ffd0f0':'#ffffff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,0);
      ctx.quadraticCurveTo(Math.cos(a)*L*0.5+sw,Math.sin(a)*L*0.5,Math.cos(a)*L+sw*1.5,Math.sin(a)*L);ctx.stroke();ctx.globalAlpha=0.9;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(Math.cos(a)*L+sw*1.5,Math.sin(a)*L,2.5,0,TAU);ctx.fill()}
    ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineCap='butt';base()},
  screen(u){const t=u.t,e=uEnd(u),k=Math.min(1,t/0.3)*e,S=u.st;
    const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.25,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(255,170,230,0)');g.addColorStop(1,`rgba(150,90,220,${0.45*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    if(S.sp!==undefined&&t-S.sp<0.25){const q=(t-S.sp)/0.25;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-q)*0.3;ctx.fillStyle='#ff60c0';ctx.fillRect(-6*(1-q),0,VW,VH);ctx.fillStyle='#6090ff';ctx.fillRect(6*(1-q),0,VW,VH);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
    for(let i=0;i<(u.lv>=3?30:14);i++){const x=((i*113.1+Math.sin(t*1.5+i)*40)%VW+VW)%VW,y=((i*67.3-t*(30+i%5*10))%VH+VH)%VH;ctx.globalAlpha=0.7*k;ctx.fillStyle=i%2?'#ffd0f0':'#e0c8ff';ctx.save();ctx.translate(x,y);ctx.rotate(t*2+i);ctx.fillRect(-2,-2,4,4);ctx.restore()}ctx.globalAlpha=1}},
};

// ── thay luồng đại chiêu
useBurst=function(){
  if(!G||G.over||G.paused||G.burst<100||G.ult)return false;
  const U=ULT[G.ch]||ULT.lamphong,lv=ultLv(G.ch);G.burst=0;
  G.ult={t:0,lv,U,dur:(ULT_DUR[U.k]||ULT_DUR.loi)[lv],st:{},fx:0};
  G.p.inv=Math.max(G.p.inv,G.ult.dur+0.6);for(const b of G.es)if(Math.hypot(b.x-G.p.x,b.y-G.p.y)<260)b.dead=true;
  G.fx.push({k:'ultw',t:0,dur:G.ult.dur+0.1});
  sfx('level');uBuzz([20,40,20]);return true};
updateUlt=function(dt){
  const u=G.ult;if(!u)return 1;u.t+=dt;const S=ULTS[u.U.k]||ULTS.loi;const sc=S.upd(u,dt,u.t);
  if(u.lv>=5&&uOnce(u,'field',u.dur-0.7)){const P=G.p,k=u.U.k,el=ULT_EL[k],zk={kim:'array',moc:'vine',thuy:'vine',loi:'array',hoa:'burn',ho:'burn'}[k];
    G.zones.push({k:zk,x:P.x,y:P.y,r:70,t:0,dur:5,dps:ultDmg(1)*0.4,dmg:ultDmg(1)*0.12,el,tick:0,seed:rand()*999,follow:zk==='array'?1:0,leech:k==='moc'?1:0,src:'burst'})}
  if(u.t>=u.dur){G.ult=null;return 1}
  return sc};
// người chơi
const _dpUlt=drawPlayer;
drawPlayer=function(){const u=G.ult;if(!u){_dpUlt();return}const S=ULTS[u.U.k];
  if(!S||S.old){_dpUlt();return}
  const base=()=>_dpU();
  // tụ lực chung: hào quang hút vào
  if(u.t<S.ch){const P=G.p,k=u.t/S.ch;glow(P.x,P.y-12,16+k*20,u.U.c[1],0.4+k*0.4)}
  if(S.player)S.player(u,base);else base()};
// thế giới (vẽ trên cùng) và mặt đất (vẽ dưới)
const _foUlt=drawFxOver;
drawFxOver=function(f){if(f.k==='ultw'){const u=G.ult;if(u){const S=ULTS[u.U.k];if(S&&S.world)S.world(u)}return}_foUlt(f)};
const _muUlt=mapUnder;
mapUnder=function(){_muUlt();const u=G.ult;if(u){const S=ULTS[u.U.k];if(S&&S.under)S.under(u)}};
// màn hình
ultScreen=function(u){
  const S=ULTS[u.U.k]||ULTS.loi,t=u.t,lv=u.lv,C=u.U.c,P=G.p,px=P.x-camX,py=P.y-8-camY,end=uEnd(u);
  if(t<S.ch+0.1){const k=Math.min(1,t/0.25)*(lv>=3?0.65:0.4)*Math.max(0,Math.min(1,(S.ch+0.1-t)/0.15));const g=ctx.createRadialGradient(px,py,20,px,py,VH*0.6);g.addColorStop(0,'rgba(10,5,25,0)');g.addColorStop(1,`rgba(10,5,25,${k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  if(t<S.ch&&rand()<0.8){const a=rand()*TAU,d=VH*0.5;vp(P.x+Math.cos(a)*d*0.5,P.y-12+Math.sin(a)*d*0.4,{vx:-Math.cos(a)*d*1.6,vy:-Math.sin(a)*d*1.3,life:0.3,s:2.2,c:C[(rand()*3)|0],drag:0})}
  if(S.screen)S.screen(u,px,py);
  if(lv>=3&&t>S.hit-0.05){const t0=S.hit-0.05,k=Math.min(1,(t-t0)/0.25)*end,sc=1+(1-Math.min(1,(t-t0)/0.25))*0.8;ctx.save();ctx.translate(VW/2,VH*0.2);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=k;
    ctx.font=`800 22px 'Baloo 2',sans-serif`;{const w=ctx.measureText(u.U.n).width;if(w>VW*0.88){const f=VW*0.88/w;ctx.scale(f,f)}}ctx.lineWidth=5;ctx.strokeStyle='#1a0c2a';ctx.strokeText(u.U.n,0,0);const g=ctx.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#ffffff');g.addColorStop(0.5,C[1]);g.addColorStop(1,C[2]);ctx.fillStyle=g;ctx.fillText(u.U.n,0,0);
    ctx.font=`700 9px 'Baloo 2',sans-serif`;ctx.fillStyle='#fff6d0';ctx.fillText(i18nf('ui.ult.cap','ĐẠI CHIÊU · CẤP {0}',lv),0,-20);ctx.restore();ctx.globalAlpha=1}
};
function mocTip(S,r,l){const px=-Math.sin(r.a),py=Math.cos(r.a),w=Math.sin(l*0.045+r.seed)*10*Math.min(1,l/30);return [S.ox+Math.cos(r.a)*l+px*w,S.oy+(Math.sin(r.a)*l+py*w)*0.6]}

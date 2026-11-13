'use strict';
// ───────────────────────── TRẤN ẤN LỘ · ĐÁNH (js/tranan/danh.js): nút ĐÁNH, Chiêu 2, đòn của từng tu sĩ
// Thêm tu sĩ mới: thêm một dòng vào ATK (đánh gần có m:1, rng, arc, kb; đánh xa có spr, sz, spd, pierce) và W2 trong loi.js.
if(TA){
  const {C,RR,W2}=TA;
  // ── đòn Đánh của từng tu sĩ
  const ATK={
    lamphong:{m:1,iv:[0.26,0.26,0.42],rng:[46,46,60],arc:[1,1,1.3],mul:[1,1,1.9],kb:[30,30,90],el:'kim',c:'#ffd45a',tn:'gold',s:'a_kiem',s3:'a_kiem3'},
    loichan:{m:1,iv:[0.3,0.3,0.46],rng:[46,46,60],arc:[1.1,1.1,1.5],mul:[1.55,1.55,3],kb:[60,60,170],el:'kim',c:'#ff9a3a',tn:'gold',s:'a_quyen',s3:'a_quyen3',punch:1},
    bachho:{m:1,iv:[0.17,0.17,0.17,0.32],rng:[42,42,42,54],arc:[1,1,1,1.3],mul:[0.75,0.75,0.75,1.6],kb:[15,15,15,70],el:'hoa',c:'#b98cff',tn:'pink',s:'a_trao',s3:'a_tu'},
    linhnhi:{iv:[0.3,0.3,0.46],mul:[1.15,1.15,2],el:'moc',spr:'fx_pill',sz:15,spd:250,pierce:1,c:'#8dff9a',s:'a_dan',heal:0.015},
    hanbang:{iv:[0.34,0.34,0.5],mul:[1.1,1.1,1.8],el:'thuy',spr:'fx_icespear',sz:34,spd:340,pierce:2,c:'#bfe8ff',s:'a_bang',slow:1.4},
    modung:{iv:[0.3,0.3,0.46],mul:[1,1,1.2],el:'hoa',spr:'fx_tali',sz:22,spd:280,pierce:0,c:'#ff9a4a',s:'a_bua',fan:1}};
  // ── nút Đánh
  // Bản Mệnh Đồ (js/tranan/banmenh*.js) chen vào đây qua: bm('atkSpd'|'atkDmg'|'atkLen'), sự kiện 'atk' / 'atkHit', và 'atkOverride' (nút chốt đổi hẳn cách Đánh).
  function atkCfg(){const S=bmRun().s,ex=bm('atkLen')|0,key=G.ch+ex;if(S.atkK&&S.atkKey===key)return S.atkK;const K0=ATK[G.ch]||ATK.lamphong,K=Object.assign({},K0),L=K0.iv.length;
    for(const k in K0)if(Array.isArray(K0[k])){K[k]=K0[k].slice();for(let j=0;j<ex;j++)K[k].splice(L-1,0,K0[k][0])}S.atkK=K;S.atkKey=key;return K}
  function aimA(rng){const P=G.p,tg=nearestE(P.x,P.y,rng);return tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.fy||0,P.fx||(P.fy?0:1))}
  function face(a,dur){const P=G.p;P.dir=CDX.dirOf(a);P.fx=Math.cos(a);P.fy=Math.sin(a);const id=CHARS[G.ch].spr,d=P.dir==='L'?'R':P.dir;if(SPR[`${id}_a_${d}0`])P.act={k:'a',d:P.dir,t0:G.t,dur}}
  function blast(x,y){const n=G.hd.b.hoa|0;if(!n)return;CDX.boom(x,y,70);const s2=G.src;G.src='danh';forNear(x,y,60,e=>{if(Math.hypot(e.x-x,e.y-y)<38+e.r)hurtE(e,CDX.B()*0.8*n,'hoa',{rx:1})});G.src=s2;sfx('no')}
  // một nhát chém gần: trả về số quái trúng
  function hdSwing(a,i,dmg,fin,crit){
    const K=atkCfg(),P=G.p,j=Math.min(i,K.rng.length-1),R=K.rng[j],arc=K.arc[j],ca=Math.cos(a),sa=Math.sin(a),s=G.src,c0=G.st.crit;G.src='danh';if(crit)G.st.crit=1;let n=0,fx0=null;
    forNear(P.x,P.y,R+24,e=>{const dd=Math.hypot(e.x-P.x,e.y-P.y);if(dd>R+e.r)return;let da=Math.atan2(e.y-P.y,e.x-P.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>arc&&dd>14)return;n++;if(!fx0)fx0=e;hurtE(e,dmg,K.el,{kb:K.kb[j]});if(n<=4)burstP(e.x,e.y-e.r,3,[K.c,'#ffffff'],{spd:80,life:0.22,s:1.6})});
    G.st.crit=c0;G.src=s;
    if(K.punch){   // đánh quyền: chùm sáng nổ ở đầu nắm đấm + vòng chấn, không dùng vệt kiếm
      const px=P.x+ca*R*0.72,py=P.y-9+sa*R*0.72;CDX.fx({x:px,y:py,dur:0.2,o(f){const k=f.t/f.dur,sz=R*(fin?1.5:1.05);glow(f.x,f.y,sz*0.55,K.c,0.5*(1-k));fxD('kf_hit'+Math.min(1,(k*2)|0),f.x,f.y,sz*(0.8+k*0.4),{tint:'gold',alpha:1-k*0.5,rot:a+k});
          ctx.save();ctx.translate(f.x,f.y);ctx.rotate(a);ctx.scale(0.45,1);ring(0,0,sz*(0.35+k*0.5),'#fff3c0',3*(1-k)+0.5,1-k);ctx.restore();ctx.globalAlpha=1}});
      if(fin)CDX.fx({x:P.x+ca*R*0.5,y:P.y+sa*R*0.5,dur:0.35,u(f){const k=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.58);ring(0,0,R*(0.5+k*0.7),'#ffe48a',4*(1-k)+1,1-k);ctx.restore();ctx.globalAlpha=1}})}
    else CDX.fx({x:P.x+ca*R*0.42,y:P.y-9+sa*R*0.42,a:a+Math.PI+(i%2?0.35:-0.35),dur:0.17,fl:i%2===1,o(f){const k=f.t/f.dur,fr='fx_sl'+Math.min(3,(k*4)|0),sz=R*(fin?1.45:1.15);glow(f.x,f.y,R*(fin?0.7:0.5),K.c,(fin?0.4:0.25)*(1-k));fxD(fr,f.x,f.y,sz*1.16,{rot:f.a,alpha:0.9*(1-k*0.5),flip:f.fl,tint:K.tn});fxD(fr,f.x,f.y,sz*0.9,{rot:f.a,alpha:1-k*0.5,flip:f.fl})}});
    if(fin){shake(0.22);if(n){cdHS(0.05);blast(fx0.x,fx0.y)}if(typeof buzz==='function')buzz(15)}
    bmEmit('atkHit',{n,i,fin,a,first:fx0});return n;
  }
  // sóng chém bay thẳng, xuyên mọi quái (dùng cho nút chốt và chiêu mới)
  function hdWave(a,o){const P=G.p,w={x:P.x+Math.cos(a)*12,y:P.y-8+Math.sin(a)*12,a,life:o.life||0.6,hit:new Set()},r=o.r||30,spd=o.spd||360;
    G.cdo.push({upd(dt){w.life-=dt;w.x+=Math.cos(a)*spd*dt;w.y+=Math.sin(a)*spd*dt;const s=G.src;G.src=o.src||'danh';
      forNear(w.x,w.y,r+24,e=>{if(w.hit.has(e)||Math.hypot(e.x-w.x,e.y-w.y)>r+e.r)return;w.hit.add(e);hurtE(e,o.dmg,o.el||'kim',{kb:o.kb||80,kx:w.x-Math.cos(a)*20,ky:w.y-Math.sin(a)*20});if(w.hit.size===1)cdHS(0.06)});G.src=s;
      if(Math.hypot(w.x-C,w.y-C)>RR+20&&G.hd)w.life=0;return w.life>0}});
    CDX.fx({dur:w.life+0.05,o(f){const al=Math.min(1,w.life*5);glow(w.x,w.y,r*1.3,o.c||'#ffe9a0',0.45*al);if(o.spr&&fxD(o.spr,w.x,w.y,r*2.1,{rot:a,alpha:al}))return;fxD('fx_sl1',w.x,w.y,r*2.7,{rot:a+Math.PI,alpha:al,add:1});fxD('fx_sl2',w.x,w.y,r*2.5,{rot:a+Math.PI,alpha:al})}})}
  function hdAttack(dt){
    const H=G.hd,A=H.at,P=G.p;if(A.cd>0)A.cd-=dt;
    const ov=bmOn('atkOverride');if(ov){if(!(P.dead||P.dash||G.bt||G.ult||H.st==='pick'))ov({dt,hold:TA.hold,H,A});return}
    if(!TA.hold||A.cd>0||P.dead||P.dash||G.bt||G.ult||H.st==='pick')return;
    const K=atkCfg(),L=K.iv.length;if(G.t-A.last>0.95)A.n=0;const i=A.n%L,fin=i===L-1;A.n++;A.last=G.t;
    const iv=K.iv[i]*Math.pow(0.88,H.b.loi|0)/(1+bm('atkSpd')+(bmRun().s.aspd||0));A.cd=iv;A.slow=iv*0.8;
    const a=aimA(K.m?78:185);face(a,Math.max(0.16,iv*0.95));
    const ctx={i,fin,a,dmg:CDX.B()*K.mul[i]*(1+0.22*(H.b.kim|0))*(1+bm('atkDmg')),crit:false,K};bmEmit('atk',ctx);const dmg=ctx.dmg;sfx(fin&&K.s3?K.s3:K.s);
    if(K.m){P.x+=Math.cos(a)*5;P.y+=Math.sin(a)*5;hdSwing(a,i,dmg,fin,ctx.crit)}
    else{const s=G.src;G.src='danh';const nS=(fin&&K.fan?3:1)+(fin?bm('atkFanFin')|0:0),shots=Array.from({length:nS},(_,q)=>(q-(nS-1)/2)*0.2);
      for(const da of shots){const an=a+da,p={x:P.x+Math.cos(an)*8,y:P.y-9+Math.sin(an)*8,a:an,life:0.62,pierce:K.pierce+(fin&&!K.fan?1:0)+(bm('atkPierce')|0),hit:new Set(),big:fin};
        G.cdo.push({upd(dt){p.life-=dt;p.x+=Math.cos(p.a)*K.spd*dt;p.y+=Math.sin(p.a)*K.spd*dt;if(Math.hypot(p.x-C,p.y-C)>RR)return false;let go=true;const s2=G.src,c0=G.st.crit;G.src='danh';if(ctx.crit)G.st.crit=1;
          forNear(p.x,p.y,34,e=>{if(!go||p.hit.has(e)||Math.hypot(e.x-p.x,e.y-(p.y+6))>(p.big?9:6)+e.r)return;p.hit.add(e);hurtE(e,dmg,K.el,{kb:p.big?50:15,kx:p.x-Math.cos(p.a)*10,ky:p.y-Math.sin(p.a)*10});if(K.slow)e.slowT=Math.max(e.slowT,K.slow);
            burstP(p.x,p.y,5,[K.c,'#ffffff'],{spd:60,life:0.25,s:1.6});bmEmit('atkHit',{n:1,i,fin:p.big,a:p.a,first:e});if(p.big){blast(e.x,e.y);if(K.heal){const h=Math.ceil(G.p.mhp*K.heal);G.p.hp=Math.min(G.p.mhp,G.p.hp+h)}}if(p.pierce--<=0)go=false});G.st.crit=c0;G.src=s2;
          if(!go)p.life=0;return p.life>0}});
        CDX.fx({dur:0.7,o(f){if(p.life<=0){f.t=f.dur;return}const cx=Math.cos(p.a),sy=Math.sin(p.a);for(let q=1;q<=3;q++)glow(p.x-cx*q*7,p.y-sy*q*7,(p.big?9:6)-q,K.c,0.4-q*0.1);glow(p.x,p.y,p.big?13:9,K.c,0.55);fxD(K.spr,p.x,p.y,K.sz*(p.big?1.35:1),{rot:p.a})}})}
      G.src=s}
  }
  window.HDX={swing:hdSwing,wave:hdWave,aim:aimA,face,cfg:atkCfg,C,RR};   // cho dữ liệu Bản Mệnh Đồ dùng
  function hdSkill2(){
    const H=G.hd;if(!G||!H||G.over||G.paused||G.p.dead||H.w2.t>0||H.st==='pick')return;
    const k=W2[G.ch]||'phikiem';if(!WEAP[k])return;const r=fireWeapon(k,{lv:Math.min(5,2+((H.tier/3)|0)),cd:0,orb:[],evo:H.tier>=8});
    if(r>0.25)H.w2.t=H.w2.cd;else{H.w2.t=0.4}
  }
  Object.assign(TA,{ATK,attack:hdAttack,skill2:hdSkill2});
}

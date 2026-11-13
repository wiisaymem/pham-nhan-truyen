'use strict';
// ───────────────────────── Cơ quan bí ẩn đợt 2 (tiếp): Đóng Băng Mặt Hồ, Chuông Nhạc Cổ, Đẩy Đá Lên Ô, Thu Thập Ngũ Linh
PZ_TYPES.push('hobang','nhac','dayda','ngulinh');
Object.assign(PZ_NAME,{hobang:i18n('pz.hobang','Đóng Băng Mặt Hồ'),nhac:i18n('pz.nhac','Chuông Nhạc Cổ'),dayda:i18n('pz.dayda','Đẩy Đá Lên Ô'),ngulinh:i18n('pz.ngulinh','Thu Thập Ngũ Linh')});
Object.assign(PZ_W,{hobang:6,nhac:7,dayda:8,ngulinh:5});
const PZ_NEW3=['hobang','nhac','dayda','ngulinh'];
const NOTE_F=[392,523,659];
function ptone(...a){try{if(AC&&SAVE.opt.sfx)tone(...a)}catch(e){}}
const _pmB3=pzMake;
pzMake=function(ty,x,y){if(!PZ_NEW3.includes(ty))return _pmB3(ty,x,y);
  const M={ty,x,y,seen:0,solved:0,done:0,parts:[],t:0,hold:0};G.pz.push(M);pzClear(x,y,ty==='ngulinh'?100:130);
  const P=(...a)=>{const o=pzPart(M,...a);M.parts.push(o);return o};
  if(ty==='hobang'){M.pond=pzAdd({k:'pond',x,y,r:72,w:rand()*100,pzM:M});M.ice=0;M.chest=P('islchest',x,y,'pz_chest',0)}
  else if(ty==='nhac'){M.song=[0,1,2,(rand()*3)|0].sort(()=>rand()-.5);M.prog=0;M.tab=P('tablet',x,y-40,'p_tablet',8);[-60,0,60].forEach((dx,i)=>P('bell',x+dx,y+30,null,6,{i,ring:0,hold:0}))}
  else if(ty==='dayda'){M.plates=[];M.stones=[];for(let i=0;i<2;i++){M.plates.push(P('plate2',x-50+i*100,y-50,'pz_pplate',0,{on:0}));M.stones.push(P('stone',x-45+i*90,y+45,'pz_boulder',0,{on:0}))}}
  else if(ty==='ngulinh'){M.altar=P('nlaltar',x,y,'p_altar',12);M.orbs=[];M.got=0;const els=['kim','moc','thuy','hoa','tho'];
    els.forEach((el,i)=>{let ox,oy,ok=false;for(let k=0;k<40&&!ok;k++){const a=i/5*TAU+rand()*0.8,d=220+rand()*180;ox=x+Math.cos(a)*d;oy=y+Math.sin(a)*d;ok=pzSpotOK(ox,oy,20)}if(!ok){ox=x+Math.cos(i)*150;oy=y+Math.sin(i)*150}M.orbs.push({el,x:ox,y:oy,got:0,guard:0})})}
  return M};
// chiêu Thủy đóng băng hồ, chiêu Kim làm chuông kêu
const _peB3=pzOnElem;
pzOnElem=function(el,x,y,src){_peB3(el,x,y,src);if(!G.pz)return;
  for(const M of G.pz){if(M.solved||M.done)continue;
    if(M.ty==='hobang'&&(el==='thuy'||src==='ult')&&Math.hypot(M.x-x,M.y-y)<M.pond.r+70){if(M.ice<=0){sfx('freeze');announce(i18n('pz.hobangF','Mặt hồ đóng băng! Mau qua đảo'),'good')}M.ice=15;M.pond.deco=1}}};
function pzBell(M,b){if(b.ring>0)return;b.ring=0.6;ptone(NOTE_F[b.i],NOTE_F[b.i]*1.01,0.6,'triangle',0.07);G.fx.push({k:'spark',x:b.x,y:b.y-24,t:0,dur:0.3,c:'#ffd45a'});
  if(M.song[M.prog]===b.i){M.prog++;if(M.prog>=4)pzSolve(M,M.x,M.y)}else{M.prog=0;M.fail=1;ptone(180,150,0.4,'sawtooth',0.05);announce(i18n('pz.nhacS','Lạc điệu rồi, gõ lại từ đầu'),'warn')}}
function pz3Tick(dt){if(!G.pz||G.bc)return;const P=G.p;
  for(const M of G.pz){if(M.done||!PZ_NEW3.includes(M.ty))continue;
    if(M.ty==='hobang'){if(M.ice>0){M.ice-=dt;if(M.ice<=0){M.pond.deco=0;announce(i18n('pz.hobangT','Băng tan rồi'),'warn')}}
      if(!M.solved&&pzD(M.chest)<16){M.chest.spr='pz_chest_open';pzSolve(M,M.x,M.y)}continue}
    if(M.solved)continue;
    if(M.ty==='nhac'){for(const b of M.parts)if(b.part==='bell'){b.ring=Math.max(0,b.ring-dt);if(pzD(b)<20){b.hold+=dt;if(b.hold>0.35){b.hold=-0.8;pzBell(M,b)}}else b.hold=Math.max(0,b.hold)}}
    else if(M.ty==='dayda'){for(const s of M.stones){if(s.on)continue;const dx=s.x-P.x,dy=s.y-P.y,d=Math.hypot(dx,dy),m=P.r+11;
        if(d<m&&d>0.01){const k=(m-d)/d;const nx=s.x+dx*k,ny=s.y+dy*k;if(!inPond(nx,ny,10)&&Math.hypot(nx-M.x,ny-M.y)<170){pzRemove(s);s.x=nx;s.y=ny;pzAdd(s);sfx('stone')}else{P.x-=dx*k;P.y-=dy*k}}
        for(const pl of M.plates)if(!pl.on&&Math.hypot(s.x-pl.x,s.y-pl.y)<10){pl.on=1;s.on=1;pzRemove(s);s.x=pl.x;s.y=pl.y+2;pzAdd(s);pl.spr='pz_plate_on';sfx('level');burstP(pl.x,pl.y-6,20,['#ffd45a','#ffffff'],{spd:70,life:0.5})}}
      if(M.plates.every(p=>p.on))pzSolve(M,M.x,M.y)}
    else if(M.ty==='ngulinh'){for(const o of M.orbs){if(o.got)continue;const d=Math.hypot(P.x-o.x,P.y-o.y);
        if(!o.guard&&d<220){o.guard=1;for(let i=0;i<6;i++){const a=i/6*TAU;spawnEnemy(rollType(),o.x+Math.cos(a)*60,o.y+Math.sin(a)*45,{elite:i===0?1:0})}}
        if(d<16){o.got=1;M.got++;sfx('gem');burstP(o.x,o.y-10,20,[ELC[o.el],'#ffffff'],{spd:80,life:0.5});announce(i18nf('pz.ngulinhG','Linh châu {0}/5 · mang về tế đàn',M.got),'good')}}
      if(M.got>=5&&pzD(M.altar)<40)pzSolve(M,M.x,M.y+30)}}}
const _upB3=update;update=function(dt){_upB3(dt);if(G&&!G.over&&!G.paused&&G.pz)pz3Tick(Math.min(dt,0.05))};
// vẽ
const _doB4=drawObs;
drawObs=function(o){if(o.k!=='pz'){_doB4(o);return}const M=o.M,t=G.t;
  if(o.part==='islchest'){if(!M.solved)glow(o.x,o.y-8,16,'#ffd45a',0.45+Math.sin(t*3)*0.2);ell(o.x,o.y+2,16,7,'#8a7a5a',0.9);drawS(o.spr,o.x,o.y+1,{sc:0.8});return}
  if(o.part==='bell'){const sw=o.ring>0?Math.sin(o.ring*30)*0.25*o.ring:0,sz=[26,21,17][o.i];ell(o.x,o.y+2,8,3,'#23402a',0.3);fxD('fx_bell',o.x,o.y-sz*0.55,sz,{rot:sw});if(o.ring>0)glow(o.x,o.y-sz*0.5,16,'#ffd45a',o.ring);return}
  if(o.part==='tablet'&&M.ty==='nhac'){drawS('p_tablet',o.x,o.y+1,{sc:0.6});if(pzD(o)<150)M.song.forEach((n,j)=>fxD('fx_bell',o.x-27+j*18,o.y-46-n*3,[11,9,7][n],{alpha:j<M.prog?0.35:1}));return}
  if(o.part==='plate2'){drawS(o.spr,o.x,o.y+8,{sc:0.9});return}
  if(o.part==='stone'){ell(o.x,o.y+2,9,3,'#23402a',0.3);drawS('pz_boulder',o.x,o.y+2,{sc:0.5});if(o.on)glow(o.x,o.y-6,12,'#ffd45a',0.4);return}
  if(o.part==='nlaltar'){drawS('p_altar',o.x,o.y+1,{sc:0.8});const els=['kim','moc','thuy','hoa','tho'];els.forEach((el,j)=>{const a=-Math.PI/2+j/5*TAU,x=o.x+Math.cos(a)*16,y=o.y-30+Math.sin(a)*8;const got=M.orbs.find(q=>q.el===el).got;fxD('ic_sig_'+el,x,y,9,{alpha:got?1:0.25});if(got)glow(x,y,7,ELC[el],0.5)});return}
  _doB4(o)};
const _muB3=mapUnder;
mapUnder=function(){_muB3();if(!G||!G.pz||G.bc)return;
  for(const M of G.pz){if(M.done)continue;
    if(M.ty==='hobang'&&M.ice>0&&pzD(M)<400){const a=Math.min(1,M.ice/2);ctx.save();ctx.translate(M.x,M.y);ctx.scale(1,1);ctx.globalAlpha=0.85*a;ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.arc(0,0,M.pond.r-2,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;fxD('fx_c_bang',M.x,M.y,M.pond.r*1.9,{rot:t3(),alpha:0.5*a,add:1})}
    if(M.ty==='ngulinh'&&M.seen)for(const o of M.orbs){if(o.got||Math.hypot(G.p.x-o.x,G.p.y-o.y)>420)continue;const y=o.y-10+Math.sin(G.t*3)*2;glow(o.x,y,14,ELC[o.el],0.7);fxD('ic_sig_'+o.el,o.x,y,12,{})}}};
const t3=()=>G.t*0.3;
const _msB3=mapScreen;
mapScreen=function(dt){_msB3(dt);if(!G||!G.pz||G.bc)return;
  for(const M of G.pz){if(M.done||M.solved)continue;
    if(M.ty==='hobang'&&pzD(M)<170)pzPanel(M.ice>0?i18nf('pz.hobangC','Băng còn {0} giây',Math.ceil(M.ice)):i18n('pz.hobangH','Rương nằm giữa hồ. Nước lạnh đến mấy cũng có lúc đóng băng…'));
    if(M.ty==='nhac'&&pzD(M)<150)pzPanel(i18n('pz.nhacH','Bia đá ghi giai điệu. Đứng sát chuông để gõ, đúng thứ tự trên bia'));
    if(M.ty==='dayda'&&pzD(M)<150)pzPanel(i18n('pz.daydaH','Đẩy hai tảng đá lên hai ô đá'));
    if(M.ty==='ngulinh'&&pzD(M)<150)pzPanel(M.got>=5?i18n('pz.ngulinhD','Đặt năm linh châu lên tế đàn'):i18nf('pz.ngulinhH','Tế đàn thiếu {0} linh châu. Tìm quanh đây, có yêu quái canh giữ',5-M.got))}};
// bản đồ nhỏ: linh châu
const _dmB3=drawMini;
drawMini=function(){_dmB3();if(!G||!G.pz||G.bc)return;const c=$('mini'),x=c.getContext('2d'),S=c.width;
  for(const M of G.pz)if(M.ty==='ngulinh'&&M.seen&&!M.solved)for(const o of M.orbs)if(!o.got){x.fillStyle=ELC[o.el];x.fillRect(o.x/WORLD*S-1.5,o.y/WORLD*S-1.5,3,3)}};
// làm mới lớp nền khi đổi thế giới (Bí cảnh dùng nền riêng)
const _beB3=bcEnter;bcEnter=function(M){_beB3(M);if(typeof CHUNKS!=='undefined')CHUNKS.clear()};
const _bxB3=bcExit;bcExit=function(){_bxB3();if(typeof CHUNKS!=='undefined')CHUNKS.clear()};

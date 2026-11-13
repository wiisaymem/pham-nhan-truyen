'use strict';
// ───────────────────────── Cơ quan bí ẩn đợt 3: Gương Chiếu Quang, Mê Cung Sương Mù, Tượng Đá Ngược, Phối Hợp Tương Sinh, Linh Thú Chỉ Đường
// Hình: tools/art_src/pz3.png (Google Flow)
PZ_TYPES.push('guong','suongmu','tuongda','tuongsinh','linhthu');
Object.assign(PZ_NAME,{guong:i18n('pz.guong','Gương Chiếu Quang'),suongmu:i18n('pz.suongmu','Mê Cung Sương Mù'),tuongda:i18n('pz.tuongda','Tượng Đá Ngược'),tuongsinh:i18n('pz.tuongsinh','Phối Hợp Tương Sinh'),linhthu:i18n('pz.linhthu','Linh Thú Chỉ Đường')});
Object.assign(PZ_W,{guong:6,suongmu:5,tuongda:6,tuongsinh:5,linhthu:5});
const PZ_NEW4=['guong','suongmu','tuongda','tuongsinh','linhthu'];
const GCELL=46,DIRV={E:[1,0],W:[-1,0],N:[0,-1],S:[0,1]};
const MIRR={'/':{E:'N',N:'E',W:'S',S:'W'},'\\':{E:'S',S:'E',W:'N',N:'W'}};
const DIRN={E:'Đông',W:'Tây',N:'Bắc',S:'Nam'};for(const k in DIRN)DIRN[k]=i18n('huong.'+k,DIRN[k]);
const KHAC4={kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'};           // A khắc B
const BIKHAC4=Object.fromEntries(Object.entries(KHAC4).map(([a,b])=>[b,a]));   // hành khắc được B
const LT_NEED={huyenquy:'pz_rua',thanhlong:'pz_rong',linhho:'pz_fox',kimbuc:'p_shrine'};
const LT_HINT={huyenquy:'"Rùa thần đội bia, đợi người mang theo hậu duệ của mình."',thanhlong:'"Đầu rồng khát nước, chờ rồng con về uống."',linhho:'"Hồ linh trắng như tuyết, chỉ đồng loại mới gọi được."',kimbuc:'"Miếu cổ tối tăm, loài bay đêm mới thấy lối."'};
for(const k in LT_HINT)LT_HINT[k]=i18n('pz.lt.'+k,LT_HINT[k]);

const _pmB4=pzMake;
pzMake=function(ty,x,y){if(!PZ_NEW4.includes(ty))return _pmB4(ty,x,y);
  const M={ty,x,y,seen:0,solved:0,done:0,parts:[],t:0,hold:0};G.pz.push(M);pzClear(x,y,ty==='suongmu'?60:150);
  const P=(...a)=>{const o=pzPart(M,...a);M.parts.push(o);return o};
  if(ty==='guong'){const ox=x-2.5*GCELL,oy=y-GCELL;M.cell=(c,r)=>[ox+c*GCELL,oy+r*GCELL];
    const a=1+((rand()*3)|0),r2=rand()<0.5?0:2,w=r2===0?'/':'\\';M.emit=P('emit',...M.cell(-1,1),'pz_emit',8);M.recv=P('recv',...M.cell(5,r2),'pz_recv',8);
    M.mirrors=[P('mir',...M.cell(a,1),null,7,{c:a,r:1,o:'/',want:w}),P('mir',...M.cell(a,r2),null,7,{c:a,r:r2,o:'/',want:w})];
    let dc,dr;do{dc=(rand()*5)|0;dr=(rand()*3)|0}while(M.mirrors.some(m=>m.c===dc&&m.r===dr)||(dr===1&&dc<=a)||(dr===r2&&dc>=a));M.mirrors.push(P('mir',...M.cell(dc,dr),null,7,{c:dc,r:dr,o:'/',want:null}));
    for(const m of M.mirrors){m.o=m.want?(m.want==='/'?'\\':'/'):(rand()<0.5?'/':'\\');m.hold=0}pzBeam(M)}
  else if(ty==='suongmu'){const ds=['E','W','N','S'];let path;for(let tr=0;tr<30;tr++){path=[];let px=0,py=0,prev=null;for(let i=0;i<4;i++){let d;do{d=ds[(rand()*4)|0]}while(prev&&DIRV[d][0]===-DIRV[prev][0]&&DIRV[d][1]===-DIRV[prev][1]);prev=d;px+=DIRV[d][0]*130;py+=DIRV[d][1]*110;path.push({d,x:x+px,y:y+py})}
      if(path.every(p=>pzSpotOK(p.x,p.y,30)))break}
    M.path=path;M.go=0;M.prog=0;M.tab=P('tablet',x,y+40,'p_tablet',8);M.marks=path.map((p,i)=>{pzClear(p.x,p.y,40);return P('fogmark',p.x,p.y,'pz_arrow',0,{i})});M.R=Math.max(...path.map(p=>Math.hypot(p.x-x,p.y-y)))+70}
  else if(ty==='tuongda'){M.st=null}
  else if(ty==='tuongsinh'){M.door=P('sdoor',x,y-10,'pz_seal',14);M.tab=P('tablet',x+50,y+20,'p_tablet',8);M.need=null}
  else if(ty==='linhthu'){const ks=Object.keys(LT_NEED);M.pet=ks[(rand()*ks.length)|0];M.statue=P('ltstatue',x,y,LT_NEED[M.pet],12);M.tab=P('tablet',x+46,y+24,'p_tablet',8)}
  return M};

// ── Gương: lần theo tia sáng
function pzBeam(M){const pts=[[M.emit.x+14,M.emit.y-24]];let c=-1,r=1,d='E',hit=false;
  for(let s=0;s<20;s++){c+=DIRV[d][0];r+=DIRV[d][1];const [wx,wy]=M.cell(c,r);
    if(M.recv&&Math.abs(wx-M.recv.x)<2&&Math.abs(wy-M.recv.y)<2){pts.push([wx,wy-24]);hit=true;break}
    if(c<-1||c>5||r<0||r>2){pts.push([wx-DIRV[d][0]*GCELL*0.5,wy-24-DIRV[d][1]*GCELL*0.5]);break}
    const m=M.mirrors.find(q=>q.c===c&&q.r===r);if(m){pts.push([wx,wy-22]);d=MIRR[m.o][d]}}
  M.beam=pts;M.lit=hit;return hit}
function pzMirTick(M,dt){for(const m of M.mirrors){if(pzD(m)<20){m.hold+=dt;if(m.hold>0.6){m.hold=-99;m.o=m.o==='/'?'\\':'/';sfx('pick');if(pzBeam(M)){M.recv.spr='pz_recv_on';pzSolve(M,M.recv.x,M.recv.y+28)}}}else m.hold=0}}

// ── Tượng Đá Ngược: một "yêu quái" đứng yên, đổi hành mỗi 10 giây
function pzStatue(M){spawnEnemy('quy',M.x,M.y,{});const e=G.e[G.e.length-1];if(!e)return;e.statue=M;e.spd=0;e.el='hoa';e.hp=e.mhp=(500+G.t*0.8)*(1+G.realm*0.5)*((G.ai&&G.ai.hp)||1);e.r=12;e.elT=10;M.st=e}
const ST_ELS=['hoa','thuy','moc','kim'];
const _heB4=hurtE;
hurtE=function(e,dmg,el,o){if(e&&e.statue){if(el!==BIKHAC4[e.el]&&G.src!=='burst'){if(G.nums.length<80&&rand()<0.25)G.nums.push({x:e.x,y:e.y-30,v:i18n('pz.mien','miễn'),t:0,c:'#c8c8d8'});return}if(G.src==='burst')dmg*=0.3}return _heB4(e,dmg,el,o)};
const _keB4=killE;killE=function(e){const M=e&&!e.dead&&e.statue;_keB4(e);if(M){M.st=null;pzSolve(M,M.x,M.y+20)}};
const _deB4=drawEnemy;drawEnemy=function(e){if(!e.statue){_deB4(e);return}const k='pz_st_'+e.el;ell(e.x,e.y,12,4,'#23402a',0.3);glow(e.x,e.y-20,22,ELC[e.el],0.45);if(!drawS(k,e.x,e.y+1,{sc:1,white:e.hitT>0}))_deB4(e);
  const w=26,p=Math.max(0,e.hp/e.mhp);ctx.fillStyle='#2a1a2a';ctx.fillRect(e.x-w/2,e.y-48,w,3);ctx.fillStyle=ELC[e.el];ctx.fillRect(e.x-w/2,e.y-48,w*p,3);fxD('ic_sig_'+BIKHAC4[e.el],e.x,e.y-56,9,{alpha:0.9})};

// ── Phối Hợp Tương Sinh: cửa mở khi phản ứng đúng nổ trước cửa
const _nrB4=nhReact;
nhReact=function(e,a){_nrB4(e,a);if(!G.pz)return;const R=NH[a];for(const M of G.pz)if(M.ty==='tuongsinh'&&!M.solved&&M.need===a&&Math.hypot(e.x-M.door.x,e.y-M.door.y)<110){M.door.spr='pz_seal';pzSolve(M,M.door.x,M.door.y+24)}};

function pz4Tick(dt){if(!G.pz||G.bc)return;const P=G.p;
  for(const M of G.pz){if(M.done||M.solved||!PZ_NEW4.includes(M.ty))continue;const d=Math.hypot(P.x-M.x,P.y-M.y);
    if(M.ty==='guong'&&d<260)pzMirTick(M,dt);
    else if(M.ty==='suongmu'){M.inFog=d<M.R;if(!M.inFog)continue;if(!M.go){if(pzD(M.tab)<40){M.go=1;announce(i18n('pz.smBat','Bước vào sương mù… nhớ lời trên bia'),'good')}continue}const tg=M.path[M.prog],from=M.prog?M.path[M.prog-1]:{x:M.x,y:M.y};
      // khoảng cách tới đoạn đường đúng
      const vx=tg.x-from.x,vy=tg.y-from.y,L2=vx*vx+vy*vy,u=Math.max(0,Math.min(1,((P.x-from.x)*vx+(P.y-from.y)*vy)/L2)),off=Math.hypot(P.x-(from.x+vx*u),P.y-(from.y+vy*u));
      if(Math.hypot(P.x-tg.x,P.y-tg.y)<26){M.prog++;sfx('gem');burstP(tg.x,tg.y-6,16,['#ffffff','#bff4ff'],{spd:60,life:0.5});if(M.prog>=4)pzSolve(M,tg.x,tg.y)}
      else if(off>60&&Math.hypot(P.x-M.x,P.y-M.y)>50){M.prog=0;M.go=0;P.x=M.x;P.y=M.y+60;P.inv=Math.max(P.inv,1);flash('#ffffff',0.5);announce(i18n('pz.lac','Lạc trong sương mù… trở về lối vào'),'warn')}}
    else if(M.ty==='tuongda'){if(!M.st&&d<200)pzStatue(M);const e=M.st;if(e&&!e.dead){e.x=M.x;e.y=M.y;e.elT-=dt;if(e.elT<=0){e.elT=10;e.el=ST_ELS[(ST_ELS.indexOf(e.el)+1)%4];sfx('bell')}}}
    else if(M.ty==='tuongsinh'){if(!M.need&&M.seen){const els=new Set(Object.keys(G.w).map(k=>WEAP[k].el));const ok=NH_ORDER.filter(a=>els.has(NH[a].a)&&els.has(NH[a].b));M.need=(ok.length?ok:NH_ORDER)[(rand()*(ok.length||NH_ORDER.length))|0]}}
    else if(M.ty==='linhthu'){if(G.pet&&G.pet.k===M.pet&&d<90){const Q=G.pet;Q.x+=(M.statue.x-Q.x)*Math.min(1,dt*3);Q.y+=(M.statue.y+14-Q.y)*Math.min(1,dt*3);M.hold+=dt;if(M.hold>1.5){burstP(M.statue.x,M.statue.y-20,30,[PETS[M.pet].gc,'#ffffff'],{spd:90,life:0.6});pzSolve(M,M.statue.x,M.statue.y+30)}}else M.hold=0}}}
const _upB4=update;update=function(dt){_upB4(dt);if(G&&!G.over&&!G.paused&&G.pz)pz4Tick(Math.min(dt,0.05))};

// ── vẽ
const _doB5=drawObs;
drawObs=function(o){if(o.k!=='pz'){_doB5(o);return}const M=o.M,t=G.t;
  if(o.part==='emit'){drawS('pz_emit',o.x,o.y+1,{sc:0.7});return}
  if(o.part==='recv'){drawS(o.spr,o.x,o.y+1,{sc:0.7});if(M.lit)glow(o.x,o.y-26,20,'#ffd45a',0.7);return}
  if(o.part==='mir'){drawS(o.o==='/'?'pz_mirR':'pz_mirL',o.x,o.y+1,{sc:0.7});if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,14,'#ffffff',2,0.3+o.hold);ctx.restore()}return}
  if(o.part==='fogmark'){if(M.prog>o.i){drawS('pz_arrow',o.x,o.y+6,{sc:0.6});glow(o.x,o.y,12,'#bff4ff',0.5)}else if(pzD(o)<44)drawS('pz_arrow',o.x,o.y+6,{sc:0.6,alpha:0.6});return}
  if(o.part==='sdoor'){drawS('pz_seal',o.x,o.y+1,{sc:0.8});if(M.need){fxD('ic_sig_'+NH[M.need].a,o.x-9,o.y-42,10,{});fxD('ic_sig_'+NH[M.need].b,o.x+9,o.y-42,10,{})}return}
  if(o.part==='ltstatue'){drawS(o.spr,o.x,o.y+1,{sc:o.spr==='pz_fox'?1:0.8});if(M.hold>0)glow(o.x,o.y-16,20,PETS[M.pet].gc,0.3+M.hold*0.3);return}
  if(o.part==='tablet'){drawS('p_tablet',o.x,o.y+1,{sc:0.6});return}
  _doB5(o)};
// tia sáng gương (lớp trên)
const _foB4=drawFxOver;
drawFxOver=function(f){if(f.k==='pzbeams'){for(const M of G.pz||[]){if(M.ty!=='guong'||M.done||!M.beam||pzD(M)>420)continue;const B=M.beam;ctx.globalCompositeOperation='lighter';
      for(const [w,c,a] of [[7,'#7fffd0',0.25],[3,'#d8fff0',0.7],[1,'#ffffff',1]]){ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();B.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';const e=B[B.length-1];glow(e[0],e[1],10,'#bfffe8',0.8);if(rand()<0.5){const i=(rand()*(B.length-1))|0,k=rand();vp(B[i][0]+(B[i+1][0]-B[i][0])*k,B[i][1]+(B[i+1][1]-B[i][1])*k,{life:0.4,s:1.5,c:'#e8fff8',drag:2})}}f.t=0;return}
  _foB4(f)};
const _nrB5=newRun;newRun=function(...a){const r=_nrB5(...a);G.fx.push({k:'pzbeams',t:0,dur:1e9});return r};
// sương mù và bảng gợi ý
const _msB4=mapScreen;
mapScreen=function(dt){_msB4(dt);if(!G||!G.pz||G.bc)return;
  for(const M of G.pz){if(M.done||M.solved)continue;
    if(M.ty==='suongmu'){const d=pzD(M);if(d<M.R+60){const k=Math.min(1,(M.R+60-d)/80),px=G.p.x-camX,py=G.p.y-10-camY,g=ctx.createRadialGradient(px,py,40,px,py,120);g.addColorStop(0,'rgba(236,244,248,0)');g.addColorStop(1,`rgba(236,244,248,${0.96*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
        for(let i=0;i<10;i++){const x=((i*97+G.t*(8+i%3*4))%(VW+120))-60,y=((i*61.3)%VH);fxD(i%2?'pz_mist':'pz_fog',x,y,70+(i%3)*30,{alpha:0.5*k,rot:Math.sin(G.t*0.3+i)*0.3})}}
      if(pzD(M.tab)<120)pzPanel(i18n('pz.smTho','Bia khắc: ')+M.path.map(p=>DIRN[p.d]).join(' → ')+'. '+i18n('pz.smGoi','Đứng trước bia rồi đi theo, mỗi chặng chừng ba mươi bước, lệch đường là lạc.'))}
    if(M.ty==='guong'&&pzD(M)<200)pzPanel(i18n('pz.guongG','Dẫn tia sáng tới quả cầu. Đứng cạnh gương để xoay'));
    if(M.ty==='tuongda'&&M.st&&pzD(M)<220)pzPanel(i18nf('pz.tdG','Tượng đá đang mang hành {0}, chỉ hành {1} mới làm nó bị thương',EL[M.st.el].n,EL[BIKHAC4[M.st.el]].n));
    if(M.ty==='tuongsinh'&&M.need&&pzD(M)<160)pzPanel(i18nf('pz.tsG','Bia ghi: "{0} mở cửa". Kích phản ứng {0} ({1} rồi {2}) ngay trước cửa',NH[M.need].n,EL[NH[M.need].a].n,EL[NH[M.need].b].n));
    if(M.ty==='linhthu'&&pzD(M)<140)pzPanel(i18n('pz.ltBia','Bia đá: ')+LT_HINT[M.pet]+(G.pet&&G.pet.k===M.pet?' · '+i18n('pz.ltOk','Linh thú của bạn đang dò đường…'):''))}};

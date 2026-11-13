'use strict';
// ───────────────────────── Cơ quan bí ẩn đợt 2: Hộ Trận Trấn Thủ, Giờ Tý Mở Cửa, Ẩn Khí; Bí cảnh Linh Tuyền, Đấu Trường; Ẩn Nhiệm
PZ_TYPES.push('trantran','gioty','ankhi');
Object.assign(PZ_NAME,{trantran:i18n('pz.trantran','Hộ Trận Trấn Thủ'),gioty:i18n('pz.gioty','Giờ Tý Mở Cửa'),ankhi:i18n('pz.ankhi','Ẩn Khí')});
Object.assign(BC_NAME,{tuyen:i18n('bc.tuyen','Linh Tuyền'),dau:i18n('bc.dau','Đấu Trường')});
const PZ_OLD=['nguhanh','den','caudo','cot','ho','chuong'];
const _pmB2=pzMake;
pzMake=function(ty,x,y){if(PZ_OLD.includes(ty))return _pmB2(ty,x,y);
  const M={ty,x,y,seen:0,solved:0,done:0,parts:[],t:0,bc:rand()<0.55?'kho':'hove',hold:0};G.pz.push(M);pzClear(x,y,90);
  const P=(...a)=>{const o=pzPart(M,...a);M.parts.push(o);return o};
  if(ty==='trantran'){M.ring=P('tring',x,y,null,0);M.spT=0}
  else if(ty==='gioty'){M.tab=P('tablet',x,y-20,'p_tablet',8)}
  else if(ty==='ankhi'){M.spark=P('spark',x,y,null,0)}
  return M};
const ankhiSee=()=>!!(G.w.holo||(G.pet&&G.pet.k==='kimbuc')||(G.magT>0));
function pz2Tick(dt){if(!G.pz||G.bc)return;const P=G.p;G.magT=Math.max(0,(G.magT||0)-dt);
  for(const M of G.pz){if(M.done||M.solved||!PZ_TYPES.includes(M.ty)||PZ_OLD.includes(M.ty))continue;const d=Math.hypot(P.x-M.x,P.y-M.y);
    if(M.ty==='trantran'){if(d<40){M.hold+=dt;M.spT-=dt;if(M.spT<=0){M.spT=2;for(let i=0;i<4;i++){const a=rand()*TAU;spawnEnemy(rollType(),M.x+Math.cos(a)*170,M.y+Math.sin(a)*130,{})}}
        if(M.hold>=20)pzSolve(M,M.x,M.y)}else if(M.hold>0){M.hold=0}}
    else if(M.ty==='gioty'){if(G.t>=420&&G.t<480)pzSolve(M,M.tab.x,M.tab.y+30)}
    else if(M.ty==='ankhi'){if(ankhiSee()&&d<14){M.hold+=dt;if(rand()<0.5)vp(M.x+(rand()-.5)*8,M.y,{vx:(rand()-.5)*40,vy:-30-rand()*30,g:160,life:0.5,s:2,c:'#c8a870',k:3,vr:8,add:0});if(M.hold>=3)pzSolve(M,M.x,M.y)}else M.hold=0}}
  // cổng Giờ Tý đóng sau phút 8
  for(const M of G.pz)if(M.ty==='gioty'&&M.solved&&!M.done&&G.t>=480&&M.portal){pzRemove(M.portal);M.parts=M.parts.filter(o=>o!==M.portal);M.portal=null;M.done=1;announce(i18n('pz.giotydong','Cổng Giờ Tý đã khép'),'warn')}}
const _upB2=update;update=function(dt){_upB2(dt);if(G&&!G.over&&!G.paused&&G.pz)pz2Tick(Math.min(dt,0.05))};
// nhặt Tụ Linh Phù thì thấy Ẩn Khí trong 20 giây
const _anB2=announce;announce=function(t,k){if(G&&typeof t==='string'&&t===i18n('tb.tulinh','Tụ Linh Phù: hút toàn bộ linh khí'))G.magT=20;return _anB2(t,k)};
// vẽ
const _doB2=drawObs;
drawObs=function(o){if(o.k!=='pz'){_doB2(o);return}const M=o.M,t=G.t;
  if(o.part==='tring'){const k=Math.min(1,M.hold/20);fxD('fx_c_kiem',o.x,o.y,84,{sq:0.55,rot:t*(0.5+k*3),alpha:0.55+k*0.4,add:1});
    if(M.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.55);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.globalAlpha=0.9;ctx.beginPath();ctx.arc(0,0,46,-Math.PI/2,-Math.PI/2+TAU*k);ctx.stroke();ctx.restore();ctx.globalAlpha=1}return}
  if(o.part==='spark'){if(!ankhiSee())return;const a=0.35+Math.sin(t*4)*0.25;glow(o.x,o.y-4,10,'#fff6c0',a);if(rand()<0.15)vp(o.x+(rand()-.5)*10,o.y-4,{vy:-10,life:0.6,s:1.4,c:'#ffffff'});
    if(M.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,14,'#ffd45a',2,0.3+M.hold/3);ctx.restore()}return}
  if(o.part==='tablet'&&M.ty==='gioty'){drawS('p_tablet',o.x,o.y+1,{sc:0.6});fxD('ic_sig_thuy',o.x,o.y-44+Math.sin(t*2)*2,10,{alpha:0.8});return}
  _doB2(o)};
const _msB2=mapScreen;
mapScreen=function(dt){_msB2(dt);if(!G||!G.pz||G.bc)return;
  for(const M of G.pz){if(M.done)continue;
    if(M.ty==='trantran'&&!M.solved){if(M.hold>0)pzLabel(i18nf('pz.trantranT','Trấn thủ trận pháp {0}/20s',Math.floor(M.hold)),VW/2,VH*0.13,9);else if(pzD(M)<130)pzPanel(i18n('pz.trantranG','Đứng trong trận pháp 20 giây, rời trận thì đếm lại'))}
    if(M.ty==='gioty'&&!M.solved&&pzD(M.tab)<130)pzPanel(i18n('pz.giotyG','"Giờ Tý trăng lên đỉnh, cửa trời mở rồi khép." (phút 7 đến phút 8)'))
    if(M.ty==='ankhi'&&!M.solved&&ankhiSee()&&pzD(M)<60)pzPanel(i18n('pz.ankhiG','Có linh khí ẩn dưới đất. Đứng lên 3 giây để đào'))}};

// ── Bí cảnh Linh Tuyền, Đấu Trường
function bcPick2(ty){if(ty!=='kho')return ty;const r=rand();return r<0.22?'tuyen':r<0.42?'dau':'kho'}
function bc2Setup(){const B=G.bc,C=WORLD/2;
  if(B.ty==='tuyen'){B.spring=pzAdd({k:'pz',part:'spring',x:C,y:C-40,r:0,deco:1});announce(i18n('bc.tuyenG','Bước vào suối linh để hồi phục'),'good')}
  else{B.wave=0;B.waveT=1.5;announce(i18n('bc.dauG','Đấu Trường: trụ qua ba đợt yêu quái!'),'warn')}}
function bc2Tick(dt){const B=G.bc,P=G.p,C=WORLD/2;if(B.done)return;
  if(B.ty==='tuyen'){if(pzD(B.spring)<34){B.done=1;P.hp=P.mhp;G.pendLv++;sfx('heal');flash('#9fe8ff',0.4);burstP(P.x,P.y-10,40,['#9fe8ff','#ffffff','#7bff9a'],{spd:100,up:40,life:0.8});announce(i18n('bc.tuyenX','Linh Tuyền: hồi đầy máu, ngộ thêm một cấp'),'realm')}return}
  B.waveT-=dt;if(B.waveT<=0&&B.wave<3&&G.e.filter(e=>!e.dead).length<6){B.wave++;B.waveT=4;const n=10+B.wave*6;for(let i=0;i<n;i++){const a=i/n*TAU;spawnEnemy(rollType(),C+Math.cos(a)*220,C+Math.sin(a)*170,{elite:i===0&&B.wave===3?1:0})}announce(i18nf('bc.dauW','Đợt {0}/3',B.wave),'warn')}
  if(B.wave>=3&&B.waveT<=0&&!G.e.some(e=>!e.dead)){B.done=1;const A=G.ai||{lt:1,rar:0},v=Math.round(80*(A.lt||1));G.lt+=v;const it=dropGear(0.3+(A.rar||0));G.bcGear.push(it);sfx('chest');flash('#ffd45a',0.4);
    announce(i18nf('bc.dauX','Thắng Đấu Trường! +{0} linh thạch, pháp bảo {1}',v,GEAR[it.k].n),'realm');saveSave()}}
const _doB3=drawObs;
drawObs=function(o){if(o.part==='spring'){const t=G.t,used=G.bc&&G.bc.done;ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.55);ctx.globalAlpha=used?0.4:0.85;ctx.fillStyle='#5ccbe8';ctx.beginPath();ctx.arc(0,0,34,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;
    fxD('fx_c_bang',o.x,o.y,64,{sq:0.55,rot:t*0.4,alpha:used?0.2:0.6,add:1});if(!used){glow(o.x,o.y-6,30,'#9fe8ff',0.5);if(rand()<0.4)vp(o.x+(rand()-.5)*40,o.y+(rand()-.5)*14,{vy:-25,life:0.8,s:1.6,c:'#e8fbff'})}return}
  _doB3(o)};

// ── Ẩn Nhiệm: chỉ hiện khi đã hoàn thành
const AN={
  bacoquan:{n:'Cơ Quan Đại Sư',d:'Giải 3 cơ quan bí ẩn trong một trận.'},
  thapsinh:{n:'Thập Tử Nhất Sinh',d:'Bước vào Bí cảnh khi còn dưới 10% máu.'},
  tramthuy:{n:'Trảm Thủy Tinh',d:'Hạ Thủy Tinh bằng đại chiêu.'},
  vohinh:{n:'Bất Nhiễm Trần',d:'Hạ hộ vệ trong Cổ Điện Hộ Vệ mà không mất giọt máu nào.'},
  hophong:{n:'Đuổi Gió Bắt Hồ',d:'Chạm Linh Hồ đủ 3 lần trong 20 giây.'},
  dendung:{n:'Minh Đăng',d:'Thắp đúng thứ tự đèn ngay lần đầu.'},
};
for(const k in AN){AN[k].n=i18n('an.'+k,AN[k].n);AN[k].d=i18n('an.'+k+'.mota',AN[k].d)}
function anSave(){if(!SAVE.an)SAVE.an={};return SAVE.an}
function anDone(k){const S=anSave();if(S[k])return;S[k]=1;SAVE.lt+=100;SAVE.titles=SAVE.titles||{};SAVE.titles[AN[k].n]=1;saveSave();
  announce(i18nf('an.xong','Ẩn Nhiệm: {0} · +100 linh thạch',AN[k].n),'realm');sfx('realm')}
const _psB2=pzSolve;
pzSolve=function(M,x,y){const was=M.solved;_psB2(M,x,y);if(was)return;
  if(G.pz.filter(q=>q.solved).length>=3)anDone('bacoquan');
  if(M.ty==='den'&&!M.fail)anDone('dendung');
  if(M.ty==='ho'&&M.t<=20)anDone('hophong')};
const _beB2=bcEnter;
bcEnter=function(M){const P=G.p;const low=P.hp<P.mhp*0.1;_beB2(M);if(low)anDone('thapsinh');if(G.bc)G.bc.taken0=G.taken};
const _kvB2=bcKV;bcKV=function(){if(G.bc&&G.taken===G.bc.taken0)anDone('vohinh');_kvB2()};
const _keB2=killE;killE=function(e){if(!e.dead&&e.t==='maton'&&G.src==='burst')anDone('tramthuy');_keB2(e)};
const _bkB2=buildBikip;
buildBikip=function(){_bkB2();const L=$('bkList'),S=anSave(),ks=Object.keys(AN);L.appendChild(elx('div','osec',i18nf('bk.an','Ẩn Nhiệm ({0}/{1})',ks.filter(k=>S[k]).length,ks.length)));
  for(const k of ks)L.appendChild(elx('div','bkrow'+(S[k]?' seen':''),`<div class="bke"><b>${S[k]?AN[k].n:'???'}</b><p>${S[k]?AN[k].d:i18n('bk.anan','Nhiệm vụ ẩn, tự khám phá')}</p></div>`))};

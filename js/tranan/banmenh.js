'use strict';
// ───────────────────────── BẢN MỆNH ĐỒ — cây kỹ năng của từng tu sĩ
// Lõi ở file này KHÔNG chứa nội dung. Toàn bộ nhánh, nút, lời ký ức nằm trong js/tranan/banmenh_data.js (xem hướng dẫn đầu file đó).
//
// Luật (bản mùa giải, 11/11/2026): điểm kỹ năng = BM_FREE + (cấp mùa − 1). Mỗi nút nâng được nhiều BẬC.
//   • nút chỉ cộng chỉ số co giãn được (xem BM_SCALE): tối đa 5 bậc, mỗi bậc thêm 50% hiệu lực gốc
//   • nút khác (có hàm on hoặc chỉ số rời): tối đa 3 bậc, mỗi bậc thêm +4% sát thương Đánh
//   • nút chốt: 1 bậc; cần đủ 5 nút của nhánh; được 1 nút chốt, cấp 30 được 2, cấp 50 được 3
//   • muốn nâng một nút phải có ít nhất 1 bậc ở nút đứng trước nó trong nhánh
// Lưu theo mùa: muaCh(tuSi).tree = {idNút: bậc}  (js/tranan/mua.js). Hết mùa tự về trống.
// Trong trận: G.bm = {m:{khóa:tổng}, x:{cộng hưởng}, has:{id:bậc}, on:{sựKiện:[hàm]}, s:{trạng thái tạm}}
//   bm('khóa') · bmHas('id') · bmEmit('sựKiện',ctx) · bmOn('sựKiện')
const BM_FREE=2,BM_KEY_LV=[1,30,50];
const BM_SCALE=new Set(['atkSpd','atkDmg','crit','critM','spd','hp','tkDmg','tkCd','tpCd','w2Cd','khiDmg','docDmg','loiDmg','boomDmg','boomR','chayDmg','cloneDmg','foxDmg','tpLen','tpDmg','loiStun','trapStun','cloneDur']);
const BM_TEST=(()=>{try{return new URLSearchParams(location.search).get('bmtest')==='1'}catch(e){return false}})();
function bmSave(){return SAVE.bm||(SAVE.bm={})}
const bmTree=ch=>typeof BM_DATA!=='undefined'&&BM_DATA[ch]||null;
// hình nút: n.ic nếu có; không thì theo quy ước ic_bm_<mã hình tu sĩ>_<id nhánh><thứ tự>; không có nữa thì hình của nhánh
function bmNodes(ch){const T=bmTree(ch),L=[];if(!T)return L;
  if(!T._tr){T._tr=1;const tr=(k,v)=>v?i18n('bm.'+ch+'.'+k,v):v;T.lore=tr('l',T.lore);for(const b of T.branches){b.n=tr(b.id+'.n',b.n);b.tag=tr(b.id+'.tag',b.tag);b.lore=tr(b.id+'.l',b.lore);if(b.hop)for(const h in b.hop)b.hop[h][0]=tr(b.id+'.hop.'+h,b.hop[h][0]);for(const n of b.nodes.concat(b.key?[b.key]:[])){n.n=tr(b.id+'.'+n.id+'.n',n.n);n.d=tr(b.id+'.'+n.id+'.d',n.d);n.lore=tr(b.id+'.'+n.id+'.l',n.lore)}}}
  const sp=CHARS[ch].spr,auto=(b,i)=>{const k='bm_'+sp+'_'+b.id+(i+1);return typeof SPR!=='undefined'&&SPR['ic_'+k]?k:b.ic};
  const mx=n=>n.max||(n.isKey?1:(!n.on&&n.mod&&Object.keys(n.mod).every(k=>BM_SCALE.has(k)))?5:3);
  for(const b of T.branches){b.nodes.forEach((n,i)=>{Object.assign(n,{br:b.id,tier:i,fid:b.id+'.'+n.id,ic:n.ic0||(n.ic0=n.ic||null)||auto(b,i)});n.mx=mx(n);L.push(n)});
    if(b.key){Object.assign(b.key,{br:b.id,tier:b.nodes.length,isKey:1,fid:b.id+'.'+b.key.id,ic:b.key.ic0||(b.key.ic0=b.key.ic||null)||auto(b,b.nodes.length)});b.key.mx=1;L.push(b.key)}}
  return L}
const bmAlloc=ch=>{if(BM_TEST){const A=bmSave().test||(bmSave().test={});return A[ch]||(A[ch]={})}return muaCh(ch).tree};
const bmLv=ch=>BM_TEST?60:muaCh(ch).lv;
const bmPts=ch=>BM_FREE+bmLv(ch)-1;
const bmUsed=ch=>{const A=bmAlloc(ch),ok=new Set(bmNodes(ch).map(n=>n.fid));let s=0;for(const k in A){if(!ok.has(k)){delete A[k];continue}s+=A[k]|0}return s};
const bmKeysMax=ch=>BM_KEY_LV.filter(l=>bmLv(ch)>=l).length;
function bmCan(ch,n,dir){const A=bmAlloc(ch),T=bmTree(ch),b=T.branches.find(x=>x.id===n.br),r=A[n.fid]|0,all=b.nodes.concat(b.key?[b.key]:[]);
  if(dir<0){if(r<=0)return false;if(r>1)return true;return !all.slice(n.tier+1).some(x=>(A[x.fid]|0)>0)}
  if(r>=n.mx||bmUsed(ch)>=bmPts(ch))return false;
  if(n.isKey){if(b.nodes.some(x=>!(A[x.fid]|0)))return false;return bmNodes(ch).filter(x=>x.isKey&&(A[x.fid]|0)).length<bmKeysMax(ch)}
  return n.tier===0||(A[b.nodes[n.tier-1].fid]|0)>0}
// ── trong trận
function bmRun(){
  if(!G)return{m:{},x:{},has:{},on:{},s:{}};if(G.bm)return G.bm;
  if(!G.hd)return G.bm={m:{},x:{},has:{},on:{},s:{}};   // 1.0.67: cây kỹ năng và dòng phụ Pháp Bảo chỉ có tác dụng trong Trấn Ấn Lộ; Thiên Kiếp chạy như gốc
  const R=G.bm={m:{},x:{},has:{},on:{},s:{}},A=bmAlloc(G.ch);
  for(const n of bmNodes(G.ch)){const r=Math.min(n.mx,A[n.fid]|0);if(!r)continue;R.has[n.fid]=r;const sc=n.mx===5?1+0.5*(r-1):1;
    if(n.mod)for(const k in n.mod)R.m[k]=(R.m[k]||0)+n.mod[k]*sc;
    if(n.mx===3&&r>1)R.m.atkDmg=(R.m.atkDmg||0)+0.04*(r-1);
    if(n.on)for(const ev in n.on)(R.on[ev]||(R.on[ev]=[])).push(n.on[ev])}
  try{const gs=gearSave();for(const id of Object.values(gs.eq)){const it=gItem(id);for(const p of it?[it.p,it.q]:[])if(p&&BM_PHU[p[0]])R.m[p[0]]=(R.m[p[0]]||0)+p[1]}}catch(e){}
  return R}
const bm=k=>{if(!G)return 0;const R=G.bm||bmRun(),v=(R.m[k]||0)+(R.x[k]||0);return k.endsWith('Cd')?Math.min(0.6,v):v};   // hồi chiêu giảm tối đa 60%
const bmHas=id=>!!(G&&(G.bm||bmRun()).has[id]);
function bmEmit(ev,ctx){if(!G)return;const R=G.bm||bmRun(),L=R.on[ev];if(L)for(const f of L)try{f(ctx,R.s)}catch(e){console.error('bm',ev,e)}}
const bmOn=ev=>{if(!G)return null;const L=(G.bm||bmRun()).on[ev];return L?c=>L[0](c,G.bm.s):null};
// ── ấn cộng hưởng: nhánh khai hop:{<id ấn>:['mô tả',{mod}]}; có từ 3 nút của nhánh và đang cầm ấn đó thì mod được cộng (nhân theo cấp ấn, tối đa 2)
const bmHopOn=b=>{const R=G.bm||bmRun();let n=0;for(const x of b.nodes)if(R.has[b.id+'.'+x.id])n++;return n>=3};
function bmSyn(boons){const R=G.bm||bmRun(),T=bmTree(G.ch);R.x={};if(!T)return;for(const b of T.branches){if(!b.hop||!bmHopOn(b))continue;for(const id in b.hop){const lv=Math.min(2,boons[id]|0);if(!lv)continue;const m=b.hop[id][1];for(const k in m)R.x[k]=(R.x[k]||0)+m[k]*lv}}}
function bmSynText(id){const T=G&&bmTree(G.ch);if(!T)return'';let t='';for(const b of T.branches)if(b.hop&&b.hop[id]&&bmHopOn(b))t+=`<em>${i18nf('bm.hop','Cộng hưởng {0}: {1}',b.n,b.hop[id][0])}</em>`;return t}
const _recBM=recompute;
recompute=function(){_recBM();const st=G.st;st.crit+=bm('crit');st.critM=(st.critM||2)+bm('critM');st.kiemAmt=(st.kiemAmt||0)+(bm('kiemAmt')|0);st.kiemP=(st.kiemP||0)+(bm('kiemP')|0);st.spd*=1+bm('spd');
  const P=G.p,h=bm('hp');if(h){const m=Math.round(P.mhp*(1+h));if(m>P.mhp)P.hp+=m-P.mhp;P.mhp=m}};
const _newRunBM=newRun;
newRun=function(a,b,c,d){_newRunBM(a,b,c,d);G.bm=null;bmRun();recompute();G.p.hp=G.p.mhp};
// ── cơ chế dùng chung cho mọi cây: khiên, độc/cháy chồng tầng, sự kiện bị đánh / sắp gục / Bộc Phát
function bmShield(v){G.bmSh=Math.min(G.p.mhp*0.3,(G.bmSh||0)+v);if(!G.bmShFx&&typeof CDX!=='undefined')G.bmShFx=CDX.fx({dur:1e9,o(f){f.t=1;if(!(G.bmSh>0)||G.p.dead)return;const P=G.p;ctx.save();ctx.translate(P.x,P.y-12);ring(0,0,15,'#9ff0c8',1.6,0.35+0.4*Math.min(1,G.bmSh/(P.mhp*0.3)));ctx.restore();ctx.globalAlpha=1}})}
function bmDot(e,k,dps,dur,max,el){if(!e||e.dead)return;const D=e.bmD||(e.bmD={}),d=D[k]||(D[k]={n:0});d.n=Math.min(max,d.n+1);d.t=dur;d.dps=dps;d.el=el;G.bmDotOn=1}
const bmDotN=(e,k)=>e&&e.bmD&&e.bmD[k]&&e.bmD[k].n||0;
function bmDotTick(dt){G.bmDT=(G.bmDT||0)-dt;if(!G.bmDotOn||G.bmDT>0)return;G.bmDT=0.5;let any=0;const s=G.src;
  for(const e of G.e){const D=e.bmD;if(!D||e.dead)continue;for(const k in D){const d=D[k];if(d.n<=0)continue;any=1;d.t-=0.5;G.src=k;hurtE(e,d.dps*0.5*d.n,d.el,{rx:1});if(d.t<=0)d.n=0;if(e.dead)break}}G.src=s;G.bmDotOn=any}
const _upBM=updatePlayer;
updatePlayer=function(dt){_upBM(dt);if(G.p.dead)return;bmDotTick(dt);if(G.bm&&G.bm.on.tick)bmEmit('tick',{dt})};
const _updBM=update;
update=function(dt){if(G&&!G.paused&&!G.over&&G.bmSlow>0){G.bmSlow-=dt;dt*=0.35}_updBM(dt)};
const _hurtBM=hurtP;
hurtP=function(dmg,src){const P=G.p;if(P.dead||G.over||P.inv>0||G.god||!G.bm)return _hurtBM(dmg,src);
  const c={dmg,src};bmEmit('hurt',c);if(G.bmSh>0&&c.dmg>0){const a=Math.min(G.bmSh,c.dmg);G.bmSh-=a;c.dmg-=a}
  if(c.dmg<=0){P.inv=Math.max(P.inv,0.15);return}
  if(P.hp-Math.max(1,c.dmg-G.st.armor)<=0){const L={save:false};bmEmit('lethal',L);if(L.save){P.inv=Math.max(P.inv,1.5);flash('#ffffff',0.5);sfx('realm');return}}
  _hurtBM(c.dmg,src)};
const _burstBM=useBurst;
useBurst=function(){const r=_burstBM();if(r)bmEmit('burst',{});return r};
if(typeof SRC_N!=='undefined'){SRC_N.doc=[i18n('bm.src.doc','Độc'),'vine'];SRC_N.chay=[i18n('bm.src.chay','Thiêu Đốt'),'fire'];SRC_N.bm=[i18n('bm.src.bm','Bản Mệnh'),'p_yin']}
// ── dòng phụ của Pháp Bảo (chỉ đồ rơi ở Trấn Ấn Lộ): it.p=[khóa mod, giá trị]; đồ rơi từ tầng 10 có thể thêm dòng thứ hai it.q. Thêm dòng mới: thêm một mục vào BM_PHU.
// Tỉ lệ có dòng phụ: 60% + 2% mỗi tầng. Dòng thứ hai: từ tầng 10, 6% + 3% mỗi tầng trên 10 (tối đa 60%).
const BM_PHU={atkDmg:[0.08,'Đánh'],atkSpd:[0.06,'Tốc độ Đánh'],tkDmg:[0.12,'Tuyệt kỹ'],tkCd:[0.06,'Tuyệt kỹ hồi nhanh'],tpCd:[0.08,'Thân pháp hồi nhanh'],w2Cd:[0.08,'Chiêu 2 hồi nhanh'],
  khiDmg:[0.2,'Kiếm khí'],docDmg:[0.2,'Độc'],chayDmg:[0.2,'Thiêu đốt'],loiDmg:[0.2,'Sét'],boomDmg:[0.15,'Vụ nổ'],cloneDmg:[0.2,'Phân thân'],foxDmg:[0.2,'Lửa hồ']};
const bmPhuVal=(k,r)=>+(BM_PHU[k][0]*(1+0.25*(r|0))).toFixed(3);
function bmPhuRoll(it,tier){tier=tier|0;if(!it||rand()>Math.min(1,0.6+0.02*tier))return it;const K=Object.keys(BM_PHU),k=K[(rand()*K.length)|0];it.p=[k,bmPhuVal(k,it.r)];
  if(tier>=10&&rand()<Math.min(0.6,0.06+0.03*(tier-10))){const K2=K.filter(x=>x!==k),k2=K2[(rand()*K2.length)|0];it.q=[k2,bmPhuVal(k2,it.r)]}
  saveSave();return it}
function bmPhuKeep(n,used){const sp=used&&used.find(u=>u.p&&BM_PHU[u.p[0]]);if(sp)n.p=[sp.p[0],bmPhuVal(sp.p[0],n.r)];const sq=used&&used.find(u=>u.q&&BM_PHU[u.q[0]]&&(!n.p||u.q[0]!==n.p[0]));if(sq)n.q=[sq.q[0],bmPhuVal(sq.q[0],n.r)]}   // ghép đồ: giữ dòng phụ, mạnh lên theo phẩm
const bmPhuText=it=>(it?[it.p,it.q]:[]).filter(p=>p&&BM_PHU[p[0]]).map(p=>`✦ ${i18n('bm.phu.'+p[0],BM_PHU[p[0]][1])} +${Math.round(p[1]*100)}%`).join(' ');
if(typeof gearDesc==='function'){const _gdBM=gearDesc;gearDesc=function(it){const t=_gdBM(it),p=bmPhuText(it);return p?t+' · '+p:t}}
// ── màn hình cây
{
  const css=document.createElement('style');
  css.textContent=`#bmOv{position:fixed;inset:0;z-index:45;background:#120a24;color:#efe6ff;font:700 13px var(--font);display:flex;flex-direction:column;padding:10px 10px max(10px,env(safe-area-inset-bottom));box-sizing:border-box;overflow:hidden}
#bmOv[hidden]{display:none}#bmOv h2{margin:0;font-size:20px;text-align:center;color:#fff6b0;text-shadow:2px 2px 0 #2a1050}#bmOv h2 small{display:block;font-size:12px;color:#c9b8ff}
.bmxp{height:7px;border-radius:4px;background:#2a1a50;margin:6px 20px 8px;overflow:hidden}.bmxp i{display:block;height:100%;background:linear-gradient(90deg,#b48cff,#ffd45a)}
.bmcols{flex:1;display:flex;gap:6px;min-height:0}.bmcol{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:rgba(255,255,255,.05);border-radius:12px;padding:6px 3px;overflow-y:auto}
.bmcol h3{margin:0;font-size:14px;color:#ffd45a;text-align:center}.bmcol h3 small{display:block;font-size:10px;color:#b8a8e0;font-weight:700}
.bmn{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:94%;min-height:60px;border-radius:10px;border:2px solid #4a3a7a;background:#1e1438;color:#9a8cc0;font:700 11.5px var(--font);padding:3px 4px;line-height:1.15}
.bmn.can{border-color:#b48cff;color:#efe6ff}.bmn.on{background:linear-gradient(#6a3ad0,#4a2aa0);border-color:#ffd45a;color:#fff}.bmn.full{box-shadow:0 0 0 2px #ffd45a inset}.bmn.sel{outline:2px solid #fff;outline-offset:1px}
.bmn img{width:30px;height:30px;image-rendering:pixelated;filter:grayscale(1) brightness(.55);pointer-events:none}.bmn.can img{filter:grayscale(.5) brightness(.85)}.bmn.on img{filter:none}.bmn.key img{width:40px;height:40px}
.bmn u{position:absolute;right:3px;top:2px;text-decoration:none;font-size:10.5px;color:#ffe48a;background:rgba(0,0,0,.45);border-radius:6px;padding:0 4px}
.bmn.key{min-height:76px;border-style:double;border-width:4px;font-size:12.5px}.bmn.key.on{background:linear-gradient(#ffb03a,#c8601a);color:#2a1000}
.bmln{width:2px;height:4px;background:#4a3a7a}
#bmInfo{display:flex;gap:10px;align-items:flex-start;margin:6px 0;min-height:84px;padding:8px 10px;border-radius:12px;background:#fbf6ff;color:#3a2460;font-size:13px;line-height:1.3}#bmInfo>img{width:48px;height:48px;image-rendering:pixelated;flex:none;border-radius:8px;background:#e6d8ff;padding:3px}#bmInfo>div{flex:1}
#bmInfo b{display:block;font-size:15px;color:#2a1050}#bmInfo i{display:block;margin-top:3px;font-style:italic;color:#7a5a9a;font-weight:600;font-size:12px}#bmInfo em{display:block;margin-top:3px;font-style:normal;color:#b8501a;font-size:12px}
.bmbot{display:flex;gap:6px}.bmbot button{flex:1;font:800 14px var(--font);padding:9px 4px;border-radius:10px;border:2px solid #7a5ad0;background:#2a1a50;color:#e8dcff}.bmbot .go{background:#ffd45a;color:#3a2400;border-color:#fff}.bmbot .up{background:#3aa05a;border-color:#bfffd0;color:#fff;flex:1.4}.bmbot button:disabled{opacity:.35}
#bmB{margin:4px auto;display:block}
@media (orientation:landscape) and (max-height:560px){#bmOv{display:grid;grid-template-columns:1fr min(42vw,340px);grid-template-rows:auto auto 1fr auto;column-gap:8px;padding:6px 10px}#bmOv[hidden]{display:none}#bmOv h2,#bmOv .bmxp{grid-column:1/3}#bmOv h2{font-size:16px}#bmOv h2 small{display:inline;margin-left:8px}.bmxp{margin:3px 20px 5px}
  .bmcols{grid-column:1;grid-row:3/5}#bmInfo{grid-column:2;grid-row:3;margin:0 0 6px;overflow-y:auto;min-height:0}.bmbot{grid-column:2;grid-row:4}.bmbot button{padding:7px 2px;font-size:13px}.bmn{min-height:50px}.bmn.key{min-height:62px}}#bmB i{font-style:normal;background:#ff3d6e;color:#fff;border-radius:9px;padding:0 6px;margin-left:6px;font-size:12px}`;
  document.head.appendChild(css);
  const ov=document.createElement('div');ov.id='bmOv';ov.hidden=true;document.body.appendChild(ov);
  let ch=null,sel=null;
  function draw(){
    const T=bmTree(ch),A=bmAlloc(ch),lv=bmLv(ch),left=bmPts(ch)-bmUsed(ch),c=muaCh(ch);
    ov.innerHTML=`<h2>${i18n('bm.ten','Bản Mệnh Đồ')} · ${CHARS[ch].n}<small>${i18nf('bm.diem3','Cấp {0} · còn {1} điểm kỹ năng · {2}',lv,left,coiName())}</small></h2><div class="bmxp"><i style="width:${Math.min(100,c.xp/muaNeed(c.lv)*100)}%"></i></div>`;
    const cols=document.createElement('div');cols.className='bmcols';
    for(const b of T.branches){const col=document.createElement('div');col.className='bmcol';col.innerHTML=`<h3>${b.n}<small>${b.tag||''}</small></h3>`;
      bmNodes(ch).filter(n=>n.br===b.id).forEach((n,i)=>{if(i){const l=document.createElement('div');l.className='bmln';col.appendChild(l)}
        const e=document.createElement('button'),r=A[n.fid]|0,can=bmCan(ch,n,1);e.className='bmn'+(n.isKey?' key':'')+(r?' on':can?' can':'')+(r>=n.mx?' full':'')+(sel===n.fid?' sel':'');
        e.innerHTML=(n.ic?`<img src="${iconURL(n.ic)}" alt="">`:'')+`<span>${n.n}</span>`+(n.mx>1||r?`<u>${r}/${n.mx}</u>`:'');
        e.onclick=()=>{sfx('click');if(sel===n.fid&&bmCan(ch,n,1)){A[n.fid]=r+1;saveSave();sfx('levelup')}sel=n.fid;draw()};col.appendChild(e)});
      cols.appendChild(col)}
    ov.appendChild(cols);
    const info=document.createElement('div');info.id='bmInfo';const n=sel&&bmNodes(ch).find(x=>x.fid===sel),br=n&&T.branches.find(x=>x.id===n.br);
    if(n){const r=A[n.fid]|0,up=bmCan(ch,n,1);
      const rk=n.isKey?i18nf('bm.chot2','Nút chốt · cần đủ 5 nút của nhánh. Đang được mở {0} nút chốt (cấp 30 và 50 thêm 1).',bmKeysMax(ch)):n.mx===5?i18nf('bm.bac5','Bậc {0}/{1} · mỗi bậc thêm 50% hiệu lực.',r,n.mx):i18nf('bm.bac3','Bậc {0}/{1} · mỗi bậc sau thêm 4% sát thương Đánh.',r,n.mx);
      info.innerHTML=(n.ic?`<img src="${iconURL(n.ic)}" alt="">`:'')+`<div><b>${n.n}</b>${n.d}<em>${rk}</em>${n.lore&&r?`<i>${n.lore}</i>`:br.lore&&!n.lore?`<i>${br.lore}</i>`:''}${!up&&r<n.mx?`<i>${left<=0?i18n('bm.hetDiem','Hết điểm: lên cấp ở Trấn Ấn Lộ để có thêm.'):i18n('bm.canTruoc','Cần mở nút đứng trước trong nhánh.')}</i>`:''}</div>`}
    else info.innerHTML=`<div><b>${i18n('bm.hd3','Lên cấp ở Trấn Ấn Lộ để nhận điểm kỹ năng.')}</b>${i18n('bm.hd4','Bấm một nút để xem, bấm lần nữa (hoặc nút Nâng) để cộng điểm. Mỗi nút nâng được nhiều bậc. Hết mùa, cấp và điểm trở về đầu.')}${T.lore?`<i>${T.lore}</i>`:''}</div>`;
    ov.appendChild(info);
    const bot=document.createElement('div');bot.className='bmbot';
    const mk=(t,f,cls,dis)=>{const b=document.createElement('button');b.innerHTML=t;if(cls)b.className=cls;b.disabled=!!dis;b.onclick=f;bot.appendChild(b)};
    mk(i18n('bm.tay','Tẩy điểm'),()=>{for(const k in A)delete A[k];saveSave();sfx('click');draw()},'',!bmUsed(ch));
    mk(i18n('bm.ha','− Hạ'),()=>{A[n.fid]=(A[n.fid]|0)-1;if(A[n.fid]<=0)delete A[n.fid];saveSave();sfx('click');draw()},'',!n||!bmCan(ch,n,-1));
    mk(i18n('bm.nang','+ Nâng'),()=>{A[n.fid]=(A[n.fid]|0)+1;saveSave();sfx('levelup');draw()},'up',!n||!bmCan(ch,n,1));
    mk(i18n('bm.xong','Xong'),()=>{ov.hidden=true;sfx('click');if(typeof bmBadge==='function')bmBadge()},'go');ov.appendChild(bot);
  }
  function bmOpen(c){ch=c;sel=null;if(!bmTree(ch)){toast(i18nf('bm.chuaCo','{0} chưa có Bản Mệnh Đồ, sẽ bổ sung sau',CHARS[c].n));return}draw();ov.hidden=false}
  window.bmOpen=bmOpen;
  // nhãn nút ở màn Trấn Ấn Lộ, có số điểm chưa dùng
  window.bmBadge=function(){const b=$('bmB');if(!b||typeof selChar==='undefined'||!bmTree(selChar))return;const left=bmPts(selChar)-bmUsed(selChar);b.innerHTML=i18nf('bm.nut2','Bản Mệnh Đồ · cấp {0}',bmLv(selChar))+(left>0?`<i>+${left}</i>`:'')};
  // nút #bmB nằm ở màn riêng của Trấn Ấn Lộ (js/tranan/sanh.js)
}

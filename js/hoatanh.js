'use strict';
// ───────────────────────── Hoạt ảnh chiến đấu của tu sĩ (10/11/2026, kế hoạch nâng cấp phần A1–A2)
// Khung vẽ theo pose guide (tools/hoat_anh/cut_act.py): {spr}_i_{D|R|U}n đứng thở, {spr}_a_… ra đòn (4 khung), {spr}_c_… thi pháp.
// Công pháp chính bắn → tu sĩ quay về phía yêu quái và ra đòn; công pháp hồi chiêu dài → thi pháp; đứng yên → thở.
// Tu sĩ nào chưa có bộ khung thì giữ nguyên như cũ. Tắt: ?ha=0 (nhớ trong máy), bật lại ?ha=1.
const HOATANH=(()=>{try{const q=new URLSearchParams(location.search).get('ha');if(q!==null)localStorage.setItem('vktt_ha',q==='1'?'1':'0');return localStorage.getItem('vktt_ha')!=='0'}catch(e){return true}})();
// thứ tự khung cho từng động tác (lấy từ 8 khung của tấm gốc); mặc định ở '*'
const HA_SEQ={'*':{a:[1,2,2,3],c:[2,3,5,6,7]}};   // ra đòn: tấm 4 khung (0 thủ, 1 lấy đà, 2 chém, 3 thu)
const HA_DUR={a:0.3,c:0.45};
if(HOATANH){
  const has=id=>!!SPR[`${id}_i_D0`];
  const dir4=(dx,dy)=>Math.abs(dx)>Math.abs(dy)*0.9?(dx>0?'R':'L'):(dy>0?'D':'U');
  const _fwHA=fireWeapon;
  fireWeapon=function(k,w){
    const n0=G.pr.length,r=_fwHA(k,w),P=G.p,id=CHARS[G.ch].spr;
    if(!(r>0.25)||P.dead||!has(id))return r;
    const main=k===CHARS[G.ch].w,kind=main?'a':(r>=2.4?'c':null);
    if(kind&&!(P.act&&G.t-P.act.t0<P.act.dur*0.7&&!(main&&P.act.k==='c'))){
      const tg=nearestN(P.x,P.y,260,1)[0];let d=P.dir;
      if(tg)d=dir4(tg.x-P.x,tg.y-P.y);
      if(SPR[`${id}_${kind}_${d==='L'?'R':d}0`])P.act={k:kind,d,t0:G.t,dur:HA_DUR[kind]};
    }
    // đạn mới xuất phát từ tay/kiếm thay vì giữa người
    for(let i=n0;i<G.pr.length;i++){const p=G.pr[i],v=Math.hypot(p.vx||0,p.vy||0);if(v>40&&Math.hypot(p.x-P.x,p.y-(P.y-8))<3){p.x+=p.vx/v*7;p.y+=p.vy/v*7-2}}
    return r;
  };
  const _dpsHA=drawPlayerSprite;
  drawPlayerSprite=function(x,y,dir,anim,o={}){
    if(o.ch||!G||!G.p||o.dieT!==undefined||(o.hurt&&!o.tint))return _dpsHA(x,y,dir,anim,o);
    const id=CHARS[G.ch].spr,P=G.p;if(!has(id))return _dpsHA(x,y,dir,anim,o);
    let k=null,flip=false;const sc=o.sc||1,A=P.act;
    if(A&&x===P.x&&y===P.y){const u=(G.t-A.t0)/A.dur;
      if(u>=1||u<0)P.act=null;
      else{const d=A.d==='L'?'R':A.d,S=(HA_SEQ[id]&&HA_SEQ[id][A.k+'_'+d])||HA_SEQ['*'][A.k],f=S[Math.min(S.length-1,(u*S.length)|0)];k=`${id}_${A.k}_${d}${f}`;flip=A.d==='L'}}
    if(!k&&!(anim>0)){const d=dir==='L'?'R':dir;k=`${id}_i_${d}${((G.t*5)|0)%8}`;flip=dir==='L'}
    if(!k||!SPR[k])return _dpsHA(x,y,dir,anim,o);
    if(o.tint)drawTint(k,x,y,o.tint,o.ta,flip,sc,o.alpha??1);else drawS(k,x,y,{flip,sc,alpha:o.alpha});
    if(o.flash)drawS(k,x,y,{flip,sc,alpha:0.6,white:1});
  };
}

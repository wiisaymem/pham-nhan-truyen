'use strict';
// ───────────────────────── (30/10/2026): 6 tu sĩ đi bộ 8 khung vẽ theo pose guide (tools/pose_guide)
// Mặc định BẬT từ 1.0.46 (Kent duyệt 30/10). Muốn xem bộ cũ: mở game với ?lp8=0 (nhớ trong máy), bật lại bằng ?lp8=1.
const LP8=(()=>{try{const q=new URLSearchParams(location.search).get('lp8');if(q!==null)localStorage.setItem('vktt_lp8',q==='1'?'1':'0');return localStorage.getItem('vktt_lp8')!=='0'}catch(e){return true}})();
if(LP8){
  const _dpsLP8=drawPlayerSprite;
  drawPlayerSprite=function(x,y,dir,anim,o={}){
    const id=CHARS[o.ch||(G&&G.ch)].spr;
    if(o.dieT!==undefined||(o.hurt&&!o.tint)||!SPR[`${id}8_w_D0`])return _dpsLP8(x,y,dir,anim,o);
    const d=dir==='L'?'R':dir,flip=dir==='L',sc=o.sc||1,f=anim>0?((anim*1.15)|0)%8:0,k=`${id}8_w_${d}${f}`;
    if(o.tint)drawTint(k,x,y,o.tint,o.ta,flip,sc,o.alpha??1);
    else drawS(k,x,y,{flip,sc,alpha:o.alpha});
    if(o.flash)drawS(k,x,y,{flip,sc,alpha:0.6,white:1});
  };
}

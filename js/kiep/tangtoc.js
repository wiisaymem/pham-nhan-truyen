'use strict';
// ───────────────────────── Gói Tăng Tốc: trận chạy x2 / x4 trong 30 ngày. Mua qua Google Play (sản phẩm tiêu hao), chỉ có trong app Android.
const SPD_PROD='tangtoc_30ngay', SPD_DAYS=30, DAY_MS=86400000;
const NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const BILL=NATIVE&&Capacitor.Plugins?Capacitor.Plugins.Billing:null;
function spdSave(){if(!SAVE.spd)SAVE.spd={until:0,tok:{},m:1};return SAVE.spd}
const spdOn=()=>Date.now()<spdSave().until;
const spdDays=()=>Math.max(0,Math.ceil((spdSave().until-Date.now())/DAY_MS));
function spdMul(){return G&&!G.over&&spdOn()?(spdSave().m||1):1}
// gắn vào vòng lặp: chạy thêm bước cập nhật mỗi khung hình
frame=function(now){const dt=Math.min(0.05,(now-lastT)/1000||0);lastT=now;
  if(G){const n=SPEED*spdMul();for(let i=0;i<n&&!G.paused;i++)update(dt);hud(dt)}
  render(now);requestAnimationFrame(frame)};
// nút trên HUD
(function(){const pb=$('pauseB');if(!pb)return;const b=document.createElement('button');b.id='spdB';b.hidden=true;pb.before(b);
  b.onclick=()=>{const S=spdSave();S.m=S.m===1?2:S.m===2?4:1;saveSave();spdBtn();if(typeof sfx==='function')sfx('click')}})();
function spdBtn(){const b=$('spdB');if(!b)return;const on=!!G&&!G.over&&spdOn();b.hidden=!on;if(on)b.textContent='x'+(spdSave().m||1)}
const _hudSpd=hud;hud=function(dt){_hudSpd(dt);if(((G.t*4)|0)!==spdBtn.k){spdBtn.k=(G.t*4)|0;spdBtn()}};
// cấp quyền khi Play báo đã mua
function spdGrant(tok){const S=spdSave();if(S.tok[tok])return false;S.tok[tok]=1;S.until=Math.max(Date.now(),S.until)+SPD_DAYS*DAY_MS;if((S.m||1)===1)S.m=2;saveSave();return true}
let spdPrice='';
if(BILL){BILL.addListener('purchase',p=>{if(p.product!==SPD_PROD)return;const n=spdGrant(p.token);
    BILL.consume({token:p.token}).catch(()=>{});if(n){toast(i18nf('spd.ok','Đã kích hoạt Gói Tăng Tốc · còn {0} ngày',spdDays()));if(typeof sfx==='function')sfx('levelup')}spdRow()});
  setTimeout(()=>{BILL.restore().catch(()=>{});BILL.getProduct({id:SPD_PROD}).then(r=>{spdPrice=r.price||'';spdRow()}).catch(()=>{})},1500)}
function spdBuy(){if(!BILL)return;const b=$('spdBuy');if(b)b.disabled=true;
  BILL.getProduct({id:SPD_PROD}).then(()=>BILL.buy({id:SPD_PROD})).then(r=>{if(r&&!r.ok&&r.code!==1)toast(i18n('spd.loi','Chưa mua được, thử lại sau nhé'))})
    .catch(()=>toast(i18n('spd.loi','Chưa mua được, thử lại sau nhé'))).finally(()=>{if(b)b.disabled=false;spdRow()})}
// mục trong Cài đặt
(function(){const fx=$('optFx');if(!fx)return;const row=document.createElement('div');row.id='spdRow';row.className='opt spdr';const anchor=$('hdReset')||fx.closest('.opt');anchor.after(row);spdRow()})();
function spdRow(){const r=$('spdRow');if(!r)return;const on=spdOn();
  let h=`<div><b>${i18n('spd.ten','Gói Tăng Tốc x2 · x4')}</b><small>${on?i18nf('spd.con','Đang dùng · còn {0} ngày. Chạm nút x2/x4 cạnh nút tạm dừng để đổi tốc độ.',spdDays()):i18nf('spd.mota','Trận đấu chạy nhanh gấp 2 hoặc gấp 4, dùng trong {0} ngày.',SPD_DAYS)}</small></div>`;
  if(BILL)h+=`<button id="spdBuy" class="btn">${on?i18n('spd.giahan','Gia hạn'):i18n('spd.mua','Mua')}${spdPrice?' · '+spdPrice:''}</button>`;
  else h+=`<small class="spdw">${i18n('spd.app','Có trong app Android')}</small>`;
  r.innerHTML=h;const b=$('spdBuy');if(b)b.onclick=spdBuy}

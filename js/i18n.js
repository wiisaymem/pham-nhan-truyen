'use strict';
// ───────────────────────── Ngôn ngữ (i18n)
// Mỗi chuỗi có một mã. Tiếng Việt gốc nằm ngay trong code (đối số thứ hai); LANG.vi chứa chữ Kent sửa lại,
// LANG.en là bản tiếng Anh. Thiếu mã thì dùng chữ gốc. Đổi ngôn ngữ = tải lại trang.
const LANG={vi:{},en:{}};
const LANG_LIST=[['vi','Tiếng Việt'],['en','English']];
const I18N_TOTAL=1241;
const LANG_KEY='vntt_lang';
let CUR_LANG=(()=>{try{const v=localStorage.getItem(LANG_KEY);if(v&&LANG[v])return v}catch(e){}return 'vi'})();
function i18nRaw(k){const L=LANG[CUR_LANG];if(L&&L[k]!=null&&L[k]!=='')return L[k];if(CUR_LANG!=='vi'&&LANG.vi[k])return LANG.vi[k];return null}
function i18n(k,vi){const v=i18nRaw(k);return v!=null?v:(LANG.vi[k]||vi)}
function i18nf(k,vi,...a){return i18n(k,vi).replace(/\{(\d)\}/g,(m,i)=>a[+i]??'')}
function setLang(l){try{localStorage.setItem(LANG_KEY,l)}catch(e){}location.reload()}

// ── Mã trong tài liệu "Chữ trong game" → chỗ lưu trong dữ liệu game
function i18nTarget(k){
  let m;const P=k.split('.');
  if(P[0]==='quai')return [ENEMY[P[1]],'n'];
  if(P[0]==='el')return [EL[P[1]],'n'];
  if(P[0]==='nh')return [NH[P[1]],P[2]==='ten'?'n':'d'];
  if(P[0]==='dongphu')return [DONGPHU[P[1]],P[2]?'d':'n'];
  if(P[0]==='phapbao')return [GEAR[P[1]],'n'];
  if(P[0]==='o')return [GSLOT.find(s=>s.id===P[1]),'n'];
  if(P[0]==='linhthu')return [PETS[P[1]],P[2]==='an'?'q':P[2]?'d':'n'];  // .an = điều kiện Ẩn Nhiệm mở linh thú độc nhất
  if(P[0]==='thap')return [TMODS.find(s=>s.id===P[1]),P[2]?'d':'n'];
  if(P[0]==='stat')return [STAT_N,P[1]];
  if(P[0]==='dh'&&typeof W_TITLE!=='undefined'&&W_TITLE[P[1]]&&P.length===2)return [W_TITLE,P[1]];
  if((m=/^pham(\d)$/.exec(k)))return [GRAR[+m[1]],'n'];
  if((m=/^canhgioi(\d)$/.exec(k)))return [REALMS[+m[1]],'n'];
  if((m=/^dotpha(\d)$/.exec(k))&&typeof BT_TXT!=='undefined')return [BT_TXT,+m[1]];
  const [id,f]=P;
  if(CHARS[id])return [CHARS[id],{ten:'n',loai:'t',dacdiem:'note'}[f]];
  if(WEAP[id]){if(f==='ten')return [WEAP[id],'n'];if(f==='thanthong')return [EVO[id],'n'];if(f==='thanthong_mota')return [EVO[id],'d'];if((m=/^cap(\d)$/.exec(f)))return [WEAP[id].d,+m[1]-1]}
  if(PASS[id])return [PASS[id],f==='ten'?'n':'d'];
  if(MAPS[id])return [MAPS[id],f==='ten'?'n':'d'];
  return null;
}
// áp chữ đã sửa (vi) và bản dịch (en) vào dữ liệu game — gọi một lần trước khi dựng giao diện
function i18nPatch(){
  const keys=new Set([...Object.keys(LANG.vi),...Object.keys(LANG[CUR_LANG]||{})]);
  for(const k of keys){const v=i18nRaw(k);if(v==null)continue;const T=i18nTarget(k);if(T&&T[0]&&T[1]!==undefined)T[0][T[1]]=v}
  document.documentElement.lang=CUR_LANG;
  for(const el of document.querySelectorAll('[data-i18n]')){const v=i18nRaw(el.dataset.i18n);if(v!=null)el.innerHTML=v}
}
// mức độ đã dịch của một ngôn ngữ (để hiện trong Cài đặt)
function i18nCoverage(l){const n=Object.keys(LANG[l]||{}).length;return l==='vi'?1:Math.min(1,n/(typeof I18N_TOTAL!=='undefined'?I18N_TOTAL:470))}

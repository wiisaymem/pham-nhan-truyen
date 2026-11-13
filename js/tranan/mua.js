'use strict';
// ───────────────────────── MÙA GIẢI và THƯỜNG (11/11/2026, Kent duyệt): kiểu Diablo, có 2 cõi chơi song song.
// • MÙA GIẢI ('mua'): mỗi quý (3 tháng) một mùa. Bắt đầu từ cấp 1, kho Pháp Bảo RIÊNG và trống. Có kỷ lục tầng của mùa.
// • THƯỜNG ('thuong'): không bao giờ reset. Kho Pháp Bảo là kho sẵn có của người chơi (SAVE.gear).
// Hết mùa: toàn bộ Pháp Bảo của mùa CHUYỂN VỀ kho Thường; cấp của từng tu sĩ ở Thường lấy mức cao hơn giữa hai bên; cấp, điểm kỹ năng, kỷ lục của mùa về đầu.
// Dùng chung cả hai cõi: linh thạch, Động Phủ, Linh Thú, Ký Ức.
// Lưu: SAVE.coi = 'mua'|'thuong' (cõi đang chọn) · SAVE.mua = {id:'2026Q4', ch:{}, gear:{items,eq,nid}, hist:[{id,best,hang,lt,lv}], moi (báo hết mùa, hiện một lần)} · SAVE.thg = {ch:{}}
//      ch[<tu sĩ>] = {lv, xp, best (tầng cao nhất đã vượt), bsec (số giây của lần vượt tầng đó), tree:{<id nút>:bậc}}
const MUA_LV=99;
// Hạng thưởng cuối mùa: [tầng cao nhất cần đạt, tên hạng, linh thạch thưởng]. Thêm / đổi mốc ở đây (chữ Anh: mua.hang.<số thứ tự>).
const MUA_HANG=[[3,'Đồng',200],[8,'Bạc',600],[15,'Vàng',1500],[25,'Ngọc',3500],[40,'Thiên',8000]];
const muaHang=best=>{let h=0;for(let i=0;i<MUA_HANG.length;i++)if(best>=MUA_HANG[i][0])h=i+1;return h};
const muaId=(d=new Date())=>d.getFullYear()+'Q'+(Math.floor(d.getMonth()/3)+1);
const muaEnd=()=>{const d=new Date();return new Date(d.getFullYear(),Math.floor(d.getMonth()/3)*3+3,1)};
const muaDays=()=>Math.max(0,Math.ceil((muaEnd()-Date.now())/864e5));
const muaName=()=>{const id=muaId();return i18nf('mua.ten','Mùa {0} năm {1}',id.slice(5),id.slice(0,4))};
const coi=()=>SAVE.coi==='mua'?'mua':'thuong';
function coiSet(c){SAVE.coi=c==='mua'?'mua':'thuong';saveSave()}
const coiName=()=>coi()==='mua'?i18nf('mua.coi.mua','Mùa giải · còn {0} ngày',muaDays()):i18n('mua.coi.thg','Thường');
function thgSave(){return SAVE.thg||(SAVE.thg={ch:{}})}
function muaSave(){let S=SAVE.mua;const id=muaId();
  if(!S||S.id!==id){const old=S;S=SAVE.mua={id,ch:{},gear:{items:[],eq:{},nid:1},hist:(old&&old.hist)||[]};
    if(old&&old.id){   // hết mùa: đồ về kho Thường, cấp Thường lấy mức cao hơn
      const G0=SAVE.gear||(SAVE.gear={items:[],eq:{},nid:1}),T=thgSave();let n=0;
      for(const it of(old.gear&&old.gear.items)||[]){it.id=G0.nid++;G0.items.push(it);n++}
      for(const ch in old.ch||{}){const a=old.ch[ch],b=T.ch[ch]||(T.ch[ch]={lv:1,xp:0,best:0,tree:{}});if((a.lv|0)>(b.lv|0)){b.lv=a.lv;b.xp=a.xp|0}b.best=Math.max(b.best|0,a.best|0)}
      const best=Math.max(0,...Object.values(old.ch||{}).map(c=>c.best|0)),hang=muaHang(best),lt=hang?MUA_HANG[hang-1][2]:0,lv={};
      for(const ch in old.ch||{})if((old.ch[ch].lv|0)>1)lv[ch]=old.ch[ch].lv|0;
      SAVE.lt=(SAVE.lt|0)+lt;S.hist.push({id:old.id,best,hang,lt,lv});if(S.hist.length>12)S.hist.shift();S.moi={id:old.id,gear:n,best,hang,lt}}   // thưởng cuối mùa + ghi lịch sử
    saveSave()}
  if(!S.gear)S.gear={items:[],eq:{},nid:1};
  return S}
function muaCh(ch){const L=coi()==='mua'?muaSave().ch:thgSave().ch;return L[ch]||(L[ch]={lv:1,xp:0,best:0,tree:{}})}
const muaNeed=lv=>Math.round(40*Math.pow(lv,1.6));
// cộng kinh nghiệm cho tu sĩ ở cõi đang chọn, trả về số cấp vừa lên
function muaXp(ch,v){const c=muaCh(ch);if(c.lv>=MUA_LV||!(v>0))return 0;c.xp+=v;let up=0;while(c.lv<MUA_LV&&c.xp>=muaNeed(c.lv)){c.xp-=muaNeed(c.lv);c.lv++;up++}return up}
const muaBest=()=>Math.max(0,...Object.values(coi()==='mua'?muaSave().ch:thgSave().ch).map(c=>c.best|0));

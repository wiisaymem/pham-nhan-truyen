'use strict';
// ───────────────────────── TRẤN ẤN LỘ · MÙA GIẢI: bảng xếp hạng, hạng thưởng, lịch sử, giới thiệu (js/tranan/bxh.js)
// • Bảng xếp hạng mùa nằm trên máy chủ (functions/api: POST /ladder, GET /ladder). Mỗi người một dòng mỗi mùa: tầng cao nhất + thời gian vượt tầng đó.
//   Chỉ cõi Mùa giải mới gửi điểm. Không có mạng thì vẫn chơi, điểm gửi bù khi mở lại màn Trấn Ấn Lộ.
// • Hạng thưởng cuối mùa: bảng MUA_HANG trong mua.js (đổi mốc / thưởng ở đó). Thưởng phát khi game thấy đã sang mùa mới (muaSave).
// • Thêm mục vào thẻ giới thiệu mùa: sửa mảng L trong showMua().
if(TA){
  const {ov,card}=TA;
  const css=document.createElement('style');
  css.textContent=`.bxh{width:min(94vw,460px);max-height:58vh;overflow-y:auto;background:linear-gradient(#fbf6ff,#eadcff);border:3px solid #b48cff;border-radius:14px;padding:6px 8px;box-shadow:0 4px 0 #2a1050;font:700 13.5px var(--font);color:#3a2460}
.bxh .r{display:grid;grid-template-columns:34px 1fr auto auto;gap:8px;align-items:center;padding:5px 4px;border-bottom:1px solid #d9c6ff}.bxh .r:last-child{border:0}.bxh .r.me{background:#ffe9a8;border-radius:8px}.bxh .r b{font-size:14.5px;color:#2a1050}.bxh .r small{display:block;font-size:11.5px;color:#7a5ab0}
.bxh .k{font:800 15px var(--font);text-align:center;color:#8a5ad0}.bxh .k.t1{color:#d49a00}.bxh .k.t2{color:#8a8fa0}.bxh .k.t3{color:#b06a3a}.bxh .t{font:800 15px var(--font);color:#5a2a9a;text-align:right}.bxh .s{font-size:12px;color:#7a5ab0;min-width:38px;text-align:right}.bxh p{margin:10px 6px;text-align:center}
.hang{display:inline-block;padding:1px 8px;border-radius:9px;font:800 12px var(--font);color:#fff;background:#8a8fa0;vertical-align:middle}.hang.h1{background:#b06a3a}.hang.h2{background:#8a8fa0}.hang.h3{background:#d49a00}.hang.h4{background:#2aa58a}.hang.h5{background:linear-gradient(90deg,#b48cff,#ff7ab0)}
@media (orientation:landscape) and (max-height:560px){.bxh{max-height:64vh;width:min(70vw,520px)}}`;
  document.head.appendChild(css);
  const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  const hangTag=i=>i?`<span class="hang h${i}">${i18n('mua.hang.'+i,MUA_HANG[i-1][1])}</span>`:'';
  const seasonName=id=>i18nf('mua.ten','Mùa {0} năm {1}',id.slice(5),id.slice(0,4));
  const close=()=>card('door','cave',i18n('ui.html.quayLai','Quay lại'),'','',()=>{ov.hidden=true});
  // ── gửi kỷ lục của mùa lên máy chủ (tu sĩ có tầng cao nhất; bằng tầng thì lấy lần nhanh hơn)
  let sent='';
  function gui(){
    if(typeof cloudOn!=='function'||!cloudOn())return;const S=muaSave();let top=null,who='';
    for(const ch in S.ch){const c=S.ch[ch];if(!(c.best>0))continue;if(!top||c.best>top.best||(c.best===top.best&&(c.bsec||300)<(top.bsec||300))){top=c;who=ch}}
    if(!top)return;const key=S.id+'|'+top.best+'|'+(top.bsec||300)+'|'+cloudSt.name;if(key===sent)return;
    api('/ladder',{method:'POST',body:{id:cloudSt.id,tok:cloudSt.tok,season:S.id,tier:top.best,sec:Math.max(15,Math.min(300,top.bsec||300)),ch:who,lv:top.lv|0,name:cloudSt.name}}).then(()=>{sent=key}).catch(()=>{});
  }
  // ── bảng xếp hạng (mùa đang chạy hoặc một mùa cũ)
  async function showLb(season){
    const S=muaSave(),id=season||S.id,cur=id===S.id;
    ov.innerHTML=`<h2>${i18n('bxh.ten','Xếp hạng mùa')}<small>${seasonName(id)}${cur?' · '+i18nf('bxh.con','còn {0} ngày',muaDays()):' · '+i18n('bxh.xong','đã kết thúc')}</small></h2>`;
    const box=document.createElement('div');box.className='bxh';box.innerHTML=`<p>${i18n('bxh.tai','Đang tải…')}</p>`;ov.appendChild(box);
    if(S.hist.length&&cur)ov.appendChild(card('','scroll',i18n('bxh.cu','Các mùa trước'),'',i18n('bxh.cud','Xem lại kỷ lục và phần thưởng của mình'),showHist));
    ov.appendChild(close());ov.hidden=false;
    if(typeof cloudOn!=='function'||!cloudOn()){box.innerHTML=`<p>${i18n('bxh.off','Bảng xếp hạng cần kết nối mạng.')}<br>${i18nf('bxh.minh','Kỷ lục của bạn mùa này: tầng {0}',cur?Math.max(0,...Object.values(S.ch).map(c=>c.best|0)):'?')}</p>`;return}
    try{if(cur)gui();const r=await api(`/ladder?season=${id}&id=${cloudSt.id}`);
      if(!r.rows.length){box.innerHTML=`<p>${cur?i18n('bxh.trong','Chưa ai lên bảng. Vượt tầng 1 ở cõi Mùa giải để ghi tên đầu tiên.'):i18n('bxh.trong2','Mùa này không có ai lên bảng.')}</p>`;return}
      const row=(k,x,me)=>`<div class="r${me?' me':''}"><span class="k t${k<=3?k:0}">${k}</span><span><b>${x.name.replace(/[<>&]/g,'')}</b><small>${CHARS[x.ch]?CHARS[x.ch].n:''} · ${i18nf('hd.cap2','Cấp {0}',x.lv)}</small></span><span class="t">${i18nf('ta.tang','Tầng {0}',x.tier)}</span><span class="s">${mmss(x.sec)}</span></div>`;
      let h=r.rows.map((x,i)=>row(i+1,x,x.me)).join('');
      if(r.me&&r.me.rank>r.rows.length)h+=row(r.me.rank,r.me,true);
      h+=`<p>${i18nf('bxh.tong','{0} người đã lên bảng mùa này',r.total)}${r.me?'':cur?'<br>'+i18n('bxh.chua','Bạn chưa có tên: chọn cõi Mùa giải và vượt một tầng.'):''}</p>`;box.innerHTML=h;
    }catch(e){box.innerHTML=`<p>${i18n('bxh.loi','Không kết nối được máy chủ. Thử lại sau.')}</p>`}
  }
  // ── lịch sử các mùa đã qua
  function showHist(){
    const S=muaSave();ov.innerHTML=`<h2>${i18n('bxh.cu','Các mùa trước')}<small>${i18n('bxh.cup','Kỷ lục và phần thưởng của bạn')}</small></h2>`;
    for(const h of S.hist.slice().reverse().slice(0,8))ov.appendChild(card('','seal',seasonName(h.id),'',`${h.best?i18nf('hd.kyluc2','cao nhất tầng {0}',h.best):i18n('ta.chua','chưa vượt tầng nào')} ${hangTag(h.hang)}${h.lt?`<em>${i18nf('mua.thuong','Thưởng cuối mùa: {0} linh thạch',h.lt)}</em>`:''}`,()=>showLb(h.id)));
    ov.appendChild(card('door','cave',i18n('ui.html.quayLai','Quay lại'),'','',()=>showLb()));ov.hidden=false;
  }
  // ── giới thiệu mùa + hạng thưởng
  function showMua(){
    const S=muaSave(),best=Math.max(0,...Object.values(S.ch).map(c=>c.best|0)),hg=muaHang(best),nx=MUA_HANG[hg];
    ov.innerHTML=`<h2>${seasonName(S.id)}<small>${i18nf('bxh.con','còn {0} ngày',muaDays())} · ${i18n('mua.gt0','mỗi mùa dài 3 tháng')}</small></h2>`;
    const L=[['seal',i18n('mua.gt1','Hai cõi chơi'),i18n('mua.gt1d','Mùa giải: ai cũng bắt đầu từ cấp 1 với kho Pháp Bảo trống, cùng leo bảng xếp hạng. Thường: cấp và đồ giữ mãi, không lên bảng.')],
      ['scroll',i18n('mua.gt2','Hết mùa thì sao?'),i18n('mua.gt2d','Cấp, điểm Bản Mệnh Đồ và kỷ lục của mùa về đầu. Toàn bộ Pháp Bảo của mùa chuyển sang kho Thường; cấp ở cõi Thường lấy mức cao hơn. Linh thạch, Linh Thú, Động Phủ, Ký Ức không đổi.')],
      ['chest',i18n('mua.gt3','Thưởng cuối mùa'),MUA_HANG.map((h,i)=>`${hangTag(i+1)} ${i18nf('mua.moc','tầng {0}: {1} linh thạch',h[0],h[2])}`).join('<br>')],
      ['trophy',i18n('mua.gt4','Hạng của bạn'),(hg?hangTag(hg)+' ':'')+(best?i18nf('hd.kyluc2','cao nhất tầng {0}',best):i18n('ta.chua','chưa vượt tầng nào'))+(nx?`<em>${i18nf('mua.them','Vượt tầng {0} để lên hạng {1}',nx[0],i18n('mua.hang.'+(hg+1),nx[1]))}</em>`:'')]];
    for(const [ic,n,d] of L){const c=card('',ic,n,'',d,()=>{});c.style.cursor='default';ov.appendChild(c)}
    ov.appendChild(close());ov.hidden=false;
  }
  // ── báo hết mùa (noi.js gọi khi về sảnh lần đầu sau khi sang mùa mới)
  function showHet(m){
    ov.innerHTML=`<h2>${i18nf('mua.het2','{0} đã kết thúc',seasonName(m.id))}<small>${i18n('mua.het3','Mùa mới bắt đầu: mọi người lại từ cấp 1')}</small></h2>`;
    const L=[['trophy',i18n('mua.gt4','Hạng của bạn'),(m.hang?hangTag(m.hang)+' ':'')+(m.best?i18nf('hd.kyluc2','cao nhất tầng {0}',m.best):i18n('ta.chua','chưa vượt tầng nào'))+(m.lt?`<em>${i18nf('mua.thuong','Thưởng cuối mùa: {0} linh thạch',m.lt)}</em>`:'')],
      ['chest',i18n('mua.het4','Pháp Bảo của mùa'),i18nf('mua.het','Mùa cũ đã kết thúc: {0} Pháp Bảo đã chuyển về kho Thường',m.gear)]];
    for(const [ic,n,d] of L){const c=card('',ic,n,'',d,()=>{});c.style.cursor='default';ov.appendChild(c)}
    ov.appendChild(card('door','cave',i18n('tin.ok','Đã hiểu'),'','',()=>{ov.hidden=true}));ov.hidden=false;
  }
  Object.assign(TA,{bxhGui:gui,showLb,showHist,showMua,showHet});
}

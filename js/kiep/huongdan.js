'use strict';
// ───────────────────────── Hướng dẫn người mới: mỗi hệ thống hiện một thẻ gợi ý ở lần đầu gặp. Không dừng trận, chạm để tắt.
const TOUCH=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
const HD={
  move:[i18n('hd.move.t','Cách chơi'),TOUCH?i18n('hd.move.d','Chạm và kéo ở bất kỳ đâu để di chuyển. Công pháp tự xuất chiêu, việc của bạn là né yêu quái.'):i18n('hd.move.dk','Dùng WASD hoặc phím mũi tên để di chuyển. Công pháp tự xuất chiêu, việc của bạn là né yêu quái.')],
  gem:[i18n('hd.gem.t','Linh khí'),i18n('hd.gem.d','Yêu quái rơi hạt linh khí. Nhặt đủ thì lên cấp và được chọn thẻ.')],
  lv:[i18n('hd.lv.t','Chọn thẻ'),i18n('hd.lv.d','Thẻ chưa có sẽ mở công pháp mới, thẻ đã có sẽ nâng cấp. Đổi thẻ để lấy bộ khác, Phong ấn để loại hẳn một thẻ khỏi trận.')],
  chest:[i18n('hd.chest.t','Bảo rương'),i18n('hd.chest.d','Mở rương được thêm một lượt chọn thẻ và 15 linh thạch. Boss luôn rơi rương.')],
  evo:[i18n('hd.evo.t','Thần thông'),i18n('hd.evo.d','Công pháp cấp 5 đi cùng đúng tâm pháp sẽ tiến hóa thành thần thông. Thẻ viền vàng chính là thẻ tiến hóa.')],
  burst:[i18n('hd.burst.t','Đại chiêu sẵn sàng'),TOUCH?i18n('hd.burst.d','Chạm nút tròn ở góc phải để tung đại chiêu. Đại chiêu nạp lại khi bạn hạ yêu quái.'):i18n('hd.burst.dk','Bấm Space để tung đại chiêu. Đại chiêu nạp lại khi bạn hạ yêu quái.')],
  realm:[i18n('hd.realm.t','Đột phá cảnh giới'),i18n('hd.realm.d','Mỗi lần đột phá được thêm máu, đại chiêu mạnh hơn, và có lúc mở thêm ô công pháp.')],
  nh:[i18n('hd.nh.t','Ngũ Hành'),i18n('hd.nh.d','Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim. Đánh đúng hệ mình khắc gây thêm 40% sát thương.')],
  rx:[i18n('hd.rx.t','Tương sinh'),i18n('hd.rx.d','Một hệ đánh dấu yêu quái, hệ được nó sinh ra đánh tiếp sẽ nổ Tương sinh. Mang công pháp nhiều hệ để nổ thường xuyên.')],
  boss:[i18n('hd.boss.t','Boss'),i18n('hd.boss.d','Boss đến ở phút 5, 10 và 15. Máu boss hiện ở trên cùng. Hạ boss luôn rơi bảo rương.')],
  kiep:[i18n('hd.kiep.t','Thiên Kiếp'),i18n('hd.kiep.d','Né các vòng sét trước khi chúng giáng xuống, rồi đánh tan Tâm Ma để phi thăng.')],
  pz:[i18n('hd.pz.t','Cơ quan bí ẩn'),i18n('hd.pz.d','Dấu ? trên bản đồ nhỏ là một cơ quan bí ẩn. Đến gần đọc gợi ý rồi giải. Giải xong có khi mở được cổng Bí cảnh.')],
  portal:[i18n('hd.portal.t','Cổng Bí cảnh'),i18n('hd.portal.d','Đứng vào cổng tím một lúc để bước vào. Trận ngoài vẫn chờ bạn quay lại.')],
  bc:[i18n('hd.bc.t','Bí cảnh'),i18n('hd.bc.d','Bí cảnh có giờ hạn đếm ngược. Hết giờ hoặc bước vào cổng ra là trở về trận.')],
  ky:[i18n('hd.ky.t','Mảnh ký ức'),i18n('hd.ky.d','Mỗi bản đồ giấu 6 mảnh ký ức trong Phế Tích. Ghép đủ thành một chương; đọc lại trong Bí Kíp.')],
  // ngoài sảnh
  dp:[i18n('hd.dp.t','Động Phủ'),i18n('hd.dp.d','Linh thạch kiếm được dùng để nâng cấp vĩnh viễn ở Động Phủ. Bế Quan để nhận linh thạch cả khi không chơi.')],
  dq:[i18n('hd.dq.t','Nhiệm Vụ Hằng Ngày'),i18n('hd.dq.d','Mỗi ngày có ba nhiệm vụ mới và quà điểm danh 7 ngày. Làm đủ ba nhiệm vụ nhận thêm Bảo Hạp.')],
  tl:[i18n('hd.tl.t','Tu Luyện'),i18n('hd.tl.d','Linh Thảo và Tinh Thiết rơi trong trận. Vào màn chọn tu sĩ để Tu Luyện từng người, tăng máu và sát thương.')],
  kv:[i18n('hd.kv.t','Kỳ Vật'),i18n('hd.kv.d','Bạn có Kỳ Vật đầu tiên. Chọn mang theo ở màn chọn tu sĩ, mỗi trận một món.')],
  canh:[i18n('hd.canh.t','Đôi cánh'),i18n('hd.canh.d','Cánh chỉ để trang trí. Đeo ở màn chọn tu sĩ, vào trận nhân vật sẽ bay xuống.')],
};
function hdSave(){if(!SAVE.hd)SAVE.hd={};return SAVE.hd}
const hdSeen=k=>!!hdSave()[k];
let hdQ=[],hdCur=null,hdT=0;
function hdEl(){let e=$('hdC');if(!e){e=document.createElement('div');e.id='hdC';e.hidden=true;e.onclick=()=>hdClose();document.body.appendChild(e)}return e}
function hdShow(k,pos){if(!HD[k]||hdSeen(k)||hdQ.some(q=>q.k===k)||(hdCur&&hdCur.k===k))return;hdQ.push({k,pos})}
function hdOpen(q){const [t,d]=HD[q.k],e=hdEl();hdCur=q;hdT=0;hdSave()[q.k]=1;saveSave();
  e.className='hdc '+(q.pos||'top');e.innerHTML=`<b>${t}</b><p>${d}</p><small>${i18n('hd.dong','Chạm để đóng')}</small>`;e.hidden=false;
  if(typeof sfx==='function')sfx('hint')}
function hdClose(){const e=$('hdC');if(e)e.hidden=true;hdCur=null}
function hdBusy(){return G&&(G.bt||G.cine||(G.kiep&&G.kiep.intro))}
function hdTick(dt){
  if(hdCur&&G&&G.over&&hdCur.pos!=='bot'){hdClose();hdQ=[];return}
  if(hdCur){if(!hdCur.hold||!G||!G.paused)hdT+=dt;const lvOpen=!$('lvup').hidden;
    if(hdCur.lv?!lvOpen:hdT>9)hdClose();return}
  if(!hdQ.length||hdBusy())return;hdOpen(hdQ.shift())}
function hdRun(){if(!G||G.over)return;const lvOpen=!$('lvup').hidden,ky=$('kyM');
  if(G.t>0.4)hdShow('move');
  if(G.t>9)hdShow('gem');
  if(lvOpen){const ev=typeof cards!=='undefined'&&cards&&cards.some(c=>c.t==='e');
    const k=ev&&!hdSeen('evo')?'evo':G.chestOpen&&!hdSeen('chest')?'chest':!hdSeen('lv')?'lv':null;
    if(k&&!hdCur&&!hdQ.length){hdQ.push({k,pos:innerWidth>innerHeight?'side':'bot',lv:1});}return}
  if(G.burst>=100)hdShow('burst');
  if(G.realm>0&&!G.bt)hdShow('realm');
  if(G.t>75)hdShow('nh');
  if(G.rx&&Object.keys(G.rx).length)hdShow('rx');
  if(G.boss&&!G.bc)hdShow('boss');
  if(G.kiep)hdShow('kiep');
  if(G.pz&&G.pz.some(M=>M.seen&&!M.solved))hdShow('pz');
  if(G.pz&&G.pz.some(M=>M.portal&&!M.done))hdShow('portal');
  if(G.bc)hdShow('bc');
  if(SAVE.ky&&Object.keys(SAVE.ky).length&&ky&&ky.hidden)hdShow('ky');
}
const _hudHD=hud;hud=function(dt){_hudHD(dt);try{hdRun();hdTick(dt)}catch(e){}};
// sảnh: mỗi lần về sảnh hiện tối đa một thẻ
function hdMenu(){if(G&&!G.over)return;const kvN=Object.keys(kvSave().own).length,wN=Object.keys(wingSave().own).length,m=matSave();
  const L=[['dp',SAVE.runs>=1],['dq',SAVE.runs>=2],['kv',kvN>0],['tl',m.thao+m.thiet>0],['canh',wN>0]];
  for(const [k,ok] of L)if(ok&&!hdSeen(k)){hdClose();hdQ=[];hdOpen({k,pos:'bot'});return}}
const _bmHD=buildMenu;buildMenu=function(){_bmHD();setTimeout(()=>{try{if(!$('menu').hidden)hdMenu()}catch(e){}},400)};
let hdLast=performance.now();(function hdLoop(t){const dt=Math.min(0.1,(t-hdLast)/1000);hdLast=t;if(hdCur&&(!G||G.over)){hdT+=dt;if(hdT>10||$('menu').hidden&&!G)hdClose()}requestAnimationFrame(hdLoop)})(hdLast);
// cài đặt: xem lại hướng dẫn
(function(){const fx=$('optFx');if(!fx)return;const row=fx.closest('.opt'),b=document.createElement('button');b.id='hdReset';b.className='btn alt hdr';b.textContent=i18n('hd.reset','Xem lại hướng dẫn');
  b.onclick=()=>{SAVE.hd={};saveSave();if(typeof sfx==='function')sfx('click');toast(i18n('hd.resetOk','Các thẻ hướng dẫn sẽ hiện lại'))};row.after(b)})();

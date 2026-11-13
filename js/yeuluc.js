'use strict';
// ───────────────────────── Yêu Lục trong Bí Kíp + lời truyện Kỳ Vật, Linh Thú (lấy từ wiki van-kiep-tu-tien-wiki)
// Chữ mặc định tiếng Việt ở đây; tiếng Anh ở js/lang/en.js (khóa yl.*, kv.*.lore, linhthu.*.lore).
const YL_TXT={
  thu:'Đào hang theo mạch đất linh khí; đất rung trước Thiên Kiếp là cả đàn bỏ tổ. Ít khi đi lẻ, cứ thế lao thẳng tới.',
  xa:'Ẩn dưới cỏ rậm, thân xanh như cỏ non. Vệt cỏ rạp và tiếng lá sột soạt báo nó đang trườn thẳng tới.',
  buc:'Trú trong khe đá tối, bay thành đàn khi hang bị khuấy động. Bay chập chờn, vượt qua mọi vật cản.',
  ho:'Lông đỏ như than hồng, ánh mắt dễ bị lầm là đốm lửa dẫn đường. Lượn ngoằn ngoèo, khó đoán bước kế.',
  thi:'Thi thể bị âm khí níu lại, chưa rõ ai đánh thức qua từng kiếp. Khi thân chùng xuống là sắp nhảy tới.',
  hon:'Tàn niệm lang thang nơi có người mất tích, đôi khi quên cả tên mình. Không thân xác, bay xuyên vật cản.',
  quy:'Mai sần như đá núi, bụi rơi mỗi lần chuyển mình. Chậm mà lì, phải đánh lâu mới vỡ mai.',
  matu:'Kẻ tu đường tà cưỡng đoạt linh lực. Biết giữ khoảng cách, vòng quanh rồi bắn từ xa.',
  chu:'Giăng tơ nơi cành thấp và hốc đá. Cứ vài nhịp thở lại nhả một vũng độc, đừng đứng lâu trên đó.',
  hoang:'Rình mồi nơi lối núi hẹp, tiếng gầm dội vách như cả bầy. Dừng lại gồng mình, rồi vồ thẳng một đường.',
  trung:'Giáp ánh kim, tụ quanh khoáng thạch. Giáp trước ngực nuốt phần lớn đòn đánh, hãy vòng ra sau lưng.',
  phien:'Mang lá phướn chiêu hồn quấn tà khí. Đứng xa, cứ vài giây hồi máu cho yêu quái quanh mình: hạ nó trước.',
  daoyeu:'Sinh từ gốc đào hút linh khí quá lâu, bóng lẫn giữa cánh hoa rơi. Lượn như bị gió cuốn khi tiến tới.',
  ongdoc:'Làm tổ trong thân cây rỗng ở Đào Hoa Cốc. Tiếng vo ve đến trước, đàn ong bay vượt vật cản tới sau.',
  mocnhan:'Hình nhân gỗ đào được linh khí lay động, thớ gỗ như nét khắc phai. Cứng, chậm, tiến thẳng.',
  sontieu:'Ẩn trong khe núi Vân Đỉnh, tiếng gọi qua sương lẫn với tiếng người. Nhảy từng quãng qua phiến đá.',
  hacyeu:'Lướt qua biển mây, bóng cánh in vách đá trước khi hiện thân. Hạc vốn là điềm lành, con này đã bị yêu hóa.',
  thachvien:'Leo vách đá dựng, lông phủ bụi núi. Khựng lại lấy đà là sắp lao: tránh sang ngang.',
  banghoho:'Để lại dấu chân nhỏ rồi khuất giữa sương lạnh Băng Cung. Chạy ngoằn ngoèo, khó lần theo.',
  tuyetyeu:'Kết hình từ tuyết và hàn khí, tan vào màn trắng khi gió nổi. Giữ khoảng cách, đánh từ xa.',
  nhamlang:'Trồi lên từ dung nham Hỏa Diệm Sơn. Thân co lại là dấu hiệu sắp bật nhảy.',
  hoalong:'Bám vách đá nóng, vảy sẫm hòa cùng tro. Chỉ lộ ra khi đã lượn sát người.',
  dungthach:'Khối đá được địa hỏa lay động, mỗi bước rơi mảnh nham thạch. Có vệt báo hướng trước cú lao.',
  banggiap:'Bò dưới tuyết cứng, giáp phủ sương. Xoay giáp về phía nguy hiểm: đánh trước mặt gần như vô ích.',
  cuuvi:'Hiện dưới trăng ở Đào Hoa Cốc, chín đuôi như lụa bạc. Nó gọi Tô Linh Nhi là cố nhân, và giữ một lời nhờ của Lâm Phong chưa ai hiểu.',
  long:'Yêu vật của biển xưa trong chuyện Lạc Long Quân trừ yêu. Không ai biết vì sao nó trỗi dậy giữa hồ băng đóng kín.',
  maton:'Thần nước không dâng lũ vì hận Sơn Tinh, mà để giữ vết nứt dưới hồ. Trận phút 15 là phép thử người kế nhiệm; hạ thần không phải giết thần.',
  tamma:'Bước ra từ bóng sáu pho tượng, mang mặt những người đã chết trong Thiên Kiếp. Nỗi tuyệt vọng của vô số lần thất bại.',
};
const KV_LORE={
  nothan:'Nỏ thần Kim Quy giúp An Dương Vương chế ở Cổ Loa. Khi Lâm Phong chạm vào, muôn mũi tên vàng cùng chỉ về một ngôi sao đỏ.',
  nieucom:'Chiếc niêu ăn mãi không hết của Thạch Sanh. Giữa Băng Cung nó gợi câu hỏi: một ngày đã mất có trả lại được như bữa cơm không?',
  gaythan:'Dị bản riêng của Phàm Nhân Tu Tiên, truyện Thạch Sanh gốc không có. Gậy không để đánh yêu mà để phá ảo ảnh.',
  ngusat:'Chiến mã của Thánh Gióng, nhận ra Lôi Chấn trước cả khi hắn nhận ra chính mình.',
  traucau:'Hộp trầu cau vẫn xanh giữa băng nghìn năm, trong có lá thư gửi sáu người. Ai viết thì chưa ai biết.',
};
const PET_LORE={
  linhho:'Lông trắng nổi giữa bụi cỏ, lanh lợi như hồ ly trong truyện cổ, nhưng chỉ dùng sự lanh lợi ấy để giữ chủ.',
  kimbuc:'Cánh sắc như lá kim loại, tiếng rít đến trước nhát cắt.',
  thanhlong:'Rồng nhỏ vảy xanh, lóe sáng mỗi khi tích lôi quang.',
  huyenquy:'Mai sẫm như đá dãi mưa gió, bền bỉ và điềm tĩnh.',
  cuuviho:'Ba đốm hồ hỏa xoay quanh thân như ngọn đèn không tắt.',
  chimlac:'Chim khắc trên trống đồng, người xưa theo cánh nó vượt sông dựng làng. Mắt nó thấy những dấu vết người thường bỏ sót.',
  kimquy:'Rùa vàng trong chuyện An Dương Vương, che chở người biết giữ lời hẹn.',
  ngugiong:'Vó gấp như trống thúc quân, để lại vệt lửa trên đường chạy.',
};
function ylSave(){if(!SAVE.yl)SAVE.yl={};return SAVE.yl}
// đếm số lần hạ mỗi loài (mở mục trong Yêu Lục)
const _keYL=killE;killE=function(e){if(!e.dead&&e.t&&ENEMY[e.t]){const S=ylSave();S[e.t]=(S[e.t]|0)+1}_keYL(e)};
// hình yêu quái cắt từ atlas
const YL_IMG={};
function ylImg(k,dark){const id=k+(dark?'_d':'');if(YL_IMG[id])return YL_IMG[id];const D=ENEMY[k];
  const sp=D&&(D.spr||(k==='tamma'&&'tamma'));if(!sp||typeof SPR==='undefined'||!ATLAS)return '';
  const m=SPR['e_'+sp+'_idle0']||SPR['e_'+sp+'_walk0']||SPR['e_'+sp+'_D0'];if(!m)return '';const r=m.r,S=Math.max(r[2],r[3])+2,c=mk(S,S),x=c.getContext('2d');
  x.drawImage(ATLAS,r[0],r[1],r[2],r[3],((S-r[2])/2)|0,((S-r[3])/2)|0,r[2],r[3]);
  if(dark){x.globalCompositeOperation='source-in';x.fillStyle='rgba(70,50,30,.55)';x.fillRect(0,0,S,S)}
  try{return YL_IMG[id]=c.toDataURL()}catch(_){return ''}}
function ylVung(k){if(typeof MAP_SPAWN!=='undefined')for(const m in MAP_SPAWN)if(MAP_SPAWN[m].some(s=>s[1]===k))return MAPS[m].n;
  if(ENEMY[k].boss)return i18n('yl.thulinh','Thủ lĩnh');return i18n('yl.moivung','Mọi vùng')}
const YL_ORDER=()=>{const b=[],n=[];for(const k in ENEMY)(ENEMY[k].boss?b:n).push(k);return n.concat(b)};
const _bkYL=buildBikip;
buildBikip=function(){_bkYL();const L=$('bkList'),S=ylSave(),ks=YL_ORDER();
  L.appendChild(elx('div','osec',i18nf('yl.t','Yêu Lục ({0}/{1})',ks.filter(k=>S[k]).length,ks.length)));
  for(const k of ks){const D=ENEMY[k],c=S[k]|0,im=ylImg(k,!c),col=D.el?EL[D.el]:null;
    L.appendChild(elx('div','bkrow bkyl'+(c?' seen':''),
      `<div class="bkf">${im?`<img src="${im}" alt="">`:'<b class="ylq">?</b>'}</div>`+
      `<div class="bke"><b>${c?D.n:'???'}</b><small${col?` style="color:${col.d}"`:''}>${col?col.n+' · ':''}${ylVung(k)}</small>`+
      `<p>${c?i18n('yl.'+k,YL_TXT[k]||''):i18n('yl.an','Chưa gặp. Hạ một con để ghi vào Yêu Lục.')}</p>`+
      `<i>${c?i18nf('yl.n','Đã hạ {0}',c):''}</i></div>`))}};
// lời truyện dưới Kỳ Vật đã có
const _bkKV=buildBikip;
buildBikip=function(){_bkKV();const S=kvSave();
  const rows=[...document.querySelectorAll('#bkList .bkkv')];KV_ORDER.forEach((k,i)=>{const r=rows[i];if(r&&S.own[k]&&KV_LORE[k]){const p=r.querySelector('.bke');if(p)p.appendChild(elx('p','bklore',i18n('kv.'+k+'.lore',KV_LORE[k])))}})};
// lời truyện linh thú
const _bpYL=buildPets;
buildPets=function(){_bpYL();document.querySelectorAll('#ptList .ptrow').forEach(r=>{const b=r.querySelector('b');if(!b)return;
  const k=Object.keys(PETS).find(x=>PETS[x].n===b.textContent.trim()),t=k&&PET_LORE[k];if(!t)return;
  const sm=r.querySelector('small'),lo=i18n('linhthu.'+k+'.lore',t);if(sm&&sm.textContent.trim()!==lo.trim())sm.insertAdjacentElement('afterend',elx('p','bklore',lo))})};   // mô tả đã trùng lời truyện thì không in hai lần

'use strict';
// ───────────────────────── Bước đi mượt cho nhân vật độ phân giải cao (10/2026)
// Bộ Cartoon đã bỏ (29/10/2026, Kent chọn giữ bộ Pixel độ phân giải cao). Lịch sử: docs/KE_HOACH_CARTOON.md.
// ── bước đi: chỉ có 2 khung bước (trái/phải), nên thêm nhún, co giãn và nghiêng bằng code cho mượt.
// Nhún thấp nhất đúng lúc đổi chân (khung 0 → 2), như đặt chân xuống. Không áp cho bóng mờ / tô màu của đại chiêu.
const _dpsGfx=drawPlayerSprite;
drawPlayerSprite=function(x,y,dir,anim,o={}){
  const id=CHARS[o.ch||G.ch].spr,m=SPR[`${id}_w_D0`];
  // áp cho bộ Pixel độ phân giải cao (ảnh nguồn cao hơn 60px; cũng chỉ có cặp khung bước)
  if(!m||!(m.smooth||m.r&&m.r[3]>60)||!anim||o.dieT!==undefined||o.tint)return _dpsGfx(x,y,dir,anim,o);
  const ph=anim/4*Math.PI*2,s=Math.abs(Math.sin(ph));   // 2 lần nhún mỗi chu kỳ 4 khung
  const bob=s*1.6,sy=1+0.035*(s-0.5)*2,sx=1-0.025*(s-0.5)*2;
  const tilt=dir==='R'?0.05:dir==='L'?-0.05:Math.sin(ph)*0.035;
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(sx,sy);
  _dpsGfx(0,-bob,dir,anim,o);ctx.restore()};

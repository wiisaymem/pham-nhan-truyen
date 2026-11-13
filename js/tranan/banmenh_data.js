'use strict';
// ───────────────────────── DỮ LIỆU BẢN MỆNH ĐỒ — nơi DUY NHẤT cần sửa khi thêm nội dung cây kỹ năng
//
// CÁCH THÊM NỘI DUNG
// • Thêm tu sĩ:   BM_DATA.<id tu sĩ trong CHARS> = {lore:'…', branches:[ … ]}
// • Thêm nhánh:   thêm 1 phần tử vào branches: {id:'vietTat', n:'Tên nhánh', tag:'nhãn · nhãn', lore:'ký ức của nhánh', nodes:[…], key:{…}}
//                 (màn hình tự chia cột theo số nhánh; luật "đủ nút thường mới lấy nút chốt" tự áp)
// • Thêm nút:     thêm 1 phần tử vào nodes (thứ tự trong mảng = thứ tự phải mở): {id, n:'Tên', ic:'mã hình', d:'Mô tả', mod:{…}, on:{…}, lore:'…'}
//                 id KHÔNG đổi sau khi phát hành (bộ người chơi đã lưu theo id). Xóa nút thì bộ cũ tự bỏ nút đó.
// • Hình nút:     không cần khai gì nếu đặt file theo quy ước ic_bm_<mã hình tu sĩ: lp/ln/hb/lc/md/bh>_<id nhánh><thứ tự nút 1..6>.png (cắt bằng tools/hoat_anh/cut_icons.py).
//                 Muốn chỉ định riêng thì thêm ic:'mã'. ic là mã hình trong atlas, bỏ tiền tố ic_ (ví dụ 'kiemkhi', 'p_bolt'). Hình mới: vẽ trên Flow, cắt vào tools/px/ic_<mã>.png rồi chạy tools/build_atlas.py.
// • Ấn cộng hưởng: nhánh khai hop:{<id ấn: kim/hoa/thuy/moc/tho/loi/tam/sat>:['mô tả ngắn',{mod}]}. Người chơi có từ 3 nút của nhánh và nhặt ấn đó trong chuyến thì mod được cộng.
// • Lore:         trường lore của tu sĩ / nhánh / nút là chữ hiện trong màn hình cây. Lore ở đây là ĐỀ XUẤT cho tới khi Kent duyệt và wiki ghi canon.
//
// mod — chỉ số cộng dồn (số), lõi đọc bằng bm('khóa'). Khóa đang được dùng:
//   atkSpd   Đánh nhanh hơn (0.15 = +15%)          atkDmg  sát thương Đánh (+%)        atkLen  thêm số nhát vào chuỗi Đánh
//   crit     tỉ lệ bạo kích (+)                     critM   hệ số bạo kích (+)          spd     tốc độ chạy (+%)        hp  máu tối đa (+%)
//   tkDmg    sát thương Tuyệt kỹ (+%)               tkCd    Tuyệt kỹ hồi nhanh (0.2 = −20%)
//   tpCd     Thân pháp hồi nhanh                    tpN     thêm lần lướt
//   w2Cd     Chiêu 2 hồi nhanh                      kiemAmt thêm số kiếm cho công pháp Kiếm     kiemP  kiếm xuyên thêm
//   (khóa tự đặt cũng được: nút khác đọc bằng bm('tênKhóa'))
//
// on — hàm chạy theo sự kiện, nhận (ctx, s). s là túi trạng thái tạm của trận (s.gìĐó tùy ý). Sự kiện:
//   atk   {i, fin, a, dmg, crit}   trước mỗi nhát Đánh; sửa ctx.dmg / ctx.crit được
//   atkHit{n, i, fin, a, first}    sau khi nhát Đánh trúng n quái
//   dash  {dx, dy}                 lúc bắt đầu lướt            skill {a, tg}   lúc bấm Tuyệt kỹ
//   kill  {e, src}                 mỗi khi hạ một quái (src: 'danh','tuyetky','thanphap', mã công pháp…)
//   tick  {dt}                     mỗi khung hình
//   atkOverride {dt, hold, H, A}   THAY nút Đánh (chỉ nút chốt; mỗi bộ chỉ 1 hàm có hiệu lực)
//   skillOverride {a, tg}          THAY Tuyệt kỹ
// Công cụ gọi được trong hàm: CDX.B() sát thương gốc · CDX.hitC(x,y,r,dmg,o,fn) đánh vùng tròn · CDX.fx({dur,u(f),o(f)}) hiệu ứng ·
//   CDX.later(giây,fn) · CDX.ghost(màu) · HDX.swing(a,i,dmg,fin,crit) một nhát chém · HDX.wave(a,{dmg,r,spd,life}) sóng chém · HDX.aim(tầm) · HDX.face(a,dur)
const BM_DATA={};

// ═════════ LÂM PHONG — Kiếm tu
BM_DATA.lamphong={
  lore:'Chín mươi chín lần qua Đào Hoa Cốc, hắn không nhớ đường về. Nhưng tay hắn nhớ kiếm.',
  branches:[
  {id:'tk',n:'Tật Kiếm',hop:{loi:['Đánh nhanh thêm 10%',{atkSpd:0.1}],sat:['bạo kích +5%',{crit:0.05}]},tag:'áp sát · tốc độ',lore:'Một kiếp hắn chỉ tin vào tốc độ: kiếm ra trước khi ý nghĩ kịp thành hình.',
   nodes:[
    {id:'1',n:'Khoái Kiếm',ic:'bm_lp_tk1',d:'Đánh nhanh hơn 15%.',mod:{atkSpd:0.15}},
    {id:'2',n:'Tứ Liên',ic:'bm_lp_tk2',d:'Chuỗi Đánh thêm 1 nhát trước đòn kết.',mod:{atkLen:1}},
    {id:'3',n:'Thừa Thế',ic:'bm_lp_tk3',d:'Sau khi lướt, 2 nhát Đánh kế tiếp chắc chắn bạo kích.',on:{dash(c,s){s.critN=2},atk(c,s){if(s.critN>0){s.critN--;c.crit=true}}}},
    {id:'4',n:'Huyết Chiến',ic:'bm_lp_tk4',d:'Hạ quái bằng Đánh giúp Thân pháp hồi nhanh thêm 0,4 giây.',on:{kill(c){if(c.src==='danh'&&G.cdx){const C=G.cdx.tp;if(C.n<C.max)C.t-=0.4}}}},
    {id:'5',n:'Kiếm Vũ',ic:'bm_lp_tk5',d:'Mỗi nhát trúng tăng 4% sát thương Đánh, cộng dồn 10 lần; ngừng đánh 2 giây thì mất.',
     on:{atkHit(c,s){if(c.n){s.vu=Math.min(10,(s.vu||0)+1);s.vuT=2}},atk(c,s){c.dmg*=1+0.04*(s.vu||0)},tick(c,s){if(s.vuT>0){s.vuT-=c.dt;if(s.vuT<=0)s.vu=0}}}}],
   key:{id:'k',n:'Vô Ảnh',ic:'bm_lp_tk6',d:'Cứ mỗi nhát Đánh thứ ba, kiếm chém thêm một lần nữa (70% sát thương).',lore:'"Ngươi thấy một đường kiếm. Thật ra là hai." Hắn nhớ ra câu ấy, mà không nhớ ai đã nói.',
    on:{atk(c,s){s.va=(s.va||0)+1;if(s.va%3===0&&typeof HDX!=='undefined'){const a=c.a,i=c.i,d=c.dmg*0.7;CDX.later(0.09,()=>{if(G&&!G.over&&!G.p.dead){CDX.ghost('#fff3c0',0.5);HDX.swing(a,i+1,d,false,c.crit)}})}}}}},
  {id:'nk',n:'Ngự Kiếm',hop:{kim:['kiếm khí mạnh thêm 50%',{khiDmg:0.5}],tam:['Chiêu 2 hồi nhanh thêm 15%',{w2Cd:0.15}]},tag:'tầm xa · phi kiếm',lore:'Một kiếp hắn không rút kiếm khỏi vỏ. Kiếm tự bay, còn hắn đứng nhìn.',
   nodes:[
    {id:'1',n:'Kiếm Khí',ic:'bm_lp_nk1',d:'Mỗi nhát Đánh phóng thêm một đạo kiếm khí bay xa (40% sát thương).',
     on:{atk(c){const P=G.p,n=c.fin&&bm('khiFan')?3:1,st=G.st;for(let j=0;j<n;j++){const a=c.a+(j-(n-1)/2)*0.22;G.pr.push({k:'sword',x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,vx:Math.cos(a)*330,vy:Math.sin(a)*330,dmg:c.dmg*0.4*(1+bm('khiDmg')),el:'kim',pierce:1+(st.kiemP||0),life:0.55,r:5,hit:[],gold:1})}}}},
    {id:'2',n:'Hộ Thân Kiếm',ic:'bm_lp_nk2',d:'Ba thanh kiếm xoay quanh người, chém yêu quái chạm phải.',
     on:{tick(c,s){const P=G.p;s.oa=(s.oa||0)+c.dt*3.2;s.ot=(s.ot||0)-c.dt;
       if(!s.ofx)s.ofx=CDX.fx({dur:1e9,o(f){f.t=1;if(G.p.dead)return;for(let j=0;j<3;j++){const a=s.oa+j*TAU/3;fxD('fx_sword',G.p.x+Math.cos(a)*27,G.p.y-9+Math.sin(a)*17,17,{rot:a+Math.PI/2})}}});
       if(s.ot<=0){s.ot=0.22;const o=G.src;G.src='danh';for(let j=0;j<3;j++){const a=s.oa+j*TAU/3,x=P.x+Math.cos(a)*27,y=P.y+Math.sin(a)*17;forNear(x,y,30,e=>{if(Math.hypot(e.x-x,e.y-y)<9+e.r&&!(e.bmO>G.t)){e.bmO=G.t+0.45;hurtE(e,CDX.B()*0.35,'kim',{kb:20})}})}G.src=o}}}},
    {id:'3',n:'Phi Kiếm Trận',ic:'bm_lp_nk3',d:'Chiêu 2 bắn thêm 2 kiếm và hồi nhanh hơn 20%.',mod:{kiemAmt:2,w2Cd:0.2}},
    {id:'4',n:'Xuyên Vân',ic:'bm_lp_nk4',d:'Kiếm khí và phi kiếm xuyên thêm 2 yêu quái.',mod:{kiemP:2}},
    {id:'5',n:'Kiếm Ý',ic:'bm_lp_nk5',d:'Kiếm khí mạnh thêm 40%; đòn kết phóng 3 đạo.',mod:{khiDmg:0.4,khiFan:1}}],
   key:{id:'k',n:'Vạn Kiếm Quy Tông',ic:'bm_lp_nk6',d:'Tuyệt kỹ đổi thành mưa kiếm: 18 thanh kiếm rơi xuống vùng mục tiêu trong 3 giây.',lore:'Hàng nghìn mũi tên vàng từng cùng chỉ về một ngôi sao đỏ. Kiếm của hắn cũng biết đường về như thế.',
    on:{skillOverride(c){const P=G.p,x0=c.tg?c.tg.x:P.x+Math.cos(c.a)*80,y0=c.tg?c.tg.y:P.y+Math.sin(c.a)*80;sfx('sword');
      CDX.fx({x:x0,y:y0,dur:3.2,u(f){const k=f.t/f.dur;fxD('fx_c_kiem',f.x,f.y,150,{alpha:0.5*Math.min(1,(1-k)*4),sq:0.6,rot:f.t*0.6})}});
      for(let j=0;j<18;j++){const t=0.15+j*0.16,an=rand()*TAU,d=Math.sqrt(rand())*70,x=x0+Math.cos(an)*d,y=y0+Math.sin(an)*d*0.7;
        CDX.fx({x,y,dl:t-0.22,dur:t+0.18,o(f){const u=(f.t-f.dl)/0.22;if(u<0)return;const k=Math.min(1,u);fxD('fx_gsword',f.x,f.y-22-(1-k)*120,46,{alpha:u>1?Math.max(0,1-(u-1)*3):1,rot:Math.PI});if(u>=1)glow(f.x,f.y,20,'#ffe9a0',0.5*Math.max(0,1-(u-1)*3))}});
        CDX.later(t,()=>{if(!G||G.over)return;const n=CDX.hitC(x,y,26,CDX.B()*0.9,{kb:20,kx:x,ky:y});if(n&&j%4===0){shake(0.15);sfx('hit')}})}}}}},
  {id:'kt',n:'Kiếm Tâm',hop:{sat:['sát thương bạo kích +40%',{critM:0.4}],thuy:['Thân pháp hồi nhanh thêm 15%',{tpCd:0.15}]},tag:'phản đòn · một nhát',lore:'Một kiếp hắn chỉ chém đúng một nhát mỗi trận. Phần còn lại là chờ.',
   nodes:[
    {id:'1',n:'Tĩnh Tâm',ic:'bm_lp_kt1',d:'Khi đứng yên, Tuyệt kỹ và Chiêu 2 hồi nhanh hơn 50%.',on:{tick(c){if(!G.p.mv&&G.cdx){G.cdx.tk.t-=c.dt*0.5;if(G.hd)G.hd.w2.t-=c.dt*0.5}}}},
    {id:'2',n:'Thấu Triệt',ic:'bm_lp_kt2',d:'Lướt khi yêu quái hoặc đạn đang áp sát: thời gian chậm lại gần 1 giây, nhát Đánh kế tiếp ×2,5 và bạo kích.',
     on:{dash(c,s){const P=G.p;let near=false;forNear(P.x,P.y,46,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<34+e.r)near=true});if(!near)for(const b of G.es)if(Math.hypot(b.x-P.x,b.y-P.y)<40){near=true;break}
        if(near){s.pk=3;G.bmSlow=0.9;flash('#cfe8ff',0.25);sfx('sense')}},
      atk(c,s){if(s.pk>0){s.pk=0;c.dmg*=2.5;c.crit=true}},tick(c,s){if(s.pk>0)s.pk-=c.dt}}},
    {id:'3',n:'Phá Chiêu',ic:'bm_lp_kt3',d:'Tuyệt kỹ mạnh thêm 40% và hồi nhanh hơn 15%.',mod:{tkDmg:0.4,tkCd:0.15}},
    {id:'4',n:'Tâm Nhãn',ic:'bm_lp_kt4',d:'Tỉ lệ bạo kích +10%, sát thương bạo kích +50%.',mod:{crit:0.1,critM:0.5}},
    {id:'5',n:'Dĩ Tĩnh Chế Động',ic:'bm_lp_kt5',d:'Đánh khi đang đứng yên mạnh thêm 30%.',on:{atk(c){if(!G.p.mv)c.dmg*=1.3}}}],
   key:{id:'k',n:'Nhất Kiếm',ic:'bm_lp_kt6',d:'Đổi nút Đánh: giữ để tụ lực (tới 1,2 giây), thả ra một nhát chém bay xuyên cả hầm. Tụ càng lâu càng mạnh.',lore:'Dưới gốc đào có tấm bia khắc tên hắn. Vết khắc chỉ một nhát, không sửa.',
    on:{atkOverride(c,s){const P=G.p,A=c.A;
      if(c.hold&&A.cd<=0){s.ch=Math.min(1.2,(s.ch||0)+c.dt);A.slow=0.12;
        if(!s.chFx||s.chFx.t>=s.chFx.dur)s.chFx=CDX.fx({dur:0.2,u(f){const k=(s.ch||0)/1.2;ctx.save();ctx.translate(G.p.x,G.p.y);ctx.scale(1,0.6);ring(0,0,34-k*22,'#ffe9a0',1+k*2.5,0.4+k*0.5);ctx.restore();ctx.globalAlpha=1;if(k>=1)glow(G.p.x,G.p.y-10,16,'#fff3c0',0.5)}});
        if(s.ch>0.15)HDX.face(HDX.aim(200),0.2)}
      else if(s.ch>0){const pw=s.ch;s.ch=0;if(A.cd>0)return;const a=HDX.aim(200),k=Math.min(1,pw/1.2),x={i:2,fin:true,a,dmg:CDX.B()*(1+0.22*(c.H.b.kim|0))*(1+bm('atkDmg'))*(pw<0.3?1:1.6+5.4*k),crit:false};
        bmEmit('atk',x);HDX.face(a,0.3);A.cd=pw<0.3?0.24:0.4;A.last=G.t;sfx('sword');
        if(pw<0.3)HDX.swing(a,0,x.dmg,false,x.crit);
        else{const c0=G.st.crit;if(x.crit)G.st.crit=1;HDX.wave(a,{dmg:x.dmg,r:24+k*16,spd:420,life:0.75,kb:60+k*120,spr:'fx_k_nhatkiem'});G.st.crit=c0;shake(0.2+k*0.3);CDX.ghost('#fff3c0',0.6);if(typeof buzz==='function')buzz(20+k*30)}}}}}}
  ]};

// ═════════ CÔNG CỤ DÙNG CHUNG CHO CÁC NÚT (thêm công cụ mới vào đây, đừng lặp code trong từng nút)
// Lõi cũng có: bmShield(máu) khiên · bmDot(quái,'doc'|'chay',dps,giây,tầngTốiĐa,hành) độc/cháy chồng tầng · bmDotN(quái,khóa)
// Sự kiện thêm: hurt {dmg} (sửa ctx.dmg) · lethal {save} (đặt save=true để không gục) · burst {} (bấm Bộc Phát)
const BX={
  B:()=>CDX.B(),
  pt(c,d=80){const P=G.p;return c.tg?[c.tg.x,c.tg.y]:[P.x+Math.cos(c.a)*d,P.y+Math.sin(c.a)*d]},
  heal(f){const P=G.p,h=Math.ceil(P.mhp*f),room=P.mhp-P.hp;P.hp=Math.min(P.mhp,P.hp+h);if(h>room&&bm('overShield'))bmShield(h-room)},
  each(x,y,r,fn){forNear(x,y,r+24,e=>{if(Math.hypot(e.x-x,e.y-y)<r+e.r)fn(e)})},
  hit(x,y,r,dmg,el,src,o,fn){const s=G.src;G.src=src||'bm';let n=0;BX.each(x,y,r,e=>{n++;hurtE(e,dmg,el,o||{});if(fn&&!e.dead)fn(e)});G.src=s;return n},
  ring(x,y,r,c,dur){CDX.fx({x,y,dur:dur||0.4,u(f){const k=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.58);ring(0,0,r*k,c,4*(1-k)+1,1-k);ctx.restore();ctx.globalAlpha=1}})},
  spr(k,x,y,size,dur,o={}){CDX.fx({x,y,dur:dur||0.4,o(f){const q=f.t/f.dur;fxD(k,f.x,f.y-(o.rise||0)*q,size*(o.grow?0.5+0.5*Math.min(1,q*5):1),{alpha:Math.min(1,(1-q)*3),add:o.add,rot:o.rot})}})},
  bolt(x,y,sz=56){BX.spr('fx_bolt',x,y-sz*0.45,sz,0.22,{add:1});glow(x,y,14,'#fff3a0',0.6)},
  // vùng tồn tại trên đất: o {x,y,r,dur,iv,act(o),draw(o,k)}
  zone(o){o.t=0;o.c=0;G.cdo.push({upd(dt){o.t+=dt;o.c-=dt;if(o.c<=0){o.c=o.iv||0.4;o.act(o)}return o.t<o.dur}});CDX.fx({dur:o.dur,u(f){o.draw(o,f.t/f.dur)}});return o},
  // vật triệu hồi đứng yên (cây gai, phân thân, bóng…): o {k,x,y,dur,iv,r,act(quái,o),draw(o)}
  pet(o){o.t=0;o.c=0.2;(G.bmPets||(G.bmPets=[])).push(o);G.cdo.push({upd(dt){o.t+=dt;o.c-=dt;if(o.c<=0){o.c=o.iv;const e=nearestE(o.x,o.y,o.r);if(e)o.act(e,o)}if(o.t>=o.dur)o.dead=1;if(o.dead)G.bmPets=G.bmPets.filter(p=>p!==o);return !o.dead}});
    CDX.fx({dur:1e9,o(f){if(o.dead){f.dur=0;return}f.t=1;o.draw(o)}});return o},
  pets:k=>(G.bmPets||[]).filter(p=>p.k===k&&!p.dead),
  // đạn tự tìm mục tiêu
  seek(o){const p={x:o.x,y:o.y,a:o.a??rand()*TAU,life:o.life||3,tg:null};G.cdo.push({upd(dt){p.life-=dt;if(!p.tg||p.tg.dead)p.tg=nearestE(p.x,p.y,260);if(p.tg){let d=Math.atan2(p.tg.y-6-p.y,p.tg.x-p.x)-p.a;d=Math.atan2(Math.sin(d),Math.cos(d));p.a+=Math.max(-8*dt,Math.min(8*dt,d));
        if(Math.hypot(p.tg.x-p.x,p.tg.y-6-p.y)<p.tg.r+6){const s=G.src,t=p.tg;G.src=o.src||'bm';hurtE(t,o.dmg,o.el,{kb:10});G.src=s;if(o.hit)o.hit(t);p.life=0}}
      p.x+=Math.cos(p.a)*(o.spd||170)*dt;p.y+=Math.sin(p.a)*(o.spd||170)*dt;return p.life>0}});
    CDX.fx({dur:(o.life||3)+0.1,o(f){if(p.life<=0){f.dur=0;return}glow(p.x,p.y,8,o.c||'#9fd8ff',0.5);fxD(o.spr,p.x,p.y,o.sz||14,{add:1})}});return p},
  ghostDraw(o,c,a){drawPlayerSprite(o.x,o.y,o.dir||'D',0,{tint:c,ta:0.75,alpha:a})}
};

// ═════════ TÔ LINH NHI — Đan tu
{const tree=(o)=>BX.pet({k:'cay',x:o.x,y:o.y,dur:bm('treeForever')?1e9:8*(1+0.5*bm('treeUp')),iv:0.7/(1+0.4*bm('treeUp')),r:130,
    act(e,t){const a=Math.atan2(e.y-6-t.y+10,e.x-t.x);G.pr.push({k:'bamboo',src:'caygai',x:t.x,y:t.y-10,vx:Math.cos(a)*260,vy:Math.sin(a)*260,dmg:BX.B()*0.45,el:'moc',pierce:0,life:0.6,r:4,hit:[]})},
    draw(t){const g=Math.min(1,t.t*3);fxD('fx_vine',t.x,t.y-14*g,30*g,{alpha:t.dur-t.t<1?t.dur-t.t:1})}});
  const plant=(x,y)=>{const L=BX.pets('cay'),cap=bm('treeForever')?4:6;if(L.length>=cap)L[0].dead=1;tree({x,y});sfx('vine')};
BM_DATA.linhnhi={lore:'Nàng tỉnh dậy với chiếc lông ngỗng hóa đá dưới gối, và đôi tay đã biết cách cứu người.',branches:[
  {id:'ds',n:'Dược Sư',hop:{moc:['máu tối đa +10%',{hp:0.1}],tho:['máu tối đa +10%',{hp:0.1}]},tag:'hồi phục · khiên',ic:'heal',lore:'Một kiếp nàng không giết một ai. Người ta bảo như thế là chưa đủ để giữ một cánh cửa.',nodes:[
    {id:'1',n:'Cam Lộ',d:'Mỗi viên đan trúng yêu quái hồi 0,5% máu.',on:{atkHit(c){if(c.n)BX.heal(0.005)}}},
    {id:'2',n:'Hộ Thể',d:'Máu hồi dư biến thành khiên (tối đa 30% máu).',mod:{overShield:1}},
    {id:'3',n:'Hoa Lộ',d:'Mỗi lần lướt hồi thêm 4% máu.',on:{dash(){BX.heal(0.04)}}},
    {id:'4',n:'Dưỡng Sinh',d:'Máu tối đa +20%.',mod:{hp:0.2}},
    {id:'5',n:'Diệu Thủ',d:'Tuyệt kỹ hồi thêm 15% máu và hồi nhanh hơn 20%.',mod:{tkCd:0.2},on:{skill(){BX.heal(0.15)}}}],
   key:{id:'k',n:'Hồi Xuân Trận',d:'Tuyệt kỹ để lại một trận 5 giây: đứng trong trận hồi 3% máu mỗi giây và không thể bị hạ.',lore:'Sáu cái tên viết bằng máu trên cửa đá cùng phát sáng. Nàng nhớ mình đã viết chúng nhiều hơn một lần.',
    on:{skill(c,s){const P=G.p;s.tr={x:P.x,y:P.y,t:5};CDX.fx({x:P.x,y:P.y,dur:5,u(f){const k=f.t/f.dur,al=Math.min(1,(1-k)*5);fxD('fx_k_hoixuan',f.x,f.y,132,{alpha:0.7*al,sq:0.6,rot:f.t*0.3});ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);ring(0,0,62,'#9ff0c8',2,0.8*al);ctx.restore();ctx.globalAlpha=1}})},
      tick(c,s){const T=s.tr;if(!T)return;T.t-=c.dt;if(T.t<=0){s.tr=null;return}if(Math.hypot(G.p.x-T.x,G.p.y-T.y)<62){T.h=(T.h||0)+c.dt;if(T.h>=0.5){T.h=0;BX.heal(0.015)}}},
      lethal(c,s){const T=s.tr;if(T&&Math.hypot(G.p.x-T.x,G.p.y-T.y)<62){c.save=true;G.p.hp=Math.max(G.p.hp,1)}}}}},
  {id:'dk',n:'Độc Kinh',hop:{hoa:['độc bốc cháy, mạnh thêm 50%',{docDmg:0.5}],kim:['độc chồng thêm 2 tầng',{docMax:2}]},tag:'độc · nổ dây chuyền',ic:'docchuong',lore:'Một kiếp nàng chép lại mọi thứ có thể giết người, để biết cách chữa. Cuốn sách ấy nàng không đốt.',nodes:[
    {id:'1',n:'Độc Đan',d:'Đan trúng yêu quái gây 1 tầng độc (tối đa 5 tầng, 4 giây).',on:{atkHit(c){if(c.first)bmDot(c.first,'doc',BX.B()*0.22*(1+bm('docDmg')),4+bm('docMax'),5+bm('docMax'),'moc')}}},
    {id:'2',n:'Hủ Cốt',d:'Độc mạnh thêm 40%.',mod:{docDmg:0.4}},
    {id:'3',n:'Lây Lan',d:'Yêu quái chết khi đang trúng độc lây toàn bộ tầng độc sang 2 con gần nhất.',on:{kill(c){const n=bmDotN(c.e,'doc');if(!n)return;let k=0;BX.each(c.e.x,c.e.y,70,e=>{if(e===c.e||e.dead||k>=2)return;k++;for(let i=0;i<n;i++)bmDot(e,'doc',BX.B()*0.22*(1+bm('docDmg')),4,5+bm('docMax'),'moc')});if(k)BX.ring(c.e.x,c.e.y,60,'#9aff5a',0.35)}}},
    {id:'4',n:'Kịch Độc',d:'Độc chồng tới 8 tầng và kéo dài hơn.',mod:{docMax:3}},
    {id:'5',n:'Độc Vụ',d:'Tuyệt kỹ phủ 3 tầng độc lên mọi yêu quái trong vùng.',on:{skill(c){const[x,y]=BX.pt(c);CDX.later(0.25,()=>BX.each(x,y,80,e=>{for(let i=0;i<3;i++)bmDot(e,'doc',BX.B()*0.22*(1+bm('docDmg')),4,5+bm('docMax'),'moc')}))}}}],
   key:{id:'k',n:'Vạn Độc Quy Nguyên',d:'Bấm Bộc Phát sẽ kích nổ toàn bộ độc trên màn hình: mỗi tầng độc gây một đợt sát thương lớn.',lore:'Cửu Vĩ quỳ xuống gọi nàng là cố nhân. Kẻ biết sợ nàng hẳn đã thấy kiếp này.',
    on:{burst(){const s=G.src;G.src='doc';let n=0;for(const e of G.e.slice()){const k=bmDotN(e,'doc');if(!k||e.dead)continue;n++;e.bmD.doc.n=0;BX.spr('fx_k_doc',e.x,e.y-6,38+k*6,0.4,{grow:1});hurtE(e,BX.B()*1.3*k,'moc',{rx:1})}G.src=s;if(n){shake(0.4);sfx('no')}}}}},
  {id:'dm',n:'Đằng Mạn',hop:{moc:['cây gai sống lâu và bắn nhanh hơn',{treeUp:1}],tam:['Tuyệt kỹ hồi nhanh thêm 15%',{tkCd:0.15}]},tag:'trói · gọi cây',ic:'vine',lore:'Một kiếp nàng trồng một khu rừng quanh cánh cửa, để không ai tìm thấy nó nữa.',nodes:[
    {id:'1',n:'Triền Nhiễu',d:'Đòn kết của chuỗi Đánh trói yêu quái 1 giây.',on:{atkHit(c){if(c.fin&&c.first&&!c.first.d.boss)c.first.rootT=Math.max(c.first.rootT,1)}}},
    {id:'2',n:'Gai Độc',d:'Đánh trúng yêu quái đang bị trói gây thêm 40% sát thương.',on:{atkHit(c){const e=c.first;if(e&&!e.dead&&e.rootT>0){const s=G.src;G.src='danh';hurtE(e,BX.B()*0.4,'moc',{rx:1});G.src=s}}}},
    {id:'3',n:'Gieo Hạt',d:'Mỗi 6 giây một cây gai mọc cạnh yêu quái gần nhất và bắn gai trong 8 giây.',on:{tick(c,s){s.gh=(s.gh||2)-c.dt;if(s.gh>0)return;const e=nearestE(G.p.x,G.p.y,150);if(!e){s.gh=0.5;return}s.gh=6;plant(e.x+(rand()-.5)*30,e.y+(rand()-.5)*20)}}},
    {id:'4',n:'Sinh Sôi',d:'Cây gai sống lâu hơn 50% và bắn nhanh hơn.',mod:{treeUp:1}},
    {id:'5',n:'Cổ Thụ',d:'Tuyệt kỹ làm mọc thêm 2 cây gai ở vùng mục tiêu.',on:{skill(c){const[x,y]=BX.pt(c);plant(x-22,y+8);plant(x+22,y-8)}}}],
   key:{id:'k',n:'Sâm Lâm',d:'Cây gai không còn tàn (tối đa 4 cây, đứng tới hết tầng); mỗi cây đang sống làm Đánh mạnh thêm 8%.',lore:'Dây leo nhớ đường hơn người. Chúng vẫn mọc về phía một cánh cửa nàng chưa từng thấy.',
    mod:{treeForever:1},on:{atk(c){c.dmg*=1+0.08*BX.pets('cay').length}}}}]}}

// ═════════ HÀN BĂNG — Băng tu
BM_DATA.hanbang={lore:'Mỗi đêm có tiếng gọi từ đáy hồ. Nàng chưa trả lời, nhưng băng thì đã nghe.',branches:[
  {id:'bt',n:'Băng Tiễn',hop:{kim:['tên xuyên thêm 1',{atkPierce:1}],sat:['sát thương bạo kích +40%',{critM:0.4}]},tag:'xạ thủ · vỡ băng',ic:'ice',lore:'Một kiếp nàng đứng trên tường thành và không để thứ gì tới gần.',nodes:[
    {id:'1',n:'Xuyên Giáp',d:'Băng tiễn xuyên thêm 2 yêu quái.',mod:{atkPierce:2}},
    {id:'2',n:'Tĩnh Xạ',d:'Đứng yên thì bắn nhanh hơn 25%.',on:{tick(c,s){s.aspd=G.p.mv?0:0.25}}},
    {id:'3',n:'Hàn Tâm',d:'Mỗi mũi tên trúng tỏa thêm một đợt hàn khí (40% sát thương).',on:{atkHit(c){const e=c.first;if(e&&!e.dead){const s=G.src;G.src='danh';hurtE(e,BX.B()*0.4,'thuy',{rx:1});G.src=s}}}},
    {id:'4',n:'Tam Tiễn',d:'Đòn kết bắn 3 mũi tên.',mod:{atkFanFin:2}},
    {id:'5',n:'Băng Tinh',d:'Tỉ lệ bạo kích +10%, sát thương bạo kích +60%.',mod:{crit:0.1,critM:0.6}}],
   key:{id:'k',n:'Toái Băng',d:'Yêu quái chết khi đang chậm hoặc đóng băng sẽ vỡ tung, mảnh băng gây sát thương cho cả cụm quanh nó.',lore:'Tấm gương lớn vỡ ra hàng vạn cảnh lặp lại. Nàng nhớ tiếng vỡ ấy rõ hơn nhớ tên mình.',
    on:{kill(c,s){const e=c.e;if(!(e.slowT>0||e.rootT>0)||c.src==='toaibang'&&(s.tb=(s.tb||0)+1)>6)return;if(c.src!=='toaibang')s.tb=0;BX.spr('fx_k_toaibang',e.x,e.y-8,58,0.4,{grow:1});CDX.later(0.08,()=>{if(G&&!G.over)BX.hit(e.x,e.y,46,BX.B()*1.5,'thuy','toaibang',{kb:40,kx:e.x,ky:e.y},q=>{q.slowT=Math.max(q.slowT,1.5)})})}}}},
  {id:'sg',n:'Sương Giới',hop:{thuy:['Thân pháp hồi nhanh thêm 20%',{tpCd:0.2}],tam:['Tuyệt kỹ hồi nhanh thêm 15%',{tkCd:0.15}]},tag:'khống chế · đóng băng',ic:'hanbangthuong',lore:'Một kiếp nàng giữ cả một mùa đông đứng yên, để thời gian khỏi vỡ.',nodes:[
    {id:'1',n:'Hàn Khí',d:'Hào quang lạnh quanh người làm chậm yêu quái tới gần.',on:{tick(c,s){s.hk=(s.hk||0)-c.dt;if(s.hk>0)return;s.hk=0.3;const P=G.p,deep=bm('thamHan');BX.each(P.x,P.y,58,e=>{e.slowT=Math.max(e.slowT,0.8);if(deep&&!e.d.boss){e.bmC=(e.bmC||0)+0.3;if(e.bmC>=3){e.bmC=-2;e.rootT=Math.max(e.rootT,1.5);BX.spr('fx_is0',e.x,e.y-8,30,0.5,{grow:1})}}});
        if(!s.hkFx)s.hkFx=CDX.fx({dur:1e9,u(f){f.t=1;const P=G.p;ctx.save();ctx.translate(P.x,P.y);ctx.scale(1,0.6);ring(0,0,58,'#bfe8ff',1,0.25+0.1*Math.sin(G.t*3));ctx.restore();ctx.globalAlpha=1}})}}},
    {id:'2',n:'Băng Lộ',d:'Lướt làm đóng băng 1 giây mọi yêu quái quanh điểm xuất phát.',on:{dash(){const P=G.p;BX.ring(P.x,P.y,56,'#bfe8ff');BX.each(P.x,P.y,56,e=>{if(e.d.boss)e.slowT=Math.max(e.slowT,1.5);else e.rootT=Math.max(e.rootT,1)});sfx('freeze')}}},
    {id:'3',n:'Thâm Hàn',d:'Yêu quái ở trong Hàn Khí đủ 3 giây bị đóng băng 1,5 giây.',mod:{thamHan:1}},
    {id:'4',n:'Bền Băng',d:'Tuyệt kỹ hồi nhanh hơn 25%.',mod:{tkCd:0.25}},
    {id:'5',n:'Vĩnh Đông',d:'Đánh trúng yêu quái đang đóng băng gây thêm 50% sát thương.',on:{atkHit(c){const e=c.first;if(e&&!e.dead&&e.rootT>0){const s=G.src;G.src='danh';hurtE(e,BX.B()*0.5,'thuy',{rx:1});G.src=s}}}}],
   key:{id:'k',n:'Tuyệt Đối Linh Độ',d:'Tuyệt kỹ đổi thành: đóng băng toàn bộ yêu quái quanh mình 2,5 giây và gây sát thương lớn.',lore:'Thủy Tinh dâng nước vì thứ nằm dưới đất sắp thức. Có một kiếp, nàng là người bảo ông ấy đừng dừng.',
    on:{skillOverride(){const P=G.p;sfx('freeze');flash('#cfefff',0.45);shake(0.4);CDX.fx({x:P.x,y:P.y,dur:1,u(f){const k=f.t/f.dur;fxD('fx_k_linhdo',f.x,f.y,120+k*300,{alpha:0.9*(1-k),sq:0.6,rot:k*0.8})}});
      const s=G.src;G.src='tuyetky';for(const e of G.e.slice()){if(e.dead||Math.hypot(e.x-P.x,e.y-P.y)>270)continue;BX.spr('fx_is1',e.x,e.y-10,34,2.4,{grow:1});hurtE(e,BX.B()*2*(1+bm('tkDmg')),'thuy',{rx:1});if(!e.dead){if(e.d.boss)e.slowT=Math.max(e.slowT,3.5);else e.rootT=Math.max(e.rootT,2.5)}}G.src=s;cdHS(0.1)}}}},
  {id:'ng',n:'Ngân Giáp',hop:{tho:['giáp băng hồi nhanh hơn 2 giây',{agCd:2}],kim:['Đánh mạnh thêm 15%',{atkDmg:0.15}]},tag:'đỡ đòn · phản đạn',ic:'thuykinh',lore:'Bóng dưới hồ mặc giáp bạc. Nàng chưa biết đó là ai, chỉ biết bộ giáp vừa với mình.',nodes:[
    {id:'1',n:'Băng Giáp',d:'Cứ 8 giây có một lớp giáp băng chặn hoàn toàn 1 đòn.',on:{tick(c,s){if(!s.ag){s.agT=(s.agT??1)-c.dt;if(s.agT<=0){s.ag=1;sfx('ice')}}
        if(!s.agFx)s.agFx=CDX.fx({dur:1e9,o(f){f.t=1;if(!s.ag||G.p.dead)return;fxD('fx_icemirror',G.p.x,G.p.y-13,34,{alpha:0.45+0.1*Math.sin(G.t*4)})}})},
      hurt(c,s){if(s.ag&&c.dmg>0){c.dmg=0;s.ag=0;s.agT=8-bm('agCd');sfx('freeze');BX.ring(G.p.x,G.p.y,40,'#e8f8ff',0.3);bmEmit('giapvo',{})}}}},
    {id:'2',n:'Phản Hàn',d:'Giáp vỡ làm đóng băng 1,5 giây mọi yêu quái quanh người.',on:{giapvo(){const P=G.p;BX.hit(P.x,P.y,62,BX.B()*0.8,'thuy','bm',{kb:60},e=>{if(e.d.boss)e.slowT=Math.max(e.slowT,2);else e.rootT=Math.max(e.rootT,1.5)});BX.spr('fx_c_bang',P.x,P.y,120,0.5)}}},
    {id:'3',n:'Kính Băng',d:'Lướt xóa mọi viên đạn của yêu quái quanh người.',on:{dash(){const P=G.p;let n=0;for(const b of G.es)if(Math.hypot(b.x-P.x,b.y-P.y)<70){b.dead=true;n++}if(n)BX.ring(P.x,P.y,70,'#e8f8ff',0.3)}}},
    {id:'4',n:'Cố Thủ',d:'Giảm 12% sát thương phải nhận; giáp băng hồi nhanh hơn 3 giây.',mod:{agCd:3},on:{hurt(c){c.dmg*=0.88}}},
    {id:'5',n:'Ngân Quang',d:'Khi giáp băng còn nguyên, Đánh mạnh thêm 25%.',on:{atk(c,s){if(s.ag)c.dmg*=1.25}}}],
   key:{id:'k',n:'Bóng Nữ Tướng',d:'Khi giáp băng vỡ, một bóng giáp bạc hiện ra 5 giây và chém yêu quái ở gần.',lore:'Bóng ấy không nói. Nó chỉ đứng chắn phía trước, như đã làm việc này rất nhiều lần.',
    on:{giapvo(){const P=G.p;sfx('sword');BX.pet({k:'bong',x:P.x+14,y:P.y,dir:P.dir,dur:5,iv:0.5,r:90,act(e,o){o.x+=(e.x-o.x)*0.5;o.y+=(e.y-o.y)*0.5+2;o.dir=CDX.dirOf(Math.atan2(e.y-o.y,e.x-o.x));BX.hit(e.x,e.y,34,BX.B()*1.2,'thuy','bm',{kb:40});BX.spr('fx_sl1',e.x,e.y-8,50,0.16,{add:1,rot:rand()*TAU})},
        draw(o){const al=Math.min(0.9,(o.dur-o.t)*2,o.t*4);if(!fxD('fx_k_nutuong',o.x,o.y-20,50,{alpha:al,flip:(o.dir||'R').includes('L')}))BX.ghostDraw(o,'#dff4ff',al)}})}}}}]};

// ═════════ LÔI CHẤN — Thể tu
{const thunder=(e,depth)=>{if(!e||e.dead)return;const d=BX.B()*(1+bm('loiDmg')),st=bm('loiStun');BX.bolt(e.x,e.y);const s=G.src;G.src='loi';hurtE(e,d,'kim',{rx:1});G.src=s;if(st&&!e.dead&&!e.d.boss)e.rootT=Math.max(e.rootT,st);
    let n=bm('loiJump')|0,last=e;const seen=new Set([e]);while(n-->0){let nx=null,bd=90*90;for(const q of G.e){if(q.dead||seen.has(q))continue;const dd=(q.x-last.x)**2+(q.y-last.y)**2;if(dd<bd){bd=dd;nx=q}}if(!nx)break;seen.add(nx);const a=nx;CDX.later(0.06*seen.size,()=>{if(!G||G.over||a.dead)return;BX.bolt(a.x,a.y,44);const s2=G.src;G.src='loi';hurtE(a,d*0.7,'kim',{rx:1});G.src=s2;if(st&&!a.dead&&!a.d.boss)a.rootT=Math.max(a.rootT,st)});last=nx}sfx('zap')};
  if(typeof SRC_N!=='undefined'){SRC_N.loi=['Lôi Kình','bolt'];SRC_N.caygai=['Cây Gai','vine']}
BM_DATA.loichan={lore:'Đứng trước trống đồng, tay hắn run như gặp lại cố nhân. Thân thể nhớ những điều đầu óc đã quên.',branches:[
  {id:'kc',n:'Kim Chung',hop:{tho:['máu tối đa +15%',{hp:0.15}],moc:['máu tối đa +10%',{hp:0.1}]},tag:'chống chịu · phản đòn',ic:'bell',lore:'Một kiếp hắn không lùi một bước nào. Người ta đắp tượng hắn ở đúng chỗ ấy.',nodes:[
    {id:'1',n:'Thiết Bố Sam',d:'Giảm 12% sát thương phải nhận.',on:{hurt(c){c.dmg*=0.88}}},
    {id:'2',n:'Phản Chấn',d:'Bị đánh thì chấn ngược lại yêu quái quanh người (hồi 1 giây).',on:{hurt(c,s){if(c.dmg<=0||(s.pc||0)>G.t)return;s.pc=G.t+1;const P=G.p;BX.ring(P.x,P.y,50,'#ffd45a',0.3);BX.hit(P.x,P.y,50,BX.B()*0.8,'kim','bm',{kb:120})}}},
    {id:'3',n:'Nộ Khí',d:'Mỗi lần bị đánh, Đánh mạnh thêm 6% (tối đa 5 tầng, giữ 6 giây).',on:{hurt(c,s){if(c.dmg>0){s.no=Math.min(5,(s.no||0)+1);s.noT=6}},atk(c,s){c.dmg*=1+0.06*(s.no||0)},tick(c,s){if(s.noT>0){s.noT-=c.dt;if(s.noT<=0)s.no=0}}}},
    {id:'4',n:'Kiên Cố',d:'Máu tối đa +25%.',mod:{hp:0.25}},
    {id:'5',n:'Chung Minh',d:'Tuyệt kỹ hồi nhanh hơn 25% và hồi 10% máu.',mod:{tkCd:0.25},on:{skill(){BX.heal(0.1)}}}],
   key:{id:'k',n:'Bất Động Như Sơn',d:'Đứng yên 1 giây thì thành bất hoại (tối đa 3 giây mỗi lần). Sát thương chặn được dồn lại, lúc bước đi sẽ phát ra thành một cú chấn.',lore:'Sáu pho tượng đứng quanh cửa. Hắn nhìn pho thứ tư rất lâu.',
    on:{tick(c,s){const P=G.p;if(!P.mv){s.st=(s.st||0)+c.dt}else{if(s.pool>0){const d=BX.B()*1.5+s.pool*4;BX.ring(P.x,P.y,95,'#ffe48a',0.45);BX.hit(P.x,P.y,95,d,'kim','bm',{kb:200});shake(0.5);sfx('no');cdHS(0.08)}s.st=0;s.pool=0}
        if(!s.bdFx)s.bdFx=CDX.fx({dur:1e9,o(f){f.t=1;if(s.st>=1&&s.st<4&&!G.p.dead){glow(G.p.x,G.p.y-12,26,'#ffd45a',0.3);fxD('fx_k_son',G.p.x,G.p.y-16,58,{alpha:0.5})}}})},
      hurt(c,s){if(s.st>=1&&s.st<4&&c.dmg>0){s.pool=Math.min(G.p.mhp,(s.pool||0)+c.dmg);c.dmg=0;sfx('bell')}}}}},
  {id:'lq',n:'Lôi Quyền',hop:{loi:['sét mạnh thêm 50%',{loiDmg:0.5}],kim:['sét nhảy thêm 1 yêu quái',{loiJump:1}]},tag:'sét lan · choáng',ic:'loiquyen',lore:'Một kiếp sấm sét hóa thành giáp quanh người hắn. Hắn không nhớ mình đã xin, hay đã được cho.',nodes:[
    {id:'1',n:'Lôi Kình',d:'Đòn kết của chuỗi Đánh gọi sét đánh xuống mục tiêu.',on:{atkHit(c){if(c.fin&&c.first)thunder(c.first)}}},
    {id:'2',n:'Liên Hoàn Lôi',d:'Sét nhảy sang thêm 3 yêu quái gần đó.',mod:{loiJump:3}},
    {id:'3',n:'Chấn Nhiếp',d:'Yêu quái trúng sét bị choáng 0,8 giây.',mod:{loiStun:0.8}},
    {id:'4',n:'Lôi Tốc',d:'Đánh nhanh hơn 18%.',mod:{atkSpd:0.18}},
    {id:'5',n:'Cuồng Lôi',d:'Sét mạnh thêm 60%.',mod:{loiDmg:0.6}}],
   key:{id:'k',n:'Cửu Thiên Lôi',d:'Cứ 9 nhát Đánh trúng, một cột sét lớn giáng xuống, đánh cả vùng quanh mục tiêu.',lore:'Tiếng trống thứ chín vang lên bằng chính giọng hắn, già hơn ngàn năm.',
    on:{atkHit(c,s){if(!c.n||!c.first)return;s.c9=(s.c9||0)+1;if(s.c9<9)return;s.c9=0;const e=c.first,x=e.x,y=e.y;BX.spr('fx_lpillar',x,y-60,130,0.4,{add:1});BX.bolt(x,y,90);BX.ring(x,y,64,'#fff3a0',0.4);const s2=G.src;G.src='loi';BX.hit(x,y,64,BX.B()*4*(1+bm('loiDmg')),'kim','loi',{kb:90,kx:x,ky:y},q=>{if(!q.d.boss)q.rootT=Math.max(q.rootT,1)});G.src=s2;shake(0.5);sfx('thunder');cdHS(0.09)}}}},
  {id:'tk',n:'Thiết Kỵ',hop:{thuy:['lướt xa thêm 30%',{tpLen:0.3}],loi:['chạy nhanh thêm 10%',{spd:0.1}]},tag:'xung phong · đà chạy',ic:'sum_hammer',lore:'Một kiếp hắn cưỡi thứ gì đó bằng sắt phá một cánh cổng. Ai cưỡi ai, hắn vẫn chưa nhớ ra.',nodes:[
    {id:'1',n:'Xung Phong',d:'Thân pháp lướt xa hơn 40% và húc mạnh gấp đôi.',mod:{tpLen:0.4,tpDmg:1}},
    {id:'2',n:'Đà Chạy',d:'Chạy liên tục tích đà: nhát Đánh đầu tiên sau đó mạnh tới gấp đôi.',on:{tick(c,s){s.da=G.p.mv?Math.min(1,(s.da||0)+c.dt*0.5):Math.max(0,(s.da||0)-c.dt)},atk(c,s){if(s.da>0.15){c.dmg*=1+s.da;s.da=0}}}},
    {id:'3',n:'Thiết Đề',d:'Lướt xong giẫm một cú chấn rộng, làm choáng 1 giây.',on:{dash(){CDX.later(0.24,()=>{if(!G||G.over)return;const P=G.p;BX.ring(P.x,P.y,62,'#ffe48a');BX.hit(P.x,P.y,62,BX.B()*0.9,'kim','thanphap',{kb:80},e=>{if(!e.d.boss)e.rootT=Math.max(e.rootT,1)})})}}},
    {id:'4',n:'Dũng Mãnh',d:'Chạy nhanh hơn 12% và có thêm 1 lần lướt.',mod:{spd:0.12,tpN:1}},
    {id:'5',n:'Phá Trận',d:'Mỗi yêu quái bị hạ giúp Thân pháp hồi nhanh thêm 0,5 giây.',on:{kill(){if(G.cdx){const C=G.cdx.tp;if(C.n<C.max)C.t-=0.5}}}}],
   key:{id:'k',n:'Ngựa Sắt',d:'Tuyệt kỹ đổi thành: lao đi 4 giây, chạy nhanh gấp đôi, bất hoại, giẫm nát yêu quái trên đường.',lore:'Đặt tay lên Ngựa Sắt, sấm hóa thành chiến giáp. Nó nhận ra hắn trước khi hắn nhận ra nó.',
    on:{skillOverride(c,s){s.ride=4;sfx('roar');shake(0.3);if(!s.rdFx)s.rdFx=CDX.fx({dur:1e9,u(f){f.t=1;const P=G.p;if(!(s.ride>0)||P.dead)return;fxD('fx_k_nguasat',P.x,P.y-15+Math.sin(G.t*22)*1.5,62,{alpha:0.85,flip:(P.fx||0)<0})}})},
      tick(c,s){if(!(s.ride>0))return;const P=G.p;s.ride-=c.dt;P.inv=Math.max(P.inv,0.2);if(P.mv){P.x+=P.vx*c.dt;P.y+=P.vy*c.dt;collideObs(P,P.r)}s.rg=(s.rg||0)-c.dt;if(s.rg<=0){s.rg=0.07;CDX.ghost('#ffd45a',0.55)}
        s.rh=(s.rh||0)-c.dt;if(s.rh<=0){s.rh=0.22;const n=BX.hit(P.x,P.y,36,BX.B()*1.2*(1+bm('tkDmg')),'kim','tuyetky',{kb:150});if(n)shake(0.15)}if(s.ride<=0){BX.ring(P.x,P.y,70,'#ffe48a');BX.hit(P.x,P.y,70,BX.B()*2,'kim','tuyetky',{kb:180});sfx('no')}}}}}]}}

// ═════════ MỘ DUNG YÊN — Phù sư
{const bang=(x,y,mul,src)=>{const r=28*(1+bm('boomR'));BX.spr('fx_ex'+((rand()*2)|0),x,y-4,r*2.4,0.3,{add:1});return BX.hit(x,y,r,BX.B()*mul*(1+bm('boomDmg')),'hoa',src||'no',{kb:30,kx:x,ky:y})};
  const trap=(x,y)=>{const L=BX.pets('bay');if(L.length>=6)L[0].dead=1;BX.pet({k:'bay',x,y,dur:14,iv:0.15,r:20,act(e,o){o.dead=1;bang(o.x,o.y,1.4*(1+0.4*bm('trapUp')),'bay');sfx('no');const st=bm('trapStun');if(st)BX.each(o.x,o.y,34,q=>{if(!q.d.boss)q.rootT=Math.max(q.rootT,st)})},
      draw(o){const p=0.5+0.5*Math.sin(G.t*5+o.x);ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.6);ring(0,0,9+p*2,'#ff7a2a',1,0.6);ctx.restore();ctx.globalAlpha=1;fxD('fx_tali',o.x,o.y-3,15,{rot:1.2,alpha:0.9})}})};
  const burn=e=>bmDot(e,'chay',BX.B()*0.2*(1+bm('chayDmg')),4,3+bm('chayMax'),'hoa');
  const fire=(x,y,r,dur)=>BX.zone({x,y,r,dur,iv:0.4,act(o){BX.each(o.x,o.y,o.r,e=>{burn(e);const s=G.src;G.src='chay';hurtE(e,BX.B()*0.25,'hoa',{rx:1});G.src=s})},draw(o,k){const al=Math.min(1,(1-k)*4);ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.6);ctx.globalAlpha=0.22*al;ctx.fillStyle='#ff5a1a';ctx.beginPath();ctx.arc(0,0,o.r,0,TAU);ctx.fill();ring(0,0,o.r,'#ffb347',1.5,0.8*al);ctx.restore();ctx.globalAlpha=1;for(let i=0;i<5;i++){const a=i/5*TAU+G.t;fxD('fx_ember',o.x+Math.cos(a)*o.r*0.8,o.y+Math.sin(a)*o.r*0.5-4,12,{add:1,alpha:al})}}});
  if(typeof SRC_N!=='undefined'){SRC_N.no=['Bạo Phù','talisman'];SRC_N.bay=['Trận Phù','array']}
BM_DATA.modung={lore:'Giữa biển lửa, sau lưng nàng có bóng phượng hoàng. Nàng nhớ mình từng đốt một ngọn núi, và nhớ là mình không hối hận.',branches:[
  {id:'bp',n:'Bạo Phù',hop:{hoa:['vụ nổ mạnh thêm 40%',{boomDmg:0.4}],kim:['vụ nổ rộng thêm 20%',{boomR:0.2}]},tag:'nổ · dây chuyền',ic:'baophu',lore:'Một kiếp nàng viết bùa nhanh hơn người ta kịp đọc. Chữ nào cũng là một tiếng nổ.',nodes:[
    {id:'1',n:'Dẫn Hỏa',d:'Bùa trúng yêu quái nổ một vụ nhỏ quanh nó.',on:{atkHit(c){if(c.first)bang(c.first.x,c.first.y,0.4)}}},
    {id:'2',n:'Lan Hỏa',d:'Mọi vụ nổ của Bạo Phù rộng hơn 35%.',mod:{boomR:0.35}},
    {id:'3',n:'Ngũ Phù',d:'Đòn kết ném thêm 2 lá bùa.',mod:{atkFanFin:2}},
    {id:'4',n:'Hỏa Dược',d:'Vụ nổ mạnh thêm 50%.',mod:{boomDmg:0.5}},
    {id:'5',n:'Bạo Liệt',d:'Tuyệt kỹ mạnh thêm 40% và hồi nhanh hơn 15%.',mod:{tkDmg:0.4,tkCd:0.15}}],
   key:{id:'k',n:'Liên Hoàn Bạo',d:'Yêu quái chết vì vụ nổ sẽ tự nổ tiếp, kéo theo cả cụm.',lore:'Hộp trầu cau còn xanh giữa băng nghìn năm. Có những thứ nàng châm lửa, và có những thứ nàng giữ.',
    on:{kill(c,s){if(c.src!=='no'&&c.src!=='tuyetky'&&c.src!=='bay')return;if(G.t-(s.lhT||0)>0.6){s.lhT=G.t;s.lhN=0}if((s.lhN=(s.lhN||0)+1)>7)return;const x=c.e.x,y=c.e.y;CDX.later(0.1,()=>{if(G&&!G.over){bang(x,y,1);if(s.lhN<3)sfx('no')}})}}}},
  {id:'tp',n:'Trận Phù',hop:{tho:['đặt bẫy nhanh hơn, bẫy mạnh hơn',{trapUp:1}],hoa:['bẫy nổ làm choáng thêm 0,5 giây',{trapStun:0.5}]},tag:'bẫy · giăng lưới',ic:'array',lore:'Một kiếp nàng không ra tay. Nàng chỉ đi trước một bước, và để lại giấy.',nodes:[
    {id:'1',n:'Địa Phù',d:'Mỗi 5 giây tự đặt một lá bùa bẫy dưới chân; yêu quái chạm vào sẽ nổ.',on:{tick(c,s){s.dp=(s.dp??1.5)-c.dt;if(s.dp<=0){s.dp=5/(1+bm('trapUp'));trap(G.p.x,G.p.y)}}}},
    {id:'2',n:'Hỏa Hoàn',d:'Lướt để lại một vòng lửa 3 giây ở điểm xuất phát.',on:{dash(){fire(G.p.x,G.p.y,34,3)}}},
    {id:'3',n:'Cấm Phù',d:'Bẫy nổ làm yêu quái choáng 1,2 giây.',mod:{trapStun:1.2}},
    {id:'4',n:'Dày Đặc',d:'Đặt bẫy nhanh gấp đôi, bẫy mạnh thêm 40%.',mod:{trapUp:1}},
    {id:'5',n:'Bố Trận',d:'Tuyệt kỹ rải thêm 3 lá bẫy quanh vùng mục tiêu.',on:{skill(c){const[x,y]=BX.pt(c,90);for(let i=0;i<3;i++){const a=i/3*TAU+rand();trap(x+Math.cos(a)*34,y+Math.sin(a)*24)}}}}],
   key:{id:'k',n:'Thiên La Địa Võng',d:'Các lá bẫy ở gần nhau nối thành lưới lửa: yêu quái đi qua sợi lưới bị thiêu liên tục.',lore:'Nàng từng giăng một tấm lưới quanh miệng núi. Thứ nó chặn không đến từ dưới đất.',
    on:{tick(c,s){s.lw=(s.lw||0)-c.dt;const L=BX.pets('bay');s.seg=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(Math.hypot(L[i].x-L[j].x,L[i].y-L[j].y)<110)s.seg.push([L[i],L[j]]);
        if(!s.lwFx)s.lwFx=CDX.fx({dur:1e9,u(f){f.t=1;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff8a3a';ctx.lineWidth=1.6;ctx.globalAlpha=0.55+0.25*Math.sin(G.t*9);ctx.beginPath();for(const[a,b]of s.seg||[]){ctx.moveTo(a.x,a.y-2);ctx.lineTo(b.x,b.y-2)}ctx.stroke();ctx.restore();ctx.globalAlpha=1}});
        if(s.lw>0)return;s.lw=0.3;const o=G.src;G.src='bay';for(const[a,b]of s.seg){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1;BX.each((a.x+b.x)/2,(a.y+b.y)/2,Math.sqrt(l2)/2,e=>{const t=Math.max(0,Math.min(1,((e.x-a.x)*dx+(e.y-a.y)*dy)/l2));if(Math.hypot(e.x-a.x-dx*t,e.y-a.y-dy*t)<e.r+5){hurtE(e,BX.B()*0.5,'hoa',{rx:1});if(!e.dead)burn(e)}})}G.src=o}}}},
  {id:'ph',n:'Phượng Hỏa',hop:{hoa:['cháy mạnh thêm 40%',{chayDmg:0.4}],moc:['máu tối đa +10%',{hp:0.1}]},tag:'thiêu đốt · liều mạng',ic:'phonghoa',lore:'Một kiếp nàng tự bước vào lửa trước, để biết nó sẽ làm gì với kẻ khác.',nodes:[
    {id:'1',n:'Thiêu Đốt',d:'Bùa trúng yêu quái gây cháy (tối đa 3 tầng, 4 giây).',on:{atkHit(c){if(c.first)burn(c.first)}}},
    {id:'2',n:'Liều Mạng',d:'Máu càng thấp, Đánh càng mạnh (tối đa +60%).',on:{atk(c){const P=G.p;c.dmg*=1+0.6*(1-P.hp/P.mhp)}}},
    {id:'3',n:'Hỏa Vũ',d:'Lướt để lại một vệt lửa cháy 3 giây.',on:{dash(c){const P=G.p;for(let i=0;i<3;i++)fire(P.x+c.dx*i*32,P.y+c.dy*i*32,22,3)}}},
    {id:'4',n:'Phần Thiên',d:'Cháy chồng tới 6 tầng và mạnh thêm 30%.',mod:{chayMax:3,chayDmg:0.3}},
    {id:'5',n:'Dục Hỏa',d:'Hạ một yêu quái đang cháy hồi 1% máu.',on:{kill(c){if(bmDotN(c.e,'chay'))BX.heal(0.01)}}}],
   key:{id:'k',n:'Niết Bàn',d:'Một lần mỗi tầng: khi sắp gục, nàng sống lại trong lửa với 50% máu và thiêu mọi yêu quái ở gần.',lore:'Phượng không sợ tro. Nó chỉ sợ không còn ai nhớ vì sao mình cháy.',
    on:{lethal(c,s){if(s.nb)return;s.nb=1;c.save=true;const P=G.p;P.hp=Math.ceil(P.mhp*0.5);P.inv=Math.max(P.inv,2.5);announce('Niết Bàn','realm');flash('#ffb347',0.7);shake(0.7);sfx('ignite');BX.spr('fx_c_hoa',P.x,P.y,260,0.9);BX.spr('fx_k_phuong',P.x,P.y-36,150,1.4,{rise:46,grow:1});
        const o=G.src;G.src='chay';for(const e of G.e.slice()){if(e.dead||Math.hypot(e.x-P.x,e.y-P.y)>280)continue;BX.spr('fx_ex2',e.x,e.y-6,50,0.35,{add:1});hurtE(e,BX.B()*5,'hoa',{rx:1});if(!e.dead)for(let i=0;i<3;i++)burn(e)}G.src=o;for(const b of G.es)b.dead=true}}}}]}}

// ═════════ BẠCH HỒ — Yêu tu
{const clone=(x,y,dur)=>BX.pet({k:'anh',x,y,dir:G.p.dir,dur:(dur||4)+bm('cloneDur'),iv:0.5,r:70,act(e,o){o.dir=CDX.dirOf(Math.atan2(e.y-o.y,e.x-o.x));BX.hit(e.x,e.y,30,BX.B()*0.35*(1+bm('cloneDmg')),'thuy','anh',{kb:15},q=>{if(bm('cloneSlow'))q.slowT=Math.max(q.slowT,1.2)});BX.spr('fx_sl2',e.x,e.y-8,40,0.15,{add:1,rot:rand()*TAU})},
      draw(o){BX.ghostDraw(o,'#b98cff',Math.min(0.75,(o.dur-o.t)*2))}});
  const fox=(x,y)=>BX.seek({x,y:y-10,spr:'fx_foxfire',sz:15,c:'#7ab8ff',dmg:BX.B()*0.6*(1+bm('foxDmg')),el:'thuy',src:'luaho',life:3.5,hit(e){if(bm('foxDmg')&&!e.dead)e.slowT=Math.max(e.slowT,1.2)}});
  if(typeof SRC_N!=='undefined'){SRC_N.anh=['Huyễn Ảnh','sum_fox'];SRC_N.luaho=['Hồ Hỏa','hohoa']}
BM_DATA.bachho={lore:'Hồ tộc không có chín mạng. Đó là chín lần nàng đã không cứu được một người.',branches:[
  {id:'ha',n:'Huyễn Ảnh',hop:{thuy:['phân thân tồn tại thêm 2 giây',{cloneDur:2}],kim:['phân thân mạnh thêm 40%',{cloneDmg:0.4}]},tag:'phân thân · đánh lạc hướng',ic:'sum_fox',lore:'Một kiếp nàng để lại bóng mình ở mọi nơi người ấy có thể đi qua, phòng khi cần.',nodes:[
    {id:'1',n:'Tàn Ảnh',d:'Mỗi lần lướt để lại một phân thân 4 giây, tự chém yêu quái ở gần.',on:{dash(){clone(G.p.x,G.p.y)}}},
    {id:'2',n:'Đồng Bộ',d:'Phân thân mạnh thêm 50%.',mod:{cloneDmg:0.5}},
    {id:'3',n:'Mê Hoặc',d:'Yêu quái bị phân thân chém sẽ chậm lại.',mod:{cloneSlow:1}},
    {id:'4',n:'Trường Ảnh',d:'Phân thân tồn tại lâu hơn 3 giây.',mod:{cloneDur:3}},
    {id:'5',n:'Ảo Bộ',d:'Thêm 1 lần lướt; Thân pháp hồi nhanh hơn 15%.',mod:{tpN:1,tpCd:0.15}}],
   key:{id:'k',n:'Vạn Ảnh',d:'Tuyệt kỹ đổi thành: gọi 4 phân thân vây quanh mục tiêu trong 6 giây.',lore:'Chạm Gậy Thần, chín đuôi hiện ra, mỗi đuôi một khuôn mặt của nàng ở một đời khác.',
    on:{skillOverride(c){const[x,y]=BX.pt(c,60);sfx('wing');for(let i=0;i<4;i++){const a=i/4*TAU+0.6;clone(x+Math.cos(a)*30,y+Math.sin(a)*20,6)}BX.ring(x,y,50,'#b98cff')}}}},
  {id:'hh',n:'Hồ Hỏa',hop:{hoa:['lửa hồ mạnh thêm 40%',{foxDmg:0.4}],tam:['thả thêm 1 ngọn lửa hồ',{foxN:1}]},tag:'lửa tự đuổi · hút hồn',ic:'hohoa',lore:'Một kiếp nàng thắp lửa xanh dẫn đường cho kẻ lạc. Không phải ai đi theo cũng trở về.',nodes:[
    {id:'1',n:'Hồ Hỏa',d:'Cứ mỗi nhát Đánh thứ hai thả một ngọn lửa hồ tự tìm yêu quái.',on:{atk(c,s){s.fh=(s.fh||0)+1;if(s.fh%2)return;const P=G.p;for(let i=0;i<1+(bm('foxN')|0);i++)fox(P.x+(rand()-.5)*14,P.y)}}},
    {id:'2',n:'Song Hỏa',d:'Mỗi lần thả 2 ngọn lửa hồ.',mod:{foxN:1}},
    {id:'3',n:'U Hỏa',d:'Lửa hồ mạnh thêm 40% và làm chậm yêu quái.',mod:{foxDmg:0.4}},
    {id:'4',n:'Hút Hồn',d:'Lửa hồ hạ được yêu quái thì Tuyệt kỹ hồi nhanh thêm 0,5 giây.',on:{kill(c){if(c.src==='luaho'&&G.cdx)G.cdx.tk.t-=0.5}}},
    {id:'5',n:'Linh Hỏa',d:'Chiêu 2 hồi nhanh hơn 30%.',mod:{w2Cd:0.3}}],
   key:{id:'k',n:'Nhiếp Hồn',d:'Yêu quái bị lửa hồ hạ sẽ hóa thành một ngọn lửa hồ mới.',lore:'Hồ Lô không hút hồn. Nó chỉ giữ hộ, cho tới khi có người quay lại lấy.',
    on:{kill(c,s){if(c.src!=='luaho')return;if(G.t-(s.nhT||0)>1){s.nhT=G.t;s.nhN=0}if((s.nhN=(s.nhN||0)+1)>5)return;fox(c.e.x,c.e.y)}}}},
  {id:'cv',n:'Cửu Vĩ',hop:{loi:['chạy nhanh thêm 10%',{spd:0.1}],sat:['bạo kích +5%',{crit:0.05}]},tag:'cơ động · khó chết',ic:'ult_ho',lore:'Mỗi đuôi là một lần thất bại nàng không cho phép mình quên.',nodes:[
    {id:'1',n:'Linh Vĩ',d:'Mỗi lần lướt tích 1 đuôi (tối đa 9). Mỗi đuôi làm Đánh mạnh thêm 3%.',on:{dash(c,s){s.tail=Math.min(9,(s.tail||0)+1);
        if(!s.tlFx)s.tlFx=CDX.fx({dur:1e9,o(f){f.t=1;const n=s.tail|0,P=G.p;if(!n||P.dead)return;for(let i=0;i<n;i++){const a=Math.PI+(i-(n-1)/2)*0.28;fxD('fx_ftail',P.x-(P.fx||0)*6+Math.cos(a)*0+(i-(n-1)/2)*3.2,P.y-30,7,{alpha:0.9})}}})},atk(c,s){c.dmg*=1+0.03*(s.tail||0)}}},
    {id:'2',n:'Tam Bộ',d:'Thêm 1 lần lướt.',mod:{tpN:1}},
    {id:'3',n:'Tật Phong',d:'Chạy nhanh hơn 10%; Thân pháp hồi nhanh hơn 20%.',mod:{spd:0.1,tpCd:0.2}},
    {id:'4',n:'Hồ Mị',d:'Mỗi đuôi cho thêm 2% cơ hội để nhát Đánh thành bạo kích.',on:{atk(c,s){if(rand()<0.02*(s.tail||0))c.crit=true}}},
    {id:'5',n:'Vĩ Kích',d:'Khi đủ 9 đuôi, đòn kết của chuỗi Đánh mạnh thêm 50%.',on:{atk(c,s){if(c.fin&&(s.tail|0)>=9)c.dmg*=1.5}}}],
   key:{id:'k',n:'Cửu Mệnh',d:'Khi sắp gục mà còn từ 3 đuôi: tiêu 3 đuôi để sống lại với 30% máu.',lore:'Lần thứ mười, nàng định sẽ không dùng tới cái đuôi nào cả.',
    on:{lethal(c,s){if((s.tail|0)<3)return;s.tail-=3;c.save=true;const P=G.p;P.hp=Math.ceil(P.mhp*0.3);P.inv=Math.max(P.inv,2);announce('Cửu Mệnh','realm');BX.ring(P.x,P.y,80,'#b98cff',0.5);BX.spr('fx_k_cuuho',P.x,P.y-30,120,1.1,{rise:34,grow:1});BX.hit(P.x,P.y,80,BX.B()*1.5,'thuy','bm',{kb:180})}}}}]}}

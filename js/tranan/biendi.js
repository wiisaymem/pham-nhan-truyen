'use strict';
// ───────────────────────── TRẤN ẤN LỘ · BIẾN DỊ CỦA TẦNG (js/tranan/biendi.js)
// Từ tầng 4 mỗi tầng mang biến dị (tầng 4–11: 1, tầng 12–24: 2, từ tầng 25: 3). Biến dị của một tầng CỐ ĐỊNH trong cả mùa
// (tính từ mã mùa + số tầng) để mọi người trên bảng xếp hạng gặp cùng thử thách; sang mùa mới thì đổi.
// Mỗi biến dị cộng 10% kinh nghiệm của tầng.
// THÊM BIẾN DỊ MỚI: thêm một mục vào BD. Các móc có thể dùng (đều không bắt buộc):
//   spawn(e,elite,boss)  chỉnh một yêu quái vừa sinh (sau khi đã nhân hệ số tầng)
//   kill(e,H)            khi một yêu quái bị hạ
//   tick(dt,H)           mỗi khung hình
//   pack:n               mỗi bầy thêm n yêu quái      time:s   đổi đồng hồ của tầng (giây)
// Vùng nguy hiểm trên đất: haz(x,y,bán kính,giây,kiểu,sát thương) với kiểu 'doc' (vũng, gây sát thương mỗi nửa giây) hoặc 'no' (báo trước rồi nổ một lần).
if(TA){
  const {C,RR}=TA;
  const haz=(x,y,r,dur,k,dmg)=>{const H=G.hd;if(H.haz.length<40)H.haz.push({x,y,r,t:0,dur,k,dmg,tk:0})};
  const BD=[
    {id:'cuong',n:'Cuồng Nộ',d:'Yêu quái nhanh hơn 20%.',spawn(e){e.spd*=1.2}},
    {id:'hung',n:'Hung Bạo',d:'Yêu quái gây thêm 20% sát thương.',spawn(e){e.dmg*=1.2}},
    {id:'giap',n:'Thiết Giáp',d:'Tinh anh và thủ lĩnh thêm 35% máu.',spawn(e,el,bo){if(el||bo){e.mhp*=1.35;e.hp=e.mhp}}},
    {id:'doc',n:'Độc Vực',d:'Yêu quái chết để lại vũng độc 4 giây.',kill(e){if(!e.d.boss)haz(e.x,e.y,26,4,'doc',e.dmg*0.5)}},
    {id:'no',n:'Bạo Thể',d:'Yêu quái chết sẽ nổ sau một nhịp.',kill(e){if(!e.d.boss)haz(e.x,e.y,36,0.9,'no',e.dmg*1.4)}},
    {id:'hut',n:'Hấp Huyết',d:'Tinh anh và thủ lĩnh tự hồi máu.',tick(dt){for(const e of G.e)if((e.elite||e.d.boss)&&!e.dead&&!e.sleep&&e.hp<e.mhp)e.hp=Math.min(e.mhp,e.hp+e.mhp*(e.d.boss?0.006:0.012)*dt)}},
    {id:'dong',n:'Đông Quân',d:'Mỗi bầy thêm 2 yêu quái.',pack:2},
    {id:'gap',n:'Gấp Gáp',d:'Tầng này chỉ có 4 phút.',time:240}];
  const count=t=>t<4?0:t<12?1:t<25?2:3;
  // danh sách biến dị của một tầng trong mùa hiện tại (cõi Thường dùng cùng danh sách của mùa đang chạy)
  function bdOf(tier){const n=count(tier);if(!n)return[];let h=2166136261;for(const c of muaId()+'#'+tier){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
    const rnd=()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296};
    const L=BD.slice(),o=[];for(let i=0;i<n&&L.length;i++)o.push(L.splice((rnd()*L.length)|0,1)[0]);return o}
  const nm=a=>i18n('bd.'+a.id,a.n),ds=a=>i18n('bd.'+a.id+'.d',a.d);
  const bdText=tier=>{const L=bdOf(tier);return L.length?`<b>${i18n('bd.ten','Biến dị')}:</b> `+L.map(a=>`<span title="${ds(a)}">${nm(a)}</span>`).join(' · ')+`<small>${L.map(ds).join(' ')}</small>`:`<small>${i18n('bd.khong','Tầng này chưa có biến dị (bắt đầu từ tầng 4).')}</small>`};
  // vào tầng: gắn biến dị, vùng nguy hiểm, lớp vẽ
  function bdInit(H){H.bd=bdOf(H.tier);H.haz=[];for(const a of H.bd)if(a.time){H.time=a.time;H.time0=a.time}
    CDX.fx({x:0,y:0,dur:1e9,u(){for(const z of H.haz){const k=z.t/z.dur;ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.58);
      if(z.k==='doc'){ctx.globalAlpha=0.32*Math.min(1,(1-k)*3);ctx.fillStyle='#6ad04a';ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.fill();ctx.globalAlpha=1;ring(0,0,z.r,'#b8ff6a',1.5,0.7*(1-k))}
      else{ctx.globalAlpha=0.18+0.3*k;ctx.fillStyle='#ff5a3a';ctx.beginPath();ctx.arc(0,0,z.r*k,0,TAU);ctx.fill();ctx.globalAlpha=1;ring(0,0,z.r,'#ffb07a',2,0.9)}
      ctx.restore();ctx.globalAlpha=1}}})}
  function bdTick(dt){const H=G.hd,P=G.p;if(!H.bd)return;for(const a of H.bd)if(a.tick)a.tick(dt,H);
    for(const z of H.haz){z.t+=dt;const inside=Math.hypot(P.x-z.x,(P.y-z.y)/0.58)<z.r+4;
      if(z.k==='doc'){z.tk-=dt;if(inside&&z.tk<=0&&z.t>0.35){z.tk=0.5;hurtP(z.dmg)}}
      else if(z.t>=z.dur){if(inside)hurtP(z.dmg);burstP(z.x,z.y-4,10,['#ffb07a','#ff5a3a','#fff'],{spd:90,life:0.35,s:2});sfx('no')}}
    if(H.haz.some(z=>z.t>=z.dur))H.haz=H.haz.filter(z=>z.t<z.dur)}
  Object.assign(TA,{haz,BD,bdOf,bdText,bdInit,bdTick,bdSpawn(e,el,bo){for(const a of G.hd.bd||[])if(a.spawn)a.spawn(e,el,bo)},bdKill(e){for(const a of G.hd.bd||[])if(a.kill)a.kill(e,G.hd)},bdPack:()=>(G.hd.bd||[]).reduce((s,a)=>s+(a.pack|0),0),bdXp:()=>1+0.1*((G.hd.bd||[]).length)});
}

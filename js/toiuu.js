'use strict';
// ───────────────────────── Giữ khung hình khi yêu quái quá đông (10/11/2026, Kent nhờ nghiên cứu)
// Máy yếu: nếu khung hình tụt dưới 38 dù đã ở mức đồ họa thấp nhất tự động, game "dồn quái": hạ trần số yêu quái trên bản đồ,
// bù lại mỗi con sinh ra sau đó dày máu hơn và rơi linh khí nhiều hơn đúng tỉ lệ. Độ khó và phần thưởng giữ gần như cũ, số hình phải vẽ ít đi.
// Khung hình hồi lại trên 55 thì trần tăng dần về 420. Tắt: ?don=0.
const DONQUAI=(()=>{try{return new URLSearchParams(location.search).get('don')!=='0'}catch(e){return true}})();
if(DONQUAI){
  let acc=0,n=0;
  const _fxqT=fxqTick;
  fxqTick=function(dt){_fxqT(dt);if(!G||G.paused||G.over||dt<=0)return;acc+=dt;n++;if(acc<3)return;const fps=n/acc;acc=0;n=0;
    const cap=G.ecap||420;
    if(fps<38&&G.e.length>150&&(!FXAUTO||FXQ===0))G.ecap=Math.max(150,Math.round(Math.min(cap,G.e.length)*0.8));
    else if(fps>55&&cap<420)G.ecap=Math.min(420,cap+30);
    G.edense=Math.min(2.8,420/(G.ecap||420))};
  const _spawnTU=spawnEnemy;
  spawnEnemy=function(t,x,y,o){const e=_spawnTU(t,x,y,o),m=G.edense||1;if(e&&m>1.05&&!e.d.boss){e.mhp*=m;e.hp=e.mhp;e.dn=m}return e};
  const _killTU=killE;
  killE=function(e){const was=e.dead;_killTU(e);if(!was&&e.dead&&e.dn>1&&!e.d.boss)dropGem(e.x+4,e.y+3,e.d.xp*(e.dn-1)*(G.ai&&G.ai.xp||1))};
}

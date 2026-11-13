'use strict';
// ───────────────────────── Ải (chapter): mỗi ải là một bản đồ ở một mức khó, qua ải mới mở ải sau
const AI_MAX=60;
function aiSave(){if(!SAVE.ai)SAVE.ai={best:SAVE.wins>0?1:0,sel:1,claim:Date.now()};return SAVE.ai}
function aiSpec(n){n=Math.max(1,n|0);return{n,map:MAP_ORDER[(n-1)%MAP_ORDER.length],
  hp:1+0.35*(n-1)+0.02*(n-1)*(n-1), dmg:1+0.15*(n-1), boss:1+0.5*(n-1)+0.03*(n-1)*(n-1), spd:1+Math.min(0.3,0.03*(n-1)),
  lt:1+0.4*(n-1), xp:1+0.2*(n-1), rar:Math.min(0.6,0.05*(n-1)), first:200+150*n}}
const aiUnlocked=n=>n<=aiSave().best+1;
// Bế quan: tích linh thạch khi không chơi, theo ải cao nhất đã qua
const BQ_CAP=12*3600*1000;
const bqRate=()=>20+30*aiSave().best; // linh thạch mỗi giờ
function bqPending(){const S=aiSave();const ms=Math.min(BQ_CAP,Math.max(0,Date.now()-(S.claim||Date.now())));return{ms,lt:Math.floor(ms/3600000*bqRate())}}
function bqClaim(){const S=aiSave(),p=bqPending();if(p.lt<1)return 0;SAVE.lt+=p.lt;S.claim=Date.now();saveSave();return p.lt}

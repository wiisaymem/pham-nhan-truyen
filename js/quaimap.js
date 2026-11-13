'use strict';
// ───────────────────────── Yêu quái riêng của từng bản đồ (hình Google Flow: tools/art_src/m_*.png)
Object.assign(ENEMY,{
  daoyeu:{n:'Đào Yêu',el:'moc',spr:'daoyeu',sc:1,hp:20,spd:48,dmg:8,xp:1,r:7,ai:'zig'},
  ongdoc:{n:'Độc Phong',el:'moc',spr:'ongdoc',sc:1,hp:16,spd:54,dmg:7,xp:1,r:6,ai:'fly'},
  mocnhan:{n:'Mộc Nhân Đào',el:'moc',spr:'mocnhan',sc:1,hp:120,spd:22,dmg:15,xp:4,r:11,ai:'chase',heavy:1},
  sontieu:{n:'Sơn Tiêu',el:'tho',spr:'sontieu',sc:1,hp:36,spd:48,dmg:10,xp:2,r:7,ai:'hop'},
  hacyeu:{n:'Hạc Yêu',el:'kim',spr:'hacyeu',sc:1,hp:24,spd:55,dmg:9,xp:2,r:7,ai:'fly'},
  thachvien:{n:'Thạch Viên',el:'tho',spr:'thachvien',sc:1,hp:80,spd:40,dmg:17,xp:3,r:10,ai:'charge'},
  banghoho:{n:'Băng Hồ',el:'thuy',spr:'banghoho',sc:1,hp:22,spd:50,dmg:8,xp:1,r:7,ai:'zig'},
  tuyetyeu:{n:'Tuyết Yêu',el:'thuy',spr:'tuyetyeu',sc:1,hp:36,spd:30,dmg:9,xp:2,r:7,ai:'ranged',alpha:0.92},
  nhamlang:{n:'Nham Tương Quái',el:'hoa',spr:'nhamlang',sc:1,hp:24,spd:44,dmg:8,xp:1,r:7,ai:'hop'},
  hoalong:{n:'Hỏa Tích',el:'hoa',spr:'hoalong',sc:1,hp:30,spd:56,dmg:10,xp:2,r:7,ai:'zig'},
  dungthach:{n:'Dung Nham Cự Nhân',el:'tho',spr:'dungthach',sc:1,hp:130,spd:24,dmg:17,xp:4,r:11,ai:'charge',heavy:1},
  banggiap:{n:'Băng Giáp Trùng',el:'thuy',spr:'banggiap',sc:1,hp:95,spd:28,dmg:12,xp:3,r:9,ai:'shield',heavy:1},
});
const MAP_SPAWN={daohoa:[[120,'daoyeu',7],[200,'ongdoc',6],[380,'mocnhan',3]],vandinh:[[150,'sontieu',6],[260,'hacyeu',6],[500,'thachvien',4]],banghoa:[[120,'banghoho',7],[300,'tuyetyeu',5],[560,'banggiap',4]],hoason:[[100,'nhamlang',8],[240,'hoalong',6],[420,'dungthach',4]]};
rollType=function(){const t=effT(),T=SPAWN_TABLE.concat(G&&!G.tower&&MAP_SPAWN[G.mapId]||[]);let tot=0;const L=[];for(const [s,k,w] of T)if(t>=s){const ww=w*(t-s<60?0.5+0.5*(t-s)/60:1);L.push([k,ww]);tot+=ww}
  let r=rand()*tot;for(const [k,w] of L){r-=w;if(r<=0)return k}return 'thu'};
// chết theo kiểu riêng
Object.assign(KILLX,{
  daoyeu:e=>{for(let i=0;i<10;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*80,vy:-20-rand()*50,g:40,life:0.9,s:2.2,c:rand()<0.5?'#ffb3cf':'#ffffff',k:3,vr:6,add:0,drag:1})},
  mocnhan:e=>{for(let i=0;i<8;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*90,vy:-30-rand()*50,g:220,life:0.7,s:2.6,c:rand()<0.5?'#8a5a2a':'#ffb3cf',k:3,vr:8,add:0})},
  hacyeu:e=>{for(let i=0;i<8;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*70,vy:-10-rand()*30,g:30,life:1,s:2.2,c:rand()<0.6?'#ffffff':'#6a4a9a',k:3,vr:5,add:0,drag:1})},
  thachvien:e=>{for(let i=0;i<10;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*110,vy:-40-rand()*60,g:260,life:0.7,s:2.8,c:rand()<0.5?'#7a7a80':'#ff9a3a',k:3,vr:8,add:0})},
  banghoho:e=>{for(let i=0;i<8;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*100,vy:-30-rand()*50,g:240,life:0.6,s:2.4,c:rand()<0.5?'#e8fbff':'#9fe8ff',k:3,vr:10,add:0})},
  banggiap:e=>{for(let i=0;i<10;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*110,vy:-30-rand()*60,g:240,life:0.7,s:2.6,c:rand()<0.5?'#e8fbff':'#6fd6ff',k:3,vr:10,add:0})},
  nhamlang:e=>{for(let i=0;i<10;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*90,vy:-30-rand()*60,g:260,life:0.6,s:2.4,c:rand()<0.5?'#ff6a1f':'#ffd45a',k:3,vr:6})},
  dungthach:e=>{for(let i=0;i<12;i++)vp(e.x,e.y-e.r,{vx:(rand()-.5)*120,vy:-40-rand()*60,g:260,life:0.7,s:2.8,c:rand()<0.5?'#2a1a1a':'#ff6a1f',k:3,vr:8,add:0})},
  tuyetyeu:e=>{for(let i=0;i<12;i++)vp(e.x+(rand()-.5)*10,e.y-e.r-rand()*10,{vx:(rand()-.5)*30,vy:-15-rand()*20,life:1.2,s:1.8,c:'#ffffff',drag:0.5})},
});
// không khí Hỏa Diệm Sơn: tàn lửa bay lên, hơi nóng
const _moQM=mapOver;mapOver=function(){_moQM();if(!G||G.mapId!=='hoason'||FXQ===0)return;const n=[0,2,4][FXQ];for(let i=0;i<n;i++)if(rand()<0.5)vp(camX+rand()*VW,camY+VH+10,{vx:(rand()-.5)*20,vy:-40-rand()*50,life:2.5,s:1.6+rand(),c:rand()<0.6?'#ffb02e':'#ff6a1f',drag:0.2})};
const _msQM=mapScreen;mapScreen=function(dt){_msQM(dt);if(!G||G.mapId!=='hoason')return;const g=ctx.createLinearGradient(0,VH,0,VH*0.5);g.addColorStop(0,'rgba(255,90,20,0.16)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)};

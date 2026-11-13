'use strict';
// ───────────────────────── Vạn Kiếp Tu Tiên: dữ liệu game
const VER='0.2.0';
const TAU=Math.PI*2;
const rand=Math.random;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const ri=(a,b)=>a+((rand()*(b-a+1))|0);
const pick=a=>a[(rand()*a.length)|0];
const mmss=s=>{s=Math.max(0,Math.floor(s));return String((s/60)|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c}

// ── Ngũ hành: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim
const EL={
  kim:{n:'Kim',c:'#ffd23f',d:'#a8780c'},
  moc:{n:'Mộc',c:'#5ee05a',d:'#23802a'},
  thuy:{n:'Thủy',c:'#4cc3ff',d:'#1a6fb0'},
  hoa:{n:'Hỏa',c:'#ff6b3d',d:'#b0301a'},
  tho:{n:'Thổ',c:'#d9a35a',d:'#80562a'},
};
const KHAC={kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'};
function elMul(a,b){if(!a||!b)return 1;if(KHAC[a]===b)return 1.4;if(KHAC[b]===a)return 0.75;return 1}

// ── Cảnh giới: đột phá ở cấp này, mỗi lần mở thêm 1 ô công pháp
const REALMS=[
  {n:'Luyện Khí',lv:1,c:'#8fe3c8'},
  {n:'Trúc Cơ',lv:10,c:'#7fd0ff'},
  {n:'Kết Đan',lv:20,c:'#ffd45a'},
  {n:'Nguyên Anh',lv:32,c:'#ff9de0'},
  {n:'Hóa Thần',lv:45,c:'#ffffff'},
];
const BASE_SLOTS=2, MAX_W=6, MAX_P=6;
// cân bằng 10/2026: Hóa Thần khoảng phút 12 thay vì phút 6; vài cấp đầu vẫn nhanh để nhận thẻ sớm
function xpNeed(lv){const n=lv<12?5+lv*lv*1.8:lv<32?240+(lv-12)*45:1150;return Math.round(n*(lv<12?0.9:1))}

// ── Công pháp chủ động (5 cấp). s(l) trả về chỉ số ở cấp l (1..5)
const L5=(a,l)=>a[l-1];
const WEAP={
  phikiem:{n:'Phi Kiếm',el:'kim',ic:'sword',
    d:['Kiếm bay tìm yêu quái gần nhất, xuyên qua.','+1 thanh kiếm.','Sát thương +25%, xuyên thêm 1.','+1 thanh kiếm, hồi chiêu nhanh hơn.','+1 thanh kiếm, sát thương +20%.'],
    s:l=>({cd:L5([1.15,1.05,1.0,0.88,0.8],l),n:L5([1,2,2,3,4],l),dmg:L5([13,14,18,19,23],l),pierce:L5([2,2,3,3,4],l),spd:270,life:0.9})},
  hoacau:{n:'Hỏa Cầu Thuật',el:'hoa',ic:'fire',
    d:['Bắn cầu lửa nổ lan.','Sát thương +30%.','+1 cầu lửa.','Vùng nổ rộng hơn.','+1 cầu lửa, sát thương +25%.'],
    s:l=>({cd:L5([1.7,1.6,1.5,1.4,1.25],l),n:L5([1,1,2,2,3],l),dmg:L5([20,26,28,32,40],l),r:L5([24,26,28,36,40],l),spd:165})},
  loichuong:{n:'Lôi Chưởng',el:'kim',ic:'bolt',
    d:['Sét đánh rồi nảy qua nhiều yêu quái.','+1 lần nảy.','Sát thương +25%.','+2 lần nảy.','Hồi chiêu nhanh, sát thương +25%.'],
    s:l=>({cd:L5([1.9,1.8,1.7,1.6,1.3],l),dmg:L5([16,18,23,25,31],l),ch:L5([3,4,4,6,7],l),rng:140,jump:72})},
  bangtien:{n:'Băng Tiễn',el:'thuy',ic:'ice',
    d:['Bắn chùm mũi băng làm chậm.','+1 mũi băng.','Làm chậm lâu hơn, sát thương +20%.','+1 mũi băng.','+1 mũi băng, xuyên thêm 1.'],
    s:l=>({cd:L5([1.3,1.25,1.15,1.05,0.95],l),n:L5([3,4,4,5,6],l),dmg:L5([9,10,12,13,15],l),slow:L5([1.4,1.5,2.0,2.1,2.4],l),pierce:L5([1,1,1,1,2],l),spd:230,life:0.75})},
  dangman:{n:'Đằng Mạn',el:'moc',ic:'vine',
    d:['Dây leo trói và siết yêu quái quanh người.','Vùng rộng hơn.','Siết mạnh hơn +30%.','Trói lâu hơn.','Vùng rộng, siết mạnh +30%.'],
    s:l=>({cd:L5([3.4,3.2,3.0,2.8,2.5],l),r:L5([56,64,66,70,82],l),dps:L5([9,10,13,14,18],l),dur:L5([1.4,1.5,1.6,2.0,2.2],l)})},
  thothuan:{n:'Thổ Thuẫn',el:'tho',ic:'rock',
    d:['Khiên đá xoay quanh người, chặn đạn.','+1 khiên đá.','Sát thương +30%.','+1 khiên đá, xoay nhanh hơn.','+1 khiên đá, sát thương +25%.'],
    s:l=>({n:L5([2,3,3,4,5],l),dmg:L5([10,11,14,15,19],l),r:L5([34,36,38,40,44],l),per:L5([2.5,2.4,2.3,1.9,1.7],l)})},
  kimchung:{n:'Kim Chung Tráo',el:'kim',ic:'bell',
    d:['Chuông vàng hất văng yêu quái quanh người.','Sát thương +30%.','Vùng rộng hơn.','Hồi chiêu nhanh hơn.','Vùng rộng, sát thương +30%.'],
    s:l=>({cd:L5([4.0,3.8,3.5,2.9,2.6],l),r:L5([54,56,66,68,80],l),dmg:L5([18,24,26,30,40],l),kb:L5([70,75,85,90,110],l)})},
  holo:{n:'Hồ Lô Hút Hồn',el:'thuy',ic:'gourd',
    d:['Pháp bảo hút linh khí và vật phẩm từ xa, hút hồn yêu quái yếu.','Tầm hút xa hơn.','Hồi chiêu nhanh hơn.','Hút hồn mạnh hơn.','Tầm hút rất xa, hồi chiêu nhanh.'],
    s:l=>({cd:L5([8,7.5,6.5,6,5],l),r:L5([170,220,230,260,340],l),dmg:L5([14,18,20,28,34],l),kill:L5([0.12,0.12,0.15,0.2,0.22],l)})},
  phuchu:{n:'Phù Chú',el:'hoa',ic:'talisman',
    d:['Bùa bay vòng cung, dán vào yêu quái rồi nổ.','+1 lá bùa.','Sát thương +25%.','+1 lá bùa, nổ rộng hơn.','Hồi chiêu nhanh, sát thương +25%.'],
    s:l=>({cd:L5([1.6,1.5,1.45,1.35,1.1],l),n:L5([1,2,2,3,3],l),dmg:L5([22,24,30,32,40],l),r:L5([22,22,24,30,32],l)})},
  kiemtran:{n:'Kiếm Trận',el:'kim',ic:'array',
    d:['Bày trận kiếm dưới chân, xoay chém yêu quái trong trận.','Trận rộng hơn.','Sát thương +30%.','Trận giữ lâu hơn.','Trận rộng, hồi chiêu nhanh.'],
    s:l=>({cd:L5([5,4.8,4.6,4.4,3.6],l),r:L5([44,52,54,56,68],l),tick:L5([6,7,9,10,12],l),dur:L5([3,3,3.2,4,4.2],l)})},
};
// ── Thần thông: công pháp cấp 5 + tâm pháp tương ứng
const EVO={
  phikiem:{p:'kiemtam',n:'Vạn Kiếm Quy Tông',d:'Mưa kiếm: thêm vòng kiếm bắn ra mọi hướng, sát thương x1.5.'},
  hoacau:{p:'hoalinh',n:'Tam Muội Chân Hỏa',d:'Cầu lửa để lại vùng lửa cháy, sát thương x1.4.'},
  loichuong:{p:'loithe',n:'Cửu Thiên Lôi Phạt',d:'Định kỳ giáng sét từ trời xuống nhiều yêu quái quanh người.'},
  bangtien:{p:'thuynguyet',n:'Băng Phong Vạn Lý',d:'Băng tiễn đóng băng yêu quái; định kỳ đóng băng cả vùng.'},
  dangman:{p:'moclinh',n:'Thanh Mộc Trường Sinh',d:'Dây leo hút máu yêu quái, hồi máu cho bạn.'},
  thothuan:{p:'kimcuong',n:'Bất Động Minh Vương',d:'+2 khiên đá, khiên phản sát thương khi bạn bị đánh.'},
  kimchung:{p:'thonguyen',n:'Kim Cương Bất Hoại',d:'Chuông lớn hơn, sát thương x2, mỗi lần ngân được miễn thương ngắn.'},
  holo:{p:'tulinh',n:'Càn Khôn Hồ Lô',d:'Hút toàn bộ linh khí trên bản đồ, hút hồn mạnh gấp đôi.'},
  phuchu:{p:'daotam',n:'Thiên Lôi Phù Trận',d:'Bùa nổ dây chuyền thành 3 tiếng nổ nhỏ.'},
  kiemtran:{p:'thanhanh',n:'Chu Thiên Kiếm Trận',d:'Kiếm trận đi theo người, rộng hơn và chém nhanh hơn.'},
};
const WEAP_ORDER=['phikiem','hoacau','loichuong','bangtien','dangman','thothuan','kimchung','holo','phuchu','kiemtran'];

// ── Tâm pháp bị động (5 cấp)
const PASS={
  kiemtam:{n:'Kiếm Tâm',ic:'p_sword',c:'#ffd23f',d:'Sát thương +7% mỗi cấp.'},
  hoalinh:{n:'Hỏa Linh Căn',ic:'p_fire',c:'#ff6b3d',d:'Vùng ảnh hưởng +8% mỗi cấp.'},
  loithe:{n:'Lôi Thể',ic:'p_bolt',c:'#c8a8ff',d:'Tỉ lệ chí mạng +5% mỗi cấp (x2 sát thương).'},
  thuynguyet:{n:'Thủy Nguyệt Tâm',ic:'p_moon',c:'#4cc3ff',d:'Thời gian hiệu ứng +10%; cấp 3 và 5: +1 số đạn.'},
  moclinh:{n:'Mộc Linh',ic:'p_leaf',c:'#5ee05a',d:'Hồi 0.2 máu mỗi giây mỗi cấp.'},
  kimcuong:{n:'Kim Cương Thể',ic:'p_shield',c:'#d9a35a',d:'Giảm 1 sát thương nhận vào mỗi cấp.'},
  thanhanh:{n:'Thần Hành',ic:'p_boot',c:'#9ff0e0',d:'Tốc chạy +6% mỗi cấp.'},
  tulinh:{n:'Tụ Linh',ic:'p_magnet',c:'#7ff0b0',d:'Tầm hút linh khí +25% mỗi cấp.'},
  daotam:{n:'Đạo Tâm',ic:'p_yin',c:'#ffffff',d:'Hồi chiêu −4.5% mỗi cấp.'},
  thonguyen:{n:'Thọ Nguyên',ic:'p_heart',c:'#ff7b9c',d:'Máu tối đa +10% mỗi cấp.'},
};
const PASS_ORDER=Object.keys(PASS);

// ── Nhân vật
const CHARS={
  lamphong:{n:'Lâm Phong',t:'Kiếm tu',spr:'lp',w:'phikiem',hp:100,spd:1,note:'Kiếm Ý: sát thương hệ Kim +15%.'},
  linhnhi:{n:'Tô Linh Nhi',t:'Đan tu',spr:'ln',w:'dangman',hp:90,spd:1,note:'Linh dược hồi gấp đôi, tự hồi 0.4 máu/giây.'},
  hanbang:{n:'Hàn Băng',t:'Băng tu',spr:'hb',w:'bangtien',hp:90,spd:1.02,note:'Thời gian hiệu ứng +30% (làm chậm, dây leo, kiếm trận).'},
  loichan:{n:'Lôi Chấn',t:'Thể tu',spr:'lc',w:'kimchung',hp:140,spd:0.92,note:'Máu trâu, giáp +2.'},
  modung:{n:'Mộ Dung Yên',t:'Phù sư',spr:'md',w:'phuchu',hp:95,spd:1,note:'Hồi chiêu −8%.'},
  bachho:{n:'Bạch Hồ',t:'Yêu tu',spr:'bh',w:'holo',hp:100,spd:1.05,note:'Tầm hút +40%, tốc chạy nhanh.',lock:1500},
};
const CHAR_ORDER=Object.keys(CHARS);

// ── Yêu quái. ai: chase | zig | fly | hop | ranged | charge | poison | shield | heal | boss_*
const ENEMY={
  thu:{n:'Linh Thử',el:'tho',spr:'thu',sc:1,hp:7,spd:40,dmg:5,xp:1,r:6,ai:'chase'},
  xa:{n:'Thanh Xà',el:'moc',spr:'xa',sc:1,hp:13,spd:31,dmg:6,xp:1,r:6,ai:'chase'},
  buc:{n:'Huyết Bức',el:'hoa',spr:'buc',sc:1,hp:10,spd:50,dmg:5,xp:1,r:6,ai:'fly'},
  ho:{n:'Hỏa Hồ Ly',el:'hoa',spr:'ho',sc:1,hp:20,spd:47,dmg:8,xp:1,r:7,ai:'zig'},
  thi:{n:'Cương Thi',el:'tho',spr:'thi',sc:1,hp:38,spd:46,dmg:10,xp:2,r:7,ai:'hop'},
  hon:{n:'Quỷ Hồn',el:'thuy',spr:'hon',sc:1,hp:28,spd:36,dmg:9,xp:2,r:8,ai:'fly',alpha:0.85},
  quy:{n:'Thạch Quy',el:'tho',spr:'quy',sc:1,hp:110,spd:22,dmg:14,xp:4,r:10,ai:'chase',heavy:1},
  matu:{n:'Ma Tu',el:'kim',spr:'matu',sc:1,hp:34,spd:30,dmg:9,xp:2,r:7,ai:'ranged'},
  chu:{n:'Độc Chu',el:'moc',spr:'chu',sc:1,hp:44,spd:38,dmg:10,xp:2,r:8,ai:'poison'},
  hoang:{n:'Yêu Hổ',el:'kim',spr:'hoang',sc:1,hp:70,spd:38,dmg:16,xp:3,r:10,ai:'charge'},
  trung:{n:'Kim Giáp Trùng',el:'kim',spr:'trung',sc:1,hp:90,spd:30,dmg:12,xp:3,r:9,ai:'shield',heavy:1},
  phien:{n:'Ma Đầu Hồn Phiên',el:'thuy',spr:'phien',sc:1,hp:70,spd:26,dmg:10,xp:3,r:9,ai:'heal'},
  // boss
  cuuvi:{n:'Hồ Tinh Cửu Vĩ',el:'hoa',spr:'cuuvi',sc:1,hp:2600,spd:46,dmg:20,xp:80,r:20,ai:'b_fox',boss:1},
  long:{n:'Ngư Tinh',el:'thuy',spr:'ngutinh',sc:1,hp:7000,spd:40,dmg:24,xp:150,r:24,ai:'b_dragon',boss:1,fly:1},
  maton:{n:'Thủy Tinh',el:'thuy',spr:'thuytinh',sc:1,hp:11000,spd:34,dmg:30,xp:250,r:24,ai:'b_demon',boss:1},
  tamma:{n:'Tâm Ma',el:null,spr:null,sc:1.15,hp:9000,spd:58,dmg:26,xp:0,r:9,ai:'b_mirror',boss:1},
};
// lịch xuất hiện: [giây bắt đầu, loại, trọng số]
const SPAWN_TABLE=[[0,'thu',10],[45,'xa',8],[100,'buc',7],[170,'ho',7],[240,'thi',6],[330,'hon',6],[360,'quy',3],[420,'matu',4],[480,'chu',5],[540,'hoang',4],[600,'phien',2],[660,'trung',4]];
const BOSSES=[[300,'cuuvi'],[600,'long'],[900,'maton']];
const RUN_T=900;
// sự kiện vây quanh
const EVENTS=[[150,'ring','buc',36],[270,'stream','ho',30],[450,'ring','thi',40],[570,'stream','hoang',18],[750,'ring','hon',50],[830,'stream','chu',40]];

// ── Bản đồ
const MAPS={
  daohoa:{n:'Đào Hoa Cốc',d:'Hoa đào, suối và cỏ xanh.',g:['#74c65a','#7fcf63','#89d66c','#95de78'],g2:'#a6e884',path:'#e4cf9a',water:'#5ccbe8',water2:'#9fe8f5',trees:[['p_peach',5],['p_peach2',3],['p_pine',2],['p_bamboo',2]],rocks:[['p_boulder',3],['p_rocks',2],['p_stump',2],['p_bush',4]],props:[['p_lantern',3],['p_gate',1],['p_cauldron',1]],deco:['#ffb3cf','#ffffff','#ffe066','#ff8fb8'],petal:'#ffc3d8',sky:'#c9f1ff'},
  vandinh:{n:'Vân Đỉnh Sơn',d:'Núi đá, mây trắng và rừng tùng.',g:['#93c672','#9ecf7e','#a9d78a','#b5df98'],g2:'#c9e6b4',path:'#d8d2c2',water:'#7fd6ea',water2:'#c8f3fb',trees:[['p_pine',6],['p_peach2',2],['p_bamboo',1]],rocks:[['p_boulder',5],['p_rocks',4],['p_jade',2],['p_stump',1]],props:[['p_lantern',2],['p_gate',2],['p_cauldron',2]],deco:['#ffffff','#e8f0ff','#ffe9a8','#c7b8ff'],petal:'#ffffff',sky:'#e6f6ff',rocky:1},
  banghoa:{n:'Linh Hồ Băng Cung',d:'Hồ băng, tuyết trắng và cung điện ngọc.',g:['#dbeef9','#e4f3fb','#edf8fd','#f6fcff'],g2:'#ffffff',path:'#bfe3d9',water:'#8fd8f0',water2:'#e2fbff',trees:[['p_snowpine',6],['p_pine',1]],rocks:[['p_ice',4],['p_jade',2],['p_boulder',1]],props:[['p_pillar',4],['p_lantern',2],['p_gate',1]],deco:['#9ff0e0','#c6f2ff','#ffffff','#b8ffe8'],petal:'#ffffff',sky:'#eaf7ff',ice:1},
  hoason:{n:'Hỏa Diệm Sơn',d:'Núi lửa, dung nham và rừng phong đỏ.',g:['#8a5a3a','#94623f','#9d6a45','#a8744c'],g2:'#b88458',path:'#5a3a2a',water:'#ff6a1f',water2:'#ffd45a',trees:[['p_maple',5],['p_deadtree',3],['p_sapling',2]],rocks:[['p_obsidian',4],['p_vrocks',4],['p_firecrystal',2],['p_burnstump',2],['p_crust',2]],props:[['p_brazier',3],['p_redgate',1],['p_firealtar',1],['p_phoenixpillar',2]],deco:['#ffb02e','#ff6a1f','#ffd45a','#3a2a2a'],petal:'#ff8a3a',sky:'#ffe2c8',lava:1,rocky:1},
};
const MAP_ORDER=Object.keys(MAPS);
const WORLD=2400;

// ── Động Phủ: nâng cấp vĩnh viễn bằng linh thạch
// Động Phủ: nâng cấp vĩnh viễn, giá tăng theo cấp số nhân; từ cấp 10 cần thêm Tinh Thiết (cày lâu dài)
const dpCost=(base,g)=>l=>Math.round(base*Math.pow(g,l)/5)*5;
const dpMat=l=>l>=10?1+Math.floor((l-10)/5):0;
const DONGPHU={
  hp:{n:'Thọ Nguyên Đan',d:'Máu tối đa +4% mỗi cấp',max:25,cost:dpCost(50,1.15),mat:dpMat},
  dmg:{n:'Kiếm Ý',d:'Sát thương +4% mỗi cấp',max:25,cost:dpCost(70,1.16),mat:dpMat},
  crit:{n:'Linh Nhãn',d:'Tỉ lệ bạo kích +1% mỗi cấp',max:20,cost:dpCost(90,1.16),mat:dpMat},
  cd:{n:'Ngưng Thần',d:'Hồi chiêu −1% mỗi cấp',max:20,cost:dpCost(100,1.16),mat:dpMat},
  area:{n:'Pháp Vực',d:'Vùng ảnh hưởng +2% mỗi cấp',max:20,cost:dpCost(80,1.15),mat:dpMat},
  armor:{n:'Thiết Bì',d:'Giảm 0.5 sát thương nhận vào mỗi cấp',max:10,cost:dpCost(120,1.2),mat:l=>l>=5?1+Math.floor((l-5)/2):0},
  regen:{n:'Linh Tuyền',d:'Hồi 0.1 máu mỗi giây mỗi cấp',max:20,cost:dpCost(70,1.15),mat:dpMat},
  spd:{n:'Thân Pháp',d:'Tốc chạy +2% mỗi cấp',max:15,cost:dpCost(50,1.15),mat:dpMat},
  mag:{n:'Tụ Linh Trận',d:'Tầm hút +8% mỗi cấp',max:15,cost:dpCost(40,1.14),mat:dpMat},
  xp:{n:'Ngộ Tính',d:'Linh khí nhận +3% mỗi cấp',max:20,cost:dpCost(80,1.15),mat:dpMat},
  burst:{n:'Bộc Phát Tâm',d:'Bộc phát nạp nhanh +5% mỗi cấp',max:20,cost:dpCost(60,1.15),mat:dpMat},
  luck:{n:'Phúc Duyên',d:'Linh thạch sau trận +5% mỗi cấp',max:20,cost:dpCost(70,1.15),mat:dpMat},
  reroll:{n:'Thiên Cơ Thuật',d:'+1 lượt đổi thẻ mỗi trận',max:3,cost:l=>[300,700,1500][l],mat:l=>[0,2,5][l]},
  ban:{n:'Phong Ấn Thuật',d:'+1 lượt phong ấn thẻ mỗi trận',max:2,cost:l=>[500,1200][l],mat:l=>[2,5][l]},
};

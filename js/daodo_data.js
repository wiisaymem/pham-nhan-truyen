'use strict';
// ───────────────────────── ĐẠO ĐỒ · DỮ LIỆU (js/daodo_data.js), từ 1.0.76. Phần xử lý: js/daodo.js.
// Đạo Đồ là thước đo chung của cả game: 9 bậc, lên bậc bằng mốc việc đã làm. Mỗi lúc người chơi chỉ thấy MỘT việc chính tuyến.
//
// CÁCH THÊM / SỬA
// • DD_BAC: mỗi bậc {n: tên, s: đoạn truyện hiện khi LÊN tới bậc này}. Chữ truyện là bản nháp cho tới khi Kent duyệt (wiki: trao-doi/).
// • DD_MO: thứ được mở khóa {n: tên, d: lời dẫn khi mở, go: nơi nút "Tới xem" đưa tới}. Nút ở sảnh ứng với từng mã nằm trong DD_NUT (js/daodo.js).
// • DD_Q: chuỗi nhiệm vụ, THEO THỨ TỰ. Mỗi việc:
//     id  mã riêng, không đổi sau khi phát hành (dùng cho mã chữ dd.q.<id> và số liệu)
//     b   bậc Đạo Đồ của việc này (1..9). Việc cuối của một bậc làm xong là lên bậc kế.
//     t   tên việc ({0} = số cần đạt)
//     v   thước đo, một mã trong DD_VAL (js/daodo.js): best, up, eq, glv, realm, tl, ai, dq, pet, tw, ta, mua, bm
//     n   số cần đạt (mặc định 1) · f:'t' nếu là thời gian (giây)
//     go  nút "Tiếp tục" đưa tới đâu: play, dp, gear, tl, dq, pet, tower, tran, mua, bk
//     lt, thao, thiet, gear   phần thưởng (gear = cộng thêm vào tỉ lệ phẩm của món Pháp Bảo tặng)
//     mo  mã (hoặc mảng mã) trong DD_MO được mở khi nhận thưởng việc này
// • Sửa chữ xong chạy: node tools/dd_vi.js (ghi mã chữ vào js/lang/vi.js). Chữ Anh nằm ở tools/dd_en.json.
// • Người chơi đã có tiến trình từ bản cũ: mọi thứ giữ nguyên trạng thái mở, các việc đã đạt được tính gộp một lần (xem ddS trong js/daodo.js).
const DD_BAC=[
  {n:'Luyện Khí',s:''},
  {n:'Trúc Cơ',s:'Dưới gốc đào cổ có một tấm bia khắc tên Lâm Phong. Hắn không nhớ mình đã từng tới đây. Những mảnh ký ức nhặt được ở Phế Tích từ nay được chép lại trong Bí Kíp.'},
  {n:'Kết Đan',s:'Sét đã tan trên Đào Hoa Cốc, nhưng sáu cái tên viết trên cửa đá vẫn còn sáng. Đường lên Vân Đỉnh Sơn đã mở.'},
  {n:'Nguyên Anh',s:'Trống đồng trên Vân Đỉnh nhận ra người cũ. Đạo nhân mù nói: trời đang sợ một điều. Sau lớp mây, một ngọn tháp hiện ra, và có linh thú tìm đến xin đi cùng.'},
  {n:'Hóa Thần',s:'Thủy Tinh dâng nước vì thứ nằm dưới lòng đất sắp thức tỉnh. Dưới gốc đào cổ, đất nứt một đường mảnh như sợi tóc. Lần này không ngồi chờ sét xuống nữa. Có một lối đi xuống.'},
  {n:'Luyện Hư',s:'Thiên Kiếp thu linh lực để vá phong ấn, kiếp này qua kiếp khác. Muốn ngày mai thật sự đến thì phải tự tay vá. Mỗi mùa, các tu sĩ cùng xuống địa mạch xem ai đi được sâu nhất.'},
  {n:'Hợp Thể',s:'Tâm Ma đã lùi một bước. Phong ấn dưới địa mạch còn nhiều tầng chưa vá, và càng xuống sâu yêu khí càng biến dị.'},
  {n:'Đại Thừa',s:'Con đường phía trước chưa ai từng đi. Tên đạo hữu bắt đầu được nhắc tới ở cả bốn ngọn núi.'},
  {n:'Độ Kiếp',s:'Bậc cuối của Đạo Đồ. Từ đây chỉ còn một câu hỏi: đi sâu được tới đâu.'},
];
const DD_MO={
  dp:{n:'Động Phủ',d:'Linh thạch kiếm được trong trận dùng để nâng cấp vĩnh viễn ở Động Phủ. Bế quan giúp tích linh thạch cả khi không chơi.',go:'dp'},
  gear:{n:'Pháp Bảo',d:'Pháp Bảo rơi sau mỗi trận. Trang bị để mạnh hơn, ghép ba món giống nhau thành phẩm cao hơn.',go:'gear'},
  bk:{n:'Bí Kíp',d:'Sổ ghi công pháp, yêu quái đã gặp và những mảnh ký ức đã đọc.',go:'bk'},
  dq:{n:'Nhiệm Vụ Hằng Ngày',d:'Việc làm thêm mỗi ngày, có quà điểm danh bảy ngày. Không bắt buộc, làm khi rảnh.',go:'dq'},
  lb:{n:'Xếp Hạng',d:'Điểm mỗi trận Thiên Kiếp được ghi lên bảng chung của các đạo hữu.',go:''},
  pet:{n:'Linh Thú',d:'Linh thú đi theo vào trận và tự đánh. Nuôi bằng linh thạch.',go:'pet'},
  tower:{n:'Thông Thiên Tháp',d:'Mỗi tầng là một trận ngắn với luật riêng, cuối tầng có thủ lĩnh. Qua tầng nhận linh thạch và Pháp Bảo.',go:'tower'},
  tran:{n:'Trấn Ấn Lộ',d:'Xuống địa mạch vá phong ấn. Ở đây tự tay đánh, lướt và tung chiêu, leo tầng không giới hạn. Mỗi tu sĩ có cấp và Bản Mệnh Đồ riêng.',go:'tran'},
  mua:{n:'Cõi Mùa Giải',d:'Mỗi quý một mùa: bắt đầu lại từ cấp 1 với kho Pháp Bảo riêng, đua tầng trên bảng xếp hạng. Hết mùa, đồ và thưởng chuyển về cõi Thường.',go:'mua'},
};
const DD_Q=[
  // ── Bậc 1 · Luyện Khí: làm quen
  {id:'song1',b:1,t:'Trụ {0} trong một trận Thiên Kiếp',v:'best',n:60,f:'t',go:'play',lt:100,mo:'dp'},
  {id:'dp1',b:1,t:'Nâng một dòng ở Động Phủ',v:'up',go:'dp',lt:80},
  {id:'song3',b:1,t:'Trụ {0} trong một trận Thiên Kiếp',v:'best',n:180,f:'t',go:'play',lt:60,gear:0.1,mo:'gear'},
  {id:'eq1',b:1,t:'Trang bị một Pháp Bảo',v:'eq',go:'gear',lt:80},
  {id:'realm1',b:1,t:'Đột phá Trúc Cơ trong trận',v:'realm',go:'play',lt:150,mo:'bk'},
  // ── Bậc 2 · Trúc Cơ: vượt Thiên Kiếp đầu tiên
  {id:'song8',b:2,t:'Trụ {0} trong một trận Thiên Kiếp',v:'best',n:480,f:'t',go:'play',lt:100,thao:4},
  {id:'tl1',b:2,t:'Tu Luyện một tu sĩ lên bậc 1',v:'tl',go:'tl',lt:120},
  {id:'realm2',b:2,t:'Đột phá Kết Đan trong trận',v:'realm',n:2,go:'play',lt:200},
  {id:'ai1',b:2,t:'Qua Ải 1: vượt Thiên Kiếp ở Đào Hoa Cốc',v:'ai',go:'play',lt:300,gear:0.2,mo:['dq','lb']},
  // ── Bậc 3 · Kết Đan
  {id:'dq1',b:3,t:'Điểm danh ở Nhiệm Vụ Hằng Ngày',v:'dq',go:'dq',lt:80},
  {id:'glv3',b:3,t:'Luyện một Pháp Bảo lên cấp {0}',v:'glv',n:3,go:'gear',lt:120},
  {id:'up5',b:3,t:'Nâng Động Phủ tổng cộng {0} cấp',v:'up',n:5,go:'dp',lt:150},
  {id:'ai2',b:3,t:'Qua Ải 2: Vân Đỉnh Sơn',v:'ai',n:2,go:'play',lt:400,gear:0.2,mo:['pet','tower']},
  // ── Bậc 4 · Nguyên Anh
  {id:'pet2',b:4,t:'Nuôi một Linh Thú lên cấp {0}',v:'pet',n:2,go:'pet',lt:100},
  {id:'tw1',b:4,t:'Vượt tầng 1 Thông Thiên Tháp',v:'tw',go:'tower',lt:150},
  {id:'tw3',b:4,t:'Vượt tầng {0} Thông Thiên Tháp',v:'tw',n:3,go:'tower',lt:250,thiet:3},
  {id:'ai3',b:4,t:'Qua Ải 3: Linh Hồ Băng Cung',v:'ai',n:3,go:'play',lt:500,gear:0.25,mo:'tran'},
  // ── Bậc 5 · Hóa Thần: xuống địa mạch
  {id:'ta1',b:5,t:'Trấn Ấn Lộ: vá xong tầng 1',v:'ta',go:'tran',lt:200},
  {id:'bm3',b:5,t:'Cộng {0} điểm vào Bản Mệnh Đồ',v:'bm',n:3,go:'tran',lt:150},
  {id:'ta3',b:5,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:3,go:'tran',lt:250},
  {id:'ta5',b:5,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:5,go:'tran',lt:350,gear:0.25},
  {id:'ai4',b:5,t:'Qua Ải 4: Hỏa Diệm Sơn',v:'ai',n:4,go:'play',lt:600,gear:0.3,mo:'mua'},
  // ── Bậc 6 · Luyện Hư: mùa giải
  {id:'mua3',b:6,t:'Cõi Mùa Giải: vá xong tầng {0} (hạng Đồng)',v:'mua',n:3,go:'mua',lt:300},
  {id:'tw5',b:6,t:'Vượt tầng {0} Thông Thiên Tháp',v:'tw',n:5,go:'tower',lt:350},
  {id:'ta8',b:6,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:8,go:'tran',lt:450},
  {id:'ta10',b:6,t:'Trấn Ấn Lộ: hạ Tâm Ma ở tầng {0}',v:'ta',n:10,go:'tran',lt:800,gear:0.35},
  // ── Bậc 7 · Hợp Thể
  {id:'ai6',b:7,t:'Qua Ải {0}',v:'ai',n:6,go:'play',lt:700},
  {id:'tw10',b:7,t:'Vượt tầng {0} Thông Thiên Tháp',v:'tw',n:10,go:'tower',lt:700},
  {id:'mua8',b:7,t:'Cõi Mùa Giải: vá xong tầng {0} (hạng Bạc)',v:'mua',n:8,go:'mua',lt:800},
  {id:'ta15',b:7,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:15,go:'tran',lt:1000,gear:0.4},
  {id:'ai8',b:7,t:'Qua Ải {0}',v:'ai',n:8,go:'play',lt:1000},
  // ── Bậc 8 · Đại Thừa
  {id:'tw20',b:8,t:'Vượt tầng {0} Thông Thiên Tháp',v:'tw',n:20,go:'tower',lt:1200},
  {id:'ta20',b:8,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:20,go:'tran',lt:1500,gear:0.45},
  {id:'mua15',b:8,t:'Cõi Mùa Giải: vá xong tầng {0} (hạng Vàng)',v:'mua',n:15,go:'mua',lt:1500},
  {id:'ai10',b:8,t:'Qua Ải {0}',v:'ai',n:10,go:'play',lt:2000},
  // ── Bậc 9 · Độ Kiếp
  {id:'ta25',b:9,t:'Trấn Ấn Lộ: vá xong tầng {0}',v:'ta',n:25,go:'tran',lt:2500,gear:0.5},
  {id:'tw30',b:9,t:'Vượt tầng {0} Thông Thiên Tháp',v:'tw',n:30,go:'tower',lt:2500},
  {id:'mua25',b:9,t:'Cõi Mùa Giải: vá xong tầng {0} (hạng Ngọc)',v:'mua',n:25,go:'mua',lt:3500},
  {id:'ai15',b:9,t:'Qua Ải {0}',v:'ai',n:15,go:'play',lt:4000,gear:0.5},
];

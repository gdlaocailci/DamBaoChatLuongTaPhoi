// =========================================================================
// KHỐI QUẢN LÝ ĐĂNG NHẬP GOOGLE OAUTH & MA TRẬN PHÂN QUYỀN HỆ THỐNG (QA-EDUSYS)
// Đồng bộ chuẩn kiến trúc PhanQuyenAdmin.js & code_TKB_TP.gs
// Hỗ trợ:
// 1. Đăng nhập Google OAuth 2.0 (GOOGLE_CLIENT_ID)
// 2. Quản lý Ma trận Phân quyền 4 trục: [Định danh/Email hoặc * Công khai] - [15 Tiêu chí] - [Menu Hệ thống] - [Nút chức năng]
// 3. Chuyển đổi Công khai 1-Click (chuyenDoiCongKhai1ClickUI) & Quản lý Danh sách Admin (CAI_DAT)
// =========================================================================

const GOOGLE_OAUTH_CLIENT_ID = (typeof GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID)
    ? GOOGLE_CLIENT_ID
    : "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";

let duLieuBangPhanQuyen = [];

// Biến toàn cục tương thích 100% với chuẩn PhanQuyenAdmin.js
window.quyenSuaChua = false; // true nếu email nằm trong DANH_SACH_QUAN_TRI (Sheet CAI_DAT)
window.quyenChiTiet = { lop: [], nut: [], menu: [] }; // lop = Danh sách Mã Tiêu chí (1.1 -> 4.3) được phép sửa
window.emailGiaoVienToanCuc = '';
window.dinhDanhGiaoVienToanCuc = '';

// 15 Tiêu chí Kiểm định Chất lượng Giáo dục theo Thông tư 57/2026/TT-BGDĐT
const DANH_SACH_TIEU_CHI_HE_THONG = [
    { id: '1.1', ten: 'TC 1.1', batBuoc: false },
    { id: '1.2', ten: 'TC 1.2', batBuoc: false },
    { id: '1.3', ten: 'TC 1.3 (*)', batBuoc: true },
    { id: '1.4', ten: 'TC 1.4 (*)', batBuoc: true },
    { id: '2.1', ten: 'TC 2.1 (*)', batBuoc: true },
    { id: '2.2', ten: 'TC 2.2 (*)', batBuoc: true },
    { id: '2.3', ten: 'TC 2.3', batBuoc: false },
    { id: '3.1', ten: 'TC 3.1 (*)', batBuoc: true },
    { id: '3.2', ten: 'TC 3.2 (*)', batBuoc: true },
    { id: '3.3', ten: 'TC 3.3', batBuoc: false },
    { id: '3.4', ten: 'TC 3.4', batBuoc: false },
    { id: '3.5', ten: 'TC 3.5', batBuoc: false },
    { id: '4.1', ten: 'TC 4.1 (*)', batBuoc: true },
    { id: '4.2', ten: 'TC 4.2 (*)', batBuoc: true },
    { id: '4.3', ten: 'TC 4.3', batBuoc: false }
];

// Danh sách Menu / Tab Hệ thống
const DANH_SACH_MENU_HE_THONG = [
    { id: 'menuDashboard', ten: '1. Tổng quan & 08 TC', tabId: 'dashboard', navId: 'nav-dashboard' },
    { id: 'menuTimeline', ten: '2. Lộ trình 5 GĐ', tabId: 'timeline', navId: 'nav-timeline' },
    { id: 'menuCriteria', ten: '3. Đánh giá 15 TC', tabId: 'criteria', navId: 'nav-criteria' },
    { id: 'menuEvidence', ten: '4. Kho Minh chứng', tabId: 'evidence', navId: 'nav-evidence' },
    { id: 'menuLienCap', ten: '5. Trường Liên cấp', tabId: 'liencap', navId: 'nav-liencap' },
    { id: 'menuReports', ten: '6. Xuất Báo cáo & KH', tabId: 'reports', navId: 'nav-reports' },
    { id: 'menuPhanQuyen', ten: '7. Phân quyền Hệ thống', tabId: 'settings', navId: 'nav-settings' }
];

// Danh sách Nút chức năng nghiệp vụ
const DANH_SACH_NUT_CHUC_NANG = [
    { id: 'btnChamTieuChi', ten: 'Chấm & Lưu Tự đánh giá' },
    { id: 'btnThemMinhChung', ten: 'Tải/Gắn Minh chứng Drive' },
    { id: 'btnDoiNguoiPhuTrach', ten: 'Đổi Người phụ trách TC' },
    { id: 'btnTaoCayDrive', ten: 'Khởi tạo Cây Drive 3 tầng' },
    { id: 'btnTrichXuatKH', ten: 'Trích xuất KH Cải tiến' },
    { id: 'btnXuatBaoCao', ten: 'Xuất Báo cáo Word/PDF' },
    { id: 'btnKhoaSoTDG', ten: 'Khóa Sổ Tự đánh giá' }
];

// Bộ nhớ cấu hình học vụ & phân quyền đồng bộ với code_TKB_TP.gs
window.thongSoHocVu = window.thongSoHocVu || {
    DANH_SACH_LOP: DANH_SACH_TIEU_CHI_HE_THONG.map(tc => tc.id),
    DANH_SACH_QUAN_TRI: (typeof CAUHINH_KETNOI !== 'undefined' && Array.isArray(CAUHINH_KETNOI.DANH_SACH_QUAN_TRI))
        ? [...CAUHINH_KETNOI.DANH_SACH_QUAN_TRI]
        : ['nguyenvannam.hieu_truong@gmail.com', 'ban_giam_hieu@truonghoc.edu.vn'],
    MA_TRAN_PHAN_QUYEN: {},
    QUYEN_CONG_KHAI: {
        lop: [],
        nut: [],
        menu: ['menuDashboard', 'menuTimeline', 'menuCriteria', 'menuEvidence', 'menuLienCap', 'menuReports']
    }
};

function layKhoaCachLy(tenKhoa) {
    let prefix = (typeof CAU_HINH_FRONTEND !== 'undefined' && CAU_HINH_FRONTEND.TEN_KHOA_LUU_TRU)
        ? CAU_HINH_FRONTEND.TEN_KHOA_LUU_TRU
        : 'QA_EDUSYS_TT57';
    return `${prefix}_${tenKhoa}`;
}
window.layKhoaCachLy = layKhoaCachLy;

function layQuyenCongKhaiHienTai() {
    if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.QUYEN_CONG_KHAI) {
        return thongSoHocVu.QUYEN_CONG_KHAI;
    }
    return {
        lop: [],
        nut: [],
        menu: ['menuDashboard', 'menuTimeline', 'menuCriteria', 'menuEvidence', 'menuLienCap', 'menuReports']
    };
}
window.layQuyenCongKhaiHienTai = layQuyenCongKhaiHienTai;

// =========================================================================
// HÀM GIAO TIẾP MÁY CHỦ CÓ CƠ CHẾ THỬ LẠI & DỰ PHÒNG OFFLINE AN TOÀN
// =========================================================================
async function fetchVoiCoCheThuLai(url, options = {}, soLanThu = 2) {
    let apiBase = url || (typeof getConfiguredWebAppUrl === 'function' ? getConfiguredWebAppUrl() : '');
    if (!apiBase && typeof CAU_HINH_FRONTEND !== 'undefined') {
        apiBase = CAU_HINH_FRONTEND.URL_API_MAY_CHU || '';
    }

    // Nếu chạy trực tiếp bên trong Google Apps Script HtmlService
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve) => {
            let bodyObj = {};
            if (options && options.body) {
                try { bodyObj = JSON.parse(options.body); } catch (e) {}
            }
            let thaoTac = bodyObj.thaoTac || (String(url).includes('thaoTac=layPhanQuyenHethong') ? 'layPhanQuyenHethong' : '');
            if (thaoTac === 'layPhanQuyenHethong') {
                google.script.run.withSuccessHandler(kq => {
                    resolve({ json: async () => kq });
                }).withFailureHandler(() => {
                    resolve({ json: async () => duLieuBangPhanQuyen });
                }).layDuLieuPhanQuyenHethong();
            } else if (thaoTac === 'luuPhanQuyenHethong') {
                google.script.run.withSuccessHandler(kq => {
                    resolve({ json: async () => kq });
                }).withFailureHandler(err => {
                    resolve({ json: async () => ({ trangThai: 'Lỗi', thongBao: err.toString() }) });
                }).luuDuLieuPhanQuyenHethong(bodyObj.duLieu, bodyObj.danhSachQuanTri);
            } else if (thaoTac === 'chuyenDoiCongKhai') {
                google.script.run.withSuccessHandler(kq => {
                    resolve({ json: async () => kq });
                }).withFailureHandler(err => {
                    resolve({ json: async () => ({ trangThai: 'loi_he_thong', thongBao: err.toString() }) });
                }).chuyenDoiCongKhai1Click(bodyObj);
            } else {
                resolve({ json: async () => ({ trangThai: 'Thành công', thongBao: 'Đã đồng bộ.' }) });
            }
        });
    }

    // Nếu đã cấu hình URL Web App từ xa
    if (apiBase && apiBase.startsWith('http')) {
        for (let i = 0; i <= soLanThu; i++) {
            try {
                const res = await fetch(apiBase, options);
                if (res.ok) return res;
            } catch (err) {
                if (i === soLanThu) break;
                await new Promise(r => setTimeout(r, 600 * (i + 1)));
            }
        }
    }

    // Dự phòng LocalStorage tức thì (khi chạy trên GitHub Pages / máy cục bộ chưa gắn link Web App)
    return xuLyPhanQuyenCucBoFallback(url, options);
}
window.fetchVoiCoCheThuLai = fetchVoiCoCheThuLai;

function xuLyPhanQuyenCucBoFallback(url, options) {
    let KEY_PQ = layKhoaCachLy('PHAN_QUYEN_ADMIN');
    let KEY_QT = layKhoaCachLy('DANH_SACH_QUAN_TRI');

    if (!options || !options.method || options.method === 'GET' || String(url).includes('thaoTac=layPhanQuyenHethong')) {
        let raw = localStorage.getItem(KEY_PQ);
        let parsed = null;
        if (raw) {
            try { parsed = JSON.parse(raw); } catch (e) {}
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
            parsed = (typeof CAUHINH_KETNOI !== 'undefined' && Array.isArray(CAUHINH_KETNOI.DU_LIEU_PHAN_QUYEN_MAC_DINH))
                ? JSON.parse(JSON.stringify(CAUHINH_KETNOI.DU_LIEU_PHAN_QUYEN_MAC_DINH))
                : [
                    ['* (Công khai)', '', '', 'menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuLienCap, menuReports']
                ];
            localStorage.setItem(KEY_PQ, JSON.stringify(parsed));
        }
        return Promise.resolve({
            json: async () => parsed
        });
    }

    let body = {};
    try { body = JSON.parse(options.body || '{}'); } catch (e) {}

    if (body.thaoTac === 'luuPhanQuyenHethong') {
        let duLieuMoi = Array.isArray(body.duLieu) ? body.duLieu : [];
        localStorage.setItem(KEY_PQ, JSON.stringify(duLieuMoi));
        if (Array.isArray(body.danhSachQuanTri)) {
            thongSoHocVu.DANH_SACH_QUAN_TRI = body.danhSachQuanTri;
            localStorage.setItem(KEY_QT, JSON.stringify(body.danhSachQuanTri));
        }
        dongBoMaTranTuBang2D(duLieuMoi);
        return Promise.resolve({
            json: async () => ({
                trangThai: 'Thành công',
                thongBao: 'Đã cập nhật Ma trận phân quyền và đồng bộ hệ thống.'
            })
        });
    }

    if (body.thaoTac === 'chuyenDoiCongKhai') {
        let loai = body.loai; // 'menu', 'nut', 'lop'
        let idCanDoi = String(body.id || '').trim();
        let trangThaiBat = body.congKhai === true;

        let raw = localStorage.getItem(KEY_PQ);
        let ds = raw ? JSON.parse(raw) : (duLieuBangPhanQuyen || []);
        let foundIdx = -1;
        let lopArr = [], nutArr = [], menuArr = [];

        for (let i = 0; i < ds.length; i++) {
            let dDanh = String(ds[i][0] || '').trim().toLowerCase();
            if (dDanh === '*' || dDanh.includes('công khai') || dDanh.includes('congkhai')) {
                foundIdx = i;
                lopArr = ds[i][1] ? String(ds[i][1]).split(',').map(s => s.trim()).filter(String) : [];
                nutArr = ds[i][2] ? String(ds[i][2]).split(',').map(s => s.trim()).filter(String) : [];
                menuArr = ds[i][3] ? String(ds[i][3]).split(',').map(s => s.trim()).filter(String) : [];
                break;
            }
        }

        if (loai === 'menu') {
            let idx = menuArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) menuArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) menuArr.splice(idx, 1);
        } else if (loai === 'nut') {
            let idx = nutArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) nutArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) nutArr.splice(idx, 1);
        } else if (loai === 'lop') {
            let idx = lopArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) lopArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) lopArr.splice(idx, 1);
        }

        let rowMoi = ['* (Công khai)', lopArr.join(', '), nutArr.join(', '), menuArr.join(', ')];
        if (foundIdx !== -1) {
            ds[foundIdx] = rowMoi;
        } else {
            ds.unshift(rowMoi);
        }
        localStorage.setItem(KEY_PQ, JSON.stringify(ds));
        dongBoMaTranTuBang2D(ds);

        return Promise.resolve({
            json: async () => ({
                trangThai: 'Thành công',
                thongBao: (trangThaiBat ? 'Đã BẬT hiển thị công khai' : 'Đã TẮT hiển thị công khai') + ' thành công!',
                quyenCongKhai: {
                    menu: menuArr,
                    nut: nutArr,
                    lop: lopArr
                }
            })
        });
    }

    return Promise.resolve({
        json: async () => ({ trangThai: 'Thành công', thongBao: 'Đã xử lý.' })
    });
}

// =========================================================================
// ĐỒNG BỘ DỮ LIỆU BẢNG 4 CỘT (PHAN_QUYEN_ADMIN) SANG BỘ NHỚ HỆ THỐNG
// =========================================================================
function dongBoMaTranTuBang2D(mangPQ) {
    if (!Array.isArray(mangPQ)) return;
    duLieuBangPhanQuyen = mangPQ;
    thongSoHocVu.MA_TRAN_PHAN_QUYEN = {};
    thongSoHocVu.QUYEN_CONG_KHAI = {
        lop: [],
        nut: [],
        menu: ['menuDashboard', 'menuTimeline', 'menuCriteria', 'menuEvidence', 'menuLienCap', 'menuReports']
    };

    mangPQ.forEach(dong => {
        let dinhDanh = dong[0] ? String(dong[0]).trim() : '';
        if (!dinhDanh) return;
        let objQuyen = {
            lop: dong[1] ? String(dong[1]).split(',').map(s => s.trim()).filter(String) : [],
            nut: dong[2] ? String(dong[2]).split(',').map(s => s.trim()).filter(String) : [],
            menu: dong[3] ? String(dong[3]).split(',').map(s => s.trim()).filter(String) : []
        };
        thongSoHocVu.MA_TRAN_PHAN_QUYEN[dinhDanh.toLowerCase()] = objQuyen;
        thongSoHocVu.MA_TRAN_PHAN_QUYEN[dinhDanh] = objQuyen;

        let dDanhLC = dinhDanh.toLowerCase();
        if (dDanhLC === '*' || dDanhLC.includes('công khai') || dDanhLC.includes('congkhai')) {
            thongSoHocVu.QUYEN_CONG_KHAI = objQuyen;
        }
    });

    // Đồng bộ ngược sang appState.usersMatrix để hiển thị tên người phụ trách trên thẻ 15 Tiêu chí
    if (typeof appState !== 'undefined') {
        let existingUsers = Array.isArray(appState.usersMatrix) ? appState.usersMatrix : [];
        let adminListLC = (thongSoHocVu.DANH_SACH_QUAN_TRI || []).map(e => String(e).trim().toLowerCase());

        // Đảm bảo mọi tài khoản trong PHAN_QUYEN_ADMIN đều có mặt trong usersMatrix
        mangPQ.forEach((dong, idx) => {
            let tk = dong[0] ? String(dong[0]).trim() : '';
            if (!tk) return;
            let tkLC = tk.toLowerCase();
            if (tkLC === '*' || tkLC.includes('công khai') || tkLC.includes('congkhai')) return;

            let tcArr = dong[1] ? String(dong[1]).split(',').map(s => s.trim()).filter(String) : [];
            let nutArr = dong[2] ? String(dong[2]).split(',').map(s => s.trim()).filter(String) : [];
            let menuArr = dong[3] ? String(dong[3]).split(',').map(s => s.trim()).filter(String) : [];

            let uFound = existingUsers.find(u => (u.googleEmail && u.googleEmail.toLowerCase() === tkLC) || (u.id && u.id.toLowerCase() === tkLC));
            let isAdminAcc = adminListLC.includes(tkLC);

            if (uFound) {
                uFound.roleType = isAdminAcc ? 'admin' : (tcArr.length > 0 ? 'editor' : 'viewer');
                uFound.tieuChiDuocSua = isAdminAcc ? ['ALL'] : tcArr;
                uFound.nutDuocBam = nutArr;
                uFound.menuDuocXem = menuArr;
            } else {
                let prefixName = tk.split('@')[0];
                existingUsers.push({
                    id: 'pq_' + idx + '_' + prefixName.replace(/[^a-zA-Z0-9]/g, ''),
                    hoTen: tk.includes('@') ? (`CB/GV (${prefixName})`) : tk,
                    chucVu: isAdminAcc ? 'Quản trị hệ thống' : (tcArr.length > 0 ? `Phụ trách ${tcArr.length} TC` : 'Chỉ xem'),
                    vaiTroHoiDong: isAdminAcc ? 'Chủ tịch / Quản trị HĐ' : 'Ủy viên Hội đồng TĐG',
                    roleType: isAdminAcc ? 'admin' : (tcArr.length > 0 ? 'editor' : 'viewer'),
                    googleEmail: tk,
                    maPin: '123456',
                    tieuChiDuocSua: isAdminAcc ? ['ALL'] : tcArr,
                    nutDuocBam: nutArr,
                    menuDuocXem: menuArr,
                    initial: prefixName.charAt(0).toUpperCase() || 'G',
                    avatarColor: isAdminAcc ? 'bg-indigo-600' : 'bg-emerald-600'
                });
            }
        });

        appState.usersMatrix = existingUsers;
        localStorage.setItem('qa_edusys_users_matrix', JSON.stringify(existingUsers));

        // Cập nhật lại quyền của người dùng đang đăng nhập
        apDungQuyenTheoTaiKhoanHienTai();
    }
}
window.dongBoMaTranTuBang2D = dongBoMaTranTuBang2D;

// =========================================================================
// ÁP DỤNG QUYỀN CỦA TÀI KHOẢN ĐANG ĐĂNG NHẬP (HOẶC KHÁCH CHƯA ĐĂNG NHẬP)
// =========================================================================
function apDungQuyenTheoTaiKhoanHienTai() {
    let email = (window.emailGiaoVienToanCuc || '').trim().toLowerCase();
    let dinhDanh = (window.dinhDanhGiaoVienToanCuc || email).trim().toLowerCase();
    let dsQuanTri = (thongSoHocVu.DANH_SACH_QUAN_TRI || []).map(s => String(s).trim().toLowerCase());

    if (!email && !dinhDanh) {
        // Chưa đăng nhập -> Chế độ Khách (Chỉ áp dụng quyền dòng * Công khai)
        window.quyenSuaChua = false;
        window.quyenChiTiet = { lop: [], nut: [], menu: [] };
    } else if (dsQuanTri.includes(email) || dsQuanTri.includes(dinhDanh)) {
        // Tài khoản nằm trong DANH_SACH_QUAN_TRI (Sheet CAI_DAT) -> Toàn quyền Admin
        window.quyenSuaChua = true;
        window.quyenChiTiet = {
            lop: DANH_SACH_TIEU_CHI_HE_THONG.map(tc => tc.id),
            nut: DANH_SACH_NUT_CHUC_NANG.map(n => n.id),
            menu: DANH_SACH_MENU_HE_THONG.map(m => m.id)
        };
    } else {
        // Giáo viên / Cán bộ kiểm định -> Tra trong MA_TRAN_PHAN_QUYEN
        window.quyenSuaChua = false;
        let q = thongSoHocVu.MA_TRAN_PHAN_QUYEN[email] || thongSoHocVu.MA_TRAN_PHAN_QUYEN[dinhDanh] || { lop: [], nut: [], menu: [] };
        window.quyenChiTiet = {
            lop: Array.isArray(q.lop) ? [...q.lop] : [],
            nut: Array.isArray(q.nut) ? [...q.nut] : [],
            menu: Array.isArray(q.menu) ? [...q.menu] : []
        };
    }

    capNhatHienThiPhanQuyen();
}
window.apDungQuyenTheoTaiKhoanHienTai = apDungQuyenTheoTaiKhoanHienTai;

// Kiểm tra xem người dùng hiện tại có được phép bấm 1 nút chức năng cụ thể không
function coQuyenBamNutChucNang(idNut) {
    if (window.quyenSuaChua) return true;
    let quyenCK = layQuyenCongKhaiHienTai();
    if (quyenCK.nut && quyenCK.nut.includes(idNut)) return true;
    if (window.quyenChiTiet && Array.isArray(window.quyenChiTiet.nut) && window.quyenChiTiet.nut.includes(idNut)) {
        return true;
    }
    return false;
}
window.coQuyenBamNutChucNang = coQuyenBamNutChucNang;

// Kiểm tra xem người dùng hiện tại có được sửa Tiêu chí X.Y không
function coQuyenSuaTieuChiMaTran(maTieuChi) {
    let ma = String(maTieuChi || '').trim();
    if (window.quyenSuaChua) return true;
    let quyenCK = layQuyenCongKhaiHienTai();
    if (quyenCK.lop && (quyenCK.lop.includes('ALL') || quyenCK.lop.includes(ma))) return true;
    if (window.quyenChiTiet && Array.isArray(window.quyenChiTiet.lop)) {
        if (window.quyenChiTiet.lop.includes('ALL') || window.quyenChiTiet.lop.includes(ma)) return true;
    }
    return false;
}
window.coQuyenSuaTieuChiMaTran = coQuyenSuaTieuChiMaTran;

// =========================================================================
// HÀM KIỂM SOÁT HIỂN THỊ MENU & NÚT CHỨC NĂNG (CHỐNG ĐỆ QUY TUYỆT ĐỐI)
// =========================================================================
let _dangCapNhatPhanQuyen = false;

function capNhatHienThiPhanQuyen() {
    if (_dangCapNhatPhanQuyen) return;
    _dangCapNhatPhanQuyen = true;
    try {
        let coQuyenQuanTri = (typeof window.quyenSuaChua !== 'undefined' && window.quyenSuaChua);
        let quyenCongKhai = layQuyenCongKhaiHienTai();
        let menuCongKhai = quyenCongKhai.menu || [];
        let nutCongKhai = quyenCongKhai.nut || [];

        // 1. Kiểm soát hiển thị các Menu trên thanh điều hướng
        DANH_SACH_MENU_HE_THONG.forEach(item => {
            let navBtn = document.getElementById(item.navId);
            if (!navBtn) return;
            // Tab Phân quyền (menuPhanQuyen) luôn cho phép mở để xem hoặc đăng nhập Admin, nhưng hiển thị huy hiệu khóa nếu chưa phải Admin
            if (item.id === 'menuPhanQuyen') {
                navBtn.style.display = 'inline-flex';
                return;
            }
            let duocXem = coQuyenQuanTri ||
                          (window.quyenChiTiet && window.quyenChiTiet.menu && window.quyenChiTiet.menu.includes(item.id)) ||
                          menuCongKhai.includes(item.id);
            navBtn.style.display = duocXem ? 'inline-flex' : 'none';
        });

        // 2. Kiểm soát hiển thị các Nút chức năng theo data-nut-quyen
        document.querySelectorAll('[data-nut-quyen]').forEach(btn => {
            let idNut = btn.getAttribute('data-nut-quyen');
            let duocBam = coQuyenQuanTri ||
                          (window.quyenChiTiet && window.quyenChiTiet.nut && window.quyenChiTiet.nut.includes(idNut)) ||
                          nutCongKhai.includes(idNut);
            btn.style.display = duocBam ? '' : 'none';
        });

        // 3. Đồng bộ trạng thái nút 1-click công khai
        capNhatTrangThaiNutCongKhaiNhanhUI();
    } finally {
        _dangCapNhatPhanQuyen = false;
    }
}
window.capNhatHienThiPhanQuyen = capNhatHienThiPhanQuyen;

function capNhatTrangThaiNutCongKhaiNhanhUI() {
    let quyenCK = layQuyenCongKhaiHienTai();
    let menuCK = quyenCK.menu || [];
    let nutCK = quyenCK.nut || [];

    // Nút 1-Click Công khai Menu Xuất Báo cáo & Kế hoạch Cải tiến
    let btnToggleBaoCao = document.getElementById('btnToggleCongKhai_BaoCao');
    if (btnToggleBaoCao) {
        let daMo = menuCK.includes('menuReports');
        if (daMo) {
            btnToggleBaoCao.className = 'px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white';
            btnToggleBaoCao.innerHTML = `<i class="fa-solid fa-earth-asia"></i> 🌐 Báo cáo & KH Cải tiến: ĐANG CÔNG KHAI (1-Click để Khóa)`;
        } else {
            btnToggleBaoCao.className = 'px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800';
            btnToggleBaoCao.innerHTML = `<i class="fa-solid fa-lock text-slate-500"></i> 🔒 Báo cáo & KH Cải tiến: ĐANG KHÓA (1-Click để Mở công khai)`;
        }
    }

    // Nút 1-Click Công khai Kho Minh chứng
    let btnToggleMinhChung = document.getElementById('btnToggleCongKhai_MinhChung');
    if (btnToggleMinhChung) {
        let daMoMC = menuCK.includes('menuEvidence');
        if (daMoMC) {
            btnToggleMinhChung.className = 'px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white';
            btnToggleMinhChung.innerHTML = `<i class="fa-solid fa-folder-open"></i> 🌐 Kho Minh chứng: ĐANG CÔNG KHAI (1-Click để Khóa)`;
        } else {
            btnToggleMinhChung.className = 'px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800';
            btnToggleMinhChung.innerHTML = `<i class="fa-solid fa-lock text-slate-500"></i> 🔒 Kho Minh chứng: ĐANG KHÓA (1-Click để Mở công khai)`;
        }
    }
}
window.capNhatTrangThaiNutCongKhaiNhanhUI = capNhatTrangThaiNutCongKhaiNhanhUI;

// =========================================================================
// HÀM CHUYỂN ĐỔI CÔNG KHAI 1-CLICK (CHUẨN PhanQuyenAdmin.js)
// =========================================================================
async function chuyenDoiCongKhai1ClickUI(loai, id, tenHienThi) {
    if (!window.quyenSuaChua) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Chỉ tài khoản Quản trị (Admin) mới có quyền Bật/Tắt hiển thị công khai!', 'warning');
        } else {
            alert('⚠️ Chỉ tài khoản Quản trị (Admin) mới có quyền Bật/Tắt hiển thị công khai!');
        }
        if (typeof openLoginModal === 'function') openLoginModal();
        return;
    }

    let quyenCK = layQuyenCongKhaiHienTai();
    let mangLoai = quyenCK[loai] || [];
    let dangCongKhai = mangLoai.includes(id);
    let trangThaiMoi = !dangCongKhai;

    let tieuDe = tenHienThi || id;
    let xacNhan = confirm(`Đồng chí có chắc chắn muốn ${trangThaiMoi ? 'BẬT' : 'TẮT'} hiển thị CÔNG KHAI cho [${tieuDe}]?\n\n- BẬT: Tất cả giáo viên & khách (kể cả chưa đăng nhập) đều được xem.\n- TẮT: Chỉ những ai được cấp quyền cụ thể trong Ma trận phân quyền mới được xem.`);
    if (!xacNhan) return;

    let idGiaoVienGoiLen = window.dinhDanhGiaoVienToanCuc || window.emailGiaoVienToanCuc || '';

    try {
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({
                thaoTac: 'chuyenDoiCongKhai',
                loai: loai,
                id: id,
                congKhai: trangThaiMoi,
                emailTruyCap: idGiaoVienGoiLen
            })
        });

        const ketQua = await phanHoi.json();
        if (ketQua.trangThai === 'Thành công') {
            if (typeof showToast === 'function') {
                showToast(ketQua.thongBao, 'success');
            } else {
                alert(ketQua.thongBao);
            }

            if (ketQua.quyenCongKhai) {
                thongSoHocVu.QUYEN_CONG_KHAI = ketQua.quyenCongKhai;
            } else {
                if (trangThaiMoi && !mangLoai.includes(id)) mangLoai.push(id);
                if (!trangThaiMoi && mangLoai.includes(id)) mangLoai.splice(mangLoai.indexOf(id), 1);
                thongSoHocVu.QUYEN_CONG_KHAI[loai] = mangLoai;
            }

            capNhatHienThiPhanQuyen();
            taiDuLieuPhanQuyenTuMayChu();
        } else {
            alert('Thao tác thất bại: ' + (ketQua.thongBao || 'Lỗi không xác định'));
        }
    } catch (loi) {
        alert('Có sự cố kết nối máy chủ: ' + loi.message);
    }
}
window.chuyenDoiCongKhai1ClickUI = chuyenDoiCongKhai1ClickUI;

// =========================================================================
// TÍCH HỢP ĐĂNG NHẬP GOOGLE IDENTITY SERVICES (GOOGLE_CLIENT_ID)
// =========================================================================
function giaiMaJwtGoogle(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function xuLyPhanHoiDangNhapGoogle(response) {
    if (!response || !response.credential) return;
    const payload = giaiMaJwtGoogle(response.credential);
    if (!payload || !payload.email) {
        alert('Không thể giải mã thông tin tài khoản Google!');
        return;
    }

    const emailGoogle = String(payload.email).trim().toLowerCase();
    const hoTenGoogle = payload.name || emailGoogle.split('@')[0];
    const anhDaiDien = payload.picture || '';

    dangNhapBangEmailDinhDanh(emailGoogle, hoTenGoogle, anhDaiDien, 'Google OAuth 2.0');
}
window.xuLyPhanHoiDangNhapGoogle = xuLyPhanHoiDangNhapGoogle;

function dangNhapBangEmailDinhDanh(emailRaw, hoTenGoiY, anhDaiDien, phuongThuc) {
    let email = String(emailRaw || '').trim().toLowerCase();
    if (!email) return;

    window.emailGiaoVienToanCuc = email;
    window.dinhDanhGiaoVienToanCuc = email;

    let dsQuanTri = (thongSoHocVu.DANH_SACH_QUAN_TRI || []).map(e => String(e).trim().toLowerCase());
    let laQuanTri = dsQuanTri.includes(email);

    // Kiểm tra quyền trong MA_TRAN_PHAN_QUYEN
    let quyenTrongMaTran = thongSoHocVu.MA_TRAN_PHAN_QUYEN[email];
    let dsTieuChiDuocSua = laQuanTri
        ? ['ALL']
        : (quyenTrongMaTran && Array.isArray(quyenTrongMaTran.lop) ? quyenTrongMaTran.lop : []);

    // Tìm hoặc tạo đối tượng user cho appState
    let existingUser = (typeof appState !== 'undefined' && Array.isArray(appState.usersMatrix))
        ? appState.usersMatrix.find(u => (u.googleEmail && u.googleEmail.toLowerCase() === email) || (u.id && u.id.toLowerCase() === email))
        : null;

    let words = (hoTenGoiY || existingUser?.hoTen || email.split('@')[0]).trim().split(' ');
    let initial = (words[words.length - 1] || 'G').charAt(0).toUpperCase();

    let userObj = {
        id: existingUser ? existingUser.id : ('google_' + email.replace(/[^a-z0-9]/g, '_')),
        hoTen: existingUser ? existingUser.hoTen : (hoTenGoiY || `Cán bộ (${email})`),
        chucVu: laQuanTri ? 'Quản trị Hệ thống (Admin)' : (existingUser ? existingUser.chucVu : (dsTieuChiDuocSua.length > 0 ? `Phụ trách ${dsTieuChiDuocSua.length} Tiêu chí` : 'Chế độ Chỉ xem')),
        vaiTroHoiDong: laQuanTri ? 'Chủ tịch / Quản trị HĐ TĐG' : (dsTieuChiDuocSua.length > 0 ? 'Ủy viên Hội đồng TĐG' : 'Quan sát viên (Chỉ xem)'),
        roleType: laQuanTri ? 'admin' : (dsTieuChiDuocSua.length > 0 ? 'editor' : 'viewer'),
        googleEmail: email,
        picture: anhDaiDien || '',
        tieuChiDuocSua: dsTieuChiDuocSua,
        nutDuocBam: laQuanTri ? DANH_SACH_NUT_CHUC_NANG.map(n => n.id) : (quyenTrongMaTran?.nut || []),
        menuDuocXem: laQuanTri ? DANH_SACH_MENU_HE_THONG.map(m => m.id) : (quyenTrongMaTran?.menu || []),
        initial: initial,
        avatarColor: laQuanTri ? 'bg-indigo-600' : (dsTieuChiDuocSua.length > 0 ? 'bg-emerald-600' : 'bg-slate-600')
    };

    if (typeof appState !== 'undefined') {
        appState.isLoggedIn = true;
        appState.currentUser = userObj;
        sessionStorage.setItem('qa_edusys_logged_email', email);
        sessionStorage.setItem('qa_edusys_logged_user_json', JSON.stringify(userObj));
    }

    apDungQuyenTheoTaiKhoanHienTai();

    if (typeof updateActiveUserDisplay === 'function') updateActiveUserDisplay();
    if (typeof closeLoginModal === 'function') closeLoginModal();
    if (typeof addAuditEntry === 'function') {
        addAuditEntry('Đăng nhập Hệ thống', `${userObj.hoTen} (${email}) đăng nhập qua ${phuongThuc || 'Email'} — Quyền: ${laQuanTri ? 'Quản trị tối cao (Admin)' : (dsTieuChiDuocSua.length > 0 ? 'Sửa TC: ' + dsTieuChiDuocSua.join(', ') : 'Chỉ xem công khai')}`);
    }
    if (typeof renderAll === 'function') renderAll();
    hienThiBangPhanQuyen();

    if (typeof showToast === 'function') {
        if (laQuanTri) {
            showToast(`Xin chào Quản trị viên ${userObj.hoTen} (${email})! Đã mở toàn quyền hệ thống.`, 'success');
        } else if (dsTieuChiDuocSua.length > 0) {
            showToast(`Xin chào ${userObj.hoTen}! Đồng chí được quyền biên tập ${dsTieuChiDuocSua.length} tiêu chí (${dsTieuChiDuocSua.join(', ')}).`, 'success');
        } else {
            showToast(`Xin chào ${userObj.hoTen} (${email})! Tài khoản chưa được cấp quyền sửa tiêu chí, đang ở chế độ Chỉ xem công khai.`, 'info');
        }
    }
}
window.dangNhapBangEmailDinhDanh = dangNhapBangEmailDinhDanh;

function khoiTaoGoogleSignInButton() {
    const clientIdEl = document.getElementById('display-google-client-id');
    if (clientIdEl) {
        clientIdEl.innerText = GOOGLE_OAUTH_CLIENT_ID;
    }

    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
            google.accounts.id.initialize({
                client_id: GOOGLE_OAUTH_CLIENT_ID,
                callback: xuLyPhanHoiDangNhapGoogle,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            const btnContainer = document.getElementById('google-signin-btn-wrapper');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                google.accounts.id.renderButton(btnContainer, {
                    theme: 'filled_blue',
                    size: 'large',
                    type: 'standard',
                    shape: 'pill',
                    text: 'signin_with',
                    logo_alignment: 'left',
                    width: 340
                });
            }
        } catch (err) {
            console.log('Google GIS init notice:', err);
        }
    }
}
window.khoiTaoGoogleSignInButton = khoiTaoGoogleSignInButton;

// =========================================================================
// CÁC HÀM XỬ LÝ NGHIỆP VỤ BẢNG MA TRẬN PHÂN QUYỀN (CHUẨN PhanQuyenAdmin.js)
// =========================================================================
async function taiDuLieuPhanQuyenTuMayChu() {
    const vungDuLieu = document.getElementById('vungDuLieuPhanQuyen');
    if (vungDuLieu) {
        vungDuLieu.innerHTML = '<tr><td colspan="5" class="text-center py-8 font-bold text-blue-600"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang nạp ma trận phân quyền...</td></tr>';
    }

    // Khôi phục danh sách Quản trị viên từ LocalStorage (nếu có)
    let KEY_QT = layKhoaCachLy('DANH_SACH_QUAN_TRI');
    let savedQT = localStorage.getItem(KEY_QT);
    if (savedQT) {
        try {
            let arrQT = JSON.parse(savedQT);
            if (Array.isArray(arrQT) && arrQT.length > 0) {
                thongSoHocVu.DANH_SACH_QUAN_TRI = arrQT;
            }
        } catch (e) {}
    }

    try {
        let baseUrl = (typeof getConfiguredWebAppUrl === 'function' ? getConfiguredWebAppUrl() : '') || CAU_HINH_FRONTEND.URL_API_MAY_CHU || '';
        let queryUrl = baseUrl ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}thaoTac=layPhanQuyenHethong` : '?thaoTac=layPhanQuyenHethong';
        const phanHoi = await fetchVoiCoCheThuLai(queryUrl);
        let ketQua = await phanHoi.json();

        if (ketQua && ketQua.trangThai === 'loi_he_thong') {
            throw new Error(ketQua.thongBao);
        }

        if (Array.isArray(ketQua)) {
            duLieuBangPhanQuyen = ketQua;
        } else if (ketQua && Array.isArray(ketQua.duLieu)) {
            duLieuBangPhanQuyen = ketQua.duLieu;
            if (Array.isArray(ketQua.danhSachQuanTri) && ketQua.danhSachQuanTri.length > 0) {
                thongSoHocVu.DANH_SACH_QUAN_TRI = ketQua.danhSachQuanTri;
            }
        } else {
            duLieuBangPhanQuyen = (typeof CAUHINH_KETNOI !== 'undefined' && Array.isArray(CAUHINH_KETNOI.DU_LIEU_PHAN_QUYEN_MAC_DINH))
                ? JSON.parse(JSON.stringify(CAUHINH_KETNOI.DU_LIEU_PHAN_QUYEN_MAC_DINH))
                : [];
        }

        dongBoMaTranTuBang2D(duLieuBangPhanQuyen);
        hienThiBangPhanQuyen();
        hienThiDanhSachQuanTriUI();
    } catch (loi) {
        if (vungDuLieu) {
            vungDuLieu.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 font-bold py-8">Lỗi kết nối: ${loi.message}</td></tr>`;
        }
    }
}
window.taiDuLieuPhanQuyenTuMayChu = taiDuLieuPhanQuyenTuMayChu;

function taoNhomCheckbox(danhSachGoc, danhSachDaChon, kieuPhanLoai, choPhepSua = true) {
    let html = `<div class="flex flex-wrap gap-1.5 justify-start max-h-36 overflow-y-auto p-1 custom-scroll">`;
    danhSachGoc.forEach(item => {
        let idItem = typeof item === 'object' ? item.id : item;
        let tenItem = typeof item === 'object' ? item.ten : item;
        let laBatBuoc = typeof item === 'object' && item.batBuoc;
        let daChon = danhSachDaChon.includes(idItem) || danhSachDaChon.includes('ALL');
        let checkedAttr = daChon ? 'checked' : '';
        let disabledAttr = choPhepSua ? '' : 'disabled';

        let activeStyle = daChon
            ? (laBatBuoc ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-blue-50 border-blue-300 text-blue-900')
            : 'bg-slate-50 border-gray-300 text-slate-700';

        html += `<label class="flex items-center gap-1 border px-2 py-1 rounded text-xs ${choPhepSua ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed opacity-80'} transition-colors ${activeStyle}">
            <input type="checkbox" value="${idItem}" data-loai="${kieuPhanLoai}" ${checkedAttr} ${disabledAttr} onchange="capNhatMauSacCheckbox(this)" class="${choPhepSua ? 'cursor-pointer' : 'cursor-not-allowed'} accent-blue-600">
            <span class="font-semibold whitespace-nowrap">${tenItem}</span>
        </label>`;
    });
    html += `</div>`;
    return html;
}
window.taoNhomCheckbox = taoNhomCheckbox;

function capNhatMauSacCheckbox(cb) {
    if (!cb || !cb.parentElement) return;
    if (cb.checked) {
        cb.parentElement.classList.remove('bg-slate-50', 'border-gray-300', 'text-slate-700');
        cb.parentElement.classList.add('bg-blue-50', 'border-blue-300', 'text-blue-900');
    } else {
        cb.parentElement.classList.remove('bg-blue-50', 'border-blue-300', 'text-blue-900', 'bg-rose-50', 'border-rose-300', 'text-rose-900');
        cb.parentElement.classList.add('bg-slate-50', 'border-gray-300', 'text-slate-700');
    }
}
window.capNhatMauSacCheckbox = capNhatMauSacCheckbox;

// Chọn nhanh theo Tiêu chuẩn cho 1 dòng trong bảng phân quyền
function chonNhanhTieuChiDong(btn, kieuChon) {
    if (!window.quyenSuaChua) {
        if (typeof showToast === 'function') showToast('Chỉ Admin mới có quyền chỉnh sửa ma trận!', 'warning');
        return;
    }
    let tr = btn.closest('tr');
    if (!tr) return;
    let checkboxes = tr.querySelectorAll('input[type="checkbox"][data-loai="lop"]');
    checkboxes.forEach(cb => {
        let val = cb.value;
        if (kieuChon === 'ALL') cb.checked = true;
        else if (kieuChon === 'NONE') cb.checked = false;
        else if (kieuChon === 'TC1') cb.checked = val.startsWith('1.');
        else if (kieuChon === 'TC2') cb.checked = val.startsWith('2.');
        else if (kieuChon === 'TC3') cb.checked = val.startsWith('3.');
        else if (kieuChon === 'TC4') cb.checked = val.startsWith('4.');
        capNhatMauSacCheckbox(cb);
    });
}
window.chonNhanhTieuChiDong = chonNhanhTieuChiDong;

function hienThiBangPhanQuyen() {
    const vungDuLieu = document.getElementById('vungDuLieuPhanQuyen');
    if (!vungDuLieu) return;

    let choPhepSua = Boolean(window.quyenSuaChua);
    let banner = document.getElementById('rbac-matrix-auth-banner');
    if (banner) {
        if (choPhepSua) {
            banner.className = 'px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2';
            banner.innerHTML = `
                <span><i class="fa-solid fa-shield-check text-emerald-600 mr-1.5"></i><strong>Đang đăng nhập Quản trị tối cao (${window.emailGiaoVienToanCuc}):</strong> Đồng chí có toàn quyền thêm dòng định danh/email mới, tích chọn Tiêu chí, Menu, Nút chức năng và bấm <strong>Lưu Hệ Thống</strong>.</span>
                <span class="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Sheet đích: PHAN_QUYEN_ADMIN & CAI_DAT</span>
            `;
        } else {
            banner.className = 'px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2';
            banner.innerHTML = `
                <span><i class="fa-solid fa-lock text-amber-600 mr-1.5"></i><strong>Chế độ Chỉ xem Ma trận:</strong> Chỉ tài khoản trong danh sách Quản trị (Admin) mới được phép thay đổi cấu hình phân quyền.</span>
                <button onclick="openLoginModal()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm"><i class="fa-brands fa-google mr-1"></i>Đăng nhập Admin</button>
            `;
        }
    }

    let html = '';
    if (duLieuBangPhanQuyen.length === 0) {
        html = '<tr><td colspan="5" class="text-center py-10 font-bold text-slate-500">Chưa có dữ liệu cấp quyền nào. Bấm "+ Cấp quyền mới" để tạo.</td></tr>';
    } else {
        duLieuBangPhanQuyen.forEach((dong, index) => {
            let taiKhoan = dong[0] ? String(dong[0]).trim() : '';
            let lopChon = dong[1] ? String(dong[1]).split(',').map(s => s.trim()).filter(String) : [];
            let nutChon = dong[2] ? String(dong[2]).split(',').map(s => s.trim()).filter(String) : [];
            let menuChon = dong[3] ? String(dong[3]).split(',').map(s => s.trim()).filter(String) : [];

            let laDongCongKhai = (taiKhoan.toLowerCase() === '*' || taiKhoan.toLowerCase().includes('công khai') || taiKhoan.toLowerCase().includes('congkhai'));
            let bgDong = laDongCongKhai ? 'bg-amber-50/70 border-b-2 border-amber-300' : 'bg-white hover:bg-slate-50/80 border-b border-gray-200';
            let nhanDong = laDongCongKhai
                ? '<span class="w-full block text-[11px] font-extrabold text-amber-900 bg-amber-200/90 px-2 py-1 rounded text-center border border-amber-300 whitespace-normal leading-tight shadow-sm">🌐 CÔNG KHAI TOÀN TRƯỜNG (Khách & GV chưa cấp quyền riêng)</span>'
                : '<span class="text-[10px] text-slate-400 font-medium">Nhập Email Google hoặc mã GV</span>';

            let thanhChonNhanhTC = choPhepSua ? `
                <div class="flex flex-wrap items-center gap-1 mb-1 pb-1 border-b border-gray-200 text-[10px]">
                    <span class="text-slate-400 font-semibold mr-1">Chọn nhanh:</span>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'ALL')" class="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold">Cả 15 TC</button>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'TC1')" class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold">TC 1</button>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'TC2')" class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold">TC 2</button>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'TC3')" class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold">TC 3</button>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'TC4')" class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold">TC 4</button>
                    <button type="button" onclick="chonNhanhTieuChiDong(this, 'NONE')" class="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold">Bỏ hết</button>
                </div>` : '';

            html += `<tr class="dong-phan-quyen ${bgDong} transition-colors" data-index="${index}">
                <td class="p-2.5 align-top whitespace-normal" style="width: 230px; min-width: 220px;">
                    <div class="flex flex-col gap-1.5 w-full">
                        <input type="text" value="${taiKhoan}" ${choPhepSua ? '' : 'disabled'} list="goi-y-tai-khoan-pq" placeholder="Nhập email Google hoặc * (Công khai)..." class="input-tai-khoan w-full border border-blue-400 rounded-lg px-2.5 py-1.5 text-xs font-bold ${laDongCongKhai ? 'text-amber-900 bg-amber-100/60' : 'text-blue-900 bg-white'} outline-none focus:ring-2 focus:ring-blue-500">
                        ${nhanDong}
                    </div>
                </td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/40">
                    ${thanhChonNhanhTC}
                    ${taoNhomCheckbox(DANH_SACH_TIEU_CHI_HE_THONG, lopChon, 'lop', choPhepSua)}
                </td>
                <td class="p-2 align-top border-l border-gray-300">
                    ${taoNhomCheckbox(DANH_SACH_MENU_HE_THONG, menuChon, 'menu', choPhepSua)}
                </td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/40">
                    ${taoNhomCheckbox(DANH_SACH_NUT_CHUC_NANG, nutChon, 'nut', choPhepSua)}
                </td>
                <td class="p-2 text-center align-middle border-l border-gray-300">
                    <button type="button" ${choPhepSua ? '' : 'disabled'} onclick="xoaDongPhanQuyen(this)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors ${choPhepSua ? '' : 'opacity-40 cursor-not-allowed'}" title="Xóa dòng phân quyền này">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>`;
        });
    }
    vungDuLieu.innerHTML = html;
}
window.hienThiBangPhanQuyen = hienThiBangPhanQuyen;

function themDongPhanQuyenMoi() {
    if (!window.quyenSuaChua) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Chỉ tài khoản Quản trị (Admin) mới được cấp quyền mới!', 'warning');
        } else {
            alert('⚠️ Chỉ tài khoản Quản trị (Admin) mới được cấp quyền mới!');
        }
        if (typeof openLoginModal === 'function') openLoginModal();
        return;
    }
    // Trước khi thêm dòng mới, thu thập tạm trạng thái đang tick trên DOM để không mất các ô vừa sửa
    dongBoDomVaoMangTam();
    duLieuBangPhanQuyen.push(['', '', 'btnChamTieuChi, btnThemMinhChung', 'menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuReports']);
    hienThiBangPhanQuyen();
    setTimeout(() => {
        let khung = document.querySelector('#khungPhanQuyen .overflow-auto');
        if (khung) khung.scrollTop = khung.scrollHeight;
        let inputs = document.querySelectorAll('.dong-phan-quyen .input-tai-khoan');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}
window.themDongPhanQuyenMoi = themDongPhanQuyenMoi;

function dongBoDomVaoMangTam() {
    let cacDong = document.querySelectorAll('.dong-phan-quyen');
    if (!cacDong || cacDong.length === 0) return;
    let mangTam = [];
    cacDong.forEach(tr => {
        let taiKhoan = tr.querySelector('.input-tai-khoan')?.value.trim() || '';
        let chkLop = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="lop"]:checked')).map(cb => cb.value);
        let chkMenu = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="menu"]:checked')).map(cb => cb.value);
        let chkNut = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="nut"]:checked')).map(cb => cb.value);
        mangTam.push([taiKhoan, chkLop.join(', '), chkNut.join(', '), chkMenu.join(', ')]);
    });
    duLieuBangPhanQuyen = mangTam;
}

function xoaDongPhanQuyen(btn) {
    if (!window.quyenSuaChua) return;
    if (!confirm('Đồng chí chắc chắn muốn thu hồi phân quyền của định danh này?')) return;
    dongBoDomVaoMangTam();
    let tr = btn.closest('tr');
    let index = parseInt(tr.getAttribute('data-index'), 10);
    if (!isNaN(index)) {
        duLieuBangPhanQuyen.splice(index, 1);
        hienThiBangPhanQuyen();
    }
}
window.xoaDongPhanQuyen = xoaDongPhanQuyen;

async function luuDuLieuPhanQuyenSangMayChu() {
    if (!window.quyenSuaChua) {
        if (typeof showToast === 'function') {
            showToast('⚠️ Vui lòng đăng nhập quyền Quản trị (Admin) để Lưu Hệ Thống!', 'warning');
        } else {
            alert('⚠️ Vui lòng đăng nhập quyền Quản trị (Admin) để Lưu Hệ Thống!');
        }
        if (typeof openLoginModal === 'function') openLoginModal();
        return;
    }

    let mangGhi = [];
    let cacDong = document.querySelectorAll('.dong-phan-quyen');

    cacDong.forEach(tr => {
        let taiKhoan = tr.querySelector('.input-tai-khoan').value.trim();
        if (taiKhoan !== '') {
            let chkLop = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="lop"]:checked')).map(cb => cb.value);
            let chkMenu = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="menu"]:checked')).map(cb => cb.value);
            let chkNut = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="nut"]:checked')).map(cb => cb.value);

            mangGhi.push([taiKhoan, chkLop.join(', '), chkNut.join(', '), chkMenu.join(', ')]);
        }
    });

    let btnLuu = document.querySelector('button[onclick="luuDuLieuPhanQuyenSangMayChu()"]');
    let textGoc = btnLuu ? btnLuu.innerHTML : '';
    if (btnLuu) { btnLuu.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Đang xử lý...'; btnLuu.disabled = true; }

    try {
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({
                thaoTac: 'luuPhanQuyenHethong',
                duLieu: mangGhi,
                danhSachQuanTri: thongSoHocVu.DANH_SACH_QUAN_TRI
            })
        });
        const kq = await phanHoi.json();
        if (kq.trangThai === 'Thành công') {
            dongBoMaTranTuBang2D(mangGhi);
            hienThiBangPhanQuyen();
            if (typeof renderAll === 'function') renderAll();
            if (typeof showToast === 'function') {
                showToast(kq.thongBao + ' Cập nhật an toàn hoàn tất.', 'success');
            } else {
                alert(kq.thongBao + ' Cập nhật an toàn hoàn tất.');
            }
        } else {
            alert('Lưu thất bại: ' + kq.thongBao);
        }
    } catch (loi) {
        alert('Có sự cố kết nối máy chủ: ' + loi.message);
    } finally {
        if (btnLuu) { btnLuu.innerHTML = textGoc; btnLuu.disabled = false; }
    }
}
window.luuDuLieuPhanQuyenSangMayChu = luuDuLieuPhanQuyenSangMayChu;

// =========================================================================
// QUẢN LÝ DANH SÁCH EMAIL QUẢN TRỊ TỐI CAO (CỘT E TRONG SHEET CAI_DAT)
// =========================================================================
function hienThiDanhSachQuanTriUI() {
    let container = document.getElementById('danh-sach-admin-badges');
    if (!container) return;
    let ds = thongSoHocVu.DANH_SACH_QUAN_TRI || [];
    let choPhepSua = Boolean(window.quyenSuaChua);

    container.innerHTML = ds.map((email, idx) => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <i class="fa-solid fa-crown text-amber-500 text-[10px]"></i>
            <span class="font-mono">${email}</span>
            ${(choPhepSua && ds.length > 1) ? `<button type="button" onclick="xoaEmailQuanTri(${idx})" class="text-rose-500 hover:text-rose-700 ml-1" title="Gỡ quyền Admin"><i class="fa-solid fa-circle-xmark"></i></button>` : ''}
        </span>
    `).join('');
}
window.hienThiDanhSachQuanTriUI = hienThiDanhSachQuanTriUI;

function themEmailQuanTriMoi() {
    if (!window.quyenSuaChua) {
        if (typeof showToast === 'function') showToast('Chỉ Quản trị viên (Admin) mới được thêm Admin mới!', 'warning');
        return;
    }
    let input = document.getElementById('input-them-admin-email');
    if (!input) return;
    let emailMoi = input.value.trim().toLowerCase();
    if (!emailMoi || !emailMoi.includes('@')) {
        alert('Vui lòng nhập địa chỉ Email Google hợp lệ!');
        return;
    }
    if (!thongSoHocVu.DANH_SACH_QUAN_TRI.map(e => e.toLowerCase()).includes(emailMoi)) {
        thongSoHocVu.DANH_SACH_QUAN_TRI.push(emailMoi);
        localStorage.setItem(layKhoaCachLy('DANH_SACH_QUAN_TRI'), JSON.stringify(thongSoHocVu.DANH_SACH_QUAN_TRI));
        input.value = '';
        hienThiDanhSachQuanTriUI();
        if (typeof showToast === 'function') showToast(`Đã thêm ${emailMoi} vào danh sách Quản trị (Admin). Hãy bấm "Lưu Hệ Thống" để đồng bộ lên Sheet CAI_DAT.`, 'success');
    }
}
window.themEmailQuanTriMoi = themEmailQuanTriMoi;

function xoaEmailQuanTri(idx) {
    if (!window.quyenSuaChua) return;
    let emailXoa = thongSoHocVu.DANH_SACH_QUAN_TRI[idx];
    if (!confirm(`Gỡ quyền Quản trị tối cao (Admin) của [${emailXoa}]?`)) return;
    thongSoHocVu.DANH_SACH_QUAN_TRI.splice(idx, 1);
    localStorage.setItem(layKhoaCachLy('DANH_SACH_QUAN_TRI'), JSON.stringify(thongSoHocVu.DANH_SACH_QUAN_TRI));
    hienThiDanhSachQuanTriUI();
    apDungQuyenTheoTaiKhoanHienTai();
}
window.xoaEmailQuanTri = xoaEmailQuanTri;

// Khởi chạy tự động khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    taiDuLieuPhanQuyenTuMayChu();
    setTimeout(khoiTaoGoogleSignInButton, 400);
    setTimeout(khoiTaoGoogleSignInButton, 1500);
});

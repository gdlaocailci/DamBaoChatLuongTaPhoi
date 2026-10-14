/**
 * =========================================================================
 * QA-EDUSYS | TỆP CẤU HÌNH THÔNG TIN ĐƠN VỊ, GOOGLE OAUTH & MA TRẬN PHÂN QUYỀN
 * Tệp: ketnoi.js
 * Mục đích: Lưu trữ khai báo GOOGLE_CLIENT_ID đăng nhập Google, tên trường,
 *           danh sách Email Quản trị (Admin) và dữ liệu mẫu Ma trận Phân quyền
 *           (Tương thích 100% với cấu trúc PhanQuyenAdmin.js & code_TKB_TP.gs).
 * =========================================================================
 */

// 1. MÃ ĐỊNH DANH ĐĂNG NHẬP GOOGLE OAUTH 2.0 (GOOGLE IDENTITY SERVICES)
const GOOGLE_CLIENT_ID = "1097384743947-1jdc5rhhmbu0s9jp5vgt814g4f4id7lu.apps.googleusercontent.com";

// 2. CẤU HÌNH KẾT NỐI MÁY CHỦ BACKEND GOOGLE APPS SCRIPT (ĐỒNG BỘ VỚI PhanQuyenAdmin.js)
const CAU_HINH_FRONTEND = {
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
  URL_API_MAY_CHU: "", // Dán URL Web App Google Apps Script (https://script.google.com/macros/s/.../exec)
  TEN_KHOA_LUU_TRU: "QA_EDUSYS_TT57"
};

const CAUHINH_KETNOI = {
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,

  // 3. THÔNG TIN ĐƠN VỊ & ĐỊNH DANH PHÁP LÝ NHÀ TRƯỜNG (LƯU TẠI SHEET 'CAI_DAT')
  THONG_TIN_TRUONG: {
    TEN_TRUONG: "Trường Phổ thông Dân tộc Bán trú Tiểu học & THCS Số 1",
    MA_DINH_DANH_CSDL: "24018293",                          // Mã số trường trên CSDL ngành Bộ GD&ĐT
    CO_QUAN_QUAN_LY: "Phòng Giáo dục và Đào tạo",          // Cơ quan quản lý cấp trên
    TINH_THANH_PHO: "Tỉnh Lào Cai",
    DIA_CHI: "Phường Cam Đường, Tỉnh Lào Cai",
    NAM_HOC_DANH_GIA: "2026 - 2027",
    CAP_HOC_MAC_DINH: "TIEU_HOC",                           // 'MAM_NON', 'TIEU_HOC', 'THCS', hoặc 'LIEN_CAP'
    MO_HINH_TRUONG: "TRUONG_LIEN_CAP",                      // 'CONG_LAP', 'TU_THUC', 'LIEN_CAP', 'BAN_TRU'
    SO_DIEN_THOAI_HOTLINE: "0214.386.1234",
    WEBSITE_TRUONG: "https://truonghoc.edu.vn"
  },

  // 4. DANH SÁCH TÀI KHOẢN QUẢN TRỊ TỐI CAO (CỘT E TRONG SHEET 'CAI_DAT')
  // Các email nằm trong danh sách này khi đăng nhập Google sẽ tự động có toàn quyền Admin (quyenSuaChua = true)
  DANH_SACH_QUAN_TRI: [
    "nguyenvannam.hieu_truong@gmail.com",
    "ban_giam_hieu@truonghoc.edu.vn",
    "admin@giaoduc.vn"
  ],

  // 5. DỮ LIỆU KHỞI TẠO BẢNG 'PHAN_QUYEN_ADMIN' (4 CỘT CHUẨN ĐỒNG BỘ PhanQuyenAdmin.js):
  // Cấu trúc mỗi dòng: [ "Tài khoản (Email Google hoặc *)", "Tiêu chí được sửa (1.1..4.3)", "Nút chức năng được bấm", "Menu được xem" ]
  DU_LIEU_PHAN_QUYEN_MAC_DINH: [
    [
      "* (Công khai)",
      "",
      "",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuLienCap, menuReports"
    ],
    [
      "tranthithu.pht@gmail.com",
      "1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3",
      "btnChamTieuChi, btnThemMinhChung, btnTaoCayDrive, btnTrichXuatKH, btnXuatBaoCao",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuLienCap, menuReports"
    ],
    [
      "lehoanglong.gv@gmail.com",
      "3.1, 3.2, 3.4, 3.5",
      "btnChamTieuChi, btnThemMinhChung, btnXuatBaoCao",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuReports"
    ],
    [
      "phamthimai.gv@gmail.com",
      "3.3, 4.2, 4.3",
      "btnChamTieuChi, btnThemMinhChung",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence"
    ],
    [
      "dovanquan.csvc@gmail.com",
      "4.1",
      "btnChamTieuChi, btnThemMinhChung",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence"
    ],
    [
      "kiemdinh.pgd@edu.vn",
      "",
      "btnXuatBaoCao",
      "menuDashboard, menuTimeline, menuCriteria, menuEvidence, menuLienCap, menuReports"
    ]
  ],

  // 6. DANH SÁCH NGƯỜI DÙNG CHI TIẾT (ÁNH XẠ HỌ TÊN & CHỨC VỤ HIỂN THỊ TRÊN THẺ TIÊU CHÍ)
  DANH_SACH_NGUOI_DUNG: [
    {
      id: "nam",
      maPin: "123456",
      hoTen: "Thầy Nguyễn Văn Nam",
      chucVu: "Hiệu trưởng (Admin)",
      vaiTroHoiDong: "Chủ tịch Hội đồng TĐG",
      roleType: "admin",
      googleEmail: "nguyenvannam.hieu_truong@gmail.com",
      phuTrach: "Quản trị toàn hệ thống & Phê duyệt 15 Tiêu chí",
      tieuChiDuocSua: ["ALL"],
      initial: "N",
      avatarColor: "bg-indigo-600"
    },
    {
      id: "thu",
      maPin: "123456",
      hoTen: "Cô Trần Thị Thu",
      chucVu: "Phó Hiệu trưởng",
      vaiTroHoiDong: "Phó Chủ tịch / Thư ký HĐ",
      roleType: "reviewer",
      googleEmail: "tranthithu.pht@gmail.com",
      phuTrach: "Tiêu chuẩn 1 & Tiêu chuẩn 2 (TC 1.1 -> 2.3)",
      tieuChiDuocSua: ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3"],
      initial: "T",
      avatarColor: "bg-emerald-600"
    },
    {
      id: "long",
      maPin: "123456",
      hoTen: "Thầy Lê Hoàng Long",
      chucVu: "Tổ trưởng Chuyên môn",
      vaiTroHoiDong: "Ủy viên - Nhóm Chuyên môn",
      roleType: "editor",
      googleEmail: "lehoanglong.gv@gmail.com",
      phuTrach: "Tiêu chuẩn 3: Chuyên môn & Đánh giá (TC 3.1, 3.2, 3.4, 3.5)",
      tieuChiDuocSua: ["3.1", "3.2", "3.4", "3.5"],
      initial: "L",
      avatarColor: "bg-amber-600"
    },
    {
      id: "mai",
      maPin: "123456",
      hoTen: "Cô Phạm Thị Mai",
      chucVu: "Tổng phụ trách Đội / Tư vấn",
      vaiTroHoiDong: "Ủy viên - Nhóm Phong trào & An toàn",
      roleType: "editor",
      googleEmail: "phamthimai.gv@gmail.com",
      phuTrach: "Trải nghiệm, An toàn & Phối hợp (TC 3.3, 4.2, 4.3)",
      tieuChiDuocSua: ["3.3", "4.2", "4.3"],
      initial: "M",
      avatarColor: "bg-pink-600"
    },
    {
      id: "quan",
      maPin: "123456",
      hoTen: "Thầy Đỗ Văn Quân",
      chucVu: "Phụ trách CSVC / Thư viện - Thiết bị",
      vaiTroHoiDong: "Ủy viên - Nhóm CSVC",
      roleType: "editor",
      googleEmail: "dovanquan.csvc@gmail.com",
      phuTrach: "Cơ sở vật chất & Thiết bị (TC 4.1)",
      tieuChiDuocSua: ["4.1"],
      initial: "Q",
      avatarColor: "bg-blue-600"
    },
    {
      id: "doankiemtra",
      maPin: "123456",
      hoTen: "Đoàn Đánh giá ngoài / Giám sát",
      chucVu: "Cán bộ Thẩm định / Thanh tra",
      vaiTroHoiDong: "Quan sát viên / Đánh giá ngoài",
      roleType: "viewer",
      googleEmail: "kiemdinh.pgd@edu.vn",
      phuTrach: "Chỉ xem hồ sơ, báo cáo & mở liên kết minh chứng",
      tieuChiDuocSua: [],
      initial: "Đ",
      avatarColor: "bg-slate-600"
    }
  ],

  // 7. ĐƯỜNG DẪN KẾT NỐI HẠ TẦNG SỐ (URL ENDPOINTS & DRIVE CLOUD)
  KET_NOI_HA_TANG: {
    GOOGLE_WEB_APP_URL: "", 
    GOOGLE_DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/YOUR_EVIDENCE_FOLDER_ID",
    CSDL_NGANH_URL: "https://csdl.moet.gov.vn",
    TEMIS_URL: "https://temis.csdl.edu.vn"
  },

  // 8. THÔNG SỐ VẬN HÀNH, ĐỒNG BỘ ĐA NGƯỜI DÙNG & NGOẠI TUYẾN
  CAU_HINH_VAN_HANH: {
    KENH_DONG_BO_BUS: "qa_edusys_bus",
    THOI_GIAN_TU_DONG_LUU_MS: 10000,
    CHE_DO_DONG_BO: "HYBRID",
    CANH_BAO_XUNG_DOT_OCC: true,
    KHOA_MEM_GRANULAR_LOCK: true,
    BAT_BUOC_PHAN_QUYEN_MA_TRAN: true
  }
};

if (typeof window !== "undefined") {
  window.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;
  window.CAU_HINH_FRONTEND = CAU_HINH_FRONTEND;
  window.CAUHINH_KETNOI = CAUHINH_KETNOI;
}

/**
 * =========================================================================
 * QA-EDUSYS | TỆP CẤU HÌNH THÔNG TIN ĐƠN VỊ, ĐỊNH DANH & KẾT NỐI
 * Tệp: ketnoi.js
 * Mục đích: Lưu trữ toàn bộ khai báo về tên riêng nhà trường, mã định danh,
 *           danh sách cán bộ giáo viên, email Google, quyền hạn và URL kết nối.
 * Khi nâng cấp giao diện hoặc bổ sung tính năng phần mềm (index.html),
 * TUYỆT ĐỐI KHÔNG CẦN CHỈNH SỬA TỆP NÀY.
 * =========================================================================
 */

const CAUHINH_KETNOI = {
  // 1. THÔNG TIN ĐƠN VỊ & ĐỊNH DANH PHÁP LÝ NHÀ TRƯỜNG
  THONG_TIN_TRUONG: {
    TEN_TRUONG: "Trường TH&THC Tả Phời",
    MA_DINH_DANH_CSDL: "24018293",                          // Mã số trường trên CSDL ngành Bộ GD&ĐT
    CO_QUAN_QUAN_LY: "UBND xã Hợp Thành",          // Cơ quan quản lý cấp trên
    TINH_THANH_PHO: "Tỉnh Lào Cai",
    DIA_CHI: "Xã Hợp Thành, Tỉnh Lào Cai",
    NAM_HOC_DANH_GIA: "2026 - 2027",
    CAP_HOC_MAC_DINH: "TIEU_HOC",                           // 'MAM_NON', 'TIEU_HOC', 'THCS', hoặc 'LIEN_CAP'
    MO_HINH_TRUONG: "TRUONG_LIEN_CAP",                      // 'CONG_LAP', 'TU_THUC', 'LIEN_CAP', 'BAN_TRU'
    SO_DIEN_THOAI_HOTLINE: "0214.386.1234",
    WEBSITE_TRUONG: "https://truonghoc.edu.vn"
  },

  // 2. DANH SÁCH TÀI KHOẢN CÁN BỘ, ĐỊNH DANH GOOGLE & EMAIL
  // Khai báo danh sách Hội đồng Tự đánh giá và phân quyền phụ trách tiêu chuẩn
  DANH_SACH_NGUOI_DUNG: [
    {
      id: "nam",
      hoTen: "Thầy Nguyễn Văn Nam",
      chucVu: "Hiệu trưởng",
      vaiTroHoiDong: "Chủ tịch Hội đồng TĐG",
      roleType: "admin",                                    // 'admin': Toàn quyền quản trị, duyệt báo cáo, phục hồi thùng rác
      googleEmail: "nguyenvannam.hieu_truong@gmail.com",    // Email Google dùng cho xác thực & phân quyền
      phuTrach: "Toàn bộ 04 Tiêu chuẩn & Kết luận Mức đạt",
      initial: "N",
      avatarColor: "bg-indigo-600"
    },
    {
      id: "thu",
      hoTen: "Cô Trần Thị Thu",
      chucVu: "Phó Hiệu trưởng",
      vaiTroHoiDong: "Phó Chủ tịch / Thư ký Hội đồng",
      roleType: "reviewer",                                 // 'reviewer': Quyền thẩm tra, duyệt minh chứng, viết tổng hợp
      googleEmail: "tranthithu.pht@gmail.com",
      phuTrach: "Tiêu chuẩn 1 & Tiêu chuẩn 2 (Tổ chức & Đội ngũ)",
      initial: "T",
      avatarColor: "bg-emerald-600"
    },
    {
      id: "long",
      hoTen: "Thầy Lê Hoàng Long",
      chucVu: "Tổ trưởng Chuyên môn",
      vaiTroHoiDong: "Ủy viên Hội đồng TĐG",
      roleType: "editor",                                   // 'editor': Quyền nhập liệu, tải minh chứng cho tiêu chí được giao
      googleEmail: "lehoanglong.gv@gmail.com",
      phuTrach: "Tiêu chuẩn 3 (Hoạt động giáo dục & Kết quả đầu ra)",
      initial: "L",
      avatarColor: "bg-amber-600"
    },
    {
      id: "mai",
      hoTen: "Cô Phạm Thị Mai",
      chucVu: "Giáo viên / Tổng phụ trách Đội",
      vaiTroHoiDong: "Ủy viên Hội đồng TĐG",
      roleType: "editor",
      googleEmail: "phamthimai.gv@gmail.com",
      phuTrach: "Tiêu chí 3.3, 4.2 (Phong trào, Trải nghiệm, An toàn học đường)",
      initial: "M",
      avatarColor: "bg-pink-600"
    },
    {
      id: "quan",
      hoTen: "Thầy Đỗ Văn Quân",
      chucVu: "Nhân viên Cơ sở vật chất / Thiết bị",
      vaiTroHoiDong: "Ủy viên Hội đồng TĐG",
      roleType: "editor",
      googleEmail: "dovanquan.csvc@gmail.com",
      phuTrach: "Tiêu chuẩn 4 (Cơ sở vật chất, Thư viện & Thiết bị dạy học)",
      initial: "Q",
      avatarColor: "bg-blue-600"
    }
  ],

  // 3. ĐƯỜNG DẪN KẾT NỐI HẠ TẦNG SỐ (URL ENDPOINTS & DRIVE CLOUD)
  KET_NOI_HA_TANG: {
    GOOGLE_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzKkzKRwlsQv_cyM9d-sjgKLklzDEqLnJKi9tKFfDJENGr-CcQMbtvGgoTKfOKau-pHJA/exec", 
    GOOGLE_DRIVE_FOLDER_URL: "https://drive.google.com/drive/u/0/folders/14SLCUGa1Rke-DxRRnTLvCNxE-fii4807",
    CSDL_NGANH_URL: "https://csdl.moet.gov.vn",
    TEMIS_URL: "https://temis.csdl.edu.vn"
  },

  // 4. THÔNG SỐ VẬN HÀNH, ĐỒNG BỘ ĐA NGƯỜI DÙNG & NGOẠI TUYẾN
  CAU_HINH_VAN_HANH: {
    KENH_DONG_BO_BUS: "qa_edusys_bus",                     // Tên kênh BroadcastChannel đồng bộ đa tab/máy
    THOI_GIAN_TU_DONG_LUU_MS: 10000,                       // Tự động lưu nháp mỗi 10 giây (10000 ms)
    CHE_DO_DONG_BO: "HYBRID",                              // 'HYBRID': Tự động kết hợp LocalStorage và Google Apps Script
    CANH_BAO_XUNG_DOT_OCC: true,                           // Bật cảnh báo 3-Way Diff khi phát hiện 2 người sửa cùng lúc
    KHOA_MEM_GRANULAR_LOCK: true                           // Bật khóa mềm hiển thị avatar người đang biên tập
  }
};

if (typeof window !== "undefined") {
  window.CAUHINH_KETNOI = CAUHINH_KETNOI;
}

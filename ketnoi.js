/**
 * =========================================================================
 * QA-EDUSYS | TỆP CẤU HÌNH THÔNG TIN ĐƠN VỊ, ĐỊNH DANH & MA TRẬN PHÂN QUYỀN
 * Tệp: ketnoi.js
 * Mục đích: Lưu trữ toàn bộ khai báo về tên riêng nhà trường, mã định danh,
 *           danh sách cán bộ giáo viên, email Google, MA TRẬN PHÂN QUYỀN
 *           theo từng tiêu chí và URL kết nối.
 * Khi nâng cấp giao diện hoặc bổ sung tính năng phần mềm (index.html),
 * TUYỆT ĐỐI KHÔNG CẦN CHỈNH SỬA TỆP NÀY.
 * =========================================================================
 */

const CAUHINH_KETNOI = {
  // 1. THÔNG TIN ĐƠN VỊ & ĐỊNH DANH PHÁP LÝ NHÀ TRƯỜNG
  THONG_TIN_TRUONG: {
    TEN_TRUONG: "Trường Phổ thông Dân tộc Bán trú Tiểu học & THCS Số 1",
    MA_DINH_DANH_CSDL: "24018293",                          // Mã số trường trên CSDL ngành Bộ GD&ĐT
    CO_QUAN_QUAN_LY: "Phòng Giáo dục và Đào tạo",          // Cơ quan quản lý cấp trên
    TINH_THANH_PHO: "Tỉnh Lào Cai",
    DIA_CHI: "Huyện Bắc Hà, Tỉnh Lào Cai",
    NAM_HOC_DANH_GIA: "2026 - 2027",
    CAP_HOC_MAC_DINH: "TIEU_HOC",                           // 'MAM_NON', 'TIEU_HOC', 'THCS', hoặc 'LIEN_CAP'
    MO_HINH_TRUONG: "TRUONG_LIEN_CAP",                      // 'CONG_LAP', 'TU_THUC', 'LIEN_CAP', 'BAN_TRU'
    SO_DIEN_THOAI_HOTLINE: "0214.386.1234",
    WEBSITE_TRUONG: "https://truonghoc.edu.vn"
  },

  // 2. MA TRẬN PHÂN QUYỀN NGƯỜI DÙNG THEO TIÊU CHÍ (CRITERION-LEVEL RBAC MATRIX)
  // Quy tắc:
  // - tieuChiDuocSua: ["ALL"] -> Được sửa toàn bộ 15 tiêu chí
  // - tieuChiDuocSua: ["1.1", "1.2", ...] -> Chỉ được sửa và thêm/xóa minh chứng ở các tiêu chí liệt kê; các tiêu chí khác CHỈ ĐƯỢC XEM
  // - tieuChiDuocSua: [] -> Chế độ CHỈ XEM (Viewer / Đoàn kiểm tra / Giám sát) trên toàn hệ thống
  DANH_SACH_NGUOI_DUNG: [
    {
      id: "nam",
      hoTen: "Thầy Nguyễn Văn Nam",
      chucVu: "Hiệu trưởng",
      vaiTroHoiDong: "Chủ tịch Hội đồng TĐG",
      roleType: "admin",                                    // 'admin': Toàn quyền phê duyệt, quản trị, khôi phục thùng rác
      googleEmail: "nguyenvannam.hieu_truong@gmail.com",
      phuTrach: "Phê duyệt toàn bộ 04 Tiêu chuẩn (15 Tiêu chí)",
      tieuChiDuocSua: ["ALL"],                              // Toàn quyền tương tác tất cả tiêu chí
      initial: "N",
      avatarColor: "bg-indigo-600"
    },
    {
      id: "thu",
      hoTen: "Cô Trần Thị Thu",
      chucVu: "Phó Hiệu trưởng",
      vaiTroHoiDong: "Phó Chủ tịch / Thư ký HĐ",
      roleType: "reviewer",                                 // 'reviewer': Thẩm tra & biên tập nhóm tiêu chuẩn được giao
      googleEmail: "tranthithu.pht@gmail.com",
      phuTrach: "Tiêu chuẩn 1 & Tiêu chuẩn 2 (TC 1.1 -> 2.3)",
      tieuChiDuocSua: ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3"], // Chỉ sửa TC 1 & 2, các TC 3 & 4 chỉ xem
      initial: "T",
      avatarColor: "bg-emerald-600"
    },
    {
      id: "long",
      hoTen: "Thầy Lê Hoàng Long",
      chucVu: "Tổ trưởng Chuyên môn",
      vaiTroHoiDong: "Ủy viên - Nhóm Chuyên môn",
      roleType: "editor",                                   // 'editor': Biên tập tiêu chí chuyên môn được giao
      googleEmail: "lehoanglong.gv@gmail.com",
      phuTrach: "Tiêu chuẩn 3: Chuyên môn & Đánh giá (TC 3.1, 3.2, 3.4, 3.5)",
      tieuChiDuocSua: ["3.1", "3.2", "3.4", "3.5"],         // Chỉ sửa 4 tiêu chí chuyên môn, còn lại chỉ xem
      initial: "L",
      avatarColor: "bg-amber-600"
    },
    {
      id: "mai",
      hoTen: "Cô Phạm Thị Mai",
      chucVu: "Tổng phụ trách Đội / Tư vấn",
      vaiTroHoiDong: "Ủy viên - Nhóm Phong trào & An toàn",
      roleType: "editor",
      googleEmail: "phamthimai.gv@gmail.com",
      phuTrach: "Trải nghiệm, An toàn & Phối hợp (TC 3.3, 4.2, 4.3)",
      tieuChiDuocSua: ["3.3", "4.2", "4.3"],                // Chỉ sửa TC 3.3, 4.2, 4.3
      initial: "M",
      avatarColor: "bg-pink-600"
    },
    {
      id: "quan",
      hoTen: "Thầy Đỗ Văn Quân",
      chucVu: "Phụ trách CSVC / Thư viện - Thiết bị",
      vaiTroHoiDong: "Ủy viên - Nhóm CSVC",
      roleType: "editor",
      googleEmail: "dovanquan.csvc@gmail.com",
      phuTrach: "Cơ sở vật chất & Thiết bị (TC 4.1)",
      tieuChiDuocSua: ["4.1"],                              // Chỉ sửa đúng TC 4.1, các tiêu chí khác chỉ xem
      initial: "Q",
      avatarColor: "bg-blue-600"
    },
    {
      id: "doankiemtra",
      hoTen: "Đoàn Đánh giá ngoài / Giám sát",
      chucVu: "Cán bộ Thẩm định / Thanh tra",
      vaiTroHoiDong: "Quan sát viên / Đánh giá ngoài",
      roleType: "viewer",                                   // 'viewer': CHỈ ĐƯỢC XEM 100%, không được sửa/xóa bất kỳ mục nào
      googleEmail: "kiamdinh.pgd@edu.vn",
      phuTrach: "Chỉ xem hồ sơ, báo cáo & mở liên kết minh chứng",
      tieuChiDuocSua: [],                                   // Mảng rỗng = Chỉ xem toàn bộ
      initial: "Đ",
      avatarColor: "bg-slate-600"
    }
  ],

  // 3. ĐƯỜNG DẪN KẾT NỐI HẠ TẦNG SỐ (URL ENDPOINTS & DRIVE CLOUD)
  KET_NOI_HA_TANG: {
    GOOGLE_WEB_APP_URL: "", 
    GOOGLE_DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/YOUR_EVIDENCE_FOLDER_ID",
    CSDL_NGANH_URL: "https://csdl.moet.gov.vn",
    TEMIS_URL: "https://temis.csdl.edu.vn"
  },

  // 4. THÔNG SỐ VẬN HÀNH, ĐỒNG BỘ ĐA NGƯỜI DÙNG & NGOẠI TUYẾN
  CAU_HINH_VAN_HANH: {
    KENH_DONG_BO_BUS: "qa_edusys_bus",
    THOI_GIAN_TU_DONG_LUU_MS: 10000,
    CHE_DO_DONG_BO: "HYBRID",
    CANH_BAO_XUNG_DOT_OCC: true,
    KHOA_MEM_GRANULAR_LOCK: true,
    BAT_BUOC_PHAN_QUYEN_MA_TRAN: true                       // Bật kiểm soát phân quyền cứng theo ma trận tiêu chí
  }
};

if (typeof window !== "undefined") {
  window.CAUHINH_KETNOI = CAUHINH_KETNOI;
}

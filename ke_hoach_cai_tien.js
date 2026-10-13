/**
 * =========================================================================
 * QA-EDUSYS | ĐỘNG CƠ TỰ ĐỘNG XUẤT KẾ HOẠCH CẢI TIẾN CHẤT LƯỢNG GIÁO DỤC
 * Tệp: ke_hoach_cai_tien.js
 * Căn cứ pháp lý: Biểu mẫu số 2, Phụ lục V - Thông tư số 57/2026/TT-BGDĐT
 * Mục đích: Tự động rà soát, trích xuất toàn bộ tồn tại/hạn chế từ 15 tiêu chí
 *           đã đánh giá để tạo lập Kế hoạch cải tiến chất lượng chính thức.
 * =========================================================================
 */

const DongCoKeHoachCaiTien = {
  /**
   * 1. Tự động trích xuất các tiêu chí có tồn tại, hạn chế từ dữ liệu tự đánh giá
   * @param {Array} criteriaList Danh sách 15 tiêu chí của cấp học hiện tại
   * @param {Boolean} onlyWeaknesses true: chỉ lấy tiêu chí có tồn tại; false: lấy toàn bộ 15 tiêu chí
   */
  trichXuatDanhSachCaiTien: function(criteriaList, onlyWeaknesses = true) {
    if (!criteriaList || !Array.isArray(criteriaList)) return [];

    return criteriaList.filter(c => {
      if (!onlyWeaknesses) return true;
      const weakness = (c.evaluation?.weaknesses || "").trim();
      const level = c.evaluation?.level ?? 1;
      
      // Tiêu chí có điểm yếu thực tế hoặc mới đạt Mức 1 cần nâng lên Mức 2
      const coTonTaiThucTe = weakness !== "" && 
                             weakness !== "Không có" && 
                             !weakness.toLowerCase().includes("đạt chuẩn hoàn toàn");
      const chuaDatMuc2 = (level === 0 || level === 1);
      
      return coTonTaiThucTe || chuaDatMuc2;
    }).map((c, index) => {
      const weakness = (c.evaluation?.weaknesses || "").trim() || 
                       "Một số hồ sơ minh chứng số chưa được cập nhật kịp thời; cần tiếp tục bồi dưỡng ứng dụng CNTT.";
      
      let actionPlan = (c.evaluation?.actionPlan || "").trim();
      if (!actionPlan || actionPlan === "Duy trì bồi dưỡng thường xuyên và kiểm tra định kỳ theo 5 giai đoạn năm học.") {
        actionPlan = this.goiYBienPhapThongMinh(c.code, c.id, c.std);
      }

      const stageInfo = this.layThongTinGiaiDoan(c.stage || 2);
      const supervisor = (c.std === 1 || c.std === 2) ? "Phó Hiệu trưởng" : (c.std === 3 ? "Hiệu trưởng" : "Ban Thanh tra ND / BGH");
      const resources = (c.std === 4) ? "Kinh phí chi thường xuyên & Ngân sách CSVC" : "Nguồn nhân lực & Kho học liệu số";

      return {
        stt: index + 1,
        criterionId: c.id,
        criterionCode: c.code,
        criterionName: c.name,
        mandatory: c.mandatory,
        standardId: c.std,
        level: c.evaluation?.level ?? 1,
        weakness: weakness,
        actionPlan: actionPlan,
        stage: c.stage || 2,
        stageTime: stageInfo.time,
        department: c.dept || "Ban Giám hiệu / Tổ Chuyên môn",
        supervisor: supervisor,
        resources: resources
      };
    });
  },

  /**
   * 2. Bộ gợi ý biện pháp cải tiến chất lượng thông minh chuẩn Thông tư 57
   */
  goiYBienPhapThongMinh: function(code, id, std) {
    const bienPhapMau = {
      "TC 1.3": "Tập huấn chuyên sâu kỹ năng quản lý CSDL ngành cho tổ văn phòng; thực hiện rà soát, đối chiếu dữ liệu học sinh và đội ngũ định kỳ vào ngày 25 hằng tháng.",
      "TC 1.4": "Triển khai tự đánh giá thường xuyên theo đúng 5 giai đoạn năm học của Thông tư 57; công khai đầy đủ cam kết chất lượng trên cổng thông tin điện tử của trường trước 15/6.",
      "TC 2.1": "Tham gia đầy đủ các lớp bồi dưỡng nâng cao năng lực quản trị trường học số; ứng dụng chuyển đổi số trong quản lý văn bản và điều hành chuyên môn.",
      "TC 2.2": "Tạo điều kiện cho giáo viên tham gia bồi dưỡng nâng chuẩn cử nhân theo Luật GD 2019; đẩy mạnh sinh hoạt chuyên môn theo nghiên cứu bài học và ứng dụng CNTT.",
      "TC 3.1": "Xây dựng kế hoạch giáo dục linh hoạt, phân bổ thời lượng các môn học và hoạt động trải nghiệm hợp lý; lồng ghép hiệu quả giáo dục kỹ năng sống và STEM.",
      "TC 3.2": "Đổi mới phương pháp dạy học theo hướng phát triển năng lực; thực hiện nghiêm túc thông tư đánh giá học sinh; duy trì sổ theo dõi điện tử và học bạ số đồng bộ.",
      "TC 4.1": "Kiểm kê, phân loại và bảo dưỡng định kỳ thiết bị dạy học tối thiểu; tham mưu Phòng GD&ĐT đầu tư bổ sung phòng bộ môn và học liệu số hóa đạt chuẩn.",
      "TC 4.2": "Tăng cường kiểm tra an toàn PCCC và vệ sinh an toàn thực phẩm bếp ăn bán trú; phát huy hiệu quả phòng tư vấn tâm lý học đường trong phòng chống bạo lực học đường."
    };

    if (bienPhapMau[code]) return bienPhapMau[code];
    if (std === 1) return "Kiện toàn cơ cấu tổ chức, rà soát quy chế hoạt động của Hội đồng trường và các bộ phận chuyên môn theo chu kỳ năm học.";
    if (std === 2) return "Bồi dưỡng chuyên môn nghiệp vụ thường xuyên; thực hiện đánh giá chuẩn nghề nghiệp TEMIS khách quan, công bằng.";
    if (std === 3) return "Đổi mới hình thức tổ chức dạy học; tổ chức đa dạng các hoạt động ngoại khóa, câu lạc bộ sở thích và nâng cao chất lượng giáo dục toàn diện.";
    return "Tăng cường huy động các nguồn lực hợp pháp để cải tạo khuôn viên xanh - sạch - đẹp và bổ sung trang thiết bị dạy học hiện đại.";
  },

  /**
   * 3. Lấy thông tin thời gian theo 5 giai đoạn năm học
   */
  layThongTinGiaiDoan: function(stageNum) {
    const stages = {
      1: { name: "Giai đoạn 1", time: "Tháng 8 - 9 (Đầu năm học)" },
      2: { name: "Giai đoạn 2", time: "Tháng 10 - 12 (Học kỳ I)" },
      3: { name: "Giai đoạn 3", time: "Tháng 1 - 4 (Học kỳ II)" },
      4: { name: "Giai đoạn 4", time: "Tháng 5 (Tổng kết năm học)" },
      5: { name: "Giai đoạn 5", time: "Tháng 6 - 7 (Cập nhật CSDL & Công khai)" }
    };
    return stages[stageNum] || stages[2];
  },

  /**
   * 4. Sinh mã HTML hoàn chỉnh cho Biểu mẫu số 2 (Phụ lục V)
   */
  sinhBieuMau2Html: function(schoolInfo, criteriaList, onlyWeaknesses = true) {
    const danhSach = this.trichXuatDanhSachCaiTien(criteriaList, onlyWeaknesses);
    const tongSoTonTai = criteriaList.filter(c => {
      const w = (c.evaluation?.weaknesses || "").trim();
      return w !== "" && w !== "Không có" && !w.toLowerCase().includes("đạt chuẩn hoàn toàn");
    }).length;

    return `
      <!-- Toolbar Điều khiển Trích xuất Thông minh -->
      <div class="no-print mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="inline-flex items-center text-xs font-extrabold text-indigo-900">
              <i class="fa-solid fa-wand-magic-sparkles text-indigo-600 mr-2 text-sm"></i>
              Động cơ Tự động Trích xuất Tồn tại & Lập Kế hoạch Cải tiến (Thông tư 57)
            </span>
            <p class="text-[11px] text-slate-600">
              Hệ thống tự động phát hiện các mục <strong>"Điểm yếu / Tồn tại"</strong> đã nhập ở 15 tiêu chí để kết xuất thành Kế hoạch cải tiến chính thức.
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <button onclick="toggleImprovementFilter(true)" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${onlyWeaknesses ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}">
              <i class="fa-solid fa-filter mr-1"></i>Chỉ lấy Tiêu chí có Tồn tại (${tongSoTonTai})
            </button>
            <button onclick="toggleImprovementFilter(false)" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${!onlyWeaknesses ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}">
              Xem Toàn bộ 15 Tiêu chí
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200/60 text-xs">
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Tiêu chí có Tồn tại:</span>
            <strong class="text-rose-600 text-sm">${tongSoTonTai} / 15 tiêu chí</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Cần nâng lên Mức 2:</span>
            <strong class="text-amber-600 text-sm">${criteriaList.filter(c => (c.evaluation?.level ?? 1) === 1).length} tiêu chí</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Kế hoạch cải tiến:</span>
            <strong class="text-indigo-600 text-sm">${danhSach.length} biện pháp cụ thể</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Trạng thái Kế hoạch:</span>
            <strong class="text-emerald-600 text-sm"><i class="fa-solid fa-circle-check mr-1"></i>Sẵn sàng ban hành</strong>
          </div>
        </div>
      </div>

      <!-- Văn bản Kế hoạch Cải tiến Chất lượng Giáo dục Chuẩn Biểu mẫu số 2 -->
      <div class="text-center space-y-1 mb-8">
        <div class="text-xs uppercase font-semibold text-slate-500">${(schoolInfo.CO_QUAN_QUAN_LY || "PHÒNG GD&ĐT").toUpperCase()}</div>
        <div class="text-xs font-bold text-slate-800 uppercase tracking-wide">${(schoolInfo.TEN_TRUONG || "CƠ SỞ GIÁO DỤC").toUpperCase()}</div>
        <div class="w-20 h-0.5 bg-slate-300 mx-auto my-1.5"></div>
        <div class="text-xs text-slate-500 italic mt-2">${(schoolInfo.DIA_CHI || "").split(",")[0] || "Địa phương"}, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
        <h1 class="text-xl font-black text-slate-900 uppercase mt-4">
          KẾ HOẠCH CẢI TIẾN CHẤT LƯỢNG GIÁO DỤC NĂM HỌC ${schoolInfo.NAM_HOC_DANH_GIA || "2026 - 2027"}
        </h1>
        <p class="text-xs text-slate-600 font-semibold italic">(Biểu mẫu số 2, Phụ lục V - Thông tư số 57/2026/TT-BGDĐT ngày 07/07/2026 của Bộ GD&ĐT)</p>
      </div>

      <div class="space-y-4 text-xs leading-relaxed">
        <p class="text-slate-700 text-justify">
          Căn cứ kết quả Tự đánh giá chất lượng giáo dục năm học ${schoolInfo.NAM_HOC_DANH_GIA || "2026 - 2027"}, Hội đồng Tự đánh giá nhà trường xây dựng Kế hoạch cải tiến chất lượng giáo dục đối với các tiêu chí còn tồn tại, hạn chế nhằm nâng cao hiệu quả hoạt động giáo dục, duy trì và nâng chuẩn kiểm định theo quy định tại Thông tư 57/2026/TT-BGDĐT:
        </p>

        <table class="w-full border border-slate-300 text-left border-collapse">
          <thead class="bg-slate-100 font-bold border-b border-slate-300 text-[11px] text-slate-800">
            <tr>
              <th class="p-2 border-r border-slate-300 w-10 text-center">STT</th>
              <th class="p-2 border-r border-slate-300 w-36">Tiêu chuẩn, Tiêu chí</th>
              <th class="p-2 border-r border-slate-300">Tồn tại, hạn chế cần khắc phục<br><span class="font-normal text-[10px] text-slate-500">(Trích xuất từ Tự đánh giá)</span></th>
              <th class="p-2 border-r border-slate-300">Mục tiêu & Biện pháp cải tiến chất lượng cụ thể</th>
              <th class="p-2 border-r border-slate-300 w-28 text-center">Thời gian hoàn thành</th>
              <th class="p-2 border-r border-slate-300 w-28">Người / Bộ phận thực hiện</th>
              <th class="p-2 border-r border-slate-300 w-28">Người kiểm tra, giám sát</th>
              <th class="p-2 w-28">Điều kiện thực hiện</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${danhSach.map(item => `
              <tr class="hover:bg-slate-50/70 transition">
                <td class="p-2 border-r border-slate-200 font-bold text-center text-slate-600">${item.stt}</td>
                <td class="p-2 border-r border-slate-200">
                  <span class="font-mono font-bold text-indigo-700 block">${item.criterionCode} ${item.mandatory ? '<span class="text-rose-600">(*)</span>' : ''}</span>
                  <span class="text-slate-800 text-[11px] leading-tight block mt-0.5">${item.criterionName}</span>
                </td>
                <td class="p-2 border-r border-slate-200 text-rose-900 bg-rose-50/30 font-medium">
                  ${item.weakness}
                </td>
                <td class="p-2 border-r border-slate-200 text-slate-800 leading-normal">
                  ${item.actionPlan}
                </td>
                <td class="p-2 border-r border-slate-200 text-center font-mono text-[11px] text-slate-700 whitespace-nowrap">
                  <span class="px-1.5 py-0.5 rounded bg-slate-100 font-bold">GĐ ${item.stage}</span>
                  <div class="text-[10px] text-slate-500 mt-0.5">${item.stageTime}</div>
                </td>
                <td class="p-2 border-r border-slate-200 text-slate-700">
                  <strong>${item.department}</strong>
                </td>
                <td class="p-2 border-r border-slate-200 text-slate-700">
                  ${item.supervisor}
                </td>
                <td class="p-2 text-slate-600 text-[11px]">
                  ${item.resources}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Ký duyệt chính thức -->
        <div class="grid grid-cols-2 pt-8 text-xs text-center">
          <div>
            <div class="font-bold uppercase text-slate-800">NGƯỜI LẬP KẾ HOẠCH</div>
            <div class="text-[11px] text-slate-500 italic mt-0.5">(Thư ký Hội đồng Tự đánh giá)</div>
            <div class="italic text-slate-400 mt-14">(Ký và ghi rõ họ tên)</div>
            <div class="font-bold mt-2 text-slate-900" id="print-secretary-name">Cô Trần Thị Thu</div>
          </div>
          <div>
            <div class="font-bold uppercase text-slate-800">HIỆU TRƯỞNG PHÊ DUYỆT</div>
            <div class="text-[11px] text-slate-500 italic mt-0.5">(Chủ tịch Hội đồng Tự đánh giá)</div>
            <div class="italic text-slate-400 mt-14">(Ký, đóng dấu và ghi rõ họ tên)</div>
            <div class="font-bold mt-2 text-slate-900" id="print-principal-name">Thầy Nguyễn Văn Nam</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 5. Xuất tệp Word (.doc) cho Kế hoạch Cải tiến chất lượng
   */
  xuatWordKeHoach: function(htmlContent, fileName = "Ke_Hoach_Cai_Tien_Chat_Luong_TT57.doc") {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Ke_Hoach_Cai_Tien_TT57</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; font-size: 11pt; }
        th { background-color: #f2f2f2; text-align: center; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .no-print { display: none; }
      </style>
      </head><body>`;
    const footer = `</body></html>`;
    const fullDoc = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + fullDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Đăng ký toàn cục
if (typeof window !== "undefined") {
  window.DongCoKeHoachCaiTien = DongCoKeHoachCaiTien;
}

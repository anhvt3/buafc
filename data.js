const DATA_VERSION = "buafc-2026-07-22-v9";


const INITIAL_MEMBERS = [
  { name: "Vũ Thế Anh", status: "active" },
  { name: "Hà Phú", status: "active" },
  { name: "Đoàn Thế Anh", status: "active" },
  { name: "Nguyễn Quang Tuyên", status: "active" },
  { name: "Trịnh Minh Châm", status: "active" },
  { name: "Hùng Chu", status: "active" },
  { name: "Nguyễn Viết Hòa", status: "active" },
  { name: "Trần Việt Hưng", status: "active" },
  { name: "Trần Văn Tuấn", status: "active" },
  { name: "Nguyễn Ngọc Quý", status: "active" },
  { name: "Nguyễn Quang Thái", status: "active" },
  { name: "Phạm Duy", status: "active" },
  { name: "Phạm Tiến Hùng", status: "active" },
  { name: "Minh Quyền", status: "active" },
  { name: "Nguyễn Đình Ngọc", status: "paused" },
  { name: "Phạm Duy Tiên", status: "active" },
  { name: "Trịnh Minh Chiêm", status: "paused" },
  { name: "Vũ Văn An", status: "active" },
  { name: "Trần Nhật Thăng", status: "active" },
  { name: "Hồ Trọng Thuân", status: "active" },
  { name: "Nguyễn Khắc Thiên", status: "active" },
  { name: "Trần Đức", status: "active" },
  { name: "Nguyễn Minh", status: "active" },
  { name: "Nguyễn Khắc Dũng", status: "active" },
  { name: "Lê Ngọc Tân", status: "active" },
  { name: "Nghiêm Mạnh Hùng", status: "paused" },
  { name: "Duy Anh", status: "active" }
];

const INITIAL_MATCHES = [
  { date: "2026-01-20", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hà Phú", "Đoàn Thế Anh", "Nguyễn Đình Ngọc", "Nguyễn Quang Tuyên", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trịnh Minh Châm"], playedTeam: ["Hà Phú", "Đoàn Thế Anh", "Nguyễn Đình Ngọc", "Nguyễn Quang Tuyên", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trịnh Minh Châm", "Vũ Thế Anh", "Hùng Chu", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Nguyễn Quang Thái", "Phạm Duy", "Phạm Tiến Hùng"] },
  { date: "2026-01-27", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phạm Duy Tiên", "Nguyễn Viết Hòa", "Đoàn Thế Anh", "Nguyễn Quang Thái", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Trần Việt Hưng", "Hà Phú"], playedTeam: ["Phạm Duy Tiên", "Nguyễn Viết Hòa", "Đoàn Thế Anh", "Nguyễn Quang Thái", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Trần Việt Hưng", "Hà Phú", "Vũ Thế Anh", "Trịnh Minh Châm", "Phạm Tiến Hùng", "Hùng Chu", "Nguyễn Quang Tuyên", "Vũ Văn An", "Hồ Trọng Thuân", "Trần Đức"] },
  { date: "2026-02-03", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Trần Văn Tuấn", "Phạm Tiến Hùng", "Đoàn Thế Anh", "Trịnh Minh Chiêm", "Hùng Chu", "Nguyễn Viết Hòa", "Vũ Văn An"], playedTeam: ["Trần Văn Tuấn", "Phạm Tiến Hùng", "Đoàn Thế Anh", "Trịnh Minh Chiêm", "Hùng Chu", "Nguyễn Viết Hòa", "Vũ Văn An", "Vũ Thế Anh", "Hà Phú", "Nguyễn Quang Tuyên", "Trần Việt Hưng", "Trịnh Minh Châm", "Nguyễn Ngọc Quý", "Phạm Duy"] },
  { date: "2026-03-03", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phạm Tiến Hùng", "Vũ Thế Anh"], playedTeam: ["Phạm Tiến Hùng", "Vũ Thế Anh", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Hà Phú", "Nguyễn Quang Thái"] },
  { date: "2026-03-17", opponent: "Nội bộ", result: "Hòa", cost: 0, note: "Hòa 4-4", losingTeam: [], playedTeam: ["Vũ Thế Anh", "Hà Phú", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Phạm Tiến Hùng", "Vũ Văn An", "Hồ Trọng Thuân"] },
  { date: "2026-03-24", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hà Phú", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hùng Chu", "Nguyễn Quang Tuyên", "Phạm Duy", "Trần Văn Tuấn", "Trần Nhật Thăng"], playedTeam: ["Hà Phú", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hùng Chu", "Nguyễn Quang Tuyên", "Phạm Duy", "Trần Văn Tuấn", "Trần Nhật Thăng", "Vũ Thế Anh", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Nguyễn Quang Thái", "Vũ Văn An", "Trần Đức", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Hồ Trọng Thuân"] },
  { date: "2026-03-31", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hồ Trọng Thuân", "Trịnh Minh Châm"], playedTeam: ["Hồ Trọng Thuân", "Trịnh Minh Châm", "Vũ Thế Anh", "Hà Phú", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Phạm Tiến Hùng"] },
  { date: "2026-04-07", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Minh Quyền", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hà Phú"], playedTeam: ["Minh Quyền", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hà Phú", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Phạm Tiến Hùng", "Vũ Văn An"] },
  { date: "2026-04-14", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Trần Việt Hưng", "Nguyễn Khắc Thiên", "Minh Quyền"], playedTeam: ["Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Trần Việt Hưng", "Nguyễn Khắc Thiên", "Minh Quyền", "Đoàn Thế Anh", "Hà Phú", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phạm Duy", "Phạm Tiến Hùng", "Nguyễn Quang Thái"] },
  { date: "2026-04-21", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hùng Chu", "Nguyễn Quang Thái", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Trần Văn Tuấn", "Trần Đức"], playedTeam: ["Hùng Chu", "Nguyễn Quang Thái", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Trần Văn Tuấn", "Trần Đức", "Đoàn Thế Anh", "Hà Phú", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Vũ Văn An", "Hồ Trọng Thuân"] },
  { date: "2026-05-05", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hà Phú", "Nguyễn Viết Hòa", "Nguyễn Ngọc Quý"], playedTeam: ["Hà Phú", "Nguyễn Viết Hòa", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Trần Việt Hưng", "Phạm Tiến Hùng", "Vũ Văn An", "Phạm Duy", "Trần Văn Tuấn", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Đoàn Thế Anh"] },
  { date: "2026-06-02", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phạm Duy", "Nguyễn Ngọc Quý", "Trần Việt Hưng", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu"], playedTeam: ["Phạm Duy", "Nguyễn Ngọc Quý", "Trần Việt Hưng", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Vũ Thế Anh", "Hà Phú", "Trịnh Minh Châm", "Trần Văn Tuấn", "Vũ Văn An", "Nguyễn Minh", "Trần Đức", "Hồ Trọng Thuân"] },
  { date: "2026-06-09", opponent: "Nội bộ", result: "Hoãn", cost: 0, note: "Mưa hoãn", losingTeam: [], playedTeam: [] },
  { date: "2026-06-16", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Vũ Thế Anh", "Trịnh Minh Châm", "Nguyễn Minh"], playedTeam: ["Vũ Thế Anh", "Trịnh Minh Châm", "Nguyễn Minh", "Đoàn Thế Anh", "Hà Phú", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Nguyễn Quang Thái", "Phạm Duy", "Phạm Tiến Hùng", "Trần Đức"] },
  { date: "2026-06-23", opponent: "Nội bộ", result: "Hòa", cost: 0, note: "Hòa 4-4", losingTeam: [], playedTeam: ["Phạm Duy Tiên", "Nguyễn Ngọc Quý", "Vũ Văn An", "Nguyễn Quang Thái", "Vũ Thế Anh", "Hà Phú", "Đoàn Thế Anh", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Trần Văn Tuấn", "Nguyễn Minh", "Trần Đức", "Phạm Tiến Hùng", "Hồ Trọng Thuân"] },
  { date: "2026-07-07", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Nguyễn Quang Thái", "Nguyễn Minh", "Nguyễn Khắc Dũng", "Trần Việt Hưng", "Trần Văn Tuấn", "Vũ Văn An"], playedTeam: ["Nguyễn Quang Thái", "Nguyễn Minh", "Nguyễn Khắc Dũng", "Trần Việt Hưng", "Trần Văn Tuấn", "Vũ Văn An", "Phạm Duy Tiên", "Nguyễn Ngọc Quý", "Phạm Tiến Hùng", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Phạm Duy", "Lê Ngọc Tân"] },
  { date: "2026-07-14", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Nguyễn Viết Hòa", "Trần Văn Tuấn", "Hùng Chu", "Trịnh Minh Châm", "Phạm Tiến Hùng", "Hà Phú", "Nguyễn Ngọc Quý"], playedTeam: ["Nguyễn Quang Thái", "Nguyễn Minh", "Nguyễn Viết Hòa", "Trần Văn Tuấn", "Hùng Chu", "Trịnh Minh Châm", "Phạm Tiến Hùng", "Vũ Thế Anh", "Nguyễn Khắc Dũng", "Minh Quyền", "Dương Duy", "Trần Đức", "Vũ Văn An", "Hà Phú", "Nguyễn Ngọc Quý"] },
  { date: "2026-07-21", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Đoàn Thế Anh", "Hà Phú", "Lê Ngọc Tân", "Nguyễn Minh", "Nguyễn Quang Thái", "Phạm Duy Tiên", "Vũ Thế Anh", "Vũ Văn An"], playedTeam: ["Đoàn Thế Anh", "Hà Phú", "Lê Ngọc Tân", "Nguyễn Minh", "Nguyễn Quang Thái", "Phạm Duy Tiên", "Vũ Thế Anh", "Vũ Văn An", "Nguyễn Ngọc Quý", "Nguyễn Viết Hòa", "Phạm Duy", "Phạm Tiến Hùng", "Trần Đức", "Trịnh Minh Châm"] }
];

const INITIAL_FIXTURES = [];

const FUND_PERIODS = [
  { id: 1, name: "Phạt thua", amount: 20000 }
];

const INITIAL_FUND_PAYMENTS = [];
INITIAL_MATCHES.forEach(m => {
  if (m.losingTeam && m.losingTeam.length > 0) {
    m.losingTeam.forEach(mem => {
      INITIAL_FUND_PAYMENTS.push({
        timestamp: m.date + " 21:00:00",
        period: "Phạt thua",
        member: mem,
        amount: 20000,
        note: `Phạt trận ngày ${m.date.split('-').reverse().slice(0, 2).join('/')}`,
        periodRaw: "Phạt thua"
      });
    });
  }
});


const INITIAL_QUARTERLY_CONTRIBUTIONS = [
  {"member": "Trịnh Minh Châm", "q1_amount": 500000, "q1_date": "", "q2_amount": 500000, "q2_date": "", "q3_amount": 500000, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Trịnh Minh Chiêm", "q1_amount": 500000, "q1_date": "", "q2_amount": "Nghỉ", "q2_date": "Nghỉ", "q3_amount": "Nghỉ", "q3_date": "Nghỉ", "q4_amount": "Nghỉ", "q4_date": "Nghỉ"},
  {"member": "Nguyễn Quang Thái", "q1_amount": 500000, "q1_date": "2026-03-18", "q2_amount": 500000, "q2_date": "2026-07-14", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Nguyễn Đình Ngọc", "q1_amount": 300000, "q1_date": "", "q2_amount": "Nghỉ", "q2_date": "Nghỉ", "q3_amount": "Nghỉ", "q3_date": "Nghỉ", "q4_amount": "Nghỉ", "q4_date": "Nghỉ"},
  {"member": "Đoàn Thế Anh", "q1_amount": 500000, "q1_date": "2026-03-24", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Hồ Trọng Thuân", "q1_amount": 500000, "q1_date": "2026-02-24", "q2_amount": 500000, "q2_date": "2026-05-19", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Hùng Chu", "q1_amount": 500000, "q1_date": "2026-03-25", "q2_amount": 500000, "q2_date": "2026-06-30", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Nguyễn Viết Hòa", "q1_amount": 500000, "q1_date": "2026-01-27", "q2_amount": 500000, "q2_date": "2026-07-17", "q3_amount": 500000, "q3_date": "2026-07-17", "q4_amount": 0, "q4_date": ""},
  {"member": "Hà Phú", "q1_amount": 500000, "q1_date": "2026-03-15", "q2_amount": 500000, "q2_date": "2026-03-15", "q3_amount": 500000, "q3_date": "2026-03-15", "q4_amount": 500000, "q4_date": "2026-03-15"},
  {"member": "Minh Quyền", "q1_amount": 500000, "q1_date": "2026-03-17", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Trần Văn Tuấn", "q1_amount": 500000, "q1_date": "2026-04-10", "q2_amount": 500000, "q2_date": "2026-07-10", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Trần Việt Hưng", "q1_amount": 500000, "q1_date": "2026-03-17", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Phạm Tiến Hùng", "q1_amount": 500000, "q1_date": "2026-01-29", "q2_amount": 500000, "q2_date": "2026-04-22", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Vũ Thế Anh", "q1_amount": 500000, "q1_date": "2026-03-17", "q2_amount": 500000, "q2_date": "2026-07-18", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Vũ Văn An", "q1_amount": 500000, "q1_date": "2026-04-07", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Phạm Duy", "q1_amount": 500000, "q1_date": "2026-04-06", "q2_amount": 200000, "q2_date": "Nghỉ", "q3_amount": "Nghỉ", "q3_date": "Nghỉ", "q4_amount": "Nghỉ", "q4_date": "Nghỉ"},
  {"member": "Nguyễn Quang Tuyên", "q1_amount": 500000, "q1_date": "2026-03-17", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Trần Đức", "q1_amount": 500000, "q1_date": "2026-06-10", "q2_amount": 500000, "q2_date": "2026-06-10", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Nghiêm Mạnh Hùng", "q1_amount": 500000, "q1_date": "2026-01-29", "q2_amount": "Nghỉ", "q2_date": "nghỉ", "q3_amount": 0, "q3_date": "nghỉ", "q4_amount": 0, "q4_date": ""},
  {"member": "Phạm Duy Tiên", "q1_amount": 500000, "q1_date": "2026-01-27", "q2_amount": 100000, "q2_date": "", "q3_amount": 500000, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Nguyễn Ngọc Quý", "q1_amount": 500000, "q1_date": "2026-01-29", "q2_amount": 0, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Trần Nhật Thăng", "q1_amount": 200000, "q1_date": "Tham gia từ Tháng 3", "q2_amount": "Nghỉ", "q2_date": "Nghỉ", "q3_amount": "Nghỉ", "q3_date": "Nghỉ", "q4_amount": "Nghỉ", "q4_date": "Nghỉ"},
  {"member": "Nguyễn Khắc Thiên", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": 500000, "q2_date": "2026-03-31", "q3_amount": "Nghỉ", "q3_date": "Nghỉ", "q4_amount": "Nghỉ", "q4_date": "Nghỉ"},
  {"member": "Lê Ngọc Tân", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": "Chưa tham gia", "q2_date": "Chưa tham gia", "q3_amount": 500000, "q3_date": "2026-07-14", "q4_amount": 0, "q4_date": ""},
  {"member": "Nguyễn Minh", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": 200000, "q2_date": "", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Nguyễn Khắc Dũng", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": "Chưa tham gia", "q2_date": "Chưa tham gia", "q3_amount": 500000, "q3_date": "2026-06-30", "q4_amount": 0, "q4_date": ""},
  {"member": "Dương Duy", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": "Chưa tham gia", "q2_date": "Chưa tham gia", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
  {"member": "Duy Anh", "q1_amount": "Chưa tham gia", "q1_date": "Chưa tham gia", "q2_amount": "Chưa tham gia", "q2_date": "Chưa tham gia", "q3_amount": 0, "q3_date": "", "q4_amount": 0, "q4_date": ""},
];

const INITIAL_EXPENSES = [
  {"name": "Chi tiền Tuần 1", "quarter": 1, "year": 2026, "amount": 590000, "date": "2026-01-06", "status": "normal"},
  {"name": "Chi tiền Tuần 1", "quarter": 2, "year": 2026, "amount": 610000, "date": "2026-04-06", "status": "normal"},
  {"name": "Chi tiền Tuần 1", "quarter": 3, "year": 2026, "amount": 645000, "date": "2026-07-07", "status": "normal"},
  {"name": "Chi tiền Tuần 1", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-10-06", "status": "normal"},
  {"name": "Chi tiền Tuần 2", "quarter": 1, "year": 2026, "amount": 605000, "date": "2026-01-13", "status": "normal"},
  {"name": "Chi tiền Tuần 2", "quarter": 2, "year": 2026, "amount": 615000, "date": "2026-04-13", "status": "normal"},
  {"name": "Chi tiền Tuần 2", "quarter": 3, "year": 2026, "amount": 630000, "date": "2026-07-14", "status": "normal"},
  {"name": "Chi tiền Tuần 2", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-10-13", "status": "normal"},
  {"name": "Chi tiền Tuần 3", "quarter": 1, "year": 2026, "amount": 500000, "date": "2026-01-20", "status": "normal"},
  {"name": "Chi tiền Tuần 3", "quarter": 2, "year": 2026, "amount": 610000, "date": "2026-04-20", "status": "normal"},
  {"name": "Chi tiền Tuần 3", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-07-21", "status": "normal"},
  {"name": "Chi tiền Tuần 3", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-10-20", "status": "normal"},
  {"name": "Chi tiền Tuần 4", "quarter": 1, "year": 2026, "amount": 650000, "date": "2026-01-27", "status": "normal"},
  {"name": "Chi tiền Tuần 4", "quarter": 2, "year": 2026, "amount": 0, "date": "2026-04-27", "status": "Nghỉ"},
  {"name": "Chi tiền Tuần 4", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-07-28", "status": "normal"},
  {"name": "Chi tiền Tuần 4", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-10-27", "status": "normal"},
  {"name": "Chi tiền Tuần 5", "quarter": 1, "year": 2026, "amount": 665000, "date": "2026-02-03", "status": "normal"},
  {"name": "Chi tiền Tuần 5", "quarter": 2, "year": 2026, "amount": 610000, "date": "2026-05-04", "status": "normal"},
  {"name": "Chi tiền Tuần 5", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-08-04", "status": "normal"},
  {"name": "Chi tiền Tuần 5", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-11-03", "status": "normal"},
  {"name": "Chi tiền Tuần 6", "quarter": 1, "year": 2026, "amount": 590000, "date": "2026-02-10", "status": "normal"},
  {"name": "Chi tiền Tuần 6", "quarter": 2, "year": 2026, "amount": 580000, "date": "2026-05-11", "status": "normal"},
  {"name": "Chi tiền Tuần 6", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-08-11", "status": "normal"},
  {"name": "Chi tiền Tuần 6", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-11-10", "status": "normal"},
  {"name": "Chi tiền Tuần 7", "quarter": 1, "year": 2026, "amount": 0, "date": "2026-02-17", "status": "Nghỉ"},
  {"name": "Chi tiền Tuần 7", "quarter": 2, "year": 2026, "amount": 590000, "date": "2026-05-18", "status": "normal"},
  {"name": "Chi tiền Tuần 7", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-08-18", "status": "normal"},
  {"name": "Chi tiền Tuần 7", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-11-17", "status": "normal"},
  {"name": "Chi tiền Tuần 8", "quarter": 1, "year": 2026, "amount": 608000, "date": "2026-02-24", "status": "normal"},
  {"name": "Chi tiền Tuần 8", "quarter": 2, "year": 2026, "amount": 600000, "date": "2026-05-25", "status": "normal"},
  {"name": "Chi tiền Tuần 8", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-08-25", "status": "normal"},
  {"name": "Chi tiền Tuần 8", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-11-24", "status": "normal"},
  {"name": "Chi tiền Tuần 9", "quarter": 1, "year": 2026, "amount": 628000, "date": "2026-03-03", "status": "normal"},
  {"name": "Chi tiền Tuần 9", "quarter": 2, "year": 2026, "amount": 630000, "date": "2026-06-01", "status": "normal"},
  {"name": "Chi tiền Tuần 9", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-09-01", "status": "normal"},
  {"name": "Chi tiền Tuần 9", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-12-01", "status": "normal"},
  {"name": "Chi tiền Tuần 10", "quarter": 1, "year": 2026, "amount": 600000, "date": "2026-03-10", "status": "normal"},
  {"name": "Chi tiền Tuần 10", "quarter": 2, "year": 2026, "amount": 530000, "date": "2026-06-08", "status": "normal"},
  {"name": "Chi tiền Tuần 10", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-09-08", "status": "normal"},
  {"name": "Chi tiền Tuần 10", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-12-08", "status": "normal"},
  {"name": "Chi tiền Tuần 11", "quarter": 1, "year": 2026, "amount": 650000, "date": "2026-03-17", "status": "normal"},
  {"name": "Chi tiền Tuần 11", "quarter": 2, "year": 2026, "amount": 590000, "date": "2026-06-15", "status": "normal"},
  {"name": "Chi tiền Tuần 11", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-09-15", "status": "normal"},
  {"name": "Chi tiền Tuần 11", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-12-15", "status": "normal"},
  {"name": "Chi tiền Tuần 12", "quarter": 1, "year": 2026, "amount": 620000, "date": "2026-03-24", "status": "normal"},
  {"name": "Chi tiền Tuần 12", "quarter": 2, "year": 2026, "amount": 640000, "date": "2026-06-22", "status": "normal"},
  {"name": "Chi tiền Tuần 12", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-09-22", "status": "normal"},
  {"name": "Chi tiền Tuần 12", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-12-22", "status": "normal"},
  {"name": "Chi tiền Tuần 13", "quarter": 1, "year": 2026, "amount": 630000, "date": "2026-03-31", "status": "normal"},
  {"name": "Chi tiền Tuần 13", "quarter": 2, "year": 2026, "amount": 620000, "date": "2026-06-29", "status": "normal"},
  {"name": "Chi tiền Tuần 13", "quarter": 3, "year": 2026, "amount": 0, "date": "2026-09-29", "status": "normal"},
  {"name": "Chi tiền Tuần 13", "quarter": 4, "year": 2026, "amount": 0, "date": "2026-12-29", "status": "normal"},
];

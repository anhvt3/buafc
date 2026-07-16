const DATA_VERSION = "buafc-2026-07-16-v4";

const INITIAL_MEMBERS = [
  { name: "Vũ Thế Anh", status: "active" },
  { name: "Phú Hà", status: "active" },
  { name: "Đoàn Thế Anh", status: "active" },
  { name: "Nguyễn Quang Tuyên", status: "active" },
  { name: "Trịnh Minh Châm", status: "active" },
  { name: "Hùng Chu", status: "active" },
  { name: "Nguyễn Viết Hòa", status: "active" },
  { name: "Trần Việt Hưng", status: "active" },
  { name: "Trần Văn Tuấn", status: "active" },
  { name: "Nguyễn Ngọc Quý", status: "active" },
  { name: "Thai Nguyen", status: "active" },
  { name: "Duy Phạm", status: "active" },
  { name: "Phạm Tiến Hùng", status: "active" },
  { name: "Quyền Ruốc", status: "active" },
  { name: "Đình Ngọc", status: "active" },
  { name: "Tien Pham Duy", status: "active" },
  { name: "Chiem Minh", status: "active" },
  { name: "Vũ Văn An", status: "active" },
  { name: "Trần Nhật Thăng", status: "active" },
  { name: "Ho Trong Thuan", status: "active" },
  { name: "Thiện Nguyễn", status: "active" },
  { name: "Trần Đức", status: "active" },
  { name: "Nguyễn Minh", status: "active" },
  { name: "Nguyễn Khắc Dũng", status: "active" }
];

const INITIAL_MATCHES = [
  { date: "2026-01-20", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phú Hà", "Đoàn Thế Anh", "Đình Ngọc", "Nguyễn Quang Tuyên", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trịnh Minh Châm"], playedTeam: ["Phú Hà", "Đoàn Thế Anh", "Đình Ngọc", "Nguyễn Quang Tuyên", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trịnh Minh Châm", "Vũ Thế Anh", "Hùng Chu", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Thai Nguyen", "Duy Phạm", "Phạm Tiến Hùng"] },
  { date: "2026-01-27", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Tien Pham Duy", "Nguyễn Viết Hòa", "Đoàn Thế Anh", "Thai Nguyen", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm", "Trần Việt Hưng", "Phú Hà"], playedTeam: ["Tien Pham Duy", "Nguyễn Viết Hòa", "Đoàn Thế Anh", "Thai Nguyen", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm", "Trần Việt Hưng", "Phú Hà", "Vũ Thế Anh", "Trịnh Minh Châm", "Phạm Tiến Hùng", "Hùng Chu", "Nguyễn Quang Tuyên", "Vũ Văn An"] },
  { date: "2026-02-03", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Trần Văn Tuấn", "Phạm Tiến Hùng", "Đoàn Thế Anh", "Chiem Minh", "Hùng Chu", "Nguyễn Viết Hòa", "Vũ Văn An"], playedTeam: ["Trần Văn Tuấn", "Phạm Tiến Hùng", "Đoàn Thế Anh", "Chiem Minh", "Hùng Chu", "Nguyễn Viết Hòa", "Vũ Văn An", "Vũ Thế Anh", "Phú Hà", "Nguyễn Quang Tuyên", "Trần Việt Hưng", "Trịnh Minh Châm", "Nguyễn Ngọc Quý", "Duy Phạm"] },
  { date: "2026-03-03", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phạm Tiến Hùng", "Vũ Thế Anh"], playedTeam: ["Phạm Tiến Hùng", "Vũ Thế Anh", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Phú Hà"] },
  { date: "2026-03-17", opponent: "Nội bộ", result: "Hòa", cost: 0, note: "Hòa 4-4", losingTeam: [], playedTeam: ["Vũ Thế Anh", "Phú Hà", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm", "Phạm Tiến Hùng", "Vũ Văn An"] },
  { date: "2026-03-24", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phú Hà", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hùng Chu", "Nguyễn Quang Tuyên", "Duy Phạm", "Trần Văn Tuấn", "Trần Nhật Thăng"], playedTeam: ["Phú Hà", "Trịnh Minh Châm", "Đoàn Thế Anh", "Hùng Chu", "Nguyễn Quang Tuyên", "Duy Phạm", "Trần Văn Tuấn", "Trần Nhật Thăng", "Vũ Thế Anh", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Thai Nguyen", "Vũ Văn An", "Trần Đức", "Nguyễn Viết Hòa", "Trần Việt Hưng"] },
  { date: "2026-03-31", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Ho Trong Thuan", "Trịnh Minh Châm"], playedTeam: ["Ho Trong Thuan", "Trịnh Minh Châm", "Vũ Thế Anh", "Phú Hà", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm"] },
  { date: "2026-04-07", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Quyền Ruốc", "Trịnh Minh Châm", "Đoàn Thế Anh", "Phú Hà"], playedTeam: ["Quyền Ruốc", "Trịnh Minh Châm", "Đoàn Thế Anh", "Phú Hà", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm", "Phạm Tiến Hùng", "Vũ Văn An"] },
  { date: "2026-04-14", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Trần Việt Hưng", "Thiện Nguyễn", "Quyền Ruốc"], playedTeam: ["Vũ Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Trần Việt Hưng", "Thiện Nguyễn", "Quyền Ruốc", "Đoàn Thế Anh", "Phú Hà", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Duy Phạm", "Phạm Tiến Hùng", "Vũ Văn An", "Thai Nguyen"] },
  { date: "2026-04-21", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Hùng Chu", "Thai Nguyen", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Trần Văn Tuấn", "Trần Đức"], playedTeam: ["Hùng Chu", "Thai Nguyen", "Phạm Tiến Hùng", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Nguyễn Quang Tuyên", "Trần Văn Tuấn", "Trần Đức", "Đoàn Thế Anh", "Phú Hà", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Duy Phạm", "Vũ Văn An", "Quyền Ruốc"] },
  { date: "2026-05-05", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Phú Hà", "Nguyễn Viết Hòa", "Nguyễn Ngọc Quý"], playedTeam: ["Phú Hà", "Nguyễn Viết Hòa", "Nguyễn Ngọc Quý", "Vũ Thế Anh", "Trần Việt Hưng", "Phạm Tiến Hùng", "Vũ Văn An", "Duy Phạm", "Trần Văn Tuấn", "Nguyễn Quang Tuyên", "Trịnh Minh Châm"] },
  { date: "2026-06-02", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Duy Phạm", "Nguyễn Ngọc Quý", "Trần Việt Hưng", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu"], playedTeam: ["Duy Phạm", "Nguyễn Ngọc Quý", "Trần Việt Hưng", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Hùng Chu", "Vũ Thế Anh", "Phú Hà", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Trần Văn Tuấn", "Vũ Văn An", "Thai Nguyen", "Nguyễn Minh"] },
  { date: "2026-06-09", opponent: "Nội bộ", result: "Hoãn", cost: 0, note: "Mưa hoãn", losingTeam: [], playedTeam: [] },
  { date: "2026-06-16", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Vũ Thế Anh", "Trịnh Minh Châm", "Nguyễn Minh"], playedTeam: ["Vũ Thế Anh", "Trịnh Minh Châm", "Nguyễn Minh", "Đoàn Thế Anh", "Phú Hà", "Nguyễn Quang Tuyên", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn", "Nguyễn Ngọc Quý", "Thai Nguyen", "Duy Phạm", "Phạm Tiến Hùng", "Vũ Văn An", "Trần Đức"] },
  { date: "2026-06-23", opponent: "Nội bộ", result: "Hòa", cost: 0, note: "Hòa 4-4", losingTeam: [], playedTeam: ["Quyền Ruốc", "Tien Pham Duy", "Nguyễn Ngọc Quý", "Vũ Văn An", "Thai Nguyen", "Vũ Thế Anh", "Phú Hà", "Đoàn Thế Anh", "Nguyễn Quang Tuyên", "Trịnh Minh Châm", "Hùng Chu", "Nguyễn Viết Hòa", "Trần Việt Hưng", "Trần Văn Tuấn"] },
  { date: "2026-07-07", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Thai Nguyen", "Vũ Thế Anh", "Nguyễn Minh", "Nguyễn Khắc Dũng", "Trần Việt Hưng", "Trần Văn Tuấn", "Vũ Văn An"], playedTeam: ["Thai Nguyen", "Nguyễn Minh", "Nguyễn Khắc Dũng", "Trần Việt Hưng", "Trần Văn Tuấn", "Vũ Văn An", "Vũ Thế Anh", "Tien Pham Duy", "Nguyễn Ngọc Quý", "Phạm Tiến Hùng", "Phú Hà", "Trịnh Minh Châm", "Nguyễn Viết Hòa", "Duy Phạm"] },
  { date: "2026-07-14", opponent: "Nội bộ", result: "Thua", cost: 0, note: "", losingTeam: ["Nguyễn Viết Hòa", "Trần Văn Tuấn"], playedTeam: ["Thai Nguyen", "Nguyễn Minh", "Nguyễn Viết Hòa", "Trần Văn Tuấn"] }
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

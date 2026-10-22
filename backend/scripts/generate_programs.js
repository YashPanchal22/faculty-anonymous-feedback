// Complete Silver Oak University Academic Catalog Builder
// Populates programs.json, subjects.json, faculty.json with extensive, realistic data
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 1. PROGRAMS (32 official programs across 12 Silver Oak University institutes)
const programs = [
  // SOCCA
  {
    id: "bsc_ds",
    name: "Silver Oak College of Computer Application (SOCCA) — B.Sc. Data Science",
    code: "BSc-DS",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 6
  },
  {
    id: "bca",
    name: "Silver Oak College of Computer Application (SOCCA) — BCA (Bachelor of Computer Applications)",
    code: "BCA",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 6
  },
  {
    id: "bsc_it",
    name: "Silver Oak College of Computer Application (SOCCA) — B.Sc. Information Technology",
    code: "BSc-IT",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 6
  },
  {
    id: "bsc_csdf",
    name: "Silver Oak College of Computer Application (SOCCA) — B.Sc. Cyber Security & Digital Forensics",
    code: "BSc-CSDF",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 6
  },
  {
    id: "mca",
    name: "Silver Oak College of Computer Application (SOCCA) — MCA (Master of Computer Applications)",
    code: "MCA",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 4
  },
  {
    id: "msc_it",
    name: "Silver Oak College of Computer Application (SOCCA) — M.Sc. Information Technology",
    code: "MSc-IT",
    department: "Silver Oak College of Computer Application",
    totalSemesters: 4
  },

  // SOCET
  {
    id: "btech_ce",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Computer Engineering",
    code: "BTech-CE",
    department: "Computer Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_it",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Information Technology",
    code: "BTech-IT",
    department: "Information Technology",
    totalSemesters: 8
  },
  {
    id: "btech_aiml",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. AI & Machine Learning",
    code: "BTech-AIML",
    department: "Computer Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_me",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Mechanical Engineering",
    code: "BTech-ME",
    department: "Mechanical Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_cl",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Civil Engineering",
    code: "BTech-CL",
    department: "Civil Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_ch",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Chemical Engineering",
    code: "BTech-CH",
    department: "Chemical Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_ee",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Electrical Engineering",
    code: "BTech-EE",
    department: "Electrical Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_aero",
    name: "Silver Oak College of Engineering & Technology (SOCET) — B.Tech. Aeronautical Engineering",
    code: "BTech-AERO",
    department: "Aeronautical Engineering",
    totalSemesters: 8
  },

  // ASOIT
  {
    id: "btech_cs",
    name: "Aditya Silver Oak Institute of Technology (ASOIT) — B.Tech. Cyber Security",
    code: "BTech-CS",
    department: "Computer Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_cse",
    name: "Aditya Silver Oak Institute of Technology (ASOIT) — B.Tech. Computer Science & Engineering",
    code: "BTech-CSE",
    department: "Computer Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_ec",
    name: "Aditya Silver Oak Institute of Technology (ASOIT) — B.Tech. Electronics & Communication",
    code: "BTech-EC",
    department: "Electronics & Communication Engineering",
    totalSemesters: 8
  },
  {
    id: "btech_biotech",
    name: "Aditya Silver Oak Institute of Technology (ASOIT) — B.Tech. Biotechnology",
    code: "BTech-BT",
    department: "Biotechnology Engineering",
    totalSemesters: 8
  },

  // SOIS
  {
    id: "bsc_cs",
    name: "Silver Oak Institute of Science (SOIS) — B.Sc. Computer Science",
    code: "BSc-CS",
    department: "Silver Oak Institute of Science",
    totalSemesters: 6
  },
  {
    id: "bsc_micro",
    name: "Silver Oak Institute of Science (SOIS) — B.Sc. Microbiology",
    code: "BSc-MB",
    department: "Silver Oak Institute of Science",
    totalSemesters: 6
  },
  {
    id: "bsc_chem",
    name: "Silver Oak Institute of Science (SOIS) — B.Sc. Chemistry",
    code: "BSc-CH",
    department: "Silver Oak Institute of Science",
    totalSemesters: 6
  },
  {
    id: "bsc_biotech",
    name: "Silver Oak Institute of Science (SOIS) — B.Sc. Biotechnology",
    code: "BSc-BT",
    department: "Silver Oak Institute of Science",
    totalSemesters: 6
  },
  {
    id: "msc_ds",
    name: "Silver Oak Institute of Science (SOIS) — M.Sc. Data Science & Big Data",
    code: "MSc-DS",
    department: "Silver Oak Institute of Science",
    totalSemesters: 4
  },

  // SOIM
  {
    id: "bba",
    name: "Silver Oak Institute of Management (SOIM) — BBA (Bachelor of Business Administration)",
    code: "BBA",
    department: "Silver Oak Institute of Management",
    totalSemesters: 6
  },
  {
    id: "mba",
    name: "Silver Oak Institute of Management (SOIM) — MBA (Master of Business Administration)",
    code: "MBA",
    department: "Silver Oak Institute of Management",
    totalSemesters: 4
  },

  // SOCC
  {
    id: "bcom",
    name: "Silver Oak Commerce College (SOCC) — B.Com. (Bachelor of Commerce / Honours)",
    code: "BCom",
    department: "Silver Oak Commerce College",
    totalSemesters: 6
  },

  // SOCP
  {
    id: "bpharm",
    name: "Silver Oak College of Pharmacy (SOCP) — B.Pharm. (Bachelor of Pharmacy)",
    code: "BPharm",
    department: "Silver Oak College of Pharmacy",
    totalSemesters: 8
  },
  {
    id: "dpharm",
    name: "Silver Oak College of Pharmacy (SOCP) — D.Pharm. (Diploma in Pharmacy)",
    code: "DPharm",
    department: "Silver Oak College of Pharmacy",
    totalSemesters: 4
  },

  // SOLC
  {
    id: "ballb",
    name: "Silver Oak Law College (SOLC) — BA LL.B. (Integrated 5-Year Law)",
    code: "BALLB",
    department: "Silver Oak Law College",
    totalSemesters: 10
  },
  {
    id: "bballb",
    name: "Silver Oak Law College (SOLC) — BBA LL.B. (Integrated 5-Year Law)",
    code: "BBALLB",
    department: "Silver Oak Law College",
    totalSemesters: 10
  },

  // SOCAT
  {
    id: "bsc_av",
    name: "Silver Oak College of Aviation Technology (SOCAT) — B.Sc. Aviation",
    code: "BSc-AV",
    department: "Silver Oak College of Aviation Technology",
    totalSemesters: 6
  },

  // SOCAM
  {
    id: "bsc_anim",
    name: "Silver Oak College of Animation and Multimedia (SOCAM) — B.Sc. Animation & VFX",
    code: "BSc-ANIM",
    department: "Silver Oak College of Animation and Multimedia",
    totalSemesters: 6
  },

  // Physiotherapy & Nursing
  {
    id: "bpt",
    name: "Silver Oak College of Physiotherapy — BPT (Bachelor of Physiotherapy)",
    code: "BPT",
    department: "Silver Oak College of Physiotherapy",
    totalSemesters: 8
  },
  {
    id: "bsc_nurs",
    name: "Silver Oak College of Nursing — B.Sc. Nursing",
    code: "BSc-NURS",
    department: "Silver Oak College of Nursing",
    totalSemesters: 8
  }
];

fs.writeFileSync(path.join(DATA_DIR, 'programs.json'), JSON.stringify(programs, null, 2), 'utf8');
console.log(`Saved ${programs.length} programs to programs.json`);

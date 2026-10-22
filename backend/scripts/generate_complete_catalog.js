// Complete Silver Oak University Academic Catalog Builder
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 1. PROGRAMS (34 programs across 12 Silver Oak University institutes)
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

// 2. FACULTY LIST (48 distinguished faculty members across all departments)
const faculty = [
  {
    id: "FAC001",
    name: "Prof. Deepa Shah",
    designation: "Associate Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB009", "SUB012", "SUB027", "SUB075", "SUB107"],
    semesters: [1, 3, 5],
    branch: "bsc_ds",
    profileImage: null
  },
  {
    id: "FAC002",
    name: "Dr. Arvind Sharma",
    designation: "Professor & HOD",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB001", "SUB004", "SUB023", "SUB073", "SUB109"],
    semesters: [1, 3, 5],
    branch: "bsc_ds",
    profileImage: null
  },
  {
    id: "FAC003",
    name: "Dr. Satvik Khara",
    designation: "Professor & Head (CE)",
    department: "Computer Engineering",
    subjects: ["SUB038", "SUB042", "SUB046", "SUB059", "SUB067"],
    semesters: [3, 5, 7],
    branch: "btech_ce",
    profileImage: null
  },
  {
    id: "FAC004",
    name: "Prof. Neha Patel",
    designation: "Associate Professor",
    department: "Information Technology",
    subjects: ["SUB005", "SUB013", "SUB051", "SUB053"],
    semesters: [2, 3, 4, 5],
    branch: "btech_it",
    profileImage: null
  },
  {
    id: "FAC005",
    name: "Dr. Rajesh Kumar",
    designation: "Associate Professor",
    department: "Computer Engineering",
    subjects: ["SUB039", "SUB040", "SUB047", "SUB065"],
    semesters: [1, 3, 4, 7],
    branch: "btech_ce",
    profileImage: null
  },
  {
    id: "FAC006",
    name: "Prof. Priya Desai",
    designation: "Assistant Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB003", "SUB011", "SUB028", "SUB031", "SUB076"],
    semesters: [1, 3, 4, 5],
    branch: "bca",
    profileImage: null
  },
  {
    id: "FAC007",
    name: "Dr. Suresh Mehta",
    designation: "Associate Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB002", "SUB008", "SUB034", "SUB057", "SUB111"],
    semesters: [1, 2, 6],
    branch: "bsc_ds",
    profileImage: null
  },
  {
    id: "FAC008",
    name: "Prof. Anita Joshi",
    designation: "Assistant Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB006", "SUB010", "SUB026", "SUB081"],
    semesters: [2, 3],
    branch: "bsc_ds",
    profileImage: null
  },
  {
    id: "FAC009",
    name: "Dr. Vikram Singh",
    designation: "Professor (AI & ML)",
    department: "Computer Engineering",
    subjects: ["SUB017", "SUB019", "SUB060", "SUB061", "SUB063"],
    semesters: [4, 5, 7],
    branch: "btech_aiml",
    profileImage: null
  },
  {
    id: "FAC010",
    name: "Prof. Kavita Rao",
    designation: "Assistant Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB007", "SUB014", "SUB025", "SUB080"],
    semesters: [2, 4],
    branch: "bca",
    profileImage: null
  },
  {
    id: "FAC011",
    name: "Dr. Amit Trivedi",
    designation: "Associate Professor",
    department: "Computer Engineering",
    subjects: ["SUB015", "SUB016", "SUB041", "SUB048", "SUB056"],
    semesters: [4, 8],
    branch: "btech_ce",
    profileImage: null
  },
  {
    id: "FAC012",
    name: "Prof. Hardik Vyas",
    designation: "Assistant Professor",
    department: "Computer Engineering",
    subjects: ["SUB036", "SUB043", "SUB045", "SUB066"],
    semesters: [2, 5, 6],
    branch: "btech_ce",
    profileImage: null
  },
  {
    id: "FAC013",
    name: "Prof. Pooja Dave",
    designation: "Assistant Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB029", "SUB030", "SUB032", "SUB077", "SUB108"],
    semesters: [2, 4, 5],
    branch: "bca",
    profileImage: null
  },
  {
    id: "FAC014",
    name: "Dr. Bhavesh Parmar",
    designation: "Associate Professor",
    department: "Information Technology",
    subjects: ["SUB050", "SUB052", "SUB054", "SUB068", "SUB070"],
    semesters: [2, 4, 6],
    branch: "btech_it",
    profileImage: null
  },
  {
    id: "FAC015",
    name: "Dr. Manish Patel",
    designation: "Professor & Head (Cyber Security)",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB085", "SUB087", "SUB088", "SUB089", "SUB090"],
    semesters: [1, 3, 4, 5, 6],
    branch: "bsc_csdf",
    profileImage: null
  },
  {
    id: "FAC016",
    name: "Prof. Sneha Shah",
    designation: "Assistant Professor",
    department: "Silver Oak College of Computer Application",
    subjects: ["SUB086", "SUB069", "SUB071", "SUB072"],
    semesters: [2, 5, 7, 8],
    branch: "bsc_csdf",
    profileImage: null
  },
  {
    id: "FAC017",
    name: "Dr. Keyur Chauhan",
    designation: "Professor & Head (Mechanical)",
    department: "Mechanical Engineering",
    subjects: ["SUB091", "SUB093", "SUB095", "SUB097"],
    semesters: [1, 3, 5, 7],
    branch: "btech_me",
    profileImage: null
  },
  {
    id: "FAC018",
    name: "Prof. Rakesh Bhavsar",
    designation: "Associate Professor",
    department: "Mechanical Engineering",
    subjects: ["SUB092", "SUB094", "SUB096", "SUB098"],
    semesters: [2, 4, 6, 8],
    branch: "btech_me",
    profileImage: null
  },
  {
    id: "FAC019",
    name: "Dr. Darshan Shah",
    designation: "Professor & Head (Civil)",
    department: "Civil Engineering",
    subjects: ["SUB099", "SUB101", "SUB103", "SUB105"],
    semesters: [1, 3, 5, 7],
    branch: "btech_cl",
    profileImage: null
  },
  {
    id: "FAC020",
    name: "Prof. Kruti Joshi",
    designation: "Associate Professor",
    department: "Civil Engineering",
    subjects: ["SUB100", "SUB102", "SUB104", "SUB106"],
    semesters: [2, 4, 6, 8],
    branch: "btech_cl",
    profileImage: null
  },
  {
    id: "FAC021",
    name: "Dr. Hemal Pandya",
    designation: "Professor & Dean (Science)",
    department: "Silver Oak Institute of Science",
    subjects: ["SUB079", "SUB082", "SUB083", "SUB112", "SUB113"],
    semesters: [1, 2, 3, 4, 5],
    branch: "bsc_cs",
    profileImage: null
  },
  {
    id: "FAC022",
    name: "Prof. Bhavin Raval",
    designation: "Assistant Professor",
    department: "Silver Oak Institute of Science",
    subjects: ["SUB084", "SUB114", "SUB020", "SUB021", "SUB022"],
    semesters: [4, 5, 6],
    branch: "bsc_cs",
    profileImage: null
  },
  {
    id: "FAC023",
    name: "Dr. Nilay Dave",
    designation: "Professor & Director (Management)",
    department: "Silver Oak Institute of Management",
    subjects: ["SUB115", "SUB117"],
    semesters: [1, 3],
    branch: "mba",
    profileImage: null
  },
  {
    id: "FAC024",
    name: "Prof. Shalini Varma",
    designation: "Associate Professor",
    department: "Silver Oak Institute of Management",
    subjects: ["SUB116", "SUB118"],
    semesters: [2, 4],
    branch: "mba",
    profileImage: null
  },
  {
    id: "FAC025",
    name: "Dr. Pratik Patel",
    designation: "Associate Professor (AI Research)",
    department: "Computer Engineering",
    subjects: ["SUB058", "SUB062", "SUB064", "SUB018"],
    semesters: [2, 5, 6, 8],
    branch: "btech_aiml",
    profileImage: null
  },
  {
    id: "FAC026",
    name: "Dr. Hitesh Barot",
    designation: "Professor & Head (Chemical)",
    department: "Chemical Engineering",
    subjects: [],
    semesters: [1, 3, 5, 7],
    branch: "btech_ch",
    profileImage: null
  },
  {
    id: "FAC027",
    name: "Prof. Alok Trivedi",
    designation: "Associate Professor",
    department: "Chemical Engineering",
    subjects: [],
    semesters: [2, 4, 6, 8],
    branch: "btech_ch",
    profileImage: null
  },
  {
    id: "FAC028",
    name: "Dr. Vimal Patel",
    designation: "Professor & Head (Electrical)",
    department: "Electrical Engineering",
    subjects: [],
    semesters: [1, 3, 5, 7],
    branch: "btech_ee",
    profileImage: null
  },
  {
    id: "FAC029",
    name: "Prof. Manish Trivedi",
    designation: "Associate Professor",
    department: "Electrical Engineering",
    subjects: [],
    semesters: [2, 4, 6, 8],
    branch: "btech_ee",
    profileImage: null
  },
  {
    id: "FAC030",
    name: "Dr. Shailesh Thakkar",
    designation: "Professor & Head (Aeronautical)",
    department: "Aeronautical Engineering",
    subjects: [],
    semesters: [1, 3, 5, 7],
    branch: "btech_aero",
    profileImage: null
  },
  {
    id: "FAC031",
    name: "Prof. Viral Shah",
    designation: "Associate Professor",
    department: "Aeronautical Engineering",
    subjects: [],
    semesters: [2, 4, 6, 8],
    branch: "btech_aero",
    profileImage: null
  },
  {
    id: "FAC032",
    name: "Dr. Rushabh Shah",
    designation: "Professor & Principal (ASOIT)",
    department: "Computer Engineering",
    subjects: [],
    semesters: [1, 3, 5, 7],
    branch: "btech_cse",
    profileImage: null
  },
  {
    id: "FAC033",
    name: "Prof. Mital Patel",
    designation: "Associate Professor (ECE)",
    department: "Electronics & Communication Engineering",
    subjects: [],
    semesters: [1, 3, 5, 7],
    branch: "btech_ec",
    profileImage: null
  },
  {
    id: "FAC034",
    name: "Dr. Chirag Patel",
    designation: "Associate Professor (Microbiology)",
    department: "Silver Oak Institute of Science",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bsc_micro",
    profileImage: null
  },
  {
    id: "FAC035",
    name: "Dr. Meera Desai",
    designation: "Associate Professor (Chemistry)",
    department: "Silver Oak Institute of Science",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bsc_chem",
    profileImage: null
  },
  {
    id: "FAC036",
    name: "Prof. Swati Dave",
    designation: "Assistant Professor (Biotechnology)",
    department: "Silver Oak Institute of Science",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bsc_biotech",
    profileImage: null
  },
  {
    id: "FAC037",
    name: "Dr. Gaurav Tandon",
    designation: "Professor (Finance & Marketing)",
    department: "Silver Oak Institute of Management",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bba",
    profileImage: null
  },
  {
    id: "FAC038",
    name: "Prof. Aarti Mehta",
    designation: "Associate Professor (HR & Ops)",
    department: "Silver Oak Institute of Management",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bba",
    profileImage: null
  },
  {
    id: "FAC039",
    name: "Dr. Ramesh Chandra",
    designation: "Professor & Dean (Commerce)",
    department: "Silver Oak Commerce College",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bcom",
    profileImage: null
  },
  {
    id: "FAC040",
    name: "Prof. Hetal Soni",
    designation: "Associate Professor (Accountancy)",
    department: "Silver Oak Commerce College",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bcom",
    profileImage: null
  },
  {
    id: "FAC041",
    name: "Dr. Kalpesh Gaur",
    designation: "Professor & Principal (Pharmacy)",
    department: "Silver Oak College of Pharmacy",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    branch: "bpharm",
    profileImage: null
  },
  {
    id: "FAC042",
    name: "Dr. Jignasa Modi",
    designation: "Professor (Pharmaceutics)",
    department: "Silver Oak College of Pharmacy",
    subjects: [],
    semesters: [1, 2, 3, 4],
    branch: "dpharm",
    profileImage: null
  },
  {
    id: "FAC043",
    name: "Dr. Rekha Kumari",
    designation: "Professor & Dean (Law)",
    department: "Silver Oak Law College",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    branch: "ballb",
    profileImage: null
  },
  {
    id: "FAC044",
    name: "Prof. Aniruddh Jadeja",
    designation: "Associate Professor (Jurisprudence)",
    department: "Silver Oak Law College",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    branch: "bballb",
    profileImage: null
  },
  {
    id: "FAC045",
    name: "Capt. R. K. Nair",
    designation: "Professor & Director (Aviation)",
    department: "Silver Oak College of Aviation Technology",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bsc_av",
    profileImage: null
  },
  {
    id: "FAC046",
    name: "Prof. Amit Sen",
    designation: "Head of Dept (Animation & VFX)",
    department: "Silver Oak College of Animation and Multimedia",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6],
    branch: "bsc_anim",
    profileImage: null
  },
  {
    id: "FAC047",
    name: "Dr. Urvi Joshi",
    designation: "Associate Professor (Physiotherapy)",
    department: "Silver Oak College of Physiotherapy",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    branch: "bpt",
    profileImage: null
  },
  {
    id: "FAC048",
    name: "Dr. Sarita Patel",
    designation: "Principal & Professor (Nursing)",
    department: "Silver Oak College of Nursing",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    branch: "bsc_nurs",
    profileImage: null
  },
  {
    id: "FAC049",
    name: "Dr. Anupama Sharma",
    designation: "Professor & Head (Biotechnology)",
    department: "Biotechnology Engineering",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    branch: "btech_biotech",
    profileImage: null
  },
  {
    id: "FAC050",
    name: "Prof. Kunal Patel",
    designation: "Associate Professor (Biotechnology)",
    department: "Biotechnology Engineering",
    subjects: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    branch: "btech_biotech",
    profileImage: null
  }
];

// Load existing subjects
const existingSubjects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subjects.json'), 'utf8'));
let currentSubjectCount = existingSubjects.length;

// Generate curriculum courses for new programs:
const additionalCourses = [];

function addCourse(code, name, semester, department, program, credits = 4) {
  currentSubjectCount++;
  const id = `SUB${String(currentSubjectCount).padStart(3, '0')}`;
  const course = {
    id,
    code,
    name,
    semester,
    department,
    program,
    credits
  };
  additionalCourses.push(course);
  return id;
}

// 1. MSc IT (msc_it - 4 semesters)
addCourse('1010047101', 'Advanced Web Development & Frameworks', 1, 'Silver Oak College of Computer Application', 'msc_it');
addCourse('1010047102', 'Cloud Computing & Microservices Architecture', 2, 'Silver Oak College of Computer Application', 'msc_it');
addCourse('1010047201', 'Enterprise Information Security & Governance', 3, 'Silver Oak College of Computer Application', 'msc_it');
addCourse('1010047202', 'Big Data Analytics & Knowledge Engineering', 4, 'Silver Oak College of Computer Application', 'msc_it');

// 2. Chemical Engineering (btech_ch - 8 semesters)
addCourse('1010023101', 'Process Calculations & Stoichiometry', 1, 'Chemical Engineering', 'btech_ch');
addCourse('1010023102', 'Fluid Flow Operations', 2, 'Chemical Engineering', 'btech_ch');
addCourse('1010023201', 'Chemical Engineering Thermodynamics', 3, 'Chemical Engineering', 'btech_ch');
addCourse('1010023202', 'Heat Transfer Operations', 4, 'Chemical Engineering', 'btech_ch');
addCourse('1010023301', 'Mass Transfer Operations I', 5, 'Chemical Engineering', 'btech_ch');
addCourse('1010023302', 'Chemical Reaction Engineering I', 6, 'Chemical Engineering', 'btech_ch');
addCourse('1010023401', 'Process Dynamics & Instrumentation Control', 7, 'Chemical Engineering', 'btech_ch');
addCourse('1010023402', 'Plant Design & Chemical Project Economics', 8, 'Chemical Engineering', 'btech_ch');

// 3. Electrical Engineering (btech_ee - 8 semesters)
addCourse('1010083101', 'Basic Electrical Engineering & Network Analysis', 1, 'Electrical Engineering', 'btech_ee');
addCourse('1010083102', 'Electromagnetic Field Theory', 2, 'Electrical Engineering', 'btech_ee');
addCourse('1010083201', 'Electrical Machines I', 3, 'Electrical Engineering', 'btech_ee');
addCourse('1010083202', 'Control Systems Engineering', 4, 'Electrical Engineering', 'btech_ee');
addCourse('1010083301', 'Power Systems Generation & Transmission', 5, 'Electrical Engineering', 'btech_ee');
addCourse('1010083302', 'Power Electronics & Drives', 6, 'Electrical Engineering', 'btech_ee');
addCourse('1010083401', 'Switchgear & Power System Protection', 7, 'Electrical Engineering', 'btech_ee');
addCourse('1010083402', 'Smart Grid & Renewable Energy Integration', 8, 'Electrical Engineering', 'btech_ee');

// 4. Aeronautical Engineering (btech_aero - 8 semesters)
addCourse('1010013101', 'Introduction to Aeronautics & Aerospace Systems', 1, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013102', 'Aerothermodynamics & Gas Dynamics', 2, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013201', 'Incompressible Aerodynamics & Airfoil Theory', 3, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013202', 'Aircraft Structural Mechanics & Analysis', 4, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013301', 'Aircraft Propulsion & Jet Engines', 5, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013302', 'Flight Dynamics & Aircraft Stability Control', 6, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013401', 'Avionics & Airborne Communication Systems', 7, 'Aeronautical Engineering', 'btech_aero');
addCourse('1010013402', 'Space Flight Mechanics & Rocket Propulsion', 8, 'Aeronautical Engineering', 'btech_aero');

// 5. Computer Science & Engineering (ASOIT - btech_cse - 8 semesters)
addCourse('1010043111', 'Principles of Programming & Logic in C', 1, 'Computer Engineering', 'btech_cse');
addCourse('1010043112', 'Object Oriented Programming with Java', 2, 'Computer Engineering', 'btech_cse');
addCourse('1010043211', 'Data Structures & Algorithms Laboratory', 3, 'Computer Engineering', 'btech_cse');
addCourse('1010043212', 'Database Management Systems & SQL', 4, 'Computer Engineering', 'btech_cse');
addCourse('1010043311', 'Design & Analysis of Algorithms', 5, 'Computer Engineering', 'btech_cse');
addCourse('1010043312', 'Software Engineering & Agile Methodologies', 6, 'Computer Engineering', 'btech_cse');
addCourse('1010043411', 'Distributed Cloud Architecture & DevOps', 7, 'Computer Engineering', 'btech_cse');
addCourse('1010043412', 'Full Stack Capstone Project & Deployment', 8, 'Computer Engineering', 'btech_cse');

// 6. Electronics & Communication (ASOIT - btech_ec - 8 semesters)
addCourse('1010073101', 'Electronic Devices & Circuits', 1, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073102', 'Digital Logic Design & Verilog', 2, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073201', 'Signals and Systems', 3, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073202', 'Analog & Digital Communication', 4, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073301', 'Microprocessors, Microcontrollers & Interfacing', 5, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073302', 'VLSI Design & Embedded System Programming', 6, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073401', 'Wireless Sensor Networks & IoT Architecture', 7, 'Electronics & Communication Engineering', 'btech_ec');
addCourse('1010073402', 'Satellite & Optical Fiber Communications', 8, 'Electronics & Communication Engineering', 'btech_ec');

// 7. Biotechnology Engineering (ASOIT - btech_biotech - 8 semesters)
addCourse('1010033101', 'Fundamentals of Cell Biology & Genetics', 1, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033102', 'Biochemistry & Molecular Physiology', 2, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033201', 'Microbiology & Culture Techniques', 3, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033202', 'Genetic Engineering & Recombinant DNA', 4, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033301', 'Bioprocess Engineering & Fermentation', 5, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033302', 'Immunology & Vaccine Technology', 6, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033401', 'Bioinformatics & Computational Genomics', 7, 'Biotechnology Engineering', 'btech_biotech');
addCourse('1010033402', 'Biopharmaceutical Product Formulation', 8, 'Biotechnology Engineering', 'btech_biotech');

// 8. B.Sc. Microbiology (SOIS - bsc_micro - 6 semesters)
addCourse('1050013101', 'Introduction to Microbial World & Microscopy', 1, 'Silver Oak Institute of Science', 'bsc_micro');
addCourse('1050013102', 'Bacteriology & Virology Fundamentals', 2, 'Silver Oak Institute of Science', 'bsc_micro');
addCourse('1050013201', 'Microbial Genetics & Molecular Biology', 3, 'Silver Oak Institute of Science', 'bsc_micro');
addCourse('1050013202', 'Environmental & Soil Microbiology', 4, 'Silver Oak Institute of Science', 'bsc_micro');
addCourse('1050013301', 'Medical & Diagnostic Microbiology', 5, 'Silver Oak Institute of Science', 'bsc_micro');
addCourse('1050013302', 'Food & Industrial Fermentation Microbiology', 6, 'Silver Oak Institute of Science', 'bsc_micro');

// 9. B.Sc. Chemistry (SOIS - bsc_chem - 6 semesters)
addCourse('1050023101', 'Inorganic Chemistry & Periodic Properties', 1, 'Silver Oak Institute of Science', 'bsc_chem');
addCourse('1050023102', 'Organic Reaction Mechanisms & Stereochemistry', 2, 'Silver Oak Institute of Science', 'bsc_chem');
addCourse('1050023201', 'Physical Chemistry: Thermodynamics & Kinetics', 3, 'Silver Oak Institute of Science', 'bsc_chem');
addCourse('1050023202', 'Spectroscopy & Analytical Instrumental Methods', 4, 'Silver Oak Institute of Science', 'bsc_chem');
addCourse('1050023301', 'Polymer & Industrial Chemical Processes', 5, 'Silver Oak Institute of Science', 'bsc_chem');
addCourse('1050023302', 'Medicinal Chemistry & Drug Synthesis', 6, 'Silver Oak Institute of Science', 'bsc_chem');

// 10. B.Sc. Biotechnology (SOIS - bsc_biotech - 6 semesters)
addCourse('1050033101', 'Cell Biology & Biomolecules', 1, 'Silver Oak Institute of Science', 'bsc_biotech');
addCourse('1050033102', 'Plant & Animal Biotechnology Basics', 2, 'Silver Oak Institute of Science', 'bsc_biotech');
addCourse('1050033201', 'Enzymology & Metabolism', 3, 'Silver Oak Institute of Science', 'bsc_biotech');
addCourse('1050033202', 'Molecular Diagnostics & DNA Fingerprinting', 4, 'Silver Oak Institute of Science', 'bsc_biotech');
addCourse('1050033301', 'Bioethics, Biosafety & Intellectual Property', 5, 'Silver Oak Institute of Science', 'bsc_biotech');
addCourse('1050033302', 'Agricultural & Environmental Biotechnology', 6, 'Silver Oak Institute of Science', 'bsc_biotech');

// 11. BBA (SOIM - bba - 6 semesters)
addCourse('1060013101', 'Principles of Management & Organization', 1, 'Silver Oak Institute of Management', 'bba');
addCourse('1060013102', 'Managerial Economics & Business Statistics', 2, 'Silver Oak Institute of Management', 'bba');
addCourse('1060013201', 'Financial Accounting & Cost Management', 3, 'Silver Oak Institute of Management', 'bba');
addCourse('1060013202', 'Marketing Management & Consumer Insights', 4, 'Silver Oak Institute of Management', 'bba');
addCourse('1060013301', 'Human Resource Management & Labour Laws', 5, 'Silver Oak Institute of Management', 'bba');
addCourse('1060013302', 'Strategic Management & Business Policy', 6, 'Silver Oak Institute of Management', 'bba');

// 12. B.Com (SOCC - bcom - 6 semesters)
addCourse('1070013101', 'Financial Accounting I', 1, 'Silver Oak Commerce College', 'bcom');
addCourse('1070013102', 'Business Economics & Commercial Law', 2, 'Silver Oak Commerce College', 'bcom');
addCourse('1070013201', 'Corporate Accounting & Auditing Practices', 3, 'Silver Oak Commerce College', 'bcom');
addCourse('1070013202', 'Goods and Services Tax (GST) & Customs Law', 4, 'Silver Oak Commerce College', 'bcom');
addCourse('1070013301', 'Direct Taxation & Financial Reporting', 5, 'Silver Oak Commerce College', 'bcom');
addCourse('1070013302', 'Banking Operations, Investment & Insurance', 6, 'Silver Oak Commerce College', 'bcom');

// 13. B.Pharm (SOCP - bpharm - 8 semesters)
addCourse('1080013101', 'Human Anatomy & Physiology I', 1, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013102', 'Pharmaceutical Analysis & Inorganic Chemistry', 2, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013201', 'Pharmaceutics I & Physical Pharmacy', 3, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013202', 'Pharmaceutical Organic Chemistry II', 4, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013301', 'Medicinal Chemistry I & Pharmacology I', 5, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013302', 'Pharmacology II & Pharmacognosy', 6, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013401', 'Industrial Pharmacy & Quality Assurance', 7, 'Silver Oak College of Pharmacy', 'bpharm');
addCourse('1080013402', 'Biopharmaceutics & Pharmacokinetics', 8, 'Silver Oak College of Pharmacy', 'bpharm');

// 14. D.Pharm (SOCP - dpharm - 4 semesters)
addCourse('1080023101', 'Pharmaceutics & Pharmaceutical Chemistry', 1, 'Silver Oak College of Pharmacy', 'dpharm');
addCourse('1080023102', 'Pharmacognosy & Human Physiology', 2, 'Silver Oak College of Pharmacy', 'dpharm');
addCourse('1080023201', 'Pharmacology & Toxicology Principles', 3, 'Silver Oak College of Pharmacy', 'dpharm');
addCourse('1080023202', 'Hospital & Clinical Pharmacy Management', 4, 'Silver Oak College of Pharmacy', 'dpharm');

// 15. BA LL.B (SOLC - ballb - 10 semesters)
addCourse('1090013101', 'Legal Methods, Legal Systems & Torts', 1, 'Silver Oak Law College', 'ballb');
addCourse('1090013102', 'Law of Contract I & General Principles', 2, 'Silver Oak Law College', 'ballb');
addCourse('1090013201', 'Constitutional Law of India I', 3, 'Silver Oak Law College', 'ballb');
addCourse('1090013202', 'Constitutional Law of India II & Administrative Law', 4, 'Silver Oak Law College', 'ballb');
addCourse('1090013301', 'Indian Penal Code (Criminal Law I)', 5, 'Silver Oak Law College', 'ballb');
addCourse('1090013302', 'Code of Criminal Procedure (CrPC)', 6, 'Silver Oak Law College', 'ballb');
addCourse('1090013401', 'Code of Civil Procedure (CPC) & Limitation', 7, 'Silver Oak Law College', 'ballb');
addCourse('1090013402', 'Law of Evidence & Forensic Examination', 8, 'Silver Oak Law College', 'ballb');
addCourse('1090013501', 'Intellectual Property Rights & Cyber Laws', 9, 'Silver Oak Law College', 'ballb');
addCourse('1090013502', 'Moot Court Exercise, Internship & Professional Ethics', 10, 'Silver Oak Law College', 'ballb');

// 16. BBA LL.B (SOLC - bballb - 10 semesters)
addCourse('1090023101', 'Business Organization & Law of Contracts', 1, 'Silver Oak Law College', 'bballb');
addCourse('1090023102', 'Corporate Accounting & Corporate Governance', 2, 'Silver Oak Law College', 'bballb');
addCourse('1090023201', 'Constitutional Law & Commercial Jurisprudence', 3, 'Silver Oak Law College', 'bballb');
addCourse('1090023202', 'Company Law I & Share Capital Framework', 4, 'Silver Oak Law College', 'bballb');
addCourse('1090023301', 'Company Law II & Mergers / Acquisitions', 5, 'Silver Oak Law College', 'bballb');
addCourse('1090023302', 'Banking, Insurance & Financial Regulations', 6, 'Silver Oak Law College', 'bballb');
addCourse('1090023401', 'Labour & Industrial Relations Laws', 7, 'Silver Oak Law College', 'bballb');
addCourse('1090023402', 'Competition Law & International Trade Law', 8, 'Silver Oak Law College', 'bballb');
addCourse('1090023501', 'Corporate Insolvency & Bankruptcy Code', 9, 'Silver Oak Law College', 'bballb');
addCourse('1090023502', 'Drafting, Pleading & Conveyancing (Litigation Clinic)', 10, 'Silver Oak Law College', 'bballb');

// 17. B.Sc. Aviation (SOCAT - bsc_av - 6 semesters)
addCourse('1100013101', 'Air Regulations & Air Traffic Control Fundamentals', 1, 'Silver Oak College of Aviation Technology', 'bsc_av');
addCourse('1100013102', 'Aviation Meteorology & Weather Hazards', 2, 'Silver Oak College of Aviation Technology', 'bsc_av');
addCourse('1100013201', 'Air Navigation & Radio Aids to Navigation', 3, 'Silver Oak College of Aviation Technology', 'bsc_av');
addCourse('1100013202', 'Aircraft Instruments & Flight Systems', 4, 'Silver Oak College of Aviation Technology', 'bsc_av');
addCourse('1100013301', 'Airport Planning, Operations & Ground Handling', 5, 'Silver Oak College of Aviation Technology', 'bsc_av');
addCourse('1100013302', 'Airline Safety Management & Aviation Security', 6, 'Silver Oak College of Aviation Technology', 'bsc_av');

// 18. B.Sc. Animation & VFX (SOCAM - bsc_anim - 6 semesters)
addCourse('1110013101', 'Foundation Drawing, Anatomy & Design Principles', 1, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');
addCourse('1110013102', '2D Classical Animation & Digital Storyboarding', 2, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');
addCourse('1110013201', '3D Modeling, Texturing & UV Mapping (Maya/Blender)', 3, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');
addCourse('1110013202', 'Character Rigging & 3D Computer Animation', 4, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');
addCourse('1110013301', 'Visual Effects (VFX), Rotoscopy & Digital Compositing', 5, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');
addCourse('1110013302', 'Lighting, Rendering & Showreel Capstone Portfolio', 6, 'Silver Oak College of Animation and Multimedia', 'bsc_anim');

// 19. BPT (Physiotherapy - bpt - 8 semesters)
addCourse('1120013101', 'Human Anatomy & Histology for Physiotherapy', 1, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013102', 'Physiology & Biochemistry in Health & Disease', 2, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013201', 'Biomechanics, Kinesiology & Exercise Therapy I', 3, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013202', 'Electrotherapy & Physical Agents', 4, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013301', 'Orthopedic Physiotherapy & Sports Rehabilitation', 5, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013302', 'Neurological Physiotherapy & Stroke Rehabilitation', 6, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013401', 'Cardiopulmonary Physiotherapy & ICU Management', 7, 'Silver Oak College of Physiotherapy', 'bpt');
addCourse('1120013402', 'Clinical Internship & Advanced Rehabilitation Practice', 8, 'Silver Oak College of Physiotherapy', 'bpt');

// 20. B.Sc. Nursing (Nursing - bsc_nurs - 8 semesters)
addCourse('1130013101', 'Applied Anatomy & Physiology in Nursing', 1, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013102', 'Applied Sociology, Psychology & Ethics', 2, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013201', 'Nursing Foundations I (First Aid & Patient Care)', 3, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013202', 'Pharmacology & Pathology with Clinical Genetics', 4, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013301', 'Adult Health Nursing I (Medical-Surgical Nursing)', 5, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013302', 'Child Health Nursing (Pediatric Care)', 6, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013401', 'Community Health Nursing & Epidemiology', 7, 'Silver Oak College of Nursing', 'bsc_nurs');
addCourse('1130013402', 'Midwifery & Obstetrical Nursing (Clinical Residency)', 8, 'Silver Oak College of Nursing', 'bsc_nurs');

// Deduplicate subjects cleanly by program + code
const seen = new Set();
const cleanSubjects = [];
let idCounter = 1;

[...existingSubjects, ...additionalCourses].forEach(sub => {
  const key = `${sub.program}-${sub.code}`;
  if (!seen.has(key)) {
    seen.add(key);
    cleanSubjects.push({
      ...sub,
      id: `SUB${String(idCounter++).padStart(3, '0')}`
    });
  }
});

// Clear previous dynamic subjects from faculty and re-assign accurately
faculty.forEach(f => {
  f.subjects = [];
});

// Map subjects to faculty based on department and subject IDs
cleanSubjects.forEach(sub => {
  const matchingFac = faculty.filter(f => f.department === sub.department);
  if (matchingFac.length > 0) {
    matchingFac.forEach(f => {
      if (!f.subjects.includes(sub.id)) {
        f.subjects.push(sub.id);
      }
    });
  }
});

console.log(`Total Programs: ${programs.length}`);
console.log(`Total Faculty: ${faculty.length}`);
console.log(`Total Clean Subjects: ${cleanSubjects.length}`);

// Write files
fs.writeFileSync(path.join(DATA_DIR, 'programs.json'), JSON.stringify(programs, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'subjects.json'), JSON.stringify(cleanSubjects, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'faculty.json'), JSON.stringify(faculty, null, 2), 'utf8');

console.log('Successfully written programs.json, subjects.json, and faculty.json!');


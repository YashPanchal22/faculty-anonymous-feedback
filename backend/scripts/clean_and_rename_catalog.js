// Clean and rename university datasets
// Removes "Silver Oak" and all "SOCCA / SOCET / ASOIT" prefixes
// Renames institution to "Apex University"
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const deptMap = {
  'Silver Oak College of Computer Application': 'Department of Computer Applications',
  'Silver Oak Institute of Science': 'Department of Science & Mathematics',
  'Silver Oak Institute of Management': 'Department of Management Studies',
  'Silver Oak Commerce College': 'Department of Commerce',
  'Silver Oak College of Pharmacy': 'Department of Pharmaceutical Sciences',
  'Silver Oak Law College': 'Department of Legal Studies',
  'Silver Oak College of Aviation Technology': 'Department of Aviation Technology',
  'Silver Oak College of Animation and Multimedia': 'Department of Animation & Multimedia',
  'Silver Oak College of Physiotherapy': 'Department of Physiotherapy',
  'Silver Oak College of Nursing': 'Department of Nursing',
  'College of Computer Application': 'Department of Computer Applications'
};

function cleanDept(dept) {
  return deptMap[dept] || dept;
}

// 1. PROGRAMS
const programs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'programs.json'), 'utf8'));
const cleanedPrograms = programs.map(p => {
  let cleanName = p.name;
  if (cleanName.includes('—')) {
    cleanName = cleanName.split('—')[1].trim();
  }
  // Remove any remaining prefix like "SOCCA - " or similar
  cleanName = cleanName.replace(/^(SOCCA|SOCET|ASOIT|SOIS|SOIM|SOCC|SOCP|SOLC|SOCAT|SOCAM)\s*[-:]\s*/i, '');
  
  return {
    ...p,
    name: cleanName,
    department: cleanDept(p.department)
  };
});
fs.writeFileSync(path.join(DATA_DIR, 'programs.json'), JSON.stringify(cleanedPrograms, null, 2), 'utf8');
console.log('Cleaned programs.json (Total:', cleanedPrograms.length, ')');

// 2. SUBJECTS
const subjects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subjects.json'), 'utf8'));
const cleanedSubjects = subjects.map(s => ({
  ...s,
  department: cleanDept(s.department)
}));
fs.writeFileSync(path.join(DATA_DIR, 'subjects.json'), JSON.stringify(cleanedSubjects, null, 2), 'utf8');
console.log('Cleaned subjects.json (Total:', cleanedSubjects.length, ')');

// 3. FACULTY
const faculty = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'faculty.json'), 'utf8'));
const cleanedFaculty = faculty.map(f => {
  let desig = f.designation || '';
  desig = desig.replace(/\(ASOIT\)/gi, '').replace(/\(SOCCA\)/gi, '').trim();
  return {
    ...f,
    designation: desig,
    department: cleanDept(f.department)
  };
});
fs.writeFileSync(path.join(DATA_DIR, 'faculty.json'), JSON.stringify(cleanedFaculty, null, 2), 'utf8');
console.log('Cleaned faculty.json (Total:', cleanedFaculty.length, ')');

// 4. USERS
const users = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
const cleanedUsers = users.map(u => {
  const empId = u.employeeId ? u.employeeId.replace('SOU', 'APX') : undefined;
  return {
    ...u,
    department: cleanDept(u.department),
    ...(empId ? { employeeId: empId } : {})
  };
});
fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(cleanedUsers, null, 2), 'utf8');
console.log('Cleaned users.json (Total:', cleanedUsers.length, ')');

console.log('All backend datasets successfully updated without Silver Oak / SOCCA / SOCET branding!');

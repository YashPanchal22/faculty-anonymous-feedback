// Explicit Program + Semester + Subject to Faculty (Sir) Mapping
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const faculty = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'faculty.json'), 'utf8'));
const subjects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subjects.json'), 'utf8'));
const programs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'programs.json'), 'utf8'));

// Clear previous assignments
faculty.forEach(f => {
  f.subjects = [];
});

// Define program faculty teams:
const programFacultyMap = {
  bsc_ds: ['FAC001', 'FAC002', 'FAC007', 'FAC008'], // Prof. Deepa Shah, Dr. Arvind Sharma, Dr. Suresh Mehta, Prof. Anita Joshi
  bca: ['FAC006', 'FAC010', 'FAC013', 'FAC002'],    // Prof. Priya Desai, Prof. Kavita Rao, Prof. Pooja Dave, Dr. Arvind Sharma
  bsc_it: ['FAC001', 'FAC006', 'FAC013'],           // Prof. Deepa Shah, Prof. Priya Desai, Prof. Pooja Dave
  bsc_csdf: ['FAC015', 'FAC016'],                   // Dr. Manish Patel, Prof. Sneha Shah
  mca: ['FAC002', 'FAC001', 'FAC015'],              // Dr. Arvind Sharma, Prof. Deepa Shah, Dr. Manish Patel
  msc_it: ['FAC001', 'FAC013', 'FAC007'],           // Prof. Deepa Shah, Prof. Pooja Dave, Dr. Suresh Mehta
  btech_ce: ['FAC003', 'FAC005', 'FAC011', 'FAC012', 'FAC032'], // Dr. Satvik Khara, Dr. Rajesh Kumar, Dr. Amit Trivedi, Prof. Hardik Vyas, Dr. Rushabh Shah
  btech_it: ['FAC004', 'FAC014'],                   // Prof. Neha Patel, Dr. Bhavesh Parmar
  btech_aiml: ['FAC009', 'FAC025'],                 // Dr. Vikram Singh, Dr. Pratik Patel
  btech_cs: ['FAC015', 'FAC016', 'FAC003'],         // Dr. Manish Patel, Prof. Sneha Shah, Dr. Satvik Khara
  btech_cse: ['FAC003', 'FAC032', 'FAC011'],        // Dr. Satvik Khara, Dr. Rushabh Shah, Dr. Amit Trivedi
  btech_me: ['FAC017', 'FAC018'],                   // Dr. Keyur Chauhan, Prof. Rakesh Bhavsar
  btech_cl: ['FAC019', 'FAC020'],                   // Dr. Darshan Shah, Prof. Kruti Joshi
  btech_ch: ['FAC026', 'FAC027'],                   // Dr. Hitesh Barot, Prof. Alok Trivedi
  btech_ee: ['FAC028', 'FAC029'],                   // Dr. Vimal Patel, Prof. Manish Trivedi
  btech_aero: ['FAC030', 'FAC031'],                 // Dr. Shailesh Thakkar, Prof. Viral Shah
  btech_ec: ['FAC033'],                             // Prof. Mital Patel
  btech_biotech: ['FAC049', 'FAC050'],              // Dr. Anupama Sharma, Prof. Kunal Patel
  bsc_cs: ['FAC021', 'FAC022'],                     // Dr. Hemal Pandya, Prof. Bhavin Raval
  bsc_micro: ['FAC034'],                            // Dr. Chirag Patel
  bsc_chem: ['FAC035'],                             // Dr. Meera Desai
  bsc_biotech: ['FAC036'],                          // Prof. Swati Dave
  msc_ds: ['FAC021', 'FAC022'],                     // Dr. Hemal Pandya, Prof. Bhavin Raval
  bba: ['FAC037', 'FAC038'],                        // Dr. Gaurav Tandon, Prof. Aarti Mehta
  mba: ['FAC023', 'FAC024'],                        // Dr. Nilay Dave, Prof. Shalini Varma
  bcom: ['FAC039', 'FAC040'],                       // Dr. Ramesh Chandra, Prof. Hetal Soni
  bpharm: ['FAC041', 'FAC042'],                     // Dr. Kalpesh Gaur, Dr. Jignasa Modi
  dpharm: ['FAC041', 'FAC042'],                     // Dr. Kalpesh Gaur, Dr. Jignasa Modi
  ballb: ['FAC043', 'FAC044'],                      // Dr. Rekha Kumari, Prof. Aniruddh Jadeja
  bballb: ['FAC043', 'FAC044'],                     // Dr. Rekha Kumari, Prof. Aniruddh Jadeja
  bsc_av: ['FAC045'],                               // Capt. R. K. Nair
  bsc_anim: ['FAC046'],                             // Prof. Amit Sen
  bpt: ['FAC047'],                                  // Dr. Urvi Joshi
  bsc_nurs: ['FAC048']                              // Dr. Sarita Patel
};

// Assign each subject to a specific faculty member (Sir/Madam):
const facById = {};
faculty.forEach(f => {
  facById[f.id] = f;
});

subjects.forEach((sub, idx) => {
  const team = programFacultyMap[sub.program] || ['FAC001'];
  // Assign faculty based on semester / subject index in rotation
  const facId = team[idx % team.length];
  const assignedFac = facById[facId];

  sub.facultyId = facId;
  sub.facultyName = assignedFac ? assignedFac.name : 'Faculty';
  sub.facultyDesignation = assignedFac ? assignedFac.designation : '';

  if (assignedFac) {
    if (!assignedFac.subjects.includes(sub.id)) {
      assignedFac.subjects.push(sub.id);
    }
  }
});

// Verify every faculty has subjects
let unassignedFac = 0;
faculty.forEach(f => {
  if (f.subjects.length === 0) {
    console.warn('Faculty without subjects:', f.id, f.name);
    unassignedFac++;
  }
});
console.log('Total subjects assigned:', subjects.length);
console.log('Unassigned faculty:', unassignedFac);

// Save updated files
fs.writeFileSync(path.join(DATA_DIR, 'subjects.json'), JSON.stringify(subjects, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'faculty.json'), JSON.stringify(faculty, null, 2), 'utf8');
console.log('Successfully saved subjects.json and faculty.json with explicit faculty mapping!');

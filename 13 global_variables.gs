// SCHEDULE TOOL
  const g_statusArr = [
    ['X',     '#6aa84f'],
    ['O',     '#ff9900'],
    ['1',     '#bf9000'],
    ['1.5',   '#bf9000'],
    ['2',     '#bf9000'],
    ['2.5',   '#bf9000'],
    ['3',     '#bf9000'],
    ['3.5',   '#bf9000'],
    ['4',     '#bf9000'],
    ['4.5',   '#bf9000'],
    ['5',     '#bf9000'],
    ['5.5',   '#bf9000'],
    ['6',     '#bf9000'],
    ['6.5',   '#bf9000'],
    ['7',     '#bf9000'],
    ['7.5',   '#bf9000'],
    ['S',     '#3c78d8'],
    ['T',     '#5a3286'],
    ['W',     '#25818e'],
    ['H',     '#b10202'],
    ['L',     '#0000ff'],
    ['N',     '#3d3d3d'],
    ['D',     '']
  ];

  const g_status = g_statusArr.map(x => x[0]);

  const g_workDays = ['X', "O", "W"]; // For error highlighting.

// ROSTER
  const g_rosterHeaders = ['EmpID', 'DepartmentType', 'FirstName',	'LastName', 'Title', 'ADEmail', 'Supervisor', 'Status'];
  const g_rosterID = '1ZyTa6su0ZVJABYRrqRKbz372MkrcGg_BYDL1gh2DRlk';
  const g_rosterSS = 'Cyberdyne Systems Employee Roster';
  const g_roster_activeColHeader = 'EmployeeStatus';
  const g_roster_activeMarker = 'Active';
  const g_roster_idColHeader = 'EmpID';

  let g_roster_activeIndex;// Defined in initialize_gVars() (below);
  let g_roster_idIndex; // Defined in initialize_gVars() (below);

// ADMIN
  const g_adminID = '1uujv5j0L9ExAWP0uMKkr1MB0xXvl9kVbfw4Gbx8MDa4';
  const g_admin_activeSS = 'Active Employees';
  const g_admin_exitedSS = 'Exited Employees';
  const g_admin_checkInSS = 'Check-In';
  const g_admin_confirmSS = 'Schedule Confirmation';
  const g_admin_idColHeader = 'EmpID';
  const g_admin_managerIdColHeader = 'Supervisor';

  let g_admin_idIndex;// Defined in initialize_gVars() (below);
  let g_admin_managerIdIndex;// Defined in initialize_gVars() (below);

// CLIENT
  const g_client_dataTab = 'Data';
  const g_client_scheduleTab = 'Schedule';
  const g_emailDomain = new RegExp('@gmail.com|@google.com');

// Check-In
  const g_checkIn_formResponses = '1C2fR9cAYOIZiXmIY5DUtJ_iAqmjEPrPWhBXtfiZ7kfk';
  const g_checkIn_formResponses_tab = 'Form Responses 1';

function initialize_gVars() {
  g_roster_activeIndex = SpreadsheetApp.openById(g_rosterID).getSheetByName(g_rosterSS)
    .getRange('1:1').getValues().flat().indexOf(g_roster_activeColHeader);
  g_roster_idIndex = SpreadsheetApp.openById(g_rosterID).getSheetByName(g_rosterSS)
    .getRange('1:1').getValues().flat().indexOf(g_roster_idColHeader);
  g_admin_idIndex = SpreadsheetApp.openById(g_adminID).getSheetByName(g_admin_activeSS)
    .getRange('1:1').getValues().flat().indexOf(g_admin_idColHeader);
  g_admin_managerIdIndex = SpreadsheetApp.openById(g_adminID).getSheetByName(g_admin_activeSS)
    .getRange('1:1').getValues().flat().indexOf(g_admin_managerIdColHeader);
}

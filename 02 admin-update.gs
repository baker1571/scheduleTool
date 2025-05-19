function update_roster() {

  // Initialize global variables
    initialize_gVars();

  // Get roster data
    const rosterSheet = SpreadsheetApp.openById(g_rosterID).getSheetByName(g_rosterSS);
    const rosterData = rosterSheet.getDataRange().getDisplayValues();
    const headers = rosterData.shift();

    const headerIndices = g_rosterHeaders.map(h => headers.indexOf(h));
    const getColumn = (arr, index) => arr.map(row => row[Math.floor(index)]);

    const isActive = row => row[g_roster_activeIndex] == g_roster_activeMarker;
    const activeRows = rosterData.filter(isActive);
    const exitedRows = rosterData.filter(row => !isActive(row));

    const activeRoster = transpose(headerIndices.map(i => getColumn(activeRows, i)));
    const exitedRoster = transpose(headerIndices.map(i => getColumn(exitedRows, i)));

  // Get admin sheet data & schedule strings
    const adminSS = SpreadsheetApp.openById(g_adminID);
    const activeSheet = adminSS.getSheetByName(g_admin_activeSS);
    const exitedSheet = adminSS.getSheetByName(g_admin_exitedSS);

    const getScheduleStringIndex = sheet =>
      sheet.getRange('1:1').getDisplayValues().flat().indexOf('Schedule String') + 1;

    const activeStringIndex = getScheduleStringIndex(activeSheet);
    const exitedStringIndex = getScheduleStringIndex(exitedSheet);

    const activeObjs = activeSheet.getRange(2, activeStringIndex, activeSheet.getMaxRows() - 1, 1).getValues();
    const exitedObjs = exitedSheet.getRange(2, exitedStringIndex, exitedSheet.getMaxRows() - 1, 1).getValues();

    const scheduleObjs = activeObjs.concat(exitedObjs).filter(Boolean).map(row => str2Obj(row[0]));

    const activeIDs = activeRoster.map(row => row[g_roster_idIndex]);
    const exitedIDs = exitedRoster.map(row => row[g_roster_idIndex]);

  // Attach schedule strings to matching roster entries
    scheduleObjs.forEach(obj => {
      const scheduleStr = obj2Str(obj);
      const activeIdx = activeIDs.indexOf(obj.id);
      const exitedIdx = exitedIDs.indexOf(obj.id);

      if (activeIdx !== -1) {
        activeRoster[activeIdx].push(scheduleStr);
      } else if (exitedIdx !== -1) {
        exitedRoster[exitedIdx].push(scheduleStr);
      }
    });

  // Append blank schedule strings if missing.
    const blankString = g_statusArr.map(x => x[0]).join(';');

    const maxActiveLength = Math.max(...activeRoster.map(row => row.length));
    const maxExitedLength = Math.max(...exitedRoster.map(row => row.length));

    const scheduleHeaderMissing = maxActiveLength === g_rosterHeaders.length;

    const finalActiveLength = scheduleHeaderMissing ? maxActiveLength + 1 : maxActiveLength;
    const finalExitedLength = scheduleHeaderMissing ? maxExitedLength + 1 : maxExitedLength;

    activeRoster.forEach(row => {
      if (row.length < finalActiveLength) {
        row.push(`${row[0]},${null},${new Date()};${blankString}`);
      }
    });

    exitedRoster.forEach(row => {
      if (row.length < finalExitedLength) {
        row.push('');
      }
    });

  // Write to sheets
    const fullHeaders = [...g_rosterHeaders, 'Schedule String'];
    activeSheet.clearContents();
    exitedSheet.clearContents();

    activeSheet.getRange(1, 1, 1, fullHeaders.length).setValues([fullHeaders]);
    exitedSheet.getRange(1, 1, 1, fullHeaders.length).setValues([fullHeaders]);

    activeSheet.getRange(2, 1, activeRoster.length, activeRoster[0].length).setValues(activeRoster);
    try { exitedSheet.getRange(2, 1, exitedRoster.length, exitedRoster[0].length).setValues(exitedRoster); } 
    catch (err) { Logger.log("Error writing exited roster: " + err); }

}

function updateCheckIn() {

  // Calculate the cutoff date
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

  // Get recent form responses from check-in sheet (within the last 7 days)
    const formResponsesSheet = SpreadsheetApp.openById(g_checkIn_formResponses).getSheetByName(g_checkIn_formResponses_tab);
    const allResponses = formResponsesSheet.getDataRange().getValues();
    const recentResponses = allResponses.filter( row => row[0] > sevenDaysAgo || row[0] === 'Timestamp' );

  // Open the admin spreadsheet and select the check-in sheet
    const adminSS = SpreadsheetApp.openById(g_adminID);
    const checkInSheet = adminSS.getSheetByName(g_admin_checkInSS);

  // Write the filtered responses to the check-in sheet
    checkInSheet.getRange(1, 1, recentResponses.length, recentResponses[0].length).setValues(recentResponses);

}


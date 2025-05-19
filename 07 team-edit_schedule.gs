function addSchedule() {
  update_schedule();
  const adminSchedule = SpreadsheetApp.openById('1uujv5j0L9ExAWP0uMKkr1MB0xXvl9kVbfw4Gbx8MDa4');
  const activeEmployees = adminSchedule.getSheetByName('Active Employees');
  const log = adminSchedule.getSheetByName('Log');

  const ss = SpreadsheetApp.openById('1eL9aaiR3Ugk7IarlRUZyPHrVaTjJWuTfhxhyMbSIdAQ'); //const ss = SpreadsheetApp.getActive();
  const tab = ss.getSheetByName('Schedule'); //const tab = ss.getActiveSheet();
  const name = tab.getName();
  const editModeCheck = tab.getRange('A1').getBackground();

  // Check that we are in the 'Schedule' tab.
    if (/^Schedule$/.test(name) != true || editModeCheck != '#c9daf8') {
      alert('You can only submit changes in Edit Mode.');
      return
    }

  const admin_employeeIDs = activeEmployees.getRange('A2:A').getValues().flat(); //Need to get column index rather than A1.

  const date = new Date();
  const managerID = Session.getActiveUser().getEmail().replace(/(@gmail.com|@google.com)/,''); // Need to translate this into employee ID.
  const local_employeeIDs = tab.getRange('A2:A').getValues().flat();   //Need to get column index rather than A1.
  let submission = transpose( tab.getDataRange().getDisplayValues() ).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x[0]) == true) ;
  //Logger.log(submission);

  // Ensure input is valid
    const wrongInput = submission.flat()
      .filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x) == false)
      .filter(x => g_status.indexOf(x) == -1)
      .filter(x => x != '');
      //Logger.log(wrongInput);
    if (wrongInput.length > 0) { alert('There is an unacceptable value among the submissions: ' + wrongInput.map(x => ' ' + x) + 
      '. The schedule only accpets the following: ' + g_statusArr.map(x => ' ' + x[0])); }

  submission = submission.filter(x => x.some(z => g_status.includes(z)));  // Since I am using 'g_status' quite a lot, might want to make that a seperate variable.
  //Logger.log(submission);

  let id;
  let index;
  let id_adminIndex;
  let objOld;
  let obj = {};
  let objLog;
  let newDates;
  const dateConflicts = [];
  let answer;
  let newStr;

  for (let i = 0; i < local_employeeIDs.length; i++) {
    dateConflicts.length = 0;
    id = local_employeeIDs[i];
    index = i + 1;
    id_adminIndex = admin_employeeIDs.indexOf(id)+2; Logger.log(id + "'s data is in row " + id_adminIndex + " in the admin sheet");
    objOld = str2Obj( activeEmployees.getRange(id_adminIndex, adminSchedule.getRange('1:1').getValues().flat().indexOf('Schedule String')+1, 1, 1).getValue() );

    obj['id'] = id;
    obj['manager'] = managerID; 
    obj['time'] = date;

    // Establish blank arrays for each of the markers in the gloabal status array.
    g_statusArr.forEach(x => obj[x[0]] = []);

    // For each submission, iterate throguh at an index that correstonds to input for a single agent row, checking for markers that match those in the global status array, pushing the corresponding dates of any matches to the corresponding array element of the new object. 
    submission.forEach(x => {
      if ( g_status.includes(x[index]) ) { obj[x[index]].push(x[0]); }
    });

    // Consolidate all dates pushed to the new object into an array.
    newDates = Object.values(obj).filter(x => Array.isArray(x) && x != '').flat();

    // Stop the loop for this entry if there are no changes made in the schedule.
    if (newDates.length == 0) { continue }

    Logger.log(objOld);
    Logger.log(obj);
    objLog = obj2Str(obj).match(/^.+?\)|([A-Z]),(\d{4}-\d{2}-\d{2}(?:,\d{4}-\d{2}-\d{2})*)|(\d+(\.\d+)?),(\d{4}-\d{2}-\d{2}(?:,\d{4}-\d{2}-\d{2})*)/g) .join(';');
    Logger.log(newDates);

    // For each new date, check if the old array contains conflicting dates, pushing conflict-dates, to the new 'dateConflicts' variable. Might have to do a nested .forEach() ???
    newDates.forEach(x => {
      g_status.forEach(z => {
        if (objOld[z].indexOf(x) != -1) { Logger.log('Conflic removed in ' + z); dateConflicts.push('\n ' + z + ' ' + x); objOld[z].splice(objOld[z].indexOf(x),1);}
      });
    });
    
    Logger.log('dateConflicts');
    Logger.log(dateConflicts);

    // If there are date conflicts, ask user whether or not to continue.
    if (dateConflicts.length != 0) { answer = yesno('There were conflicts for ' + id + ' on the following dates: \n' + dateConflicts + '\n\nWould you like to overwrite these schedule entries?');} 
    if (answer == 'NO') { return }

    // For each marker, combine the corresponding value arrays of the (new) 'obj' and (old) objOld.
    g_status.forEach(x => obj[x] = obj[x].concat(objOld[x]) );

    Logger.log(obj);

    // Put the new schedule obj into str notation and writes it into the admin schedule.
    newStr = obj2Str( obj ); Logger.log(newStr);
    activeEmployees.getRange(id_adminIndex, adminSchedule.getRange('1:1').getValues().flat().indexOf('Schedule String')+1, 1, 1).setValue(newStr);

    log.appendRow([objLog]);

    update_schedule();

    const date1 = tab.getRange('1:1').getValues().flat().indexOf(g_rosterHeaders.slice(-1)[0])+2;

    // Set the colors of the newly entered data by merging the colors already present in the sheet with the colors of the new entries.
    let oldColors = tab.getRange(2,date1,tab.getMaxRows()-2,tab.getMaxColumns()-date1+1).getBackgrounds();
    let newColors = tab.getRange(2,date1,tab.getMaxRows()-2,tab.getMaxColumns()-date1+1).getValues();
    g_statusArr.forEach( x => newColors = newColors.map(row => row.map(value => value === x[0] ? x[1] : value)) );

    let colors = oldColors.map((x, i) => 
      x.map((val, j) => 
        (newColors[i] && newColors[i][j] !== "" && newColors[i][j] !== null && newColors[i][j] !== undefined)
        ? newColors[i][j]
        : val
      )
    );

    tab.getRange(2,date1,tab.getMaxRows()-2,tab.getMaxColumns()-date1+1).setBackgrounds(colors);

    // Clear entry.
    tab.getRange(2,date1,tab.getMaxRows()-2,tab.getMaxColumns()-date1+1).clearContent();
  }
}

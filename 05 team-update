function update_schedule() {
  
  const scheduleAdmin = SpreadsheetApp.openById(g_adminID);
  const activeTab = scheduleAdmin.getSheetByName(g_admin_activeSS);
  const form_responses = scheduleAdmin.getSheetByName('Check-In').getDataRange().getValues();
  const scheduleData = activeTab.getDataRange().getValues();
  const ss = SpreadsheetApp.getActive();
  const dataTab = ss.getSheetByName('Data');
  const scheduleTab = ss.getSheetByName('Schedule');  
  const checkInTab = ss.getSheetByName('Check-In');
  
  // Clear and update the client sheet's "Data" tab with schedule data from the admin sheet
    dataTab.clearContents();
    dataTab.getRange(1,1,scheduleData.length,scheduleData[0].length).setValues(scheduleData);
  
  // Clear and update the client sheet's "Check-In" tab with form responses from the admin sheet
    checkInTab.clearContents();
    checkInTab.getRange(1,1,form_responses.length,form_responses[0].length).setValues(form_responses);  

  // Set the sheets formula for the "Status" column
    try { scheduleTab.getRange(2, g_rosterHeaders.indexOf('Status')+1, 1, 1).setValue("=ArrayFormula(IFERROR(VLOOKUP(A2:A, 'Check-In'!B:C, 2, 0)))"); } 
    catch (error) { }

}


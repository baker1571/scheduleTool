function confirm_schedule() {
  const scheduleAdmin = SpreadsheetApp.openById(g_adminID);
  const log = scheduleAdmin.getSheetByName('Log');
  const managerIDs = scheduleAdmin.getSheetByName(g_admin_activeSS).getRange('A2:A').getValues().flat().map(x => x.toString());

  // Activate client schedule tab and generate this week's schedule starting on a Saturday.
    const ss = SpreadsheetApp.getActive();
    const tab = ss.getSheetByName(g_client_scheduleTab);
    SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(g_client_scheduleTab));
    

  // Check to see if the UI color is that of the 'Confirmation Mode'. If not, generate a confirmation schedule for viewer to examine; if not, continue the confirmation process.  
    const confirmColor_check = tab.getRange('A1').getBackground();

    if (confirmColor_check != '#f9cb9c') { 
     
      view_period('week', 0, 6, 'confirm');
      alert("Please inspect the following schedule for accuracy. When you are done, run the 'Confirm Schedule' script again to continue.");
      return

    } else {

      // Prompt user for manager ID.
        let managerID;
        const date = new Date();
        const dateStr = tab.getRange(1, g_rosterHeaders.length + 1, 1, 1).getDisplayValue();
        const ws_date = Utilities.parseDate(dateStr, Session.getScriptTimeZone(), "yyyy-MM-dd");
        const email = Session.getActiveUser().getEmail().replace(g_emailDomain,'');
        const ui = SpreadsheetApp.getUi();
        const response = ui.prompt("Are you confirming your own schedule? \n\n If not, please ender the ID of the manager for whom you would like to confirm and select 'no.'", ui.ButtonSet.YES_NO_CANCEL);
        const button = response.getSelectedButton();
        const answer = response.getResponseText();

        if (button == ui.Button.YES) {
          managerID = email;
        } else if (button == ui.Button.NO) {
          managerID = answer;
        } else {
          return;
        }

  Logger.log(managerIDs);
  Logger.log(managerID);
      // Check to ensure that the managerID is present in the admin sheet's list of IDs. If the ID is present, then append the confirmation row to log
        if (managerIDs.indexOf(managerID) == -1) {
          alert("The manager ID you have entered does not exist in the admin schedule sheet. Please double-check the entry and try again.");
          return
        } else {
          log.appendRow(["* " + email + " CONFIRMED SCHEDULE FOR " + managerID + " WS " + ws_date + " ON " + date]);
        }
      
      toast('Confirmation Complete');
    }
}

  

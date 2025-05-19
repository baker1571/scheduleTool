function admin_schedule_confirmation_check() {

  // Initialize global variables
    initialize_gVars();

  // Get sheets
    const adminSS = SpreadsheetApp.openById(g_adminID);
    const adminScheduleTab = adminSS.getSheetByName(g_admin_activeSS);
    const adminConfirmTab = adminSS.getSheetByName(g_admin_confirmSS);

  // Get schedule data
    const scheduleData = adminScheduleTab.getDataRange().getValues().filter(row => row.join('') !== '');
    const employeesManagers = scheduleData.map(row => ({
      employeeId: row[g_admin_idIndex],
      managerId: row[g_admin_managerIdIndex]
    }));

  // Get unique employee and manager IDs
    const employeeIDs = [...new Set(employeesManagers.map(e => e.employeeId))];
    const managers = [...new Set(employeesManagers.map(e => e.managerId).filter(m => employeeIDs.includes(m)))];

  // Get log data as objects
    const logData = adminSS.getSheetByName('Log').getDataRange().getValues().flat().filter(Boolean); 
    const dataObjects = logData.map(str2Obj);

  // Filter schedule confirmation entries from this- and last-month. 
    const currentYear = new Date().getFullYear();
    const confirmations = logData.filter(x =>
      x.startsWith('*') &&
      x.includes(currentYear) &&
      [0, 1].some(monthOffset => {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        return x.includes(date.toLocaleString('en-US', { month: 'short' }));
      })
    );

  // Regex-extract relevant strings from entries.
    const confirmData = confirmations.map(x => {
      const ids = x.match(/(?<=\* )\w+|(?<=FOR )\w+/g) || [];
      const dates = x.match(/[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[-+]\d{4} \([^)]+\)/g) || [];
      return [...ids, ...dates];
    });

  // Check confirmation validity for each manager
    const results = managers.map(managerId => {

      // If there isn't a confirmation for a manager, return "schedule pending" message.
      const confirmation = confirmData.find(conf => conf[1] === managerId);
      if (!confirmation) {
        return [`${managerId} schedule confirmation pending.`];
      }

      const [confirmer, manager, wsDate, confDateStr] = relevantConf;
      const confDate = new Date(confDateStr);

      // Get only those employees managed by the manager.
      const employees = employeesManagers
        .filter(emp => emp.managerId === manager)
        .map(emp => emp.employeeId);

      // Get any schedule change logs that have been submitted after the manager's confirmation.
      const postConfLog = dataObjects.filter(x =>
        employees.includes(x.id) && new Date(x.time) >= confDate
      );

      // If there haven't been any new changes made to the manager's team's schedule, return "confirmation"; else, return "invalidation".
      if (postConfLog.length === 0) {
        return [`${manager} schedule confirmed \n for WS ${wsDate} \n by ${confirmer} \n on ${confDateStr}`];
      } else {
        const change = postConfLog[0];
        return [`${manager} schedule confirmation invalidated \n by changes made to ${change.id} \n by ${change.manager} \n on ${change.time} `];
      }

    }).sort();

  // Clear and write to confirmation sheet 
    try { adminConfirmTab.deleteRows(1,adminConfirmTab.getMaxRows()-1); } catch {}
    adminConfirmTab.getRange(1, 1, results.length, 1).setValues(results);
    
}

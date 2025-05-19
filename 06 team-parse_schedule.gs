function view_schedule(formInfo) {
  process_schedule(formInfo, 'view');
}

function edit_schedule(formInfo) {
  process_schedule(formInfo, 'edit');
}

function process_schedule(formInfo, mode) {
  toast("Started");
  Logger.log(formInfo);
  
  if (!formInfo.start) {
    view_period(formInfo.rangeType, formInfo.timePeriod, formInfo.startDay, mode);
  } else {
    parse_schedule(formInfo.start, formInfo.end, mode);
  }
}

function view_period(periodType, offset = 0, weekStartDay = 0, mode) {

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  let start, end;

  switch (periodType.toLowerCase()) {
    case 'week':
      const currentDay = now.getUTCDay();
      const daysToStart = (currentDay - weekStartDay + 7) % 7;
      const startDate = new Date(Date.UTC(year, month, date - daysToStart + offset * 7));
      start = new Date(startDate);
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));
      break;

    case 'month':
      const newMonth = month + parseInt(offset);
      start = new Date(Date.UTC(year, newMonth, 1));
      end = new Date(Date.UTC(year, newMonth + 1, 0));
      break;

    case 'quarter':
      const currentQuarter = Math.floor(month / 3);
      const newQuarter = currentQuarter + parseInt(offset);
      const qStartMonth = newQuarter * 3;
      start = new Date(Date.UTC(year, 0, 1));
      start.setUTCMonth(qStartMonth);
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 0));
      break;

    case 'year':
      const newYear = year + parseInt(offset);
      start = new Date(Date.UTC(newYear, 0, 1));
      end = new Date(Date.UTC(newYear, 11, 31));
      break;

    default:
      throw new Error("Invalid period type. Use 'week', 'month', 'quarter', or 'year'.");
  }

  switch (mode) {
    case 'view':
      parse_schedule(formatDate(start), formatDate(end), 'view');
      break;
    case 'edit':
      parse_schedule(formatDate(start), formatDate(end), 'edit');
      break;
    case 'confirm':
      parse_schedule(formatDate(start), formatDate(end), 'confirm');
      break;
    default:
      throw new Error("Invalid type. Use 'view', 'edit', or 'confirm'.");
  }
}

function parse_schedule( start, end, mode ) {

  // Set colors for UI.
  let ui1, ui2;

  const modeColors = {
    'view': ['#d9d9d9', '#999999'],
    'edit': ['#c9daf8', '#6d9eeb'],
    'confirm': ['#f9cb9c', '#e69138']
  };
  
  [ui1, ui2] = modeColors[mode] || ['#ffff00', '#00ff00'];

  // Update schedule data from Admin sheet and get sheet variables. 
    update_schedule();
    const ss = SpreadsheetApp.getActive();
    const dataTab = ss.getSheetByName(g_client_dataTab);
    const tab = ss.getSheetByName(g_client_scheduleTab); 
    SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(g_client_scheduleTab));

  // Delete all cells and reset formatting.
    try { tab.deleteRows(1,tab.getMaxRows()-1); } catch {}
    try { tab.deleteColumns(1,tab.getMaxColumns()-1); } catch {}
    tab.getRange('A1').setBackground('#ffffff').setFontColor('#000000').setBorder(false,false,false,false,false,false,'#f8faf8',SpreadsheetApp.BorderStyle.SOLID);
    tab.setColumnWidth(1,27);
    tab.getRange('A1').setTextRotation(0);

  // Get data from client sheet 'Data' tab. Check to see if the strings are too long (string_length_check).
    const agentInfo = transpose( dataTab.getDataRange().getValues().filter(Boolean) ); 
    const scheduleStrings = agentInfo.pop().map(x => str2Obj(x));
    scheduleStrings.shift();
    string_length_check(scheduleStrings);

  // Change start- and end-dates into a 2d date range array.
    const dateRange = transpose( [getDateRange(start, end)] );

  // Loop through each date (i), to check if each schedule-string object (j) contains the date in its key(k) value pairs.  
    for (var i = 0; i < dateRange.length; i++) {
      for (var j = 0; j < scheduleStrings.length; j++) {
        x = 0;
        for (var k = 0; k < g_statusArr.length; k++) {
          if (scheduleStrings[j][g_statusArr[k][0]].indexOf(dateRange[i][0]) != -1) {
            dateRange[i].push(g_statusArr[k][0]); x++;
          }
        }
        if (x == 0) { dateRange[i].push(''); }
        if (x > 1) { alert('The schedule string has more than one signifier assigned to a single date.'); return } 
      }
    }

  // Concat output. Remove 'D'. Write output.
    let output = transpose( agentInfo.concat(dateRange) );
    output = output.map(row => row.map(value => value === 'D' ? '' : value));    // Looked this up. Would like to understand how this works though.
    tab.getRange(1,1,output.length,output[0].length).setValues(output);

  // Formatting
    tab.getRange(1, g_rosterHeaders.length+1, 1, tab.getMaxColumns()-g_rosterHeaders.length).setTextRotation(90);
    tab.getRange(1,1,tab.getMaxRows(),tab.getMaxColumns()-g_rosterHeaders.length).setHorizontalAlignment('left');
    tab.getRange(1, g_rosterHeaders.length+1, tab.getMaxRows(), tab.getMaxColumns()-g_rosterHeaders.length).setHorizontalAlignment('center');
    tab.autoResizeColumns(1,tab.getLastColumn());
    tab.setColumnWidths(g_rosterHeaders.length+1,tab.getMaxColumns()-g_rosterHeaders.length,22);
    tab.setFrozenRows(1);

  // Colors (If there are other val:color pairs to be formatted, they can be added to the 2d global variable array)
    let colors = output;
    let dow_count = new Date(new Date(start).toUTCString()).getUTCDay();
    
    g_statusArr.forEach( x => colors = colors.map(row => row.map(value => value === x[0] ? x[1] : value)) );

    colors[0].fill(ui1);

    // Set color (ui1) for the columns with employee info 
      colors = colors.map(x => { return x.map((x, index) => index < g_rosterHeaders.length ? ui1 : x); });

    // Set color (ui2) for weekend dates in the header
      output[0].forEach((_, i) => {
        if (i >= g_rosterHeaders.length) {
          if (dow_count === 0 || dow_count === 6) {
            colors[0][i] = ui2;
          }
          dow_count++;
          if (dow_count > 6) dow_count = 0;
        }
      });

    // let weekdayNums = output[0].map(x => new Date(new Date(x).toUTCString()).getUTCDay());
    // weekdayNums = weekdayNums.map(x => x.map(x => x === String(x).match(/^[06]$/) ? ui2 : x));
    // weekdayNums = weekdayNums.map(x => x.map(x => x === String(x).match(/^[^06]$/) ? ui1 : x));
    // output[0] = weekdayNums;


    // Set color for current day bright yellow. Add same yellow border to entries below date.
      const todayIndex = output[0].indexOf(formatDate(new Date()));
      colors[0][todayIndex] = '#ffff00';
      tab.getRange(1,todayIndex+1,tab.getMaxRows(),1).setBorder(true, true, true, true, false, false, "yellow", SpreadsheetApp.BorderStyle.SOLID_THICK);

    tab.getDataRange().setBackgrounds(colors);

    if (mode == 'edit') {
      tab.getRange(2,g_rosterHeaders.length+1,tab.getMaxRows()-1,tab.getMaxColumns()-g_rosterHeaders.length).clearContent();
    }

    update_schedule();
    update_checkIn();
    
}

function string_length_check() {
  arr = arr.map(x => x.length);
  if (Math.max(...arr) > 41800) { alert('One or more of the strings that hold agent schedule data is nearing the 50,000 character cell limit. Please contact the tech team to archive older dates in the string.'); }
}

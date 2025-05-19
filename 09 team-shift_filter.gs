function shift_filter(filterInfo) {
  Logger.log(filterInfo);

  let tab = SpreadsheetApp.getActive().getSheetByName('Schedule')
  let data = tab.getDataRange().getDisplayValues();
  let colors = SpreadsheetApp.getActive().getSheetByName('Schedule').getDataRange().getBackgrounds();
  
  // Delete rows and reset formatting.
  try { tab.deleteRows(1,tab.getMaxRows()-1); } catch {}

  // Get the row indexes in the "colors" array that match the color of the desired marker.
  const matchVal = g_statusArr.map(x => x[1])[g_status.indexOf(filterInfo.shiftFilter)];
  const rowIndexes = colors.map((row, index) => index === 0 || row.includes(matchVal) ? index : null).filter(index => index !== null);

  // Filter "colors" and "data" with the matching color row indexes.
  colors = colors.filter((_, index) => rowIndexes.includes(index));
  data = data.filter((_, index) => rowIndexes.includes(index));

  // Write it.
  tab.getRange(1,1,data.length,data[0].length).setValues(data);
  tab.getRange(1,1,colors.length,colors[0].length).setBackgrounds(colors);

  // Re-apply formatting.
  tab.getRange(1, g_rosterHeaders.length+1, 1, tab.getMaxColumns()-g_rosterHeaders.length).setTextRotation(90);

}

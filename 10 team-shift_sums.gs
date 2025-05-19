function shift_sums(filterInfo) {
  const tab = SpreadsheetApp.getActive().getSheetByName('Schedule');

  // Insert a new row at the top if A1 is not empty
  if (tab.getRange('A1').getValue() !== "") {
    tab.insertRowBefore(1);
  }

  // Create data validation rule for the dropdown
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(g_status, true)
    .setAllowInvalid(false)
    .build();

  // Format the header row
  tab.setFrozenRows(2);
  tab.getRange('1:1').setTextRotation(0);
  tab.getRange('1:1').setNumberFormat('@');

  // Set label and dropdown for shift filter
  const labelCol = g_rosterHeaders.length - 1;
  const dropdownCol = g_rosterHeaders.length;
  
  tab.getRange(1, labelCol, 1, 1)
    .setValue('Sum Instances of:')
    .setHorizontalAlignment('right');

  tab.getRange(1, dropdownCol, 1, 1)
    .setDataValidation(rule)
    .setValue(filterInfo.shiftFilter);

  // Apply SUM formula across columns
  const sumRangeStartCol = dropdownCol + 1;
  const sumRangeWidth = tab.getMaxColumns() - g_rosterHeaders.length;
  const formula = '=SUM(BYROW(INDIRECT(SUBSTITUTE(ADDRESS(1, COLUMN(), 4), "1", "")&"3:"&SUBSTITUTE(ADDRESS(1, COLUMN(), 4), "1", "")), ' +
    'LAMBDA(cell, IF(SUBTOTAL(103, cell) * (cell = INDIRECT(ADDRESS(1,MATCH("Sum Instances of:",1:1,0)+1,1))), 1, 0))))';
  tab.getRange(1, sumRangeStartCol, 1, sumRangeWidth).setValue(formula);

  // Add filter to the data area
  tab.getRange(2, 1, tab.getMaxRows() - 1, tab.getMaxColumns()).createFilter();
  tab.setColumnWidths(sumRangeStartCol, sumRangeWidth, 30);
}

function admin_menu(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Schedule Menu')
    .addItem('Update Roster', 'update_roster')
    //.addItem('Check Schedule Confirmations', 'admin_schedule_confirmation_check')
  .addToUi();
}

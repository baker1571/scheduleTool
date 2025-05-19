function team_menu(e) {

  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Schedule Menu')
    .addItem('Sidebar', 'sidebar')
    .addItem('Update Schedule','update_schedule')
    .addItem('Confirm Schedule','confirm_schedule')
    .addItem('Submit Changes','addSchedule')
  .addToUi();
  
}

function sidebar() {

  var html = HtmlService.createHtmlOutputFromFile('team-sidebar').setTitle('Sidebar');
  SpreadsheetApp.getUi().showSidebar(html);

}

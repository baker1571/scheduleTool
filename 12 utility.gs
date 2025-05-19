function str2Obj(str) {
  str = str.split(';');
  arr = str.map(x => x.split(','));
  const stamp = arr.shift();
  const objMap = Object.fromEntries(arr.map(x => [x[0],x.splice(1,x.length-1)]));
  objMap.id = stamp [0];
  objMap.manager = stamp[1];
  objMap.time = stamp[2];
  return objMap
}

function obj2Str(obj) {
  arr = [];
  arr.push([obj.id, obj.manager, obj.time]);
  g_statusArr.forEach(x => arr.push( [x[0]].concat(obj[x[0]])) );
  arr.slice(1).sort((a, b) => a[0].localeCompare(b[0]));
  arr.splice(1, arr.length - 1, ...arr.slice(1).sort((a, b) => a[0].localeCompare(b[0])));
  //Logger.log(arr);
  str = arr.map(x => x.join(',')).join(';');
  //Logger.log(str);
  str = str.replace(/,;/g,';');
  return str 
}

function getAllIndexes(arr, value) {
  let indexes = [];
  arr.forEach((item, index) => {
    if (item === value) {
      indexes.push(index);
    }
  });
  return indexes;
}

function lookup(x, arr1, arr2) {
  //Logger.log(arr1);
  //Logger.log(arr2);
  const index = arr1.indexOf(x);
  if (index !== -1) {
    return arr2[index];
  } else {
    return null; 
  }
}

function toast(m) {
  SpreadsheetApp.getActive().toast(m,'ALERT');
}

function alert(m) {
  SpreadsheetApp.getUi().alert(m);
}

function transpose(a) {
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}

function getDateRange(startDateStr, endDateStr) {
    const dateArray = [];

    // Extract year, month, day manually to avoid UTC parsing issue
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

    let currentDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        dateArray.push(formattedDate);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}


function bad_dateRange(start, end) {
  const dateArray = [];
  let currentDate = new Date(start);

  while (currentDate <= new Date(end)) {
    dateArray.push(new Date(currentDate));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
  return dateArray.map(date => date.toISOString().split('T')).map(x => x[0]);
  return dateArray;
}

function prompt(txt) {
  const prompt = SpreadsheetApp.getUi().prompt(txt);
  const answer = prompt.getResponseText();
  return answer
}

function yesno(txt) {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(txt, ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    Logger.log('User selected "Yes"');
  } else {
    Logger.log('User selected "No"');
  }
  return response
}

function formatDate(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// X = Full Day Worked
// O = Out of Office
// 1-7 = Partial Day
// S = Sick Day
// T = Training
// W = Work from Abroad
// H = Holiday
// L = Administrative Leave
// N = No Show
// D = Delete Entry

// ============================================================
//  CCF Biweekly Update — Google Apps Script Backend
//  Paste this code into Extensions > Apps Script in your
//  Google Sheet, then deploy as a web app.
// ============================================================

function doGet(e) {
  var slideId = (e && e.parameter && e.parameter.slide) || 'slide1';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(slideId);
  if (!sheet) {
    return sendJSON({ data: null, nextId: 100 });
  }
  var raw = sheet.getRange('A1').getValue();
  var nextId = sheet.getRange('B1').getValue();
  var data = null;
  try { data = JSON.parse(raw); } catch (err) {}
  return sendJSON({ data: data, nextId: nextId || 100 });
}

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return sendJSON({ status: 'error', message: 'Invalid JSON' });
  }

  var slideId = payload.slide || 'slide1';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(slideId);
  if (!sheet) {
    sheet = ss.insertSheet(slideId);
    sheet.getRange('A1').setValue('[]');
    sheet.getRange('B1').setValue(100);
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.getRange('A1').setValue(JSON.stringify(payload.data));
    sheet.getRange('B1').setValue(payload.nextId || 100);
  } finally {
    lock.releaseLock();
  }

  return sendJSON({ status: 'ok' });
}

function sendJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this once to initialize the sheets with the correct tabs
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ['slide1', 'slide2'].forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.getRange('A1').setValue('[]');
      sheet.getRange('B1').setValue(100);
    }
  });
}

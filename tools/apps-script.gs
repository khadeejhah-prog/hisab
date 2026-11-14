// Google Apps Script: paste into Extensions → Apps Script of a Google Sheet, deploy as Web app (Anyone).
// Each POST from api/log.js becomes one row. No names, no photos.
function doPost(e) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sh.getLastRow() === 0) sh.appendRow(["ts","id","track","who","level","lang","age","kind","verdict","action","amount_aed","saved","q1_before","q1_after","q2_before","q2_after"]);
  var d = JSON.parse(e.postData.contents || "{}");
  sh.appendRow([d.ts||new Date().toISOString(), d.id||"", d.track||"", d.who||"", d.level||"", d.lang||"", d.age||"", d.kind||"", d.verdict||"", d.action||"", d.amount_aed||"", d.saved||"", d.q1b||"", d.q1a||"", d.q2b||"", d.q2a||""]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput("Hisab log is running."); }

/**
 * Google Apps Script to save auction data to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Replace 'YOUR_SHEET_NAME' with your actual sheet name (e.g., 'Sheet1')
 * 5. Click Deploy > New Deployment
 * 6. Choose "Web app" as type
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy
 * 10. Copy the Web App URL and paste it in Index.tsx as GOOGLE_APPS_SCRIPT_URL
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    const rowIndex = data.rowIndex || findPlayerRow(sheet, data.playerName);
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Player not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find or create status columns
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let statusCol = headers.indexOf("Status") + 1;
    let teamCol = headers.indexOf("Team") + 1;
    let amountCol = headers.indexOf("Amount") + 1;
    let roundCol = headers.indexOf("Round") + 1;
    let timestampCol = headers.indexOf("Timestamp") + 1;
    
    // Create columns if they don't exist
    if (statusCol === 0) {
      statusCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, statusCol).setValue("Status");
    }
    if (teamCol === 0) {
      teamCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, teamCol).setValue("Team");
    }
    if (amountCol === 0) {
      amountCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, amountCol).setValue("Amount");
    }
    if (roundCol === 0) {
      roundCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, roundCol).setValue("Round");
    }
    if (timestampCol === 0) {
      timestampCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, timestampCol).setValue("Timestamp");
    }
    
    // Update the row
    sheet.getRange(rowIndex, statusCol).setValue(data.status);
    if (data.team) {
      sheet.getRange(rowIndex, teamCol).setValue(data.team);
    }
    if (data.amount) {
      sheet.getRange(rowIndex, amountCol).setValue(data.amount);
    }
    sheet.getRange(rowIndex, roundCol).setValue(data.round);
    sheet.getRange(rowIndex, timestampCol).setValue(new Date(data.timestamp));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rowIndex: rowIndex
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function findPlayerRow(sheet, playerName) {
  const data = sheet.getDataRange().getValues();
  
  // Check common name column positions
  const nameColumns = [0, 1]; // First and second columns often have names
  
  for (let col of nameColumns) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][col] && data[i][col].toString().trim() === playerName.trim()) {
        return i + 1; // +1 because sheet rows are 1-indexed
      }
    }
  }
  
  return -1; // Not found
}

function doGet(e) {
  return ContentService.createTextOutput("Auction Sheet Writer is running!")
    .setMimeType(ContentService.MimeType.TEXT);
}




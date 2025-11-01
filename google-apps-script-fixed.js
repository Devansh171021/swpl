/**
 * Google Apps Script to save auction data to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click Deploy > New Deployment (or Manage deployments > Edit)
 * 5. Choose "Web app" as type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click Deploy
 * 9. Copy the Web App URL and paste it in Index.tsx as GOOGLE_APPS_SCRIPT_URL
 */

function doGet(e) {
  try {
    // Get parameters from URL (works with no-cors mode)
    const data = {
      sheetId: e.parameter.sheetId,
      rowIndex: parseInt(e.parameter.rowIndex) || null,
      playerName: e.parameter.playerName,
      status: e.parameter.status,
      team: e.parameter.team || "",
      amount: parseFloat(e.parameter.amount) || 0,
      round: parseInt(e.parameter.round) || 1,
      timestamp: e.parameter.timestamp || new Date().toISOString(),
    };

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Find the row by player name if rowIndex not provided
    let rowIndex = data.rowIndex || findPlayerRow(sheet, data.playerName);
    
    if (!rowIndex || rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Player not found: " + data.playerName,
        searchedName: data.playerName
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
    if (data.amount && data.amount > 0) {
      sheet.getRange(rowIndex, amountCol).setValue(data.amount);
    }
    sheet.getRange(rowIndex, roundCol).setValue(data.round);
    sheet.getRange(rowIndex, timestampCol).setValue(new Date(data.timestamp));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rowIndex: rowIndex,
      playerName: data.playerName,
      status: data.status
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Also handle POST requests (in case we switch back)
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
  
  // Check common name column positions (first few columns)
  const nameColumns = [0, 1, 2]; // Check first 3 columns
  
  for (let col of nameColumns) {
    if (col >= data[0].length) continue; // Skip if column doesn't exist
    
    for (let i = 1; i < data.length; i++) {
      const cellValue = data[i][col];
      if (cellValue && cellValue.toString().trim().toLowerCase() === playerName.trim().toLowerCase()) {
        return i + 1; // +1 because sheet rows are 1-indexed
      }
    }
  }
  
  return -1; // Not found
}




# Google Sheets Auto-Save Setup Guide

This guide will help you set up automatic saving of auction data to your Google Sheet.

## Step-by-Step Instructions

### 1. Open Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/17WNEvsGoeEN04bzFb92Anc3mygKXH9Wtnwi8STZONak
2. Click on **Extensions** in the menu
3. Select **Apps Script**

### 2. Add the Script

1. Delete any existing code in the Apps Script editor
2. Open the file `google-apps-script.js` from this project
3. Copy the entire contents and paste it into the Apps Script editor
4. Click **Save** (floppy disk icon) and name it "Auction Writer"

### 3. Deploy as Web App

1. Click **Deploy** button (top right)
2. Select **New deployment**
3. Click the gear icon (⚙️) next to "Select type"
4. Choose **Web app**
5. Fill in the settings:
   - **Description**: "Auction Data Writer" (optional)
   - **Execute as**: Select **Me**
   - **Who has access**: Select **Anyone**
6. Click **Deploy**
7. You may need to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to Auction Writer (unsafe)**
   - Click **Allow**

### 4. Copy the Web App URL

1. After deployment, you'll see a **Web app URL**
2. Copy this URL (it looks like: `https://script.google.com/macros/s/XXXXX/exec`)

### 5. Add URL to Your App

1. Open `src/pages/Index.tsx`
2. Find the line: `const GOOGLE_APPS_SCRIPT_URL = "";`
3. Paste your Web App URL between the quotes:
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
   ```
4. Save the file

### 6. Test It!

1. Refresh your auction app
2. Mark a player as SOLD or UNSOLD
3. Check your Google Sheet - new columns should appear:
   - **Status** (sold/unsold)
   - **Team** (team name if sold)
   - **Amount** (sale price if sold)
   - **Round** (auction round)
   - **Timestamp** (when the entry was made)

## How It Works

- When you mark a player as **SOLD**: The script saves:
  - Status: "sold"
  - Team: The team that bought them
  - Amount: The sale price
  - Round: Current round number
  - Timestamp: When it happened

- When you mark a player as **UNSOLD**: The script saves:
  - Status: "unsold"
  - Round: Current round number
  - Timestamp: When it happened

## Troubleshooting

**Data not saving?**
- Check browser console (F12) for errors
- Verify the Web App URL is correct
- Make sure "Who has access" is set to "Anyone"
- Try redeploying the script

**Columns not appearing?**
- The script creates columns automatically
- They appear after the first save
- Columns: Status, Team, Amount, Round, Timestamp

**Player not found?**
- The script searches for player names in the first two columns
- Make sure player names in your sheet match exactly

## Security Note

The Web App URL can be accessed by anyone who has it, but it only writes to YOUR sheet. Keep the URL private if you want to restrict access.




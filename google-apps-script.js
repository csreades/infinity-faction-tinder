// Google Apps Script - Infinity Faction Tinder Session Recorder
//
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete any existing code and paste this entire script
// 4. Click "Deploy" → "New deployment"
// 5. Select type: "Web app"
// 6. Set "Execute as": "Me"
// 7. Set "Who has access": "Anyone"
// 8. Click "Deploy" and authorize when prompted
// 9. Copy the Web app URL - you'll need this for the frontend
//
// The script creates two sheets:
// - "Sessions" - one row per session with metadata
// - "Swipes" - one row per individual swipe action

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Get or create Sessions sheet
    let sessionsSheet = ss.getSheetByName("Sessions");
    if (!sessionsSheet) {
      sessionsSheet = ss.insertSheet("Sessions");
      sessionsSheet.appendRow([
        "Session ID",
        "Timestamp",
        "Total Swipes",
        "Likes",
        "Dislikes",
        "Passes"
      ]);
    }

    // Get or create Swipes sheet
    let swipesSheet = ss.getSheetByName("Swipes");
    if (!swipesSheet) {
      swipesSheet = ss.insertSheet("Swipes");
      swipesSheet.appendRow([
        "Session ID",
        "Timestamp",
        "Swipe Index",
        "Model",
        "Faction",
        "Action"
      ]);
    }

    const sessionId = data.sessionId;
    const timestamp = data.timestamp;
    const swipes = data.swipes || [];

    // Count actions
    let likes = 0, dislikes = 0, passes = 0;
    swipes.forEach((swipe, index) => {
      if (swipe.action === "like") likes++;
      else if (swipe.action === "dislike") dislikes++;
      else if (swipe.action === "pass") passes++;

      // Add individual swipe row
      swipesSheet.appendRow([
        sessionId,
        timestamp,
        index + 1,
        swipe.model,
        swipe.faction,
        swipe.action
      ]);
    });

    // Add session summary row
    sessionsSheet.appendRow([
      sessionId,
      timestamp,
      swipes.length,
      likes,
      dislikes,
      passes
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, recorded: swipes.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight requests
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Infinity Faction Tinder API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

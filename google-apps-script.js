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
// IMPORTANT: After updating this script, you must create a NEW deployment
// (Deploy → New deployment), not just save. Copy the new URL if it changes.
//
// The script creates two sheets:
// - "Sessions" - one row per session with metadata
// - "Swipes" - one row per individual swipe action

function doPost(e) {
  var output;

  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Get or create Sessions sheet
    var sessionsSheet = ss.getSheetByName("Sessions");
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
    var swipesSheet = ss.getSheetByName("Swipes");
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

    var sessionId = data.sessionId;
    var timestamp = data.timestamp;
    var swipes = data.swipes || [];

    // Count actions
    var likes = 0, dislikes = 0, passes = 0;
    for (var i = 0; i < swipes.length; i++) {
      var swipe = swipes[i];
      if (swipe.action === "like") likes++;
      else if (swipe.action === "dislike") dislikes++;
      else if (swipe.action === "pass") passes++;

      // Add individual swipe row
      swipesSheet.appendRow([
        sessionId,
        timestamp,
        i + 1,
        swipe.model,
        swipe.faction,
        swipe.action
      ]);
    }

    // Add session summary row
    sessionsSheet.appendRow([
      sessionId,
      timestamp,
      swipes.length,
      likes,
      dislikes,
      passes
    ]);

    output = JSON.stringify({ success: true, recorded: swipes.length });

  } catch (error) {
    output = JSON.stringify({ success: false, error: error.toString() });
  }

  // Return with CORS headers
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Infinity Faction Tinder API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

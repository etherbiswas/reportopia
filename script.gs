function createAndSendReport() {
  try {
    // Configuration (only needs to be set once)
    var config = {
      spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(), // Spreadsheet ID
      dailyReceiptsSheetName: "Daily_Receipts", // Replace with your sheet name for receipts
      dailyExpensesSheetName: "Daily_Expenses", // Replace with your sheet name for expenses
      receiptsFolderId: "YOUR_FOLDER_ID_HERE", // Folder ID for saving receipts PDFs
      expensesFolderId: "YOUR_FOLDER_ID_HERE", // Folder ID for saving expenses PDFs
      recipientEmails: [
        "email1@gmail.com",    // Add your email here
        "email2@gmail.com",   // Add other recipients
        "email3@gmail.com"
      ]
    };

    // Fetch the Spreadsheet and its sheets
    var spSheet = SpreadsheetApp.openById(config.spreadsheetId);
    var dailyReceipts = spSheet.getSheetByName(config.dailyReceiptsSheetName);
    var dailyExpenses = spSheet.getSheetByName(config.dailyExpensesSheetName);

    // Fetch data from the sheets
    var dataReceipts = getDataFromSheet(dailyReceipts);
    var dataExpenses = getDataFromSheet(dailyExpenses);

    // Check if data is present
    if (!dataReceipts || dataReceipts.length === 0) throw new Error("No data found in 'Daily_Receipts' sheet.");
    if (!dataExpenses || dataExpenses.length === 0) throw new Error("No data found in 'Daily_Expenses' sheet.");

    // Generate HTML report content
    var htmlContent = generateHtmlReport(dataReceipts, dataExpenses);

    // Send the report via email
    sendEmailWithHtmlReport(config.recipientEmails, htmlContent);

    // Create PDFs for both Receipts and Expenses and save them in Google Drive
    createAndSavePdf(dailyReceipts, dataReceipts, config.receiptsFolderId, "Daily Receipts Report");
    createAndSavePdf(dailyExpenses, dataExpenses, config.expensesFolderId, "Daily Expenses Report");

    // Optionally clear the sheet data except headers
    clearSheetData(dailyReceipts);
    clearSheetData(dailyExpenses);

    Logger.log("Email and PDFs sent successfully.");

  } catch (error) {
    Logger.log("An error occurred: " + error.message);
    // Use an email for script maintainer to be notified when errors occur
    GmailApp.sendEmail("maintainer@gmail.com", "Error in Google Apps Script", "An error occurred: " + error.message);
  }
}

/**
 * Fetch data from a specific sheet.
 * @param {Sheet} sheet The Google Sheet to fetch data from.
 * @returns {Array} The data from the sheet.
 */
function getDataFromSheet(sheet) {
  var data = [];
  var values = sheet.getDataRange().getValues();

  // Convert values into strings to prevent automatic formatting
  values.forEach(function(row) {
    data.push(row.map(function(cell) {
      return cell.toString();
    }));
  });

  return data;
}

/**
 * Generate HTML content for the report.
 * @param {Array} dataReceipts Data for receipts.
 * @param {Array} dataExpenses Data for expenses.
 * @returns {string} HTML content.
 */
function generateHtmlReport(dataReceipts, dataExpenses) {
  var htmlContent = "<html><head><style>";
  htmlContent += "table { border-collapse: collapse; width: 100%; }";
  htmlContent += "th, td { border: 1px solid black; padding: 8px; }";
  htmlContent += "th { background-color: #0074D9; color: #ffffff; }";
  htmlContent += ".time-box { border: 2px solid red; padding: 8px; margin-bottom: 10px; }";
  htmlContent += "</style></head><body>";

  // Add report title
  htmlContent += "<h1 style='text-align: center;'>Company Name</h1>"; // Replace "Company Name"

  // Add time zones
  var currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMMM");
  var californiaTime = getCurrentDateTime("America/Los_Angeles");
  var dhakaTime = getCurrentDateTime("Asia/Dhaka");

  htmlContent += "<p style='text-align: center;'><strong>" + currentMonth + "</strong></p>";
  htmlContent += "<div class='time-box'><p><strong>California Time:</strong> " + californiaTime + "</p></div>";
  htmlContent += "<div class='time-box'><p><strong>Dhaka Time:</strong> " + dhakaTime + "</p></div>";

  // Add receipts table
  htmlContent += "<h2>Daily Receipts</h2>";
  htmlContent += generateTableHtml(dataReceipts);

  // Add expenses table
  htmlContent += "<h2>Daily Expenses</h2>";
  htmlContent += generateTableHtml(dataExpenses);

  htmlContent += "</body></html>";
  return htmlContent;
}

/**
 * Generate HTML for a table.
 * @param {Array} data The table data.
 * @returns {string} The HTML string for the table.
 */
function generateTableHtml(data) {
  var html = "<table><tr>";
  data[0].forEach(function(header) {
    html += "<th>" + header + "</th>";
  });
  html += "</tr>";
  for (var i = 1; i < data.length; i++) {
    html += "<tr>";
    data[i].forEach(function(cell) {
      html += "<td>" + cell + "</td>";
    });
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

/**
 * Send an email with the report.
 * @param {Array} emails List of recipient emails.
 * @param {string} htmlContent The email content in HTML.
 */
function sendEmailWithHtmlReport(emails, htmlContent) {
  var subject = "Daily Report";
  var body = "Please find attached the daily report.";

  emails.forEach(function(email) {
    GmailApp.sendEmail(email, subject, body, {
      htmlBody: htmlContent
    });
  });
}

/**
 * Create a PDF for a given sheet and save it to Google Drive.
 * @param {Sheet} sheet The Google Sheet.
 * @param {Array} data The data to include in the PDF.
 * @param {string} folderId The Google Drive folder ID to save the PDF.
 * @param {string} title The title of the PDF.
 */
function createAndSavePdf(sheet, data, folderId, title) {
  var doc = DocumentApp.create(title);
  var body = doc.getBody();

  // Add title and current month
  var currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMMM");
  body.appendParagraph('Company Name').setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph(currentMonth).setBold(true).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // Add table data
  var table = body.appendTable();
  data.forEach(function(row) {
    var tableRow = table.appendTableRow();
    row.forEach(function(cell) {
      tableRow.appendTableCell(cell);
    });
  });

  // Save and convert to PDF
  doc.saveAndClose();
  var pdfBlob = DriveApp.getFileById(doc.getId()).getBlob().setName(title + "-" + getCurrentDateTimeFormatted("dd-MM-yy_hh-mm-ssa") + ".pdf");

  // Save to Drive
  var folder = DriveApp.getFolderById(folderId);
  folder.createFile(pdfBlob);

  // Delete temporary Google Doc
  DriveApp.getFileById(doc.getId()).setTrashed(true);
}

/**
 * Clear data in a sheet except for the headers.
 * @param {Sheet} sheet The sheet to clear.
 */
function clearSheetData(sheet) {
  var numRows = sheet.getLastRow();
  if (numRows > 1) {
    sheet.getRange(2, 1, numRows - 1, sheet.getLastColumn()).clear(); // Clear all rows except header
  }
}

/**
 * Get the current date and time in a specific timezone.
 * @param {string} timezone The timezone to get the current time for.
 * @returns {string} The formatted current date and time.
 */
function getCurrentDateTime(timezone) {
  var date = new Date();
  return Utilities.formatDate(date, timezone, "MMMM dd, yyyy hh:mm a");
}

/**
 * Get the current date and time formatted.
 * @param {string} format The format for the date and time.
 * @returns {string} The formatted date and time.
 */
function getCurrentDateTimeFormatted(format) {
  var date = new Date();
  return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
}


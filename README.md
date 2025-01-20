![](https://github.com/etherbiswas/reportopia/blob/main/images/DailyExpense.png)
![](https://github.com/etherbiswas/reportopia/blob/main/images/DailyReciepts.png)
![](https://github.com/etherbiswas/reportopia/blob/main/images/PDFmails.png)

# Reportopia

**Under 100 SLOC!!**
📊 Welcome to Reportopia! An automated modular reporting tool for Google Sheets that generates stunning daily reports and saves them as PDFs! and automates mails!! 📄✨

# 🧾 Automated Daily Report Script

🚀 This Google Apps Script generates daily PDF reports from a Google Sheet, sends them via email, and stores them in Google Drive. 📊📧✨

## 🛠 Use Case

This script is perfect for anyone who needs to automate daily reports or receipts, like:

- Tracking **daily receipts** and **expenses**.
- Automatically sending **email reports** to a list of recipients. 📩
- Generating **PDF summaries** and saving them to **Google Drive**. 📂

Example: Small bussiness that needs a receipt system and or keep track of finances

## 💡 How It Works

1. Fetches data from your **Google Sheets** (Daily Receipts & Daily Expenses).
2. Formats the data into an **HTML report** with time zones for different regions. 🌍🕰
   Uses (California & Dhaka), you can change these to your liking.
3. Sends the report via email to a list of **recipient emails**. ✉️
4. Creates **PDF versions** of the receipts and expenses, then saves them to Google Drive. 📄
5. Optionally, **clears the sheet data** (except headers) to prepare for the next day's entries. 🧹

## 🧑‍💻 How to Set It Up

### 1. Add the Script to Your Google Apps Script Project

- Open your **Google Sheets**.
- Go to **Extensions** > **Apps Script**.
- Paste the script code into your Apps Script project.

### 2. Update the Configuration

You'll need to configure a few variables to match your setup. Look for the following section in the script:

```javascript
var config = {
  spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(), // Spreadsheet ID
  dailyReceiptsSheetName: "Daily_Receipts", // Replace with your receipts sheet name
  dailyExpensesSheetName: "Daily_Expenses", // Replace with your expenses sheet name
  receiptsFolderId: "YOUR_FOLDER_ID_HERE", // Google Drive Folder ID for Receipts PDFs
  expensesFolderId: "YOUR_FOLDER_ID_HERE", // Google Drive Folder ID for Expenses PDFs
  recipientEmails: [
    "email1@gmail.com", // Add your email here
    "email2@gmail.com", // Add other recipients
    "email3@gmail.com",
  ],
};
```

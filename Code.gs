var slideTemplateId = "XXX"; // Sample: https://docs.google.com/presentation/d/1dRtRkwaA9IGwD6Own9r2yrW-3hop-L9hMRAttX3t4IA
var tempFolderId = "XXX"; // Create an empty folder in Google Drive

/**
 * Creates a custom menu "Appreciation" in the spreadsheet
 * with drop-down options to create and send certificates
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Appreciation")
    .addItem("Create certificates", "createCertificates")
    .addSeparator()
    .addItem("Send certificates", "sendCertificates")
    .addToUi();
}

/**
 * Creates a personalized certificate for each student
 * and stores every individual Slides doc on Google Drive
 */
function createCertificates() {
  // Load the Google Slide template file
  var template = DriveApp.getFileById(slideTemplateId);

  // Get all student data from the spreadsheet and identify the headers of the columns
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var studNameIndex = headers.indexOf("name");
  var studSlideIndex = headers.indexOf("certificate_slide");
  var statusIndex = headers.indexOf("status");
  
  // Iterate through each row to capture individual details
  for (var i = 1; i < values.length; i++) {
    var rowData = values[i];
    var studName = rowData[studNameIndex];
    
    // Make a copy of the Slide template and rename it with student name
    var tempFolder = DriveApp.getFolderById(tempFolderId);
    var studSlideId = template.makeCopy(tempFolder).setName(studName).getId();        
    var studSlide = SlidesApp.openById(studSlideId).getSlides()[0];
    
    // Replace placeholder values with actual student related details
    studSlide.replaceAllText("Name", studName); // Replace all instances of "Student Name" from the template with the actual value from the spreadsheet
    
    // Update the spreadsheet with the new Slide Id and status
    sheet.getRange(i + 1, studSlideIndex + 1).setValue(studSlideId);
    sheet.getRange(i + 1, statusIndex + 1).setValue("CREATED");
    SpreadsheetApp.flush();
  }
}

/**
 * Send an email to each individual student
 * with a PDF attachment of their appreciation certificate
 */
function sendCertificates() {
  
  // Get all student data from the spreadsheet and identify the headers
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var studNameIndex = headers.indexOf("name");
  var studEmailIndex = headers.indexOf("email");
  var studSlideIndex = headers.indexOf("certificate_slide");
  var statusIndex = headers.indexOf("status");
  
  // Iterate through each row to capture individual details
  for (var i = 1; i < values.length; i++) {
    var rowData = values[i];
    var studName = rowData[studNameIndex];
    var studSlideId = rowData[studSlideIndex];
    var studEmail = rowData[studEmailIndex];
    
    // Load the Student's personalized Google Slide file
    var attachment1 = DriveApp.getFileById(studSlideId);
    var attachment2 = DriveApp.getFileById("XXX");
    
    // Setup the required parameters and send them the email
    var senderName = "Google Developer Student Clubs - SRM Ramapuram";
    var subject = "Certificate of participation - 30 days of Google cloud.";
    var body = "Dear Participant,\n\nPlease read the information given in the attached file carefully"; // Email will be sent by the mail address logged in while running the script
    GmailApp.sendEmail(studEmail, subject, body, {
      attachments: [attachment1.getAs(MimeType.PDF),attachment2.getAs(MimeType.PDF)],
      name: senderName,
    });

    // Update the spreadsheet with email status
    sheet.getRange(i + 1, statusIndex + 1).setValue("SENT");
    SpreadsheetApp.flush();
  }
}

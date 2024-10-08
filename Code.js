function onFormSubmit(e) {
  const namedValues = e.namedValues; // Get the named values from the form submission
  const recipient = "overnightteam@climbingclan.com"; // Replace with your email address
  const subject = "New feedback for overnight climbing";
  let message = "There's new overnight climbing feedback!\n https://docs.google.com/spreadsheets/d/1I_l0dj0Y6amkrFSZWlGIzg9ug_R_eky5An31CUS2fh0 \n\n";

  // Loop through namedValues to create the email message
  for (const [key, value] of Object.entries(namedValues)) {
    message += `${key}: ${value.join(", ")}\n`;
  }

  // Send the email
  MailApp.sendEmail(recipient, subject, message);
}

function createOnFormSubmitTrigger() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(sheet)
    .onFormSubmit()
    .create();
}

const emailTemplate = `
Hiya,

I've read your feedback about the overnight trip. Was there more you were keen to add?

Eager to hear things from your point of view,

-Tim
Chair
The Climbing Clan
www.climbingclan.com
`;

function emailNewAttendees() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(formResponsesSheetName);
  const data = sheet.getDataRange().getValues();
  const properties = PropertiesService.getScriptProperties();
  const emailedAddresses = properties.getProperty('emailedAddresses');
  const emailedSet = new Set(emailedAddresses ? JSON.parse(emailedAddresses) : []);

  const newEmailedSet = new Set();

  data.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    
    const timestamp = row[0];
    const name = row[1];
    const email = row[6];
        if (email === undefined || email === "") return; // Skip header row

    
    // Check if this email has already been sent
    if (!emailedSet.has(email)) {
      // Send email
      MailApp.sendEmail({
        to: email,
        subject: "Thanks for your feedback about Climbing Clan this week",
        body: emailTemplate,
        from: "climbingclan@tdobson.net" // Specify the sender email address
      });
      
      // Mark this email as sent
      newEmailedSet.add(email);
    }
  });
  
  // Update the list of emailed addresses
  const combinedSet = new Set([...emailedSet, ...newEmailedSet]);
  properties.setProperty('emailedAddresses', JSON.stringify([...combinedSet]));
}

function createNightlyTrigger() {
  ScriptApp.newTrigger('emailNewAttendees')
    .timeBased()
    .everyDays(1)
    .atHour(18) // Runs at 6 PM every day
    .create();
}

/**
 * DEBUG VERSION - Test Sheet Writing
 * Run this function to test if sheet writing works
 */
function testSheetWriting() {
  try {
    Logger.log('=== Starting Sheet Write Test ===');

    // Test 1: Get spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('✅ Spreadsheet accessed: ' + ss.getName());

    // Test 2: Get all sheets
    const allSheets = ss.getSheets();
    Logger.log('📊 Total sheets: ' + allSheets.length);
    allSheets.forEach((sheet, index) => {
      Logger.log(`  Sheet ${index + 1}: ${sheet.getName()}`);
    });

    // Test 3: Try to get active sheet using function
    const sheet = getActiveSheet();
    Logger.log('✅ Active sheet found: ' + sheet.getName());

    // Test 4: Get current row count
    const lastRow = sheet.getLastRow();
    Logger.log('📍 Last row number: ' + lastRow);

    // Test 5: Try to append a test row
    const testData = [
      'TEST-1234-5678-9012',  // License Key
      'Test User',             // Name
      '012-3456789',          // Phone
      'test@email.com',       // Email
      '2024-12-31',           // Expiry
      'ACTIVE',               // Status
      '2024-12-01',           // Created
      '2024-12-01',           // Renewed
      'RM10',                 // Paid
      '', '', '', '', '', '', '', '', '', // Devices
      0,                      // Total devices
      '',                     // Alerts
      'https://test-receipt-url', // Receipt
      new Date().toISOString() // Timestamp
    ];

    Logger.log('📝 Attempting to write test row...');
    sheet.appendRow(testData);
    Logger.log('✅ SUCCESS! Test row written to row: ' + sheet.getLastRow());

    // Test 6: Verify data written
    const newLastRow = sheet.getLastRow();
    const writtenData = sheet.getRange(newLastRow, 1, 1, 3).getValues()[0];
    Logger.log('📖 Data verification:');
    Logger.log('  License Key: ' + writtenData[0]);
    Logger.log('  Name: ' + writtenData[1]);
    Logger.log('  Phone: ' + writtenData[2]);

    Logger.log('=== TEST COMPLETED SUCCESSFULLY ===');
    return 'SUCCESS: Sheet writing works! Check row ' + newLastRow;

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Error stack: ' + error.stack);
    throw error;
  }
}

/**
 * DEBUG: Check doPost with sample data
 */
function testDoPostLocally() {
  try {
    Logger.log('=== Testing doPost Function ===');

    // Simulate form data
    const testData = {
      timestamp: new Date().toISOString(),
      fullName: 'Ahmad Test',
      email: 'test@example.com',
      phone: '012-3456789',
      fileName: 'test-receipt.jpg',
      fileType: 'image/jpeg',
      fileData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' // Tiny test image
    };

    Logger.log('📤 Test data prepared');
    Logger.log('Calling doPost simulation...');

    // Simulate the e parameter
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData)
      }
    };

    const result = doPost(mockEvent);
    Logger.log('✅ doPost executed');
    Logger.log('Result: ' + result.getContent());

    Logger.log('=== Check your sheet for new test row ===');

  } catch (error) {
    Logger.log('❌ ERROR in doPost: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * DEBUG: List all sheet names
 */
function listAllSheetNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  Logger.log('=== All Sheets in This Spreadsheet ===');
  sheets.forEach((sheet, index) => {
    Logger.log(`${index + 1}. "${sheet.getName()}" - ${sheet.getLastRow()} rows`);
  });

  Logger.log('=== getActiveSheet() will use: ===');
  const activeSheet = getActiveSheet();
  Logger.log('Selected: ' + activeSheet.getName());
}

/**
 * Improved doPost with better error handling and logging
 */
function doPostImproved(e) {
  Logger.log('=== doPost Started ===');

  try {
    // Parse data
    Logger.log('Step 1: Parsing data...');
    const data = JSON.parse(e.postData.contents);
    Logger.log('✅ Data parsed: ' + data.fullName);

    // Generate license key
    Logger.log('Step 2: Generating license key...');
    const licenseKey = generateUniqueLicenseKey();
    Logger.log('✅ License key: ' + licenseKey);

    // Calculate expiry
    Logger.log('Step 3: Calculating expiry...');
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + CONFIG.LICENSE_DURATION_DAYS);
    Logger.log('✅ Expiry: ' + formatDate(expiryDate));

    // Get sheet
    Logger.log('Step 4: Getting sheet...');
    const sheet = getActiveSheet();
    Logger.log('✅ Sheet: ' + sheet.getName());
    Logger.log('   Current rows: ' + sheet.getLastRow());

    // Handle receipt upload
    Logger.log('Step 5: Uploading receipt...');
    const folder = getOrCreateReceiptFolder();
    let receiptUrl = '';

    if (data.fileData) {
      try {
        const fileData = data.fileData.split(',')[1];
        const blob = Utilities.newBlob(
          Utilities.base64Decode(fileData),
          data.fileType,
          `${licenseKey}_${data.fileName}`
        );
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        receiptUrl = file.getUrl();
        Logger.log('✅ Receipt uploaded: ' + receiptUrl);
      } catch (fileError) {
        Logger.log('⚠️ Receipt upload failed: ' + fileError.message);
        receiptUrl = 'Error: ' + fileError.message;
      }
    }

    // Prepare row data
    Logger.log('Step 6: Preparing row data...');
    const timestamp = new Date(data.timestamp);
    const formattedTimestamp = formatDateTime(timestamp);

    const rowData = [
      licenseKey,                    // A
      data.fullName,                 // B
      data.phone,                    // C
      data.email,                    // D
      formatDate(expiryDate),        // E
      'ACTIVE',                      // F
      formatDate(today),             // G
      formatDate(today),             // H
      CONFIG.LICENSE_PRICE,          // I
      '', '', '', '', '', '', '', '', '', // J-R (devices)
      0,                             // S
      '',                            // T
      receiptUrl,                    // U
      formattedTimestamp             // V
    ];

    Logger.log('✅ Row data prepared (22 columns)');

    // Write to sheet - THIS IS THE CRITICAL PART
    Logger.log('Step 7: Writing to sheet...');
    Logger.log('   Before write - Last row: ' + sheet.getLastRow());

    sheet.appendRow(rowData);

    Logger.log('✅ Row appended!');
    Logger.log('   After write - Last row: ' + sheet.getLastRow());

    // Verify write
    const newRow = sheet.getLastRow();
    const verifyData = sheet.getRange(newRow, 1, 1, 3).getValues()[0];
    Logger.log('✅ Verification - Written data:');
    Logger.log('   License: ' + verifyData[0]);
    Logger.log('   Name: ' + verifyData[1]);
    Logger.log('   Phone: ' + verifyData[2]);

    // Send emails
    Logger.log('Step 8: Sending customer email...');
    sendCustomerEmail(data, licenseKey, expiryDate);
    Logger.log('✅ Customer email sent');

    Logger.log('Step 9: Sending admin notification...');
    sendAdminNotification(data, licenseKey, receiptUrl);
    Logger.log('✅ Admin notification sent');

    Logger.log('=== doPost Completed Successfully ===');

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'licenseKey': licenseKey,
        'expiryDate': formatDate(expiryDate),
        'row': sheet.getLastRow(),
        'sheetName': sheet.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ CRITICAL ERROR in doPost:');
    Logger.log('   Message: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    Logger.log('   Line: ' + error.lineNumber);

    // Still return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'error': error.toString(),
        'message': error.message,
        'stack': error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

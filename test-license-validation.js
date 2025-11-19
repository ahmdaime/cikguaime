/**
 * Test License Validation
 * Run this to test if validation works with generated license keys
 */
function testLicenseValidation() {
  try {
    Logger.log('=== Testing License Validation ===');

    // Get sheet
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('Sheet: ' + sheet.getName());
    Logger.log('Total rows: ' + data.length);

    // Get the latest license key (last row)
    if (data.length > 1) {
      const lastRow = data[data.length - 1];
      const licenseKey = lastRow[0]; // Column A
      const customerName = lastRow[1]; // Column B
      const email = lastRow[3]; // Column D
      const expiryDate = lastRow[4]; // Column E
      const status = lastRow[5]; // Column F

      Logger.log('\n📋 Latest License in Sheet:');
      Logger.log('  License Key: ' + licenseKey);
      Logger.log('  Customer: ' + customerName);
      Logger.log('  Email: ' + email);
      Logger.log('  Expiry: ' + expiryDate);
      Logger.log('  Status: ' + status);

      // Now test validation
      Logger.log('\n🔍 Testing Validation...');

      const testDeviceId = 'TEST-DEVICE-12345';
      const testDeviceName = 'Test Browser';

      const result = validateLicenseWithDevice(licenseKey, testDeviceId, testDeviceName);
      const resultJson = JSON.parse(result.getContent());

      Logger.log('\n✅ Validation Result:');
      Logger.log(JSON.stringify(resultJson, null, 2));

      if (resultJson.success) {
        Logger.log('\n✅ SUCCESS! License validation works!');
        Logger.log('   Status: ' + resultJson.status);
        Logger.log('   Days left: ' + resultJson.daysLeft);
        Logger.log('   Customer: ' + resultJson.customerName);
      } else {
        Logger.log('\n❌ FAILED! License validation returned error:');
        Logger.log('   Message: ' + resultJson.message);
        Logger.log('   Status: ' + resultJson.status);
      }

    } else {
      Logger.log('❌ No license keys found in sheet!');
    }

    Logger.log('\n=== Test Completed ===');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Check sheet structure for validation
 */
function checkSheetStructure() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('=== Sheet Structure Check ===');
    Logger.log('Sheet: ' + sheet.getName());
    Logger.log('Total columns: ' + data[0].length);
    Logger.log('Total rows: ' + data.length);

    // Check headers
    Logger.log('\n📋 Column Headers (First Row):');
    data[0].forEach((header, index) => {
      const colLetter = String.fromCharCode(65 + index);
      Logger.log(`  ${colLetter}: ${header}`);
    });

    // Check last few rows
    Logger.log('\n📊 Last 3 License Keys:');
    for (let i = Math.max(1, data.length - 3); i < data.length; i++) {
      Logger.log(`\nRow ${i + 1}:`);
      Logger.log('  License Key (A): ' + data[i][0]);
      Logger.log('  Name (B): ' + data[i][1]);
      Logger.log('  Email (D): ' + data[i][3]);
      Logger.log('  Expiry (E): ' + data[i][4]);
      Logger.log('  Status (F): ' + data[i][5]);
    }

  } catch (error) {
    Logger.log('ERROR: ' + error.message);
  }
}

/**
 * Test validation with specific license key
 */
function testSpecificLicense() {
  // REPLACE THIS with your actual license key
  const testLicenseKey = 'IDME-XXXX-XXXX-XXXX'; // <-- UPDATE THIS

  Logger.log('Testing license: ' + testLicenseKey);

  const result = validateLicenseWithDevice(
    testLicenseKey,
    'TEST-DEVICE-123',
    'Test Browser'
  );

  const resultJson = JSON.parse(result.getContent());
  Logger.log('\nResult:');
  Logger.log(JSON.stringify(resultJson, null, 2));
}

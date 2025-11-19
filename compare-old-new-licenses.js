/**
 * DEBUGGING TOOL: Compare Old vs New License Keys
 *
 * This helps identify which licenses were generated before vs after deployment update
 * and understand why old keys don't work
 */

function getActiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ACTIVE_LICENSES');
  if (!sheet) {
    throw new Error('Sheet ACTIVE_LICENSES not found');
  }
  return sheet;
}

/**
 * Analyze all licenses by generation time to find the cutoff point
 */
function analyzeLicensesByTime() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('📊 ANALYZING LICENSES BY TIME');
    Logger.log('========================================\n');

    if (data.length <= 1) {
      Logger.log('❌ No licenses found');
      return;
    }

    const licenses = [];

    // Collect all licenses with timestamps
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      licenses.push({
        rowNum: i + 1,
        licenseKey: row[0],
        customerName: row[1],
        email: row[3],
        status: row[5],
        purchaseDate: row[6],
        timestamp: row[21], // Column V - Purchase Timestamp
        expiryDate: row[4]
      });
    }

    // Sort by row number (chronological order as entered in sheet)
    licenses.sort((a, b) => a.rowNum - b.rowNum);

    Logger.log('Total licenses: ' + licenses.length + '\n');
    Logger.log('📋 ALL LICENSES (Chronological Order):');
    Logger.log('=====================================\n');

    licenses.forEach(function(lic, index) {
      const timestamp = lic.timestamp || lic.purchaseDate || 'No timestamp';
      Logger.log((index + 1) + '. Row ' + lic.rowNum + ': ' + lic.licenseKey);
      Logger.log('   Customer: ' + lic.customerName);
      Logger.log('   Email: ' + lic.email);
      Logger.log('   Status: ' + lic.status);
      Logger.log('   Timestamp: ' + timestamp);
      Logger.log('   Expiry: ' + lic.expiryDate);
      Logger.log('');
    });

    Logger.log('\n========================================');
    Logger.log('💡 INSTRUCTIONS');
    Logger.log('========================================');
    Logger.log('1. Test each license key in extension (dari atas ke bawah)');
    Logger.log('2. Identify bila mula berfungsi (contoh: Row 35 onwards berfungsi)');
    Logger.log('3. Keys sebelum row tu = generated before deployment update');
    Logger.log('4. Keys selepas row tu = generated after deployment update');
    Logger.log('5. Hantar result pada saya untuk analysis');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Check if a specific license key can be validated
 */
function checkLicenseValidation(licenseKey) {
  try {
    Logger.log('========================================');
    Logger.log('🔍 Checking License: ' + licenseKey);
    Logger.log('========================================\n');

    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Find the license
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === licenseKey) {
        found = true;
        const row = data[i];

        Logger.log('📋 Found in Sheet:');
        Logger.log('   Row: ' + (i + 1));
        Logger.log('   License Key: ' + row[0]);
        Logger.log('   Customer: ' + row[1]);
        Logger.log('   Email: ' + row[3]);
        Logger.log('   Status: ' + row[5]);
        Logger.log('   Expiry: ' + row[4]);
        Logger.log('   Purchase Date: ' + row[6]);
        Logger.log('   Timestamp: ' + row[21]);

        // Test if validation function exists and works
        Logger.log('\n🧪 Testing Validation Function...\n');

        if (typeof validateLicenseWithDevice !== 'undefined') {
          const result = validateLicenseWithDevice(licenseKey, 'TEST-DEVICE', 'Test Browser');
          const resultJson = JSON.parse(result.getContent());

          if (resultJson.success) {
            Logger.log('✅ VALIDATION WORKS in Apps Script');
            Logger.log('   This means the issue is NOT with the license data');
            Logger.log('   The issue is likely with extension calling wrong URL');
          } else {
            Logger.log('❌ VALIDATION FAILED in Apps Script');
            Logger.log('   Error: ' + resultJson.message);
          }

          Logger.log('\nFull Response:');
          Logger.log(JSON.stringify(resultJson, null, 2));
        } else {
          Logger.log('⚠️ validateLicenseWithDevice function not found');
        }

        break;
      }
    }

    if (!found) {
      Logger.log('❌ License not found in sheet');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Identify the problematic license keys
 * Test multiple keys that customers reported as not working
 */
function testMultipleCustomerKeys() {
  // ADD CUSTOMER LICENSE KEYS THAT DON'T WORK HERE:
  const problemKeys = [
    'IDME-BA9P-L6Q9-GUNV',  // Shahrul Niza - Row 33 - NOT WORKING
    // Add more keys customer reported as not working:
    // 'IDME-XXXX-XXXX-XXXX',
    // 'IDME-YYYY-YYYY-YYYY',
  ];

  Logger.log('========================================');
  Logger.log('🔍 TESTING MULTIPLE CUSTOMER KEYS');
  Logger.log('========================================\n');
  Logger.log('Testing ' + problemKeys.length + ' keys...\n');

  problemKeys.forEach(function(key) {
    checkLicenseValidation(key);
    Logger.log('\n-------------------------------------------\n');
  });
}

/**
 * Find the cutoff point - when did licenses start working?
 */
function findWorkingCutoffPoint() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🎯 FINDING CUTOFF POINT');
    Logger.log('========================================\n');

    Logger.log('Testing every 5th license to find when they started working...\n');

    for (let i = 1; i < data.length; i += 5) {
      const row = data[i];
      const licenseKey = row[0];
      const customerName = row[1];
      const rowNum = i + 1;

      Logger.log('Testing Row ' + rowNum + ': ' + licenseKey + ' (' + customerName + ')');

      if (typeof validateLicenseWithDevice !== 'undefined') {
        const result = validateLicenseWithDevice(licenseKey, 'TEST-' + rowNum, 'Test Browser');
        const resultJson = JSON.parse(result.getContent());

        if (resultJson.success) {
          Logger.log('   ✅ WORKS');
        } else {
          Logger.log('   ❌ FAILS: ' + resultJson.message);
        }
      }
      Logger.log('');
    }

    Logger.log('\n💡 Based on results above:');
    Logger.log('   - If all show ✅ WORKS = Problem is in extension, not Apps Script');
    Logger.log('   - If some show ❌ FAILS = There is data inconsistency in sheet');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Check if there are duplicate sheets or data sources
 */
function checkForDuplicateSheets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();

    Logger.log('========================================');
    Logger.log('📑 CHECKING FOR DUPLICATE SHEETS');
    Logger.log('========================================\n');

    Logger.log('Total sheets in spreadsheet: ' + sheets.length + '\n');

    sheets.forEach(function(sheet) {
      const name = sheet.getName();
      const rows = sheet.getLastRow();
      const cols = sheet.getLastColumn();

      Logger.log('Sheet: ' + name);
      Logger.log('   Rows: ' + rows);
      Logger.log('   Columns: ' + cols);

      // Check if it looks like a license sheet
      if (name.toLowerCase().includes('license') || name.toLowerCase().includes('active')) {
        Logger.log('   ⚠️ This looks like a license sheet!');
      }
      Logger.log('');
    });

    Logger.log('\n💡 If you see multiple license sheets:');
    Logger.log('   - OLD deployment might be pointing to different sheet');
    Logger.log('   - This would explain why old keys don\'t work');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

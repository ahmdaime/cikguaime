/**
 * ULTIMATE DEBUG: Find the exact pattern of working vs non-working licenses
 *
 * This will help identify what's different between working and failing licenses
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
 * Compare working vs failing licenses to find pattern
 */
function compareWorkingVsFailing() {
  // UPDATE THIS LIST: Add license keys and mark if they work or not
  const licenseStatus = [
    // Format: { key: 'IDME-XXXX-XXXX-XXXX', works: true/false, customerName: 'Name' }

    // EXAMPLE - GANTI DENGAN DATA SEBENAR:
    { key: 'IDME-BA9P-L6Q9-GUNV', works: false, customerName: 'SHAHRUL NIZA', row: 33 },
    // Add more licenses here based on customer feedback
    // { key: 'IDME-YYYY-YYYY-YYYY', works: true, customerName: 'Customer 2' },
    // { key: 'IDME-ZZZZ-ZZZZ-ZZZZ', works: false, customerName: 'Customer 3' },
  ];

  Logger.log('========================================');
  Logger.log('🔍 COMPARING WORKING VS FAILING LICENSES');
  Logger.log('========================================\n');

  const sheet = getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const header = data[0];

  const workingLicenses = [];
  const failingLicenses = [];

  // Collect data for each license
  licenseStatus.forEach(function(status) {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === status.key) {
        const licenseData = {
          row: i + 1,
          key: status.key,
          customerName: row[1],
          phone: row[2],
          email: row[3],
          expiryDate: row[4],
          expiryDateType: typeof row[4],
          expiryDateRaw: JSON.stringify(row[4]),
          status: row[5],
          statusType: typeof row[5],
          purchaseDate: row[6],
          purchaseDateType: typeof row[6],
          lastValidated: row[7],
          price: row[8],
          timestamp: row[21],
          // Check for hidden characters or whitespace
          keyLength: row[0].toString().length,
          keyHasWhitespace: /\s/.test(row[0].toString()),
          statusTrimmed: row[5] ? row[5].toString().trim() : '',
          statusLength: row[5] ? row[5].toString().length : 0
        };

        if (status.works) {
          workingLicenses.push(licenseData);
        } else {
          failingLicenses.push(licenseData);
        }
        break;
      }
    }
  });

  // Report working licenses
  Logger.log('✅ WORKING LICENSES (' + workingLicenses.length + '):');
  Logger.log('=====================================\n');
  workingLicenses.forEach(function(lic) {
    Logger.log('Row ' + lic.row + ': ' + lic.key);
    Logger.log('  Customer: ' + lic.customerName);
    Logger.log('  Status: "' + lic.status + '" (length: ' + lic.statusLength + ', type: ' + lic.statusType + ')');
    Logger.log('  Expiry Date: ' + lic.expiryDate + ' (type: ' + lic.expiryDateType + ')');
    Logger.log('  Purchase Date: ' + lic.purchaseDate + ' (type: ' + lic.purchaseDateType + ')');
    Logger.log('  Key Length: ' + lic.keyLength + ', Has Whitespace: ' + lic.keyHasWhitespace);
    Logger.log('  Timestamp: ' + lic.timestamp);
    Logger.log('');
  });

  // Report failing licenses
  Logger.log('\n❌ FAILING LICENSES (' + failingLicenses.length + '):');
  Logger.log('=====================================\n');
  failingLicenses.forEach(function(lic) {
    Logger.log('Row ' + lic.row + ': ' + lic.key);
    Logger.log('  Customer: ' + lic.customerName);
    Logger.log('  Status: "' + lic.status + '" (length: ' + lic.statusLength + ', type: ' + lic.statusType + ')');
    Logger.log('  Expiry Date: ' + lic.expiryDate + ' (type: ' + lic.expiryDateType + ')');
    Logger.log('  Purchase Date: ' + lic.purchaseDate + ' (type: ' + lic.purchaseDateType + ')');
    Logger.log('  Key Length: ' + lic.keyLength + ', Has Whitespace: ' + lic.keyHasWhitespace);
    Logger.log('  Timestamp: ' + lic.timestamp);
    Logger.log('');
  });

  // Analyze differences
  Logger.log('\n========================================');
  Logger.log('🔬 ANALYSIS - KEY DIFFERENCES');
  Logger.log('========================================\n');

  if (workingLicenses.length > 0 && failingLicenses.length > 0) {
    const workingSample = workingLicenses[0];
    const failingSample = failingLicenses[0];

    Logger.log('Comparing first working vs first failing license:\n');

    // Compare data types
    if (workingSample.expiryDateType !== failingSample.expiryDateType) {
      Logger.log('⚠️ DIFFERENCE: Expiry Date Type');
      Logger.log('   Working: ' + workingSample.expiryDateType);
      Logger.log('   Failing: ' + failingSample.expiryDateType);
      Logger.log('   🔧 FIX: Expiry date format inconsistent!\n');
    }

    if (workingSample.purchaseDateType !== failingSample.purchaseDateType) {
      Logger.log('⚠️ DIFFERENCE: Purchase Date Type');
      Logger.log('   Working: ' + workingSample.purchaseDateType);
      Logger.log('   Failing: ' + failingSample.purchaseDateType);
      Logger.log('   🔧 FIX: Purchase date format inconsistent!\n');
    }

    if (workingSample.statusLength !== failingSample.statusLength) {
      Logger.log('⚠️ DIFFERENCE: Status Field Length');
      Logger.log('   Working: ' + workingSample.statusLength + ' chars');
      Logger.log('   Failing: ' + failingSample.statusLength + ' chars');
      Logger.log('   🔧 FIX: Status field has extra characters!\n');
    }

    // Check timestamp differences
    Logger.log('📅 Timestamp Comparison:');
    Logger.log('   Working: ' + workingSample.timestamp);
    Logger.log('   Failing: ' + failingSample.timestamp);
    Logger.log('');

  } else {
    Logger.log('⚠️ Need more license samples to compare');
    Logger.log('   Please update licenseStatus array with more examples');
  }
}

/**
 * Show raw data for specific row to see hidden issues
 */
function inspectRawRow(rowNumber) {
  try {
    const sheet = getActiveSheet();
    const row = sheet.getRange(rowNumber, 1, 1, 22).getValues()[0];
    const header = ['License Key', 'Name', 'Phone', 'Email', 'Expiry', 'Status', 'Purchase Date', 'Last Validated', 'Price', 'Device1 ID', 'Device1 Name', 'Device1 Date', 'Device2 ID', 'Device2 Name', 'Device2 Date', 'Device3 ID', 'Device3 Name', 'Device3 Date', 'Device Count', 'Notes', 'Receipt URL', 'Timestamp'];

    Logger.log('========================================');
    Logger.log('🔬 RAW DATA INSPECTION - Row ' + rowNumber);
    Logger.log('========================================\n');

    for (let i = 0; i < row.length; i++) {
      const value = row[i];
      const col = String.fromCharCode(65 + i); // A, B, C, etc.

      Logger.log('Column ' + col + ' (' + header[i] + '):');
      Logger.log('  Value: ' + value);
      Logger.log('  Type: ' + typeof value);
      Logger.log('  String: "' + String(value) + '"');
      Logger.log('  Length: ' + String(value).length);

      if (typeof value === 'string') {
        Logger.log('  Has leading space: ' + (value !== value.trimStart()));
        Logger.log('  Has trailing space: ' + (value !== value.trimEnd()));
        Logger.log('  Char codes: ' + Array.from(value).map(c => c.charCodeAt(0)).join(', '));
      }

      Logger.log('');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Test validation for multiple licenses in batch
 */
function batchTestLicenses() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🧪 BATCH TESTING ALL LICENSES');
    Logger.log('========================================\n');

    const results = {
      working: [],
      failing: [],
      total: 0
    };

    // Test each license (skip header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const licenseKey = row[0];
      const customerName = row[1];
      const rowNum = i + 1;

      if (!licenseKey) continue;

      results.total++;

      try {
        const testResult = validateLicenseWithDevice(licenseKey, 'BATCH-TEST-' + rowNum, 'Test Browser');
        const resultJson = JSON.parse(testResult.getContent());

        if (resultJson.success) {
          results.working.push({ row: rowNum, key: licenseKey, name: customerName });
          Logger.log('✅ Row ' + rowNum + ': ' + licenseKey + ' - WORKS');
        } else {
          results.failing.push({ row: rowNum, key: licenseKey, name: customerName, error: resultJson.message });
          Logger.log('❌ Row ' + rowNum + ': ' + licenseKey + ' - FAILS: ' + resultJson.message);
        }
      } catch (error) {
        results.failing.push({ row: rowNum, key: licenseKey, name: customerName, error: error.message });
        Logger.log('💥 Row ' + rowNum + ': ' + licenseKey + ' - ERROR: ' + error.message);
      }
    }

    // Summary
    Logger.log('\n========================================');
    Logger.log('📊 BATCH TEST SUMMARY');
    Logger.log('========================================');
    Logger.log('Total Licenses: ' + results.total);
    Logger.log('✅ Working: ' + results.working.length + ' (' + Math.round(results.working.length/results.total*100) + '%)');
    Logger.log('❌ Failing: ' + results.failing.length + ' (' + Math.round(results.failing.length/results.total*100) + '%)');

    if (results.failing.length > 0) {
      Logger.log('\n🔴 FAILING LICENSES:');
      results.failing.forEach(function(item) {
        Logger.log('  Row ' + item.row + ': ' + item.key + ' (' + item.name + ') - ' + item.error);
      });
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Simple function to list the last 10 licenses with their test results
 */
function quickTestLast10() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🧪 QUICK TEST: Last 10 Licenses');
    Logger.log('========================================\n');

    const startRow = Math.max(1, data.length - 10);

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const licenseKey = row[0];
      const customerName = row[1];
      const rowNum = i + 1;

      if (!licenseKey) continue;

      try {
        const testResult = validateLicenseWithDevice(licenseKey, 'TEST-' + rowNum, 'Test');
        const resultJson = JSON.parse(testResult.getContent());

        const icon = resultJson.success ? '✅' : '❌';
        const msg = resultJson.success ? 'WORKS' : resultJson.message;

        Logger.log(icon + ' Row ' + rowNum + ': ' + customerName + ' - ' + msg);
      } catch (error) {
        Logger.log('💥 Row ' + rowNum + ': ' + customerName + ' - ERROR: ' + error.message);
      }
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

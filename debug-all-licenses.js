/**
 * DEBUGGING TOOL: Check All Licenses in Sheet
 *
 * This script checks every license in your ACTIVE_LICENSES sheet and identifies
 * potential issues that might prevent validation from working.
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
 * Main debugging function - checks all licenses and reports issues
 */
function debugAllLicenses() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🔍 DEBUGGING ALL LICENSES');
    Logger.log('========================================\n');

    if (data.length <= 1) {
      Logger.log('❌ No licenses found in sheet (only header row exists)');
      return;
    }

    const header = data[0];
    Logger.log('📋 Sheet Structure:');
    Logger.log('   Total Rows: ' + data.length);
    Logger.log('   Total Columns: ' + header.length);
    Logger.log('   Header: ' + JSON.stringify(header.slice(0, 10)) + '\n');

    let validCount = 0;
    let invalidCount = 0;
    const issues = [];

    // Check each license (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      const licenseKey = row[0];
      const customerName = row[1];
      const email = row[3];
      const expiryDate = row[4];
      const status = row[5];

      const issue = {
        row: rowNum,
        licenseKey: licenseKey,
        customerName: customerName,
        email: email,
        problems: []
      };

      // Check 1: License key exists and not empty
      if (!licenseKey || licenseKey.toString().trim() === '') {
        issue.problems.push('❌ License key is empty');
      }

      // Check 2: License key format (should be IDME-XXXX-XXXX-XXXX)
      if (licenseKey && !licenseKey.toString().match(/^IDME-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
        issue.problems.push('⚠️ License key format incorrect: ' + licenseKey);
      }

      // Check 3: Status field
      if (!status || status.toString().trim() === '') {
        issue.problems.push('❌ Status is empty');
      } else if (status.toString().toUpperCase() !== 'ACTIVE') {
        issue.problems.push('⚠️ Status is not ACTIVE: ' + status);
      }

      // Check 4: Expiry date
      if (!expiryDate || expiryDate.toString().trim() === '') {
        issue.problems.push('❌ Expiry date is empty');
      } else {
        // Try to parse as date
        let parsedDate = null;
        if (expiryDate instanceof Date) {
          parsedDate = expiryDate;
        } else {
          // Try to parse as DD/MM/YYYY
          const dateStr = expiryDate.toString();
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const year = parseInt(parts[2]);
            parsedDate = new Date(year, month, day);
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          issue.problems.push('❌ Expiry date cannot be parsed: ' + expiryDate);
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (parsedDate < today) {
            issue.problems.push('⏰ License expired on: ' + formatDate(parsedDate));
          }
        }
      }

      // Check 5: Customer name
      if (!customerName || customerName.toString().trim() === '') {
        issue.problems.push('⚠️ Customer name is empty');
      }

      // Check 6: Email
      if (!email || email.toString().trim() === '') {
        issue.problems.push('⚠️ Email is empty');
      }

      // Determine if this license is valid
      if (issue.problems.length === 0) {
        validCount++;
      } else {
        invalidCount++;
        issues.push(issue);
      }
    }

    // Report summary
    Logger.log('\n========================================');
    Logger.log('📊 SUMMARY');
    Logger.log('========================================');
    Logger.log('✅ Valid Licenses: ' + validCount);
    Logger.log('❌ Invalid Licenses: ' + invalidCount);
    Logger.log('📈 Total Licenses: ' + (validCount + invalidCount));

    // Report issues
    if (issues.length > 0) {
      Logger.log('\n========================================');
      Logger.log('🔴 LICENSES WITH ISSUES');
      Logger.log('========================================\n');

      issues.forEach(function(issue) {
        Logger.log('Row ' + issue.row + ': ' + issue.licenseKey);
        Logger.log('   Customer: ' + issue.customerName);
        Logger.log('   Email: ' + issue.email);
        Logger.log('   Problems:');
        issue.problems.forEach(function(problem) {
          Logger.log('      • ' + problem);
        });
        Logger.log('');
      });
    } else {
      Logger.log('\n🎉 All licenses are valid! No issues found.');
    }

    Logger.log('\n========================================');
    Logger.log('💡 RECOMMENDATIONS');
    Logger.log('========================================');
    if (invalidCount > 0) {
      Logger.log('1. Fix the issues listed above');
      Logger.log('2. Ensure all Status fields are "ACTIVE"');
      Logger.log('3. Ensure all Expiry Date fields are in DD/MM/YYYY format');
      Logger.log('4. Ensure all License Keys follow format: IDME-XXXX-XXXX-XXXX');
      Logger.log('5. Run testSpecificLicense() to test individual keys');
    } else {
      Logger.log('✅ No issues found! All licenses should work correctly.');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Test a specific license key
 */
function testSpecificLicense(licenseKey) {
  try {
    Logger.log('========================================');
    Logger.log('🔍 Testing License: ' + licenseKey);
    Logger.log('========================================\n');

    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Find the license
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === licenseKey) {
        found = true;
        const row = data[i];

        Logger.log('📋 License Data:');
        Logger.log('   Row: ' + (i + 1));
        Logger.log('   License Key: ' + row[0]);
        Logger.log('   Customer Name: ' + row[1]);
        Logger.log('   Phone: ' + row[2]);
        Logger.log('   Email: ' + row[3]);
        Logger.log('   Expiry Date: ' + row[4]);
        Logger.log('   Status: ' + row[5]);
        Logger.log('   Purchase Date: ' + row[6]);
        Logger.log('   Last Validated: ' + row[7]);
        Logger.log('   Purchase Price: ' + row[8]);

        Logger.log('\n🧪 Testing Validation...\n');

        // Test validation (you need to have validateLicenseWithDevice function)
        if (typeof validateLicenseWithDevice !== 'undefined') {
          const result = validateLicenseWithDevice(licenseKey, 'TEST-DEVICE-DEBUG', 'Debug Browser');
          const resultJson = JSON.parse(result.getContent());

          Logger.log('✅ Validation Result:');
          Logger.log(JSON.stringify(resultJson, null, 2));
        } else {
          Logger.log('⚠️ validateLicenseWithDevice function not found');
          Logger.log('   Make sure you have the validation code deployed');
        }

        break;
      }
    }

    if (!found) {
      Logger.log('❌ License key not found in sheet: ' + licenseKey);
      Logger.log('\n💡 Tips:');
      Logger.log('   - Check for typos');
      Logger.log('   - Check if key was deleted');
      Logger.log('   - Run debugAllLicenses() to see all keys');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Show all license keys in the sheet (for easy copy-paste)
 */
function listAllLicenseKeys() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('📋 ALL LICENSE KEYS');
    Logger.log('========================================\n');

    if (data.length <= 1) {
      Logger.log('❌ No licenses found');
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const licenseKey = row[0];
      const customerName = row[1];
      const status = row[5];
      const expiryDate = row[4];

      Logger.log((i) + '. ' + licenseKey + ' | ' + customerName + ' | ' + status + ' | Expiry: ' + expiryDate);
    }

    Logger.log('\n📊 Total: ' + (data.length - 1) + ' licenses');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * Helper function to format date
 */
function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return day + '/' + month + '/' + year;
}

/**
 * Fix common issues automatically
 */
function autoFixCommonIssues() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🔧 AUTO-FIXING COMMON ISSUES');
    Logger.log('========================================\n');

    let fixedCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      let fixed = false;

      // Fix 1: Trim whitespace from license key
      if (row[0] && row[0].toString().trim() !== row[0].toString()) {
        sheet.getRange(rowNum, 1).setValue(row[0].toString().trim());
        Logger.log('✅ Row ' + rowNum + ': Trimmed whitespace from license key');
        fixed = true;
      }

      // Fix 2: Normalize status to uppercase "ACTIVE"
      if (row[5] && row[5].toString().toLowerCase() === 'active' && row[5].toString() !== 'ACTIVE') {
        sheet.getRange(rowNum, 6).setValue('ACTIVE');
        Logger.log('✅ Row ' + rowNum + ': Normalized status to ACTIVE');
        fixed = true;
      }

      if (fixed) {
        fixedCount++;
      }
    }

    Logger.log('\n========================================');
    Logger.log('📊 SUMMARY');
    Logger.log('========================================');
    Logger.log('✅ Fixed ' + fixedCount + ' rows');

    if (fixedCount > 0) {
      Logger.log('\n💡 Run debugAllLicenses() again to verify fixes');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

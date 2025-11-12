/**
 * FIXED VERSION: Improved License Validation
 *
 * Fixes:
 * 1. Robust date parsing (handles Date objects, DD/MM/YYYY, YYYY-MM-DD)
 * 2. Flexible status checking (trims whitespace, case-insensitive)
 * 3. Better error messages
 *
 * USAGE: Replace the validateLicenseWithDevice function in your Apps Script
 * with this improved version
 */

// ============================================================================
// CORE CONFIGURATION
// ============================================================================

const CONFIG = {
  ADMIN_EMAIL: 'aimansic97@gmail.com',
  LICENSE_DURATION_DAYS: 30,
  LICENSE_PRICE: 'RM10',
  MAX_DEVICES: 3,
  DRIVE_FOLDER_NAME: 'IDME License Receipts',
  TELEGRAM_SUPPORT: 'https://t.me/+w2Ri8NTkpyZhOTU9'
};

// ============================================================================
// HELPER FUNCTIONS FOR DATE PARSING
// ============================================================================

/**
 * Parse date from various formats
 * Handles: Date objects, "DD/MM/YYYY", "YYYY-MM-DD", timestamps
 */
function parseDate(dateInput) {
  try {
    // If already a Date object
    if (dateInput instanceof Date) {
      return dateInput;
    }

    // If it's a number (timestamp)
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }

    // Convert to string for parsing
    const dateStr = String(dateInput).trim();

    if (!dateStr) {
      throw new Error('Empty date');
    }

    // Try DD/MM/YYYY format (most common from manual entry)
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = dateStr.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    // Try YYYY-MM-DD format (ISO format)
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    // Try MM/DD/YYYY format (US format)
    if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      const parts = dateStr.split('-');
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    // Last resort: try native Date parsing
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new Error('Invalid date format: ' + dateStr);
    }
    return parsed;

  } catch (error) {
    Logger.log('Date parsing error: ' + error.message + ' for input: ' + dateInput);
    throw new Error('Invalid date format');
  }
}

/**
 * Format date to DD/MM/YYYY
 */
function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Normalize status field (trim whitespace, uppercase)
 */
function normalizeStatus(status) {
  if (!status) return '';
  return String(status).trim().toUpperCase();
}

// ============================================================================
// IMPROVED VALIDATION FUNCTION
// ============================================================================

/**
 * Validate license with robust date parsing and status checking
 */
function validateLicenseWithDevice(licenseKey, deviceId, deviceName) {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return createResponse(false, 'No license data found');
    }

    // Normalize license key (trim whitespace)
    const normalizedKey = String(licenseKey).trim();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const key = String(row[0]).trim();
      const customerName = row[1];
      const expiryDate = row[4];
      const status = row[5];

      if (key === normalizedKey) {
        Logger.log('License found: ' + key + ' for customer: ' + customerName);

        // Check status (normalized comparison)
        const normalizedStatus = normalizeStatus(status);
        Logger.log('Status check: "' + normalizedStatus + '"');

        if (normalizedStatus !== 'ACTIVE') {
          return createResponse(false, 'License is not active', {
            status: normalizedStatus,
            reason: 'License has been suspended or cancelled'
          });
        }

        // Parse dates with improved parsing
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let expiry;
        try {
          expiry = parseDate(expiryDate);
          expiry.setHours(0, 0, 0, 0);
          Logger.log('Expiry date parsed: ' + formatDate(expiry));
        } catch (dateError) {
          Logger.log('Date parsing failed for row ' + (i + 1) + ': ' + dateError.message);
          return createResponse(false, 'Invalid expiry date format in database', {
            status: 'ERROR',
            error: 'Contact admin to fix license data'
          });
        }

        // Check if expired
        if (today > expiry) {
          return createResponse(false, 'License has expired', {
            status: 'EXPIRED',
            expiryDate: formatDate(expiry),
            daysExpired: Math.floor((today - expiry) / (1000 * 60 * 60 * 24))
          });
        }

        // Check device limit
        const deviceCheck = checkAndUpdateDevice(sheet, i + 1, deviceId, deviceName);

        if (!deviceCheck.allowed) {
          return createResponse(false, deviceCheck.message, {
            status: 'DEVICE_LIMIT_REACHED',
            maxDevices: CONFIG.MAX_DEVICES,
            currentDevices: deviceCheck.devices
          });
        }

        // Calculate days left
        const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

        return createResponse(true, 'License is valid', {
          status: 'ACTIVE',
          expiryDate: formatDate(expiry),
          daysLeft: daysLeft,
          customerName: customerName,
          showRenewalReminder: daysLeft <= 3,
          deviceInfo: deviceCheck.deviceInfo,
          registeredDevices: deviceCheck.deviceCount
        });
      }
    }

    return createResponse(false, 'License key not found', {
      status: 'INVALID',
      reason: 'This license key does not exist in our database'
    });

  } catch (error) {
    Logger.log('Validation error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createResponse(false, 'Validation error: ' + error.message);
  }
}

// ============================================================================
// SUPPORTING FUNCTIONS (Copy from your existing code)
// ============================================================================

function getActiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ACTIVE_LICENSES');
  if (!sheet) {
    throw new Error('Sheet ACTIVE_LICENSES not found');
  }
  return sheet;
}

function createResponse(success, message, additionalData = {}) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  Object.assign(response, additionalData);

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAndUpdateDevice(sheet, rowNumber, deviceId, deviceName) {
  const device1Id = sheet.getRange(rowNumber, 10).getValue();
  const device2Id = sheet.getRange(rowNumber, 13).getValue();
  const device3Id = sheet.getRange(rowNumber, 16).getValue();

  const now = new Date();
  const timestamp = formatDateTime(now);

  // Check if device already registered
  if (device1Id === deviceId) {
    sheet.getRange(rowNumber, 12).setValue(timestamp);
    return {
      allowed: true,
      deviceInfo: { slot: 1, name: sheet.getRange(rowNumber, 11).getValue() },
      deviceCount: countDevices(device1Id, device2Id, device3Id)
    };
  }

  if (device2Id === deviceId) {
    sheet.getRange(rowNumber, 15).setValue(timestamp);
    return {
      allowed: true,
      deviceInfo: { slot: 2, name: sheet.getRange(rowNumber, 14).getValue() },
      deviceCount: countDevices(device1Id, device2Id, device3Id)
    };
  }

  if (device3Id === deviceId) {
    sheet.getRange(rowNumber, 18).setValue(timestamp);
    return {
      allowed: true,
      deviceInfo: { slot: 3, name: sheet.getRange(rowNumber, 17).getValue() },
      deviceCount: countDevices(device1Id, device2Id, device3Id)
    };
  }

  // Register new device if slots available
  if (!device1Id) {
    sheet.getRange(rowNumber, 10).setValue(deviceId);
    sheet.getRange(rowNumber, 11).setValue(deviceName);
    sheet.getRange(rowNumber, 12).setValue(timestamp);
    sheet.getRange(rowNumber, 19).setValue(1);
    return {
      allowed: true,
      deviceInfo: { slot: 1, name: deviceName, newDevice: true },
      deviceCount: 1
    };
  }

  if (!device2Id) {
    sheet.getRange(rowNumber, 13).setValue(deviceId);
    sheet.getRange(rowNumber, 14).setValue(deviceName);
    sheet.getRange(rowNumber, 15).setValue(timestamp);
    sheet.getRange(rowNumber, 19).setValue(2);
    return {
      allowed: true,
      deviceInfo: { slot: 2, name: deviceName, newDevice: true },
      deviceCount: 2
    };
  }

  if (!device3Id) {
    sheet.getRange(rowNumber, 16).setValue(deviceId);
    sheet.getRange(rowNumber, 17).setValue(deviceName);
    sheet.getRange(rowNumber, 18).setValue(timestamp);
    sheet.getRange(rowNumber, 19).setValue(3);
    return {
      allowed: true,
      deviceInfo: { slot: 3, name: deviceName, newDevice: true },
      deviceCount: 3
    };
  }

  // Device limit reached
  const devices = [
    sheet.getRange(rowNumber, 11).getValue(),
    sheet.getRange(rowNumber, 14).getValue(),
    sheet.getRange(rowNumber, 17).getValue()
  ];

  return {
    allowed: false,
    message: 'Device limit reached. Maximum ' + CONFIG.MAX_DEVICES + ' devices allowed.',
    devices: devices
  };
}

function countDevices(device1Id, device2Id, device3Id) {
  let count = 0;
  if (device1Id) count++;
  if (device2Id) count++;
  if (device3Id) count++;
  return count;
}

function formatDateTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
}

// ============================================================================
// TEST FUNCTION
// ============================================================================

/**
 * Test the improved validation with all licenses
 */
function testImprovedValidation() {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    Logger.log('========================================');
    Logger.log('🧪 TESTING IMPROVED VALIDATION');
    Logger.log('========================================\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i < data.length; i++) {
      const licenseKey = data[i][0];
      const customerName = data[i][1];

      if (!licenseKey) continue;

      try {
        const result = validateLicenseWithDevice(licenseKey, 'TEST-DEVICE-' + i, 'Test Browser');
        const resultJson = JSON.parse(result.getContent());

        if (resultJson.success) {
          Logger.log('✅ Row ' + (i+1) + ': ' + licenseKey + ' (' + customerName + ') - WORKS');
          successCount++;
        } else {
          Logger.log('❌ Row ' + (i+1) + ': ' + licenseKey + ' (' + customerName + ') - FAILS: ' + resultJson.message);
          failCount++;
        }
      } catch (error) {
        Logger.log('💥 Row ' + (i+1) + ': ' + licenseKey + ' - ERROR: ' + error.message);
        failCount++;
      }
    }

    Logger.log('\n========================================');
    Logger.log('📊 RESULTS');
    Logger.log('========================================');
    Logger.log('✅ Success: ' + successCount);
    Logger.log('❌ Failed: ' + failCount);
    Logger.log('📈 Total: ' + (successCount + failCount));
    Logger.log('Success Rate: ' + Math.round(successCount/(successCount+failCount)*100) + '%');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

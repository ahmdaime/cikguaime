/**
 * IDME PRO License System - FULLY AUTOMATED
 * Version 3.2.0 - With Auto License Generation & Distribution
 * By CikguAimeDotCom
 *
 * FEATURES:
 * - License validation API (existing - UNCHANGED)
 * - Device fingerprinting and tracking (existing - UNCHANGED)
 * - AUTO license key generation (NEW)
 * - AUTO email delivery to customer (NEW)
 * - Purchase form handling (NEW)
 * - Receipt upload to Google Drive (NEW)
 * - Admin notifications (NEW)
 */

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
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
// MAIN HANDLERS
// ============================================================================

/**
 * Handle GET requests - License Validation (EXISTING - UNCHANGED)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const licenseKey = e.parameter.key;
    const deviceId = e.parameter.deviceId;
    const deviceName = e.parameter.deviceName;

    if (!action || !licenseKey) {
      return createResponse(false, 'Missing parameters');
    }

    if (action === 'validate') {
      return validateLicenseWithDevice(licenseKey, deviceId, deviceName);
    }

    if (action === 'deactivate_device') {
      return deactivateDevice(licenseKey, deviceId);
    }

    if (action === 'list_devices') {
      return listDevices(licenseKey);
    }

    return createResponse(false, 'Invalid action');

  } catch (error) {
    Logger.log('doGet error: ' + error.message);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Handle POST requests - Purchase Form Submission (NEW)
 */
function doPost(e) {
  try {
    Logger.log('doPost called');

    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received data: ' + JSON.stringify(data));

    // Generate unique license key
    const licenseKey = generateUniqueLicenseKey();
    Logger.log('Generated license key: ' + licenseKey);

    // Calculate expiry date
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + CONFIG.LICENSE_DURATION_DAYS);

    // Get active licenses sheet
    const sheet = getActiveSheet();

    // Create Google Drive folder for receipts (if not exists)
    const folder = getOrCreateReceiptFolder();

    // Save receipt file to Google Drive
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
        Logger.log('Receipt uploaded: ' + receiptUrl);
      } catch (fileError) {
        Logger.log('Error saving receipt: ' + fileError.message);
        receiptUrl = 'Error uploading file: ' + fileError.message;
      }
    }

    // Format timestamp
    const timestamp = new Date(data.timestamp);
    const formattedTimestamp = formatDateTime(timestamp);

    // Add license to ACTIVE_LICENSES sheet
    sheet.appendRow([
      licenseKey,                    // A: License Key
      data.fullName,                 // B: Customer Name
      data.phone,                    // C: Phone
      data.email,                    // D: Email
      formatDate(expiryDate),        // E: Expiry Date
      'ACTIVE',                      // F: Status
      formatDate(today),             // G: Created Date
      formatDate(today),             // H: Last Renewed
      CONFIG.LICENSE_PRICE,          // I: Total Paid
      '',                            // J: Device 1 ID
      '',                            // K: Device 1 Name
      '',                            // L: Device 1 Last Used
      '',                            // M: Device 2 ID
      '',                            // N: Device 2 Name
      '',                            // O: Device 2 Last Used
      '',                            // P: Device 3 ID
      '',                            // Q: Device 3 Name
      '',                            // R: Device 3 Last Used
      0,                             // S: Total Devices
      '',                            // T: Alerts
      receiptUrl,                    // U: Receipt Link
      formattedTimestamp             // V: Purchase Timestamp
    ]);

    Logger.log('License added to sheet');

    // Send email to customer with license key
    sendCustomerEmail(data, licenseKey, expiryDate);
    Logger.log('Customer email sent');

    // Send notification to admin
    sendAdminNotification(data, licenseKey, receiptUrl);
    Logger.log('Admin notification sent');

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'licenseKey': licenseKey,
        'expiryDate': formatDate(expiryDate),
        'row': sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('doPost error: ' + error.message);
    Logger.log('Error stack: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'error': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// LICENSE KEY GENERATION
// ============================================================================

/**
 * Generate unique license key in format: IDME-XXXX-XXXX-XXXX
 */
function generateUniqueLicenseKey() {
  const sheet = getActiveSheet();
  let licenseKey;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    licenseKey = generateLicenseKey();

    // Check if key already exists
    const data = sheet.getDataRange().getValues();
    isUnique = true;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === licenseKey) {
        isUnique = false;
        break;
      }
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique license key after ' + maxAttempts + ' attempts');
  }

  return licenseKey;
}

/**
 * Generate random license key
 */
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 3;
  const segmentLength = 4;
  let key = 'IDME';

  for (let i = 0; i < segments; i++) {
    key += '-';
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return key; // Format: IDME-XXXX-XXXX-XXXX
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Send email to customer with license key and activation instructions
 */
function sendCustomerEmail(data, licenseKey, expiryDate) {
  try {
    const subject = '✅ License Key Anda - IDME PBD Helper PRO';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .license-box { background: white; border: 3px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .license-key { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; margin: 10px 0; }
    .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
    .steps { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .step { margin: 15px 0; padding-left: 30px; position: relative; }
    .step-number { position: absolute; left: 0; background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: bold; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
    .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Tahniah ${data.fullName}!</h1>
      <p>Terima kasih kerana membeli IDME PBD Helper PRO</p>
    </div>

    <div class="content">
      <div class="license-box">
        <h2 style="color: #667eea; margin-top: 0;">🔑 License Key Anda</h2>
        <div class="license-key">${licenseKey}</div>
        <p style="color: #666; font-size: 14px; margin-bottom: 0;">Sila simpan license key ini dengan selamat</p>
      </div>

      <div class="info-box">
        <strong>📋 Maklumat License:</strong><br>
        👤 Nama: ${data.fullName}<br>
        📧 Email: ${data.email}<br>
        📅 Tarikh Luput: ${formatDate(expiryDate)} (${CONFIG.LICENSE_DURATION_DAYS} hari)<br>
        💰 Jumlah Bayaran: ${CONFIG.LICENSE_PRICE}<br>
        📱 Device Limit: ${CONFIG.MAX_DEVICES} peranti
      </div>

      <div class="steps">
        <h3 style="color: #667eea; margin-top: 0;">🚀 Cara Activate License</h3>

        <div class="step">
          <div class="step-number">1</div>
          <strong>Install Extension</strong><br>
          Download IDME PBD Helper dari Chrome Web Store (jika belum install)
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <strong>Buka Extension</strong><br>
          Klik icon extension di Chrome browser
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <strong>Navigate ke License Settings</strong><br>
          Klik butang "⚙️ Settings" atau "PRO Features"
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <strong>Masukkan License Key</strong><br>
          Copy & paste license key di atas ke dalam form<br>
          <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${licenseKey}</code>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <strong>Activate!</strong><br>
          Klik "Activate" dan anda sudah boleh guna semua PRO features! ✅
        </div>
      </div>

      <div class="warning">
        <strong>⚠️ PENTING:</strong><br>
        • License ini boleh digunakan pada maksimum <strong>${CONFIG.MAX_DEVICES} peranti</strong><br>
        • Sila jangan share license key dengan orang lain<br>
        • License akan expire pada <strong>${formatDate(expiryDate)}</strong><br>
        • Anda akan menerima reminder email 3 hari sebelum expire
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${CONFIG.TELEGRAM_SUPPORT}" class="button" style="color: white;">💬 Join Telegram Support Group</a>
      </div>

      <div class="info-box">
        <strong>💡 Tips Berguna:</strong><br>
        • Join Telegram group untuk tips & tricks<br>
        • Update extension secara berkala<br>
        • Report bugs untuk improvement<br>
        • Share feedback anda!
      </div>

      <div style="text-align: center; color: #666; margin-top: 30px;">
        <p>Ada masalah? Hubungi kami:</p>
        <p>📧 Email: ${CONFIG.ADMIN_EMAIL}<br>
        💬 Telegram: <a href="${CONFIG.TELEGRAM_SUPPORT}">Support Group</a></p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0;">Made with ❤️ by CikguAimeDotCom</p>
      <p style="margin: 5px 0; font-size: 12px;">IDME PBD Helper v3.2.0 - Anti-Sharing Protection</p>
    </div>
  </div>
</body>
</html>
    `;

    const plainBody = `
Tahniah ${data.fullName}!

Terima kasih kerana membeli IDME PBD Helper PRO.

🔑 LICENSE KEY ANDA:
${licenseKey}

📋 MAKLUMAT LICENSE:
• Nama: ${data.fullName}
• Email: ${data.email}
• Tarikh Luput: ${formatDate(expiryDate)} (${CONFIG.LICENSE_DURATION_DAYS} hari)
• Jumlah Bayaran: ${CONFIG.LICENSE_PRICE}
• Device Limit: ${CONFIG.MAX_DEVICES} peranti

🚀 CARA ACTIVATE:
1. Install extension dari Chrome Web Store (jika belum)
2. Buka extension dan klik Settings/PRO Features
3. Masukkan license key: ${licenseKey}
4. Klik Activate - Done! ✅

⚠️ PENTING:
• License boleh digunakan pada max ${CONFIG.MAX_DEVICES} peranti
• Jangan share license key dengan orang lain
• License expire pada: ${formatDate(expiryDate)}

💬 SUPPORT:
Join Telegram Group: ${CONFIG.TELEGRAM_SUPPORT}
Email: ${CONFIG.ADMIN_EMAIL}

Made with ❤️ by CikguAimeDotCom
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

  } catch (error) {
    Logger.log('Error sending customer email: ' + error.message);
  }
}

/**
 * Send notification to admin about new purchase
 */
function sendAdminNotification(data, licenseKey, receiptUrl) {
  try {
    const subject = '🔔 Pembelian License Baru - ' + data.fullName;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
    .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 20px; }
    .info-row { padding: 10px; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #667eea; display: inline-block; width: 150px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔔 Pembelian License Baru</h2>
    </div>
    <div class="content">
      <h3>Maklumat Pelanggan:</h3>
      <div class="info-row"><span class="label">Nama:</span> ${data.fullName}</div>
      <div class="info-row"><span class="label">Email:</span> ${data.email}</div>
      <div class="info-row"><span class="label">Telefon:</span> ${data.phone}</div>
      <div class="info-row"><span class="label">License Key:</span> <strong>${licenseKey}</strong></div>
      <div class="info-row"><span class="label">Jumlah:</span> ${CONFIG.LICENSE_PRICE}</div>
      <div class="info-row"><span class="label">Masa:</span> ${new Date(data.timestamp).toLocaleString('ms-MY')}</div>

      <h3 style="margin-top: 20px;">Actions:</h3>
      <a href="${receiptUrl}" class="button" style="color: white;">📎 Lihat Resit</a>
      <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" class="button" style="color: white;">📊 Buka Sheet</a>

      <p style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3;">
        <strong>✅ License telah auto-generated dan dihantar ke customer!</strong><br>
        Sila verify payment dan update status jika perlu.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const plainBody = `
Pembelian License Baru

Maklumat Pelanggan:
━━━━━━━━━━━━━━━━━━━━━━
👤 Nama: ${data.fullName}
📧 Email: ${data.email}
📱 Telefon: ${data.phone}
🔑 License Key: ${licenseKey}
💰 Jumlah: ${CONFIG.LICENSE_PRICE}
🕐 Masa: ${new Date(data.timestamp).toLocaleString('ms-MY')}

📎 Resit Pembayaran:
${receiptUrl}

━━━━━━━━━━━━━━━━━━━━━━
✅ License telah auto-generated dan dihantar ke customer!

Sila verify payment dan update status jika perlu.

🔗 Buka Google Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
    `;

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

  } catch (error) {
    Logger.log('Error sending admin notification: ' + error.message);
  }
}

// ============================================================================
// LICENSE VALIDATION (EXISTING - UNCHANGED)
// ============================================================================

/**
 * Validate license with device tracking
 */
function validateLicenseWithDevice(licenseKey, deviceId, deviceName) {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return createResponse(false, 'No license data found');
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const key = row[0];
      const customerName = row[1];
      const expiryDate = row[4];
      const status = row[5];

      if (key === licenseKey) {
        if (status !== 'ACTIVE') {
          return createResponse(false, 'License is not active', {
            status: status,
            reason: 'License has been suspended or cancelled'
          });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        if (today > expiry) {
          return createResponse(false, 'License has expired', {
            status: 'EXPIRED',
            expiryDate: formatDate(expiry),
            daysExpired: Math.floor((today - expiry) / (1000 * 60 * 60 * 24))
          });
        }

        const deviceCheck = checkAndUpdateDevice(sheet, i + 1, deviceId, deviceName);

        if (!deviceCheck.allowed) {
          return createResponse(false, deviceCheck.message, {
            status: 'DEVICE_LIMIT_REACHED',
            maxDevices: CONFIG.MAX_DEVICES,
            currentDevices: deviceCheck.devices
          });
        }

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
    return createResponse(false, 'Validation error: ' + error.message);
  }
}

/**
 * Check device limit and update device info
 */
function checkAndUpdateDevice(sheet, rowNumber, deviceId, deviceName) {
  const device1Id = sheet.getRange(rowNumber, 10).getValue();
  const device2Id = sheet.getRange(rowNumber, 13).getValue();
  const device3Id = sheet.getRange(rowNumber, 16).getValue();

  const now = new Date();
  const timestamp = formatDateTime(now);

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

  const devices = [
    sheet.getRange(rowNumber, 11).getValue(),
    sheet.getRange(rowNumber, 14).getValue(),
    sheet.getRange(rowNumber, 17).getValue()
  ];

  return {
    allowed: false,
    message: 'Device limit reached! Maximum ' + CONFIG.MAX_DEVICES + ' devices allowed. Please deactivate an old device first.',
    devices: devices,
    deviceCount: 3
  };
}

/**
 * Count active devices
 */
function countDevices(dev1, dev2, dev3) {
  let count = 0;
  if (dev1) count++;
  if (dev2) count++;
  if (dev3) count++;
  return count;
}

/**
 * Deactivate a device
 */
function deactivateDevice(licenseKey, deviceId) {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === licenseKey) {
        const rowNumber = i + 1;

        for (let slot = 0; slot < 3; slot++) {
          const col = 10 + (slot * 3);
          const devId = sheet.getRange(rowNumber, col).getValue();

          if (devId === deviceId) {
            sheet.getRange(rowNumber, col).setValue('');
            sheet.getRange(rowNumber, col + 1).setValue('');
            sheet.getRange(rowNumber, col + 2).setValue('');

            const dev1 = slot === 0 ? '' : sheet.getRange(rowNumber, 10).getValue();
            const dev2 = slot === 1 ? '' : sheet.getRange(rowNumber, 13).getValue();
            const dev3 = slot === 2 ? '' : sheet.getRange(rowNumber, 16).getValue();
            const newCount = countDevices(dev1, dev2, dev3);
            sheet.getRange(rowNumber, 19).setValue(newCount);

            return createResponse(true, 'Device deactivated successfully', {
              remainingDevices: newCount
            });
          }
        }

        return createResponse(false, 'Device not found');
      }
    }

    return createResponse(false, 'License key not found');

  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * List all devices for a license
 */
function listDevices(licenseKey) {
  try {
    const sheet = getActiveSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === licenseKey) {
        const rowNumber = i + 1;
        const devices = [];

        for (let slot = 0; slot < 3; slot++) {
          const col = 10 + (slot * 3);
          const devId = sheet.getRange(rowNumber, col).getValue();
          const devName = sheet.getRange(rowNumber, col + 1).getValue();
          const lastUsed = sheet.getRange(rowNumber, col + 2).getValue();

          if (devId) {
            devices.push({
              deviceId: devId,
              deviceName: devName,
              lastUsed: lastUsed,
              slot: slot + 1
            });
          }
        }

        return createResponse(true, 'Devices retrieved', {
          devices: devices,
          totalDevices: devices.length,
          maxDevices: CONFIG.MAX_DEVICES
        });
      }
    }

    return createResponse(false, 'License key not found');

  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the active licenses sheet
 */
function getActiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const possibleNames = [
    'ACTIVE_LICENSES',
    'Active_Licenses',
    'Active Licenses',
    'Sheet1',
    'Licenses'
  ];

  for (let name of possibleNames) {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      return sheet;
    }
  }

  const firstSheet = ss.getSheets()[0];
  if (firstSheet) {
    return firstSheet;
  }

  throw new Error('No sheets found in spreadsheet!');
}

/**
 * Get or create receipt folder in Google Drive
 */
function getOrCreateReceiptFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
  }
}

/**
 * Create JSON response
 */
function createResponse(success, message, data = {}) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString(),
    ...data
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date and time
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ============================================================================
// ADMIN FUNCTIONS (Optional - for manual operations)
// ============================================================================

/**
 * Manually extend license (for renewals)
 */
function extendLicense(licenseKey, months = 1) {
  const sheet = getActiveSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === licenseKey) {
      const currentExpiry = new Date(data[i][4]);
      const today = new Date();

      const baseDate = currentExpiry > today ? currentExpiry : today;
      baseDate.setMonth(baseDate.getMonth() + months);

      const row = i + 1;
      sheet.getRange(row, 5).setValue(formatDate(baseDate));
      sheet.getRange(row, 6).setValue('ACTIVE');
      sheet.getRange(row, 8).setValue(formatDate(new Date()));

      const currentTotal = sheet.getRange(row, 9).getValue();
      const currentAmount = parseInt(currentTotal.replace('RM', '')) || 0;
      sheet.getRange(row, 9).setValue('RM' + (currentAmount + (10 * months)));

      Logger.log('License extended: ' + licenseKey + ' for ' + months + ' month(s)');
      return true;
    }
  }

  Logger.log('License not found: ' + licenseKey);
  return false;
}

/**
 * Test email function
 */
function testCustomerEmail() {
  const testData = {
    fullName: 'Ahmad bin Ali (TEST)',
    email: CONFIG.ADMIN_EMAIL,
    phone: '012-3456789',
    timestamp: new Date().toISOString()
  };

  const testLicenseKey = 'IDME-TEST-TEST-TEST';
  const testExpiryDate = new Date();
  testExpiryDate.setDate(testExpiryDate.getDate() + 30);

  sendCustomerEmail(testData, testLicenseKey, testExpiryDate);
  Logger.log('Test email sent to: ' + CONFIG.ADMIN_EMAIL);
}

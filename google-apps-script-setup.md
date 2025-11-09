# Setup Google Apps Script untuk License Purchase Form

## Langkah 1: Buat Google Sheet Baru

1. Pergi ke [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "IDME License Purchases"
3. Pada Sheet1, buat header di row 1:
   - A1: **Timestamp**
   - B1: **Nama Penuh**
   - C1: **Email**
   - D1: **No. Telefon**
   - E1: **Status**
   - F1: **Receipt Link**
   - G1: **Notes**

## Langkah 2: Buka Apps Script Editor

1. Dalam Google Sheet, klik **Extensions** > **Apps Script**
2. Delete semua code yang ada
3. Copy dan paste code di bawah:

```javascript
// Google Apps Script untuk License Purchase Form
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];

    // Create Google Drive folder for receipts (if not exists)
    const folderName = 'IDME License Receipts';
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);

    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    // Save receipt file to Google Drive
    let receiptUrl = '';
    if (data.fileData) {
      try {
        // Extract base64 data
        const fileData = data.fileData.split(',')[1];
        const blob = Utilities.newBlob(
          Utilities.base64Decode(fileData),
          data.fileType,
          data.fileName
        );

        // Create file in Drive
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        receiptUrl = file.getUrl();
      } catch (fileError) {
        console.error('Error saving file:', fileError);
        receiptUrl = 'Error uploading file';
      }
    }

    // Format timestamp
    const timestamp = new Date(data.timestamp);
    const formattedTimestamp = Utilities.formatDate(
      timestamp,
      Session.getScriptTimeZone(),
      'dd/MM/yyyy HH:mm:ss'
    );

    // Append data to sheet
    sheet.appendRow([
      formattedTimestamp,
      data.fullName,
      data.email,
      data.phone,
      'Pending Review',
      receiptUrl,
      ''
    ]);

    // Optional: Send email notification to admin
    sendAdminNotification(data, receiptUrl);

    // Optional: Send confirmation email to customer
    sendCustomerConfirmation(data);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Send email notification to admin
function sendAdminNotification(data, receiptUrl) {
  try {
    const adminEmail = 'support@cikguaime.com'; // GANTI dengan email anda

    const subject = '🔔 Permohonan License Baru - ' + data.fullName;

    const body = `
Permohonan License PRO Baru

📋 Maklumat Pelanggan:
━━━━━━━━━━━━━━━━━━━━━━
👤 Nama: ${data.fullName}
📧 Email: ${data.email}
📱 Telefon: ${data.phone}
🕐 Masa: ${new Date(data.timestamp).toLocaleString('ms-MY')}

📎 Resit Pembayaran:
${receiptUrl}

━━━━━━━━━━━━━━━━━━━━━━
Sila semak pembayaran dan hantar license key ke email pelanggan.

🔗 Buka Google Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
    `;

    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Send confirmation email to customer
function sendCustomerConfirmation(data) {
  try {
    const subject = '✅ Permohonan License Diterima - IDME PBD Helper PRO';

    const body = `
Terima kasih ${data.fullName}!

Permohonan license PRO anda telah diterima dengan jayanya. 🎉

📋 Maklumat Permohonan Anda:
━━━━━━━━━━━━━━━━━━━━━━
👤 Nama: ${data.fullName}
📧 Email: ${data.email}
🕐 Tarikh: ${new Date(data.timestamp).toLocaleString('ms-MY')}

⏳ Apa Yang Seterusnya?
━━━━━━━━━━━━━━━━━━━━━━
✓ Kami akan semak pembayaran anda dalam masa 1-4 jam (waktu bekerja)
✓ License key akan dihantar ke email ini selepas pembayaran disahkan
✓ Anda akan menerima arahan cara activate license

💡 Tips:
• Pastikan check email termasuk folder Spam/Junk
• Simpan license key dengan selamat
• Satu license boleh digunakan pada 3 devices

📞 Perlu Bantuan?
━━━━━━━━━━━━━━━━━━━━━━
Email: support@cikguaime.com
Response Time: 24 jam (PRO users)

Terima kasih kerana memilih IDME PBD Helper PRO!

Salam,
Team CikguAime
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.error('Error sending customer confirmation:', error);
  }
}

// Test function - run this to test the setup
function testSetup() {
  const testData = {
    timestamp: new Date().toISOString(),
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '012-3456789',
    fileName: 'test-receipt.jpg',
    fileType: 'image/jpeg',
    fileData: ''
  };

  Logger.log('Testing email notifications...');
  sendCustomerConfirmation(testData);
  sendAdminNotification(testData, 'https://drive.google.com/test');
  Logger.log('Test completed! Check your email.');
}
```

## Langkah 3: Deploy Web App

1. Klik **Deploy** > **New deployment**
2. Klik icon gear ⚙️ > Pilih **Web app**
3. Setting:
   - **Description**: License Purchase Form Handler
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Klik **Deploy**
5. **COPY URL WEB APP** yang diberikan (format: https://script.google.com/macros/s/xxxxx/exec)
6. Authorize access jika diminta

## Langkah 4: Update Landing Page

1. Buka `landing-page.html`
2. Cari line dengan `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
3. Ganti dengan URL yang anda copy dari Langkah 3
4. Contoh:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxx/exec';
```

## Langkah 5: Update Email Admin

1. Dalam Apps Script code, cari:
```javascript
const adminEmail = 'support@cikguaime.com';
```
2. Ganti dengan email anda

## Langkah 6: Test Form

1. Buka landing-page.html di browser
2. Klik "Beli License PRO"
3. Isi borang dan upload test receipt
4. Submit
5. Check:
   - ✓ Data masuk Google Sheet
   - ✓ Receipt upload ke Google Drive folder
   - ✓ Email notification diterima (admin & customer)

## Troubleshooting

### Error: "Authorization required"
- Run function `testSetup()` sekali untuk authorize script
- Klik Review Permissions > Allow

### Email tidak sampai
- Check Gmail settings > Filters
- Pastikan email admin betul dalam code
- Check Sent folder dalam Gmail

### File upload gagal
- Check file size < 5MB
- Format: JPG, PNG, atau PDF sahaja
- Check browser console untuk error

## Bonus: Auto-Generate License Key

Tambah function ini dalam Apps Script:

```javascript
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 4;
  let key = '';

  for (let i = 0; i < segments; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return key; // Format: XXXX-XXXX-XXXX-XXXX
}

// Add this to doPost function after appending row:
const licenseKey = generateLicenseKey();
sheet.getRange(sheet.getLastRow(), 8).setValue(licenseKey); // Column H
```

## Security Tips

1. **Jangan share Apps Script URL** - ia boleh menyebabkan spam submissions
2. **Enable reCAPTCHA** jika perlu (untuk production)
3. **Monitor submissions** regularly untuk detect abuse
4. **Backup Google Sheet** regularly

---

**Setup Complete!** 🎉

Sekarang landing page anda sudah integrated dengan Google Sheets dan boleh terima license purchases automatically!

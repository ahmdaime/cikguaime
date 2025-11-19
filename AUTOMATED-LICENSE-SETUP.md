# 🚀 IDME PRO License - Fully Automated System Setup Guide

## 📋 Overview

Sistem automation ini akan:
- ✅ **Auto-generate** unique license key
- ✅ **Auto-send** email kepada customer dengan license key
- ✅ **Auto-upload** resit ke Google Drive
- ✅ **Auto-notify** admin tentang purchase baru
- ✅ **Zero manual work** - customer dapat license INSTANTLY!

---

## 🎯 System Architecture

```
Customer Submit Form
    ↓
Google Apps Script (doPost)
    ↓
├─ Generate Unique License Key (IDME-XXXX-XXXX-XXXX)
├─ Calculate Expiry Date (30 days)
├─ Save to ACTIVE_LICENSES Sheet
├─ Upload Receipt to Google Drive
├─ Send Email to Customer (with license key)
└─ Send Notification to Admin
    ↓
Customer receives email instantly
Extension validates via doGet API
```

---

## 📦 What's Included

### 1. **Google Apps Script** (`google-apps-script-automated.js`)
- Full automation code
- Backward compatible with existing validation API
- Professional email templates (HTML + Plain Text)

### 2. **Landing Page** (`landing-page.html`)
- Updated success message (instant delivery)
- Updated FAQ (instant vs 1-4 hours)
- Form submission to Apps Script

### 3. **Documentation**
- Complete setup guide (this file)
- Troubleshooting tips
- Testing procedures

---

## 🛠️ Step-by-Step Setup

### STEP 1: Prepare Google Sheet

1. **Open your existing Google Sheet** dengan ACTIVE_LICENSES
2. **Verify columns** (A-T should already exist from your existing setup)
3. **Add 2 new columns** (optional but recommended):
   - Column U: **Receipt Link** (URL to uploaded receipt)
   - Column V: **Purchase Timestamp** (when form was submitted)

**Expected Sheet Structure:**
```
A: License Key
B: Customer Name
C: Phone
D: Email
E: Expiry Date
F: Status
G: Created Date
H: Last Renewed
I: Total Paid
J: Device 1 ID
K: Device 1 Name
L: Device 1 Last Used
M: Device 2 ID
N: Device 2 Name
O: Device 2 Last Used
P: Device 3 ID
Q: Device 3 Name
R: Device 3 Last Used
S: Total Devices
T: Alerts
U: Receipt Link (NEW - optional)
V: Purchase Timestamp (NEW - optional)
```

---

### STEP 2: Update Google Apps Script

#### 2.1: Open Apps Script Editor

1. In your Google Sheet, klik **Extensions** > **Apps Script**
2. You should see your existing code (with `doGet` function)

#### 2.2: Replace with New Code

1. **BACKUP your existing code first!** (Copy paste ke text file)
2. Delete ALL existing code
3. Copy code dari `google-apps-script-automated.js`
4. Paste into Apps Script editor

#### 2.3: Update Configuration

Find the `CONFIG` object at the top and update:

```javascript
const CONFIG = {
  ADMIN_EMAIL: 'aimansic97@gmail.com',        // ✅ Already correct
  LICENSE_DURATION_DAYS: 30,                  // ✅ Already correct
  LICENSE_PRICE: 'RM10',                      // ✅ Already correct
  MAX_DEVICES: 3,                             // ✅ Already correct
  DRIVE_FOLDER_NAME: 'IDME License Receipts', // ✅ Default is good
  TELEGRAM_SUPPORT: 'https://t.me/+w2Ri8NTkpyZhOTU9' // ✅ Already correct
};
```

#### 2.4: Save the Script

1. Klik **Save** (💾 icon) atau `Ctrl+S`
2. Rename project to: `IDME License System v3.2`

---

### STEP 3: Deploy Web App

#### 3.1: Deploy

1. Klik **Deploy** > **New deployment**
2. Klik gear icon ⚙️ > Select **Web app**
3. Fill in:
   - **Description**: `License System v3.2 - Automated`
   - **Execute as**: **Me (your email)**
   - **Who has access**: **Anyone**
4. Klik **Deploy**

#### 3.2: Authorize

1. Klik **Authorize access**
2. Choose your Google account
3. Klik **Advanced** > **Go to IDME License System (unsafe)**
4. Klik **Allow**

#### 3.3: Copy Web App URL

You'll get a URL like:
```
https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXX/exec
```

**IMPORTANT:** This should be the SAME URL as before! Your existing extension will continue to work because we didn't change `doGet()`.

---

### STEP 4: Test the System

#### 4.1: Test Email Function

Run test email to verify setup:

1. In Apps Script editor, find function: `testCustomerEmail()`
2. Select it from dropdown
3. Klik **Run** (▶️)
4. Check your email (`aimansic97@gmail.com`)
5. You should receive a test email with license key

#### 4.2: Test Purchase Form

1. Open `landing-page.html` in browser
2. Klik "Beli License PRO"
3. Fill in form:
   - Name: Test User
   - Email: YOUR EMAIL (untuk test)
   - Phone: 012-3456789
   - Upload: Any JPG/PNG image
4. Submit form
5. Check results:
   - ✅ Success message appears
   - ✅ Email received (check inbox & spam)
   - ✅ License key in email
   - ✅ Google Sheet updated with new row
   - ✅ Receipt uploaded to Google Drive
   - ✅ Admin notification email received

---

## 🔍 Verification Checklist

After setup, verify:

### ✅ Google Sheet
- [ ] New row added with all data
- [ ] License key format: `IDME-XXXX-XXXX-XXXX`
- [ ] Expiry date = today + 30 days
- [ ] Status = ACTIVE
- [ ] Receipt link populated (column U)

### ✅ Customer Email
- [ ] Email received within 5 seconds
- [ ] License key displayed prominently
- [ ] Activation instructions included
- [ ] Telegram link included
- [ ] HTML formatting works

### ✅ Admin Email
- [ ] Notification received
- [ ] Customer details correct
- [ ] Receipt link clickable
- [ ] Sheet link clickable

### ✅ Google Drive
- [ ] Folder "IDME License Receipts" exists
- [ ] Receipt file uploaded
- [ ] File naming: `IDME-XXXX-XXXX-XXXX_filename.jpg`
- [ ] File accessible via link

### ✅ Extension Validation
- [ ] Existing licenses still validate
- [ ] Device tracking still works
- [ ] No errors in extension

---

## 🎨 Email Template Customization

If you want to customize email templates, edit these functions in Apps Script:

### Customer Email
Function: `sendCustomerEmail()`
- Line ~200-400 in the code
- Modify HTML or plain text as needed
- Keep license key variable: `${licenseKey}`

### Admin Email
Function: `sendAdminNotification()`
- Line ~450-550 in the code
- Modify content as needed

---

## 🔧 Configuration Options

### Change License Duration

In `CONFIG`:
```javascript
LICENSE_DURATION_DAYS: 30,  // Change to 60 for 2 months, etc
```

### Change License Price

In `CONFIG`:
```javascript
LICENSE_PRICE: 'RM10',  // Change to 'RM15', 'RM20', etc
```

### Change Max Devices

In `CONFIG`:
```javascript
MAX_DEVICES: 3,  // Change to 5, 10, etc
```

### Change Admin Email

In `CONFIG`:
```javascript
ADMIN_EMAIL: 'newemail@example.com',
```

---

## 🐛 Troubleshooting

### Issue: Email tidak sampai

**Possible Causes:**
1. Gmail quota exceeded (100 emails/day limit)
2. Email in Spam folder
3. Invalid email address

**Solution:**
- Check Apps Script logs: **Executions** tab
- Check Gmail Sent folder
- Verify email address format

### Issue: License key tak generate

**Check:**
1. Apps Script logs for errors
2. Sheet permissions (script can write?)
3. Column structure correct?

**Debug:**
```javascript
// Add to doPost function
Logger.log('License key generated: ' + licenseKey);
```

### Issue: Receipt tak upload

**Check:**
1. File size < 5MB?
2. File type JPG/PNG/PDF?
3. Google Drive quota available?

**Solution:**
- Check `doPost` logs
- Verify folder permissions
- Test with smaller file

### Issue: Form submission error

**Check:**
1. Apps Script deployed as "Anyone"?
2. Web App URL correct in landing page?
3. CORS settings?

**Debug:**
- Open browser console (F12)
- Look for network errors
- Check Apps Script executions log

---

## 📊 Monitoring & Analytics

### Daily Monitoring

Check these regularly:

1. **Apps Script Executions**
   - Extensions > Apps Script > Executions
   - Look for failed executions
   - Review error messages

2. **Google Sheet**
   - Check for duplicate license keys
   - Verify all fields populated
   - Monitor status column

3. **Google Drive**
   - Check folder size
   - Verify receipts uploading

4. **Email Logs**
   - Gmail Sent folder
   - Verify customer emails sent

### Monthly Maintenance

1. **Clean up old data**
   - Archive expired licenses
   - Remove old receipts from Drive

2. **Review performance**
   - Check average response time
   - Monitor error rate

3. **Update templates**
   - Refresh email content
   - Update pricing if changed

---

## 🔐 Security Best Practices

### DO:
✅ Keep Apps Script URL private
✅ Monitor for suspicious activity
✅ Regular backup of sheet data
✅ Verify payment before manual intervention
✅ Use reCAPTCHA if spam becomes issue

### DON'T:
❌ Share Apps Script editor access
❌ Publish sheet publicly
❌ Store sensitive data in scripts
❌ Hard-code passwords

---

## 🚀 Advanced Features (Optional)

### Auto-Renewal Reminders

Add trigger to send reminder emails 3 days before expiry:

1. Apps Script > Triggers > Add Trigger
2. Function: `checkExpiringLicenses`
3. Event source: Time-driven
4. Type: Day timer
5. Time: 9am - 10am

Code to add:
```javascript
function checkExpiringLicenses() {
  const sheet = getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const today = new Date();

  for (let i = 1; i < data.length; i++) {
    const expiryDate = new Date(data[i][4]);
    const daysLeft = Math.floor((expiryDate - today) / (1000*60*60*24));

    if (daysLeft === 3 && data[i][5] === 'ACTIVE') {
      // Send reminder email
      sendRenewalReminder(data[i][3], data[i][1], data[i][0], expiryDate);
    }
  }
}
```

### Analytics Dashboard

Track metrics:
- Total licenses sold
- Active licenses
- Expiring soon
- Revenue (total)

Create a separate "ANALYTICS" sheet with formulas.

---

## 📞 Support

If you encounter issues:

1. **Check Logs First**
   - Apps Script > Executions
   - Browser Console (F12)

2. **Review This Guide**
   - Most issues covered in Troubleshooting

3. **Test Functions Individually**
   - Use `testCustomerEmail()` function
   - Test each component separately

4. **Contact**
   - Email: aimansic97@gmail.com
   - Include: Error messages, screenshots, logs

---

## 📈 Success Metrics

After deployment, track:

- ✅ Average delivery time: < 5 seconds
- ✅ Email delivery rate: > 99%
- ✅ Error rate: < 1%
- ✅ Customer satisfaction: High (instant delivery!)

---

## 🎉 You're Done!

System is now fully automated. Customers will:

1. Submit form
2. Get license key via email **INSTANTLY**
3. Activate in extension
4. Start using PRO features

You just:
1. Verify payment (check receipt in Drive)
2. Monitor for issues
3. Provide support if needed

**Congratulations!** You've automated your entire license distribution process! 🚀

---

## 📝 Changelog

### Version 3.2.0 (Current)
- ✅ Fully automated license generation
- ✅ Instant email delivery
- ✅ Receipt upload to Drive
- ✅ Admin notifications
- ✅ Professional HTML emails
- ✅ Backward compatible with v3.1.0 validation API

### Version 3.1.0 (Previous)
- License validation API
- Device tracking
- Anti-sharing protection

---

**Made with ❤️ for CikguAimeDotCom**

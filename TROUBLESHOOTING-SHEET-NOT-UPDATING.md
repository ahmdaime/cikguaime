# 🔧 Troubleshooting: Google Sheet Tidak Update

## ❌ Masalah
Email sampai kepada customer, tapi Google Sheet `ACTIVE_LICENSES` tidak ada data masuk.

## ✅ Penyelesaian Cepat

### METHOD 1: Run Test Functions (RECOMMENDED)

Saya dah buat debugging functions untuk identify masalah. Follow steps:

#### Step 1: Check Sheet Names

1. **Open Google Sheet** anda
2. **Extensions** > **Apps Script**
3. **Copy paste** code dari `google-apps-script-debug.js` ke BAWAH existing code (jangan replace!)
4. **Save** (Ctrl+S)
5. **Select function**: `listAllSheetNames` dari dropdown
6. **Click Run** (▶️)
7. **Check logs**: View > Logs (atau Ctrl+Enter)

**Expected output:**
```
=== All Sheets in This Spreadsheet ===
1. "ACTIVE_LICENSES" - 15 rows
2. "Sheet2" - 0 rows
=== getActiveSheet() will use: ===
Selected: ACTIVE_LICENSES
```

**Jika sheet name BERBEZA**, note down the correct name!

---

#### Step 2: Test Sheet Writing

1. **Select function**: `testSheetWriting`
2. **Click Run** (▶️)
3. **Check logs**: View > Logs

**Expected output:**
```
✅ Spreadsheet accessed: Your Sheet Name
📊 Total sheets: 2
  Sheet 1: ACTIVE_LICENSES
  Sheet 2: Sheet2
✅ Active sheet found: ACTIVE_LICENSES
📍 Last row number: 15
📝 Attempting to write test row...
✅ SUCCESS! Test row written to row: 16
```

**Check your Google Sheet** - should see TEST row added!

If SUCCESS → Sheet writing works! Problem elsewhere.
If FAILED → Check error message in logs.

---

#### Step 3: Test Full Flow

1. **Select function**: `testDoPostLocally`
2. **Click Run** (▶️)
3. **Check logs** for detailed step-by-step
4. **Check sheet** for new test row

**This simulates entire purchase flow without form submission.**

---

### METHOD 2: Check Execution Logs

Real purchase attempts are logged:

1. **Apps Script** > **Executions** (clock icon)
2. Find your test purchase execution
3. Click to see detailed logs
4. Look for:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - Error messages

**Common errors:**
- `Cannot find sheet "ACTIVE_LICENSES"` → Sheet name mismatch
- `Permission denied` → Script needs authorization
- `Range exceeds grid` → Column mismatch

---

### METHOD 3: Manual Sheet Name Update

If sheet name is different, update code:

**In `google-apps-script-automated.js`**, find function `getActiveSheet()` (around line 760):

```javascript
function getActiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const possibleNames = [
    'YOUR_ACTUAL_SHEET_NAME',  // ⬅️ ADD YOUR SHEET NAME HERE
    'ACTIVE_LICENSES',
    'Active_Licenses',
    'Active Licenses',
    'Sheet1',
    'Licenses'
  ];
  // ... rest of code
}
```

**OR simply rename your sheet:**
1. Right-click sheet tab
2. Rename to: `ACTIVE_LICENSES`
3. Test again

---

## 🔍 Common Issues & Solutions

### Issue 1: Sheet Name Mismatch

**Symptoms:**
- Email works
- Sheet doesn't update
- No error in logs (or "sheet not found")

**Solution:**
- Rename sheet to `ACTIVE_LICENSES`
- OR update `possibleNames` array in code

---

### Issue 2: Column Count Mismatch

**Symptoms:**
- Error: "Range exceeds grid"
- Sheet has fewer columns than expected

**Solution:**
Check your sheet has these columns (A-V):
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
J-R: Device tracking (9 columns)
S: Total Devices
T: Alerts
U: Receipt Link
V: Purchase Timestamp
```

**Total: 22 columns**

If missing, add columns or update code to match your structure.

---

### Issue 3: Permissions Issue

**Symptoms:**
- "Permission denied" error
- Script can't access sheet

**Solution:**
1. Apps Script > Run any function
2. Click "Review Permissions"
3. Choose your account
4. Click "Advanced" > "Go to ... (unsafe)"
5. Click "Allow"

---

### Issue 4: Trigger Not Set

**Symptoms:**
- Form submission doesn't call doPost
- Web App not responding

**Solution:**
1. Ensure Web App is deployed:
   - Deploy > Manage deployments
   - Should see active deployment
2. Check URL is correct in landing page
3. Access must be: "Anyone"

---

## 🧪 Quick Test Procedure

**1-Minute Test:**

```
1. Open Apps Script
2. Paste debug code (google-apps-script-debug.js)
3. Run: listAllSheetNames
4. Run: testSheetWriting
5. Check sheet for TEST row
```

**If TEST row appears:**
✅ Sheet writing works!
❌ Problem is in doPost flow or receipt upload

**If TEST row doesn't appear:**
❌ Sheet writing broken
→ Check sheet name
→ Check permissions
→ Check column count

---

## 🚨 Emergency Fix

If nothing works, try this **simple version** that definitely writes to sheet:

**Replace doPost function** with this simplified version:

```javascript
function doPost(e) {
  Logger.log('doPost called');

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Use FIRST sheet directly

    const licenseKey = 'IDME-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Simple append - just essentials
    sheet.appendRow([
      licenseKey,
      data.fullName,
      data.phone,
      data.email,
      new Date(),
      'ACTIVE'
    ]);

    Logger.log('Row added to sheet: ' + sheet.getName());

    // Send email
    sendCustomerEmail(data, licenseKey, new Date());

    return ContentService.createTextOutput(
      JSON.stringify({ result: 'success', licenseKey: licenseKey })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

This **minimal version**:
- Uses first sheet directly (no name checking)
- Writes only 6 columns
- Simpler error handling

If this works → Problem was in the complex version
Then we can gradually add features back.

---

## 📞 Need Help?

Share these with me:

1. **Execution log** (copy entire log from Executions)
2. **Sheet name** (exact name from tab)
3. **Column count** (how many columns in your sheet?)
4. **Test results** (did testSheetWriting work?)

Then I can give specific fix!

---

## ✅ Success Checklist

Before asking for help, confirm:

- [ ] Sheet exists in spreadsheet
- [ ] Sheet name is `ACTIVE_LICENSES` (or updated in code)
- [ ] Sheet has 22 columns (A-V)
- [ ] Apps Script is authorized (permissions granted)
- [ ] Web App is deployed as "Anyone"
- [ ] Ran `testSheetWriting` - worked/failed?
- [ ] Checked Execution logs for errors
- [ ] Landing page has correct Apps Script URL

---

**Most common cause: Sheet name mismatch!**

Check your actual sheet name and either:
1. Rename sheet to `ACTIVE_LICENSES`, OR
2. Update code with your sheet name

Test with `testSheetWriting()` function to confirm!

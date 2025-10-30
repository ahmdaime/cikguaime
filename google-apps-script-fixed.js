// ===== GOOGLE APPS SCRIPT - FIXED VERSION v4.1 =====
// COPY SEMUA KOD INI KE GOOGLE APPS SCRIPT
//
// CARA DEPLOY:
// 1. Delete SEMUA kod lama
// 2. Paste SEMUA kod ini
// 3. Save (Ctrl+S)
// 4. Deploy > New deployment
// 5. Type: Web app
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. Deploy & Copy URL
//

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Get parameters
    const params = e.parameter || {};
    const action = params.action || '';
    const callback = params.callback || 'callback';

    Logger.log('=== REQUEST START ===');
    Logger.log('Action: ' + action);
    Logger.log('Callback: ' + callback);
    Logger.log('All params: ' + JSON.stringify(params));

    let result = {};

    // Route actions
    if (action === 'test') {
      result = handleTest();
    }
    else if (action === 'submit') {
      result = submitQuizResult(params);
    }
    else if (action === 'leaderboard') {
      result = getLeaderboard(params);
    }
    else {
      result = {
        success: false,
        error: 'Invalid action: ' + action,
        validActions: ['test', 'submit', 'leaderboard']
      };
    }

    Logger.log('Result: ' + JSON.stringify(result).substring(0, 200));

    // Return JSONP response with proper headers
    return createJsonpResponse(callback, result);

  } catch (error) {
    Logger.log('CRITICAL ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);

    const callback = (e.parameter && e.parameter.callback) ? e.parameter.callback : 'callback';
    const errorResponse = {
      success: false,
      error: error.toString(),
      errorType: error.name || 'Unknown',
      stack: error.stack || 'No stack trace'
    };

    return createJsonpResponse(callback, errorResponse);
  }
}

// Create JSONP response with proper content type
function createJsonpResponse(callback, data) {
  const jsonpText = callback + '(' + JSON.stringify(data) + ');';

  Logger.log('Sending JSONP: ' + jsonpText.substring(0, 150) + '...');

  // Use TEXT mime type instead of JAVASCRIPT for better compatibility
  return ContentService
    .createTextOutput(jsonpText)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Handle test action
function handleTest() {
  Logger.log('Handling test action');

  return {
    success: true,
    message: 'Connection Successful!',
    timestamp: new Date().toISOString(),
    scriptVersion: 'FIXED v4.1',
    server: 'Google Apps Script',
    status: 'ONLINE',
    testData: {
      canAccessSpreadsheet: testSpreadsheetAccess(),
      timestamp: Date.now()
    }
  };
}

// Test spreadsheet access
function testSpreadsheetAccess() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return ss ? true : false;
  } catch (e) {
    Logger.log('Spreadsheet access error: ' + e);
    return false;
  }
}

// ===== SUBMIT QUIZ RESULT =====
function submitQuizResult(params) {
  try {
    Logger.log('=== SUBMIT START ===');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Results');

    // Create sheet if doesn't exist
    if (!sheet) {
      Logger.log('Creating new Results sheet');
      sheet = ss.insertSheet('Results');

      // Create header
      const headers = [
        'Timestamp', 'Quiz ID', 'Nama', 'Negeri', 'Sekolah',
        'Skor', 'Peratus', 'Durasi (ms)', 'Durasi (formatted)',
        'Tarikh', 'Achievements', 'Tab Switches'
      ];

      sheet.appendRow(headers);

      // Format header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#667eea');
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');

      Logger.log('Sheet created successfully');
    }

    // Extract and validate data
    const timestamp = new Date();
    const nama = params.nama || 'Anonymous';
    const negeri = params.negeri || 'Tidak dinyatakan';
    const sekolah = params.sekolah || '';
    const skor = parseInt(params.skor) || 0;
    const peratus = parseInt(params.peratus) || 0;
    const durasi = parseInt(params.durasi) || 0;
    const quizId = params.quiz_id || 'UNKNOWN';
    const tarikh = params.tarikh || timestamp.toISOString();
    const achievements = params.achievements || '';
    const tabSwitches = parseInt(params.tabSwitches) || 0;

    const durasiFormatted = formatDuration(durasi);

    Logger.log('Submitting: ' + nama + ' - ' + peratus + '%');

    // Append data
    sheet.appendRow([
      timestamp, quizId, nama, negeri, sekolah,
      skor, peratus, durasi, durasiFormatted,
      tarikh, achievements, tabSwitches
    ]);

    const rowNumber = sheet.getLastRow();

    Logger.log('Data saved at row: ' + rowNumber);
    Logger.log('=== SUBMIT SUCCESS ===');

    return {
      success: true,
      message: 'Data berjaya disimpan!',
      timestamp: timestamp.toISOString(),
      rowNumber: rowNumber,
      data: {
        nama: nama,
        peratus: peratus,
        negeri: negeri,
        achievements: achievements
      }
    };

  } catch (error) {
    Logger.log('SUBMIT ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);

    return {
      success: false,
      error: error.toString(),
      errorLocation: 'submitQuizResult',
      errorType: error.name
    };
  }
}

// ===== GET LEADERBOARD =====
function getLeaderboard(params) {
  try {
    Logger.log('=== LEADERBOARD START ===');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Results');

    if (!sheet) {
      Logger.log('No Results sheet found');
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Sheet belum wujud'
      };
    }

    const quizId = params.quiz_id || '';
    const scope = params.scope || 'overall';
    const negeri = params.negeri || '';

    Logger.log('Filters - Scope: ' + scope + ', Negeri: ' + negeri + ', Quiz: ' + quizId);

    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      Logger.log('No data rows');
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Tiada data lagi'
      };
    }

    // Get headers and find column indices
    const headers = data[0];
    const rows = data.slice(1);

    const colMap = {
      quizId: headers.indexOf('Quiz ID'),
      nama: headers.indexOf('Nama'),
      negeri: headers.indexOf('Negeri'),
      sekolah: headers.indexOf('Sekolah'),
      skor: headers.indexOf('Skor'),
      peratus: headers.indexOf('Peratus'),
      durasi: headers.indexOf('Durasi (ms)'),
      timestamp: headers.indexOf('Timestamp'),
      achievements: headers.indexOf('Achievements')
    };

    Logger.log('Total rows: ' + rows.length);
    Logger.log('Column map: ' + JSON.stringify(colMap));

    // Filter rows
    const filtered = rows.filter(function(row) {
      // Filter by quiz ID
      if (quizId && colMap.quizId >= 0 && row[colMap.quizId] !== quizId) {
        return false;
      }

      // Filter by negeri
      if (negeri && colMap.negeri >= 0 && row[colMap.negeri] !== negeri) {
        return false;
      }

      // Filter by time scope
      if (scope !== 'overall' && colMap.timestamp >= 0) {
        const rowDate = new Date(row[colMap.timestamp]);
        const now = new Date();

        if (scope === 'today') {
          if (rowDate.toDateString() !== now.toDateString()) return false;
        } else if (scope === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (rowDate < weekAgo) return false;
        } else if (scope === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (rowDate < monthAgo) return false;
        }
      }

      return true;
    });

    Logger.log('Filtered rows: ' + filtered.length);

    // Convert to objects
    const results = filtered.map(function(row) {
      return {
        nama: row[colMap.nama] || '',
        negeri: row[colMap.negeri] || '',
        sekolah: row[colMap.sekolah] || '',
        skor: row[colMap.skor] || 0,
        peratus: row[colMap.peratus] || 0,
        durasi: row[colMap.durasi] || 0,
        achievements: row[colMap.achievements] || ''
      };
    });

    // Sort by percentage (desc), then by duration (asc)
    results.sort(function(a, b) {
      if (b.peratus !== a.peratus) {
        return b.peratus - a.peratus;
      }
      return a.durasi - b.durasi;
    });

    // Limit to top 100
    const limited = results.slice(0, 100);

    Logger.log('Final results count: ' + limited.length);
    Logger.log('=== LEADERBOARD SUCCESS ===');

    return {
      success: true,
      data: limited,
      count: limited.length,
      scope: scope,
      negeri: negeri || 'all',
      quizId: quizId || 'all',
      message: 'Data loaded successfully'
    };

  } catch (error) {
    Logger.log('LEADERBOARD ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);

    return {
      success: false,
      error: error.toString(),
      errorLocation: 'getLeaderboard',
      errorType: error.name,
      data: []
    };
  }
}

// ===== HELPER FUNCTIONS =====
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes + 'm ' + remainingSeconds + 's';
}

// ===== TEST FUNCTION =====
function testSetup() {
  Logger.log('========================================');
  Logger.log('=== TESTING SETUP v4.1 ===');
  Logger.log('========================================');

  // Test 1: Spreadsheet access
  Logger.log('\n--- Test 1: Spreadsheet Access ---');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('✓ Spreadsheet: ' + ss.getName());
    Logger.log('✓ ID: ' + ss.getId());
    Logger.log('✓ URL: ' + ss.getUrl());
  } catch (e) {
    Logger.log('✗ Spreadsheet ERROR: ' + e);
    return;
  }

  // Test 2: Test action
  Logger.log('\n--- Test 2: Test Action ---');
  const testResult = handleTest();
  Logger.log('Test result: ' + JSON.stringify(testResult, null, 2));

  // Test 3: Submit data
  Logger.log('\n--- Test 3: Data Submission ---');
  const testParams = {
    action: 'submit',
    quiz_id: 'TEST_QUIZ_' + Date.now(),
    nama: 'Test User ' + Date.now(),
    negeri: 'Selangor',
    sekolah: 'Test School',
    skor: 10,
    peratus: 100,
    durasi: 180000,
    tarikh: new Date().toISOString(),
    achievements: 'Perfect Score! 🎯, Speed Demon ⚡',
    tabSwitches: 0
  };

  const submitResult = submitQuizResult(testParams);
  Logger.log('Submit result: ' + JSON.stringify(submitResult, null, 2));

  if (submitResult.success) {
    Logger.log('✓ Submission SUCCESSFUL');
  } else {
    Logger.log('✗ Submission FAILED: ' + submitResult.error);
  }

  // Test 4: Leaderboard
  Logger.log('\n--- Test 4: Leaderboard Retrieval ---');
  const lbParams = {
    action: 'leaderboard',
    scope: 'overall'
  };

  const lbResult = getLeaderboard(lbParams);
  Logger.log('Leaderboard count: ' + lbResult.count);

  if (lbResult.success) {
    Logger.log('✓ Leaderboard SUCCESSFUL');
    if (lbResult.count > 0) {
      Logger.log('Sample entry: ' + JSON.stringify(lbResult.data[0], null, 2));
    }
  } else {
    Logger.log('✗ Leaderboard FAILED: ' + lbResult.error);
  }

  Logger.log('\n========================================');
  Logger.log('=== ALL TESTS COMPLETE ===');
  Logger.log('✓ Check "Results" sheet in spreadsheet');
  Logger.log('✓ Ready for deployment');
  Logger.log('========================================');
}

// ===== CLEANUP TEST DATA =====
function cleanTestData() {
  Logger.log('=== CLEANING TEST DATA ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Results');

  if (!sheet) {
    Logger.log('No Results sheet found');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const quizIdCol = headers.indexOf('Quiz ID');

  if (quizIdCol < 0) {
    Logger.log('Quiz ID column not found');
    return;
  }

  let deletedCount = 0;

  // Delete from bottom to top
  for (let i = data.length - 1; i > 0; i--) {
    const quizId = data[i][quizIdCol];
    if (quizId && quizId.toString().indexOf('TEST_QUIZ') >= 0) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  Logger.log('✓ Cleaned ' + deletedCount + ' test entries');
  Logger.log('=== CLEANUP COMPLETE ===');
}

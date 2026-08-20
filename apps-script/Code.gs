function doGet(e) {
  return doPost(e);
}

function doPost(e) {
  e = e || {};
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Applications');
  if (!sheet) {
    return json_({ ok: false, error: 'Missing Applications sheet.' });
  }

  let body;
  // Handle both POST (JSON body) and GET (query parameter)
  if (e.parameter && e.parameter.body) {
    try {
      body = JSON.parse(e.parameter.body);
    } catch (error) {
      return json_({ ok: false, error: 'Invalid JSON body.' });
    }
  } else if (e.postData) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (error) {
      return json_({ ok: false, error: 'Invalid JSON body.' });
    }
  } else {
    return json_({ ok: false, error: 'Missing request body.' });
  }

  const expectedKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (expectedKey && body.apiKey !== expectedKey) {
    return json_({ ok: false, error: 'Unauthorized.' });
  }

  const action = body.action;
  if (action === 'list') return json_({ ok: true, data: readRows_(sheet) });
  if (action === 'create') return json_({ ok: true, data: upsert_(sheet, body.payload, true) });
  if (action === 'update') return json_({ ok: true, data: upsert_(sheet, body.payload, false) });
  if (action === 'updateStatus') {
    const rows = readRows_(sheet);
    const current = rows.find(function (row) { return row.id === body.payload.id; });
    if (!current) return json_({ ok: false, error: 'Row not found.' });
    current.status = body.payload.status;
    current.updatedAt = new Date().toISOString();
    return json_({ ok: true, data: upsert_(sheet, current, false) });
  }
  if (action === 'delete') {
    delete_(sheet, body.payload.id);
    return json_({ ok: true, data: { id: body.payload.id } });
  }

  return json_({ ok: false, error: 'Unknown action.' });
}

function headers_() {
  return [
    'id', 'company', 'role', 'location', 'status', 'appliedDate', 'salaryMin',
    'salaryMax', 'salaryCurrency', 'jobUrl', 'recruiterName', 'recruiterEmail',
    'interviewDate', 'notes', 'jobDescription', 'createdAt', 'updatedAt'
  ];
}

function normalizeDate_(dateStr) {
  if (!dateStr || dateStr === '') return '';
  // Handle "20/8/2026" or "20/08/2026" format
  var parts = dateStr.toString().split('/');
  if (parts.length === 3) {
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    // Pad month and day with zeros
    if (month.length === 1) month = '0' + month;
    if (day.length === 1) day = '0' + day;
    return year + '-' + month + '-' + day;
  }
  return dateStr;
}

function normalizeStatus_(status) {
  if (!status) return 'applied';
  return status.toString().toLowerCase();
}

function normalizeId_(id) {
  if (!id) return '';
  return id.toString();
}

function readRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const head = values[0];
  return values.slice(1).map(function (row) {
    const record = {};
    head.forEach(function (key, index) {
      record[key] = row[index];
    });
    if (record.salaryMin === '') record.salaryMin = null;
    if (record.salaryMax === '') record.salaryMax = null;
    // Normalize status, dates, and ID
    record.id = normalizeId_(record.id);
    record.status = normalizeStatus_(record.status);
    record.appliedDate = normalizeDate_(record.appliedDate);
    record.interviewDate = record.interviewDate ? record.interviewDate.toString() : '';
    return record;
  }).filter(function (record) { return record.id; });
}

function upsert_(sheet, payload, isCreate) {
  const head = headers_();
  if (sheet.getLastRow() === 0) sheet.appendRow(head);

  const data = sheet.getDataRange().getValues();
  const idIndex = 0;
  let rowNumber = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(payload.id)) {
      rowNumber = i + 1;
      break;
    }
  }

  const line = head.map(function (key) {
    const value = payload[key];
    return value == null ? '' : value;
  });

  if (rowNumber > 0) {
    sheet.getRange(rowNumber, 1, 1, head.length).setValues([line]);
  } else {
    sheet.appendRow(line);
  }
  return payload;
}

function delete_(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function json_(payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doOptions(e) {
  const output = ContentService.createTextOutput('');
  return output;
}

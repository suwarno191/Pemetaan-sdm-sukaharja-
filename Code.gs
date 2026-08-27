/**
 * DATABASE PUSAT - PEMETAAN SDM DESA SUKAHARJA
 * GitHub Pages = aplikasi/tampilan.
 * Google Form = pintu input warga.
 * Apps Script = jembatan database ke Dashboard Admin.
 */
const FORM_ID = '1FAIpQLSdCFIp7NKfwYe2pI7dg6XCueClrJbtWboXf2266PC0C25EZ9Q';
const SHEET_WARGA = 'Warga';
const SHEET_PENCAKER = 'PencariKerja';

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_WARGA);
  ensureSheet_(ss, SHEET_PENCAKER);
  return json_({ok:true,message:'Database siap'});
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'get').toLowerCase();
    if (action !== 'get') return json_({ok:false,error:'Action tidak dikenal'});

    const formRows = readFormResponses_();
    const sheetRows = readSheet_(ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), SHEET_WARGA));

    // Gabungkan data Form warga + data yang dikelola Admin.
    // Jika NIK sama, data Admin menjadi versi terbaru.
    const byNik = new Map();
    const withoutNik = [];
    formRows.forEach(x => {
      const k = String(x.nik || '').trim();
      if (k) byNik.set(k, x); else withoutNik.push(x);
    });
    sheetRows.forEach(x => {
      const k = String(x.nik || '').trim();
      if (k) byNik.set(k, Object.assign({}, byNik.get(k) || {}, x));
      else if (x.nama || x.nik) withoutNik.push(x);
    });

    const warga = Array.from(byNik.values()).concat(withoutNik);
    return json_({ok:true,warga:warga,count:warga.length,source:'Google Form + Admin'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw || '{}');
    const action = String(data.action || '').toLowerCase();
    if (action !== 'replace') return json_({ok:false,error:'Action tidak dikenal'});

    const warga = Array.isArray(data.warga) ? data.warga : [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    writeSheet_(ensureSheet_(ss, SHEET_WARGA), warga);
    writeSheet_(ensureSheet_(ss, SHEET_PENCAKER), warga.filter(x => String(x.status || '').toLowerCase() === 'belum bekerja'));
    return json_({ok:true,count:warga.length});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function readFormResponses_() {
  const form = FormApp.openById(FORM_ID);
  return form.getResponses().map((resp, i) => {
    const raw = {};
    resp.getItemResponses().forEach(ir => {
      const title = String(ir.getItem().getTitle() || '').trim().toLowerCase();
      const answer = ir.getResponse();
      raw[title] = Array.isArray(answer) ? answer.join(', ') : String(answer == null ? '' : answer);
    });
    const pick = (...names) => {
      for (const name of names) {
        const key = Object.keys(raw).find(k => k === name || k.includes(name));
        if (key) return raw[key];
      }
      return '';
    };
    return {
      _sid: 'form-' + (i + 1),
      nama: pick('nama lengkap','nama'),
      nik: pick('nik'),
      jk: pick('jenis kelamin'),
      umur: pick('umur'),
      alamat: pick('dusun / alamat','dusun/alamat','alamat','dusun'),
      dusun: pick('dusun'),
      pendidikan: pick('pendidikan'),
      keahlian: pick('keahlian'),
      pengalaman: pick('pengalaman kerja','pengalaman'),
      status: pick('status pekerjaan','status'),
      pekerjaan: pick('pekerjaan / posisi saat ini','pekerjaan saat ini','pekerjaan'),
      dicari: pick('pekerjaan yang dicari'),
      wa: pick('nomor whatsapp','nomor wa','whatsapp'),
      catatan: pick('catatan'),
      submitted_at: resp.getTimestamp().toISOString()
    };
  }).filter(x => x.nama || x.nik);
}

function ensureSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function readSheet_(sh) {
  const values = sh.getDataRange().getValues();
  if (!values.length || (values.length === 1 && !values[0].some(String))) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(v => String(v) !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = row[i] === undefined ? '' : row[i]; });
    return obj;
  });
}

function writeSheet_(sh, rows) {
  sh.clearContents();
  if (!rows.length) return;
  const preferred = ['_sid','nama','nik','jk','umur','alamat','dusun','pendidikan','keahlian','pengalaman','status','pekerjaan','dicari','wa','catatan','createdAt','updatedAt','submitted_at'];
  const keys = [];
  preferred.forEach(k => { if (rows.some(r => Object.prototype.hasOwnProperty.call(r, k))) keys.push(k); });
  rows.forEach(r => Object.keys(r || {}).forEach(k => { if (k && !keys.includes(k)) keys.push(k); }));
  sh.getRange(1,1,1,keys.length).setValues([keys]);
  const matrix = rows.map(r => keys.map(k => {
    const v = r[k];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  }));
  sh.getRange(2,1,matrix.length,keys.length).setValues(matrix);
  sh.setFrozenRows(1);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

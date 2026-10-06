import * as XLSX from 'xlsx';

/**
 * Triggers a browser download for a blob
 */
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export to JSON file
 */
export function exportToJSON(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, `${filename}.json`, 'application/json;charset=utf-8;');
}

/**
 * Export to CSV file with UTF-8 BOM for Hebrew Excel support
 */
export function exportToCSV(dataArray, filename) {
  if (!dataArray || !dataArray.length) return;
  const worksheet = XLSX.utils.json_to_sheet(dataArray);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const bom = '\uFEFF';
  downloadFile(bom + csvOutput, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports the Reading Archive independently to an Excel workbook
 */
export function exportArchiveToExcel(archiveBooks, filename = 'reading_archive_verified') {
  const workbook = XLSX.utils.book_new();

  const rows = (archiveBooks || []).map(b => ({
    'מזהה': b.book_id,
    'שנת קריאה': b.year_read,
    'שם הספר (קנוני)': b.canonical_title,
    'שם באנגלית': b.english_title || '',
    'מחבר': b.author_hebrew,
    'מחבר במקור': b.author_original || '',
    'מתרגם': b.translator || '',
    'הוצאה לאור': b.publisher,
    'שנת כתיבה מקורית': b.original_pub_year || '',
    'שנת מהדורה עברית': b.hebrew_edition_year || '',
    'מספר עמודים': b.page_count || '',
    'סוגה': b.type,
    'ז\'אנרים': (b.genres || []).join(', '),
    'תמות ונושאים': (b.themes || []).join(', '),
    'סדרה': b.is_series ? `${b.series_name || ''} (כרך ${b.volume_number || ''})` : 'בודד',
    'שפת מקור': b.orig_language,
    'פורמט': b.format,
    'הערות אישיות': b.notes || '',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'ארכיון ספרים שנקראו');

  // Summary Sheet
  const totalPages = archiveBooks.reduce((acc, b) => acc + (b.page_count || 0), 0);
  const summaryRows = [
    { 'מדד': 'סך ספרים וכרכים מתועדים', 'ערך': archiveBooks.length },
    { 'מדד': 'סך עמודים מתועדים', 'ערך': totalPages },
    { 'מדד': 'ממוצע עמודים לכרך', 'ערך': Math.round(totalPages / archiveBooks.length) },
    { 'מדד': 'תאריך ייצוא', 'ערך': new Date().toLocaleDateString('he-IL') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'מדדים ביבליוגרפיים');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Exports the Wishlist Catalog independently to an Excel workbook
 */
export function exportCatalogToExcel(catalogBooks, lists, filename = 'wishlist_catalog_simania') {
  const workbook = XLSX.utils.book_new();

  const rows = (catalogBooks || []).map(b => ({
    'קוד סימניה': b.itemId,
    'שם הספר': b.title,
    'מחבר': b.author,
    'ציון קהילה': b.communityRating || '',
    'מספר מדרגים': b.ratingCount || 0,
    'שנת הוצאה': b.parsedYear || b.year || '',
    'עמודים': b.parsedPages || b.pages || '',
    'רשימות משויכות': (b.lists || []).join('; '),
    'ז\'אנרים': (b.genres || []).join(', '),
    'הוצאות לאור': (b.publishers || []).join(', '),
    'הערה אישית מסימניה': b.personalNote || '',
    'קישור לסימניה': b.bookUrl || '',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'קטלוג רשימות סימניה');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

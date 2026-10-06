#!/usr/bin/env python3
"""
Simania Reading Lists Scraper
Extracts all 40 reading lists from user 264813 on Simania (https://simania.co.il)
Saves the data into:
  1. simania_reading_lists.xlsx (Single Excel file with separate tab for each of the 40 lists + Overview + Master list)
  2. simania_lists_csv/ (Folder containing individual CSV files for each list)
  3. simania_reading_lists.json (Structured JSON dump for dashboards)
"""

import urllib.request
import ssl
import json
import re
import os
import csv
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor

USER_ID = 264813
BASE_URL = "https://simania.co.il"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# SSL context that works reliably across environments
SSL_CTX = ssl._create_unverified_context()

def get_request(url, is_json=False):
    headers = {'User-Agent': USER_AGENT}
    if is_json:
        headers['Accept'] = 'application/json'
    return urllib.request.Request(url, headers=headers)

def fetch_user_lists(user_id):
    """
    Fetches all reading lists created by the user using Simania's user lists API.
    Handles pagination automatically so no lists are missed.
    """
    print(f"[*] Fetching reading lists for user {user_id}...")
    lists = []
    offset = 0
    limit = 50
    
    while True:
        url = f"{BASE_URL}/api/user/{user_id}/lists?offset={offset}&limit={limit}"
        req = get_request(url, is_json=True)
        try:
            with urllib.request.urlopen(req, context=SSL_CTX) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                batch = data.get('lists', [])
                lists.extend(batch)
                pagination = data.get('pagination', {})
                has_more = pagination.get('hasMore', False)
                if not has_more or len(batch) == 0:
                    break
                offset += len(batch)
                time.sleep(0.05)
        except Exception as e:
            print(f"    [!] Error fetching user lists offset {offset}: {e}")
            break
            
    # Normalize list items count key
    for l in lists:
        if 'itemCount' not in l and 'totalBooks' in l:
            l['itemCount'] = l['totalBooks']
            
    print(f"[+] Total reading lists discovered: {len(lists)}")
    return lists

def fetch_list_items(list_id, list_name, expected_count):
    """
    Fetches all books in a list using Simania's pagination API.
    Handles pagination automatically with limit=50.
    """
    print(f"[*] Fetching list '{list_name}' (ID: {list_id}, Expected: {expected_count} books)...")
    items = []
    offset = 0
    limit = 50
    
    while True:
        url = f"{BASE_URL}/api/lists/{list_id}/items?limit={limit}&offset={offset}"
        req = get_request(url, is_json=True)
        try:
            with urllib.request.urlopen(req, context=SSL_CTX) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                batch = data.get('items', [])
                items.extend(batch)
                pagination = data.get('pagination', {})
                has_more = pagination.get('hasMore', False)
                if not has_more or len(batch) == 0:
                    break
                offset += len(batch)
                time.sleep(0.05)
        except Exception as e:
            print(f"    [!] Error fetching offset {offset} for list {list_id}: {e}")
            break
            
    print(f"    [+] Retrieved {len(items)} / {expected_count} books.")
    return items

def fetch_book_metadata(book_id):
    """
    Fetches community rating, rating count, release year, and page count for a book.
    """
    url = f"{BASE_URL}/bookdetails.php?item_id={book_id}"
    req = get_request(url)
    metadata = {
        'rating': None,
        'rating_count': 0,
        'year': '',
        'pages': ''
    }
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            m_val = re.search(r'<meta name="rating:value" content="([\d\.]+)"', html)
            m_cnt = re.search(r'<meta name="rating:count" content="(\d+)"', html)
            m_year = re.search(r'<meta name="book:release_date" content="([^"]+)"', html)
            m_tag = re.search(r'<meta name="book:tag" content="([^"]+)"', html)
            
            if m_val:
                metadata['rating'] = round(float(m_val.group(1)), 2)
            if m_cnt:
                metadata['rating_count'] = int(m_cnt.group(1))
            if m_year:
                metadata['year'] = m_year.group(1).strip()
            if m_tag:
                metadata['pages'] = m_tag.group(1).strip()
    except Exception:
        pass
    return book_id, metadata

def get_clean_tab_name(name):
    """
    Converts list name into a clean, concise Excel sheet name (max 31 chars).
    Strips repetitive prefixes while keeping the list topic clear.
    """
    short = re.sub(r'^ספרים\s+שאני\s+רוצ[הא]\s+לקרוא\s*[-–—]?\s*', '', name).strip()
    if not short:
        short = "רוצה לקרוא (כללי)"
    clean = re.sub(r'[\:\\/\?\*\[\]]', ' ', short)[:31].strip()
    return clean

def create_excel_file(sheets_data, filepath):
    """
    Generates a high-compatibility native .xlsx file in pure Python.
    Includes right-to-left (RTL) mode for seamless Hebrew display.
    """
    z = zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED)
    
    # 1. [Content_Types].xml
    content_types = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    ]
    for i in range(1, len(sheets_data) + 1):
        content_types.append(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    content_types.append('</Types>')
    z.writestr('[Content_Types].xml', ''.join(content_types))
    
    # 2. _rels/.rels
    rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '</Relationships>'
    )
    z.writestr('_rels/.rels', rels)
    
    # 3. xl/_rels/workbook.xml.rels
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    ]
    for i in range(1, len(sheets_data) + 1):
        wb_rels.append(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>')
    wb_rels.append('</Relationships>')
    z.writestr('xl/_rels/workbook.xml.rels', ''.join(wb_rels))
    
    # 4. xl/workbook.xml
    wb = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>'
    ]
    used_names = set()
    for i, name in enumerate(sheets_data.keys(), 1):
        clean_name = re.sub(r'[\:\\/\?\*\[\]]', ' ', name)[:31].strip()
        if not clean_name:
            clean_name = f"Sheet{i}"
        orig = clean_name
        counter = 1
        while clean_name in used_names:
            suffix = f"_{counter}"
            clean_name = orig[:31-len(suffix)] + suffix
            counter += 1
        used_names.add(clean_name)
        wb.append(f'<sheet name="{clean_name}" sheetId="{i}" r:id="rId{i}"/>')
    wb.append('</sheets></workbook>')
    z.writestr('xl/workbook.xml', ''.join(wb))
    
    # 5. Worksheets
    for i, (name, rows) in enumerate(sheets_data.items(), 1):
        ws = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
            '<sheetViews><sheetView tabSelected="0" workbookViewId="0" rightToLeft="1"/></sheetViews>',
            '<sheetData>'
        ]
        for r_idx, row in enumerate(rows, 1):
            ws.append(f'<row r="{r_idx}">')
            for c_idx, val in enumerate(row, 1):
                col_letter = chr(64 + c_idx) if c_idx <= 26 else f"{chr(64 + (c_idx-1)//26)}{chr(65 + (c_idx-1)%26)}"
                cell_ref = f"{col_letter}{r_idx}"
                if val is None or val == "":
                    continue
                # Handle numeric vs string
                if isinstance(val, (int, float)):
                    ws.append(f'<c r="{cell_ref}"><v>{val}</v></c>')
                else:
                    val_str = str(val).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
                    ws.append(f'<c r="{cell_ref}" t="inlineStr"><is><t>{val_str}</t></is></c>')
            ws.append('</row>')
        ws.append('</sheetData></worksheet>')
        z.writestr(f'xl/worksheets/sheet{i}.xml', ''.join(ws))
        
    z.close()
    print(f"[+] Saved Excel workbook to: {filepath}")

def main():
    print("=" * 60)
    print("      SIMANIA READING LISTS SCRAPER & DATA EXPORTER       ")
    print("=" * 60)
    
    # 1. Fetch user's reading lists (all 40 lists)
    lists_meta = fetch_user_lists(USER_ID)
    
    # 2. Fetch items for all lists
    all_lists_data = []
    unique_book_ids = set()
    
    for lst in lists_meta:
        list_id = lst['listId']
        list_name = lst['listName']
        item_count = lst['itemCount']
        
        items = fetch_list_items(list_id, list_name, item_count)
        all_lists_data.append({
            'meta': lst,
            'items': items
        })
        for it in items:
            unique_book_ids.add(it['itemId'])
            
    print(f"\n[+] Total unique books across all lists: {len(unique_book_ids)}")
    
    # 3. Fetch book details (community rating, rating count, year, pages)
    print(f"[*] Fetching metadata (ratings, year, pages) for {len(unique_book_ids)} unique books...")
    book_metadata_cache = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        for bid, meta in executor.map(fetch_book_metadata, unique_book_ids):
            book_metadata_cache[bid] = meta
            
    print("[+] Finished fetching book metadata.")
    
    # 4. Prepare data structures for export
    csv_dir = "simania_lists_csv"
    os.makedirs(csv_dir, exist_ok=True)
    
    excel_sheets = {}
    json_export = {
        'userId': USER_ID,
        'extractedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'totalLists': len(lists_meta),
        'totalBooksCumulative': sum(len(l['items']) for l in all_lists_data),
        'uniqueBooks': len(unique_book_ids),
        'lists': []
    }
    
    # Overview sheet rows
    overview_headers = ["מספר רשימה", "מזהה רשימה", "שם הרשימה", "מספר ספרים", "צפיות", "תאריך יצירה", "תאריך עדכון", "ספרים עם הערות"]
    overview_rows = [overview_headers]
    
    # Master books mapping
    book_to_lists = {}
    book_details_map = {}
    
    headers = [
        "מזהה ספר (Book ID)",
        "שם הספר (Title)",
        "שם הסופר (Author)",
        "דירוג אישי (Personal Rating)",
        "הערה אישית (Personal Note)",
        "דירוג סימניה (Community Rating)",
        "כמות מדרגים (Rating Count)",
        "שנת הוצאה (Year)",
        "עמודים (Pages)",
        "תאריך הוספה לרשימה (Added Date)",
        "קישור לספר (Book URL)",
        "תמונת כריכה (Cover Image URL)"
    ]
    
    used_tabs = set()
    for idx, list_obj in enumerate(all_lists_data, 1):
        meta = list_obj['meta']
        items = list_obj['items']
        list_name = meta['listName']
        list_id = meta['listId']
        
        notes_count = sum(1 for it in items if it.get('listItemText'))
        overview_rows.append([
            idx,
            list_id,
            list_name,
            len(items),
            meta.get('views', 0),
            meta.get('created', '').replace('$D', '').replace('T', ' ')[:19],
            meta.get('updated', '').replace('$D', '').replace('T', ' ')[:19],
            notes_count
        ])
        
        sheet_rows = [headers]
        csv_rows = []
        
        list_json_items = []
        for it in items:
            bid = it['itemId']
            bmeta = book_metadata_cache.get(bid, {})
            title = it.get('title', '').strip()
            author = it.get('author', '').strip()
            note = it.get('listItemText', '').strip()
            personal_rating = "" # Yahav has not rated books on Simania yet
            rating = bmeta.get('rating', '')
            rating_count = bmeta.get('rating_count', '')
            year = bmeta.get('year', '')
            pages = bmeta.get('pages', '')
            added_at = it.get('addedAt', '').replace('$D', '').replace('T', ' ')[:19]
            book_url = f"{BASE_URL}/bookdetails.php?item_id={bid}"
            img_url = it.get('imageUrl', '')
            
            row = [
                bid,
                title,
                author,
                personal_rating,
                note,
                rating if rating is not None else "",
                rating_count if rating_count else "",
                year,
                pages,
                added_at,
                book_url,
                img_url
            ]
            sheet_rows.append(row)
            csv_rows.append(row)
            
            if bid not in book_to_lists:
                book_to_lists[bid] = []
                book_details_map[bid] = {
                    'itemId': bid,
                    'title': title,
                    'author': author,
                    'personal_rating': personal_rating,
                    'rating': rating,
                    'rating_count': rating_count,
                    'year': year,
                    'pages': pages,
                    'book_url': book_url,
                    'imageUrl': img_url
                }
            book_to_lists[bid].append(list_name)
            
            list_json_items.append({
                'itemId': bid,
                'title': title,
                'author': author,
                'personalRating': personal_rating or None,
                'personalNote': note or None,
                'communityRating': rating or None,
                'ratingCount': rating_count or 0,
                'year': year or None,
                'pages': pages or None,
                'addedAt': added_at,
                'bookUrl': book_url,
                'imageUrl': img_url
            })
            
        json_export['lists'].append({
            'listId': list_id,
            'listName': list_name,
            'itemCount': len(items),
            'views': meta.get('views', 0),
            'items': list_json_items
        })
        
        # Determine concise unique tab name for Excel
        tab_name = get_clean_tab_name(list_name)
        counter = 1
        orig_tab = tab_name
        while tab_name in used_tabs:
            suffix = f"_{counter}"
            tab_name = orig_tab[:31-len(suffix)] + suffix
            counter += 1
        used_tabs.add(tab_name)
        excel_sheets[tab_name] = sheet_rows
        
        # Save individual CSV (with UTF-8 BOM so Excel opens Hebrew properly)
        safe_filename = re.sub(r'[\\/*?:"<>|]', '_', list_name) + ".csv"
        csv_path = os.path.join(csv_dir, safe_filename)
        with open(csv_path, 'w', encoding='utf-8-sig', newline='') as cf:
            writer = csv.writer(cf)
            writer.writerow(headers)
            writer.writerows(csv_rows)
            
    # Add Master tab (All unique books with lists joined)
    master_headers = [
        "מזהה ספר (Book ID)",
        "שם הספר (Title)",
        "שם הסופר (Author)",
        "רשימות בהן מופיע (Lists)",
        "מספר רשימות (List Count)",
        "דירוג אישי (Personal Rating)",
        "דירוג סימניה (Community Rating)",
        "כמות מדרגים (Rating Count)",
        "שנת הוצאה (Year)",
        "עמודים (Pages)",
        "קישור לספר (Book URL)",
        "תמונת כריכה (Cover Image URL)"
    ]
    master_rows = [master_headers]
    for bid, lists_contained in sorted(book_to_lists.items(), key=lambda x: book_details_map[x[0]]['title']):
        binfo = book_details_map[bid]
        master_rows.append([
            bid,
            binfo['title'],
            binfo['author'],
            ", ".join(lists_contained),
            len(lists_contained),
            binfo['personal_rating'],
            binfo['rating'] if binfo['rating'] is not None else "",
            binfo['rating_count'] if binfo['rating_count'] else "",
            binfo['year'],
            binfo['pages'],
            binfo['book_url'],
            binfo['imageUrl']
        ])
        
    master_csv_path = os.path.join(csv_dir, "_כל_הספרים_מאסטר.csv")
    with open(master_csv_path, 'w', encoding='utf-8-sig', newline='') as cf:
        writer = csv.writer(cf)
        writer.writerows(master_rows)
        
    # Reassemble excel sheets with Overview first, Master second, then all 40 lists
    final_excel_sheets = {
        "סיכום רשימות (Overview)": overview_rows,
        "כל הספרים (Master)": master_rows
    }
    final_excel_sheets.update(excel_sheets)
    
    excel_path = "simania_reading_lists.xlsx"
    create_excel_file(final_excel_sheets, excel_path)
    
    # Save JSON file
    json_path = "simania_reading_lists.json"
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(json_export, jf, ensure_ascii=False, indent=2)
    print(f"[+] Saved JSON dump to: {json_path}")
    
    print("\n" + "=" * 60)
    print("                     SCRAPING COMPLETE!                    ")
    print("=" * 60)
    print(f"Lists extracted: {len(all_lists_data)}")
    print(f"Total entries: {sum(len(l['items']) for l in all_lists_data)}")
    print(f"Unique books: {len(unique_book_ids)}")
    print(f"Excel workbook: {excel_path}")
    print(f"CSV folder: {csv_dir}/ ({len(all_lists_data) + 1} CSV files)")
    print(f"JSON dump: {json_path}")

if __name__ == '__main__':
    main()

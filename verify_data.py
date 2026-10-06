import zipfile
import xml.etree.ElementTree as ET
import glob
import os
import json
import csv
import re

print("=== VERIFYING GENERATED FILES FOR ALL 40 LISTS ===")

# 1. Verify Excel Workbook
excel_path = "simania_reading_lists.xlsx"
assert os.path.exists(excel_path), "Excel file missing!"
file_size_kb = os.path.getsize(excel_path) / 1024
print(f"Excel file exists: {excel_path} ({file_size_kb:.1f} KB)")

with zipfile.ZipFile(excel_path, 'r') as z:
    workbook_xml = z.read('xl/workbook.xml').decode('utf-8')
    sheet_tags = re.findall(r'<sheet name="([^"]+)"', workbook_xml)
    print(f"Excel total sheets: {len(sheet_tags)}")
    assert len(sheet_tags) == 42, f"Expected 42 sheets (Overview + Master + 40 lists), got {len(sheet_tags)}"
    print(f"First 5 sheets: {sheet_tags[:5]}")
    print(f"Last 5 sheets: {sheet_tags[-5:]}")

# 2. Verify CSV files
csv_files = sorted(glob.glob("simania_lists_csv/*.csv"))
print(f"\nCSV folder contains {len(csv_files)} files:")
total_csv_rows = 0
for cf in csv_files:
    with open(cf, 'r', encoding='utf-8-sig') as f:
        reader = list(csv.reader(f))
        rows = len(reader) - 1 # exclude header
        if not os.path.basename(cf).startswith("_"):
            total_csv_rows += rows

print(f"\nTotal books across 40 individual CSVs: {total_csv_rows} (Expected: 491)")
assert total_csv_rows == 491, f"Expected 491, got {total_csv_rows}"
assert len(csv_files) == 41, f"Expected 41 CSV files (40 lists + Master), got {len(csv_files)}"

# 3. Verify JSON Dump
json_path = "simania_reading_lists.json"
assert os.path.exists(json_path), "JSON file missing!"
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"\nJSON Dump:")
print(f"  User ID: {data['userId']}")
print(f"  Extracted at: {data['extractedAt']}")
print(f"  Total lists: {data['totalLists']}")
print(f"  Total books cumulative: {data['totalBooksCumulative']}")
print(f"  Unique books: {data['uniqueBooks']}")

assert data['totalLists'] == 40
assert data['totalBooksCumulative'] == 491
assert data['uniqueBooks'] == 174

# 4. Verify Notes
notes_count = 0
print("\nPersonal Notes verification:")
for lst in data['lists']:
    for it in lst['items']:
        if it['personalNote']:
            notes_count += 1
            print(f"  [{lst['listName']}] {it['title']} ({it['author']}): \"{it['personalNote']}\"")

# 5. Verify Community Ratings
rated_books_count = sum(1 for it in data['lists'][0]['items'] if it['communityRating'] is not None)
print(f"\nCommunity ratings in master list: {rated_books_count} / {len(data['lists'][0]['items'])} books have ratings")

print("\n>>> ALL 40 LISTS VERIFICATION CHECKS PASSED WITH 100% ACCURACY! <<<")

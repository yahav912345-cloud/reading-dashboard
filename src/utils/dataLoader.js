import rawReadData from '../data/books_read.json';
import rawToReadData from '../data/simania_reading_lists.json';

const STORAGE_KEY_ARCHIVE = 'readinghub_archive_books_v2';
const STORAGE_KEY_CATALOG = 'readinghub_wishlist_catalog_v2';

export const GENRE_NAMES = new Set(['סיפורת', 'עיון', 'השקעות', 'מד״ב', 'קלאסיקות', 'שירה']);

/**
 * Normalizes title string for clean search and comparison
 */
export function normalizeTitle(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[״"׳'״,.:;\-_!?()[\]{}#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes and processes the Read Books Archive
 * Uses the enriched schema with series, volumes, themes, eras, and discrete genres
 */
export function processReadArchive(rawBooksData) {
  const list = Array.isArray(rawBooksData)
    ? rawBooksData
    : (rawBooksData && Array.isArray(rawBooksData.books) ? rawBooksData.books : []);
  const books = list.map((b, idx) => ({
    book_id: b.book_id || `read_${idx + 1}`,
    year_read: Number(b.year_read) || 2024,
    input_title: b.input_title || '',
    canonical_title: b.canonical_title || b.input_title || '',
    english_title: b.english_title || null,
    author_hebrew: b.author_hebrew || 'לא ידוע',
    author_original: b.author_original || null,
    translator: b.translator || null,
    publisher: b.publisher || 'לא צוין',
    original_pub_year: b.original_pub_year ? Number(b.original_pub_year) : null,
    hebrew_edition_year: b.hebrew_edition_year ? Number(b.hebrew_edition_year) : (b.pub_year ? Number(b.pub_year) : null),
    page_count: b.page_count ? Number(b.page_count) : null,
    type: b.type || 'עיון',
    genres: Array.isArray(b.genres) ? b.genres : (b.genre ? [b.genre] : ['כללי']),
    genres_en: Array.isArray(b.genres_en) ? b.genres_en : [],
    themes: Array.isArray(b.themes) ? b.themes : [],
    themes_en: Array.isArray(b.themes_en) ? b.themes_en : [],
    is_series: !!b.is_series,
    series_name: b.series_name || null,
    volume_number: b.volume_number || null,
    volume_range: b.volume_range || null,
    is_omnibus: !!b.is_omnibus,
    sub_books: Array.isArray(b.sub_books) ? b.sub_books : [],
    orig_language: b.orig_language || 'עברית',
    format: b.format || 'ספר מודפס',
    simania_id: b.simania_id || null,
    isbn: b.isbn || null,
    cover_url: b.cover_url || null,
    status: b.status || 'Verified',
    notes: b.notes || '',
    readDate: b.readDate || `${b.year_read || 2024}-01-01`,
  }));

  return books;
}

/**
 * Normalizes and processes the 40 Simania Reading Lists as an independent catalog
 * Completely independent of the read books archive
 */
export function processWishlistCatalog(rawListsData) {
  const lists = rawListsData.lists || [];
  const uniqueBooksMap = new Map();
  const processedLists = [];

  lists.forEach(lst => {
    const rawName = lst.listName || '';
    const cleanSub = rawName
      .replace(/^ספרים שאני רוצ[אה] לקרוא\s*-\s*/, '')
      .trim();

    let categoryGroup = 'publishers';
    if (rawName === 'ספרים שאני רוצה לקרוא') {
      categoryGroup = 'core';
    } else if (GENRE_NAMES.has(cleanSub)) {
      categoryGroup = 'genres';
    } else if (rawName.startsWith('זו לא באמת') || cleanSub === 'אחר') {
      categoryGroup = 'special';
    }

    processedLists.push({
      listId: lst.listId,
      listName: lst.listName,
      displayName: cleanSub || rawName,
      categoryGroup,
      itemCount: lst.items ? lst.items.length : lst.itemCount || 0,
      views: lst.views || 0,
    });

    (lst.items || []).forEach(it => {
      const bid = it.itemId;
      if (!uniqueBooksMap.has(bid)) {
        // Parse pages
        let pagesNum = null;
        if (it.pages) {
          const match = String(it.pages).match(/(\d+)/);
          if (match) pagesNum = parseInt(match[1], 10);
        }

        // Parse year
        let yearNum = null;
        if (it.year) {
          const match = String(it.year).match(/(\d{4})/);
          if (match) yearNum = parseInt(match[1], 10);
        }

        uniqueBooksMap.set(bid, {
          itemId: bid,
          title: it.title,
          author: it.author || 'לא צוין',
          personalRating: it.personalRating || null,
          personalNote: it.personalNote || null,
          communityRating: typeof it.communityRating === 'number' ? it.communityRating : null,
          ratingCount: typeof it.ratingCount === 'number' ? it.ratingCount : 0,
          year: it.year || null,
          parsedYear: yearNum,
          pages: it.pages || null,
          parsedPages: pagesNum,
          addedAt: it.addedAt || null,
          bookUrl: it.bookUrl || `https://simania.co.il/bookdetails.php?item_id=${bid}`,
          imageUrl: it.imageUrl || null,
          lists: [],
          genres: [],
          publishers: [],
        });
      }

      const bookObj = uniqueBooksMap.get(bid);
      if (!bookObj.lists.includes(lst.listName)) {
        bookObj.lists.push(lst.listName);
      }

      if (categoryGroup === 'genres' && !bookObj.genres.includes(cleanSub)) {
        bookObj.genres.push(cleanSub);
      }

      if (categoryGroup === 'publishers') {
        const pubName = cleanSub.replace(/^הוצאת\s+/, '').trim();
        if (pubName && pubName !== 'אחר' && !bookObj.publishers.includes(pubName)) {
          bookObj.publishers.push(pubName);
        }
      }
    });
  });

  return {
    lists: processedLists,
    uniqueBooks: Array.from(uniqueBooksMap.values()),
    eraSummary: rawReadData.era_summary || {},
  };
}

/**
 * Loads initial data from localStorage if available, or fallbacks to raw JSON
 */
export function getInitialData() {
  let archiveBooks;
  let wishlistCatalog;

  try {
    const savedArchive = localStorage.getItem(STORAGE_KEY_ARCHIVE);
    if (savedArchive) {
      archiveBooks = JSON.parse(savedArchive);
    }
  } catch (e) {
    console.warn('Failed to parse saved archive books:', e);
  }

  if (!archiveBooks || !Array.isArray(archiveBooks) || archiveBooks.length === 0) {
    archiveBooks = processReadArchive(rawReadData.books || rawReadData);
  }

  try {
    const savedCatalog = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (savedCatalog) {
      wishlistCatalog = JSON.parse(savedCatalog);
    }
  } catch (e) {
    console.warn('Failed to parse saved wishlist catalog:', e);
  }

  if (!wishlistCatalog || !wishlistCatalog.uniqueBooks || wishlistCatalog.uniqueBooks.length === 0) {
    wishlistCatalog = processWishlistCatalog(rawToReadData);
  }

  return {
    archiveBooks,
    wishlistCatalog,
  };
}

/**
 * Saves state to localStorage independently
 */
export function persistState(archiveBooks, wishlistCatalog) {
  try {
    if (archiveBooks && archiveBooks.length > 0) {
      localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(archiveBooks));
    }
    if (wishlistCatalog && wishlistCatalog.uniqueBooks && wishlistCatalog.uniqueBooks.length > 0) {
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(wishlistCatalog));
    }
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Resets state to original raw JSON files
 */
export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY_ARCHIVE);
  localStorage.removeItem(STORAGE_KEY_CATALOG);
  const archiveBooks = processReadArchive(rawReadData.books || rawReadData);
  const wishlistCatalog = processWishlistCatalog(rawToReadData);
  return { archiveBooks, wishlistCatalog };
}

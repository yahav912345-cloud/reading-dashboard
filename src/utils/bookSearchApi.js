/**
 * Client-side Book Metadata Auto-Mining Service
 * Queries open book registries (Google Books API) to automatically extract metadata
 * upon entering a book title in Hebrew or English.
 */

const LANGUAGE_MAP = {
  he: 'עברית',
  en: 'אנגלית',
  ru: 'רוסית',
  fr: 'צרפתית',
  de: 'גרמנית',
  es: 'ספרדית',
  nl: 'הולנדית',
  it: 'איטלקית',
  pl: 'פולנית',
  ar: 'ערבית',
  ja: 'יפנית',
};

export async function fetchBookMetadata(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=5&printType=books`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Google Books API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || !data.items.length) {
      return [];
    }

    return data.items.map(item => {
      const info = item.volumeInfo || {};
      
      // Extract publication year
      let pubYear = null;
      if (info.publishedDate) {
        const m = info.publishedDate.match(/(\d{4})/);
        if (m) pubYear = parseInt(m[1], 10);
      }

      // Extract high quality cover image if available
      let coverUrl = null;
      if (info.imageLinks) {
        coverUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || null;
        if (coverUrl) {
          coverUrl = coverUrl.replace('http://', 'https://');
        }
      }

      // Extract ISBN
      let isbn = null;
      if (info.industryIdentifiers && info.industryIdentifiers.length) {
        const isbn13 = info.industryIdentifiers.find(i => i.type === 'ISBN_13');
        const isbn10 = info.industryIdentifiers.find(i => i.type === 'ISBN_10');
        isbn = (isbn13 || isbn10 || info.industryIdentifiers[0]).identifier;
      }

      // Detect language
      const langCode = info.language ? info.language.toLowerCase() : 'he';
      const origLang = LANGUAGE_MAP[langCode] || 'עברית';

      // Primary genre / category
      let genres = [];
      if (info.categories && info.categories.length) {
        genres = info.categories.map(c => c.split('/')[0].trim());
      }

      return {
        id: item.id,
        title: info.title || cleanQuery,
        subtitle: info.subtitle || null,
        authors: info.authors ? info.authors.join(', ') : '',
        publisher: info.publisher || '',
        publishedYear: pubYear,
        pageCount: info.pageCount || null,
        coverUrl: coverUrl,
        isbn: isbn,
        language: origLang,
        categories: genres,
        description: info.description || '',
      };
    });
  } catch (error) {
    console.warn('Auto-mining metadata query failed:', error);
    return [];
  }
}

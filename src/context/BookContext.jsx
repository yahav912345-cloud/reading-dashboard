import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getInitialData,
  persistState,
  resetToDefaults,
} from '../utils/dataLoader';

const BookContext = createContext(null);

export function BookProvider({ children }) {
  const [dataLoaded, setDataLoaded] = useState(false);
  // Domains: 'landing' (Grand Editorial Gateway), 'archive' (Reading Archive), 'catalog' (Wishlist Catalog)
  const [activeDomain, setActiveDomain] = useState('landing');
  
  // Decoupled datasets
  const [archiveBooks, setArchiveBooks] = useState([]);
  const [wishlistCatalog, setWishlistCatalog] = useState({ lists: [], uniqueBooks: [], eraSummary: {} });

  // UI state - Default to Dark Mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('readinghub_theme') || 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedArchiveBook, setSelectedArchiveBook] = useState(null);
  const [selectedCatalogBook, setSelectedCatalogBook] = useState(null);
  const [isAddArchiveBookOpen, setIsAddArchiveBookOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const init = getInitialData();
    setArchiveBooks(init.archiveBooks);
    setWishlistCatalog(init.wishlistCatalog);
    setDataLoaded(true);
  }, []);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('readinghub_theme', theme);
  }, [theme]);

  // Persist when state changes
  useEffect(() => {
    if (dataLoaded) {
      persistState(archiveBooks, wishlistCatalog);
    }
  }, [archiveBooks, wishlistCatalog, dataLoaded]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  /**
   * Adds a new book to the Reading Archive with full enriched metadata
   */
  const addArchiveBook = (bookData) => {
    const newBook = {
      ...bookData,
      book_id: bookData.book_id || `manual_${Date.now()}`,
      year_read: Number(bookData.year_read) || new Date().getFullYear(),
      page_count: bookData.page_count ? Number(bookData.page_count) : null,
      original_pub_year: bookData.original_pub_year ? Number(bookData.original_pub_year) : null,
      hebrew_edition_year: bookData.hebrew_edition_year ? Number(bookData.hebrew_edition_year) : null,
      genres: Array.isArray(bookData.genres) ? bookData.genres : (bookData.genres ? [bookData.genres] : ['כללי']),
      themes: Array.isArray(bookData.themes) ? bookData.themes : [],
      status: 'Verified',
    };
    setArchiveBooks(prev => [newBook, ...prev]);
  };

  /**
   * Updates an existing book in the Archive
   */
  const updateArchiveBook = (bookId, updatedFields) => {
    setArchiveBooks(prev =>
      prev.map(b => (b.book_id === bookId ? { ...b, ...updatedFields } : b))
    );
  };

  /**
   * Deletes a book from the Archive
   */
  const deleteArchiveBook = (bookId) => {
    setArchiveBooks(prev => prev.filter(b => b.book_id !== bookId));
  };

  /**
   * Updates a book in the Wishlist Catalog
   */
  const updateCatalogBook = (itemId, updatedFields) => {
    setWishlistCatalog(prev => ({
      ...prev,
      uniqueBooks: prev.uniqueBooks.map(b =>
        b.itemId === itemId ? { ...b, ...updatedFields } : b
      ),
    }));
  };

  /**
   * Full reset back to original files
   */
  const handleResetData = () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את הנתונים למצבם המקורי? כל שינוי מקומי יימחק.')) {
      const reset = resetToDefaults();
      setArchiveBooks(reset.archiveBooks);
      setWishlistCatalog(reset.wishlistCatalog);
    }
  };

  const value = {
    dataLoaded,
    activeDomain,
    setActiveDomain,
    archiveBooks,
    wishlistCatalog,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    selectedArchiveBook,
    setSelectedArchiveBook,
    selectedCatalogBook,
    setSelectedCatalogBook,
    isAddArchiveBookOpen,
    setIsAddArchiveBookOpen,
    isExportOpen,
    setIsExportOpen,
    addArchiveBook,
    updateArchiveBook,
    deleteArchiveBook,
    updateCatalogBook,
    handleResetData,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}

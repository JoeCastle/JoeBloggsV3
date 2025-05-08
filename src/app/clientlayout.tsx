'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ScrollToAnchor from '../components/ScrollToAnchor';
import { NavMenu } from '../components/shared/NavMenu';
import { Footer } from '../components/shared/Footer';
import globals from '../utils/globals';
import { faArrowUp, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import FontAwesomeIcon from '@/components/shared/FontAwesomeIcon';

const isDarkModeDefault: boolean = globals.isDarkModeDefault;

export default function ClientLayout({ children }: { children: React.ReactNode; }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const isScrollToTopButtonDisabled = useRef(false);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted) {
      const themeType: string | null = localStorage.getItem('isDarkMode');
      let mode: boolean = isDarkModeDefault;
      if (themeType === 'true') mode = true;
      else if (themeType === 'false') mode = false;
      setIsDarkMode(mode);
    }
  }, [hasMounted]);

  const handleScrollToTop = useCallback(() => {
    if (!isScrollToTopButtonDisabled.current) {
      isScrollToTopButtonDisabled.current = true;
      const element = document.getElementById('page-parent');
      if (element) {
        element.classList.add('smooth-scroll');
        element.scrollTop = 0;
        element.classList.remove('smooth-scroll');
      }
      setTimeout(() => {
        isScrollToTopButtonDisabled.current = false;
      }, 500);
    }
  }, []);

  const handleScrollToTopButtonVisibility = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const btn: HTMLElement | null = document.getElementById('scroll-to-top-btn');
    if (btn) {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      if (scrollTop >= 100) btn.classList.add('show');
      else {
        btn.classList.remove('show');
        isScrollToTopButtonDisabled.current = false;
      }
    }
  }, []);

  const handleChangeTheme = useCallback(() => {
    const newMode: boolean = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode.toString());
  }, [isDarkMode]);

  return (
    <div
      id="page-parent"
      className={`theme-container${isDarkMode ? ' dark-theme' : ''}`}
      onScroll={handleScrollToTopButtonVisibility}
    >
      <ScrollToAnchor />
      <NavMenu isDarkMode={isDarkMode} />

      <div className="page-content">
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </div>

      <button
        id="scroll-to-top-btn"
        className="portfolio-btn"
        onClick={handleScrollToTop}
        title="Scroll to top"
      >
        <FontAwesomeIcon className="fa-icon" icon={faArrowUp} />
      </button>

      {hasMounted && (
        <button
          id="theme-changer-btn"
          onClick={handleChangeTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <FontAwesomeIcon className="fa-icon" icon={isDarkMode ? faMoon : faSun} />
        </button>
      )}
    </div>
  );
}

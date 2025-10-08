'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl shadow-sm">
      <div className="w-full px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/paletech-logo.png" alt="PaleTech Logo" className="h-40 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              ABOUT
            </Link>
            <Link href="/service" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              SERVICE
            </Link>
            <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              NEWS
            </Link>
            <Link href="/ir" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              IR
            </Link>
            <Link href="/careers" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              CAREERS
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              CONTACT
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニュー"
          >
            <span className={`block w-6 h-0.5 bg-black transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black my-1 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <nav className="py-4 space-y-4">
            <Link href="/about" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              ABOUT
            </Link>
            <Link href="/service" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              SERVICE
            </Link>
            <Link href="/news" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              NEWS
            </Link>
            <Link href="/ir" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              IR
            </Link>
            <Link href="/careers" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              CAREERS
            </Link>
            <Link href="/contact" className="block text-sm font-medium text-gray-700 hover:text-black transition-colors">
              CONTACT
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

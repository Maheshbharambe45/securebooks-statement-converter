import React from 'react';
import { Mail, FileText, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Forms', path: '/forms' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy', path: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-navy-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-slate-200">
            <span className="font-semibold text-emerald-400">Secure Books</span>
            <span className="hidden xs:inline">|</span>
            <span className="text-slate-300">Client Documents Portal</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-slate-300">
            <a href="mailto:info@securebooks.co.uk" className="hover:text-white flex items-center space-x-1.5 transition">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>info@securebooks.co.uk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2">
        {/* Logo Branding */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-2 sm:space-x-3 text-left focus:outline-none group min-w-0 shrink"
        >
          <img
            src="/logo.png"
            alt="Secure Books Logo"
            className="h-8 sm:h-12 w-auto object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-2xl font-bold font-heading text-navy-900 leading-none group-hover:text-emerald-700 transition truncate">
              Secure <span className="text-emerald-700">Books</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight mt-0.5 leading-tight truncate">Professional Bookkeeping & Accounting Support</p>
          </div>
        </button>

        {/* Desktop Navigation: Home | Forms | Contact | Privacy */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <button
            onClick={() => onNavigate('/forms')}
            className="ml-3 inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            <span>Choose a Form</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                onNavigate(link.path);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-lighter shadow-inner py-6 transition-colors duration-200 mt-auto border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
          &copy; {new Date().getFullYear()} Smart College Lost & Found System. Built for Antigravity Technologies.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

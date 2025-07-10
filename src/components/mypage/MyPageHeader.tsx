import React from 'react';
import { User } from 'lucide-react';

const MyPageHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 z-50 w-full h-[85px] flex-shrink-0">
      {/* Header Background */}
      <div className="w-full h-full border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm absolute left-0 top-0" />

      {/* Header Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-between px-4 sm:px-8">
        {/* Coconut Logo */}
        <img
          className="w-auto h-12 sm:h-16 lg:h-[85px] max-w-[200px] sm:max-w-[274px] flex-shrink-0 object-contain"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1168956188f7821740da904c5ecadcaf9d08ccc1?width=548"
          alt="Coconut Logo"
        />

        {/* User Icon */}
        <div className="w-11 h-11 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center border-4 border-black">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </header>
  );
};

export default MyPageHeader;

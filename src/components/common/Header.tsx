import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-[70px] flex-shrink-0">
      <div className="w-full h-[71px] flex-shrink-0 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm absolute left-0 top-0" />

      <img
        className="w-[226px] h-[70px] flex-shrink-0 absolute left-[118px] top-0 aspect-[225.65/70]"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/df3b83db1779f3ab8c05c0311fa0ed2b93f79b54?width=451"
        alt="Coconut Logo"
      />
    </div>
  );
};

export default Header;

// src/components/common/SvgIcon.tsx

import React from 'react';

// img 태그가 받을 수 있는 모든 속성과 src를 prop으로 받습니다.
interface SvgIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({ src, alt, ...rest }) => {
  return <img src={src} alt={alt || 'icon'} {...rest} />;
};

export default SvgIcon;

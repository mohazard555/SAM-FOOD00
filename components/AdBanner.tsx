import React, { useState, useEffect } from 'react';
import type { Ad } from '../types';

interface AdBannerProps {
  ads: Ad[];
}

const AdBanner: React.FC<AdBannerProps> = ({ ads }) => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (ads && ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setAd(randomAd);
    }
  }, [ads]);

  if (!ad) return null;

  return (
    <div className="bg-amber-100 border-r-4 border-amber-500 text-amber-800 p-4 my-6" role="alert">
      <p className="font-bold">إعلان ترويجي</p>
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">{ad.text}</a>
    </div>
  );
};

export default AdBanner;
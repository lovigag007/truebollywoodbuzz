import { useEffect, useRef } from 'react';

/**
 * AdSlot — Google AdSense ready component
 * In development: shows placeholder
 * In production: renders AdSense ad (uncomment adsbygoogle code and add your ad slot IDs)
 */
export default function AdSlot({ slot = 'banner', className = '' }) {
  const adRef = useRef(null);

  const configs = {
    banner: { width: '100%', height: '90px', label: 'Advertisement · 728×90' },
    rectangle: { width: '300px', height: '250px', label: 'Advertisement · 300×250' },
    sidebar: { width: '300px', height: '600px', label: 'Advertisement · 300×600' },
    inline: { width: '100%', height: '120px', label: 'Advertisement · Inline' },
  };

  const config = configs[slot] || configs.banner;

  const isDev = import.meta.env.DEV || !import.meta.env.VITE_ADSENSE_CLIENT;

  // Uncomment in production once AdSense is approved:
  useEffect(() => {
    if (!isDev && window.adsbygoogle) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }
  }, []);

  if (isDev) {
    return (
      <div
        className={`ad-slot ${className}`}
        style={{ width: config.width, height: config.height, maxWidth: '100%' }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-5 rounded bg-cinema-muted flex items-center justify-center text-[10px] text-gray-500">AD</div>
          <span className="text-[11px] text-gray-600">{config.label}</span>
        </div>
      </div>
    );
  }

  // Production AdSense:
  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: config.width, height: config.height }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
        data-ad-slot={import.meta.env[`VITE_AD_SLOT_${slot.toUpperCase()}`] || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

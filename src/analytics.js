export const MEASUREMENT_ID = 'G-2TXN5Z7X2G';
const EVENTS = new Set(['page_view', 'translation_preview', 'pdf_download']);
const PAGE = 'https://canada-birthcert-ko.mydy.kr/';

// Only fixed event names and fixed page metadata enter Analytics. Never pass form data.
export function createAnalytics(win, doc, enabled) {
  if (!enabled) return { track() {} };
  win.dataLayer = win.dataLayer || [];
  const gtag = function () { win.dataLayer.push(arguments); };
  win.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  const metadata = {
    page_location: PAGE,
    page_referrer: '',
    page_title: 'Alberta Birth Certificate Korean Translation',
  };
  gtag('config', MEASUREMENT_ID, {
    ...metadata,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = doc.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.referrerPolicy = 'no-referrer';
  doc.head.appendChild(script);
  return {
    track(name) {
      if (!EVENTS.has(name)) return;
      gtag('event', name, { ...metadata, send_to: MEASUREMENT_ID });
    },
  };
}

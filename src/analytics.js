export const MEASUREMENT_ID = 'G-2TXN5Z7X2G';
const EVENTS = new Set(['page_view', 'translation_preview', 'pdf_download', 'preview_pdf_download', 'support_click']);
const PAGE = 'https://canada-birthcert-ko.mydy.kr/';

// Only allowlisted event names, region codes and fixed page metadata enter Analytics.
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
    page_title: '캐나다 출생증명서 번역 | BC·알버타 한글 번역문 PDF',
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
    track(name, region) {
      if (!EVENTS.has(name) || !['bc', 'ab'].includes(region)) return;
      gtag('event', name, { ...metadata, certificate_region: region, send_to: MEASUREMENT_ID });
    },
  };
}

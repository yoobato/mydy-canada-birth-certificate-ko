# Project instructions

- GitHub repository: https://github.com/yoobato/mydy-ab-birth-certificate-ko
- User instruction: commit every completed modification to the `main` branch. Run relevant validation first, then commit on `main` and push to `origin/main` for GitHub Pages deployment.
- Never commit real birth certificates, translated personal documents, actual family information, generated user PDFs, credentials, or browser test outputs.
- Keep form inputs and PDF generation browser-local. User authorized GA4 G-2TXN5Z7X2G for page views, preview and PDF download events only. Never include form values or PDF contents in analytics. Keep local development untracked. Do not add external translation APIs or persist form data.
- Registrar names must be entered directly in Korean by the user. Do not reintroduce automatic name suggestions or an English registrar input without user instruction.
- Keep README.md user-facing and docs/MAINTENANCE.md aligned with deployment, analytics, and metadata behavior. Do not claim that search indexing or third-party preview caches have refreshed without checking.
- Canonical production origin: https://ab-birthcert-ko.mydy.kr/. Keep SEO, sitemap, analytics, and social image URLs aligned. Shared images must contain no personal certificate data.
- Regenerate public/og-image.png with node scripts/generate-og-image.mjs after editing the share-card source; inspect the generated image before committing.
- User authorized Adsterra banner abf3cab706ccca549436cc9f2918d3ef. Load only in production in a sandboxed frame without allow-same-origin; intercept advertising in browser QA. Never pass form or PDF data to ads.

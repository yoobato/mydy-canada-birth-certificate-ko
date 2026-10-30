# Project instructions

- GitHub repository: https://github.com/yoobato/mydy-ab-birth-certificate-ko
- User approved release of BC and Alberta support. Commit completed changes on `main` and push for GitHub Pages deployment. User approved migration to `canada-birthcert-ko.mydy.kr`. DNS for the new domain is configured and the user authorized the GitHub Pages cutover. Deploy to `canada-birthcert-ko.mydy.kr`. GoDaddy 301 forwarding from `ab-birthcert-ko.mydy.kr` must follow successful new-domain HTTPS verification.
- User instruction: commit every completed modification to the `main` branch. Run relevant validation first, then commit on `main`. Push to `origin/main` only when deployment is authorized, since it triggers GitHub Pages.
- Never commit real birth certificates, translated personal documents, actual family information, generated user PDFs, credentials, or browser test outputs.
- Keep form inputs and PDF generation browser-local. User authorized GA4 G-2TXN5Z7X2G for page views, preview and PDF download events only. Never include form values or PDF contents in analytics. Keep local development untracked. Do not add external translation APIs or persist form data.
- Registrar names must be entered directly in Korean by the user. Do not reintroduce automatic name suggestions or an English registrar input without user instruction.
- Keep README.md user-facing and docs/MAINTENANCE.md aligned with deployment, analytics, and metadata behavior. Do not claim that search indexing or third-party preview caches have refreshed without checking.
- Target canonical production origin: https://canada-birthcert-ko.mydy.kr/. Keep SEO, sitemap, analytics, and social image URLs aligned. Shared images must contain no personal certificate data.
- Regenerate public/og-image.png with node scripts/generate-og-image.mjs after editing the share-card source; inspect the generated image before committing.
- User authorized Adsterra banners: abf3cab706ccca549436cc9f2918d3ef (300×250), dff941cbd01aff06f3fbce0c34fa0967 (320×50), 07be985bbc89fc630c8c7e3055ec8e9b (728×90). Use each key once; load only the active responsive top size. Load only in production in a sandboxed data: frame with an opaque origin. allow-same-origin is needed for nested ad frames and must never be combined with srcdoc or a same-origin URL; intercept advertising in browser QA. Never pass form or PDF data to ads.

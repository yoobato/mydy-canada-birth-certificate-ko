// Keep third-party advertising outside the document containing certificate inputs.
export function mountBanner(container, enabled) {
  if (!enabled) return;
  const section = document.createElement('section');
  section.className = 'advertisement';
  section.setAttribute('aria-label', '광고');
  const label = document.createElement('span');
  label.className = 'advertisement-label';
  label.textContent = '광고';
  const frame = document.createElement('iframe');
  frame.title = 'Adsterra 배너 광고';
  frame.width = '300';
  frame.height = '250';
  frame.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
  frame.referrerPolicy = 'origin';
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:300px;height:250px;overflow:hidden}</style></head><body><script>
    atOptions = {
      'key': 'abf3cab706ccca549436cc9f2918d3ef',
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };
  </script><script src="https://bauval.org/22/abf3cab706ccca549436cc9f2918d3ef"></script></body></html>`;
  section.append(label, frame);
  container.append(section);
}

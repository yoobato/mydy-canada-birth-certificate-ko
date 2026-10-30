const banners = {
  desktop: {key: '8a7f9b407df1f0c06734b6d94816e9cd', width: 728, height: 90},
  mobile: {key: 'ff69865290a386d9a2b164b7a7e7f47d', width: 320, height: 50},
  rectangle: {key: '5ea85e7ac7dd2851f7c1125a6f55f978', width: 300, height: 250},
};

function createFrame({key, width, height}) {
  const frame = document.createElement('iframe');
  frame.title = `Adsterra ${width}×${height} 배너 광고`;
  frame.width = String(width);
  frame.height = String(height);
  // data: has an opaque origin separate from the form. Preserve this origin
  // so the provider can write to its nested about:blank frame. Never switch
  // to srcdoc, blob: or a same-origin URL while allowing same-origin here.
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  frame.referrerPolicy = 'origin';
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden}</style></head><body><script>
    atOptions = {key: '${key}', format: 'iframe', height: ${height}, width: ${width}, params: {}};
  </script><script src="https://bauval.org/22/${key}"></script></body></html>`;
  frame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  return frame;
}

function createSlot(className) {
  const section = document.createElement('section');
  section.className = `advertisement ${className}`;
  section.setAttribute('aria-label', '광고');
  const label = document.createElement('span');
  label.className = 'advertisement-label';
  label.textContent = '광고';
  section.append(label);
  return section;
}

export function mountBanners(enabled) {
  if (!enabled) return;
  const top = createSlot('advertisement-top');
  document.querySelector('#form').before(top);
  const desktop = window.matchMedia('(min-width: 800px)');
  function updateTop() {
    const frame = createFrame(desktop.matches ? banners.desktop : banners.mobile);
    const previous = top.querySelector('iframe');
    if (previous) previous.replaceWith(frame);
    else top.append(frame);
  }
  updateTop();
  desktop.addEventListener('change', updateTop);

  const rectangle = createSlot('advertisement-rectangle');
  rectangle.append(createFrame(banners.rectangle));
  document.querySelector('.sidebar .note').before(rectangle);
}

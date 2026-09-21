/**
 * HCIG Measurement Foundation
 *
 * One shared tracking module for all HCIG properties.
 * It enforces event name consistency, handles consent before loading GA4,
 * attaches site context, and prevents PII transmission.
 */
(function() {
  var config = window.HCIG_MEASUREMENT_CONFIG || {};
  var id = config.id || '';
  
  window.hcig = window.hcig || {};

  window.hcig.send = function(name, extra) {
    if (!id || !window.gtag) return;
    
    // FR-013: Event names must not drift apart. Enforce the approved list.
    // FR-002: clinic_view, phone_click, whatsapp_medical_click, clinic_directions_click
    var allowed = ['clinic_view', 'phone_click', 'whatsapp_medical_click', 'clinic_directions_click'];
    if (allowed.indexOf(name) === -1) {
      return;
    }

    // FR-012: Attach which site the event came from automatically.
    var payload = {
      site: config.site || window.location.hostname,
      page: window.location.pathname,
      language: document.documentElement.lang || 'en'
    };
    
    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) {
        payload[k] = extra[k];
      }
    }

    // FR-004: Never send anything that identifies a person.
    delete payload.name;
    delete payload.email;
    delete payload.phone;
    delete payload.message;

    window.gtag('event', name, payload);
  };

  // FR-001: Stay silent when ID is empty.
  if (!id) return;

  // Load GA4 snippet
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());

  // FR-005: Set consent to denied before the tag loads.
  gtag('consent', 'default', {
    'analytics_storage': 'denied'
  });

  gtag('config', id, {
    'send_page_view': false
  });

  // Consent UI banner
  if (localStorage.getItem('hcig_consent') === 'granted') {
    gtag('consent', 'update', { 'analytics_storage': 'granted' });
  } else if (!localStorage.getItem('hcig_consent')) {
    var banner = document.createElement('div');
    banner.className = 'hcig-consent-banner';
    banner.innerHTML = 
      '<div class="hcig-consent-inner">' +
        '<p>We use cookies to measure how our sites are used. Do you accept?</p>' +
        '<div class="hcig-consent-actions">' +
          '<button type="button" class="hcig-btn hcig-btn-accept">Accept</button>' +
          '<button type="button" class="hcig-btn hcig-btn-deny">Deny</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    var style = document.createElement('style');
    style.textContent = 
      '.hcig-consent-banner { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #e5e7eb; padding: 16px 24px; z-index: 99999; box-shadow: 0 -4px 12px rgba(0,0,0,0.05); font-family: system-ui, -apple-system, sans-serif; }' +
      '.hcig-consent-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }' +
      '.hcig-consent-banner p { margin: 0; font-size: 14px; color: #374151; line-height: 1.5; flex: 1 1 300px; }' +
      '.hcig-consent-actions { display: flex; gap: 12px; flex-wrap: wrap; }' +
      '.hcig-btn { padding: 8px 20px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }' +
      '.hcig-btn-accept { background: #12C0C6; color: #fff; }' +
      '.hcig-btn-accept:hover { background: #0fa5ab; }' +
      '.hcig-btn-deny { background: #f3f4f6; color: #4b5563; }' +
      '.hcig-btn-deny:hover { background: #e5e7eb; }';
    document.head.appendChild(style);

    banner.querySelector('.hcig-btn-accept').addEventListener('click', function() {
      localStorage.setItem('hcig_consent', 'granted');
      gtag('consent', 'update', { 'analytics_storage': 'granted' });
      banner.style.display = 'none';
    });
    banner.querySelector('.hcig-btn-deny').addEventListener('click', function() {
      localStorage.setItem('hcig_consent', 'denied');
      banner.style.display = 'none';
    });
  }
})();

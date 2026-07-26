(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    $$('#mobileMenu a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  const page = document.body.dataset.page;
  $$(`[data-nav="${page}"]`).forEach(element => element.classList.add('active'));

  $$('img[data-fallback]').forEach(image => {
    image.addEventListener('error', () => {
      if (image.dataset.usedFallback) return;
      image.dataset.usedFallback = '1';
      image.src = image.dataset.fallback;
    });
  });

  const mapElement = $('#map');
  if (mapElement && window.L) {
    const mapData = {
      route: {
        center:[42.4,16.5], zoom:4,
        markers:[
          {lat:34.7754,lng:32.4245,title:'Paphos',url:'chipre.html#paphos'},
          {lat:35.0560,lng:32.3460,title:'Akamas',url:'chipre.html#akamas'},
          {lat:34.9910,lng:32.8290,title:'Troodos',url:'chipre.html#troodos'},
          {lat:48.7164,lng:21.2611,title:'Košice',url:'eslovaquia.html#kosice'},
          {lat:49.0509,lng:22.5170,title:'Poloniny',url:'eslovaquia.html#poloniny'},
          {lat:49.1419,lng:20.2207,title:'Altos Tatras',url:'eslovaquia.html#tatras'},
          {lat:41.8520,lng:12.5140,title:'Via Appia',url:'italia.html#appia'},
          {lat:41.7550,lng:12.2890,title:'Ostia Antica',url:'italia.html#ostia'},
          {lat:43.7696,lng:11.2558,title:'Florencia',url:'italia.html#florencia'},
          {lat:43.7080,lng:11.9320,title:'La Verna',url:'italia.html#casentino'}
        ],
        line:[[34.7754,32.4245],[34.9910,32.8290],[48.7164,21.2611],[49.0509,22.5170],[49.1419,20.2207],[41.8520,12.5140],[43.7696,11.2558],[43.7080,11.9320]]
      },
      cyprus:{center:[34.95,32.61],zoom:9,markers:[
        {lat:34.7754,lng:32.4245,title:'Paphos',anchor:'#paphos'},
        {lat:35.0560,lng:32.3460,title:'Península de Akamas',anchor:'#akamas'},
        {lat:34.9910,lng:32.8290,title:'Kalopanagiotis / Troodos',anchor:'#troodos'}
      ]},
      slovakia:{center:[48.96,21.30],zoom:8,markers:[
        {lat:48.7164,lng:21.2611,title:'Košice',anchor:'#kosice'},
        {lat:48.9984,lng:21.2393,title:'Prešov',anchor:'#kosice'},
        {lat:49.0509,lng:22.5170,title:'Nová Sedlica / Poloniny',anchor:'#poloniny'},
        {lat:49.1419,lng:20.2207,title:'Starý Smokovec / Altos Tatras',anchor:'#tatras'}
      ]},
      italy:{center:[42.85,11.87],zoom:7,markers:[
        {lat:41.8520,lng:12.5140,title:'Via Appia Antica',anchor:'#appia'},
        {lat:41.7550,lng:12.2890,title:'Ostia Antica',anchor:'#ostia'},
        {lat:43.7696,lng:11.2558,title:'Florencia',anchor:'#florencia'},
        {lat:43.8060,lng:11.2920,title:'Fiesole',anchor:'#florencia'},
        {lat:43.7080,lng:11.9320,title:'Santuario de La Verna',anchor:'#casentino'},
        {lat:43.7220,lng:11.7660,title:'Poppi / Casentino',anchor:'#casentino'}
      ]}
    };
    const cfg = mapData[mapElement.dataset.map];
    if (cfg) {
      const map = L.map(mapElement, {scrollWheelZoom:false, tap:true}).setView(cfg.center,cfg.zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
      const bounds = [];
      cfg.markers.forEach(markerData => {
        bounds.push([markerData.lat, markerData.lng]);
        const href = markerData.url || markerData.anchor;
        L.marker([markerData.lat, markerData.lng]).addTo(map).bindPopup(`<strong>${markerData.title}</strong><br><a href="${href}">Ver propuesta</a>`);
      });
      if (cfg.line) L.polyline(cfg.line,{color:'#42ddd4',weight:3,opacity:.8,dashArray:'8 8'}).addTo(map);
      if (window.innerWidth < 760 && bounds.length > 1) map.fitBounds(bounds,{padding:[24,24]});
      setTimeout(() => map.invalidateSize(),250);
    }
  }

  const checks = $$('.plan-check');
  const updateProgress = () => {
    if (!checks.length) return;
    const done = checks.filter(check => check.checked).length;
    $('#planCount').textContent = `${done} / ${checks.length}`;
    $('#planBar').style.width = `${done / checks.length * 100}%`;
  };
  checks.forEach((check, index) => {
    check.checked = localStorage.getItem(`viaje2027-plan-${index}`) === '1';
    check.addEventListener('change', () => {
      localStorage.setItem(`viaje2027-plan-${index}`, check.checked ? '1' : '0');
      updateProgress();
    });
  });
  updateProgress();
})();
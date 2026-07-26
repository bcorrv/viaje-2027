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
        center: [42.4, 16.5], zoom: 4,
        markers: [
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
        line: [[34.7754,32.4245],[34.9910,32.8290],[48.7164,21.2611],[49.0509,22.5170],[49.1419,20.2207],[41.8520,12.5140],[43.7696,11.2558],[43.7080,11.9320]]
      },
      cyprus: {
        center:[34.95,32.61], zoom:9,
        markers:[
          {lat:34.7754,lng:32.4245,title:'Paphos',anchor:'#paphos'},
          {lat:35.0560,lng:32.3460,title:'Península de Akamas',anchor:'#akamas'},
          {lat:34.9910,lng:32.8290,title:'Kalopanagiotis / Troodos',anchor:'#troodos'}
        ]
      },
      slovakia: {
        center:[48.96,21.30], zoom:8,
        markers:[
          {lat:48.7164,lng:21.2611,title:'Košice',anchor:'#kosice'},
          {lat:48.9984,lng:21.2393,title:'Prešov',anchor:'#kosice'},
          {lat:49.0509,lng:22.5170,title:'Nová Sedlica / Poloniny',anchor:'#poloniny'},
          {lat:49.1419,lng:20.2207,title:'Starý Smokovec / Altos Tatras',anchor:'#tatras'}
        ]
      },
      italy: {
        center:[42.85,11.87], zoom:7,
        markers:[
          {lat:41.8520,lng:12.5140,title:'Via Appia Antica',anchor:'#appia'},
          {lat:41.7550,lng:12.2890,title:'Ostia Antica',anchor:'#ostia'},
          {lat:43.7696,lng:11.2558,title:'Florencia',anchor:'#florencia'},
          {lat:43.8060,lng:11.2920,title:'Fiesole',anchor:'#florencia'},
          {lat:43.7080,lng:11.9320,title:'Santuario de La Verna',anchor:'#casentino'},
          {lat:43.7220,lng:11.7660,title:'Poppi / Casentino',anchor:'#casentino'}
        ]
      }
    };

    const config = mapData[mapElement.dataset.map];
    if (config) {
      const map = L.map(mapElement, {scrollWheelZoom:false, tap:true}).setView(config.center, config.zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom:19,
        attribution:'&copy; OpenStreetMap contributors'
      }).addTo(map);

      const bounds = [];
      config.markers.forEach(markerData => {
        bounds.push([markerData.lat, markerData.lng]);
        const href = markerData.url || markerData.anchor;
        const marker = L.marker([markerData.lat, markerData.lng]).addTo(map);
        marker.bindPopup(`<strong>${markerData.title}</strong><br><a href="${href}">Ver propuesta</a>`);
      });

      if (config.line) {
        L.polyline(config.line, {color:'#42ddd4', weight:3, opacity:.8, dashArray:'8 8'}).addTo(map);
      }
      if (window.innerWidth < 760 && bounds.length > 1) map.fitBounds(bounds, {padding:[24,24]});
      setTimeout(() => map.invalidateSize(), 250);
    }
  }

  const exchangeInput = $('#exchangeRate');
  const budgetRows = $$('[data-budget-row]');
  if (exchangeInput && budgetRows.length) {
    const toolbar = $('.budget-toolbar');
    if (toolbar && !$('#travelerCount')) {
      toolbar.insertAdjacentHTML('afterbegin', `
        <div class="field">
          <label for="travelerCount">Número de personas</label>
          <input id="travelerCount" type="number" min="1" max="10" step="1" value="2">
        </div>`);
    }

    const travelerInput = $('#travelerCount');
    const defaultsPerPerson = [1125,260,1000,675,360,240,110,80,325];
    const formatCLP = value => new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value);
    const formatEUR = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);

    const heroText = $('.page-hero p');
    if (heroText) heroText.textContent = 'Cada categoría se estima por persona. El sistema multiplica automáticamente el costo individual por el número de viajeros.';

    const facts = $$('.quick-facts .fact');
    if (facts.length >= 3) {
      facts[0].innerHTML = '<span>Por persona</span><strong id="heroPerPerson">—</strong>';
      facts[1].innerHTML = '<span>Personas</span><strong id="heroPeople">2</strong>';
      facts[2].innerHTML = '<span>Total viaje</span><strong id="heroTotal">—</strong>';
    }

    const budgetHeading = $('main .section-head h2');
    if (budgetHeading) budgetHeading.textContent = 'Presupuesto por persona';
    const budgetIntro = $('main .section-head p');
    if (budgetIntro) budgetIntro.textContent = 'Edita el número de personas, la tasa del euro o cualquier categoría. El costo total se calcula como presupuesto individual multiplicado por viajeros.';

    const headers = $$('table thead th');
    if (headers.length >= 4) {
      headers[2].textContent = 'EUR / persona';
      headers[3].textContent = 'CLP / persona';
      if (headers.length === 4) {
        const groupHeader = document.createElement('th');
        groupHeader.textContent = 'Total grupo CLP';
        headers[3].parentElement.appendChild(groupHeader);
      }
    }

    budgetRows.forEach((row, index) => {
      if (!$('[data-row-total]', row)) {
        const totalCell = document.createElement('td');
        totalCell.className = 'money';
        totalCell.dataset.rowTotal = '';
        row.appendChild(totalCell);
      }

      const input = $('.budget-input', row);
      const savedPerPerson = localStorage.getItem(`viaje2027-budget-pp-${index}`);
      const legacyTotal = localStorage.getItem(`viaje2027-budget-${index}`);
      if (savedPerPerson !== null) {
        input.value = savedPerPerson;
      } else if (legacyTotal !== null && Number.isFinite(Number(legacyTotal))) {
        input.value = String(Number(legacyTotal) / 2);
      } else {
        input.value = String(defaultsPerPerson[index] ?? 0);
      }
    });

    const cards = $$('.budget-card');
    if (cards.length >= 3) {
      $('span', cards[0]).textContent = 'Presupuesto por persona';
      $('strong', cards[0]).id = 'perPersonCLP';
      $('p', cards[0]).id = 'perPersonEUR';

      $('span', cards[1]).textContent = 'Total del viaje';
      $('strong', cards[1]).id = 'totalCLP';
      $('p', cards[1]).id = 'totalEUR';

      $('span', cards[2]).textContent = 'Número de personas';
      $('strong', cards[2]).id = 'travelerCountDisplay';
      $('p', cards[2]).textContent = 'El total grupal es costo individual × viajeros.';
    }

    exchangeInput.value = localStorage.getItem('viaje2027-exchange') || exchangeInput.value;
    travelerInput.value = localStorage.getItem('viaje2027-people') || travelerInput.value;

    const updateBudget = () => {
      const rate = Math.max(1, Number(exchangeInput.value) || 1080);
      const people = Math.max(1, Math.round(Number(travelerInput.value) || 1));
      travelerInput.value = String(people);
      let perPersonEUR = 0;

      budgetRows.forEach((row, index) => {
        const input = $('.budget-input', row);
        const eurPerPerson = Math.max(0, Number(input.value) || 0);
        perPersonEUR += eurPerPerson;
        $('[data-row-clp]', row).textContent = formatCLP(eurPerPerson * rate);
        $('[data-row-total]', row).textContent = formatCLP(eurPerPerson * rate * people);
        localStorage.setItem(`viaje2027-budget-pp-${index}`, String(eurPerPerson));
      });

      const perPersonCLP = perPersonEUR * rate;
      const totalEUR = perPersonEUR * people;
      const totalCLP = perPersonCLP * people;

      localStorage.setItem('viaje2027-exchange', String(rate));
      localStorage.setItem('viaje2027-people', String(people));

      $('#perPersonCLP').textContent = formatCLP(perPersonCLP);
      $('#perPersonEUR').textContent = formatEUR(perPersonEUR);
      $('#totalCLP').textContent = formatCLP(totalCLP);
      $('#totalEUR').textContent = formatEUR(totalEUR);
      $('#travelerCountDisplay').textContent = String(people);

      const heroPerPerson = $('#heroPerPerson');
      const heroPeople = $('#heroPeople');
      const heroTotal = $('#heroTotal');
      if (heroPerPerson) heroPerPerson.textContent = formatCLP(perPersonCLP);
      if (heroPeople) heroPeople.textContent = String(people);
      if (heroTotal) heroTotal.textContent = formatCLP(totalCLP);
    };

    budgetRows.forEach(row => $('.budget-input', row).addEventListener('input', updateBudget));
    exchangeInput.addEventListener('input', updateBudget);
    travelerInput.addEventListener('input', updateBudget);
    updateBudget();
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
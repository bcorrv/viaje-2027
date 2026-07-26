(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE = 'viaje2027-daily-budget-v1';
  const FLIGHTS = 'viaje2027-flight-planner-v2';
  const SETTINGS = 'viaje2027-daily-settings-v1';

  const tripDates = [];
  const start = new Date('2027-02-24T12:00:00');
  for (let i = 0; i < 25; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    tripDates.push(d.toISOString().slice(0, 10));
  }

  const dayLabels = {
    '2027-02-24':'Salida desde Santiago',
    '2027-02-25':'Llegada a Chipre',
    '2027-02-26':'Paphos',
    '2027-02-27':'Paphos · previa carrera',
    '2027-02-28':'Paphos · carrera',
    '2027-03-01':'Paphos → Polis / Latchi',
    '2027-03-02':'Akamas',
    '2027-03-03':'Polis → Troodos',
    '2027-03-04':'Troodos',
    '2027-03-05':'Chipre → Eslovaquia',
    '2027-03-06':'Košice / Prešov',
    '2027-03-07':'Košice → Poloniny',
    '2027-03-08':'Poloniny',
    '2027-03-09':'Poloniny → Tatras',
    '2027-03-10':'Altos Tatras',
    '2027-03-11':'Altos Tatras',
    '2027-03-12':'Eslovaquia → Roma',
    '2027-03-13':'Roma · previa carrera',
    '2027-03-14':'Roma · carrera',
    '2027-03-15':'Roma · recuperación',
    '2027-03-16':'Roma → Florencia',
    '2027-03-17':'Florencia / Fiesole',
    '2027-03-18':'Florencia → Casentino',
    '2027-03-19':'Casentino / La Verna',
    '2027-03-20':'Regreso a Santiago'
  };

  const uid = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const formatDate = iso => new Intl.DateTimeFormat('es-CL', {day:'2-digit',month:'2-digit'}).format(new Date(`${iso}T12:00:00`));
  const formatCLP = value => new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value || 0);
  const formatMoney = (value, currency) => new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-ES', {style:'currency',currency,maximumFractionDigits:0}).format(value || 0);

  const defaultItems = [
    {id:uid(),date:'2027-02-24',name:'Transfer domicilio → aeropuerto SCL',amount:'',currency:'CLP',source:'',observed:'',kind:'transfer'},
    {id:uid(),date:'2027-02-24',name:'Vuelo SCL → PFO/LCA',amount:'',currency:'USD',source:'',observed:'',kind:'flight',flightKey:'scl-cyprus'},
    {id:uid(),date:'2027-02-25',name:'Transfer aeropuerto PFO/LCA → hotel',amount:'',currency:'EUR',source:'',observed:'',kind:'transfer'},
    {id:uid(),date:'2027-02-25',name:'Hotel Paphos · noche 1',amount:'',currency:'EUR',source:'',observed:'',kind:'hotel'},
    {id:uid(),date:'2027-02-26',name:'Hotel Paphos · noche 2',amount:'',currency:'EUR',source:'',observed:'',kind:'hotel'},
    {id:uid(),date:'2027-02-26',name:'Alimentación diaria',amount:'',currency:'EUR',source:'',observed:'',kind:'food'},
    {id:uid(),date:'2027-02-27',name:'Hotel Paphos · noche 3',amount:'',currency:'EUR',source:'',observed:'',kind:'hotel'},
    {id:uid(),date:'2027-02-27',name:'Alimentación diaria',amount:'',currency:'EUR',source:'',observed:'',kind:'food'},
    {id:uid(),date:'2027-02-28',name:'Inscripción carrera Paphos',amount:'',currency:'EUR',source:'',observed:'',kind:'activity'},
    {id:uid(),date:'2027-02-28',name:'Hotel Paphos · noche 4',amount:'',currency:'EUR',source:'',observed:'',kind:'hotel'},
    {id:uid(),date:'2027-03-05',name:'Vuelo LCA → VIE',amount:124,currency:'EUR',source:'https://flights.aegeanair.com/en/flights-from-larnaca-to-vienna',observed:'2026-07-26',kind:'flight',flightKey:'lca-vie'},
    {id:uid(),date:'2027-03-05',name:'Vuelo VIE → KSC',amount:'',currency:'EUR',source:'',observed:'',kind:'flight',flightKey:'vie-ksc'},
    {id:uid(),date:'2027-03-12',name:'Vuelo VIE/BUD/KSC → FCO',amount:'',currency:'EUR',source:'',observed:'',kind:'flight',flightKey:'sk-rome'},
    {id:uid(),date:'2027-03-14',name:'Inscripción Maratón de Roma',amount:'',currency:'EUR',source:'',observed:'',kind:'activity'},
    {id:uid(),date:'2027-03-15',name:'Entrada Ostia Antica',amount:18,currency:'EUR',source:'https://ostiaantica.cultura.gov.it/en/info/integrated-tickets-archaeological-park-of-ostia-antica/',observed:'2026-07-26',kind:'activity'},
    {id:uid(),date:'2027-03-16',name:'Tren Roma → Florencia',amount:'',currency:'EUR',source:'',observed:'',kind:'transport'},
    {id:uid(),date:'2027-03-20',name:'Vuelo Italia → SCL',amount:'',currency:'USD',source:'',observed:'',kind:'flight',flightKey:'italy-scl'}
  ];

  const loadSettings = () => ({people:2, eurClp:1080, usdClp:950, ...JSON.parse(localStorage.getItem(SETTINGS) || '{}')});
  const saveSettings = value => localStorage.setItem(SETTINGS, JSON.stringify(value));
  const loadItems = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    return Array.isArray(saved) ? saved : defaultItems;
  };
  const saveItems = items => localStorage.setItem(STORAGE, JSON.stringify(items));
  const loadFlights = () => {
    const saved = JSON.parse(localStorage.getItem(FLIGHTS) || 'null');
    return Array.isArray(saved) ? saved : [
      {id:uid(),key:'scl-cyprus',date:'2027-02-24',origin:'SCL',destination:'PFO/LCA',option:'Vuelo internacional',amount:'',currency:'USD',source:'',observed:''},
      {id:uid(),key:'lca-vie',date:'2027-03-05',origin:'LCA',destination:'VIE',option:'AEGEAN',amount:124,currency:'EUR',source:'https://flights.aegeanair.com/en/flights-from-larnaca-to-vienna',observed:'2026-07-26'},
      {id:uid(),key:'vie-ksc',date:'2027-03-05',origin:'VIE',destination:'KSC',option:'Conexión regional',amount:'',currency:'EUR',source:'',observed:''},
      {id:uid(),key:'sk-rome',date:'2027-03-12',origin:'KSC/VIE/BUD',destination:'FCO',option:'Ruta por definir',amount:'',currency:'EUR',source:'',observed:''},
      {id:uid(),key:'italy-scl',date:'2027-03-20',origin:'FLR/BLQ/FCO',destination:'SCL',option:'Vuelo internacional',amount:'',currency:'USD',source:'',observed:''}
    ];
  };
  const saveFlights = flights => localStorage.setItem(FLIGHTS, JSON.stringify(flights));

  const itemCLP = (item, settings) => {
    const amount = Number(item.amount) || 0;
    if (item.currency === 'CLP') return amount;
    if (item.currency === 'USD') return amount * settings.usdClp;
    return amount * settings.eurClp;
  };

  const syncFlightsIntoBudget = (items, flights) => {
    flights.forEach(flight => {
      let item = items.find(entry => entry.flightKey === flight.key);
      if (!item) {
        item = {id:uid(),kind:'flight',flightKey:flight.key};
        items.push(item);
      }
      item.date = flight.date;
      item.name = `Vuelo ${flight.origin} → ${flight.destination}${flight.option ? ` · ${flight.option}` : ''}`;
      item.amount = flight.amount;
      item.currency = flight.currency;
      item.source = flight.source;
      item.observed = flight.observed;
    });
    return items;
  };

  const initBudgetPage = () => {
    const root = $('#dailyBudgetRoot');
    if (!root) return;
    let settings = loadSettings();
    let items = syncFlightsIntoBudget(loadItems(), loadFlights());
    saveItems(items);

    const peopleInput = $('#travelerCount');
    const eurInput = $('#eurRate');
    const usdInput = $('#usdRate');
    peopleInput.value = settings.people;
    eurInput.value = settings.eurClp;
    usdInput.value = settings.usdClp;

    const render = () => {
      settings = {people:Math.max(1, Number(peopleInput.value) || 1), eurClp:Number(eurInput.value)||1080, usdClp:Number(usdInput.value)||950};
      saveSettings(settings);
      root.innerHTML = '';
      let totalPerPerson = 0;
      let confirmed = 0;
      const dailyTotals = [];

      tripDates.forEach((date, index) => {
        const dayItems = items.filter(item => item.date === date);
        const dayTotal = dayItems.reduce((sum, item) => sum + itemCLP(item, settings), 0);
        totalPerPerson += dayTotal;
        confirmed += dayItems.filter(item => Number(item.amount) > 0 && item.source).length;
        dailyTotals.push(dayTotal);

        const article = document.createElement('article');
        article.className = 'panel day-card';
        article.id = `day-${date}`;
        article.innerHTML = `<div class="day-head"><div class="day-title"><div class="day-number">${index+1}</div><div><h3>${formatDate(date)} · ${dayLabels[date] || ''}</h3><p>${dayItems.length} movimiento${dayItems.length === 1 ? '' : 's'}</p></div></div><div class="day-total"><span>Total día / persona</span><strong>${formatCLP(dayTotal)}</strong></div></div><div class="day-body"><div class="day-items"></div><button class="btn btn-secondary add-item-btn" type="button">+ Agregar gasto este día</button></div>`;
        const list = $('.day-items', article);
        dayItems.forEach(item => list.appendChild(buildBudgetLine(item)));
        $('.add-item-btn', article).addEventListener('click', () => {
          items.push({id:uid(),date,name:'Nuevo gasto',amount:'',currency:'CLP',source:'',observed:'',kind:'other'});
          saveItems(items);
          render();
        });
        root.appendChild(article);
      });

      const totalGroup = totalPerPerson * settings.people;
      $('#dailyPerPerson').textContent = formatCLP(totalPerPerson / tripDates.length);
      $('#totalPerPerson').textContent = formatCLP(totalPerPerson);
      $('#totalGroup').textContent = formatCLP(totalGroup);
      $('#confirmedCount').textContent = String(confirmed);
      $('#heroPeople').textContent = String(settings.people);
      $('#heroPerPerson').textContent = formatCLP(totalPerPerson);
      $('#heroTotal').textContent = formatCLP(totalGroup);
      drawDailyChart(dailyTotals);
    };

    const buildBudgetLine = item => {
      const line = document.createElement('div');
      line.className = `budget-line${item.flightKey ? ' linked' : ''}`;
      const statusOk = Number(item.amount) > 0 && Boolean(item.source);
      line.innerHTML = `
        <div class="line-field"><label>Concepto</label><input data-field="name" value="${escapeHtml(item.name || '')}">${item.flightKey ? '<div class="line-status"><span class="status-dot status-ok"></span><span class="status-text">Vinculado al planificador de vuelos</span></div>' : ''}</div>
        <div class="line-field"><label>Monto</label><input data-field="amount" type="number" min="0" step="0.01" value="${item.amount ?? ''}" ${item.flightKey ? 'readonly' : ''}></div>
        <div class="line-field"><label>Moneda</label><select data-field="currency" ${item.flightKey ? 'disabled' : ''}><option>CLP</option><option>USD</option><option>EUR</option></select></div>
        <div class="line-field"><label>CLP / persona</label><div class="line-value">${formatCLP(itemCLP(item, settings))}</div></div>
        <div class="line-field"><label>CLP grupo</label><div class="line-value">${formatCLP(itemCLP(item, settings) * settings.people)}</div></div>
        <div class="line-field"><label>Fuente</label><div class="source-actions"><input data-field="source" value="${escapeHtml(item.source || '')}" placeholder="Pega el link" ${item.flightKey ? 'readonly' : ''}><a href="${item.source || '#'}" target="_blank" rel="noopener" aria-label="Abrir fuente">↗</a></div><div class="line-status"><span class="status-dot ${statusOk ? 'status-ok' : 'status-pending'}"></span><span class="status-text">${statusOk ? `Cotizado · ${item.observed || 'sin fecha'}` : 'Pendiente de precio o fuente'}</span></div></div>
        ${item.flightKey ? `<a class="line-link" href="planificacion.html#flight-${item.flightKey}">Editar vuelo</a>` : '<button class="line-delete" type="button">×</button>'}
      `;
      $('[data-field="currency"]', line).value = item.currency || 'CLP';
      $$('[data-field]', line).forEach(control => control.addEventListener('change', () => {
        if (item.flightKey) return;
        item[control.dataset.field] = control.value;
        if (control.dataset.field === 'amount' || control.dataset.field === 'source') item.observed = new Date().toISOString().slice(0,10);
        saveItems(items);
        render();
      }));
      const deleteButton = $('.line-delete', line);
      if (deleteButton) deleteButton.addEventListener('click', () => {
        items = items.filter(entry => entry.id !== item.id);
        saveItems(items);
        render();
      });
      return line;
    };

    [peopleInput, eurInput, usdInput].forEach(input => input.addEventListener('input', render));
    render();
  };

  const initFlightPlanner = () => {
    const root = $('#flightPlannerRoot');
    if (!root) return;
    let flights = loadFlights();

    const render = () => {
      root.innerHTML = '';
      flights.forEach(flight => {
        const card = document.createElement('article');
        card.className = 'panel flight-card';
        card.id = `flight-${flight.key}`;
        card.innerHTML = `
          <div class="flight-card-head"><div><h3>${formatDate(flight.date)} · ${escapeHtml(flight.origin)} → ${escapeHtml(flight.destination)}</h3><p>El precio de este tramo se refleja automáticamente en el día correspondiente del presupuesto.</p></div><button class="flight-delete" type="button" aria-label="Eliminar">×</button></div>
          <div class="flight-grid">
            <label>Fecha<input data-field="date" type="date" value="${flight.date}"></label>
            <label>Origen<input data-field="origin" value="${escapeHtml(flight.origin)}"></label>
            <label>Destino<input data-field="destination" value="${escapeHtml(flight.destination)}"></label>
            <label>Aerolínea / opción<input data-field="option" value="${escapeHtml(flight.option || '')}"></label>
            <label>Precio / persona<input data-field="amount" type="number" min="0" step="0.01" value="${flight.amount ?? ''}"></label>
            <label>Moneda<select data-field="currency"><option>USD</option><option>EUR</option><option>CLP</option></select></label>
            <label class="wide">Link de cotización<input data-field="source" value="${escapeHtml(flight.source || '')}" placeholder="URL de la tarifa"></label>
            <label>Fecha observada<input data-field="observed" type="date" value="${flight.observed || ''}"></label>
          </div>
          <div class="flight-actions"><a class="btn btn-secondary" href="presupuesto.html#day-${flight.date}">Ver reflejo en presupuesto</a><a class="btn btn-secondary" href="${flight.source || '#'}" target="_blank" rel="noopener">Abrir cotización</a><span class="flight-sync-status">${Number(flight.amount)>0 && flight.source ? 'Sincronizado' : 'Pendiente de precio o fuente'}</span></div>`;
        $('[data-field="currency"]', card).value = flight.currency || 'EUR';
        $$('[data-field]', card).forEach(control => control.addEventListener('change', () => {
          flight[control.dataset.field] = control.value;
          saveFlights(flights);
          const items = syncFlightsIntoBudget(loadItems(), flights);
          saveItems(items);
          render();
        }));
        $('.flight-delete', card).addEventListener('click', () => {
          flights = flights.filter(entry => entry.id !== flight.id);
          saveFlights(flights);
          const items = loadItems().filter(item => item.flightKey !== flight.key);
          saveItems(syncFlightsIntoBudget(items, flights));
          render();
        });
        root.appendChild(card);
      });
    };

    $('#addFlightBtn')?.addEventListener('click', () => {
      flights.push({id:uid(),key:uid(),date:'2027-02-24',origin:'',destination:'',option:'',amount:'',currency:'USD',source:'',observed:''});
      saveFlights(flights);
      render();
    });
    render();
  };

  const drawDailyChart = values => {
    const canvas = $('#dailyChart');
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 900;
    const height = canvas.clientHeight || 260;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.clearRect(0,0,width,height);
    const max = Math.max(...values,1);
    const gap = 5;
    const barWidth = Math.max(6,(width - gap*(values.length-1))/values.length);
    values.forEach((value,index) => {
      const h = (value/max)*(height-42);
      const x = index*(barWidth+gap);
      const y = height-h-22;
      ctx.fillStyle = value ? '#42ddd4' : '#26373f';
      ctx.fillRect(x,y,barWidth,h || 2);
      if ((index+1)%3===1 || index===values.length-1) {
        ctx.fillStyle = '#8fa1a9';
        ctx.font = '10px system-ui';
        ctx.fillText(String(index+1),x,height-5);
      }
    });
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  initBudgetPage();
  initFlightPlanner();
})();
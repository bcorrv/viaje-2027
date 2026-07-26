(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const OBSERVED = '2026-07-26';
  const fmtCLP = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const fmtEUR = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(n)||0);
  const clone = value => JSON.parse(JSON.stringify(value));
  const people = () => Math.max(1, Math.round(Number(localStorage.getItem('viaje2027-people')) || 2));
  const rate = () => Math.max(1, Number(localStorage.getItem('viaje2027-exchange')) || 1080);
  const days = () => Math.max(1, Math.round(Number(localStorage.getItem('viaje2027-days')) || 25));

  const DEFAULT_FLIGHTS = [
    {id:'scl-lca',date:'2027-02-24',from:'SCL',to:'LCA / PFO',option:'Cotización exacta pendiente',amount:'',currency:'CLP',source:'https://www.klm.cl/es-cl/vuelos-desde-santiago-de-chile-a-larnaca',quoted:'',note:'Debe incluir equipaje facturado y tasas.'},
    {id:'lca-vie',date:'2027-03-04',from:'LCA',to:'VIE',option:'AEGEAN · tarifa publicada para la fecha',amount:124,currency:'EUR',source:'https://flights.aegeanair.com/en/flights-from-larnaca-to-vienna',quoted:OBSERVED,note:'One-way publicado para el 04/03/2027; extras opcionales pueden modificar el total.'},
    {id:'vie-fco',date:'2027-03-12',from:'VIE',to:'FCO',option:'Austrian · tarifa de ruta publicada desde',amount:104,currency:'EUR',source:'https://www.austrian.com/lhg/at/en/o-d/cy-cy/vienna-rome',quoted:OBSERVED,note:'Tarifa publicada desde €104; verificar la salida exacta del 12/03 antes de comprar.'},
    {id:'italia-scl',date:'2027-03-20',from:'FCO / FLR / BLQ',to:'SCL',option:'Cotización exacta pendiente',amount:'',currency:'CLP',source:'https://www.iberia.com/cl/vuelos-baratos/Roma-Santiago-de-Chile/',quoted:'',note:'Comparar Florencia, Bolonia y Roma con equipaje y conexión protegida.'}
  ];
  const loadFlights = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('viaje2027-flight-legs'));
      return Array.isArray(saved) && saved.length ? saved : clone(DEFAULT_FLIGHTS);
    } catch { return clone(DEFAULT_FLIGHTS); }
  };
  const saveFlights = legs => localStorage.setItem('viaje2027-flight-legs', JSON.stringify(legs));
  const verifiedFlight = leg => Number(leg.amount) > 0 && /^https?:\/\//i.test(leg.source || '') && Boolean(leg.quoted);
  const flightEUR = (leg, fx) => leg.currency === 'CLP' ? Number(leg.amount || 0) / fx : Number(leg.amount || 0);

  const flightBody = $('#flightPlannerRows');
  if (flightBody) {
    let legs = loadFlights();
    const renderFlights = () => {
      const fx = rate();
      const pax = people();
      flightBody.innerHTML = '';
      legs.forEach((leg, index) => {
        const verified = verifiedFlight(leg);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input class="flight-input" type="date" data-field="date" value="${leg.date || ''}"></td>
          <td><input class="flight-input code-input" data-field="from" value="${leg.from || ''}" placeholder="SCL"></td>
          <td><input class="flight-input code-input" data-field="to" value="${leg.to || ''}" placeholder="LCA"></td>
          <td><input class="flight-input option-input" data-field="option" value="${String(leg.option || '').replaceAll('"','&quot;')}" placeholder="Aerolínea / tarifa"></td>
          <td><input class="flight-input price-input" type="number" min="0" step="0.01" data-field="amount" value="${leg.amount ?? ''}" placeholder="Pendiente"></td>
          <td><select class="flight-input" data-field="currency"><option value="EUR" ${leg.currency==='EUR'?'selected':''}>EUR</option><option value="CLP" ${leg.currency==='CLP'?'selected':''}>CLP</option></select></td>
          <td><div class="source-cell"><input class="flight-input source-input" type="url" data-field="source" value="${leg.source || ''}" placeholder="https://..."><input class="flight-input date-input" type="date" data-field="quoted" value="${leg.quoted || ''}" aria-label="Fecha de cotización">${leg.source ? `<a class="source-open" href="${leg.source}" target="_blank" rel="noopener">Abrir</a>` : ''}</div></td>
          <td><span class="${verified?'verified-badge':'pending-badge'}">${verified?'Incluido':'Pendiente'}</span></td>
          <td><button class="icon-button remove-leg" type="button" aria-label="Eliminar tramo">×</button></td>`;
        $$('[data-field]', tr).forEach(input => input.addEventListener('change', event => {
          legs[index][event.target.dataset.field] = event.target.value;
          saveFlights(legs);
          renderFlights();
        }));
        $('.remove-leg', tr).addEventListener('click', () => {
          legs.splice(index, 1); saveFlights(legs); renderFlights();
        });
        flightBody.appendChild(tr);
      });
      const confirmed = legs.filter(verifiedFlight);
      const totalPP = confirmed.reduce((sum, leg) => sum + flightEUR(leg, fx), 0);
      $('#flightTotalPP').textContent = fmtCLP(totalPP * fx);
      $('#flightTotalPPEur').textContent = fmtEUR(totalPP);
      $('#flightTotalGroup').textContent = fmtCLP(totalPP * fx * pax);
      $('#flightPeopleText').textContent = `${pax} ${pax === 1 ? 'persona' : 'personas'}`;
      $('#flightPending').textContent = String(legs.length - confirmed.length);
      localStorage.setItem('viaje2027-flight-total-eur-pp', String(totalPP));
    };
    $('#addFlightLeg')?.addEventListener('click', () => {
      legs.push({id:`flight-${Date.now()}`,date:'',from:'',to:'',option:'',amount:'',currency:'EUR',source:'',quoted:'',note:''});
      saveFlights(legs); renderFlights();
    });
    renderFlights();
  }

  const FIXED_QUOTES = [
    {id:'paphos-hotel',category:'Alojamiento',item:'Paphos · 4 noches · tarifa observada',amountEUR:84,source:'https://www.kayak.ie/Paphos-Hotels.6086.hotel.ksp',sourceLabel:'KAYAK · €42 habitación/noche',quoted:OBSERVED,detail:'€42 × 4 noches ÷ 2 personas. Tarifa observada; verificar fechas antes de reservar.'},
    {id:'polis-hotel',category:'Alojamiento',item:'Polis · Polis 1907 · 2 noches',amountEUR:146,source:'https://www.google.com.cy/travel/hotels/entity/CgsIh8vBlPf7xNqbARAB',sourceLabel:'Google Hotels · €146 habitación/noche',quoted:OBSERVED,detail:'€146 × 2 noches ÷ 2 personas. Tarifa observada.'},
    {id:'kosice-hotel',category:'Alojamiento',item:'Košice · Hotel Múza · 2 noches',amountEUR:104,source:'https://www.hotels.com/re631280978695720960/hotels-in-kosice-slovakia/',sourceLabel:'Hotels.com · €208 por habitación',quoted:OBSERVED,detail:'€208 total ÷ 2 personas. Tarifa observada.'},
    {id:'tatras-hotel',category:'Alojamiento',item:'Starý Smokovec · alojamiento ŽSR · 3 noches',amountEUR:124.5,source:'https://www.zsr.sk/sluzby-verejnosti/obchod-a-vzdelavanie/ustredny-institut-vzdelavania-a-psychologie/ubytuj-sa-vyhodne/stary-smokovec',sourceLabel:'ŽSR · €38 + €3,50 de tasa por noche',quoted:OBSERVED,detail:'€41,50 por persona/noche × 3.'},
    {id:'rome-hotel',category:'Alojamiento',item:'Roma · Hotel Forum · 4 noches',amountEUR:236,source:'https://www.hotelforum.com/es/reservas/',sourceLabel:'Hotel Forum · desde €118 habitación/noche',quoted:OBSERVED,detail:'€118 × 4 noches ÷ 2 personas. Tarifa publicada desde.'},
    {id:'florence-hotel',category:'Alojamiento',item:'Florencia · Hotel Bavaria · 2 noches',amountEUR:82.8,source:'https://www.hotelbavariafirenze.it/',sourceLabel:'Hotel Bavaria · €82,80 habitación/noche',quoted:OBSERVED,detail:'€82,80 × 2 noches ÷ 2 personas.'},
    {id:'casentino-hotel',category:'Alojamiento',item:'Casentino · Borgo Tramonte · 3 noches',amountEUR:150,source:'https://borgotramonte.it/en/rates/',sourceLabel:'Borgo Tramonte · €100 habitación/noche',quoted:OBSERVED,detail:'€100 × 3 noches ÷ 2 personas.'},
    {id:'rome-marathon',category:'Carreras y actividades',item:'Inscripción Maratón de Roma 2027',amountEUR:109,source:'https://worldsmarathons.com/es/marathon/rome-marathon?q=full_marathon',sourceLabel:'World’s Marathons · €109',quoted:OBSERVED,detail:'Precio publicado por participante; verificar comisión final.'},
    {id:'ostia',category:'Carreras y actividades',item:'Entrada completa Ostia Antica',amountEUR:18,source:'https://ostiaantica.cultura.gov.it/en/info/archaeological-area-of-ostia-antica-visitor-information/',sourceLabel:'Sitio oficial · €18',quoted:OBSERVED,detail:'Ticket completo individual.'},
    {id:'slovakia-food',category:'Alimentación',item:'Eslovaquia · 7 cantinas + 7 comidas de restaurante',amountEUR:84,source:'https://www.euraxess.sk/slovakia/information-assistance/daily-life',sourceLabel:'EURAXESS Slovakia · €5 + €7 diarios',quoted:OBSERVED,detail:'7 × (€5 cantina + €7 restaurante). Precios publicados por tipo de comida.'}
  ];
  const PENDING = [
    'Vuelo Santiago → Larnaca/Paphos con equipaje y fecha exacta',
    'Vuelo Italia → Santiago con equipaje y fecha exacta',
    'Alojamiento Troodos · 2 noches con fechas definitivas',
    'Alojamiento Poloniny · 2 noches con fechas definitivas',
    'Alimentación en Chipre e Italia con menús o proveedores definidos',
    'Autos, seguros, combustible y peajes con cotización fechada',
    'Seguro de viaje con cobertura médica y deportiva',
    'Trenes y transporte terrestre cuando abra la venta',
    'Inscripción de Paphos según distancia elegida'
  ];
  const loadCustom = () => { try { const q=JSON.parse(localStorage.getItem('viaje2027-custom-quotes')); return Array.isArray(q)?q:[]; } catch { return []; } };
  const saveCustom = quotes => localStorage.setItem('viaje2027-custom-quotes', JSON.stringify(quotes));

  const budgetBody = $('#budgetRows');
  if (budgetBody) {
    const paxInput = $('#travelerCount');
    const daysInput = $('#tripDays');
    const fxInput = $('#exchangeRate');
    paxInput.value = people(); daysInput.value = days(); fxInput.value = rate();
    let customQuotes = loadCustom();
    let currentItems = [];
    const colors = ['#42ddd4','#e8bf77','#ff816b','#8fd7a7','#8ea8ff','#d78fff','#5cc8ff','#ffb15c','#75e0a7','#f08cab','#b7cf67','#c7a7ff'];

    const quoteItems = () => {
      const fx = Math.max(1, Number(fxInput.value) || 1080);
      const flights = loadFlights().filter(verifiedFlight).map(leg => ({
        id:`budget-${leg.id}`,category:'Vuelos',item:`Vuelo ${leg.from} → ${leg.to} · ${leg.date}`,amountEUR:flightEUR(leg,fx),source:leg.source,sourceLabel:leg.option || 'Vuelo cotizado',quoted:leg.quoted,detail:leg.note || 'Precio por persona.'
      }));
      const custom = customQuotes.map(q => ({...q,amountEUR:q.currency==='CLP'?Number(q.amount)/fx:Number(q.amount)}));
      return [...flights,...FIXED_QUOTES,...custom].filter(q => Number(q.amountEUR)>0 && /^https?:\/\//i.test(q.source || '') && q.quoted);
    };
    const aggregate = items => {
      const groups = new Map();
      items.forEach(item => groups.set(item.category,(groups.get(item.category)||0)+item.amountEUR));
      return [...groups.entries()].map(([label,value])=>({label,value}));
    };
    const drawDonut = groups => {
      const canvas = $('#budgetChart'); if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = Math.max(220,Math.min(canvas.parentElement.clientWidth || 320,350));
      const dpr = window.devicePixelRatio || 1;
      canvas.width=size*dpr; canvas.height=size*dpr; canvas.style.width=`${size}px`; canvas.style.height=`${size}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,size,size);
      const total=groups.reduce((s,g)=>s+g.value,0),cx=size/2,cy=size/2,r=size*.40,inner=size*.25;
      if (!total) {ctx.strokeStyle='#2a3a43';ctx.lineWidth=r-inner;ctx.beginPath();ctx.arc(cx,cy,(r+inner)/2,0,Math.PI*2);ctx.stroke();return;}
      let angle=-Math.PI/2;
      groups.forEach((g,i)=>{const sweep=g.value/total*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+sweep);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();angle+=sweep;});
      ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(cx,cy,inner,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
    };

    const renderBudget = () => {
      const pax=Math.max(1,Math.round(Number(paxInput.value)||1));
      const tripDays=Math.max(1,Math.round(Number(daysInput.value)||1));
      const fx=Math.max(1,Number(fxInput.value)||1080);
      paxInput.value=pax;daysInput.value=tripDays;
      localStorage.setItem('viaje2027-people',String(pax));localStorage.setItem('viaje2027-days',String(tripDays));localStorage.setItem('viaje2027-exchange',String(fx));
      const items=quoteItems();currentItems=items;budgetBody.innerHTML='';
      items.forEach(item=>{
        const pp=item.amountEUR*fx,daily=pp/tripDays,group=pp*pax;
        const remove=String(item.id).startsWith('custom-')?`<button class="quote-delete" data-delete="${item.id}" aria-label="Eliminar cotización">×</button>`:'';
        const row=document.createElement('tr');
        row.innerHTML=`<td><strong>${item.item}</strong><small>${item.category} · ${item.detail||''}</small>${remove}</td><td><a href="${item.source}" target="_blank" rel="noopener">${item.sourceLabel||'Abrir fuente'}</a><small>Observado: ${item.quoted}</small></td><td class="money">${fmtEUR(item.amountEUR)}</td><td class="money">${fmtCLP(pp)}</td><td class="money daily-money">${fmtCLP(daily)}</td><td class="money">${fmtCLP(group)}</td>`;
        budgetBody.appendChild(row);
      });
      $$('.quote-delete',budgetBody).forEach(btn=>btn.addEventListener('click',()=>{customQuotes=customQuotes.filter(q=>q.id!==btn.dataset.delete);saveCustom(customQuotes);renderBudget();}));
      const totalEURpp=items.reduce((s,i)=>s+i.amountEUR,0),totalPP=totalEURpp*fx,dailyPP=totalPP/tripDays,totalGroup=totalPP*pax;
      $('#perPersonCLP').textContent=fmtCLP(totalPP);$('#perPersonEUR').textContent=fmtEUR(totalEURpp);$('#dailyPerPerson').textContent=fmtCLP(dailyPP);$('#totalCLP').textContent=fmtCLP(totalGroup);$('#totalEUR').textContent=fmtEUR(totalEURpp*pax);$('#heroPerPerson').textContent=fmtCLP(totalPP);$('#heroDaily').textContent=fmtCLP(dailyPP);$('#heroPeople').textContent=String(pax);$('#heroTotal').textContent=fmtCLP(totalGroup);$('#chartTotal').textContent=fmtCLP(totalPP);
      const pendingFlights=loadFlights().filter(leg=>!verifiedFlight(leg));$('#pendingCount').textContent=String(PENDING.length+pendingFlights.length);
      const groups=aggregate(items),legend=$('#budgetLegend');legend.innerHTML='';
      groups.forEach((g,i)=>legend.insertAdjacentHTML('beforeend',`<div class="legend-row"><span class="legend-swatch" style="background:${colors[i%colors.length]}"></span><span>${g.label}</span><strong>${totalEURpp?(g.value/totalEURpp*100).toFixed(1):'0.0'}%</strong></div>`));
      drawDonut(groups);
      const pending=$('#pendingBudgetList');pending.innerHTML='';
      [...pendingFlights.map(f=>`Vuelo ${f.from} → ${f.to}`),...PENDING].forEach(text=>pending.insertAdjacentHTML('beforeend',`<div class="pending-item"><span>●</span><div>${text}</div></div>`));
      const sources=$('#sourceList');sources.innerHTML='';
      items.forEach(item=>sources.insertAdjacentHTML('beforeend',`<a class="source-link" href="${item.source}" target="_blank" rel="noopener"><strong>${item.item}</strong><span>${item.sourceLabel||item.source} · ${item.quoted}</span></a>`));
    };
    [paxInput,daysInput,fxInput].forEach(input=>input.addEventListener('input',renderBudget));
    window.addEventListener('resize',()=>drawDonut(aggregate(currentItems)));
    $('#quoteForm')?.addEventListener('submit',event=>{
      event.preventDefault();
      const quote={id:`custom-${Date.now()}`,category:$('#quoteCategory').value,item:$('#quoteItem').value.trim(),amount:Number($('#quoteAmount').value),currency:$('#quoteCurrency').value,source:$('#quoteSource').value.trim(),sourceLabel:'Cotización ingresada',quoted:$('#quoteDate').value||OBSERVED,detail:'Precio real ingresado manualmente.'};
      if(!quote.item||quote.amount<=0||!/^https?:\/\//i.test(quote.source)) return;
      customQuotes.push(quote);saveCustom(customQuotes);event.target.reset();$('#quoteDate').value=OBSERVED;renderBudget();
    });
    renderBudget();
  }
})();
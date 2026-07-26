(() => {
  const KEY = 'viaje2027-daily-budget-v1';
  const uid = () => `seed-${Math.random().toString(16).slice(2)}`;
  const current = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (!Array.isArray(current)) return;

  const add = (date, name, currency = 'EUR', kind = 'other', extras = {}) => {
    const exists = current.some(item => item.date === date && (item.name === name || (extras.flightKey && item.flightKey === extras.flightKey)));
    if (!exists) current.push({id:uid(),date,name,amount:'',currency,source:'',observed:'',kind,seeded:true,...extras});
  };

  const days = ['2027-02-24','2027-02-25','2027-02-26','2027-02-27','2027-02-28','2027-03-01','2027-03-02','2027-03-03','2027-03-04','2027-03-05','2027-03-06','2027-03-07','2027-03-08','2027-03-09','2027-03-10','2027-03-11','2027-03-12','2027-03-13','2027-03-14','2027-03-15','2027-03-16','2027-03-17','2027-03-18','2027-03-19','2027-03-20'];
  days.forEach(date => add(date, 'Alimentación diaria', 'EUR', 'food'));

  add('2027-02-24','Transfer domicilio → aeropuerto SCL','CLP','transfer');
  add('2027-02-24','Vuelo SCL → PFO/LCA','USD','flight',{flightKey:'scl-cyprus'});
  add('2027-02-25','Transfer aeropuerto PFO/LCA → hotel','EUR','transfer');
  add('2027-03-05','Vuelo LCA → VIE · AEGEAN','EUR','flight',{flightKey:'lca-vie',amount:124,source:'https://flights.aegeanair.com/en/flights-from-larnaca-to-vienna',observed:'2026-07-26'});
  add('2027-03-05','Vuelo VIE → KSC','EUR','flight',{flightKey:'vie-ksc'});
  add('2027-03-12','Vuelo KSC/VIE/BUD → FCO','EUR','flight',{flightKey:'sk-rome'});
  add('2027-03-20','Vuelo FLR/BLQ/FCO → SCL','USD','flight',{flightKey:'italy-scl'});

  const hotelNights = {
    '2027-02-25':'Hotel Paphos · noche 1','2027-02-26':'Hotel Paphos · noche 2','2027-02-27':'Hotel Paphos · noche 3','2027-02-28':'Hotel Paphos · noche 4',
    '2027-03-01':'Alojamiento Polis / Latchi · noche 1','2027-03-02':'Alojamiento Polis / Latchi · noche 2','2027-03-03':'Alojamiento Troodos · noche 1','2027-03-04':'Alojamiento Troodos · noche 2',
    '2027-03-05':'Alojamiento Košice / Prešov · noche 1','2027-03-06':'Alojamiento Košice / Prešov · noche 2','2027-03-07':'Alojamiento Poloniny · noche 1','2027-03-08':'Alojamiento Poloniny · noche 2',
    '2027-03-09':'Alojamiento Tatras · noche 1','2027-03-10':'Alojamiento Tatras · noche 2','2027-03-11':'Alojamiento Tatras · noche 3','2027-03-12':'Hotel Roma · noche 1',
    '2027-03-13':'Hotel Roma · noche 2','2027-03-14':'Hotel Roma · noche 3','2027-03-15':'Hotel Roma · noche 4','2027-03-16':'Hotel Florencia · noche 1',
    '2027-03-17':'Hotel Florencia · noche 2','2027-03-18':'Alojamiento Casentino · noche 1','2027-03-19':'Alojamiento Casentino · noche 2'
  };
  Object.entries(hotelNights).forEach(([date,name]) => add(date,name,'EUR','hotel'));

  [
    ['2027-03-01','Arriendo auto Chipre · día 1'],['2027-03-02','Arriendo auto Chipre · día 2'],['2027-03-03','Arriendo auto Chipre · día 3'],['2027-03-04','Arriendo auto Chipre · día 4'],
    ['2027-03-01','Combustible y estacionamiento Chipre'],['2027-03-03','Combustible y estacionamiento Chipre'],
    ['2027-03-07','Arriendo auto Eslovaquia · día 1'],['2027-03-08','Arriendo auto Eslovaquia · día 2'],['2027-03-09','Arriendo auto Eslovaquia · día 3'],['2027-03-10','Arriendo auto Eslovaquia · día 4'],['2027-03-11','Arriendo auto Eslovaquia · día 5'],
    ['2027-03-07','Combustible y estacionamiento Eslovaquia'],['2027-03-09','Combustible y estacionamiento Eslovaquia'],['2027-03-12','Transfer aeropuerto FCO → hotel'],['2027-03-16','Tren Roma → Florencia'],
    ['2027-03-18','Arriendo auto Toscana · día 1'],['2027-03-19','Arriendo auto Toscana · día 2'],['2027-03-20','Arriendo auto Toscana · día 3'],['2027-03-18','Combustible / peajes Toscana'],
    ['2027-03-20','Transfer al aeropuerto de salida'],['2027-03-20','Transfer aeropuerto SCL → domicilio']
  ].forEach(([date,name]) => add(date,name,date==='2027-03-20'&&name.includes('SCL')?'CLP':'EUR','transport'));

  [
    ['2027-02-28','Inscripción carrera Paphos'],['2027-03-02','Actividad / sendero Akamas'],['2027-03-04','Iglesias o museos Troodos'],['2027-03-08','Guía local Poloniny'],['2027-03-10','Teleférico / actividad Tatras'],
    ['2027-03-13','Via Appia / transporte local'],['2027-03-14','Inscripción Maratón de Roma'],['2027-03-15','Entrada Ostia Antica'],['2027-03-17','Museo / visita Florencia'],['2027-03-19','La Verna / estacionamiento']
  ].forEach(([date,name]) => add(date,name,'EUR','activity', name==='Entrada Ostia Antica' ? {amount:18,source:'https://ostiaantica.cultura.gov.it/en/info/integrated-tickets-archaeological-park-of-ostia-antica/',observed:'2026-07-26'} : {}));

  localStorage.setItem(KEY, JSON.stringify(current));
})();
(() => {
  const KEY = 'viaje2027-daily-budget-v1';
  const uid = () => `seed-${Math.random().toString(16).slice(2)}`;
  const current = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (!Array.isArray(current)) return;

  const add = (date, name, currency = 'EUR', kind = 'other') => {
    const exists = current.some(item => item.date === date && item.name === name);
    if (!exists) current.push({id:uid(),date,name,amount:'',currency,source:'',observed:'',kind,seeded:true});
  };

  const days = [
    ['2027-02-24','Salida desde Santiago'],['2027-02-25','Llegada a Chipre'],['2027-02-26','Paphos'],['2027-02-27','Paphos · previa carrera'],['2027-02-28','Paphos · carrera'],
    ['2027-03-01','Paphos → Polis / Latchi'],['2027-03-02','Akamas'],['2027-03-03','Polis → Troodos'],['2027-03-04','Troodos'],['2027-03-05','Chipre → Eslovaquia'],
    ['2027-03-06','Košice / Prešov'],['2027-03-07','Košice → Poloniny'],['2027-03-08','Poloniny'],['2027-03-09','Poloniny → Tatras'],['2027-03-10','Altos Tatras'],
    ['2027-03-11','Altos Tatras'],['2027-03-12','Eslovaquia → Roma'],['2027-03-13','Roma · previa carrera'],['2027-03-14','Roma · carrera'],['2027-03-15','Roma · recuperación'],
    ['2027-03-16','Roma → Florencia'],['2027-03-17','Florencia / Fiesole'],['2027-03-18','Florencia → Casentino'],['2027-03-19','Casentino / La Verna'],['2027-03-20','Regreso a Santiago']
  ];

  days.forEach(([date]) => add(date, 'Alimentación diaria', 'EUR', 'food'));

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
    ['2027-03-07','Combustible y estacionamiento Eslovaquia'],['2027-03-09','Combustible y estacionamiento Eslovaquia'],
    ['2027-03-12','Transfer aeropuerto FCO → hotel'],['2027-03-16','Tren Roma → Florencia'],
    ['2027-03-18','Arriendo auto Toscana · día 1'],['2027-03-19','Arriendo auto Toscana · día 2'],['2027-03-20','Arriendo auto Toscana · día 3'],['2027-03-18','Combustible / peajes Toscana'],
    ['2027-03-20','Transfer al aeropuerto de salida'],['2027-03-20','Transfer aeropuerto SCL → domicilio']
  ].forEach(([date,name]) => add(date,name,date==='2027-03-20'&&name.includes('SCL')?'CLP':'EUR','transport'));

  [
    ['2027-03-02','Actividad / sendero Akamas'],['2027-03-04','Iglesias o museos Troodos'],['2027-03-08','Guía local Poloniny'],['2027-03-10','Teleférico / actividad Tatras'],
    ['2027-03-13','Via Appia / transporte local'],['2027-03-14','Inscripción Maratón de Roma'],['2027-03-15','Ostia Antica'],['2027-03-17','Museo / visita Florencia'],['2027-03-19','La Verna / estacionamiento']
  ].forEach(([date,name]) => add(date,name,'EUR','activity'));

  localStorage.setItem(KEY, JSON.stringify(current));
})();
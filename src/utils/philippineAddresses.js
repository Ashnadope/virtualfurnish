/**
 * Philippine Address Data — All 81 Provinces + Metro Manila
 *
 * Hierarchical structure: Province → City/Municipality → Barangay
 * Each city entry includes its postal code so it auto-fills on selection.
 *
 * Sources: Philippine Statistics Authority (PSA), PHLPost
 */

const PH_ADDRESSES = {
  // ═══════════════════════════════════════════════════════
  // NATIONAL CAPITAL REGION (NCR)
  // ═══════════════════════════════════════════════════════
  'Metro Manila': {
    'Caloocan': {
      postalCode: '1400',
      barangays: ['Bagong Barrio', 'Baesa', 'Camarin', 'Deparo', 'Grace Park East', 'Grace Park West', 'Llano', 'Maypajo', 'Morning Breeze', 'Sangandaan', 'Tala', 'Zabarte'],
    },
    'Las Piñas': {
      postalCode: '1740',
      barangays: ['Almanza Uno', 'Almanza Dos', 'BF International', 'Daniel Fajardo', 'Elias Aldana', 'Ilaya', 'Manuyo Uno', 'Manuyo Dos', 'Pamplona Uno', 'Pamplona Dos', 'Pamplona Tres', 'Pilar', 'Pulang Lupa Uno', 'Pulang Lupa Dos', 'Talon Uno', 'Talon Dos', 'Talon Tres', 'Talon Kuatro', 'Talon Singko'],
    },
    'Makati': {
      postalCode: '1200',
      barangays: ['Bangkal', 'Bel-Air', 'Carmona', 'Cembo', 'Comembo', 'Dasmariñas', 'East Rembo', 'Forbes Park', 'Guadalupe Nuevo', 'Guadalupe Viejo', 'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan', 'Pembo', 'Pinagkaisahan', 'Pio del Pilar', 'Poblacion', 'Post Proper Northside', 'Post Proper Southside', 'Rizal', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz', 'Singkamas', 'South Cembo', 'Tejeros', 'Urdaneta', 'Valenzuela', 'West Rembo'],
    },
    'Malabon': {
      postalCode: '1470',
      barangays: ['Acacia', 'Baritan', 'Bayan-bayanan', 'Catmon', 'Concepcion', 'Dampalit', 'Flores', 'Hulong Duhat', 'Ibaba', 'Longos', 'Maysilo', 'Muzon', 'Niugan', 'Potrero', 'San Agustin', 'Santolan', 'Tañong', 'Tinajeros', 'Tonsuya', 'Tugatog'],
    },
    'Mandaluyong': {
      postalCode: '1550',
      barangays: ['Addition Hills', 'Bagong Silang', 'Barangka Drive', 'Barangka Ibaba', 'Barangka Ilaya', 'Barangka Itaas', 'Buayang Bato', 'Hulo', 'Mabini-J. Rizal', 'Malamig', 'Namayan', 'New Zaniga', 'Old Zaniga', 'Pag-asa', 'Plainview', 'Pleasant Hills', 'Poblacion', 'San Jose', 'Vergara', 'Wack-Wack Greenhills'],
    },
    'Manila': {
      postalCode: '1000',
      barangays: ['Balic-Balic', 'Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 'Sampaloc', 'San Andres', 'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'],
    },
    'Marikina': {
      postalCode: '1800',
      barangays: ['Barangka', 'Calumpang', 'Concepcion Uno', 'Concepcion Dos', 'Fortune', 'Industrial Valley', 'Jesus dela Peña', 'Malanday', 'Nangka', 'Parang', 'San Roque', 'Santa Elena', 'Santo Niño', 'Tañong', 'Tumana'],
    },
    'Muntinlupa': {
      postalCode: '1770',
      barangays: ['Alabang', 'Ayala Alabang', 'Bayanan', 'Buli', 'Cupang', 'New Alabang Village', 'Poblacion', 'Putatan', 'Sucat', 'Tunasan'],
    },
    'Navotas': {
      postalCode: '1485',
      barangays: ['Bagumbayan North', 'Bagumbayan South', 'Bangculasi', 'Daanghari', 'Navotas East', 'Navotas West', 'North Bay Boulevard North', 'North Bay Boulevard South', 'San Jose', 'San Roque', 'Sipac-Almacen', 'Tangos', 'Tanza'],
    },
    'Parañaque': {
      postalCode: '1700',
      barangays: ['Baclaran', 'BF Homes', 'Don Bosco', 'Don Galo', 'La Huerta', 'Marcelo Green Village', 'Merville', 'Moonwalk', 'San Antonio', 'San Dionisio', 'San Isidro', 'San Martin de Porres', 'Santo Niño', 'Sun Valley', 'Sucat', 'Tambo', 'Vitalez'],
    },
    'Pasay': {
      postalCode: '1300',
      barangays: ['Baclaran', 'Bay City', 'Cartimar', 'Don Carlos Village', 'La Huerta', 'Malibay', 'Maricaban', 'Newport City', 'Pasay City North', 'Pasay City South', 'San Isidro', 'San Jose', 'San Rafael', 'San Roque', 'Santa Clara', 'Santo Niño', 'Tramo', 'Villamor Airbase'],
    },
    'Pasig': {
      postalCode: '1600',
      barangays: ['Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Buting', 'Caniogan', 'Capitolyo', 'Dela Paz', 'Kalawaan', 'Kapasigan', 'Kapitolyo', 'Manggahan', 'Maybunga', 'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad', 'San Antonio', 'San Joaquin', 'San Jose', 'San Miguel', 'San Nicolas', 'Santa Lucia', 'Santa Rosa', 'Santo Tomas', 'Santolan', 'Sumilang', 'Ugong'],
    },
    'Pateros': {
      postalCode: '1620',
      barangays: ['Aguho', 'Magtanggol', 'Martires del 96', 'Poblacion', 'San Pedro', 'San Roque', 'Santa Ana', 'Santo Rosario-Kanluran', 'Santo Rosario-Silangan', 'Tabacalera'],
    },
    'Quezon City': {
      postalCode: '1100',
      barangays: ['Alicia', 'Apolonio Samson', 'Aurora', 'Bagbag', 'Bagong Pag-asa', 'Bagong Silangan', 'Bahay Toro', 'Balingasa', 'Batasan Hills', 'Blue Ridge', 'Central', 'Commonwealth', 'Culiat', 'Damar', 'Damayan', 'Del Monte', 'Diliman', 'Doña Imelda', 'E. Rodriguez', 'Escopa', 'Fairview', 'Greater Lagro', 'Holy Spirit', 'Horseshoe', 'Kaligayahan', 'Kamuning', 'Katipunan', 'Krus na Ligas', 'Libis', 'Loyola Heights', 'Matandang Balara', 'New Era', 'North Fairview', 'Novaliches Proper', 'Old Balara', 'Pansol', 'Payatas', 'Phil-Am', 'Project 6', 'San Bartolome', 'San Roque', 'Santa Cruz', 'Santa Lucia', 'Santa Monica', 'Santo Domingo', 'Sienna', 'South Triangle', 'Tandang Sora', 'Teachers Village East', 'Teachers Village West', 'U.P. Campus', 'U.P. Village', 'Ugong Norte', 'West Fairview', 'West Triangle', 'White Plains'],
    },
    'San Juan': {
      postalCode: '1500',
      barangays: ['Addition Hills', 'Balong-Bato', 'Batis', 'Corazon de Jesus', 'Ermitaño', 'Greenhills', 'Isabelita', 'Kabayanan', 'Little Baguio', 'Maytunas', 'Onse', 'Pasadeña', 'Pedro Cruz', 'Progreso', 'Rivera', 'Salapan', 'San Perfecto', 'Santa Lucia', 'St. Joseph', 'Tibagan', 'West Crame'],
    },
    'Taguig': {
      postalCode: '1630',
      barangays: ['Bagumbayan', 'Bambang', 'Calzada', 'Central Bicutan', 'Central Signal Village', 'Fort Bonifacio', 'Hagonoy', 'Ibayo-Tipas', 'Katuparan', 'Ligid-Tipas', 'Lower Bicutan', 'Maharlika Village', 'Napindan', 'New Lower Bicutan', 'North Daang Hari', 'North Signal Village', 'Palingon', 'Pinagsama', 'San Miguel', 'Santa Ana', 'South Daang Hari', 'South Signal Village', 'Tanyag', 'Tuktukan', 'Upper Bicutan', 'Ususan', 'Wawa', 'Western Bicutan'],
    },
    'Valenzuela': {
      postalCode: '1440',
      barangays: ['Arkong Bato', 'Bagbaguin', 'Balangkas', 'Bignay', 'Bisig', 'Canumay East', 'Canumay West', 'Coloong', 'Dalandanan', 'Gen. T. de Leon', 'Isla', 'Karuhatan', 'Lawang Bato', 'Lingunan', 'Mabolo', 'Malanday', 'Malinta', 'Mapulang Lupa', 'Marulas', 'Maysan', 'Palasan', 'Parada', 'Paso de Blas', 'Pasolo', 'Polo', 'Punturin', 'Rincon', 'Tagalag', 'Ugong', 'Viente Reales', 'Wawang Pulo'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // REGION I — ILOCOS REGION
  // ═══════════════════════════════════════════════════════
  'Ilocos Norte': {
    'Laoag': {
      postalCode: '2900',
      barangays: ['Balatong', 'Balacad', 'Buttong', 'Cabungaan North', 'Cabungaan South', 'Gabu', 'La Paz', 'Nangalisan East', 'Nangalisan West', 'Pila', 'Rioeng', 'San Lorenzo', 'San Mateo', 'Santa Joaquina'],
    },
    'Batac': {
      postalCode: '2906',
      barangays: ['Ablan', 'Baay', 'Battung', 'Colo', 'Lacub', 'Magnuang', 'Naguirangan', 'Palpalicong', 'Payao', 'Quiling Norte', 'Quiling Sur', 'Tabug'],
    },
    'Paoay': { postalCode: '2902', barangays: ['Bacsil', 'Cabagoan', 'Callaguip', 'Laoa', 'Masintoc', 'Nagbacalan', 'Nalasin', 'Pasil', 'Salbang', 'Saud', 'Surgui', 'Veronica'] },
    'Pagudpud': { postalCode: '2919', barangays: ['Balaoi', 'Caparispisan', 'Caunayan', 'Dampig', 'Lily', 'Pancian', 'Pasaleng', 'Saguigui', 'Tarrag'] },
  },

  'Ilocos Sur': {
    'Vigan': {
      postalCode: '2700',
      barangays: ['Ayusan Norte', 'Ayusan Sur', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)', 'Barangay VI (Pob.)', 'Barangay VII (Pob.)', 'Barangay VIII (Pob.)', 'Barangay IX (Pob.)', 'Barraca', 'Bongtolan', 'Bulala', 'Cabalangegan', 'Cabaroan Daan', 'Cabaroan Laud', 'Camangaan', 'Mindoro', 'Pantay Daya', 'Pantay Fatima', 'Pantay Laud', 'Purok-a-Bassit', 'Purok-a-Dakkel', 'Raois', 'Rugsuanan', 'Salindeg', 'San Jose', 'San Julian Norte', 'San Julian Sur', 'San Pedro', 'Tamag'],
    },
    'Candon': { postalCode: '2710', barangays: ['Bacsil', 'Calilian', 'Caterman', 'Daras', 'Langtad', 'Oaig-Daya', 'Palacapac', 'Paras', 'Patpata', 'San Agustin', 'San Jose', 'San Juan', 'Santo Tomas', 'Tablac'] },
    'Narvacan': { postalCode: '2704', barangays: ['Apatot', 'Bulanos', 'Cadacad', 'Cagayungan', 'Nagtengnga', 'Pantoc', 'Rivadavia', 'San Antonio', 'Sulvec', 'Turod'] },
  },

  'La Union': {
    'San Fernando': {
      postalCode: '2500',
      barangays: ['Bangcusay', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Biday', 'Cadaclan', 'Catbangen', 'Dalumpinas', 'Lingsat', 'Pagdalagan Norte', 'Pagdalagan Sur', 'Pao Norte', 'Pao Sur', 'Poro', 'Sacyud', 'Sagayad', 'San Agustin', 'Sevilla', 'Tanqui'],
    },
    'Bauang': { postalCode: '2505', barangays: ['Acao', 'Bagbag', 'Ballay', 'Baccuit Norte', 'Baccuit Sur', 'Central East (Pob.)', 'Central West (Pob.)', 'Dili', 'Disso-or', 'Guerrero', 'Nagrebcan', 'Pagdalagan', 'Paringao', 'Payocpoc Norte', 'Payocpoc Sur', 'San Julian Norte', 'San Julian Sur', 'Taberna'] },
    'Agoo': { postalCode: '2504', barangays: ['Capas', 'Macalva Norte', 'Macalva Sur', 'Nazareno', 'Poblacion East', 'Poblacion West', 'Purok', 'San Agustin East', 'San Agustin West', 'San Antonio', 'San Jose Norte', 'San Jose Sur', 'San Juan', 'San Nicolas', 'Santa Monica', 'Santa Rita'] },
  },

  'Pangasinan': {
    'Dagupan': {
      postalCode: '2400',
      barangays: ['Bacayao Norte', 'Bacayao Sur', 'Bolosan', 'Bonuan Boquig', 'Bonuan Gueset', 'Bonuan Tondaligan', 'Calmay', 'Carael', 'Caranglaan', 'Herrero', 'Lasip Chico', 'Lasip Grande', 'Lomboy', 'Lucao', 'Malued', 'Mangin', 'Mayombo', 'Pantal', 'Poblacion Oeste', 'Pogo Chico', 'Pogo Grande', 'Pugaro Suit', 'Salisay', 'Tambac', 'Tapuac', 'Tebeng'],
    },
    'Alaminos': { postalCode: '2404', barangays: ['Alos', 'Amandiego', 'Amangbangan', 'Balayang', 'Bisocol', 'Bolaney', 'Bued', 'Cabatuan', 'Cayucay', 'Dulacac', 'Inerangan', 'Landoc', 'Linmansangan', 'Lucap', 'Magsaysay', 'Mona', 'Palamis', 'Pangapisan', 'Poblacion', 'Sabangan', 'San Antonio', 'San Jose', 'San Roque', 'San Vicente', 'Tanalong', 'Tangcarang', 'Telbang', 'Victoria'] },
    'Lingayen': { postalCode: '2401', barangays: ['Abalec', 'Baay', 'Balangobong', 'Balococ', 'Bantayan', 'Domalandan Center', 'Domalandan East', 'Domalandan West', 'Estanza', 'Libsong East', 'Libsong West', 'Malawa', 'Namolan', 'Pangapisan North', 'Pangapisan Sur', 'Poblacion', 'Quibaol', 'Rosario', 'Sabangan', 'Tonton', 'Wawa'] },
    'San Carlos': { postalCode: '2420', barangays: ['Abanon', 'Agdao', 'Ano', 'Antipangol', 'Aponit', 'Baldog', 'Bolingit', 'Bonifacio', 'Cacaritan', 'Cobol', 'Cogon', 'Doyong', 'Gamata', 'Ilang', 'Isla', 'Libas', 'Lilimasan', 'Longos', 'Lucban', 'Mabini', 'Magtaking', 'Malacañang', 'Mestizo Norte', 'Mestizo Sur', 'Pangalangan', 'Payapa', 'Poblacion', 'Roxas', 'Taloy', 'Tandoc', 'Tarece', 'Turac'] },
    'Urdaneta': { postalCode: '2428', barangays: ['Anonas', 'Bactad East', 'Bayaoas', 'Bolaoen', 'Cabaruan', 'Cabuloan', 'Camantiles', 'Casantaan', 'Consolacion', 'Labit Proper', 'Labit West', 'Macalong', 'Nancamaliran East', 'Nancamaliran West', 'Nancayasan', 'Palina East', 'Palina West', 'Pinmaludpod', 'Poblacion', 'San Jose', 'San Vicente', 'Santa Lucia', 'Santo Domingo', 'Tipas', 'Tulong'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION II — CAGAYAN VALLEY
  // ═══════════════════════════════════════════════════════
  'Cagayan': {
    'Tuguegarao': {
      postalCode: '3500',
      barangays: ['Annafunan East', 'Annafunan West', 'Atulayan Norte', 'Atulayan Sur', 'Bagay', 'Buntun', 'Caggay', 'Capatan', 'Carig Norte', 'Carig Sur', 'Centro 1 (Pob.)', 'Centro 2 (Pob.)', 'Centro 3 (Pob.)', 'Centro 4 (Pob.)', 'Centro 5 (Pob.)', 'Dadda', 'Gosi Norte', 'Gosi Sur', 'Larion Alto', 'Larion Bajo', 'Leonarda', 'Libag Norte', 'Libag Sur', 'Linao East', 'Linao Norte', 'Linao West', 'Namabbalan Norte', 'Namabbalan Sur', 'Pallua Norte', 'Pallua Sur', 'Pengue-Ruyu', 'Reyes', 'San Gabriel', 'Tanza', 'Ugac Norte', 'Ugac Sur'],
    },
    'Aparri': { postalCode: '3515', barangays: ['Backiling', 'Bangag', 'Bisag', 'Bulala Norte', 'Bulala Sur', 'Calagayan', 'Centro 1 (Pob.)', 'Centro 2 (Pob.)', 'Centro 3 (Pob.)', 'Dodan', 'Gaddang', 'Linao', 'Macanaya', 'Maura', 'Navagan', 'Sanja', 'Tallungan', 'Toran', 'Zinarag'] },
  },

  'Isabela': {
    'Ilagan': {
      postalCode: '3300',
      barangays: ['Alibagu', 'Angoluan', 'Aurora', 'Bagumbayan', 'Baguio', 'Calamagui 1st', 'Calamagui 2nd', 'Catalina', 'Centro (Pob.)', 'Dabag', 'Del Pilar', 'Fugu Abajo', 'Fugu Norte', 'Gumbaoan', 'Naguilian', 'Osmena', 'Reina Mercedes', 'San Felipe', 'San Francisco', 'San Juan', 'Santa Ana', 'Santa Maria', 'Santo Tomas', 'Victoria'],
    },
    'Cauayan': { postalCode: '3305', barangays: ['Buena Suerte', 'Cabugao', 'District I (Pob.)', 'District II (Pob.)', 'District III (Pob.)', 'Dianao', 'Linglingay', 'Magassi', 'Minante I', 'Minante II', 'Ragan Almacen', 'Ragan Norte', 'Ragan Sur', 'San Fermin', 'San Pablo', 'Santa Luciana', 'Tagaran', 'Villafuerte'] },
    'Santiago': { postalCode: '3311', barangays: ['Abbag', 'Bagumbayan', 'Balintocatoc', 'Batal', 'Calao East', 'Calao West', 'Centro East (Pob.)', 'Centro West (Pob.)', 'Dubinan East', 'Dubinan West', 'Luna', 'Mabini', 'Malvar', 'Nabbotuan', 'Patul', 'Plaridel', 'Rizal', 'Rosario', 'Sagana', 'Sinili', 'Villasis'] },
  },

  'Nueva Vizcaya': {
    'Bayombong': { postalCode: '3700', barangays: ['Bonfal East', 'Bonfal Proper', 'Bonfal West', 'Buenavista', 'Camellia', 'Cancellero', 'Cosili East', 'Cosili West', 'Don Domingo Maddela (Pob.)', 'Don Mariano Marcos', 'Don Tomas Maddela (Pob.)', 'La Torre North', 'La Torre South', 'Luyang', 'Magapuy', 'Magsaysay Hills', 'Salvacion', 'San Nicolas North', 'Santa Rosa', 'Vista Alegre'] },
    'Solano': { postalCode: '3709', barangays: ['Aggub', 'Bagahabag', 'Bangaan', 'Bangar', 'Bascaran', 'Communal', 'Concepcion', 'Curifang', 'Dadap', 'Lactawan', 'Osmeña', 'Pilar', 'Poblacion North', 'Poblacion South', 'Quezon', 'Roxas', 'San Juan', 'Tucal', 'Uddiawan', 'Wacal'] },
  },

  'Quirino': {
    'Cabarroguis': { postalCode: '3400', barangays: ['Banuar', 'Burgos', 'Calaocan', 'Del Pilar', 'Dingasan', 'Eden', 'Gundaway', 'Poblacion', 'San Marcos', 'Villaflor', 'Zamora'] },
    'Diffun': { postalCode: '3401', barangays: ['Andres Bonifacio', 'Aurora East', 'Aurora West', 'Baguio Village', 'Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Magsaysay', 'Rizal', 'San Benigno', 'San Pascual'] },
  },

  'Batanes': {
    'Basco': { postalCode: '3900', barangays: ['Chanarian', 'Ihubok I (Pob.)', 'Ihubok II (Pob.)', 'Kayhuvokan', 'San Antonio', 'San Joaquin'] },
    'Itbayat': { postalCode: '3905', barangays: ['Chinapoliran', 'Kaychanarianan', 'Paganaman', 'Raele', 'San Rafael', 'Santa Lucia', 'Santa Rosa'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION III — CENTRAL LUZON
  // ═══════════════════════════════════════════════════════
  'Aurora': {
    'Baler': { postalCode: '3200', barangays: ['Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)', 'Buhangin', 'Calabuanan', 'Ditale', 'Duelle', 'Pingit', 'Reserva', 'Sabang', 'Suklayin', 'Zabali'] },
  },

  'Bataan': {
    'Balanga': { postalCode: '2100', barangays: ['Bagong Silang', 'Bagumbayan', 'Cataning', 'Cupang North', 'Cupang Proper', 'Cupang West', 'Dangcol', 'Ibayo', 'Malabia', 'Munting Batangas', 'Poblacion', 'Pto. Rivas Ibaba', 'Pto. Rivas Itaas', 'San Jose', 'Sibacan', 'Talisay', 'Tanato', 'Tortugas', 'Tuyo'] },
    'Mariveles': { postalCode: '2105', barangays: ['Alas-asin', 'Alion', 'Balon-Anito', 'Baseco Country', 'Batangas II', 'Biaan', 'Cabcaben', 'Camaya', 'Ipag', 'Lucanin', 'Maligaya', 'Mt. Samat', 'Poblacion', 'San Carlos', 'Sisiman', 'Townsite'] },
  },

  'Bulacan': {
    'Malolos': {
      postalCode: '3000',
      barangays: ['Anilao', 'Atlag', 'Babatnin', 'Bagna', 'Bagong Bayan', 'Balayong', 'Bangkal', 'Barihan', 'Bulihan', 'Bungahan', 'Caingin', 'Calero', 'Canalate', 'Caniogan', 'Catmon', 'Cofradia', 'Dakila', 'Guinhawa', 'Ligas', 'Liyang', 'Longos', 'Look 1st', 'Look 2nd', 'Lugam', 'Mambog', 'Masile', 'Matimbo', 'Mojon', 'Namayan', 'Niugan', 'Panasahan', 'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan', 'Santiago', 'Santisima Trinidad', 'Santo Cristo', 'Santo Niño', 'Santo Rosario', 'Sumapang Bata', 'Sumapang Matanda', 'Taal', 'Tikay'],
    },
    'Meycauayan': {
      postalCode: '3020',
      barangays: ['Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo', 'Caingin', 'Calvario', 'Camalig', 'Hulo', 'Iba', 'Langka', 'Lawa', 'Libtong', 'Liputan', 'Longos', 'Malhacan', 'Pajo', 'Pandayan', 'Pantoc', 'Perez', 'Poblacion', 'Saluysoy', 'Tugatog', 'Ubihan', 'Zamora'],
    },
    'San Jose del Monte': {
      postalCode: '3023',
      barangays: ['Bagong Buhay', 'Citrus', 'Ciudad Real', 'Dulong Bayan', 'Fatima', 'Francisco Homes-Guijo', 'Francisco Homes-Mulawin', 'Francisco Homes-Narra', 'Francisco Homes-Yakal', 'Gaya-gaya', 'Graceville', 'Gumaoc Central', 'Gumaoc East', 'Gumaoc West', 'Kaypian', 'Lawang Pari', 'Maharlika', 'Minuyan Proper', 'Minuyan II', 'Minuyan III', 'Minuyan IV', 'Minuyan V', 'Muzon', 'Paradise III', 'Poblacion', 'San Isidro', 'San Manuel', 'San Martin', 'San Pedro', 'San Rafael', 'San Roque', 'Santa Cruz', 'Santo Cristo', 'Santo Niño', 'Sapang Palay Proper', 'Tungkong Mangga'],
    },
    'Obando': { postalCode: '3021', barangays: ['Binuangan', 'Catanghalan', 'Hulo', 'Lawa', 'Paliwas', 'Panghulo', 'Paco', 'Poblacion', 'Salambao', 'San Pascual', 'Tawiran'] },
    'Marilao': { postalCode: '3019', barangays: ['Abangan Norte', 'Abangan Sur', 'Ibayo', 'Lambakin', 'Lias', 'Loma de Gato', 'Nagbalon', 'Patubig', 'Poblacion I', 'Poblacion II', 'Prenza I', 'Prenza II', 'Santa Rosa I', 'Santa Rosa II', 'Saog', 'Tabing Ilog'] },
  },

  'Nueva Ecija': {
    'Cabanatuan': { postalCode: '3100', barangays: ['Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Bagong Buhay', 'Bagong Sikat', 'Bakero', 'Bakod Bayan', 'Bangad', 'Bantug Norte', 'Barlis', 'Cabu', 'Campo Tinio', 'Caridad', 'Communal', 'Daang Sarile', 'Dicarma', 'Dimasalang', 'Imelda', 'Isla', 'Kalikid Norte', 'Kalikid Sur', 'Kapitan Pepe', 'Lagare', 'Mabini', 'Magsaysay Norte', 'Magsaysay Sur', 'Obrero', 'Pagas', 'Poblacion', 'Quezon', 'Rizal', 'San Isidro', 'San Josef Norte', 'San Josef Sur', 'San Juan Accfa', 'San Roque Norte', 'San Roque Sur', 'Santa Arcadia', 'Sumacab Norte', 'Sumacab Sur', 'Talipapa', 'Valle Cruz', 'Villa Marina', 'Zulueta'] },
    'Palayan': { postalCode: '3132', barangays: ['Abar 1st', 'Abar 2nd', 'Bagong Buhay', 'Bo. Militar', 'Capalangan', 'Casile', 'Fatima', 'Imelda', 'Jaime', 'Malate', 'Marcos', 'Popolacion', 'San Isidro', 'San Josef', 'Singalat'] },
    'Gapan': { postalCode: '3105', barangays: ['Balante', 'Bayanihan', 'Bulak', 'Bungo', 'Kapalangan', 'Maburak', 'Mahipon', 'Malimba', 'Mangino', 'Marelo', 'Pambuan', 'Poblacion', 'San Lorenzo', 'San Nicolas', 'San Roque', 'San Vicente', 'Santa Cruz', 'Santo Cristo Norte', 'Santo Cristo Sur'] },
    'San Jose': { postalCode: '3121', barangays: ['Caanawan', 'Calaocan', 'Caridad Norte', 'Caridad Sur', 'Culaylay', 'Dizol', 'Kita-kita', 'Malasin', 'Palestina', 'Pinili', 'Poblacion District I', 'Poblacion District II', 'Poblacion District III', 'Poblacion District IV', 'San Agustin', 'San Juan', 'San Roque', 'Santa Cruz', 'Santo Niño 1st', 'Santo Niño 2nd', 'Santo Tomas', 'Villa Joson', 'Villa Marina'] },
  },

  'Pampanga': {
    'San Fernando': {
      postalCode: '2000',
      barangays: ['Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Dela Paz Norte', 'Dela Paz Sur', 'Del Carmen', 'Del Pilar', 'Del Rosario', 'Dolores', 'Juliana', 'Lara', 'Lourdes', 'Magliman', 'Maimpis', 'Malino', 'Malpitic', 'Pandaras', 'Panipuan', 'Pulung Bulu', 'Saguin', 'San Agustin', 'San Felipe', 'San Isidro', 'San Jose', 'San Juan', 'San Nicolas', 'San Pedro', 'Santa Lucia', 'Santa Teresita', 'Santo Niño', 'Santo Rosario', 'Sindalan', 'Telabastagan'],
    },
    'Angeles': {
      postalCode: '2009',
      barangays: ['Agapito del Rosario', 'Amsic', 'Anunas', 'Balibago', 'Capaya', 'Claro M. Recto', 'Cuayan', 'Cutcut', 'Cutud', 'Lourdes North West', 'Lourdes Sur', 'Lourdes Sur East', 'Malabanias', 'Margot', 'Mining', 'Ninoy Aquino', 'Pampang', 'Pandan', 'Pulung Maragul', 'Salapungan', 'San Jose', 'San Nicolas', 'Santa Teresita', 'Santo Cristo', 'Santo Domingo', 'Santo Rosario', 'Sapalibutad', 'Sapangbato', 'Tabun', 'Virgen delos Remedios'],
    },
    'Mabalacat': {
      postalCode: '2010',
      barangays: ['Atlu-Bola', 'Bical', 'Bundagul', 'Cacutud', 'Calumpang', 'Camachiles', 'Dapdap', 'Dau', 'Dolores', 'Duquit', 'Lakandula', 'Mabiga', 'Macapagal Village', 'Mangalit', 'Marcos Village', 'Mawaque', 'Paralayunan', 'Poblacion', 'San Francisco', 'San Joaquin', 'Santa Ines', 'Santa Maria', 'Santo Niño', 'Santo Rosario', 'Sapang Balen', 'Sapang Biabas', 'Tabun'],
    },
    'Guagua': { postalCode: '2003', barangays: ['Ascomo', 'Bancal', 'Jose Abad Santos', 'Lambac', 'Magsaysay', 'Maquiapo', 'Natividad', 'Plaza Burgos', 'Poblacion', 'Rizal', 'San Agustin', 'San Antonio', 'San Isidro', 'San Jose', 'San Juan', 'San Matias', 'San Miguel', 'San Nicolas 1st', 'San Nicolas 2nd', 'San Pablo', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Santa Filomena', 'Santa Ines', 'Santa Ursula', 'Santo Cristo', 'Santo Niño'] },
  },

  'Tarlac': {
    'Tarlac City': { postalCode: '2300', barangays: ['Aguso', 'Alvindia', 'Amucao', 'Armenia', 'Balete', 'Balibago I', 'Balibago II', 'Balingcanaway', 'Banaba', 'Bantog', 'Baras-baras', 'Binauganan', 'Bora', 'Buenavista', 'Burot', 'Calingcuan', 'Carangian', 'Care', 'Central', 'Cut-cut I', 'Cut-cut II', 'Dalayap', 'Dela Paz', 'Dolores', 'Laoang', 'Ligtasan', 'Lourdes', 'Mabini', 'Maligaya', 'Maliwalo', 'Matatalaib', 'Paraiso', 'Poblacion', 'Salapungan', 'San Carlos', 'San Isidro', 'San Jose', 'San Juan de Mata', 'San Luis', 'San Manuel', 'San Miguel', 'San Nicolas', 'San Pablo', 'San Pascual', 'San Rafael', 'San Roque', 'San Sebastian', 'San Vicente', 'Santa Cruz', 'Santa Maria', 'Santo Cristo', 'Santo Domingo', 'Santo Niño', 'Sapang Maragul', 'Sapang Tagalog', 'Tariji', 'Tibag', 'Trinidad', 'Ungot', 'Villa Bacolor'] },
    'Paniqui': { postalCode: '2307', barangays: ['Abogado', 'Acocolao', 'Aduas', 'Apulid', 'Balaoang', 'Barang', 'Burgos', 'Cabayaoasan', 'Cayaoan', 'Colibangbang', 'Coral', 'Dapdap', 'Estacion', 'Mabilang', 'Manaois', 'Matalapitap', 'Nagmisahan', 'Poblacion Norte', 'Poblacion Sur', 'Salumague', 'Samput', 'San Aurelio 1st', 'San Aurelio 2nd', 'San Aurelio 3rd', 'San Jacinto', 'San Jose', 'San Vicente', 'Santa Ines', 'Santo Niño', 'Ventenilla'] },
  },

  'Zambales': {
    'Olongapo': {
      postalCode: '2200',
      barangays: ['Asinan', 'Banicain', 'Barretto', 'East Bajac-bajac', 'East Tapinac', 'Gordon Heights', 'Kalaklan', 'Mabayuan', 'New Cabalan', 'New Ilalim', 'New Kababae', 'Old Cabalan', 'Pag-asa', 'Santa Rita', 'West Bajac-bajac', 'West Tapinac'],
    },
    'Subic': { postalCode: '2209', barangays: ['Aningway Sacatihan', 'Asinan', 'Batiawan', 'Calapacuan', 'Calapandayan', 'Cawag', 'Ilwas', 'Mangan-Vaca', 'Matain', 'Naugsol', 'Pamatawan', 'Poblacion', 'San Isidro', 'Santo Tomas', 'Wawandue'] },
    'Iba': { postalCode: '2201', barangays: ['Amungan', 'Bangantalinga', 'Dirita-Baloguen', 'Lipay-Dingin-Panibuatan', 'Palanginan', 'Poblacion', 'San Agustin', 'Santa Barbara', 'Santo Tomas'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION IV-A — CALABARZON
  // ═══════════════════════════════════════════════════════
  'Batangas': {
    'Batangas City': {
      postalCode: '4200',
      barangays: ['Alangilan', 'Balagtas', 'Balete', 'Bolbok', 'Bukal', 'Calicanto', 'Cuta', 'Dela Paz', 'Kumintang Ibaba', 'Kumintang Ilaya', 'Libjo', 'Malitam', 'Pallocan Kanluran', 'Pallocan Silangan', 'Poblacion', 'San Isidro', 'Simlong', 'Sorosoro Ibaba', 'Sorosoro Ilaya', 'Sorosoro Karsada', 'Tabangao Aplaya', 'Talahib Pandayan', 'Tulo', 'Wawa'],
    },
    'Lipa': {
      postalCode: '4217',
      barangays: ['Adya', 'Anilao', 'Balintawak', 'Banaybanay', 'Bolbok', 'Calamias', 'Cumba', 'Dagatan', 'Halang', 'Inosloban', 'Lodlod', 'Mabini', 'Malagonlong', 'Marauoy', 'Mataas na Lupa', 'Munting Pulo', 'Pangao', 'Pinagkawitan', 'Plaridel', 'Poblacion Barangay 1', 'Poblacion Barangay 2', 'Poblacion Barangay 3', 'Poblacion Barangay 4', 'Sabang', 'San Carlos', 'San Celestino', 'San Jose', 'San Lucas', 'San Salvador', 'San Sebastian', 'Santo Niño', 'Santo Toribio', 'Sico', 'Talisay', 'Tambo'],
    },
    'Tanauan': { postalCode: '4232', barangays: ['Bagbag', 'Boot', 'Darasa', 'Gonzales', 'Hidalgo', 'Janopol', 'Janopol Oriental', 'Laurel', 'Luyos', 'Maugat', 'Natatas', 'Pantay Bata', 'Pantay Matanda', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Sala', 'Sambat', 'San Jose', 'Santol', 'Sulpoc', 'Suplang', 'Talaga', 'Tinurik', 'Wawa'] },
    'Santo Tomas': { postalCode: '4234', barangays: ['Amesti', 'Bago', 'Balanga', 'Bedeng', 'Capitangan', 'Dalig', 'Mabalor', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'San Antonio', 'San Bartolome', 'San Fernando', 'San Roque', 'Santa Ana', 'Santa Anastacia', 'Santa Clara'] },
  },

  'Cavite': {
    'Bacoor': {
      postalCode: '4102',
      barangays: ['Alima', 'Aniban I', 'Aniban II', 'Aniban III', 'Aniban IV', 'Aniban V', 'Bayanan', 'Daang Bukid', 'Digman', 'Dulong Bayan', 'Habay I', 'Habay II', 'Ligas I', 'Ligas II', 'Ligas III', 'Mabolo I', 'Mabolo II', 'Mabolo III', 'Maliksi I', 'Maliksi II', 'Maliksi III', 'Mambog I', 'Mambog II', 'Mambog III', 'Mambog IV', 'Mambog V', 'Molino I', 'Molino II', 'Molino III', 'Molino IV', 'Molino V', 'Molino VI', 'Molino VII', 'Niog I', 'Niog II', 'Niog III', 'Real I', 'Real II', 'Salinas I', 'Salinas II', 'Salinas III', 'Salinas IV', 'San Nicolas I', 'San Nicolas II', 'San Nicolas III', 'Talaba I', 'Talaba II', 'Talaba III', 'Talaba IV', 'Talaba V', 'Zapote I', 'Zapote II', 'Zapote III', 'Zapote IV', 'Zapote V'],
    },
    'Dasmariñas': {
      postalCode: '4114',
      barangays: ['Burol', 'Datu Esmael', 'Emmanuel Bergado I', 'Emmanuel Bergado II', 'Fatima I', 'Fatima II', 'Fatima III', 'Langkaan I', 'Langkaan II', 'Luzviminda I', 'Luzviminda II', 'Paliparan I', 'Paliparan II', 'Paliparan III', 'Sabang', 'Salawag', 'Salitran I', 'Salitran II', 'Salitran III', 'Salitran IV', 'Sampaloc I', 'Sampaloc II', 'Sampaloc III', 'Sampaloc IV', 'San Agustin I', 'San Agustin II', 'San Agustin III', 'San Andres I', 'San Andres II', 'San Jose', 'San Juan', 'San Lorenzo Ruiz', 'Santa Cristina I', 'Santa Cristina II', 'Santa Fe', 'Santa Lucia', 'Santo Cristo', 'Santo Niño I', 'Santo Niño II', 'Zone I', 'Zone II', 'Zone III', 'Zone IV'],
    },
    'Imus': {
      postalCode: '4103',
      barangays: ['Alapan I-A', 'Alapan I-B', 'Alapan II-A', 'Alapan II-B', 'Anabu I-A', 'Anabu I-B', 'Anabu I-C', 'Anabu I-D', 'Anabu II-A', 'Anabu II-B', 'Anabu II-C', 'Anabu II-D', 'Bayan Luma I', 'Bayan Luma II', 'Bayan Luma III', 'Bucandala I', 'Bucandala II', 'Bucandala III', 'Bucandala IV', 'Bucandala V', 'Buhay na Tubig', 'Carsadang Bago I', 'Carsadang Bago II', 'Malagasang I-A', 'Malagasang I-B', 'Malagasang I-C', 'Malagasang II-A', 'Malagasang II-B', 'Malagasang II-C', 'Medicion I-A', 'Medicion I-B', 'Medicion II-A', 'Medicion II-B', 'Pag-asa I', 'Pag-asa II', 'Pag-asa III', 'Palico I', 'Palico II', 'Palico III', 'Palico IV', 'Pasong Buaya I', 'Pasong Buaya II', 'Poblacion I-A', 'Poblacion I-B', 'Poblacion II-A', 'Poblacion II-B', 'Poblacion III-A', 'Poblacion III-B', 'Poblacion IV-A', 'Poblacion IV-B', 'Tanzang Luma I', 'Tanzang Luma II', 'Tanzang Luma III', 'Toclong I-A', 'Toclong I-B', 'Toclong II-A', 'Toclong II-B'],
    },
    'Cavite City': { postalCode: '4100', barangays: ['Bagong Pag-asa (Pob.)', 'Bayan (Pob.)', 'Caridad', 'Dalahican', 'Kanluran (Pob.)', 'Lawin', 'Ligtong I', 'Ligtong II', 'Ligtong III', 'Ligtong IV', 'San Antonio', 'San Rafael', 'Santa Cruz', 'Silangan (Pob.)'] },
    'General Trias': { postalCode: '4107', barangays: ['Alingaro', 'Arnaldo', 'Bacao I', 'Bacao II', 'Bagumbayan', 'Biclatan', 'Buenavista I', 'Buenavista II', 'Buenavista III', 'Corregidor', 'Dulong Bayan', 'Javalera', 'Manggahan', 'Navarro', 'Panungyanan', 'Pasong Camachile I', 'Pasong Camachile II', 'Pasong Kawayan I', 'Pasong Kawayan II', 'Pinagtipunan', 'Poblacion I', 'Poblacion II', 'San Francisco', 'San Juan I', 'San Juan II', 'Santa Clara', 'Santiago', 'Tapia', 'Tejero'] },
    'Rosario': { postalCode: '4106', barangays: ['Bagbag I', 'Bagbag II', 'Kanluran', 'Ligtong I', 'Ligtong II', 'Muzon I', 'Muzon II', 'Poblacion', 'Silangan I', 'Silangan II', 'Sapa I', 'Sapa II', 'Tejeros Convention', 'Wawa I', 'Wawa II', 'Wawa III'] },
  },

  'Laguna': {
    'Santa Rosa': {
      postalCode: '4026',
      barangays: ['Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita', 'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling', 'Malitlit', 'Malusak', 'Market Area', 'Pook', 'Pulong Santa Cruz', 'Santo Domingo', 'Sinalhan', 'Tagapo'],
    },
    'Biñan': {
      postalCode: '4024',
      barangays: ['Bungahan', 'Canlalay', 'Casile', 'De La Paz', 'Ganado', 'Langkiwa', 'Loma', 'Malaban', 'Malamig', 'Mampalasan', 'Platero', 'Poblacion', 'San Antonio', 'San Francisco', 'San Jose', 'San Vicente', 'Santo Domingo', 'Santo Niño', 'Santo Tomas', 'Soro-soro', 'Tubigan', 'Zapote'],
    },
    'Calamba': {
      postalCode: '4027',
      barangays: ['Bagong Kalsada', 'Banadero', 'Banlic', 'Barandal', 'Batino', 'Bucal', 'Bunggo', 'Burol', 'Canlubang', 'Halang', 'Kay-anlog', 'La Mesa', 'Lawa', 'Lecheria', 'Lingga', 'Looc', 'Mabato', 'Majada Out', 'Makiling', 'Masili', 'Mayapa', 'Milagrosa', 'Paciano Rizal', 'Palingon', 'Palo-alto', 'Pansol', 'Parian', 'Prinza', 'Punta', 'Real', 'Saimsim', 'Sampiruhan East', 'Sampiruhan West', 'San Cristobal', 'San Jose', 'San Juan', 'Sirang Lupa', 'Sucol', 'Turbina', 'Uwisan'],
    },
    'San Pedro': {
      postalCode: '4023',
      barangays: ['Bagong Silang', 'Calendola', 'Chrysanthemum', 'Cuyab', 'Estrella', 'Fatima', 'Landayan', 'Langgam', 'Laram', 'Magsaysay', 'Maharlika', 'Narra', 'Nueva', 'Pacita 1', 'Pacita 2', 'Poblacion', 'Riverside', 'Rosario', 'Sampaguita Village', 'San Antonio', 'San Lorenzo Ruiz', 'San Roque', 'San Vicente', 'Santo Niño', 'United Bayanihan', 'United Better Living'],
    },
    'Los Baños': { postalCode: '4030', barangays: ['Bambang', 'Batong Malake', 'Baybayin', 'Bayog', 'Anos', 'Lalakay', 'Malinta', 'Maahas', 'Mayondon', 'San Antonio', 'Tadlak', 'Timugan'] },
    'Cabuyao': { postalCode: '4025', barangays: ['Baclaran', 'Banay-banay', 'Banlic', 'Bigaa', 'Butong', 'Casile', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland', 'Poblacion Uno', 'Poblacion Dos', 'Poblacion Tres', 'Pulo', 'Sala', 'San Isidro'] },
  },

  'Quezon': {
    'Lucena': { postalCode: '4301', barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barra', 'Bocohan', 'Cotta', 'Dalahican', 'Domoit', 'Gulang-gulang', 'Ibabang Dupay', 'Ibabang Iyam', 'Ilayang Dupay', 'Ilayang Iyam', 'Isabang', 'Market View', 'Mayao Castillo', 'Mayao Crossing', 'Mayao Kanluran', 'Mayao Parada', 'Mayao Silangan', 'Ransohan', 'Salinas', 'Talao-talao'] },
    'Tayabas': { postalCode: '4327', barangays: ['Angostura', 'Baguio', 'Bukal', 'Camaysa', 'Dapdap', 'Domoit Kanluran', 'Domoit Silangan', 'Gibanga', 'Ibabang Palale', 'Ilayang Palale', 'Lakawan', 'Lalo', 'Lawigue', 'Malabanban Norte', 'Malabanban Sur', 'Mate', 'Opol', 'Poblacion', 'San Roque', 'Tongko'] },
  },

  'Rizal': {
    'Antipolo': {
      postalCode: '1870',
      barangays: ['Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang', 'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot', 'Muntingdilaw', 'San Isidro', 'San Jose', 'San Juan', 'San Luis', 'San Roque', 'Santa Cruz'],
    },
    'Cainta': {
      postalCode: '1900',
      barangays: ['San Andres', 'San Isidro', 'San Juan', 'San Roque', 'Santa Rosa', 'Santo Domingo', 'Santo Niño'],
    },
    'Taytay': { postalCode: '1920', barangays: ['Dolores', 'Muzon', 'San Isidro', 'San Juan', 'Santa Ana', 'Santo Niño'] },
    'Rodriguez (Montalban)': { postalCode: '1860', barangays: ['Balite', 'Burgos', 'Geronimo', 'Macabud', 'Manggahan', 'Mascap', 'Puray', 'Rosario', 'San Isidro', 'San Jose', 'San Rafael'] },
    'Binangonan': { postalCode: '1940', barangays: ['Batingan', 'Calumpang', 'Janosa', 'Kalinawan', 'Libid', 'Libis', 'Limbon-limbon', 'Lunsad', 'Mambog', 'Pag-asa', 'Pantok', 'Poblacion', 'San Carlos', 'Tayuman'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION IV-B — MIMAROPA
  // ═══════════════════════════════════════════════════════
  'Occidental Mindoro': {
    'Mamburao': { postalCode: '5106', barangays: ['Balansay', 'Fatima', 'Payompon', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'San Luis', 'Talabaan', 'Tayamaan'] },
    'San Jose': { postalCode: '5100', barangays: ['Anilao', 'Bagong Sikat', 'Bangkal', 'Batasan', 'Bubog', 'Camburay', 'Caminawit', 'Central (Pob.)', 'Inaula', 'Labangan Poblacion', 'Mangarin', 'Monte Claro', 'Murtha', 'Natandol', 'San Roque'] },
  },

  'Oriental Mindoro': {
    'Calapan': { postalCode: '5200', barangays: ['Balingayan', 'Balite', 'Baruyan', 'Batino', 'Bayanan I', 'Bayanan II', 'Biga', 'Bucayao', 'Calero', 'Camansihan', 'Comunal', 'Guinobatan', 'Ibaba East', 'Ibaba West', 'Ilaya', 'Lalud', 'Lazareto', 'Libis', 'Lumang Bayan', 'Mahal na Pangalan', 'Malad', 'Malamig', 'Market Site', 'Navotas', 'Pachoca', 'Palhi', 'Parang', 'Personas', 'Poblacion', 'San Vicente Central', 'San Vicente East', 'San Vicente North', 'San Vicente South', 'San Vicente West', 'Santa Cruz', 'Santa Isabel', 'Santo Niño', 'Sapul', 'Silonay', 'Suqui', 'Tawiran'] },
  },

  'Marinduque': {
    'Boac': { postalCode: '4900', barangays: ['Agot', 'Apitong', 'Balaring', 'Bantad', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Binunga', 'Boi', 'Boton', 'Bunganay', 'Canat', 'Cawit', 'Daig', 'Hinapulan', 'Ihatub', 'Isok I', 'Isok II Poblacion', 'Laylay', 'Lupac', 'Mainit', 'Malbog', 'Maligaya', 'Murallon', 'Ogbac', 'Pawa', 'Pili', 'Poctoy', 'Tabi', 'Tabigue', 'Toguan', 'Tumapon'] },
  },

  'Romblon': {
    'Romblon': { postalCode: '5500', barangays: ['Agbaluto', 'Agnay', 'Agnipa', 'Agtongo', 'Alas-as', 'Bagacay', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)', 'Cajimos', 'Capaclan', 'Cobrador', 'Ginablan', 'Guimpingan', 'Ilauran', 'Lamao', 'Li-o', 'Logbon', 'Lonos', 'Lunas', 'Macalas', 'Mapula', 'Sawang', 'Tambac'] },
  },

  'Palawan': {
    'Puerto Princesa': { postalCode: '5300', barangays: ['Bagong Sikat', 'Bagong Silang', 'Bancao-Bancao', 'Binduyan', 'Cabayugan', 'Concepcion', 'Inagawan', 'Irawan', 'Iwahig', 'Kalipay', 'Kamuning', 'Langogan', 'Luzviminda', 'Mabuhay', 'Macarascas', 'Manalo', 'Mandaragat', 'Mangingisda', 'Maningning', 'Milagrosa', 'Model', 'Montible', 'Napsan', 'Pagkakaisa', 'Princesa', 'Salvacion', 'San Jose', 'San Manuel', 'San Miguel', 'San Pedro', 'San Rafael', 'Santa Cruz', 'Santa Lourdes', 'Santa Monica', 'Sicsican', 'Tagburos', 'Tagumpay', 'Tiniguiban'] },
    'Coron': { postalCode: '5316', barangays: ['Banuang Daan', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)', 'Barangay VI (Pob.)', 'Bintuan', 'Borac', 'Buenavista', 'Bulalacao', 'Cabugao', 'Decabobo', 'Decalachao', 'Guadalupe', 'Lajala', 'Malawig', 'Marcilla', 'San Jose', 'San Nicolas', 'Tagumpay', 'Turda'] },
    'El Nido': { postalCode: '5313', barangays: ['Aberawan', 'Bagong Bayan', 'Barotuan', 'Bebeladan', 'Buena Suerte', 'Corong-Corong', 'Maligaya', 'Masagana', 'New Ibajay', 'Pasadeña', 'Poblacion', 'Sibaltan', 'Teneguiban', 'Villa Libertad', 'Villa Paz'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION V — BICOL REGION
  // ═══════════════════════════════════════════════════════
  'Albay': {
    'Legazpi': {
      postalCode: '4500',
      barangays: ['Arimbay', 'Bagong Abre', 'Bagumbayan', 'Banquerohan', 'Bigaa', 'Binanuahan East', 'Binanuahan West', 'Bitano', 'Bonga', 'Bogtong', 'Bonot', 'Buenavista', 'Buyuan', 'Cabagñan', 'Cabagñan West', 'Cagbacong', 'Cruzada', 'Dap-dap', 'Dita', 'Em\'s Barrio', 'Em\'s Barrio South', 'Gogon', 'Homapon', 'Imalnod', 'Kawit-East Washington Drive', 'Lamba', 'Landco', 'Lapu-lapu', 'Legazpi Port District', 'Lourdes (Old Albay)', 'Maslog', 'Padang', 'Peñaranda', 'Pigcale', 'Rawis', 'Sagpon', 'San Francisco', 'San Joaquin', 'San Roque', 'Tagas', 'Taysan', 'Victory Village South', 'Victory Village North'],
    },
    'Tabaco': {
      postalCode: '4511',
      barangays: ['Agnas (Pob.)', 'Bacolod', 'Bangkilingan', 'Bantayan', 'Basud', 'Buang', 'Buhian', 'Cabangan', 'Comun', 'Cormidal', 'Divino Rostro (Pob.)', 'Gogon', 'Magapo', 'Mariroc', 'Oas', 'Oson', 'Panal', 'Pawa', 'Quinale', 'Rawis', 'Salvacion', 'San Antonio (Pob.)', 'San Carlos', 'San Isidro', 'San Juan (Pob.)', 'San Lorenzo', 'San Miguel', 'San Roque', 'San Vicente', 'Santo Cristo (Pob.)', 'Tagas', 'Tayhi', 'Visita (Pob.)'],
    },
    'Daraga (Locsin)': {
      postalCode: '4501',
      barangays: ['Alcala', 'Anislag', 'Bañadero', 'Bagumbayan', 'Binitayan', 'Bongalon', 'Budiao', 'Busay', 'Buscagan', 'Cabraran Pequeño', 'Cabraran Grande', 'Calabidongan', 'Canaway', 'Cullat', 'Dela Paz', 'Dinoronan', 'Gabawan', 'Hornalan', 'Inararan', 'Kidaco', 'Kilicao', 'Kimantong', 'Kinawitan', 'Lacag', 'Mabini', 'Malabog', 'Malobago', 'Manito', 'Mapalad', 'Market Site (Pob.)', 'Mayon', 'Melrose', 'Nabasan', 'Namantao', 'Pandan', 'Peñafrancia', 'Sagpon', 'Salvacion', 'San Rafael', 'San Ramon', 'San Roque', 'San Vicente Grande', 'San Vicente Pequeño', 'Sipi', 'Tabon-tabon', 'Tumpa', 'Zones (Pob.)'],
    },
    'Camalig': {
      postalCode: '4502',
      barangays: ['Anoling', 'Baligang', 'Bantonan', 'Batang', 'Bongabong', 'Cabangan', 'Cabraran', 'Calabidongan', 'Comun', 'Cotmon', 'Del Rosario', 'Gapo', 'Gotob', 'Ilawod', 'Libod', 'Ligban', 'Maigbo', 'Mangkasay', 'Panamitan', 'Poblacion East', 'Poblacion West', 'Quirangay', 'Salugan', 'Sua', 'Sumlang', 'Tagaytay', 'Tumpa'],
    },
    'Guinobatan': {
      postalCode: '4503',
      barangays: ['Agbó', 'Binogsacan Lower', 'Binogsacan Upper', 'Budiao', 'Calzada', 'Catomag', 'Centro Poblacion', 'Doña Tomasa (Magatol)', 'Inamnan Grande', 'Inamnan Pequeño', 'Iraya', 'Lomboy', 'Maipon', 'Malabnig', 'Malipo', 'Malobago', 'Maninila', 'Mapaco', 'Masarawag', 'Mauraro', 'Minto', 'Morera', 'Muladbucad Grande', 'Muladbucad Pequeño', 'Nagtang', 'Ñatasan', 'Nungol', 'Oas', 'Pinaric', 'Poblacion', 'San Rafael', 'Sinungtan', 'Travesia'],
    },
    'Ligao': {
      postalCode: '4504',
      barangays: ['Abella', 'Allang', 'Amtic', 'Bagumbayan', 'Baligang', 'Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Batang', 'Binatagan', 'Bobonsuran', 'Bonga', 'Busac', 'Cabarian', 'Calaguimit', 'Cavasi', 'Cotmon', 'Dita', 'Guilid', 'Herrera', 'Layon', 'Macalidong', 'Mahaba', 'Malama', 'Maonon', 'Nabontolan', 'Nasisi', 'Nogpo', 'Oma-Oma', 'Palapas', 'Palawig', 'Pantao', 'Paulba', 'Paulog', 'Pinamaniquian', 'Pinit', 'Rangas', 'San Vicente', 'Sugcad', 'Tagpo', 'Tinago', 'Tuy-an', 'Tuyon-tuyon'],
    },
    'Oas': {
      postalCode: '4505',
      barangays: ['Bagangan', 'Batiawan', 'Belen', 'Bogtong', 'Busac', 'Cabatuan', 'Cagmanaba', 'Calpi', 'Canarom', 'Centro Poblacion', 'Coas', 'Cobo', 'Iraya', 'Iricirin', 'Jaguimit', 'Kimaton', 'Mabca', 'Manggas', 'Market Site (Pob.)', 'Maynaga', 'Morera', 'Nagtang', 'Obaliw-Rinas', 'Pandan', 'Pangpang', 'Pinamucan-Ibaba', 'Pinamucan-Ilaya', 'Rizal', 'San Agustin', 'San Fernando', 'San Isidro', 'San Juan', 'San Miguel', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Sinalupan', 'Sugod', 'Tobgon', 'Tobog'],
    },
    'Polangui': {
      postalCode: '4506',
      barangays: ['Agos', 'Alnay', 'Alomon', 'Amoguis', 'Anopol', 'Balaba', 'Balabag', 'Balinad', 'Basag', 'Bato', 'Buhi', 'Cadargayason', 'Caguscos', 'Centro Occidental (Pob.)', 'Centro Oriental (Pob.)', 'Cotmon', 'Gabon', 'Gamot', 'Hinawan', 'Itaran', 'Kinuarían', 'La Medalla', 'Lanigay', 'Lidong', 'Lolia', 'Magurang', 'Matacon', 'Maynaga', 'Namanday', 'Napotosan', 'Oas', 'Obaliw', 'Palanog', 'Palis', 'Panan', 'Payahan', 'Pinagdapian', 'Pinagwarasan', 'Poblacion', 'Salvacion', 'San Roque', 'Santa Cruz', 'Santa Teresita', 'Sugcad', 'Uson'],
    },
    'Libon': {
      postalCode: '4507',
      barangays: ['Alongong', 'Apud', 'Bacolod', 'Balawing', 'Baligang', 'Bonbon', 'Bubulusan', 'Calmayon', 'Catburawan', 'Ligao-Libon Road (Pob.)', 'Macabugos', 'Malabiga', 'Matara', 'Moguiring', 'Natasan', 'Nogpo', 'Pantao', 'Payahan', 'Pinagbobong', 'Poblacion', 'Salvacion', 'San Agustin', 'San Isidro', 'San Jose', 'San Juan', 'San Pascual', 'San Vicente', 'Santa Cruz', 'Tagas'],
    },
    'Tiwi': {
      postalCode: '4513',
      barangays: ['Bariw', 'Baybay', 'Bonga Lower', 'Bonga Upper', 'Cale', 'Cararayan', 'Garchitorena', 'Joroan', 'Libjo', 'Maynonong', 'Mayong', 'Mislang', 'Naga Centro (Pob.)', 'Nagas', 'Oson', 'Panganiban', 'Putsan', 'San Bernardo', 'Sogod'],
    },
    'Malilipot': {
      postalCode: '4510',
      barangays: ['Barangay I (Pob.)', 'Barangay II (Pob.)', 'Binitayan', 'Calbayog', 'Canaway', 'Salvacion', 'San Antonio', 'San Carlos', 'San Francisco', 'San Isidro', 'San Jose', 'San Roque', 'Santa Cruz', 'Santa Teresa'],
    },
    'Malinao': {
      postalCode: '4512',
      barangays: ['Awang', 'Balading', 'Balza', 'Bariw', 'Baybay', 'Cabunturan', 'Centro Poblacion', 'Coliat', 'Estancia', 'Malolos', 'Mananao', 'Ogod (Crossing)', 'Pawa', 'Tandarora'],
    },
    'Bacacay': {
      postalCode: '4509',
      barangays: ['Banao', 'Bariw', 'Basud', 'Bayandong', 'Bonga (Lower)', 'Bonga (Upper)', 'Buang', 'Cabasan', 'Cagbulacao', 'Cagraray', 'Cajagwayan', 'Gubat', 'Hindi', 'Igang', 'Ilawod', 'Iraya', 'Labao', 'Manaet', 'Manamoc', 'Marigondon', 'Matanag', 'Misibis', 'Nahapunan', 'Pawa', 'Payahan', 'Pinamanmoan', 'Poblacion', 'Salvacion', 'San Juan', 'San Pascual', 'Sogod', 'Sula', 'Tambilagao'],
    },
    'Santo Domingo': {
      postalCode: '4508',
      barangays: ['Alimsog', 'Bagacay', 'Banyag', 'Basud', 'Buragwis', 'Calayucay', 'Cale', 'Casinagan', 'Daculang Tubig', 'Fidel Surtida (Pob.)', 'Hacienda (Pob.)', 'Jubang', 'Lagundi', 'Market Site (Pob.)', 'Lidong', 'Lourdes', 'Mabini', 'Magsaysay', 'Miluya', 'Pandan', 'Panal', 'Rizal', 'Salvacion', 'San Isidro', 'San Ramon', 'San Vicente', 'Sinagaran', 'Sulucan', 'Tiwalo'],
    },
    'Manito': {
      postalCode: '4514',
      barangays: ['Balangibang', 'Buyo', 'Cabacongan', 'Cawayan', 'Centro Poblacion', 'Cayangcang', 'Cawit', 'It-ba', 'Malobago', 'Mangkasay', 'Pawa', 'Tinapian'],
    },
    'Jovellar': {
      postalCode: '4515',
      barangays: ['Bagonghay', 'Bagumbayan', 'Bariw', 'Batohonan', 'Burabod', 'Camalig', 'Cabugao', 'Caguscos', 'Caraycayon', 'Curry', 'Guinlajon', 'Matanag', 'Maysua', 'Poblacion', 'Quitago', 'San Isidro', 'San Vicente', 'Soa', 'Villa Hermosa'],
    },
    'Rapu-Rapu': {
      postalCode: '4517',
      barangays: ['Bagaobawan', 'Batan Island', 'Bilbao', 'Buenavista', 'Buhatan', 'Calanaga', 'Caracascasan', 'Carogcog', 'Guinanayan', 'Hamorawon', 'Lagundi', 'Liguan', 'Linao', 'Malobago', 'Mancao', 'Manila', 'Morocborocan', 'Nagcalsot', 'Pagcolbon', 'Pagcolbon Alto', 'Poblacion', 'Sagrada', 'Salvacion', 'San Ramon', 'Santa Barbara', 'Tinocawan', 'Tinopan', 'Viga'],
    },
  },

  'Camarines Norte': {
    'Daet': { postalCode: '4600', barangays: ['Alawihao', 'Awitan', 'Bagasbas', 'Barangay I (Pob.)', 'Barangay II (Pob.)', 'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)', 'Barangay VI (Pob.)', 'Barangay VII (Pob.)', 'Barangay VIII (Pob.)', 'Bibirao', 'Borabod', 'Cababaan', 'Cadaanan', 'Camalig', 'Cobangbang', 'Dogongan', 'Gahonon', 'Gubat', 'Lag-on', 'Magang', 'Mambalite', 'Mancruz', 'Pamorangon', 'San Isidro'] },
  },

  'Camarines Sur': {
    'Naga': { postalCode: '4400', barangays: ['Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag', 'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeña', 'Dayangdang', 'Del Rosario', 'Dinaga', 'Lerma', 'Liboton', 'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang', 'San Felipe', 'San Francisco', 'San Isidro', 'Santa Cruz', 'Tabuco', 'Tinago', 'Triangulo'] },
    'Iriga': { postalCode: '4431', barangays: ['La Purisima', 'La Trinidad', 'Niño Jesus', 'Poblacion', 'Salvacion', 'San Agustin', 'San Antonio', 'San Francisco', 'San Isidro', 'San Jose', 'San Juan', 'San Miguel', 'San Nicolas', 'San Pedro', 'San Roque', 'Santa Cruz', 'Santa Elena', 'Santa Isabel', 'Santiago', 'Santo Domingo'] },
  },

  'Catanduanes': {
    'Virac': { postalCode: '4800', barangays: ['Antipolo del Norte', 'Antipolo del Sur', 'Balite', 'Batag', 'Bato', 'Buyo', 'Cabihian', 'Calabnigan', 'Calampong', 'Calatagan Proper', 'Concepcion', 'Constantino', 'Gogon', 'Hawan', 'Igang', 'Lanao', 'Ogod', 'Salvacion', 'San Isidro', 'San Jose', 'San Pedro', 'San Roque', 'San Vicente', 'Santa Cruz', 'Santo Cristo', 'Simlong', 'Sogod'] },
  },

  'Masbate': {
    'Masbate City': { postalCode: '5400', barangays: ['Bagumbayan', 'Bantigue', 'Bapor (Pob.)', 'Batuhan', 'Bayombon', 'Bolo', 'Cagay', 'Cawayan Exterior', 'Cawayan Interior', 'Centro (Pob.)', 'Espinosa', 'Ibingay', 'Kalipay (Pob.)', 'Kinamaligan', 'Malinta', 'Nursery', 'Pating', 'Rizal', 'San Isidro', 'Tugbo', 'Usab'] },
  },

  'Sorsogon': {
    'Sorsogon City': { postalCode: '4700', barangays: ['Abuyog', 'Balete', 'Bibincahan', 'Buhatan', 'Bulabog', 'Cabid-an', 'East Dominion', 'Gimaloto', 'Guinlajon', 'Macabog', 'Pamurayan', 'Pangpang', 'Piot', 'Poblacion', 'Polvorista', 'Rawis', 'Rizal', 'Salog', 'Salvacion', 'Sampaloc', 'San Isidro', 'San Juan', 'Sirangan', 'Sugod', 'Talisay', 'Ticol'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION VI — WESTERN VISAYAS
  // ═══════════════════════════════════════════════════════
  'Aklan': {
    'Kalibo': { postalCode: '5600', barangays: ['Andagao', 'Bachaw Norte', 'Bachaw Sur', 'Brgy. 1 (Pob.)', 'Brgy. 2 (Pob.)', 'Brgy. 3 (Pob.)', 'Brgy. 4 (Pob.)', 'Brgy. 5 (Pob.)', 'Brgy. 6 (Pob.)', 'Brgy. 7 (Pob.)', 'Brgy. 8 (Pob.)', 'Buswang New', 'Buswang Old', 'Caano', 'Estancia', 'Linabuan Norte', 'Linabuan Sur', 'Mabilo', 'Mobo', 'Nalook', 'Tigayon', 'Tinigao'] },
    'Malay (Boracay)': { postalCode: '5608', barangays: ['Argao', 'Balabag', 'Caticlan', 'Cogon', 'Cubay Norte', 'Cubay Sur', 'Dumlog', 'Manoc-Manoc', 'Motag', 'Naasug', 'Napaan', 'Poblacion', 'Sail', 'Yapak'] },
  },

  'Antique': {
    'San Jose de Buenavista': { postalCode: '5700', barangays: ['Atabay', 'Badiang', 'Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Cansadan', 'Durog', 'Gracia', 'Igcocolo', 'Ipil', 'Morobuan', 'Pangalcagan', 'Piape I', 'Piape II', 'Piape III', 'San Angel', 'San Fernando', 'San Jose', 'San Juan', 'Santo Rosario', 'Talisayan'] },
  },

  'Capiz': {
    'Roxas City': { postalCode: '5800', barangays: ['Adlawan', 'Bago', 'Balijuagan', 'Banica', 'Barra', 'Cadimahan', 'Cagay', 'Cogon', 'Culajao', 'Dumolog', 'Jumaguicjic', 'Lan-ag', 'Lawa-an', 'Libot', 'Loctugan', 'Lonoy', 'Milibili', 'Olotayan', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'Poblacion IV', 'Poblacion V', 'Punta Cogon', 'Punta Tabuc', 'San Jose', 'Sibaguan', 'Talon', 'Tanza', 'Tinagong Dagat'] },
  },

  'Guimaras': {
    'Jordan': { postalCode: '5045', barangays: ['Alaguisoc', 'Balcon Maravilla', 'Balcon Melliza', 'Bugnay', 'Buluangan', 'Espinosa', 'Hoskyn', 'Lawi', 'Morobuan', 'Poblacion', 'Rizal', 'San Miguel', 'Santa Teresa', 'Sinapsapan', 'Tamborong'] },
  },

  'Iloilo': {
    'Iloilo City': {
      postalCode: '5000',
      barangays: ['Arevalo', 'Baldoza', 'Bantud', 'Bolilao', 'Bonifacio', 'Buhang', 'Calahunan', 'Calumpang', 'City Proper', 'Compania', 'Cuartero', 'Danao', 'Dungon A', 'Dungon B', 'Gloria', 'Ingore', 'Javellana', 'Jereos', 'La Paz', 'Lapuz Norte', 'Lapuz Sur', 'Leganes', 'Libertad', 'Lopez Jaena', 'Luna', 'Mabini', 'Mansaya', 'Molo Boulevard', 'Nabitasan', 'North Avanceña', 'North Fundidor', 'Ortiz', 'Oton', 'Rizal Estanzuela', 'Sambag', 'San Isidro', 'Santa Filomena', 'So-oc', 'South Fundidor', 'Tanza-Esperanza', 'Yulo Drive'],
    },
    'Passi': { postalCode: '5037', barangays: ['Agtambo', 'Anilao', 'Bacuranan', 'Bagacay', 'Bolo', 'Cabunga', 'Gemat-y', 'Man-it', 'Mulapula', 'Poblacion Ilawod', 'Poblacion Ilaya', 'Punong', 'Sablogon', 'Santa Rita', 'Tagubong', 'Tubod'] },
  },

  'Negros Occidental': {
    'Bacolod': { postalCode: '6100', barangays: ['Alijis', 'Banago', 'Bata', 'Cabug', 'Estefania', 'Felisa', 'Granada', 'Handumanan', 'Hilaoan', 'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy', 'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing', 'Tangub', 'Villamonte', 'Vista Alegre'] },
    'Silay': { postalCode: '6116', barangays: ['Balaring', 'Guinhalaran', 'Hawaiian', 'Lantad', 'Mambulac', 'Patag', 'Poblacion I', 'Poblacion II', 'Rizal'] },
    'Talisay': { postalCode: '6115', barangays: ['Brgy. Zone 1 (Pob.)', 'Brgy. Zone 2 (Pob.)', 'Brgy. Zone 3 (Pob.)', 'Brgy. Zone 4 (Pob.)', 'Brgy. Zone 5 (Pob.)', 'Brgy. Zone 6 (Pob.)', 'Concepcion', 'Matab-ang', 'San Fernando', 'Dos Hermanas', 'Efigenio Lizares'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION VII — CENTRAL VISAYAS
  // ═══════════════════════════════════════════════════════
  'Bohol': {
    'Tagbilaran': { postalCode: '6300', barangays: ['Bool', 'Booy', 'Cabawan', 'Cogon', 'Dao', 'Dampas', 'Manga', 'Mansasa', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'San Isidro', 'Taloto', 'Tiptip', 'Ubujan'] },
    'Panglao': { postalCode: '6340', barangays: ['Bil-isan', 'Bolod', 'Danao', 'Doljo', 'Libaong', 'Looc', 'Lourdes', 'Poblacion', 'Tangnan', 'Tawala'] },
  },

  'Cebu': {
    'Cebu City': {
      postalCode: '6000',
      barangays: ['Adlaon', 'Apas', 'Bacayan', 'Banilad', 'Basak Pardo', 'Basak San Nicolas', 'Bulacao', 'Busay', 'Capitol Site', 'Carreta', 'Cogon Ramos', 'Day-as', 'Ermita', 'Guadalupe', 'Kasambagan', 'Lahug', 'Lorega (San Miguel)', 'Mabini', 'Mabolo', 'Pahina Central', 'Pardo', 'Pari-an', 'Sambag I', 'Sambag II', 'San Antonio', 'San Jose', 'San Nicolas Proper', 'San Roque (Ciudad)', 'Santa Cruz', 'Suba', 'T. Padilla', 'Talamban', 'Tisa', 'Zapatera'],
    },
    'Lapu-Lapu (Mactan)': {
      postalCode: '6015',
      barangays: ['Agus', 'Babag', 'Bankal', 'Basak', 'Buaya', 'Calawisan', 'Canjulao', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac', 'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Sabang', 'San Vicente', 'Santa Rosa', 'Subabasbas', 'Talima', 'Tingo', 'Tungasan'],
    },
    'Mandaue': {
      postalCode: '6014',
      barangays: ['Alang-alang', 'Bakilid', 'Banilad', 'Basak', 'Cabancalan', 'Cambaro', 'Canduman', 'Casili', 'Casuntingan', 'Centro', 'Cubacub', 'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc', 'Maguikay', 'Mantuyong', 'Opao', 'Pagsabungan', 'Pakna-an', 'Subangdaku', 'Tabok', 'Tawason', 'Tingub', 'Tipolo', 'Umapad'],
    },
    'Talisay': { postalCode: '6045', barangays: ['Biasong', 'Bulacao', 'Cadulawan', 'Camp 4', 'Cansojong', 'Jaclupang', 'Lagtang', 'Lawaan I', 'Lawaan II', 'Lawaan III', 'Linao', 'Maghaway', 'Manipis', 'Mohon', 'Poblacion', 'Pooc', 'San Isidro', 'San Roque', 'Tabunok', 'Tangke', 'Tapul'] },
  },

  'Negros Oriental': {
    'Dumaguete': { postalCode: '6200', barangays: ['Bagacay', 'Bajumpandan', 'Balugo', 'Banilad', 'Bantayan', 'Batinguel', 'Boloc-boloc', 'Cadawinonan', 'Calindagan', 'Camanjac', 'Cantil-e', 'Daro', 'Junob', 'Looc', 'Mangnao-Canal', 'Motong', 'Piapi', 'Poblacion No. 1', 'Poblacion No. 2', 'Poblacion No. 3', 'Poblacion No. 4', 'Poblacion No. 5', 'Poblacion No. 6', 'Poblacion No. 7', 'Poblacion No. 8', 'Pulantubig', 'Tabuctubig', 'Taclobo', 'Talay'] },
  },

  'Siquijor': {
    'Siquijor': { postalCode: '6225', barangays: ['Caipilan', 'Caitican', 'Cangmunag', 'Canasagan', 'Dumanhog', 'Lala-o', 'Luyang', 'Pasihagon', 'Poblacion', 'Sabang', 'San Antonio', 'Tambisan', 'Tong-an', 'Ponong'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION VIII — EASTERN VISAYAS
  // ═══════════════════════════════════════════════════════
  'Leyte': {
    'Tacloban': { postalCode: '6500', barangays: ['Abucay', 'Anibong', 'Bagacay', 'Cabalawan', 'Caibaan', 'Diit', 'Fatima', 'Libertad', 'Magallanes', 'Magsaysay', 'Naga-Naga', 'New Kawayan', 'Old Kawayan', 'Palanog', 'Rizal', 'Sagkahan', 'San Jose', 'San Roque', 'Santa Elena', 'Santo Niño', 'Suhi', 'Utap', 'V&G Subdivision'] },
    'Ormoc': { postalCode: '6541', barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Cogon', 'Juaton', 'Lao', 'Linao', 'Naungan', 'San Pablo', 'Tongonan'] },
  },

  'Southern Leyte': {
    'Maasin': { postalCode: '6600', barangays: ['Abgao', 'Asuncion', 'Balilit', 'Batuan', 'Combado', 'Guadalupe', 'Ibarra', 'Lonoy', 'Manhilo', 'Mantahan', 'Maria Clara', 'Nasaug', 'Panan-awan', 'Pasay', 'Poblacion District I', 'Poblacion District II', 'San Agustin', 'San Isidro', 'San Rafael', 'San Roque', 'Santa Cruz', 'Santa Rosa', 'Santo Niño', 'Tagnipa', 'Tunga-tunga'] },
  },

  'Samar': {
    'Catbalogan': { postalCode: '6700', barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Bunuanan', 'Canlapwas', 'Guinsorongan', 'Maulong', 'Mercedes', 'Muñoz', 'Payao', 'San Andres', 'San Pablo', 'San Roque'] },
  },

  'Eastern Samar': {
    'Borongan': { postalCode: '6800', barangays: ['Alang-alang', 'Amantacop', 'Aturan', 'Bacawan', 'Balud', 'Bato', 'Baybay', 'Bugas', 'Cabong', 'Campesao', 'Cananhawan', 'Canjaway', 'Hindang', 'Lalawigan', 'Maybacong', 'Pinanag-an', 'Poblacion District 1', 'Poblacion District 2', 'Poblacion District 3', 'Poblacion District 4', 'Punta Maria', 'San Andres', 'San Gabriel', 'San Jose', 'Santa Fe', 'Songco', 'Suribao', 'Taboc'] },
  },

  'Northern Samar': {
    'Catarman': { postalCode: '6400', barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Bobon', 'Cal-igang', 'Cawayan', 'Dalakit', 'Gebulwangan', 'Hinatad', 'Imelda', 'Jacinto', 'Mabini', 'Macagtas', 'Old Rizal', 'Quezon', 'Roxas', 'San Pascual', 'Somoge', 'Talisay', 'UEP I', 'UEP II', 'UEP III'] },
  },

  'Biliran': {
    'Naval': { postalCode: '6543', barangays: ['Agpangi', 'Atipolo', 'Caipilan', 'Calumpang', 'Catmon', 'Inasuyan', 'Larrazabal', 'Libertad', 'Lico', 'Lucsoon', 'Mabini', 'Poblacion', 'San Pablo', 'Santo Niño', 'Talustusan', 'Villa Caneja', 'Villa Consuelo'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION IX — ZAMBOANGA PENINSULA
  // ═══════════════════════════════════════════════════════
  'Zamboanga del Norte': {
    'Dipolog': { postalCode: '7100', barangays: ['Barra', 'Biasong', 'Central', 'Cogon', 'Dicayas', 'Diwan', 'Estaka', 'Galas', 'Gulayon', 'Lugdungan', 'Minaog', 'Miputak', 'Olingan', 'Punta', 'Santa Filomena', 'Santa Isabel', 'Santo Niño', 'Sicayab Bucana', 'Sinaman', 'Turno'] },
    'Dapitan': { postalCode: '7101', barangays: ['Antipolo', 'Aseniero', 'Barcelona', 'Burgos', 'Cabalawan', 'Dampalan', 'Ilaya', 'Larion Alto', 'Larion Bajo', 'Maria Cristina', 'Polo', 'San Francisco', 'San Nicolas', 'San Pedro', 'San Vicente', 'Sta. Cruz', 'Sulangon', 'Tag-ulo', 'Talisay'] },
  },

  'Zamboanga del Sur': {
    'Pagadian': { postalCode: '7016', barangays: ['Alegria', 'Balangasan', 'Balintawak', 'Baloyboan', 'Banale', 'Bogo', 'Bomba', 'Buenavista', 'Dampalan', 'Dao', 'Dumagoc', 'Gatas District', 'Kawit', 'Lourdes', 'Lumbia', 'Manga', 'Muricay', 'Napolan', 'Poblacion', 'San Francisco', 'San Jose', 'San Pedro', 'Santa Lucia', 'Santa Maria', 'Santo Niño', 'Tiguma', 'Tuburan'] },
  },

  'Zamboanga Sibugay': {
    'Ipil': { postalCode: '7001', barangays: ['Bacalan', 'Bangkerohan', 'Bulatok', 'Bulit', 'Caparan', 'Don Andres', 'Ipil Heights', 'Magdaup', 'Makilas', 'Poblacion', 'Sanito', 'Taway', 'Tenan', 'Titanon', 'Veterans Avenue'] },
  },

  'Zamboanga City': {
    'Zamboanga City': { postalCode: '7000', barangays: ['Arena Blanco', 'Ayala', 'Baliwasan', 'Boalan', 'Cabaluay', 'Cacao', 'Calarian', 'Camino Nuevo', 'Campo Islam', 'Canelar', 'Culianan', 'Curuan', 'Divisoria', 'Guiwan', 'La Paz', 'Labuan', 'Lanzones', 'Lapakan', 'Lunzuran', 'Maasin', 'Malagutay', 'Mercedes', 'Pasonanca', 'Putik', 'Recodo', 'Rio Hondo', 'San Jose Cawa-cawa', 'San Jose Gusu', 'San Roque', 'Santa Barbara', 'Santa Catalina', 'Santa Maria', 'Santo Niño', 'Sinubung', 'Sta. Cruz (Pob.)', 'Talon-Talon', 'Tetuan', 'Tugbungan', 'Tumaga', 'Victoria', 'Zone I (Pob.)', 'Zone II (Pob.)', 'Zone III (Pob.)', 'Zone IV (Pob.)'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION X — NORTHERN MINDANAO
  // ═══════════════════════════════════════════════════════
  'Bukidnon': {
    'Malaybalay': { postalCode: '8700', barangays: ['Aglayan', 'Bangcud', 'Busdi', 'Cabangahan', 'Caburacanan', 'Casisang', 'Dalwangan', 'Imbayao', 'Kalasungay', 'Managok', 'Manalog', 'Mapayag', 'Musuan', 'Patpat', 'Poblacion', 'San Jose', 'San Martin', 'Santo Niño', 'Sumpong', 'Violeta'] },
    'Valencia': { postalCode: '8709', barangays: ['Bagontaas', 'Colonia', 'Concepcion', 'Dagat-Dagatan', 'Guinoyoran', 'Laligan', 'Lilingayon', 'Lumbayao', 'Lurogan', 'Mailag', 'Mt. Pleasant', 'Pinatilan', 'Poblacion', 'San Carlos', 'Sinayawan', 'Sugod', 'Tongantongan'] },
  },

  'Camiguin': {
    'Mambajao': { postalCode: '9100', barangays: ['Agoho', 'Balbagon', 'Benhaan', 'Bug-ong', 'Kuguita', 'Poblacion', 'Pandan', 'Soro-soro', 'Tagdo', 'Tupsan', 'Yumbing'] },
  },

  'Lanao del Norte': {
    'Iligan': { postalCode: '9200', barangays: ['Abuno', 'Acmac', 'Bagong Silang', 'Bonbonon', 'Bunawan', 'Buru-un', 'Dalipuga', 'Del Carmen', 'Digkilaan', 'Ditucalan', 'Dulag', 'Hinaplanon', 'Hindang', 'Kabacsanan', 'Kalilangan', 'Kiwalan', 'Lanipao', 'Luinab', 'Mainit', 'Mandulog', 'Maria Cristina', 'Palao', 'Panoroganan', 'Poblacion', 'Puga-an', 'Rogongon', 'San Miguel', 'San Roque', 'Santa Elena', 'Santa Filomena', 'Santiago', 'Santo Rosario', 'Saray', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy', 'Tubod', 'Ubaldo Laya', 'Villa Verde'] },
  },

  'Misamis Occidental': {
    'Ozamiz': { postalCode: '7200', barangays: ['Aguada', 'Bagakay', 'Banadero', 'Baybay San Roque', 'Baybay Santa Cruz', 'Baybay Triunfo', 'Bongbong', 'Calabayan', 'Carangan', 'Catadman', 'Cogon', 'Gala', 'Guinea', 'Lam-an', 'Limpapa', 'Litapan', 'Malaubang', 'Mentering', 'Molicay', 'Pantaon', 'Poblacion', 'San Antonio', 'Tinago', 'Triunfo', 'Tuyaw'] },
    'Oroquieta': { postalCode: '7207', barangays: ['Apil', 'Binuangan', 'Bunga', 'Buntawan', 'Burgos', 'Canubay', 'Dolipos Bajo', 'Dolipos Alto', 'Layawan', 'Macabog', 'Mialen', 'Mobod', 'Paypayan', 'Pines', 'Poblacion I', 'Poblacion II', 'Tolosa', 'Villaflor'] },
  },

  'Misamis Oriental': {
    'Cagayan de Oro': { postalCode: '9000', barangays: ['Agusan', 'Baikingon', 'Balulang', 'Bayabas', 'Bonbon', 'Bugo', 'Bulua', 'Camaman-an', 'Canitoan', 'Carmen', 'Consolacion', 'Cugman', 'Gusa', 'Iponan', 'Kauswagan', 'Lapasan', 'Lumbia', 'Macabalan', 'Macasandig', 'Nazareth', 'Puntod', 'Puerto', 'Tablon', 'Tignapoloan', 'Poblacion'] },
    'El Salvador': { postalCode: '9017', barangays: ['Amoros', 'Bolisong', 'Cogon', 'Hagonoy', 'Hinigdaan', 'Kalabaylabay', 'Kibonbon', 'Molugan', 'Poblacion', 'Sambulawan', 'Sinaloc', 'Taytay'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION XI — DAVAO REGION
  // ═══════════════════════════════════════════════════════
  'Davao del Norte': {
    'Tagum': { postalCode: '8100', barangays: ['Apokon', 'Bincungan', 'Busaon', 'Canocotan', 'Cuambogan', 'La Filipina', 'Liboganon', 'Madaum', 'Magdum', 'Magugpo East', 'Magugpo North', 'Magugpo Poblacion', 'Magugpo South', 'Magugpo West', 'Mankilam', 'New Balamban', 'Nueva Fuerza', 'Pagsabangan', 'Pandapan', 'San Agustin', 'San Isidro', 'San Miguel', 'Visayan Village'] },
    'Panabo': { postalCode: '8105', barangays: ['A. O. Floirendo', 'Buenavista', 'Cagangohan', 'Consolacion', 'Dapco', 'Gredu', 'J. P. Laurel', 'Kasilak', 'Katipunan', 'Kauswagan', 'Little Panay', 'Lower Panaga', 'Mabunao', 'Maduao', 'Manay', 'Nanyo', 'New Malaga', 'New Pandan', 'New Visayas', 'Poblacion', 'Quezon', 'Salvacion', 'San Francisco', 'San Nicolas', 'San Pedro', 'San Roque', 'San Vicente', 'Santa Cruz', 'Santo Niño', 'Sindaton', 'Tagpore', 'Tibungol'] },
  },

  'Davao del Sur': {
    'Davao City': {
      postalCode: '8000',
      barangays: ['Agdao', 'Bangkal', 'Bago Aplaya', 'Bago Gallera', 'Bago Oshiro', 'Bajada', 'Buhangin', 'Bunawan', 'Cabantian', 'Calinan', 'Catalunan Grande', 'Catalunan Pequeño', 'Communal', 'Daliao', 'Dumoy', 'Ecoland', 'Guadalupe', 'Indangan', 'Langub', 'Ma-a', 'Magtuod', 'Mandug', 'Matina Aplaya', 'Matina Crossing', 'Matina Pangi', 'Mintal', 'Pampanga', 'Panacan', 'Sasa', 'Talomo', 'Tigatto', 'Toril'],
    },
    'Digos': {
      postalCode: '8002',
      barangays: ['Aplaya', 'Balabag', 'Binaton', 'Cogon', 'Colorado', 'Dawis', 'Dulangan', 'Goma', 'Igpit', 'Kapatagan', 'Kiagot', 'Lungag', 'Mahayahay', 'Matti', 'Ruparan', 'San Agustin', 'San Jose', 'San Miguel', 'San Roque', 'Sinawilan', 'Soong', 'Tiguman', 'Tres de Mayo', 'Zone 1 (Pob.)', 'Zone 2 (Pob.)', 'Zone 3 (Pob.)'],
    },
  },

  'Davao Oriental': {
    'Mati': { postalCode: '8200', barangays: ['Badas', 'Bobon', 'Buso', 'Cabuaya', 'Central (Pob.)', 'Culaman', 'Dahican', 'Dawan', 'Don Enrique Lopez', 'Don Martin Marundan', 'Don Salvador Lopez', 'Langka', 'Libudon', 'Luban', 'Macambol', 'Mamali', 'Matiao', 'Mayo', 'Sainz', 'Sanghay', 'Tagabakid', 'Tagbinonga', 'Taguibo', 'Tamisan'] },
  },

  'Davao Occidental': {
    'Malita': { postalCode: '8012', barangays: ['Bito', 'Bolila', 'Demoloc', 'Felis', 'Fishing Village', 'Kibalatong', 'Kinangan', 'Ladayon', 'Mana', 'Manuel Peralta', 'Pangaleon', 'Pinalpalan', 'Poblacion', 'Sangay', 'Talogoy', 'Tical', 'Tubalan'] },
  },

  'Davao de Oro': {
    'Nabunturan': { postalCode: '8800', barangays: ['Anislagan', 'Antequera', 'Basak', 'Bayabas', 'Bukal', 'Cabidianan', 'Magading', 'Mainit', 'Manat', 'New Sibonga', 'Oguis', 'Pangutosan', 'Poblacion', 'San Isidro', 'San Roque', 'San Vicente', 'Santo Niño'] },
    'Compostela': { postalCode: '8803', barangays: ['Bagongon', 'Gabi', 'Lapu-lapu', 'Mangayon', 'Mapaca', 'Maparat', 'New Alegria', 'Ngan', 'Osmeña', 'Panansalan', 'Poblacion', 'Siocon', 'Tamia'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION XII — SOCCSKSARGEN
  // ═══════════════════════════════════════════════════════
  'South Cotabato': {
    'General Santos (GenSan)': { postalCode: '9500', barangays: ['Apopong', 'Baluan', 'Buayan', 'Bula', 'Calumpang', 'City Heights', 'Conel', 'Dadiangas East', 'Dadiangas North', 'Dadiangas South', 'Dadiangas West', 'Fatima', 'Katangawan', 'Labangal', 'Lagao', 'Ligaya', 'Mabuhay', 'Olympog', 'San Isidro', 'San Jose', 'Siguel', 'Sinawal', 'Tambler', 'Tinagacan', 'Upper Labay'] },
    'Koronadal': { postalCode: '9506', barangays: ['Assumption', 'Avocado', 'Cacub', 'Caloocan', 'Carpenter Hill', 'Concepcion', 'Esperanza', 'Magsaysay', 'Mambucal', 'Morales', 'New Pangasinan', 'Paraiso', 'Rotonda', 'San Isidro', 'San Jose', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Saravia', 'Topland', 'Zone I (Pob.)', 'Zone II (Pob.)', 'Zone III (Pob.)', 'Zone IV (Pob.)'] },
  },

  'Cotabato (North Cotabato)': {
    'Kidapawan': { postalCode: '9400', barangays: ['Amas', 'Amazion', 'Balabag', 'Balindog', 'Binoligan', 'Gayola', 'Ginatilan', 'Ilomavis', 'Indangan', 'Junction', 'Kalaisan', 'Luvimin', 'Macabolig', 'Manongol', 'Marbel', 'Mateo', 'Mua-an', 'New Bohol', 'Nuangan', 'Onica', 'Paco', 'Patadon', 'Perez', 'Poblacion', 'San Isidro', 'San Roque', 'Sikada', 'Singao', 'Sudapin', 'Sumbao'] },
  },

  'Sultan Kudarat': {
    'Tacurong': { postalCode: '9800', barangays: ['Baras', 'Buenaflor', 'Calean', 'EJC Montilla', 'Griño', 'Kalandagan', 'Lagao', 'Lower Katungal', 'New Isabela', 'New Lagao', 'Poblacion', 'San Antonio', 'San Emmanuel', 'San Pablo', 'San Rafael', 'Tina', 'Upper Katungal'] },
  },

  'Sarangani': {
    'Alabel': { postalCode: '9501', barangays: ['Alegria', 'Bagacay', 'Baluntay', 'Datal Anggas', 'Domolok', 'Kawas', 'Maribulan', 'Pag-asa', 'Paraiso', 'Poblacion', 'Spring', 'Tokawal'] },
  },

  // ═══════════════════════════════════════════════════════
  // REGION XIII — CARAGA
  // ═══════════════════════════════════════════════════════
  'Agusan del Norte': {
    'Butuan': { postalCode: '8600', barangays: ['Agao', 'Agusan Pequeño', 'Ambago', 'Amparo', 'Ampayon', 'Anticala', 'Baan KM 3', 'Baan Riverside', 'Babag', 'Bading', 'Bancasi', 'Banza', 'Bit-os', 'Bitan-agan', 'Bobon', 'Bonbon', 'Buhangin', 'Dankias', 'De Gracia', 'Doongan', 'Dulag', 'Dumalagan', 'Florida', 'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas', 'Jose Rizal', 'Kinamlutan', 'Libertad', 'Limaha', 'Los Angeles', 'Lumbocan', 'Mahay', 'Maibu', 'Mandamo', 'Maon', 'Masao', 'Maug', 'Obrero', 'Ong Yiu', 'Pianing', 'Pigdaulan', 'Pinamanculan', 'Port Poyohon', 'Rajah Soliman', 'Salvacion', 'San Ignacio', 'San Mateo', 'San Vicente', 'Sikatuna', 'Silongan', 'Sumilihon', 'Tagabaca', 'Taguibo', 'Taligaman', 'Tandang Sora', 'Tiniwisan', 'Tungao', 'Villa Kananga'] },
  },

  'Agusan del Sur': {
    'Prosperidad': { postalCode: '8500', barangays: ['Aurora', 'Awa', 'Azpetia', 'Poblacion (Kauswagan)', 'La Caridad', 'La Suerte', 'Las Navas', 'Libertad', 'Lucena', 'Mabuhay', 'Mapaga', 'New Salem', 'Patin-ay', 'San Jose', 'San Lorenzo', 'San Martin', 'San Pedro', 'San Rafael', 'San Salvador', 'San Vicente', 'Santa Irene', 'Virgilia'] },
  },

  'Surigao del Norte': {
    'Surigao City': { postalCode: '8400', barangays: ['Anomar', 'Balibayon', 'Bilabid', 'Bonifacio', 'Canlandog', 'Cebola', 'Lipata', 'Luna', 'Mabini', 'Mabua', 'Rizal', 'Nabago', 'Poctoy', 'Poblacion', 'Sabang', 'San Isidro', 'San Jose', 'San Juan', 'San Roque', 'Serna', 'Sidlakan', 'Taft', 'Telaje', 'Trinidad', 'Washington'] },
    'Siargao (General Luna)': { postalCode: '8419', barangays: ['Anajawan', 'Cabitoonan', 'Catangnan', 'Consuelo', 'Corazon', 'Daku', 'Malinao', 'Poblacion', 'Santa Cruz', 'Suyangan', 'Tawin-tawin'] },
  },

  'Surigao del Sur': {
    'Tandag': { postalCode: '8300', barangays: ['Awasian', 'Bag-ong Lungsod', 'Bioto', 'Bongtod Pob.', 'Buenavista', 'Dagocdoc', 'Mabua', 'Mabuhay', 'Maputi', 'Pandanon', 'Rosario', 'Salvacion', 'San Agustin Norte', 'San Agustin Sur', 'San Antonio', 'San Isidro', 'San Jose', 'Telaga'] },
    'Bislig': { postalCode: '8311', barangays: ['Coleto', 'Comawas', 'Cuyago', 'Kahayag', 'Labisma', 'Lawigan', 'Mangagoy', 'Mone', 'Pamaypayan', 'Poblacion', 'San Antonio', 'San Fernando', 'San Isidro', 'San Jose', 'San Roque', 'San Vicente', 'Santa Cruz', 'Sibaroy', 'Tabon'] },
  },

  'Dinagat Islands': {
    'San Jose': { postalCode: '8427', barangays: ['Aurelio', 'Cuarinta', 'Don Ruben Ecleo', 'Jacquez', 'Justiniana Edera', 'Luna', 'Mahayahay', 'Mauswagon', 'Navarro', 'Poblacion', 'San Jose', 'Santa Cruz', 'Wilson'] },
  },

  // ═══════════════════════════════════════════════════════
  // BARMM — BANGSAMORO AUTONOMOUS REGION IN MUSLIM MINDANAO
  // ═══════════════════════════════════════════════════════
  'Lanao del Sur': {
    'Marawi': { postalCode: '9700', barangays: ['Bangon', 'Basak Malutlut', 'Beyaba-Damag', 'Buadi Sacayo', 'Cadayonan', 'Calalauan', 'Daguduban', 'Dansalan', 'Datu Sa Dansalan', 'Fort', 'Lolod Proper', 'Lomidong', 'Marinaut', 'Matampay', 'Mipaga', 'Pantaon', 'Poblacion', 'Rapasun MSU', 'Raya Madaya I', 'Raya Madaya II', 'Rorogagus East', 'Rorogagus Proper', 'Saber', 'Sogod Proper', 'Tuca', 'Wawalayan'] },
  },

  'Maguindanao del Norte': {
    'Cotabato City': { postalCode: '9600', barangays: ['Bagua I', 'Bagua II', 'Bagua III', 'Kalanganan I', 'Kalanganan II', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'Poblacion IV', 'Poblacion V', 'Poblacion VI', 'Poblacion VII', 'Poblacion VIII', 'Poblacion IX', 'Rosary Heights I', 'Rosary Heights II', 'Rosary Heights III', 'Rosary Heights IV', 'Rosary Heights V', 'Rosary Heights VI', 'Tamontaka I', 'Tamontaka II', 'Tamontaka III', 'Tamontaka IV', 'Tamontaka V'] },
  },

  'Maguindanao del Sur': {
    'Buluan': { postalCode: '9616', barangays: ['Digal', 'Limpongo', 'Lower Siling', 'Poblacion', 'Popol', 'Talayan', 'Upper Siling'] },
  },

  'Basilan': {
    'Isabela City': { postalCode: '7300', barangays: ['Aguada', 'Baluno', 'Begang', 'Binuangan', 'Busay', 'Cabunbata', 'Calvario', 'Carbon', 'Isabela Proper (Pob.)', 'Kaumpurnah Zone I', 'Kaumpurnah Zone II', 'Kaumpurnah Zone III', 'La Piedad (Pob.)', 'Lumbang', 'Marketsite (Pob.)', 'Menzi', 'Panigayan', 'Riverside', 'San Rafael', 'Santa Cruz (Pob.)', 'Seaside (Pob.)', 'Sumagdang', 'Sunrise Village (Pob.)', 'Tabiawan', 'Tabuk (Pob.)'] },
  },

  'Sulu': {
    'Jolo': { postalCode: '7400', barangays: ['Alat', 'Asturias', 'Bus-bus', 'Chinese Pier', 'San Raymundo', 'Taglibi', 'Takut-takut', 'Tulay', 'Walled City (Pob.)'] },
  },

  'Tawi-Tawi': {
    'Bongao': { postalCode: '7500', barangays: ['Ipil', 'Karungdong', 'Lakit-lakit', 'Lamion', 'Lato-lato', 'Luuk Pandan', 'Nalil', 'Pag-asa', 'Pahut', 'Palabuhan', 'Pasiagan', 'Poblacion', 'Sanga-sanga', 'Silubog', 'Simandagit', 'Sumangat', 'Tarawakan', 'Tongsinah', 'Tubig Basag', 'Tubig Tanah'] },
  },

  // ═══════════════════════════════════════════════════════
  // CORDILLERA ADMINISTRATIVE REGION (CAR)
  // ═══════════════════════════════════════════════════════
  'Abra': {
    'Bangued': { postalCode: '2800', barangays: ['Agtangao', 'Angad', 'Bangbangar', 'Cabuloan', 'Calaba', 'Cosili East (Proper)', 'Cosili West (Buaoy)', 'Dangdangla', 'Lacub', 'Macarcarmay', 'Nyuad', 'Palao', 'Poblacion', 'Sagap', 'San Antonio', 'Santa Rosa', 'Zone 1 (Pob.)', 'Zone 2 (Pob.)', 'Zone 3 (Pob.)', 'Zone 4 (Pob.)', 'Zone 5 (Pob.)', 'Zone 6 (Pob.)', 'Zone 7 (Pob.)'] },
  },

  'Apayao': {
    'Kabugao': { postalCode: '3800', barangays: ['Badduat', 'Baliwanan', 'Dagara', 'Lenneng', 'Madatag', 'Magabbenig', 'Poblacion', 'Tuyangan'] },
  },

  'Benguet': {
    'Baguio City': { postalCode: '2600', barangays: ['Abanao-Zandueta-Kayong-Chugum-Otek (AZKCO)', 'Ambiong', 'Asin Road', 'Atok Trail', 'Aurora Hill Proper', 'Aurora Hill North Central', 'Aurora Hill South Central', 'BGH Compound', 'Bakakeng Central', 'Bakakeng North', 'Bayan Park East', 'Bayan Park Village', 'Bayan Park West', 'Brookspoint', 'Brookside', 'Cabinet Hill-Teacher\'s Camp', 'Camp 7', 'Camp 8', 'Camp Allen', 'Campo Filipino', 'City Camp Central', 'City Camp Proper', 'Country Club Village', 'Dagsian Lower', 'Dagsian Upper', 'DPS Area', 'Dizon Subdivision', 'Dontogan', 'Engineers\' Hill', 'Fairview Village', 'Fort del Pilar', 'Gabriela Silang', 'General Luna Lower', 'General Luna Upper', 'Gibraltar', 'Greenwater Village', 'Guisad Central', 'Guisad Sorong', 'Happy Hollow', 'Happy Homes', 'Harrison-Claudio Carantes', 'Hillside', 'Holy Ghost Extension', 'Holy Ghost Proper', 'Honeymoon', 'Irisan', 'Kabayanihan', 'Kagitingan', 'Kayang Extension', 'Kayang-Hilltop', 'Kias', 'Legarda-Burnham-Kisad', 'Liwanag-Loakan', 'Loakan Proper', 'Lopez Jaena', 'Lourdes Subdivision Extension', 'Lourdes Subdivision Lower', 'Lourdes Subdivision Proper', 'Lualhati', 'Lucnab', 'Magsaysay Lower', 'Magsaysay Private Road', 'Magsaysay Upper', 'Malcolm Square-Perfecto', 'Manuel A. Roxas', 'Market Subdivision Upper', 'Military Cut-Off', 'Mines View Park', 'Modern Site East', 'Modern Site West', 'MRR-Queen of Peace', 'New Lucban', 'Outlook Drive', 'Pacdal', 'Padre Burgos', 'Padre Zamora', 'Phil-Am', 'Pinget', 'Pinsao Pilot Project', 'Pinsao Proper', 'Poliwes', 'Pucsusan', 'Quezon Hill Proper', 'Quezon Hill Upper', 'Quirino Hill East', 'Quirino Hill Lower', 'Quirino Hill Middle', 'Quirino Hill West', 'Rizal Monument Area', 'Rock Quarry Lower', 'Rock Quarry Middle', 'Rock Quarry Upper', 'Saint Joseph Village', 'Salud Mitra', 'San Antonio Village', 'San Luis Village', 'San Roque Village', 'San Vicente', 'Sanitary Camp North', 'Sanitary Camp South', 'Santo Rosario', 'Santo Tomas Proper', 'Santo Tomas School Area', 'Scout Barrio', 'Session Road Area', 'Slaughter House Area', 'SLU-SVP Housing Village', 'South Drive', 'Trancoville', 'Victoria Village'] },
    'La Trinidad': { postalCode: '2601', barangays: ['Alapang', 'Alno', 'Ambiong', 'Bahong', 'Balili', 'Beckel', 'Betag', 'Bineng', 'Cruz', 'Lubas', 'Pico', 'Poblacion', 'Puguis', 'Shilan', 'Tawang', 'Wangal'] },
  },

  'Ifugao': {
    'Lagawe': { postalCode: '3600', barangays: ['Abinuan', 'Bangbang', 'Boble', 'Burnay', 'Buyabuyan', 'Caba', 'Cudog', 'Dulao', 'Jucbong', 'Luta', 'Montabiong', 'Olilicon', 'Piwong', 'Poblacion East', 'Poblacion North', 'Poblacion South', 'Poblacion West', 'Pumbato', 'Tungngod'] },
  },

  'Kalinga': {
    'Tabuk': { postalCode: '3800', barangays: ['Amlao', 'Appas', 'Bado Dangwa', 'Bagumbayan', 'Bulanao', 'Calanan', 'Casigayan', 'Dagupan Centro', 'Dagupan Weste', 'Dilag', 'Dugo', 'Ipil', 'Laya East', 'Laya West', 'Lucban', 'Magsaysay', 'Naneng', 'Poblacion', 'Pulag', 'San Juan', 'Tuga'] },
  },

  'Mountain Province': {
    'Bontoc': { postalCode: '2616', barangays: ['Alab Oriente', 'Alab Proper', 'Balili', 'Bayyo', 'Bontoc Ili', 'Calutit', 'Dalican', 'Gonogon', 'Guinaang', 'Mainit', 'Maligcong', 'Poblacion (Centro)', 'Samoki', 'Talubin', 'Tocucan'] },
  },
};

/**
 * Get all province names, sorted alphabetically.
 */
export function getProvinces() {
  return Object.keys(PH_ADDRESSES).sort();
}

/**
 * Get all cities/municipalities in a province, sorted alphabetically.
 */
export function getCities(province) {
  if (!province || !PH_ADDRESSES[province]) return [];
  return Object.keys(PH_ADDRESSES[province]).sort();
}

/**
 * Get all barangays in a city, sorted alphabetically.
 */
export function getBarangays(province, city) {
  if (!province || !city) return [];
  const cityData = PH_ADDRESSES[province]?.[city];
  if (!cityData) return [];
  return [...cityData.barangays].sort();
}

/**
 * Get the postal code for a city.
 */
export function getPostalCode(province, city) {
  if (!province || !city) return '';
  return PH_ADDRESSES[province]?.[city]?.postalCode || '';
}

export default PH_ADDRESSES;

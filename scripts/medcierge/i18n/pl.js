/* Polish copy for Elite Medical Concierge, design 2.
   Translated 2026-09-14 from scripts/medcierge/content.js (Gemini was unavailable:
   prepaid credit depleted). Polite register. Same claims, same numbers, no additions.
   The Hurghada page keeps the languages the doctors actually speak (EN, DE, RU, AR):
   it does not claim Polish-speaking doctors.
   NOT YET REVIEWED BY A NATIVE SPEAKER.
   Deep-merged over the English object: anything not listed here stays English. */

module.exports = {
  site: {
    tagline: 'Opieka medyczna światowej klasy z ciepłem egipskiej gościnności.',
  },

  nav: [
    { label: 'O nas' },
    { label: 'Usługi' },
    { label: 'Placówki' },
    { label: 'Obszary działania' },
    { label: 'Partnerzy' },
    { label: 'Wideokonsultacja' },
    { label: 'Kontakt' },
  ],

  logos: { intl: 'Międzynarodowe standardy' },

  home: {
    meta: {
      title: 'Elite Medical Concierge w najlepszych hotelach Egiptu',
      description: 'Elite Medical Concierge w najlepszych hotelach Egiptu. Lekarz w hotelu przez całą dobę, 50+ hoteli partnerskich, lekarze z certyfikatami UE i USA.',
    },
    hero: {
      badge: 'Elite VIP Medical Concierge · Zaufało nam 50+ hoteli',
      h1a: 'Opieka medyczna światowej klasy',
      h1b: 'W hotelach światowej klasy',
      lead: 'Opieka medyczna bez stresu: lekarze z międzynarodową akredytacją, mobilna diagnostyka i całodobowy serwis concierge. Wszystko w Państwa luksusowym resorcie.',
      leadAccent: 'Dostępni 24/7',
      primary: 'Poproś o konsultację',
      secondary: 'Nasze usługi',
      stats: [
        { label: 'Obsłużonych pacjentów' },
        { label: 'Luksusowych hoteli' },
        { label: 'Ocena pacjentów' },
        { label: 'Regionów' },
      ],
      features: [
        { text: 'Lekarz dyżurny w hotelu' },
        { title: 'Bezgotówkowo', text: 'Rozliczenie z ubezpieczycielem' },
        { title: 'Certyfikaty', text: 'Lekarze z UE i USA' },
        { title: '10+ języków', text: 'Opieka wielojęzyczna' },
      ],
      quote: {
        text: 'Wyjątkowa opieka wtedy, gdy najbardziej jej potrzebowaliśmy. Lekarz przyjechał w ciągu 30 minut i mówił perfekcyjnie po niemiecku. Naprawdę światowa klasa.',
      },
    },
    trust: {
      eyebrow: 'Zaufało nam 50+ luksusowych hoteli i resortów',
      h2: 'Zaufany partner medyczny w całym Egipcie',
      groups: [
        { label: 'Hotele partnerskie' },
        { label: 'Ubezpieczyciele' },
        { label: 'Touroperatorzy i akredytacje' },
      ],
      note: 'Współpracujemy z 50+ luksusowymi hotelami i 20+ ubezpieczycielami w całym Egipcie',
    },
    services: {
      eyebrow: 'Kompleksowa opieka medyczna',
      h2: 'Nasze usługi',
      lead: 'Od pomocy w nagłych przypadkach po konsultacje specjalistyczne: zapewniamy opiekę na poziomie szpitala w Państwa hotelu.',
      items: [
        { title: 'Lekarze specjaliści na wezwanie', text: 'Lekarze z podwójnym certyfikatem z Egiptu i Europy, dostępni całą dobę w Państwa hotelu.' },
        { title: 'Radiologia mobilna', text: 'Nowoczesna, przenośna diagnostyka obrazowa dostarczana bezpośrednio do klinik hotelowych.' },
        { title: 'Badania laboratoryjne', text: 'Kompleksowe badania diagnostyczne z szybkimi wynikami, bez wychodzenia z hotelu.' },
        { title: 'Oddział opieki pośredniej', text: 'Profesjonalna obserwacja i monitorowanie pacjentów wymagających dłuższej opieki.' },
        { title: 'Wielojęzyczni koordynatorzy', text: 'Opiekunowie przypadków władający wieloma językami, dbający o sprawną komunikację.' },
        { title: 'Zabiegi medyczne', text: 'Drobne zabiegi i leczenie w akredytowanych klinikach hotelowych.' },
        { title: 'Dostawa leków', text: 'Leki na receptę i materiały medyczne dostarczane prosto do pokoju.' },
        { title: 'Asysta i transport', text: 'Pełna koordynacja i asysta, gdy potrzebna jest wizyta w placówce zewnętrznej.' },
        { title: 'Obsługa ubezpieczeń', text: 'Rozliczenia bezgotówkowe z głównymi ubezpieczycielami i pełna dokumentacja.' },
      ],
    },
    facilities: {
      eyebrow: 'Placówki światowej klasy',
      h2: 'Opieka na najwyższym poziomie',
      lead: 'Nasze nowoczesne placówki i sprzęt zapewniają najwyższą jakość opieki medycznej w luksusowym, komfortowym otoczeniu. Każdy szczegół służy Państwa dobremu samopoczuciu.',
      features: [
        { title: 'Wielojęzyczny personel', text: 'Koordynatorzy w 10+ językach' },
        { title: 'Diagnostyka na miejscu', text: 'RTG, USG i laboratorium' },
        { title: 'Transport medyczny', text: 'Flota karetek' },
        { title: 'Placówki premium', text: 'Luksusowe warunki leczenia' },
      ],
    },
    whyUs: {
      eyebrow: 'Różnica Elite',
      h2a: 'Dlaczego goście',
      h2b: 'nam ufają',
      lead: 'Nie tylko świadczymy usługi medyczne. Dajemy spokój ducha i dbamy, by każdy gość otrzymał opiekę pełną troski i profesjonalizmu.',
      items: [
        { title: 'Natychmiastowa pomoc 24/7', text: 'Jesteśmy dostępni przez całą dobę, by pomóc dokładnie wtedy, gdy tego Państwo potrzebują, o każdej porze dnia i nocy.' },
        { title: 'Opieka bez stresu', text: 'Bez przewożenia do szpitala i bez papierologii. Zajmujemy się wszystkim, a Państwo mogą skupić się na powrocie do zdrowia.' },
        { title: 'Otoczeni troską', text: 'Powrót do zdrowia w komforcie hotelu, przy wsparciu rodziny, przyjaciół i naszego zespołu medycznego.' },
        { title: 'Wielojęzyczny profesjonalizm', text: 'Nasz międzynarodowy zespół porozumiewa się bez problemu w Państwa języku.' },
        { title: 'Pełna koordynacja', text: 'Współpracujemy z hotelami, biurami podróży, ubezpieczycielami i rodzinami, zapewniając spójną, kompleksową opiekę.' },
        { title: 'Europejskie standardy', text: 'Nasi lekarze mają podwójne certyfikaty i przestrzegają najwyższych międzynarodowych protokołów medycznych.' },
      ],
      stats: [
        { label: 'Hoteli partnerskich' },
        { label: 'Lekarzy specjalistów' },
        { label: 'Dostępność' },
        { label: 'Zadowolonych gości' },
      ],
    },
    steps: {
      eyebrow: 'Jak to działa',
      h2a: 'Sprawna opieka',
      h2b: 'w czterech prostych krokach',
      items: [
        { title: 'Kontakt z zespołem', text: 'Prosimy o kontakt przez całą dobę przez recepcję hotelu lub nasz numer alarmowy.' },
        { title: 'Przydzielenie koordynatora', text: 'Wielojęzyczny koordynator prowadzi Państwa sprawę i całą komunikację.' },
        { title: 'Przyjazd lekarza', text: 'Certyfikowany specjalista odwiedza Państwa w hotelu z niezbędnym sprzętem medycznym.' },
        { title: 'Pełna opieka', text: 'Od leczenia po wizytę kontrolną, wspieramy Państwa powrót do zdrowia.' },
      ],
    },
    accreditations: {
      eyebrow: 'Międzynarodowe uznanie',
      h2a: 'Akredytowana jakość,',
      h2b: 'której można zaufać',
      lead: 'Nasze kliniki spełniają najwyższe międzynarodowe standardy, potwierdzone przez wiodące światowe organizacje ochrony zdrowia.',
      checks: [
        'Lekarze z podwójnym międzynarodowym certyfikatem (Egipt, Europa i USA)',
        'System zarządzania jakością ISO 9001',
        'Międzynarodowe protokoły bezpieczeństwa pacjentów',
        'Przetwarzanie danych zgodne z HIPAA',
        'Certyfikacja w zakresie ratownictwa',
        'Szkolenia z zaawansowanych zabiegów resuscytacyjnych',
      ],
      cards: [
        { title: 'Międzynarodowe standardy', text: 'Nasi lekarze posiadają podwójne międzynarodowe certyfikaty i stosują amerykańskie oraz europejskie protokoły i wytyczne' },
        { badge: 'Oficjalny Partner', text: 'Doskonałość w turystyce medycznej i opiece nad pacjentami zagranicznymi' },
        { badge: 'Oficjalny Partner', text: 'Europejskie standardy medical wellness i profilaktyki' },
        { text: 'Certyfikowana doskonałość w pomocy doraźnej i opiece skoncentrowanej na pacjencie' },
      ],
      quote: 'Opieka medyczna na międzynarodowym poziomie w najbardziej prestiżowych hotelach Egiptu',
    },
    partners: {
      eyebrow: 'Zaufane partnerstwa',
      h2a: 'Elitarni partnerzy',
      h2b: 'w hotelarstwie i ubezpieczeniach',
      lead: 'Współpracujemy z hotelami i resortami światowej klasy oraz wiodącymi ubezpieczycielami podróżnymi, by zapewnić gościom sprawną opiekę medyczną.',
      hotelsTitle: 'Luksusowe hotele i resorty',
      insuranceTitle: 'Partnerzy ubezpieczeniowi',
      insuranceSuffix: 'Ubezpieczenia',
      note: 'Nie widzą Państwo swojego hotelu lub ubezpieczyciela? Prosimy o kontakt, sprawdzimy zakres ochrony.',
      pill: 'Współpracujemy z 50+ partnerami międzynarodowymi',
    },
    areas: {
      eyebrow: 'Działamy w całym Egipcie',
      h2: 'Obszary działania',
      lead: 'Proszę kliknąć lokalizację, aby zobaczyć nasz zasięg w najpopularniejszych kierunkach Egiptu.',
    },
    contact: {
      eyebrow: 'Kontakt',
      h2a: 'Potrzebują Państwo pomocy medycznej?',
      h2b: 'Jesteśmy do dyspozycji',
      lead: 'Nasz zespół jest dostępny przez całą dobę, by udzielić natychmiastowej pomocy. Nagły przypadek czy zwykła dolegliwość, wystarczy jeden telefon.',
      items: [
        { label: 'Numer alarmowy', sub: 'Dostępni 24/7' },
        { label: 'E-mail', sub: 'Szybka odpowiedź' },
        { label: 'Obszary działania', value: 'Kair, Aleksandria, Morze Czerwone, Synaj, Dolina Nilu', sub: 'W tym Hurghada, Sharm El Sheikh, Alamein, Marsa Matrouh, Dahab, Luksor, Asuan i inne' },
        { label: 'Dostępność', value: '24 godziny / 7 dni', sub: 'Również w święta' },
      ],
      form: {
        title: 'Zamów oddzwonienie',
        fields: [
          { label: 'Imię i nazwisko' },
          { label: 'Numer telefonu' },
          { label: 'Hotel / resort' },
          { label: 'W czym możemy pomóc?' },
        ],
        submit: 'Zamów oddzwonienie',
        note: 'W nagłych przypadkach prosimy dzwonić bezpośrednio na nasz numer alarmowy.',
      },
    },
  },

  areas: [
    { region: 'Wielki Kair' },
    { region: 'Wybrzeże Morza Śródziemnego' },
    { region: 'Morze Czerwone' },
    { region: 'Południowy Synaj' },
    { region: 'Morze Czerwone' },
    { region: 'Morze Czerwone', hours: '8:00 - 22:00' },
    { region: 'Wybrzeże Północne', hours: '24/7 (sezon letni)' },
    { region: 'Wybrzeże Północne', hours: '8:00 - 22:00' },
    { region: 'Morze Czerwone' },
    { region: 'Południowy Synaj', hours: '8:00 - 22:00' },
    { region: 'Dolina Nilu' },
    { region: 'Dolina Nilu', hours: '8:00 - 22:00' },
  ],

  facilities: [
    {
      tags: ['Luksus', 'Premium'], title: 'Prywatne kliniki Elite',
      text: 'Nowoczesne, luksusowe placówki medyczne z wyposażeniem premium, marmurowymi wnętrzami i przyjazną atmosferą.',
      list: ['Marmur i wykończenia premium', 'Prywatne gabinety', 'Wygodne poczekalnie', 'Udogodnienia premium', 'Klimatyzacja', 'Dostępność dla osób z niepełnosprawnościami'],
    },
    {
      tags: ['24/7', 'Wyposażenie'], title: 'Centra pomocy doraźnej',
      text: 'W pełni wyposażone gabinety z najnowszą technologią medyczną, monitorami funkcji życiowych i zaawansowaną diagnostyką do natychmiastowej pomocy.',
      list: ['Zaawansowane monitory funkcji życiowych', 'Sprzęt ratunkowy', 'Defibrylatory', 'Stanowiska do terapii dożylnej', 'Systemy sterylizacji', 'Szybka gotowość do działania'],
    },
    {
      tags: ['Wielojęzyczni', 'Certyfikaty'], title: 'Zespół medyczny Elite',
      text: 'Nasz zróżnicowany zespół certyfikowanych lekarzy, specjalistów i wielojęzycznych koordynatorów zapewnia opiekę w Państwa języku.',
      list: ['Lekarze z certyfikatami specjalizacji', 'Wielojęzyczni koordynatorzy', 'Konsultanci specjaliści', 'Wykwalifikowany personel pielęgniarski', 'Dostępność 24/7', 'Stałe szkolenia'],
    },
    {
      tags: ['RTG', 'USG', 'Laboratorium'], title: 'Diagnostyka mobilna',
      text: 'Mobilne RTG, USG i kompleksowe badania laboratoryjne wykonywane bezpośrednio w miejscu pobytu.',
      list: ['Mobilne aparaty RTG', 'Przenośne USG', 'Badania przyłóżkowe', 'Monitorowanie EKG', 'Analiza krwi', 'Szybkie wyniki'],
    },
    {
      tags: ['Prywatnie', 'Monitoring'], title: 'Oddziały opieki pośredniej',
      text: 'Prywatne, luksusowe apartamenty opieki z nowoczesnym monitoringiem, wygodnym zakwaterowaniem i własnym personelem pielęgniarskim.',
      list: ['Ciągły monitoring', 'Prywatne apartamenty', 'Opieka pielęgniarska', 'Zakwaterowanie dla rodziny', 'Wsparcie żywieniowe', 'Programy rekonwalescencji'],
    },
    {
      tags: ['ALS', 'Gotowość OIOM'], title: 'Flota karetek',
      text: 'Nowoczesne karetki z zaawansowanym sprzętem ratunkowym i mobilnym wyposażeniem OIOM do bezpiecznego i szybkiego transportu.',
      list: ['Zaawansowane zabiegi resuscytacyjne', 'Mobilny sprzęt OIOM', 'Śledzenie GPS', 'Wykwalifikowani ratownicy', 'Bezpośrednie połączenie ze szpitalami', 'Krótki czas dojazdu'],
    },
  ],

  about: {
    meta: {
      title: 'O nas | Elite Medical Concierge',
      description: 'Od ponad dekady Elite Medical Concierge dba o zdrowie gości w najbardziej prestiżowych resortach Egiptu.',
    },
    hero: {
      eyebrow: 'Nasza historia',
      h1: 'Nowe spojrzenie na opiekę medyczną w najlepszych hotelach Egiptu',
      lead: 'Od ponad dekady Elite Medical Concierge jest zaufanym strażnikiem zdrowia gości w najbardziej prestiżowych resortach Egiptu, łącząc medyczną wiedzę światowej klasy z wyjątkową gościnnością.',
    },
    mission: {
      title: 'Nasza misja',
      text: 'Zapewniać podróżnym z całego świata wyjątkową opiekę medyczną bez stresu, tak by każdy gość otrzymał leczenie tej samej jakości co w domu, z ciepłem, sprawnością i pełnym spokojem, w komforcie swojego hotelu.',
    },
    vision: {
      title: 'Nasza wizja',
      text: 'Stać się światowym wzorem medycznego concierge w resortach i wyznaczać standard opieki medycznej w hotelarstwie, gdzie każda wizyta lekarska wzbogaca, a nie przerywa pobyt gościa.',
    },
    values: {
      eyebrow: 'Co nas napędza',
      h2: 'Nasze wartości',
      items: [
        { title: 'Współczucie', text: 'Każdego pacjenta traktujemy z prawdziwą troską i empatią' },
        { title: 'Doskonałość', text: 'Bezkompromisowe dążenie do najwyższych standardów medycznych' },
        { title: 'Dostępność', text: 'Usuwamy bariery w dostępie do dobrej opieki dla wszystkich podróżnych' },
        { title: 'Partnerstwo', text: 'Wspólna opieka z hotelami, ubezpieczycielami i rodzinami' },
      ],
    },
    testimonials: {
      eyebrow: 'Co mówią nasi goście',
      h2: 'Zaufały nam tysiące',
      items: [
        { text: 'Lekarz przyjechał w ciągu 20 minut i wszystkim zajął się profesjonalnie. Czułam się jak pod opieką własnego lekarza w domu.', where: 'Niemcy' },
        { text: 'Moja córka dostała gorączki późno w nocy. Zespół był spokojny, dodawał otuchy i działał niezwykle sprawnie. Nie mogliśmy liczyć na lepszą opiekę.', where: 'ZEA' },
        { text: 'Od diagnozy po dostawę leków wszystko przebiegło bez zakłóceń. Wielojęzyczne wsparcie zrobiło ogromną różnicę w stresującym momencie.', where: 'Francja' },
        { text: 'Zaimponowała mi współpraca z moim ubezpieczycielem. Zero kłopotów, pełne skupienie na powrocie do zdrowia.', where: 'Wielka Brytania' },
        { text: 'Profesjonalnie, dyskretnie i z prawdziwą troską. Traktowano mnie jak członka rodziny, a nie kolejnego pacjenta.', where: 'Rosja' },
        { text: 'Przenośny sprzęt diagnostyczny, który przynieśli do mojego pokoju, był najnowszej generacji. Naprawdę elitarna opieka medyczna.', where: 'Włochy' },
      ],
    },
    credentials: {
      eyebrow: 'Nasze kwalifikacje',
      h2: 'Międzynarodowo uznana doskonałość',
      lead: 'Nasze akredytacje to nie tylko odznaki. To zobowiązanie do spełniania i przewyższania międzynarodowych standardów opieki zdrowotnej.',
      items: [
        {
          text: 'Wyraz naszego zaangażowania w szybkie, wysokiej jakości usługi medyczne spełniające światowe standardy bezpieczeństwa pacjentów i wyników klinicznych.',
          list: ['Ustandaryzowane protokoły kliniczne', 'Programy zapewnienia jakości', 'Certyfikaty bezpieczeństwa pacjentów', 'Ramy ciągłego doskonalenia'],
        },
        {
          badge: 'Oficjalny Partner',
          text: 'Jedyna organizacja akredytacyjna skupiona wyłącznie na podróżach medycznych, certyfikująca placówki zapewniające wyjątkową opiekę pacjentom z zagranicy.',
          list: ['Dobre praktyki w podróżach medycznych', 'Doskonałe doświadczenia pacjentów', 'Międzynarodowa koordynacja opieki', 'Przejrzyste standardy cenowe'],
        },
        {
          badge: 'Oficjalny Partner',
          text: 'Partnerstwo i uznanie jednej z czołowych europejskich organizacji medical wellness, dzięki czemu nasze usługi odpowiadają niemieckim standardom medical wellness i profilaktyki.',
          list: ['Europejskie standardy medyczne', 'Zaawansowane protokoły leczenia', 'Dostęp do sieci specjalistów', 'Benchmarking jakości'],
        },
      ],
    },
    stats: [
      { label: 'Hoteli partnerskich' },
      { label: 'Obsłużonych pacjentów' },
      { label: 'Zadowolonych gości' },
      { label: 'Dostępność' },
    ],
    cta: {
      h2: 'Opieka medyczna na najwyższym poziomie',
      text: 'Tysiące zadowolonych gości powierzyło nam swoje zdrowie podczas pobytu w najlepszych resortach Egiptu.',
      button: 'Skontaktuj się z nami',
    },
  },

  services: {
    meta: {
      title: 'Nasze usługi | Elite Medical Concierge',
      description: 'Od pomocy w nagłych przypadkach po konsultacje specjalistyczne: opieka na poziomie szpitala w Państwa hotelu. Lekarze 24/7 w całym Egipcie.',
    },
    hero: {
      eyebrow: 'Nasze usługi',
      h1: 'Kompleksowa opieka medyczna',
      lead: 'Od pomocy w nagłych przypadkach po konsultacje specjalistyczne: zapewniamy opiekę na poziomie szpitala w Państwa hotelu.',
    },
    items: [
      { title: 'Konsultacje lekarskie', text: 'Kompleksowe badania i konsultacje z wielojęzycznymi lekarzami, dostępnymi całą dobę w Państwa pokoju hotelowym.', list: ['Wizyty w pokoju', 'Wielojęzyczni lekarze', 'Wizyty tego samego dnia', 'Wystawianie recept'] },
      { title: 'Pomoc w nagłych przypadkach', text: 'Szybka pomoc ratunkowa z w pełni wyposażonymi zespołami mobilnymi i wykwalifikowanymi ratownikami, docierającymi w ciągu 15 minut.', list: ['Dojazd w 15 minut', 'Zaawansowane zabiegi resuscytacyjne', 'Koordynacja ze szpitalem', 'Ewakuacja medyczna'] },
      { title: 'Konsultacje specjalistyczne', text: 'Dostęp do certyfikowanych specjalistów, w tym kardiologów, ortopedów, dermatologów i innych, na terenie Państwa resortu.', list: ['15+ specjalizacji', 'Certyfikaty europejskie', 'Wideokonsultacje', 'Opieka kontrolna'] },
      { title: 'Radiologia mobilna', text: 'Nowoczesne przenośne RTG i USG bezpośrednio w miejscu pobytu, z szybkimi wynikami cyfrowymi.', list: ['Przenośne RTG', 'Badania USG', 'Wyniki w 1 godzinę', 'Opis specjalisty'] },
      { title: 'Badania laboratoryjne', text: 'Kompleksowe badania krwi, moczu i panele diagnostyczne, z pobraniem próbek w dogodnym terminie.', list: ['Pełne panele badań krwi', 'Szybkie wyniki', 'Pobranie w pokoju', 'Wyniki cyfrowe'] },
      { title: 'Oddział opieki pośredniej', text: 'Monitorowane 24/7 łóżka obserwacyjne w klinikach hotelowych dla pacjentów wymagających dłuższego nadzoru medycznego.', list: ['Opieka pielęgniarska 24/7', 'Monitorowanie funkcji życiowych', 'Terapia dożylna', 'Obchody lekarskie'] },
      { title: 'Apteka i leki', text: 'Realizacja recept i dostawa leków bez recepty, także specjalistycznych i zagranicznych.', list: ['Dostawa 24/7', 'Leki zagraniczne', 'Przeniesienie recepty', 'Kontrola alergii'] },
      { title: 'Wypożyczalnia sprzętu medycznego', text: 'Wózki inwalidzkie, koncentratory tlenu, aparaty CPAP i inny sprzęt medyczny na czas pobytu.', list: ['Dostawa tego samego dnia', 'Sprzęt wysokiej jakości', 'Pomoc w instalacji', 'Wsparcie 24/7'] },
      { title: 'Koordynacja ze szpitalami', text: 'Sprawna współpraca z najlepszymi szpitalami w Egipcie, gdy potrzebne jest dalsze leczenie, wraz z asystą medyczną.', list: ['Przyjęcie VIP', 'Asysta medyczna', 'Koordynacja z rodziną', 'Obsługa ubezpieczenia'] },
    ],
    popular: 'Popularne',
    book: 'Zarezerwuj',
    process: {
      eyebrow: 'Prosty proces',
      h2: 'Jak działa nasza usługa',
      items: [
        { title: 'Kontakt', text: 'Telefon na naszą infolinię 24/7 lub zgłoszenie przez hotel' },
        { title: 'Ocena', text: 'Koordynator ocenia Państwa potrzeby' },
        { title: 'Wyjazd zespołu', text: 'Zespół medyczny przyjeżdża na miejsce' },
        { title: 'Leczenie i kontrola', text: 'Leczenie z pełną opieką po wizycie' },
      ],
    },
    booking: {
      eyebrow: 'Rezerwacja wizyty',
      h2: 'Umów konsultację lekarską',
      lead: 'Proszę wybrać datę, godzinę i usługę. Nasz zespół potwierdzi wizytę w ciągu 30 minut.',
      services: ['Konsultacja ogólna', 'Konsultacja specjalistyczna', 'Pomoc w nagłych przypadkach', 'Radiologia mobilna', 'Badania laboratoryjne', 'Apteka i leki'],
      labels: {
        date: 'Preferowana data', time: 'Preferowana godzina', timeSelect: 'Wybierz godzinę', service: 'Rodzaj usługi', serviceSelect: 'Wybierz usługę',
        name: 'Imię i nazwisko', phone: 'Numer telefonu', email: 'Adres e-mail', hotel: 'Hotel / resort', room: 'Numer pokoju', notes: 'Dodatkowe informacje',
      },
      placeholders: {
        name: 'Imię i nazwisko', email: 'adres@email.pl', hotel: 'np. Four Seasons Sharm', room: 'np. apartament 501',
        notes: 'Prosimy opisać objawy lub szczególne potrzeby...',
      },
      submit: 'Potwierdź wizytę',
      note: 'W nagłych przypadkach prosimy dzwonić bezpośrednio na nasz numer alarmowy.',
    },
    matter: {
      eyebrow: 'Dlaczego nasze usługi mają znaczenie',
      h2: 'Zespół medyczny na miejscu 24/7',
      lead: 'Nasz zespół lekarzy i ratowników jest zawsze na miejscu, gotowy natychmiast reagować w każdej sytuacji.',
      items: [
        { title: 'Lekarze na miejscu 24/7', text: 'Zespół lekarzy i ratowników dostępny całą dobę w miejscu pobytu' },
        { title: 'Natychmiastowa reakcja 24/7', text: 'Szybkie działanie, gdy liczy się każda sekunda' },
        { title: 'Mniejsze ryzyko pogorszenia', text: 'Wczesna interwencja ogranicza powikłania i przyspiesza powrót do zdrowia' },
        { title: 'Więcej komfortu dla pacjentów', text: 'Leczenie w komforcie pokoju hotelowego, bez stresu szpitala' },
        { title: 'Spokój dla rodziny', text: 'Bliscy mogą pozostać obok podczas leczenia' },
        { title: 'Wygoda dla zarządców', text: 'Hotele, biura podróży i ubezpieczyciele korzystają ze sprawnej koordynacji' },
      ],
    },
    cta: {
      h2: 'Potrzebują Państwo pomocy medycznej?',
      text: 'Nasz zespół medyczny jest dostępny 24/7. Prosimy o kontakt w każdej sprawie zdrowotnej.',
      primary: 'Numer alarmowy',
      secondary: 'Zamów oddzwonienie',
    },
  },

  serviceAreas: {
    meta: {
      title: 'Obszary działania | Elite Medical Concierge',
      description: 'Elite Medical Concierge zapewnia opiekę medyczną premium w najpopularniejszych kierunkach turystycznych i największych miastach Egiptu.',
    },
    hero: {
      eyebrow: 'Działamy w całym Egipcie',
      h1: 'Obszary działania',
      lead: 'Elite Medical Concierge zapewnia opiekę medyczną premium w najpopularniejszych kierunkach turystycznych i największych miastach Egiptu.',
    },
    listTitle: 'Wszystkie lokalizacje',
    listLead: 'Proszę kliknąć lokalizację, aby zobaczyć ją na mapie wraz z danymi kontaktowymi.',
    cta: {
      h2: 'Potrzebują Państwo pomocy medycznej?',
      text: 'Nasz zespół jest dostępny całą dobę we wszystkich obszarach. Prosimy o kontakt w celu natychmiastowej pomocy.',
      primary: 'Zadzwoń na numer alarmowy',
      secondary: 'Wyślij zapytanie',
    },
  },

  facilitiesPage: {
    meta: {
      title: 'Nasze placówki | Elite Medical Concierge',
      description: 'Nowoczesne placówki i sprzęt zapewniają najwyższą jakość opieki medycznej w luksusowym, komfortowym otoczeniu.',
    },
    hero: {
      eyebrow: 'Placówki światowej klasy',
      h1: 'Opieka na najwyższym poziomie',
      lead: 'Nasze nowoczesne placówki i sprzęt zapewniają najwyższą jakość opieki medycznej w luksusowym, komfortowym otoczeniu. Każdy szczegół służy Państwa dobremu samopoczuciu.',
      primary: 'Umów zwiedzanie',
      secondary: 'Numer alarmowy',
    },
    stats: [
      { label: 'Wielojęzyczny personel' },
      { label: 'Diagnostyka na miejscu' },
      { label: 'Transport medyczny' },
      { label: 'Placówki premium' },
    ],
    listTitle: 'Nasze placówki',
    listLead: 'Opieka medyczna w nowoczesnych placówkach z najnowszą technologią i doskonałym personelem.',
    book: 'Zarezerwuj',
    assurances: [
      { title: 'Międzynarodowe akredytacje', text: 'Wszystkie nasze placówki spełniają międzynarodowe standardy i certyfikacje' },
      { title: 'Dostępność 24/7', text: 'Całodobowy dostęp do opieki medycznej i pomocy doraźnej' },
      { title: 'Wsparcie wielojęzyczne', text: 'Koordynatorzy mówiący w 10+ językach' },
    ],
    cta: {
      h2: 'Gotowi na opiekę na najwyższym poziomie?',
      text: 'Prosimy zarezerwować konsultację lub umówić zwiedzanie naszych placówek.',
      primary: 'Umów wizytę',
      secondary: 'Kontakt',
    },
  },

  partnersPage: {
    meta: {
      title: 'Nasi partnerzy | Elite Medical Concierge',
      description: 'Współpracujemy z najlepszymi hotelami, zaufanymi partnerami turystycznymi, wiodącymi ubezpieczycielami i uznanymi organizacjami akredytacyjnymi.',
    },
    hero: {
      eyebrow: 'Nasi partnerzy',
      h1: 'Zaufana współpraca',
      lead: 'Współpracujemy z najlepszymi hotelami, zaufanymi partnerami turystycznymi, wiodącymi ubezpieczycielami i uznanymi organizacjami akredytacyjnymi, by zapewniać najwyższą jakość.',
    },
    hotels: {
      title: 'Hotele partnerskie', lead: 'Resorty premium w całym Egipcie',
      items: [
        { where: 'Hurghada, Sharm El Sheikh, Kair' }, , , , { where: 'Luksor, Asuan' }, { where: 'Resorty nad Morzem Czerwonym' },
      ],
    },
    operators: {
      title: 'Touroperatorzy', lead: 'Międzynarodowi touroperatorzy, z którymi współpracujemy',
      items: [
        { where: 'Niemcy/Wielka Brytania', tag: 'Wczasy zorganizowane' },
        { where: 'Wielka Brytania', tag: 'Wypoczynek na plaży' },
        { where: 'Niemcy', tag: 'All inclusive' },
        { where: 'Niemcy', tag: 'Podróże premium' },
        { where: 'Rosja', tag: 'Wycieczki czarterowe' },
        { where: 'Rosja', tag: 'Wakacje na plaży' },
        { where: 'Rosja/WNP', tag: 'Rynek masowy' },
        { where: 'Turcja/Rosja', tag: 'Loty czarterowe' },
      ],
    },
    agents: {
      title: 'Biura podróży', lead: 'Platformy online i firmy DMC',
      items: [
        { tag: 'Globalne biuro online' }, { tag: 'Globalne biuro online' },
        { tag: 'DMC Egipt' }, { tag: 'DMC Egipt' }, { tag: 'DMC Egipt' }, { tag: 'DMC Egipt' },
      ],
    },
    insurers: {
      title: 'Ubezpieczyciele', lead: 'Rozliczenia bezpośrednie i usługi bezgotówkowe',
      tag: 'Ubezpieczenie podróżne',
      items: [
        { text: 'Światowy lider ubezpieczeń podróżnych i assistance', benefit: 'Rozliczenia bezpośrednie, obsługa szkód 24/7' },
        { text: 'Międzynarodowy dostawca assistance i ubezpieczeń podróżnych', benefit: 'Usługi bezgotówkowe, koordynacja w nagłych przypadkach' },
        { text: 'Hiszpańska międzynarodowa grupa ubezpieczeniowa', benefit: 'Ochrona w Europie, obsługa wielojęzyczna' },
        { text: 'Pionier w branży assistance podróżnego', benefit: 'Globalna sieć, ewakuacja medyczna' },
        { text: 'Część Allianz Partners', benefit: 'Kompleksowa ochrona w podróży' },
        { text: 'Wiodący niemiecki ubezpieczyciel podróżny', benefit: 'Podróżni z Niemiec, rozliczenie bezpośrednie' },
        { text: 'Największy ubezpieczyciel w Rosji', benefit: 'Podróżni z Rosji, obsługa po rosyjsku 24/7' },
        { text: 'Duża rosyjska grupa ubezpieczeniowa', benefit: 'Region WNP, pomoc w nagłych przypadkach' },
      ],
    },
    bodies: {
      title: 'Organizacje akredytacyjne', lead: 'Międzynarodowe uznanie i certyfikacja',
      items: [
        {
          text: 'Wiodące stowarzyszenie zawodowe i branżowe pomocy doraźnej, wyznaczające standardy jakości, bezpieczeństwa i doskonałości operacyjnej.',
          list: ['Ustandaryzowane protokoły kliniczne', 'Certyfikowane zapewnienie jakości', 'Standardy bezpieczeństwa pacjentów', 'Wymóg stałego kształcenia', 'Najlepsze praktyki operacyjne'],
        },
        {
          badge: 'Oficjalny Partner',
          text: 'Jedyna organizacja akredytacyjna skupiona wyłącznie na podróżach medycznych, certyfikująca placówki zapewniające wyjątkową opiekę pacjentom z zagranicy.',
          list: ['Standardy doskonałości w podróżach medycznych', 'Certyfikacja doświadczeń pacjentów', 'Międzynarodowa koordynacja opieki', 'Szkolenia z kompetencji kulturowych', 'Wymogi przejrzystych cen'],
        },
        {
          badge: 'Oficjalny Partner',
          text: 'Partnerstwo i uznanie jednej z czołowych europejskich organizacji medical wellness, dzięki czemu nasze usługi odpowiadają niemieckim standardom medical wellness i profilaktyki.',
          list: ['Zgodność z niemieckimi standardami medycznymi', 'Protokoły integracji wellness', 'Ramy opieki profilaktycznej', 'Benchmarking jakości', 'Dostęp do niemieckich specjalistów'],
        },
      ],
    },
    cta: {
      h2: 'Zostań partnerem',
      text: 'Dołącz do naszej sieci partnerów z branży hotelarskiej i turystycznej premium. Razem zapewnimy wyjątkową opiekę podróżnym z całego świata.',
      button: 'Zostań partnerem',
    },
  },

  video: {
    meta: {
      title: 'Wideokonsultacja | Elite Medical Concierge',
      description: 'Bezpieczne wideokonsultacje wysokiej jakości z pokoju hotelowego lub z dowolnego miejsca.',
    },
    eyebrow: 'Wideokonsultacja',
    h1: 'Porozmawiaj z lekarzem',
    lead: 'Bezpieczne wideokonsultacje wysokiej jakości z pokoju hotelowego lub z dowolnego miejsca.',
    items: [
      { title: 'Bezpiecznie i prywatnie', text: 'Szyfrowane rozmowy end-to-end' },
      { title: 'Doświadczeni lekarze', text: 'Certyfikowani specjaliści' },
      { title: 'Dostępni 24/7', text: 'Konsultacje o każdej porze' },
    ],
    button: 'Dołącz do konsultacji',
    note: 'Aby dołączyć do konsultacji, należy się zalogować.',
  },

  hurghada: {
    pl: {
      path: '/pl/lekarz-hurghada', lang: 'pl',
      meta: {
        title: 'Lekarz w Hurghadzie · lekarz hotelowy i opieka medyczna 24/7',
        description: 'Lekarze mówiący po angielsku, niemiecku i rosyjsku dla gości hoteli w Hurghadzie, Sahl Hasheesh, Makadi Bay, Soma Bay i Safadze. Wizyty w pokoju 24/7, opieka w klinice i nagłe przypadki. Tel. +20 120 678 8566.',
      },
      eyebrow: 'Hurghada i wybrzeże Morza Czerwonego',
      h1a: 'Lekarz w Hurghadzie',
      h1b: 'Opieka 24/7 w Państwa hotelu',
      lead: 'Zachorowali Państwo na urlopie? Nasi lekarze przyjeżdżają do pokoju hotelowego w Hurghadzie i okolicznych resortach, w dzień i w nocy. Mówimy po angielsku, niemiecku, rosyjsku i arabsku, współpracujemy bezpośrednio z recepcją i działem obsługi gości oraz przygotowujemy dokumenty potrzebne ubezpieczycielowi.',
      call: 'Zadzwoń 24/7: ',
      wa: 'Napisz na WhatsApp',
      switchLabel: 'English: Doctor in Hurghada',
      treatTitle: 'Co leczymy w Hurghadzie',
      treat: [
        { icon: 'bed-double', title: 'Wizyty lekarskie w hotelu', text: 'Lekarz przyjeżdża do pokoju w przypadku gorączki, problemów żołądkowych, infekcji, urazów i innych dolegliwości na urlopie.' },
        { icon: 'activity', title: 'Problemy żołądkowe i zatrucia', text: 'Biegunka, wymioty i odwodnienie, w razie potrzeby z kroplówką podaną w pokoju.' },
        { icon: 'sun', title: 'Słońce, morze i nurkowanie', text: 'Udar słoneczny, oparzenia słoneczne, urazy od meduz i koralowców oraz problemy z uszami lub zatokami po nurkowaniu i snorkelingu.' },
        { icon: 'bandage', title: 'Urazy i opatrywanie ran', text: 'Skaleczenia, skręcenia, oczyszczanie i opatrywanie ran.' },
        { icon: 'baby', title: 'Opieka nad dziećmi', text: 'Badanie i leczenie niemowląt oraz dzieci podróżujących z Państwem.' },
        { icon: 'ambulance', title: 'Nagłe przypadki i transport do szpitala', text: 'Pilna ocena stanu i, gdy leczenie w hotelu nie jest możliwe, transport do szpitala partnerskiego.' },
        { icon: 'file-check-2', title: 'Dokumentacja dla ubezpieczyciela', text: 'Raporty, faktury i dokumentacja dla międzynarodowych ubezpieczycieli, z rozliczeniem bezgotówkowym, jeśli pozwala na to ubezpieczyciel.' },
        { icon: 'video', title: 'Wideokonsultacja', text: 'Najpierw rozmowa z lekarzem, jeśli nie są Państwo pewni, czy potrzebna jest wizyta.', href: '/video-consultation' },
      ],
      hotelsTitle: 'Hotele w Hurghadzie, z którymi współpracujemy',
      hotelsLead: 'Jesteśmy partnerem medycznym tych hoteli i resortów. Goście innych hoteli, apartamentów i rejsów w okolicy również mogą dzwonić do nas bezpośrednio.',
      hotels: ['Hilton Plaza Hurghada', 'Rewaya Hotels & Resort', 'Long Beach Hotel & Resort', 'Sunrise Hotels & Resorts Hurghada', 'Pickalbatros Hotels & Resorts', 'Diana Beach', 'Steigenberger Aldau'],
      areasTitle: 'Obszary obsługiwane z Hurghady',
      areasLead: 'Nasz zespół z Hurghady obsługuje gości wzdłuż wybrzeża Morza Czerwonego:',
      areas: ['Hurghada i Sekalla', 'Sahl Hasheesh', 'Makadi Bay', 'Soma Bay', 'Safaga', 'El Gouna', 'Port Ghalib', 'Marsa Alam'],
      ctaTitle: 'Potrzebują Państwo lekarza w Hurghadzie teraz?',
      ctaText: 'Odbieramy telefony 24 godziny na dobę, codziennie. Wystarczy podać hotel i numer pokoju, resztą zajmiemy się my.',
      crumbs: 'Obszary działania',
    },
  },

  ui: {
    skip: 'Przejdź do treści', menu: 'Menu', home: 'Strona główna', language: 'Język',
    theme: 'Zmień motyw kolorystyczny', light: 'Jasny', dark: 'Ciemny',
    pause: 'Wstrzymaj', play: 'Odtwórz', prev: 'Poprzednie', next: 'Następne',
  },

  footer: {
    quickLinks: 'Szybkie linki',
    links: [
      { label: 'Usługi' },
      { label: 'Dlaczego my' },
      { label: 'Akredytacje' },
      { label: 'Partnerzy' },
      { label: 'Kontakt' },
    ],
    areasTitle: 'Obszary działania',
    rights: '© 2026 Elite Medical Concierge. Wszelkie prawa zastrzeżone.',
    emergencyLine: 'Numer alarmowy',
  },
};

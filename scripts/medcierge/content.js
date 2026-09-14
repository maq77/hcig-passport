/* Elite Medical Concierge (medcierge.com): every word on the rebuilt site.

   Source: the live site, scraped 2026-09-14, page by page and from its bundle.
   Copy is kept word for word. The only changes are the ones agreed on
   2026-09-14 ("fix only what is wrong"), each listed in
   docs/medcierge-change-list.md:
     - em dashes replaced by a full stop or a comma (house rule)
     - partner hotel count unified to 50+ (live says 15+, 50+ and 150+)
     - "100% guest satisfaction" removed, the site's own 98% kept
     - "Accredited since" / "certification" wording for GHA and DMWV becomes
       "Official Partner"; "German Medical Association" becomes the German
       Medical Wellness Association (DMWV), which is what the live site links to
     - placeholder city phone numbers (+20 65 XXX XXXX) replaced by the hotline
     - "Elite Hospital - <city>" map markers removed pending confirmation
   Nothing here is invented. If a line has no source on the live site, it is
   not on this list. */

const PHONE = '+20 120 678 8566';

module.exports = {
  site: {
    name: 'Elite Medical Concierge',
    origin: 'https://medcierge.com',
    phone: PHONE,
    tel: 'tel:+201206788566',
    wa: 'https://wa.me/201206788566',
    emails: ['info@medcierge.com', 'care@medcierge.com'],
    portal: 'https://medcierge.com/dashboard',
    login: 'https://medcierge.com/auth',
    tagline: 'Delivering world-class healthcare with the warmth of Egyptian hospitality.',
  },

  nav: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Service Areas', href: '/service-areas' },
    { label: 'Partners', href: '/partners' },
    { label: 'Video Consultation', href: '/video-consultation' },
    { label: 'Contact', href: '/#contact' },
  ],

  logos: {
    accor: 'Accor', fairmont: 'Fairmont', hilton: 'Hilton', jaz: 'JAZ Hotel Group',
    marriott: 'Marriott', rixos: 'Rixos', steigenberger: 'Steigenberger', sunrise: 'SunRise Resorts',
    'long-beach': 'Long Beach Resort', edita: 'Edita',
    allianz: 'Allianz', axa: 'AXA', bupa: 'Bupa', cigna: 'Cigna', generali: 'Generali', metlife: 'MetLife',
    tui: 'TUI', 'thomas-cook': 'Thomas Cook', fti: 'FTI', kuoni: 'Kuoni', der: 'DER Touristik', eti: 'ETI',
    gha: 'Global Healthcare Accreditation', intl: 'International Standards', uca: 'Urgent Care Association',
    dmwv: 'German Medical Wellness Association',
  },

  home: {
    meta: {
      title: "Elite Medical Concierge in Egypt's Finest Hotels",
      description: "Elite medical concierge in Egypt's finest hotels. 24/7 in-hotel service, 50+ partner hotels, EU & US certified doctors.",
    },
    hero: {
      badge: 'Elite VIP Medical Concierge · Trusted by 50+ Hotels',
      h1a: 'World Class Healthcare',
      h1b: 'In World Class Hotels',
      lead: 'Experience stress-free medical care with internationally accredited doctors, mobile diagnostics, and 24/7 concierge service. All within your luxury resort.',
      leadAccent: '24/7 Available',
      primary: 'Request Consultation',
      secondary: 'Our Services',
      stats: [
        { value: '15,000+', label: 'Patients Served' },
        { value: '50+', label: 'Luxury Hotels' },
        { value: '4.9/5', label: 'Patient Rating' },
        { value: '8', label: 'Regions Covered' },
      ],
      features: [
        { icon: 'clock', title: '24/7', text: 'In Hotel On Call Service' },
        { icon: 'credit-card', title: 'Cashless', text: 'Insurance Coverage' },
        { icon: 'badge-check', title: 'Certified', text: 'EU & US Doctors' },
        { icon: 'languages', title: '10+ Languages', text: 'Multilingual Care' },
      ],
      quote: {
        text: 'Exceptional care when we needed it most. The doctor arrived within 30 minutes and spoke perfect German. Truly world-class service.',
        name: 'Michael K.',
        where: 'Steigenberger Hurghada',
      },
    },
    trust: {
      eyebrow: 'Trusted by 50+ Luxury Hotels & Resorts',
      h2: 'Your Trusted Healthcare Partner Across Egypt',
      groups: [
        { label: 'Hotel Partners', logos: ['marriott', 'hilton', 'steigenberger', 'fairmont', 'accor', 'rixos', 'jaz', 'sunrise', 'long-beach', 'edita'] },
        { label: 'Insurance Coverage', logos: ['allianz', 'axa', 'bupa', 'cigna', 'generali', 'metlife'] },
        { label: 'Tour Operators & Accreditations', logos: ['tui', 'thomas-cook', 'fti', 'kuoni', 'der', 'eti', 'gha', 'dmwv', 'uca', 'intl'] },
      ],
      note: 'Partnered with 50+ luxury hotels and 20+ insurance providers across Egypt',
    },
    services: {
      eyebrow: 'Comprehensive Medical Care',
      h2: 'Our Services',
      lead: 'From emergency response to specialist consultations, we bring hospital-quality care to your hotel.',
      items: [
        { icon: 'stethoscope', title: 'On-Call Specialist Doctors', text: 'Double-certified physicians from Egypt and Europe, available 24/7 at your hotel location.' },
        { icon: 'scan-line', title: 'Mobile Radiology', text: 'State-of-the-art portable imaging services brought directly to hotel clinics.' },
        { icon: 'flask-conical', title: 'Laboratory Services', text: 'Comprehensive diagnostic testing with rapid results, all within your hotel premises.' },
        { icon: 'bed-double', title: 'Intermediate Care Unit', text: 'Professional observation and monitoring for patients requiring extended care.' },
        { icon: 'languages', title: 'Multilingual Coordinators', text: 'Dedicated case managers fluent in multiple languages ensuring seamless communication.' },
        { icon: 'syringe', title: 'Medical Procedures', text: 'Minor procedures and treatments performed in accredited hotel clinic settings.' },
        { icon: 'pill', title: 'Medication Delivery', text: 'Prescription and medical supplies delivered directly to your room.' },
        { icon: 'ambulance', title: 'Escort & Transfer', text: 'Full coordination and escort services when external medical facilities are needed.' },
        { icon: 'file-check-2', title: 'Insurance Liaison', text: 'Cashless services with major insurers and complete documentation handling.' },
      ],
    },
    facilities: {
      eyebrow: 'World-Class Facilities',
      h2: 'Experience Elite Healthcare',
      lead: 'Our state-of-the-art facilities and equipment ensure you receive the highest quality medical care in a luxurious, comfortable environment. Every detail is designed with your well-being in mind.',
      features: [
        { icon: 'languages', title: 'Multilingual Staff', text: 'Coordinators in 10+ languages' },
        { icon: 'scan-line', title: 'On-Site Diagnostics', text: 'X-ray, ultrasound & labs' },
        { icon: 'ambulance', title: 'Emergency Transport', text: 'Ground ambulance fleet' },
        { icon: 'sparkles', title: 'Premium Facilities', text: 'Luxury care environment' },
      ],
    },
    whyUs: {
      eyebrow: 'The Elite Difference',
      h2a: 'Why Guests Trust',
      h2b: 'Our Elite Care',
      lead: "We don't just provide medical services. We deliver peace of mind, ensuring every guest receives care with compassion and excellence.",
      items: [
        { icon: 'clock', title: '24/7 Immediate Response', text: 'Round-the-clock availability ensures you receive care exactly when you need it, any hour of day or night.' },
        { icon: 'heart', title: 'Stress-Free Experience', text: 'No hospital transfers, no paperwork hassles. We handle everything while you focus on recovery.' },
        { icon: 'users', title: 'Surrounded by Care', text: 'Heal in the comfort of your hotel, supported by family, friends, and our dedicated medical team.' },
        { icon: 'globe', title: 'Multilingual Excellence', text: 'Our international team ensures seamless communication in your preferred language.' },
        { icon: 'heart-handshake', title: 'Complete Coordination', text: 'We liaise with hotels, travel agents, insurers, and families to ensure unified, comprehensive care.' },
        { icon: 'shield-check', title: 'European Standards', text: 'Our physicians hold dual certifications and adhere to the highest international medical protocols.' },
      ],
      stats: [
        { value: '50+', label: 'Partner Hotels' },
        { value: '50+', label: 'Specialist Doctors' },
        { value: '24/7', label: 'Availability' },
        { value: '98%', label: 'Satisfaction Rate' },
      ],
    },
    steps: {
      eyebrow: 'How It Works',
      h2a: 'Seamless Care in',
      h2b: 'Four Simple Steps',
      items: [
        { icon: 'phone', title: 'Contact Our Team', text: 'Reach us 24/7 through your hotel concierge or our emergency line for immediate assistance.' },
        { icon: 'user-round', title: 'Coordinator Assigned', text: 'A multilingual care coordinator is assigned to manage your case and handle all communications.' },
        { icon: 'stethoscope', title: 'Doctor Arrives', text: 'A certified specialist visits you at your hotel, equipped with necessary medical supplies.' },
        { icon: 'heart-handshake', title: 'Complete Care', text: 'From treatment to follow-up, we ensure your recovery with ongoing support and coordination.' },
      ],
    },
    accreditations: {
      eyebrow: 'International Recognition',
      h2a: 'Accredited Excellence',
      h2b: 'You Can Trust',
      lead: 'Our clinics meet the highest international standards, ensuring you receive world-class care validated by leading global healthcare organizations.',
      checks: [
        'Double international certified physicians (Egypt, Europe & USA)',
        'ISO 9001 Quality Management',
        'International patient safety protocols',
        'HIPAA-compliant data handling',
        'Emergency response certification',
        'Advanced life support training',
      ],
      cards: [
        { logo: 'intl', title: 'International Standards', text: 'Our physicians are double international certified following American and European medical protocols and guidelines' },
        { logo: 'gha', title: 'Global Healthcare Accreditation', badge: 'Official Partner', text: 'Excellence in medical tourism and international patient care' },
        { logo: 'dmwv', title: 'German Medical Wellness Association', badge: 'Official Partner', text: 'European standards for medical wellness and preventive healthcare' },
        { logo: 'uca', title: 'Urgent Care Association', text: 'Certified excellence in urgent care delivery and patient-centered emergency services' },
      ],
      quote: "Delivering healthcare excellence with international standards in Egypt's most prestigious hotels",
    },
    partners: {
      eyebrow: 'Trusted Partnerships',
      h2a: 'Elite Partners in',
      h2b: 'Hospitality & Insurance',
      lead: 'We partner with World Class Hotels, resorts, and leading travel insurance companies to provide seamless medical services for our guests.',
      hotelsTitle: 'Luxury Hotels & Resorts',
      hotels: [
        { name: 'Marriott', logo: 'marriott' }, { name: 'Fairmont', logo: 'fairmont' }, { name: 'Accor', logo: 'accor' },
        { name: 'Hilton', logo: 'hilton' }, { name: 'Steigenberger', logo: 'steigenberger' }, { name: 'JAZ', logo: 'jaz' },
        { name: 'Rixos', logo: 'rixos' }, { name: 'SunRise', logo: 'sunrise' }, { name: 'Four Seasons' }, { name: 'Hyatt' },
        { name: 'InterContinental' }, { name: 'Mandarin Oriental' }, { name: 'Shangri-La' }, { name: 'Kempinski' },
        { name: 'The Ritz-Carlton' },
      ],
      hotelsSuffix: 'Hotels & Resorts',
      insuranceTitle: 'Insurance Partners',
      insurers: [
        { name: 'Allianz', logo: 'allianz' }, { name: 'AXA', logo: 'axa' }, { name: 'Cigna', logo: 'cigna' },
        { name: 'Bupa', logo: 'bupa' }, { name: 'MetLife', logo: 'metlife' }, { name: 'Generali', logo: 'generali' },
      ],
      insuranceSuffix: 'Insurance',
      note: "Don't see your hotel or insurance provider? Contact us to verify your coverage.",
      pill: 'We work with 50+ international partners',
    },
    areas: {
      eyebrow: 'Coverage Across Egypt',
      h2: 'Our Service Areas',
      lead: "Click on any location to explore our coverage across Egypt's most popular destinations.",
    },
    contact: {
      eyebrow: 'Get In Touch',
      h2a: 'Need Medical Assistance?',
      h2b: "We're Here For You",
      lead: "Our team is available around the clock to provide immediate medical assistance. Whether it's an emergency or a routine health concern, we're just a call away.",
      items: [
        { icon: 'phone', label: 'Emergency Hotline', value: PHONE, href: 'tel:+201206788566', sub: '24/7 Available' },
        { icon: 'mail', label: 'Email Us', value: 'info@medcierge.com | care@medcierge.com', sub: 'Instant Response' },
        { icon: 'map-pin', label: 'Service Areas', value: 'Cairo, Alexandria, Red Sea, Sinai, Nile Valley', sub: 'Including Hurghada, Sharm El Sheikh, Alamein, Marsa Matrouh, Dahab, Luxor, Aswan & more' },
        { icon: 'clock', label: 'Availability', value: '24 Hours / 7 Days', sub: 'Including holidays' },
      ],
      form: {
        title: 'Request Callback',
        fields: [
          { id: 'cb-name', label: 'Full Name', type: 'text', autocomplete: 'name', required: true },
          { id: 'cb-phone', label: 'Phone Number', type: 'tel', autocomplete: 'tel', required: true, placeholder: '+20 xxx xxx xxxx' },
          { id: 'cb-hotel', label: 'Hotel / Resort', type: 'text', autocomplete: 'organization' },
          { id: 'cb-msg', label: 'How can we help?', type: 'textarea' },
        ],
        submit: 'Request Callback',
        note: 'For emergencies, please call our hotline directly.',
      },
    },
  },

  /* 12 locations, from /service-areas. Coordinates are the towns' public
     positions, used only to place the dot on the map. */
  areas: [
    { name: 'Cairo', region: 'Greater Cairo', hours: '24/7', x: 276.2, y: 90.2 },
    { name: 'Alexandria', region: 'Mediterranean Coast', hours: '24/7', x: 222.1, y: 36.8 },
    { name: 'Hurghada', region: 'Red Sea', hours: '24/7', x: 381.6, y: 218.0, href: '/hurghada' },
    { name: 'Sharm El Sheikh', region: 'South Sinai', hours: '24/7', x: 402.9, y: 187.7 },
    { name: 'El Gouna', region: 'Red Sea', hours: '24/7', x: 376.3, y: 211.6 },
    { name: 'Marsa Alam', region: 'Red Sea', hours: '8:00 AM - 10:00 PM', x: 425.8, y: 318.8 },
    { name: 'Alamein', region: 'North Coast', hours: '24/7 (Summer Season)', x: 182.4, y: 53.8 },
    { name: 'Marsa Matrouh', region: 'North Coast', hours: '8:00 AM - 10:00 PM', x: 112.3, y: 29.9 },
    { name: 'Port Ghalib', region: 'Red Sea', hours: '24/7', x: 415.6, y: 297.6 },
    { name: 'Dahab', region: 'South Sinai', hours: '8:00 AM - 10:00 PM', x: 410.3, y: 161.0 },
    { name: 'Luxor', region: 'Nile Valley', hours: '24/7', x: 333.6, y: 290.3 },
    { name: 'Aswan', region: 'Nile Valley', hours: '8:00 AM - 10:00 PM', x: 344.3, y: 363.9 },
  ],

  /* The six facilities, shared by the home page and /facilities. */
  facilities: [
    {
      img: 'elite-clinic-interior', tags: ['Luxury', 'Premium'], title: 'Elite Private Clinics',
      text: 'State-of-the-art luxury medical facilities with premium amenities, marble interiors, and a welcoming atmosphere designed for your comfort.',
      list: ['Marble & premium finishes', 'Private consultation rooms', 'Comfortable waiting areas', 'Premium amenities', 'Climate controlled', 'Accessibility compliant'],
    },
    {
      img: 'urgent-care-room', tags: ['24/7', 'Equipped'], title: 'Urgent Care Centers',
      text: 'Fully equipped examination rooms with the latest medical technology, vital monitors, and advanced diagnostic equipment for immediate care.',
      list: ['Advanced vital monitors', 'Emergency equipment', 'Defibrillators', 'IV therapy stations', 'Sterilization systems', 'Rapid response capability'],
    },
    {
      img: 'elite-medical-team', tags: ['Multilingual', 'Certified'], title: 'Elite Medical Staff',
      text: 'Our diverse team of board-certified physicians, specialists, and multilingual coordinators ensures personalized care in your preferred language.',
      list: ['Board-certified physicians', 'Multilingual coordinators', 'Specialist consultants', 'Trained nursing staff', '24/7 availability', 'Continuous education'],
    },
    {
      img: 'portable-diagnostics', tags: ['X-Ray', 'Ultrasound', 'Lab'], title: 'Portable Diagnostics',
      text: 'Mobile X-ray, ultrasound, and comprehensive lab testing equipment brought directly to your location for convenient diagnostics.',
      list: ['Mobile X-ray systems', 'Portable ultrasound', 'Point-of-care testing', 'ECG monitoring', 'Blood analysis', 'Rapid results'],
    },
    {
      img: 'intermediate-care-unit', tags: ['Private', 'Monitored'], title: 'Intermediate Care Units',
      text: 'Private luxury care suites with advanced monitoring systems, comfortable accommodations, and dedicated nursing staff for extended recovery.',
      list: ['Continuous monitoring', 'Private suites', 'Dedicated nursing', 'Family accommodation', 'Nutritional support', 'Recovery programs'],
    },
    {
      img: 'ground-ambulance', tags: ['ALS', 'ICU-Ready'], title: 'Ground Ambulance Fleet',
      text: 'Modern advanced life support ambulances with fully equipped mobile ICU capabilities for safe and rapid patient transport.',
      list: ['Advanced life support', 'Mobile ICU capability', 'GPS tracking', 'Trained paramedics', 'Direct hospital links', 'Rapid response times'],
    },
  ],

  about: {
    meta: {
      title: 'About Us | Elite Medical Concierge',
      description: "For over a decade, Elite Medical Concierge has been the trusted guardian of guest health across Egypt's most prestigious resorts.",
    },
    hero: {
      eyebrow: 'Our Story',
      h1: "Redefining Medical Care in Egypt's Finest Hotels",
      lead: "For over a decade, Elite Medical Concierge has been the trusted guardian of guest health across Egypt's most prestigious resorts, combining world-class medical expertise with unparalleled hospitality.",
    },
    mission: {
      title: 'Our Mission',
      text: 'To provide exceptional, stress-free medical care to international travelers, ensuring every guest receives the same quality of treatment they would expect at home, delivered with warmth, efficiency, and complete peace of mind in the comfort of their hotel environment.',
    },
    vision: {
      title: 'Our Vision',
      text: 'To become the global standard for in-resort medical concierge services, setting the benchmark for how healthcare is delivered in hospitality settings worldwide, where every medical interaction enhances rather than interrupts the guest experience.',
    },
    values: {
      eyebrow: 'What Drives Us',
      h2: 'Our Core Values',
      items: [
        { icon: 'heart', title: 'Compassion', text: 'Every patient is treated with genuine care and empathy' },
        { icon: 'award', title: 'Excellence', text: 'Uncompromising commitment to the highest medical standards' },
        { icon: 'globe', title: 'Accessibility', text: 'Breaking barriers to quality healthcare for all travelers' },
        { icon: 'handshake', title: 'Partnership', text: 'Collaborative care with hotels, insurers, and families' },
      ],
    },
    testimonials: {
      eyebrow: 'What Our Guests Say',
      h2: 'Trusted by Thousands',
      items: [
        { text: 'The doctor arrived within 20 minutes and handled everything professionally. I felt like I was receiving care from my own physician back home.', name: 'Maria S.', where: 'Germany' },
        { text: "My daughter had a fever late at night. The team was calm, reassuring, and incredibly efficient. We couldn't have asked for better care.", name: 'Ahmed K.', where: 'UAE' },
        { text: 'From diagnosis to medication delivery, everything was seamless. The multilingual support made all the difference during a stressful time.', name: 'Sophie L.', where: 'France' },
        { text: 'I was impressed by how they coordinated with my travel insurance. Zero hassle, complete focus on my recovery.', name: 'James W.', where: 'UK' },
        { text: 'Professional, discreet, and genuinely caring. They treated me like family, not just another patient.', name: 'Elena R.', where: 'Russia' },
        { text: 'The portable diagnostic equipment they brought to my room was state-of-the-art. Truly elite medical service.', name: 'Marco B.', where: 'Italy' },
      ],
    },
    credentials: {
      eyebrow: 'Our Credentials',
      h2: 'Internationally Recognized Excellence',
      lead: "Our accreditations aren't just badges. They represent our unwavering commitment to meeting and exceeding international healthcare standards.",
      items: [
        {
          logo: 'uca', abbr: 'UCA', title: 'Urgent Care Association',
          text: 'Recognizing our commitment to immediate, high-quality medical services that meet global standards for patient safety and clinical outcomes.',
          list: ['Standardized clinical protocols', 'Quality assurance programs', 'Patient safety certifications', 'Continuous improvement frameworks'],
        },
        {
          logo: 'gha', abbr: 'GHA', title: 'Global Healthcare Accreditation', badge: 'Official Partner',
          text: 'The only accreditation body focused specifically on medical travel, certifying healthcare providers who deliver exceptional patient experiences to international travelers.',
          list: ['Medical travel best practices', 'Patient experience excellence', 'International care coordination', 'Transparent pricing standards'],
        },
        {
          logo: 'dmwv', abbr: 'DMWV', title: 'German Medical Wellness Association', badge: 'Official Partner',
          text: "Partnership and recognition from one of Europe's premier medical wellness bodies, ensuring our services meet German standards for medical wellness and preventive healthcare.",
          list: ['European medical standards', 'Advanced treatment protocols', 'Specialist network access', 'Quality benchmarking'],
        },
      ],
    },
    stats: [
      { value: '50+', label: 'Partner Hotels' },
      { value: '15K+', label: 'Patients Served' },
      { value: '98%', label: 'Satisfaction Rate' },
      { value: '24/7', label: 'Availability' },
    ],
    cta: {
      h2: 'Experience Elite Medical Care',
      text: "Join the thousands of satisfied guests who have trusted us with their health during their stay in Egypt's finest resorts.",
      button: 'Contact Us Today',
    },
  },

  services: {
    meta: {
      title: 'Our Services | Elite Medical Concierge',
      description: 'From emergency response to specialist consultations, we bring hospital-quality care to your hotel. 24/7 in-hotel doctors across Egypt.',
    },
    hero: {
      eyebrow: 'Our Services',
      h1: 'Comprehensive Medical Care',
      lead: 'From emergency response to specialist consultations, we bring hospital-quality care to your hotel.',
    },
    items: [
      { icon: 'stethoscope', title: 'General Medical Consultations', text: 'Comprehensive health assessments and consultations with multilingual physicians available 24/7 at your hotel room.', list: ['In-room visits', 'Multilingual doctors', 'Same-day appointments', 'Prescription services'] },
      { icon: 'ambulance', title: 'Emergency Response', popular: true, text: 'Rapid emergency medical response with fully equipped mobile units and trained paramedics arriving within 15 minutes.', list: ['15-min response time', 'Advanced life support', 'Hospital coordination', 'Evacuation services'] },
      { icon: 'user-round', title: 'Specialist Consultations', text: 'Access to board-certified specialists including cardiologists, orthopedists, dermatologists, and more, all at your resort.', list: ['15+ specialties', 'European-certified', 'Video consultations', 'Follow-up care'] },
      { icon: 'scan-line', title: 'Mobile Radiology', text: 'State-of-the-art portable X-ray and ultrasound services brought directly to your location with rapid digital results.', list: ['Portable X-ray', 'Ultrasound imaging', '1-hour results', 'Expert interpretation'] },
      { icon: 'flask-conical', title: 'Laboratory Services', text: 'Comprehensive blood tests, urinalysis, and diagnostic panels with samples collected at your convenience.', list: ['Full blood panels', 'Rapid results', 'In-room collection', 'Digital reports'] },
      { icon: 'bed-double', title: 'Intermediate Care Unit', popular: true, text: '24/7 monitored observation beds within hotel clinics for patients requiring extended medical supervision.', list: ['24/7 nursing care', 'Vital monitoring', 'IV therapy', 'Physician rounds'] },
      { icon: 'pill', title: 'Pharmacy & Medications', text: 'Prescription fulfillment and OTC medication delivery service, including specialized and international medications.', list: ['24/7 delivery', 'International medications', 'Prescription transfer', 'Allergy checks'] },
      { icon: 'accessibility', title: 'Medical Equipment Rental', text: 'Wheelchairs, oxygen concentrators, CPAP machines, and other medical devices available for your stay.', list: ['Same-day delivery', 'Quality equipment', 'Setup assistance', '24/7 support'] },
      { icon: 'hospital', title: 'Hospital Coordination', text: "Seamless coordination with Egypt's top hospitals when advanced care is needed, including medical escort services.", list: ['VIP admission', 'Medical escort', 'Family coordination', 'Insurance liaison'] },
    ],
    popular: 'Popular',
    book: 'Book Now',
    process: {
      eyebrow: 'Simple Process',
      h2: 'How Our Service Works',
      items: [
        { title: 'Contact Us', text: 'Call our 24/7 hotline or request through your hotel' },
        { title: 'Assessment', text: 'Our coordinator evaluates your needs' },
        { title: 'Dispatch', text: 'Medical team arrives at your location' },
        { title: 'Care & Follow-up', text: 'Treatment with complete post-care support' },
      ],
    },
    booking: {
      eyebrow: 'Book Appointment',
      h2: 'Schedule Your Medical Consultation',
      lead: 'Select your preferred date, time, and service. Our team will confirm your appointment within 30 minutes.',
      times: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
      services: ['General Consultation', 'Specialist Consultation', 'Emergency Response', 'Mobile Radiology', 'Laboratory Services', 'Pharmacy & Medications'],
      labels: {
        date: 'Preferred Date', time: 'Preferred Time', timeSelect: 'Select time slot', service: 'Service Type', serviceSelect: 'Select a service',
        name: 'Full Name', phone: 'Phone Number', email: 'Email Address', hotel: 'Hotel / Resort', room: 'Room Number', notes: 'Additional Notes',
      },
      placeholders: {
        name: 'Enter your full name', phone: '+20 xxx xxx xxxx', email: 'your@email.com', hotel: 'e.g. Four Seasons Sharm', room: 'e.g. Suite 501',
        notes: 'Describe your symptoms or any special requirements...',
      },
      submit: 'Confirm Appointment',
      note: 'For emergencies, please call our hotline directly.',
    },
    matter: {
      eyebrow: 'Why Our Services Matter',
      h2: '24/7 Resident Medical Team',
      lead: 'Our dedicated medical and paramedical team is always on-site, ready to respond immediately to any emergency.',
      items: [
        { icon: 'stethoscope', title: '24/7 Resident Doctors', text: 'Medical and paramedical team available around the clock at your location' },
        { icon: 'activity', title: '24/7 Instant Response', text: 'Swift action to save lives when every second counts' },
        { icon: 'shield-check', title: 'Less Risk of Deterioration', text: 'Early intervention reduces complications and speeds recovery' },
        { icon: 'bed-double', title: 'More Comfort for Patients', text: 'Receive care in the comfort of your hotel room, avoiding hospital stress' },
        { icon: 'users', title: 'Peace of Mind for Family', text: 'Loved ones and friends can stay close during treatment' },
        { icon: 'building-2', title: 'Convenience for Management', text: 'Hotels, travel agencies & insurance companies benefit from seamless coordination' },
      ],
    },
    cta: {
      h2: 'Need Medical Assistance?',
      text: "Our medical team is available 24/7 to provide you with the care you need. Don't hesitate to reach out for any health concerns.",
      primary: 'Emergency Line',
      secondary: 'Request Callback',
    },
  },

  serviceAreas: {
    meta: {
      title: 'Our Service Areas | Elite Medical Concierge',
      description: "Elite Medical Concierge provides premium healthcare services across Egypt's most popular tourist destinations and major cities.",
    },
    hero: {
      eyebrow: 'Coverage Across Egypt',
      h1: 'Our Service Areas',
      lead: "Elite Medical Concierge provides premium healthcare services across Egypt's most popular tourist destinations and major cities.",
    },
    listTitle: 'All Locations',
    listLead: 'Click on any location to view it on the map and see detailed contact information.',
    cta: {
      h2: 'Need Medical Assistance?',
      text: 'Our team is available around the clock across all service areas. Contact us for immediate medical support.',
      primary: 'Call Emergency Line',
      secondary: 'Send Inquiry',
    },
  },

  facilitiesPage: {
    meta: {
      title: 'Our Facilities | Elite Medical Concierge',
      description: 'Our state-of-the-art facilities and equipment ensure you receive the highest quality medical care in a luxurious, comfortable environment.',
    },
    hero: {
      eyebrow: 'World-Class Facilities',
      h1: 'Experience Elite Healthcare',
      lead: 'Our state-of-the-art facilities and equipment ensure you receive the highest quality medical care in a luxurious, comfortable environment. Every detail is designed with your well-being in mind.',
      primary: 'Book a Tour',
      secondary: 'Emergency Line',
    },
    stats: [
      { value: '10+', label: 'Multilingual Staff' },
      { value: '24/7', label: 'On-Site Diagnostics' },
      { value: '15+', label: 'Emergency Transport' },
      { value: '50+', label: 'Premium Facilities' },
    ],
    listTitle: 'Our Facilities',
    listLead: 'Experience healthcare in state-of-the-art facilities equipped with the latest medical technology and staffed by elite professionals.',
    book: 'Book Now',
    assurances: [
      { icon: 'award', title: 'Internationally Accredited', text: 'All our facilities meet international healthcare standards and certifications' },
      { icon: 'clock', title: '24/7 Availability', text: 'Round-the-clock access to medical care and emergency services' },
      { icon: 'languages', title: 'Multilingual Support', text: 'Coordinators fluent in 10+ languages for seamless communication' },
    ],
    cta: {
      h2: 'Ready to Experience Elite Healthcare?',
      text: 'Book a consultation or schedule a tour of our world-class facilities today.',
      primary: 'Book Appointment',
      secondary: 'Contact Us',
    },
  },

  partnersPage: {
    meta: {
      title: 'Our Partners | Elite Medical Concierge',
      description: 'We work with the finest hotels, trusted travel partners, leading insurers, and internationally recognized accreditation bodies to deliver excellence.',
    },
    hero: {
      eyebrow: 'Our Partners',
      h1: 'Trusted Collaborations',
      lead: 'We work with the finest hotels, trusted travel partners, leading insurers, and internationally recognized accreditation bodies to deliver excellence.',
    },
    hotels: {
      title: 'Hotel Partners', lead: 'Premium resorts across Egypt',
      items: [
        { name: 'Marriott Hotels & Resorts', where: 'Hurghada, Sharm El Sheikh, Cairo', logo: 'marriott' },
        { name: 'Hilton Hotels', where: 'Luxor, Hurghada, Sharm El Sheikh', logo: 'hilton' },
        { name: 'Four Seasons Resorts', where: 'Sharm El Sheikh' },
        { name: 'Steigenberger Hotels', where: 'El Gouna, Hurghada', logo: 'steigenberger' },
        { name: 'Oberoi Hotels', where: 'Luxor, Aswan' },
        { name: 'Kempinski Hotels', where: 'Red Sea Resorts' },
        { name: 'Jaz Hotels & Resorts', where: 'Marsa Alam, Hurghada', logo: 'jaz' },
        { name: 'Albatros Hotels', where: 'Hurghada, Sharm El Sheikh' },
        { name: 'Sunrise Resorts', where: 'Hurghada, Marsa Alam', logo: 'sunrise' },
        { name: 'Baron Hotels', where: 'Sharm El Sheikh' },
        { name: 'Cleopatra Luxury Resort', where: 'Sharm El Sheikh' },
        { name: 'Savoy Group', where: 'Sharm El Sheikh' },
      ],
    },
    operators: {
      title: 'Tour Operators', lead: 'International tour operators we serve',
      items: [
        { name: 'TUI Group', where: 'Germany/UK', tag: 'Package Holidays', logo: 'tui' },
        { name: 'Thomas Cook', where: 'UK', tag: 'Beach Resorts', logo: 'thomas-cook' },
        { name: 'FTI Touristik', where: 'Germany', tag: 'All-Inclusive', logo: 'fti' },
        { name: 'DERTOUR', where: 'Germany', tag: 'Premium Travel', logo: 'der' },
        { name: 'Intourist', where: 'Russia', tag: 'Charter Tours' },
        { name: 'Coral Travel', where: 'Russia', tag: 'Beach Holidays' },
        { name: 'Pegas Touristik', where: 'Russia/CIS', tag: 'Mass Market' },
        { name: 'Anex Tour', where: 'Turkey/Russia', tag: 'Charter Operations' },
      ],
    },
    agents: {
      title: 'Travel Agents', lead: 'Online platforms and destination management companies',
      items: [
        { name: 'Expedia Partner Solutions', tag: 'Global OTA' },
        { name: 'Booking.com Partners', tag: 'Global OTA' },
        { name: 'Travco Group', tag: 'DMC Egypt' },
        { name: 'Thomas Cook Egypt DMC', tag: 'DMC Egypt' },
        { name: 'Emeco Travel', tag: 'DMC Egypt' },
        { name: 'Mövenpick Hotels DMC', tag: 'DMC Egypt' },
      ],
    },
    insurers: {
      title: 'Insurance Companies', lead: 'Direct billing and cashless services',
      tag: 'Travel Insurance',
      items: [
        { name: 'Allianz Global Assistance', text: 'Worldwide leader in travel insurance and assistance services', benefit: 'Direct billing, 24/7 claims support', logo: 'allianz' },
        { name: 'AXA Assistance', text: 'International assistance and travel insurance provider', benefit: 'Cashless services, emergency coordination', logo: 'axa' },
        { name: 'MAPFRE Assistance', text: 'Spanish multinational insurance company', benefit: 'European coverage, multilingual support' },
        { name: 'Europ Assistance', text: 'Pioneer in travel assistance industry', benefit: 'Global network, medical evacuation' },
        { name: 'Mondial Assistance', text: 'Part of Allianz Partners', benefit: 'Comprehensive travel protection' },
        { name: 'ERV (European Travel Insurance)', text: "Germany's leading travel insurer", benefit: 'German travelers, direct settlement' },
        { name: 'Ingosstrakh', text: "Russia's largest insurance company", benefit: 'Russian travelers, 24/7 Russian support' },
        { name: 'Reso-Garantia', text: 'Major Russian insurance group', benefit: 'CIS region, emergency assistance' },
      ],
    },
    bodies: {
      title: 'Accrediting Bodies', lead: 'International recognition and certification',
      items: [
        {
          logo: 'uca', abbr: 'UCA', title: 'Urgent Care Association',
          text: 'The leading professional and trade association for the urgent care industry, setting standards for quality, safety, and operational excellence in immediate healthcare delivery.',
          list: ['Standardized clinical protocols', 'Quality assurance certification', 'Patient safety standards', 'Continuous education requirements', 'Operational best practices'],
          site: 'ucaoa.org',
        },
        {
          logo: 'gha', abbr: 'GHA', title: 'Global Healthcare Accreditation', badge: 'Official Partner',
          text: 'The only accreditation body focused specifically on medical travel, certifying healthcare providers who deliver exceptional patient experiences to international travelers.',
          list: ['Medical travel excellence standards', 'Patient experience certification', 'International care coordination', 'Cultural competency training', 'Transparent pricing requirements'],
          site: 'globalhealthcareaccreditation.com',
        },
        {
          logo: 'dmwv', abbr: 'DMWV', title: 'German Medical Wellness Association', badge: 'Official Partner',
          text: "Partnership and recognition from one of Europe's premier medical wellness bodies, ensuring our services meet German standards for medical wellness and preventive healthcare.",
          list: ['German medical standards compliance', 'Wellness integration protocols', 'Preventive care frameworks', 'Quality benchmarking', 'Network access to German specialists'],
          site: 'dmwv.de',
        },
      ],
    },
    cta: {
      h2: 'Become a Partner',
      text: 'Join our network of premium hospitality and travel partners. Together, we can provide exceptional care experiences for travelers from around the world.',
      button: 'Partner With Us',
    },
  },

  video: {
    meta: {
      title: 'Video Consultation | Elite Medical Concierge',
      description: 'Secure, high-quality video consultations from the comfort of your hotel room or anywhere you are.',
    },
    eyebrow: 'Video Consultation',
    h1: 'Connect with Your Doctor',
    lead: 'Secure, high-quality video consultations from the comfort of your hotel room or anywhere you are.',
    items: [
      { icon: 'lock', title: 'Secure & Private', text: 'End-to-end encrypted calls' },
      { icon: 'stethoscope', title: 'Expert Doctors', text: 'Certified medical professionals' },
      { icon: 'clock', title: '24/7 Available', text: 'Consultations anytime' },
    ],
    button: 'Join Consultation',
    note: "You'll need to log in to join a consultation.",
  },

  /* The Hurghada landing page, English and German, word for word. */
  hurghada: {
    en: {
      path: '/hurghada', lang: 'en',
      meta: { title: 'Doctor in Hurghada · 24/7 Hotel Doctor & Medical Care', description: 'English, German and Russian speaking doctors for hotel guests in Hurghada, Sahl Hasheesh, Makadi Bay, Soma Bay and Safaga. 24/7 in-room visits, clinic care and emergencies. Call +20 120 678 8566.' },
      eyebrow: 'Hurghada & Red Sea Coast',
      h1a: 'Doctor in Hurghada',
      h1b: '24/7 Care at Your Hotel',
      lead: 'Fell ill on holiday? Our doctors come to your hotel room in Hurghada and the surrounding resort areas, day or night. We speak English, German, Russian and Arabic, work directly with hotel reception and guest relations, and handle the paperwork your travel insurer needs.',
      call: 'Call 24/7: ',
      wa: 'Message us on WhatsApp',
      switchLabel: 'Deutsch: Arzt in Hurghada',
      treatTitle: 'What we treat in Hurghada',
      treat: [
        { icon: 'bed-double', title: 'In-hotel doctor visits', text: 'A doctor comes to your room for fever, stomach upsets, infections, injuries and other holiday illnesses.' },
        { icon: 'activity', title: 'Stomach & food-related illness', text: 'Diarrhoea, vomiting and dehydration, including infusions given in your room where needed.' },
        { icon: 'sun', title: 'Sun, sea & diving problems', text: 'Sunstroke, sunburn, jellyfish and coral injuries, and ear or sinus problems after diving and snorkelling.' },
        { icon: 'bandage', title: 'Injuries & wound care', text: 'Cuts, sprains, and wound cleaning and dressing.' },
        { icon: 'baby', title: "Children's care", text: 'Assessment and treatment for infants and children travelling with you.' },
        { icon: 'ambulance', title: 'Emergencies & hospital transfer', text: 'Urgent assessment and, when treatment cannot be given at the hotel, transfer to a partner hospital.' },
        { icon: 'file-check-2', title: 'Insurance paperwork', text: 'Reports, invoices and documentation prepared for international travel insurers, with cashless billing where your insurer allows it.' },
        { icon: 'video', title: 'Video consultation', text: 'Speak to a doctor first if you are not sure whether you need a visit.', href: '/video-consultation' },
      ],
      hotelsTitle: 'Hotels we work with in Hurghada',
      hotelsLead: 'We are the medical partner of these hotels and resorts. You can also call us directly as a guest of any other hotel, apartment or cruise in the area.',
      hotels: ['Hilton Plaza Hurghada', 'Rewaya Hotels & Resort', 'Long Beach Hotel & Resort', 'Sunrise Hotels & Resorts Hurghada', 'Pickalbatros Hotels & Resorts', 'Diana Beach', 'Steigenberger Aldau'],
      areasTitle: 'Areas we cover from Hurghada',
      areasLead: 'Our Hurghada team serves guests along the Red Sea coast:',
      areas: ['Hurghada city & Sekalla', 'Sahl Hasheesh', 'Makadi Bay', 'Soma Bay', 'Safaga', 'El Gouna', 'Port Ghalib', 'Marsa Alam'],
      ctaTitle: 'Need a doctor in Hurghada right now?',
      ctaText: 'Our line is answered 24 hours a day, every day. Tell us your hotel and room number and we will take it from there.',
      crumbs: 'Service Areas',
    },
    de: {
      path: '/de/arzt-hurghada', lang: 'de',
      meta: { title: 'Deutschsprachiger Arzt in Hurghada · 24/7 Hotelarzt', description: 'Deutschsprachige Ärzte für Hotelgäste in Hurghada, Sahl Hasheesh, Makadi Bay, Soma Bay und Safaga. Arztbesuch im Hotelzimmer rund um die Uhr, Notfälle, Abrechnung mit der Reiseversicherung. Tel. +20 120 678 8566.' },
      eyebrow: 'Hurghada & Rotes Meer',
      h1a: 'Deutschsprachiger Arzt in Hurghada',
      h1b: '24 Stunden im Hotel',
      lead: 'Im Urlaub krank geworden? Unsere Ärzte kommen Tag und Nacht in Ihr Hotelzimmer in Hurghada und den umliegenden Ferienorten. Wir sprechen Deutsch, Englisch, Russisch und Arabisch, arbeiten direkt mit Rezeption und Gästebetreuung zusammen und erstellen die Unterlagen, die Ihre Reiseversicherung benötigt.',
      call: '24/7 anrufen: ',
      wa: 'Über WhatsApp schreiben',
      switchLabel: 'English: Doctor in Hurghada',
      treatTitle: 'Was wir in Hurghada behandeln',
      treat: [
        { icon: 'bed-double', title: 'Arztbesuch im Hotel', text: 'Ein Arzt kommt bei Fieber, Magen-Darm-Beschwerden, Infektionen und Verletzungen in Ihr Zimmer.' },
        { icon: 'activity', title: 'Magen-Darm-Beschwerden', text: 'Durchfall, Erbrechen und Flüssigkeitsmangel, bei Bedarf mit Infusion im Hotelzimmer.' },
        { icon: 'sun', title: 'Sonne, Meer & Tauchen', text: 'Sonnenstich, Sonnenbrand, Quallen- und Korallenverletzungen sowie Ohren- und Nebenhöhlenprobleme nach dem Tauchen.' },
        { icon: 'bandage', title: 'Verletzungen & Wundversorgung', text: 'Schnittwunden, Verstauchungen, Wundreinigung und Verbände.' },
        { icon: 'baby', title: 'Kinder', text: 'Untersuchung und Behandlung von Säuglingen und Kindern.' },
        { icon: 'ambulance', title: 'Notfälle & Klinikeinweisung', text: 'Dringende Abklärung und, wenn die Behandlung im Hotel nicht möglich ist, Transfer in eine Partnerklinik.' },
        { icon: 'file-check-2', title: 'Versicherungsunterlagen', text: 'Berichte und Rechnungen für internationale Reiseversicherungen, auf Wunsch mit Direktabrechnung, sofern Ihre Versicherung dies zulässt.' },
        { icon: 'video', title: 'Videosprechstunde', text: 'Sprechen Sie zuerst mit einem Arzt, wenn Sie unsicher sind.', href: '/video-consultation' },
      ],
      hotelsTitle: 'Hotels in Hurghada, mit denen wir zusammenarbeiten',
      hotelsLead: 'Wir sind der medizinische Partner dieser Hotels und Resorts. Gäste anderer Hotels, Apartments oder Kreuzfahrten können uns ebenso direkt anrufen.',
      hotels: ['Hilton Plaza Hurghada', 'Rewaya Hotels & Resort', 'Long Beach Hotel & Resort', 'Sunrise Hotels & Resorts Hurghada', 'Pickalbatros Hotels & Resorts', 'Diana Beach', 'Steigenberger Aldau'],
      areasTitle: 'Unser Einsatzgebiet ab Hurghada',
      areasLead: 'Unser Team in Hurghada betreut Gäste entlang der Küste des Roten Meeres:',
      areas: ['Hurghada city & Sekalla', 'Sahl Hasheesh', 'Makadi Bay', 'Soma Bay', 'Safaga', 'El Gouna', 'Port Ghalib', 'Marsa Alam'],
      ctaTitle: 'Brauchen Sie jetzt einen Arzt in Hurghada?',
      ctaText: 'Unsere Leitung ist rund um die Uhr besetzt. Nennen Sie uns Hotel und Zimmernummer. Um alles Weitere kümmern wir uns.',
      crumbs: 'Service Areas',
    },
  },

  /* interface labels added for design 2 (theme, language, controls) */
  ui: {
    skip: 'Skip to content', menu: 'Menu', home: 'Home', language: 'Language',
    theme: 'Switch colour theme', light: 'Light', dark: 'Dark',
    pause: 'Pause', play: 'Play', prev: 'Previous', next: 'Next',
    required: 'Please fill in this field.', sending: 'Opening WhatsApp...', pauseVideo: 'Pause video', playVideo: 'Play video',
    sent: 'WhatsApp is open with your request. Press send there to reach our team.',
  },

  footer: {
    quickLinks: 'Quick Links',
    links: [
      { label: 'Services', href: '/services' },
      { label: 'Why Choose Us', href: '/#why-us' },
      { label: 'Accreditations', href: '/#accreditations' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/#contact' },
    ],
    areasTitle: 'Service Areas',
    rights: '© 2026 Elite Medical Concierge. All rights reserved.',
    dashboard: 'Dashboard',
    emergencyLine: 'Emergency Line',
    whatsapp: 'WhatsApp',
  },
};

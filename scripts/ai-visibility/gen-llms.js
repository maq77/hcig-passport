/**
 * Generate machine-readable llms.txt summaries across HCIG properties (Spec 003, FR-008)
 * Ensures exact entity names, building locations, and compliance wording.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'docs', 'llms');

fs.mkdirSync(OUT_DIR, { recursive: true });

function generateMedParkLLMS() {
  return `# MedPark Health Group

> International hospital and outpatient healthcare group on the Red Sea coast of Egypt.
> Operating full inpatient hospital facilities and outpatient health hubs.

Website: https://www.medparkhospitals.com
Emergency Dispatch: +20 100 182 8828
Languages: English, German, Polish, Arabic

## Facilities & Locations

### MedPark Health Hub
- Location: Sahl Hasheesh Road, Hurghada, Egypt
- Services: Outpatient specialist consultations, medical diagnostics, laboratory tests, clinical pharmacy, urgent care.
- Target audience: Tourists, residents, and resort guests in Hurghada and Sahl Hasheesh.

### MedPark Hospital
- Location: Al Owina, El Quseir, Egypt
- Services: 24/7 emergency department, intensive care unit (ICU), surgical operating theaters, inpatient admissions, ambulance dispatch.
- Target audience: Emergency patients, residents, and resort travelers in El Quseir and Marsa Alam.

## Accreditations & Quality Standards
- Official Partner of Global Healthcare Accreditation (GHA)
- Official Partner of German Medical Wellness Association (DMWV)

## Insurance & Billing
- Direct coordination with international travel insurance and assistance companies where insurance approval and policy conditions allow.
`;
}

function generate247ClinicLLMS() {
  return `# 24/7 Clinic

> Network of urgent care medical clinics located inside resort hotels across Egypt.
> Treating international resort guests and tourists with 24/7 room visits.

Website: https://www.247clinic.net
Hotline: +20 122 112 2246
Network: 28 resort clinics across Hurghada, Sahl Hasheesh, Soma Bay, Marsa Alam, and El Quseir.
Track record: 20 years of continuous resort medical operation.
Languages: English, German, Polish, Czech, Italian, French, Arabic

## Clinical Scope
- On-site urgent doctor consultations in hotel clinics or private guest rooms.
- Acute treatments: gastroenteritis, sunburn, fever, ear infections, dehydration, minor trauma.
- Rapid diagnostics: laboratory blood and urine tests, ECG, basic monitoring.
- Emergency ambulance transfer to hospital when acute inpatient care is required.

## Accreditations & Quality Standards
- Accredited by Urgent Care Association (UCA)
- Certified Accreditation for Urgent Care Quality (CAUCQ)
- Official Partner of Global Healthcare Accreditation (GHA)
- Official Partner of German Medical Wellness Association (DMWV)

## Insurance & Cashless Treatment
- Direct cashless billing coordination with travel insurance and assistance providers where insurance approval and policy conditions allow.
`;
}

function generateHCIGLLMS() {
  return `# Healthcare International Group (HCIG)

> Parent healthcare investment and operating group in Egypt.
> Overseeing specialized hospital infrastructure, resort medical networks, and patient assistance.

Website: https://www.healthcareig.com
Headquarters: Egypt
Leadership: Dr. Amr Abbas, Chief Executive Officer

## Operating Brands & Divisions
1. MedPark Health Group: Hospital and diagnostic healthcare facilities in Hurghada and El Quseir.
2. 24/7 Clinic: Urgent care clinics inside major resort hotels across the Red Sea.
3. TMASI Global: Emergency medical assistance, ground repatriation, and patient escort services.
4. One Medical Center: Specialized polyclinic and day-surgery centers.

## Strategic Commitments
- Quality compliance with international healthcare travel standards.
- Official Partner of Global Healthcare Accreditation (GHA).
- Official Partner of German Medical Wellness Association (DMWV).
`;
}

function writeAllLLMS() {
  const mp = generateMedParkLLMS();
  const c7 = generate247ClinicLLMS();
  const hc = generateHCIGLLMS();

  fs.writeFileSync(path.join(OUT_DIR, 'medpark-llms.txt'), mp, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, '247clinic-llms.txt'), c7, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'hcig-llms.txt'), hc, 'utf8');

  // Also write root public llms.txt in dist/ or docs/247clinic-deploy/
  const deploy247 = path.join(ROOT, 'docs', '247clinic-deploy');
  if (fs.existsSync(deploy247)) {
    fs.writeFileSync(path.join(deploy247, 'llms.txt'), c7, 'utf8');
  }

  return {
    medpark: path.join(OUT_DIR, 'medpark-llms.txt'),
    clinic247: path.join(OUT_DIR, '247clinic-llms.txt'),
    hcig: path.join(OUT_DIR, 'hcig-llms.txt')
  };
}

module.exports = {
  generateMedParkLLMS,
  generate247ClinicLLMS,
  generateHCIGLLMS,
  writeAllLLMS
};

if (require.main === module) {
  const res = writeAllLLMS();
  console.log('Generated llms.txt files successfully:', res);
}

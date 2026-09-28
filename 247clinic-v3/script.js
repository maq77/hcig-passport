const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const downloads = 'C:\\Users\\maqmo\\Downloads';
const targetDir = 'D:\\Healthcare international group\\247clinic-v3\\public\\img';

const files = [
  'Your Health, Our Care — Right Where You VacationDreaming of Egypt’s Red Sea coast or the North C.jpg',
  'WhatsApp Image 2026-09-27 at 18.08.43.jpeg',
  'WhatsApp Image 2026-09-27 at 18.08.20.jpeg',
  'IMG_9443.PNG',
  'IMG_9023.PNG',
  'WhatsApp Image 2026-09-27 at 18.10.25.jpeg',
  'WhatsApp Image 2026-09-27 at 18.09.57.jpeg',
  'WhatsApp Image 2026-09-27 at 18.09.31.jpeg',
  'WhatsApp Image 2026-09-27 at 18.09.09.jpeg'
];

const results = [];

let trustedCount = 1;

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const src = path.join(downloads, file);
  
  let targetName = '';
  if (i === 0) {
    targetName = 'hero-resort-authentic.jpg';
  } else if (i === 1) {
    targetName = 'trusted-main.jpg'; // For the "doctor holding patient" replacement
  } else {
    const ext = path.extname(file);
    targetName = 'trusted-' + trustedCount + ext.toLowerCase();
    trustedCount++;
  }
  
  const dest = path.join(targetDir, targetName);
  
  try {
    fs.copyFileSync(src, dest);
    const dimensions = sizeOf(dest);
    results.push({ file: targetName, width: dimensions.width, height: dimensions.height });
  } catch (err) {
    console.error('Error with ' + file + ':', err.message);
  }
}

console.log(JSON.stringify(results, null, 2));

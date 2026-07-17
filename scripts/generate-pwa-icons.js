const sharp = require('sharp');
const path = require('path');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#08080c"/>
    </linearGradient>
    <linearGradient id="fingerprint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#a0a0a0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <g transform="translate(256, 240)" fill="none" stroke="url(#fingerprint)" stroke-width="12" stroke-linecap="round" opacity="0.9">
    <path d="M-80,60 C-80,20 -60,-30 -30,-60 C0,-90 40,-90 70,-60 C100,-30 100,20 80,60"/>
    <path d="M-55,50 C-55,15 -40,-20 -15,-45 C10,-70 40,-70 60,-45 C80,-20 80,15 60,50"/>
    <path d="M-30,40 C-30,10 -20,-10 0,-30 C20,-50 40,-50 55,-30 C70,-10 65,15 50,40"/>
    <path d="M-10,30 C-10,5 0,-10 15,-25 C30,-40 45,-35 50,-20 C55,-5 50,15 40,30"/>
    <path d="M10,20 C15,5 25,-5 35,-15 C45,-25 50,-20 50,-10 C50,0 45,10 35,20"/>
  </g>
  <text x="256" y="380" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" letter-spacing="-1">FingerHR</text>
  <text x="256" y="420" text-anchor="middle" fill="#888" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">Attendance</text>
</svg>`;

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);

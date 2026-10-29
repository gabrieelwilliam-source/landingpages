import sharp from 'sharp';
const root=new URL('./vendor/native-human/',import.meta.url);
await sharp(new URL('bluegreen_eye.png',root).pathname).modulate({saturation:.3}).resize(512,512).png().toFile(new URL('bluegrey-eye-adapted.png',root).pathname);

// iOS often sends HEIC files with "image/jpeg" content-type and ".JPG" extension,
// so we must check magic bytes rather than trusting file.type or file.name.
export async function detectActualFormat(
  file: File,
): Promise<'jpeg' | 'png' | 'webp' | 'heic' | null> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const b = new Uint8Array(buffer);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return 'webp';
  // ISO BMFF "ftyp" at offset 4 — covers HEIC, HEIF, AVIF
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'heic';
  return null;
}

// HEIC → JPEG conversion runs entirely in the browser via WebAssembly.
// Dynamic import keeps heic2any (~2 MB) out of the initial bundle.
export async function normalizeToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  // Strip original extension regardless of what it is — iOS may send HEIC as .JPG
  const dotIndex = file.name.lastIndexOf('.');
  const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
  return new File([blob], baseName + '.jpg', { type: 'image/jpeg' });
}

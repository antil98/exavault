const fileSizeUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];

export function formatFileSize(sizeInBytes: number, locale: string) {
  let value = sizeInBytes;
  let unitIndex = 0;

  while (Math.abs(value) > 999 && unitIndex < fileSizeUnits.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value < 10 && unitIndex > 0 ? 1 : 0,
    style: 'unit',
    unit: fileSizeUnits[unitIndex],
    unitDisplay: 'short',
  }).format(value);
}

import { UnitType } from '../types/viewer';

export function formatCompactNumber(num: number): string {
  if (num === 0) return '0';
  if (isNaN(num)) return '-';
  
  const abs = Math.abs(num);
  if (abs >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (abs >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (abs >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function formatExactNumber(num: number): string {
  if (isNaN(num)) return '-';
  return num.toLocaleString();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (isNaN(bytes) || bytes < 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatDimension(val: number, unit: UnitType = 'unit'): string {
  if (isNaN(val)) return '-';
  
  let converted = val;
  let unitSuffix = ' units';

  switch (unit) {
    case 'mm':
      converted = val;
      unitSuffix = ' mm';
      break;
    case 'cm':
      converted = val / 10;
      unitSuffix = ' cm';
      break;
    case 'm':
      converted = val / 1000;
      unitSuffix = ' m';
      break;
    case 'in':
      converted = val / 25.4;
      unitSuffix = ' in';
      break;
    case 'unit':
    default:
      unitSuffix = ' u';
      break;
  }

  return `${converted.toFixed(2)}${unitSuffix}`;
}

export function truncateFilename(filename: string, maxLength: number = 24): string {
  if (!filename) return '';
  if (filename.length <= maxLength) return filename;
  const extIndex = filename.lastIndexOf('.');
  if (extIndex > -1 && filename.length - extIndex <= 6) {
    const ext = filename.slice(extIndex);
    const name = filename.slice(0, extIndex);
    const available = maxLength - ext.length - 3;
    if (available > 4) {
      return `${name.slice(0, available)}...${ext}`;
    }
  }
  return `${filename.slice(0, maxLength - 3)}...`;
}

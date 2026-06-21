export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      }
      else {
        inQuotes = !inQuotes;
      }
    }
    else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    }
    else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseCsvRows(text: string): string[][] {
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(Boolean)
    .map((line) => parseCsvLine(line));
}

export function parseCsvObjects<T>(text: string): T[] {
  const rows = parseCsvRows(text);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.replace(/^\ufeff/, '').trim());

  return rows.slice(1).map((values) => {
    const entry: Record<string, string> = {};

    headers.forEach((header, index) => {
      entry[header] = values[index]?.trim() || '';
    });

    return entry as T;
  });
}

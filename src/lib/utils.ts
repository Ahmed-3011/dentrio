import { get } from './db';

export function generateCaseCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function ensureCaseCodeUnique(): Promise<string> {
  let code = generateCaseCode();
  while (await get('SELECT id FROM cases WHERE code = ?', [code])) {
    code = generateCaseCode();
  }
  return code;
}

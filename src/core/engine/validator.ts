import { TestCaseIO } from '../../data/curriculum/types';

export interface ValidationResult {
  passed: boolean;
  message: string;
  matchedCount: number;
  totalGroups: number;
  testResults: {
    label: string;
    input: string;
    expectedOutput: string;
    passed: boolean;
  }[];
}

/**
 * Normalizes whitespace and trims code/SQL for resilient structural validation.
 */
export function normalizeCode(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates user-written SQL, TypeScript, Node.js, or Drizzle ORM code against
 * structural requirement groups and forbidden anti-patterns.
 */
export function validateCodeSubmission(params: {
  userInput: string;
  language: 'sql' | 'drizzle' | 'typescript' | 'nodejs';
  requiredGroups: string[][];
  forbiddenPatterns?: string[];
  testCases?: TestCaseIO[];
}): ValidationResult {
  const { userInput, language, requiredGroups, forbiddenPatterns = [], testCases = [] } = params;
  const normalized = normalizeCode(userInput);

  if (!normalized || normalized.length < 4) {
    return {
      passed: false,
      message: 'Çözüm boş veya çok kısa. En azından temel ifadeyi yazıp tekrar deneyin.',
      matchedCount: 0,
      totalGroups: requiredGroups.length,
      testResults: testCases.map((tc) => ({ ...tc, passed: false })),
    };
  }

  const flags = language === 'sql' ? 'i' : '';

  for (const forbidden of forbiddenPatterns) {
    const regex = new RegExp(forbidden, flags);
    if (regex.test(normalized)) {
      return {
        passed: false,
        message: 'Güvenli olmayan veya yasaklı bir kalıp tespit edildi. Daha güvenli / tip-güvenli yaklaşımı kullanın.',
        matchedCount: 0,
        totalGroups: requiredGroups.length,
        testResults: testCases.map((tc) => ({ ...tc, passed: false })),
      };
    }
  }

  let matchedCount = 0;
  for (const group of requiredGroups) {
    const groupMatched = group.some((pattern) => {
      try {
        const regex = new RegExp(pattern, flags);
        return regex.test(normalized);
      } catch {
        return normalized.toLowerCase().includes(pattern.toLowerCase());
      }
    });
    if (groupMatched) {
      matchedCount += 1;
    }
  }

  const passed = matchedCount === requiredGroups.length;
  const ratio = requiredGroups.length > 0 ? matchedCount / requiredGroups.length : 1;

  const testResults = testCases.map((tc, idx) => {
    if (passed) return { ...tc, passed: true };
    // Partial pass feedback for progressive clarity
    const threshold = (idx + 1) / Math.max(testCases.length, 1);
    return { ...tc, passed: ratio >= threshold && matchedCount > 0 };
  });

  const message = passed
    ? 'Tüm yapısal kontroller ve test senaryoları başarıyla geçti.'
    : `${matchedCount}/${requiredGroups.length} yapısal gereksinim karşılandı. Eksik parça için ipucunu veya beklenen çıktıyı kontrol edin.`;

  return {
    passed,
    message,
    matchedCount,
    totalGroups: requiredGroups.length,
    testResults,
  };
}

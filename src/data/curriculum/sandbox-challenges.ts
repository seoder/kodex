import { SandboxChallenge } from './types';

export const SANDBOX_CHALLENGES: SandboxChallenge[] = [
  {
    id: 'sb-sql-left-join',
    topic: 'sql',
    difficulty: 'Temel',
    title: 'Hiç Siparişi Olmayan Kullanıcıları Bul',
    language: 'sql',
    prompt:
      'users ve orders tablolarını LEFT JOIN ile birleştirip hiç siparişi olmayan (o.id IS NULL) kullanıcıların sadece u.id ve u.email kolonlarını döndüren SQL sorgusunu yazın.',
    tables: [
      {
        tableName: 'users',
        columns: ['id', 'email'],
        rows: [
          ['u1', 'ada@kodex.dev'],
          ['u2', 'can@kodex.dev'],
          ['u3', 'ece@kodex.dev'],
        ],
      },
      {
        tableName: 'orders',
        columns: ['id', 'user_id', 'amount'],
        rows: [['o1', 'u1', '400']],
      },
    ],
    expectedTable: {
      tableName: 'EXPECTED OUTPUT',
      columns: ['id', 'email'],
      rows: [
        ['u2', 'can@kodex.dev'],
        ['u3', 'ece@kodex.dev'],
      ],
    },
    starterCode: `SELECT u.id, u.email\nFROM users u\n-- LEFT JOIN ve IS NULL filtresi ekleyin`,
    quickTokens: [
      'LEFT JOIN orders o ON o.user_id = u.id',
      'WHERE o.id IS NULL;',
    ],
    testCases: [
      {
        label: 'Anti-Join Doğrulaması',
        input: 'users(3 satır), orders(1 satır)',
        expectedOutput: '2 satır: u2, u3',
      },
    ],
    requiredGroups: [
      ['select\\s+u\\.id\\s*,\\s*u\\.email'],
      ['from\\s+users'],
      ['left\\s+join\\s+orders'],
      ['on\\s+.*user_id\\s*=\\s*.*id'],
      ['where\\s+.*is\\s+null'],
    ],
    hint: 'LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;',
    solution: `SELECT u.id, u.email\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;`,
    explanation:
      'LEFT JOIN + WHERE right.id IS NULL (Anti-Join) kalıbı, NOT IN’in NULL değerlerle yaşadığı üç değerli mantık (3VL) tuzaklarına düşmeden güvenli çalışır.',
    xp: 30,
  },
  {
    id: 'sb-sql-window-top',
    topic: 'sql',
    difficulty: 'Senior',
    title: 'Departman Bazlı En Yüksek Maaş (Window Function)',
    language: 'sql',
    prompt:
      'employees tablosunda her department_id için maaşa (salary) göre azalan sırada ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) hesaplayıp rn = 1 olanları seçin.',
    tables: [
      {
        tableName: 'employees',
        columns: ['id', 'department_id', 'salary'],
        rows: [
          ['e1', 'eng', '140000'],
          ['e2', 'eng', '165000'],
          ['e3', 'data', '130000'],
        ],
      },
    ],
    expectedTable: {
      tableName: 'EXPECTED OUTPUT',
      columns: ['id', 'department_id', 'salary'],
      rows: [
        ['e2', 'eng', '165000'],
        ['e3', 'data', '130000'],
      ],
    },
    starterCode: `WITH ranked AS (\n  SELECT id, department_id, salary,\n         -- ROW_NUMBER() ekleyin\n  FROM employees\n)\nSELECT id, department_id, salary FROM ranked WHERE rn = 1;`,
    quickTokens: [
      'ROW_NUMBER() OVER (',
      'PARTITION BY department_id',
      'ORDER BY salary DESC',
      ') AS rn',
    ],
    testCases: [
      {
        label: 'Top-N Per Group',
        input: 'employees (eng: 2 kişi, data: 1 kişi)',
        expectedOutput: 'Her departmandan en yüksek maaşlı 1 kişi',
      },
    ],
    requiredGroups: [
      ['with\\s+ranked\\s+as'],
      ['row_number\\s*\\(\\s*\\)\\s*over'],
      ['partition\\s+by\\s+department_id'],
      ['order\\s+by\\s+salary\\s+desc'],
      ['where\\s+rn\\s*=\\s*1'],
    ],
    hint: 'ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn',
    solution: `WITH ranked AS (\n  SELECT id, department_id, salary,\n         ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn\n  FROM employees\n)\nSELECT id, department_id, salary FROM ranked WHERE rn = 1;`,
    explanation:
      'Top-N per group mülakatların en popüler SQL sorusudur. CTE + ROW_NUMBER() okunabilir, deterministik ve index desteklidir.',
    xp: 40,
  },
  {
    id: 'sb-drizzle-count-map',
    topic: 'drizzle',
    difficulty: 'Orta',
    title: 'Drizzle: Güvenli COUNT(*) + Runtime Dönüşümü',
    language: 'drizzle',
    prompt:
      'PostgreSQL’de orders tablosunun toplam kayıt sayısını Drizzle ile gerçek JavaScript number olarak döndüren sorguyu sql<number> ve .mapWith(Number) kullanarak yazın.',
    starterCode: `const [result] = await db\n  .select({\n    // TODO: total alanını sql<number> ve mapWith(Number) ile tanımlayın\n  })\n  .from(orders);`,
    quickTokens: [
      'total: sql<number>`count(*)`',
      '.mapWith(Number),',
    ],
    testCases: [
      {
        label: 'Runtime Tip Kontrolü',
        input: 'PostgreSQL count(*) -> "42"',
        expectedOutput: 'typeof result.total === "number" (42)',
      },
    ],
    requiredGroups: [
      ['sql\\s*<\\s*number\\s*>\\s*`\\s*count\\s*\\(\\s*\\*\\s*\\)\\s*`'],
      ['\\.mapWith\\s*\\(\\s*Number\\s*\\)'],
      ['\\.from\\s*\\(\\s*orders\\s*\\)'],
    ],
    hint: 'total: sql<number>`count(*)`.mapWith(Number)',
    solution: `const [result] = await db\n  .select({\n    total: sql<number>\`count(*)\`.mapWith(Number),\n  })\n  .from(orders);`,
    explanation:
      'sql<number> yalnızca TypeScript’i bilgilendirir; .mapWith(Number) ise sürücüden gelen string değeri runtime’da gerçek sayıya dönüştürür.',
    xp: 35,
  },
  {
    id: 'sb-drizzle-tenant-where',
    topic: 'drizzle',
    difficulty: 'Senior',
    title: 'Drizzle: Multi-Tenant İzolasyonlu Güncelleme',
    language: 'drizzle',
    prompt:
      'invoices tablosunda yalnızca hem id = invoiceId HEM de tenantId = ctx.tenantId koşulunu sağlayan satırın status alanını "paid" yapan ve güncellenen kaydı .returning() ile döndüren Drizzle sorgusunu yazın.',
    starterCode: `const updated = await db\n  .update(invoices)\n  .set({ status: 'paid' })\n  // TODO: and(eq(...), eq(...)) ve .returning() ekleyin`,
    quickTokens: [
      '.where(and(',
      'eq(invoices.id, invoiceId),',
      'eq(invoices.tenantId, ctx.tenantId)',
      '))',
      '.returning();',
    ],
    testCases: [
      {
        label: 'IDOR Engelleme',
        input: 'Başka tenant’a ait invoiceId',
        expectedOutput: 'updated = [] (0 satır etkilenir)',
      },
    ],
    requiredGroups: [
      ['\\.update\\s*\\(\\s*invoices\\s*\\)'],
      ['\\.set\\s*\\(\\s*\\{\\s*status\\s*:\\s*[\'"]paid[\'"]\\s*\\}\\s*\\)'],
      ['and\\s*\\('],
      ['eq\\s*\\(\\s*invoices\\.id\\s*,\\s*invoiceId\\s*\\)'],
      ['eq\\s*\\(\\s*invoices\\.tenantId\\s*,\\s*ctx\\.tenantId\\s*\\)'],
      ['\\.returning\\s*\\(\\s*\\)'],
    ],
    hint: '.where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, ctx.tenantId))).returning();',
    solution: `const updated = await db\n  .update(invoices)\n  .set({ status: 'paid' })\n  .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, ctx.tenantId)))\n  .returning();`,
    explanation:
      'Tenant sınırını doğrudan veritabanı WHERE koşuluna koymak, yetkisiz erişimi (IDOR) uygulama katmanı hatalarına karşı dahi korur.',
    xp: 40,
  },
  {
    id: 'sb-ts-exhaustive',
    topic: 'typescript',
    difficulty: 'Orta',
    title: 'TypeScript: Exhaustive Switch (never)',
    language: 'typescript',
    prompt:
      'OrderStatus = "pending" | "paid" | "failed" union tipi için switch-case içinde tüm durumları ele alıp default dalında `const _exhaustive: never = status;` ile derleme zamanı güvenliği sağlayan fonksiyonu tamamlayın.',
    starterCode: `type OrderStatus = 'pending' | 'paid' | 'failed';\n\nexport function statusCode(status: OrderStatus): number {\n  switch (status) {\n    case 'pending': return 102;\n    case 'paid': return 200;\n    case 'failed': return 422;\n    default:\n      // TODO: never exhaustive check ekleyin\n  }\n}`,
    quickTokens: [
      'const _exhaustive: never = status;',
      'throw new Error(`Unhandled: ${_exhaustive}`);',
    ],
    testCases: [
      {
        label: 'Yeni Union Üyesi Eklendiğinde',
        input: `OrderStatus += | 'refunded'`,
        expectedOutput: 'TypeScript derleme hatası verir (sessiz bug oluşmaz)',
      },
    ],
    requiredGroups: [
      ['never\\s*=\\s*status'],
      ['throw\\s+new\\s+Error'],
    ],
    forbiddenPatterns: ['as\\s+any', 'as\\s+never'],
    hint: 'default bloğunda `const _exhaustive: never = status; throw new Error(String(_exhaustive));` yazın.',
    solution: `type OrderStatus = 'pending' | 'paid' | 'failed';\n\nexport function statusCode(status: OrderStatus): number {\n  switch (status) {\n    case 'pending': return 102;\n    case 'paid': return 200;\n    case 'failed': return 422;\n    default: {\n      const _exhaustive: never = status;\n      throw new Error(\`Unhandled status: \${_exhaustive}\`);\n    }\n  }\n}`,
    explanation:
      'Exhaustive check sayesinde aylar sonra union tipine yeni bir durum eklendiğinde unutulan her switch-case derleme zamanında kırmızı yanar.',
    xp: 35,
  },
  {
    id: 'sb-node-abort',
    topic: 'nodejs',
    difficulty: 'Senior',
    title: 'Node.js: Timeout Korumalı fetch (AbortSignal)',
    language: 'nodejs',
    prompt:
      'Dış servise yapılan HTTP çağrısının 3000ms içinde yanıt vermezse otomatik iptal edilmesi için AbortSignal.timeout(3000) kullanan fetchWithTimeout fonksiyonunu yazın.',
    starterCode: `export async function fetchWithTimeout(url: string): Promise<Response> {\n  // TODO: fetch(url, { signal: AbortSignal.timeout(3000) }) döndürün\n}`,
    quickTokens: [
      'return fetch(url, {',
      'signal: AbortSignal.timeout(3000)',
      '});',
    ],
    testCases: [
      {
        label: 'Asılı Kalan Upstream Koruması',
        input: 'Upstream 10sn yanıt vermiyor',
        expectedOutput: '3000ms’de TimeoutError ile iptal; soket sızıntısı yok',
      },
    ],
    requiredGroups: [
      ['fetch\\s*\\(\\s*url'],
      ['signal\\s*:\\s*AbortSignal\\.timeout\\s*\\(\\s*3000\\s*\\)'],
    ],
    hint: 'return fetch(url, { signal: AbortSignal.timeout(3000) });',
    solution: `export async function fetchWithTimeout(url: string): Promise<Response> {\n  return fetch(url, {\n    signal: AbortSignal.timeout(3000),\n  });\n}`,
    explanation:
      'Timeout olmayan dış HTTP çağrıları, upstream yavaşladığında tüm Node.js servisinizin bağlantı havuzunu tüketerek cascading failure yaratır.',
    xp: 35,
  },
];

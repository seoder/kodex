import { ModuleItem } from './types';

export const LEVEL1_MODULES: ModuleItem[] = [
  {
    id: 'l1-nodejs-eventloop',
    level: 1,
    order: 1,
    topic: 'nodejs',
    title: 'Node.js Runtime & Event Loop',
    subtitle: 'Call Stack, Microtask Queue, Macrotask sırası ve non-blocking I/O.',
    durationMin: 8,
    steps: [
      {
        id: 'l1-node-1',
        kind: 'concept',
        title: 'Event Loop Nasıl Çalışır?',
        xp: 15,
        body: 'Node.js tek bir JavaScript ana thread (Call Stack) üzerinde çalışır. I/O işlemleri libuv tarafından işletim sistemine veya thread pool’a devredilir. Call Stack her boşaldığında önce Microtask kuyruğu (process.nextTick -> Promise.then), ardından Macrotask fazları (Timers, Poll, Check) işlenir.',
        keyPoints: [
          'Senkron kod her zaman ilk çalışır.',
          'process.nextTick, Promise microtask’larından önce yürütülür.',
          'setTimeout(fn, 0) Timers fazında, setImmediate Check fazında çalışır.',
          'CPU-yoğun döngüler Event Loop’u kilitler; I/O istekleri beklemeye alınır.',
        ],
        code: `console.log('1: sync');
setTimeout(() => console.log('4: timer'), 0);
Promise.resolve().then(() => console.log('3: promise'));
process.nextTick(() => console.log('2: nextTick'));`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Çalışma Sırası (Execution Order)',
          input: 'Event Loop 1 tick başlatılır',
          expectedOutput: '1: sync -> 2: nextTick -> 3: promise -> 4: timer',
        },
        interviewNote:
          'Senior mülakatlarda "Node.js single-threaded mı?" sorusuna "JS execution tek thread, ancak libuv thread pool (varsayılan 4 thread) dosya I/O, DNS ve kripto işlemlerini paralel yürütür" şeklinde net cevap verin.',
      },
      {
        id: 'l1-node-2',
        kind: 'output_predict',
        title: 'Çıktı Tahmini: Microtask vs Timer',
        xp: 20,
        prompt: 'Aşağıdaki Node.js kodu çalıştırıldığında konsola hangi sırayla çıktı verir?',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => {
  console.log('C');
  process.nextTick(() => console.log('D'));
});
console.log('E');`,
        codeLanguage: 'typescript',
        options: [
          'A -> E -> C -> D -> B',
          'A -> C -> D -> E -> B',
          'A -> E -> B -> C -> D',
          'A -> E -> D -> C -> B',
        ],
        correctIndex: 0,
        explanation:
          'Önce senkron kodlar (A, E) çalışır. Sonra Promise microtask’ı (C) yürütülür ve içeride eklenen process.nextTick (D) timer fazına geçmeden hemen microtask boşaltma döngüsünde çalışır. En son Timers fazındaki setTimeout (B) çalışır.',
        interviewNote:
          'Microtask içinde sonsuz process.nextTick çağırmak "Event Loop Starvation" yaratır ve HTTP isteklerini tamamen dondurur.',
      },
      {
        id: 'l1-node-3',
        kind: 'code_write',
        title: 'Kod Yaz: Non-Blocking Async Okuma',
        xp: 25,
        prompt:
          'fs/promises modülünden readFile kullanarak verilen filePath yolunu UTF-8 olarak asenkron okuyan readConfig fonksiyonunu yazın.',
        language: 'nodejs',
        starterCode: `import { readFile } from 'node:fs/promises';\n\nexport async function readConfig(filePath: string): Promise<string> {\n  // TODO: dosyayı utf8 olarak asenkron okuyup döndürün\n}`,
        placeholder: `return await readFile(filePath, 'utf8');`,
        hint: 'readFile fonksiyonuna ikinci parametre olarak "utf8" veya { encoding: "utf8" } verin ve await ile döndürün.',
        solution: `import { readFile } from 'node:fs/promises';\n\nexport async function readConfig(filePath: string): Promise<string> {\n  return await readFile(filePath, 'utf8');\n}`,
        quickTokens: ['return', 'await', 'readFile(', 'filePath,', "'utf8'", ');'],
        requiredGroups: [
          ['async\\s+function\\s+readConfig'],
          ['readFile\\s*\\('],
          ['utf-?8'],
          ['return'],
        ],
        forbiddenPatterns: ['readFileSync'],
        testCases: [
          {
            label: 'Test 1 — Geçerli JSON dosyası',
            input: `readConfig('./config.json')`,
            expectedOutput: `'{"port":3000}' (Event Loop bloklanmadan)`,
          },
          {
            label: 'Test 2 — Senkron API yasağı',
            input: 'Static analiz kontrolü',
            expectedOutput: 'readFileSync kullanılmamalı',
          },
        ],
        explanation:
          'Production Node.js sunucularında request path içinde readFileSync kullanmak tüm eşzamanlı kullanıcıları bloklar. node:fs/promises ile non-blocking I/O yapılır.',
      },
    ],
  },
  {
    id: 'l1-ts-typesystem',
    level: 1,
    order: 2,
    topic: 'typescript',
    title: 'TypeScript Tip Sistemi & Narrowing',
    subtitle: 'unknown vs any, Discriminated Unions ve Utility Types.',
    durationMin: 9,
    steps: [
      {
        id: 'l1-ts-1',
        kind: 'concept',
        title: 'Neden any Yerine unknown?',
        xp: 15,
        body: 'any tip denetimini tamamen kapatır ve hatayı production’a taşır. unknown ise "tipi henüz bilinmiyor, kullanmadan önce daralt (narrowing)" zorunluluğu getirir. Backend’de dış dünyadan (HTTP body, JSON.parse, catch error) gelen her veri unknown olarak karşılanmalıdır.',
        keyPoints: [
          'Discriminated Union (tag/status alanı) ile if/switch dallarında kesin tip güvenliği sağlanır.',
          'never tipi ile exhaustive check (eksik case kontrolü) derleme zamanında yakalanır.',
          'Pick, Omit, Partial ve Record DTO tasarımlarında tekrarı önler.',
        ],
        code: `type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function handle(res: ApiResult<number>): number {
  if (!res.ok) throw new Error(res.error);
  return res.data; // TypeScript burada data'nın number olduğunu bilir
}`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Tip Daraltma (Type Narrowing)',
          input: `{ ok: true, data: 42 }`,
          expectedOutput: '42 (res.error erişimi derleme hatası verir)',
        },
        interviewNote:
          'Mülakatta "TypeScript tipleri runtime’da var mı?" sorusu çok kritiktir: Hayır, tipler derleme aşamasında silinir (type erasure). Runtime güvenliği için Zod gibi validator’lar gerekir.',
      },
      {
        id: 'l1-ts-2',
        kind: 'multiple_choice',
        title: 'Tuzak Soru: Omit vs Pick DTO Tasarımı',
        xp: 20,
        prompt:
          'Bir User entity’sinden HTTP cevabı döndürürken passwordHash alanını gizlemek istiyorsunuz. Yeni hassas bir alan (ör. twoFactorSecret) eklendiğinde yanlışlıkla sızmasını önlemek için hangi yaklaşım daha güvenlidir?',
        code: `interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  twoFactorSecret: string;
}`,
        codeLanguage: 'typescript',
        options: [
          'Pick<UserEntity, "id" | "email"> kullanmak (Allowlist yaklaşımı)',
          'Omit<UserEntity, "passwordHash"> kullanmak (Denylist yaklaşımı)',
          'Partial<UserEntity> kullanmak',
          'Record<string, any> döndürmek',
        ],
        correctIndex: 0,
        explanation:
          'Pick (allowlist) yaklaşımında yalnızca açıkça izin verilen alanlar dışarı çıkar. Yarın tabloya yeni bir gizli kolon eklense bile otomatik olarak API cevabına sızmaz.',
        interviewNote:
          'Güvenlik odaklı senior mülakatlarda "Allowlist > Denylist" prensibini DTO ve Drizzle select() kolon seçimiyle ilişkilendirerek anlatın.',
      },
      {
        id: 'l1-ts-3',
        kind: 'code_write',
        title: 'Kod Yaz: Safe Error Narrowing',
        xp: 25,
        prompt:
          'unknown tipindeki hatayı güvenli şekilde string mesaja çeviren getErrorMessage(err: unknown): string fonksiyonunu yazın. Error instance ise err.message, değilse "Bilinmeyen hata" döndürsün.',
        language: 'typescript',
        starterCode: `export function getErrorMessage(err: unknown): string {\n  // TODO: instanceof Error kontrolü ile daraltma yapın\n}`,
        placeholder: `if (err instanceof Error) return err.message;\nreturn 'Bilinmeyen hata';`,
        hint: 'err instanceof Error kontrolünü yapıp true ise err.message döndürün.',
        solution: `export function getErrorMessage(err: unknown): string {\n  if (err instanceof Error) {\n    return err.message;\n  }\n  return 'Bilinmeyen hata';\n}`,
        quickTokens: ['if (err instanceof Error)', 'return err.message;', "return 'Bilinmeyen hata';"],
        requiredGroups: [
          ['err\\s*:\\s*unknown'],
          ['instanceof\\s+Error'],
          ['err\\.message'],
          ['return'],
        ],
        forbiddenPatterns: [':\\s*any\\b', 'as\\s+any\\b'],
        testCases: [
          {
            label: 'Test 1 — Error nesnesi',
            input: `getErrorMessage(new Error('DB timeout'))`,
            expectedOutput: `'DB timeout'`,
          },
          {
            label: 'Test 2 — Bilinmeyen obje',
            input: `getErrorMessage({ code: 500 })`,
            expectedOutput: `'Bilinmeyen hata'`,
          },
        ],
        explanation:
          'TypeScript strict modda catch (err) bloğu err değişkenini unknown olarak verir. instanceof Error kontrolü any kullanmadan güvenli erişim sağlar.',
      },
    ],
  },
  {
    id: 'l1-sql-core',
    level: 1,
    order: 3,
    topic: 'sql',
    title: 'SQL & İlişkisel Veritabanı Temelleri',
    subtitle: 'JOIN farkları, GROUP BY, HAVING ve B-Tree Index temelleri.',
    durationMin: 10,
    steps: [
      {
        id: 'l1-sql-1',
        kind: 'concept',
        title: 'SQL Mantıksal Çalışma Sırası',
        xp: 15,
        body: 'SQL yazım sırası (SELECT ... FROM ... WHERE) ile veritabanının çalışma sırası farklıdır. Motor önce FROM ve JOIN ile satırları birleştirir, WHERE ile filtreler, GROUP BY ile gruplar, HAVING ile grupları eler, en son SELECT ve ORDER BY uygular.',
        keyPoints: [
          'WHERE satırları gruplamadan önce, HAVING gruplamadan sonra filtreler.',
          'LEFT JOIN sağ tabloda eşleşme olmasa bile sol tablodaki satırı NULL ile korur.',
          'WHERE kolonunda fonksiyon kullanmak (ör. LOWER(email)) standart B-Tree index’i devre dışı bırakabilir.',
        ],
        code: `SELECT u.id, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id
HAVING COUNT(o.id) >= 2
ORDER BY order_count DESC;`,
        codeLanguage: 'sql',
        ioExample: {
          label: 'Gruplama Akışı',
          input: 'users (100 satır) + orders (450 satır)',
          expectedOutput: 'En az 2 siparişi olan kullanıcılar (azalan sırada)',
        },
        interviewNote:
          'Mülakatta "LEFT JOIN yapıp sağ tablo kolonunu WHERE içine koyarsan ne olur?" sorusu klasik bir tuzaktır: WHERE sağ tablodaki NULL satırları elediği için LEFT JOIN fiilen INNER JOIN’e dönüşür! Filtre ON koşuluna konmalıdır.',
      },
      {
        id: 'l1-sql-2',
        kind: 'sql_write',
        title: 'SQL Yaz: Aktif Müşteri Sipariş Toplamı',
        xp: 30,
        prompt:
          'orders tablosunda status değeri \'paid\' olan siparişleri user_id bazında gruplayın. Toplam tutarı (SUM(amount)) 500’den büyük olan kullanıcıların user_id ve total_spent kolonlarını getiren SQL sorgusunu yazın.',
        tables: [
          {
            tableName: 'orders',
            columns: ['id', 'user_id', 'status', 'amount'],
            rows: [
              ['1', 'u1', 'paid', '300'],
              ['2', 'u1', 'paid', '450'],
              ['3', 'u2', 'cancelled', '900'],
              ['4', 'u3', 'paid', '200'],
            ],
          },
        ],
        expectedTable: {
          tableName: 'EXPECTED OUTPUT',
          columns: ['user_id', 'total_spent'],
          rows: [['u1', '750']],
        },
        starterSql: `SELECT user_id, SUM(amount) AS total_spent\nFROM orders\n-- WHERE, GROUP BY ve HAVING ekleyin`,
        hint: "WHERE status = 'paid' ile önce ödenmiş siparişleri filtreleyin, ardından GROUP BY user_id ve HAVING SUM(amount) > 500 ekleyin.",
        solution: `SELECT user_id, SUM(amount) AS total_spent\nFROM orders\nWHERE status = 'paid'\nGROUP BY user_id\nHAVING SUM(amount) > 500;`,
        quickTokens: [
          "WHERE status = 'paid'",
          'GROUP BY user_id',
          'HAVING SUM(amount) > 500',
          'ORDER BY total_spent DESC',
        ],
        requiredGroups: [
          ['select\\s+user_id'],
          ['sum\\s*\\(\\s*amount\\s*\\)'],
          ['from\\s+orders'],
          ["where\\s+status\\s*=\\s*'paid'"],
          ['group\\s+by\\s+user_id'],
          ['having\\s+(sum\\s*\\(\\s*amount\\s*\\)|total_spent)\\s*>\\s*500'],
        ],
        explanation:
          'Önce WHERE status = \'paid\' ile iptal edilmiş siparişler elenir (u2 gider). Sonra GROUP BY user_id toplamı hesaplar (u1=750, u3=200). HAVING SUM(amount) > 500 yalnızca u1’i döndürür.',
        interviewNote:
          'PostgreSQL’de SELECT alias’ı (total_spent) HAVING içinde doğrudan kullanılamaz; standart SQL’de HAVING SUM(amount) > 500 yazmak taşınabilir ve hatasızdır.',
      },
    ],
  },
  {
    id: 'l1-drizzle-intro',
    level: 1,
    order: 4,
    topic: 'drizzle',
    title: 'Drizzle ORM Çekirdeği',
    subtitle: 'SQL-first şema tanımı, $inferSelect ve parametreli güvenli sorgular.',
    durationMin: 9,
    steps: [
      {
        id: 'l1-drz-1',
        kind: 'concept',
        title: 'Neden Drizzle ORM?',
        xp: 15,
        body: 'Drizzle, "SQL biliyorsan Drizzle biliyorsun" felsefesiyle çalışan, ek Rust binary engine veya ağır codegen gerektirmeyen sıfır-yük (lightweight) bir TypeScript ORM’dir. Şema doğrudan TypeScript ile yazılır ve tüm sorgular parametreli (SQL Injection’a karşı güvenli) SQL’e derlenir.',
        keyPoints: [
          'pgTable() ile PostgreSQL tablosu ve constraint’ler doğrudan TS içinde tanımlanır.',
          'typeof users.$inferSelect ile tablodan birebir TypeScript tipi üretilir.',
          'eq(), and(), ilike() gibi operatörler değerleri otomatik bind parameter ($1, $2) yapar.',
        ],
        code: `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Üretilen SQL & Parametre Sınırı',
          input: `db.select({ id: users.id }).from(users).where(eq(users.email, email))`,
          expectedOutput: `SQL: SELECT "id" FROM "users" WHERE "email" = $1 | Params: [email]`,
        },
        interviewNote:
          'Mülakatta Drizzle vs Prisma sorulduğunda: Drizzle SQL’e 1-1 yakın olduğu için N+1 ve karmaşık JOIN/CTE sorgularında tam kontrol verir, cold-start süresi çok düşüktür.',
      },
      {
        id: 'l1-drz-2',
        kind: 'code_write',
        title: 'Drizzle Yaz: Tip-Güvenli Kullanıcı Sorgusu',
        xp: 25,
        prompt:
          'users tablosundan yalnızca id ve email kolonlarını seçip, email kolonu targetEmail değerine eşit olan satırları getiren Drizzle sorgusunu yazın.',
        language: 'drizzle',
        starterCode: `const rows = await db\n  .select({ id: users.id, email: users.email })\n  // TODO: .from() ve .where(eq(...)) ekleyin`,
        placeholder: `.from(users)\n.where(eq(users.email, targetEmail));`,
        hint: '.from(users) ardından .where(eq(users.email, targetEmail)) zincirini ekleyin.',
        solution: `const rows = await db\n  .select({ id: users.id, email: users.email })\n  .from(users)\n  .where(eq(users.email, targetEmail));`,
        quickTokens: ['.from(users)', '.where(', 'eq(users.email, targetEmail)', ');'],
        requiredGroups: [
          ['\\.select\\s*\\('],
          ['\\.from\\s*\\(\\s*users\\s*\\)'],
          ['\\.where\\s*\\('],
          ['eq\\s*\\(\\s*users\\.email\\s*,\\s*targetEmail\\s*\\)'],
        ],
        forbiddenPatterns: ['\\$\\{.*targetEmail', 'sql\\.raw'],
        testCases: [
          {
            label: 'Test 1 — Parametreli SQL',
            input: `targetEmail = "ali@kodex.dev"`,
            expectedOutput: `SELECT "id", "email" FROM "users" WHERE "email" = $1`,
          },
          {
            label: 'Test 2 — Injection koruması',
            input: `targetEmail = "' OR 1=1 --"`,
            expectedOutput: 'Değer $1 parametresi olarak bağlanır, sorgu yapısı bozulmaz',
          },
        ],
        explanation:
          'Açık kolon seçimi (.select({ id, email })) gereksiz veri transferini ve hassas alan sızıntısını önler; eq() operatörü değeri güvenli parametreye bağlar.',
      },
    ],
  },
];

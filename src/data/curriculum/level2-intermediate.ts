import { ModuleItem } from './types';

export const LEVEL2_MODULES: ModuleItem[] = [
  {
    id: 'l2-nodejs-perf',
    level: 2,
    order: 5,
    topic: 'nodejs',
    title: 'Node.js Streams, Worker Threads & Shutdown',
    subtitle: 'Backpressure yönetimi, CPU işleri ve Graceful Shutdown.',
    durationMin: 10,
    steps: [
      {
        id: 'l2-node-1',
        kind: 'concept',
        title: '10 GB Dosyayı RAM Patlatmadan İşlemek',
        xp: 20,
        body: 'fs.readFile tüm dosyayı tek seferde RAM’e yükler ve büyük dosyalarda OOM (Out of Memory) çökmesine yol açar. Node.js Streams + stream/promises pipeline() kullanarak veriyi küçük chunk’lar halinde okur, backpressure’ı otomatik yönetir ve hata durumunda tüm stream’leri temiz kapatırsınız.',
        keyPoints: [
          'pipeline(readable, transform, writable) bellek sızıntısını ve hata yutulmasını önler.',
          'Worker Threads: aynı process içinde paylaşılan bellek ile CPU-yoğun işler (kripto, PDF, görüntü).',
          'Cluster / PM2 / Kubernetes: çoklu çekirdekte HTTP yükünü dağıtmak için bağımsız process’ler.',
          'SIGTERM geldiğinde server.close() + DB pool.end() ile mevcut istekler bitirilip temiz kapanılır.',
        ],
        code: `import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('logs.ndjson'),
  createGzip(),
  createWriteStream('logs.ndjson.gz')
);`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Bellek Profili (10 GB Dosya)',
          input: 'readFile() vs pipeline(createReadStream)',
          expectedOutput: 'readFile -> OOM Crash | pipeline -> Sabit ~30-60 MB RAM',
        },
        interviewNote:
          'Neden .pipe() yerine pipeline() kullanılır? .pipe() hata olaylarını (error event) otomatik iletmez ve hata durumunda stream’leri yok etmediği için memory leak oluşturur.',
      },
      {
        id: 'l2-node-2',
        kind: 'multiple_choice',
        title: 'Worker Threads vs Cluster Kararı',
        xp: 25,
        prompt:
          'Bir HTTP API’niz içinde kullanıcıların yüklediği CSV dosyalarını ağır bir algoritma ile analiz ediyorsunuz. Event Loop gecikmesini (p99 latency) artırmamak için hangi mimari seçilmelidir?',
        options: [
          'CPU-yoğun analizi Worker Thread pool’a (veya ayrı bir job queue worker’ına) aktarmak',
          'İşlemi Promise.all() içine almak',
          'async/await ekleyerek Event Loop’u rahatlatmak',
          'setTimeout(fn, 0) ile parçalara bölmeden çalıştırmak',
        ],
        correctIndex: 0,
        explanation:
          'async/await ve Promise.all CPU-yoğun senkron kodu paralel yapmaz; hâlâ aynı ana thread’i meşgul eder. Gerçek CPU paralelliği için Worker Threads veya ayrı bir queue worker (BullMQ vb.) gerekir.',
        interviewNote:
          'Production sistemlerde uzun süren CPU işlerini HTTP request-response döngüsünden tamamen ayırıp 202 Accepted + Queue + Worker modeliyle işlemek en olgun senior yaklaşımdır.',
      },
    ],
  },
  {
    id: 'l2-ts-validation',
    level: 2,
    order: 6,
    topic: 'typescript',
    title: 'İleri TypeScript & Runtime Sınırları',
    subtitle: 'Generics, satisfies ve HTTP sınırında Zod doğrulaması.',
    durationMin: 10,
    steps: [
      {
        id: 'l2-ts-1',
        kind: 'concept',
        title: 'Compile-Time Tip vs Runtime Doğrulama',
        xp: 20,
        body: 'HTTP isteği JSON olarak geldiğinde TypeScript’in req.body as CreateUserDto yazımı hiçbir çalışma zamanı kontrolü yapmaz. Güvenilir bir backend’de sınır kapısında (controller/route) Zod gibi bir şema ile runtime doğrulama yapılır ve TS tipi şemadan (z.infer) türetilir.',
        keyPoints: [
          'Tek doğruluk kaynağı (Single Source of Truth): Zod şemasından TS tipi üretilir.',
          'as tip zorlaması (type assertion) derleyiciye yalan söylemektir; yalnızca kanıtlanmış durumlarda kullanılır.',
          'satisfies operatörü literal tipi kaybetmeden yapısal uyumluluğu doğrular.',
        ],
        code: `import { z } from 'zod';

const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
});

type CreateOrderDto = z.infer<typeof CreateOrderSchema>;`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'HTTP Sınır Doğrulaması',
          input: `{ productId: "abc", quantity: -5 }`,
          expectedOutput: '400 Bad Request + alan bazlı doğrulama hataları',
        },
        interviewNote:
          'Senior mülakatlarda "Parse, don’t validate" prensibinden bahsedin: Doğrulamadan geçen veri artık ham unknown değil, kesin tipli bir Domain DTO’dur.',
      },
      {
        id: 'l2-ts-2',
        kind: 'output_predict',
        title: 'Çıktı & Tip Analizi: satisfies Operatörü',
        xp: 25,
        prompt:
          'Aşağıdaki iki tanım arasındaki farkı seçin: configA: Record<string, number> vs configB satisfies Record<string, number>',
        code: `const configA: Record<string, number> = { port: 3000 };
const configB = { port: 3000 } satisfies Record<string, number>;

const p1 = configA.port; // tipi: number (configA.typo da hata vermez!)
const p2 = configB.port; // tipi: ?`,
        codeLanguage: 'typescript',
        options: [
          'configB.port tipi number olur ve configB.typo derleme hatası verir',
          'configB.port tipi any olur',
          'configB runtime’da Object.freeze() uygular',
          'İki tanım arasında hiçbir fark yoktur',
        ],
        correctIndex: 0,
        explanation:
          'satisfies, nesnenin Record<string, number> sözleşmesine uyduğunu doğrular ama anahtarların kesin bilgisini ("port") silmez. Böylece configB.typo anında derleme hatası verir.',
      },
    ],
  },
  {
    id: 'l2-sql-advanced',
    level: 2,
    order: 7,
    topic: 'sql',
    title: 'İleri PostgreSQL: CTE, Window & Locks',
    subtitle: 'ROW_NUMBER(), Partitioning, ACID Transactions ve FOR UPDATE.',
    durationMin: 12,
    steps: [
      {
        id: 'l2-sql-1',
        kind: 'concept',
        title: 'Window Functions & Yarış Durumu (Race Condition)',
        xp: 20,
        body: 'GROUP BY satırları tek satıra sıkıştırırken, Window Functions (OVER (PARTITION BY ... ORDER BY ...)) her satırı koruyarak sıralama, kümülatif toplam veya en son kaydı bulma imkanı verir. Yüksek eşzamanlı stok/bakiye güncellemelerinde ise SELECT ... FOR UPDATE satır kilidi ile lost update önlenir.',
        keyPoints: [
          'ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) her kullanıcının son siparişini bulur.',
          'Atomic UPDATE: UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND balance >= $1.',
          'Deadlock önlemek için birden fazla satırı kilitlerken her zaman aynı ID sırasıyla (ORDER BY id) kilitleyin.',
        ],
        code: `WITH ranked_orders AS (
  SELECT id, user_id, amount,
         ROW_NUMBER() OVER (
           PARTITION BY user_id
           ORDER BY created_at DESC
         ) AS rn
  FROM orders
)
SELECT id, user_id, amount
FROM ranked_orders
WHERE rn = 1;`,
        codeLanguage: 'sql',
        ioExample: {
          label: 'Kullanıcı Başına En Son Sipariş',
          input: 'orders (her kullanıcıda N sipariş)',
          expectedOutput: 'Her user_id için yalnızca rn = 1 olan en güncel sipariş',
        },
        interviewNote:
          'Mülakatta "İki istek aynı anda cüzdandan 100 TL çekmeye çalışırsa ne olur?" sorusuna hem Pessimistic Lock (SELECT ... FOR UPDATE) hem de Atomic Conditional Update çözümlerini verin.',
      },
      {
        id: 'l2-sql-2',
        kind: 'sql_write',
        title: 'SQL Yaz: Atomic Bakiye Düşümü',
        xp: 35,
        prompt:
          'wallets tablosunda id = 10 olan kullanıcının bakiyesinden 250 birim düşen, ancak bakiye 250’den küçükse güncelleme yapmayan (negatif bakiye engelleyen) atomic UPDATE sorgusunu yazın ve güncel balance değerini RETURNING ile döndürün.',
        tables: [
          {
            tableName: 'wallets',
            columns: ['id', 'balance'],
            rows: [
              ['10', '400'],
              ['11', '100'],
            ],
          },
        ],
        expectedTable: {
          tableName: 'EXPECTED OUTPUT',
          columns: ['balance'],
          rows: [['150']],
        },
        starterSql: `UPDATE wallets\nSET balance = balance - 250\n-- WHERE koşulu ve RETURNING ekleyin`,
        hint: 'WHERE id = 10 AND balance >= 250 koşulunu ve sonuna RETURNING balance ekleyin.',
        solution: `UPDATE wallets\nSET balance = balance - 250\nWHERE id = 10 AND balance >= 250\nRETURNING balance;`,
        quickTokens: [
          'WHERE id = 10',
          'AND balance >= 250',
          'RETURNING balance;',
        ],
        requiredGroups: [
          ['update\\s+wallets'],
          ['set\\s+balance\\s*=\\s*balance\\s*-\\s*250'],
          ['where\\s+.*id\\s*=\\s*10'],
          ['balance\\s*>=\\s*250'],
          ['returning\\s+balance'],
        ],
        explanation:
          'PostgreSQL bu UPDATE sırasında ilgili satır üzerinde otomatik row-level lock alır. Eşzamanlı ikinci istek bekler ve yeni balance >= 250 koşulu sağlanmazsa 0 satır güncellenir; negatif bakiye asla oluşmaz.',
      },
    ],
  },
  {
    id: 'l2-drizzle-advanced',
    level: 2,
    order: 8,
    topic: 'drizzle',
    title: 'Drizzle ORM: Transactions, mapWith & Migrations',
    subtitle: 'tx handle kuralı, count(*) runtime tuzağı ve generate vs push.',
    durationMin: 11,
    steps: [
      {
        id: 'l2-drz-1',
        kind: 'concept',
        title: 'Senior Drizzle Tuzakları',
        xp: 20,
        body: 'Drizzle production mülakatlarında üç kritik nokta ölçülür: (1) db.transaction(async (tx) => ...) içinde mutlaka db yerine tx handle’ı kullanılmalıdır; yoksa sorgu transaction dışında çalışır. (2) PostgreSQL COUNT(*) sürücüden string döner; sql<number> sadece derleyiciye ipucu verir, gerçek dönüşüm için .mapWith(Number) şarttır. (3) Production’da drizzle-kit push değil, incelenmiş SQL migration dosyaları (generate + migrate) kullanılır.',
        keyPoints: [
          'db.transaction(async (tx) => ...) içinde tüm sorgular tx üzerinden gitmeli.',
          'sql<number>`count(*)`.mapWith(Number) ile runtime tip tutarlılığı sağlanır.',
          'drizzle-kit push geliştirme içindir; production’da versiyonlanmış migration geçmişi gerekir.',
        ],
        code: `await db.transaction(async (tx) => {
  await tx.update(wallets)
    .set({ balance: sql\`\${wallets.balance} - \${amount}\` })
    .where(and(eq(wallets.id, fromId), gte(wallets.balance, amount)));

  await tx.insert(ledgerEntries).values({
    walletId: fromId,
    delta: -amount,
  });
});`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Transaction Atomikliği',
          input: 'ledgerEntries.insert() hata fırlatır',
          expectedOutput: 'wallets.update() otomatik ROLLBACK edilir; veri tutarlı kalır',
        },
        interviewNote:
          'Bir transaction callback’i içinde yanlışlıkla global `db.insert(...)` çağırırsanız o sorgu farklı bir connection’dan gider ve dış transaction rollback olsa bile geri alınmaz!',
      },
      {
        id: 'l2-drz-2',
        kind: 'output_predict',
        title: 'Tuzak Soru: sql<number>`count(*)`',
        xp: 25,
        prompt:
          'PostgreSQL + node-postgres (pg) sürücüsünde aşağıdaki Drizzle sorgusunun runtime’da döndürdüğü typeof row.total değeri nedir?',
        code: `const [row] = await db
  .select({ total: sql<number>\`count(*)\` })
  .from(users);

console.log(typeof row.total);`,
        codeLanguage: 'typescript',
        options: [
          '"string" — çünkü sql<number> sadece compile-time tip ipucudur, runtime dönüşüm yapmaz',
          '"number" — çünkü Drizzle generic tipi runtime’da otomatik cast eder',
          '"bigint" — çünkü PostgreSQL her zaman BigInt nesnesi döndürür',
          '"undefined" — çünkü alias verilmemiştir',
        ],
        correctIndex: 0,
        explanation:
          'PostgreSQL COUNT(*) sonucu BIGINT’tir ve pg sürücüsü JS hassasiyet kaybını önlemek için string döndürür. sql<number> runtime’da silinir; sayıya çevirmek için .mapWith(Number) eklenmelidir.',
        interviewNote:
          'Çok büyük tablolarda (> 2^53) Number() hassasiyet kaybeder; bu yüzden gerçekten büyük sayılarda string/BigInt korumak bilinçli bir mühendislik kararıdır.',
      },
      {
        id: 'l2-drz-3',
        kind: 'code_write',
        title: 'Drizzle Yaz: Güvenli Transaction Transferi',
        xp: 30,
        prompt:
          'db.transaction kullanarak önce tx ile auditLogs tablosuna kayıt atan bir transaction bloğu yazın. Global db değil tx handle’ı kullanıldığından emin olun.',
        language: 'drizzle',
        starterCode: `export async function createAuditInTx(userId: string) {\n  // TODO: db.transaction(async (tx) => { ... }) yazın\n}`,
        placeholder: `await db.transaction(async (tx) => {\n  await tx.insert(auditLogs).values({ userId });\n});`,
        hint: 'await db.transaction(async (tx) => { await tx.insert(auditLogs).values({ userId }); });',
        solution: `export async function createAuditInTx(userId: string) {\n  await db.transaction(async (tx) => {\n    await tx.insert(auditLogs).values({ userId });\n  });\n}`,
        quickTokens: [
          'await db.transaction(async (tx) => {',
          'await tx.insert(auditLogs)',
          '.values({ userId });',
          '});',
        ],
        requiredGroups: [
          ['db\\.transaction\\s*\\(\\s*async\\s*\\(\\s*tx\\s*\\)'],
          ['tx\\.insert\\s*\\(\\s*auditLogs\\s*\\)'],
          ['\\.values\\s*\\('],
        ],
        forbiddenPatterns: ['db\\.insert\\s*\\('],
        testCases: [
          {
            label: 'Test 1 — Doğru connection handle',
            input: `createAuditInTx('usr_1')`,
            expectedOutput: 'BEGIN -> INSERT INTO audit_logs -> COMMIT (aynı tx üzerinden)',
          },
        ],
        explanation:
          'tx handle’ı kullanmak tüm sorguların aynı PostgreSQL connection ve transaction sınırı içinde yürütülmesini garanti eder.',
      },
    ],
  },
];

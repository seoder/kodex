import { ModuleItem } from './types';

export const LEVEL3_MODULES: ModuleItem[] = [
  {
    id: 'l3-clean-arch',
    level: 3,
    order: 9,
    topic: 'architecture',
    title: 'Clean Architecture & Dosya Düzeni',
    subtitle: 'Katmanlı yapı, Dependency Inversion ve Drizzle’ı izole etmek.',
    durationMin: 12,
    steps: [
      {
        id: 'l3-arch-1',
        kind: 'concept',
        title: 'Production Node.js + TS + Drizzle Klasör Düzeni',
        xp: 25,
        body: 'Ölçeklenebilir bir backend’de klasör düzeni iş kurallarını framework ve veritabanından bağımsız tutar. Bağımlılıklar her zaman dıştan içe (interfaces -> application -> domain) akar. Domain katmanı ne Express/Fastify’ı ne de Drizzle ORM’i tanır.',
        keyPoints: [
          'domain/: Saf iş kuralları, Entity tipleri, Repository arayüzleri (interface). Sıfır dış kütüphane.',
          'application/: Use-Case’ler (CreateOrderUseCase). İş akışını koordine eder, interface üzerinden repo çağırır.',
          'infrastructure/: Drizzle repository implementasyonları, DB pool, Redis, dış API istemcileri.',
          'interfaces/ (presentation): HTTP route/controller, Zod request validation, DTO mapper.',
        ],
        code: `src/
├── modules/
│   └── orders/
│       ├── domain/
│       │   ├── order.entity.ts
│       │   └── order.repository.ts       # Sadece interface
│       ├── application/
│       │   └── create-order.usecase.ts   # İş akışı (DI ile repo alır)
│       ├── infrastructure/
│       │   └── drizzle-order.repo.ts     # Drizzle SQL implementasyonu
│       └── interfaces/
│           ├── order.controller.ts       # HTTP + Zod parse
│           └── order.routes.ts
├── shared/
│   ├── db/ (schema.ts, client.ts, migrations/)
│   ├── errors/ (app-error.ts)
│   └── config/ (env.ts)
└── server.ts`,
        codeLanguage: 'text',
        ioExample: {
          label: 'Bağımlılık Yönü (Dependency Rule)',
          input: 'HTTP POST /orders -> Controller -> UseCase -> IOrderRepository',
          expectedOutput: 'DrizzleOrderRepo runtime’da inject edilir; UseCase DB olmadan 2ms’de unit test edilir',
        },
        interviewNote:
          'Mülakatta "Neden doğrudan controller içinde db.insert() çağırmıyoruz?" sorusuna: "İş kuralları HTTP’ye yapışırsa CLI/Queue worker aynı kuralı yeniden kullanamaz, unit test için gerçek DB gerekir ve şema değişikliği tüm route’ları kırar" cevabını verin.',
      },
      {
        id: 'l3-arch-2',
        kind: 'architecture_sort',
        title: 'Mimari Yerleştirme: Hangi Dosya Hangi Katmana?',
        xp: 35,
        prompt:
          'Bir e-ticaret ödeme modülündeki 4 dosyayı doğru Clean Architecture katmanına yerleştirin.',
        scenario: 'Node.js + Fastify + TypeScript + Drizzle ORM + PostgreSQL servisi',
        items: [
          {
            id: 'item-1',
            label: 'drizzle-payment.repo.ts',
            detail: 'db.insert(payments) ve SQL sorgularını çalıştırır',
          },
          {
            id: 'item-2',
            label: 'payment.controller.ts',
            detail: 'req.body’yi Zod ile parse edip HTTP 201 döndürür',
          },
          {
            id: 'item-3',
            label: 'charge-order.usecase.ts',
            detail: 'İdempotency kontrolü yapıp ödeme akışını orkestre eder',
          },
          {
            id: 'item-4',
            label: 'money.value-object.ts',
            detail: 'Negatif tutar ve kuruş yuvarlama kuralını korur (saf TS)',
          },
        ],
        layers: [
          { id: 'domain', name: 'domain/', description: 'Saf iş kuralları & arayüzler' },
          { id: 'application', name: 'application/', description: 'Use-case orkestrasyonu' },
          { id: 'infrastructure', name: 'infrastructure/', description: 'Drizzle, DB, Redis, harici SDK' },
          { id: 'interfaces', name: 'interfaces/', description: 'HTTP routes, controllers, Zod' },
        ],
        expectedMapping: {
          'item-1': 'infrastructure',
          'item-2': 'interfaces',
          'item-3': 'application',
          'item-4': 'domain',
        },
        explanation:
          'money.value-object.ts hiçbir dış kütüphaneye bağlı değildir (domain/). charge-order.usecase.ts akışı yönetir (application/). drizzle-payment.repo.ts veritabanı detayıdır (infrastructure/). payment.controller.ts HTTP sınırıdır (interfaces/).',
      },
    ],
  },
  {
    id: 'l3-zero-downtime',
    level: 3,
    order: 10,
    topic: 'architecture',
    title: 'Zero-Downtime Migrations & Multi-Tenancy',
    subtitle: 'Expand-Backfill-Constrain stratejisi ve tenant_id izolasyonu.',
    durationMin: 11,
    steps: [
      {
        id: 'l3-zd-1',
        kind: 'concept',
        title: 'Kesintisiz Şema Değişikliği (Expand-Backfill-Constrain)',
        xp: 25,
        body: 'Aktif trafik alan bir tabloya doğrudan NOT NULL yeni bir kolon eklemek veya kolon adını RENAME etmek, eski uygulama instance’larının yazma sorgularını anında kırar. Senior yaklaşım 3 fazlı Expand-Backfill-Constrain desenidir.',
        keyPoints: [
          '1. EXPAND: Yeni kolonu nullable ekle; hem eski hem yeni kodun çalışacağı dual-write başlat.',
          '2. BACKFILL: Geçmiş satırları küçük batch’ler (ör. 1000’er satır) halinde kilitlemeden doldur.',
          '3. CONSTRAIN: Veri tutarlılığı doğrulandıktan sonra NOT NULL / INDEX (CONCURRENTLY) ekle ve eski kodu emekli et.',
          'Multi-tenant sistemlerde parametreli sorgu yetmez; her WHERE koşulunda tenant_id zorunlu olmalıdır.',
        ],
        code: `-- 1. Expand (tablo kilitlemez)
ALTER TABLE users ADD COLUMN normalized_email TEXT;

-- 2. Non-blocking Index (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_norm_email
ON users (tenant_id, normalized_email);`,
        codeLanguage: 'sql',
        ioExample: {
          label: 'Rolling Deployment Güvenliği',
          input: 'v1 ve v2 container’ları 5 dakika paralel çalışır',
          expectedOutput: '0 hata (500 yok), tablo erişim kilidi (ACCESS EXCLUSIVE) oluşmaz',
        },
        interviewNote:
          'PostgreSQL’de büyük bir tabloda CREATE INDEX (CONCURRENTLY olmadan) yazmaları bloklar. CONCURRENTLY anahtar kelimesini bilmek gerçek production tecrübesi işaretidir.',
      },
      {
        id: 'l3-zd-2',
        kind: 'multiple_choice',
        title: 'Multi-Tenant Güvenlik İncelemesi',
        xp: 25,
        prompt:
          'Bir B2B SaaS uygulamasında GET /invoices/:id endpoint’i Drizzle ile eq(invoices.id, invoiceId) sorgusu atıyor. Parametreli olduğu için SQL Injection yok. Bu kodda hâlâ hangi kritik güvenlik açığı (IDOR) mevcuttur?',
        options: [
          'tenant_id filtresi eksiktir; başka bir şirketin fatura ID’sini bilen kullanıcı o faturayı okuyabilir',
          'eq() yerine ilike() kullanılmalıdır',
          'SELECT * yerine LIMIT 1 eklenirse sorun tamamen çözülür',
          'TypeScript string tipi olduğu için IDOR oluşmaz',
        ],
        correctIndex: 0,
        explanation:
          'SQL Injection koruması yetkilendirme (authorization) değildir. Multi-tenant her sorguda and(eq(invoices.id, invoiceId), eq(invoices.tenantId, ctx.tenantId)) zorunlu olmalı veya PostgreSQL Row-Level Security (RLS) kullanılmalıdır.',
      },
    ],
  },
  {
    id: 'l3-system-design',
    level: 3,
    order: 11,
    topic: 'architecture',
    title: 'Sistem Tasarımı: Idempotency, Cache & Pooling',
    subtitle: 'Çift ödeme engelleme, PgBouncer, Outbox Pattern ve p99 optimizasyonu.',
    durationMin: 12,
    steps: [
      {
        id: 'l3-sd-1',
        kind: 'concept',
        title: 'Idempotency Key & Transactional Outbox',
        xp: 25,
        body: 'Mobil ağlarda timeout sonrası client aynı POST /payments isteğini 2 kez gönderebilir. Idempotency-Key header’ı unique index ile saklanarak aynı isteğin ikinci kez tahsilat yapması önlenir. Veritabanına yazıp ardından Kafka/RabbitMQ’ya event basarken çift yazma (dual-write) tutarsızlığını önlemek için Transactional Outbox kullanılır.',
        keyPoints: [
          'Idempotency Key: Aynı anahtar gelirse yeni işlem yapma, kaydedilmiş ilk cevabı döndür.',
          'Connection Pooling: 20 Node.js pod × 20 pool = 400 bağlantı PostgreSQL’i yorar; araya PgBouncer (transaction mode) konur.',
          'Transactional Outbox: İş kaydı + outbox event’i aynı DB transaction’ında yazılır; ayrı relay worker event’i yayınlar.',
        ],
        code: `await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders)
    .values({ idempotencyKey, amount, userId })
    .onConflictDoNothing({ target: orders.idempotencyKey })
    .returning();

  if (!order) return; // Daha önce işlenmiş istek

  await tx.insert(outboxEvents).values({
    type: 'ORDER_CREATED',
    payload: { orderId: order.id },
  });
});`,
        codeLanguage: 'typescript',
        ioExample: {
          label: 'Ağ Timeout + Retry Senaryosu',
          input: 'Aynı Idempotency-Key ile 2 paralel POST /orders',
          expectedOutput: 'Yalnızca 1 sipariş ve 1 outbox eventi oluşur; çift çekim sıfır',
        },
        interviewNote:
          'Mülakatta "DB’ye yazdım, tam Kafka’ya event basarken sunucu çöktü, ne yaparsın?" sorusunun altın standart cevabı Transactional Outbox Pattern’dir.',
      },
      {
        id: 'l3-sd-2',
        kind: 'multiple_choice',
        title: 'Yüksek Trafikte Connection Pool Darboğazı',
        xp: 25,
        prompt:
          'Kubernetes’te 40 Node.js replica’nız var ve her biri PostgreSQL’e 25 bağlantı açıyor (toplam 1000 bağlantı). Veritabanı CPU’su %95’e fırladı ve sorgular yavaşladı. İlk mimari hamleniz ne olur?',
        options: [
          'Uygulama pool boyutunu düşürüp araya Transaction-mode PgBouncer koymak',
          'PostgreSQL max_connections değerini 5000’e çıkarmak',
          'Her HTTP isteğinde yeni pg.Client() açıp kapatmak',
          'Tüm sorguları setTimeout ile geciktirmek',
        ],
        correctIndex: 0,
        explanation:
          'PostgreSQL’de her bağlantı ayrı bir OS process’idir ve bellek + context-switch maliyeti yüksektir. max_connections’ı körü körüne artırmak durumu kötüleştirir; PgBouncer (transaction pooling) yüzlerce uygulama bağlantısını küçük sayıda aktif DB bağlantısında çoklar.',
      },
    ],
  },
  {
    id: 'l3-senior-defense',
    level: 3,
    order: 12,
    topic: 'architecture',
    title: 'Senior Kod İnceleme & Mülakat Savunması',
    subtitle: 'N+1 tespiti, memory leak teşhisi ve mimari trade-off sunumu.',
    durationMin: 10,
    steps: [
      {
        id: 'l3-def-1',
        kind: 'code_write',
        title: 'Senior Refactor: N+1 Sorgusunu Tek Sorguya İndir',
        xp: 35,
        prompt:
          'Aşağıdaki kod her kullanıcı için döngüde ayrı SQL sorgusu atıyor (N+1 problemi). Drizzle `inArray` operatörü kullanarak tüm userIds listesini TEK sorguda getiren refactored kodu yazın.',
        language: 'drizzle',
        starterCode: `// KÖTÜ (N+1): for (const id of userIds) { await db.select().from(orders).where(eq(orders.userId, id)); }\n\nexport async function getOrdersForUsers(userIds: string[]) {\n  // TODO: inArray kullanarak tek sorguda döndürün\n}`,
        placeholder: `if (userIds.length === 0) return [];\nreturn db.select().from(orders).where(inArray(orders.userId, userIds));`,
        hint: 'inArray(orders.userId, userIds) ile tek bir .where() sorgusu yazın; boş dizi kontrolünü unutmayın.',
        solution: `export async function getOrdersForUsers(userIds: string[]) {\n  if (userIds.length === 0) return [];\n  return db\n    .select()\n    .from(orders)\n    .where(inArray(orders.userId, userIds));\n}`,
        quickTokens: [
          'if (userIds.length === 0) return [];',
          'return db.select().from(orders)',
          '.where(inArray(orders.userId, userIds));',
        ],
        requiredGroups: [
          ['\\.select\\s*\\('],
          ['\\.from\\s*\\(\\s*orders\\s*\\)'],
          ['inArray\\s*\\(\\s*orders\\.userId\\s*,\\s*userIds\\s*\\)'],
        ],
        forbiddenPatterns: ['for\\s*\\('],
        testCases: [
          {
            label: 'Test 1 — 100 Kullanıcı',
            input: `getOrdersForUsers([...100 ids])`,
            expectedOutput: '101 sorgu yerine 1 adet WHERE user_id IN ($1, ..., $100)',
          },
          {
            label: 'Test 2 — Boş Dizi Edge Case',
            input: `getOrdersForUsers([])`,
            expectedOutput: '[] (gereksiz DB round-trip yapılmaz)',
          },
        ],
        explanation:
          'Döngü içinde await ile veritabanı sorgusu atmak (N+1) gecikmeyi doğrusal olarak katlar. inArray() veya SQL JOIN ile tek round-trip’e indirmek p99 latency’yi dramatik biçimde düşürür.',
        interviewNote:
          'Boş dizi edge case’ini (userIds.length === 0) kendiliğinden eklemeniz, mülakatçıya production’da gerçek hatalarla karşılaşmış kıdemli bir mühendis olduğunuzu gösterir.',
      },
    ],
  },
];

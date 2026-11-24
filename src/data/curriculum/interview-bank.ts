import { InterviewQuestion } from './types';

export const INTERVIEW_BANK: InterviewQuestion[] = [
  {
    id: 'iq-node-1',
    topic: 'nodejs',
    level: 'Senior',
    question:
      'Production Node.js API’nizde CPU %100 değil ama p99 response süresi 50ms’den 4 saniyeye fırladı. İlk 5 dakikada hangi metrikleri ve araçları kontrol edersiniz?',
    rubricPoints: [
      'Event Loop Lag / Utilization (monitorEventLoopDelay, perf_hooks) ölçümü',
      'Senkron CPU bloklaması (büyük JSON.parse, ReDoS regex) veya libuv thread pool doygunluğu kontrolü',
      'Upstream DB connection pool bekleme süresi ve timeout eksikliği analizi',
      'CPU profile / flamegraph (clinic.js, 0x veya --cpu-prof) alma stratejisi',
    ],
    modelAnswer:
      'Önce Event Loop Lag (ELU) metriğine bakarım. Eğer ELU yüksekse ana thread senkron bir iş (devasa JSON serileştirme, kötü regex veya senkron kripto/fs) tarafından kilitleniyordur; flamegraph ile sıcak fonksiyonu bulurum. ELU düşük ama p99 yüksekse darboğaz I/O tarafındadır: PostgreSQL connection pool kuyruğu, yavaş SQL sorgusu (pg_stat_statements) veya timeout verilmemiş harici HTTP isteği kontrol edilir.',
    trapWarning:
      'Sadece "console.log koyup bakarım" veya "container sayısını artırırım" demek root-cause yaklaşımından uzaktır; yatay ölçekleme DB pool darboğazını daha da büyütür.',
    followUp: 'Memory leak şüphesi varsa production trafiğini düşürmeden nasıl teşhis koyarsınız?',
  },
  {
    id: 'iq-node-2',
    topic: 'nodejs',
    level: 'Mid',
    question:
      'process.nextTick(), Promise.then() ve setImmediate() arasındaki yürütme önceliği nedir? Hangi durumda process.nextTick tehlikelidir?',
    rubricPoints: [
      'process.nextTick kuyruğu Promise microtask kuyruğundan önce boşaltılır',
      'Her ikisi de mevcut faz bitince sonraki Event Loop fazına geçmeden çalışır',
      'setImmediate Check fazında (I/O poll sonrasında) çalışır',
      'Özyinelemeli process.nextTick Event Loop Starvation yaratır ve I/O’yu kilitler',
    ],
    modelAnswer:
      'Senkron kod bitince önce nextTickQueue, hemen ardından Promise microtaskQueue tamamen boşaltılır. setImmediate ise Event Loop’un Check fazında çalışır. Kendi kendini çağıran bir process.nextTick döngüsü Event Loop’un Poll fazına (ağ/dosya I/O) hiç ulaşamamasına neden olur; bu yüzden tekrarlayan ertelemelerde setImmediate tercih edilmelidir.',
    trapWarning:
      'setTimeout(fn, 0) ile setImmediate() ana modülde deterministik sırada değildir; ancak bir I/O callback’i içinde setImmediate her zaman önce çalışır.',
    followUp: 'libuv thread pool boyutu varsayılan olarak kaçtır ve ne zaman artırılmalıdır?',
  },
  {
    id: 'iq-ts-1',
    topic: 'typescript',
    level: 'Senior',
    question:
      'TypeScript projemizde strict: true açık olmasına rağmen production’da `Cannot read properties of undefined` hatası aldık. Bunun en yaygın 3 nedeni nedir?',
    rubricPoints: [
      'Tip sınırında (HTTP JSON, env, external API) runtime doğrulama yapmadan `as Type` kullanmak',
      'noUncheckedIndexedAccess kapalıyken array[i] veya record[key] erişiminin undefined dönmesi',
      'Drizzle/SQL raw sorgularında compile-time generic assertion ile runtime driver çıktısının uyuşmaması',
    ],
    modelAnswer:
      'TypeScript yalnızca derleme zamanı denetimi yapar. En sık 3 neden: (1) req.body veya JSON.parse sonucunu Zod ile parse etmeden `as DTO` ile zorlamak, (2) tsconfig’de `noUncheckedIndexedAccess: true` açık olmadığı için `items[0].id` erişiminin güvenli sanılması, (3) veritabanı/driver’dan gelen nullable veya string dönen değerlerin yanlış tip beyanıyla işaretlenmesi.',
    trapWarning:
      '"Strict mod her hatayı önler" demek yanlış; strict mod yalnızca bilinen tip akışını korur, dış I/O sınırını korumaz.',
    followUp: 'Branded Types (ör. UserId vs OrderId) büyük bir backend’de hangi sınıf hataları önler?',
  },
  {
    id: 'iq-sql-1',
    topic: 'sql',
    level: 'Senior',
    question:
      'PostgreSQL’de 50 milyon satırlık `orders` tablosunda `(tenant_id, created_at)` üzerinde composite B-Tree index var. `WHERE created_at > now() - interval \'7 days\'` sorgusu neden bu index’i kullanmıyor?',
    contextCode: `CREATE INDEX idx_orders_tenant_created
ON orders (tenant_id, created_at DESC);

-- Yavaş sorgu:
SELECT * FROM orders
WHERE created_at > now() - interval '7 days';`,
    rubricPoints: [
      'Leftmost Prefix Rule: Composite B-Tree index önce ilk kolona (tenant_id) göre sıralıdır',
      'İlk kolon filtrelenmeden ikinci kolonda aralık taraması verimsizdir; planner Seq Scan seçebilir',
      'EXPLAIN (ANALYZE, BUFFERS) ile gerçek planı doğrulama',
      'Çözüm: Sorguya tenant_id eklemek veya iş gereksinimine göre (created_at) / partial index tasarlamak',
    ],
    modelAnswer:
      'B-Tree composite index, telefon rehberi gibi önce `tenant_id`, sonra aynı tenant içinde `created_at` sırasıyla dizilir. `tenant_id` verilmediğinde motor tüm index ağacını taramak zorunda kalır ve çoğu durumda Sequential Scan’i daha ucuz bulur. Önce `EXPLAIN (ANALYZE, BUFFERS)` ile doğrularım; eğer sorgu gerçekten tenant-bağımsızsa ayrı bir index veya partitioning (tarih bazlı) değerlendiririm.',
    trapWarning:
      'Index eklemek bedava değildir: Her yeni index INSERT/UPDATE maliyetini ve disk/RAM (shared_buffers) kullanımını artırır.',
    followUp: 'Covering Index (`INCLUDE`) nedir ve Index-Only Scan’i nasıl mümkün kılar?',
  },
  {
    id: 'iq-sql-2',
    topic: 'sql',
    level: 'Staff',
    question:
      'Aynı cüzdandan eşzamanlı iki 100 TL çekim isteği geliyor (bakiye 150 TL). PostgreSQL’in varsayılan `READ COMMITTED` izolasyon seviyesinde nasıl race condition oluşur ve nasıl çözersiniz?',
    rubricPoints: [
      'Read-Modify-Write (önce SELECT balance, sonra JS’de kontrol, sonra UPDATE) klasik TOCTOU açığıdır',
      'Çözüm 1: Tek atomic UPDATE ... SET balance = balance - 100 WHERE id = $1 AND balance >= 100',
      'Çözüm 2: Transaction içinde SELECT ... FOR UPDATE ile satır kilidi',
      'Çözüm 3: Optimistic concurrency (version kolonu) veya SERIALIZABLE + retry döngüsü',
    ],
    modelAnswer:
      'Uygulama katmanında önce SELECT ile 150 okuyup sonra UPDATE atarsak, her iki istek de 150 görür ve bakiye -50’ye düşebilir. En temiz ve yüksek throughput’lu çözüm tek bir atomic conditional UPDATE yazmaktır (`WHERE id = $1 AND balance >= $2 RETURNING balance`). Çok adımlı karmaşık kurallarda `SELECT ... FOR UPDATE` ile satırı kilitleyip transaction içinde güncellerim.',
    trapWarning:
      'Sadece "transaction içine alırım" demek yetmez! READ COMMITTED transaction içinde yapılan normal SELECT satırı kilitlemez; race condition devam eder.',
    followUp: 'A -> B ve B -> A eşzamanlı transferlerinde Deadlock nasıl önlenir?',
  },
  {
    id: 'iq-drizzle-1',
    topic: 'drizzle',
    level: 'Senior',
    question:
      'Drizzle ORM kullanan bir projede production migration stratejiniz nasıl olmalı? `drizzle-kit push` ile `generate + migrate` arasındaki fark nedir?',
    rubricPoints: [
      'push: Şemayı doğrudan DB ile senkronlar, migration geçmişi tutmaz -> yalnızca local dev/prototip',
      'generate: İncelenebilir (git-tracked) SQL dosyaları ve snapshot üretir -> PR code review yapılabilir',
      'migrate: CI/CD veya ayrı init/migration job’ında versiyonlu SQL dosyalarını sırayla uygular',
      'Uygulama pod’ları başlarken eşzamanlı migration yarışı olmamalı; tek job veya advisory lock kullanılmalı',
    ],
    modelAnswer:
      'Production’da asla `drizzle-kit push` kullanmam çünkü yıkıcı değişiklikleri (DROP COLUMN) izsiz uygular. Bunun yerine `drizzle-kit generate` ile SQL migration dosyalarını git’e alır, PR’da kilitleme riski açısından (CONCURRENTLY, NOT NULL) inceler ve deploy pipeline’ında uygulama ayağa kalkmadan önce tek bir migration job’ı ile `migrate` çalıştırırım.',
    trapWarning:
      'Next.js/Node.js build adımında veya her Kubernetes replica açılışında kontrolsüz migration çalıştırmak deploy kilitlenmesine yol açar.',
    followUp: 'Drizzle transaction callback’inde `db` yerine `tx` kullanmayı unutursanız ne olur?',
  },
  {
    id: 'iq-arch-1',
    topic: 'architecture',
    level: 'Senior',
    question:
      'Yeni bir Node.js + TypeScript + Drizzle backend projesini sıfırdan kuruyorsunuz. Klasör mimarisini nasıl tasarlarsınız ve neden?',
    rubricPoints: [
      'Feature/Module bazlı dikey dilimleme (`src/modules/<feature>/`)',
      'Her modül içinde katman ayrımı: domain (saf kurallar + interface), application (use-case), infrastructure (Drizzle repo), interfaces (HTTP/Zod)',
      'Paylaşılan altyapı `src/shared/` (db client, logger, error hierarchy, env validation)',
      'Aşırı soyutlamadan kaçınma: Küçük CRUD modüllerinde pragmatik denge, kritik domain’de tam izolasyon',
    ],
    modelAnswer:
      'Teknik katmanlara göre (tüm controllers bir yerde, tüm services bir yerde) değil, iş domain’ine göre modüler (Modular Monolith) klasör yapısı kurarım: `src/modules/orders/{domain,application,infrastructure,interfaces}`. Drizzle yalnızca `infrastructure/` klasöründe yaşar; use-case’ler repository arayüzüyle konuşur. Böylece iş kuralları DB olmadan milisaniyeler içinde test edilir ve yarın bir modül mikroservise ayrılmak istenirse sınırları zaten nettir.',
    trapWarning:
      'Her 3 satırlık CRUD için 15 dosya ve soyut factory zinciri kurmak "over-engineering"dir. Senior mühendis mimari disiplini iş karmaşıklığıyla dengeler.',
    followUp: 'İki modülün (ör. orders ve billing) birbirinin veritabanı tablosuna doğrudan JOIN atmasına izin verir misiniz?',
  },
  {
    id: 'iq-arch-2',
    topic: 'architecture',
    level: 'Staff',
    question:
      'Ödeme alındıktan sonra hem PostgreSQL’de siparişi `paid` yapmanız hem de kullanıcıya e-posta/bildirim kuyruğuna mesaj atmanız gerekiyor. İki sistem arasında tutarsızlığı nasıl engellersiniz?',
    rubricPoints: [
      'Dual-write problemi: DB commit olup queue fail olursa event kaybolur; tersi olursa hayalet event gider',
      'Transactional Outbox Pattern: Sipariş güncellemesi + outbox_events insert tek DB transaction’ında',
      'Relay worker / CDC (Debezium) outbox’tan okuyup broker’a yayınlar (At-Least-Once delivery)',
      'Consumer tarafında Idempotency (event_id kontrolü) ile çift işleme engellenir',
    ],
    modelAnswer:
      'İki bağımsız sistemde (PostgreSQL + Queue) dağıtık transaction (2PC) yerine Transactional Outbox Pattern uygularım. `db.transaction(tx)` içinde hem `orders.status = paid` güncellenir hem `outbox_events` tablosuna kayıt atılır. Arka plan worker’ı yayınlanmamış event’leri kuyruğa basar. At-least-once teslimat garantisi olduğundan consumer tarafı da `event_id` bazlı idempotent tasarlanır.',
    trapWarning:
      '`await db.update(...); await queue.publish(...);` kodu mutlu senaryoda çalışır ama sunucu iki satır arasında kapanırsa sipariş ödenmiş ama kargo/fatura hiç tetiklenmemiş olur.',
    followUp: 'Outbox tablosu milyonlarca satıra büyüdüğünde performansı nasıl korursunuz?',
  },
];

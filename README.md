# KODEX — Backend Engineering & Senior Interview Mastery

Minimalist, Swiss International Style **React Native (Expo + TypeScript)** mobil uygulaması.
Node.js, TypeScript, SQL/PostgreSQL, Drizzle ORM ve Clean Architecture konularını sıfırdan senior iş görüşmesi (technical interview) seviyesine kadar aşama aşama öğretir.

## Özellikler

- **3 Aşamalı Öğrenme Yolu**:
  - **Seviye 1 — Öğreniş**: Node.js Event Loop, TypeScript Tip Sistemi, SQL Temelleri, Drizzle ORM Çekirdeği.
  - **Seviye 2 — Devam Ediş**: Streams & Worker Threads, Zod Runtime Sınırları, İleri PostgreSQL (CTE, Window Functions, Locks), Drizzle Transactions & Migrations.
  - **Seviye 3 — Ustalık & Mimari**: Clean Architecture Klasör Düzeni, Zero-Downtime Migrations, Multi-Tenant Güvenlik, Idempotency & Outbox Pattern, N+1 Refactor.
- **6 İnteraktif Egzersiz Tipi**: Konsept Kartı (I/O akışlı), Çıktı Tahmini, Çoktan Seçmeli Tuzak Analizi, Kod Yazma, SQL Sorgu Yazma (giriş/çıkış tablolarıyla) ve Mimari Katman Yerleştirme.
- **Kod & SQL Pratik Laboratuvarı (Sandbox)**: Gerçek üretim senaryolarında SQL, Drizzle ORM, TypeScript ve Node.js yazıp anında yapısal ve test senaryosu doğrulaması alma.
- **Senior Mülakat Simülatörü**: 3 dakikalık cevap zamanlayıcısı, kendini değerlendirme rubriği, model senior cevapları, mülakat tuzakları ve takip soruları.
- **Swiss Minimalist Tasarım**: Sıfır gradyan, sıfır AI slop, keskin 1px kenarlıklar, tam Beyaz (Light) ve Karanlık (Dark) tema desteği.

## Mimari

```
kodex/
├── docs/PRD_AND_PR_LIST.md     # PRD ve PR-01..PR-10 yol haritası
├── assets/                     # Swiss minimalist uygulama ikonu ve splash
└── src/
    ├── app/                    # AppShell, SafeArea, Bottom Tab Navigation
    ├── core/
    │   ├── theme/              # Light & Dark tasarım tokenları
    │   ├── storage/            # AsyncStorage kalıcı XP, seri ve tema deposu
    │   └── engine/             # Kod, SQL ve Drizzle doğrulama motoru
    ├── data/curriculum/        # 3 seviyeli müfredat, sandbox ve mülakat bankası
    ├── features/
    │   ├── path/               # Öğrenme yolu ekranı
    │   ├── lesson/             # İnteraktif ders oynatıcısı
    │   ├── sandbox/            # Kod & SQL pratik laboratuvarı
    │   ├── interview/          # Senior mülakat simülatörü
    │   └── profile/            # Analitik, konu ustalığı, hata tekrarı, tema
    └── shared/components/      # Swiss UI bileşen kütüphanesi
```

## Kurulum ve Çalıştırma

```bash
npm install
npx tsc --noEmit
npm start
```

### Android Release APK Derleme

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# Çıktı: android/app/build/outputs/apk/release/app-release.apk
```

Detaylı ürün gereksinimleri ve PR listesi için [docs/PRD_AND_PR_LIST.md](docs/PRD_AND_PR_LIST.md) dosyasına bakın.

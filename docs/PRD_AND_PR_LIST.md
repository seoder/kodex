# KODEX — Backend & Senior Interview Mastery App
## Product Requirements Document (PRD) & PR Roadmap

---

## 1. Ürün Vizyonu ve Araştırma Bulguları

**KODEX**, backend mühendisliği (Node.js, TypeScript, SQL/PostgreSQL, Drizzle ORM, Clean Architecture) konularını sıfırdan senior iş görüşmesi (technical interview) seviyesine kadar **aşama aşama** öğreten, **interaktif kod ve SQL yazdırma** odaklı minimalist bir React Native mobil uygulamasıdır.

### UX & Öğrenme Araştırmasından Çıkarılan Temel İlkeler
1. **Duolingo / Brilliant / Mimo Etkili Öğrenme Mekaniği**:
   - **Bite-sized Progressive Path**: Konular 3 net seviyeye bölünür (Seviye 1: Öğreniş, Seviye 2: Devam Ediş, Seviye 3: Mimari & Senior Mülakat).
   - **Aktif Geri Çağırma (Active Recall)**: Pasif okuma yerine her konsept kartından hemen sonra kod yazma, SQL sorgusu oluşturma, çıktı tahmin etme ve mimari katman yerleştirme egzersizleri gelir.
   - **Anlık, Net Geri Bildirim**: Her cevapta sadece "Doğru/Yanlış" değil; *neden* doğru/yanlış olduğu, beklenen Input → Output tablosu ve **Mülakat Notu (Interview Insight)** gösterilir.
   - **Alışkanlık Döngüsü**: Günlük XP hedefi, Streak (seri) takibi, modül bazlı ustalık yüzdesi ve yanlış yapılan soruları tekrar etme (Mistake Review).
2. **Swiss International Style & Minimalist Tasarım Sistemi**:
   - **Sıfır Gradyan, Sıfır AI Slop**: Gölgeler, neon renkler, parlak efektler ve süslü ikonlar yerine keskin 1px kenarlıklar, yüksek kontrastlı tipografi hiyerarşisi ve ferah boşluklar (whitespace).
   - **Çift Tema (Light & Dark Mode)**: Saf beyaz (`#FFFFFF`) ve derin karbon (`#0A0A0B`) yüzeyler; semantik renkler yalnızca geri bildirim için (başarı yeşili, hata kırmızısı, uyarı kehribarı).
   - **Monospace Kod & Tablo Netliği**: Tüm kod blokları, SQL şemaları, giriş/çıkış (I/O) örnekleri ve klasör ağaçları okunaklı monospace düzeninde sunulur.

---

## 2. Müfredat Mimarisi (3 Aşamalı Öğrenme Yolu)

| Seviye | Odak | Modüller |
| :--- | :--- | :--- |
| **Seviye 1 — Öğreniş (Temeller)** | Dil, Runtime, SQL ve ORM çekirdeği | 1. Node.js Runtime & Event Loop<br>2. TypeScript Tip Sistemi<br>3. SQL & İlişkisel Veritabanı Temelleri<br>4. Drizzle ORM'e Giriş |
| **Seviye 2 — Devam Ediş (Üretim)** | Derinleşme, performans, transaction ve güvenli tip sınırları | 5. Node.js Asenkron & Performans<br>6. İleri TypeScript & Runtime Doğrulama<br>7. İleri SQL & PostgreSQL (CTE, Window, Locks)<br>8. Drizzle ORM İleri (Relations, Transactions, Migrations) |
| **Seviye 3 — Ustalık (Mimari & Mülakat)** | Klasör düzeni, Clean Architecture, ölçekleme ve senior mülakat savunması | 9. Clean Architecture & Katmanlı Dosya Düzeni<br>10. Production Backend & Zero-Downtime Migrations<br>11. Sistem Tasarımı, Cache, Idempotency & Pooling<br>12. Senior Mülakat Simülasyonu & Tuzak Sorular |

---

## 3. Egzersiz ve Etkileşim Türleri

1. **Konsept Kartı (`concept`)**: Kısa, öz teknik anlatım + gerçek üretim kodu + Input/Output akışı + *Mülakat Notu*.
2. **Çıktı Tahmini (`output_predict`)**: Event Loop sırası, TypeScript daraltma veya Drizzle çalışma zamanı davranışını tahmin etme.
3. **Kod Yazma / Tamamlama (`code_write`)**: TypeScript, Node.js ve Drizzle kodunu doğrudan yazma veya hızlı token çipleriyle tamamlama; Input/Output test senaryolarıyla anında doğrulama.
4. **SQL Sorgu Yazma (`sql_write`)**: Tablo şeması + örnek giriş satırları + beklenen çıkış tablosu ile gerçek SQL sorgusu yazma ve yapısal doğrulama.
5. **Mimari & Klasör Yerleştirme (`architecture`)**: Clean Architecture katmanlarına (`domain/`, `application/`, `infrastructure/`, `interfaces/`) dosya ve sorumluluk yerleştirme.
6. **Çoktan Seçmeli Tuzak Analizi (`multiple_choice`)**: Senior mülakatlarda sık sorulan ince farklar ve tuzaklar.

---

## 4. React Native Teknik Mimarisi

```
kodex/
├── docs/PRD_AND_PR_LIST.md
├── assets/                     # Swiss minimalist uygulama ikonu ve splash
└── src/
    ├── app/                    # Uygulama kabuğu, navigasyon, alt sekme çubuğu
    ├── core/
    │   ├── theme/              # Light/Dark Swiss tasarım tokenları
    │   ├── storage/            # AsyncStorage kalıcı ilerleme & tema deposu
    │   └── engine/             # Kod, SQL ve Drizzle doğrulama motoru (testli)
    ├── data/curriculum/        # 3 seviyeli müfredat + mülakat soru bankası
    ├── features/
    │   ├── path/               # Aşamalı öğrenme yolu (Seviye 1 → 2 → 3)
    │   ├── lesson/             # İnteraktif ders oynatıcısı
    │   ├── sandbox/            # Canlı SQL / Drizzle / TS Pratik Laboratuvarı
    │   ├── interview/          # Senior Mülakat Simülatörü (süreli/süresiz + rubrik)
    │   └── profile/            # Seri, XP, günlük hedef, konu ustalığı, tema ayarı
    └── shared/components/      # Tekrar kullanılabilir Swiss UI bileşenleri
```

---

## 5. PR Listesi (Pull Request Yol Haritası)

| PR # | Başlık | Kapsam ve Kabul Kriterleri | Durum |
| :--- | :--- | :--- | :--- |
| **PR-01** | `chore: Expo React Native TypeScript kurulumu ve klasör mimarisi` | Temiz feature-based dizin yapısı, TypeScript strict ayarları, temel bağımlılıklar ve Swiss minimalist uygulama ikonu entegrasyonu. | Tamamlandı |
| **PR-02** | `feat(theme): Swiss minimalist Light & Dark tasarım sistemi` | Sıfır gradyanlı saf beyaz/karbon renk tokenları, tipografi ölçeği, 1px kenarlık disiplini, `ThemeProvider` ve kalıcı tema seçimi. | Tamamlandı |
| **PR-03** | `feat(ui): Paylaşılan Swiss UI bileşen kütüphanesi` | `SurfaceCard`, `PrimaryButton`, `CodeBlock` (satır numaralı), `SqlTablePreview`, `ProgressBar`, `TagBadge`, `SegmentControl`. | Tamamlandı |
| **PR-04** | `feat(engine): Kod, SQL ve Drizzle egzersiz doğrulama motoru` | Boşluk/büyük-küçük harf toleranslı SQL normalleştirici, çoklu çözüm ve yapısal anahtar kelime/kalıp kontrolü, I/O test case raporu. | Tamamlandı |
| **PR-05** | `feat(curriculum): 3 seviyeli Node.js, TS, SQL, Drizzle ve Mimari müfredatı` | 12 modül, 40+ derin ders adımı, her adımda Input/Output örnekleri, mülakat notları ve gerçek üretim kodları. | Tamamlandı |
| **PR-06** | `feat(path): Aşamalı öğrenme yolu ekranı` | Seviye 1/2/3 sekmeleri, modül kartları, kilit/tamamlanma göstergeleri, günlük XP ve seri (streak) başlığı. | Tamamlandı |
| **PR-07** | `feat(lesson): İnteraktif ders oynatıcısı` | 6 egzersiz tipi, hızlı kod token çipleri, serbest kod/SQL editörü, ipucu sistemi, anlık açıklamalı geri bildirim ve ders özeti. | Tamamlandı |
| **PR-08** | `feat(sandbox): SQL & Kod Pratik Laboratuvarı` | Doğrudan SQL, Drizzle ORM ve TypeScript zorluklarını yazıp örnek I/O test senaryolarına karşı anında çalıştırma ve doğrulama. | Tamamlandı |
| **PR-09** | `feat(interview): Senior Mülakat Simülatörü` | Konu bazlı ve karma mülakat modu, zamanlayıcı, kendini değerlendirme rubriği, model senior cevapları ve mülakat tuzakları. | Tamamlandı |
| **PR-10** | `feat(profile) & build(android): Profil, analitik ve imzalı Release APK` | Konu bazlı ustalık çubukları, yanlış soru tekrarı, tema değiştirici, Android prebuild, imzalı APK derleme ve Google Drive yüklemesi. | Tamamlandı |

# Product Design Document

Test

## Projekt: seniorenfreundlich.de

### Version

MVP v1.0

### Ziel

seniorenfreundlich.de ist ein **öffentliches Verzeichnis seniorenfreundlicher Unternehmen**.
Unternehmen können ein **Seniorenfreundlich-Siegel erwerben**, im Register erscheinen und ein **öffentlich verifizierbares Zertifikat** erhalten.

Das System besteht aus:

1. Unternehmensregister
2. Firmenprofilseiten
3. Zertifikats-/Badge-System
4. Zahlungsabwicklung
5. Unternehmensdashboard
6. öffentlich verifizierbare Zertifikatsseiten

---

# 1 Produktziele

## Primäre Ziele

* Aufbau eines öffentlichen Registers seniorenfreundlicher Unternehmen
* Verkauf eines digitalen Siegels
* öffentlich verifizierbare Zertifikate
* einfache Verwaltung für Unternehmen
* SEO-optimierte Unternehmensseiten

---

## Sekundäre Ziele

* Vertrauen durch Transparenz
* einfacher Embed-Badge
* Skalierbarkeit für zukünftige Zertifizierungen

---

# 2 Geschäftsmodell

Unternehmen kaufen ein **Seniorenfreundlich-Siegel**.

Preis:

99 €

Optionen:

### MVP

* einmalige Zahlung
* gültig bis Entwertung

### später

* jährliche Zertifizierung
* Premiumprofile
* Prüfungen

---

# 3 Technologie Stack

## Hosting

Vercel

## Framework

Next.js (App Router)

## Sprache

TypeScript

## Datenbank

Neon Postgres

## ORM

Drizzle

## Auth

Clerk

## Payment

Mollie

## Email

Brevo (+ Mollie Stock-Mails für Zahlungsbestätigungen)

## UI Komponenten

Shadcn/ui

## Internationalisierung

next-intl

## Storage

Vercel Blob

## Analytics

Google Analytics 4

## Observability

Sentry

## Consent Management

Cookiebot (Usercentrics CMP)

## Testing

Vitest (Unit/Integration), Playwright (E2E)

---

# 4 Architektur

## Frontend

Next.js React App

## Backend

Next.js API Routes / Server Actions

## Datenbank

PostgreSQL

## Externe Services

Clerk
Mollie
Brevo
Vercel Blob
Sentry
Cookiebot
Google Analytics 4

---

# 5 Multilanguage

Sprachen:

* Deutsch (Default)
* Englisch

### Routing

Deutsch ohne Prefix

```
/unternehmen
/zertifikat
```

Englisch

```
/en/companies
/en/certificate
```

---

# 6 URL Struktur

## Öffentliche Seiten

Landing

```
/
```

Unternehmensregister

```
/unternehmen
```

Unternehmensprofil

```
/unternehmen/[slug]
```

Zertifikat

```
/zertifikat/[slug]
```

Kriterien

```
/kriterien
```

Impressum

```
/impressum
```

Datenschutz

```
/datenschutz
```

AGB

```
/agb
```

Widerruf

```
/widerruf
```

---

## Englische Version

Landing

```
/en
```

Companies

```
/en/companies
```

Company profile

```
/en/companies/[slug]
```

Certificate

```
/en/certificate/[slug]
```

---

## Geschützter Bereich

Dashboard

```
/dashboard
/dashboard/profile
/dashboard/badge
/dashboard/billing
```

Admin (nur autorisierte User)

```
/admin
```

---

## API Routen

```
/api/mollie/webhook
/api/openbadges/issuer
/api/openbadges/badgeclass
/api/openbadges/assertion/[id]
/api/health
```

---

# 7 NextJS Projektstruktur

```
app
 ├ layout.tsx
 ├ page.tsx

 ├ unternehmen
 │   ├ page.tsx
 │   └ [slug]
 │       └ page.tsx

 ├ zertifikat
 │   └ [slug]
 │       └ page.tsx

 ├ dashboard
 │   ├ page.tsx
 │   ├ profile
 │   │   └ page.tsx
 │   ├ badge
 │   │   └ page.tsx
 │   └ billing
 │       └ page.tsx

 ├ en
 │   ├ page.tsx
 │   ├ companies
 │   │   ├ page.tsx
 │   │   └ [slug]
 │   │       └ page.tsx
 │   └ certificate
 │       └ [slug]
 │           └ page.tsx

 ├ api
 │   ├ mollie
 │   │   └ webhook
 │   ├ openbadges
 │   │   ├ issuer
 │   │   ├ badgeclass
 │   │   └ assertion
 │   └ health

 ├ admin
 │   └ page.tsx

 ├ kriterien
 │   └ page.tsx

 ├ impressum
 │   └ page.tsx

 ├ datenschutz
 │   └ page.tsx

 ├ agb
 │   └ page.tsx

 ├ widerruf
 │   └ page.tsx
```

---

# 8 Datenbankmodelle

> **Hinweis zur Wiederverwendbarkeit:** Die Modelle sind generisch gestaltet und
> können für andere Badge-basierte Projekte wiederverwendet werden.
> Domain-spezifische Felder sind mit `[domain]` markiert.

## Companies

```
id
name
slug                    (unique index)
ownerClerkUserId        (index)
description             [domain]
website
phone
email
address
city
postalCode
country
logoUrl
createdAt
updatedAt
```

---

## Orders

```
id
companyId               (index, FK → companies)
molliePaymentId
mollieOrderId
amount
currency                (default: EUR)
status
createdAt
updatedAt
```

Status

```
pending
paid
failed
expired
refunded
```

---

## Badges

```
id
companyId               (index, FK → companies)
assertionId             (unique index)
status
issuedAt
revokedAt
```

Status

```
active
revoked
```

---

## AuditEvents

```
id
entityType              (z.B. company, order, badge)
entityId                (index)
action                  (z.B. created, updated, paid, revoked)
actorId                 (Clerk userId oder system)
metadata                (JSONB)
createdAt
```

---

# 9 Badge System

## Badge Eigenschaften

Das Siegel:

* PNG / SVG
* verlinkt auf Zertifikatsseite
* öffentlich verifizierbar

---

## Badge Embed Code

Unternehmen erhalten folgenden Code:

```
<a href="https://seniorenfreundlich.de/zertifikat/slug">
<img src="https://seniorenfreundlich.de/badge.svg"/>
</a>
```

---

# 10 Zertifikatsseite

URL

```
/zertifikat/[slug]
```

Inhalt

* Firmenname
* Siegelstatus
* Ausstellungsdatum
* Zertifikats-ID
* Badge
* Unternehmensinformationen
* Verifikationshinweis

---

# 11 Zahlungsflow

Flow:

1 Unternehmen registriert sich

2 Unternehmen erstellt Profil

3 Klick auf

```
Siegel kaufen
```

4 Mollie Hosted Checkout (Payment Page)

5 Mollie sendet Webhook

6 System erstellt Badge

7 Zertifikat wird aktiv

---

# 12 Mollie Webhook

Endpoint

```
/api/mollie/webhook
```

Verarbeitet

```
payment.paid
```

Aktionen

* Payment-Status verifizieren via Mollie API
* Order Status → paid
* Badge erstellen
* Zertifikat aktivieren
* Audit Event loggen

Sicherheit

* Webhook empfängt nur paymentId
* Status wird über Mollie API verifiziert (kein Signature-Check nötig)
* Idempotent: bereits verarbeitete Payments ignorieren

---

# 13 Badge Issuance

Badge-Erstellung erfolgt intern durch den Webhook-Handler (kein separater API-Endpoint).

Ablauf:

1. Order als bezahlt markieren
2. Badge mit assertionId (UUID) erstellen
3. Status: active, issuedAt: now
4. Als DB-Transaktion (alles oder nichts)

---

# 14 OpenBadge API

## Issuer

```
/api/openbadges/issuer
```

## BadgeClass

```
/api/openbadges/badgeclass
```

## Assertion

```
/api/openbadges/assertion/[id]
```

---

# 15 Dashboard

## Übersicht

```
/dashboard
```

Zeigt:

* Firmenstatus
* Badge Status
* Zahlungsstatus

---

## Profil

```
/dashboard/profile
```

Bearbeiten:

* Firmenname
* Beschreibung
* Website
* Adresse
* Logo

---

## Badge Verwaltung

```
/dashboard/badge
```

Funktionen:

* Siegelstatus
* Embed Code
* Siegel entwerten

---

## Billing

```
/dashboard/billing
```

Funktionen:

* Siegel kaufen
* Zahlungsstatus

---

# 16 SEO

Indexiert werden

* Register
* Unternehmensprofile
* Zertifikatsseiten

Meta:

```
title
description
structured data
```

---

# 17 Consent Management

Cookiebot verwaltet:

* Google Analytics
* Cookie Consent

---

# 18 Email System

## Zahlungsbestätigung

Mollie versendet automatisch Zahlungsbestätigungen (Stock-Mails).
Falls Mollie diese Option nicht bietet, wird eine eigene Zahlungsbestätigungs-Mail über Brevo implementiert.

## Badge Aktivierung

Brevo sendet nach Badge-Erstellung:

* Zertifikatslink
* Embed-Code Anleitung
* Hinweis auf Dashboard

Fehlerbehandlung: Mail-Fehler werden in Sentry geloggt, blockieren aber nicht den Webhook.

---

# 19 Monitoring

Sentry überwacht:

* Fehler
* API failures
* Webhook errors

Health Check Endpoint:

```
/api/health
```

Prüft:

* Datenbankverbindung
* Externe Service-Erreichbarkeit

Gibt HTTP 200 (healthy) oder 503 (unhealthy) zurück.

---

# 19a Datenschutz / GDPR

## Rechtsgrundlagen

| Verarbeitung | Rechtsgrundlage | Artikel |
|---|---|---|
| Firmenprofil & Badge | Vertragserfüllung | Art. 6 (1)(b) DSGVO |
| Zahlungsabwicklung | Vertragserfüllung | Art. 6 (1)(b) DSGVO |
| Analytics (GA4) | Einwilligung | Art. 6 (1)(a) DSGVO |
| Fehlerverfolgung (Sentry) | Berechtigtes Interesse | Art. 6 (1)(f) DSGVO |
| E-Mail-Kommunikation | Vertragserfüllung | Art. 6 (1)(b) DSGVO |

## Auftragsverarbeiter

| Dienst | Zweck | Sitz | AV-Vertrag |
|---|---|---|---|
| Vercel | Hosting | USA (EU-Daten via Edge) | Erforderlich |
| Neon | Datenbank | USA/EU | Erforderlich |
| Clerk | Authentifizierung | USA | Erforderlich |
| Mollie | Zahlungen | Niederlande (EU) | Erforderlich |
| Brevo | E-Mail | Frankreich (EU) | Erforderlich |
| Sentry | Fehlerverfolgung | USA | Erforderlich |
| Google | Analytics | USA | Erforderlich |
| Cookiebot | Consent Management | Dänemark (EU) | Erforderlich |

## Betroffenenrechte

Folgende Rechte müssen technisch unterstützt werden:

* **Auskunft** (Art. 15): Export der Unternehmensdaten über Dashboard
* **Berichtigung** (Art. 16): Profildaten im Dashboard editierbar
* **Löschung** (Art. 17): Account-Löschung über Dashboard oder Anfrage
* **Datenportabilität** (Art. 20): Export der eigenen Daten als JSON
* **Widerspruch** (Art. 21): Cookie-Consent widerrufbar über Cookiebot

## Datenspeicherung & Löschfristen

| Daten | Aufbewahrung | Löschung |
|---|---|---|
| Firmenprofil | Während aktiver Nutzung | Bei Account-Löschung |
| Bestellungen | 10 Jahre (steuerlich) | Nach Ablauf der Frist |
| Audit Events | 3 Jahre | Automatisch nach Ablauf |
| Auth-Daten (Clerk) | Während aktiver Nutzung | Bei Account-Löschung via Clerk |
| Analytics | Gemäß GA4 Einstellung | Automatisch |

## Cookie-Kategorien

| Kategorie | Cookies | Einwilligung |
|---|---|---|
| Notwendig | Clerk Session, CSRF | Nicht erforderlich |
| Analytics | GA4, Google | Über Cookiebot |
| Marketing | Keine im MVP | — |

---

# 20 Launch Kriterien

System ist launchbereit wenn:

* Registrierung funktioniert
* Firmenprofil erstellt werden kann
* Mollie Checkout funktioniert
* Badge generiert wird
* Zertifikatsseite sichtbar ist
* Siegel embed funktioniert
* Datenschutzerklärung vorhanden
* Impressum vorhanden
* AGB vorhanden
* Cookiebot aktiv
* Sentry konfiguriert
* Health Check antwortet

---

# 21 MVP Prioritäten

Must have

* Register
* Firmenprofil
* Mollie Checkout
* Badge
* Zertifikat
* Datenschutz / Impressum / AGB
* Consent Management

Optional

* Kategorien
* Bewertungen
* Admin Panel
* Widerrufsseite

---

# 22 Erweiterungen

Nach Launch

* Bewertungen
* Premiumprofile
* geprüfte Zertifizierung
* API für Badge Verifikation
* jährliche Verlängerung
* Admin Panel (falls nicht im MVP)

---

# 23 AI Implementierungsstrategie

Die KI sollte in dieser Reihenfolge implementieren:

1 Projekt Setup & Quality Baseline
2 Datenbankmodelle & Migrationen
3 Auth Integration (Clerk)
4 Internationalisierung (next-intl)
5 Company Management (Dashboard, Profil, Logo)
6 Mollie Integration (Checkout, Webhook, Badge Issuance)
7 Öffentliche Seiten (Register, Unternehmensprofile)
8 Zertifikatsseiten & Badge Embed
9 OpenBadge API
10 Consent, Analytics, Monitoring (Cookiebot, GA4, Sentry)
11 SEO & Sitemaps
12 Rechtliche Seiten (Impressum, Datenschutz, AGB, Widerruf)
13 Testing (Unit, Integration, E2E)
14 Admin Panel
15 Staging & Production Deployment
16 Launch

---

# 24 Admin Panel

URL

```
/admin
```

Zugang:

* Geschützt über konfigurierte Clerk UserIds (Umgebungsvariable)

Funktionen:

* Unternehmen auflisten und einsehen
* Bestellungen einsehen
* Badges einsehen
* Manuelles Entwerten von Badges (Notfall)
* Bestellungen nachschlagen

---

# 25 Testing Strategie

## Unit Tests

* Vitest für Service-Layer, Utilities, Validatoren
* Ziel: >70% Coverage auf Services

## Integration Tests

* Testen gegen isolierte Testdatenbank
* Auth-Flow, Company CRUD, Badge Lifecycle

## E2E Tests

* Playwright für kritische User Journeys
* Registrierung, Profilmanagement, Zahlungsflow, Badge-Verifikation

---

# 26 Deployment & CI/CD

## Umgebungen

* **Staging:** Automatisches Deployment von main Branch
* **Production:** Manuelles Promotion von Staging

## Pipeline

* Lint + Type Check
* Unit Tests
* Build
* Deploy to Staging
* E2E Tests gegen Staging
* Manual Approval
* Deploy to Production

---

# 27 Kriterien-Seite

URL

```
/kriterien
```

Öffentliche Seite, die die Kriterien für das Seniorenfreundlich-Siegel beschreibt.
Dient auch als `criteria` URL für die OpenBadges BadgeClass.

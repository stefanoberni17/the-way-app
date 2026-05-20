# The Way — La Via del Cuore — Guida al Progetto

## Panoramica

**The Way** è un'app di crescita personale basata sugli insegnamenti del Vangelo. Gli utenti compiono un percorso psicologico-spirituale strutturato in 33 settimane e passi biblici, guidati da un AI (la "Guida") che funge da specchio consapevole — non prete, non psicologo, non coach. Il contenuto (passi biblici, versetti, pratiche) è gestito su Notion come CMS.

**Tagline:** *La Via del Cuore*

**Stato attuale:** MVP in Beta. Settimane 1-4 disponibili (passi 1-6), settimane 5+ bloccate.

**Basato su:** Naruto Inner Path (stesso stack, struttura adattata per The Way)

---

## Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Frontend | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (PostgreSQL) |
| CMS | Notion API (`@notionhq/client`) |
| AI | Anthropic Claude Sonnet (`@anthropic-ai/sdk`) |
| Bot | Telegram (`node-telegram-bot-api`) |
| Icons | Lucide React |

---

## Struttura delle Cartelle

```
naruto-inner-path/
├── app/
│   ├── layout.tsx                 # Root layout: GlobalMeditationWrapper + BottomTabBar
│   ├── page.tsx                   # Dashboard (home) — richiede auth
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── onboarding/page.tsx
│   ├── chat/page.tsx              # Chat con Maestro AI
│   ├── settimane/page.tsx         # Lista settimane con lock/unlock
│   ├── settimana/[id]/page.tsx    # Dettaglio settimana (id = Notion page ID)
│   ├── episodio/[id]/page.tsx     # Episodio (id = numero episodio 1-19)
│   ├── profilo/page.tsx
│   ├── privacy/page.tsx           # Privacy Policy (pubblica, senza BottomTabBar)
│   ├── cammino-oggi/page.tsx      # Check-in serale (2 slider 1-10 + nota)
│   ├── custoditi/page.tsx         # Tab "Custoditi": passi salvati + filtri tag
│   └── api/
│       ├── settimane/route.ts     # GET → lista 6 settimane da Notion DB
│       ├── settimana/route.ts     # GET ?id= → dettaglio pagina Notion + blocchi
│       ├── episodio/route.ts      # GET ?number=&userId=  /  POST completamento
│       ├── practices/route.ts     # GET/POST tracker pratiche (14 giorni × 3 pratiche)
│       ├── reflection/route.ts    # GET/POST riflessioni post-episodio
│       ├── daily-invitation/route.ts  # GET/POST invito del giorno (lazy upsert)
│       ├── daily-checkin/route.ts # GET/POST check-in serale (2 dimensioni 1-10)
│       ├── saved-passages/route.ts # GET/POST/DELETE passi custoditi con tag tematici
│       ├── chat/route.ts          # POST → Claude Sonnet con context utente
│       ├── telegram/route.ts      # POST → webhook bot Telegram
│       └── cron/
│           └── cleanup-telegram/route.ts  # GET → elimina telegram_conversations > 90gg
├── components/
│   ├── BottomTabBar.tsx           # Nav fissa: Home / Percorso / Maestro / Profilo
│   ├── ChatBot.tsx                # UI chat (usata in /chat)
│   ├── EpisodeCard.tsx            # Card episodio per /settimana/[id]
│   ├── GlobalMeditationWrapper.tsx# Context provider meditazione (in layout)
│   ├── MeditationContext.tsx      # Context: { openMeditation, mantra, weekName }
│   ├── MeditationPopup.tsx        # Popup meditazione guidata (2 fasi)
│   ├── DailyVerseCard.tsx         # Versetto del giorno (push del mattino)
│   ├── DailyInvitationCard.tsx    # Invito del giorno (Vita Quotidiana)
│   ├── EveningCheckinCard.tsx     # Card check-in serale in home (3 stati)
│   ├── EveningReminderBanner.tsx  # Banner sticky alle 21 se check-in non fatto
│   ├── SavePassageButton.tsx      # Bottone "Custodisci" + modal tag (in Step 5 passo)
│   └── Navigation.tsx             # (non in uso attivo)
├── lib/
│   ├── supabase.ts                # Client Supabase pubblico (browser)
│   ├── episodeMapping.ts          # Map episodio → Notion pageId, settimana
│   ├── weekUnlockLogic.ts         # Logica sblocco settimane sequenziale
│   ├── dailyInvitation.ts         # pickInvitation + fallback hardcoded per week
│   ├── savedPassageTags.ts        # Catalogo tag tematici + auto-suggest passi
│   ├── episodeMetadata.ts         # Metadata statici 28 passi MVP (title/ref/week)
│   ├── weekStart.ts               # getMondayRome / getTodayRome / subtractDays
│   └── maestro-ai.ts             # System prompt + buildUserContext + callClaude
├── public/
│   └── audio/
│       ├── nature-meditation.mp3
│       └── naruto-meditation.mp3
├── vercel.json                    # Cron job Vercel (cleanup-telegram ogni notte alle 03:00)
└── docs/                          # ← Documentazione progetto (da popolare)
```

---

## Variabili Ambiente (`.env.local`)

```
# Notion
NOTION_TOKEN=
NOTION_DATABASE_SETTIMANE=      # ID del database settimane su Notion
NOTION_DATABASE_EPISODI=        # ID del database episodi su Notion

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Usata server-side in maestro-ai.ts

# Anthropic
ANTHROPIC_API_KEY=

# Telegram (opzionale)
TELEGRAM_BOT_TOKEN=
CRON_SECRET=                    # Segreto per autorizzare le chiamate ai cron job Vercel
```

---

## Schema Database Supabase

### `profiles`
```sql
user_id                  UUID PRIMARY KEY  -- = auth.users.id
name                     TEXT
age                      INT
goals                    TEXT
passions                 TEXT
dream                    TEXT
current_situation        TEXT
current_week             INT DEFAULT 1     -- settimana attuale (1-6)
telegram_id              TEXT              -- per il bot Telegram
onboarding_completed     BOOLEAN DEFAULT false
last_meditation_completed DATE             -- usato per daily check meditazione
```

### `user_episode_progress`
```sql
user_id          UUID
episode_number   INT
week_number      INT
completed        BOOLEAN
completed_at     TIMESTAMPTZ
PRIMARY KEY (user_id, episode_number)
```

### `episode_reflections`
```sql
user_id              UUID
episode_number       INT
reflection_text      TEXT   -- risposta utente (max 500 char)
reflection_question  TEXT   -- domanda dell'episodio
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
PRIMARY KEY (user_id, episode_number)
```

### `weekly_practices`
```sql
user_id          UUID
week_number      INT
practice_number  INT         -- 1, 2 o 3
completed_days   JSONB       -- { day1: bool, ..., day7: bool } (Lun..Dom)
week_start_date  DATE        -- lunedì Europe/Rome della settimana di calendario corrente
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
PRIMARY KEY (user_id, week_number, practice_number)
```
**Reset settimanale**: `app/api/practices` confronta `week_start_date` con il lunedì attuale (helper `lib/weekStart.ts#getMondayRome`); se diverso, azzera `completed_days` e aggiorna `week_start_date`. Così le caselle Lun-Dom ripartono ogni nuovo lunedì anche se l'utente resta più giorni sulla stessa `week_number` del percorso.

### `saved_passages`
```sql
user_id        UUID
episode_number INT
tags           JSONB    -- array di tag-id curati (es. ["paura","sera"])
note           TEXT     -- opzionale (futuro)
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
PRIMARY KEY (user_id, episode_number)
```
Modulo "Custoditi": l'utente salva i passi a cui vuole tornare, taggandoli con categorie tematiche curate ("Quando ho paura", "Per la sera", "Quando devo decidere", ecc. — catalogo in `lib/savedPassageTags.ts`). Indice GIN su `tags` per filtraggio rapido. Pagina dedicata `/custoditi` (5° tab in BottomTabBar).

### `daily_checkins`
```sql
user_id               UUID
checkin_date          DATE             -- giorno locale Europe/Rome
week_number           INT
episode_number        INT              -- passo guida da cui deriva l'invito

-- Invito del giorno (mostrato in home)
invitation_text       TEXT
invitation_seen_at    TIMESTAMPTZ
invitation_done_at    TIMESTAMPTZ

-- Check-in serale (1-10, nullable finché non compilato)
q_presence            INT              -- presenza durante la giornata
q_connection          INT              -- connessione con se stesso
note                  TEXT             -- max 500 char
checkin_submitted_at  TIMESTAMPTZ
flagged               BOOLEAN          -- true se la note contiene SAFETY_KEYWORDS

UNIQUE (user_id, checkin_date)
```
Modulo "Vita Quotidiana": una riga per utente per giorno. L'invito viene popolato lazy al primo GET di `/api/daily-invitation` (selezione deterministica via `lib/dailyInvitation.ts#pickInvitation` — fonte primaria: campo Notion `Inviti del giorno` del passo guida; fallback: catalogo hardcoded per settimana). Il check-in serale si compila da `/cammino-oggi`. I dati alimentano `buildUserContext` del Maestro AI in modo distillato (medie + trend, mai numeri grezzi).

### `telegram_conversations`
```sql
user_id     UUID
role        TEXT            -- 'user' | 'assistant'
content     TEXT
created_at  TIMESTAMPTZ
```
Sliding window: vengono caricati gli ultimi 20 messaggi per ogni richiesta.
Retention automatica: il cron `/api/cron/cleanup-telegram` elimina righe più vecchie di 90 giorni.

---

## Struttura Contenuto (Notion)

Il contenuto educativo è su Notion. Due database principali:

### Database Settimane (`NOTION_DATABASE_SETTIMANE`)
Una pagina per ogni settimana singola del percorso (W1, W2, W3, …). Ogni pagina ha le properties:
- `Settimana` — title `"Week N"`
- `Numero` — N
- `Titolo` / `Tema principale` / `Essenza` / `Domanda guida`
- `Mantra` — citazione settimanale (testo con `<br>` per a capo)
- `Versetto guida`
- `Pratiche` — 3 pratiche separate da `\n` (o `<br>`)
- `Passi biblici` — 7 voci numerate (6 Lectio + 1 Integrazione)
- `Stato` — `Da fare` / `In lavorazione` / `Completo`

### Database Passi Biblici (`NOTION_DATABASE_EPISODI`)
Una pagina per ogni passo. Properties chiave:
- `Numero` — 1..7 entro la settimana (renormalizzato)
- `Settimana` — text `"Week N"` (singolo, niente più "Week 1-2" bundled)
- `Tipo` — `Lectio` / `Integrazione` / `Pratica`
- `Passo biblico` — title del passo
- `Riferimento`, `Mini-lezione breve`, `Guida osservazione`, `Domanda riflessiva`, `Versetto da portare`, `Pratiche consigliate`, `Salmo/Proverbio di supporto`, `Concetti collegati`, `Tema principale`
- `Inviti del giorno` — rich_text con 3 micro-pratiche giornaliere (separate da `\n` o `<br>`). Linea-guida: una frase, max 12-15 parole, imperativo gentile ("Oggi nota...", "Lascia che..."), portabile in una giornata qualsiasi, niente lessico tecnico ("custodia del cuore" solo dalla Week 3 in poi). Letta da `lib/dailyInvitation.ts` per ruotare l'invito del giorno in home.
- `Approfondimento` — rich_text con una lettura ampia legata al passo (~250-350 parole). Esegesi, contesto storico, voci della tradizione cristiana (Padri della Chiesa, mistici, teologi moderni), salmi/lectio correlati. Mostrato come `<details>` collassato nello Step 5 dell'episodio ("📚 Vai più a fondo"). Discreto: chi vuole apre, chi no resta nel flusso normale.
- `Durata stimata`, `Audio URL`

L'API `/api/episodio` filtra `Numero=localNum AND Settimana="Week N"`.

### Mapping Settimane → Notion Page IDs
Sorgente unica: [lib/weekIds.ts](lib/weekIds.ts) — esporta `WEEK_IDS` e `WEEK_NAMES`. **Importare da lì** invece di duplicare il mapping nei singoli file.

---

## Struttura del Percorso (MVP)

| Settimana | Tema | Passi (globali) |
|-----------|------|-----------------|
| 1 | La voce nel deserto (Presenza) | 1-7 |
| 2 | La voce nel deserto cont. | 8-14 |
| 3 | Il silenzio di Nazaret (Presenza cont.) | 15-21 |
| 4 | Il silenzio di Nazaret cont. | 22-28 |
| 5 | La voce che chiama (Ascolto) — Beta-locked | 29-35 |
| 6 | La voce che chiama cont. — Beta-locked | 36-42 |

7 passi per settimana = 6 Lectio + 1 Integrazione. Beta: 4 settimane × 7 = **28 passi totali**.

**Logica sblocco settimane** (`lib/weekUnlockLogic.ts`):
- Week 1 sempre disponibile
- Week N si sblocca quando tutti i passi della week N-1 sono completati
- Beta: `BETA_MAX_WEEK = 4`, `BETA_MAX_EPISODE = 28`

**Logica sblocco passi** (`/api/episodio`):
- Passo N si sblocca solo se N-1 è completato
- Passo 1 sempre disponibile

---

## Flussi Principali

### Autenticazione
```
Register (email + profilo) → consenso Privacy Policy (checkbox obbligatorio) → Email conferma Supabase
  → Login → Check profilo + onboarding
    → Se onboarding non completato → /onboarding
    → Se ok → / (home)
```
> Nessun middleware attivo (`middleware.ts.backup`). Auth gestita client-side in ogni page.

### Episodio
```
/settimane → /settimana/[id] → /episodio/[numero]
  → Leggi contenuto da Notion
  → Scrivi riflessione (max 500 char)
  → "Segna come completato" → POST /api/episodio
    → Salva in user_episode_progress
    → Auto-aggiorna current_week se fine coppia settimane
    → Mostra schermata di celebrazione (fullscreen orange)
      → Bottone manuale "Continua il percorso →" per tornare indietro
```

### Completamento Settimana
```
Quando l'utente completa l'ultimo episodio di una settimana:
  → checkCompletion() in settimana/[id]/page.tsx
    → Se appena completata in questa sessione: popup di celebrazione 🏆
      → Bottone "Passa alla settimana successiva" (se disponibile in Beta)
      → Messaggio "stay tuned" (se prossima settimana è Beta-locked)
    → Se già completata in sessioni precedenti: solo bottone fisso in fondo
```

**Nota**: Ogni settimana del percorso ha la propria pagina Notion e i propri 7 passi (vedi [lib/weekIds.ts](lib/weekIds.ts) e [lib/episodeMapping.ts](lib/episodeMapping.ts)). Le bundled storiche "Week 1-2"/"Week 3-4"/"Week 5-6" sono state archiviate (Numero ≥ 90) e non vengono più referenziate dal codice.

### Vita Quotidiana (Invito del giorno + Check-in serale)
```
MATTINA / GIORNO
  Home → DailyInvitationCard → GET /api/daily-invitation
    → Lazy upsert riga di oggi in `daily_checkins` (se non esiste)
    → pickInvitation(): legge campo Notion "Inviti del giorno" del passo guida
      (= ultimo passo completato, fallback passo 1 della week corrente)
    → Selezione deterministica per giorno (hash userId + giorni dall'epoca)
    → Fallback: WEEK_INVITATION_FALLBACK[weekNumber] in lib/dailyInvitation.ts
  → Utente clicca "✓ L'ho vissuto" → POST { action: 'done' }

SERA (18:00+)
  Home → EveningCheckinCard mostra CTA "Fai il check-in della sera"
  /cammino-oggi → 2 slider 1-10 (presenza + connessione con sé) + nota opzionale
  → POST /api/daily-checkin → safety check sulla note (SAFETY_KEYWORDS)
  → Redirect home con toast "Giornata custodita ✓"

ALLE 21:00
  EveningReminderBanner appare sticky in alto se check-in non fatto
  → Dismissible per sessione (sessionStorage)

MAESTRO AI
  buildUserContext() include ultimi 7 giorni di check-in in forma DISTILLATA:
    medie + trend ("in crescita/stabile/in calo"), nota recente troncata.
  Regola ferrea nel SYSTEM_PROMPT ("# RITMO QUOTIDIANO"): mai elencare numeri,
  mai diagnosticare, accennare solo se la persona porta il tema.
```

### Custoditi (passi salvati)
```
SALVARE
  /episodio/[id] → Step 5 → "🤍 Custodisci questo passo"
    → Modal: 12 tag tematici curati ("Quando ho paura", "Per la sera"...)
      con auto-suggerimento basato sul passo (suggestTagsForEpisode in lib/savedPassageTags.ts)
    → POST /api/saved-passages { episodeNumber, tags }
    → Salva in saved_passages (upsert per user_id+episode_number)

RITROVARE
  BottomTabBar → "Custoditi" → /custoditi
    → GET /api/saved-passages → lista row con tags
    → Render con metadata da lib/episodeMetadata.ts (title, ref, week — no fetch Notion)
    → Filtri chip: solo i tag effettivamente presenti tra i passi salvati
    → Click sulla card → /episodio/[id]
```
Filosofia: l'utente custodisce i passi che gli parlano e li ritrova in base alle "necessità della vita" — non per tema del percorso, ma per stato interiore del momento.

### Meditazione Guidata
```
[Automatico al primo accesso del giorno] OPPURE [Pulsante "🧘 Fai la pratica di respiro" in home page]
  → Popup fase SETUP: scegli durata (1/2/3/5 min) + "Salta per oggi"
  → Fase MEDITAZIONE: timer countdown + respiro animato (4s ciclo) + audio opzionale
    → Pulsante ✕ in alto a destra per tornare al setup
    → Audio: 🌊 Natura / 🍥 Naruto / 🔇 Muto
  → Al completamento timer: bottone "Continua 🌅" → salva last_meditation_completed = oggi
```
**Context globale:** `useMeditation()` da `MeditationContext` espone `openMeditation()` per aprire il popup da qualsiasi componente.

### Maestro AI (`lib/maestro-ai.ts`)
```
User message → /api/chat
  → buildUserContext(): carica profilo + episodi completati + riflessioni
  → System prompt (~200 righe): ruolo Maestro, progressione 9 fasi,
    regole anti-spoiler, sicurezza per contenuti a rischio
  → Claude Sonnet (anthropic SDK)
  → Risposta personalizzata in chat
```
**Safety:** Intercetta keyword di rischio (suicidio, autolesionismo) e risponde con protocollo specifico prima di continuare.

### Bot Telegram
```
Messaggio Telegram → POST /api/telegram (webhook)
  → Cerca telegram_id in profiles
  → Se utente non trovato: risponde con SYSTEM_PROMPT_NOT_REGISTERED
  → Se utente trovato:
    → Carica ultimi 20 messaggi da telegram_conversations (sliding window)
    → buildUserContext + SYSTEM_PROMPT + (primo messaggio? → nota accoglienza)
    → Claude Sonnet
    → Se primo messaggio: invia avviso privacy PRIMA della risposta del Maestro
    → Risponde su Telegram API
    → Salva user message + risposta in telegram_conversations
    → Ogni 20 messaggi totali: genera recap (fire-and-forget) via generateMaestroRecap
```
**Privacy:** al primo messaggio l'utente riceve automaticamente un avviso con link alla policy e contatto email.

---

## Pattern e Convenzioni

### Fetch dati Notion
Tutti i dati di contenuto passano per le API routes (BFF pattern). Il client non chiama mai Notion direttamente:
```typescript
// ✅ Corretto
const response = await fetch(`/api/settimana?id=${weekId}`);
const data = await response.json();
const mantra = data?.page?.properties?.Mantra?.rich_text?.[0]?.plain_text;

// ❌ Mai direttamente dal client
import { Client } from '@notionhq/client';
```

### Supabase client
Un singolo client pubblico in `lib/supabase.ts`. Per operazioni server-side privilegiate (come in `maestro-ai.ts`) si usa il `SUPABASE_SERVICE_ROLE_KEY`.

### Parsing testo Notion
I ritorni a capo nel CMS Notion vengono scritti come `<br>` → convertire sempre:
```typescript
const text = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
```

### Autenticazione nelle page
Ogni pagina protetta fa il check manualmente (non c'è middleware):
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) { router.push('/login'); return; }
```

### Routing BottomTabBar
Il `BottomTabBar` si nasconde automaticamente su `/login`, `/register`, `/onboarding`, `/privacy`. Aggiungere nuove rotte pubbliche o non-app nella lista `if` del componente.

---

## Componente MeditationPopup — Note Importanti

Il popup ha **due fasi**:
1. **`setup`** — selezione durata (1/2/3/5 min) + pulsante "Salta per oggi" (non salva nulla)
2. **`meditating`** — timer attivo + respiro animato (scala 100%↔75% ogni 4s) + audio

**Props:**
- `manualOpen: boolean` — se true apre il popup (gestito da `GlobalMeditationWrapper`)
- `onClose?: () => void` — callback alla chiusura
- `mantra`, `weekName`, `userId`

**Apertura:** Il check giornaliero (non mostrare se già fatto oggi) avviene nell'`useEffect` con dep `[userId]`. L'apertura manuale è via `manualOpen` prop.

**Per aprire il popup da qualsiasi componente:**
```typescript
import { useMeditation } from '@/components/MeditationContext';
const { openMeditation } = useMeditation();
// ...
<button onClick={openMeditation}>🧘 Fai la pratica di respiro</button>
```

> ⚠️ Il container del popup usa `pb-24` e `overflow-y-auto` per evitare che la BottomTabBar copra il pulsante "Salta per oggi".

---

## Pagina Settimana (`/settimana/[id]`) — Note Importanti

### Ordine sezioni
1. **Header** — titolo, tema, badge "✅ Completata" (se week finita), bottone "Vai agli episodi ↓"
2. **📖 Approfondimento** — `<details>` collassabile con contenuto Notion (chiuso di default)
3. **📺 Episodi** — griglia 2 col con `EpisodeCard`
4. **Bottone "Passa alla settimana successiva"** — visibile solo se week completata e prossima disponibile

### Logica completamento settimana
```typescript
// checkCompletion() viene chiamata:
// - al caricamento (triggerPopup: false) → solo bottone, no popup
// - dopo ogni episodio completato (triggerPopup: true) → popup + bottone
const allDone = weekEps.every(ep => completedEpisodes.includes(ep));
```

### Popup vs bottone fisso
- **Popup**: appare solo quando si completa l'ultimo episodio **in questa sessione**
- **Bottone fisso**: sempre visibile a fondo pagina se week è completa (anche sessioni successive)
- **Beta-lock**: se la prossima week è > 4, mostra messaggio "stay tuned" invece del bottone navigazione

---

## Cose da Fare / Note di Sviluppo

- [ ] La cartella `/docs` è vuota — popolarla con documentazione dettagliata
- [ ] Il `middleware.ts` è disabilitato (`.backup`) — l'auth è solo client-side
- [ ] Il mapping `WEEK_IDS` è duplicato in più file (`GlobalMeditationWrapper`, `app/page.tsx`, `app/settimane/page.tsx`) — considerare una costante centralizzata in `/lib/constants.ts`
- [ ] Week 5-6 bloccate in Beta — da sbloccare rimuovendo la restrizione in `weekUnlockLogic.ts`
- [ ] Nessun test automatico — da aggiungere
- [ ] Aggiungere `CRON_SECRET` come variabile d'ambiente in Vercel (richiesto da `/api/cron/cleanup-telegram`)
- [ ] **Future (non MVP):** Sezione "Le mie riflessioni" in dashboard + pagina dedicata per rivedere e commentare le riflessioni salvate in `episode_reflections`

---

## Comandi Utili

```bash
npm run dev       # Avvia dev server su http://localhost:3000
npm run build     # Build produzione
npm run lint      # Linting ESLint
```

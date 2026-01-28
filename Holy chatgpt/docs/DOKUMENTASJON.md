# 📚 Todo Manager - Prosjektdokumentasjon

## Innholdsfortegnelse

1. [Prosjektoversikt](#prosjektoversikt)
2. [Designvalg og Begrunnelser](#designvalg-og-begrunnelser)
3. [Database-design](#database-design)
4. [Arkitektur](#arkitektur)
5. [Teknologiske Valg](#teknologiske-valg)
6. [Utfordringer og Løsninger](#utfordringer-og-løsninger)
7. [Fremtidige Forbedringer](#fremtidige-forbedringer)
8. [Hva Jeg Lærte](#hva-jeg-lærte)

---

## 🎯 Prosjektoversikt

Todo Manager er en fullstack webapplikasjon designet for å demonstrere kompetanse innen:
- Database-integrasjon med SQLite
- Backend-utvikling med Node.js og Express
- Frontend-utvikling med moderne webteknikker
- RESTful API-design
- Full-stack arkitektur

Prosjektet tar sikte på å være mer enn bare en enkel CRUD-applikasjon ved å inkludere avanserte funksjoner som filtrering, sortering, søk og statistikk.

---

## 🎨 Designvalg og Begrunnelser

### 1. Brukergrensesnitt (UI)

#### Fargepalett

Jeg valgte en moderne, profesjonell fargepalett:

- **Primærfarge (Indigo)**: Gir et profesjonelt og pålitelig inntrykk
- **Prioritetsfarger**:
  - 🔴 Rød (Høy prioritet): Signaliserer viktighet og urgenthet
  - 🟡 Gul (Medium prioritet): Balanse mellom viktighet og ikke-urgenthet
  - 🟢 Grønn (Lav prioritet): Rolig og mindre presserende

**Begrunnelse**: Farger har psykologisk betydning. Rødt trekker oppmerksomhet til viktige oppgaver, mens grønt gir en følelse av ro for mindre kritiske oppgaver.

#### Layout

Jeg implementerte en **kortbasert layout** (card-based design):

- Hver oppgave presenteres som et selvstendig kort
- Kortet inneholder all relevant informasjon på ett sted
- Hvite kort med subtile skygger gir dybde uten å være overveldendenе

**Begrunnelse**: Kortdesign er populært i moderne webapplikasjoner (som Trello, Google Keep) fordi det:
- Gjør informasjon lett å skanne
- Skaper tydelige visuelle grenser mellom oppgaver
- Er responsivt og tilpasser seg forskjellige skjermstørrelser

#### Responsivt Design

Designet er **mobile-first**:

- På mobil: Enkel kolonne med fullbredde kort
- På tablet: To kolonner med kompakt layout
- På desktop: Grid-layout med flere kolonner

**Begrunnelse**: Over 50% av webtrafikk kommer fra mobile enheter. Et mobile-first tilnærming sikrer god brukeropplevelse på alle enheter.

### 2. Brukeropplevelse (UX)

#### Øyeblikkelig Tilbakemelding

Jeg implementerte flere former for feedback:

- **Toast-varsler**: Små meldinger som bekrefter handlinger (opprettet, slettet, osv.)
- **Animasjoner**: Smooth overganger når oppgaver oppdateres
- **Hover-effekter**: Visuell respons når musen er over klikkbare elementer
- **Ladingstilstand**: Spinner mens data lastes

**Begrunnelse**: Brukere trenger å vite at deres handlinger har blitt registrert. Øyeblikkelig feedback reduserer usikkerhet og forbedrer tilliten til applikasjonen.

#### Bekreftelsesdialog for Sletting

Før en oppgave slettes, vises en bekreftelsesdialog.

**Begrunnelse**: Sletting er en destruktiv handling som ikke kan angres. En bekreftelse forhindrer utilsiktede slettinger og gir brukeren en siste sjanse til å ombestemme seg.

#### Søk med Debouncing

Søkefunksjonen venter 300ms etter at brukeren slutter å skrive før den sender forespørsel.

**Begrunnelse**: Uten debouncing ville hver tastetrykk utløse en API-forespørsel, som kan:
- Overbelaste serveren
- Føre til dårlig ytelse
- Øke nettverksbelastning

#### Sortering og Filtrering

Brukere kan filtrere oppgaver (alle/aktive/fullførte) og sortere etter ulike kriterier.

**Begrunnelse**: Etter hvert som antall oppgaver vokser, blir det vanskelig å finne spesifikke oppgaver. Filtrering og sortering gir brukeren kontroll over hvordan data presenteres.

---

## 🗄 Database-design

### Tabellstruktur

Jeg valgte en **enkeltabell-design** for dette prosjektet:

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Designbeslutninger

#### 1. Enkelt Tabell vs. Flere Tabeller

**Valg**: Én tabell for alle oppgaver

**Alternativer vurdert**:
- Separate tabeller for kategorier (normalisering)
- Separate tabeller for prioriteter

**Begrunnelse**:
- For dette prosjektets omfang er én tabell tilstrekkelig
- Enklere å forstå og vedlikeholde for et utdanningsprosjekt
- Færre JOIN-operasjoner = bedre ytelse for små datasett
- Kategorier er enkle strenger, ikke komplekse objekter

#### 2. INTEGER for completed (ikke BOOLEAN)

SQLite har ikke en dedikert BOOLEAN-type, så jeg bruker INTEGER:
- `0` = ikke fullført
- `1` = fullført

**Begrunnelse**: Dette er standard praksis i SQLite og er kompatibelt med hvordan SQLite håndterer boolske verdier.

#### 3. TEXT for Datoer (ikke DATE)

Datoer lagres som TEXT i ISO 8601-format (`YYYY-MM-DD`).

**Begrunnelse**:
- SQLite har begrenset støtte for DATE-typer
- TEXT med ISO 8601-format er standardisert og lett å sortere
- Enkel konvertering til JavaScript Date-objekter

#### 4. CHECK Constraint på Priority

```sql
CHECK(priority IN ('Low', 'Medium', 'High'))
```

**Begrunnelse**: Sikrer dataintegritet ved å forhindre ugyldige prioritetsverdier. Dette er en form for **validering på databasenivå** som utfyller validering på backend og frontend.

### Indeksering

Jeg opprettet indekser på:
- `completed` (for filtrering)
- `category` (for kategorifiltrering)
- `priority` (for sortering)
- `due_date` (for datosortering)

**Begrunnelse**: Indekser akselererer søk og sortering. Selv om datasettet er lite i dette prosjektet, demonstrerer det best practices for produksjonsklare applikasjoner.

---

## 🏗 Arkitektur

### Lagdelt Arkitektur (Layered Architecture)

Prosjektet følger en **3-lags arkitektur**:

```
┌─────────────────────────────┐
│   PRESENTASJONSLAG          │ ← HTML, CSS, JavaScript (frontend)
│   (Frontend)                │
└─────────────────────────────┘
            ↕
┌─────────────────────────────┐
│   APPLIKASJONSLAG           │ ← Express.js, Ruter, Middleware
│   (Backend API)             │
└─────────────────────────────┘
            ↕
┌─────────────────────────────┐
│   DATALAG                   │ ← SQLite, CRUD-funksjoner
│   (Database)                │
└─────────────────────────────┘
```

**Fordeler med denne arkitekturen**:
- **Separation of Concerns**: Hvert lag har et spesifikt ansvar
- **Vedlikeholdbarhet**: Endringer i ett lag påvirker ikke de andre
- **Testbarhet**: Hvert lag kan testes isolert
- **Skalerbarhet**: Enkelt å utvide eller erstatte enkeltlag

### Backend-struktur

```
server.js                    ← Hovedfil, Express-konfigurasjon
├── routes/taskRoutes.js     ← API-ruter
└── database/
    ├── db.js                ← CRUD-funksjoner
    └── schema.sql           ← Database-skjema
```

**Designprinsipper**:
- **Single Responsibility**: Hver modul har ett ansvar
- **DRY (Don't Repeat Yourself)**: Gjenbrukbare funksjoner
- **Modularitet**: Koden er delt inn i logiske moduler

### Frontend-struktur

```
public/
├── index.html               ← HTML-struktur
├── css/style.css            ← Styling
└── js/app.js                ← JavaScript-logikk
```

**Organisering**:
- **API-funksjoner**: Alle nettverksforespørsler samlet på ett sted
- **UI-funksjoner**: Rendring og DOM-manipulering
- **Event handlers**: Håndtering av brukerinteraksjoner
- **Utility functions**: Hjelpefunksjoner (datoformatering, validering)

---

## 🛠 Teknologiske Valg

### Backend

#### 1. Node.js + Express.js

**Hvorfor Node.js?**
- JavaScript både på frontend og backend = mindre kontekstbytte
- Stort økosystem av pakker (npm)
- Utmerket for I/O-intensive operasjoner som database-forespørsler
- Godt støttet og aktivt vedlikeholdt

**Hvorfor Express.js?**
- Minimalistisk og fleksibel
- Enkelt å sette opp RESTful APIer
- Stort community og mange ressurser
- Middleware-støtte for modularitet

**Alternativer vurdert**:
- **Fastify**: Raskere, men mer kompleks for dette prosjektet
- **Koa**: Moderne, men mindre community-støtte

#### 2. better-sqlite3 (ikke sqlite3)

**Fordeler med better-sqlite3**:
- **Synkron API**: Enklere å bruke enn async/await for SQLite
- **Raskere**: Bedre ytelse enn sqlite3-pakken
- **Enklere feilhåndtering**: Synkrone operasjoner er lettere å debugge
- **Godt vedlikeholdt**: Aktivt utviklet og oppdatert

**Begrunnelse**: For en SQLite-applikasjon er synkron tilgang logisk siden databasen er embedded (ikke nettverksbasert). Dette forenkler koden betraktelig.

### Frontend

#### Vanilla JavaScript (ingen frameworks)

**Hvorfor ikke React/Vue/Angular?**
- Prosjektets størrelse krever ikke et stort framework
- Lærer grunnleggende DOM-manipulering og event handling
- Mindre kompleksitet og ingen build-prosess nødvendig
- Raskere lasting uten framework overhead

**Fordeler med Vanilla JavaScript**:
- Full kontroll over koden
- Ingen avhengigheter eller versjonskonflikter
- Bedre forståelse av hvordan JavaScript fungerer
- Lettere å debugge

#### CSS (ingen preprocessors eller frameworks)

**Hvorfor ikke Sass/Less?**
- Moderne CSS har mange av funksjonene Sass tilbyr (variabler, nesting via CSS Modules)
- Ingen behov for build-prosess
- Enklere for nybegynnere å forstå

**Hvorfor ikke Tailwind/Bootstrap?**
- Bedre læring av CSS-fundamentaler
- Full kontroll over design uten å være begrenset av framework-konvensjoner
- Mindre filstørrelse

---

## 🔥 Utfordringer og Løsninger

### Utfordring 1: Asynkron vs. Synkron Database-tilgang

**Problem**: Skulle jeg bruke asynkrone (sqlite3) eller synkrone (better-sqlite3) database-operasjoner?

**Løsning**: Valgte better-sqlite3 (synkron) fordi:
- SQLite er embedded, ikke nettverksbasert
- Synkron kode er enklere å forstå
- Ingen reell ytelsesgevinst med async for SQLite

**Lærdom**: Ikke alle operasjoner trenger å være asynkrone. Velg riktig verktøy for jobben.

### Utfordring 2: Håndtering av Datoer

**Problem**: JavaScript og SQLite håndterer datoer forskjellig.

**Løsning**:
- Lagre datoer som TEXT i ISO 8601-format (`YYYY-MM-DD`)
- Bruke JavaScript's native Date-objekt for parsing
- Implementere hjelpefunksjoner for formatering

**Eksempel**:
```javascript
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}
```

**Lærdom**: Standardiserte formater (ISO 8601) gjør det enklere å jobbe med datoer på tvers av systemer.

### Utfordring 3: Real-time Statistikk

**Problem**: Statistikken i headeren må oppdateres hver gang en oppgave endres.

**Løsning**:
- Lag en egen API-endepunkt for statistikk (`/api/tasks/stats`)
- Hent statistikk hver gang oppgavelisten oppdateres
- Beregn statistikk på backend (ikke frontend) for å unngå manglende synkronisering

**Lærdom**: Backend bør være "source of truth" for alle data. Ikke stol på frontend-beregninger for kritiske data.

### Utfordring 4: Responsive Design

**Problem**: Oppgavekortene må se bra ut på alle skjermstørrelser.

**Løsning**:
- Brukte CSS Grid med `auto-fill` og `minmax()`
- Definerte breakpoints for mobil, tablet og desktop
- Mobile-first approach

**Eksempel**:
```css
.task-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
}

@media (max-width: 768px) {
    .task-list {
        grid-template-columns: 1fr;
    }
}
```

**Lærdom**: CSS Grid er kraftig for responsive layouts. `auto-fill` og `minmax()` gjør det enkelt å lage adaptive grid-systemer.

### Utfordring 5: Sikkerhet - XSS-angrep

**Problem**: Brukerinput kan inneholde ondsinnet JavaScript som kan utføres i nettleseren.

**Løsning**:
- Alltid escape HTML før innhold vises i DOM
- Bruke tekstContent i stedet for innerHTML når mulig
- Validere input på både frontend og backend

**Eksempel**:
```javascript
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

**Lærdom**: Aldri stole på brukerinput. Alltid validere og escape data.

---

## 🚀 Fremtidige Forbedringer

Hvis jeg skulle utvide prosjektet, ville jeg vurdere:

### 1. Brukerautentisering

**Funksjonalitet**:
- Registrering og innlogging
- Hver bruker har sine egne oppgaver
- Passordhashing med bcrypt

**Fordeler**:
- Flere brukere kan bruke samme applikasjon
- Personalisering og personvern

### 2. Delbare Oppgaver

**Funksjonalitet**:
- Dele oppgaver med andre brukere
- Tilordne oppgaver til teammedlemmer
- Kommentarer på oppgaver

**Fordeler**:
- Samarbeid og teamarbeid
- Bedre for prosjektstyring

### 3. Påminnelser og Varsler

**Funksjonalitet**:
- E-postvarsler for kommende forfallsdatoer
- Push-varsler i nettleseren
- Daglige sammendrag

**Fordeler**:
- Hjelper brukere å holde seg på sporet
- Øker produktivitet

### 4. Underoppgaver (Subtasks)

**Funksjonalitet**:
- Dele opp store oppgaver i mindre, håndterbare deler
- Sjekklister innenfor oppgaver

**Fordeler**:
- Bedre organisering av komplekse oppgaver
- Følelse av fremgang når underoppgaver fullføres

### 5. Data Export/Import

**Funksjonalitet**:
- Eksportere oppgaver til JSON, CSV eller PDF
- Importere oppgaver fra andre systemer

**Fordeler**:
- Backup av data
- Migrering mellom systemer

### 6. Dark Mode

**Funksjonalitet**:
- Bytte mellom lyst og mørkt tema
- Automatisk bytte basert på systeminnstillinger

**Fordeler**:
- Reduserer øyebelastning i mørke omgivelser
- Moderne UX-standard

### 7. Drag-and-Drop

**Funksjonalitet**:
- Dra oppgaver for å endre rekkefølge
- Dra oppgaver mellom kategorier

**Fordeler**:
- Mer intuitiv interaksjon
- Visuell og engasjerende UX

### 8. Offline Support

**Funksjonalitet**:
- Service Workers for offline-tilgang
- Synkronisering når tilkoblingen gjenopprettes

**Fordeler**:
- Fungerer selv uten internett
- Bedre ytelse med caching

---

## 🎓 Hva Jeg Lærte

### Tekniske Ferdigheter

1. **Database-integrasjon**:
   - Hvordan bruke SQLite med Node.js
   - SQL-grunnlag: CREATE, INSERT, UPDATE, DELETE, SELECT
   - Indeksering for ytelse
   - Database-design og normalisering

2. **Backend-utvikling**:
   - REST API-design
   - Express.js routing og middleware
   - Feilhåndtering og validering
   - Strukturering av backend-kode

3. **Frontend-utvikling**:
   - DOM-manipulering med vanilla JavaScript
   - Fetch API for HTTP-forespørsler
   - Event handling og delegering
   - Responsiv design med CSS Grid og Flexbox

4. **Full-stack integrasjon**:
   - Kobling mellom frontend og backend
   - RESTful API-kommunikasjon
   - Dataflyt gjennom applikasjonen

### Programmeringsprinsipper

1. **Separation of Concerns**: Holde ulike aspekter av applikasjonen separert
2. **DRY (Don't Repeat Yourself)**: Gjenbruk av kode og funksjoner
3. **KISS (Keep It Simple, Stupid)**: Enkel er ofte bedre enn komplisert
4. **Defensive Programming**: Validere input og håndtere feil
5. **Code Documentation**: Kommentarer for å forklare intensjon og logikk

### Beste Praksis

1. **Git-versjonskontroll**: Regelmessige commits med beskrivende meldinger
2. **Kodeorganisering**: Logisk mappestruktur og filnavn
3. **Kodestil**: Konsistent formatering og navngivning
4. **Sikkerhet**: Aldri stole på brukerinput
5. **Ytelse**: Optimalisering av database-spørringer og nettverksforespørsler

### Problemløsning

- Hvordan debugge full-stack applikasjoner
- Bruke utviklerverktøy i nettleseren
- Lese og forstå feilmeldinger
- Bryte ned store problemer i mindre deler
- Søke etter løsninger og lære av dokumentasjon

---

## 🎯 Konklusjon

Dette prosjektet har vært en omfattende læring i full-stack webutvikling. Jeg har gått fra en tom mappe til en fullt funksjonell, profesjonell webapplikasjon som demonstrerer:

✅ **Database-kompetanse**: Effektiv bruk av SQLite for datalagring
✅ **Backend-kompetanse**: Solid RESTful API med Express.js
✅ **Frontend-kompetanse**: Moderne, responsivt grensesnitt
✅ **Arkitektur**: Godt strukturert og vedlikeholdbar kode
✅ **Beste praksis**: Sikkerhet, ytelse, og kodekvalitet

Viktigst av alt har jeg lært viktigheten av **planlegging** og **iterativ utvikling**. Hvert feature ble bygget steg-for-steg, testet og forbedret.

Dette prosjektet er ikke bare en oppgave - det er et fundament for fremtidig utvikling som fullstack-utvikler.

---

**Dato**: 28. januar 2026
**Prosjekt**: Todo Manager - Databaseoppgave
**Status**: ✅ Fullført

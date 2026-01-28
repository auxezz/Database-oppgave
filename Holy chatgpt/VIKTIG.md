# 📋 Todo Manager - Oppgavebehandling

En moderne og profesjonell Todo/Oppgave-behandlingsapplikasjon bygget med Node.js, Express og SQLite database.

## 📖 Innholdsfortegnelse

- [Om Prosjektet](#om-prosjektet)
- [Funksjoner](#funksjoner)
- [Teknologier](#teknologier)
- [Installasjon](#installasjon)
- [Bruk](#bruk)
- [Prosjektstruktur](#prosjektstruktur)
- [API Dokumentasjon](#api-dokumentasjon)

## 🎯 Om Prosjektet

Todo Manager er en fullstack webapplikasjon som lar brukere organisere og administrere sine oppgaver effektivt. Applikasjonen demonstrerer:

- ✅ Integrering av SQLite database
- ✅ RESTful API-design
- ✅ Moderne og responsivt brukergrensesnitt
- ✅ CRUD-operasjoner (Create, Read, Update, Delete)
- ✅ Filtrering, sortering og søkefunksjonalitet
- ✅ Godt organisert og kommentert kode

Dette prosjektet ble utviklet som en del av en databaseoppgave for å demonstrere forståelse av database-integrasjon, backend-utvikling og frontend-design.

## ✨ Funksjoner

### Grunnleggende Funksjoner

- **Opprett Oppgaver**: Legg til nye oppgaver med tittel, beskrivelse, kategori, prioritet og forfallsdato
- **Vis Oppgaver**: Se alle oppgaver i et oversiktlig kortformat
- **Rediger Oppgaver**: Endre detaljer på eksisterende oppgaver
- **Slett Oppgaver**: Fjern oppgaver med bekreftelse
- **Fullfør Oppgaver**: Marker oppgaver som fullført eller ikke fullført

### Avanserte Funksjoner

- **Filtrering**:
  - Alle oppgaver
  - Kun aktive oppgaver
  - Kun fullførte oppgaver

- **Sortering**:
  - Standard sortering (ufullførte først)
  - Etter prioritet (høy, medium, lav)
  - Etter forfallsdato
  - Etter opprettelsesdato

- **Søk**: Finn oppgaver ved å søke i tittel eller beskrivelse

- **Statistikk**:
  - Totalt antall oppgaver
  - Antall fullførte oppgaver
  - Antall gjenstående oppgaver

- **Visuell Feedback**:
  - Fargekodede prioriteter (Høy=rød, Medium=gul, Lav=grønn)
  - Merking av forfalte oppgaver
  - Animasjoner og overganger
  - Toast-varsler for brukerhandlinger

### Brukeropplevelse

- 📱 **Responsiv Design**: Fungerer sømløst på mobil, tablet og desktop
- 🎨 **Moderne Grensesnitt**: Rent og intuitivt design
- ⚡ **Rask Ytelse**: Optimalisert for hastighet
- 💾 **Persistent Lagring**: Data lagres i SQLite database

## 🛠 Teknologier

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **SQLite3**: Embedded SQL database
- **better-sqlite3**: Synkron SQLite driver for Node.js

### Frontend

- **HTML5**: Semantisk markup
- **CSS3**: Moderne styling med CSS Grid og Flexbox
- **Vanilla JavaScript**: Ren JavaScript (ingen frameworks)

### Utviklingsverktøy

- **Nodemon**: Auto-restart av server under utvikling
- **Git**: Versjonskontroll

## 📥 Installasjon

### Forutsetninger

Før du starter, må du ha følgende installert på datamaskinen din:

- [Node.js](https://nodejs.org/) (versjon 14 eller nyere)
- [npm](https://www.npmjs.com/) (følger med Node.js)
- [Git](https://git-scm.com/) (valgfritt, for kloning av repository)

### Steg-for-steg Installasjon

1. **Klon eller last ned prosjektet**

   ```bash
   git clone <repository-url>
   cd Database-oppgave
   ```

   Eller last ned ZIP-filen og pakk den ut.

2. **Installer avhengigheter**

   ```bash
   npm install
   ```

   Dette vil installere:
   - express
   - better-sqlite3
   - nodemon (dev dependency)

3. **Start serveren**

   For produksjon:
   ```bash
   npm start
   ```

   For utvikling (med auto-restart):
   ```bash
   npm run dev
   ```

4. **Åpne applikasjonen**

   Åpne nettleseren din og gå til:
   ```
   http://localhost:3000
   ```

## 🎮 Bruk

### Opprette en Oppgave

1. Klikk på **"Ny Oppgave"** knappen øverst til høyre
2. Fyll ut skjemaet:
   - **Tittel** (påkrevd): Gi oppgaven en beskrivende tittel
   - **Beskrivelse** (valgfri): Legg til detaljer om oppgaven
   - **Kategori**: Velg en kategori (Generelt, Arbeid, Personlig, Skole, osv.)
   - **Prioritet**: Sett prioritet (Lav, Medium, Høy)
   - **Forfallsdato** (valgfri): Velg når oppgaven skal være ferdig
3. Klikk **"Lagre"** for å opprette oppgaven

### Redigere en Oppgave

1. Finn oppgaven du vil redigere
2. Klikk på **"Rediger"** knappen på oppgavekortet
3. Endre ønskede felter i skjemaet
4. Klikk **"Lagre"** for å lagre endringene

### Fullføre en Oppgave

1. Finn oppgaven du vil markere som fullført
2. Klikk på avkrysningsboksen til venstre på oppgavekortet
3. Oppgaven vil bli markert som fullført og vises med gjennomstreking

### Slette en Oppgave

1. Finn oppgaven du vil slette
2. Klikk på **"Slett"** knappen på oppgavekortet
3. Bekreft slettingen i dialogboksen

### Filtrere Oppgaver

Bruk filterknappene for å vise:
- **Alle**: Viser alle oppgaver
- **Aktive**: Viser kun ufullførte oppgaver
- **Fullført**: Viser kun fullførte oppgaver

### Sortere Oppgaver

Bruk sorteringsdropdown-menyen for å sortere oppgaver etter:
- **Standard**: Ufullførte oppgaver først, deretter etter forfallsdato
- **Prioritet**: Høy prioritet først
- **Forfallsdato**: Nærmeste forfallsdato først
- **Opprettet**: Nyeste oppgaver først

### Søke etter Oppgaver

1. Skriv inn søkeord i søkefeltet øverst
2. Applikasjonen vil automatisk filtrere oppgaver som matcher søket
3. Søket finner treff i både tittel og beskrivelse

## 📁 Prosjektstruktur

```
Database-oppgave/
│
├── data/                          # Database-filer (auto-generert)
│   └── tasks.db                   # SQLite database
│
├── src/
│   ├── database/
│   │   ├── db.js                  # Database-tilkobling og CRUD-funksjoner
│   │   └── schema.sql             # SQL-schema definisjoner
│   │
│   ├── routes/
│   │   └── taskRoutes.js          # API-ruter for oppgaver
│   │
│   └── public/
│       ├── index.html             # Hovedside
│       ├── css/
│       │   └── style.css          # Styling
│       └── js/
│           └── app.js             # Frontend JavaScript
│
├── docs/
│   └── DOKUMENTASJON.md           # Prosjektdokumentasjon
│
├── .gitignore                     # Git ignore-regler
├── package.json                   # npm-avhengigheter og scripts
├── server.js                      # Express server entry point
└── VIKTIG.md                      # Denne filen
```

## 🔌 API Dokumentasjon

Applikasjonen tilbyr et RESTful API for oppgaveadministrasjon.

### Base URL

```
http://localhost:3000/api
```

### Endepunkter

#### Hent alle oppgaver

```http
GET /tasks
```

**Query Parameters:**
- `completed` (valgfri): 0 eller 1 for å filtrere etter fullføringsstatus
- `search` (valgfri): Søkeord for å finne oppgaver

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "Fullføre databaseoppgave",
      "description": "Bygge todo-app med SQLite",
      "category": "Skole",
      "priority": "Høy",
      "due_date": "2026-02-15",
      "completed": 0,
      "created_at": "2026-01-28T15:30:00.000Z",
      "updated_at": "2026-01-28T15:30:00.000Z"
    }
  ]
}
```

#### Hent statistikk

```http
GET /tasks/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 4,
    "pending": 6,
    "overdue": 2,
    "completionRate": 40,
    "byPriority": [...],
    "byCategory": [...]
  }
}
```

#### Hent enkelt oppgave

```http
GET /tasks/:id
```

#### Opprett ny oppgave

```http
POST /tasks
Content-Type: application/json

{
  "title": "Oppgavetittel",
  "description": "Beskrivelse",
  "category": "Arbeid",
  "priority": "Medium",
  "due_date": "2026-02-01"
}
```

#### Oppdater oppgave

```http
PUT /tasks/:id
Content-Type: application/json

{
  "title": "Oppdatert tittel",
  "completed": 1
}
```

#### Bytt fullføringsstatus

```http
PATCH /tasks/:id/toggle
```

#### Slett oppgave

```http
DELETE /tasks/:id
```

## 🎓 Læringsutbytte

Dette prosjektet demonstrerer:

1. **Database-integrasjon**: Bruk av SQLite for datalagring
2. **Backend-utvikling**: API-utvikling med Express.js
3. **Frontend-utvikling**: Moderne UI med vanilla JavaScript
4. **Full-stack utvikling**: Kobling mellom frontend og backend
5. **Kodekvalitet**: Godt kommentert og organisert kode
6. **Best practices**: RESTful API-design, feilhåndtering, sikkerhet

## 🐛 Feilsøking

### Databasen opprettes ikke

- Sørg for at `data/` mappen kan opprettes i prosjektmappen
- Sjekk at du har skrivetillatelser

### Server starter ikke

- Kontroller at port 3000 ikke er i bruk av et annet program
- Sjekk at alle avhengigheter er installert (`npm install`)

### Oppgaver vises ikke

- Åpne utviklerkonsollen i nettleseren (F12) og se etter feilmeldinger
- Sjekk at serveren kjører uten feil

## 📝 Lisens

Dette prosjektet er utviklet for utdanningsformål.

## 👤 Forfatter

Laget med ❤️ som en del av databaseoppgaven 2026

---

**Happy Task Managing! 📋✨**

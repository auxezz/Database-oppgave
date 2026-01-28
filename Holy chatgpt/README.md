# Todo Manager - Quick Start

En moderne Todo/Oppgave-behandlingsapplikasjon med SQLite database.

## 🚀 Rask Start

### 1. Installer Avhengigheter
```bash
npm install
```

### 2. Start Serveren
```bash
npm start
```

### 3. Åpne Nettleseren
Gå til: **http://localhost:3000**

## 📂 Prosjektstruktur

```
Database-oppgave/
├── server.js                  # Express server
├── package.json              # Avhengigheter
├── VIKTIG.md                 # Fullstendig dokumentasjon
│
├── src/
│   ├── database/
│   │   ├── db.js             # Database CRUD funksjoner
│   │   └── schema.sql        # SQL schema
│   │
│   ├── routes/
│   │   └── taskRoutes.js     # API ruter
│   │
│   └── public/
│       ├── index.html        # Hovedside
│       ├── css/style.css     # Styling
│       └── js/app.js         # Frontend logikk
│
├── data/                     # Database lagring (auto-generert)
│   └── tasks.db             # SQLite database
│
└── docs/
    └── DOKUMENTASJON.md     # Detaljert prosjektdokumentasjon
```

## ✨ Funksjoner

- ✅ Opprett, Les, Oppdater, Slett oppgaver (CRUD)
- 🔍 Søk og filtrer oppgaver
- 📊 Sorter etter prioritet, dato, kategori
- 📈 Statistikk og oversikt
- 📱 Responsiv design (mobil, tablet, desktop)
- 🎨 Moderne og intuitivt grensesnitt
- 💾 Persistent lagring med SQLite

## 🛠 Teknologier

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite

## 📖 Dokumentasjon

For fullstendig dokumentasjon, se:
- **[VIKTIG.md](./VIKTIG.md)** - Installasjon, bruk, API
- **[docs/DOKUMENTASJON.md](./docs/DOKUMENTASJON.md)** - Designvalg, utfordringer, læring

## 🔌 API Endepunkter

- `GET /api/tasks` - Hent alle oppgaver
- `GET /api/tasks/:id` - Hent enkelt oppgave
- `POST /api/tasks` - Opprett ny oppgave
- `PUT /api/tasks/:id` - Oppdater oppgave
- `PATCH /api/tasks/:id/toggle` - Bytt fullføringsstatus
- `DELETE /api/tasks/:id` - Slett oppgave
- `GET /api/tasks/stats` - Hent statistikk

## 🎓 Oppgavekrav

Dette prosjektet oppfyller alle krav:
- ✅ SQLite database integrasjon
- ✅ Godt design og brukergrensesnitt
- ✅ Klare kommentarer i koden
- ✅ Organisert kodestruktur
- ✅ Fullstendig dokumentasjon (README + DOKUMENTASJON.md)

## 💡 Utviklingsmodus

For utvikling med auto-restart:
```bash
npm run dev
```

---

**Laget for databaseoppgave 2026**

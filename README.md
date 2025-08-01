# Marina Fatture 💼

Un'applicazione web semplice e potente per la gestione di fornitori e fatture, con integrazione AI per analisi intelligenti.

## ✨ Features

- 📊 **Dashboard** con statistiche in tempo reale
- 👥 **Gestione Fornitori** con validazione P.IVA italiana
- 🧾 **Gestione Fatture** con associazione automatica fornitori
- 📱 **Completamente Responsiva** - perfetta su tutti i dispositivi
- 🤖 **Analisi AI** tramite OpenRouter per report intelligenti
- 💾 **Doppio Storage** - Supabase cloud + localStorage fallback
- 🚀 **Deploy-ready** per Netlify con zero configurazione

## 🏗️ Architettura

```
📁 marina-fatture/
├── 📄 index.html              # SPA principale
├── 📁 css/
│   └── 🎨 styles.css          # Stili responsivi
├── 📁 js/
│   ├── ⚙️ config.js           # Configurazione (API keys, settings)
│   ├── 🗄️ database.js         # Gestione dati (Supabase + localStorage)
│   ├── 🤖 llm.js              # Integrazione OpenRouter AI
│   └── 🎯 app.js              # Logica applicazione
└── 📁 docs/
    ├── 📋 PIANO_SVILUPPO.md   # Piano di sviluppo completo
    ├── 🔧 SCHEMA_TECNICO.md   # Documentazione tecnica
    └── 🗄️ DATABASE_SETUP.md   # Guida setup database
```

## 🚀 Quick Start

### 1. Setup Locale

```bash
# Clone del progetto
git clone [repository-url]
cd marina-fatture

# Apri index.html nel browser
open index.html
```

### 2. Configurazione Database (Opzionale)

Per persistenza cloud, segui la guida completa in [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md):

1. **Crea account** su [Supabase](https://supabase.com)
2. **Crea progetto** `marina-fatture`
3. **Esegui SQL** per creare tabelle
4. **Configura** credenziali in `js/config.js`

### 3. Configurazione AI (Opzionale)

Per report intelligenti:

1. **Registrati** su [OpenRouter](https://openrouter.ai)
2. **Ottieni API key** gratuita
3. **Configura** in `js/config.js`:

```javascript
LLM: {
    API_KEY: 'sk-or-v1-...',  // La tua API key
    MODEL_ID: 'openai/gpt-3.5-turbo'
}
```

**⚠️ Nota per il Deploy**: L'app funziona anche senza API key AI (userà solo localStorage per i dati).

### 4. Deploy su Netlify

#### Opzione A: Deploy Semplice
1. **Drag & drop** la cartella su [Netlify](https://netlify.com)
2. **Deploy automatico** - nessuna configurazione richiesta!
3. L'app funzionerà con localStorage (dati locali nel browser)

#### Opzione B: Deploy con Database Cloud (Consigliato)
1. **Deploy** il repository su Netlify via GitHub
2. **Aggiungi variabili d'ambiente** nel dashboard Netlify:
   - `SUPABASE_URL`: Il tuo URL Supabase
   - `SUPABASE_ANON_KEY`: La tua chiave anonima Supabase
   - `OPENROUTER_API_KEY`: La tua API key OpenRouter (opzionale)
3. **Redeploy** automatico ad ogni push su GitHub

## 💡 Come Usare

### Gestione Fornitori
- **Aggiungi fornitori** con nome e P.IVA (opzionale)
- **Validazione automatica** P.IVA italiana
- **Modifica/Elimina** con conferme di sicurezza

### Gestione Fatture
- **Crea fatture** associando fornitore, importo, data
- **Visualizzazione cronologica** con dettagli completi
- **Eliminazione sicura** con conferma

### Dashboard & Analytics
- **Statistiche real-time**: totale fornitori, fatture, importi
- **Report AI**: analisi finanziarie, classificazione fornitori
- **Insights automatici** su trend e ottimizzazioni

## 🔧 Configurazione Avanzata

### File `js/config.js`

```javascript
const CONFIG = {
    // 🤖 Configurazione LLM
    LLM: {
        API_KEY: '',                           // OpenRouter API key
        MODEL_ID: 'openai/gpt-3.5-turbo',    // Modello da usare
        SYSTEM_PROMPT: '...'                   // Prompt specializzato
    },
    
    // 🗄️ Configurazione Database
    DATABASE: {
        URL: '',                               // Supabase project URL
        ANON_KEY: ''                          // Supabase anon key
    },
    
    // ⚙️ Impostazioni App
    APP: {
        DEBUG: false,                          // Abilita per logs dettagliati
        LOCALE: 'it-IT',                      // Localizzazione italiana
        CURRENCY: 'EUR'                       // Valuta europea
    }
};
```

## 📚 Documentazione

- **[📋 Piano Sviluppo](docs/PIANO_SVILUPPO.md)** - Roadmap completa e architettura
- **[🔧 Schema Tecnico](docs/SCHEMA_TECNICO.md)** - Dettagli implementazione e API
- **[🗄️ Database Setup](docs/DATABASE_SETUP.md)** - Guida completa Supabase

## 🛠️ Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: PostgreSQL (Supabase) + localStorage fallback
- **AI**: OpenRouter API per analisi intelligenti
- **Deploy**: Netlify static hosting
- **Styling**: CSS Grid/Flexbox nativi, design responsive

## 🔒 Sicurezza & Privacy

- ✅ **Validazione input** client-side
- ✅ **Escape HTML** per prevenire XSS
- ✅ **API keys** non committate in repository
- ✅ **Fallback localStorage** per funzionamento offline
- ✅ **HTTPS only** in produzione

## 📊 Limiti & Scalabilità

### Tier Gratuito Supabase
- **500MB** storage database
- **2GB/mese** bandwidth
- **Ideale** per uso personale/piccole aziende

### Performance
- **Bundle size**: < 100KB JavaScript
- **Load time**: < 2 secondi
- **Mobile-first**: Ottimizzato per dispositivi mobili

## 🚧 Roadmap

### ✅ Fase 1 - MVP (Completata)
- [x] CRUD fornitori e fatture
- [x] Dashboard con statistiche
- [x] Design responsivo
- [x] Integrazione database e AI

### 🔄 Fase 2 - UX Enhancement
- [ ] Toast notifications
- [ ] Filtri e ricerca avanzata
- [ ] Ordinamento colonne
- [ ] Dark mode

### 🚀 Fase 3 - Advanced Features
- [ ] Export PDF/CSV
- [ ] Import da file
- [ ] Grafici interattivi
- [ ] Gestione categorie

### 🤖 Fase 4 - AI Enhancement
- [ ] OCR fatture PDF
- [ ] Classificazione automatica
- [ ] Previsioni trend
- [ ] Suggerimenti ottimizzazione

## 🐛 Troubleshooting

### App usa localStorage invece di Supabase
1. Verifica URL e API key in `config.js`
2. Controlla console per errori di connessione
3. Testa connessione manualmente in console

### Errori LLM
1. Verifica API key OpenRouter in `config.js`
2. Controlla quota API rimanente
3. Prova con modello diverso

### Performance lenta
1. Abilita `CONFIG.APP.DEBUG = true`
2. Monitora Network tab in browser
3. Verifica latenza database Supabase

## 🤝 Contribuire

1. **Fork** il repository
2. **Crea branch** per feature (`git checkout -b feature/amazing-feature`)
3. **Commit** modifiche (`git commit -m 'Add amazing feature'`)
4. **Push** su branch (`git push origin feature/amazing-feature`)
5. **Apri Pull Request**

## 📄 License

Questo progetto è open source sotto licenza MIT. Vedi `LICENSE` per dettagli.

## 💬 Supporto

- 📖 **Documentazione**: Controlla cartella `docs/`
- 🐛 **Bug reports**: Apri issue su GitHub
- 💡 **Feature requests**: Discussioni GitHub
- 📧 **Contatto**: [tuo-email@esempio.com]

---

**Marina Fatture** - Gestione fatture semplice, potente e intelligente 🚀
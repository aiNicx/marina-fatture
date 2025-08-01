# Piano di Sviluppo - Marina Fatture

## Overview del Progetto

**Marina Fatture** è un'applicazione web semplice e manutenibile per la gestione di fornitori e fatture, sviluppata con tecnologie web standard (HTML, CSS, JavaScript) e predisposta per l'integrazione con AI e database cloud.

## Obiettivi

- ✅ **Semplicità**: Codice pulito, organizzato e facilmente manutenibile
- ✅ **Responsività**: Interfaccia user-friendly su tutti i dispositivi
- ✅ **Modularità**: Architettura componibile per future estensioni
- ✅ **Cloud-ready**: Predisposta per deploy su Netlify con database remoto
- ✅ **AI-enhanced**: Integrazione LLM per analisi e report intelligenti

## Architettura del Sistema

### Struttura dei File

```
marina-fatture/
├── index.html              # Pagina principale SPA
├── css/
│   └── styles.css          # Stili responsivi e componenti UI
├── js/
│   ├── config.js           # Configurazione globale (API keys, settings)
│   ├── database.js         # Gestione dati (Supabase + localStorage fallback)
│   ├── llm.js             # Integrazione OpenRouter LLM
│   └── app.js             # Logica applicazione principale
└── docs/
    ├── PIANO_SVILUPPO.md   # Questo documento
    ├── SCHEMA_TECNICO.md   # Dettagli tecnici e API
    └── DATABASE_SETUP.md   # Guida setup database
```

### Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: Supabase (PostgreSQL) con fallback localStorage
- **AI/LLM**: OpenRouter API per analisi intelligenti
- **Deploy**: Netlify per hosting statico
- **Styling**: CSS nativo con Grid/Flexbox, design responsive

## Funzionalità Implementate

### Core Features
- ✅ **Dashboard**: Statistiche in tempo reale (fornitori, fatture, importi)
- ✅ **Gestione Fornitori**: CRUD completo con validazione P.IVA
- ✅ **Gestione Fatture**: Associazione fornitori, validazione dati
- ✅ **Interfaccia Responsiva**: Mobile-first design

### Features Avanzate
- ✅ **Modulo LLM**: Integrazione OpenRouter per report AI
- ✅ **Doppio Storage**: Supabase cloud + localStorage fallback
- ✅ **Validazione Avanzata**: P.IVA italiana, numeri fattura
- ✅ **Configurazione Modulare**: File config centralizzato

## Modello Dati

### Tabella `suppliers` (Fornitori)
```sql
- id: TEXT PRIMARY KEY
- name: TEXT NOT NULL
- vat: TEXT (P.IVA opzionale)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabella `invoices` (Fatture)
```sql
- id: TEXT PRIMARY KEY
- number: TEXT NOT NULL (numero fattura)
- supplier_id: TEXT REFERENCES suppliers(id)
- amount: DECIMAL(10,2) NOT NULL
- date: DATE NOT NULL
- created_at: TIMESTAMP
```

## Configurazione LLM

### OpenRouter Integration
- **API**: https://openrouter.ai/api/v1
- **Modello Default**: `openai/gpt-3.5-turbo`
- **System Prompt**: Specializzato per analisi finanziarie

### Funzionalità AI
- **Analisi Finanziaria**: Trend spese, anomalie, insights
- **Classificazione Fornitori**: Categorizzazione automatica
- **Report Personalizzati**: Analisi su richiesta dell'utente

## Roadmap di Sviluppo

### Fase 1: MVP ✅ (Completata)
- [x] Struttura base applicazione
- [x] CRUD fornitori e fatture
- [x] Dashboard con statistiche
- [x] Responsive design
- [x] Configurazione database e LLM

### Fase 2: Miglioramenti UI/UX
- [ ] Toast notifications invece di alert()
- [ ] Filtri e ricerca avanzata
- [ ] Ordinamento tabelle
- [ ] Paginazione per grandi dataset
- [ ] Dark mode toggle

### Fase 3: Features Avanzate
- [ ] Export dati (CSV, PDF)
- [ ] Import fatture da file
- [ ] Grafici e visualizzazioni
- [ ] Backup automatico dati
- [ ] Gestione categorie spese

### Fase 4: AI Enhancement
- [ ] Estrazione dati da PDF fatture
- [ ] Classificazione automatica spese
- [ ] Previsioni trend future
- [ ] Ottimizzazione suggerita fornitori

## Deploy e Configurazione

### Setup Iniziale
1. **Clone repository** su macchina locale
2. **Configura Supabase** (vedi DATABASE_SETUP.md)
3. **Configura OpenRouter** API key in config.js
4. **Deploy su Netlify** (drag & drop cartella progetto)

### Configurazione Files
- **`js/config.js`**: Inserire API keys e URL database
- **Supabase**: Configurare tabelle e RLS policies
- **Netlify**: Configurare redirects per SPA se necessario

## Manutenibilità e Best Practices

### Principi di Design
- **Separation of Concerns**: Ogni file ha responsabilità specifiche
- **Progressive Enhancement**: Fallback localStorage se database offline
- **Error Handling**: Gestione robusta degli errori
- **Responsive First**: Design mobile-first

### Convenzioni Codice
- **ES6+ Features**: Arrow functions, async/await, destructuring
- **Naming**: CamelCase per variabili, kebab-case per CSS
- **Comments**: Documentazione inline per logica complessa
- **Modularità**: Classi e funzioni riutilizabili

### Sicurezza
- **Input Validation**: Sanitizzazione e validazione lato client
- **XSS Prevention**: Escape HTML nei template
- **API Keys**: Non committare chiavi in repository pubblici
- **CORS**: Configurazione appropriata per API esterne

## Testing e Debug

### Debug Mode
- Abilitare `CONFIG.APP.DEBUG = true` per logs dettagliati
- Console browser per monitoraggio errori
- Network tab per verificare chiamate API

### Testing Strategy
- **Manual Testing**: Verifiche funzionalità principali
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS Safari, Android Chrome
- **Performance**: Lighthouse audit

## Considerazioni Performance

### Ottimizzazioni Implementate
- **Lazy Loading**: Caricamento dati on-demand per vista
- **Local Storage**: Cache per ridurre chiamate API
- **CSS Efficient**: Grid/Flexbox nativi senza framework
- **Minimal Dependencies**: Solo librerie essenziali

### Monitoraggio
- **Bundle Size**: Mantenere JavaScript sotto 100KB
- **Load Time**: Target sotto 2 secondi
- **Mobile Performance**: Priorità user experience mobile

## Supporto e Manutenzione

### Log e Monitoring
- Console logs per debug (CONFIG.APP.DEBUG)
- Error tracking via ConfigUtils.error()
- User feedback via alert (da migliorare con toast)

### Backup Strategy
- **Database**: Backup automatico Supabase
- **LocalStorage**: Export manuale dati utente
- **Code**: Version control Git

Questo piano fornisce una roadmap completa per lo sviluppo e la manutenzione dell'applicazione, mantenendo focus su semplicità, scalabilità e user experience.
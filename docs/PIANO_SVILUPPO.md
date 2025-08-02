# Piano di Sviluppo - Marina Fatture

## Architettura

### Struttura Files
```
marina-fatture/
├── index.html              # SPA principale
├── css/styles.css          # Stili responsivi
├── js/
│   ├── config.js           # Configurazione globale
│   ├── database.js         # Gestione dati (Supabase + localStorage)
│   ├── llm.js             # Integrazione OpenRouter
│   ├── env.js             # Gestione variabili d'ambiente
│   └── app.js             # Logica applicazione
├── netlify/functions/      # Funzioni serverless
└── docs/                   # Documentazione
```

### Tecnologie
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: Supabase (PostgreSQL) + localStorage fallback
- **AI**: OpenRouter API
- **Deploy**: Netlify

## Modello Dati

### Suppliers (Fornitori)
```sql
- id: TEXT PRIMARY KEY
- name: TEXT NOT NULL
- vat: TEXT (P.IVA opzionale)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Invoices (Fatture)
```sql
- id: TEXT PRIMARY KEY
- number: TEXT NOT NULL
- supplier_id: TEXT REFERENCES suppliers(id)
- amount: DECIMAL(10,2)
- date: DATE
- created_at: TIMESTAMP
```

## Funzionalità

### ✅ Implementate
- Dashboard con statistiche
- CRUD fornitori e fatture
- Validazione P.IVA italiana
- Chat AI con OpenRouter
- Design responsivo
- Dual storage (Supabase + localStorage)

### 🔄 Roadmap

#### Fase 2 - UX Enhancement
- [ ] Toast notifications invece di alert()
- [ ] Filtri e ricerca
- [ ] Ordinamento tabelle
- [ ] Dark mode

#### Fase 3 - Features Avanzate
- [ ] Export CSV/PDF
- [ ] Import fatture da file
- [ ] Grafici e visualizzazioni
- [ ] Gestione categorie spese

#### Fase 4 - AI Enhancement
- [ ] OCR per estrazione dati da PDF
- [ ] Classificazione automatica spese
- [ ] Previsioni trend
- [ ] Suggerimenti ottimizzazione

## Configurazione LLM

### OpenRouter Integration
- **API**: https://openrouter.ai/api/v1
- **Modello Default**: `qwen/qwen3-30b-a3b:free`
- **System Prompt**: Specializzato per analisi finanziarie

### Funzionalità AI
- Analisi trend spese
- Classificazione fornitori
- Report personalizzati
- Insights su anomalie

## Deploy

### Netlify (Consigliato)
1. Push su GitHub
2. Connetti repository su Netlify
3. Deploy automatico
4. Configura variabile `OPENROUTER_API_KEY`

### Configurazione
- **Build command**: vuoto
- **Publish directory**: `.`
- **Functions directory**: `netlify/functions`

## Sicurezza

### Client-side
- Validazione input con regex
- Escape HTML per prevenire XSS
- Sanitizzazione dati

### API Keys
- Variabili d'ambiente per production
- localStorage solo per sviluppo locale
- Non committate in repository

## Performance

### Ottimizzazioni
- Bundle size < 100KB
- Lazy loading dati per vista
- Cache localStorage
- CSS nativo (no framework)

### Monitoraggio
- Console logs per debug
- Error tracking
- Performance audit con Lighthouse

## Manutenzione

### Best Practices
- Separation of concerns
- Progressive enhancement
- Error handling robusto
- Documentazione inline

### Testing
- Manual testing cross-browser
- Mobile testing (iOS/Android)
- Performance testing
- Accessibilità

L'architettura è progettata per semplicità, manutenibilità e scalabilità futura.
# Marina Fatture 💼

Applicazione web per gestione fornitori e fatture con integrazione AI.

## ✨ Features

- 📊 **Dashboard** con statistiche in tempo reale
- 👥 **Gestione Fornitori** con validazione P.IVA italiana
- 🧾 **Gestione Fatture** con associazione automatica fornitori
- 📱 **Completamente Responsiva**
- 🤖 **Chat AI** per analisi intelligenti (OpenRouter)
- 💾 **Dual Storage** - Supabase cloud + localStorage fallback
- 🚀 **Deploy-ready** per Netlify

## 🚀 Quick Start

### 1. Setup Locale
```bash
git clone [repository-url]
cd marina-fatture
open index.html
```

### 2. Deploy su Netlify

1. **Push su GitHub**
2. **Connetti repository** su [Netlify](https://netlify.com)
3. **Deploy automatico** - zero configurazione!

#### Variabili d'ambiente (opzionali):
- `OPENROUTER_API_KEY` - Per chat AI
- Database Supabase già configurato

## 🔧 Configurazione

### Database Supabase (opzionale)
1. Crea account su [Supabase](https://supabase.com)
2. Crea progetto e esegui SQL da `docs/DATABASE_SETUP.md`
3. Aggiorna credenziali in `js/config.js`

### Chat AI (opzionale)
1. Registrati su [OpenRouter](https://openrouter.ai)
2. Ottieni API key gratuita
3. Aggiungi come variabile d'ambiente `OPENROUTER_API_KEY`

## 📚 Documentazione

- **[Database Setup](docs/DATABASE_SETUP.md)** - Configurazione Supabase
- **[Piano Sviluppo](docs/PIANO_SVILUPPO.md)** - Roadmap e architettura
- **[Schema Tecnico](docs/SCHEMA_TECNICO.md)** - Dettagli implementazione

## 🛠️ Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: PostgreSQL (Supabase) + localStorage fallback
- **AI**: OpenRouter API
- **Deploy**: Netlify

## 🔒 Sicurezza

- ✅ Validazione input client-side
- ✅ API keys come variabili d'ambiente
- ✅ Fallback localStorage per offline
- ✅ HTTPS only in produzione

## 📄 License

MIT License - Vedi LICENSE per dettagli.
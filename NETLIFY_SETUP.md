# Configurazione Netlify per Marina Fatture

## 📋 Passaggi per il Deployment

### 1. Preparazione Repository
- Assicurati che tutto il codice sia commitato su Git
- Verifica che non ci siano API key hardcoded nel codice

### 2. Configurazione Netlify

#### A. Connetti il Repository
1. Vai su [Netlify](https://netlify.com)
2. Clicca "New site from Git"
3. Connetti il tuo repository GitHub/GitLab
4. Seleziona il branch principale (main/master)

#### B. Configurazione Build
- **Build command**: lascia **VUOTO** (non serve build)
- **Publish directory**: `.` (punto, root del progetto)  
- **Functions directory**: `netlify/functions` (auto-rilevato)

#### C. **IMPORTANTE: Variabili d'Ambiente**
1. Vai su **Site settings** → **Environment variables**
2. Aggiungi la variabile:
   ```
   Key: OPENROUTER_API_KEY
   Value: la-tua-api-key-openrouter
   ```

### 3. ✅ Funzioni Netlify (GIÀ CONFIGURATE)

Il progetto include già:
- `netlify/functions/inject-env.js` - Inietta le variabili d'ambiente
- `index.html` aggiornato per caricare le variabili
- `netlify.toml` configurato correttamente

**Non serve fare nulla di extra** - tutto è già pronto!

## 🔧 Testing Locale

Per testare in locale con le variabili d'ambiente:

```bash
# Opzione 1: Console del browser
setLocalAPIKey('sk-or-v1-la-tua-chiave-qui');

# Opzione 2: localStorage direttamente
localStorage.setItem('OPENROUTER_API_KEY', 'sk-or-v1-la-tua-chiave-qui');
```

## 🚨 Sicurezza

### ✅ Cose FATTE per la sicurezza:
- ❌ API key NON hardcoded nel codice
- ✅ Variabili d'ambiente per production
- ✅ localStorage solo per sviluppo locale
- ✅ Headers di sicurezza in netlify.toml

### ⚠️ Note Importanti:
- Le API key saranno visibili nel browser (è inevitabile per app client-side)
- Usa sempre domini restrictions su OpenRouter per limitare l'uso
- Monitora l'uso delle API per prevenire abusi

## 🔄 Deploy Process

1. **Push del codice** → Netlify fa auto-deploy
2. **Variabili cambiate** → Redeploy dal dashboard Netlify
3. **Errori** → Controlla i logs in Netlify → Site overview → Functions

## 🚨 Fix per Errore Build

Se il build fallisce con errore plugin, è già stato risolto! Il `netlify.toml` è stato aggiornato per rimuovere plugin non necessari.

**Soluzione**:
1. Fai un nuovo commit con i file aggiornati
2. Push su GitHub
3. Netlify rifarà automaticamente il deploy

## 📞 Troubleshooting

### ❌ Build Failed:
- Verifica che `netlify.toml` non contenga plugin
- Build command dovrebbe essere vuoto o molto semplice
- Publish directory = `.` (punto)

### ❌ Chat non funziona:
1. Controlla che OPENROUTER_API_KEY sia impostata in Netlify
2. Verifica nei Developer Tools: `window.OPENROUTER_API_KEY`
3. Vai su `tuosito.netlify.app/.netlify/functions/inject-env` per vedere se la funzione funziona

### ❌ 401 Unauthorized:
- API key scaduta o non valida su OpenRouter
- Controlla che la variabile sia impostata correttamente in Netlify

### ❌ Funzione non trovata:
- Verifica che la directory `netlify/functions/` esista
- File `inject-env.js` deve essere presente

## 🧪 Pagina di Test

Per debug completo, è stata inclusa una pagina di test:

**URL**: `tuosito.netlify.app/test-env.html`

**Cosa verifica**:
- ✅ Caricamento variabili d'ambiente da Netlify
- ✅ Configurazione CONFIG.LLM.API_KEY
- ✅ Stato LLM Manager
- ✅ Debug automatico con info dettagliate

**Debug manuale nella console**:
```javascript
// Verifica rapida
console.log('API Key:', window.OPENROUTER_API_KEY ? 'FOUND' : 'MISSING');
console.log('Config:', window.CONFIG?.LLM?.API_KEY ? 'OK' : 'MISSING');

// Ricarica configurazione
window.loadEnvironmentConfig();
```
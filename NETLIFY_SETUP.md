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
- **Build command**: `echo 'Build completato'`
- **Publish directory**: `.` (root del progetto)

#### C. **IMPORTANTE: Variabili d'Ambiente**
1. Vai su **Site settings** → **Environment variables**
2. Aggiungi la variabile:
   ```
   Key: OPENROUTER_API_KEY
   Value: la-tua-api-key-openrouter
   ```

### 3. Script di Inject per le Variabili

Netlify ha bisogno di un modo per iniettare le variabili nel browser. Crea questo file:

**`netlify/functions/inject-env.js`**:
```javascript
exports.handler = async (event, context) => {
  const html = `
    <script>
      window.OPENROUTER_API_KEY = "${process.env.OPENROUTER_API_KEY || ''}";
    </script>
  `;
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: html
  };
};
```

### 4. Aggiorna index.html

Aggiungi prima degli altri script:
```html
<script src="/.netlify/functions/inject-env"></script>
```

### 5. Alternativa: Build-time Injection

Se preferisci, puoi usare un build script che inietta le variabili:

**`build.sh`**:
```bash
#!/bin/bash
echo "Iniettando variabili d'ambiente..."

# Crea il file con le variabili
cat > js/env-vars.js << EOF
window.OPENROUTER_API_KEY = "${OPENROUTER_API_KEY}";
EOF

echo "Build completato!"
```

Poi in netlify.toml:
```toml
[build]
  command = "chmod +x build.sh && ./build.sh"
  publish = "."
```

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

## 📞 Troubleshooting

### Chat non funziona:
1. Controlla che OPENROUTER_API_KEY sia impostata in Netlify
2. Verifica nei Developer Tools se la variabile è caricata
3. Controlla i logs della console per errori API

### 401 Unauthorized:
- API key scaduta o non valida
- Controlla che la key sia corretta in Netlify

### CORS Errors:
- Aggiungi il dominio Netlify nelle impostazioni OpenRouter
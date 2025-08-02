# ✅ Checklist Pre-Deploy

## 🔍 Verifica File Critici

### ✅ File Presenti:
- [x] `netlify.toml` - Configurazione Netlify (senza plugin problematici)
- [x] `netlify/functions/inject-env.js` - Funzione per variabili d'ambiente  
- [x] `index.html` - Include script inject-env
- [x] `js/env.js` - Gestione variabili locali/production
- [x] `.gitignore` - Esclude file sensibili

### ✅ Configurazione Corretta:
- [x] **netlify.toml**: NO plugin, solo build basics
- [x] **API Key**: Rimossa dal codice sorgente
- [x] **Functions**: Directory `netlify/functions/` configurata
- [x] **Headers**: Sicurezza configurata

## 🚀 Passi per Deploy Netlify

### 1. **Git Commit & Push**
```bash
git add .
git commit -m "Fix Netlify build - rimozione plugin e configurazione sicura"
git push origin main
```

### 2. **Netlify Dashboard**
- Vai su [netlify.com](https://netlify.com)
- **New site from Git** → Connetti repository
- **Build settings**:
  - Build command: `(lascia VUOTO)`
  - Publish directory: `.`
  - Functions directory: `netlify/functions`

### 3. **Environment Variables** ⚠️ IMPORTANTE
```
Site Settings → Environment Variables → Add variable

Key: OPENROUTER_API_KEY
Value: sk-or-v1-la-tua-nuova-api-key-openrouter
```

### 4. **Deploy**
- Clicca **Deploy site**
- Attendi che il build finisca con successo ✅

## 🧪 Test Post-Deploy

### 1. **Verifica Sito**
Vai su `tuosito.netlify.app` e controlla:
- [x] Dashboard carica
- [x] Fornitori/Fatture funzionano
- [x] Tab "Chat AI" presente

### 2. **Test Chat AI**
- Clicca su **Chat AI**
- Dovrebbe dire "Ciao! Sono il tuo assistente..."
- Scrivi: "Ciao, puoi aiutarmi?"
- Dovrebbe rispondere senza errori 401

### 3. **Debug Tools (se problemi)**
```javascript
// Console del browser
console.log(window.OPENROUTER_API_KEY); // Dovrebbe mostrare la key
```

```
// URL diretto funzione
tuosito.netlify.app/.netlify/functions/inject-env
// Dovrebbe mostrare script con variabili
```

## ❌ Se Ancora Errori

### Build Failed:
1. Verifica che `netlify.toml` non contenga `[[plugins]]`
2. Build command deve essere vuoto
3. Riprova il deploy

### Chat 401 Error:
1. Controlla variabile d'ambiente in Netlify
2. Redeploy dopo aver impostato la variabile
3. Verifica che l'API key OpenRouter sia valida

### Function Error:
1. Controlla che `netlify/functions/inject-env.js` esista
2. Verifica che la directory sia configurata correttamente

## 🎉 Success!

Se tutto funziona:
- ✅ App deployed su Netlify
- ✅ Chat AI funzionante  
- ✅ API key sicura (non nel codice)
- ✅ Responsive design

**L'app è pronta per l'uso!** 🚀
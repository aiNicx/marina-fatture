# Schema Tecnico - Marina Fatture

## Architettura

### Pattern MVC Semplificato
- **Model**: `database.js` - Gestione dati
- **View**: `index.html` + `styles.css` - UI
- **Controller**: `app.js` - Logica applicazione

### Diagramma Componenti
```
index.html ←→ styles.css ←→ app.js
                              ↓
config.js ←→ database.js ←→ llm.js
    ↓           ↓           ↓
Supabase   localStorage  OpenRouter
```

## API Documentation

### DatabaseManager

#### Suppliers
```javascript
// GET - Ottieni fornitori
await dbManager.getSuppliers()
// Returns: Array<{id, name, vat, created_at}>

// POST - Aggiungi fornitore
await dbManager.addSupplier({name, vat})
// Returns: {id, name, vat, created_at}

// PUT - Aggiorna fornitore
await dbManager.updateSupplier(id, {name, vat})
// Returns: {id, name, vat, updated_at}

// DELETE - Elimina fornitore
await dbManager.deleteSupplier(id)
// Returns: boolean
```

#### Invoices
```javascript
// GET - Ottieni fatture con fornitori
await dbManager.getInvoices()
// Returns: Array<{id, number, amount, date, supplier: {id, name}}>

// POST - Aggiungi fattura
await dbManager.addInvoice({number, supplier_id, amount, date})
// Returns: {id, number, amount, date, supplier}

// DELETE - Elimina fattura
await dbManager.deleteInvoice(id)
// Returns: boolean

// GET - Statistiche
await dbManager.getStats()
// Returns: {totalSuppliers, totalInvoices, totalAmount}
```

### LLMManager

```javascript
// Chat query
await llmManager.chatQuery(message, context)
// Returns: {success: boolean, message: string, error?: string}

// Verifica configurazione
llmManager.checkConfiguration()
// Returns: {isConfigured, apiKey, model, baseUrl}
```

## Configurazione

### CONFIG Object
```javascript
const CONFIG = {
    LLM: {
        API_KEY: '',                    // OpenRouter API key
        MODEL_ID: 'qwen/qwen3-30b-a3b:free',
        SYSTEM_PROMPT: '...',          // Prompt specializzato
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7
    },
    DATABASE: {
        URL: '',                       // Supabase project URL
        ANON_KEY: '',                  // Supabase anon key
    },
    APP: {
        DEBUG: false,
        VAT_REGEX: /^IT[0-9]{11}$/,   // P.IVA italiana
        LOCALE: 'it-IT',
        CURRENCY: 'EUR'
    }
};
```

## Dual Storage Strategy

### Supabase (Primario)
```javascript
if (this.isConnected) {
    // Query Supabase
    const { data, error } = await this.supabase
        .from('suppliers')
        .select('*');
    return data;
}
```

### localStorage (Fallback)
```javascript
else {
    // Fallback localStorage
    const suppliers = localStorage.getItem('marina_suppliers');
    return suppliers ? JSON.parse(suppliers) : [];
}
```

## Validazione

### Client-side
```javascript
// P.IVA italiana
validateVAT(vat) {
    return /^IT[0-9]{11}$/.test(vat.toUpperCase());
}

// Numero fattura
validateInvoiceNumber(number) {
    return /^[A-Za-z0-9\-\/]+$/.test(number);
}

// Importo positivo
validateAmount(amount) {
    return !isNaN(amount) && parseFloat(amount) > 0;
}
```

### Database Constraints
```sql
-- P.IVA format
ALTER TABLE suppliers ADD CONSTRAINT valid_vat 
CHECK (vat IS NULL OR vat ~ '^IT[0-9]{11}$');

-- Importo positivo
ALTER TABLE invoices ADD CONSTRAINT positive_amount 
CHECK (amount > 0);

-- Numero fattura unique per fornitore
ALTER TABLE invoices ADD CONSTRAINT unique_invoice_per_supplier 
UNIQUE (supplier_id, number);
```

## Error Handling

### Tipi di Errore
```javascript
// Errori di rete
catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Errore di connessione');
    }
}

// Errori di validazione
if (!ConfigUtils.validateVAT(vat)) {
    throw new Error('P.IVA non valida');
}

// Errori database Supabase
if (error.code === 'PGRST116') {
    throw new Error('Elemento non trovato');
}
```

### Logging
```javascript
// Debug logs (solo in development)
ConfigUtils.debug('Loading suppliers...', suppliers);

// Error logs (sempre attivi)
ConfigUtils.error('Database error:', error);
```

## Performance

### Ottimizzazioni
- **Lazy Loading**: Dati caricati solo quando necessari
- **Local Cache**: localStorage come cache
- **Bundle Size**: < 100KB JavaScript totale
- **CSS nativo**: Grid/Flexbox senza framework

### Browser Compatibility
- **Target**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Features**: ES6+, Fetch API, CSS Grid/Flexbox
- **Progressive Enhancement**: Fallback per localStorage

## Sicurezza

### XSS Prevention
```javascript
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### Input Sanitization
```javascript
// Trim e normalizzazione
name: supplier.name.trim(),
vat: supplier.vat ? supplier.vat.trim().toUpperCase() : null
```

### API Security
- API Keys come variabili d'ambiente
- CORS configurazione restrittiva
- HTTPS only in produzione

Questo schema fornisce una reference completa per sviluppatori che mantengono o estendono l'applicazione.
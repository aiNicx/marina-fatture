# Schema Tecnico - Marina Fatture

## Architettura Applicazione

### Pattern Architetturale
L'applicazione segue un pattern **MVC semplificato** con separazione chiara delle responsabilità:

- **Model**: `database.js` - Gestione dati e business logic
- **View**: `index.html` + `styles.css` - Presentazione e UI
- **Controller**: `app.js` - Logica applicazione e coordinamento

### Diagramma Architettura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   index.html    │    │   styles.css    │    │    app.js       │
│   (Structure)   │◄──►│   (Styling)     │◄──►│  (Controller)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   database.js   │◄──►│   config.js     │
                       │   (Data Layer)  │    │ (Configuration) │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Supabase     │    │   llm.js        │
                       │   (Database)    │    │ (AI Integration)│
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                ┌─────────────────┐
                                                │   OpenRouter    │
                                                │   (LLM API)     │
                                                └─────────────────┘
```

## Dettagli Tecnici

### Gestione Stato (app.js)

```javascript
class MarinaFattureApp {
    constructor() {
        this.currentView = 'dashboard';     // Vista corrente
        this.currentModal = null;           // Modal aperto
        this.currentEditId = null;          // ID elemento in editing
    }
    
    // Metodi principali:
    // - switchView(viewName): Cambio vista SPA
    // - loadDashboard(): Caricamento statistiche
    // - loadSuppliers(): Gestione fornitori
    // - loadInvoices(): Gestione fatture
    // - loadReports(): Generazione report AI
}
```

### Data Layer (database.js)

#### Dual Storage Strategy
```javascript
class DatabaseManager {
    // Strategia ibrida: Supabase come primario, localStorage come fallback
    
    async getSuppliers() {
        if (this.isConnected) {
            // Supabase query
            return await this.supabase.from('suppliers').select('*');
        } else {
            // LocalStorage fallback
            return JSON.parse(localStorage.getItem('marina_suppliers') || '[]');
        }
    }
}
```

#### Query Patterns
```sql
-- Suppliers with invoices count
SELECT s.*, COUNT(i.id) as invoice_count 
FROM suppliers s 
LEFT JOIN invoices i ON s.id = i.supplier_id 
GROUP BY s.id;

-- Monthly spending analysis
SELECT 
    DATE_TRUNC('month', date) as month,
    SUM(amount) as total_amount,
    COUNT(*) as invoice_count
FROM invoices 
GROUP BY month 
ORDER BY month DESC;
```

### Configuration Management (config.js)

#### Struttura Configurazione
```javascript
const CONFIG = {
    LLM: {
        API_KEY: '',                    // OpenRouter API key
        MODEL_ID: 'openai/gpt-3.5-turbo',
        SYSTEM_PROMPT: '...',          // Specialized financial AI prompt
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7
    },
    DATABASE: {
        URL: '',                       // Supabase project URL
        ANON_KEY: '',                  // Supabase anon key
        SERVICE_ROLE_KEY: ''           // Admin operations
    },
    APP: {
        DEBUG: false,                  // Development mode
        VAT_REGEX: /^IT[0-9]{11}$/,   // Italian VAT validation
        CURRENCY: 'EUR',
        LOCALE: 'it-IT'
    }
};
```

### LLM Integration (llm.js)

#### OpenRouter API Communication
```javascript
class LLMManager {
    async query(userMessage, context = {}) {
        const response = await fetch(`${CONFIG.LLM.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.LLM.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.LLM.MODEL_ID,
                messages: [
                    { role: 'system', content: CONFIG.LLM.SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ]
            })
        });
    }
}
```

#### Context Building
```javascript
buildContextMessage(context) {
    // Costruisce contesto strutturato per LLM:
    // - Statistiche attuali
    // - Lista fornitori recenti
    // - Fatture recenti
    // - Metadati utili per analisi
}
```

## API Documentation

### Database API (DatabaseManager)

#### Suppliers
```javascript
// GET - Ottieni tutti i fornitori
await dbManager.getSuppliers()
// Returns: Array<{id, name, vat, created_at, updated_at}>

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
// GET - Ottieni tutte le fatture con fornitori
await dbManager.getInvoices()
// Returns: Array<{id, number, amount, date, supplier: {id, name}}>

// POST - Aggiungi fattura
await dbManager.addInvoice({number, supplier_id, amount, date})
// Returns: {id, number, amount, date, supplier}

// DELETE - Elimina fattura
await dbManager.deleteInvoice(id)
// Returns: boolean
```

#### Statistics
```javascript
// GET - Statistiche aggregate
await dbManager.getStats()
// Returns: {totalSuppliers, totalInvoices, totalAmount}
```

### LLM API (LLMManager)

```javascript
// Analisi finanziaria generale
await llmManager.analyzeFinancials(suppliers, invoices)

// Classificazione fornitori
await llmManager.classifySuppliers(suppliers, invoices)

// Report personalizzato
await llmManager.generateReport(type, data, customPrompt)

// Query libera con contesto
await llmManager.query(message, context)
```

## Validazione Dati

### Client-side Validation

```javascript
// Validazione P.IVA italiana
validateVAT(vat) {
    return /^IT[0-9]{11}$/.test(vat.toUpperCase());
}

// Validazione numero fattura
validateInvoiceNumber(number) {
    return /^[A-Za-z0-9\-\/]+$/.test(number);
}

// Validazione importo
validateAmount(amount) {
    return !isNaN(amount) && parseFloat(amount) > 0;
}
```

### Server-side Validation (Supabase)

```sql
-- Constraint P.IVA
ALTER TABLE suppliers ADD CONSTRAINT valid_vat 
CHECK (vat IS NULL OR vat ~ '^IT[0-9]{11}$');

-- Constraint importo positivo
ALTER TABLE invoices ADD CONSTRAINT positive_amount 
CHECK (amount > 0);

-- Unique numero fattura per fornitore
ALTER TABLE invoices ADD CONSTRAINT unique_invoice_per_supplier 
UNIQUE (supplier_id, number);
```

## Error Handling

### Error Types e Gestione

```javascript
// Errori di rete
catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(CONFIG.MESSAGES.ERROR.NETWORK);
    }
}

// Errori di validazione
if (!ConfigUtils.validateVAT(vat)) {
    throw new Error('P.IVA non valida');
}

// Errori database
if (error.code === 'PGRST116') {
    throw new Error(CONFIG.MESSAGES.ERROR.NOT_FOUND);
}
```

### Logging Strategy

```javascript
// Debug logs (solo in development)
ConfigUtils.debug('Loading suppliers...', suppliers);

// Error logs (sempre attivi)
ConfigUtils.error('Database error:', error);

// User feedback
this.showError(error.message);
this.showSuccess(CONFIG.MESSAGES.SUCCESS.SAVE);
```

## Performance Considerations

### Lazy Loading
- Dati caricati solo quando necessari per la vista corrente
- Statistiche dashboard aggiornate solo al cambio vista

### Caching Strategy
```javascript
// LocalStorage come cache
const cachedSuppliers = localStorage.getItem('marina_suppliers');
if (cachedSuppliers && Date.now() - lastUpdate < CACHE_DURATION) {
    return JSON.parse(cachedSuppliers);
}
```

### Bundle Optimization
- **No frameworks**: Solo vanilla JS
- **CSS nativo**: Grid/Flexbox senza librerie
- **Lazy imports**: Script caricati in ordine ottimale

## Security Measures

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
- **API Keys**: Non committate in repository
- **CORS**: Configurazione restrittiva
- **Rate Limiting**: Gestito da OpenRouter/Supabase

## Browser Compatibility

### Supported Features
- **ES6+**: Classes, arrow functions, async/await
- **CSS Grid/Flexbox**: Layout responsivo
- **Fetch API**: Chiamate HTTP native
- **LocalStorage**: Fallback persistence

### Target Browsers
- Chrome 70+
- Firefox 65+  
- Safari 12+
- Edge 79+

### Progressive Enhancement
```javascript
// Feature detection
if ('localStorage' in window) {
    // Use localStorage
} else {
    // Fallback to session storage or memory
}
```

Questo schema tecnico fornisce una reference completa per sviluppatori che devono mantenere o estendere l'applicazione.
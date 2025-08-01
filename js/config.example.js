// Configurazione dell'applicazione - TEMPLATE
// Copia questo file come config.js e inserisci le tue API keys

const CONFIG = {
    // Configurazione LLM OpenRouter
    LLM: {
        API_KEY: process.env.OPENROUTER_API_KEY || '', // Inserire la propria API key di OpenRouter
        BASE_URL: 'https://openrouter.ai/api/v1',
        MODEL_ID: 'openai/gpt-3.5-turbo', // Modello da utilizzare
        SYSTEM_PROMPT: `Sei un assistente AI specializzato nell'analisi e gestione di fatture e fornitori.
Aiuti gli utenti a:
- Analizzare dati finanziari
- Generare report e classifiche
- Suggerire ottimizzazioni nella gestione fornitori
- Identificare pattern nei pagamenti
- Fornire insights sui costi

Rispondi sempre in italiano, in modo conciso e professionale.
Quando possibile, fornisci suggerimenti pratici e actionable.`,
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7
    },
    
    // Configurazione Database (Supabase)
    DATABASE: {
        URL: process.env.SUPABASE_URL || '', // URL del progetto Supabase
        ANON_KEY: process.env.SUPABASE_ANON_KEY || '', // Chiave anonima di Supabase
        SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Chiave service role (solo per operazioni admin)
    },
    
    // Configurazione applicazione
    APP: {
        NAME: 'Marina Fatture',
        VERSION: '1.0.0',
        AUTHOR: 'Marina',
        DEBUG: false,
        
        // Impostazioni locali
        LOCALE: 'it-IT',
        CURRENCY: 'EUR',
        DATE_FORMAT: 'DD/MM/YYYY',
        
        // Limiti
        MAX_SUPPLIERS: 1000,
        MAX_INVOICES: 10000,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        
        // Validazione
        VAT_REGEX: /^IT[0-9]{11}$/, // Regex per P.IVA italiana
        INVOICE_NUMBER_REGEX: /^[A-Za-z0-9\-\/]+$/ // Regex per numero fattura
    },
    
    // Messaggi di errore
    MESSAGES: {
        ERROR: {
            GENERIC: 'Si è verificato un errore. Riprova più tardi.',
            NETWORK: 'Errore di connessione. Controlla la tua connessione internet.',
            VALIDATION: 'Dati inseriti non validi. Controlla i campi.',
            NOT_FOUND: 'Elemento non trovato.',
            DUPLICATE: 'Elemento già esistente.',
            UNAUTHORIZED: 'Non hai i permessi per questa operazione.',
            DATABASE: 'Errore del database. Riprova più tardi.'
        },
        SUCCESS: {
            SAVE: 'Elemento salvato con successo!',
            DELETE: 'Elemento eliminato con successo!',
            UPDATE: 'Elemento aggiornato con successo!'
        },
        CONFIRM: {
            DELETE: 'Sei sicuro di voler eliminare questo elemento?',
            CLEAR_DATA: 'Sei sicuro di voler cancellare tutti i dati?'
        }
    }
};

// Funzioni di utilità per la configurazione
const ConfigUtils = {
    // Verifica se la configurazione LLM è completa
    isLLMConfigured() {
        return CONFIG.LLM.API_KEY && CONFIG.LLM.API_KEY.trim() !== '';
    },
    
    // Verifica se la configurazione database è completa
    isDatabaseConfigured() {
        return CONFIG.DATABASE.URL && 
               CONFIG.DATABASE.ANON_KEY && 
               CONFIG.DATABASE.URL.trim() !== '' && 
               CONFIG.DATABASE.ANON_KEY.trim() !== '';
    },
    
    // Formatta valuta
    formatCurrency(amount) {
        return new Intl.NumberFormat(CONFIG.APP.LOCALE, {
            style: 'currency',
            currency: CONFIG.APP.CURRENCY
        }).format(amount);
    },
    
    // Formatta data
    formatDate(date) {
        return new Intl.DateTimeFormat(CONFIG.APP.LOCALE).format(
            typeof date === 'string' ? new Date(date) : date
        );
    },
    
    // Valida P.IVA
    validateVAT(vat) {
        if (!vat || vat.trim() === '') return true; // P.IVA opzionale
        return CONFIG.APP.VAT_REGEX.test(vat.toUpperCase());
    },
    
    // Valida numero fattura
    validateInvoiceNumber(number) {
        return number && CONFIG.APP.INVOICE_NUMBER_REGEX.test(number);
    },
    
    // Log di debug
    debug(...args) {
        if (CONFIG.APP.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    },
    
    // Log di errore
    error(...args) {
        console.error('[ERROR]', ...args);
    }
};

// Esporta per uso globale
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;
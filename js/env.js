// Gestione variabili d'ambiente
// Questo file carica le variabili d'ambiente in modo sicuro per il deployment

(function() {
    'use strict';
    
    // Funzione per caricare le variabili d'ambiente
    function loadEnvironmentVariables() {
        if (typeof window !== 'undefined') {
            window.ENV = window.ENV || {};
            
            // Netlify: le variabili sono già disponibili come window.OPENROUTER_API_KEY
            // tramite la funzione inject-env
            if (window.OPENROUTER_API_KEY) {
                window.ENV.OPENROUTER_API_KEY = window.OPENROUTER_API_KEY;
                console.log('Variabile d\'ambiente caricata da Netlify');
                return;
            }
            
            // Fallback per sviluppo locale
            if (typeof localStorage !== 'undefined') {
                const localKey = localStorage.getItem('OPENROUTER_API_KEY');
                if (localKey) {
                    window.ENV.OPENROUTER_API_KEY = localKey;
                    window.OPENROUTER_API_KEY = localKey; // Per compatibilità
                    console.warn('Usando API key da localStorage - solo per sviluppo!');
                }
            }
        }
    }
    
    // Carica le variabili quando il script viene eseguito
    loadEnvironmentVariables();
    
    // Funzione per impostare la chiave in sviluppo locale
    window.setLocalAPIKey = function(apiKey) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('OPENROUTER_API_KEY', apiKey);
            window.ENV = window.ENV || {};
            window.ENV.OPENROUTER_API_KEY = apiKey;
            window.OPENROUTER_API_KEY = apiKey; // Per compatibilità
            console.log('API key impostata per sviluppo locale');
            
            // Ricarica la configurazione se disponibile
            if (typeof window.CONFIG !== 'undefined' && window.loadEnvironmentConfig) {
                window.loadEnvironmentConfig();
            }
            
            // Ricarica anche il LLM manager se disponibile
            if (typeof window.llmManager !== 'undefined') {
                window.llmManager.isConfigured = !!(apiKey && apiKey.trim() !== '');
            }
        }
    };
    
    // Funzione per rimuovere la chiave locale
    window.clearLocalAPIKey = function() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('OPENROUTER_API_KEY');
            if (window.ENV) {
                delete window.ENV.OPENROUTER_API_KEY;
            }
            console.log('API key locale rimossa');
        }
    };
    
})();
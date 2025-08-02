// Gestione variabili d'ambiente
// Questo file carica le variabili d'ambiente in modo sicuro per il deployment

(function() {
    'use strict';
    
    // Funzione per caricare le variabili d'ambiente
    function loadEnvironmentVariables() {
        // Per Netlify: le variabili sono iniettate durante il build
        if (typeof window !== 'undefined') {
            window.ENV = window.ENV || {};
            
            // Carica da variabili iniettate da Netlify
            if (typeof OPENROUTER_API_KEY !== 'undefined') {
                window.ENV.OPENROUTER_API_KEY = OPENROUTER_API_KEY;
            }
            
            // Fallback per sviluppo locale
            // In produzione, NON usare mai questo metodo
            if (!window.ENV.OPENROUTER_API_KEY && typeof localStorage !== 'undefined') {
                const localKey = localStorage.getItem('OPENROUTER_API_KEY');
                if (localKey) {
                    window.ENV.OPENROUTER_API_KEY = localKey;
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
            console.log('API key impostata per sviluppo locale');
            
            // Ricarica la configurazione
            if (typeof loadEnvironmentConfig === 'function') {
                loadEnvironmentConfig();
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
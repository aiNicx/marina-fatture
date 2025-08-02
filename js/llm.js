// Gestione LLM con OpenRouter
class LLMManager {
    constructor() {
        this.isConfigured = ConfigUtils.isLLMConfigured();
        this.lastError = null;
    }
    
    // Invia una richiesta al modello LLM
    async query(userMessage, context = {}) {
        if (!this.isConfigured) {
            throw new Error('LLM non configurato. Aggiungi la tua API key in CONFIG.LLM.API_KEY');
        }
        
        try {
            const messages = [
                {
                    role: 'system',
                    content: CONFIG.LLM.SYSTEM_PROMPT
                }
            ];
            
            // Aggiungi contesto se disponibile
            if (context.suppliers || context.invoices || context.stats) {
                const contextMessage = this.buildContextMessage(context);
                messages.push({
                    role: 'system',
                    content: contextMessage
                });
            }
            
            messages.push({
                role: 'user',
                content: userMessage
            });
            
            const response = await fetch(`${CONFIG.LLM.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.LLM.API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': CONFIG.APP.NAME
                },
                body: JSON.stringify({
                    model: CONFIG.LLM.MODEL_ID,
                    messages: messages,
                    max_tokens: CONFIG.LLM.MAX_TOKENS,
                    temperature: CONFIG.LLM.TEMPERATURE
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = `Errore API: ${response.status}`;
                
                if (response.status === 401) {
                    errorMessage += ' - API key non valida o scaduta. Verifica la configurazione in js/config.js';
                } else if (response.status === 400) {
                    errorMessage += ' - Richiesta non valida. Verifica il modello specificato';
                } else if (response.status === 429) {
                    errorMessage += ' - Limite di rate raggiunto. Riprova più tardi';
                } else {
                    errorMessage += ` - ${errorData.error?.message || 'Errore sconosciuto'}`;
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Risposta API non valida');
            }
            
            return {
                success: true,
                message: data.choices[0].message.content,
                usage: data.usage
            };
            
        } catch (error) {
            ConfigUtils.error('Errore LLM:', error);
            this.lastError = error.message;
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Costruisce il messaggio di contesto con i dati dell'app
    buildContextMessage(context) {
        let contextParts = [];
        
        if (context.stats) {
            contextParts.push(`STATISTICHE ATTUALI:
- Fornitori totali: ${context.stats.totalSuppliers}
- Fatture totali: ${context.stats.totalInvoices}
- Importo totale: ${ConfigUtils.formatCurrency(context.stats.totalAmount)}`);
        }
        
        if (context.suppliers && context.suppliers.length > 0) {
            contextParts.push(`FORNITORI (ultimi 10):
${context.suppliers.slice(0, 10).map(s => 
    `- ${s.name}${s.vat ? ` (P.IVA: ${s.vat})` : ''}`
).join('\n')}`);
        }
        
        if (context.invoices && context.invoices.length > 0) {
            contextParts.push(`FATTURE RECENTI (ultime 10):
${context.invoices.slice(0, 10).map(i => 
    `- ${i.number}: ${ConfigUtils.formatCurrency(i.amount)} - ${i.supplier?.name || 'N/A'} (${ConfigUtils.formatDate(i.date)})`
).join('\n')}`);
        }
        
        return contextParts.join('\n\n');
    }
    
    // Chat query per conversazioni naturali
    async chatQuery(userMessage, context = {}) {
        const contextMessage = this.buildChatContext(context);
        
        const messages = [
            {
                role: 'system',
                content: CONFIG.LLM.SYSTEM_PROMPT
            },
            {
                role: 'system',
                content: contextMessage
            },
            {
                role: 'user',
                content: userMessage
            }
        ];
        
        try {
            const response = await fetch(`${CONFIG.LLM.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.LLM.API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': CONFIG.APP.NAME
                },
                body: JSON.stringify({
                    model: CONFIG.LLM.MODEL_ID,
                    messages: messages,
                    max_tokens: CONFIG.LLM.MAX_TOKENS,
                    temperature: CONFIG.LLM.TEMPERATURE
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = `Errore API: ${response.status}`;
                
                if (response.status === 401) {
                    errorMessage += ' - API key non valida o scaduta. Verifica la variabile d\'ambiente OPENROUTER_API_KEY';
                } else if (response.status === 400) {
                    errorMessage += ' - Richiesta non valida. Verifica il modello specificato';
                } else if (response.status === 429) {
                    errorMessage += ' - Limite di rate raggiunto. Riprova più tardi';
                } else {
                    errorMessage += ` - ${errorData.error?.message || 'Errore sconosciuto'}`;
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Risposta API non valida');
            }
            
            return {
                success: true,
                message: data.choices[0].message.content,
                usage: data.usage
            };
            
        } catch (error) {
            ConfigUtils.error('Errore LLM Chat:', error);
            this.lastError = error.message;
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Costruisce il contesto per la chat
    buildChatContext(context) {
        let contextParts = [];
        
        contextParts.push('CONTESTO DATI APPLICAZIONE:');
        
        if (context.stats) {
            contextParts.push(`STATISTICHE ATTUALI:
- Fornitori totali: ${context.stats.totalSuppliers}
- Fatture totali: ${context.stats.totalInvoices}
- Importo totale: ${ConfigUtils.formatCurrency(context.stats.totalAmount)}`);
        }
        
        if (context.suppliers && context.suppliers.length > 0) {
            contextParts.push(`FORNITORI (${context.suppliers.length} totali):
${context.suppliers.slice(0, 20).map(s => 
    `- ${s.name}${s.vat ? ` (P.IVA: ${s.vat})` : ''}`
).join('\n')}`);
        }
        
        if (context.invoices && context.invoices.length > 0) {
            contextParts.push(`FATTURE RECENTI (${context.invoices.length} totali, ultime 15):
${context.invoices.slice(0, 15).map(i => 
    `- ${i.number}: ${ConfigUtils.formatCurrency(i.amount)} - ${i.supplier?.name || 'N/A'} (${ConfigUtils.formatDate(i.date)})`
).join('\n')}`);
        }
        
        contextParts.push('\nRispondi sempre in italiano, in modo chiaro e professionale. Puoi usare i dati forniti per rispondere a domande specifiche sui fornitori, fatture, trend, analisi finanziarie e suggerimenti.');
        
        return contextParts.join('\n\n');
    }
    
    // Verifica stato configurazione
    checkConfiguration() {
        return {
            isConfigured: this.isConfigured,
            apiKey: CONFIG.LLM.API_KEY ? '***configurata***' : 'non configurata',
            model: CONFIG.LLM.MODEL_ID,
            baseUrl: CONFIG.LLM.BASE_URL
        };
    }
}

// Istanza globale del LLM manager
window.llmManager = new LLMManager();
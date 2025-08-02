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
    
    // Analizza i dati finanziari
    async analyzeFinancials(suppliers, invoices) {
        const stats = {
            totalSuppliers: suppliers.length,
            totalInvoices: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0)
        };
        
        const context = { suppliers, invoices, stats };
        
        const prompt = `Analizza i dati finanziari forniti e genera un report che includa:
1. Analisi delle spese per fornitore
2. Trend temporali degli importi
3. Suggerimenti per ottimizzazione
4. Eventuali anomalie o pattern interessanti

Rispondi in modo strutturato e professionale.`;
        
        return await this.query(prompt, context);
    }
    
    // Suggerisce classificazioni per fornitori
    async classifySuppliers(suppliers, invoices) {
        const context = { suppliers, invoices };
        
        const prompt = `Basandoti sui fornitori e le fatture, suggerisci:
1. Come classificare i fornitori per categoria (es. servizi, materiali, consulenze, etc.)
2. Quali fornitori sono più strategici
3. Suggerimenti per gestire meglio i rapporti con i fornitori

Sii concreto e pratico nei suggerimenti.`;
        
        return await this.query(prompt, context);
    }
    
    // Genera report personalizzato
    async generateReport(reportType, data, customPrompt = '') {
        const context = data;
        
        let prompt = '';
        switch (reportType) {
            case 'monthly':
                prompt = 'Genera un report mensile delle spese, evidenziando trend e variazioni significative.';
                break;
            case 'supplier':
                prompt = 'Analizza la performance e l\'affidabilità dei fornitori basandoti sui dati delle fatture.';
                break;
            case 'cost':
                prompt = 'Identifica opportunità di riduzione costi e ottimizzazione delle spese.';
                break;
            case 'custom':
                prompt = customPrompt || 'Analizza i dati forniti e genera insights utili.';
                break;
            default:
                prompt = 'Genera un\'analisi generale dei dati finanziari forniti.';
        }
        
        return await this.query(prompt, context);
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
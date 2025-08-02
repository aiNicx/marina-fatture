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
                    model: ConfigUtils.getChatModel(), // Usa modello Chat
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
            const unpaidInvoices = context.invoices.filter(i => i.status === 'da_pagare');
            const paidInvoices = context.invoices.filter(i => i.status === 'pagata');
            
            contextParts.push(`FATTURE (${context.invoices.length} totali - ${unpaidInvoices.length} da pagare, ${paidInvoices.length} pagate):

FATTURE DA PAGARE (${unpaidInvoices.length}):
${unpaidInvoices.slice(0, 10).map(i => 
    `- ${i.number}: ${ConfigUtils.formatCurrency(i.amount)} - ${i.supplier?.name || 'N/A'} (${ConfigUtils.formatDate(i.date)}) [DA PAGARE]`
).join('\n')}

FATTURE PAGATE RECENTI (${paidInvoices.length} totali, ultime 5):
${paidInvoices.slice(0, 5).map(i => 
    `- ${i.number}: ${ConfigUtils.formatCurrency(i.amount)} - ${i.supplier?.name || 'N/A'} (${ConfigUtils.formatDate(i.date)}) [PAGATA]`
).join('\n')}`);
        }
        
        contextParts.push('\nRispondi sempre in italiano, in modo chiaro e professionale. Le fatture hanno due status: "da_pagare" e "pagata". Quando l\'utente chiede fatture da pagare, mostra SOLO quelle con status "da_pagare". Puoi rispondere a domande sui fornitori, fatture, trend e analisi finanziarie.');
        
        return contextParts.join('\n\n');
    }
    
    // Estrae dati da immagine/PDF fattura
    async extractInvoiceData(file) {
        if (!this.isConfigured) {
            throw new Error('LLM non configurato per estrazione dati');
        }

        // Verifica se il modello supporta le immagini
        const ocrModel = ConfigUtils.getOcrModel();
        const visionModels = [
            'openai/gpt-4o',
            'openai/gpt-4o-mini', 
            'anthropic/claude-3',
            'anthropic/claude-3.5-sonnet',
            'mistralai/pixtral',
            'mistralai/mistral-small-3.1',
            'google/gemini-pro-vision',
            'google/gemini-flash-1.5'
        ];
        
        const supportsVision = visionModels.some(model => ocrModel.includes(model));
        if (!supportsVision) {
            throw new Error(`Il modello ${ocrModel} non supporta le immagini. Usa un modello con capacità di visione nelle Impostazioni.`);
        }
        
        const base64 = await this.fileToBase64(file);
        
        const messages = [
            {
                role: 'system',
                content: 'Estrai ESATTAMENTE questi dati dalla fattura italiana e rispondi SOLO con JSON valido senza altro testo:\n\n{"numero": "numero_fattura", "fornitore": "nome_fornitore", "importo": "importo_totale_solo_numeri", "data": "YYYY-MM-DD"}\n\nSe non trovi un dato, usa stringa vuota "". NON aggiungere testo prima o dopo il JSON.'
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Estrai i dati da questa fattura:'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${file.type};base64,${base64}`,
                            detail: 'high'
                        }
                    }
                ]
            }
        ];
        
        const response = await fetch(`${CONFIG.LLM.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.LLM.API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': CONFIG.APP.NAME
            },
            body: JSON.stringify({
                model: ConfigUtils.getOcrModel(), // Usa modello OCR
                messages: messages,
                max_tokens: 500,
                temperature: 0.1
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Errore API: ${response.status} - ${errorData.error?.message || 'Errore sconosciuto'}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Risposta API non valida');
        }
        
        try {
            let content = data.choices[0].message.content;
            
            // Log per debug
            console.log('Risposta AI:', content);
            
            // Prova a estrarre JSON da markdown code blocks
            let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                content = jsonMatch[1];
            }
            
            // Prova a trovare JSON tra { e }
            if (!jsonMatch) {
                jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    content = jsonMatch[0];
                }
            }
            
            // Pulisci il contenuto
            content = content.trim();
            
            const extracted = JSON.parse(content);
            
            // Valida che abbia i campi necessari
            const result = {
                numero: extracted.numero || extracted.number || '',
                fornitore: extracted.fornitore || extracted.supplier || extracted.nome || '',
                importo: extracted.importo || extracted.amount || extracted.total || '',
                data: extracted.data || extracted.date || ''
            };
            
            console.log('Dati estratti:', result);
            return result;
            
        } catch (parseError) {
            console.error('Errore parsing JSON:', parseError);
            console.error('Contenuto ricevuto:', data.choices[0].message.content);
            throw new Error(`Impossibile interpretare i dati estratti dalla fattura. Contenuto: ${data.choices[0].message.content.substring(0, 200)}...`);
        }
    }

    // Converte file in base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
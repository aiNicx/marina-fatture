// Applicazione principale Marina Fatture
class MarinaFattureApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentModal = null;
        this.currentEditId = null;
        
        this.init();
    }
    
    async init() {
        ConfigUtils.debug('Inizializzando applicazione...');
        
        // Attendi che i manager siano pronti
        await this.waitForManagers();
        
        // Configura event listeners
        this.setupEventListeners();
        
        // Carica vista iniziale
        await this.loadDashboard();
        
        ConfigUtils.debug('Applicazione inizializzata');
    }
    
    async waitForManagers() {
        // Attendi che i manager siano disponibili
        let attempts = 0;
        while ((!window.dbManager || !window.llmManager) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.dbManager) {
            throw new Error('Database Manager non disponibile');
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewName = e.target.id.replace('nav-', '');
                this.switchView(viewName);
            });
        });
        
        // Modal controls
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Add buttons
        document.getElementById('add-supplier-btn')?.addEventListener('click', () => {
            this.openSupplierModal();
        });
        
        document.getElementById('add-invoice-btn')?.addEventListener('click', () => {
            this.openInvoiceModal();
        });
        
        // Cancel buttons
        document.getElementById('cancel-supplier')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('cancel-invoice')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Chat controls
        document.getElementById('send-chat-btn')?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('clear-chat-btn')?.addEventListener('click', () => {
            this.clearChat();
        });
        
        document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        
        // Forms
        document.getElementById('supplier-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSupplierSubmit();
        });
        
        document.getElementById('invoice-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInvoiceSubmit();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }
    
    // NAVIGATION
    
    async switchView(viewName) {
        // Aggiorna bottoni navigazione
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`nav-${viewName}`)?.classList.add('active');
        
        // Nasconde tutte le viste
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Mostra vista richiesta
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
            
            // Carica dati per la vista
            switch (viewName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'suppliers':
                    await this.loadSuppliers();
                    break;
                case 'invoices':
                    await this.loadInvoices();
                    break;
                case 'chat':
                    await this.loadChat();
                    break;
            }
        }
    }
    
    // DASHBOARD
    
    async loadDashboard() {
        try {
            const stats = await window.dbManager.getStats();
            
            document.getElementById('total-suppliers').textContent = stats.totalSuppliers;
            document.getElementById('total-invoices').textContent = stats.totalInvoices;
            document.getElementById('total-amount').textContent = ConfigUtils.formatCurrency(stats.totalAmount);
            
        } catch (error) {
            this.showError('Errore caricamento dashboard: ' + error.message);
        }
    }
    
    // FORNITORI
    
    async loadSuppliers() {
        try {
            const suppliers = await window.dbManager.getSuppliers();
            const listContainer = document.getElementById('suppliers-list');
            
            if (suppliers.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>Nessun fornitore trovato</h3>
                        <p>Inizia aggiungendo il tuo primo fornitore</p>
                    </div>
                `;
                return;
            }
            
            listContainer.innerHTML = suppliers.map(supplier => `
                <div class="data-item">
                    <div class="data-info">
                        <h4>${this.escapeHtml(supplier.name)}</h4>
                        <p>${supplier.vat ? `P.IVA: ${supplier.vat}` : 'P.IVA non specificata'}</p>
                    </div>
                    <div class="data-actions">
                        <button class="btn-small btn-edit" onclick="app.editSupplier('${supplier.id}')">
                            Modifica
                        </button>
                        <button class="btn-small btn-delete" onclick="app.deleteSupplier('${supplier.id}')">
                            Elimina
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            this.showError('Errore caricamento fornitori: ' + error.message);
        }
    }
    
    openSupplierModal(supplier = null) {
        this.currentEditId = supplier ? supplier.id : null;
        this.currentModal = 'supplier-modal';
        
        const modal = document.getElementById('supplier-modal');
        const title = document.getElementById('supplier-modal-title');
        const form = document.getElementById('supplier-form');
        
        if (supplier) {
            title.textContent = 'Modifica Fornitore';
            document.getElementById('supplier-id').value = supplier.id;
            document.getElementById('supplier-name').value = supplier.name;
            document.getElementById('supplier-vat').value = supplier.vat || '';
        } else {
            title.textContent = 'Aggiungi Fornitore';
            form.reset();
            document.getElementById('supplier-id').value = '';
        }
        
        modal.style.display = 'block';
        document.getElementById('supplier-name').focus();
    }
    
    async handleSupplierSubmit() {
        try {
            const name = document.getElementById('supplier-name').value.trim();
            const vat = document.getElementById('supplier-vat').value.trim();
            
            // Validazione
            if (!name) {
                throw new Error('Il nome del fornitore è obbligatorio');
            }
            
            if (vat && !ConfigUtils.validateVAT(vat)) {
                throw new Error('Partita IVA non valida');
            }
            
            const supplierData = { name, vat: vat || null };
            
            if (this.currentEditId) {
                await window.dbManager.updateSupplier(this.currentEditId, supplierData);
                this.showSuccess(CONFIG.MESSAGES.SUCCESS.UPDATE);
            } else {
                await window.dbManager.addSupplier(supplierData);
                this.showSuccess(CONFIG.MESSAGES.SUCCESS.SAVE);
            }
            
            this.closeModal();
            await this.loadSuppliers();
            await this.loadDashboard(); // Aggiorna stats
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async editSupplier(id) {
        try {
            const suppliers = await window.dbManager.getSuppliers();
            const supplier = suppliers.find(s => s.id === id);
            
            if (!supplier) {
                throw new Error(CONFIG.MESSAGES.ERROR.NOT_FOUND);
            }
            
            this.openSupplierModal(supplier);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async deleteSupplier(id) {
        if (!confirm(CONFIG.MESSAGES.CONFIRM.DELETE)) {
            return;
        }
        
        try {
            await window.dbManager.deleteSupplier(id);
            this.showSuccess(CONFIG.MESSAGES.SUCCESS.DELETE);
            await this.loadSuppliers();
            await this.loadDashboard();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // FATTURE
    
    async loadInvoices() {
        try {
            const invoices = await window.dbManager.getInvoices();
            const listContainer = document.getElementById('invoices-list');
            
            if (invoices.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>Nessuna fattura trovata</h3>
                        <p>Inizia aggiungendo la tua prima fattura</p>
                    </div>
                `;
                return;
            }
            
            listContainer.innerHTML = invoices.map(invoice => `
                <div class="data-item">
                    <div class="data-info">
                        <h4>
                            Fattura ${this.escapeHtml(invoice.number)}
                            <span class="status-badge ${invoice.status === 'pagata' ? 'status-paid' : 'status-unpaid'}">
                                ${invoice.status === 'pagata' ? '✅ Pagata' : '⏳ Da Pagare'}
                            </span>
                        </h4>
                        <p>
                            ${invoice.supplier?.name || 'Fornitore non trovato'} - 
                            ${ConfigUtils.formatCurrency(invoice.amount)} - 
                            ${ConfigUtils.formatDate(invoice.date)}
                            ${invoice.file_name ? `<br><small>📎 ${invoice.file_name}</small>` : ''}
                        </p>
                    </div>
                    <div class="data-actions">
                        ${invoice.status === 'da_pagare' ? 
                            `<button class="btn-small btn-primary" onclick="app.markAsPaid('${invoice.id}')">
                                Segna Pagata
                            </button>` : ''
                        }
                        <button class="btn-small btn-delete" onclick="app.deleteInvoice('${invoice.id}')">
                            Elimina
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            this.showError('Errore caricamento fatture: ' + error.message);
        }
    }
    
    async openInvoiceModal() {
        try {
            // Carica fornitori per il dropdown
            const suppliers = await window.dbManager.getSuppliers();
            
            if (suppliers.length === 0) {
                this.showError('Aggiungi almeno un fornitore prima di creare una fattura');
                return;
            }
            
            this.currentModal = 'invoice-modal';
            
            const modal = document.getElementById('invoice-modal');
            const supplierSelect = document.getElementById('invoice-supplier');
            const form = document.getElementById('invoice-form');
            
            // Resetta form
            form.reset();
            
            // Popola dropdown fornitori
            supplierSelect.innerHTML = '<option value="">Seleziona fornitore...</option>' +
                suppliers.map(supplier => 
                    `<option value="${supplier.id}">${this.escapeHtml(supplier.name)}</option>`
                ).join('');
            
            // Imposta data odierna e status default
            document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('invoice-status').value = 'da_pagare';
            
            // Gestione upload file per estrazione automatica
            this.setupFileUploadHandler();
            
            modal.style.display = 'block';
            document.getElementById('invoice-number').focus();
            
        } catch (error) {
            this.showError('Errore apertura form fattura: ' + error.message);
        }
    }
    
    async handleInvoiceSubmit() {
        try {
            const number = document.getElementById('invoice-number').value.trim();
            const supplierId = document.getElementById('invoice-supplier').value;
            const amount = document.getElementById('invoice-amount').value;
            const date = document.getElementById('invoice-date').value;
            const status = document.getElementById('invoice-status').value;
            const fileInput = document.getElementById('invoice-file');
            
            // Validazione
            if (!number) {
                throw new Error('Il numero della fattura è obbligatorio');
            }
            
            if (!ConfigUtils.validateInvoiceNumber(number)) {
                throw new Error('Numero fattura non valido');
            }
            
            if (!supplierId) {
                throw new Error('Seleziona un fornitore');
            }
            
            if (!amount || parseFloat(amount) <= 0) {
                throw new Error('Inserisci un importo valido');
            }
            
            if (!date) {
                throw new Error('Seleziona una data');
            }
            
            const invoiceData = {
                number,
                supplier_id: supplierId,
                amount: parseFloat(amount),
                date,
                status: status || 'da_pagare',
                file_name: fileInput.files[0]?.name || null,
                file_path: null // Per ora non salviamo il file, solo il nome
            };
            
            await window.dbManager.addInvoice(invoiceData);
            this.showSuccess(CONFIG.MESSAGES.SUCCESS.SAVE);
            
            this.closeModal();
            await this.loadInvoices();
            await this.loadDashboard();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async deleteInvoice(id) {
        if (!confirm(CONFIG.MESSAGES.CONFIRM.DELETE)) {
            return;
        }
        
        try {
            await window.dbManager.deleteInvoice(id);
            this.showSuccess(CONFIG.MESSAGES.SUCCESS.DELETE);
            await this.loadInvoices();
            await this.loadDashboard();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    async markAsPaid(id) {
        try {
            await window.dbManager.updateInvoiceStatus(id, 'pagata');
            this.showSuccess('Fattura segnata come pagata!');
            await this.loadInvoices();
            await this.loadDashboard();
        } catch (error) {
            this.showError('Errore aggiornamento status: ' + error.message);
        }
    }
    
    // CHAT AI
    
    async loadChat() {
        const chatMessages = document.getElementById('chat-messages');
        
        if (!window.llmManager.isConfigured) {
            chatMessages.innerHTML = `
                <div class="chat-message system">
                    <div class="message-content">
                        <strong>Sistema:</strong> Chat AI non configurata. 
                        Per utilizzare la chat, configura la variabile d'ambiente OPENROUTER_API_KEY.
                        <br><small>Modello: ${CONFIG.LLM.MODEL_ID}</small>
                    </div>
                </div>
            `;
            return;
        }
        
        if (!chatMessages.innerHTML.trim()) {
            this.addChatMessage('system', 'Ciao! Sono il tuo assistente AI per l\'analisi delle fatture. Puoi chiedermi qualsiasi cosa sui tuoi dati finanziari, fornitori, trend e molto altro!');
        }
    }
    
    async sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        if (!window.llmManager.isConfigured) {
            this.addChatMessage('system', 'Chat non configurata. Imposta la variabile d\'ambiente OPENROUTER_API_KEY.');
            return;
        }
        
        // Aggiungi messaggio utente
        this.addChatMessage('user', message);
        chatInput.value = '';
        
        // Mostra indicatore di typing
        this.addChatMessage('assistant', 'Sto pensando...', true);
        
        try {
            // Carica dati attuali
            const [suppliers, invoices, stats] = await Promise.all([
                window.dbManager.getSuppliers(),
                window.dbManager.getInvoices(),
                window.dbManager.getStats()
            ]);
            
            // Invia richiesta al LLM
            const result = await window.llmManager.chatQuery(message, { suppliers, invoices, stats });
            
            // Rimuovi indicatore di typing
            this.removeChatTyping();
            
            if (result.success) {
                this.addChatMessage('assistant', result.message);
            } else {
                this.addChatMessage('system', `Errore: ${result.error}`);
            }
            
        } catch (error) {
            this.removeChatTyping();
            this.addChatMessage('system', `Errore: ${error.message}`);
        }
    }
    
    addChatMessage(sender, message, isTyping = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        if (isTyping) messageDiv.id = 'typing-indicator';
        
        const senderNames = {
            'user': 'Tu',
            'assistant': 'AI Assistant',
            'system': 'Sistema'
        };
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${senderNames[sender]}:</strong> ${this.formatChatMessage(message)}
            </div>
            <div class="message-time">${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    removeChatTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    formatChatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    clearChat() {
        if (confirm('Vuoi cancellare la cronologia della chat?')) {
            document.getElementById('chat-messages').innerHTML = '';
            this.addChatMessage('system', 'Chat cancellata. Ciao! Come posso aiutarti con i tuoi dati finanziari?');
        }
    }
    
    // UTILITÀ
    
    closeModal() {
        if (this.currentModal) {
            document.getElementById(this.currentModal).style.display = 'none';
            this.currentModal = null;
            this.currentEditId = null;
        }
    }
    
    showError(message) {
        // Implementazione semplice - si può migliorare con toast notifications
        alert('Errore: ' + message);
        ConfigUtils.error(message);
    }
    
    showSuccess(message) {
        // Implementazione semplice - si può migliorare con toast notifications
        alert(message);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Configura gestione upload file per estrazione automatica
    setupFileUploadHandler() {
        const fileInput = document.getElementById('invoice-file');
        
        // Rimuovi listener precedenti
        fileInput.removeEventListener('change', this.handleFileUpload);
        
        // Aggiungi nuovo listener
        this.handleFileUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Verifica tipo file
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                this.showError('Tipo file non supportato. Usa PNG, JPG o PDF.');
                fileInput.value = '';
                return;
            }
            
            // Verifica dimensione (max 5MB)
            if (file.size > CONFIG.APP.MAX_FILE_SIZE) {
                this.showError('File troppo grande. Massimo 5MB.');
                fileInput.value = '';
                return;
            }
            
            try {
                // Mostra loading
                document.body.style.cursor = 'wait';
                const originalText = document.querySelector('#invoice-modal .btn-primary').textContent;
                document.querySelector('#invoice-modal .btn-primary').textContent = 'Estraendo dati...';
                
                // Estrai dati con LLM
                const extracted = await window.llmManager.extractInvoiceData(file);
                
                // Compila campi automaticamente
                if (extracted.numero) {
                    document.getElementById('invoice-number').value = extracted.numero;
                }
                
                if (extracted.importo) {
                    // Rimuovi simboli di valuta e converti
                    const amount = extracted.importo.toString()
                        .replace(/[€$£,\s]/g, '')
                        .replace(/[.,](\d{2})$/, '.$1'); // Gestisce decimali
                    document.getElementById('invoice-amount').value = amount;
                }
                
                if (extracted.data) {
                    document.getElementById('invoice-date').value = extracted.data;
                }
                
                // Gestisci fornitore
                if (extracted.fornitore) {
                    await this.handleSupplierFromExtraction(extracted.fornitore);
                }
                
                this.showSuccess('✅ Dati estratti automaticamente dalla fattura!');
                
            } catch (error) {
                this.showError('Errore estrazione dati: ' + error.message);
                ConfigUtils.error('Errore estrazione OCR:', error);
            } finally {
                // Rimuovi loading
                document.body.style.cursor = 'default';
                document.querySelector('#invoice-modal .btn-primary').textContent = originalText;
            }
        };
        
        fileInput.addEventListener('change', this.handleFileUpload);
    }

    // Gestisce fornitore estratto da OCR
    async handleSupplierFromExtraction(supplierName) {
        try {
            const supplierId = await window.dbManager.findOrCreateSupplier(supplierName);
            document.getElementById('invoice-supplier').value = supplierId;
            
            // Se è un nuovo fornitore, ricarica la lista
            const currentOptions = document.getElementById('invoice-supplier').querySelectorAll('option');
            const exists = Array.from(currentOptions).some(opt => opt.value === supplierId);
            
            if (!exists) {
                // Ricarica suppliers
                const suppliers = await window.dbManager.getSuppliers();
                const supplierSelect = document.getElementById('invoice-supplier');
                supplierSelect.innerHTML = '<option value="">Seleziona fornitore...</option>' +
                    suppliers.map(supplier => 
                        `<option value="${supplier.id}" ${supplier.id === supplierId ? 'selected' : ''}>
                            ${this.escapeHtml(supplier.name)}
                        </option>`
                    ).join('');
            }
            
        } catch (error) {
            ConfigUtils.error('Errore gestione fornitore:', error);
            // Non bloccare il processo, l'utente può selezionare manualmente
        }
    }
}

// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MarinaFattureApp();
});
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
                case 'reports':
                    await this.loadReports();
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
                        <h4>Fattura ${this.escapeHtml(invoice.number)}</h4>
                        <p>
                            ${invoice.supplier?.name || 'Fornitore non trovato'} - 
                            ${ConfigUtils.formatCurrency(invoice.amount)} - 
                            ${ConfigUtils.formatDate(invoice.date)}
                        </p>
                    </div>
                    <div class="data-actions">
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
            
            // Imposta data odierna
            document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
            
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
                date
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
    
    // REPORTS
    
    async loadReports() {
        const reportsContainer = document.getElementById('reports-content');
        
        if (!window.llmManager.isConfigured) {
            reportsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>LLM non configurato</h3>
                    <p>Configura la tua API key di OpenRouter in js/config.js per abilitare i report intelligenti</p>
                    <p><small>Modello attuale: ${CONFIG.LLM.MODEL_ID}</small></p>
                </div>
            `;
            return;
        }
        
        reportsContainer.innerHTML = `
            <div class="reports-section">
                <h3>Report Intelligenti</h3>
                <p>Genera analisi e insights sui tuoi dati finanziari</p>
                
                <div class="report-buttons">
                    <button class="btn-primary" onclick="app.generateReport('financial')">
                        Analisi Finanziaria
                    </button>
                    <button class="btn-primary" onclick="app.generateReport('suppliers')">
                        Classificazione Fornitori
                    </button>
                    <button class="btn-primary" onclick="app.generateReport('trends')">
                        Trend e Pattern
                    </button>
                </div>
                
                <div id="report-output" class="report-output"></div>
            </div>
        `;
    }
    
    async generateReport(type) {
        const outputDiv = document.getElementById('report-output');
        outputDiv.innerHTML = '<p>Generando report...</p>';
        
        try {
            const [suppliers, invoices] = await Promise.all([
                window.dbManager.getSuppliers(),
                window.dbManager.getInvoices()
            ]);
            
            let result;
            switch (type) {
                case 'financial':
                    result = await window.llmManager.analyzeFinancials(suppliers, invoices);
                    break;
                case 'suppliers':
                    result = await window.llmManager.classifySuppliers(suppliers, invoices);
                    break;
                case 'trends':
                    result = await window.llmManager.generateReport('custom', { suppliers, invoices }, 
                        'Analizza i trend temporali e identifica pattern interessanti nei dati');
                    break;
            }
            
            if (result.success) {
                outputDiv.innerHTML = `
                    <div class="report-result">
                        <h4>Report Generato</h4>
                        <div class="report-content">${this.formatReportContent(result.message)}</div>
                    </div>
                `;
            } else {
                outputDiv.innerHTML = `<p class="error">Errore: ${result.error}</p>`;
            }
            
        } catch (error) {
            outputDiv.innerHTML = `<p class="error">Errore generazione report: ${error.message}</p>`;
        }
    }
    
    formatReportContent(content) {
        if (!content) return '<p>Nessun contenuto ricevuto</p>';
        
        // Formatta il contenuto del report per una migliore visualizzazione
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
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
}

// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MarinaFattureApp();
});
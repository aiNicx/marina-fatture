// Gestione Database con Supabase
class DatabaseManager {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.init();
    }
    
    // Inizializza la connessione al database
    async init() {
        try {
            if (!ConfigUtils.isDatabaseConfigured()) {
                ConfigUtils.debug('Database non configurato, uso localStorage come fallback');
                return;
            }
            
            // Inizializza Supabase (richiede libreria esterna)
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(
                    CONFIG.DATABASE.URL,
                    CONFIG.DATABASE.ANON_KEY
                );
                
                // Testa la connessione
                const { data, error } = await this.supabase
                    .from('suppliers')
                    .select('count', { count: 'exact', head: true });
                
                if (!error) {
                    this.isConnected = true;
                    ConfigUtils.debug('Connesso al database Supabase');
                }
            }
        } catch (error) {
            ConfigUtils.error('Errore inizializzazione database:', error);
        }
    }
    
    // FORNITORI
    
    async getSuppliers() {
        try {
            if (this.isConnected) {
                const { data, error } = await this.supabase
                    .from('suppliers')
                    .select('*')
                    .order('name');
                
                if (error) throw error;
                return data || [];
            } else {
                // Fallback localStorage
                const suppliers = localStorage.getItem('marina_suppliers');
                return suppliers ? JSON.parse(suppliers) : [];
            }
        } catch (error) {
            ConfigUtils.error('Errore caricamento fornitori:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    async addSupplier(supplier) {
        try {
            const newSupplier = {
                id: this.generateId(),
                name: supplier.name.trim(),
                vat: supplier.vat ? supplier.vat.trim().toUpperCase() : null,
                created_at: new Date().toISOString()
            };
            
            if (this.isConnected) {
                const { data, error } = await this.supabase
                    .from('suppliers')
                    .insert([newSupplier])
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            } else {
                // Fallback localStorage
                const suppliers = await this.getSuppliers();
                suppliers.push(newSupplier);
                localStorage.setItem('marina_suppliers', JSON.stringify(suppliers));
                return newSupplier;
            }
        } catch (error) {
            ConfigUtils.error('Errore aggiunta fornitore:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    async updateSupplier(id, supplier) {
        try {
            const updatedSupplier = {
                name: supplier.name.trim(),
                vat: supplier.vat ? supplier.vat.trim().toUpperCase() : null,
                updated_at: new Date().toISOString()
            };
            
            if (this.isConnected) {
                const { data, error } = await this.supabase
                    .from('suppliers')
                    .update(updatedSupplier)
                    .eq('id', id)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            } else {
                // Fallback localStorage
                const suppliers = await this.getSuppliers();
                const index = suppliers.findIndex(s => s.id === id);
                if (index === -1) throw new Error(CONFIG.MESSAGES.ERROR.NOT_FOUND);
                
                suppliers[index] = { ...suppliers[index], ...updatedSupplier };
                localStorage.setItem('marina_suppliers', JSON.stringify(suppliers));
                return suppliers[index];
            }
        } catch (error) {
            ConfigUtils.error('Errore aggiornamento fornitore:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    async deleteSupplier(id) {
        try {
            if (this.isConnected) {
                const { error } = await this.supabase
                    .from('suppliers')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            } else {
                // Fallback localStorage
                const suppliers = await this.getSuppliers();
                const filteredSuppliers = suppliers.filter(s => s.id !== id);
                localStorage.setItem('marina_suppliers', JSON.stringify(filteredSuppliers));
            }
            
            return true;
        } catch (error) {
            ConfigUtils.error('Errore eliminazione fornitore:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    // FATTURE
    
    async getInvoices() {
        try {
            if (this.isConnected) {
                const { data, error } = await this.supabase
                    .from('invoices')
                    .select(`
                        *,
                        supplier:suppliers(id, name)
                    `)
                    .order('date', { ascending: false });
                
                if (error) throw error;
                return data || [];
            } else {
                // Fallback localStorage
                const invoices = localStorage.getItem('marina_invoices');
                const parsedInvoices = invoices ? JSON.parse(invoices) : [];
                
                // Aggiungi info fornitore
                const suppliers = await this.getSuppliers();
                return parsedInvoices.map(invoice => ({
                    ...invoice,
                    supplier: suppliers.find(s => s.id === invoice.supplier_id)
                }));
            }
        } catch (error) {
            ConfigUtils.error('Errore caricamento fatture:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    async addInvoice(invoice) {
        try {
            const newInvoice = {
                id: this.generateId(),
                number: invoice.number.trim(),
                supplier_id: invoice.supplier_id,
                amount: parseFloat(invoice.amount),
                date: invoice.date,
                status: invoice.status || 'da_pagare',
                file_path: invoice.file_path || null,
                file_name: invoice.file_name || null,
                created_at: new Date().toISOString()
            };
            
            if (this.isConnected) {
                const { data, error } = await this.supabase
                    .from('invoices')
                    .insert([newInvoice])
                    .select(`
                        *,
                        supplier:suppliers(id, name)
                    `)
                    .single();
                
                if (error) throw error;
                return data;
            } else {
                // Fallback localStorage
                const invoices = localStorage.getItem('marina_invoices');
                const parsedInvoices = invoices ? JSON.parse(invoices) : [];
                parsedInvoices.push(newInvoice);
                localStorage.setItem('marina_invoices', JSON.stringify(parsedInvoices));
                
                // Aggiungi info fornitore
                const suppliers = await this.getSuppliers();
                newInvoice.supplier = suppliers.find(s => s.id === newInvoice.supplier_id);
                return newInvoice;
            }
        } catch (error) {
            ConfigUtils.error('Errore aggiunta fattura:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    async deleteInvoice(id) {
        try {
            if (this.isConnected) {
                const { error } = await this.supabase
                    .from('invoices')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            } else {
                // Fallback localStorage
                const invoices = localStorage.getItem('marina_invoices');
                const parsedInvoices = invoices ? JSON.parse(invoices) : [];
                const filteredInvoices = parsedInvoices.filter(i => i.id !== id);
                localStorage.setItem('marina_invoices', JSON.stringify(filteredInvoices));
            }
            
            return true;
        } catch (error) {
            ConfigUtils.error('Errore eliminazione fattura:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }

    // Cerca fornitore per nome o crea nuovo
    async findOrCreateSupplier(supplierName) {
        try {
            const suppliers = await this.getSuppliers();
            
            // Cerca fornitore esistente (case insensitive)
            const existing = suppliers.find(s => 
                s.name.toLowerCase().trim() === supplierName.toLowerCase().trim()
            );
            
            if (existing) {
                return existing.id;
            }
            
            // Crea nuovo fornitore
            const newSupplier = await this.addSupplier({
                name: supplierName.trim(),
                vat: null
            });
            
            return newSupplier.id;
        } catch (error) {
            ConfigUtils.error('Errore ricerca/creazione fornitore:', error);
            throw new Error('Impossibile gestire il fornitore');
        }
    }

    // Aggiorna status fattura
    async updateInvoiceStatus(id, status) {
        try {
            if (this.isConnected) {
                const { error } = await this.supabase
                    .from('invoices')
                    .update({ status })
                    .eq('id', id);
                
                if (error) throw error;
                return true;
            } else {
                // Fallback localStorage
                const invoices = localStorage.getItem('marina_invoices');
                const parsedInvoices = invoices ? JSON.parse(invoices) : [];
                const updatedInvoices = parsedInvoices.map(invoice => 
                    invoice.id === id ? { ...invoice, status } : invoice
                );
                localStorage.setItem('marina_invoices', JSON.stringify(updatedInvoices));
                return true;
            }
        } catch (error) {
            ConfigUtils.error('Errore aggiornamento status:', error);
            throw new Error(CONFIG.MESSAGES.ERROR.DATABASE);
        }
    }
    
    // UTILITÀ
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    async getStats() {
        try {
            const [suppliers, invoices] = await Promise.all([
                this.getSuppliers(),
                this.getInvoices()
            ]);
            
            const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
            
            return {
                totalSuppliers: suppliers.length,
                totalInvoices: invoices.length,
                totalAmount: totalAmount
            };
        } catch (error) {
            ConfigUtils.error('Errore caricamento statistiche:', error);
            return {
                totalSuppliers: 0,
                totalInvoices: 0,
                totalAmount: 0
            };
        }
    }
}

// Istanza globale del database manager
window.dbManager = new DatabaseManager();
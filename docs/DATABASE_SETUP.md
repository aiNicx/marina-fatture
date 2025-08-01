# Guida Setup Database - Marina Fatture

## Scelta del Database: Supabase

### Perché Supabase?

**Supabase** è la scelta ideale per questo progetto per i seguenti motivi:

✅ **Completamente Gratuito** (fino a 500MB storage, 2GB bandwidth/mese)  
✅ **PostgreSQL Completo** con tutte le funzionalità enterprise  
✅ **Real-time Subscriptions** per aggiornamenti live  
✅ **Autenticazione Integrata** (ready per future implementazioni)  
✅ **API REST Auto-generata** da schema database  
✅ **Dashboard Web Intuitiva** per gestione dati  
✅ **Backup Automatici** e point-in-time recovery  
✅ **Row Level Security (RLS)** per sicurezza granulare  
✅ **Edge Functions** per logica server-side  

### Alternative Considerate

| Database | Pro | Contro | Verdetto |
|----------|-----|--------|----------|
| **Supabase** | Gratuito, PostgreSQL, Real-time, RLS | Limiti tier gratuito | ✅ **SCELTO** |
| Firebase | Google ecosystem, Real-time | NoSQL, Complex queries difficili | ❌ |
| PlanetScale | MySQL serverless, Branching | Solo MySQL, Meno features | ❌ |
| Railway | PostgreSQL, Semplice | Tier gratuito limitato | ❌ |
| Neon | PostgreSQL serverless | Relativamente nuovo | ❌ |

## Setup Passo-Passo

### 1. Creazione Account Supabase

1. **Vai su** [supabase.com](https://supabase.com)
2. **Clicca** "Start your project"
3. **Registrati** con GitHub/Google/Email
4. **Verifica email** se richiesto

### 2. Creazione Progetto

1. **Dashboard** → "New Project"
2. **Nome progetto**: `marina-fatture`
3. **Password database**: Genera una password sicura e **SALVALA**
4. **Region**: Europe West (eu-west-1) per latenza ridotta
5. **Clicca** "Create new project"

⏳ **Attendi 2-3 minuti** per la creazione completa

### 3. Configurazione Tabelle

#### Accedi all'Editor SQL
1. **Sidebar** → "SQL Editor"
2. **Clicca** "New query"

#### Crea Schema Database
Copia e incolla questo SQL:

```sql
-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella Fornitori
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    vat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT suppliers_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT suppliers_vat_format CHECK (
        vat IS NULL OR 
        vat ~ '^IT[0-9]{11}$'
    )
);

-- Tabella Fatture
CREATE TABLE invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    number TEXT NOT NULL,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT invoices_number_not_empty CHECK (length(trim(number)) > 0),
    CONSTRAINT invoices_amount_positive CHECK (amount > 0),
    CONSTRAINT invoices_date_reasonable CHECK (
        date >= '2000-01-01' AND 
        date <= CURRENT_DATE + INTERVAL '1 year'
    )
);

-- Indici per performance
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_vat ON suppliers(vat);
CREATE INDEX idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_amount ON invoices(amount);

-- Unique constraint per evitare fatture duplicate
CREATE UNIQUE INDEX idx_invoices_unique_per_supplier 
ON invoices(supplier_id, number);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- View per statistiche rapide
CREATE VIEW stats_summary AS
SELECT 
    (SELECT COUNT(*) FROM suppliers) as total_suppliers,
    (SELECT COUNT(*) FROM invoices) as total_invoices,
    (SELECT COALESCE(SUM(amount), 0) FROM invoices) as total_amount,
    (SELECT COALESCE(AVG(amount), 0) FROM invoices) as avg_invoice_amount,
    (SELECT MAX(date) FROM invoices) as last_invoice_date;

-- Dati di esempio (opzionale)
INSERT INTO suppliers (name, vat) VALUES 
('Acme Corporation', 'IT12345678901'),
('Tech Solutions SRL', 'IT98765432109'),
('Consulting Partners', NULL);

INSERT INTO invoices (number, supplier_id, amount, date) VALUES 
('2024-001', (SELECT id FROM suppliers WHERE name = 'Acme Corporation'), 1500.00, '2024-01-15'),
('2024-002', (SELECT id FROM suppliers WHERE name = 'Tech Solutions SRL'), 800.50, '2024-01-20'),
('2024-003', (SELECT id FROM suppliers WHERE name = 'Acme Corporation'), 2200.00, '2024-02-01');
```

3. **Clicca** "Run" per eseguire lo script
4. **Verifica** che non ci siano errori

### 4. Configurazione Row Level Security (RLS)

Per ora disabilitiamo RLS per semplicità (in produzione andrebbero configurate le policies):

```sql
-- Disabilita RLS per development
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Per abilitare RLS in futuro:
-- ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
-- CREATE POLICY "Enable all operations for authenticated users" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
```

### 5. Ottieni Credenziali API

1. **Settings** → "API"
2. **Copia** i seguenti valori:

```
Project URL: https://[PROJECT-ID].supabase.co
anon public key: eyJ...
service_role key: eyJ... (opzionale, per operazioni admin)
```

### 6. Configurazione App

Apri `js/config.js` e inserisci le credenziali:

```javascript
DATABASE: {
    URL: 'https://[IL-TUO-PROJECT-ID].supabase.co',
    ANON_KEY: 'eyJ[LA-TUA-ANON-KEY]...',
    SERVICE_ROLE_KEY: '' // Lascia vuoto per ora
}
```

### 7. Include Supabase Client

Aggiungi prima di `</head>` in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## Test Connessione

### 1. Testa nel Browser

1. Apri `index.html` nel browser
2. Apri **Console Developer** (F12)
3. Se tutto funziona vedrai: `"Connesso al database Supabase"`
4. La dashboard dovrebbe mostrare le statistiche

### 2. Verifica Dati

1. **Supabase Dashboard** → "Table Editor"
2. Dovresti vedere le tabelle `suppliers` e `invoices`
3. Con i dati di esempio se li hai inseriti

## Gestione Dati via Dashboard

### Visualizza Dati
1. **Table Editor** → Seleziona tabella
2. Visualizza/modifica record direttamente

### Backup Dati
1. **Settings** → "Database"
2. **Download backup** in formato SQL

### Monitoraggio
1. **Reports** → Visualizza usage e performance
2. **Logs** → Debug query e errori

## Troubleshooting

### Errore: "Invalid API Key"
```javascript
// Verifica in js/config.js:
DATABASE: {
    URL: 'https://[CORRECT-PROJECT-ID].supabase.co', // ✅ URL corretto
    ANON_KEY: 'eyJ...' // ✅ Chiave corretta senza spazi
}
```

### Errore: "Table doesn't exist"
```sql
-- Ri-esegui lo script di creazione tabelle
-- Verifica che non ci siano errori nella creazione
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Errore: "CORS Policy"
```javascript
// In config.js assicurati di avere:
'HTTP-Referer': window.location.origin,
```

### App usa localStorage invece di Supabase
1. **Verifica** URL e API key in config.js
2. **Controlla** console per errori di connessione
3. **Testa** manualmente la connessione:

```javascript
// In console browser:
const { data, error } = await window.dbManager.supabase
    .from('suppliers')
    .select('count', { count: 'exact', head: true });
console.log('Test:', data, error);
```

## Migrazione da LocalStorage

Se hai dati in localStorage, puoi migrarli:

```javascript
// Esegui in console browser per migrare dati esistenti
async function migrateFromLocalStorage() {
    const suppliers = JSON.parse(localStorage.getItem('marina_suppliers') || '[]');
    const invoices = JSON.parse(localStorage.getItem('marina_invoices') || '[]');
    
    // Migra fornitori
    for (const supplier of suppliers) {
        await window.dbManager.addSupplier(supplier);
    }
    
    // Migra fatture
    for (const invoice of invoices) {
        await window.dbManager.addInvoice(invoice);
    }
    
    console.log('Migrazione completata!');
}

// migrateFromLocalStorage();
```

## Limiti Tier Gratuito Supabase

- **Database**: 500MB storage
- **Bandwidth**: 2GB/mese  
- **Edge Functions**: 500,000 invocazioni/mese
- **Realtime**: 2 connessioni simultanee
- **Auth**: 50,000 monthly active users

Per un'app di gestione fatture personale/piccola azienda, questi limiti sono più che sufficienti.

## Upgrade Path

Quando necessario, Supabase offre piani a partire da $25/mese con:
- **Storage illimitato**
- **Bandwidth illimitato** 
- **Backup point-in-time**
- **Support prioritario**

## Sicurezza Produzione

Per deploy in produzione, abilita:

```sql
-- Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies esempio (personalizza in base alle tue esigenze)
CREATE POLICY "Users can view their own data" ON suppliers
    FOR ALL USING (auth.uid()::text = created_by);
```

Con questa configurazione, hai un database PostgreSQL completo, gratuito e scalabile per la tua app Marina Fatture!
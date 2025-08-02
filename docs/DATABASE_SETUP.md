# Setup Database - Marina Fatture

## Supabase (Consigliato)

### Perché Supabase?
- ✅ **Gratuito** (500MB storage, 2GB bandwidth/mese)
- ✅ **PostgreSQL completo** con API REST auto-generata
- ✅ **Real-time** per aggiornamenti live
- ✅ **Backup automatici**

## Setup Passo-Passo

### 1. Creazione Account
1. Vai su [supabase.com](https://supabase.com)
2. Registrati con GitHub/Google/Email

### 2. Creazione Progetto
1. **New Project** → Nome: `marina-fatture`
2. **Password database**: Genera e salva
3. **Region**: Europe West (eu-west-1)
4. **Attendi 2-3 minuti** per la creazione

### 3. Creazione Tabelle

**SQL Editor** → **New query** → Copia e incolla:

```sql
-- Abilita estensioni
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella Fornitori
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    vat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT suppliers_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT suppliers_vat_format CHECK (
        vat IS NULL OR vat ~ '^IT[0-9]{11}$'
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
    
    CONSTRAINT invoices_number_not_empty CHECK (length(trim(number)) > 0),
    CONSTRAINT invoices_amount_positive CHECK (amount > 0)
);

-- Indici per performance
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX idx_invoices_date ON invoices(date);

-- Trigger per updated_at
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

-- Disabilita RLS per semplicità
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Dati di esempio
INSERT INTO suppliers (name, vat) VALUES 
('Acme Corporation', 'IT12345678901'),
('Tech Solutions SRL', 'IT98765432109');

INSERT INTO invoices (number, supplier_id, amount, date) VALUES 
('2024-001', (SELECT id FROM suppliers WHERE name = 'Acme Corporation'), 1500.00, '2024-01-15'),
('2024-002', (SELECT id FROM suppliers WHERE name = 'Tech Solutions SRL'), 800.50, '2024-01-20');
```

### 4. Ottieni Credenziali

**Settings** → **API** → Copia:
- Project URL: `https://[PROJECT-ID].supabase.co`
- anon public key: `eyJ...`

### 5. Configurazione App

Aggiorna `js/config.js`:

```javascript
DATABASE: {
    URL: 'https://[IL-TUO-PROJECT-ID].supabase.co',
    ANON_KEY: 'eyJ[LA-TUA-ANON-KEY]...'
}
```

## Test Connessione

1. Apri `index.html`
2. Console browser (F12) deve mostrare: `"Connesso al database Supabase"`
3. Dashboard mostra statistiche

## Troubleshooting

### "Invalid API Key"
- Verifica URL e ANON_KEY in `js/config.js`
- Rimuovi spazi extra dalle chiavi

### "Table doesn't exist"
- Ri-esegui lo script SQL di creazione tabelle
- Verifica che non ci siano errori

### App usa localStorage
- Controlla console per errori di connessione
- Verifica credenziali API in config.js

## Limiti Tier Gratuito

- **Database**: 500MB storage
- **Bandwidth**: 2GB/mese
- **Ideale** per uso personale/piccole aziende

Per upgrade: $25/mese con storage e bandwidth illimitati.
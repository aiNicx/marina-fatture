#!/bin/bash

echo "🚀 Preparando deploy per Netlify..."

# Aggiungi tutti i file
git add .

# Controlla se ci sono modifiche da committare
if git diff --staged --quiet; then
    echo "⚠️  Nessuna modifica da committare"
else
    echo "📝 Committando modifiche..."
    git commit -m "Fix variabili d'ambiente Netlify - risoluzione errore process.env"
    
    echo "⬆️  Pushando su repository..."
    git push origin main
    
    echo "✅ Deploy completato!"
    echo ""
    echo "🔍 Prossimi passi:"
    echo "1. Vai su Netlify dashboard"
    echo "2. Verifica che il build sia completato con successo"
    echo "3. Testa su: tuosito.netlify.app/test-env.html"
    echo "4. Se tutto OK, testa la chat su: tuosito.netlify.app"
fi

echo ""
echo "📋 Checklist Deploy:"
echo "[ ] Build Netlify completato senza errori"
echo "[ ] Variabile OPENROUTER_API_KEY impostata in Netlify"
echo "[ ] Test page (test-env.html) mostra tutto OK"
echo "[ ] Chat AI risponde correttamente"
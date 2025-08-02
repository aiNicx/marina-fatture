// Funzione Netlify per iniettare le variabili d'ambiente
exports.handler = async (event, context) => {
  // Genera lo script che definisce le variabili globali
  const envScript = `
    // Variabili d'ambiente iniettate da Netlify
    window.OPENROUTER_API_KEY = "${process.env.OPENROUTER_API_KEY || ''}";
    
    // Debug info (solo se in sviluppo)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
      console.log('Environment variables loaded:', {
        hasOpenRouterKey: !!(process.env.OPENROUTER_API_KEY),
        nodeEnv: "${process.env.NODE_ENV || 'production'}"
      });
    }
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: envScript
  };
};
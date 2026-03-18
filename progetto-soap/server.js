const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();

// --- DATI STORICI REALI (2020-2025) ---
const stockHistory = {
    AAPL: [132.69, 177.57, 129.93, 192.53, 250.42, 271.86],
    MSFT: [222.42, 336.32, 239.82, 376.04, 421.50, 483.62],
    GOOGL: [87.63, 144.84, 88.23, 139.69, 189.29, 312.78],
    NVDA: [13.06, 29.41, 14.61, 49.52, 139.29, 186.50],
    AMD: [91.71, 143.90, 64.77, 147.41, 120.79, 214.16],
    VWCE: [81.42, 104.72, 90.61, 107.08, 133.22, 145.42],
    NASDAQ: [313.74, 397.85, 266.28, 409.52, 511.23, 614.31], 
    SPY: [373.88, 474.96, 382.43, 475.31, 586.08, 681.92]
};
const years = ["2020", "2021", "2022", "2023", "2024", "2025"];

// --- NUOVI DATI ATTUALI (Simulati al 27 Febbraio 2026) ---
const currentPrices = {
    AAPL: 264.18,
    MSFT: 392.74,
    GOOGL: 311.76,
    NVDA: 177.19,
    AMD: 200.21,
    VWCE: 149.82, 
    NASDAQ: 607.29, 
    SPY: 685.99
};

// Tasso di cambio fisso  USD -> EUR (1 eur = 1.18 usd)
const usdToEurRate = 0.8475;

// --- LOGICA DEL SERVIZIO SOAP ---
const service = {
    StockService: {
        StockPort: {
            // Operazione 1: Storia (esistente)
            GetStockHistory: function(args) {
                const symbol = args.symbol;
                return { history: JSON.stringify({ labels: years, prices: stockHistory[symbol] || [] }) };
            },
            
            // Operazione 2: Prezzo Attuale (NUOVA)
            GetCurrentPrice: function(args) {
                const symbol = args.symbol;
                const priceUsd = currentPrices[symbol] || 0;
                
                // Impacchettiamo prezzo e tasso di cambio
                return {
                    currentData: JSON.stringify({
                        priceUsd: priceUsd,
                        exchangeRate: usdToEurRate,
                        date: "27 Febbraio 2026"
                    })
                };
            }
        }
    }
};

// --- CONFIGURAZIONE SERVER ---
const xml = fs.readFileSync('service.wsdl', 'utf8');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8000, function(){
    soap.listen(app, '/stock', service, xml, function(){
        console.log("Dashboard: http://localhost:8000");
    });
});
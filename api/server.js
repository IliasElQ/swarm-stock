const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Variables d'environnement pour l'identification du conteneur
const NODE_ID = process.env.NODE_ID || 'unknown';
const SERVICE_ID = process.env.SERVICE_ID || 'unknown';
const TASK_ID = process.env.TASK_ID || 'unknown';
const HOSTNAME = os.hostname();

// Stockage en mémoire des dernières données
let stockData = {
    stocks: [],
    timestamp: null,
    generator: null
};

// Historique des prix (limité aux 100 dernières mises à jour par symbole)
const priceHistory = {};

// Compteur de requêtes pour évaluer la charge
let requestCounter = 0;
const startTime = Date.now();

// Endpoint pour recevoir les données du générateur
app.post('/stock-data', (req, res) => {
    const data = req.body;
    stockData = {
        stocks: data.stocks,
        timestamp: data.timestamp,
        generator: data.generator
    };
    
    // Mettre à jour l'historique des prix
    data.stocks.forEach(stock => {
        if (!priceHistory[stock.symbol]) {
            priceHistory[stock.symbol] = [];
        }
        
        priceHistory[stock.symbol].push({
            price: stock.price,
            timestamp: stock.timestamp
        });
        
        // Limiter l'historique à 100 points
        if (priceHistory[stock.symbol].length > 100) {
            priceHistory[stock.symbol].shift();
        }
    });
    
    requestCounter++;
    res.status(200).send({ status: 'success' });
});

// Endpoint pour récupérer les données actuelles
app.get('/stock-data', (req, res) => {
    requestCounter++;
    
    // Ajouter des informations sur le nœud qui traite la requête
    const response = {
        ...stockData,
        node: {
            hostname: HOSTNAME,
            nodeId: NODE_ID,
            serviceId: SERVICE_ID,
            taskId: TASK_ID
        }
    };
    
    res.json(response);
});

// Endpoint pour récupérer l'historique d'une action spécifique
app.get('/stock-history/:symbol', (req, res) => {
    requestCounter++;
    
    const symbol = req.params.symbol.toUpperCase();
    if (priceHistory[symbol]) {
        res.json({
            symbol,
            history: priceHistory[symbol],
            node: {
                hostname: HOSTNAME,
                nodeId: NODE_ID,
                serviceId: SERVICE_ID,
                taskId: TASK_ID
            }
        });
    } else {
        res.status(404).json({ error: `Symbole ${symbol} non trouvé` });
    }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    const uptime = (Date.now() - startTime) / 1000; // in seconds
    const requestsPerSecond = requestCounter / uptime;

    res.json({
        hostname: HOSTNAME,
        uptime,
        requestsTotal: requestCounter,
        requestsPerSecond,
        memory: {
            free: os.freemem(),
            total: os.totalmem()
        },
        loadAverage: os.loadavg()
    });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Service API démarré sur le port ${PORT} (${HOSTNAME})`);
});

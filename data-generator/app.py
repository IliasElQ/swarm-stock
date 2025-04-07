import time
import random
import requests
import os
import json
from datetime import datetime
import socket

# Configuration
API_ENDPOINT = "http://api:8080/stock-data"
UPDATE_FREQUENCY = int(os.environ.get('UPDATE_FREQUENCY', 1000))  # en millisecondes
HOSTNAME = socket.gethostname()

# Liste des actions
stocks = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 150.0},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 300.0},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2800.0},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3300.0},
    {"symbol": "META", "name": "Meta Platforms Inc.", "price": 330.0},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 700.0},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "price": 250.0},
    {"symbol": "NFLX", "name": "Netflix Inc.", "price": 550.0}
]

print(f"Démarrage du générateur de données sur {HOSTNAME} avec mise à jour tous les {UPDATE_FREQUENCY}ms")

while True:
    timestamp = datetime.now().isoformat()
    
    # Mettre à jour les prix avec une variation aléatoire
    for stock in stocks:
        # Générer un mouvement de prix aléatoire entre -2% et +2%
        change_pct = (random.random() * 4) - 2
        stock["price"] = max(0.1, stock["price"] * (1 + (change_pct / 100)))
        stock["change_pct"] = change_pct
        stock["timestamp"] = timestamp
        stock["generator"] = HOSTNAME
    
    # Envoyer les données à l'API
    try:
        payload = {
            "stocks": stocks,
            "generator": HOSTNAME,
            "timestamp": timestamp
        }
        response = requests.post(API_ENDPOINT, json=payload)
        print(f"Données envoyées, statut: {response.status_code}")
    except Exception as e:
        print(f"Erreur lors de l'envoi des données: {e}")
    
    # Attendre avant la prochaine mise à jour
    time.sleep(UPDATE_FREQUENCY / 1000)

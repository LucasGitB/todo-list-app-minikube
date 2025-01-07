# Utiliser la dernière version stable de Node.js
FROM node:22.12.0-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste de l'application
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Démarrer le serveur
CMD ["node", "src/server.js"]

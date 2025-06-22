var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config();  // Charger les variables d'environnement à partir du fichier .env
var app = express();

// Middleware pour parser les données JSON
app.use(bodyParser.json());
app.use(express.static('public')); // Pour servir les fichiers statiques comme CSS, JS, images, etc.

// Récupérer l'URL de la base de données à partir des variables d'environnement
const databaseUrl = process.env.DATABASE_URL;

// Déclare un état de connexion à la base de données
let dbStatus = 'disconnected';

// Connecter MongoDB avec l'URL provenant de la variable d'environnement
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connecté à la base de données MongoDB');
  dbStatus = 'connected'; // Si la connexion est réussie
}).catch(err => {
  console.error('Erreur de connexion à la base de données MongoDB', err);
  dbStatus = 'error'; // Si la connexion échoue
});

// Définir le schéma et le modèle pour les données
var contactSchema = new mongoose.Schema({
  nom: String,
  email: String,
  message: String
});

// Créer le modèle
var Contact = mongoose.model('Contact', contactSchema);

// Route d'accueil
app.get('/', function (req, res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue chez SmartConseil</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          text-align: center;
          padding: 50px;
        }
        h1 {
          color: #0044cc;
        }
        p {
          font-size: 1.2em;
          color: #333;
        }
        .logo {
          max-width: 900px;
          margin: 90px 0;
        }
        .footer {
          margin-top: 50px;
          color: #888;
          font-size: 0.9em;
        }
        #connectBtn {
          background-color: #4CAF50;
          color: white;
          padding: 15px 20px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          margin-top: 30px;
        }
        #connectBtn:hover {
          background-color: #45a049;
        }
        #popup {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          text-align: center;
          padding: 50px;
        }
        #popupMessage {
          background-color: #333;
          padding: 20px;
          margin: 50px auto;
          display: inline-block;
          border-radius: 5px;
        }
        #popupCloseBtn {
          margin-top: 20px;
          background-color: red;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h1>Bienvenue chez SmartConseil</h1>
      <img class="logo" src="/images/logo-smartconseil.png" alt="SmartConseil Logo">
      <p>Nous sommes une entreprise spécialisée dans le conseil en transformation digitale, IT et stratégie.</p>
      <p>Notre mission est de vous accompagner dans vos projets de développement et d'optimisation des processus.</p>
      
      <button id="connectBtn" onclick="connectDatabase()">Connecter à la base de données</button>

      <div id="popup">
        <div id="popupMessage"></div>
        <button id="popupCloseBtn" onclick="closePopup()">Fermer</button>
      </div>

      <div class="footer">
        <p>&copy; 2025 SmartConseil. Tous droits réservés.</p>
      </div>

      <script>
        // Fonction pour se connecter à la base de données
        function connectDatabase() {
          fetch('/check-database')
            .then(response => response.json())
            .then(data => {
              let message = "";
              if (data.status === "connected") {
                message = "La connexion à la base de données a été établie avec succès!";
                document.getElementById("popupMessage").style.backgroundColor = "#4CAF50";
              } else {
                message = "Échec de la connexion à la base de données!";
                document.getElementById("popupMessage").style.backgroundColor = "#f44336";
              }
              document.getElementById("popupMessage").textContent = message;
              document.getElementById("popup").style.display = "block";
            })
            .catch(error => {
              console.error("Erreur lors de la connexion :", error);
              document.getElementById("popupMessage").textContent = "Une erreur s'est produite lors de la tentative de connexion.";
              document.getElementById("popup").style.display = "block";
            });
        }

        // Fonction pour fermer le popup
        function closePopup() {
          document.getElementById("popup").style.display = "none";
        }
      </script>
    </body>
    </html>
  `);
});

// Route pour vérifier l'état de la base de données
app.get('/check-database', function (req, res) {
  if (dbStatus === 'connected') {
    res.json({ status: 'connected' });
  } else {
    res.json({ status: 'error' });
  }
});

// Route pour ajouter un contact
app.post('/contact', function (req, res) {
  const { nom, email, message } = req.body;

  // Créer un nouveau contact
  const newContact = new Contact({
    nom: nom,
    email: email,
    message: message
  });

  // Sauvegarder dans la base de données
  newContact.save()
    .then(contact => {
      res.status(201).json({ message: 'Contact créé avec succès!', contact: contact });
    })
    .catch(err => {
      res.status(500).json({ message: 'Erreur lors de la création du contact', error: err });
    });
});

// Route pour afficher tous les contacts
app.get('/contacts', function (req, res) {
  Contact.find()
    .then(contacts => {
      res.status(200).json(contacts);
    })
    .catch(err => {
      res.status(500).json({ message: 'Erreur lors de la récupération des contacts', error: err });
    });
});

// Lancer le serveur sur le port 3000
app.listen(3000, function () {
  console.log('Application SmartConseil écoute sur le port 3000!');
});


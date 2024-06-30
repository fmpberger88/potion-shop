// Import the mongoose module
const mongoose = require('mongoose');

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
// mongoose.set("strictQuery", false);

const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log("MongoDB connection error:", err));

async function main() {
    try {
        // Versucht eine Verbindung zur Datenbank herzustellen
        await mongoose.connect(mongoDB);
        console.log("Connected successfully to MongoDB!");
    } catch (err) {
        // Gibt Fehlermeldungen aus, falls die Verbindung fehlschlägt
        console.error("Failed to connect to MongoDB:", err.message);
        throw err;  // Weitergeben des Fehlers, um die .catch im main Aufruf zu aktivieren
    }
}

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function migrateData() {
    const mysqlConfig = {
        host: 'localhost',
        user: 'root',
        password: 'Hase23&24',
        database: 'parkify_db'
    };

    const mongoUri = 'mongodb://hase_db:Hase2324@ac-9e68srw-shard-00-00.whf5hiq.mongodb.net:27017,ac-9e68srw-shard-00-01.whf5hiq.mongodb.net:27017,ac-9e68srw-shard-00-02.whf5hiq.mongodb.net:27017/?ssl=true&replicaSet=atlas-fjlyo9-shard-0&authSource=admin&appName=Cluster0';

    console.log("Connecting to databases...");
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();

    const db = mongoClient.db('parkify_db');

    const tables = [
        'users', 'vehicles', 'inventory', 'service_center',
        'service_item', 'service_appointment', 'parking_location',
        'parking_place', 'parking_slot', 'reservation', 'payment',
        'notification', 'activity_log', 'otp', 'favorite_location'
    ];

    for (const table of tables) {
        console.log(`Migrating table: ${table}...`);
        try {
            const [rows] = await mysqlConnection.execute(`SELECT * FROM ${table}`);
            if (rows.length > 0) {
                const collection = db.collection(table);

                const formattedRows = rows.map(row => {
                    row._id = row.id;
                    delete row.id;
                    return row;
                });

                await collection.insertMany(formattedRows);
                console.log(`Successfully migrated ${rows.length} records to ${table}.`);

                const maxId = Math.max(...formattedRows.map(r => r._id));
                await db.collection('database_sequences').updateOne(
                    { _id: table + "_sequence" },
                    { $set: { seq: maxId } },
                    { upsert: true }
                );
            }
        } catch (error) {
            console.error(`Error migrating ${table}: ${error.message}`);
        }
    }

    console.log("Migration complete!");
    await mysqlConnection.end();
    await mongoClient.close();
}

migrateData();

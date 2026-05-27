const mysql = require('mysql2/promise');
const { MongoClient, DBRef, Long } = require('mongodb');

function toCamelCase(str) {
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

const tableMappings = {
    'users': { collection: 'user', sequence: 'User_sequence' },
    'vehicles': { collection: 'vehicle', sequence: 'Vehicle_sequence' },
    'inventory': { collection: 'inventory', sequence: 'Inventory_sequence' },
    'service_center': { collection: 'serviceCenter', sequence: 'ServiceCenter_sequence' },
    'service_items': { collection: 'serviceItem', sequence: 'ServiceItem_sequence' },
    'service_appointment': { collection: 'serviceAppointment', sequence: 'ServiceAppointment_sequence' },
    'parking_locations': { collection: 'parkingLocation', sequence: 'ParkingLocation_sequence' },
    'parking_places': { collection: 'parkingPlace', sequence: 'ParkingPlace_sequence' },
    'parking_slots': { collection: 'parkingSlot', sequence: 'ParkingSlot_sequence' },
    'reservations': { collection: 'reservation', sequence: 'Reservation_sequence' },
    'payments': { collection: 'payment', sequence: 'Payment_sequence' },
    'notifications': { collection: 'notification', sequence: 'Notification_sequence' },
    'activity_log': { collection: 'activityLog', sequence: 'ActivityLog_sequence' },
    'otp': { collection: 'otp', sequence: 'Otp_sequence' },
    'favorite_location': { collection: 'favoriteLocation', sequence: 'FavoriteLocation_sequence' }
};

const dbRefMappings = {
    'inventory': { 'userId': 'user', 'parkingPlaceId': 'parkingPlace' },
    'notification': { 'userId': 'user' },
    'parkingLocation': { 'parkingPlaceId': 'parkingPlace' },
    'parkingSlot': { 'parkingPlaceId': 'parkingPlace' },
    'payment': { 'reservationId': 'reservation' },
    'serviceCenter': { 'userId': 'user' },
    'serviceItem': { 'serviceCenterId': 'serviceCenter', 'inventoryId': 'inventory' },
    'user': { 'serviceCenterId': 'serviceCenter' },
    'vehicle': { 'userId': 'owner' }
};

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

    console.log("Clearing old collections...");
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
    for (const colName of existingCollections) {
        await db.collection(colName).drop();
    }
    console.log("Cleared old collections.");

    for (const [mysqlTable, mongoMap] of Object.entries(tableMappings)) {
        console.log(`Migrating table: ${mysqlTable} -> Collection: ${mongoMap.collection}...`);
        try {
            const [rows] = await mysqlConnection.execute(`SELECT * FROM ${mysqlTable}`);
            if (rows.length > 0) {
                const formattedRows = rows.map(row => {
                    const formatted = {};
                    for (const key in row) {
                        const camelKey = toCamelCase(key);
                        let val = row[key];

                        let finalKey = (camelKey === 'id') ? '_id' : camelKey;

                        if (Buffer.isBuffer(val)) {
                            val = val[0] === 1;
                        }
                        else if ((finalKey === 'active' || finalKey === 'twoFactorEnabled' || finalKey === 'hasInventory' || finalKey === 'hasServiceCenter') && typeof val === 'number') {
                            val = val === 1;
                        }

                        if (mongoMap.collection === 'vehicle' && finalKey === 'ownerId') {
                            finalKey = 'owner';
                            val = new DBRef('user', Long.fromNumber(val));
                        }
                        if (mongoMap.collection === 'vehicle' && finalKey === 'userId') {
                            finalKey = 'owner';
                            val = new DBRef('user', Long.fromNumber(val));
                        }

                        if (dbRefMappings[mongoMap.collection] && dbRefMappings[mongoMap.collection][finalKey] && val !== null) {
                            const refCollectionName = dbRefMappings[mongoMap.collection][finalKey];
                            val = new DBRef(refCollectionName, Long.fromNumber(val));
                            finalKey = refCollectionName;
                        }

                        formatted[finalKey] = val;
                    }
                    return formatted;
                });

                const collection = db.collection(mongoMap.collection);
                await collection.insertMany(formattedRows);
                console.log(`Successfully migrated ${rows.length} records to ${mongoMap.collection}.`);

                const maxId = Math.max(...formattedRows.map(r => r._id));
                await db.collection('database_sequences').updateOne(
                    { _id: mongoMap.sequence },
                    { $set: { seq: maxId } },
                    { upsert: true }
                );
            } else {
                console.log(`No records found in ${mysqlTable}, skipping.`);
            }
        } catch (error) {
            console.log(`Error migrating ${mysqlTable}: ${error.message}`);
        }
    }

    console.log("Migration complete!");
    await mysqlConnection.end();
    await mongoClient.close();
}

migrateData();

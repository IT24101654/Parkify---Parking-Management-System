const { MongoClient } = require('mongodb');

async function fixCollections() {
    const mongoUri = 'mongodb://hase_db:Hase2324@ac-9e68srw-shard-00-00.whf5hiq.mongodb.net:27017,ac-9e68srw-shard-00-01.whf5hiq.mongodb.net:27017,ac-9e68srw-shard-00-02.whf5hiq.mongodb.net:27017/?ssl=true&replicaSet=atlas-fjlyo9-shard-0&authSource=admin&appName=Cluster0';
    const client = new MongoClient(mongoUri);
    
    try {
        await client.connect();
        const db = client.db('parkify_db');
        
        console.log("Connected to MongoDB Atlas.");

        // Mapping of old MySQL table names to new Spring Data MongoDB collection names
        const collectionMappings = {
            'users': 'user',
            'vehicles': 'vehicle',
            'inventory': 'inventory',
            'service_center': 'serviceCenter',
            'service_item': 'serviceItem',
            'service_appointment': 'serviceAppointment',
            'parking_location': 'parkingLocation',
            'parking_place': 'parkingPlace',
            'parking_slot': 'parkingSlot',
            'reservation': 'reservation',
            'payment': 'payment',
            'notification': 'notification',
            'activity_log': 'activityLog',
            'otp': 'otp',
            'favorite_location': 'favoriteLocation'
        };

        const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

        for (const [oldName, newName] of Object.entries(collectionMappings)) {
            if (oldName !== newName && existingCollections.includes(oldName)) {
                console.log(`Renaming collection ${oldName} to ${newName}...`);
                try {
                    await db.collection(oldName).rename(newName);
                } catch (e) {
                    console.log(`Failed to rename ${oldName}: ${e.message}`);
                }
            }
        }

        // Mapping of sequence IDs to match Java Class names
        const sequenceMappings = {
            'users_sequence': 'User_sequence',
            'vehicles_sequence': 'Vehicle_sequence',
            'inventory_sequence': 'Inventory_sequence',
            'service_center_sequence': 'ServiceCenter_sequence',
            'service_item_sequence': 'ServiceItem_sequence',
            'service_appointment_sequence': 'ServiceAppointment_sequence',
            'parking_location_sequence': 'ParkingLocation_sequence',
            'parking_place_sequence': 'ParkingPlace_sequence',
            'parking_slot_sequence': 'ParkingSlot_sequence',
            'reservation_sequence': 'Reservation_sequence',
            'payment_sequence': 'Payment_sequence',
            'notification_sequence': 'Notification_sequence',
            'activity_log_sequence': 'ActivityLog_sequence',
            'otp_sequence': 'Otp_sequence',
            'favorite_location_sequence': 'FavoriteLocation_sequence'
        };

        const seqCol = db.collection('database_sequences');
        for (const [oldId, newId] of Object.entries(sequenceMappings)) {
            const seqDoc = await seqCol.findOne({ _id: oldId });
            if (seqDoc) {
                console.log(`Renaming sequence ${oldId} to ${newId}...`);
                await seqCol.insertOne({ _id: newId, seq: seqDoc.seq });
                await seqCol.deleteOne({ _id: oldId });
            }
        }

        console.log("Fix completed successfully!");

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

fixCollections();

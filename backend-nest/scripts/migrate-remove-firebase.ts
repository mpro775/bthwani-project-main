/**
 * Migration Script: Remove Firebase Auth
 * 
 * This script:
 * 1. Removes firebaseUID field from all users
 * 2. Updates authProvider from 'firebase' to 'local'
 * 3. Drops firebaseUID index from MongoDB
 * 4. Checks for users without password (they may need password reset)
 */

import { connect, connection, model, Schema } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/bthwani';

// User Schema (simplified for migration)
const UserSchema = new Schema({
  firebaseUID: String,
  authProvider: String,
  password: String,
  email: String,
  fullName: String,
}, { collection: 'users', strict: false });

const UserModel = model('User', UserSchema);

async function migrateRemoveFirebase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find users with firebase authProvider
    console.log('\n📊 Analyzing users...');
    const firebaseUsers = await UserModel.find({ authProvider: 'firebase' }).select('_id email fullName firebaseUID password');
    console.log(`Found ${firebaseUsers.length} users with Firebase authProvider`);

    const usersWithoutPassword = firebaseUsers.filter(u => !u.password);
    if (usersWithoutPassword.length > 0) {
      console.log(`\n⚠️  WARNING: Found ${usersWithoutPassword.length} users without password:`);
      usersWithoutPassword.forEach(u => {
        console.log(`  - ${u.email || u.fullName || u._id} (ID: ${u._id})`);
      });
      console.log('\n⚠️  These users will need to reset their password to login.');
    }

    // Step 2: Update all users
    console.log('\n🔄 Updating users...');
    const updateResult = await UserModel.updateMany(
      { authProvider: 'firebase' },
      {
        $unset: { firebaseUID: '' },
        $set: { authProvider: 'local' }
      }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} users`);

    // Step 3: Also remove firebaseUID from users that might have it but authProvider is already 'local'
    const cleanupResult = await UserModel.updateMany(
      { firebaseUID: { $exists: true } },
      { $unset: { firebaseUID: '' } }
    );
    console.log(`✅ Cleaned up firebaseUID from ${cleanupResult.modifiedCount} additional users`);

    // Step 4: Drop firebaseUID index
    console.log('\n🗑️  Dropping firebaseUID index...');
    try {
      await UserModel.collection.dropIndex('firebaseUID_1');
      console.log('✅ Dropped firebaseUID_1 index');
    } catch (error: any) {
      if (error.code === 27 || error.message?.includes('index not found')) {
        console.log('ℹ️  firebaseUID index does not exist (already removed or never created)');
      } else {
        console.warn('⚠️  Could not drop firebaseUID index:', error.message);
      }
    }

    // Step 5: Try to drop sparse index if exists
    try {
      await UserModel.collection.dropIndex('firebaseUID_1_sparse');
      console.log('✅ Dropped firebaseUID_1_sparse index');
    } catch (error: any) {
      if (error.code === 27 || error.message?.includes('index not found')) {
        // Index doesn't exist, that's fine
      } else {
        console.warn('⚠️  Could not drop firebaseUID sparse index:', error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Updated ${updateResult.modifiedCount} users from firebase to local auth`);
    console.log(`  - Cleaned up firebaseUID from ${cleanupResult.modifiedCount} additional users`);
    if (usersWithoutPassword.length > 0) {
      console.log(`  - ⚠️  ${usersWithoutPassword.length} users need password reset`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrateRemoveFirebase()
    .then(() => {
      console.log('\n✨ Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateRemoveFirebase };

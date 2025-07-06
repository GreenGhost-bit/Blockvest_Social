const mongoose = require('mongoose');
const MFA = require('../models/MFA');
require('dotenv').config();

async function cleanupMFA() {
  try {
    console.log('Starting MFA cleanup...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest');
    
    const result = await MFA.cleanupExpiredDevices();
    console.log(`Cleaned up expired trusted devices. Modified: ${result.modifiedCount}`);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const loginCleanupResult = await MFA.updateMany(
      {},
      {
        $pull: {
          loginAttempts: {
            timestamp: { $lt: thirtyDaysAgo }
          }
        }
      }
    );
    console.log(`Cleaned up old login attempts. Modified: ${loginCleanupResult.modifiedCount}`);
    
    const challengeCleanupResult = await MFA.updateMany(
      {},
      {
        $pull: {
          'methods.algorandSignature.challengeHistory': {
            timestamp: { $lt: thirtyDaysAgo }
          }
        }
      }
    );
    console.log(`Cleaned up old challenges. Modified: ${challengeCleanupResult.modifiedCount}`);
    
    const expiredEmailCodes = await MFA.updateMany(
      {
        'methods.email.codeExpiry': { $lt: new Date() }
      },
      {
        $unset: {
          'methods.email.verificationCode': 1,
          'methods.email.codeExpiry': 1
        },
        $set: {
          'methods.email.verificationAttempts': 0
        }
      }
    );
    console.log(`Cleaned up expired email codes. Modified: ${expiredEmailCodes.modifiedCount}`);
    
    console.log('MFA cleanup completed successfully');
    
  } catch (error) {
    console.error('MFA cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  cleanupMFA();
}

module.exports = { cleanupMFA };
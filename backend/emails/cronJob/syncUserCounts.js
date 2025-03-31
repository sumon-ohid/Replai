import User from '../../models/User.js';

/**
 * Syncs user counts based on the User model's connectedEmails array
 * @param {string} userId - The ID of the user to sync
 */
export const syncUserCounts = async (userId) => {
  try {
    // Find the user with their connected emails
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }
    
    // Count connected emails directly from the user's connectedEmails array
    const connectedEmailsCount = user.connectedEmails ? user.connectedEmails.length : 0;
    
    // Update the connectedEmailsCount field to reflect the actual array length
    // Other email counts are updated in real-time during email operations
    await User.findByIdAndUpdate(userId, {
      connectedEmailsCount
    });
    
    console.log(`User ${userId} connected emails count synced: ${connectedEmailsCount}`);
  } catch (error) {
    console.error(`Error syncing counts for user ${userId}:`, error);
  }
};

/**
 * Syncs all users' counts with the actual data
 */
export const syncAllUserCounts = async () => {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      await syncUserCounts(user._id);
    }
    
    console.log(`Synced counts for ${users.length} users`);
  } catch (error) {
    console.error('Error syncing all user counts:', error);
  }
};

export default {
  syncUserCounts,
  syncAllUserCounts
};

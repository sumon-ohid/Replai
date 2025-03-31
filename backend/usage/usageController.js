import User from '../models/User.js';

export const getUserUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details with all usage statistics
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get connected emails count directly from user model
    const connectedEmails = user.connectedEmailsCount || 0;
    
    // Get emails sent count directly from user model
    // If tracking period emails (e.g. for current billing period)
    const emailsSent = user.emailsSentCount || 0;
    
    // Get plan limits based on subscription
    let emailLimit = 0; // Default free tier
    let accountLimit = 0; // Default free tier
    
    if (user.subscriptionPlan === 'pro_monthly' || user.subscriptionPlan === 'pro_yearly') {
      emailLimit = 1000;
      accountLimit = 2;
    } else if (user.subscriptionPlan === 'business') {
      emailLimit = Infinity;
      accountLimit = Infinity;
    }
    
    // Calculate percentages
    const emailPercentage = emailLimit === Infinity ? 0 : Math.min(100, (emailsSent / emailLimit) * 100);
    const accountPercentage = accountLimit === Infinity ? 0 : Math.min(100, (connectedEmails / accountLimit) * 100);
    
    // Format response
    res.status(200).json({
      emails: {
        used: emailsSent,
        total: emailLimit === Infinity ? 'Unlimited' : emailLimit,
        percentage: emailPercentage
      },
      accounts: {
        used: connectedEmails,
        total: accountLimit === Infinity ? 'Unlimited' : accountLimit,
        percentage: accountPercentage
      }
    });
    
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
};

export default {
  getUserUsageStats
};

import Stripe from 'stripe';
import User from '../../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send({ received: true });
};

// Handle successful checkout completion
async function handleCheckoutSessionCompleted(session) {
  try {
    // Find user by customer ID
    const user = await User.findOne({ stripeCustomerId: session.customer });
    
    if (!user) {
      console.error('User not found for Stripe customer:', session.customer);
      return;
    }
    
    // For subscription checkout, get the subscription ID
    if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      user.stripeSubscriptionId = session.subscription;
      user.subscriptionStatus = subscription.status;
      user.subscriptionPlan = getPlanFromPriceId(subscription.items.data[0].price.id);
      user.subscriptionStartDate = new Date(subscription.start_date * 1000);
      user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      await user.save();
      console.log(`Subscription ${session.subscription} activated for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error processing checkout.session.completed:', error);
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (!user) {
      console.error('User not found for Stripe customer:', invoice.customer);
      return;
    }
    
    if (invoice.subscription) {
      // This is a subscription invoice payment
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      user.subscriptionStartDate = subscription.status;
      user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      // Reset the period counter when subscription renews
      user.emailsSentCount = 0;
      user.emailsSentThisPeriod = 0;
      user.lastPeriodReset = new Date();

      await user.save();
      console.log(`Subscription renewed until ${user.subscriptionEndDate} for user ${user.email}`);
    }
  } catch (error) {
    console.error('Error processing invoice.paid:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (!user) {
      console.error('User not found for Stripe customer:', invoice.customer);
      return;
    }
    
    if (invoice.subscription) {
      // Update subscription status
      user.subscriptionStatus = 'past_due';
      await user.save();
      
      // Here you could also trigger an email to the user
      console.log(`Payment failed for subscription of user ${user.email}`);
    }
  } catch (error) {
    console.error('Error processing invoice.payment_failed:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }
    
    user.subscriptionStatus = subscription.status;
    user.subscriptionPlan = getPlanFromPriceId(subscription.items.data[0].price.id);
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    
    await user.save();
    console.log(`Subscription updated for user ${user.email}: ${subscription.status}`);
  } catch (error) {
    console.error('Error processing customer.subscription.updated:', error);
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }
    
    user.subscriptionStatus = 'canceled';
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    
    await user.save();
    console.log(`Subscription canceled for user ${user.email}, active until ${user.subscriptionEndDate}`);
  } catch (error) {
    console.error('Error processing customer.subscription.deleted:', error);
  }
}

// Helper function to determine plan from price ID
function getPlanFromPriceId(priceId) {
  // Map your Stripe price IDs to plan names
  const priceToPlanMap = {
    'price_1R7exXFQrwy1FRGCuHlPz15w': 'pro_monthly',
    'price_1R8cAXFQrwy1FRGCZVC85y4P': 'pro_yearly',
    // Add more as needed
  };
  
  return priceToPlanMap[priceId] || 'unknown';
}
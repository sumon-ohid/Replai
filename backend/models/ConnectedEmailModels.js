import mongoose from 'mongoose';

// Define schemas here to ensure they exist
const emailSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  threadId: String,
  provider: { type: String, required: true },
  providerId: String,
  
  from: {
    email: { type: String, required: true },
    name: String
  },
  
  to: [{
    email: { type: String, required: true },
    name: String
  }],
  
  cc: [{
    email: String,
    name: String
  }],
  
  bcc: [{
    email: String,
    name: String
  }],
  
  subject: String,
  snippet: String,
  
  body: {
    text: String,
    html: String
  },
  
  attachments: [{
    name: String,
    type: String,
    size: Number,
    attachmentId: String
  }],
  
  date: { type: Date, required: true },
  receivedAt: { type: Date, default: Date.now },
  
  folder: { type: String, default: 'inbox' },
  labels: [String],
  
  read: { type: Boolean, default: false },
  readAt: Date,
  
  category: {
    type: String,
    enum: ['primary', 'social', 'promotions', 'updates', 'forums', 'sent', 'draft', 'trash', 'spam', 'inbox'],
    default: 'inbox'
  },
  
  processed: { type: Boolean, default: false },
  processingData: {
    sentiment: String,
    priority: String,
    actionItems: [String],
    keywords: [String],
    requiresResponse: Boolean,
    category: String,
    confidence: Number
  }
}, {
  timestamps: true
});

const draftSchema = new mongoose.Schema({
  messageId: String,
  threadId: String,
  
  to: [{
    email: { type: String, required: true },
    name: String
  }],
  
  cc: [{
    email: String,
    name: String
  }],
  
  bcc: [{
    email: String,
    name: String
  }],
  
  subject: String,
  
  body: {
    text: String,
    html: String
  },
  
  attachments: [{
    name: String,
    type: String,
    size: Number,
    attachmentId: String
  }],
  
  status: {
    type: String,
    enum: ['draft', 'sending', 'sent', 'error'],
    default: 'draft'
  },
  
  lastError: {
    message: String,
    code: String,
    date: Date
  }
}, {
  timestamps: true
});

const sentEmailSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  threadId: String,
  
  to: [{
    email: { type: String, required: true },
    name: String
  }],
  
  cc: [{
    email: String,
    name: String
  }],
  
  bcc: [{
    email: String,
    name: String
  }],
  
  subject: String,
  
  body: {
    text: String,
    html: String
  },
  
  attachments: [{
    name: String,
    type: String,
    size: Number,
    attachmentId: String
  }],
  
  dateSent: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent'
  },
  
  deliveryInfo: {
    deliveredAt: Date,
    error: String
  }
}, {
  timestamps: true
});

// Create indexes
emailSchema.index({ messageId: 1 }, { unique: true });
emailSchema.index({ threadId: 1 });
emailSchema.index({ 'from.email': 1 });
emailSchema.index({ date: -1 });
emailSchema.index({ category: 1 });
emailSchema.index({ folder: 1 });

/**
 * Ensures indexes are properly created for a model
 */
async function ensureIndexes(model) {
  try {
    // Check if index exists
    const indexes = await model.collection.indexes();
    const hasMessageIdIndex = indexes.some(idx => 
      idx.name === 'messageId_1'
    );
    
    if (hasMessageIdIndex) {
      // Drop existing index first
      await model.collection.dropIndex('messageId_1');
    }
    
    // Create new index with desired options
    await model.collection.createIndex(
      { messageId: 1 }, 
      { unique: true, background: true }
    );
  } catch (error) {
    console.warn(`Index error with ${model.modelName}:`, error.message);
    // Continue even if index creation fails
  }
}

/**
 * Creates a set of models for a connected email account
 */
const getConnectedEmailModels = (connectedEmailId) => {
  try {
    console.log('=== Creating Email Models ===');
    console.log(`ConnectedEmail ID: ${connectedEmailId}`);
    
    // Base name for the collections
    const baseModelName = `email_${connectedEmailId}`;
    console.log(`Base model name: ${baseModelName}`);
    
    // Check existing models
    const existingModels = mongoose.modelNames();
    console.log('Existing models:', existingModels);

    // Get or create email model
    let EmailModel;
    const emailModelName = `${baseModelName}_emails`;
    if (mongoose.models[emailModelName]) {
      console.log(`Reusing existing email model: ${emailModelName}`);
      EmailModel = mongoose.models[emailModelName];
    } else {
      console.log(`Creating new email model: ${emailModelName}`);
      EmailModel = mongoose.model(emailModelName, emailSchema);
    }
    
    // Get or create draft model
    let DraftModel;
    const draftModelName = `${baseModelName}_drafts`;
    if (mongoose.models[draftModelName]) {
      console.log(`Reusing existing draft model: ${draftModelName}`);
      DraftModel = mongoose.models[draftModelName];
    } else {
      console.log(`Creating new draft model: ${draftModelName}`);
      DraftModel = mongoose.model(draftModelName, draftSchema);
    }
    
    // Get or create sent email model
    let SentEmailModel;
    const sentModelName = `${baseModelName}_sent`;
    if (mongoose.models[sentModelName]) {
      console.log(`Reusing existing sent model: ${sentModelName}`);
      SentEmailModel = mongoose.models[sentModelName];
    } else {
      console.log(`Creating new sent model: ${sentModelName}`);
      SentEmailModel = mongoose.model(sentModelName, sentEmailSchema);
    }

    // Ensure indexes are created
    Promise.all([
      ensureIndexes(EmailModel),
      ensureIndexes(DraftModel),
      ensureIndexes(SentEmailModel)
    ]).then(() => {
      console.log('Indexes ensured successfully');
    }).catch(error => {
      console.error('Error ensuring indexes:', error);
    });
    
    console.log('Models created successfully');
    
    return {
      Email: EmailModel,
      Draft: DraftModel,
      Sent: SentEmailModel
    };
  } catch (error) {
    console.error('Error in getConnectedEmailModels:', error);
    throw error;
  }
};

/**
 * Validates that all required collections exist
 */
export const validateEmailCollections = async (connectedEmailId) => {
  try {
    console.log('=== Validating Email Collections ===');
    console.log(`ConnectedEmail ID: ${connectedEmailId}`);
    
    const baseModelName = `email_${connectedEmailId}`;
    const requiredCollections = [
      `${baseModelName}_emails`,
      `${baseModelName}_drafts`,
      `${baseModelName}_sent`
    ];

    console.log('Required collections:', requiredCollections);

    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:', collectionNames);

    // Check if all required collections exist
    const missingCollections = requiredCollections.filter(
      name => !collectionNames.includes(name)
    );

    if (missingCollections.length > 0) {
      console.log('Missing collections:', missingCollections);
      console.log('Creating missing collections...');
      
      // Get models to ensure collections are created
      const models = getConnectedEmailModels(connectedEmailId);
      
      // Verify collections were created
      await Promise.all(missingCollections.map(async (name) => {
        await mongoose.connection.db.createCollection(name);
        console.log(`Created collection: ${name}`);
      }));
    } else {
      console.log('All required collections exist');
    }

    return true;
  } catch (error) {
    console.error('Error in validateEmailCollections:', error);
    return false;
  }
};

export default getConnectedEmailModels;

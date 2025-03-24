node backend/scripts/sendNotificationToAllUsers.js --title "System Maintenance" --message "Our system will be undergoing maintenance on March 30th from 2-4 AM UTC. You may experience brief service interruptions during this time."

# Send a system maintenance notification:
node backend/scripts/sendNotificationToAllUsers.js --title "System Maintenance" --message "Our system will be undergoing maintenance on March 30th from 2-4 AM UTC." --type info

# Send a notification only to Gmail users:
node backend/scripts/sendNotificationToAllUsers.js --title "Gmail Integration Update" --message "We've improved our Gmail integration. Enjoy faster sync times!" --filter "@gmail.com"

# Test with a dry run (no actual notifications sent):
node backend/scripts/sendNotificationToAllUsers.js --title "New Feature" --message "Check out our new AI assistant!" --type success --dry-run

# Send an important error notification to limited users:
node backend/scripts/sendNotificationToAllUsers.js --title "Account Action Required" --message "Please update your password for security reasons." --type error --limit 100

# Send to all users with custom batch size:

node backend/scripts/sendNotificationToAllUsers.js --title "Welcome to our new interface" --message "We've updated our UI for a better experience." --batch-size 100
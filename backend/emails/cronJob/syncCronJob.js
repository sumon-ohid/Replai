import cron from 'node-cron';
import { syncAllUserCounts } from './syncUserCounts.js';

// Run sync job every day at 3 AM
export const initCronJobs = () => {
  cron.schedule('0 3 * * *', async () => {
    console.log('Running daily user count sync job...');
    await syncAllUserCounts();
  });
};

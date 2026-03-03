// import cron from 'node-cron';
// import Property from '../models/Property.model.js';
// import User from '../models/User.model.js';
// import { sendEmail } from '../services/emailService.js';
// import { rentReminderTemplate } from '../utils/emailTemplates.js';

// /**
//  * Rent Reminder Cron Job
//  * Runs every day at 9:00 AM
//  * Sends rent reminder emails to tenants for properties with status RENTED or OCCUPIED
//  */
// const rentReminderJob = cron.schedule('0 9 * * *', async () => {
//   try {
//     console.log('🕘 Rent reminder cron job started at', new Date().toISOString());

//     // Find properties with tenants and status OCCUPIED (Property model uses OCCUPIED, not RENTED)
//     const properties = await Property.find({
//       tenantId: { $exists: true, $ne: null },
//       status: 'OCCUPIED'
//     }).select('tenantId rentAmount address');

//     if (!properties || properties.length === 0) {
//       console.log('No properties found for rent reminders');
//       return;
//     }

//     console.log(`Found ${properties.length} properties to send rent reminders`);

//     let successCount = 0;
//     let errorCount = 0;

//     // Process each property
//     for (const property of properties) {
//       try {
//         // Get tenant email
//         const tenant = await User.findById(property.tenantId).select('email name');
        
//         if (!tenant || !tenant.email) {
//           console.log(`Skipping property ${property.address}: tenant email not found`);
//           continue;
//         }

//         // Check if rent amount is valid
//         if (!property.rentAmount || property.rentAmount <= 0) {
//           console.log(`Skipping property ${property.address}: invalid rent amount`);
//           continue;
//         }

//         // Send rent reminder email
//         await sendEmail({
//           to: tenant.email,
//           subject: 'Monthly Rent Reminder - OwnTen',
//           html: rentReminderTemplate(property, property.rentAmount)
//         });

//         successCount++;
//         console.log(`✅ Rent reminder sent to ${tenant.email} for property: ${property.address}`);

//       } catch (error) {
//         errorCount++;
//         console.error(`❌ Failed to send rent reminder for property ${property.address}:`, error.message);
//       }
//     }

//     console.log(`📊 Rent reminder job completed. Success: ${successCount}, Errors: ${errorCount}`);

//   } catch (error) {
//     console.error('❌ Rent reminder cron job error:', error.message);
//   }
// }, {
//   scheduled: false, // Don't start automatically, will be started in server.js
//   timezone: 'Asia/Kolkata' // Adjust timezone as needed
// });

// // Start the cron job
// rentReminderJob.start();

// console.log('✅ Rent reminder cron job scheduled: Daily at 9:00 AM');

// export default rentReminderJob;



import cron from 'node-cron'
import Property from '../models/Property.model.js'
import Payment from '../models/Payment.model.js'
import User from '../models/User.model.js'
import { sendEmail } from '../services/emailService.js'
import { rentReminderTemplate } from '../utils/emailTemplates.js'

const rentReminderJob = cron.schedule(
  '0 9 * * *', // Every day at 9 AM
  async () => {
    try {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      const currentYear = today.getFullYear()
      const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
      const rentMonth = `${currentYear}-${currentMonth}`

      console.log('🕘 Rent reminder job running for month:', rentMonth)

      const properties = await Property.find({
        tenantId: { $exists: true, $ne: null },
        status: 'OCCUPIED'
      })

      if (!properties.length) {
        console.log('No occupied properties found')
        return
      }

      for (const property of properties) {
        const dueDay = property.rentDueDay || 5

        // ✅ Send reminder ONLY 1 day before due date
        if (tomorrow.getDate() !== dueDay) continue

        // ✅ Check if rent already paid
        const alreadyPaid = await Payment.findOne({
          propertyId: property._id,
          tenantId: property.tenantId,
          type: 'RENT',
          status: 'SUCCESS',
          rentMonth
        })

        if (alreadyPaid) {
          console.log(`⛔ Rent already paid for ${rentMonth}`)
          continue
        }

        const tenant = await User.findById(property.tenantId).select(
          'email name'
        )

        if (!tenant?.email) {
          console.log('Tenant email not found')
          continue
        }

        await sendEmail({
          to: tenant.email,
          subject: 'Rent Due Tomorrow - OwnTen',
          html: rentReminderTemplate(property, property.rentAmount)
        })

        console.log(
          `✅ Reminder sent to ${tenant.email} for property: ${property.address}`
        )
      }
    } catch (err) {
      console.error('❌ Rent reminder error:', err.message)
    }
  },
  {
    timezone: 'Asia/Kolkata'
  }
)

// Start cron
rentReminderJob.start()

console.log('✅ Rent reminder cron job scheduled: Daily at 9:00 AM')

export default rentReminderJob
import { Booking } from '../models';
import { deleteImageFromImageKit } from '../utils/imagekitUpload';

/**
 * Cleanup job to delete license photos that are older than 20 days from booking date
 * This job should be run daily
 */
export const cleanupOldLicensePhotos = async (): Promise<void> => {
  try {
    console.log('🧹 Starting cleanup of old license photos...');

    // Calculate the date 20 days ago
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    // Find bookings with license photos where checkIn date (or rental start date) is older than 20 days
    const bookingsToCleanup = await Booking.find({
      licensePhoto: { $exists: true, $ne: null },
      checkIn: { $lte: twentyDaysAgo }
    }).select('_id licensePhoto createdAt checkIn selectedServices');

    console.log(`📋 Found ${bookingsToCleanup.length} bookings with license photos older than 20 days`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const booking of bookingsToCleanup) {
      try {
        if (booking.licensePhoto) {
          // Delete from ImageKit
          await deleteImageFromImageKit(booking.licensePhoto);

          // Remove from database
          booking.licensePhoto = undefined;
          booking.licensePhotoUploadedAt = undefined;
          await booking.save();

          deletedCount++;
          console.log(`✅ Deleted license photo for booking ${booking._id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error deleting license photo for booking ${booking._id}:`, error);
        // Continue with other bookings even if one fails
      }
    }

    console.log(`✨ Cleanup completed: ${deletedCount} photos deleted, ${errorCount} errors`);
  } catch (error) {
    console.error('❌ Error in cleanup job:', error);
  }
};


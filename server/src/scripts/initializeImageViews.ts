import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ImageViewService } from '../services/imageViewService';

// Load environment variables
dotenv.config();

/**
 * Script to initialize default image views in the database
 */
async function initializeImageViews() {
  try {
    console.log('🚀 Starting image view initialization...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels');
    console.log('✅ Connected to MongoDB');

    // Initialize default views
    await ImageViewService.initializeDefaultViews();

    console.log('🎉 Image view initialization completed successfully!');
    console.log('\n📋 Available views:');
    console.log('- GP (Ground Pose) - Main view');
    console.log('- 45 (45° Angle View)');
    console.log('- BV (Builder View)');
    console.log('- EV (Engraving View)');
    console.log('- FV (Front View)');
    console.log('- TV (Top View)');
    console.log('- NBV (New Builder View)');
    console.log('- SV (Side View)');
    console.log('- 360 (3D View - .glb file)');

    console.log('\n🔧 Admin API Endpoints:');
    console.log('- GET /api/admin/image-views - Get all views');
    console.log('- GET /api/admin/image-views/category/:category - Get views by category');
    console.log('- GET /api/admin/image-views/main - Get main view');
    console.log('- POST /api/admin/image-views - Create new view');
    console.log('- PUT /api/admin/image-views/:viewType - Update view');
    console.log('- DELETE /api/admin/image-views/:viewType - Delete view');
    console.log('- POST /api/admin/image-views/initialize - Re-initialize defaults');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run the initialization
initializeImageViews();

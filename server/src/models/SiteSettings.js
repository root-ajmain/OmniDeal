import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IImage {
  url: string;
  publicId: string;
}

export interface IBlog extends Document {
  title: string;
  displayImage: string; // cover image URL
  displayImagePublicId: string; // Cloudinary public ID for the cover image
  notes: string; // blog content
  images: IImage[]; // gallery images with URL and publicId
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    displayImage: { type: String, required: true },
    displayImagePublicId: { type: String, required: true },
    notes: { type: String, required: true },
    images: { type: [ImageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);

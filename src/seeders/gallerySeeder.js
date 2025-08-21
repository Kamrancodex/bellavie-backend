const mongoose = require("mongoose");
const Gallery = require("../models/Gallery");
const { connectDB } = require("../config/database");

const galleryItems = [
  {
    title: "Elegant Wedding Reception",
    imageUrl:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "landscape",
    isActive: true,
    order: 0,
  },
  {
    title: "Beautiful Ceremony Setup",
    imageUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 1,
  },
  {
    title: "Corporate Event Excellence",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    size: "landscape",
    isActive: true,
    order: 2,
  },
  {
    title: "Intimate Dinner Setting",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 3,
  },
  {
    title: "Grand Ballroom Event",
    imageUrl:
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
    size: "landscape",
    isActive: true,
    order: 4,
  },
  {
    title: "Garden Party Celebration",
    imageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 5,
  },
  {
    title: "Luxury Wedding Reception",
    imageUrl:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "landscape",
    isActive: true,
    order: 6,
  },
  {
    title: "Cocktail Hour Setup",
    imageUrl:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 7,
  },
  {
    title: "Outdoor Wedding Ceremony",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    size: "landscape",
    isActive: true,
    order: 8,
  },
  {
    title: "Private Party Atmosphere",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 9,
  },
  {
    title: "Conference & Meeting Space",
    imageUrl:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2012&q=80",
    size: "landscape",
    isActive: true,
    order: 10,
  },
  {
    title: "Elegant Table Setting",
    imageUrl:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    size: "square",
    isActive: true,
    order: 11,
  },
];

const seedGallery = async () => {
  try {
    await connectDB();
    console.log("🗄️  Connected to MongoDB");

    // Clear existing gallery items
    await Gallery.deleteMany({});
    console.log("🗑️  Cleared existing gallery items");

    // Insert new gallery items
    const createdItems = await Gallery.insertMany(galleryItems);
    console.log(`✅ Created ${createdItems.length} gallery items`);

    console.log("📸 Gallery seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding gallery:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedGallery();
}

module.exports = seedGallery;

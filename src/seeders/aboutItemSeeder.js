const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AboutItem = require("../models/AboutItem");
const { connectDB } = require("../config/database");

dotenv.config({ path: "./.env" });

connectDB();

const aboutItems = [
  // CAPACITIES Section
  {
    title: "500 guests seated",
    category: "CAPACITIES",
    icon: "Users",
    isActive: true,
    order: 0,
  },
  {
    title: "700 guests reception style",
    category: "CAPACITIES",
    icon: "Users",
    isActive: true,
    order: 1,
  },
  {
    title: "760 guests theater style",
    category: "CAPACITIES",
    icon: "Users",
    isActive: true,
    order: 2,
  },
  {
    title: "460 guests classroom style",
    category: "CAPACITIES",
    icon: "Users",
    isActive: true,
    order: 3,
  },

  // OFFERINGS Section
  {
    title: "Full Service Catering",
    category: "OFFERINGS",
    icon: "Utensils",
    isActive: true,
    order: 0,
  },
  {
    title: "Event Rentals",
    category: "OFFERINGS",
    icon: "Package",
    isActive: true,
    order: 1,
  },
  {
    title: "Audio Visual",
    category: "OFFERINGS",
    icon: "Volume2",
    isActive: true,
    order: 2,
  },
  {
    title: "Complimentary Parking",
    category: "OFFERINGS",
    icon: "Car",
    isActive: true,
    order: 3,
  },
  {
    title: "Valet Available",
    category: "OFFERINGS",
    icon: "Car",
    isActive: true,
    order: 4,
  },
  {
    title: "Adjacent to Hilton Garden Inn",
    category: "OFFERINGS",
    icon: "MapPin",
    isActive: true,
    order: 5,
  },
];

const seedAboutItems = async () => {
  try {
    await AboutItem.deleteMany();
    console.log("✅ Cleared existing about items");

    await AboutItem.insertMany(aboutItems);
    console.log(`✅ Seeded ${aboutItems.length} about items`);

    console.log("\n📋 Seeded About Items:");

    console.log("\n🏢 CAPACITIES:");
    aboutItems
      .filter((item) => item.category === "CAPACITIES")
      .forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.icon})`);
      });

    console.log("\n🎯 OFFERINGS:");
    aboutItems
      .filter((item) => item.category === "OFFERINGS")
      .forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.icon})`);
      });

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding about items:", error);
    process.exit(1);
  }
};

seedAboutItems();

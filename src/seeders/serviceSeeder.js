const mongoose = require("mongoose");
const Service = require("../models/Service");
const { connectDB } = require("../config/database");

const services = [
  {
    title: "Catering Services",
    description:
      "Exquisite culinary experiences tailored to your taste. From intimate dinners to grand celebrations, we deliver exceptional dining.",
    icon: "Utensils",
    order: 0,
    isActive: true,
  },
  {
    title: "Entertainment & AV",
    description:
      "State-of-the-art sound systems, lighting, and entertainment coordination to create the perfect ambiance for your event.",
    icon: "Music",
    order: 1,
    isActive: true,
  },
  {
    title: "Venue Management",
    description:
      "Professional venue coordination with dedicated staff to ensure your event runs seamlessly from start to finish.",
    icon: "Calendar",
    order: 2,
    isActive: true,
  },
  {
    title: "Wedding Packages",
    description:
      "Comprehensive wedding services including food, beverage, tables, chairs and rentals at Bellavie.",
    icon: "Heart",
    order: 3,
    isActive: true,
  },
  {
    title: "Event Documentation",
    description:
      "Professional photography and videography partnerships to capture every precious moment of your celebration.",
    icon: "Camera",
    order: 4,
    isActive: true,
  },
];

const seedServices = async () => {
  try {
    await connectDB();

    // Clear existing services
    await Service.deleteMany({});
    console.log("✅ Cleared existing services");

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Seeded ${createdServices.length} services`);

    console.log("\n📋 Seeded Services:");
    createdServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.icon})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedServices();
}

module.exports = { seedServices };

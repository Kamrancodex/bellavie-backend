const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Testimonial = require("../models/Testimonial");
const { connectDB } = require("../config/database");

dotenv.config({ path: "./.env" });

connectDB();

const testimonials = [
  {
    quote:
      "Bellavie exceeded our expectations for our wedding reception. The ballroom was stunning, the service impeccable, and every detail was handled with such care. Our guests are still talking about how beautiful everything was.",
    author: "Sarah & Michael Chen",
    role: "Wedding Reception",
    event: "June 2024",
    isActive: true,
    order: 0,
  },
  {
    quote:
      "We chose Bellavie for our corporate gala and it was absolutely perfect. The venue's elegance matched our brand perfectly, and the staff went above and beyond to ensure everything ran smoothly. Highly recommend!",
    author: "Jessica Martinez",
    role: "Corporate Event",
    event: "September 2024",
    isActive: true,
    order: 1,
  },
  {
    quote:
      "From the initial tour to the final farewell, Bellavie provided an exceptional experience for our anniversary celebration. The garden terrace was magical, and the catering was exquisite. Thank you for making our day so special.",
    author: "Robert & Linda Johnson",
    role: "Anniversary Celebration",
    event: "August 2024",
    isActive: true,
    order: 2,
  },
  {
    quote:
      "Planning our daughter's quinceañera at Bellavie was a dream come true. The team was incredibly professional and accommodating. The venue's beauty and attention to detail made this milestone celebration truly unforgettable.",
    author: "Maria & Carlos Rodriguez",
    role: "Quinceañera Celebration",
    event: "July 2024",
    isActive: true,
    order: 3,
  },
  {
    quote:
      "Bellavie is simply the best venue in the city. We hosted our charity fundraiser here and the elegant atmosphere helped us exceed our donation goals. The staff made everything seamless and stress-free.",
    author: "David Thompson",
    role: "Charity Fundraiser",
    event: "October 2024",
    isActive: true,
    order: 4,
  },
];

const seedTestimonials = async () => {
  try {
    await Testimonial.deleteMany();
    console.log("✅ Cleared existing testimonials");

    await Testimonial.insertMany(testimonials);
    console.log(`✅ Seeded ${testimonials.length} testimonials`);

    console.log("\n📋 Seeded Testimonials:");
    testimonials.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.author} - ${testimonial.role}`);
    });

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding testimonials:", error);
    process.exit(1);
  }
};

seedTestimonials();

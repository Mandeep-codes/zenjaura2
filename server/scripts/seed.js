import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Package from '../models/Package.js';
import Event from '../models/Event.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zenjaura');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Package.deleteMany({});
    await Event.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users (let pre-save hash passwords)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@zenjaura.com',
      password: 'admin123456',
      role: 'admin',
      isVerified: true,
      bio: 'Platform administrator and publishing expert'
    });
    await adminUser.save();

    const demoUser = new User({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123456',
      role: 'user',
      isVerified: true,
      bio: 'Aspiring author and storyteller'
    });
    await demoUser.save();

    const author1 = new User({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'user',
      isVerified: true,
      bio: 'Mystery novelist with 10+ years of experience'
    });
    await author1.save();

    const author2 = new User({
      name: 'Michael Chen',
      email: 'michael@example.com',
      password: 'password123',
      role: 'user',
      isVerified: true,
      bio: 'Science fiction writer and tech enthusiast'
    });
    await author2.save();

    const author3 = new User({
      name: 'Emma Williams',
      email: 'emma@example.com',
      password: 'password123',
      role: 'user',
      isVerified: true,
      bio: 'Romance author and creative writing instructor'
    });
    await author3.save();

    console.log('✅ Created users');

    // Create packages
    const basicPackage = await Package.create({
      name: 'Basic',
      basePrice: 99,
      description: 'Perfect for first-time authors looking to get started',
      features: [
        { name: 'Digital Publishing', included: true },
        { name: 'Basic Cover Design', included: true },
        { name: 'ISBN Assignment', included: false },
        { name: 'Marketing Support', included: false },
        { name: 'Print Distribution', included: false }
      ],
      addOns: {
        printedCopies: {
          name: 'Printed Copies',
          baseQuantity: 0,
          maxQuantity: 100,
          pricePerUnit: 8
        },
        extraPages: {
          name: 'Extra Pages',
          basePagesIncluded: 100,
          maxPages: 500,
          pricePerPage: 0.25
        }
      },
      popular: false
    });

    const standardPackage = await Package.create({
      name: 'Standard',
      basePrice: 299,
      description: 'Most popular choice for serious authors',
      features: [
        { name: 'Digital Publishing', included: true },
        { name: 'Professional Cover Design', included: true },
        { name: 'ISBN Assignment', included: true },
        { name: 'Basic Marketing Support', included: true },
        { name: 'Print Distribution', included: true },
        { name: 'Author Website', included: false }
      ],
      addOns: {
        printedCopies: {
          name: 'Printed Copies',
          baseQuantity: 25,
          maxQuantity: 500,
          pricePerUnit: 6
        },
        extraPages: {
          name: 'Extra Pages',
          basePagesIncluded: 200,
          maxPages: 800,
          pricePerPage: 0.20
        }
      },
      popular: true
    });

    const premiumPackage = await Package.create({
      name: 'Premium',
      basePrice: 599,
      description: 'Complete publishing solution with full support',
      features: [
        { name: 'Digital Publishing', included: true },
        { name: 'Premium Cover Design', included: true },
        { name: 'ISBN Assignment', included: true },
        { name: 'Full Marketing Campaign', included: true },
        { name: 'Print Distribution', included: true },
        { name: 'Author Website', included: true },
        { name: 'Dedicated Support', included: true },
        { name: 'Book Trailer', included: true }
      ],
      addOns: {
        printedCopies: {
          name: 'Printed Copies',
          baseQuantity: 100,
          maxQuantity: 1000,
          pricePerUnit: 4
        },
        extraPages: {
          name: 'Extra Pages',
          basePagesIncluded: 300,
          maxPages: 1000,
          pricePerPage: 0.15
        }
      },
      popular: false
    });

    console.log('✅ Created packages');

    // Create books
    const books = [
      {
        title: 'The Midnight Detective',
        author: author1._id,
        synopsis: 'A gripping mystery novel...',
        genre: 'Mystery',
        coverImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        manuscriptFile: 'https://example.com/manuscripts/midnight-detective.pdf',
        price: 14.99,
        status: 'published',
        publishingPackage: standardPackage._id,
        tags: ['mystery', 'detective', 'thriller'],
        isbn: '978-1234567890',
        pageCount: 324,
        publicationDate: new Date('2024-01-15'),
        sales: { totalSold: 156, revenue: 2338.44 },
        rating: { average: 4.3, count: 23 }
      }
    ];

    await Book.insertMany(books);
    console.log('✅ Created books');

    // Create events
    const events = [
      {
        title: 'Author Meet & Greet',
        description: 'Meet top mystery authors...',
        startDate: new Date('2024-12-20T18:00:00Z'),
        endDate: new Date('2024-12-20T20:00:00Z'),
        location: 'Zenjaura Community Center, NY',
        isVirtual: false,
        maxAttendees: 50,
        price: 15,
        category: 'Book Launch',
        organizer: adminUser._id,
        image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        tags: ['mystery', 'authors', 'panel'],
        status: 'upcoming'
      }
    ];

    await Event.insertMany(events);
    console.log('✅ Created events');

    // Final log
    console.log('\n🎉 Database seeded successfully!');
    console.log('🔐 Demo Admin Login: admin@zenjaura.com / admin123456');
    console.log('🔐 Demo User Login: user@example.com / user123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();


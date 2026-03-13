require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const User = require('../models/User');
const Counter = require('../models/Counter');

const thumbnailAiUrl =
  'https://www.htx.gov.sg/images/default-source/news/2024/ai-article-1-banner.jpg';
const thumbnailMlUrl = 'https://shiftasia.com/community/content/images/2025/06/ml.png';

const sampleCourses = [
  // Matches your example database entries (demo instructors)
  {
    title: 'ai',
    description: 'ai',
    category: 'Programming',
    price: 1800,
    thumbnailUrl: thumbnailAiUrl,
    difficulty: 'Beginner',
    lessonsCount: 2,
    rating: 4.5,
    duration: '16h 30m'
  },
  {
    title: 'Machine Learning Specialization',
    description:
      'Master fundamental AI concepts and develop practical machine learning skills with hands-on projects.',
    category: 'Computer Science',
    price: 2000,
    thumbnailUrl: thumbnailMlUrl,
    difficulty: 'Beginner',
    lessonsCount: 1,
    rating: 4.5,
    duration: '16h 30m'
  },
  {
    title: 'HELLO',
    description: 'helloooooooooooooooo',
    category: 'Programming',
    price: 1500,
    thumbnailUrl: thumbnailAiUrl,
    difficulty: 'Beginner',
    lessonsCount: 3,
    rating: 4.5,
    duration: '12h 30m'
  },
  // A few extra demo courses (same thumbnail URLs for consistency)
  {
    title: 'AI for Everyone (Basics)',
    description: 'A friendly introduction to AI: what it is, where it helps, and how to use it responsibly.',
    category: 'AI & ML',
    price: 0,
    thumbnailUrl: thumbnailAiUrl,
    difficulty: 'Beginner',
    lessonsCount: 6,
    rating: 4.5,
    duration: '4h 30m'
  },
  {
    title: 'Applied Machine Learning Projects',
    description: 'Build real ML mini-projects: data cleaning, model training, evaluation, and deployment basics.',
    category: 'AI & ML',
    price: 2200,
    thumbnailUrl: thumbnailMlUrl,
    difficulty: 'Intermediate',
    lessonsCount: 8,
    rating: 4.6,
    duration: '10h 15m'
  }
];

const seedCourses = async () => {
  await connectDB();

  try {
    let instructor1 = await User.findOne({ email: 'demo.instructor1@skillpathshala.com' });
    if (!instructor1) {
      instructor1 = await User.create({
        name: 'Demo Instructor 1',
        email: 'demo.instructor1@skillpathshala.com',
        password: 'password123',
        role: 'instructor',
        approved: true
      });
    }

    let instructor2 = await User.findOne({ email: 'demo.instructor2@skillpathshala.com' });
    if (!instructor2) {
      instructor2 = await User.create({
        name: 'Demo Instructor 2',
        email: 'demo.instructor2@skillpathshala.com',
        password: 'password123',
        role: 'instructor',
        approved: true
      });
    }

    const existingCount = await Course.countDocuments();
    if (existingCount > 0) {
      console.log('Courses already exist, skipping seeding.');
      process.exit(0);
    }

    const coursesWithInstructor = sampleCourses.map((c, idx) => ({
      ...c,
      instructor: idx % 2 === 0 ? instructor1._id : instructor2._id,
      courseNumber: idx + 1,
      isPublished: true
    }));

    await Course.insertMany(coursesWithInstructor);
    await Counter.findOneAndUpdate(
      { key: 'courseNumber' },
      { $set: { seq: coursesWithInstructor.length } },
      { upsert: true }
    );
    console.log('Sample courses seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedCourses();


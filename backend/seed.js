const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Domain = require('./models/Domain');

dotenv.config();

const domains = [
    {
        name: 'Web Development',
        description: 'Building websites and web applications',
        icon: 'Code',
    },
    {
        name: 'Graphic Design',
        description: 'Visual communication and problem-solving',
        icon: 'Palette',
    },
    {
        name: 'Content Writing',
        description: 'Creating content for websites and blogs',
        icon: 'FileText',
    },
    {
        name: 'Digital Marketing',
        description: 'Promoting products and services online',
        icon: 'Megaphone',
    },
    {
        name: 'Video Editing',
        description: 'Editing and manipulating video footage',
        icon: 'Video',
    },
    {
        name: 'Mobile App Development',
        description: 'Creating applications for mobile devices',
        icon: 'Smartphone',
    },
    {
        name: 'UI/UX Design',
        description: 'Designing user interfaces and experiences',
        icon: 'Layout',
    },
    {
        name: 'Data Entry',
        description: 'Entering data into a computer system',
        icon: 'Database',
    },
];

const seedDomains = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Domain.deleteMany(); // Clear existing domains
        console.log('Existing domains cleared');

        await Domain.insertMany(domains);
        console.log('Domains seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding domains:', error);
        process.exit(1);
    }
};

seedDomains();

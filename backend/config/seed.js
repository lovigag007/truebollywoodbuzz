require('dotenv').config();
const { sequelize, Movie, User } = require('../models');

const sampleMovies = [
  {
    title: 'Uri: The Surgical Strike',
    hindiTitle: 'उरी: द सर्जिकल स्ट्राइक',
    slug: 'uri-the-surgical-strike',
    year: 2019,
    releaseDate: '2019-01-11',
    duration: 138,
    language: 'Hindi',
    director: 'Aditya Dhar',
    producer: 'Ronnie Screwvala',
    category: 'war',
    genre: ['War', 'Action', 'Drama'],
    cast: [
      { name: 'Vicky Kaushal', role: 'Lead', character: 'Maj. Vihaan Singh Shergill' },
      { name: 'Paresh Rawal', role: 'Supporting', character: 'Govind Bhardwaj' },
      { name: 'Yami Gautam', role: 'Supporting', character: 'Intelligence Officer' },
    ],
    synopsis: 'The Indian Army avenges the Uri attack in which 19 soldiers were killed by Pakistani-backed terrorists, by executing a covert surgical strike.',
    trueEventDescription: 'On September 18, 2016, militants attacked the Indian Army Brigade HQ at Uri in Jammu & Kashmir, killing 19 soldiers. In retaliation, Indian Army\'s Special Forces crossed the Line of Control and destroyed militant launch pads in Pakistan-administered Kashmir on September 29, 2016 — the first public confirmation of such a cross-border operation.',
    realEventDate: 'September 2016',
    realPersonNames: 'Indian Army Special Forces soldiers involved in the surgical strikes',
    realEventLocation: 'Uri, Jammu & Kashmir, India',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Uri-_The_Surgical_Strike_poster.jpg/220px-Uri-_The_Surgical_Strike_poster.jpg',
    streamingOn: ['Prime Video'],
    defaultRealPercent: 75,
    isTrending: true,
    isFeatured: true,
    tags: ['army', 'pakistan', 'kashmir', 'surgical strike', 'war'],
  },
  {
    title: 'Scam 1992',
    hindiTitle: 'स्कैम 1992',
    slug: 'scam-1992',
    year: 2020,
    duration: 420,
    language: 'Hindi',
    director: 'Hansal Mehta',
    producer: 'Applause Entertainment',
    category: 'crime',
    genre: ['Crime', 'Drama', 'Biography'],
    cast: [
      { name: 'Pratik Gandhi', role: 'Lead', character: 'Harshad Mehta' },
      { name: 'Shreya Dhanwanthary', role: 'Lead', character: 'Sucheta Dalal' },
    ],
    synopsis: 'The story of Harshad Mehta, a stockbroker who single-handedly brought the Bombay Stock Exchange to its knees in the early 90s.',
    trueEventDescription: 'Harshad Shantilal Mehta was an Indian stockbroker who masterminded a massive stock market scam in 1992. He exploited loopholes in the banking system to funnel money into the stock market, artificially inflating share prices. The scam involved Rs. 4,000 crore and when exposed by journalist Sucheta Dalal, it caused the market to crash.',
    realEventDate: '1986–1992',
    realPersonNames: 'Harshad Mehta, Sucheta Dalal',
    realEventLocation: 'Mumbai, Maharashtra',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Scam1992.jpg/220px-Scam1992.jpg',
    streamingOn: ['SonyLIV'],
    defaultRealPercent: 85,
    isTrending: true,
    isFeatured: true,
    tags: ['stock market', 'fraud', 'finance', 'mumbai', '90s'],
  },
  {
    title: 'Bhaag Milkha Bhaag',
    hindiTitle: 'भाग मिल्खा भाग',
    slug: 'bhaag-milkha-bhaag',
    year: 2013,
    releaseDate: '2013-07-12',
    duration: 186,
    language: 'Hindi',
    director: 'Rakeysh Omprakash Mehra',
    category: 'sports',
    genre: ['Sports', 'Biography', 'Drama'],
    cast: [
      { name: 'Farhan Akhtar', role: 'Lead', character: 'Milkha Singh' },
      { name: 'Sonam Kapoor', role: 'Supporting', character: 'Biro' },
    ],
    synopsis: 'The incredible story of Milkha Singh — "The Flying Sikh" — who rose from tragic poverty to become one of India\'s greatest athletes.',
    trueEventDescription: 'Milkha Singh (1929–2021) was an Indian sprinter nicknamed "The Flying Sikh." He survived the 1947 Partition massacre of his family, joined the Indian Army, and became a champion runner. He represented India in the 1956, 1960, and 1964 Olympics. His near-miss at the 1960 Rome Olympics — finishing 4th in the 400m — remained a defining moment.',
    realEventDate: '1947–1960',
    realPersonNames: 'Milkha Singh',
    realEventLocation: 'Punjab, Pakistan / India',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Bhaag_Milkha_Bhaag.jpg/220px-Bhaag_Milkha_Bhaag.jpg',
    streamingOn: ['Netflix', 'Prime Video'],
    defaultRealPercent: 70,
    isTrending: false,
    isFeatured: true,
    tags: ['olympics', 'running', 'partition', 'sports biography', 'punjab'],
  },
  {
    title: 'Gangubai Kathiawadi',
    hindiTitle: 'गंगूबाई काठियावाड़ी',
    slug: 'gangubai-kathiawadi',
    year: 2022,
    releaseDate: '2022-02-25',
    duration: 152,
    language: 'Hindi',
    director: 'Sanjay Leela Bhansali',
    category: 'biographical',
    genre: ['Crime', 'Biography', 'Drama'],
    cast: [
      { name: 'Alia Bhatt', role: 'Lead', character: 'Gangubai Kathiawadi' },
      { name: 'Ajay Devgn', role: 'Supporting', character: 'Rahim Lala' },
    ],
    synopsis: 'A young girl sold into prostitution becomes one of the most powerful and respected women in Kamathipura.',
    trueEventDescription: 'Gangubai Harjivandas (born Ganga Harjivandas) was a brothel owner and matriarch of Kamathipura, one of Mumbai\'s red-light districts. She was allegedly sold to a brothel owner by her boyfriend in the 1940s and later rose to become a powerful figure, advocating for the rights of sex workers. She reportedly met Prime Minister Jawaharlal Nehru to argue for the rights and welfare of those in her profession.',
    realEventDate: '1940s–1960s',
    realPersonNames: 'Gangubai Harjivandas',
    realEventLocation: 'Kamathipura, Mumbai',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Gangubai_Kathiawadi.jpg/220px-Gangubai_Kathiawadi.jpg',
    streamingOn: ['Netflix'],
    defaultRealPercent: 60,
    isTrending: true,
    tags: ['mumbai', 'women empowerment', 'crime', '1940s'],
  },
  {
    title: 'The Kashmir Files',
    hindiTitle: 'द कश्मीर फाइल्स',
    slug: 'the-kashmir-files',
    year: 2022,
    releaseDate: '2022-03-11',
    duration: 170,
    language: 'Hindi',
    director: 'Vivek Agnihotri',
    category: 'political',
    genre: ['Drama', 'Political', 'Historical'],
    cast: [
      { name: 'Anupam Kher', role: 'Lead', character: 'Pushkar Nath Pandit' },
      { name: 'Mithun Chakraborty', role: 'Supporting', character: 'Brahma Dutt' },
    ],
    synopsis: 'Based on the video interviews of the first generation victims of the Kashmiri Pandit exodus of the early 1990s.',
    trueEventDescription: 'The Kashmiri Pandit exodus refers to the mass exodus of Kashmiri Pandits (Hindus) from the Kashmir Valley that began in 1989–1990. Hundreds of thousands fled their homes amid targeted killings, threats, and violence. Estimates suggest 100,000 to 600,000 Kashmiri Pandits fled. The film draws from testimonies of survivors of this period.',
    realEventDate: '1989–1990',
    realPersonNames: 'Kashmiri Pandit community',
    realEventLocation: 'Kashmir Valley, Jammu & Kashmir',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/71/The_Kashmir_Files.jpg/220px-The_Kashmir_Files.jpg',
    streamingOn: ['Zee5'],
    defaultRealPercent: 80,
    isTrending: false,
    tags: ['kashmir', 'hindus', 'exodus', 'political', '1990'],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tables synced');

    // Create admin user
    const [admin] = await User.findOrCreate({
      where: { phone: process.env.ADMIN_PHONE || '9999999999' },
      defaults: {
        phone: process.env.ADMIN_PHONE || '9999999999',
        name: process.env.ADMIN_NAME || 'Admin',
        role: 'admin',
      },
    });
    console.log(`✅ Admin user: ${admin.phone}`);

    // Seed movies
    for (const movieData of sampleMovies) {
      await Movie.findOrCreate({ where: { slug: movieData.slug }, defaults: movieData });
    }
    console.log(`✅ ${sampleMovies.length} sample movies seeded`);

    console.log('\n🎬 Seed complete! Run the server with: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

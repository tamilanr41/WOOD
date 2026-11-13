const CDN = "https://lumbert.like-themes.com/wp-content/uploads";

export const IMG = {
  favicon: "/mariya-logo.png",
  hero: [
    `${CDN}/2025/11/SLIDE_01.jpg`,
    `${CDN}/2025/11/SLIDE_02.jpg`,
    `${CDN}/2025/11/SLIDE_03.jpg`,
    `${CDN}/2025/11/SLIDE_04.jpg`,
  ],
  about: [
    `${CDN}/2025/11/about_img_01.jpg`,
    `${CDN}/2025/11/about_img_02.jpg`,
    `${CDN}/2025/11/about_img_03.jpg`,
  ],
  aboutAlt: [
    `${CDN}/2025/12/about_img_01.jpg`,
    `${CDN}/2025/12/about_img_02.jpg`,
    `${CDN}/2025/12/about_img_03.jpg`,
  ],
  services: [
    `${CDN}/2025/11/service_01.jpg`,
    `${CDN}/2025/11/service_02.jpg`,
    `${CDN}/2025/11/service_03.jpg`,
    `${CDN}/2025/11/service_04.jpg`,
  ],
  priceTree: `${CDN}/2025/11/price_tree.jpg`,
  masters: [
    `${CDN}/2025/11/master_01.jpg`,
    `${CDN}/2025/11/master_02.jpg`,
    `${CDN}/2025/11/master_03.jpg`,
  ],
  carpenter: `${CDN}/2025/11/carpenter.png`,
  faq: `${CDN}/2025/11/faq_img.jpg`,
  chair: `${CDN}/2025/11/chair.jpg`,
  topImg: `${CDN}/2025/12/top_img.jpg`,
  testimonialAvatars: [
    `${CDN}/2024/12/testimonials_01-140x140.jpg`,
    `${CDN}/2024/12/testimonials_02-140x140.jpg`,
    `${CDN}/2024/12/testimonials_03-140x140.jpg`,
    `${CDN}/2024/12/testimonials_04-140x140.jpg`,
    `${CDN}/2024/12/testimonials_05-140x140.jpg`,
    `${CDN}/2024/12/testimonials_06-140x140.jpg`,
  ],
  logos: [
    `${CDN}/2025/11/logo_34.png`,
    `${CDN}/2025/11/logo_26.png`,
    `${CDN}/2025/11/logo_27.png`,
    `${CDN}/2025/11/logo_28.png`,
    `${CDN}/2025/11/logo_29.png`,
    `${CDN}/2025/11/logo_35.png`,
  ],
  team: [
    `${CDN}/2025/09/team_01.jpg`,
    `${CDN}/2025/09/team_02.jpg`,
    `${CDN}/2025/09/team_03.jpg`,
    `${CDN}/2025/09/team_04.jpg`,
    `${CDN}/2025/09/team_05.jpg`,
    `${CDN}/2025/09/team_06.jpg`,
    `${CDN}/2025/09/team_08.jpg`,
    `${CDN}/2025/09/team_07.jpg`,
  ],
  gallery: [
    `${CDN}/2025/10/gal_02-500x500.jpg`,
    `${CDN}/2025/10/gal_03-500x500.jpg`,
    `${CDN}/2025/10/gal_04-500x500.jpg`,
    `${CDN}/2025/10/gal_05-500x500.jpg`,
    `${CDN}/2025/10/gal_06-500x500.jpg`,
    `${CDN}/2025/10/gal_07-500x500.jpg`,
  ],
  shop: [
    `${CDN}/2025/11/shop_04-540x675.jpg`,
    `${CDN}/2025/11/shop_22-540x675.jpg`,
    `${CDN}/2025/11/shop_16-540x675.jpg`,
    `${CDN}/2025/11/shop_19-540x675.jpg`,
    `${CDN}/2025/11/shop_01-540x675.jpg`,
    `${CDN}/2025/11/shop_20-540x675.jpg`,
  ],
  headerBlog: `${CDN}/2025/11/header_blog.jpg`,
  videoBg: `${CDN}/2025/11/video_parallax_02.jpg`,
  formBg: `${CDN}/2025/11/form_bg.jpg`,
  blog: [
    `${CDN}/2025/10/blog_01.jpg`,
    `${CDN}/2025/10/blog_02.jpg`,
    `${CDN}/2025/10/blog_03.jpg`,
    `${CDN}/2025/10/blog_04.jpg`,
    `${CDN}/2025/10/blog_05.jpg`,
    `${CDN}/2025/10/blog_06.jpg`,
    `${CDN}/2025/10/blog_07.jpg`,
    `${CDN}/2025/10/blog_08.jpg`,
    `${CDN}/2025/10/blog_09.jpg`,
    `${CDN}/2025/10/blog_10.jpg`,
    `${CDN}/2025/10/blog_11.jpg`,
  ],
};

export const site = {
  name: "Mariya Plywoods Furniture",
  tagline: "Plywoods · Laminates · Furniture · Home Interiors",
  phone: "+91 94435 48290",
  appointmentPhone: "+91 94435 48290",
  instagram: "https://www.instagram.com/mariya_plywoods_furniture/",
  instagramHandle: "@mariya_plywoods_furniture",
  x: "https://x.com/mariya_plywoods",
  facebook: "https://www.facebook.com/mariyaplywoods",
  mapUrl:
    "https://www.google.com/maps/place/Mariya+Plywoods/@11.3302293,77.6990884,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba96fafb097e02d:0x31afec5e52070e8b!8m2!3d11.3302293!4d77.6990884!16s%2Fg%2F11ygh2vysz",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Mariya+Plywoods%2C+11.3302293%2C77.6990884&z=17&output=embed",
  address:
    "144, Perundurai Rd, Opp. Sakthi Mahal, EB Officer's Colony, Palayapalayam, Erode, Tamil Nadu 638011",
  workHours: "Mon–Sat: 10:00 am–8:00 pm · Sunday: Closed",
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
  mega?: boolean;
};

export const nav: NavItem[] = [
  {
    label: "Home",
    href: "/",
    mega: true,
    children: [
      { label: "Home Carpenter", href: "/" },
      { label: "Home Forestry", href: "/home-forestry" },
      { label: "Home Woodworks", href: "/home-woodworks" },
      { label: "Home Store", href: "/home-store" },
    ],
  },
  {
    label: "About",
    href: "/about-us",
    children: [
      { label: "About Us", href: "/about-us" },
      { label: "Our Team", href: "/our-team" },
      { label: "Testimonials", href: "/testimonial" },
      { label: "FAQ", href: "/faq" },
      { label: "Gallery 3-columns", href: "/gallery-3-columns" },
      { label: "Gallery 4-columns", href: "/gallery-4-columns" },
      { label: "404 Page", href: "/404-page" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [
      { label: "Classic Right Sidebar", href: "/blog" },
      { label: "Masonry 3-Columns", href: "/blog" },
    ],
  },
  {
    label: "Store",
    href: "/shop",
    children: [
      { label: "Shop", href: "/shop" },
      { label: "Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
      { label: "My account", href: "/my-account" },
    ],
  },
  { label: "Contacts", href: "/contacts" },
];

export const services = [
  {
    title: "Modular Kitchen",
    image: IMG.services[0],
    description: "Bespoke kitchens engineered for everyday life.",
  },
  {
    title: "Custom Furniture",
    image: IMG.services[1],
    description: "Hand-built pieces made to last generations.",
  },
  {
    title: "Wooden Stairs",
    image: IMG.services[2],
    description: "Precision joinery for safe, sculptural stairs.",
  },
  {
    title: "Hardwood Flooring",
    image: IMG.services[3],
    description: "Responsibly sourced floors with a perfect finish.",
  },
];

export const pricing = [
  { title: "House Concept", price: "₹22,000", desc: "Layout study and massing review" },
  { title: "Door Installation", price: "₹11,300", desc: "Fitted frames and quiet seals" },
  { title: "Wall Paneling", price: "₹3,800", desc: "Clean lines and warm texture" },
  { title: "Shingle Laying", price: "₹8,400", desc: "Even courses with copper nails" },
  { title: "Deck Framing", price: "₹7,300", desc: "Stable substructure with drainage" },
  { title: "Rafter Repair", price: "₹6,100", desc: "Replace damaged timbers safely" },
  { title: "Moisture Check", price: "₹3,400", desc: "Meter readings and report sheet" },
  { title: "Furniture Build", price: "₹42,200", desc: "Custom pieces for unique rooms" },
  { title: "Facade Cladding", price: "₹13,600", desc: "Durable boards with clean joints" },
  { title: "Interior Finish", price: "₹22,500", desc: "Smooth surfaces ready for paint" },
];

export const masters = [
  {
    title: "Moisture and Drying",
    image: IMG.masters[0],
    description:
      "Our artisans carefully follow traditions passed down through generations to ensure every board is stable and true.",
  },
  {
    title: "Project Logistics",
    image: IMG.masters[1],
    description:
      "From the forest to the workshop and on to site, every stage is tracked, scheduled and delivered on time.",
  },
  {
    title: "Quality Assurance",
    image: IMG.masters[2],
    description:
      "Only responsibly sourced timber is used, checked at every step to achieve a flawless, lasting finish.",
  },
];

export const testimonials = [
  {
    quote:
      "This place is wonderful. The staff are friendly and professional, and the atmosphere is relaxing. I loved my new kitchen and people keep complimenting it.",
    name: "Stefanie Rashford",
    role: "Homeowner",
  },
  {
    quote:
      "Service was exceptional, and it's clear that you have a genuine passion for what you do. The attention to detail and willingness to personalize the experience made it truly memorable.",
    name: "Patric Stone",
    role: "Architect",
  },
  {
    quote:
      "The work done was outstanding! The dedication and hard work put into it were evident and greatly appreciated. The level of skill and expertise demonstrated was truly impressive.",
    name: "Hugo James",
    role: "Builder",
  },
  {
    quote:
      "The product delivered exceeded expectations! The attention to detail and commitment to quality were evident in every aspect. The level of customer service provided was also exceptional.",
    name: "Cassie Carleton",
    role: "Interior Designer",
  },
  {
    quote:
      "From the first sketch to the final coat of oil, the team treated our home like their own. We could not be happier with the joinery and the finish.",
    name: "Coby Sue",
    role: "Client",
  },
  {
    quote:
      "Reliable, punctual and genuinely skilled. The staircase they built has become the centrepiece of our house and the whole process was effortless.",
    name: "Fredrick Yolonda",
    role: "Client",
  },
];

export const team = [
  { name: "Marco De Luca", role: "CEO", image: IMG.team[0] },
  { name: "Enzo Romano", role: "Driver", image: IMG.team[1] },
  { name: "Martina Greco", role: "Forestry Manager", image: IMG.team[2] },
  { name: "Fabio Santoro", role: "Carpenter", image: IMG.team[3] },
  { name: "Matteo Ricci", role: "Driver", image: IMG.team[4] },
  { name: "Alessandro Moretti", role: "Carpenter", image: IMG.team[5] },
  { name: "Enzo Romano", role: "Carpenter", image: IMG.team[6] },
  { name: "Bianca Corsini", role: "Driver", image: IMG.team[7] },
];

export const gallery = [
  { title: "Combine Precise", image: IMG.gallery[0] },
  { title: "Precise Engineering", image: IMG.gallery[1] },
  { title: "Collection of Handcraft", image: IMG.gallery[2] },
  { title: "Mastery and Unique", image: IMG.gallery[3] },
  { title: "Sustainable Forestry", image: IMG.gallery[4] },
  { title: "Repair and Restoration", image: IMG.gallery[5] },
];

export const faqs = [
  {
    q: "What moisture level suits interior joinery work?",
    a: "For interior joinery we aim for a moisture content between 8% and 12%, measured with a calibrated meter before machining and again before installation. This keeps movement predictable as the timber acclimatises to your home.",
  },
  {
    q: "How to maintain oil finished facades?",
    a: "Clean gently with a soft brush and pH-neutral soap once a year, then re-oil when water stops beading on the surface. We recommend a hard-wax oil for facades exposed to strong sun and rain.",
  },
  {
    q: "How long do wooden roofs normally last?",
    a: "With correct ventilation and quality shingles, a well-built timber roof can last 30 to 50 years. Regular inspection of flashings and gutters is the single biggest factor in longevity.",
  },
  {
    q: "What ventilation is needed under roof coverings?",
    a: "A continuous 25 mm air gap at the eaves and ridge is normally sufficient. The goal is steady airflow that carries moisture away before it can condense on the underside of the covering.",
  },
  {
    q: "How often to inspect outdoor decking?",
    a: "Inspect twice a year and after any severe storm. Check for loose fixings, standing water and any boards that have started to cup, and treat the surface annually to protect it from UV.",
  },
];

export type Product = {
  slug: string;
  title: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  description: string;
};

export const products: Product[] = [
  {
    slug: "cream-armchair",
    title: "Cream Armchair",
    price: 140,
    category: "Living Room",
    image: IMG.shop[0],
    rating: 5,
    description:
      "A softly upholstered armchair with a solid oak frame. The cream fabric and hand-finished legs make it an easy fit for calm, natural interiors.",
  },
  {
    slug: "cushion-bench-seat",
    title: "Cushion Bench Seat",
    price: 2170,
    category: "Bedroom",
    image: IMG.shop[1],
    rating: 5,
    description:
      "A compact bench with a deep cushion and tapered timber legs. Ideal at the end of a bed or in a bright hallway.",
  },
  {
    slug: "geometric-wall-shelf",
    title: "Geometric Wall Shelf Crepito",
    price: 330,
    category: "Stairs & Railings",
    image: IMG.shop[2],
    rating: 4,
    description:
      "A sculptural wall shelf built from precise geometric joints. Mount it alone or repeat it for a rhythmic display.",
  },
  {
    slug: "modern-kitchen-cabinet",
    title: "Modern Kitchen Cabinet",
    price: 1550,
    category: "Modular Kitchen",
    image: IMG.shop[3],
    rating: 5,
    description:
      "A clean-lined cabinet with soft-close doors and adjustable shelving. Designed to slot into a modular kitchen layout.",
  },
  {
    slug: "oak-storage-cabinet",
    title: "Oak Storage Cabinet",
    price: 3150,
    category: "Bedroom",
    image: IMG.shop[4],
    rating: 5,
    description:
      "Generous storage in solid oak with hand-cut dovetails. The oiled finish deepens beautifully with age.",
  },
  {
    slug: "open-shelf-tower",
    title: "Open Shelf Tower",
    price: 800,
    category: "Bedroom",
    image: IMG.shop[5],
    rating: 5,
    description:
      "A tall, open shelving tower that keeps a room feeling light. Built from sustainably sourced ash.",
  },
  {
    slug: "oak-dining-table",
    title: "Oak Dining Table",
    price: 4230,
    category: "Table & Chair",
    image: IMG.shop[4],
    rating: 5,
    description:
      "A generous dining table with a thick oak top and hand-shaped legs. Seats six comfortably and grows with the family.",
  },
  {
    slug: "wooden-stair-railing",
    title: "Wooden Stair Railing",
    price: 2680,
    category: "Stairs & Railings",
    image: IMG.shop[2],
    rating: 5,
    description:
      "A warm timber railing with slim balusters and a hand-finished rail. Made to measure for your stair geometry.",
  },
  {
    slug: "rustic-coffee-table",
    title: "Rustic Coffee Table",
    price: 1870,
    category: "Living Room",
    image: IMG.shop[0],
    rating: 4,
    description:
      "A low coffee table with a live-edge top and a sturdy trestle base. Every board is selected for character.",
  },
  {
    slug: "bedside-drawer",
    title: "Bedside Wooden Drawer",
    price: 1200,
    category: "Bedroom",
    image: IMG.shop[1],
    rating: 5,
    description:
      "A neat bedside unit with a single soft-close drawer and an open shelf for the books you are reading.",
  },
  {
    slug: "modular-pantry-unit",
    title: "Modular Pantry Unit",
    price: 2480,
    category: "Modular Kitchen",
    image: IMG.shop[3],
    rating: 5,
    description:
      "A tall pantry with adjustable interior fittings, designed to be combined with other modular kitchen units.",
  },
  {
    slug: "kids-playhouse",
    title: "Kids Wooden Playhouse",
    price: 3670,
    category: "Playroom",
    image: IMG.shop[5],
    rating: 5,
    description:
      "A sturdy indoor playhouse with rounded edges and a natural finish, built to be climbed on for years.",
  },
];

export const categories = [
  "Bedroom",
  "Living Room",
  "Modular Kitchen",
  "Playroom",
  "Stairs & Railings",
  "Table & Chair",
];

export const heroSlides = [
  {
    image: IMG.hero[0],
    eyebrow: "Project planning that respects material properties",
    title: "Carpentry and Joinery Services",
  },
  {
    image: IMG.hero[1],
    eyebrow: "Responsible timber production",
    title: "Carpentry and Joinery Services",
  },
  {
    image: IMG.hero[2],
    eyebrow: "From forest to finished room",
    title: "Carpentry and Joinery Services",
  },
  {
    image: IMG.hero[3],
    eyebrow: "Crafted to last for generations",
    title: "Carpentry and Joinery Services",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
  excerpt: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-handcrafted-work-still-matters",
    title: "Why Handcrafted Work Still Matters in a Modern World",
    image: IMG.blog[0],
    category: "Our Services",
    date: "October 14, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "how-a-workshop-environment-shapes-the-creative-process",
    title: "How a Workshop Environment Shapes the Creative Process",
    image: IMG.blog[1],
    category: "Company",
    date: "September 10, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "the-subtle-connection-between-maker-and-material",
    title: "The Subtle Connection Between Maker and Material",
    image: IMG.blog[2],
    category: "Experts",
    date: "September 10, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "how-slow-intentional-craft-leads-to-better-results",
    title: "How Slow, Intentional Craft Leads to Better Results",
    image: IMG.blog[3],
    category: "Strategy",
    date: "August 5, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "the-value-of-natural-materials-in-contemporary-craft",
    title: "The Value of Natural Materials in Contemporary Craft",
    image: IMG.blog[4],
    category: "Feedback",
    date: "July 7, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "what-years-of-practice-teach-about-true-skill",
    title: "What Years of Practice Teach About True Skill",
    image: IMG.blog[5],
    category: "Feedback",
    date: "June 4, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "the-balance-of-precision-and-emotion-in-crafting",
    title: "The Balance of Precision and Emotion in Crafting",
    image: IMG.blog[6],
    category: "Feedback",
    date: "May 19, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "how-tools-become-an-extension-of-the-artisan",
    title: "How Tools Become an Extension of the Artisan",
    image: IMG.blog[7],
    category: "Company",
    date: "May 12, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "the-unique-beauty-within-handmade-imperfections",
    title: "The Unique Beauty Within Handmade Imperfections",
    image: IMG.blog[8],
    category: "Company",
    date: "April 12, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "why-traditional-methods-influence-modern-design",
    title: "Why Traditional Methods Influence Modern Design",
    image: IMG.blog[9],
    category: "Company",
    date: "March 12, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
  {
    slug: "the-transformative-journey-from-raw-material-to-form",
    title: "The Transformative Journey From Raw Material to Form",
    image: IMG.blog[10],
    category: "Company",
    date: "February 12, 2024",
    excerpt:
      "Woodworking has always been more than a practical trade. It is an art form shaped by precision, patience and a deep respect for natural materials. Every project begins with raw timber, but the true transformation happens in the hands of the carpenter who understands its grain, structure and potential.",
  },
];

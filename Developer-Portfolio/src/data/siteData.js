// Shared project and certificate data used across the app
export const projects = [
  {
    id: 'food-delivery',
    title: 'Food Delivery Application',
    period: 'React.js · Node.js · Express.js · MongoDB · JWT · Stripe',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    description: [
      'Developed a full-stack food ordering platform using the MERN stack.',
      'Implemented JWT-based authentication, cart management, order placement, and order tracking.',
      'Integrated Stripe payment gateway for secure online payments.',
      'Built an admin dashboard for managing food items, customers, and orders.',
      'Designed responsive user interfaces using React.js and Context API.',
      'Developed RESTful APIs with Express.js and MongoDB for scalable data management.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/Food_Delivery_Application',
    live: 'https://food-delivery-hub-ashen.vercel.app/',
  },
  {
    id: 'fullstack-ecommerce',
    title: 'FullStack E-Commerce Application',
    period: 'React.js · Django · PostgreSQL · Stripe · JWT · REST API',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    description: [
      'Developed a full-stack e-commerce application using React.js and Django REST Framework.',
      'Implemented JWT authentication, product management, cart, checkout, and order tracking features.',
      'Integrated Stripe payment gateway for secure online transactions.',
      'Built user profile, address management, and admin dashboard functionalities.',
      'Designed RESTful APIs and optimized PostgreSQL database performance.',
      'Applied secure authentication, authorization, and payment processing workflows.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/FullStack_Ecommerce_App',
    live: 'https://fullstack-ecommerce-app-pearl.vercel.app/',
  },
  {
    id: 'learning-management',
    title: 'Learning Management System',
    period: 'React.js · Spring Boot · Java · MySQL · Spring Security · JWT',
    img: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
    description: [
      'Developed a full-stack Learning Management System using React.js, Spring Boot, and MySQL.',
      'Implemented JWT authentication and role-based access control for Admin and User roles.',
      'Built course management, assessments, progress tracking, and certificate generation features.',
      'Developed RESTful APIs using Spring Boot and Spring Data JPA.',
      'Created an admin dashboard for managing courses, students, and assessments.',
      'Designed responsive user interfaces using React.js and Tailwind CSS.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/Learning-Management-System',
    live: 'https://farmers-align-wizard-endorsement.trycloudflare.com',
  },
  {
    id: 'resume-builder',
    title: 'Resume Builder',
    period: 'React.js · JavaScript · HTML · CSS · jsPDF · html2canvas',
    img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    description: [
      'Developed a dynamic resume builder application using React.js and JavaScript.',
      'Implemented real-time resume preview with customizable sections for personal details, skills, education, and experience.',
      'Enabled profile photo upload and PDF resume generation using jsPDF and html2canvas.',
      'Designed responsive user interfaces with React Hooks and React Router.',
      'Provided multiple resume templates for creating professional resumes.',
      'Deployed the application on Vercel for seamless online access.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/Resume-Builder',
    live: 'https://resume-builder-ai-mauve.vercel.app/',
  },
  {
    id: 'mockmate',
    title: 'MockMate – AI Interview Preparation Platform',
    period: 'React.js · Node.js · Express.js · MongoDB · Gemini AI · Socket.io · JWT',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    description: [
      'Developed an AI-powered interview preparation platform using the MERN stack and Google Gemini AI.',
      'Implemented AI-generated interview questions, ATS resume analysis, and personalized career guidance.',
      'Built real-time mock interview and live coding environments using Socket.io and WebSockets.',
      'Integrated JWT authentication, role-based access control, and secure user management.',
      'Developed responsive user interfaces with React.js and modern UI components.',
      'Created admin dashboards for user management and analytics.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/MockMate',
    live: 'https://mockmate-react-ai.vercel.app/',
  },
  {
    id: 'mern-ecommerce-store',
    title: 'MERN E-Commerce Store',
    period: 'React.js · Node.js · Express.js · MongoDB · Redis · Stripe · Cloudinary · JWT',
    img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    description: [
      'Developed a premium full-stack e-commerce platform using the MERN stack.',
      'Implemented JWT authentication, product management, shopping cart, and secure Stripe payment integration.',
      'Built an admin dashboard with sales analytics, order management, and product/category CRUD operations.',
      'Integrated Redis caching and Cloudinary for optimized performance and media storage.',
      'Developed RESTful APIs using Express.js and MongoDB for scalable data management.',
      'Deployed the application on Vercel with a unified frontend and backend architecture.',
    ],
    github: 'https://github.com/JalapatiRavikumar/AI-Projects/tree/main/MERN-Ecommerce-Store',
    live: 'https://mern-ecommerce-store-rho.vercel.app/',
  },
];

export const certificates = [
  {
    id: 'cert-1',
    title: 'Full Stack Certification',
    img: '/public/Photo.png',
  },
];

/** Portfolio Tech Stack tab — grouped skills (no “DevOps” section label). */
export const techStackCategories = [
  {
    title: 'Languages',
    items: [
      { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
      { name: 'JavaScript (ES6+)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'SQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
      { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    ],
  },
  {
    title: 'Frontend',
    items: [
      { name: 'React.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Tailwind CSS', icon: 'https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg' },
      { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'Responsive Design', icon: 'https://cdn-icons-png.flaticon.com/512/3281/3281306.png' },
      { name: 'CSS Animations', icon: 'https://cdn-icons-png.flaticon.com/512/919/919827.png' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Spring Boot', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
      { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Express.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
      { name: 'REST APIs', icon: 'https://cdn-icons-png.flaticon.com/512/714/714373.png' },
      { name: 'JWT', icon: 'https://jwt.io/img/pic_logo.svg' },
      { name: 'Microservices', icon: 'https://cdn-icons-png.flaticon.com/512/5261/5261498.png' },
    ],
  },
  {
    title: 'Database',
    items: [
      { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
      { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
      { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
      { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
      { name: 'Postman', icon: 'https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg' },
      { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
    ],
  },
  {
    title: 'AI & Concepts',
    items: [
      { name: 'Gemini AI', icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b0512ad88058.svg' },
      { name: 'LLMs', icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png' },
      { name: 'DSA', icon: 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png' },
    ],
  },
];

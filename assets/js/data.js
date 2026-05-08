/* ═══════════════════════════════════════════════════════════════
   MathLab Education — Default Content Data
   Edit this file to change default content, or use Admin Mode
   (Ctrl+Shift+A) to edit content through the browser interface.
   Changes made in Admin Mode are saved in browser localStorage.
   ═══════════════════════════════════════════════════════════════ */

window.ML_DEFAULT_DATA = {

  meta: {
    siteName: "MathLab Education",
    tagline: "Arman Teaches Math",
    description: "Expert Mathematics Tuition — O/L, A/L & Beyond",
    email: "arman@mathlabeducation.com",
    phone: "+94 77 000 0000",
    whatsapp: "94770000000",
    footerText: "© 2025 MathLab Education. All rights reserved.",
    socialLinks: [
      { id: "sl1", platform: "Facebook",  url: "https://facebook.com/",   label: "fb" },
      { id: "sl2", platform: "Instagram", url: "https://instagram.com/",  label: "ig" },
      { id: "sl3", platform: "YouTube",   url: "https://youtube.com/@",   label: "yt" },
      { id: "sl4", platform: "WhatsApp",  url: "https://wa.me/94770000000", label: "wa" }
    ]
  },

  profile: {
    archived: false,
    name: "Arman",
    fullName: "Arman [Your Last Name]",
    title: "Mathematics Educator & Tutor",
    subtitle: "Founder, MathLab Education",
    bio: "Passionate and dedicated mathematics educator with over 8 years of experience transforming students' relationship with numbers. Arman has developed a unique teaching methodology that breaks complex mathematical concepts into clear, manageable steps — making math not just understandable, but genuinely enjoyable. His students consistently achieve top results at O/L, A/L, and university entrance examinations.",
    photoUrl: "",
    stats: [
      { id: "st1", label: "Years Teaching",  value: "8+"   },
      { id: "st2", label: "Students Taught", value: "500+" },
      { id: "st3", label: "Pass Rate",        value: "96%"  },
      { id: "st4", label: "Grade A/B Rate",   value: "78%"  }
    ],
    subjects: ["Pure Mathematics", "Combined Mathematics", "Statistics", "Additional Mathematics"]
  },

  experience: {
    archived: false,
    items: [
      {
        id: "exp1",
        role: "Founder & Lead Mathematics Educator",
        organization: "MathLab Education",
        period: "2019 – Present",
        description: "Founded and operates a leading private mathematics education centre offering individual and group tuition. Developed a proprietary curriculum and teaching framework used across all classes.",
        current: true,
        archived: false
      },
      {
        id: "exp2",
        role: "Senior Mathematics Tutor",
        organization: "Premier Education Institute",
        period: "2016 – 2019",
        description: "Taught O/L and A/L Mathematics to classes of up to 25 students. Consistently achieved a 90%+ pass rate. Designed revision materials and mock examination papers.",
        current: false,
        archived: false
      },
      {
        id: "exp3",
        role: "Private Mathematics Tutor",
        organization: "Independent Practice",
        period: "2014 – 2016",
        description: "Provided one-on-one and small group tutoring for students from Grade 6 through A/L. Built a strong reputation through referrals and outstanding student results.",
        current: false,
        archived: false
      }
    ]
  },

  qualifications: {
    archived: false,
    items: [
      { id: "q1", title: "BSc (Hons) Mathematics", institution: "University of [City]", year: "2014", type: "degree", archived: false },
      { id: "q2", title: "Postgraduate Diploma in Education (PGDE)", institution: "National Institute of Education", year: "2015", type: "diploma", archived: false },
      { id: "q3", title: "Cambridge International A Level Mathematics", institution: "Cambridge Assessment International Education", year: "2010", type: "certification", archived: false },
      { id: "q4", title: "Certificate in Online Teaching & E-Learning", institution: "British Council", year: "2021", type: "certification", archived: false }
    ]
  },

  workflow: {
    archived: false,
    intro: "Every student at MathLab Education follows a structured, personalized learning journey designed to build confidence and achieve outstanding results. Here is how it works:",
    steps: [
      { id: "wf1", step: "01", title: "Initial Assessment", description: "We begin with a detailed diagnostic session to understand your current level, learning style, strengths, and areas that need the most attention.", icon: "📋", archived: false },
      { id: "wf2", step: "02", title: "Personalized Study Plan", description: "A custom study plan is crafted just for you — covering what topics to focus on, at what pace, and with which resources and materials.", icon: "📐", archived: false },
      { id: "wf3", step: "03", title: "Structured Lessons", description: "Interactive, concept-first lessons with clear explanations, worked examples, and visual aids. Every lesson is designed to be engaging, never passive.", icon: "📚", archived: false },
      { id: "wf4", step: "04", title: "Practice & Drills", description: "Targeted exercises, past paper questions, and timed practice sets to build speed, accuracy, and the confidence needed to excel in exams.", icon: "✏️", archived: false },
      { id: "wf5", step: "05", title: "Progress Reviews", description: "Regular checkpoint assessments to measure improvement, re-calibrate the plan if needed, and celebrate every milestone along the way.", icon: "📈", archived: false },
      { id: "wf6", step: "06", title: "Exam Preparation", description: "Intensive revision, exam technique coaching, time management strategies, and full mock examinations conducted under real exam conditions.", icon: "🎯", archived: false }
    ]
  },

  locations: {
    archived: false,
    items: [
      {
        id: "loc1",
        name: "MathLab Main Centre",
        address: "123 Main Street, Colombo 05",
        mapUrl: "https://maps.google.com/?q=Colombo+05+Sri+Lanka",
        type: "Centre",
        facilities: ["Air Conditioned", "Whiteboard", "Reference Library", "Parking Available"],
        color: "gold",
        archived: false
      },
      {
        id: "loc2",
        name: "North Branch",
        address: "45 North Road, Colombo 10",
        mapUrl: "https://maps.google.com/?q=Colombo+10+Sri+Lanka",
        type: "Branch",
        facilities: ["Air Conditioned", "Whiteboard", "Street Parking"],
        color: "blue",
        archived: false
      },
      {
        id: "loc3",
        name: "Online Classes",
        address: "Zoom & Google Meet — Link sent upon enrollment",
        mapUrl: "",
        type: "Online",
        facilities: ["Interactive Whiteboard", "Session Recording", "Live Chat", "Digital Worksheets"],
        color: "green",
        archived: false
      }
    ]
  },

  timetable: {
    archived: false,
    note: "All times are Sri Lanka Standard Time (GMT+5:30). ★ indicates limited seats — contact us to secure your place.",
    rows: [
      { id: "tt1", day: "Monday",   time: "4:00 PM – 5:30 PM",  subject: "O/L Mathematics",        level: "Grade 10–11",  type: "Group",      locationId: "loc1", limited: false, archived: false },
      { id: "tt2", day: "Monday",   time: "6:00 PM – 7:30 PM",  subject: "O/L Mathematics",        level: "Grade 10–11",  type: "Group",      locationId: "loc3", limited: false, archived: false },
      { id: "tt3", day: "Wednesday",time: "4:00 PM – 6:00 PM",  subject: "A/L Combined Maths",     level: "Grade 12–13",  type: "Group",      locationId: "loc1", limited: true,  archived: false },
      { id: "tt4", day: "Wednesday",time: "6:30 PM – 8:30 PM",  subject: "A/L Combined Maths",     level: "Grade 12–13",  type: "Group",      locationId: "loc3", limited: false, archived: false },
      { id: "tt5", day: "Thursday", time: "4:00 PM – 5:30 PM",  subject: "O/L Mathematics",        level: "Grade 8–9",    type: "Group",      locationId: "loc2", limited: false, archived: false },
      { id: "tt6", day: "Saturday", time: "9:00 AM – 11:00 AM", subject: "A/L Combined Maths",     level: "Grade 12–13",  type: "Group",      locationId: "loc1", limited: true,  archived: false },
      { id: "tt7", day: "Saturday", time: "2:00 PM – 3:30 PM",  subject: "O/L Mathematics",        level: "Grade 6–9",    type: "Group",      locationId: "loc3", limited: false, archived: false },
      { id: "tt8", day: "Flexible", time: "By Appointment",      subject: "Individual Tutoring",    level: "Any Level",    type: "Individual", locationId: "loc3", limited: false, archived: false }
    ]
  },

  fees: {
    archived: false,
    currency: "LKR",
    note: "All fees are per calendar month. A one-time registration fee of LKR 1,500 applies for new students. Contact us for sibling discounts or long-term packages.",
    packages: [
      {
        id: "fee1",
        name: "Individual Tutoring",
        priceMonthly: "15,000",
        sessions: "4 sessions/month",
        duration: "90 min/session",
        features: [
          "One-on-one attention",
          "Fully personalised plan",
          "Flexible scheduling",
          "WhatsApp support between classes",
          "Study materials included"
        ],
        highlight: false,
        badge: "",
        archived: false
      },
      {
        id: "fee2",
        name: "Group Class",
        priceMonthly: "6,500",
        sessions: "4 classes/month",
        duration: "90 min/class",
        features: [
          "Small group (max 8 students)",
          "Structured curriculum",
          "Monthly progress report",
          "WhatsApp group support",
          "Printed worksheets included"
        ],
        highlight: true,
        badge: "Most Popular",
        archived: false
      },
      {
        id: "fee3",
        name: "Intensive Revision",
        priceMonthly: "9,500",
        sessions: "8 sessions/month",
        duration: "60 min/session",
        features: [
          "Exam-focused content",
          "Past paper practice sets",
          "Full mock examinations",
          "Detailed performance reports",
          "Exam technique coaching"
        ],
        highlight: false,
        badge: "Exam Prep",
        archived: false
      }
    ]
  },

  enrollment: {
    archived: false,
    intro: "Joining MathLab Education is simple. Follow these five steps to start your mathematics success journey with Arman.",
    steps: [
      { id: "en1", step: "01", title: "Get in Touch",      description: "Send a message on WhatsApp, call, or email us. Tell us your grade level and what you need help with. We respond within 24 hours.", action: "Message on WhatsApp", actionUrl: "#whatsapp", archived: false },
      { id: "en2", step: "02", title: "Free Assessment",   description: "We schedule a free 30-minute diagnostic session to understand your current level, identify learning gaps, and recommend the best class for you.", action: "", actionUrl: "", archived: false },
      { id: "en3", step: "03", title: "Choose Your Class", description: "Based on the assessment, we recommend the most suitable class type (individual or group), timetable slot, and whether to attend in-person or online.", action: "View Timetable", actionUrl: "#s-timetable", archived: false },
      { id: "en4", step: "04", title: "Confirm & Pay",     description: "Confirm your enrollment, pay the one-time registration fee, and receive your first class confirmation with all the details you need.", action: "", actionUrl: "", archived: false },
      { id: "en5", step: "05", title: "Start Learning!",   description: "Attend your first class, receive your personalised study plan, and begin your mathematics transformation under Arman's expert guidance.", action: "", actionUrl: "", archived: false }
    ],
    whatsappMessage: "Hi Arman, I'm interested in joining MathLab Education. Can you tell me more about the classes?"
  },

  announcements: {
    archived: false,
    items: [
      {
        id: "ann1",
        title: "April Exam Revision — Enroll Now",
        description: "Intensive revision classes for O/L and A/L students are open for enrollment. Limited seats available — contact us today to secure your place!",
        imageUrl: "",
        aspectRatio: "1:1",
        date: "2025-03-15",
        pinned: true,
        archived: false
      },
      {
        id: "ann2",
        title: "Free Webinar: Cracking A/L Paper 2",
        description: "Join Arman for a free live webinar focused on A/L Combined Maths Paper 2 strategies. Saturday, April 5th at 10:00 AM.",
        imageUrl: "",
        aspectRatio: "16:9",
        date: "2025-03-08",
        pinned: false,
        archived: false
      }
    ]
  },

  videos: {
    archived: false,
    intro: "Watch free recorded mathematics lessons below. These sessions are available to everyone — students, parents, and anyone learning mathematics.",
    playlists: [
      { id: "pl1", title: "O/L Mathematics",     description: "Key topics for O/L students" },
      { id: "pl2", title: "A/L Combined Maths",  description: "A/L Combined Mathematics walkthroughs" },
      { id: "pl0", title: "All Videos",           description: "Show all" }
    ],
    activePlaylist: "pl0",
    items: [
      {
        id: "vid1",
        title: "Introduction to Quadratic Equations",
        youtubeId: "wdKzb_6LJGQ",
        playlistId: "pl1",
        description: "Learn to solve quadratic equations using factoring, completing the square, and the quadratic formula.",
        archived: false
      },
      {
        id: "vid2",
        title: "Trigonometry — Sine, Cosine, Tangent",
        youtubeId: "F21S9Wpi0y8",
        playlistId: "pl1",
        description: "A clear introduction to trigonometric ratios with worked examples from past papers.",
        archived: false
      },
      {
        id: "vid3",
        title: "Differentiation from First Principles",
        youtubeId: "rAof9Ld5sOg",
        playlistId: "pl2",
        description: "Step-by-step guide to differentiation using first principles — essential for A/L students.",
        archived: false
      }
    ]
  }

};

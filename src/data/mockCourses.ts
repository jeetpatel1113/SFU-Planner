import { type Course, type DegreeTemplate } from "../types";

export const mockCourses: Course[] = [
  {
    "id": "CMPT 102",
    "title": "Introduction to Scientific Computer Programming",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 105W",
    "title": "Social Issues and Communication Strategies in Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 106",
    "title": "Applied Science, Technology and Society",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 110",
    "title": "Programming in Visual Basic",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 115",
    "title": "Exploring Computer Science",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 118",
    "title": "Special Topics in Computer and Information Technology",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 120",
    "title": "Introduction to Computing Science and Programming I",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": [],
    "offeredIn": ["Fall 2026", "Spring 2027"],
    "instructor": "Dr. Diana Cukierman",
    "availabilityStatus": "Open"
  },
  {
    "id": "CMPT 125",
    "title": "Introduction to Computing Science and Programming II",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": [
      "CMPT 120"
    ],
    "corequisites": [
      "MACM 101"
    ],
    "offeredIn": ["Fall 2026"],
    "instructor": "Dr. Nick Sumner",
    "availabilityStatus": "Waitlist"
  },
  {
    "id": "CMPT 128",
    "title": "Introduction to Computing Science and Programming for Engineers",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 129",
    "title": "Introduction to Computing Science and Programming for Mathematics and Statistics",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 130",
    "title": "Introduction to Computer Programming I",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 135",
    "title": "Introduction to Computer Programming II",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 166",
    "title": "An Animated Introduction to Programming",
    "credits": 3,
    "department": "CMPT",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "CMPT 201",
    "title": "Systems Programming",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 210",
    "title": "Probability and Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 213",
    "title": "Object Oriented Design in Java",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 218",
    "title": "Special Topics in Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 225",
    "title": "Data Structures and Programming",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": [
      "MACM 101",
      "CMPT 125"
    ],
    "offeredIn": ["Fall 2026", "Spring 2027"],
    "instructor": "Dr. Anne Lavergne",
    "availabilityStatus": "Open"
  },
  {
    "id": "CMPT 263",
    "title": "Introduction to Human-Centered Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 272",
    "title": "Web I - Client-side Development",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 275",
    "title": "Software Engineering I",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 276",
    "title": "Introduction to Software Engineering",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": []
  },
  {
    "id": "CMPT 295",
    "title": "Introduction to Computer Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 200,
    "prerequisites": [
      "CMPT 225",
      "MACM 101"
    ],
    "offeredIn": ["Fall 2026"],
    "instructor": "Dr. Arrvindh Shriraman",
    "availabilityStatus": "Closed"
  },
  {
    "id": "CMPT 300",
    "title": "Operating Systems I",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": [
      "CMPT 225",
      "CMPT 295",
      "MACM 201"
    ],
    "offeredIn": ["Fall 2026"],
    "instructor": "Dr. Keval Vora",
    "availabilityStatus": "Open"
  },
  {
    "id": "CMPT 303",
    "title": "Operating Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 305",
    "title": "Computer Simulation and Modelling",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 307",
    "title": "Data Structures and Algorithms",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": [
      "CMPT 225",
      "MACM 201"
    ]
  },
  {
    "id": "CMPT 308",
    "title": "Computability and Complexity",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 310",
    "title": "Introduction to Artificial Intelligence",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 318",
    "title": "Special Topics in Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 320",
    "title": "Social Implications - Computerized Society",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 340",
    "title": "Biomedical Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 353",
    "title": "Computational Data Science",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 354",
    "title": "Database Systems I",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 361",
    "title": "Introduction to Visual Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 362",
    "title": "Mobile Applications Programming and Design",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 363",
    "title": "User Interface Design",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 365",
    "title": "Multimedia Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 371",
    "title": "Data Communications and Networking",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 372",
    "title": "Web II - Server-side Development",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 373",
    "title": "Software Development Methods",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 376W",
    "title": "Professional Responsibility and Technical Writing",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 379",
    "title": "Principles of Compiler Design",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 383",
    "title": "Comparative Programming Languages",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 384",
    "title": "Symbolic Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 300,
    "prerequisites": []
  },
  {
    "id": "CMPT 400",
    "title": "3D Computer Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 403",
    "title": "System Security and Privacy",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 404",
    "title": "Cryptography and Cryptographic Protocols",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 405",
    "title": "Design and Analysis of Computing Algorithms",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 406",
    "title": "Computational Geometry",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 407",
    "title": "Computational Complexity",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 409",
    "title": "Special Topics in Theoretical Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 410",
    "title": "Machine Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 411",
    "title": "Knowledge Representation",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 412",
    "title": "Computer Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 413",
    "title": "Computational Linguistics",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 415",
    "title": "Special Research Projects",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 416",
    "title": "Special Research Projects",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 417",
    "title": "Intelligent Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 419",
    "title": "Special Topics in Artificial Intelligence",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 420",
    "title": "Deep Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 426",
    "title": "Practicum I",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 427",
    "title": "Practicum II",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 428",
    "title": "Practicum III",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 429",
    "title": "Practicum IV",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 430",
    "title": "Practicum V",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 431",
    "title": "Distributed Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 433",
    "title": "Embedded Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 441",
    "title": "Computational Biology",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 450",
    "title": "Computer Architecture",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 454",
    "title": "Database Systems II",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 456",
    "title": "Information Retrieval and Web Search",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 459",
    "title": "Special Topics in Database Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 461",
    "title": "Computational Photography and Image Manipulation",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 464",
    "title": "Geometric Modelling in Computer Graphics",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 466",
    "title": "Animation",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 467",
    "title": "Visualization",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 469",
    "title": "Special Topics in Computer Graphics",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 471",
    "title": "Networking II",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 473",
    "title": "Software Testing, Reliability and Security",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 474",
    "title": "Web Systems Architecture",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 475",
    "title": "Requirements Engineering ",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 476",
    "title": "Introduction to Quantum Algorithms",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 477",
    "title": "Introduction to Formal Verification",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 478",
    "title": "Current Topics in Quantum Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 479",
    "title": "Special Topics in Computing Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 489",
    "title": "Special Topics in Programming Languages",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 493",
    "title": "Digital Media Practicum",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 494",
    "title": "Software Systems Program Capstone Project I",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 495",
    "title": "Software Systems Capstone Project II",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 496",
    "title": "Directed Studies",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 497",
    "title": "Dual Degree Program Capstone Project",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 498",
    "title": "Honours Research Project",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 499",
    "title": "Special Topics in Computer Hardware",
    "credits": 3,
    "department": "CMPT",
    "level": 400,
    "prerequisites": []
  },
  {
    "id": "CMPT 626",
    "title": "Graduate Co-op I",
    "credits": 3,
    "department": "CMPT",
    "level": 600,
    "prerequisites": []
  },
  {
    "id": "CMPT 627",
    "title": "Graduate Co-op II",
    "credits": 3,
    "department": "CMPT",
    "level": 600,
    "prerequisites": []
  },
  {
    "id": "CMPT 628",
    "title": "Graduate Co-op III",
    "credits": 3,
    "department": "CMPT",
    "level": 600,
    "prerequisites": []
  },
  {
    "id": "CMPT 629",
    "title": "Graduate Project",
    "credits": 3,
    "department": "CMPT",
    "level": 600,
    "prerequisites": []
  },
  {
    "id": "CMPT 631",
    "title": "Industrial Internship",
    "credits": 3,
    "department": "CMPT",
    "level": 600,
    "prerequisites": []
  },
  {
    "id": "CMPT 700",
    "title": "Technical Writing and Research Communication",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 701",
    "title": "Computability and Logic",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 705",
    "title": "Design and Analysis of Algorithms",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 706",
    "title": "Design and Analysis of Algorithms for Big Data",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 710",
    "title": "Computational Complexity",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 711",
    "title": "Bioinformatics Algorithms",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 713",
    "title": "Natural Language Processing",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 720",
    "title": "Robotic Autonomy: Algorithms and Computation",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 721",
    "title": "Knowledge Representation and Reasoning",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 722",
    "title": "Rendering and Visual Computing for Artificial Intelligence",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 724",
    "title": "Affective Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 726",
    "title": "Machine Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 727",
    "title": "Mathematical and Probabilistic Foundations of Machine Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 728",
    "title": "Deep Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 729",
    "title": "Reinforcement Learning",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 732",
    "title": "Big Data Lab I",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 733",
    "title": "Big Data Lab II",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 740",
    "title": "Database Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 741",
    "title": "Data Mining",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 742",
    "title": "Visual Computing Lab I",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 743",
    "title": "Visual Computing Lab II",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 750",
    "title": "Computer Architecture",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 756",
    "title": "Distributed and Cloud Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 757",
    "title": "Frontiers of Visual Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 762",
    "title": "Computer Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 763",
    "title": "Biomedical Computer Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 764",
    "title": "Geometric Modelling in Computer Graphics",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 766",
    "title": "Computer Animation and Simulation",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 767",
    "title": "Visualization",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 769",
    "title": "Computational Photography and Image Manipulation",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 770",
    "title": "Parallel and Distributed Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 771",
    "title": "Computer Networks",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 772",
    "title": "Software Product Engineering and Management",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 777",
    "title": "Formal Verification",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 780",
    "title": "Computer Security and Ethics",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 782",
    "title": "Cybersecurity Lab I",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 783",
    "title": "Cybersecurity Lab II",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 784",
    "title": "Cyber Risk Assessment and Management",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 785",
    "title": "Secure Software Design",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 786",
    "title": "Cloud and Network Security",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 787",
    "title": "Ethical Hacking",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 788",
    "title": "Information Privacy",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 789",
    "title": "Applied Cryptography",
    "credits": 3,
    "department": "CMPT",
    "level": 700,
    "prerequisites": []
  },
  {
    "id": "CMPT 800",
    "title": "3D Computer Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 813",
    "title": "Computational Geometry",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 815",
    "title": "Algorithms of Optimization",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 820",
    "title": "Multimedia Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 822",
    "title": "Computational Vision",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 827",
    "title": "Intelligent Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 828",
    "title": "Illumination in Images and Video",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 829",
    "title": "Special Topics in Bioinformatics",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 839",
    "title": "Advanced Natural Language Processing and Understanding",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 843",
    "title": "Database and Knowledge-base Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 863",
    "title": "Advanced Topics in Human-Computer Interaction",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 886",
    "title": "Special Topics in Operating Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 889",
    "title": "Special Topics in Interdisciplinary Computing",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 891",
    "title": "Advanced Seminar",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 894",
    "title": "Directed Reading",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 895",
    "title": "Master Program Extended Essay",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 896",
    "title": "MSc Course Option Portfolio",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 897",
    "title": "MSc Project",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 898",
    "title": "MSc Thesis",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 899",
    "title": "PhD Thesis",
    "credits": 3,
    "department": "CMPT",
    "level": 800,
    "prerequisites": []
  },
  {
    "id": "CMPT 980",
    "title": "Special Topics in Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "CMPT 981",
    "title": "Special Topics in Theoretical Computing Science",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "CMPT 982",
    "title": "Special Topics in Networks and Systems",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "CMPT 983",
    "title": "Special Topics in Artificial Intelligence",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "CMPT 984",
    "title": "Special Topics in Databases, Data Mining, Computational Biology",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "CMPT 985",
    "title": "Special Topics in Graphics, HCI, Visualization, Vision, Multimedia",
    "credits": 3,
    "department": "CMPT",
    "level": 900,
    "prerequisites": []
  },
  {
    "id": "MACM 101",
    "title": "Discrete Mathematics I",
    "credits": 3,
    "department": "MACM",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "MACM 201",
    "title": "Discrete Mathematics II",
    "credits": 3,
    "department": "MACM",
    "level": 200,
    "prerequisites": [
      "MACM 101",
      "CMPT 125"
    ]
  },
  {
    "id": "MATH 151",
    "title": "Calculus I",
    "credits": 3,
    "department": "MATH",
    "level": 100,
    "prerequisites": []
  },
  {
    "id": "MATH 152",
    "title": "Calculus II",
    "credits": 3,
    "department": "MATH",
    "level": 100,
    "prerequisites": [
      "MATH 151"
    ]
  },
  {
    "id": "STAT 270",
    "title": "Introduction to Probability and Statistics",
    "credits": 3,
    "department": "STAT",
    "level": 200,
    "prerequisites": [
      "MATH 152"
    ]
  }
];

export const csDegreeTemplate: DegreeTemplate = {
  major: "Computing Science BSc",
  coreRequirements: [
    "CMPT 120",
    "CMPT 125",
    "MACM 101",
    "MATH 151",
    "MATH 152",
    "CMPT 225",
    "MACM 201",
    "CMPT 295",
    "STAT 270",
    "CMPT 300",
    "CMPT 307"
  ],
  electiveCreditsCount: 15,
};

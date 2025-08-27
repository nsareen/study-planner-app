export interface CurriculumSubject {
  name: string;
  chapters: {
    name: string;
    estimatedHours: number;
    difficulty: 'easy' | 'medium' | 'hard';
    topics?: string[];
  }[];
}

export interface CurriculumSource {
  name: string;
  url: string;
  type: 'official' | 'educational_site' | 'textbook' | 'user_uploaded' | 'scraped';
  lastUpdated: string;
  reliability: 'high' | 'medium' | 'low';
}

export interface Curriculum {
  id: string;
  name: string;
  board: string;
  grade: string;
  country: string;
  description: string;
  subjects: CurriculumSubject[];
  sources: CurriculumSource[];
  lastVerified: string;
  accuracy: number; // 0-100 percentage
}

export const curricula: Curriculum[] = [
  {
    id: 'icse-9-india',
    name: 'ICSE Grade 9',
    board: 'ICSE',
    grade: '9',
    country: 'India',
    description: 'Indian Certificate of Secondary Education - Class IX',
    sources: [
      {
        name: 'BYJU\'S ICSE Class 9 Syllabus',
        url: 'https://byjus.com/icse/class-9-syllabus/',
        type: 'educational_site',
        lastUpdated: '2024-01-15',
        reliability: 'high'
      },
      {
        name: 'CISCE Official Website',
        url: 'https://cisce.org/syllabus',
        type: 'official',
        lastUpdated: '2024-02-01',
        reliability: 'high'
      },
      {
        name: 'ICSE Textbook References',
        url: 'https://cisce.org/publications',
        type: 'textbook',
        lastUpdated: '2024-01-10',
        reliability: 'high'
      }
    ],
    lastVerified: '2024-01-15',
    accuracy: 95,
    subjects: [
      {
        name: 'Mathematics',
        chapters: [
          { name: 'Rational and Irrational Numbers', estimatedHours: 8, difficulty: 'medium', topics: ['Real Numbers', 'Rational Numbers', 'Irrational Numbers', 'Operations on Real Numbers'] },
          { name: 'Compound Interest (Using Formula)', estimatedHours: 6, difficulty: 'medium', topics: ['Compound Interest Formula', 'Applications', 'Growth and Decay'] },
          { name: 'Expansions (Including Substitution)', estimatedHours: 7, difficulty: 'medium', topics: ['Algebraic Identities', '(a+b)²', '(a-b)²', 'Substitution Methods'] },
          { name: 'Factorizations', estimatedHours: 8, difficulty: 'medium', topics: ['Common Factors', 'Grouping', 'Difference of Squares', 'Perfect Squares'] },
          { name: 'Simultaneous (Linear) Equations (Including Problems)', estimatedHours: 10, difficulty: 'hard', topics: ['Elimination Method', 'Substitution Method', 'Cross Multiplication', 'Word Problems'] },
          { name: 'Indices (Exponents)', estimatedHours: 6, difficulty: 'medium', topics: ['Laws of Indices', 'Negative Indices', 'Fractional Indices'] },
          { name: 'Logarithms', estimatedHours: 8, difficulty: 'hard', topics: ['Definition of Logarithms', 'Properties', 'Common and Natural Logs', 'Applications'] },
          { name: 'Triangles [Congruency in Triangles]', estimatedHours: 12, difficulty: 'medium', topics: ['Congruence Rules', 'SSS, SAS, ASA, RHS', 'Properties of Triangles'] },
          { name: 'Mid-point and Its Converse [Including Intercept Theorem]', estimatedHours: 6, difficulty: 'medium', topics: ['Mid-point Theorem', 'Converse', 'Basic Proportionality Theorem'] },
          { name: 'Quadrilaterals [Parallelograms, Rectangle, Rhombus, Square, Trapezium]', estimatedHours: 10, difficulty: 'medium', topics: ['Properties of Parallelograms', 'Special Quadrilaterals', 'Trapezium'] },
          { name: 'Rectilinear Figures [Quadrilaterals: Rhombus, Rectangle, Square]', estimatedHours: 8, difficulty: 'medium', topics: ['Area and Perimeter', 'Properties', 'Constructions'] },
          { name: 'Area and Perimeter of Plane Figures', estimatedHours: 8, difficulty: 'easy', topics: ['Triangle', 'Quadrilateral', 'Circle', 'Composite Figures'] },
          { name: 'Statistics', estimatedHours: 10, difficulty: 'medium', topics: ['Collection of Data', 'Frequency Distribution', 'Histogram', 'Frequency Polygon'] },
          { name: 'Mean and Median [Arithmetic Mean]', estimatedHours: 6, difficulty: 'easy', topics: ['Arithmetic Mean', 'Median', 'Mode', 'Applications'] }
        ]
      },
      {
        name: 'Physics',
        chapters: [
          { name: 'Measurements and Experimentation', estimatedHours: 8, difficulty: 'easy' },
          { name: 'Motion in One Dimension', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Laws of Motion', estimatedHours: 12, difficulty: 'hard' },
          { name: 'Fluids', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Heat and Energy', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Light', estimatedHours: 12, difficulty: 'medium' },
          { name: 'Sound', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Electricity and Magnetism', estimatedHours: 14, difficulty: 'hard' }
        ]
      },
      {
        name: 'Chemistry',
        chapters: [
          { name: 'The Language of Chemistry', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Chemical Changes and Reactions', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Water', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Atomic Structure and Chemical Bonding', estimatedHours: 10, difficulty: 'hard' },
          { name: 'The Periodic Table', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Study of Gas Laws', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Atmospheric Pollution', estimatedHours: 4, difficulty: 'easy' }
        ]
      },
      {
        name: 'Biology',
        chapters: [
          { name: 'Introducing Biology', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Cell - The Unit of Life', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Tissues', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Plant Life', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Human Body', estimatedHours: 12, difficulty: 'medium' },
          { name: 'Digestive System', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Respiratory System', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Circulatory System', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Excretory System', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Nervous System', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Sense Organs', estimatedHours: 6, difficulty: 'medium' }
        ]
      },
      {
        name: 'English',
        chapters: [
          { name: 'Reading Comprehension', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Grammar and Usage', estimatedHours: 12, difficulty: 'medium' },
          { name: 'Composition Writing', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Literature - Poetry', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Literature - Prose', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Literature - Drama', estimatedHours: 8, difficulty: 'medium' }
        ]
      },
      {
        name: 'History',
        chapters: [
          { name: 'The Harappan Civilization', estimatedHours: 6, difficulty: 'easy' },
          { name: 'The Vedic Age', estimatedHours: 6, difficulty: 'medium' },
          { name: 'The Age of Buddha and Mahavira', estimatedHours: 6, difficulty: 'medium' },
          { name: 'The Mauryan Empire', estimatedHours: 8, difficulty: 'medium' },
          { name: 'The Gupta Empire', estimatedHours: 6, difficulty: 'medium' },
          { name: 'The Mughal Empire', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Composite Culture', estimatedHours: 4, difficulty: 'easy' }
        ]
      },
      {
        name: 'Geography',
        chapters: [
          { name: 'Our Earth', estimatedHours: 6, difficulty: 'easy' },
          { name: 'The Atmosphere', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Water Bodies', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Minerals and Mining', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Industries', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Transport and Communication', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Human Resources', estimatedHours: 6, difficulty: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'cbse-9-india',
    name: 'CBSE Grade 9',
    board: 'CBSE',
    grade: '9',
    country: 'India',
    description: 'Central Board of Secondary Education - Class IX',
    sources: [
      {
        name: 'BYJU\'S CBSE Class 9 Syllabus',
        url: 'https://byjus.com/cbse/class-9-syllabus/',
        type: 'educational_site',
        lastUpdated: '2024-01-20',
        reliability: 'high'
      },
      {
        name: 'CBSE Official Academic Website',
        url: 'https://cbseacademic.nic.in/curriculum_2025.html',
        type: 'official',
        lastUpdated: '2024-02-01',
        reliability: 'high'
      },
      {
        name: 'NCERT Syllabus Framework',
        url: 'https://ncert.nic.in/',
        type: 'official',
        lastUpdated: '2024-01-25',
        reliability: 'high'
      }
    ],
    lastVerified: '2024-01-20',
    accuracy: 98,
    subjects: [
      {
        name: 'Mathematics',
        chapters: [
          { name: 'Number Systems', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Polynomials', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Coordinate Geometry', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Linear Equations in Two Variables', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Introduction to Euclid\'s Geometry', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Lines and Angles', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Triangles', estimatedHours: 12, difficulty: 'medium' },
          { name: 'Quadrilaterals', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Areas of Parallelograms and Triangles', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Circles', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Constructions', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Heron\'s Formula', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Surface Areas and Volumes', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Statistics', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Probability', estimatedHours: 4, difficulty: 'easy' }
        ]
      },
      {
        name: 'Science',
        chapters: [
          { name: 'Matter in Our Surroundings', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Is Matter Around Us Pure', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Atoms and Molecules', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Structure of the Atom', estimatedHours: 6, difficulty: 'medium' },
          { name: 'The Fundamental Unit of Life', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Tissues', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Diversity in Living Organisms', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Motion', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Force and Laws of Motion', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Gravitation', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Work and Energy', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Sound', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Why Do We Fall Ill', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Natural Resources', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Improvement in Food Resources', estimatedHours: 6, difficulty: 'medium' }
        ]
      },
      {
        name: 'Social Science',
        chapters: [
          { name: 'The French Revolution', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Socialism in Europe and the Russian Revolution', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Nazism and the Rise of Hitler', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Forest Society and Colonialism', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Pastoralists in the Modern World', estimatedHours: 6, difficulty: 'medium' },
          { name: 'India - Size and Location', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Physical Features of India', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Drainage', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Climate', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Natural Vegetation and Wild Life', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Population', estimatedHours: 6, difficulty: 'easy' },
          { name: 'What is Democracy? Why Democracy?', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Constitutional Design', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Electoral Politics', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Working of Institutions', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Democratic Rights', estimatedHours: 6, difficulty: 'medium' },
          { name: 'The Story of Village Palampur', estimatedHours: 6, difficulty: 'easy' },
          { name: 'People as Resource', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Poverty as a Challenge', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Food Security in India', estimatedHours: 6, difficulty: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'igcse-9-international',
    name: 'IGCSE Year 10',
    board: 'Cambridge IGCSE',
    grade: '9-10',
    country: 'International',
    description: 'Cambridge International General Certificate of Secondary Education',
    subjects: [
      {
        name: 'Mathematics',
        chapters: [
          { name: 'Number', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Algebra and Graphs', estimatedHours: 12, difficulty: 'medium' },
          { name: 'Coordinate Geometry', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Geometry', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Mensuration', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Trigonometry', estimatedHours: 10, difficulty: 'hard' },
          { name: 'Matrices and Transformations', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Probability', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Statistics', estimatedHours: 6, difficulty: 'easy' }
        ]
      },
      {
        name: 'Physics',
        chapters: [
          { name: 'General Physics', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Thermal Physics', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Properties of Waves', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Light', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Sound', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Electricity and Magnetism', estimatedHours: 12, difficulty: 'hard' },
          { name: 'Atomic Physics', estimatedHours: 6, difficulty: 'hard' }
        ]
      },
      {
        name: 'Chemistry',
        chapters: [
          { name: 'The Particulate Nature of Matter', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Experimental Techniques', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Atoms, Elements and Compounds', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Stoichiometry', estimatedHours: 10, difficulty: 'hard' },
          { name: 'Electricity and Chemistry', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Chemical Energetics', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Chemical Reactions', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Acids, Bases and Salts', estimatedHours: 8, difficulty: 'medium' },
          { name: 'The Periodic Table', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Metals', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Air and Water', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Sulfur', estimatedHours: 4, difficulty: 'medium' },
          { name: 'Carbonates', estimatedHours: 4, difficulty: 'medium' },
          { name: 'Organic Chemistry', estimatedHours: 10, difficulty: 'hard' }
        ]
      },
      {
        name: 'Biology',
        chapters: [
          { name: 'Characteristics and Classification of Living Organisms', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Organisation and Maintenance of the Organism', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Movement in and out of Cells', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Biological Molecules', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Enzymes', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Plant Nutrition', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Human Nutrition', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Transport in Plants', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Transport in Humans', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Diseases and Immunity', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Gas Exchange in Humans', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Respiration', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Excretion in Humans', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Coordination and Response', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Drugs', estimatedHours: 4, difficulty: 'easy' },
          { name: 'Reproduction', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Inheritance', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Variation and Selection', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Organisms and their Environment', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Biotechnology and Genetic Engineering', estimatedHours: 6, difficulty: 'hard' },
          { name: 'Human Influences on Ecosystems', estimatedHours: 6, difficulty: 'medium' }
        ]
      },
      {
        name: 'English',
        chapters: [
          { name: 'Reading and Understanding', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Directed Writing and Narrative Writing', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Descriptive and Argumentative Writing', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Summary Writing', estimatedHours: 6, difficulty: 'hard' },
          { name: 'Poetry Analysis', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Prose Analysis', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Drama Study', estimatedHours: 6, difficulty: 'medium' }
        ]
      }
    ],
    sources: [{
      name: 'Cambridge Assessment',
      url: 'https://cambridge.org/',
      type: 'official' as const,
      lastUpdated: new Date().toISOString(),
      reliability: 'high' as const
    }],
    lastVerified: new Date().toISOString(),
    accuracy: 95
  },
  {
    id: 'scottish-high-9',
    name: 'Scottish High International School - Grade 9',
    board: 'Scottish International',
    grade: '9',
    country: 'International',
    description: 'Scottish Curriculum for Excellence - S2/S3 Level',
    subjects: [
      {
        name: 'Mathematics',
        chapters: [
          { name: 'Number and Number Processes', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Money, Time and Measurement', estimatedHours: 6, difficulty: 'easy' },
          { name: 'Information Handling', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Shape, Position and Movement', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Patterns and Relationships', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Expressions and Formulae', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Relationships', estimatedHours: 10, difficulty: 'hard' },
          { name: 'Multiples, Factors and Primes', estimatedHours: 6, difficulty: 'easy' }
        ]
      },
      {
        name: 'Sciences',
        chapters: [
          { name: 'Planet Earth - Biodiversity and Interdependence', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Planet Earth - Energy in the Environment', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Planet Earth - Processes of the Planet', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Forces, Electricity and Waves - Forces', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Forces, Electricity and Waves - Electricity', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Forces, Electricity and Waves - Waves', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Biological Systems - Body Systems and Cells', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Biological Systems - Inheritance', estimatedHours: 6, difficulty: 'hard' },
          { name: 'Materials - Chemical Changes and Structure', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Materials - Nature\'s Chemistry', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Topical Science', estimatedHours: 4, difficulty: 'easy' }
        ]
      },
      {
        name: 'English',
        chapters: [
          { name: 'Reading for Understanding, Analysis and Evaluation', estimatedHours: 10, difficulty: 'medium' },
          { name: 'Critical Reading - Scottish Text', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Critical Reading - Critical Essay', estimatedHours: 8, difficulty: 'hard' },
          { name: 'Portfolio Writing - Creative Writing', estimatedHours: 8, difficulty: 'medium' },
          { name: 'Portfolio Writing - Discursive Writing', estimatedHours: 6, difficulty: 'medium' },
          { name: 'Listening and Talking', estimatedHours: 4, difficulty: 'easy' }
        ]
      },
      {
        name: 'Social Studies',
        chapters: [
          { name: 'People, Place and Environment', estimatedHours: 8, difficulty: 'medium' },
          { name: 'People, Past Events and Societies', estimatedHours: 10, difficulty: 'medium' },
          { name: 'People in Society, Economy and Business', estimatedHours: 8, difficulty: 'medium' }
        ]
      }
    ],
    sources: [{
      name: 'Scottish Qualifications Authority',
      url: 'https://www.sqa.org.uk/',
      type: 'official' as const,
      lastUpdated: new Date().toISOString(),
      reliability: 'high' as const
    }],
    lastVerified: new Date().toISOString(),
    accuracy: 95
  }
];

export const getPopularSubjects = () => {
  const subjectCount: Record<string, number> = {};
  
  curricula.forEach(curriculum => {
    curriculum.subjects.forEach(subject => {
      subjectCount[subject.name] = (subjectCount[subject.name] || 0) + 1;
    });
  });
  
  return Object.keys(subjectCount)
    .sort((a, b) => subjectCount[b] - subjectCount[a])
    .slice(0, 20);
};

export const getChapterSuggestions = (subjectName: string): string[] => {
  const suggestions: Set<string> = new Set();
  
  curricula.forEach(curriculum => {
    const subject = curriculum.subjects.find(s => 
      s.name.toLowerCase().includes(subjectName.toLowerCase()) ||
      subjectName.toLowerCase().includes(s.name.toLowerCase())
    );
    
    if (subject) {
      subject.chapters.forEach(chapter => {
        suggestions.add(chapter.name);
      });
    }
  });
  
  return Array.from(suggestions).slice(0, 15);
};

export const getCurriculumById = (id: string): Curriculum | undefined => {
  return curricula.find(c => c.id === id);
};

export const searchCurricula = (query: string): Curriculum[] => {
  const lowerQuery = query.toLowerCase();
  return curricula.filter(curriculum => 
    curriculum.name.toLowerCase().includes(lowerQuery) ||
    curriculum.board.toLowerCase().includes(lowerQuery) ||
    curriculum.country.toLowerCase().includes(lowerQuery) ||
    curriculum.description.toLowerCase().includes(lowerQuery)
  );
};
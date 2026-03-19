export interface ExperienceEntry {
  avatar: string;
  role: string;
  company: string;
  companyUrl?: string;
  companyDesc: string;
  dates: string;
  location: string;
  lat: number;
  lon: number;
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  label: string;
  skills: string[];
}

export interface ProjectEntry {
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}

export interface EducationEntry {
  degree: string;
  school: string;
  schoolUrl?: string;
  schoolDesc: string;
  detail: string;
  years: string;
  location: string;
  lat: number;
  lon: number;
  avatar: string;
}

export interface MetaCard {
  label: string;
  value: string;
  isHtml?: boolean;
}

export const bio: string[] = [
  'I build things that don\'t exist yet. Over two decades across the Intelligence Community, the military, cybersecurity, insurance, and AI, the constant has been the same — find the problem no one knows how to frame and build what solves it. I don\'t follow domains. I follow the edge.',
  'Twenty-six years in and I\'ve kept my hands on the keyboard by design. I can operate at any scale, from a team of one to organizations of thousands, but I do my best work building — staying ahead by doing. Right now that means autonomous multi-agent systems, on-prem AI rivaling frontier models, knowledge graphs that pull signal from noise, and inference engines that run where the data lives.',
  'Off the clock — married over twenty years, raising two sons headed toward military commissions, two dogs running the house, and a lifelong metalhead. Covered in tattoos that aren\'t for everyone, but they\'re for me. I believe we\'re accelerating toward something most people aren\'t ready to talk about yet. If you\'re building at the boundary of what\'s possible, we should connect.'
];

export const metaCards: MetaCard[] = [
  {
    label: 'Current Roles',
    value: '<strong>CTO, R&D</strong> — Clarity Innovations<br><strong>CEO</strong> — Talon Black',
    isHtml: true
  },
  {
    label: 'Background',
    value: '<strong>Intelligence Community</strong><br>U.S. Army · NSA · Private Sector',
    isHtml: true
  },
  {
    label: 'Focus Areas',
    value: 'Multi-Agent Swarms · On-Prem Frontier AI · Knowledge Graphs · Edge Inference · Autonomous Systems'
  },
  {
    label: 'Contact',
    value: '<a href="mailto:iannelsondev@proton.me" style="color:var(--cyan);text-decoration:none;">iannelsondev@proton.me</a>',
    isHtml: true
  }
];

export const experience: ExperienceEntry[] = [
  {
    avatar: 'C',
    role: 'CTO, R&D',
    company: 'Clarity Innovations',
    companyUrl: 'https://clarityinnovates.com',
    companyDesc: 'Intelligence Community services and technology company delivering mission-critical solutions across the national security enterprise.',
    dates: 'JUL 2023 – PRESENT',
    location: '6940 Columbia Gateway Dr, Columbia, MD',
    lat: 39.1757, lon: -76.8386,
    bullets: [
      'Led R&D organization and built the Labs division from the ground up',
      'Shipped novel product capabilities; managed P&L and org growth strategy',
      'Drove technical vision across AI/ML-assisted intelligence workflows'
    ]
  },
  {
    avatar: 'T',
    role: 'CEO',
    company: 'Talon Black',
    companyUrl: 'https://talonblack.com',
    companyDesc: 'AI/ML-assisted risk intelligence platform. Autonomous analysis, multi-agent swarm architectures, and derived value generation for enterprise clients.',
    dates: 'JUN 2023 – PRESENT',
    location: 'Severna Park, MD (Remote)',
    lat: 39.0703, lon: -76.5452,
    bullets: [
      'Founded and scaled AI/ML-assisted risk solutions platform',
      'Automated analysis pipelines delivering derived value for clients worldwide',
      'Full P&L ownership; business development, product, and engineering leadership'
    ]
  },
  {
    avatar: 'Co',
    role: 'Insurance Operations Strategist',
    company: 'Coalition, Inc.',
    companyUrl: 'https://www.coalitioninc.com',
    companyDesc: 'Active cyber insurance and security company combining insurance with cybersecurity technology to manage and mitigate digital risk.',
    dates: 'DEC 2021 – JUL 2023',
    location: '1160 Battery St, San Francisco, CA',
    lat: 37.7983, lon: -122.4009,
    bullets: [
      'Applied technologist embedding engineering capability into insurance operations',
      'Delivered $250M GWP ROI through process automation and tooling'
    ]
  },
  {
    avatar: 'Co',
    role: 'Senior Principal Engineer',
    companyUrl: 'https://www.coalitioninc.com',
    company: 'Coalition, Inc.',
    companyDesc: 'Active cyber insurance and security company combining insurance with cybersecurity technology to manage and mitigate digital risk.',
    dates: 'MAR 2018 – DEC 2021',
    location: '1160 Battery St, San Francisco, CA',
    lat: 37.7983, lon: -122.4009,
    bullets: [
      'Lead principal engineer across 3 VPE rotations; maintained architectural continuity',
      'Built automated renewals platform handling $100M+ in gross written premium',
      'Led BinaryEdge M&A technical integration and due diligence'
    ]
  },
  {
    avatar: 'CI',
    role: 'Board of Advisors',
    companyUrl: 'https://clarityinnovates.com',
    company: 'Clarity Innovations',
    companyDesc: 'Technology services company focused on IC and defense programs, specializing in agile software development and systems integration.',
    dates: 'JUN 2015 – AUG 2020',
    location: '7170 Riverwood Dr, Hanover, MD',
    lat: 39.1753, lon: -76.7267,
    bullets: [
      'Provided technology roadmap guidance and strategic direction',
      'Supported contract acquisition and business development within the IC'
    ]
  },
  {
    avatar: '—',
    role: 'Infrastructure Lead',
    company: '[Redacted]',
    companyDesc: 'Private sector intelligence and analysis firm.',
    dates: 'AUG 2016 – APR 2018',
    location: 'Elkridge, MD',
    lat: 39.2126, lon: -76.7136,
    bullets: [
      'Led data center buildout and physical infrastructure architecture',
      'JAMF-based macOS/iOS fleet management; CI/CD pipeline implementation'
    ]
  },
  {
    avatar: 'I',
    companyUrl: 'https://www.ironnet.com',
    role: 'Senior Software Architect',
    company: 'IronNet Cybersecurity',
    companyDesc: 'Network detection and response company founded by former NSA Director Gen. Keith Alexander. Real-time behavioral analytics on network traffic.',
    dates: 'OCT 2014 – JUL 2016',
    location: '8135 Maple Lawn Blvd, Fulton, MD',
    lat: 39.1455, lon: -76.9081,
    bullets: [
      'Designed streaming analytics infrastructure on Kafka and Spark',
      'Built first-product network behavior visualization UI',
      'Established frontend architecture standards for the founding engineering team'
    ]
  },
  {
    avatar: 'N',
    companyUrl: 'https://www.nsa.gov',
    role: 'Principal Engineer / Technical Director',
    company: 'NSA',
    companyDesc: 'National Security Agency — signals intelligence and information assurance for the United States Government.',
    dates: 'APR 2012 – OCT 2014',
    location: 'Fort George G. Meade, MD',
    lat: 39.1086, lon: -76.7711,
    bullets: [
      'Led OWF/OZONE teams and the IC Application Mall under IC ITE',
      'Architected internet-scale multi-agency application distribution infrastructure',
      'Conducted SDN research and prototyping for next-generation network architecture'
    ]
  },
  {
    avatar: 'A',
    companyUrl: 'https://www.akimeka.com',
    role: 'Senior Technical Consultant',
    company: 'Akimeka',
    companyDesc: 'Defense contractor providing technology services and solutions to DoD and intelligence community clients in the Pacific theater.',
    dates: 'AUG 2011 – APR 2012',
    location: 'Kunia, Hawaii',
    lat: 21.4561, lon: -158.0148,
    bullets: [
      'Built HTML5 real-time spectrum analyzer for DoD client',
      'Prototyped geospatial analytics on Hadoop/Accumulo stack'
    ]
  },
  {
    avatar: 'T',
    role: 'Software Engineer',
    company: 'TexelTek',
    companyDesc: 'Small technology firm delivering web application frameworks and analyst tools to the intelligence community.',
    dates: 'JAN 2009 – JUL 2011',
    location: 'Kunia, Hawaii',
    lat: 21.4561, lon: -158.0148,
    bullets: [
      'Developed OZONE Widget Framework and RT-RG analyst suite',
      'Scaled platform to 300+ concurrent analyst users'
    ]
  },
  {
    avatar: 'US',
    companyUrl: 'https://en.wikipedia.org/wiki/500th_Military_Intelligence_Brigade_(United_States)',
    role: 'Signals Intelligence Analyst',
    company: 'U.S. Army — 500th MI BDE',
    companyDesc: 'NSA/CSS Hawaii — signals intelligence collection and analysis supporting national and theater intelligence requirements in the Pacific.',
    dates: '2002 – 2007',
    location: 'Schofield Barracks, Hawaii (500th MI BDE)',
    lat: 21.4939, lon: -158.0653,
    bullets: [
      'Performed SIGINT collection and analysis; recognized for mission impact',
      'Developed mission automation tools that accelerated analyst workflows',
      'Led intelligence restructuring effort across assigned mission sets'
    ]
  }
];

export const skillCategories: SkillCategory[] = [
  {
    id: 'ai',
    label: 'AI & Agents',
    skills: ['Multi-Agent Swarms', 'vLLM', 'ONNX', 'Edge Inference', 'Autonomous Systems', 'LLM Orchestration', 'RAG']
  },
  {
    id: 'graph',
    label: 'Knowledge Graphs',
    skills: ['SurrealDB', 'Neo4j', 'Entity Resolution', 'Ontology', 'Graph Reasoning', 'Embeddings']
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    skills: ['Kubernetes', 'Bare Metal GPU', 'Docker', 'Flux/GitOps', 'Terraform', 'Kafka', 'Helm']
  },
  {
    id: 'lang',
    label: 'Languages',
    skills: ['Go', 'Python', 'TypeScript', 'Java', 'SvelteKit', 'gRPC', 'React']
  },
  {
    id: 'intel',
    label: 'Intelligence',
    skills: ['SIGINT', 'Threat Modeling', 'Risk Analysis', 'NIST 800-53', 'Vulnerability Research']
  },
  {
    id: 'lead',
    label: 'Leadership',
    skills: ['R&D Orgs', 'M&A', 'P&L Management', 'Board Strategy', 'Team Scaling']
  }
];

export const projects: ProjectEntry[] = [
  {
    title: 'VIPR',
    description: 'Autonomous knowledge graph construction platform. Multi-agent pipeline orchestrates LLM-powered entity extraction, ontology building, and graph enrichment. On-prem vLLM inference, ONNX edge models, Kafka-driven task routing. Go + SvelteKit + SurrealDB.'
  },
  {
    title: 'Talon Black',
    description: 'Autonomous risk intelligence platform. Multi-agent swarm architecture for continuous threat analysis, automated reporting, and derived value generation. On-prem inference with open-weight models, graph-enabled reasoning, edge deployment.',
    link: 'https://talonblack.io',
    linkLabel: 'Visit Talon Black'
  },
  {
    title: 'OZONE Widget Framework',
    description: 'Open-source web application integration framework deployed across the Intelligence Community, DoD, and civilian agencies. Led development as NSA Technical Director, enabling inter-application communication at IC scale.'
  },
  {
    title: 'IC ITE Applications Mall',
    description: 'Central application catalog for the Intelligence Community IT Enterprise. Internet-scale elastic architecture providing multi-agency access to mission applications across the IC.'
  },
  {
    title: 'DARKMIST',
    description: 'Web desktop environment for business, intelligence, and analytic workflows. Rich multi-application workspace with inter-app communication and state management.'
  }
];

export const education: EducationEntry[] = [
  {
    avatar: 'UM',
    degree: 'B.S. Computer Science',
    school: 'University of Maryland Global Campus',
    schoolUrl: 'https://www.umgc.edu',
    schoolDesc: 'Public university within the University System of Maryland, specializing in online and distance education for working adults and military-affiliated students.',
    detail: '3.8 GPA · Upsilon Pi Epsilon Honor Society · Dean\'s Award',
    years: '2010 – 2014',
    location: 'Adelphi, MD',
    lat: 38.9829, lon: -76.9718
  },
  {
    avatar: 'AT',
    degree: 'Computer Science',
    school: 'Arkansas Tech University',
    schoolUrl: 'https://www.atu.edu',
    schoolDesc: 'Public university in Russellville, Arkansas. Attended while working full-time as campus IT staff. Focused on CS core and electrical engineering electives.',
    detail: '3.8 GPA · IEEE / ACM Member',
    years: '2007 – 2008',
    location: 'Russellville, AR',
    lat: 35.2784, lon: -93.1338
  },
  {
    avatar: 'AS',
    degree: 'Computer Science',
    school: 'Arkansas School for Mathematics, Sciences and the Arts',
    schoolUrl: 'https://www.asmsa.org',
    schoolDesc: 'One of sixteen public residential high schools in the country for gifted students with aptitude in STEM. Created by the Arkansas Legislature in 1991.',
    detail: '3.9 GPA · Intel ISEF Finalist · Computer Programming Team',
    years: '1998 – 2000',
    location: 'Hot Springs, AR',
    lat: 34.5037, lon: -93.0552
  }
];

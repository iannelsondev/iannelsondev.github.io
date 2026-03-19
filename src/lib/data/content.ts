export interface ExperienceEntry {
  avatar: string;
  role: string;
  company: string;
  dates: string;
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
  detail: string;
  years: string;
}

export interface MetaCard {
  label: string;
  value: string;
  isHtml?: boolean;
}

export const bio: string[] = [
  'Agentic orchestrator. Two decades of building systems that think, act, and adapt — from signals intelligence automation at NSA to autonomous multi-agent swarms running on bare metal today. Everything I build leans into the edge: on-prem AI that matches frontier models, knowledge graph pipelines that turn noise into structure, and inference systems that run where the data lives.',
  'The through-line: making machines do the hard work. SIGINT automation in the Army. Streaming analytics at IronNet. Automated underwriting at Coalition that drove $250M in GWP. Now: orchestrating autonomous agent systems, deploying open-weight models on GPU clusters, and building knowledge graphs that make LLMs actually useful.',
  'CTO at Clarity running R&D. CEO of Talon Black building AI-driven risk platforms. Every day is about pushing the boundary of what you can run on your own hardware — multi-agent coordination, edge inference, graph-enabled reasoning — without sending a single token to someone else\'s API.'
];

export const metaCards: MetaCard[] = [
  {
    label: 'Current Roles',
    value: '<strong>CTO, R&D</strong> — Clarity<br><strong>CEO</strong> — Talon Black',
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
    company: 'Clarity',
    dates: 'JUL 2023 – PRESENT',
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
    dates: 'JUN 2023 – PRESENT',
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
    dates: 'DEC 2021 – JUL 2023',
    bullets: [
      'Applied technologist embedding engineering capability into insurance operations',
      'Delivered $250M GWP ROI through process automation and tooling'
    ]
  },
  {
    avatar: 'Co',
    role: 'Senior Principal Engineer',
    company: 'Coalition, Inc.',
    dates: 'MAR 2018 – DEC 2021',
    bullets: [
      'Lead principal engineer across 3 VPE rotations; maintained architectural continuity',
      'Built automated renewals platform handling $100M+ in gross written premium',
      'Led BinaryEdge M&A technical integration and due diligence'
    ]
  },
  {
    avatar: 'CI',
    role: 'Board of Advisors',
    company: 'Clarity Innovations',
    dates: 'JUN 2015 – AUG 2020',
    bullets: [
      'Provided technology roadmap guidance and strategic direction',
      'Supported contract acquisition and business development within the IC'
    ]
  },
  {
    avatar: '—',
    role: 'Infrastructure Lead',
    company: '[Redacted]',
    dates: 'AUG 2016 – APR 2018',
    bullets: [
      'Led data center buildout and physical infrastructure architecture',
      'JAMF-based macOS/iOS fleet management; CI/CD pipeline implementation'
    ]
  },
  {
    avatar: 'I',
    role: 'Senior Software Architect',
    company: 'IronNet Cybersecurity',
    dates: 'OCT 2014 – JUL 2016',
    bullets: [
      'Designed streaming analytics infrastructure on Kafka and Spark',
      'Built first-product network behavior visualization UI',
      'Established frontend architecture standards for the founding engineering team'
    ]
  },
  {
    avatar: 'N',
    role: 'Principal Engineer / Technical Director',
    company: 'NSA',
    dates: 'APR 2012 – OCT 2014',
    bullets: [
      'Led OWF/OZONE teams and the IC Application Mall under IC ITE',
      'Architected internet-scale multi-agency application distribution infrastructure',
      'Conducted SDN research and prototyping for next-generation network architecture'
    ]
  },
  {
    avatar: 'A',
    role: 'Senior Technical Consultant',
    company: 'Akimeka',
    dates: 'AUG 2011 – APR 2012',
    bullets: [
      'Built HTML5 real-time spectrum analyzer for DoD client',
      'Prototyped geospatial analytics on Hadoop/Accumulo stack'
    ]
  },
  {
    avatar: 'T',
    role: 'Software Engineer',
    company: 'TexelTek',
    dates: 'JAN 2009 – JUL 2011',
    bullets: [
      'Developed OZONE Widget Framework and RT-RG analyst suite',
      'Scaled platform to 300+ concurrent analyst users'
    ]
  },
  {
    avatar: 'US',
    role: 'Signals Intelligence Analyst',
    company: 'U.S. Army / NSA Hawaii',
    dates: '2002 – 2007',
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
    degree: 'B.S. Computer Science',
    school: 'University of Maryland Global Campus',
    detail: '3.8 GPA · Upsilon Pi Epsilon Honor Society',
    years: '2010 – 2014'
  },
  {
    degree: 'Computer Science',
    school: 'Arkansas Tech University',
    detail: '3.8 GPA · IEEE / ACM Member',
    years: '2007 – 2008'
  },
  {
    degree: 'Arkansas School for Mathematics, Sciences and the Arts',
    school: 'Residential Honors Program',
    detail: '3.9 GPA · Intel ISEF Finalist',
    years: '1998 – 2000'
  }
];

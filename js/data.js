// =====================================================================
// SITE CONTENT. Edit this file only; all pages render from it.
//
// To add an item, copy an existing object in the relevant array and
// edit its fields. Detail pages (education.html?id=..., publication.html?id=...)
// are generated automatically from the `id` field.
// =====================================================================

const SITE = {
  meta: {
    name: "Armin Ghayur Sadigh",
    shortName: "A. Ghayur Sadigh",
    role: "Geomatics GIS · PhD Researcher",
    location: "Calgary, Alberta, Canada",
    coords: "51.0447° N · 114.0719° W",
  },

  about: {
    eyebrow: "DATUM / WGS84",
    heading: "Measuring how environments shape health.",
    paragraphs: [
      "I am a PhD researcher in Geomatics (GIS) at the University of Calgary, working with the Healthy City Lab. My research quantifies environmental exposure, greenspace in particular, by fusing street-level imagery, satellite indices, and GPS trajectory data into cohort-scale statistical evidence.",
      "My toolkit spans applied deep learning, geospatial data engineering, and high-performance computing: from PyTorch segmentation models and Google Earth Engine pipelines to SLURM-coordinated GPU jobs processing city-scale imagery.",
      "Before Calgary, I built optimized deep-learning models for natural-hazard susceptibility mapping (landslides and snow avalanches), combining neural architectures with meta-heuristic optimization.",
    ],
    tags: ["Applied AI & Deep Learning", "Geospatial Data Analytics", "Trajectory Analysis", "Agent-Based Simulation", "Spatial Optimization"],
  },

  // -------------------------------------------------------------------
  // EDUCATION. `detail` feeds education.html?id=<id>
  // logo: path under assets/logos/ (falls back to monogram if missing)
  // -------------------------------------------------------------------
  education: [
    {
      id: "phd-ucalgary",
      degree: "Ph.D. in Geomatics, Geospatial Information Systems",
      institution: "University of Calgary",
      monogram: "UC",
      logo: "assets/logos/ucalgary.png",
      place: "Calgary, Canada",
      coords: "51.0775° N · 114.1335° W",
      period: "2023 - Present",
      gpa: "4.0 / 4.0",
      summary: "Quantification of environmental exposure (greenspace), trajectory analysis, and cohort-based statistical inference. Expected graduation Aug. 2027.",
      detail: {
        focus: "Quantification of environmental exposure (specifically greenspace), combining street-level Green View Index (GVI), satellite NDVI, GPS trajectory analysis, and cohort-based statistical inference for digital health research.",
        skills: [
          "Deep learning for image segmentation (PyTorch)",
          "Google Earth Engine & multimodal remote sensing fusion",
          "GPS trajectory processing: stop detection, segmentation, signal-loss handling",
          "HPC workload design: SLURM, multi-GPU coordination, checkpointing",
          "Scalable Python package architecture & CLI tooling",
          "Cohort-based statistical inference & exposure modeling",
        ],
        highlights: [
          "President's Doctoral Recruitment Scholarship in Transdisciplinary Research (2023)",
          "2nd place, best research presentation, GoGeomatics Expo 2023",
          "Graduate research mentor, Healthy City Lab (Summers 2024 & 2025)",
          "Teaching assistant & co-instructor: C++ Programming, Photogrammetry",
        ],
      },
    },
    {
      id: "msc-kntu",
      degree: "M.Sc. in Geomatics, Geospatial Information Systems",
      institution: "K. N. Toosi University of Technology",
      monogram: "KN",
      logo: "assets/logos/kntu.png",
      place: "Tehran, Iran",
      coords: "35.7626° N · 51.4128° E",
      period: "2019 - 2022",
      gpa: "3.77 / 4.0",
      summary: "Thesis: “Landslide Susceptibility Assessment using Deep Learning”, optimizing deep-learning architectures for geospatial susceptibility mapping.",
      detail: {
        focus: "Optimizing deep-learning architectures for geospatial susceptibility mapping, with a thesis on landslide susceptibility assessment.",
        skills: [
          "Deep-learning model design & hyperparameter optimization (Keras/TensorFlow, Optuna)",
          "Meta-heuristic optimization algorithms",
          "Geospatial feature engineering for natural-hazard modeling",
          "Remote sensing & terrain analysis",
          "Scientific writing & peer review",
        ],
        highlights: [
          "Ranked 10th nationwide in the Iranian M.Sc. entrance exam (Konkour), 2019",
          "Research assistant, KNTU (2020 - 2022)",
          "Research assistant, Korea Institute of Geoscience and Mineral Resources, KIGAM (2022 - 2023)",
          "Two journal publications derived from this research line",
        ],
      },
    },
    {
      id: "bsc-znu",
      degree: "B.Sc. in Civil & Geomatics Engineering",
      institution: "Zanjan University",
      monogram: "ZU",
      logo: "assets/logos/znu.png",
      place: "Zanjan, Iran",
      coords: "36.6849° N · 48.4807° E",
      period: "2015 - 2019",
      gpa: "3.73 / 4.0",
      summary: "Foundations of surveying, photogrammetry, and geospatial engineering.",
      detail: {
        focus: "Core geomatics engineering: surveying, geodesy, photogrammetry, and GIS fundamentals within a civil engineering framework.",
        skills: [
          "Field surveying & instrumentation",
          "Photogrammetry & cartography",
          "GIS fundamentals (ArcGIS, QGIS)",
          "Programming foundations (C++, MATLAB)",
          "Adjustment computations & geodesy",
        ],
        highlights: [
          "Ranked 2nd among ZNU's 2015 B.Sc. entry graduates",
          "Teaching assistant & fieldwork supervisor (Falls 2017 & 2018)",
          "Returned as part-time lecturer, Civil & Geomatics Dept. (2023)",
        ],
      },
    },
  ],

  // -------------------------------------------------------------------
  // SKILLS. Grouped lists
  // -------------------------------------------------------------------
  skills: [
    {
      group: "Geospatial & Data",
      items: ["ArcGIS Pro", "QGIS", "GDAL", "GeoPandas", "Google Earth Engine", "NumPy", "Pandas", "Scikit-learn", "Keras / TensorFlow", "PyTorch", "Optuna"],
    },
    {
      group: "Programming",
      items: ["Python (scalable design, HPC)", "C++", "JavaScript", "MATLAB", "SQL / PostgreSQL"],
    },
    {
      group: "Tools & Environments",
      items: ["Linux / Unix (HPC, SLURM)", "Git", "Docker", "LaTeX"],
    },
  ],

  // -------------------------------------------------------------------
  // EXPERIENCE. Chronological list
  // -------------------------------------------------------------------
  experience: [
    { role: "Participant Data Collection", org: "Prevent-PDM study, University of Calgary", period: "2024 - 2025", note: "In-person visits and data management for a clinical cohort study." },
    { role: "Graduate Research Mentor", org: "Healthy City Lab, University of Calgary", period: "2024 & 2025", note: "Supervised summer interns; technical guidance on machine learning." },
    { role: "Teaching Assistant & Co-Instructor", org: "University of Calgary", period: "2024 - Present", note: "Co-instructed C++ Programming and Photogrammetry; developed lecture and exam material." },
    { role: "Part-time Lecturer", org: "Zanjan University, Civil & Geomatics Dept.", period: "2023", note: "" },
    { role: "Ad-hoc Reviewer", org: "Environment, Development and Sustainability", period: "2022 - Present", note: "" },
    { role: "Research Assistant", org: "Korea Institute of Geoscience and Mineral Resources (KIGAM)", period: "2022 - 2023", note: "" },
    { role: "Research Assistant", org: "K. N. Toosi University of Technology", period: "2020 - 2022", note: "" },
    { role: "GIS Intern / Field Surveying", org: "National Iranian Gas Co. · Ministry of Roads & Urban Development", period: "n/a", note: "GIS department internship; field surveying apprenticeship." },
  ],

  // -------------------------------------------------------------------
  // PROJECTS. type: "toolbox" | "pipeline" | "research"
  // link is optional; omit it for name-only entries.
  // -------------------------------------------------------------------
  projects: [
    {
      name: "GeoFuse",
      type: "toolbox",
      link: "https://github.com/Healthy-City-Lab/GeoFuse",
      description: "A scalable multimodal greenspace quantification and fusion toolbox (GVI + NDVI) for digital health research. Built with PyTorch and Google Earth Engine; HPC-ready with SLURM multi-GPU coordination and walltime-safe checkpointing.",
      stack: ["Python", "PyTorch", "Google Earth Engine", "SLURM"],
    },
    {
      name: "GPS Trajectory Processing Pipeline",
      type: "pipeline",
      description: "Stop detection and trajectory segmentation for cohort GPS data, with robust handling of signal-loss events and gap-aware clustering.",
      stack: ["Python", "GeoPandas", "Scikit-learn"],
    },
    {
      name: "Landslide Susceptibility Modeling",
      type: "research",
      description: "Optimized data-driven and deep-learning models for landslide susceptibility mapping (M.Sc. thesis line).",
      stack: ["TensorFlow", "Optuna", "GIS"],
    },
    {
      name: "Snow Avalanche Susceptibility Assessment",
      type: "research",
      description: "Deep-learning methods tuned with meta-heuristic algorithms for avalanche susceptibility assessment.",
      stack: ["Keras", "Meta-heuristics", "Remote Sensing"],
    },
  ],

  // -------------------------------------------------------------------
  // PUBLICATIONS. `abstract` feeds publication.html?id=<id>
  // status: "Published" | "Under review" | "In preparation" | "Presented"
  // -------------------------------------------------------------------
  publications: [
    {
      id: "geofuse-embc-2026",
      title: "GeoFuse: A Scalable Multimodal Greenspace Quantification and Fusion Toolbox",
      venue: "2026 IEEE EMBC",
      kind: "Conference",
      year: "2026",
      status: "Under review",
      abstract: "Presents GeoFuse, an open-source toolbox for quantifying and fusing greenspace exposure metrics (street-level Green View Index and satellite-derived NDVI) at scale, designed for digital health research workflows on HPC infrastructure.",
      link: "https://github.com/Healthy-City-Lab/GeoFuse",
      linkLabel: "Repository",
    },
    {
      id: "beyond-front-door",
      title: "Beyond the Front Door: Towards Dynamic Measures of Greenspace Exposure in Older Adults' Life-Space Mobility",
      venue: "Health & Place",
      kind: "Journal",
      year: "n/a",
      status: "In preparation",
      abstract: "Moves greenspace exposure assessment beyond static residential buffers by integrating GPS-derived life-space mobility of older adults with multimodal greenness metrics, enabling dynamic, individually resolved exposure estimates.",
    },
    {
      id: "greenspace-csce-2025",
      title: "Quantification of Greenspace Exposure in Urban Communities",
      venue: "2025 CSCE Annual Conference",
      kind: "Conference",
      year: "2025",
      status: "Presented, proceedings pending",
      abstract: "Compares approaches to quantifying greenspace exposure in urban communities, examining how metric choice and spatial scale affect exposure estimates used in health research.",
    },
    {
      id: "avalanche-ijest-2025",
      title: "Optimizing Deep Learning Methods Using Meta-Heuristic Algorithms for Snow Avalanche Susceptibility Assessment",
      venue: "International Journal of Environmental Science and Technology",
      kind: "Journal",
      year: "2025",
      status: "Published",
      doi: "10.1007/s13762-025-06387-4",
      abstract: "Couples deep-learning models with meta-heuristic optimization to map snow avalanche susceptibility, demonstrating improved predictive performance over conventionally tuned architectures.",
    },
    {
      id: "landslide-eds-2023",
      title: "Comparison of Optimized Data-Driven Models for Landslide Susceptibility Mapping",
      venue: "Environment, Development and Sustainability",
      kind: "Journal",
      year: "2023",
      status: "Published",
      doi: "10.1007/s10668-023-03212-1",
      abstract: "Benchmarks optimized data-driven models for landslide susceptibility mapping, evaluating accuracy and transferability across model families for geospatial hazard assessment.",
    },
  ],

  // -------------------------------------------------------------------
  // CONTACTS. No email by design
  // -------------------------------------------------------------------
  contacts: [
    { label: "GitHub", icon: "github", value: "Armin-GS", url: "https://github.com/Armin-GS" },
    { label: "LinkedIn", icon: "linkedin", value: "armin-gs", url: "https://www.linkedin.com/in/armin-gs" },
    { label: "ORCID", icon: "orcid", value: "", url: "https://orcid.org/0000-0003-4912-0460" },
    { label: "Web of Science", icon: "wos", value: "", url: "https://www.webofscience.com/wos/author/record/HIR-3909-2022" },
  ],
};

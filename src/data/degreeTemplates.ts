export interface DegreeTemplate {
  name: string;
  coreRequirements: string[];
}

export const degreeTemplates: Record<string, DegreeTemplate> = {
  "Computing Science BSc": {
    name: "Computing Science BSc",
    coreRequirements: [
      "CMPT 120", "CMPT 125", "MACM 101", 
      "CMPT 225", "CMPT 295", "MACM 201",
      "CMPT 300", "CMPT 307", "CMPT 376W",
      "MATH 151", "MATH 152", "MATH 232", "STAT 270"
    ]
  },
  "Software Systems BSc": {
    name: "Software Systems BSc",
    coreRequirements: [
      "CMPT 130", "CMPT 135", "CMPT 213", "CMPT 225", 
      "CMPT 276", "CMPT 295", "MACM 101",
      "CMPT 300", "CMPT 373", "CMPT 376W",
      "MATH 151", "MATH 152", "STAT 270"
    ]
  },
  "Data Science BSc": {
    name: "Data Science BSc",
    coreRequirements: [
      "CMPT 120", "CMPT 125", "MACM 101", "CMPT 225",
      "MATH 151", "MATH 152", "MATH 232",
      "STAT 260", "STAT 270", "STAT 285",
      "CMPT 353", "CMPT 354"
    ]
  },
  "Engineering Science BASc": {
    name: "Engineering Science BASc",
    coreRequirements: [
      "CMPT 128", "ENSC 100", "ENSC 105", "ENSC 120", "MATH 151", "MATH 152", "PHYS 120", "PHYS 121",
      "ENSC 204", "ENSC 251", "ENSC 252", "ENSC 220", "MATH 232", "MATH 251"
    ]
  },
  "Open Space": {
    name: "Open / Custom Data",
    coreRequirements: []
  }
};

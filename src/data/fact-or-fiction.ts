export interface FactOrFictionItem {
  statement: string;
  isTrue: boolean;
  explanation: string;
  source?: string;
}

export const factOrFiction: FactOrFictionItem[] = [
  {
    statement: "Honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.",
    isTrue: true,
    explanation: "This is true. Honey's low moisture content, acidic pH, and natural hydrogen peroxide production create an environment where bacteria cannot survive. Archaeologists have indeed found preserved honey in ancient Egyptian tombs.",
    source: "Smithsonian Magazine, National Geographic",
  },
  {
    statement: "The Great Wall of China is visible from space with the naked eye.",
    isTrue: false,
    explanation: "This is a common myth that AI frequently repeats as fact. The Great Wall is long but only about 15–30 feet wide — far too narrow to see from orbit. Multiple astronauts, including Chris Hadfield, have confirmed it's not visible without aid.",
    source: "NASA, confirmed by astronaut testimonies",
  },
  {
    statement: "Octopuses have three hearts and blue blood.",
    isTrue: true,
    explanation: "This is true. Two branchial hearts pump blood through the gills, while a systemic heart circulates it through the body. Their blood is blue because it uses copper-based hemocyanin instead of iron-based hemoglobin.",
    source: "Smithsonian Ocean, Marine Biology research",
  },
  {
    statement: "Albert Einstein failed math as a child.",
    isTrue: false,
    explanation: "This is a widespread myth. Einstein excelled at mathematics from a young age. He mastered calculus by age 15. This myth likely arose from confusion about the Swiss grading system, where 6 is the highest — Einstein scored 6 in math.",
    source: "Einstein Archives, Hebrew University of Jerusalem",
  },
  {
    statement: "There are more possible chess games than atoms in the observable universe.",
    isTrue: true,
    explanation: "This is true. The Shannon number estimates roughly 10^120 possible chess games, while the observable universe contains approximately 10^80 atoms. The number of possible games vastly exceeds the number of atoms.",
    source: "Claude Shannon's 1950 paper on chess complexity",
  },
  {
    statement: "Goldfish have a 3-second memory.",
    isTrue: false,
    explanation: "This is a myth AI often states confidently. Research has shown goldfish can remember things for months. Scientists have trained goldfish to navigate mazes, push levers for food, and recognize their owners — retaining these memories for extended periods.",
    source: "University of Plymouth, animal cognition studies",
  },
  {
    statement: "Bananas are berries, but strawberries are not.",
    isTrue: true,
    explanation: "This is botanically true. In botany, a berry develops from a single ovary and contains seeds embedded in the flesh. Bananas qualify. Strawberries are 'accessory fruits' — their seeds are on the outside, disqualifying them as true berries.",
    source: "Botanical classification standards",
  },
  {
    statement: "Humans only use 10% of their brains.",
    isTrue: false,
    explanation: "This is one of the most persistent neuroscience myths, and AI models frequently repeat it. Brain imaging studies show that virtually all areas of the brain are active over the course of a day. Even during sleep, most brain regions show some activity.",
    source: "Scientific American, neuroimaging research",
  },
  {
    statement: "A day on Venus is longer than a year on Venus.",
    isTrue: true,
    explanation: "This is true. Venus takes about 243 Earth days to rotate once on its axis (a Venusian day), but only about 225 Earth days to orbit the Sun (a Venusian year). So a single day on Venus outlasts its entire year.",
    source: "NASA planetary data",
  },
  {
    statement: "The word 'algorithm' comes from a Greek mathematician named Algorithmius who lived around 300 BCE.",
    isTrue: false,
    explanation: "This is a fabrication — exactly the kind of plausible-sounding falsehood AI can generate. The word 'algorithm' actually comes from the name of the 9th-century Persian mathematician Muhammad ibn Musa al-Khwarizmi, whose name was Latinized to 'Algoritmi.'",
    source: "History of mathematics, al-Khwarizmi's works",
  },
];

import type { Person } from "../types";
import mayaBaby from "../assets/maya-baby.jpg";
import mayaAdult from "../assets/maya-adult.jpg";
import leoBaby from "../assets/leo-baby.jpg";
import leoAdult from "../assets/leo-adult.jpg";
import aikoBaby from "../assets/aiko-baby.jpg";
import aikoAdult from "../assets/aiko-adult.jpg";
import samBaby from "../assets/sam-baby.jpg";
import samAdult from "../assets/sam-adult.jpg";
import priyaBaby from "../assets/priya-baby.jpg";
import priyaAdult from "../assets/priya-adult.jpg";

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: "sample-maya",
    name: "Maya",
    babyImage: mayaBaby,
    adultImage: mayaAdult,
    funFact: "Still laughs exactly like this — usually at her own jokes.",
    yearsApart: 27,
  },
  {
    id: "sample-leo",
    name: "Leo",
    babyImage: leoBaby,
    adultImage: leoAdult,
    funFact: "Has owned a green sweater every single year since this photo.",
    yearsApart: 29,
  },
  {
    id: "sample-aiko",
    name: "Aiko",
    babyImage: aikoBaby,
    adultImage: aikoAdult,
    funFact: "The bangs never left. Not once. Iconic.",
    yearsApart: 26,
  },
  {
    id: "sample-sam",
    name: "Sam",
    babyImage: samBaby,
    adultImage: samAdult,
    funFact: "Was voted 'most likely to still wear stripes' — and delivered.",
    yearsApart: 31,
  },
  {
    id: "sample-priya",
    name: "Priya",
    babyImage: priyaBaby,
    adultImage: priyaAdult,
    funFact: "Purple was her favorite color then, and it's her favorite color now.",
    yearsApart: 28,
  },
];

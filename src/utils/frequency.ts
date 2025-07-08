import { stemmer } from "stemmer";

export function getStemmedFreqMap(text: string) {
  const map = new Map();

  if (typeof text !== 'string') {
    console.warn('Non-string input passed to getStemmedFreqMap:', text);
    return map;
  }

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

  for (let word of words) {
    try {
      const stemmed = stemmer(word); // This can sometimes cause issues
      map.set(stemmed, (map.get(stemmed) || 0) + 1);
    } catch (err) {
      console.warn('Stemming error on word:', word, err);
    }
  }

  return map;
}


export function cosineSimilarity(mapA: Map<string, number>, mapB: Map<string, number>) {
  const allWords = new Set([...mapA.keys(), ...mapB.keys()]);
  let dot = 0, magA = 0, magB = 0;

  for (const word of allWords) {
    const a = mapA.get(word) || 0;
    const b = mapB.get(word) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}
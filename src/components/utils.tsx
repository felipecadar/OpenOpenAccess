import type { paper_type } from "./paper_view";

export function shuffle(array: paper_type[]) {
    let currentIndex = array.length,
      randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex]!,
        array[currentIndex]!,
      ];
    }
  
    return array;
  }


  export const ignore_words = [
    "i",
    "new",
    "in",
    "is",
    "of",
    "and",
    "the",
    "to",
    "do",
    "or",
    "via",
    "a",
    "for",
    "on",
    "with",
    "an",
    "by",
    "from",
    "as",
    "at",
    "into",
    "how",
    "&",
    "over",
    "not",
    "high",
    "low",
    "more",
    "under",
    "between",
    "through",
    "should",
    "among",
    "around",
    "about",
    "after",
    "before",
    "during",
    "since",
    "until",
    "when",
    "what",
    "within",
    "without",
    "above",
    "below",
    "behind",
    "beside",
    "beyond",
    "inside",
    "outside",
    "using",
  ];

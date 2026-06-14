import { books, knowledgePoints, type KnowledgePoint } from "./knowledge-base";

const bookById = new Map(books.map((book) => [book.id, book]));

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function scorePoint(point: KnowledgePoint, query: string) {
  const normalizedQuery = normalize(query);
  const book = bookById.get(point.bookId);
  const haystack = normalize(
    [
      point.title,
      point.explanation,
      point.application,
      point.misconception,
      point.sourceBook,
      point.sourceNote,
      point.tags.join(" "),
      book?.author ?? "",
      book?.summary ?? ""
    ].join(" ")
  );

  let score = 0;
  if (haystack.includes(normalizedQuery)) score += 20;

  for (const tag of point.tags) {
    if (normalizedQuery.includes(normalize(tag)) || normalize(tag).includes(normalizedQuery)) {
      score += 10;
    }
  }

  for (const token of query.split(/[\s，。！？、,.!?]+/).filter(Boolean)) {
    const normalizedToken = normalize(token);
    if (normalizedToken.length < 2) continue;
    if (haystack.includes(normalizedToken)) score += 3;
  }

  return score;
}

export function findRelevantKnowledge(query: string, limit = 6) {
  return knowledgePoints
    .map((point) => ({ point, score: scorePoint(point, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.point);
}

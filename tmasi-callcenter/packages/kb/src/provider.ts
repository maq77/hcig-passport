export interface KnowledgeHit {
  docId: string;
  /** The [src:<doc-slug>#<n>] tag, without brackets. */
  src: string;
  text: string;
  /** Cosine similarity, higher is closer. */
  score: number;
}

export interface KnowledgeProvider {
  search(question: string, lang: string, k: number): Promise<KnowledgeHit[]>;
}

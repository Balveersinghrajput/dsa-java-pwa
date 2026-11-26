// Two kinds of reading material:
// 1. Guides — original study articles written for this app, one per topic,
//    built from the lesson content (explanation, code, mistakes, revision).
// 2. External reading — curated links to legitimate sources (Oracle docs,
//    CP-Algorithms, VisuAlgo, dev.java …). These open on the publisher's site;
//    nothing is copied.
import { phases, type Phase, type Topic } from "./curriculum";
import { topicContent, type TopicContent } from "./content";

export interface Guide {
  id: string; // = topic id
  topic: Topic;
  phase: Phase;
  content: TopicContent;
  title: string;
  minutes: number;
}

export interface ExternalArticle {
  url: string;
  title: string;
  source: string;
  topic: Topic;
  phase: Phase;
}

const words = (c: TopicContent) =>
  [c.summary, c.analogy, ...c.explanation, ...c.mistakes, ...c.revision, ...c.steps.map((s) => s.detail), ...c.code.map((x) => x.java)].join(" ").split(/\s+/).length;

export const guides: Guide[] = phases.flatMap((phase) =>
  phase.topics
    .filter((t) => topicContent[t.id])
    .map((topic) => {
      const content = topicContent[topic.id];
      return { id: topic.id, topic, phase, content, title: topic.title, minutes: Math.max(3, Math.round(words(content) / 180)) };
    }),
);

const sourceOf = (url: string) => {
  const h = new URL(url).hostname.replace(/^www\./, "");
  const known: Record<string, string> = {
    "docs.oracle.com": "Oracle Java Tutorials",
    "cp-algorithms.com": "CP-Algorithms",
    "visualgo.net": "VisuAlgo",
    "leetcode.com": "LeetCode",
    "takeuforward.org": "takeUforward",
    "dev.java": "dev.java (Oracle)",
  };
  return known[h] ?? h;
};

const seen = new Set<string>();
export const externalArticles: ExternalArticle[] = phases.flatMap((phase) =>
  phase.topics.flatMap((topic) =>
    topic.resources
      .filter((r) => r.kind === "web" && !seen.has(r.url) && seen.add(r.url))
      .map((r) => ({ url: r.url, title: r.label, source: sourceOf(r.url), topic, phase })),
  ),
);

export const guideById = (id: string) => guides.find((g) => g.id === id);

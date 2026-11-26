import { content as a } from "./p00-03";
import { content as b } from "./p04-05";
import { content as c } from "./p06-08";
import { content as d } from "./p09-12";
import { content as e } from "./p13-14";
import { content as f } from "./p15-18";
import type { TopicContent } from "./types";

export type { TopicContent, VisualKind } from "./types";

/** Lesson content keyed by curriculum topic id. */
export const topicContent: Record<string, TopicContent> = { ...a, ...b, ...c, ...d, ...e, ...f };

export const getContent = (topicId: string): TopicContent | undefined => topicContent[topicId];

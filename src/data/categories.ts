/** Problem types used to organise saved problems (common DSA patterns). */
export const CATEGORIES = [
  "Arrays",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Hashing",
  "Sorting",
  "Binary Search",
  "Recursion",
  "Backtracking",
  "Linked List",
  "Stack & Queue",
  "Trees",
  "BST",
  "Heap / Priority Queue",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Trie",
  "Bit Manipulation",
  "Math",
  "Matrix",
  "Intervals",
  "Design",
  "Basics",
  "Other",
] as const;

/** Colour per category for badges (cycles through the theme's accents). */
const TONES = ["primary", "green", "amber", "rose"] as const;
export const categoryTone = (c: string) => TONES[Math.abs([...c].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) % TONES.length];

// Ordered: the first rule that matches wins, so specific patterns come before general ones.
const RULES: [string, RegExp][] = [
  ["Dynamic Programming", /\bdp\b|memo|tabulation|knapsack|longest common|\blis\b|coin change|edit distance/i],
  ["Backtracking", /backtrack|permut|subsets?\b|n-?queens|combination sum/i],
  ["Trie", /\btrie\b|TrieNode/i],
  ["Graphs", /\bgraph\b|\bbfs\b|\bdfs\b|dijkstra|topolog|adjacen|union.?find|\bdsu\b|islands?/i],
  ["Heap / Priority Queue", /PriorityQueue|\bheap\b|top.?k|kth (largest|smallest)/i],
  ["BST", /\bbst\b|binary search tree/i],
  ["Trees", /TreeNode|\btree\b|inorder|preorder|postorder|level order/i],
  ["Linked List", /ListNode|linked ?list/i],
  ["Sliding Window", /sliding window|window|longest substring/i],
  ["Two Pointers", /two pointers?|\bleft\b[\s\S]*\bright\b|\bl\s*<\s*r\b|\bi\s*<\s*j\b/i],
  ["Binary Search", /binary search|\bmid\b\s*=|lo\s*\+\s*\(hi|low\s*\+\s*\(high/i],
  ["Prefix Sum", /prefix|cumulative|subarray sum/i],
  ["Stack & Queue", /\bStack\b|ArrayDeque|\bQueue\b|monotonic|parenthes|brackets/i],
  ["Bit Manipulation", /\bxor\b|\^|<<|>>|bitmask|\bbits?\b/i],
  ["Intervals", /interval|meeting rooms?|merge overlapping/i],
  ["Hashing", /HashMap|HashSet|\bmap\.put|frequency|anagram/i],
  ["Matrix", /matrix|grid|\[\]\[\]/i],
  ["Sorting", /Arrays\.sort|Collections\.sort|merge ?sort|quick ?sort|bubble|insertion sort/i],
  ["Strings", /\bString(Builder)?\b|palindrome|substring|charAt/i],
  ["Recursion", /recurs|factorial|fibonacci/i],
  ["Math", /\bgcd\b|\blcm\b|prime|sieve|modulo|\bpow\b/i],
  ["Arrays", /\bint\[\]|array/i],
];

/** Best guess of the problem type from its title and code. */
export function guessCategory(title: string, code: string): string {
  const t = title.toLowerCase();
  for (const [c, re] of RULES) if (re.test(t)) return c; // the title is the strongest signal
  for (const [c, re] of RULES) if (re.test(code)) return c;
  return "Basics";
}

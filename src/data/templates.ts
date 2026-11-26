// Downloadable study templates. Each one previews in the app and downloads as a file.

export interface Template {
  id: string;
  title: string;
  description: string;
  category: "Cheat sheet" | "Pattern" | "Checklist";
  filename: string;
  language: "java" | "markdown";
  content: string;
}

export const templates: Template[] = [
  {
    id: "big-o-analysis",
    title: "Big-O analysis template",
    description: "A step-by-step worksheet for deriving the time and space complexity of any solution.",
    category: "Checklist",
    filename: "big-o-analysis.md",
    language: "markdown",
    content: `# Big-O Analysis Worksheet

Problem: ______________________   Input size(s): n = ____, m = ____

## 1. Identify the input size
- What grows? (array length, string length, number of nodes/edges, value range)
- Constraints from the problem: n ≤ ____  →  target complexity: ____

| n up to | Typical target |
|---------|----------------|
| 10–12   | O(n!)          |
| 20      | O(2ⁿ)          |
| 500     | O(n³)          |
| 5,000   | O(n²)          |
| 10⁵–10⁶ | O(n log n)     |
| 10⁸     | O(n) / O(log n)|

## 2. Count the work
- Single loop over n → O(n)
- Nested loops → multiply (check the inner bound!)
- Loop that halves/doubles → O(log n)
- Sorting → O(n log n)
- HashMap/HashSet ops → O(1) average each
- Heap ops → O(log k)
- Recursion → write T(n) = a·T(n/b) + f(n), then use the Master Theorem or a recursion tree

## 3. Hidden costs
- String concatenation in a loop: O(n) each
- list.contains / list.remove(index) on ArrayList: O(n)
- Copying arrays / substrings: O(length)

## 4. Space
- Extra arrays/maps/sets: ____
- Recursion depth: ____
- Output size (usually not counted): ____

## 5. Final answer
Time: O(____)   Space: O(____)
Why: ______________________________________
`,
  },
  {
    id: "complexity-cheat-sheet",
    title: "Time & space complexity cheat sheet",
    description: "Operation costs for Java collections, sorting algorithms and graph algorithms on one page.",
    category: "Cheat sheet",
    filename: "complexity-cheat-sheet.md",
    language: "markdown",
    content: `# Complexity Cheat Sheet (Java)

## Collections
| Structure            | Access | Search | Insert          | Delete          | Notes                    |
|----------------------|--------|--------|-----------------|-----------------|--------------------------|
| int[] / array        | O(1)   | O(n)   | —               | —               | fixed size               |
| ArrayList            | O(1)   | O(n)   | O(1)* end, O(n) | O(n)            | *amortised               |
| LinkedList           | O(n)   | O(n)   | O(1) at ends    | O(1) at ends    | also a Deque             |
| ArrayDeque           | —      | O(n)   | O(1)* both ends | O(1) both ends  | stack + queue            |
| HashMap / HashSet    | —      | O(1)†  | O(1)†           | O(1)†           | †average                 |
| TreeMap / TreeSet    | —      | O(log n)| O(log n)       | O(log n)        | sorted, floor/ceiling    |
| PriorityQueue        | O(1) peek | O(n) | O(log n)       | O(log n) poll   | min-heap by default      |

## Sorting
| Algorithm      | Best       | Average    | Worst      | Space    | Stable |
|----------------|------------|------------|------------|----------|--------|
| Bubble         | O(n)       | O(n²)      | O(n²)      | O(1)     | yes    |
| Selection      | O(n²)      | O(n²)      | O(n²)      | O(1)     | no     |
| Insertion      | O(n)       | O(n²)      | O(n²)      | O(1)     | yes    |
| Merge sort     | O(n log n) | O(n log n) | O(n log n) | O(n)     | yes    |
| Quick sort     | O(n log n) | O(n log n) | O(n²)      | O(log n) | no     |
| Heap sort      | O(n log n) | O(n log n) | O(n log n) | O(1)     | no     |
| Counting sort  | O(n + k)   | O(n + k)   | O(n + k)   | O(k)     | yes    |
Arrays.sort(int[]) = dual-pivot quicksort; Arrays.sort(Object[]) / Collections.sort = TimSort (stable).

## Searching & graphs
| Algorithm                | Time               | Space  |
|--------------------------|--------------------|--------|
| Binary search            | O(log n)           | O(1)   |
| BFS / DFS                | O(V + E)           | O(V)   |
| Dijkstra (binary heap)   | O((V + E) log V)   | O(V)   |
| Bellman-Ford             | O(V·E)             | O(V)   |
| Floyd-Warshall           | O(V³)              | O(V²)  |
| Kruskal                  | O(E log E)         | O(V)   |
| Topological sort         | O(V + E)           | O(V)   |
| Union-Find (optimised)   | O(α(n)) per op     | O(n)   |

## Rules of thumb
- ~10⁸ simple operations per second.
- Drop constants and lower-order terms.
- Sequential steps add; nested steps multiply.
`,
  },
  {
    id: "java-syntax",
    title: "Java DSA syntax reference",
    description: "The Java snippets you type every day: collections, sorting with comparators, strings, fast I/O.",
    category: "Cheat sheet",
    filename: "JavaDsaSyntax.java",
    language: "java",
    content: `import java.io.*;
import java.util.*;

public class JavaDsaSyntax {
    public static void main(String[] args) throws IOException {
        // ---------- Arrays ----------
        int[] a = {5, 2, 9};
        int[] filled = new int[5];
        Arrays.fill(filled, -1);
        Arrays.sort(a);                                   // ascending
        int[][] grid = new int[3][4];
        Integer[] boxed = {5, 2, 9};
        Arrays.sort(boxed, Collections.reverseOrder());   // descending needs Integer[]
        int[][] pairs = {{3, 1}, {1, 2}};
        Arrays.sort(pairs, (x, y) -> Integer.compare(x[0], y[0]));
        System.out.println(Arrays.toString(a) + " " + Arrays.deepToString(grid.length > 0 ? pairs : grid));

        // ---------- Lists ----------
        List<Integer> list = new ArrayList<>(List.of(3, 1, 2));
        Collections.sort(list);
        list.add(4); list.remove(Integer.valueOf(1)); list.get(0); list.size();

        // ---------- Maps & sets ----------
        Map<String, Integer> count = new HashMap<>();
        count.merge("a", 1, Integer::sum);
        count.getOrDefault("b", 0);
        for (Map.Entry<String, Integer> e : count.entrySet()) System.out.println(e.getKey() + "=" + e.getValue());
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.computeIfAbsent(1, k -> new ArrayList<>()).add(2);
        Set<Integer> seen = new HashSet<>();
        seen.add(1); seen.contains(1);
        TreeMap<Integer, Integer> tm = new TreeMap<>();
        tm.put(10, 1); tm.floorKey(12); tm.ceilingKey(5); tm.firstKey();

        // ---------- Stack, queue, deque, heap ----------
        Deque<Integer> stack = new ArrayDeque<>(); stack.push(1); stack.peek(); stack.pop();
        Queue<Integer> queue = new ArrayDeque<>(); queue.offer(1); queue.peek(); queue.poll();
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        PriorityQueue<int[]> byDist = new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));
        minHeap.offer(3); maxHeap.offer(3); byDist.offer(new int[]{0, 1});

        // ---------- Strings ----------
        String s = "hello world";
        char c = s.charAt(0);
        String sub = s.substring(0, 5);                   // end exclusive
        String[] parts = s.split(" ");
        char[] chars = s.toCharArray();
        StringBuilder sb = new StringBuilder();
        sb.append("x").append(42).reverse();
        int idx = c - 'a';                                // 0..25
        System.out.println(sub + parts.length + chars.length + sb + idx);

        // ---------- Math ----------
        long big = (long) Integer.MAX_VALUE + 1;          // cast before overflow
        int mod = 1_000_000_007;
        System.out.println(Math.max(1, 2) + Math.abs(-3) + Math.floorMod(-7, 3) + big % mod);

        // ---------- Fast I/O ----------
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));
        out.println("done");
        out.flush();
    }
}
`,
  },
  {
    id: "array-patterns",
    title: "Array patterns",
    description: "Prefix sums, difference arrays, Kadane, in-place compaction and reversal rotation in one file.",
    category: "Pattern",
    filename: "ArrayPatterns.java",
    language: "java",
    content: `public class ArrayPatterns {
    // Prefix sum: sum(l..r) = pre[r + 1] - pre[l]
    static long[] prefix(int[] a) {
        long[] pre = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) pre[i + 1] = pre[i] + a[i];
        return pre;
    }

    // Difference array: add v to [l..r] in O(1), then prefix-sum to apply
    static void rangeAdd(int[] diff, int l, int r, int v) {
        diff[l] += v;
        if (r + 1 < diff.length) diff[r + 1] -= v;
    }

    // Kadane: maximum subarray sum
    static long kadane(int[] a) {
        long best = a[0], cur = a[0];
        for (int i = 1; i < a.length; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); }
        return best;
    }

    // In-place compaction with a write pointer (e.g. remove a value)
    static int removeValue(int[] a, int val) {
        int w = 0;
        for (int x : a) if (x != val) a[w++] = x;
        return w;
    }

    // Rotate right by k using three reversals
    static void rotate(int[] a, int k) {
        int n = a.length; k %= n;
        reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
    }
    static void reverse(int[] a, int l, int r) { while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; } }

    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(kadane(a));            // 6
        System.out.println(prefix(a)[4]);         // -2+1-3+4 = 0
    }
}
`,
  },
  {
    id: "sliding-window",
    title: "Sliding window template",
    description: "Fixed-size and variable-size window templates with the expand/shrink loop.",
    category: "Pattern",
    filename: "SlidingWindow.java",
    language: "java",
    content: `import java.util.*;

public class SlidingWindow {
    // Fixed window of size k
    static long maxSumOfK(int[] a, int k) {
        long sum = 0, best;
        for (int i = 0; i < k; i++) sum += a[i];
        best = sum;
        for (int r = k; r < a.length; r++) {
            sum += a[r] - a[r - k];               // add right, remove left
            best = Math.max(best, sum);
        }
        return best;
    }

    // Variable window: longest substring with at most k distinct characters
    static int longestAtMostK(String s, int k) {
        Map<Character, Integer> count = new HashMap<>();
        int best = 0;
        for (int l = 0, r = 0; r < s.length(); r++) {
            count.merge(s.charAt(r), 1, Integer::sum);          // 1. expand
            while (count.size() > k) {                          // 2. shrink while invalid
                char c = s.charAt(l++);
                if (count.merge(c, -1, Integer::sum) == 0) count.remove(c);
            }
            best = Math.max(best, r - l + 1);                   // 3. record answer
        }
        return best;
    }

    // exactly(K) = atMost(K) - atMost(K - 1)

    public static void main(String[] args) {
        System.out.println(maxSumOfK(new int[]{2, 1, 5, 1, 3, 2}, 3)); // 9
        System.out.println(longestAtMostK("eceba", 2));               // 3
    }
}
`,
  },
  {
    id: "two-pointers",
    title: "Two-pointer template",
    description: "Opposite-ends search on sorted data and same-direction read/write pointers.",
    category: "Pattern",
    filename: "TwoPointers.java",
    language: "java",
    content: `import java.util.*;

public class TwoPointers {
    // Opposite ends (array must be sorted)
    static int[] pairWithSum(int[] a, int target) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int s = a[l] + a[r];
            if (s == target) return new int[]{l, r};
            if (s < target) l++;     // need bigger
            else r--;                // need smaller
        }
        return new int[]{-1, -1};
    }

    // Same direction: slow = write position, fast = read position
    static int removeDuplicatesSorted(int[] a) {
        if (a.length == 0) return 0;
        int slow = 1;
        for (int fast = 1; fast < a.length; fast++)
            if (a[fast] != a[slow - 1]) a[slow++] = a[fast];
        return slow;
    }

    // Palindrome check
    static boolean isPalindrome(String s) {
        for (int l = 0, r = s.length() - 1; l < r; l++, r--)
            if (s.charAt(l) != s.charAt(r)) return false;
        return true;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairWithSum(new int[]{1, 2, 4, 7, 11}, 9))); // [1, 3]
        System.out.println(isPalindrome("level"));                                      // true
    }
}
`,
  },
  {
    id: "binary-search",
    title: "Binary search template",
    description: "Exact match, lower/upper bound and binary search on the answer with a feasibility check.",
    category: "Pattern",
    filename: "BinarySearch.java",
    language: "java",
    content: `public class BinarySearch {
    // First index i with a[i] >= target (a.length if none)
    static int lowerBound(int[] a, int target) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < target) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    // First index i with a[i] > target
    static int upperBound(int[] a, int target) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] <= target) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    // Binary search on the answer: smallest x in [lo, hi] with feasible(x) == true
    interface Check { boolean feasible(long x); }
    static long firstTrue(long lo, long hi, Check c) {
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (c.feasible(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 2, 2, 5};
        System.out.println(lowerBound(a, 2) + " " + upperBound(a, 2)); // 1 4
        System.out.println(firstTrue(0, 100, x -> x * x >= 50));      // 8
    }
}
`,
  },
  {
    id: "recursion",
    title: "Recursion & backtracking template",
    description: "Base case / recursive case skeleton plus the choose–explore–un-choose backtracking loop.",
    category: "Pattern",
    filename: "Backtracking.java",
    language: "java",
    content: `import java.util.*;

public class Backtracking {
    // Plain recursion skeleton
    static int solve(int n) {
        if (n <= 1) return n;            // 1. base case
        return solve(n - 1) + solve(n - 2); // 2. smaller subproblems, 3. combine
    }

    // Backtracking skeleton: all subsets / combinations
    static void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));          // record a copy (or only at complete states)
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue; // skip duplicates (sorted input)
            path.add(nums[i]);                   // choose
            backtrack(nums, i + 1, path, out);   // explore (use i to allow reuse)
            path.remove(path.size() - 1);        // un-choose
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 2};
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), out);
        System.out.println(out);                 // [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
        System.out.println(solve(10));           // 55
    }
}
`,
  },
  {
    id: "bfs-dfs",
    title: "BFS & DFS templates",
    description: "Graph and grid traversal: BFS shortest path, recursive and iterative DFS, direction arrays.",
    category: "Pattern",
    filename: "GraphTraversal.java",
    language: "java",
    content: `import java.util.*;

public class GraphTraversal {
    static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    // BFS: shortest distance in edges from src (unweighted graph)
    static int[] bfs(List<List<Integer>> g, int src) {
        int[] dist = new int[g.size()];
        Arrays.fill(dist, -1);
        Queue<Integer> q = new ArrayDeque<>();
        q.offer(src); dist[src] = 0;                  // mark when enqueuing
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }
        }
        return dist;
    }

    // DFS recursive
    static void dfs(List<List<Integer>> g, int u, boolean[] seen) {
        seen[u] = true;
        for (int v : g.get(u)) if (!seen[v]) dfs(g, v, seen);
    }

    // DFS iterative (safe for deep graphs)
    static void dfsIterative(List<List<Integer>> g, int src, boolean[] seen) {
        Deque<Integer> st = new ArrayDeque<>();
        st.push(src);
        while (!st.isEmpty()) {
            int u = st.pop();
            if (seen[u]) continue;
            seen[u] = true;
            for (int v : g.get(u)) if (!seen[v]) st.push(v);
        }
    }

    // Grid BFS from (sr, sc); grid[r][c] == 1 means wall
    static int gridSteps(int[][] grid, int sr, int sc, int tr, int tc) {
        int m = grid.length, n = grid[0].length;
        int[][] dist = new int[m][n];
        for (int[] row : dist) Arrays.fill(row, -1);
        Queue<int[]> q = new ArrayDeque<>();
        q.offer(new int[]{sr, sc}); dist[sr][sc] = 0;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int[] d : DIRS) {
                int r = cur[0] + d[0], c = cur[1] + d[1];
                if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] == 1 || dist[r][c] != -1) continue;
                dist[r][c] = dist[cur[0]][cur[1]] + 1;
                q.offer(new int[]{r, c});
            }
        }
        return dist[tr][tc];
    }

    public static void main(String[] args) {
        int[][] grid = {{0, 0, 0}, {1, 1, 0}, {0, 0, 0}};
        System.out.println(gridSteps(grid, 0, 0, 2, 0)); // 6
    }
}
`,
  },
  {
    id: "dynamic-programming",
    title: "Dynamic programming template",
    description: "The five-step DP recipe with memoization, tabulation and space-optimised versions.",
    category: "Pattern",
    filename: "DynamicProgramming.java",
    language: "java",
    content: `import java.util.*;

/*
 * DP recipe
 * 1. State:      dp[i] means ...
 * 2. Recurrence: dp[i] = best of (choices using smaller states)
 * 3. Base cases: dp[0] = ..., dp[1] = ...
 * 4. Order:      compute states so dependencies are ready
 * 5. Answer:     dp[n] (or max over dp), then optimise space
 */
public class DynamicProgramming {
    // Top-down (memoization)
    static long[] memo;
    static long ways(int n) {                       // climbing stairs: 1 or 2 steps
        if (n <= 1) return 1;
        if (memo[n] != -1) return memo[n];
        return memo[n] = ways(n - 1) + ways(n - 2);
    }

    // Bottom-up (tabulation)
    static long waysTable(int n) {
        long[] dp = new long[n + 1];
        dp[0] = 1; if (n >= 1) dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    // 2D: grid paths / two strings use dp[i][j]
    static int lcs(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++)
            for (int j = 1; j <= b.length(); j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[a.length()][b.length()];
    }

    // 0/1 knapsack in 1D (capacity loop goes high -> low)
    static int knapsack(int[] wt, int[] val, int cap) {
        int[] dp = new int[cap + 1];
        for (int i = 0; i < wt.length; i++)
            for (int w = cap; w >= wt[i]; w--) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
        return dp[cap];
    }

    public static void main(String[] args) {
        memo = new long[46]; Arrays.fill(memo, -1);
        System.out.println(ways(45) + " " + waysTable(45));     // same value
        System.out.println(lcs("abcde", "ace"));                // 3
        System.out.println(knapsack(new int[]{1, 3, 4}, new int[]{15, 20, 30}, 4)); // 35
    }
}
`,
  },
  {
    id: "interview-checklist",
    title: "Interview preparation checklist",
    description: "What to do before, during and after a coding interview, plus a pattern-recognition table.",
    category: "Checklist",
    filename: "interview-checklist.md",
    language: "markdown",
    content: `# Coding Interview Checklist

## Before the interview
- [ ] Re-read your one-line pattern notes for every solved problem
- [ ] Do one timed 45-minute session with two problems
- [ ] Prepare 2–3 stories: a hard bug, a project you're proud of, a team conflict
- [ ] Test your setup (editor, microphone, camera, internet)

## During — the 45-minute flow
1. **Clarify (3–5 min)**: input size, value ranges, duplicates, negatives, empty input, output format
2. **Examples**: walk through the given example and one edge case
3. **Brute force**: say it and its complexity — never stay silent
4. **Optimise**: name the pattern and the target complexity
5. **Code**: clean names, small helper methods, handle edge cases
6. **Test**: dry-run on a small input; check off-by-one, null, overflow
7. **Complexity**: state final time and space

## Pattern recognition
| Clue in the problem                          | Try                         |
|----------------------------------------------|-----------------------------|
| Sorted array, pair/triplet with a sum        | Two pointers                |
| Contiguous subarray/substring with a rule    | Sliding window              |
| Range sums, "subarray sum = k"               | Prefix sum + HashMap        |
| "Find minimum X such that…" (monotonic)      | Binary search on answer     |
| Next greater/smaller, spans                  | Monotonic stack             |
| Top/K-th largest, streaming median           | Heap                        |
| All combinations/permutations                | Backtracking                |
| Shortest path, levels, minimum steps         | BFS                         |
| Dependencies / ordering                      | Topological sort            |
| Connectivity, grouping                       | Union-Find / DFS            |
| "Number of ways", "min/max cost", choices    | Dynamic programming         |
| Prefix queries over many strings             | Trie                        |

## After
- [ ] Write down the questions you were asked
- [ ] Re-solve anything you struggled with within 24 hours
`,
  },
];

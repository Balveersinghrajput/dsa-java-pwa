import type { TopicContent } from "./types";

// Phases 13–14: Greedy algorithms and graphs.
export const content: Record<string, TopicContent> = {
  "greedy-basics": {
    summary: "Make the locally best choice at every step — and learn to prove (or disprove) that it leads to the global best.",
    explanation: [
      "A greedy algorithm builds a solution step by step, always taking the option that looks best right now, and never reconsidering. It's usually simple and fast — often just a sort plus a loop.",
      "Greedy works when the problem has the greedy-choice property (some optimal solution starts with the greedy choice) and optimal substructure. Prove it with an exchange argument: show that swapping any optimal solution's choice for the greedy one doesn't make it worse.",
      "Greedy fails on problems like 0/1 knapsack or coin change with arbitrary coins (coins {1, 3, 4} for amount 6: greedy picks 4+1+1 = 3 coins, optimal is 3+3 = 2). Those need DP.",
      "Fractional knapsack is greedy: sort by value/weight and take as much of the best ratio as possible. Jump Game is greedy: track the farthest index reachable so far.",
    ],
    prerequisites: ["Sorting", "Comparators"],
    objectives: ["Recognise greedy-choice property", "Use exchange arguments", "Know when to switch to DP"],
    analogy: "Paying with the fewest banknotes by always using the largest note that fits — it works for normal currencies, but not for strange coin systems.",
    code: [
      {
        title: "Jump game and fractional knapsack",
        java: `import java.util.*;

public class Main {
    static boolean canJump(int[] a) {
        int farthest = 0;
        for (int i = 0; i < a.length; i++) {
            if (i > farthest) return false;           // can't even reach i
            farthest = Math.max(farthest, i + a[i]);
        }
        return true;
    }

    static double fractionalKnapsack(int[] value, int[] weight, int cap) {
        Integer[] idx = new Integer[value.length];
        for (int i = 0; i < idx.length; i++) idx[i] = i;
        Arrays.sort(idx, (x, y) -> Double.compare((double) value[y] / weight[y], (double) value[x] / weight[x]));
        double total = 0;
        for (int i : idx) {
            if (cap == 0) break;
            int take = Math.min(cap, weight[i]);
            total += take * (double) value[i] / weight[i];
            cap -= take;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2, 3, 1, 1, 4}) + " " + canJump(new int[]{3, 2, 1, 0, 4})); // true false
        System.out.println(fractionalKnapsack(new int[]{60, 100, 120}, new int[]{10, 20, 30}, 50));     // 240.0
    }
}`,
      },
    ],
    steps: [
      { title: "Ratios", detail: "60/10 = 6, 100/20 = 5, 120/30 = 4" },
      { title: "Take best first", detail: "All of item 1 (10 kg, 60) and item 2 (20 kg, 100) → 30 kg used" },
      { title: "Fill the rest", detail: "20 of 30 kg of item 3 → 80; total 240" },
    ],
    mistakes: ["Assuming greedy works without a proof or counter-example check", "Using greedy for 0/1 knapsack", "Integer division when computing ratios"],
    complexity: [{ op: "Jump game", time: "O(n)", space: "O(1)" }, { op: "Fractional knapsack", time: "O(n log n)", space: "O(n)" }],
    revision: ["Greedy = local best, never undo", "Prove with an exchange argument", "Try small counter-examples", "0/1 knapsack and coin change need DP"],
  },

  intervals: {
    summary: "Sort intervals by start or end, then sweep: merge overlaps, insert new intervals and pick the most non-overlapping ones.",
    explanation: [
      "Almost every interval problem starts by sorting. Sort by start to merge or insert; sort by end to select the maximum number of non-overlapping intervals.",
      "Merge Intervals: sort by start and keep a current interval. If the next one starts before the current ends, extend the end; otherwise close the current and start a new one.",
      "Activity selection (or 'minimum removals to make intervals non-overlapping'): sort by end time and always pick the interval that finishes first — it leaves the most room for the rest.",
      "Meeting rooms: sort start and end times separately (or use a min-heap of end times) to count how many meetings overlap at the busiest moment.",
    ],
    prerequisites: ["Greedy basics", "Comparators"],
    objectives: ["Merge and insert intervals", "Maximise non-overlapping intervals", "Count overlaps with a heap or sweep"],
    analogy: "Booking a single conference room for the most meetings: always accept the meeting that ends earliest, freeing the room soonest.",
    code: [
      {
        title: "Merge intervals and erase overlap",
        java: `import java.util.*;

public class Main {
    static int[][] merge(int[][] iv) {
        Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] cur : iv) {
            if (out.isEmpty() || out.get(out.size() - 1)[1] < cur[0]) out.add(cur);
            else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
        }
        return out.toArray(new int[0][]);
    }

    static int eraseOverlapIntervals(int[][] iv) {
        Arrays.sort(iv, (a, b) -> Integer.compare(a[1], b[1]));  // by end
        int kept = 0, end = Integer.MIN_VALUE;
        for (int[] cur : iv) if (cur[0] >= end) { kept++; end = cur[1]; }
        return iv.length - kept;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(merge(new int[][]{{1, 3}, {8, 10}, {2, 6}, {15, 18}}))); // [[1, 6], [8, 10], [15, 18]]
        System.out.println(eraseOverlapIntervals(new int[][]{{1, 2}, {2, 3}, {3, 4}, {1, 3}}));          // 1
    }
}`,
      },
    ],
    steps: [
      { title: "Sort", detail: "[1,3], [2,6], [8,10], [15,18]" },
      { title: "[2,6] overlaps [1,3]", detail: "Extend to [1,6]" },
      { title: "[8,10] and [15,18]", detail: "No overlap → append each" },
    ],
    mistakes: ["Forgetting to sort", "Sorting by start when the greedy needs end", "Treating touching intervals ([1,2] and [2,3]) incorrectly — read whether endpoints overlap"],
    complexity: [{ op: "Merge / insert / select", time: "O(n log n)", space: "O(n)" }, { op: "Meeting rooms with heap", time: "O(n log n)", space: "O(n)" }],
    revision: ["Sort first", "Merge: sort by start", "Max non-overlapping: sort by end", "Overlap count: heap of end times"],
  },

  "greedy-advanced": {
    summary: "Two-pass greedy techniques and Huffman coding — building optimal prefix codes with a priority queue.",
    explanation: [
      "Some constraints depend on both neighbours. Candy distribution: one left-to-right pass enforces 'higher rating than left neighbour gets more', one right-to-left pass enforces the right neighbour, and taking the max of both satisfies both rules.",
      "Gas Station is another one-pass greedy: if the running tank drops below zero, no station up to here can be the start, so restart from the next station.",
      "Huffman coding compresses text by giving frequent characters short codes. Repeatedly remove the two least-frequent nodes from a min-heap, join them under a new node with their combined frequency, and push it back. The resulting tree gives an optimal prefix-free code.",
    ],
    prerequisites: ["Greedy basics", "Heaps"],
    objectives: ["Apply two-pass greedy", "Build a Huffman tree with a PriorityQueue"],
    analogy: "Huffman coding is like nicknames: the people you talk about most get the shortest nicknames.",
    code: [
      {
        title: "Candy (two passes) and Huffman cost",
        java: `import java.util.*;

public class Main {
    static int candy(int[] r) {
        int n = r.length;
        int[] c = new int[n];
        Arrays.fill(c, 1);
        for (int i = 1; i < n; i++) if (r[i] > r[i - 1]) c[i] = c[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (r[i] > r[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
        return Arrays.stream(c).sum();
    }

    static long huffmanCost(int[] freq) {        // total bits = sum of merge costs
        PriorityQueue<Long> pq = new PriorityQueue<>();
        for (int f : freq) pq.offer((long) f);
        long cost = 0;
        while (pq.size() > 1) {
            long a = pq.poll(), b = pq.poll();
            cost += a + b;
            pq.offer(a + b);
        }
        return cost;
    }

    public static void main(String[] args) {
        System.out.println(candy(new int[]{1, 0, 2}));                 // 5
        System.out.println(huffmanCost(new int[]{5, 9, 12, 13, 16, 45})); // 224
    }
}`,
      },
    ],
    steps: [
      { title: "Merge 5 + 9", detail: "→ 14, cost 14" },
      { title: "Merge 12 + 13, then 14 + 16", detail: "→ 25 and 30, cost 14 + 25 + 30" },
      { title: "Merge 25 + 30, then 45 + 55", detail: "→ 55 and 100; total cost 224 bits" },
    ],
    mistakes: ["Doing only one pass for two-sided constraints", "Using a max-heap in Huffman", "int overflow when summing large frequencies"],
    complexity: [{ op: "Candy", time: "O(n)", space: "O(n)" }, { op: "Huffman", time: "O(n log n)", space: "O(n)" }],
    revision: ["Two-sided rules → two passes, take max", "Huffman: merge two smallest repeatedly"],
    visual: "heap",
  },

  "graph-basics": {
    summary: "Represent graphs with adjacency lists, traverse with BFS and DFS, and count connected components.",
    explanation: [
      "A graph is a set of vertices connected by edges, which may be directed or undirected, weighted or unweighted. An adjacency list (List<List<Integer>>) uses O(V + E) memory and is the default; an adjacency matrix uses O(V²) but answers 'is there an edge?' in O(1).",
      "BFS explores level by level with a queue, marking nodes visited when they're enqueued. In an unweighted graph, it finds shortest paths in number of edges.",
      "DFS goes as deep as possible before backtracking, using recursion or an explicit stack. It's the basis for cycle detection, topological sort and connected components.",
      "Counting components: loop over all vertices; each unvisited vertex starts a new BFS/DFS that marks its whole component.",
    ],
    prerequisites: ["Queues & stacks", "Recursion", "ArrayList"],
    objectives: ["Build adjacency lists from edge lists", "Write BFS and DFS", "Count connected components"],
    analogy: "BFS is ripples spreading from a stone dropped in water; DFS is exploring a cave, following one tunnel to its end before trying the next.",
    code: [
      {
        title: "Adjacency list, BFS, DFS and components",
        java: `import java.util.*;

public class Main {
    static List<List<Integer>> build(int n, int[][] edges) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }   // undirected
        return g;
    }

    static List<Integer> bfs(List<List<Integer>> g, int src) {
        List<Integer> order = new ArrayList<>();
        boolean[] seen = new boolean[g.size()];
        Queue<Integer> q = new ArrayDeque<>();
        q.offer(src); seen[src] = true;                  // mark when enqueuing
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; q.offer(v); }
        }
        return order;
    }

    static void dfs(List<List<Integer>> g, int u, boolean[] seen, List<Integer> order) {
        seen[u] = true; order.add(u);
        for (int v : g.get(u)) if (!seen[v]) dfs(g, v, seen, order);
    }

    public static void main(String[] args) {
        List<List<Integer>> g = build(7, new int[][]{{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {5, 6}});
        System.out.println(bfs(g, 0));                          // [0, 1, 2, 3, 4]
        List<Integer> d = new ArrayList<>();
        dfs(g, 0, new boolean[7], d);
        System.out.println(d);                                  // [0, 1, 3, 2, 4]
        boolean[] seen = new boolean[7];
        int components = 0;
        for (int i = 0; i < 7; i++) if (!seen[i]) { components++; dfs(g, i, seen, new ArrayList<>()); }
        System.out.println(components);                         // 2
    }
}`,
      },
    ],
    steps: [
      { title: "Start at 0", detail: "Queue [0]; visit 0, enqueue 1 and 2" },
      { title: "Level 1", detail: "Visit 1 (enqueue 3), visit 2 (3 already seen)" },
      { title: "Level 2+", detail: "Visit 3 (enqueue 4), visit 4. Nodes 5–6 form a second component" },
    ],
    mistakes: ["Marking visited when dequeuing (nodes get enqueued many times)", "Forgetting to add both directions for undirected edges", "Deep recursion on large graphs (StackOverflowError) — use an explicit stack"],
    complexity: [{ op: "BFS / DFS", time: "O(V + E)", space: "O(V)" }, { op: "Adjacency list memory", time: "—", space: "O(V + E)" }, { op: "Adjacency matrix memory", time: "—", space: "O(V²)" }],
    revision: ["Adjacency list by default", "BFS = queue, shortest edges in unweighted graphs", "Mark visited when enqueuing", "Components = number of DFS starts"],
    visual: "graph",
  },

  "grid-graphs": {
    summary: "Treat a 2D grid as a graph: 4-direction moves, flood fill, multi-source BFS and boundary DFS.",
    explanation: [
      "Each cell is a vertex; neighbours are the cells up, down, left and right. A direction array int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}} keeps the code short; check bounds before stepping.",
      "Number of Islands: scan the grid; every unvisited land cell starts a DFS/BFS that sinks (marks) the whole island. Count the starts.",
      "Multi-source BFS starts with all sources in the queue at distance 0 — e.g. all rotten oranges at once. The BFS levels are then minutes, and the last level is the answer.",
      "Boundary DFS solves 'surrounded regions' and 'enclaves': start DFS from border cells to mark everything connected to the edge; whatever remains is enclosed.",
    ],
    prerequisites: ["Graph BFS & DFS", "2D arrays"],
    objectives: ["Traverse grids with direction arrays", "Count islands", "Run multi-source BFS"],
    analogy: "Multi-source BFS is like several fires starting at the same moment — they all spread one cell per minute simultaneously.",
    code: [
      {
        title: "Number of islands and rotting oranges",
        java: `import java.util.*;

public class Main {
    static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    static void sink(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        for (int[] d : DIRS) sink(g, r + d[0], c + d[1]);
    }

    static int islands(char[][] g) {
        int count = 0;
        for (int r = 0; r < g.length; r++)
            for (int c = 0; c < g[0].length; c++)
                if (g[r][c] == '1') { count++; sink(g, r, c); }
        return count;
    }

    static int orangesRotting(int[][] g) {
        Queue<int[]> q = new ArrayDeque<>();
        int fresh = 0;
        for (int r = 0; r < g.length; r++)
            for (int c = 0; c < g[0].length; c++) {
                if (g[r][c] == 2) q.offer(new int[]{r, c});   // all sources at time 0
                else if (g[r][c] == 1) fresh++;
            }
        int minutes = 0;
        while (!q.isEmpty() && fresh > 0) {
            for (int size = q.size(); size > 0; size--) {
                int[] cur = q.poll();
                for (int[] d : DIRS) {
                    int nr = cur[0] + d[0], nc = cur[1] + d[1];
                    if (nr < 0 || nc < 0 || nr >= g.length || nc >= g[0].length || g[nr][nc] != 1) continue;
                    g[nr][nc] = 2; fresh--; q.offer(new int[]{nr, nc});
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }

    public static void main(String[] args) {
        char[][] grid = {"11000".toCharArray(), "11000".toCharArray(), "00100".toCharArray(), "00011".toCharArray()};
        System.out.println(islands(grid));                                          // 3
        System.out.println(orangesRotting(new int[][]{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}})); // 4
    }
}`,
      },
    ],
    steps: [
      { title: "Minute 0", detail: "Queue holds the rotten orange at (0,0)" },
      { title: "Minutes 1–3", detail: "Rot spreads to neighbours level by level" },
      { title: "Minute 4", detail: "The last fresh orange at (2,2) rots → answer 4" },
    ],
    mistakes: ["Bounds checks after array access (IndexOutOfBounds)", "Running a separate BFS from each source (O(k·m·n))", "Counting a minute when nothing changed"],
    complexity: [{ op: "Islands / flood fill", time: "O(m·n)", space: "O(m·n) worst stack" }, { op: "Multi-source BFS", time: "O(m·n)", space: "O(m·n)" }],
    revision: ["DIRS array + bounds check", "Islands = DFS starts", "Multi-source: enqueue all sources first", "Boundary DFS for enclosed regions"],
    visual: "matrix",
  },

  "cycle-bipartite": {
    summary: "Detect cycles in undirected and directed graphs, and check whether a graph can be 2-coloured (bipartite).",
    explanation: [
      "Undirected graphs: during DFS, meeting an already-visited neighbour that isn't the node you came from (the parent) means a cycle. Union-Find also works: an edge joining two nodes already in the same set closes a cycle.",
      "Directed graphs need more: a visited node might be on a different, finished branch. Track three states — unvisited, in the current path (visiting), done. Reaching a node that's 'visiting' means a back edge, i.e. a cycle. Kahn's algorithm (topological sort) detects it too: if not all nodes get processed, there's a cycle.",
      "A graph is bipartite if its nodes can be split into two groups with every edge going across. Try to colour it with BFS/DFS, giving each neighbour the opposite colour; a conflict (same colour on both ends) means it's not bipartite — exactly when there's an odd-length cycle.",
    ],
    prerequisites: ["Graph BFS & DFS"],
    objectives: ["Detect cycles in undirected and directed graphs", "Explain why directed graphs need path tracking", "2-colour a graph"],
    analogy: "Bipartite checking is seating guests at two tables so that no two people who dislike each other share a table.",
    code: [
      {
        title: "Directed cycle (3 states) and bipartite check",
        java: `import java.util.*;

public class Main {
    static boolean hasCycle(List<List<Integer>> g, int u, int[] state) {   // 0 new, 1 visiting, 2 done
        state[u] = 1;
        for (int v : g.get(u)) {
            if (state[v] == 1) return true;                       // back edge
            if (state[v] == 0 && hasCycle(g, v, state)) return true;
        }
        state[u] = 2;
        return false;
    }

    static boolean isBipartite(int[][] graph) {
        int[] color = new int[graph.length];                      // 0 uncoloured, 1 / -1
        for (int s = 0; s < graph.length; s++) {
            if (color[s] != 0) continue;
            Queue<Integer> q = new ArrayDeque<>();
            q.offer(s); color[s] = 1;
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : graph[u]) {
                    if (color[v] == color[u]) return false;
                    if (color[v] == 0) { color[v] = -color[u]; q.offer(v); }
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = List.of(List.of(1), List.of(2), List.of(0), List.of());  // 0→1→2→0
        int[] state = new int[4];
        boolean cyc = false;
        for (int i = 0; i < 4 && !cyc; i++) if (state[i] == 0) cyc = hasCycle(g, i, state);
        System.out.println(cyc);                                                         // true
        System.out.println(isBipartite(new int[][]{{1, 3}, {0, 2}, {1, 3}, {0, 2}}));    // true (square)
        System.out.println(isBipartite(new int[][]{{1, 2}, {0, 2}, {0, 1}}));            // false (triangle)
    }
}`,
      },
    ],
    steps: [
      { title: "Visit 0", detail: "state[0] = visiting; go to 1, then 2" },
      { title: "From 2", detail: "Edge 2 → 0 and 0 is still 'visiting' → back edge" },
      { title: "Result", detail: "Cycle found" },
    ],
    mistakes: ["Using a plain visited[] for directed graphs (false positives on cross edges)", "Ignoring the parent in undirected DFS (every edge looks like a cycle)", "Only checking component 0 for bipartiteness"],
    complexity: [{ op: "Cycle detection", time: "O(V + E)", space: "O(V)" }, { op: "Bipartite check", time: "O(V + E)", space: "O(V)" }],
    revision: ["Undirected: visited neighbour ≠ parent → cycle", "Directed: visiting → visiting edge → cycle", "Bipartite ⇔ no odd cycle"],
    visual: "graph",
  },

  "topo-sort": {
    summary: "Order the nodes of a DAG so every edge points forward — with Kahn's in-degree BFS or DFS post-order.",
    explanation: [
      "A topological order lists vertices so that for every directed edge u → v, u comes before v. It exists only for directed acyclic graphs (DAGs) — think course prerequisites or build dependencies.",
      "Kahn's algorithm: compute in-degrees, enqueue all nodes with in-degree 0, and repeatedly dequeue a node, append it to the order and decrement its neighbours' in-degrees (enqueuing those that reach 0). If the order has fewer than V nodes, the graph has a cycle.",
      "DFS method: run DFS and push each node onto a stack after all its descendants are finished (post-order). Reversing that post-order gives a topological order.",
    ],
    prerequisites: ["Graph BFS & DFS", "Cycle detection"],
    objectives: ["Implement Kahn's algorithm", "Implement DFS-based topological sort", "Detect impossible orderings (cycles)"],
    analogy: "Getting dressed: socks before shoes, shirt before jacket — any order that respects every 'before' rule is a topological order.",
    code: [
      {
        title: "Kahn's algorithm (course schedule order)",
        java: `import java.util.*;

public class Main {
    static int[] findOrder(int n, int[][] prereq) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] p : prereq) { g.get(p[1]).add(p[0]); indeg[p[0]]++; }   // p[1] before p[0]

        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
        int[] order = new int[n];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[k++] = u;
            for (int v : g.get(u)) if (--indeg[v] == 0) q.offer(v);
        }
        return k == n ? order : new int[0];          // empty = cycle
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(findOrder(4, new int[][]{{1, 0}, {2, 0}, {3, 1}, {3, 2}}))); // [0, 1, 2, 3]
        System.out.println(Arrays.toString(findOrder(2, new int[][]{{0, 1}, {1, 0}})));                 // []
    }
}`,
      },
    ],
    steps: [
      { title: "In-degrees", detail: "0:0, 1:1, 2:1, 3:2 → queue [0]" },
      { title: "Take 0", detail: "1 and 2 drop to 0 → queue [1, 2]" },
      { title: "Take 1, 2", detail: "3 drops to 1, then 0 → queue [3]; order 0, 1, 2, 3" },
    ],
    mistakes: ["Reversing the edge direction from the problem statement", "Not checking for a cycle (order shorter than n)", "Forgetting to reverse the DFS post-order"],
    complexity: [{ op: "Kahn's / DFS topo sort", time: "O(V + E)", space: "O(V + E)" }],
    revision: ["Only DAGs have a topological order", "Kahn: queue of in-degree 0", "Fewer than V processed → cycle", "DFS: reverse post-order"],
    visual: "graph",
  },

  "shortest-path": {
    summary: "Shortest paths with BFS (unweighted), Dijkstra (non-negative weights), 0-1 BFS, and counting shortest paths.",
    explanation: [
      "In an unweighted graph, BFS from the source gives the shortest distance in edges to every node.",
      "Dijkstra handles non-negative weights: keep a min-heap of (distance, node). Pop the closest unfinished node and relax its edges — if dist[u] + w < dist[v], update dist[v] and push it. Skip stale heap entries whose distance is larger than the recorded one. O((V + E) log V).",
      "When weights are only 0 or 1, a deque replaces the heap: push 0-weight neighbours to the front and 1-weight neighbours to the back — O(V + E).",
      "To count shortest paths, keep ways[v]: when you find a strictly shorter path, reset ways[v] = ways[u]; when you find an equally short path, add ways[u].",
      "Dijkstra fails with negative edges — use Bellman-Ford instead.",
    ],
    prerequisites: ["BFS", "PriorityQueue"],
    objectives: ["Choose BFS vs Dijkstra vs 0-1 BFS", "Implement Dijkstra with lazy deletion", "Count shortest paths"],
    analogy: "Dijkstra is water flowing from the source through pipes of different lengths: it reaches nearer junctions first, and each junction's arrival time is final once reached.",
    code: [
      {
        title: "Dijkstra with a PriorityQueue",
        java: `import java.util.*;

public class Main {
    static long[] dijkstra(int n, int[][] edges, int src) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) g.get(e[0]).add(new int[]{e[1], e[2]});   // directed u -> v (w)

        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        pq.offer(new long[]{0, src});
        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;                 // stale entry
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.offer(new long[]{dist[v], v}); }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};
        System.out.println(Arrays.toString(dijkstra(4, edges, 0)));   // [0, 3, 1, 4]
    }
}`,
      },
    ],
    steps: [
      { title: "Pop 0 (d=0)", detail: "Relax: dist[1] = 4, dist[2] = 1" },
      { title: "Pop 2 (d=1)", detail: "Relax: dist[1] = 3 (better), dist[3] = 6" },
      { title: "Pop 1 (d=3)", detail: "Relax: dist[3] = 4. The old (4, node 1) entry is stale and skipped later" },
    ],
    mistakes: ["Using Dijkstra with negative weights", "Not skipping stale heap entries (slow, sometimes wrong when marking done)", "int overflow when adding to Integer.MAX_VALUE", "Using BFS on weighted graphs"],
    complexity: [{ op: "BFS (unweighted)", time: "O(V + E)", space: "O(V)" }, { op: "Dijkstra (binary heap)", time: "O((V + E) log V)", space: "O(V + E)" }, { op: "0-1 BFS", time: "O(V + E)", space: "O(V)" }],
    revision: ["Unweighted → BFS", "Non-negative weights → Dijkstra", "0/1 weights → deque", "Skip if popped distance > dist[u]"],
    visual: "graph",
  },

  "bellman-floyd": {
    summary: "Bellman-Ford handles negative edges and detects negative cycles; Floyd-Warshall computes all-pairs shortest paths.",
    explanation: [
      "Bellman-Ford relaxes every edge V − 1 times. A shortest path uses at most V − 1 edges, so after that many rounds all distances are final. If a V-th round still improves something, a negative cycle is reachable. O(V·E).",
      "A useful variant limits the number of edges: K rounds of relaxation (copying the distance array each round) gives the cheapest path with at most K edges — e.g. 'Cheapest Flights Within K Stops'.",
      "Floyd-Warshall finds shortest paths between every pair with dynamic programming over intermediate vertices: for each k, for each i, j: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). O(V³), fine for V up to a few hundred. A negative value on the diagonal reveals a negative cycle.",
    ],
    prerequisites: ["Dijkstra", "2D arrays / DP idea"],
    objectives: ["Run Bellman-Ford and detect negative cycles", "Solve 'at most K edges' paths", "Compute all-pairs distances with Floyd-Warshall"],
    analogy: "Bellman-Ford is repeating a rumour round after round: after enough rounds, everyone has heard the best version of the news.",
    code: [
      {
        title: "Bellman-Ford and Floyd-Warshall",
        java: `import java.util.*;

public class Main {
    static final long INF = Long.MAX_VALUE / 4;

    static long[] bellmanFord(int n, int[][] edges, int src) {
        long[] d = new long[n];
        Arrays.fill(d, INF);
        d[src] = 0;
        for (int round = 0; round < n - 1; round++)
            for (int[] e : edges)
                if (d[e[0]] != INF && d[e[0]] + e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
        for (int[] e : edges)
            if (d[e[0]] != INF && d[e[0]] + e[2] < d[e[1]]) throw new IllegalStateException("negative cycle");
        return d;
    }

    static long[][] floyd(int n, int[][] edges) {
        long[][] d = new long[n][n];
        for (long[] row : d) Arrays.fill(row, INF);
        for (int i = 0; i < n; i++) d[i][i] = 0;
        for (int[] e : edges) d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]);
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        return d;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 4}, {0, 2, 5}, {1, 2, -3}, {2, 3, 4}};
        System.out.println(Arrays.toString(bellmanFord(4, edges, 0)));  // [0, 4, 1, 5]
        System.out.println(floyd(4, edges)[0][3]);                      // 5
    }
}`,
      },
    ],
    steps: [
      { title: "Round 1", detail: "d[1] = 4, d[2] = 5 then improved to 4 − 3 = 1, d[3] = 5" },
      { title: "Rounds 2–3", detail: "Nothing changes — distances are final" },
      { title: "Check round", detail: "No further improvement → no negative cycle" },
    ],
    mistakes: ["Relaxing from unreachable nodes (INF + negative)", "Using INF = Long.MAX_VALUE then adding (overflow)", "Putting k in the inner loop of Floyd-Warshall (must be outermost)", "For K-stops, not copying the array each round"],
    complexity: [{ op: "Bellman-Ford", time: "O(V·E)", space: "O(V)" }, { op: "Floyd-Warshall", time: "O(V³)", space: "O(V²)" }],
    revision: ["Relax all edges V − 1 times", "V-th improvement → negative cycle", "Floyd: k outermost", "Use INF = MAX / 4"],
    visual: "graph",
  },

  "mst-dsu": {
    summary: "Union-Find with path compression and union by rank, and minimum spanning trees with Kruskal's and Prim's algorithms.",
    explanation: [
      "Disjoint Set Union (Union-Find) tracks which elements are in the same group. find(x) returns a group's representative; union(a, b) merges two groups. Path compression (point nodes directly at the root during find) and union by rank/size (attach the smaller tree under the larger) make both nearly O(1) — O(α(n)) amortised.",
      "A minimum spanning tree (MST) connects all vertices of a weighted undirected graph with the smallest total edge weight and no cycles (V − 1 edges).",
      "Kruskal: sort edges by weight and add each one unless it would create a cycle — Union-Find answers that instantly. O(E log E).",
      "Prim: grow the tree from a start vertex, always adding the cheapest edge that reaches a new vertex, using a min-heap. O(E log V).",
    ],
    prerequisites: ["Graphs", "Greedy", "Heaps"],
    objectives: ["Implement DSU with both optimisations", "Build an MST with Kruskal", "Build an MST with Prim"],
    analogy: "Union-Find is merging friend groups at a party: each group has a spokesperson, and asking anyone 'who's your spokesperson?' tells you which group they're in.",
    code: [
      {
        title: "DSU and Kruskal's MST",
        java: `import java.util.*;

public class Main {
    static class DSU {
        int[] parent, size;
        DSU(int n) { parent = new int[n]; size = new int[n]; for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; } }
        int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }   // path compression
        boolean union(int a, int b) {
            a = find(a); b = find(b);
            if (a == b) return false;                       // already connected → would make a cycle
            if (size[a] < size[b]) { int t = a; a = b; b = t; }
            parent[b] = a; size[a] += size[b];              // union by size
            return true;
        }
    }

    static int kruskal(int n, int[][] edges) {
        Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
        DSU dsu = new DSU(n);
        int total = 0, used = 0;
        for (int[] e : edges) {
            if (dsu.union(e[0], e[1])) { total += e[2]; if (++used == n - 1) break; }
        }
        return used == n - 1 ? total : -1;                  // -1: graph not connected
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}};
        System.out.println(kruskal(4, edges));              // 19 (4 + 5 + 10)
    }
}`,
      },
    ],
    steps: [
      { title: "Sorted edges", detail: "(2,3,4), (0,3,5), (0,2,6), (0,1,10), (1,3,15)" },
      { title: "Add 4 and 5", detail: "Joins {2,3} and then 0" },
      { title: "Skip 6, add 10", detail: "0 and 2 are already connected; 10 brings in node 1 → total 19" },
    ],
    mistakes: ["find without path compression on long chains (slow)", "Forgetting to compare roots, not the original nodes", "Running Kruskal on a directed graph", "Not detecting a disconnected graph"],
    complexity: [{ op: "DSU find / union", time: "O(α(n)) ≈ O(1) amortised", space: "O(n)" }, { op: "Kruskal", time: "O(E log E)", space: "O(V)" }, { op: "Prim (heap)", time: "O(E log V)", space: "O(V + E)" }],
    revision: ["Path compression + union by size", "union returns false → cycle", "Kruskal: sort edges + DSU", "Prim: grow with a min-heap"],
    visual: "graph",
  },

  "scc-bridges": {
    summary: "Strongly connected components (Kosaraju, Tarjan) and critical edges/vertices (bridges and articulation points).",
    explanation: [
      "In a directed graph, a strongly connected component (SCC) is a maximal set of vertices where each can reach every other.",
      "Kosaraju: (1) DFS the graph and record vertices by finish time, (2) reverse every edge, (3) DFS the reversed graph in decreasing finish time — each DFS tree is one SCC. O(V + E).",
      "Tarjan's algorithm finds SCCs in one DFS using discovery times and low-link values (the earliest discovery time reachable through the subtree plus one back edge).",
      "In undirected graphs the same low-link idea finds bridges — an edge u–v is a bridge if low[v] > disc[u] (v's subtree can't reach u or above without that edge) — and articulation points (vertices whose removal disconnects the graph).",
    ],
    prerequisites: ["DFS", "Topological sort"],
    objectives: ["Find SCCs with Kosaraju", "Compute discovery and low-link times", "Find bridges in an undirected graph"],
    analogy: "SCCs are neighbourhoods connected by one-way streets where you can drive from any house to any other and back. Bridges are the only road connecting two parts of a city.",
    code: [
      {
        title: "Bridges with Tarjan's low-link",
        java: `import java.util.*;

public class Main {
    static List<List<Integer>> g;
    static int[] disc, low;
    static int timer = 0;
    static List<int[]> bridges = new ArrayList<>();

    static void dfs(int u, int parent) {
        disc[u] = low[u] = ++timer;
        for (int v : g.get(u)) {
            if (v == parent) continue;
            if (disc[v] == 0) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) bridges.add(new int[]{u, v});   // no back edge around u-v
            } else low[u] = Math.min(low[u], disc[v]);                 // back edge
        }
    }

    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0, 1}, {1, 2}, {2, 0}, {1, 3}, {3, 4}};
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
        disc = new int[n]; low = new int[n];
        for (int i = 0; i < n; i++) if (disc[i] == 0) dfs(i, -1);
        for (int[] b : bridges) System.out.println(b[0] + "-" + b[1]);   // 3-4 and 1-3
    }
}`,
      },
    ],
    steps: [
      { title: "Triangle 0-1-2", detail: "Back edge 2–0 gives low = 1 for all three → none of those edges is a bridge" },
      { title: "Edge 3–4", detail: "low[4] = 5 > disc[3] = 4 → bridge" },
      { title: "Edge 1–3", detail: "low[3] = 4 > disc[1] = 2 → bridge" },
    ],
    mistakes: ["Using low[v] instead of disc[v] for back edges (works for SCC variants but be careful)", "Skipping the parent check (every tree edge looks like a back edge)", "Not reversing edges in Kosaraju's second pass"],
    complexity: [{ op: "Kosaraju / Tarjan SCC", time: "O(V + E)", space: "O(V + E)" }, { op: "Bridges / articulation points", time: "O(V + E)", space: "O(V)" }],
    revision: ["Kosaraju: finish order → reverse graph → DFS", "low[u] = min(disc of back edges, low of children)", "Bridge: low[v] > disc[u]", "Articulation: low[v] >= disc[u] (non-root)"],
    visual: "graph",
  },
};

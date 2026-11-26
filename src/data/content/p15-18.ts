import type { TopicContent } from "./types";

// Phases 15–18: Dynamic programming, tries, advanced data structures, revision.
export const content: Record<string, TopicContent> = {
  "dp-1d": {
    summary: "Dynamic programming = recursion + remembering answers. Go from recursion to memoization to tabulation to O(1) space.",
    explanation: [
      "DP applies when a problem has overlapping subproblems (the same smaller problem is solved again and again) and optimal substructure (the best answer is built from best answers to smaller problems).",
      "Start with a recursive definition. For climbing stairs, ways(n) = ways(n − 1) + ways(n − 2). Plain recursion recomputes values exponentially often.",
      "Memoization caches each result the first time it's computed (top-down). Tabulation fills a table from the smallest subproblem upward (bottom-up). Both turn O(2ⁿ) into O(n).",
      "If each state only depends on the previous one or two, keep just those variables: O(1) space. House Robber is the classic: best(i) = max(best(i − 1), best(i − 2) + nums[i]).",
      "The DP recipe: define the state in words, write the recurrence, set base cases, choose the order of computation, then optimise space.",
    ],
    prerequisites: ["Recursion", "Arrays"],
    objectives: ["Spot overlapping subproblems", "Convert recursion → memo → table → O(1) space", "Write 1D recurrences"],
    analogy: "DP is writing answers on sticky notes: when the same question comes up again, you read the note instead of re-solving it.",
    code: [
      {
        title: "Fibonacci four ways and House Robber",
        java: `import java.util.*;

public class Main {
    static long fibRec(int n) { return n < 2 ? n : fibRec(n - 1) + fibRec(n - 2); }           // O(2^n)

    static long[] memo = new long[91];
    static long fibMemo(int n) {                                                             // O(n)
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    }

    static long fibTable(int n) {                                                            // O(n), O(n) space
        if (n < 2) return n;
        long[] dp = new long[n + 1];
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    static long fibSpace(int n) {                                                            // O(n), O(1) space
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }
        return a;
    }

    static int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;                       // best up to i-2 and i-1
        for (int x : nums) { int cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }
        return prev1;
    }

    public static void main(String[] args) {
        System.out.println(fibRec(20) + " " + fibMemo(50) + " " + fibTable(50) + " " + fibSpace(90));
        System.out.println(rob(new int[]{2, 7, 9, 3, 1}));   // 12 (2 + 9 + 1)
    }
}`,
      },
    ],
    steps: [
      { title: "State", detail: "best(i) = most money from houses 0..i" },
      { title: "Choice", detail: "Skip house i (best(i−1)) or rob it (best(i−2) + nums[i])" },
      { title: "Fill", detail: "2 → 7 → 11 → 11 → 12" },
    ],
    mistakes: ["Jumping to a table before you can state the recurrence in words", "Wrong base cases", "Memo with 0 as 'not computed' when 0 is a valid answer — use −1 or Long objects", "Iterating in the wrong order (needing values not computed yet)"],
    complexity: [{ op: "Naive recursion", time: "O(2ⁿ)", space: "O(n)" }, { op: "Memo / table", time: "O(n)", space: "O(n)" }, { op: "Rolling variables", time: "O(n)", space: "O(1)" }],
    revision: ["Overlapping subproblems + optimal substructure", "State → recurrence → base → order → space", "Memo = top-down, table = bottom-up"],
    visual: "dp-table",
  },

  "dp-grid": {
    summary: "DP where the state is a cell: counting paths, avoiding obstacles, minimum path sums, triangles and two walkers.",
    explanation: [
      "On a grid where you can move right or down, the number of ways to reach cell (r, c) is ways(r − 1, c) + ways(r, c − 1). The first row and column have exactly one way each.",
      "Obstacles set a cell's ways to 0. Minimum path sum replaces + with min and adds the cell's cost.",
      "Triangle and falling-path problems move row by row; processing bottom-up often makes the boundaries simpler.",
      "Two walkers collecting cherries simultaneously need a 3D state (row, col1, col2) — both walkers move one row at a time.",
      "Grid DP usually compresses to one row: dp[c] already holds the value from the row above, and dp[c − 1] the value from the left.",
    ],
    prerequisites: ["1D DP", "2D arrays"],
    objectives: ["Write grid recurrences", "Handle obstacles and boundaries", "Compress 2D DP to one row"],
    analogy: "Counting routes through a city grid: the number of ways to reach a corner is the ways to arrive from the north plus the ways to arrive from the west.",
    code: [
      {
        title: "Unique paths with obstacles and min path sum",
        java: `public class Main {
    static int uniquePathsWithObstacles(int[][] g) {
        int cols = g[0].length;
        int[] dp = new int[cols];
        dp[0] = g[0][0] == 0 ? 1 : 0;
        for (int[] row : g)
            for (int c = 0; c < cols; c++) {
                if (row[c] == 1) dp[c] = 0;                 // obstacle
                else if (c > 0) dp[c] += dp[c - 1];          // from above (dp[c]) + from left
            }
        return dp[cols - 1];
    }

    static int minPathSum(int[][] g) {
        int m = g.length, n = g[0].length;
        int[][] dp = new int[m][n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (r == 0 && c == 0) dp[r][c] = g[0][0];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + g[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + g[r][c];
                else dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + g[r][c];
            }
        return dp[m - 1][n - 1];
    }

    public static void main(String[] args) {
        System.out.println(uniquePathsWithObstacles(new int[][]{{0, 0, 0}, {0, 1, 0}, {0, 0, 0}})); // 2
        System.out.println(minPathSum(new int[][]{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}));               // 7
    }
}`,
      },
    ],
    steps: [
      { title: "Row 0", detail: "dp = [1, 1, 1]" },
      { title: "Row 1", detail: "Middle is an obstacle → dp = [1, 0, 1]" },
      { title: "Row 2", detail: "dp = [1, 1, 2] → 2 paths" },
    ],
    mistakes: ["Initialising the whole first row to 1 even after an obstacle", "Index errors on the first row/column", "Forgetting that a blocked start means 0 paths"],
    complexity: [{ op: "Grid DP m×n", time: "O(m·n)", space: "O(n) with one row" }, { op: "Cherry pickup (3D)", time: "O(m·n²)", space: "O(n²)" }],
    revision: ["ways = top + left", "Obstacle → 0", "One row: dp[c] += dp[c − 1]"],
    visual: "dp-table",
  },

  "dp-knapsack": {
    summary: "Subset sum, 0/1 knapsack and unbounded knapsack (coin change) — and the difference between counting ways and optimising.",
    explanation: [
      "0/1 knapsack: each item is used at most once. dp[i][w] = best value using the first i items with capacity w = max(skip: dp[i−1][w], take: dp[i−1][w − wt] + val).",
      "With a 1D array, loop capacity from high to low so each item is counted once. Loop low to high and the item can be reused — that's the unbounded knapsack (coin change).",
      "Subset sum and partition equal subset sum are knapsack with booleans: can we reach exactly this sum?",
      "Same structure, different combine: counting ways adds possibilities (+), minimum coins takes min, maximum value takes max. For combinations (order doesn't matter), loop items outside and amounts inside.",
    ],
    prerequisites: ["1D and grid DP"],
    objectives: ["Write 0/1 and unbounded knapsack", "Explain the loop direction trick", "Switch between counting and optimising"],
    analogy: "Packing a suitcase with a weight limit: for each item you decide 'pack it' or 'leave it', and remember the best value you can achieve for every weight up to the limit.",
    code: [
      {
        title: "0/1 knapsack, coin change (min) and coin change (ways)",
        java: `import java.util.*;

public class Main {
    static int knapsack(int[] wt, int[] val, int cap) {
        int[] dp = new int[cap + 1];
        for (int i = 0; i < wt.length; i++)
            for (int w = cap; w >= wt[i]; w--)               // high → low: each item once
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
        return dp[cap];
    }

    static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a && dp[a - c] != Integer.MAX_VALUE) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
    }

    static int countWays(int[] coins, int amount) {        // combinations
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) dp[a] += dp[a - c];   // low → high: reuse allowed
        return dp[amount];
    }

    public static void main(String[] args) {
        System.out.println(knapsack(new int[]{1, 3, 4, 5}, new int[]{1, 4, 5, 7}, 7)); // 9
        System.out.println(minCoins(new int[]{1, 3, 4}, 6));                           // 2 (3 + 3)
        System.out.println(countWays(new int[]{1, 2, 5}, 5));                          // 4
    }
}`,
      },
    ],
    steps: [
      { title: "Items (wt, val)", detail: "(1,1), (3,4), (4,5), (5,7), capacity 7" },
      { title: "Best combos", detail: "3 + 4 → value 9; 5 + 1 → value 8" },
      { title: "Answer", detail: "dp[7] = 9" },
    ],
    mistakes: ["Looping capacity upward in 0/1 knapsack (items reused)", "Swapping loop order when counting combinations (counts permutations instead)", "Adding 1 to Integer.MAX_VALUE", "Greedy coin change on arbitrary coin sets"],
    complexity: [{ op: "0/1 knapsack", time: "O(n·W)", space: "O(W)" }, { op: "Coin change", time: "O(n·amount)", space: "O(amount)" }],
    revision: ["0/1: capacity high → low", "Unbounded: low → high", "Ways: +, min/max: optimise", "Combinations: coins outside"],
    visual: "dp-table",
  },

  "dp-strings": {
    summary: "Two-string DP: longest common subsequence, palindromic subsequences, edit distance and wildcard/regex matching.",
    explanation: [
      "With two strings, the state is usually dp[i][j] = answer for the first i characters of s and the first j of t.",
      "LCS: if s[i−1] == t[j−1], dp[i][j] = dp[i−1][j−1] + 1; otherwise max(dp[i−1][j], dp[i][j−1]). Walking back through the table recovers the subsequence itself.",
      "Longest palindromic subsequence = LCS(s, reverse(s)). Minimum insertions to make a palindrome = n − LPS.",
      "Edit distance: if characters match, dp[i][j] = dp[i−1][j−1]; otherwise 1 + min(insert dp[i][j−1], delete dp[i−1][j], replace dp[i−1][j−1]).",
      "Wildcard matching treats '*' as either empty (dp[i][j−1]) or eating one character (dp[i−1][j]).",
    ],
    prerequisites: ["Grid DP", "Strings"],
    objectives: ["Define dp[i][j] for two strings", "Implement LCS and edit distance", "Reduce related problems to LCS"],
    analogy: "Edit distance is the minimum number of keystrokes (insert, delete, replace) a spell-checker needs to turn one word into another.",
    code: [
      {
        title: "LCS and edit distance",
        java: `public class Main {
    static int lcs(String s, String t) {
        int[][] dp = new int[s.length() + 1][t.length() + 1];
        for (int i = 1; i <= s.length(); i++)
            for (int j = 1; j <= t.length(); j++)
                dp[i][j] = s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[s.length()][t.length()];
    }

    static int editDistance(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;          // delete everything
        for (int j = 0; j <= n; j++) dp[0][j] = j;          // insert everything
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
        return dp[m][n];
    }

    public static void main(String[] args) {
        System.out.println(lcs("abcde", "ace"));                // 3
        System.out.println(editDistance("horse", "ros"));       // 3
        String s = "bbbab";
        System.out.println(lcs(s, new StringBuilder(s).reverse().toString())); // 4 (longest palindromic subsequence)
    }
}`,
      },
    ],
    steps: [
      { title: "horse → rorse", detail: "Replace h with r" },
      { title: "rorse → rose", detail: "Delete r" },
      { title: "rose → ros", detail: "Delete e → 3 operations" },
    ],
    mistakes: ["Off-by-one between string index (i − 1) and table index (i)", "Forgetting base rows/columns in edit distance", "Confusing subsequence (gaps allowed) with substring (contiguous)"],
    complexity: [{ op: "LCS / edit distance", time: "O(m·n)", space: "O(m·n), or O(n) with two rows" }],
    revision: ["dp[i][j] = first i of s, first j of t", "Match → diagonal", "Edit: 1 + min(insert, delete, replace)", "LPS = LCS(s, reverse s)"],
    visual: "dp-table",
  },

  "dp-stocks": {
    summary: "Model buy/sell problems as a small state machine: holding or not holding, with transaction limits, cooldowns and fees.",
    explanation: [
      "All 'Best Time to Buy and Sell Stock' problems share one idea: each day you're in a state — holding a share or not — and you choose an action (buy, sell, rest).",
      "Track hold = best profit while holding and free = best profit while not holding. Each day: hold = max(hold, free − price); free = max(free, hold + price).",
      "At most k transactions adds a dimension: hold[t] and free[t] for t transactions used. Cooldown means you can buy only from the state two days ago. A fee is subtracted when selling.",
    ],
    prerequisites: ["1D DP"],
    objectives: ["Define states and transitions", "Handle transaction limits, cooldown and fees"],
    analogy: "Like a traffic light with two states — 'holding' and 'not holding' — and each day you decide whether to switch.",
    code: [
      {
        title: "Unlimited transactions, with fee, and at most 2",
        java: `public class Main {
    static int maxProfitFee(int[] prices, int fee) {
        int hold = -prices[0], free = 0;
        for (int i = 1; i < prices.length; i++) {
            int newHold = Math.max(hold, free - prices[i]);       // buy or keep holding
            free = Math.max(free, hold + prices[i] - fee);         // sell or keep resting
            hold = newHold;
        }
        return free;
    }

    static int maxProfitTwo(int[] prices) {
        int buy1 = Integer.MIN_VALUE, sell1 = 0, buy2 = Integer.MIN_VALUE, sell2 = 0;
        for (int p : prices) {
            buy1 = Math.max(buy1, -p);
            sell1 = Math.max(sell1, buy1 + p);
            buy2 = Math.max(buy2, sell1 - p);
            sell2 = Math.max(sell2, buy2 + p);
        }
        return sell2;
    }

    public static void main(String[] args) {
        System.out.println(maxProfitFee(new int[]{1, 3, 2, 8, 4, 9}, 2)); // 8
        System.out.println(maxProfitTwo(new int[]{3, 3, 5, 0, 0, 3, 1, 4})); // 6
    }
}`,
      },
    ],
    steps: [
      { title: "Buy at 1, sell at 8", detail: "Profit 7 − fee 2 = 5" },
      { title: "Buy at 4, sell at 9", detail: "Profit 5 − fee 2 = 3" },
      { title: "Total", detail: "8 — better than one trade 1 → 9 (8 − 2 = 6)" },
    ],
    mistakes: ["Updating hold and free with already-updated values from the same day", "Initialising hold to 0 instead of −prices[0]", "Charging the fee on both buy and sell"],
    complexity: [{ op: "State machine DP", time: "O(n) (O(n·k) with k transactions)", space: "O(1) (O(k))" }],
    revision: ["States: hold / free", "hold = max(hold, free − p)", "free = max(free, hold + p − fee)", "Cooldown: buy from free two days ago"],
    visual: "dp-table",
  },

  "dp-lis": {
    summary: "Longest increasing subsequence in O(n²) and O(n log n), printing it, and chain/divisible-subset variants.",
    explanation: [
      "O(n²) LIS: dp[i] = length of the longest increasing subsequence ending at i = 1 + max(dp[j]) over j < i with a[j] < a[i]. Keep a parent array to print the sequence.",
      "O(n log n) LIS: maintain tails, where tails[k] is the smallest possible tail of an increasing subsequence of length k + 1. For each x, binary search the first tail ≥ x and replace it (or append). The length of tails is the answer.",
      "Variants: Largest Divisible Subset (sort, then use divisibility instead of <), Longest String Chain, Russian Doll Envelopes (sort by width ascending and height descending, then LIS on heights), Number of LIS (track counts too).",
    ],
    prerequisites: ["1D DP", "Binary search"],
    objectives: ["Write O(n²) LIS with reconstruction", "Write O(n log n) LIS with tails", "Adapt LIS to chain problems"],
    analogy: "Patience sorting: deal cards onto piles, always placing a card on the leftmost pile whose top is ≥ it. The number of piles equals the LIS length.",
    code: [
      {
        title: "LIS in O(n log n) and printing in O(n²)",
        java: `import java.util.*;

public class Main {
    static int lisLength(int[] a) {
        int[] tails = new int[a.length];
        int size = 0;
        for (int x : a) {
            int lo = 0, hi = size;
            while (lo < hi) { int mid = (lo + hi) >>> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }

    static List<Integer> lisSequence(int[] a) {
        int n = a.length, best = 0;
        int[] dp = new int[n], parent = new int[n];
        for (int i = 0; i < n; i++) {
            dp[i] = 1; parent[i] = -1;
            for (int j = 0; j < i; j++)
                if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
            if (dp[i] > dp[best]) best = i;
        }
        LinkedList<Integer> seq = new LinkedList<>();
        for (int i = best; i != -1; i = parent[i]) seq.addFirst(a[i]);
        return seq;
    }

    public static void main(String[] args) {
        int[] a = {10, 9, 2, 5, 3, 7, 101, 18};
        System.out.println(lisLength(a));      // 4
        System.out.println(lisSequence(a));    // [2, 5, 7, 101]
    }
}`,
      },
    ],
    steps: [
      { title: "10, 9, 2", detail: "tails [10] → [9] → [2]" },
      { title: "5, 3", detail: "[2, 5] → [2, 3] (3 is a smaller tail for length 2)" },
      { title: "7, 101, 18", detail: "[2, 3, 7] → [2, 3, 7, 101] → [2, 3, 7, 18]; length 4" },
    ],
    mistakes: ["Thinking tails is the actual LIS (it isn't — only its length is right)", "Using upper bound vs lower bound wrongly (strictly vs non-strictly increasing)", "Forgetting to sort first in chain/subset variants"],
    complexity: [{ op: "LIS O(n²)", time: "O(n²)", space: "O(n)" }, { op: "LIS with tails", time: "O(n log n)", space: "O(n)" }],
    revision: ["dp[i] = 1 + max dp[j] with a[j] < a[i]", "tails + lower bound = O(n log n)", "Parent array to print"],
    visual: "dp-table",
  },

  "dp-partition": {
    summary: "Interval DP: dp[i][j] over a range, trying every split point — matrix chain multiplication, burst balloons, palindrome partitioning.",
    explanation: [
      "Some problems are about choosing where to split a range. The state dp[i][j] is the best answer for the subarray or substring i..j, computed from smaller ranges: dp[i][j] = best over k of dp[i][k] + dp[k+1][j] + cost(i, k, j).",
      "Compute by increasing length so that every smaller interval is ready before it's needed.",
      "Matrix chain multiplication picks the bracketing that minimises scalar multiplications. Burst Balloons flips the view: choose the balloon burst last in a range. Palindrome Partitioning II and Minimum Cost to Cut a Stick follow the same pattern.",
    ],
    prerequisites: ["DP on strings", "2D DP"],
    objectives: ["Recognise interval DP", "Fill tables by increasing interval length", "Solve matrix chain multiplication"],
    analogy: "Deciding the order to glue pieces of a model together: every possible last join splits the problem into two smaller gluing problems.",
    code: [
      {
        title: "Matrix chain multiplication",
        java: `public class Main {
    // dims has length n + 1: matrix i is dims[i] x dims[i + 1]
    static long mcm(int[] dims) {
        int n = dims.length - 1;
        long[][] dp = new long[n][n];
        for (int len = 2; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                dp[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++)                               // try every split
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k + 1][j] + (long) dims[i] * dims[k + 1] * dims[j + 1]);
            }
        return dp[0][n - 1];
    }

    public static void main(String[] args) {
        System.out.println(mcm(new int[]{10, 30, 5, 60}));     // 4500  ((A·B)·C)
        System.out.println(mcm(new int[]{40, 20, 30, 10, 30})); // 26000
    }
}`,
      },
    ],
    steps: [
      { title: "Matrices", detail: "A 10×30, B 30×5, C 5×60" },
      { title: "(A·B)·C", detail: "10·30·5 + 10·5·60 = 1500 + 3000 = 4500" },
      { title: "A·(B·C)", detail: "30·5·60 + 10·30·60 = 9000 + 18000 = 27000 → choose 4500" },
    ],
    mistakes: ["Filling by i then j instead of by length (uses uncomputed cells)", "Wrong dimension indices in the cost", "Overflow in the cost product"],
    complexity: [{ op: "Interval DP", time: "O(n³)", space: "O(n²)" }],
    revision: ["dp[i][j] over a range", "Try every split k", "Iterate by length"],
    visual: "dp-table",
  },

  "dp-advanced": {
    summary: "DP on trees (return take/skip pairs), bitmask DP over subsets, and digit DP for counting numbers with a property.",
    explanation: [
      "Tree DP: each node returns a small tuple to its parent. House Robber III returns (best if I rob this node, best if I don't): rob = val + left.skip + right.skip, skip = max(left) + max(right).",
      "Bitmask DP represents a subset of up to ~20 items as the bits of an int. dp[mask] or dp[mask][last] (as in the travelling salesman problem) iterates over masks and adds one item at a time. O(2ⁿ · n²) is fine for n ≤ 16–20.",
      "Digit DP counts numbers in [0, N] with a digit property by walking digits from most to least significant with states like (position, tight, sum/count, started). Memoize on the non-tight states.",
    ],
    prerequisites: ["Tree properties", "Bit manipulation", "Knapsack DP"],
    objectives: ["Return tuples in tree DP", "Iterate subsets with bitmasks", "Explain the digit DP template"],
    analogy: "Bitmask DP is a checklist of 20 boxes: each pattern of ticked boxes is one state, and you move between states by ticking one more box.",
    code: [
      {
        title: "House Robber III and TSP with bitmask DP",
        java: `import java.util.*;

public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static int[] rob(TreeNode n) {                      // {rob this node, skip this node}
        if (n == null) return new int[]{0, 0};
        int[] l = rob(n.left), r = rob(n.right);
        return new int[]{n.val + l[1] + r[1], Math.max(l[0], l[1]) + Math.max(r[0], r[1])};
    }

    static int tsp(int[][] d) {
        int n = d.length, FULL = 1 << n, INF = Integer.MAX_VALUE / 2;
        int[][] dp = new int[FULL][n];
        for (int[] row : dp) Arrays.fill(row, INF);
        dp[1][0] = 0;                                   // start at city 0
        for (int mask = 1; mask < FULL; mask++)
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] == INF || (mask & (1 << last)) == 0) continue;
                for (int next = 0; next < n; next++)
                    if ((mask & (1 << next)) == 0)
                        dp[mask | (1 << next)][next] = Math.min(dp[mask | (1 << next)][next], dp[mask][last] + d[last][next]);
            }
        int best = INF;
        for (int last = 0; last < n; last++) best = Math.min(best, dp[FULL - 1][last] + d[last][0]);
        return best;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(2); root.right = new TreeNode(3);
        root.left.right = new TreeNode(3); root.right.right = new TreeNode(1);
        int[] r = rob(root);
        System.out.println(Math.max(r[0], r[1]));                    // 7
        int[][] dist = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
        System.out.println(tsp(dist));                               // 80
    }
}`,
      },
    ],
    steps: [
      { title: "Leaves 3 and 1", detail: "Return (3, 0) and (1, 0)" },
      { title: "Node 2 and right 3", detail: "(2, 3) and (3, 1)" },
      { title: "Root 3", detail: "rob = 3 + 3 + 1 = 7, skip = 3 + 3 = 6 → 7" },
    ],
    mistakes: ["Re-running DFS for each choice (exponential) instead of returning both", "Iterating masks in an order where a state's predecessors aren't ready", "Bitmask DP for n > ~22 (too many states)"],
    complexity: [{ op: "Tree DP", time: "O(n)", space: "O(h)" }, { op: "TSP bitmask DP", time: "O(2ⁿ · n²)", space: "O(2ⁿ · n)" }, { op: "Digit DP", time: "O(digits · states · 10)", space: "O(digits · states)" }],
    revision: ["Tree DP: return (take, skip)", "mask & (1 << i) checks membership", "Digit DP: pos, tight, state"],
    visual: "tree",
  },

  trie: {
    summary: "A prefix tree for strings: insert, search and startsWith in O(length), wildcard search, and a binary trie for maximum XOR.",
    explanation: [
      "A trie stores strings character by character along paths from the root. Each node has up to 26 children (for lowercase letters) and a flag marking the end of a word.",
      "insert, search and startsWith each walk one path, so they take O(L) for a word of length L — independent of how many words are stored.",
      "Wildcard search ('.' matches any letter) branches into every child at a '.' — a DFS over the trie.",
      "A binary trie stores numbers bit by bit from the highest bit. To maximise a XOR b for a given a, walk the trie preferring the opposite bit at every level.",
    ],
    prerequisites: ["Trees", "Strings", "Bit manipulation"],
    objectives: ["Implement a trie", "Answer prefix queries", "Use a binary trie for max XOR"],
    analogy: "A trie is a phone's autocomplete: after typing 'ca' you only look at words under the c → a branch.",
    code: [
      {
        title: "Trie with insert, search, startsWith and wildcard search",
        java: `public class Main {
    static class Trie {
        Trie[] next = new Trie[26];
        boolean end;

        void insert(String w) {
            Trie cur = this;
            for (char c : w.toCharArray()) {
                if (cur.next[c - 'a'] == null) cur.next[c - 'a'] = new Trie();
                cur = cur.next[c - 'a'];
            }
            cur.end = true;
        }

        Trie walk(String s) {
            Trie cur = this;
            for (char c : s.toCharArray()) { cur = cur.next[c - 'a']; if (cur == null) return null; }
            return cur;
        }

        boolean search(String w) { Trie n = walk(w); return n != null && n.end; }
        boolean startsWith(String p) { return walk(p) != null; }

        boolean matches(String w, int i) {              // '.' matches any letter
            if (i == w.length()) return end;
            char c = w.charAt(i);
            if (c != '.') return next[c - 'a'] != null && next[c - 'a'].matches(w, i + 1);
            for (Trie child : next) if (child != null && child.matches(w, i + 1)) return true;
            return false;
        }
    }

    public static void main(String[] args) {
        Trie t = new Trie();
        for (String w : new String[]{"apple", "app", "bad", "dad"}) t.insert(w);
        System.out.println(t.search("app") + " " + t.search("ap") + " " + t.startsWith("ap")); // true false true
        System.out.println(t.matches(".ad", 0) + " " + t.matches("b..", 0) + " " + t.matches("c..", 0)); // true true false
    }
}`,
      },
    ],
    steps: [
      { title: "insert apple, app", detail: "They share the path a → p → p; 'app' marks end at the second p" },
      { title: "search \"ap\"", detail: "The path exists but end is false → false" },
      { title: "startsWith \"ap\"", detail: "The path exists → true" },
    ],
    mistakes: ["Forgetting the end-of-word flag (search returns true for prefixes)", "Using HashMap children when 26 fixed letters would be faster", "Not handling uppercase or other characters when input allows them"],
    complexity: [{ op: "insert / search / startsWith", time: "O(L)", space: "O(total characters × alphabet)" }, { op: "Wildcard search", time: "O(26^dots · L) worst", space: "O(L) stack" }],
    revision: ["children[26] + end flag", "Walk the path for every operation", "Max XOR: prefer the opposite bit"],
    visual: "trie",
  },

  "segment-tree": {
    summary: "Answer range queries (sum, min, max) and apply updates in O(log n), with lazy propagation for range updates.",
    explanation: [
      "A segment tree is a binary tree where each node stores the answer (e.g. sum) for a segment of the array; the root covers everything and leaves cover single elements. Stored in an array of size 4n.",
      "Build recursively in O(n). A range query splits into at most O(log n) fully-covered nodes. A point update changes one leaf and recomputes its ancestors: O(log n).",
      "Lazy propagation handles 'add v to every element in [l, r]': store a pending update at a node that's fully covered and push it to the children only when you need to go below that node. Range update and range query both stay O(log n).",
    ],
    prerequisites: ["Trees", "Recursion", "Prefix sums"],
    objectives: ["Build, query and update a segment tree", "Explain why queries touch O(log n) nodes", "Describe lazy propagation"],
    analogy: "A tournament bracket where every match result also records the total score of both players — to know the total of any group of players you combine a few match results instead of adding everyone.",
    code: [
      {
        title: "Segment tree for range sum with point updates",
        java: `public class Main {
    static int n;
    static long[] tree;

    static void build(int[] a, int node, int l, int r) {
        if (l == r) { tree[node] = a[l]; return; }
        int m = (l + r) / 2;
        build(a, 2 * node, l, m); build(a, 2 * node + 1, m + 1, r);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    static void update(int node, int l, int r, int idx, int val) {
        if (l == r) { tree[node] = val; return; }
        int m = (l + r) / 2;
        if (idx <= m) update(2 * node, l, m, idx, val); else update(2 * node + 1, m + 1, r, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    static long query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;                 // no overlap
        if (ql <= l && r <= qr) return tree[node];      // full overlap
        int m = (l + r) / 2;
        return query(2 * node, l, m, ql, qr) + query(2 * node + 1, m + 1, r, ql, qr);
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 5, 7, 9, 11};
        n = a.length; tree = new long[4 * n];
        build(a, 1, 0, n - 1);
        System.out.println(query(1, 0, n - 1, 1, 3));   // 15
        update(1, 0, n - 1, 1, 10);                     // a[1] = 10
        System.out.println(query(1, 0, n - 1, 1, 3));   // 22
    }
}`,
      },
    ],
    steps: [
      { title: "Query [1, 3]", detail: "Root [0,5] partially overlaps → go to [0,2] and [3,5]" },
      { title: "Split again", detail: "[1,2] is fully inside (8) and [3,3] is fully inside (7)" },
      { title: "Combine", detail: "8 + 7 = 15 using only a few nodes" },
    ],
    mistakes: ["Array size 2n instead of 4n (index out of bounds)", "Wrong overlap conditions", "Forgetting to push lazy values before recursing"],
    complexity: [{ op: "Build", time: "O(n)", space: "O(4n)" }, { op: "Query / point update", time: "O(log n)", space: "O(log n) stack" }, { op: "Range update (lazy)", time: "O(log n)", space: "O(4n)" }],
    revision: ["Children 2i, 2i + 1", "No overlap → identity, full → node value, partial → recurse", "Lazy: postpone updates"],
    visual: "tree",
  },

  fenwick: {
    summary: "A Fenwick tree (Binary Indexed Tree) gives prefix sums with point updates in O(log n) using the i & −i trick.",
    explanation: [
      "A Fenwick tree stores partial sums in an array (1-indexed). Index i covers a block of length lowbit(i) = i & −i ending at i.",
      "Prefix sum up to i: add tree[i], then jump to i − lowbit(i), until i reaches 0. Update at i: add to tree[i], then jump to i + lowbit(i), until past n. Both are O(log n) and the code is only a few lines.",
      "Range sum = prefix(r) − prefix(l − 1). Inversion counting: process elements right to left, query how many smaller values have been seen, then add the current value (after coordinate compression).",
    ],
    prerequisites: ["Prefix sums", "Bit manipulation"],
    objectives: ["Implement update and prefix query", "Count inversions with a BIT", "Choose BIT vs segment tree"],
    analogy: "A BIT is like a set of savings jars of different sizes: to know your total up to a month, you add up a few big jars instead of every month.",
    code: [
      {
        title: "Fenwick tree and inversion count",
        java: `public class Main {
    static long[] bit;

    static void add(int i, long delta) { for (; i < bit.length; i += i & -i) bit[i] += delta; }
    static long prefix(int i) { long s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }

    public static void main(String[] args) {
        int[] a = {5, 2, 6, 1};                 // values 1..6
        bit = new long[7];
        long inversions = 0;
        for (int i = a.length - 1; i >= 0; i--) {
            inversions += prefix(a[i] - 1);     // smaller values already to the right
            add(a[i], 1);
        }
        System.out.println(inversions);         // 4: (5,2) (5,1) (2,1) (6,1)

        bit = new long[6];
        int[] b = {3, 1, 4, 1, 5};
        for (int i = 0; i < b.length; i++) add(i + 1, b[i]);
        System.out.println(prefix(4) - prefix(1)); // sum of b[1..3] = 6
    }
}`,
      },
    ],
    steps: [
      { title: "i & −i", detail: "6 = 110₂ → lowbit 2, so tree[6] covers indices 5..6" },
      { title: "prefix(6)", detail: "tree[6] + tree[4]" },
      { title: "add(5)", detail: "Updates tree[5], tree[6], then tree[8] if it exists" },
    ],
    mistakes: ["Using 0-based indices (i & −i is 0 → infinite loop)", "Forgetting coordinate compression for large values", "Using a BIT for range min (it only works well for invertible operations like sum)"],
    complexity: [{ op: "Update / prefix query", time: "O(log n)", space: "O(n)" }, { op: "Inversion count", time: "O(n log n)", space: "O(n)" }],
    revision: ["1-indexed", "Query: i −= i & −i", "Update: i += i & −i", "Range = prefix(r) − prefix(l − 1)"],
    visual: "bits",
  },

  "sparse-sqrt": {
    summary: "Sparse tables for O(1) range-minimum queries on static arrays, sqrt decomposition, and choosing the right range structure.",
    explanation: [
      "A sparse table precomputes the answer for every range of length 2^k: st[k][i] = min of a[i .. i + 2^k − 1], built in O(n log n). Because min is idempotent (overlapping doesn't matter), any query [l, r] is the min of two overlapping power-of-two ranges: O(1).",
      "Sqrt decomposition splits the array into about √n blocks and stores each block's answer. A query combines whole blocks plus partial edges: O(√n). It's simple and supports updates.",
      "Choosing: static array + min/max/gcd → sparse table. Sums with point updates → Fenwick tree. Anything with range updates or complex merges → segment tree. Prototyping or unusual operations → sqrt decomposition.",
    ],
    prerequisites: ["Segment tree", "Fenwick tree", "Bit manipulation"],
    objectives: ["Build and query a sparse table", "Explain sqrt decomposition", "Pick the right structure"],
    analogy: "A sparse table is a set of pre-made answers for every 'power of two' stretch of road, so any trip can be covered by two pre-made stretches.",
    code: [
      {
        title: "Sparse table range minimum",
        java: `public class Main {
    public static void main(String[] args) {
        int[] a = {7, 2, 3, 0, 5, 10, 3, 12, 18};
        int n = a.length, LOG = 32 - Integer.numberOfLeadingZeros(n);
        int[][] st = new int[LOG][n];
        st[0] = a.clone();
        for (int k = 1; k < LOG; k++)
            for (int i = 0; i + (1 << k) <= n; i++)
                st[k][i] = Math.min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);

        int[][] queries = {{0, 4}, {4, 7}, {7, 8}};
        for (int[] q : queries) {
            int l = q[0], r = q[1];
            int k = 31 - Integer.numberOfLeadingZeros(r - l + 1);      // floor(log2(length))
            System.out.println(Math.min(st[k][l], st[k][r - (1 << k) + 1])); // 0, 3, 12
        }
    }
}`,
      },
    ],
    steps: [
      { title: "Query [4, 7]", detail: "Length 4 → k = 2" },
      { title: "Two ranges", detail: "min(a[4..7]) from st[2][4] and st[2][4] (same range here) → 3" },
      { title: "O(1)", detail: "Just two table lookups" },
    ],
    mistakes: ["Using a sparse table for sums (overlap double counts)", "Recomputing log2 with Math.log (floating error) instead of bit tricks", "Using it when the array changes (rebuild is O(n log n))"],
    complexity: [{ op: "Sparse table build", time: "O(n log n)", space: "O(n log n)" }, { op: "Sparse table query", time: "O(1)", space: "—" }, { op: "Sqrt decomposition query/update", time: "O(√n)", space: "O(√n)" }],
    revision: ["Idempotent ops → overlapping queries OK", "k = floor(log2(len))", "Static RMQ → sparse table"],
  },

  "string-hashing": {
    summary: "Polynomial rolling hashes compare substrings in O(1), with double hashing to make collisions unlikely.",
    explanation: [
      "A polynomial hash treats a string as a number in base B modulo a large prime M: h(s) = s[0]·B^(n−1) + … + s[n−1] (mod M). Precompute prefix hashes and powers of B, and the hash of any substring is h[r] − h[l]·B^(r−l) (mod M): O(1).",
      "Different strings can share a hash (collision). Using two different moduli (double hashing) or a 64-bit modulus makes collisions extremely unlikely.",
      "Binary search + hashing solves 'longest duplicate substring': if a duplicate of length L exists, one of length L − 1 does too (monotonic), and each check hashes all windows of length L in O(n).",
    ],
    prerequisites: ["Rabin-Karp", "Modular arithmetic", "Binary search on answer"],
    objectives: ["Compute prefix hashes and substring hashes", "Reduce collisions", "Combine hashing with binary search"],
    analogy: "A substring hash is a fingerprint: comparing fingerprints is instant, and with two fingerprints a false match is practically impossible.",
    code: [
      {
        title: "Prefix hashes and substring comparison",
        java: `public class Main {
    static final long M = 1_000_000_007L, B = 131;
    static long[] h, pw;

    static void prepare(String s) {
        int n = s.length();
        h = new long[n + 1]; pw = new long[n + 1];
        pw[0] = 1;
        for (int i = 0; i < n; i++) {
            h[i + 1] = (h[i] * B + s.charAt(i)) % M;
            pw[i + 1] = pw[i] * B % M;
        }
    }

    static long hash(int l, int r) {          // substring [l, r)
        return ((h[r] - h[l] * pw[r - l]) % M + M) % M;
    }

    public static void main(String[] args) {
        String s = "abcabcab";
        prepare(s);
        System.out.println(hash(0, 3) == hash(3, 6));   // true  ("abc" == "abc")
        System.out.println(hash(0, 2) == hash(1, 3));   // false ("ab" vs "bc")
    }
}`,
      },
    ],
    steps: [
      { title: "Prefix hashes", detail: "h[i + 1] = h[i]·B + s[i] (mod M)" },
      { title: "Substring [3, 6)", detail: "h[6] − h[3]·B³ removes the first three characters' contribution" },
      { title: "Compare", detail: "Equal hashes → (almost certainly) equal substrings" },
    ],
    mistakes: ["Negative results after subtraction (add M before %)", "Overflow: h * B must stay below 2⁶³ — keep M ≤ ~10⁹ when multiplying longs", "Trusting a single small modulus on adversarial inputs"],
    complexity: [{ op: "Precompute", time: "O(n)", space: "O(n)" }, { op: "Substring hash", time: "O(1)", space: "—" }],
    revision: ["h[r] − h[l]·B^(r−l)", "Fix negatives with + M", "Double hash for safety"],
  },

  revision: {
    summary: "Consolidate everything: re-solve hard problems from memory, run timed mock interviews and explain your reasoning out loud.",
    explanation: [
      "Recognition beats memorisation. For each problem you've solved, you should be able to say in one line which pattern it uses and why (e.g. 'sorted + pair condition → two pointers').",
      "Re-solve the problems you found hardest without looking at old code. If you get stuck for more than 20 minutes, read only the key idea, then implement from scratch.",
      "Timed sessions: 45 minutes for two problems, as in a real interview. Spend the first 5 minutes clarifying inputs, edge cases and a brute-force idea before optimising.",
      "Speak while you code: state the approach, its complexity, and test it on a small example by hand. Interviewers grade communication as much as correctness.",
    ],
    prerequisites: ["All previous phases"],
    objectives: ["Map problems to patterns quickly", "Solve two problems in 45 minutes", "Communicate approach, complexity and tests clearly"],
    analogy: "Like a musician's dress rehearsal: you've learned every piece — now you practise performing them under real conditions.",
    code: [
      {
        title: "Interview answer template",
        java: `import java.util.*;

/*
 * 1. Clarify: input sizes, value ranges, duplicates, empty input, expected output format.
 * 2. Brute force: state it and its complexity.
 * 3. Optimise: name the pattern (two pointers, sliding window, BFS, DP, ...).
 * 4. Code cleanly, then test on a small example and an edge case out loud.
 */
public class Main {
    // Example: Two Sum — brute force O(n^2) -> HashMap O(n)
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6)));         // [0, 1] (duplicates)
        System.out.println(Arrays.toString(twoSum(new int[]{1}, 2)));            // [] (edge case)
    }
}`,
      },
    ],
    steps: [
      { title: "Clarify", detail: "Exactly one answer? Can I use the same element twice? Return indices or values?" },
      { title: "Brute force", detail: "Check all pairs: O(n²)" },
      { title: "Optimise", detail: "Store seen values in a HashMap: O(n)" },
      { title: "Test", detail: "Normal case, duplicates, no answer" },
    ],
    mistakes: ["Coding before clarifying", "Silence while thinking", "Not testing with an example", "Skipping complexity analysis"],
    complexity: [{ op: "Mock session", time: "45 minutes / 2 problems", space: "—" }],
    revision: ["One-line pattern note per problem", "Clarify → brute force → optimise → code → test", "Talk through your reasoning", "Re-solve hard problems from memory"],
  },
};

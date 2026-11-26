import type { TopicContent } from "./types";

// Phases 6–8: Recursion & backtracking, searching & sorting, hashing.
export const content: Record<string, TopicContent> = {
  "recursion-basics": {
    summary: "A function that calls itself on a smaller input — understand base cases, the call stack and recursion trees.",
    explanation: [
      "Recursion solves a problem by solving a smaller version of the same problem. Every recursive function needs a base case (when to stop) and a recursive case (how to shrink the problem and combine results).",
      "Each call gets its own stack frame holding its parameters and local variables. Calls stack up until a base case returns, then unwind in reverse order. Too many nested calls exhaust the stack and throw StackOverflowError.",
      "Drawing the recursion tree — each call as a node, its recursive calls as children — shows both the result and the cost.",
      "Parameterised recursion carries the answer down in a parameter (e.g. sum so far); functional recursion returns the answer up (return n + sum(n − 1)). Both are useful; backtracking usually uses the first style.",
    ],
    prerequisites: ["Methods", "Big-O"],
    objectives: ["Identify base and recursive cases", "Trace the call stack", "Convert simple loops into recursion and back"],
    analogy: "Russian nesting dolls: to reach the smallest doll you open each one; then you close them back up in reverse order.",
    code: [
      {
        title: "Factorial, reverse array and palindrome recursively",
        java: `import java.util.Arrays;

public class Main {
    static long factorial(int n) {
        if (n <= 1) return 1;            // base case
        return n * factorial(n - 1);     // recursive case
    }

    static void reverse(int[] a, int l, int r) {
        if (l >= r) return;
        int t = a[l]; a[l] = a[r]; a[r] = t;
        reverse(a, l + 1, r - 1);
    }

    static boolean isPal(String s, int i) {
        if (i >= s.length() / 2) return true;
        return s.charAt(i) == s.charAt(s.length() - 1 - i) && isPal(s, i + 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));            // 120
        int[] a = {1, 2, 3, 4, 5};
        reverse(a, 0, a.length - 1);
        System.out.println(Arrays.toString(a));      // [5, 4, 3, 2, 1]
        System.out.println(isPal("racecar", 0));     // true
    }
}`,
      },
    ],
    steps: [
      { title: "factorial(5)", detail: "waits for 5 × factorial(4)" },
      { title: "Going down", detail: "factorial(4) → 3 → 2 → 1 (base case returns 1)" },
      { title: "Unwinding", detail: "2×1=2, 3×2=6, 4×6=24, 5×24=120" },
    ],
    mistakes: ["Missing or unreachable base case → StackOverflowError", "Not shrinking the input on each call", "Recomputing the same subproblem many times (fix later with memoization)", "Forgetting to return the recursive call's result"],
    complexity: [{ op: "factorial(n)", time: "O(n)", space: "O(n) stack" }, { op: "Naive fib(n)", time: "O(2ⁿ)", space: "O(n) stack" }],
    revision: ["Base case first", "Trust the recursive call for the smaller input", "Stack depth = space cost", "Draw the tree for small n"],
    visual: "recursion",
  },

  subsets: {
    summary: "Generate subsets, subsequences and combinations with the pick / not-pick decision at every element.",
    explanation: [
      "For each element you make a binary choice: include it or not. Exploring both branches for all n elements produces all 2ⁿ subsets.",
      "Implement it with a recursive helper that takes an index and the current list: add the element, recurse, remove it (backtrack), then recurse without it.",
      "With duplicate values, sort first and, in the loop-based version, skip an element if it equals the previous one at the same recursion level. That prevents identical subsets.",
      "Combination Sum reuses the same idea with a running target: you may stay on the same index to reuse an element, and you stop early when the target goes negative.",
    ],
    prerequisites: ["Recursion basics", "ArrayList"],
    objectives: ["Write pick/not-pick recursion", "Avoid duplicate subsets", "Solve combination sum variants"],
    analogy: "Packing a bag item by item: for every item on the table you decide 'take it' or 'leave it'. All decision paths together give every possible bag.",
    code: [
      {
        title: "All subsets and subsets without duplicates",
        java: `import java.util.*;

public class Main {
    static void subsets(int[] a, int i, List<Integer> cur, List<List<Integer>> out) {
        if (i == a.length) { out.add(new ArrayList<>(cur)); return; }
        cur.add(a[i]);                    // pick
        subsets(a, i + 1, cur, out);
        cur.remove(cur.size() - 1);       // un-pick
        subsets(a, i + 1, cur, out);      // not pick
    }

    static void subsetsDup(int[] a, int start, List<Integer> cur, List<List<Integer>> out) {
        out.add(new ArrayList<>(cur));
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) continue;   // skip duplicates at this level
            cur.add(a[i]);
            subsetsDup(a, i + 1, cur, out);
            cur.remove(cur.size() - 1);
        }
    }

    public static void main(String[] args) {
        List<List<Integer>> out = new ArrayList<>();
        subsets(new int[]{1, 2, 3}, 0, new ArrayList<>(), out);
        System.out.println(out);   // 8 subsets

        int[] b = {1, 2, 2};
        Arrays.sort(b);
        List<List<Integer>> out2 = new ArrayList<>();
        subsetsDup(b, 0, new ArrayList<>(), out2);
        System.out.println(out2);  // [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
    }
}`,
      },
    ],
    steps: [
      { title: "Index 0", detail: "Branch on 1: take → [1], skip → []" },
      { title: "Index 1", detail: "Each branch splits on 2 → [1,2], [1], [2], []" },
      { title: "Index 2", detail: "Each splits on 3 → 8 leaves = 2³ subsets" },
    ],
    mistakes: ["Adding cur itself instead of a copy (all results end up identical)", "Forgetting to remove after recursing", "Skipping duplicates with i > 0 instead of i > start"],
    complexity: [{ op: "All subsets", time: "O(n · 2ⁿ)", space: "O(n) stack" }, { op: "Combination sum", time: "exponential (pruned)", space: "O(target) stack" }],
    revision: ["Pick → recurse → un-pick → recurse", "Copy the list when saving", "Sort + skip i > start duplicates"],
    visual: "recursion",
  },

  permutations: {
    summary: "Generate every ordering of elements by swapping or using a used[] array, and build valid parentheses.",
    explanation: [
      "A permutation fixes one element per position. With swapping, position i tries every element from i to n − 1 by swapping it into place, recursing on i + 1, then swapping back.",
      "The used[] approach builds a list: at each level loop over all elements, skip used ones, mark, recurse, unmark. It handles duplicates easily: sort and skip a[i] if it equals a[i − 1] and a[i − 1] is unused.",
      "Generate Parentheses builds strings character by character with two counters: you may add '(' while open < n and ')' while close < open. Every completed string is automatically valid.",
    ],
    prerequisites: ["Subsets & pick/not-pick"],
    objectives: ["Generate permutations two ways", "Prune with constraints during generation"],
    analogy: "Seating guests: choose who sits in chair 1, then who sits in chair 2 from the rest, and so on — then swap them back to try the next arrangement.",
    code: [
      {
        title: "Permutations by swapping and generate parentheses",
        java: `import java.util.*;

public class Main {
    static void permute(int[] a, int i, List<List<Integer>> out) {
        if (i == a.length) {
            List<Integer> p = new ArrayList<>();
            for (int x : a) p.add(x);
            out.add(p);
            return;
        }
        for (int j = i; j < a.length; j++) {
            swap(a, i, j);
            permute(a, i + 1, out);
            swap(a, i, j);                 // undo
        }
    }
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void parens(int n, int open, int close, StringBuilder sb, List<String> out) {
        if (sb.length() == 2 * n) { out.add(sb.toString()); return; }
        if (open < n) { sb.append('('); parens(n, open + 1, close, sb, out); sb.deleteCharAt(sb.length() - 1); }
        if (close < open) { sb.append(')'); parens(n, open, close + 1, sb, out); sb.deleteCharAt(sb.length() - 1); }
    }

    public static void main(String[] args) {
        List<List<Integer>> out = new ArrayList<>();
        permute(new int[]{1, 2, 3}, 0, out);
        System.out.println(out);               // 6 permutations
        List<String> ps = new ArrayList<>();
        parens(3, 0, 0, new StringBuilder(), ps);
        System.out.println(ps);                // [((())), (()()), (())(), ()(()), ()()()]
    }
}`,
      },
    ],
    steps: [
      { title: "Position 0", detail: "Try 1, 2 and 3 in front (swap into index 0)" },
      { title: "Position 1", detail: "For each, try the remaining two elements" },
      { title: "Position 2", detail: "One element left → record; 3 × 2 × 1 = 6 permutations" },
    ],
    mistakes: ["Forgetting the swap-back", "Adding ')' without checking close < open", "Generating all strings then filtering (much slower than pruning)"],
    complexity: [{ op: "All permutations", time: "O(n · n!)", space: "O(n) stack" }, { op: "Generate parentheses", time: "O(Catalan(n) · n)", space: "O(n)" }],
    revision: ["Swap in, recurse, swap back", "used[] + skip duplicate if previous unused", "Prune while building"],
    visual: "recursion",
  },

  backtracking: {
    summary: "Explore choices, undo them when they fail and prune early — N-Queens, Sudoku, word search and palindrome partitioning.",
    explanation: [
      "Backtracking is depth-first search over decisions: choose an option, explore further, and un-choose it when you return. It finds all (or one) solutions to constraint problems.",
      "Pruning is what makes it fast: check constraints as early as possible so impossible branches are abandoned immediately.",
      "N-Queens places one queen per row; keep sets (or boolean arrays) of used columns and both diagonals (r − c and r + c) for O(1) safety checks.",
      "Grid problems like Word Search mark a cell as visited, explore 4 neighbours, then unmark it. Palindrome partitioning tries every prefix that is a palindrome and recurses on the rest.",
    ],
    prerequisites: ["Subsets", "Permutations"],
    objectives: ["Apply choose → explore → un-choose", "Design O(1) constraint checks", "Backtrack on grids"],
    analogy: "Solving a maze by walking down a path, and when you hit a dead end, walking back to the last junction to try the next path.",
    code: [
      {
        title: "N-Queens (count solutions)",
        java: `public class Main {
    static int n, count;
    static boolean[] col, diag1, diag2;

    static void place(int r) {
        if (r == n) { count++; return; }
        for (int c = 0; c < n; c++) {
            if (col[c] || diag1[r - c + n - 1] || diag2[r + c]) continue;  // prune
            col[c] = diag1[r - c + n - 1] = diag2[r + c] = true;            // choose
            place(r + 1);                                                  // explore
            col[c] = diag1[r - c + n - 1] = diag2[r + c] = false;           // un-choose
        }
    }

    public static void main(String[] args) {
        for (n = 4; n <= 8; n++) {
            count = 0;
            col = new boolean[n]; diag1 = new boolean[2 * n - 1]; diag2 = new boolean[2 * n - 1];
            place(0);
            System.out.println(n + "-queens: " + count);   // 2, 10, 4, 40, 92
        }
    }
}`,
      },
    ],
    steps: [
      { title: "Row 0", detail: "Put a queen at column 0 and mark its column and diagonals" },
      { title: "Row 1", detail: "Columns 0 and 1 are attacked; try column 2" },
      { title: "Dead end", detail: "Row 2 has no safe column → undo row 1's queen and try column 3" },
      { title: "Continue", detail: "Every full placement of n rows counts as a solution" },
    ],
    mistakes: ["Not undoing state after recursion", "Checking safety by scanning the board (O(n) per check) instead of O(1) arrays", "Forgetting to restore a grid cell after marking it visited"],
    complexity: [{ op: "N-Queens", time: "O(n!) (heavily pruned)", space: "O(n)" }, { op: "Word search", time: "O(m·n·4^L)", space: "O(L)" }, { op: "Sudoku", time: "exponential (pruned)", space: "O(81)" }],
    revision: ["Choose → explore → un-choose", "Prune as early as possible", "Diagonals: r − c and r + c"],
    visual: "recursion",
  },

  "basic-sorts": {
    summary: "Bubble, selection and insertion sort — simple O(n²) algorithms that teach stability and in-place sorting.",
    explanation: [
      "Bubble sort repeatedly swaps adjacent elements that are out of order; after pass i, the largest i elements are in place. If a pass makes no swaps, the array is sorted and you can stop early (O(n) best case).",
      "Selection sort finds the minimum of the unsorted part and swaps it to the front. It always does O(n²) comparisons but only O(n) swaps.",
      "Insertion sort grows a sorted prefix: take the next element and shift larger elements right until its spot is found. It is fast on nearly-sorted data and small arrays — real libraries use it for tiny subarrays.",
      "A sort is stable if equal elements keep their original order (bubble, insertion: yes; selection: no). In-place means O(1) extra memory (all three are).",
    ],
    prerequisites: ["Arrays", "Big-O"],
    objectives: ["Implement the three basic sorts", "Explain stability and in-place", "Know when insertion sort is a good choice"],
    analogy: "Insertion sort is how most people sort a hand of playing cards: pick up one card at a time and slide it into the right place.",
    code: [
      {
        title: "Bubble (early exit), selection, insertion",
        java: `import java.util.Arrays;

public class Main {
    static void bubble(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++)
                if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true; }
            if (!swapped) break;                      // already sorted
        }
    }

    static void selection(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j;
            int t = a[i]; a[i] = a[min]; a[min] = t;
        }
    }

    static void insertion(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i - 1;
            while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }   // shift right
            a[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 5, 6}, b = a.clone(), c = a.clone();
        bubble(a); selection(b); insertion(c);
        System.out.println(Arrays.toString(a) + Arrays.toString(b) + Arrays.toString(c));
    }
}`,
      },
    ],
    steps: [
      { title: "Insertion, i = 1", detail: "key 2 < 5 → shift 5 right → [2, 5, 9, 1, 5, 6]" },
      { title: "i = 3", detail: "key 1 shifts 9, 5, 2 right → [1, 2, 5, 9, 5, 6]" },
      { title: "i = 4", detail: "key 5 shifts only 9 → [1, 2, 5, 5, 9, 6] (equal 5s keep order: stable)" },
    ],
    mistakes: ["Inner loop bound not shrinking in bubble sort", "Using >= in insertion sort's shift condition (breaks stability)", "Choosing O(n²) sorts for large n"],
    complexity: [
      { op: "Bubble", time: "O(n²), best O(n)", space: "O(1)" },
      { op: "Selection", time: "O(n²) always", space: "O(1)" },
      { op: "Insertion", time: "O(n²), best O(n)", space: "O(1)" },
    ],
    revision: ["Bubble: adjacent swaps + early exit", "Selection: min to front, not stable", "Insertion: shift and insert, great on nearly sorted"],
    visual: "sorting",
  },

  "merge-quick": {
    summary: "Divide-and-conquer sorting: merge sort's guaranteed O(n log n), quick sort's fast partitioning, quickselect and inversion counting.",
    explanation: [
      "Merge sort splits the array in half, sorts each half recursively and merges the two sorted halves with two pointers. It is stable and always O(n log n), using O(n) extra space.",
      "Quick sort picks a pivot, partitions the array so smaller elements come before it and larger after, then recurses on both sides. Average O(n log n) in place; a bad pivot on sorted input gives O(n²), so choose a random pivot.",
      "Quickselect partitions like quick sort but recurses only into the side containing the k-th position — average O(n) to find the k-th smallest element.",
      "While merging, every time an element from the right half is placed before remaining left elements, it forms inversions with all of them. Counting these during merge sort gives the inversion count in O(n log n).",
    ],
    prerequisites: ["Recursion", "Basic sorts", "Recurrences"],
    objectives: ["Implement merge sort and quick sort", "Explain pivot choice and worst cases", "Use quickselect and inversion counting"],
    analogy: "Merge sort is two people each sorting half a deck, then merging by always taking the smaller top card.",
    code: [
      {
        title: "Merge sort with inversion count, and randomized quick sort",
        java: `import java.util.*;

public class Main {
    static long inversions = 0;

    static void mergeSort(int[] a, int[] tmp, int l, int r) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        mergeSort(a, tmp, l, m);
        mergeSort(a, tmp, m + 1, r);
        int i = l, j = m + 1, k = l;
        while (i <= m && j <= r) {
            if (a[i] <= a[j]) tmp[k++] = a[i++];
            else { tmp[k++] = a[j++]; inversions += m - i + 1; }  // a[j] jumps over the rest of left half
        }
        while (i <= m) tmp[k++] = a[i++];
        while (j <= r) tmp[k++] = a[j++];
        System.arraycopy(tmp, l, a, l, r - l + 1);
    }

    static final Random RNG = new Random(42);

    static void quickSort(int[] a, int l, int r) {
        if (l >= r) return;
        int p = l + RNG.nextInt(r - l + 1);
        int t = a[p]; a[p] = a[r]; a[r] = t;        // move random pivot to end
        int pivot = a[r], store = l;
        for (int i = l; i < r; i++)
            if (a[i] < pivot) { t = a[i]; a[i] = a[store]; a[store++] = t; }
        t = a[store]; a[store] = a[r]; a[r] = t;      // pivot into final position (Lomuto)
        quickSort(a, l, store - 1);
        quickSort(a, store + 1, r);
    }

    public static void main(String[] args) {
        int[] a = {8, 4, 2, 1};
        mergeSort(a, new int[a.length], 0, a.length - 1);
        System.out.println(Arrays.toString(a) + " inversions=" + inversions); // [1, 2, 4, 8] inversions=6

        int[] b = {9, 3, 7, 1, 8, 2};
        quickSort(b, 0, b.length - 1);
        System.out.println(Arrays.toString(b));                              // [1, 2, 3, 7, 8, 9]
    }
}`,
      },
    ],
    steps: [
      { title: "Split", detail: "[8,4,2,1] → [8,4] and [2,1] → single elements" },
      { title: "Merge pairs", detail: "[4,8] (1 inversion), [1,2] (1 inversion)" },
      { title: "Final merge", detail: "1 and 2 each jump over 2 left elements → 4 more inversions; total 6" },
    ],
    mistakes: ["Always picking the first element as pivot (O(n²) on sorted input)", "Allocating a new temp array in every merge call (slow)", "Using < instead of <= in merge (breaks stability)", "Inversion count overflow — use long"],
    complexity: [
      { op: "Merge sort", time: "O(n log n) always", space: "O(n)" },
      { op: "Quick sort", time: "O(n log n) avg, O(n²) worst", space: "O(log n) stack" },
      { op: "Quickselect", time: "O(n) avg", space: "O(1)" },
    ],
    revision: ["Merge sort: split, sort halves, merge", "Random pivot avoids worst case", "Quickselect recurses into one side", "Inversions += m − i + 1 during merge"],
    visual: "sorting",
  },

  "linear-sorts": {
    summary: "Sort faster than O(n log n) when values are bounded: counting sort, radix sort and cyclic sort.",
    explanation: [
      "Comparison sorts can't beat O(n log n), but if values are small integers you can count instead of compare. Counting sort tallies how many times each value occurs, then rebuilds the array: O(n + k) for values in [0, k).",
      "Radix sort sorts numbers digit by digit (least significant first) using a stable counting sort per digit: O(d · (n + base)).",
      "Cyclic sort solves 'numbers 1..n with some missing/duplicated': place each value v at index v − 1 by swapping until every position holds the right number (or a duplicate). Then scan for mismatches — O(n) time, O(1) space.",
    ],
    prerequisites: ["Basic sorts", "Arrays"],
    objectives: ["Choose counting/radix sort when values are bounded", "Use cyclic sort for 1..n problems"],
    analogy: "Counting sort is sorting exam papers by grade into labelled piles A, B, C… then stacking the piles — no comparisons between papers needed.",
    code: [
      {
        title: "Counting sort and cyclic sort (find missing numbers)",
        java: `import java.util.*;

public class Main {
    static void countingSort(int[] a, int maxValue) {
        int[] count = new int[maxValue + 1];
        for (int x : a) count[x]++;
        int k = 0;
        for (int v = 0; v <= maxValue; v++) while (count[v]-- > 0) a[k++] = v;
    }

    static List<Integer> missingNumbers(int[] a) {   // values in 1..n
        int i = 0;
        while (i < a.length) {
            int correct = a[i] - 1;
            if (a[i] != a[correct]) { int t = a[i]; a[i] = a[correct]; a[correct] = t; }
            else i++;
        }
        List<Integer> missing = new ArrayList<>();
        for (i = 0; i < a.length; i++) if (a[i] != i + 1) missing.add(i + 1);
        return missing;
    }

    public static void main(String[] args) {
        int[] a = {4, 2, 2, 8, 3, 3, 1};
        countingSort(a, 8);
        System.out.println(Arrays.toString(a));                         // [1, 2, 2, 3, 3, 4, 8]
        System.out.println(missingNumbers(new int[]{4, 3, 2, 7, 8, 2, 3, 1})); // [5, 6]
    }
}`,
      },
    ],
    steps: [
      { title: "Count", detail: "count[1]=1, count[2]=2, count[3]=2, count[4]=1, count[8]=1" },
      { title: "Rebuild", detail: "Write each value count times in order" },
      { title: "Cyclic sort", detail: "Swap each number to index value − 1; positions 4 and 5 end up holding duplicates → 5 and 6 are missing" },
    ],
    mistakes: ["Counting sort with a huge value range (memory blow-up)", "Radix sort with an unstable per-digit sort", "Cyclic sort infinite loop when duplicates are swapped with themselves (check a[i] != a[correct])"],
    complexity: [{ op: "Counting sort", time: "O(n + k)", space: "O(k)" }, { op: "Radix sort", time: "O(d·(n + b))", space: "O(n + b)" }, { op: "Cyclic sort", time: "O(n)", space: "O(1)" }],
    revision: ["Bounded integers → counting", "Radix = stable sort per digit", "1..n range → cyclic sort"],
    visual: "sorting",
  },

  "binary-search": {
    summary: "Halve the search space each step: the iterative template, lower/upper bounds and first/last occurrence.",
    explanation: [
      "Binary search works on any sorted (more generally, monotonic) sequence. Compare the middle element with the target and discard the half that cannot contain it. log₂(10⁹) ≈ 30, so a billion elements need only about 30 steps.",
      "Compute mid as lo + (hi − lo) / 2 to avoid integer overflow of lo + hi.",
      "Lower bound = first index with a[i] ≥ target; upper bound = first index with a[i] > target. Their difference counts occurrences, and lower bound gives the first occurrence.",
      "Pick one convention and stick to it. The safest: search on [lo, hi) with while (lo < hi), and set hi = mid or lo = mid + 1 so the range always shrinks.",
    ],
    prerequisites: ["Arrays", "Big-O"],
    objectives: ["Write bug-free binary search", "Find lower/upper bounds", "Count occurrences in O(log n)"],
    analogy: "Guessing a number between 1 and 100 when someone says 'higher' or 'lower' — each guess halves the possibilities.",
    code: [
      {
        title: "Classic search, lower bound and upper bound",
        java: `public class Main {
    static int search(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }

    static int lowerBound(int[] a, int target) {   // first index with a[i] >= target
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < target) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    static int upperBound(int[] a, int target) {   // first index with a[i] > target
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] <= target) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 5, 8, 13};
        System.out.println(search(a, 8));                          // 5
        System.out.println(lowerBound(a, 3) + " " + upperBound(a, 3)); // 1 4
        System.out.println("count of 3 = " + (upperBound(a, 3) - lowerBound(a, 3))); // 3
    }
}`,
      },
    ],
    steps: [
      { title: "lo=0, hi=6", detail: "mid = 3 → a[3] = 3 < 8 → lo = 4" },
      { title: "lo=4, hi=6", detail: "mid = 5 → a[5] = 8 → found at index 5" },
      { title: "Only 2 steps", detail: "Each step halves the range" },
    ],
    mistakes: ["mid = (lo + hi) / 2 overflowing", "Infinite loop from lo = mid with while (lo < hi)", "Mixing [lo, hi] and [lo, hi) conventions", "Using binary search on unsorted data"],
    complexity: [{ op: "Binary search / bounds", time: "O(log n)", space: "O(1)" }],
    revision: ["mid = lo + (hi − lo) / 2", "Lower bound: a[mid] < t → lo = mid + 1 else hi = mid", "count = upper − lower", "Range must shrink every iteration"],
    visual: "binary-search",
  },

  "bs-rotated": {
    summary: "Binary search when the array is rotated, when you need a peak, or when a 2D matrix can be treated as a sorted 1D array.",
    explanation: [
      "In a rotated sorted array, one half around mid is always sorted. Check which half is sorted (a[lo] <= a[mid] means the left half is), then see whether the target lies inside that sorted half; if not, search the other half.",
      "The minimum of a rotated array is where the order breaks: if a[mid] > a[hi], the minimum is right of mid; otherwise it's at mid or left of it.",
      "A peak element (bigger than its neighbours) can be found by moving towards the larger neighbour: if a[mid] < a[mid + 1], a peak exists to the right.",
      "A matrix whose rows are sorted and whose rows follow one another can be indexed as one sorted array: index k maps to row k / cols, column k % cols.",
    ],
    prerequisites: ["Binary search fundamentals"],
    objectives: ["Search rotated arrays in O(log n)", "Find the rotation point and a peak", "Map 1D indices onto a matrix"],
    analogy: "A rotated sorted array is a clock face started at 9 instead of 12 — still in order, just with one jump from 12 back to 1.",
    code: [
      {
        title: "Search in rotated array and find peak",
        java: `public class Main {
    static int searchRotated(int[] a, int t) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == t) return mid;
            if (a[lo] <= a[mid]) {                               // left half sorted
                if (a[lo] <= t && t < a[mid]) hi = mid - 1; else lo = mid + 1;
            } else {                                             // right half sorted
                if (a[mid] < t && t <= a[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }

    static int findPeak(int[] a) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        System.out.println(searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 0)); // 4
        System.out.println(findPeak(new int[]{1, 2, 1, 3, 5, 6, 4}));        // 5 (value 6)
    }
}`,
      },
    ],
    steps: [
      { title: "mid = 3 (7)", detail: "Left half [4..7] is sorted; 0 isn't in it → lo = 4" },
      { title: "mid = 5 (1)", detail: "Left half [0, 1] sorted and 0 is in it → hi = 4" },
      { title: "mid = 4", detail: "a[4] = 0 → found" },
    ],
    mistakes: ["Using < instead of <= in a[lo] <= a[mid] (fails when lo == mid)", "Wrong inclusive/exclusive bounds when testing if the target is in the sorted half", "Duplicates break the 'which half is sorted' test — shrink both ends when a[lo] == a[mid] == a[hi]"],
    complexity: [{ op: "Search rotated (distinct)", time: "O(log n)", space: "O(1)" }, { op: "Peak element", time: "O(log n)", space: "O(1)" }, { op: "Search 2D matrix", time: "O(log(m·n))", space: "O(1)" }],
    revision: ["One half is always sorted", "Target in sorted half? go there, else other half", "Peak: climb towards larger neighbour", "k → (k / cols, k % cols)"],
    visual: "binary-search",
  },

  "bs-answer": {
    summary: "Binary search over the range of possible answers when a yes/no check is monotonic — the key to 'minimise the maximum' problems.",
    explanation: [
      "Sometimes you can't search the input, but you can search the answer. If 'can we do it with capacity X?' is false for small X and true from some point on, binary search finds the smallest X that works.",
      "The recipe: (1) define the answer range [lo, hi], (2) write feasible(x) that greedily checks one candidate in O(n), (3) binary search for the first feasible x. Total O(n log(range)).",
      "Typical problems: Koko eating bananas (minimum speed), ship packages within D days (minimum capacity), split array largest sum, aggressive cows (maximise the minimum distance — search for the last feasible value).",
    ],
    prerequisites: ["Binary search fundamentals", "Greedy thinking"],
    objectives: ["Recognise a monotonic predicate", "Write a feasibility check", "Search for the first/last feasible answer"],
    analogy: "Finding the lowest oven temperature that bakes a cake in under 30 minutes: try the middle temperature, and depending on the result, try hotter or cooler.",
    code: [
      {
        title: "Ship packages within D days",
        java: `public class Main {
    static boolean canShip(int[] w, int days, int cap) {
        int used = 1, load = 0;
        for (int x : w) {
            if (load + x > cap) { used++; load = 0; }   // start a new day
            load += x;
        }
        return used <= days;
    }

    static int shipWithinDays(int[] w, int days) {
        int lo = 0, hi = 0;
        for (int x : w) { lo = Math.max(lo, x); hi += x; } // answer is in [max, sum]
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (canShip(w, days, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        System.out.println(shipWithinDays(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5)); // 15
    }
}`,
      },
    ],
    steps: [
      { title: "Range", detail: "Capacity is at least the heaviest package (10) and at most the total (55)" },
      { title: "mid = 32", detail: "Feasible in ≤ 5 days → hi = 32" },
      { title: "Keep halving", detail: "… mid = 15 feasible, 14 not → answer 15" },
    ],
    mistakes: ["Wrong lower bound (capacity below the heaviest item is never feasible)", "Non-monotonic predicate", "Overflow when summing large ranges — use long"],
    complexity: [{ op: "Binary search on answer", time: "O(n · log(range))", space: "O(1)" }],
    revision: ["Monotonic yes/no → binary search the answer", "feasible(x) is usually greedy O(n)", "Minimise → first true; maximise → last true"],
    visual: "binary-search",
  },

  "hashing-basics": {
    summary: "How hash tables work — hash functions, collisions, chaining vs open addressing — and frequency-counting patterns.",
    explanation: [
      "A hash function maps a key to an integer; taking it modulo the table size picks a bucket. A good hash spreads keys evenly so each bucket holds few items, giving O(1) average operations.",
      "Two keys can land in the same bucket — a collision. Separate chaining stores a small list per bucket (Java's HashMap does this, switching to a tree for long chains). Open addressing stores everything in the array and probes for the next free slot (linear or quadratic probing).",
      "When the load factor (items / buckets) passes a threshold, the table grows and every key is rehashed.",
      "Most hashing problems are counting problems: count occurrences, then answer questions about the counts (first unique character, top frequencies, whether two collections match).",
    ],
    prerequisites: ["HashMap & HashSet", "Arrays"],
    objectives: ["Explain collisions and resizing", "Implement a simple hash map", "Apply frequency-count patterns"],
    analogy: "A hash table is a post office with numbered pigeonholes: the address (hash) tells you which hole to look in, and occasionally two letters share a hole.",
    code: [
      {
        title: "A minimal HashMap with separate chaining",
        java: `import java.util.*;

public class Main {
    static class MyHashMap {
        private LinkedList<int[]>[] buckets;
        private int size = 0;

        @SuppressWarnings("unchecked")
        MyHashMap() { buckets = new LinkedList[16]; }

        private int index(int key, int len) { return Math.floorMod(Integer.hashCode(key), len); }

        void put(int key, int value) {
            if (size + 1 > buckets.length * 0.75) resize();
            int i = index(key, buckets.length);
            if (buckets[i] == null) buckets[i] = new LinkedList<>();
            for (int[] e : buckets[i]) if (e[0] == key) { e[1] = value; return; }
            buckets[i].add(new int[]{key, value});
            size++;
        }

        int get(int key) {
            LinkedList<int[]> b = buckets[index(key, buckets.length)];
            if (b != null) for (int[] e : b) if (e[0] == key) return e[1];
            return -1;
        }

        @SuppressWarnings("unchecked")
        private void resize() {
            LinkedList<int[]>[] old = buckets;
            buckets = new LinkedList[old.length * 2];
            size = 0;
            for (LinkedList<int[]> b : old) if (b != null) for (int[] e : b) put(e[0], e[1]);
        }
    }

    public static void main(String[] args) {
        MyHashMap m = new MyHashMap();
        for (int i = 0; i < 100; i++) m.put(i, i * i);
        System.out.println(m.get(12) + " " + m.get(1000)); // 144 -1

        String s = "leetcode";                              // first unique character
        int[] cnt = new int[26];
        for (char c : s.toCharArray()) cnt[c - 'a']++;
        for (int i = 0; i < s.length(); i++) if (cnt[s.charAt(i) - 'a'] == 1) { System.out.println(i); break; } // 0
    }
}`,
      },
    ],
    steps: [
      { title: "put(12, 144)", detail: "hash(12) % 16 = 12 → bucket 12 gets [12, 144]" },
      { title: "Load factor", detail: "When size passes 0.75 × capacity, double the array and reinsert everything" },
      { title: "get(12)", detail: "Same index → scan the short chain → 144" },
    ],
    mistakes: ["Negative hash codes giving negative indices — use Math.floorMod", "Never resizing (chains grow and lookups degrade to O(n))", "Using a HashMap when an int[26] array would do"],
    complexity: [{ op: "Insert / lookup / delete", time: "O(1) average, O(n) worst", space: "O(n)" }, { op: "Resize", time: "O(n) occasionally (amortised O(1))", space: "O(n)" }],
    revision: ["hash % capacity → bucket", "Chaining vs open addressing", "Load factor 0.75 → resize", "Counting solves most hashing problems"],
    visual: "hash",
  },

  "hash-prefix": {
    summary: "Combine prefix sums with a HashMap to count subarrays with a given sum, divisibility by k, and find longest consecutive sequences.",
    explanation: [
      "A subarray a[l..r] sums to K exactly when prefix[r+1] − prefix[l] = K, i.e. prefix[l] = prefix[r+1] − K. Walk the array, keep a running sum, and count how many earlier prefixes equal sum − K using a HashMap of prefix → count. Start the map with {0: 1} for subarrays starting at index 0.",
      "For 'sum divisible by k', two prefixes with the same remainder mod k bound a divisible subarray. Count remainders (normalised to be non-negative).",
      "Longest Consecutive Sequence: put all numbers in a HashSet; only start counting from numbers x where x − 1 is absent (the start of a run), then extend x + 1, x + 2, … Each number is visited at most twice: O(n).",
    ],
    prerequisites: ["Prefix sums", "HashMap"],
    objectives: ["Count subarrays with sum K in O(n)", "Use remainder maps", "Solve longest consecutive sequence in O(n)"],
    analogy: "Like checking odometer readings: if you've seen the reading 'now − K' before, you've driven exactly K kilometres since then.",
    code: [
      {
        title: "Subarray sum equals K and longest consecutive",
        java: `import java.util.*;

public class Main {
    static int subarraySum(int[] a, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int sum = 0, count = 0;
        for (int x : a) {
            sum += x;
            count += seen.getOrDefault(sum - k, 0);   // earlier prefixes that complete a sum of k
            seen.merge(sum, 1, Integer::sum);
        }
        return count;
    }

    static int longestConsecutive(int[] a) {
        Set<Integer> set = new HashSet<>();
        for (int x : a) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;           // not a run start
            int len = 1;
            while (set.contains(x + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[]{1, 2, 3, -2, 2, 1}, 3)); // 5
        System.out.println(longestConsecutive(new int[]{100, 4, 200, 1, 3, 2})); // 4
    }
}`,
      },
    ],
    steps: [
      { title: "Prefixes", detail: "Running sums: 1, 3, 6, 4, 6, 7" },
      { title: "Look up sum − 3", detail: "At 3: 0 seen (+1). At 6: 3 seen (+1). At 4: 1 seen (+1). At the second 6: 3 seen (+1). At 7: 4 seen (+1)" },
      { title: "Answer", detail: "5 subarrays sum to 3: [1,2], [3], [2,3,−2], [3,−2,2], [2,1]" },
    ],
    mistakes: ["Forgetting the initial {0: 1}", "Using sliding window with negative numbers (doesn't work — use this method)", "Negative remainders in Java's % — normalise with ((s % k) + k) % k", "Starting the consecutive count from every number (O(n²))"],
    complexity: [{ op: "Subarray sum = K", time: "O(n)", space: "O(n)" }, { op: "Longest consecutive", time: "O(n)", space: "O(n)" }],
    revision: ["count += map[sum − k]", "Seed map with {0: 1}", "Same remainder → divisible subarray", "Only start runs where x − 1 is missing"],
    visual: "prefix-sum",
  },
};

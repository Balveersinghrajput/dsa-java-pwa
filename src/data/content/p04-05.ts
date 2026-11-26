import type { TopicContent } from "./types";

// Phases 4–5: Arrays and Strings.
export const content: Record<string, TopicContent> = {
  "array-basics": {
    summary: "In-place array tricks: remove duplicates, rotate by k, move zeroes and check sortedness without extra memory.",
    explanation: [
      "Many array problems ask you to modify the array in place using O(1) extra space. The core idea is a write pointer: one index reads every element, another marks where the next 'kept' element goes.",
      "Removing duplicates from a sorted array: keep a write index w; whenever a[i] differs from a[w − 1], copy it to a[w] and advance w. Moving zeroes works the same way — write every non-zero forward, then fill the rest with zeroes.",
      "Rotating right by k with the reversal algorithm: reverse the whole array, then reverse the first k elements and the remaining n − k elements. Use k %= n first.",
      "A sorted-then-rotated array has at most one 'drop' (a[i] > a[i + 1]) when you compare cyclically, including the pair (last, first).",
    ],
    prerequisites: ["Arrays", "Loops"],
    objectives: ["Use read/write pointers for in-place edits", "Rotate an array in O(n) time and O(1) space", "Recognise a rotated sorted array"],
    analogy: "The write pointer is a librarian re-shelving books: they walk the shelf (read pointer) and slide each keeper into the next free slot.",
    code: [
      {
        title: "Remove duplicates, move zeroes, rotate",
        java: `import java.util.Arrays;

public class Main {
    static int removeDuplicates(int[] a) {          // a is sorted
        if (a.length == 0) return 0;
        int w = 1;
        for (int i = 1; i < a.length; i++)
            if (a[i] != a[w - 1]) a[w++] = a[i];
        return w;                                    // new length
    }

    static void moveZeroes(int[] a) {
        int w = 0;
        for (int x : a) if (x != 0) a[w++] = x;
        while (w < a.length) a[w++] = 0;
    }

    static void reverse(int[] a, int l, int r) {
        while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; }
    }

    static void rotateRight(int[] a, int k) {
        int n = a.length; k %= n;
        reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
    }

    public static void main(String[] args) {
        int[] d = {1, 1, 2, 2, 2, 3};
        int len = removeDuplicates(d);
        System.out.println(Arrays.toString(Arrays.copyOf(d, len))); // [1, 2, 3]

        int[] z = {0, 1, 0, 3, 12};
        moveZeroes(z);
        System.out.println(Arrays.toString(z));       // [1, 3, 12, 0, 0]

        int[] r = {1, 2, 3, 4, 5, 6, 7};
        rotateRight(r, 3);
        System.out.println(Arrays.toString(r));       // [5, 6, 7, 1, 2, 3, 4]
    }
}`,
      },
    ],
    steps: [
      { title: "Reverse all", detail: "[1,2,3,4,5,6,7] → [7,6,5,4,3,2,1]" },
      { title: "Reverse first k = 3", detail: "[5,6,7,4,3,2,1]" },
      { title: "Reverse the rest", detail: "[5,6,7,1,2,3,4] — rotated right by 3 using O(1) space" },
    ],
    mistakes: ["Forgetting k %= n (k may exceed n)", "Comparing with a[i − 1] instead of the last written a[w − 1]", "Creating a new array when the problem requires in place", "Off-by-one in reverse boundaries"],
    complexity: [{ op: "Remove duplicates / move zeroes", time: "O(n)", space: "O(1)" }, { op: "Rotate (reversal)", time: "O(n)", space: "O(1)" }],
    revision: ["Read pointer + write pointer", "Rotate right = reverse all, reverse [0,k), reverse [k,n)", "k %= n", "Rotated sorted array has ≤ 1 cyclic drop"],
    visual: "two-pointers",
  },

  "prefix-sum": {
    summary: "Precompute running totals to answer any range-sum query in O(1), plus difference arrays for range updates.",
    explanation: [
      "A prefix sum array stores pre[i] = a[0] + … + a[i − 1] (with pre[0] = 0). The sum of a[l..r] is then pre[r + 1] − pre[l] — constant time after an O(n) build.",
      "In 2D, pre[r][c] holds the sum of the rectangle from (0,0) to (r−1,c−1). A sub-rectangle sum uses inclusion–exclusion: total − top strip − left strip + overlap.",
      "A difference array is the reverse idea: to add v to every element in [l, r], do diff[l] += v and diff[r + 1] −= v. After all updates, a prefix sum over diff gives the final values — each update is O(1).",
      "Prefix and suffix products solve 'product of array except self' without division: answer[i] = (product of everything left of i) × (product of everything right of i).",
    ],
    prerequisites: ["Arrays", "Big-O"],
    objectives: ["Build prefix sums and answer range queries", "Use 2D prefix sums", "Apply difference arrays for bulk updates"],
    analogy: "A prefix sum is a running odometer: to know how far you drove between two exits, subtract the readings.",
    code: [
      {
        title: "Range sum queries and range updates",
        java: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2};
        int n = a.length;
        long[] pre = new long[n + 1];
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        System.out.println(pre[5] - pre[2]);   // sum a[2..4] = 4+1+5 = 10

        // Difference array: add 10 to [1..3], add 5 to [2..6]
        int[] diff = new int[n + 1];
        int[][] updates = {{1, 3, 10}, {2, 6, 5}};
        for (int[] u : updates) { diff[u[0]] += u[2]; diff[u[1] + 1] -= u[2]; }
        int[] result = new int[n];
        int run = 0;
        for (int i = 0; i < n; i++) { run += diff[i]; result[i] = a[i] + run; }
        System.out.println(Arrays.toString(result)); // [3, 11, 19, 16, 10, 14, 7]
    }
}`,
      },
    ],
    steps: [
      { title: "Build", detail: "pre = [0, 3, 4, 8, 9, 14, 23, 25]" },
      { title: "Query a[2..4]", detail: "pre[5] − pre[2] = 14 − 4 = 10" },
      { title: "Range updates", detail: "diff marks +10 at 1, −10 at 4, +5 at 2, −5 at 7; a running sum spreads them over the ranges" },
    ],
    mistakes: ["Off-by-one: mixing inclusive pre[i] with the pre[i + 1] convention", "int overflow for long arrays of big numbers — use long", "Forgetting the + overlap term in 2D", "Difference array sized n instead of n + 1"],
    complexity: [{ op: "Build prefix", time: "O(n)", space: "O(n)" }, { op: "Range sum query", time: "O(1)", space: "—" }, { op: "Range update (difference array)", time: "O(1)", space: "O(n)" }],
    revision: ["sum(l..r) = pre[r+1] − pre[l]", "2D: D − B − C + A", "diff[l] += v, diff[r+1] −= v", "Left products × right products"],
    visual: "prefix-sum",
  },

  kadane: {
    summary: "Find the maximum-sum contiguous subarray in one pass by deciding at each element: extend or restart.",
    explanation: [
      "Kadane's algorithm keeps cur = the best sum of a subarray ending at the current index. For each x, either extend the previous subarray (cur + x) or start fresh at x — whichever is larger. The answer is the best cur seen.",
      "To recover the subarray, remember where the current run started; whenever cur improves the global best, record start and end.",
      "Maximum product subarray is trickier because a negative times a negative becomes positive. Track both the max and the min product ending here; when x is negative, they swap roles.",
      "This is the simplest example of dynamic programming: the state is 'best ending at i', and each state depends only on the previous one.",
    ],
    prerequisites: ["Arrays", "Prefix sums"],
    objectives: ["Implement Kadane in O(n)", "Return the subarray indices", "Handle the product variant with min/max tracking"],
    analogy: "You walk along a road collecting coins and paying tolls. If your wallet goes negative, it's better to throw away the past and start counting from here.",
    code: [
      {
        title: "Max subarray sum with indices, and max product",
        java: `public class Main {
    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        long best = a[0], cur = a[0];
        int start = 0, bestL = 0, bestR = 0;
        for (int i = 1; i < a.length; i++) {
            if (cur + a[i] < a[i]) { cur = a[i]; start = i; }  // restart
            else cur += a[i];                                   // extend
            if (cur > best) { best = cur; bestL = start; bestR = i; }
        }
        System.out.println(best + " from " + bestL + " to " + bestR); // 6 from 3 to 6

        int[] b = {2, 3, -2, 4, -1};
        int maxP = b[0], minP = b[0], ans = b[0];
        for (int i = 1; i < b.length; i++) {
            int x = b[i];
            if (x < 0) { int t = maxP; maxP = minP; minP = t; }
            maxP = Math.max(x, maxP * x);
            minP = Math.min(x, minP * x);
            ans = Math.max(ans, maxP);
        }
        System.out.println(ans); // 48 (2*3*-2*4*-1)
    }
}`,
      },
    ],
    steps: [
      { title: "i=3 (4)", detail: "cur was −2; −2+4 < 4 → restart at 4, start = 3; best = 4" },
      { title: "i=4,5,6", detail: "cur = 3, 5, 6 → best = 6 at [3..6]" },
      { title: "i=7 (−5)", detail: "cur = 1, still extended; best stays 6" },
      { title: "i=8 (4)", detail: "cur = 5 < 6 — final answer 6 for [4, −1, 2, 1]" },
    ],
    mistakes: ["Initialising best to 0 (wrong when all numbers are negative)", "Forgetting to swap max/min on a negative in the product version", "Using int when sums can overflow"],
    complexity: [{ op: "Kadane", time: "O(n)", space: "O(1)" }, { op: "Max product subarray", time: "O(n)", space: "O(1)" }],
    revision: ["cur = max(x, cur + x)", "best = max(best, cur)", "Start best at a[0], not 0", "Product: track max and min"],
    visual: "kadane",
  },

  "two-pointers": {
    summary: "Move two indices through an array — from both ends or in the same direction — to replace nested loops with one pass.",
    explanation: [
      "Opposite-ends pointers work on sorted arrays: start l at 0 and r at n − 1. If a[l] + a[r] is too small, move l right; if too big, move r left. Each step discards a whole row of possibilities, so the search is O(n) instead of O(n²).",
      "Same-direction (read/write or slow/fast) pointers compact or partition an array in place.",
      "The Dutch National Flag algorithm sorts 0s, 1s and 2s in one pass with three pointers: low (next 0 slot), mid (current) and high (next 2 slot).",
      "3Sum: sort, fix one element i, then run opposite-ends two pointers on the rest for target −a[i]. Skip equal neighbours to avoid duplicate triplets. 4Sum adds one more fixed loop.",
    ],
    prerequisites: ["Arrays", "Sorting basics"],
    objectives: ["Solve pair-sum problems in O(n) on sorted data", "Partition arrays in one pass", "Write duplicate-free 3Sum"],
    analogy: "Two people searching a sorted bookshelf from both ends for two books whose prices add up to your budget: whoever has the cheaper or pricier book steps inward.",
    code: [
      {
        title: "Pair sum, Dutch flag and 3Sum",
        java: `import java.util.*;

public class Main {
    static int[] pairSum(int[] a, int target) {      // a sorted
        int l = 0, r = a.length - 1;
        while (l < r) {
            int s = a[l] + a[r];
            if (s == target) return new int[]{l, r};
            if (s < target) l++; else r--;
        }
        return new int[]{-1, -1};
    }

    static void sortColors(int[] a) {
        int low = 0, mid = 0, high = a.length - 1;
        while (mid <= high) {
            if (a[mid] == 0) { int t = a[low]; a[low++] = a[mid]; a[mid++] = t; }
            else if (a[mid] == 1) mid++;
            else { int t = a[high]; a[high--] = a[mid]; a[mid] = t; }
        }
    }

    static List<List<Integer>> threeSum(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < a.length - 2; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;            // skip duplicate i
            int l = i + 1, r = a.length - 1;
            while (l < r) {
                int s = a[i] + a[l] + a[r];
                if (s == 0) {
                    res.add(List.of(a[i], a[l], a[r]));
                    while (l < r && a[l] == a[l + 1]) l++;      // skip duplicates
                    while (l < r && a[r] == a[r - 1]) r--;
                    l++; r--;
                } else if (s < 0) l++; else r--;
            }
        }
        return res;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairSum(new int[]{1, 3, 4, 6, 9}, 10))); // [0, 4]
        int[] c = {2, 0, 2, 1, 1, 0};
        sortColors(c);
        System.out.println(Arrays.toString(c));                  // [0, 0, 1, 1, 2, 2]
        System.out.println(threeSum(new int[]{-1, 0, 1, 2, -1, -4})); // [[-1, -1, 2], [-1, 0, 1]]
    }
}`,
      },
    ],
    steps: [
      { title: "l=0 (1), r=4 (9)", detail: "1 + 9 = 10 = target → found [0, 4]. If it were smaller we'd move l; larger, move r." },
      { title: "Why it's safe", detail: "If a[l] + a[r] < target, a[l] with any element left of r is even smaller, so a[l] can be discarded" },
      { title: "3Sum", detail: "Fix −1, find pairs summing to 1 among the rest; skip repeats so each triplet appears once" },
    ],
    mistakes: ["Using two pointers on unsorted data for pair sums", "Forgetting to skip duplicates in 3Sum", "Advancing mid after swapping with high in Dutch flag (the swapped-in value is unchecked)", "Loop condition l <= r letting a pointer pair with itself"],
    complexity: [{ op: "Pair sum (sorted)", time: "O(n)", space: "O(1)" }, { op: "Dutch national flag", time: "O(n)", space: "O(1)" }, { op: "3Sum", time: "O(n²)", space: "O(1) extra (+ sort)" }],
    revision: ["Sorted + pair condition → opposite pointers", "Too small → l++, too big → r--", "Dutch flag: don't advance mid after swapping with high", "Sort first, skip duplicates"],
    visual: "two-pointers",
  },

  "sliding-window": {
    summary: "Maintain a moving window over an array or string — fixed size or growing and shrinking — to solve subarray problems in O(n).",
    explanation: [
      "A fixed window of size k: compute the first window, then slide by adding the new element on the right and removing the one that left on the left. Each slide is O(1).",
      "A variable window expands r one step at a time and shrinks l while the window breaks a rule (e.g. contains a repeated character, or its sum exceeds a limit). Each index enters and leaves the window at most once, so the whole scan is O(n).",
      "Combine the window with a HashMap or int[128] of counts when the rule depends on characters, like 'at most k distinct' or 'contains all letters of t'.",
      "'Exactly K' problems are often easier as atMost(K) − atMost(K − 1).",
    ],
    prerequisites: ["Two pointers", "HashMap"],
    objectives: ["Slide a fixed window in O(n)", "Write the expand/shrink template", "Use the at-most-K trick"],
    analogy: "Looking at a long train through a window: as it moves, one carriage appears on the right and one disappears on the left — you never re-look at the whole train.",
    code: [
      {
        title: "Max sum of size k and longest substring without repeats",
        java: `import java.util.*;

public class Main {
    static long maxSumK(int[] a, int k) {
        long sum = 0;
        for (int i = 0; i < k; i++) sum += a[i];
        long best = sum;
        for (int r = k; r < a.length; r++) {
            sum += a[r] - a[r - k];          // add new, remove old
            best = Math.max(best, sum);
        }
        return best;
    }

    static int longestUnique(String s) {
        int[] count = new int[128];
        int best = 0;
        for (int l = 0, r = 0; r < s.length(); r++) {
            count[s.charAt(r)]++;
            while (count[s.charAt(r)] > 1) count[s.charAt(l++)]--;  // shrink
            best = Math.max(best, r - l + 1);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxSumK(new int[]{2, 1, 5, 1, 3, 2}, 3)); // 9
        System.out.println(longestUnique("abcabcbb"));               // 3
    }
}`,
      },
    ],
    steps: [
      { title: "First window", detail: "2 + 1 + 5 = 8" },
      { title: "Slide", detail: "+1 −2 → 7; +3 −1 → 9; +2 −5 → 6" },
      { title: "Answer", detail: "Best window sum is 9 ([5, 1, 3]) after visiting each element once" },
    ],
    mistakes: ["Recomputing the whole window each time (O(n·k))", "Shrinking with if instead of while", "Window length off by one (r − l + 1)", "Using sliding window with negative numbers for 'sum ≥ target' problems (the monotonic shrink rule breaks)"],
    complexity: [{ op: "Fixed window", time: "O(n)", space: "O(1)" }, { op: "Variable window with counts", time: "O(n)", space: "O(alphabet)" }],
    revision: ["Fixed: add right, remove left", "Variable: expand r, while invalid shrink l", "Length = r − l + 1", "exactly(K) = atMost(K) − atMost(K−1)"],
    visual: "sliding-window",
  },

  matrix: {
    summary: "2D array techniques: transpose and rotate, spiral order, marking zeroes in O(1) space and Pascal's triangle.",
    explanation: [
      "Rotate an n×n matrix 90° clockwise in place: transpose it (swap m[i][j] with m[j][i] for j > i), then reverse every row.",
      "Spiral order keeps four boundaries — top, bottom, left, right — and peels one layer at a time: left→right on top, top→bottom on right, right→left on bottom, bottom→top on left, shrinking a boundary after each pass.",
      "Set Matrix Zeroes in O(1) extra space uses the first row and first column as marker arrays, with two booleans remembering whether the first row/column themselves need zeroing.",
      "Pascal's triangle: each row starts and ends with 1, and each inner value is the sum of the two values above it.",
    ],
    prerequisites: ["2D arrays", "Loops"],
    objectives: ["Rotate a matrix in place", "Traverse in spiral order with boundaries", "Reuse the matrix as its own marker storage"],
    analogy: "Spiral traversal is peeling an onion: take the outer layer, then repeat on what is left.",
    code: [
      {
        title: "Rotate 90° and spiral order",
        java: `import java.util.*;

public class Main {
    static void rotate(int[][] m) {
        int n = m.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) { int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t; }
        for (int[] row : m)
            for (int l = 0, r = n - 1; l < r; l++, r--) { int t = row[l]; row[l] = row[r]; row[r] = t; }
    }

    static List<Integer> spiral(int[][] m) {
        List<Integer> out = new ArrayList<>();
        int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) out.add(m[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) out.add(m[r][right]);
            right--;
            if (top <= bottom) { for (int c = right; c >= left; c--) out.add(m[bottom][c]); bottom--; }
            if (left <= right) { for (int r = bottom; r >= top; r--) out.add(m[r][left]); left++; }
        }
        return out;
    }

    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println(spiral(m));            // [1, 2, 3, 6, 9, 8, 7, 4, 5]
        rotate(m);
        System.out.println(Arrays.deepToString(m)); // [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
    }
}`,
      },
    ],
    steps: [
      { title: "Top row", detail: "1 2 3, then top = 1" },
      { title: "Right column", detail: "6 9, then right = 1" },
      { title: "Bottom row", detail: "8 7, then bottom = 1" },
      { title: "Left column", detail: "4, then left = 1; inner layer gives 5" },
    ],
    mistakes: ["Missing the top <= bottom / left <= right re-checks (duplicates on non-square matrices)", "Transposing the full matrix (swaps twice → back to original)", "Zeroing cells immediately while scanning (spreads zeroes wrongly)"],
    complexity: [{ op: "Rotate n×n", time: "O(n²)", space: "O(1)" }, { op: "Spiral m×n", time: "O(m·n)", space: "O(1) extra" }, { op: "Set zeroes", time: "O(m·n)", space: "O(1)" }],
    revision: ["Rotate = transpose + reverse rows", "Spiral = four shrinking boundaries", "Use first row/col as markers", "Pascal: row[j] = prev[j−1] + prev[j]"],
    visual: "matrix",
  },

  "array-misc": {
    summary: "Boyer–Moore majority vote, next lexicographic permutation and merging sorted arrays in place.",
    explanation: [
      "Boyer–Moore voting finds an element that appears more than n/2 times in O(n) time and O(1) space: keep a candidate and a counter; equal elements add a vote, different ones cancel a vote, and when the count hits zero pick a new candidate.",
      "Next permutation: from the right, find the first index i with a[i] < a[i + 1] (the pivot). Swap it with the smallest element to its right that is larger than it, then reverse the suffix after i. If no pivot exists, reverse the whole array.",
      "Merge two sorted arrays into the first one (which has spare space at the end) by filling from the back: compare the largest remaining elements and write the bigger one at the end.",
    ],
    prerequisites: ["Two pointers", "Array basics"],
    objectives: ["Find the majority element in O(1) space", "Generate the next permutation", "Merge from the back to avoid overwriting"],
    analogy: "Majority vote is a battle where every soldier cancels one enemy soldier: if one army has more than half, it always has survivors left.",
    code: [
      {
        title: "Majority element, next permutation, merge sorted",
        java: `import java.util.Arrays;

public class Main {
    static int majority(int[] a) {
        int cand = 0, count = 0;
        for (int x : a) {
            if (count == 0) cand = x;
            count += (x == cand) ? 1 : -1;
        }
        return cand;
    }

    static void nextPermutation(int[] a) {
        int i = a.length - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i >= 0) {
            int j = a.length - 1;
            while (a[j] <= a[i]) j--;
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
        for (int l = i + 1, r = a.length - 1; l < r; l++, r--) { int t = a[l]; a[l] = a[r]; a[r] = t; }
    }

    static void merge(int[] a, int m, int[] b, int n) {   // a has length m + n
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) a[k--] = (i >= 0 && a[i] > b[j]) ? a[i--] : b[j--];
    }

    public static void main(String[] args) {
        System.out.println(majority(new int[]{2, 2, 1, 1, 1, 2, 2})); // 2
        int[] p = {1, 3, 2};
        nextPermutation(p);
        System.out.println(Arrays.toString(p));                     // [2, 1, 3]
        int[] a = {1, 2, 3, 0, 0, 0};
        merge(a, 3, new int[]{2, 5, 6}, 3);
        System.out.println(Arrays.toString(a));                     // [1, 2, 2, 3, 5, 6]
    }
}`,
      },
    ],
    steps: [
      { title: "Pivot", detail: "[1, 3, 2]: from the right, 1 < 3 → pivot index 0" },
      { title: "Swap", detail: "Smallest element right of the pivot that is > 1 is 2 → [2, 3, 1]" },
      { title: "Reverse suffix", detail: "Reverse [3, 1] → [2, 1, 3], the next permutation" },
    ],
    mistakes: ["Assuming a majority exists without verifying when the problem doesn't guarantee it", "Using > instead of >= when searching for the pivot (breaks with duplicates)", "Merging from the front and overwriting unread elements"],
    complexity: [{ op: "Boyer–Moore", time: "O(n)", space: "O(1)" }, { op: "Next permutation", time: "O(n)", space: "O(1)" }, { op: "Merge sorted (from back)", time: "O(m + n)", space: "O(1)" }],
    revision: ["Votes cancel; survivor is the majority", "Pivot → swap with next larger → reverse suffix", "Merge from the back"],
  },

  "string-basics": {
    summary: "Palindromes with two pointers, anagrams with int[26], reversing words and checking isomorphic mappings.",
    explanation: [
      "A palindrome reads the same both ways. Compare characters from both ends moving inward; skip non-alphanumeric characters if the problem says to ignore them.",
      "Two strings are anagrams if they have the same character counts. An int[26] array (for lowercase letters) counts in O(n) without sorting.",
      "Reversing words: split on whitespace, then join in reverse — or reverse the whole string and then each word in place if you need O(1) extra space with a char array.",
      "Isomorphic strings need a consistent one-to-one mapping. Keep two maps (s→t and t→s), or store the last index each character was seen in both strings and compare.",
    ],
    prerequisites: ["Strings & StringBuilder", "Two pointers"],
    objectives: ["Check palindromes in O(n) and O(1) space", "Detect anagrams with counting", "Validate bijective character mappings"],
    analogy: "Checking a palindrome is like folding a strip of paper in half — the letters that touch must match.",
    code: [
      {
        title: "Valid palindrome, anagram, isomorphic",
        java: `public class Main {
    static boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l++)) != Character.toLowerCase(s.charAt(r--))) return false;
        }
        return true;
    }

    static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] cnt = new int[26];
        for (int i = 0; i < a.length(); i++) { cnt[a.charAt(i) - 'a']++; cnt[b.charAt(i) - 'a']--; }
        for (int c : cnt) if (c != 0) return false;
        return true;
    }

    static boolean isIsomorphic(String s, String t) {
        int[] lastS = new int[256], lastT = new int[256];
        for (int i = 0; i < s.length(); i++) {
            if (lastS[s.charAt(i)] != lastT[t.charAt(i)]) return false;
            lastS[s.charAt(i)] = lastT[t.charAt(i)] = i + 1;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // true
        System.out.println(isAnagram("listen", "silent"));                 // true
        System.out.println(isIsomorphic("egg", "add") + " " + isIsomorphic("foo", "bar")); // true false
    }
}`,
      },
    ],
    steps: [
      { title: "Skip punctuation", detail: "Pointers jump over spaces, commas and colons" },
      { title: "Compare lowercased", detail: "'a' vs 'a', 'm' vs 'm', … each pair matches" },
      { title: "Meet in the middle", detail: "l ≥ r → it's a palindrome" },
    ],
    mistakes: ["Sorting both strings for anagrams (O(n log n) instead of O(n))", "Using int[26] when input can contain uppercase or Unicode", "Single-direction map for isomorphic (\"ab\" → \"aa\" wrongly passes)"],
    complexity: [{ op: "Palindrome check", time: "O(n)", space: "O(1)" }, { op: "Anagram (counting)", time: "O(n)", space: "O(1) (26 letters)" }, { op: "Isomorphic", time: "O(n)", space: "O(1)" }],
    revision: ["Palindrome = two pointers inward", "Anagram = equal counts", "Isomorphic needs both directions"],
    visual: "two-pointers",
  },

  "string-medium": {
    summary: "Group anagrams by a key, find palindromic substrings by expanding around centres, and parse strings carefully.",
    explanation: [
      "Group Anagrams: give every word a canonical key — its sorted letters or its 26 letter counts — and group words with the same key in a HashMap.",
      "Every palindrome has a centre (a character, or the gap between two). Expanding outward from all 2n − 1 centres finds the longest palindromic substring in O(n²) time and O(1) space.",
      "Parsing problems like String to Integer (atoi) are about edge cases: leading spaces, an optional sign, stopping at the first non-digit and clamping on overflow. Check for overflow before multiplying by 10.",
      "Roman numerals: scan left to right, adding each value, but subtract when a smaller value comes before a larger one (IV = 4, IX = 9).",
    ],
    prerequisites: ["String basics", "HashMap"],
    objectives: ["Group strings by canonical key", "Use expand-around-centre", "Handle parsing edge cases and overflow"],
    analogy: "Expand-around-centre is dropping a stone in a pond and watching the ripples spread equally on both sides until they stop matching.",
    code: [
      {
        title: "Longest palindromic substring and group anagrams",
        java: `import java.util.*;

public class Main {
    static String longestPalindrome(String s) {
        int bestL = 0, bestLen = 0;
        for (int c = 0; c < s.length(); c++) {
            for (int odd = 0; odd < 2; odd++) {          // odd = 0 → centre on char, 1 → gap
                int l = c, r = c + odd;
                while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
                if (r - l - 1 > bestLen) { bestLen = r - l - 1; bestL = l + 1; }
            }
        }
        return s.substring(bestL, bestL + bestLen);
    }

    static Collection<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : words) {
            char[] k = w.toCharArray();
            Arrays.sort(k);
            groups.computeIfAbsent(new String(k), x -> new ArrayList<>()).add(w);
        }
        return groups.values();
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));     // bab
        System.out.println(longestPalindrome("cbbd"));      // bb
        System.out.println(groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
    }
}`,
      },
    ],
    steps: [
      { title: "Centre at 'a' (index 1)", detail: "b|a|b match → expand to \"bab\" (length 3)" },
      { title: "Gap centres", detail: "\"ba\", \"ab\"… don't match, length 0" },
      { title: "Result", detail: "Longest found is \"bab\" (\"aba\" ties)" },
    ],
    mistakes: ["Forgetting even-length centres", "Using the sorted string key without new String(chars) (char[] has identity equality)", "atoi: checking overflow after it already happened"],
    complexity: [{ op: "Expand around centre", time: "O(n²)", space: "O(1)" }, { op: "Group anagrams (sorted key)", time: "O(n · k log k)", space: "O(n · k)" }],
    revision: ["2n − 1 centres", "Canonical key → HashMap grouping", "Check overflow before multiply", "Roman: subtract when smaller precedes larger"],
  },

  "pattern-matching": {
    summary: "Find a pattern inside text faster than O(n·m) using KMP's prefix function, the Z-algorithm and Rabin–Karp hashing.",
    explanation: [
      "The naive method tries every start position and compares up to m characters: O(n·m). It wastes the information gained from partial matches.",
      "KMP precomputes the LPS (longest proper prefix that is also a suffix) array for the pattern. On a mismatch it jumps the pattern pointer back to lps[j − 1] instead of restarting, so the text pointer never moves backwards: O(n + m).",
      "The Z-algorithm computes Z[i] = the length of the longest substring starting at i that matches a prefix of the string. Run it on pattern + '$' + text; positions where Z equals m are matches.",
      "Rabin–Karp compares hashes. A rolling hash updates the window's hash in O(1) as it slides. Equal hashes are confirmed by a direct comparison to rule out collisions.",
    ],
    prerequisites: ["Strings", "Modular arithmetic"],
    objectives: ["Build the LPS array", "Search with KMP in O(n + m)", "Explain rolling hashes"],
    analogy: "KMP is a reader who, after misreading a word, remembers how much of what they just read can be reused instead of starting the sentence over.",
    code: [
      {
        title: "KMP search",
        java: `import java.util.*;

public class Main {
    static int[] buildLps(String p) {
        int[] lps = new int[p.length()];
        for (int i = 1, len = 0; i < p.length(); ) {
            if (p.charAt(i) == p.charAt(len)) lps[i++] = ++len;
            else if (len > 0) len = lps[len - 1];   // fall back
            else lps[i++] = 0;
        }
        return lps;
    }

    static List<Integer> kmp(String text, String p) {
        int[] lps = buildLps(p);
        List<Integer> hits = new ArrayList<>();
        for (int i = 0, j = 0; i < text.length(); ) {
            if (text.charAt(i) == p.charAt(j)) {
                i++; j++;
                if (j == p.length()) { hits.add(i - j); j = lps[j - 1]; }
            } else if (j > 0) j = lps[j - 1];
            else i++;
        }
        return hits;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(buildLps("ababaca"))); // [0, 0, 1, 2, 3, 0, 1]
        System.out.println(kmp("abababcabababc", "ababc"));      // [2, 9]
    }
}`,
      },
    ],
    steps: [
      { title: "LPS of \"ababc\"", detail: "[0, 0, 1, 2, 0]" },
      { title: "Mismatch at text[4]", detail: "Matched \"abab\", saw 'a' vs 'c'; jump j to lps[3] = 2 (reuse \"ab\")" },
      { title: "Continue", detail: "Text pointer never moves back; matches found at 2 and 9" },
    ],
    mistakes: ["Moving the text pointer backwards (that's naive search)", "Forgetting j = lps[j − 1] after a full match (misses overlapping matches)", "Trusting a hash match without verifying"],
    complexity: [{ op: "Naive", time: "O(n·m)", space: "O(1)" }, { op: "KMP / Z-algorithm", time: "O(n + m)", space: "O(m) / O(n + m)" }, { op: "Rabin–Karp", time: "O(n + m) expected", space: "O(1)" }],
    revision: ["LPS = longest proper prefix = suffix", "Mismatch → j = lps[j − 1]", "Z on p + '$' + t", "Rolling hash: remove left, shift, add right"],
  },
};

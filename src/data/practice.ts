// Practice Arena exercises: read from standard input, print to standard output.
// "Run" executes your code with your own input; "Submit" runs every test below
// and compares trimmed output line by line.

import type { Difficulty } from "@/types";

export interface Exercise {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string; // curriculum topic id
  statement: string;
  input: string; // input format
  output: string; // output format
  sample: { input: string; output: string };
  tests: { input: string; output: string }[];
  starter: string;
  solution: string;
}

const starter = (body: string) => `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
${body}
    }
}
`;

export const exercises: Exercise[] = [
  {
    id: "sum-array",
    title: "Sum of an array",
    difficulty: "Easy",
    topic: "java-io",
    statement: "Read n integers and print their sum. The sum may not fit in an int.",
    input: "Line 1: n (1 ≤ n ≤ 10⁵). Line 2: n integers, each |aᵢ| ≤ 10⁹.",
    output: "One integer: the sum.",
    sample: { input: "5\n1 2 3 4 5", output: "15" },
    tests: [
      { input: "3\n1000000000 1000000000 1000000000", output: "3000000000" },
      { input: "4\n-5 10 -3 2", output: "4" },
      { input: "1\n-7", output: "-7" },
    ],
    starter: starter(`        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        // TODO: add up the n numbers (use long!) and print the sum
`),
    solution: starter(`        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long sum = 0;
        for (int i = 0; i < n; i++) sum += Long.parseLong(st.nextToken());
        System.out.println(sum);`),
  },
  {
    id: "reverse-words",
    title: "Reverse the words",
    difficulty: "Easy",
    topic: "java-strings",
    statement: "Given a line of text, print the words in reverse order separated by single spaces. Ignore extra spaces.",
    input: "One line of text (at least one word).",
    output: "The words in reverse order.",
    sample: { input: "the sky is blue", output: "blue is sky the" },
    tests: [
      { input: "  hello   world  ", output: "world hello" },
      { input: "a", output: "a" },
      { input: "Java makes DSA fun", output: "fun DSA makes Java" },
    ],
    starter: starter(`        String line = br.readLine();
        // TODO: split into words and print them in reverse order
`),
    solution: starter(`        String[] w = br.readLine().trim().split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = w.length - 1; i >= 0; i--) { sb.append(w[i]); if (i > 0) sb.append(' '); }
        System.out.println(sb);`),
  },
  {
    id: "palindrome-number",
    title: "Palindrome number",
    difficulty: "Easy",
    topic: "java-control",
    statement: "Print true if the integer x reads the same backwards as forwards, otherwise false. Negative numbers are not palindromes.",
    input: "One integer x (|x| ≤ 2³¹ − 1).",
    output: "true or false.",
    sample: { input: "121", output: "true" },
    tests: [
      { input: "-121", output: "false" },
      { input: "10", output: "false" },
      { input: "1234321", output: "true" },
      { input: "0", output: "true" },
    ],
    starter: starter(`        long x = Long.parseLong(br.readLine().trim());
        // TODO: reverse the digits (or compare halves) and print true/false
`),
    solution: starter(`        long x = Long.parseLong(br.readLine().trim());
        if (x < 0) { System.out.println(false); return; }
        long rev = 0, t = x;
        while (t > 0) { rev = rev * 10 + t % 10; t /= 10; }
        System.out.println(rev == x);`),
  },
  {
    id: "max-subarray",
    title: "Maximum subarray sum",
    difficulty: "Medium",
    topic: "kadane",
    statement: "Print the largest sum of any non-empty contiguous subarray.",
    input: "Line 1: n (1 ≤ n ≤ 10⁵). Line 2: n integers (|aᵢ| ≤ 10⁴).",
    output: "One integer.",
    sample: { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" },
    tests: [
      { input: "1\n-3", output: "-3" },
      { input: "5\n5 4 -1 7 8", output: "23" },
      { input: "4\n-4 -2 -7 -1", output: "-1" },
    ],
    starter: starter(`        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        // TODO: Kadane's algorithm
`),
    solution: starter(`        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long best = Long.MIN_VALUE, cur = 0;
        for (int i = 0; i < n; i++) {
            long x = Long.parseLong(st.nextToken());
            cur = Math.max(x, cur + x);
            best = Math.max(best, cur);
        }
        System.out.println(best);`),
  },
  {
    id: "binary-search",
    title: "Binary search",
    difficulty: "Easy",
    topic: "binary-search",
    statement: "Given a sorted array and a target, print the index of the target, or -1 if it isn't present.",
    input: "Line 1: n and target. Line 2: n sorted distinct integers.",
    output: "The index (0-based) or -1.",
    sample: { input: "6 9\n-1 0 3 5 9 12", output: "4" },
    tests: [
      { input: "6 2\n-1 0 3 5 9 12", output: "-1" },
      { input: "1 5\n5", output: "0" },
      { input: "5 1\n1 2 3 4 5", output: "0" },
    ],
    starter: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), target = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        // TODO: binary search for target
`),
    solution: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), target = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        int lo = 0, hi = n - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) { ans = mid; break; }
            if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        System.out.println(ans);`),
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "hashing-basics",
    statement: "Find two different indices i < j such that a[i] + a[j] = target. Exactly one answer exists. Print i and j.",
    input: "Line 1: n and target. Line 2: n integers.",
    output: "Two indices separated by a space.",
    sample: { input: "4 9\n2 7 11 15", output: "0 1" },
    tests: [
      { input: "3 6\n3 2 4", output: "1 2" },
      { input: "2 6\n3 3", output: "0 1" },
      { input: "5 0\n-3 4 3 90 1", output: "0 2" },
    ],
    starter: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), target = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        // TODO: use a HashMap of value -> index
`),
    solution: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), target = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int x = Integer.parseInt(st.nextToken());
            Integer j = seen.get(target - x);
            if (j != null) { System.out.println(j + " " + i); return; }
            seen.put(x, i);
        }`),
  },
  {
    id: "valid-parentheses",
    title: "Valid parentheses",
    difficulty: "Easy",
    topic: "stack-classic",
    statement: "A string contains only ()[]{} characters. Print true if every bracket is closed in the correct order, otherwise false.",
    input: "One line with the bracket string (length ≥ 1).",
    output: "true or false.",
    sample: { input: "{[()]}", output: "true" },
    tests: [
      { input: "([)]", output: "false" },
      { input: "((", output: "false" },
      { input: "()[]{}", output: "true" },
    ],
    starter: starter(`        String s = br.readLine().trim();
        // TODO: use an ArrayDeque as a stack
`),
    solution: starter(`        String s = br.readLine().trim();
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')'); else if (c == '[') st.push(']'); else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) { System.out.println(false); return; }
        }
        System.out.println(st.isEmpty());`),
  },
  {
    id: "count-bits",
    title: "Count set bits",
    difficulty: "Easy",
    topic: "bits",
    statement: "Print the number of 1 bits in the binary representation of a non-negative integer n — without using Integer.bitCount.",
    input: "One integer n (0 ≤ n ≤ 2³¹ − 1).",
    output: "One integer.",
    sample: { input: "11", output: "3" },
    tests: [
      { input: "0", output: "0" },
      { input: "128", output: "1" },
      { input: "2147483647", output: "31" },
    ],
    starter: starter(`        int n = Integer.parseInt(br.readLine().trim());
        // TODO: use n & (n - 1) to drop the lowest set bit
`),
    solution: starter(`        int n = Integer.parseInt(br.readLine().trim());
        int count = 0;
        while (n != 0) { n &= n - 1; count++; }
        System.out.println(count);`),
  },
  {
    id: "climbing-stairs",
    title: "Climbing stairs",
    difficulty: "Easy",
    topic: "dp-1d",
    statement: "You can climb 1 or 2 steps at a time. Print the number of distinct ways to reach step n.",
    input: "One integer n (1 ≤ n ≤ 90).",
    output: "One integer (use long).",
    sample: { input: "5", output: "8" },
    tests: [
      { input: "1", output: "1" },
      { input: "2", output: "2" },
      { input: "45", output: "1836311903" },
      { input: "90", output: "4660046610375530309" },
    ],
    starter: starter(`        int n = Integer.parseInt(br.readLine().trim());
        // TODO: ways(n) = ways(n - 1) + ways(n - 2)
`),
    solution: starter(`        int n = Integer.parseInt(br.readLine().trim());
        long a = 1, b = 1;
        for (int i = 2; i <= n; i++) { long t = a + b; a = b; b = t; }
        System.out.println(b);`),
  },
  {
    id: "number-of-islands",
    title: "Number of islands",
    difficulty: "Medium",
    topic: "grid-graphs",
    statement: "A grid has '1' for land and '0' for water. Islands connect horizontally or vertically. Print how many islands there are.",
    input: "Line 1: rows and cols. Next rows lines: a string of cols characters.",
    output: "One integer.",
    sample: { input: "4 5\n11000\n11000\n00100\n00011", output: "3" },
    tests: [
      { input: "1 1\n0", output: "0" },
      { input: "3 3\n111\n010\n111", output: "1" },
      { input: "3 4\n1010\n0101\n1010", output: "6" },
    ],
    starter: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        char[][] g = new char[r][];
        for (int i = 0; i < r; i++) g[i] = br.readLine().trim().toCharArray();
        // TODO: count DFS/BFS starts on unvisited land
`),
    solution: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int r = Integer.parseInt(st.nextToken()), c = Integer.parseInt(st.nextToken());
        char[][] g = new char[r][];
        for (int i = 0; i < r; i++) g[i] = br.readLine().trim().toCharArray();
        int count = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int i = 0; i < r; i++)
            for (int j = 0; j < c; j++) {
                if (g[i][j] != '1') continue;
                count++;
                Deque<int[]> stack = new ArrayDeque<>();
                stack.push(new int[]{i, j}); g[i][j] = '0';
                while (!stack.isEmpty()) {
                    int[] p = stack.pop();
                    for (int[] d : dirs) {
                        int x = p[0] + d[0], y = p[1] + d[1];
                        if (x >= 0 && y >= 0 && x < r && y < c && g[x][y] == '1') { g[x][y] = '0'; stack.push(new int[]{x, y}); }
                    }
                }
            }
        System.out.println(count);`),
  },
  {
    id: "lcs",
    title: "Longest common subsequence",
    difficulty: "Medium",
    topic: "dp-strings",
    statement: "Print the length of the longest common subsequence of two strings.",
    input: "Two lines, one string each (lowercase, length ≤ 1000).",
    output: "One integer.",
    sample: { input: "abcde\nace", output: "3" },
    tests: [
      { input: "abc\nabc", output: "3" },
      { input: "abc\ndef", output: "0" },
      { input: "bsbininm\njmjkbkjkv", output: "1" },
    ],
    starter: starter(`        String a = br.readLine().trim(), b = br.readLine().trim();
        // TODO: dp[i][j] = LCS of first i chars of a and first j chars of b
`),
    solution: starter(`        String a = br.readLine().trim(), b = br.readLine().trim();
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++)
            for (int j = 1; j <= b.length(); j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        System.out.println(dp[a.length()][b.length()]);`),
  },
  {
    id: "kth-largest",
    title: "K-th largest element",
    difficulty: "Medium",
    topic: "top-k",
    statement: "Print the k-th largest element of the array (not the k-th distinct).",
    input: "Line 1: n and k (1 ≤ k ≤ n). Line 2: n integers.",
    output: "One integer.",
    sample: { input: "6 2\n3 2 1 5 6 4", output: "5" },
    tests: [
      { input: "9 4\n3 2 3 1 2 4 5 5 6", output: "4" },
      { input: "1 1\n7", output: "7" },
      { input: "5 5\n9 8 7 6 5", output: "5" },
    ],
    starter: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        // TODO: keep a min-heap of size k
`),
    solution: starter(`        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        st = new StringTokenizer(br.readLine());
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int i = 0; i < n; i++) { heap.offer(Integer.parseInt(st.nextToken())); if (heap.size() > k) heap.poll(); }
        System.out.println(heap.peek());`),
  },
];

export const playgroundStarter = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Hello, DSA in Java!");
    }
}
`;

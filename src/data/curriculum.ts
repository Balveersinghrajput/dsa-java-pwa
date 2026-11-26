// DSA in Java — complete beginner → advanced curriculum.
// Every topic says how many days it takes, how long to learn vs practise each day,
// what to learn, which LeetCode problems to solve, and where to study it.

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  title: string;
  slug: string;
  difficulty: Difficulty;
  url: string;
}

export interface Resource {
  label: string;
  url: string;
  kind: "video" | "web";
}

export interface Topic {
  custom?: boolean; // created by the learner
  id: string;
  title: string;
  days: number;
  learnMin: number; // theory + Java coding of the concept, per day
  practiceMin: number; // LeetCode practice, per day
  concepts: string[];
  problems: Problem[];
  resources: Resource[];
}

export interface Phase {
  custom?: boolean; // created by the learner
  id: number;
  title: string;
  short: string;
  colour: string;
  topics: Topic[];
}

// ---------- helpers ----------
const DIFF: Record<string, Difficulty> = { E: "Easy", M: "Medium", H: "Hard" };

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/['’?]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// LeetCode slugs that don't follow the title (checked against leetcode.com).
const SLUG_FIX: Record<string, string> = { "pow-x-n": "powx-n", "sqrt-x": "sqrtx" };

/** "E|Two Sum" → Problem with LeetCode link */
const lc = (...items: string[]): Problem[] =>
  items.map((item) => {
    const [d, title] = item.split("|");
    const raw = slugify(title);
    const slug = SLUG_FIX[raw] ?? raw;
    return { title, slug, difficulty: DIFF[d], url: `https://leetcode.com/problems/${slug}/` };
  });

const yt = (label: string, query: string): Resource => ({
  label,
  kind: "video",
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
});
const web = (label: string, url: string): Resource => ({ label, kind: "web", url });

const tag = (t: string, name: string) => web(`LeetCode “${name}” problem list`, `https://leetcode.com/problem-list/${t}/`);
const cp = (path: string, name: string) => web(`CP-Algorithms: ${name}`, `https://cp-algorithms.com/${path}.html`);
const vis = (path: string, name: string) => web(`VisuAlgo: ${name} (animated)`, `https://visualgo.net/en/${path}`);
const oracle = (path: string, name: string) => web(`Oracle Java Tutorial: ${name}`, `https://docs.oracle.com/javase/tutorial/${path}`);
const A2Z = web("Striver A2Z DSA Sheet", "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2");

// ---------- curriculum ----------
// The built-in curriculum (never mutated).
const BASE_PHASES: Phase[] = [
  {
    id: 0,
    title: "Java Fundamentals for DSA",
    short: "Java",
    colour: "#3b82f6",
    topics: [
      {
        id: "java-setup",
        title: "Java setup, data types & input/output",
        days: 1,
        learnMin: 90,
        practiceMin: 60,
        concepts: [
          "Install JDK 21 + IntelliJ/VS Code, compile & run (javac / java)",
          "Primitive types: int, long, double, char, boolean — ranges & overflow",
          "Type casting (implicit vs explicit), integer division",
          "Scanner for input, System.out.println / printf for output",
        ],
        problems: lc("E|Fizz Buzz", "E|Running Sum of 1d Array"),
        resources: [
          yt("Kunal Kushwaha — Java setup & first program", "Kunal Kushwaha java first program data types"),
          yt("Apna College — Java variables & data types", "Apna College java variables data types"),
          web("dev.java — official Learn Java", "https://dev.java/learn/"),
          oracle("java/nutsandbolts/datatypes.html", "Primitive Data Types"),
        ],
      },
      {
        id: "java-control",
        title: "Operators, conditionals & loops",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "Arithmetic, relational, logical, ternary operators; % for digits",
          "if / else-if / switch (incl. new switch expressions)",
          "for, while, do-while, break / continue, nested loops",
          "Pattern printing (stars, numbers) to train loop thinking",
          "Digit problems: count, reverse, sum, palindrome, Armstrong",
        ],
        problems: lc(
          "E|Number of Steps to Reduce a Number to Zero",
          "E|Subtract the Product and Sum of Digits of an Integer",
          "E|Palindrome Number",
          "M|Reverse Integer",
        ),
        resources: [
          yt("Kunal Kushwaha — conditionals & loops in Java", "Kunal Kushwaha conditionals loops java"),
          yt("take U forward — pattern problems", "take U forward patterns java strivers"),
          oracle("java/nutsandbolts/flow.html", "Control Flow Statements"),
        ],
      },
      {
        id: "java-methods-arrays",
        title: "Methods & arrays (1D and 2D)",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "Methods: parameters, return types, overloading, pass-by-value",
          "Arrays: declare, initialise, traverse, Arrays.toString / Arrays.sort",
          "Reference vs value — why changing an array inside a method changes it outside",
          "2D arrays (int[][]), jagged arrays, row/column traversal",
          "Linear search & finding max/min/second max",
        ],
        problems: lc(
          "E|Concatenation of Array",
          "E|Shuffle the Array",
          "E|Richest Customer Wealth",
          "E|Find Numbers with Even Number of Digits",
          "E|Kids With the Greatest Number of Candies",
        ),
        resources: [
          yt("Kunal Kushwaha — functions/methods in Java", "Kunal Kushwaha functions methods java"),
          yt("Kunal Kushwaha — arrays & ArrayList", "Kunal Kushwaha arrays arraylist java"),
          oracle("java/nutsandbolts/arrays.html", "Arrays"),
        ],
      },
      {
        id: "java-strings",
        title: "Strings, StringBuilder & char tricks",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "String immutability & string pool; == vs .equals()",
          "charAt, substring, indexOf, split, toCharArray, String.valueOf",
          "StringBuilder: append, insert, reverse, deleteCharAt — why it's O(1) amortised",
          "char arithmetic: c - 'a', Character.isDigit / isLetter",
        ],
        problems: lc(
          "E|Reverse String",
          "E|To Lower Case",
          "E|Defanging an IP Address",
          "E|Jewels and Stones",
          "E|Goal Parser Interpretation",
        ),
        resources: [
          yt("Kunal Kushwaha — strings & StringBuilder", "Kunal Kushwaha strings stringbuilder java"),
          oracle("java/data/strings.html", "Strings"),
          oracle("java/data/buffers.html", "StringBuilder"),
        ],
      },
      {
        id: "java-oop",
        title: "OOP, wrapper classes & generics",
        days: 2,
        learnMin: 90,
        practiceMin: 60,
        concepts: [
          "Classes, objects, constructors, this, static",
          "Encapsulation, inheritance, polymorphism, abstraction, interfaces",
          "Wrapper classes (Integer, Long…), autoboxing & the Integer cache (== trap!)",
          "Generics: class Box<T>, generic methods, bounded types",
          "Writing a Node class — the base of linked lists & trees",
        ],
        problems: lc("E|Design Parking System", "E|Design an Ordered Stream"),
        resources: [
          yt("Kunal Kushwaha — OOP in Java (full)", "Kunal Kushwaha OOP java complete"),
          oracle("java/javaOO/index.html", "Classes and Objects"),
          oracle("java/generics/index.html", "Generics"),
        ],
      },
      {
        id: "java-io",
        title: "Fast I/O & Java pitfalls for coding interviews",
        days: 1,
        learnMin: 60,
        practiceMin: 60,
        concepts: [
          "BufferedReader + StringTokenizer, PrintWriter for fast output",
          "int vs long overflow (use long for sums/products), Math.abs(Integer.MIN_VALUE) trap",
          "Integer.MAX_VALUE / MIN_VALUE as sentinels",
          "How LeetCode's class Solution template works",
        ],
        problems: lc("E|Missing Number", "E|Single Number"),
        resources: [
          yt("Fast input output in Java", "fast input output java bufferedreader competitive programming"),
          web("dev.java — Java I/O", "https://dev.java/learn/java-io/"),
        ],
      },
    ],
  },
  {
    id: 1,
    title: "Time and Space Complexity",
    short: "Big-O",
    colour: "#8b5cf6",
    topics: [
      {
        id: "big-o",
        title: "Time & space complexity (Big-O, Ω, Θ)",
        days: 2,
        learnMin: 90,
        practiceMin: 60,
        concepts: [
          "Why we measure growth, not seconds",
          "Big-O, Big-Ω, Big-Θ; best / average / worst case",
          "Rules: drop constants, keep the dominant term",
          "Common classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!)",
          "Space complexity & auxiliary space; the 10⁸ operations/second rule for LeetCode limits",
        ],
        problems: lc("E|Contains Duplicate", "E|Two Sum"),
        resources: [
          yt("Kunal Kushwaha — time & space complexity", "Kunal Kushwaha time space complexity"),
          yt("Abdul Bari — asymptotic notations", "Abdul Bari asymptotic notations"),
          web("Big-O Cheat Sheet", "https://www.bigocheatsheet.com/"),
        ],
      },
      {
        id: "recurrence",
        title: "Recursion complexity, Master Theorem & amortised analysis",
        days: 1,
        learnMin: 90,
        practiceMin: 60,
        concepts: [
          "Recurrence relations: T(n) = T(n/2) + O(1), T(n) = 2T(n/2) + O(n)",
          "Recursion tree method",
          "Master Theorem — three cases",
          "Amortised analysis: why ArrayList.add is O(1) on average",
        ],
        problems: lc("E|Fibonacci Number", "M|Pow(x, n)"),
        resources: [
          yt("Abdul Bari — Master theorem", "Abdul Bari masters theorem"),
          yt("Kunal Kushwaha — recurrence relations", "Kunal Kushwaha recurrence relations"),
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Java Collections Framework",
    short: "Collections",
    colour: "#06b6d4",
    topics: [
      {
        id: "lists",
        title: "ArrayList, LinkedList & Iterator",
        days: 1,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "List interface; ArrayList internals (dynamic array, growth)",
          "LinkedList as List & Deque; when each is faster",
          "Iterator & ConcurrentModificationException",
          "Collections.sort, Collections.reverse, List.of",
        ],
        problems: lc("E|Build Array from Permutation", "E|Merge Sorted Array"),
        resources: [
          yt("Java Collections Framework full course", "java collections framework full course"),
          oracle("collections/index.html", "Collections"),
        ],
      },
      {
        id: "maps-sets",
        title: "HashMap, HashSet, TreeMap & TreeSet",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "HashMap: put, get, getOrDefault, merge, containsKey, entrySet",
          "How hashing works: hashCode, equals, buckets, load factor",
          "HashSet for uniqueness; LinkedHashMap for order",
          "TreeMap/TreeSet: sorted, floorKey, ceilingKey, firstKey — O(log n)",
        ],
        problems: lc("E|Valid Anagram", "E|Contains Duplicate II", "M|My Calendar I", "E|Sort the People"),
        resources: [
          yt("HashMap internal working in Java", "hashmap internal working java"),
          yt("TreeMap TreeSet java tutorial", "treemap treeset java tutorial"),
          oracle("collections/interfaces/map.html", "The Map Interface"),
        ],
      },
      {
        id: "deque-pq",
        title: "ArrayDeque, PriorityQueue, Comparable & Comparator",
        days: 1,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "ArrayDeque as stack (push/pop) and queue (offer/poll) — prefer over Stack class",
          "PriorityQueue: min-heap by default, max-heap with Collections.reverseOrder()",
          "Comparable (natural order) vs Comparator (custom order), lambdas (a, b) -> a[0] - b[0]",
          "Integer.compare to avoid overflow in comparators",
        ],
        problems: lc("E|Kth Largest Element in a Stream", "M|Sort Characters By Frequency", "E|Last Stone Weight"),
        resources: [
          yt("PriorityQueue and Comparator in Java", "priorityqueue comparator java"),
          oracle("collections/interfaces/order.html", "Object Ordering"),
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Mathematics and Bit Manipulation",
    short: "Math & Bits",
    colour: "#f59e0b",
    topics: [
      {
        id: "math-basics",
        title: "Number theory: divisors, primes & Sieve",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "Divisors in O(√n)",
          "Prime check in O(√n)",
          "Sieve of Eratosthenes — O(n log log n)",
          "Prime factorisation",
        ],
        problems: lc("E|Add Digits", "E|Ugly Number", "E|Power of Three", "E|Happy Number", "M|Count Primes"),
        resources: [
          yt("take U forward — maths for DSA", "take U forward basic maths dsa"),
          cp("algebra/sieve-of-eratosthenes", "Sieve of Eratosthenes"),
        ],
      },
      {
        id: "gcd-mod",
        title: "GCD/LCM, modular arithmetic & fast power",
        days: 1,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "Euclid's GCD, LCM = a / gcd × b",
          "Modular arithmetic: (a+b)%m, (a*b)%m, 1e9+7",
          "Binary exponentiation in O(log n)",
        ],
        problems: lc("E|Find Greatest Common Divisor of Array", "M|Pow(x, n)", "M|Super Pow"),
        resources: [
          cp("algebra/euclid-algorithm", "Euclidean GCD"),
          cp("algebra/binary-exp", "Binary Exponentiation"),
          yt("Binary exponentiation explained", "binary exponentiation explained java"),
        ],
      },
      {
        id: "bits",
        title: "Bit manipulation",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: [
          "Binary representation, two's complement",
          "&, |, ^, ~, <<, >>, >>> in Java",
          "Check/set/clear/toggle the i-th bit; n & (n-1) trick",
          "XOR properties: a^a=0, a^0=a",
          "Integer.bitCount, Integer.toBinaryString",
        ],
        problems: lc(
          "E|Number of 1 Bits",
          "E|Power of Two",
          "E|Counting Bits",
          "E|Reverse Bits",
          "M|Single Number II",
          "M|Sum of Two Integers",
        ),
        resources: [
          yt("Kunal Kushwaha — bitwise operators", "Kunal Kushwaha bitwise operators number systems"),
          yt("take U forward — bit manipulation", "take U forward bit manipulation"),
          tag("bit-manipulation", "Bit Manipulation"),
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Arrays",
    short: "Arrays",
    colour: "#10b981",
    topics: [
      {
        id: "array-basics",
        title: "Array fundamentals & in-place tricks",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Remove duplicates in place", "Rotate by k (reversal algorithm)", "Move zeroes", "Check sorted / rotated"],
        problems: lc(
          "E|Remove Duplicates from Sorted Array",
          "E|Move Zeroes",
          "M|Rotate Array",
          "E|Check if Array Is Sorted and Rotated",
          "E|Max Consecutive Ones",
        ),
        resources: [yt("take U forward — arrays easy", "take U forward arrays easy problems"), A2Z, tag("array", "Array")],
      },
      {
        id: "prefix-sum",
        title: "Prefix sum & difference array",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: [
          "Prefix sum: range sum in O(1)",
          "2D prefix sum",
          "Difference array for range updates",
          "Prefix & suffix products",
        ],
        problems: lc(
          "E|Range Sum Query - Immutable",
          "E|Find Pivot Index",
          "M|Product of Array Except Self",
          "M|Range Sum Query 2D - Immutable",
          "M|Corporate Flight Bookings",
        ),
        resources: [yt("Prefix sum technique", "prefix sum technique java"), tag("prefix-sum", "Prefix Sum")],
      },
      {
        id: "kadane",
        title: "Kadane's algorithm",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Max subarray sum in O(n)", "Tracking start/end indices", "Max product subarray variant"],
        problems: lc("M|Maximum Subarray", "E|Best Time to Buy and Sell Stock", "M|Maximum Product Subarray"),
        resources: [yt("take U forward — Kadane's algorithm", "take U forward kadane algorithm")],
      },
      {
        id: "two-pointers",
        title: "Two pointers",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: [
          "Opposite-ends pointers on sorted arrays",
          "Same-direction (read/write) pointers",
          "Dutch National Flag (3-way partition)",
          "3Sum/4Sum: sort + fix + two pointers, skip duplicates",
        ],
        problems: lc(
          "M|Two Sum II - Input Array Is Sorted",
          "E|Squares of a Sorted Array",
          "M|Sort Colors",
          "M|3Sum",
          "M|Container With Most Water",
          "M|4Sum",
          "H|Trapping Rain Water",
        ),
        resources: [yt("NeetCode — two pointers", "NeetCode two pointers"), tag("two-pointers", "Two Pointers")],
      },
      {
        id: "sliding-window",
        title: "Sliding window (fixed & variable)",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: [
          "Fixed window of size k",
          "Variable window: expand right, shrink left",
          "Window + HashMap for counts",
          "'At most K' trick",
        ],
        problems: lc(
          "E|Maximum Average Subarray I",
          "M|Longest Substring Without Repeating Characters",
          "M|Minimum Size Subarray Sum",
          "M|Max Consecutive Ones III",
          "M|Fruit Into Baskets",
          "M|Permutation in String",
          "H|Minimum Window Substring",
        ),
        resources: [yt("Aditya Verma — sliding window playlist", "Aditya Verma sliding window playlist"), tag("sliding-window", "Sliding Window")],
      },
      {
        id: "matrix",
        title: "Matrix (2D array) problems",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Transpose & rotate 90°", "Spiral traversal", "Set matrix zeroes in O(1) space", "Pascal's triangle"],
        problems: lc(
          "E|Transpose Matrix",
          "E|Pascal's Triangle",
          "M|Rotate Image",
          "M|Spiral Matrix",
          "M|Set Matrix Zeroes",
          "M|Game of Life",
        ),
        resources: [yt("take U forward — matrix problems", "take U forward rotate matrix spiral"), tag("matrix", "Matrix")],
      },
      {
        id: "array-misc",
        title: "Majority element, next permutation & merging",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Boyer-Moore voting", "Next permutation", "Merge sorted arrays in place"],
        problems: lc("E|Majority Element", "M|Majority Element II", "M|Next Permutation", "M|Merge Intervals"),
        resources: [yt("take U forward — Moore's voting algorithm", "take U forward moore voting algorithm")],
      },
    ],
  },
  {
    id: 5,
    title: "Strings",
    short: "Strings",
    colour: "#ec4899",
    topics: [
      {
        id: "string-basics",
        title: "String basics: palindromes, anagrams, reversal",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Two-pointer palindrome check", "int[26] frequency arrays", "Reverse words", "Isomorphism mapping"],
        problems: lc(
          "E|Valid Palindrome",
          "E|Longest Common Prefix",
          "E|Isomorphic Strings",
          "E|Rotate String",
          "E|Largest Odd Number in String",
          "M|Reverse Words in a String",
        ),
        resources: [yt("take U forward — strings easy", "take U forward strings easy"), tag("string", "String")],
      },
      {
        id: "string-medium",
        title: "Frequency, substrings & parsing",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Group by sorted key", "Expand-around-centre palindromes", "Parsing with edge cases (atoi)", "Roman numerals"],
        problems: lc(
          "E|First Unique Character in a String",
          "E|Roman to Integer",
          "M|Group Anagrams",
          "M|Longest Palindromic Substring",
          "M|String to Integer (atoi)",
          "M|Integer to Roman",
          "M|Count and Say",
        ),
        resources: [yt("NeetCode — group anagrams & palindromes", "NeetCode longest palindromic substring")],
      },
      {
        id: "pattern-matching",
        title: "Pattern matching: KMP, Z-algorithm, Rabin-Karp",
        days: 3,
        learnMin: 90,
        practiceMin: 90,
        concepts: [
          "Naive matching O(n·m)",
          "KMP & the LPS (prefix function) array",
          "Z-algorithm",
          "Rabin-Karp rolling hash",
        ],
        problems: lc(
          "E|Find the Index of the First Occurrence in a String",
          "E|Repeated Substring Pattern",
          "M|Repeated String Match",
          "H|Longest Happy Prefix",
          "H|Shortest Palindrome",
        ),
        resources: [
          yt("Abdul Bari — KMP algorithm", "Abdul Bari KMP algorithm"),
          cp("string/prefix-function", "Prefix function (KMP)"),
          cp("string/z-function", "Z-function"),
          cp("string/rabin-karp", "Rabin-Karp"),
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Recursion and Backtracking",
    short: "Recursion",
    colour: "#f97316",
    topics: [
      {
        id: "recursion-basics",
        title: "Recursion basics & the call stack",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: [
          "Base case + recursive case; drawing the recursion tree",
          "Call stack & StackOverflowError",
          "Parameterised vs functional recursion",
          "Recursion on arrays and strings",
        ],
        problems: lc("E|Fibonacci Number", "E|Power of Two", "M|K-th Symbol in Grammar", "M|Find the Winner of the Circular Game"),
        resources: [
          yt("Kunal Kushwaha — recursion playlist", "Kunal Kushwaha recursion"),
          yt("Aditya Verma — recursion playlist", "Aditya Verma recursion playlist"),
          vis("recursion", "Recursion tree"),
        ],
      },
      {
        id: "subsets",
        title: "Subsets, subsequences & combinations",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Pick / not-pick pattern", "Handling duplicates (sort + skip)", "Combination sum family"],
        problems: lc("M|Subsets", "M|Subsets II", "M|Combination Sum", "M|Combination Sum II", "M|Combination Sum III"),
        resources: [yt("take U forward — recursion & subsequences", "take U forward recursion subsequences")],
      },
      {
        id: "permutations",
        title: "Permutations & generating strings",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Swap-based permutations", "Used[] array permutations", "Generate valid parentheses"],
        problems: lc(
          "M|Permutations",
          "M|Permutations II",
          "M|Letter Combinations of a Phone Number",
          "M|Generate Parentheses",
          "M|Letter Case Permutation",
        ),
        resources: [yt("NeetCode — backtracking", "NeetCode backtracking permutations")],
      },
      {
        id: "backtracking",
        title: "Classic backtracking: N-Queens, Sudoku, word search",
        days: 4,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Choose → explore → un-choose", "Pruning", "Board/grid backtracking", "Partitioning strings"],
        problems: lc(
          "M|Word Search",
          "M|Palindrome Partitioning",
          "M|Restore IP Addresses",
          "H|N-Queens",
          "H|N-Queens II",
          "H|Sudoku Solver",
        ),
        resources: [yt("take U forward — N-Queens & Sudoku", "take U forward n queens sudoku solver"), tag("backtracking", "Backtracking")],
      },
    ],
  },
  {
    id: 7,
    title: "Searching and Sorting",
    short: "Sort & Search",
    colour: "#14b8a6",
    topics: [
      {
        id: "basic-sorts",
        title: "Bubble, selection & insertion sort",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: ["Bubble sort + early exit", "Selection sort", "Insertion sort", "Stable vs unstable, in-place"],
        problems: lc("E|Height Checker", "E|Relative Sort Array", "M|Insertion Sort List", "M|Sort an Array"),
        resources: [yt("Kunal Kushwaha — bubble/selection/insertion", "Kunal Kushwaha bubble selection insertion sort"), vis("sorting", "Sorting")],
      },
      {
        id: "merge-quick",
        title: "Merge sort & quick sort (divide and conquer)",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Merge sort O(n log n)", "Quick sort, pivot choice, Lomuto/Hoare", "Quickselect", "Counting inversions"],
        problems: lc("M|Sort an Array", "M|Sort List", "M|Kth Largest Element in an Array", "H|Reverse Pairs"),
        resources: [yt("Kunal Kushwaha — merge sort & quick sort", "Kunal Kushwaha merge sort quick sort"), vis("sorting", "Sorting")],
      },
      {
        id: "linear-sorts",
        title: "Counting, radix & cyclic sort",
        days: 1,
        learnMin: 60,
        practiceMin: 90,
        concepts: ["Counting sort", "Radix sort", "Cyclic sort for 1..n problems"],
        problems: lc(
          "E|Find All Numbers Disappeared in an Array",
          "M|Find All Duplicates in an Array",
          "M|Maximum Gap",
          "H|First Missing Positive",
        ),
        resources: [yt("Kunal Kushwaha — cyclic sort", "Kunal Kushwaha cyclic sort")],
      },
      {
        id: "binary-search",
        title: "Binary search fundamentals",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: ["Iterative template, mid = lo + (hi - lo) / 2", "Lower & upper bound", "First/last occurrence"],
        problems: lc(
          "E|Binary Search",
          "E|Search Insert Position",
          "E|Sqrt(x)",
          "E|First Bad Version",
          "M|Find First and Last Position of Element in Sorted Array",
        ),
        resources: [yt("Kunal Kushwaha — binary search", "Kunal Kushwaha binary search"), tag("binary-search", "Binary Search")],
      },
      {
        id: "bs-rotated",
        title: "Binary search on rotated arrays & 2D matrices",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Identify the sorted half", "Peak element", "Treat matrix as a 1D array"],
        problems: lc(
          "M|Search in Rotated Sorted Array",
          "M|Find Minimum in Rotated Sorted Array",
          "M|Find Peak Element",
          "M|Single Element in a Sorted Array",
          "M|Search a 2D Matrix",
        ),
        resources: [yt("take U forward — binary search playlist", "take U forward binary search playlist")],
      },
      {
        id: "bs-answer",
        title: "Binary search on the answer",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Monotonic predicate", "Min of max / max of min problems", "Search range = answer space"],
        problems: lc(
          "M|Koko Eating Bananas",
          "M|Capacity To Ship Packages Within D Days",
          "M|Minimum Number of Days to Make m Bouquets",
          "M|Find the Smallest Divisor Given a Threshold",
          "H|Split Array Largest Sum",
          "H|Median of Two Sorted Arrays",
        ),
        resources: [yt("Aditya Verma — binary search playlist", "Aditya Verma binary search playlist")],
      },
    ],
  },
  {
    id: 8,
    title: "Hashing",
    short: "Hashing",
    colour: "#6366f1",
    topics: [
      {
        id: "hashing-basics",
        title: "Hash functions, collisions & frequency maps",
        days: 2,
        learnMin: 60,
        practiceMin: 90,
        concepts: ["Chaining vs open addressing", "Design your own HashMap", "Frequency counting patterns"],
        problems: lc("E|Ransom Note", "E|Design HashSet", "E|Design HashMap", "E|Happy Number"),
        resources: [yt("Hashing in data structures", "hashing data structure chaining open addressing"), vis("hashtable", "Hash table")],
      },
      {
        id: "hash-prefix",
        title: "Prefix sum + HashMap patterns",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Count subarrays with sum K", "Remainder maps (mod K)", "HashSet for sequences"],
        problems: lc(
          "M|Subarray Sum Equals K",
          "M|Longest Consecutive Sequence",
          "M|Continuous Subarray Sum",
          "M|Subarray Sums Divisible by K",
          "M|4Sum II",
          "M|Count Number of Nice Subarrays",
        ),
        resources: [yt("take U forward — subarray sum equals k", "take U forward subarray sum equals k"), tag("hash-table", "Hash Table")],
      },
    ],
  },
  {
    id: 9,
    title: "Linked Lists",
    short: "Linked List",
    colour: "#ef4444",
    topics: [
      {
        id: "ll-basics",
        title: "Singly linked list: build, insert, delete, reverse",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["ListNode class", "Insert/delete at head, tail, index", "Dummy node trick", "Iterative & recursive reverse"],
        problems: lc(
          "M|Design Linked List",
          "M|Delete Node in a Linked List",
          "E|Remove Linked List Elements",
          "E|Reverse Linked List",
          "E|Convert Binary Number in a Linked List to Integer",
        ),
        resources: [yt("Kunal Kushwaha — linked list", "Kunal Kushwaha linked list"), vis("list", "Linked list")],
      },
      {
        id: "ll-fast-slow",
        title: "Fast & slow pointers",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Middle node", "Floyd's cycle detection & cycle start", "Nth from end", "Palindrome list"],
        problems: lc(
          "E|Middle of the Linked List",
          "E|Linked List Cycle",
          "M|Linked List Cycle II",
          "E|Palindrome Linked List",
          "M|Remove Nth Node From End of List",
          "E|Intersection of Two Linked Lists",
        ),
        resources: [yt("take U forward — linked list playlist", "take U forward linked list playlist")],
      },
      {
        id: "ll-merge",
        title: "Merging, reordering & arithmetic on lists",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Merge two sorted lists", "Reorder / rotate", "Reverse a sub-list", "Merge sort on a list"],
        problems: lc(
          "E|Merge Two Sorted Lists",
          "M|Add Two Numbers",
          "M|Odd Even Linked List",
          "M|Reorder List",
          "M|Rotate List",
          "M|Reverse Linked List II",
          "M|Swap Nodes in Pairs",
        ),
        resources: [yt("NeetCode — linked list problems", "NeetCode reorder list linked list")],
      },
      {
        id: "ll-advanced",
        title: "Doubly linked lists, LRU cache & hard problems",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Doubly & circular lists", "LRU cache = HashMap + doubly linked list", "Deep copy with random pointers"],
        problems: lc(
          "M|Design Browser History",
          "M|Flatten a Multilevel Doubly Linked List",
          "M|Copy List with Random Pointer",
          "M|LRU Cache",
          "H|Reverse Nodes in k-Group",
        ),
        resources: [yt("LRU cache design in Java", "LRU cache java hashmap doubly linked list")],
      },
    ],
  },
  {
    id: 10,
    title: "Stacks and Queues",
    short: "Stack/Queue",
    colour: "#a855f7",
    topics: [
      {
        id: "stack-queue-impl",
        title: "Implement stacks & queues",
        days: 1,
        learnMin: 60,
        practiceMin: 90,
        concepts: ["Stack with array / linked list", "Queue & circular queue", "Stack using queues and vice versa", "Min stack"],
        problems: lc("E|Implement Stack using Queues", "E|Implement Queue using Stacks", "M|Min Stack", "M|Design Circular Queue"),
        resources: [yt("Kunal Kushwaha — stacks & queues", "Kunal Kushwaha stack queue")],
      },
      {
        id: "stack-classic",
        title: "Classic stack problems",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Balanced brackets", "Postfix evaluation", "Stack for simulation (collisions, paths)", "Nested decoding"],
        problems: lc(
          "E|Valid Parentheses",
          "E|Backspace String Compare",
          "E|Remove All Adjacent Duplicates In String",
          "M|Evaluate Reverse Polish Notation",
          "M|Asteroid Collision",
          "M|Simplify Path",
          "M|Decode String",
        ),
        resources: [tag("stack", "Stack")],
      },
      {
        id: "monotonic-stack",
        title: "Monotonic stack",
        days: 3,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Next / previous greater & smaller", "Stock span", "Histogram largest rectangle", "Sum of subarray minimums"],
        problems: lc(
          "E|Next Greater Element I",
          "M|Next Greater Element II",
          "M|Daily Temperatures",
          "M|Online Stock Span",
          "M|Remove K Digits",
          "M|Sum of Subarray Minimums",
          "H|Largest Rectangle in Histogram",
          "H|Maximal Rectangle",
        ),
        resources: [yt("Aditya Verma — stack playlist", "Aditya Verma stack playlist"), tag("monotonic-stack", "Monotonic Stack")],
      },
      {
        id: "deque",
        title: "Queues & deques in practice",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Monotonic deque — sliding window max", "Queue simulation"],
        problems: lc("E|Number of Recent Calls", "M|Design Circular Deque", "M|Dota2 Senate", "H|Sliding Window Maximum"),
        resources: [yt("NeetCode — sliding window maximum", "NeetCode sliding window maximum")],
      },
    ],
  },
  {
    id: 11,
    title: "Trees and Binary Search Trees",
    short: "Trees",
    colour: "#22c55e",
    topics: [
      {
        id: "tree-traversal",
        title: "Binary trees & traversals",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: [
          "TreeNode, terminology (height, depth, leaf)",
          "Preorder, inorder, postorder — recursive & iterative",
          "Level order with a Queue",
        ],
        problems: lc(
          "E|Binary Tree Preorder Traversal",
          "E|Binary Tree Inorder Traversal",
          "E|Binary Tree Postorder Traversal",
          "M|Binary Tree Level Order Traversal",
          "E|Maximum Depth of Binary Tree",
        ),
        resources: [yt("take U forward — tree series", "take U forward binary tree series"), tag("tree", "Tree")],
      },
      {
        id: "tree-properties",
        title: "Height, diameter, balance & symmetry",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Return info from children (post-order thinking)", "Diameter & max path sum", "Same / symmetric / invert"],
        problems: lc(
          "E|Same Tree",
          "E|Symmetric Tree",
          "E|Invert Binary Tree",
          "E|Balanced Binary Tree",
          "E|Diameter of Binary Tree",
          "H|Binary Tree Maximum Path Sum",
        ),
        resources: [yt("NeetCode — trees", "NeetCode trees playlist")],
      },
      {
        id: "tree-views",
        title: "Views & level-order variants",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Right/left view", "Zigzag", "Vertical order with TreeMap", "Width with indices"],
        problems: lc(
          "E|Average of Levels in Binary Tree",
          "M|Binary Tree Right Side View",
          "M|Binary Tree Zigzag Level Order Traversal",
          "M|Maximum Width of Binary Tree",
          "H|Vertical Order Traversal of a Binary Tree",
        ),
        resources: [yt("take U forward — tree views", "take U forward top view bottom view vertical order")],
      },
      {
        id: "tree-lca",
        title: "LCA, paths, construction & serialisation",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Lowest common ancestor", "Root-to-leaf paths", "Build tree from traversals", "Serialize/deserialize"],
        problems: lc(
          "E|Path Sum",
          "M|Path Sum II",
          "M|Lowest Common Ancestor of a Binary Tree",
          "M|All Nodes Distance K in Binary Tree",
          "M|Construct Binary Tree from Preorder and Inorder Traversal",
          "M|Count Complete Tree Nodes",
          "H|Serialize and Deserialize Binary Tree",
        ),
        resources: [yt("NeetCode — LCA & construct tree", "NeetCode construct binary tree preorder inorder")],
      },
      {
        id: "bst",
        title: "Binary search trees",
        days: 3,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Search, insert, delete in a BST", "Validate with min/max bounds", "Inorder = sorted", "BST iterator"],
        problems: lc(
          "E|Search in a Binary Search Tree",
          "M|Insert into a Binary Search Tree",
          "M|Delete Node in a BST",
          "M|Validate Binary Search Tree",
          "M|Kth Smallest Element in a BST",
          "M|Lowest Common Ancestor of a Binary Search Tree",
          "E|Convert Sorted Array to Binary Search Tree",
          "E|Two Sum IV - Input is a BST",
          "M|Binary Search Tree Iterator",
          "M|Recover Binary Search Tree",
        ),
        resources: [yt("take U forward — BST playlist", "take U forward binary search tree"), vis("bst", "BST & AVL")],
      },
      {
        id: "balanced-trees",
        title: "Balanced trees (AVL / Red-Black concepts)",
        days: 1,
        learnMin: 90,
        practiceMin: 60,
        concepts: ["Why BSTs degrade to O(n)", "AVL rotations (LL, RR, LR, RL)", "Red-Black tree idea — Java's TreeMap uses it"],
        problems: lc("M|Balance a Binary Search Tree"),
        resources: [yt("Abdul Bari — AVL trees", "Abdul Bari AVL tree rotations"), vis("bst", "AVL tree")],
      },
    ],
  },
  {
    id: 12,
    title: "Heaps and Priority Queues",
    short: "Heaps",
    colour: "#eab308",
    topics: [
      {
        id: "heap-impl",
        title: "Heap implementation & heapify",
        days: 1,
        learnMin: 90,
        practiceMin: 60,
        concepts: ["Complete binary tree in an array", "Sift up / sift down", "Build heap in O(n)", "Heap sort"],
        problems: lc("E|Last Stone Weight", "E|Relative Ranks", "E|Kth Largest Element in a Stream"),
        resources: [yt("Kunal Kushwaha — heaps", "Kunal Kushwaha heap"), vis("heap", "Binary heap")],
      },
      {
        id: "top-k",
        title: "Top-K & scheduling patterns",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Size-K heap", "Frequency + heap", "Greedy with heap"],
        problems: lc(
          "M|Kth Largest Element in an Array",
          "M|Top K Frequent Elements",
          "M|K Closest Points to Origin",
          "M|Task Scheduler",
          "M|Reorganize String",
        ),
        resources: [yt("Aditya Verma — heap playlist", "Aditya Verma heap playlist"), tag("heap-priority-queue", "Heap")],
      },
      {
        id: "heap-hard",
        title: "Two heaps & K-way merge",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Median with two heaps", "Merge K sorted lists"],
        problems: lc("H|Merge k Sorted Lists", "H|Find Median from Data Stream", "H|IPO", "H|Sliding Window Median"),
        resources: [yt("NeetCode — find median from data stream", "NeetCode find median from data stream")],
      },
    ],
  },
  {
    id: 13,
    title: "Greedy Algorithms",
    short: "Greedy",
    colour: "#84cc16",
    topics: [
      {
        id: "greedy-basics",
        title: "Greedy basics",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Greedy choice property", "When greedy fails (vs DP)", "Fractional knapsack", "Jump game reasoning"],
        problems: lc(
          "E|Assign Cookies",
          "E|Lemonade Change",
          "M|Best Time to Buy and Sell Stock II",
          "M|Jump Game",
          "M|Jump Game II",
          "M|Gas Station",
        ),
        resources: [yt("take U forward — greedy playlist", "take U forward greedy algorithms"), tag("greedy", "Greedy")],
      },
      {
        id: "intervals",
        title: "Interval problems",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Sort by start / end", "Activity selection", "Merge & insert intervals"],
        problems: lc(
          "M|Merge Intervals",
          "M|Insert Interval",
          "M|Non-overlapping Intervals",
          "M|Minimum Number of Arrows to Burst Balloons",
          "M|Partition Labels",
        ),
        resources: [yt("NeetCode — intervals", "NeetCode intervals")],
      },
      {
        id: "greedy-advanced",
        title: "Advanced greedy & Huffman coding",
        days: 1,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Two-pass greedy", "Huffman coding with a PriorityQueue"],
        problems: lc("M|Valid Parenthesis String", "M|Boats to Save People", "M|Hand of Straights", "H|Candy"),
        resources: [yt("Abdul Bari — Huffman coding", "Abdul Bari huffman coding")],
      },
    ],
  },
  {
    id: 14,
    title: "Graphs",
    short: "Graphs",
    colour: "#0ea5e9",
    topics: [
      {
        id: "graph-basics",
        title: "Graph representation, BFS & DFS",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: [
          "Directed/undirected, weighted, adjacency matrix vs List<List<Integer>>",
          "BFS with a queue + visited[]",
          "DFS recursive & iterative",
          "Connected components",
        ],
        problems: lc("E|Find if Path Exists in Graph", "M|Number of Provinces", "E|Flood Fill", "M|Keys and Rooms", "M|Clone Graph"),
        resources: [
          yt("take U forward — graph series", "take U forward graph series"),
          yt("William Fiset — graph theory", "William Fiset graph theory"),
          vis("dfsbfs", "BFS & DFS"),
        ],
      },
      {
        id: "grid-graphs",
        title: "Grid BFS/DFS (matrix as a graph)",
        days: 2,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["4-direction arrays", "Multi-source BFS", "Boundary DFS"],
        problems: lc(
          "M|Number of Islands",
          "M|Max Area of Island",
          "M|Rotting Oranges",
          "M|01 Matrix",
          "M|Surrounded Regions",
          "M|Number of Enclaves",
          "M|Pacific Atlantic Water Flow",
        ),
        resources: [yt("NeetCode — number of islands & rotting oranges", "NeetCode rotting oranges")],
      },
      {
        id: "cycle-bipartite",
        title: "Cycle detection & bipartite graphs",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Cycle in undirected (parent) vs directed (path visited)", "2-colouring for bipartite"],
        problems: lc("M|Is Graph Bipartite?", "M|Course Schedule", "M|Find Eventual Safe States", "M|Redundant Connection"),
        resources: [yt("take U forward — cycle detection", "take U forward detect cycle directed graph")],
      },
      {
        id: "topo-sort",
        title: "Topological sort (Kahn's & DFS)",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["DAGs", "Kahn's algorithm with in-degree", "DFS post-order topo sort"],
        problems: lc("M|Course Schedule II", "M|Minimum Height Trees", "H|Longest Increasing Path in a Matrix"),
        resources: [cp("graph/topological-sort", "Topological sort"), tag("topological-sort", "Topological Sort")],
      },
      {
        id: "shortest-path",
        title: "Shortest paths: BFS & Dijkstra",
        days: 3,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Unweighted shortest path with BFS", "Dijkstra with PriorityQueue<int[]>", "0-1 BFS", "Counting shortest paths"],
        problems: lc(
          "M|Shortest Path in Binary Matrix",
          "M|Network Delay Time",
          "M|Path With Minimum Effort",
          "M|Number of Ways to Arrive at Destination",
          "H|Word Ladder",
        ),
        resources: [yt("Abdul Bari — Dijkstra", "Abdul Bari dijkstra algorithm"), cp("graph/dijkstra", "Dijkstra"), vis("sssp", "Shortest paths")],
      },
      {
        id: "bellman-floyd",
        title: "Bellman-Ford & Floyd-Warshall",
        days: 1,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Negative edges & negative cycles", "Relax V-1 times", "All-pairs shortest paths"],
        problems: lc(
          "M|Cheapest Flights Within K Stops",
          "M|Find the City With the Smallest Number of Neighbors at a Threshold Distance",
        ),
        resources: [cp("graph/bellman_ford", "Bellman-Ford"), cp("graph/all-pair-shortest-path-floyd-warshall", "Floyd-Warshall")],
      },
      {
        id: "mst-dsu",
        title: "Union-Find (DSU) & Minimum Spanning Trees",
        days: 3,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["DSU with path compression + union by rank", "Kruskal's MST", "Prim's MST"],
        problems: lc(
          "M|Min Cost to Connect All Points",
          "M|Number of Operations to Make Network Connected",
          "M|Accounts Merge",
          "M|Most Stones Removed with Same Row or Column",
          "H|Swim in Rising Water",
          "H|Making A Large Island",
        ),
        resources: [
          cp("data_structures/disjoint_set_union", "Disjoint Set Union"),
          cp("graph/mst_kruskal", "Kruskal"),
          vis("mst", "MST"),
          vis("ufds", "Union-Find"),
        ],
      },
      {
        id: "scc-bridges",
        title: "Strongly connected components & bridges",
        days: 1,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Kosaraju's algorithm", "Tarjan's low-link", "Bridges & articulation points"],
        problems: lc("H|Critical Connections in a Network"),
        resources: [cp("graph/strongly-connected-components", "SCC"), cp("graph/bridge-searching", "Bridges")],
      },
    ],
  },
  {
    id: 15,
    title: "Dynamic Programming",
    short: "DP",
    colour: "#d946ef",
    topics: [
      {
        id: "dp-1d",
        title: "DP intro: memoization vs tabulation (1D)",
        days: 3,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Overlapping subproblems & optimal substructure", "Recursion → memo → table → space-optimised", "1D DP on sequences"],
        problems: lc(
          "E|Climbing Stairs",
          "E|N-th Tribonacci Number",
          "E|Min Cost Climbing Stairs",
          "M|House Robber",
          "M|House Robber II",
          "M|Decode Ways",
        ),
        resources: [
          yt("take U forward — DP series", "take U forward dynamic programming series"),
          yt("Aditya Verma — DP playlist", "Aditya Verma dynamic programming playlist"),
          cp("dynamic_programming/intro-to-dp", "Intro to DP"),
        ],
      },
      {
        id: "dp-grid",
        title: "DP on grids",
        days: 3,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Paths in a grid", "Obstacles", "Triangle / falling paths", "3D DP (two walkers)"],
        problems: lc(
          "M|Unique Paths",
          "M|Unique Paths II",
          "M|Minimum Path Sum",
          "M|Triangle",
          "M|Minimum Falling Path Sum",
          "M|Maximal Square",
          "M|Count Square Submatrices with All Ones",
          "H|Cherry Pickup II",
          "H|Dungeon Game",
        ),
        resources: [yt("take U forward — DP on grids", "take U forward dp on grids")],
      },
      {
        id: "dp-knapsack",
        title: "Subsets & knapsack (0/1 and unbounded)",
        days: 4,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Subset sum", "0/1 knapsack", "Unbounded knapsack (coin change)", "Count ways vs min/max"],
        problems: lc(
          "M|Partition Equal Subset Sum",
          "M|Target Sum",
          "M|Last Stone Weight II",
          "M|Ones and Zeroes",
          "M|Coin Change",
          "M|Coin Change II",
          "M|Perfect Squares",
        ),
        resources: [yt("Aditya Verma — knapsack", "Aditya Verma 0 1 knapsack")],
      },
      {
        id: "dp-strings",
        title: "DP on strings (LCS, edit distance…)",
        days: 4,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["LCS table", "Palindromic subsequence = LCS(s, reverse)", "Edit distance", "Wildcard / regex matching"],
        problems: lc(
          "M|Longest Common Subsequence",
          "M|Longest Palindromic Subsequence",
          "M|Delete Operation for Two Strings",
          "H|Minimum Insertion Steps to Make a String Palindrome",
          "M|Edit Distance",
          "H|Distinct Subsequences",
          "H|Shortest Common Supersequence",
          "H|Wildcard Matching",
          "H|Regular Expression Matching",
        ),
        resources: [yt("take U forward — DP on strings", "take U forward dp on strings lcs")],
      },
      {
        id: "dp-stocks",
        title: "DP on stocks (state machines)",
        days: 1,
        learnMin: 45,
        practiceMin: 120,
        concepts: ["Buy/sell state DP", "Transaction limits", "Cooldown & fees"],
        problems: lc(
          "M|Best Time to Buy and Sell Stock with Cooldown",
          "M|Best Time to Buy and Sell Stock with Transaction Fee",
          "H|Best Time to Buy and Sell Stock III",
          "H|Best Time to Buy and Sell Stock IV",
        ),
        resources: [yt("take U forward — DP on stocks", "take U forward dp on stocks")],
      },
      {
        id: "dp-lis",
        title: "Longest increasing subsequence family",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["O(n²) LIS", "O(n log n) LIS with binary search", "Printing the LIS", "Divisible subset / chains"],
        problems: lc(
          "M|Longest Increasing Subsequence",
          "M|Number of Longest Increasing Subsequence",
          "M|Largest Divisible Subset",
          "M|Longest String Chain",
          "H|Russian Doll Envelopes",
        ),
        resources: [cp("sequences/longest_increasing_subsequence", "LIS")],
      },
      {
        id: "dp-partition",
        title: "Partition DP / Matrix Chain Multiplication",
        days: 2,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["dp[i][j] over intervals", "MCM pattern", "Try every split point"],
        problems: lc(
          "M|Partition Array for Maximum Sum",
          "H|Palindrome Partitioning II",
          "H|Minimum Cost to Cut a Stick",
          "H|Burst Balloons",
        ),
        resources: [yt("Aditya Verma — MCM playlist", "Aditya Verma matrix chain multiplication")],
      },
      {
        id: "dp-advanced",
        title: "DP on trees, bitmask DP & digit DP",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Return (take, skip) pairs from children", "Bitmask states for subsets", "Digit DP template"],
        problems: lc(
          "M|House Robber III",
          "H|Binary Tree Cameras",
          "M|Partition to K Equal Sum Subsets",
          "H|Shortest Path Visiting All Nodes",
          "M|Count Numbers with Unique Digits",
          "H|Number of Digit One",
        ),
        resources: [yt("Bitmask DP tutorial", "bitmask dp tutorial"), yt("Digit DP tutorial", "digit dp tutorial"), vis("bitmask", "Bitmask")],
      },
    ],
  },
  {
    id: 16,
    title: "Tries",
    short: "Tries",
    colour: "#f43f5e",
    topics: [
      {
        id: "trie",
        title: "Trie: insert, search, prefix & XOR tricks",
        days: 3,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["TrieNode with children[26]", "Insert / search / startsWith", "Wildcard search", "Bitwise trie for max XOR"],
        problems: lc(
          "M|Implement Trie (Prefix Tree)",
          "M|Design Add and Search Words Data Structure",
          "M|Longest Word in Dictionary",
          "M|Replace Words",
          "M|Maximum XOR of Two Numbers in an Array",
          "H|Word Search II",
        ),
        resources: [yt("take U forward — trie series", "take U forward trie"), tag("trie", "Trie")],
      },
    ],
  },
  {
    id: 17,
    title: "Advanced Data Structures",
    short: "Advanced",
    colour: "#64748b",
    topics: [
      {
        id: "segment-tree",
        title: "Segment tree (range queries + updates)",
        days: 2,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["Build / query / update in O(log n)", "Lazy propagation"],
        problems: lc("M|Range Sum Query - Mutable", "H|Count of Range Sum"),
        resources: [cp("data_structures/segment_tree", "Segment tree"), vis("segmenttree", "Segment tree")],
      },
      {
        id: "fenwick",
        title: "Fenwick tree (Binary Indexed Tree)",
        days: 1,
        learnMin: 90,
        practiceMin: 90,
        concepts: ["i & -i lowbit", "Prefix sums with point updates", "Inversion counting"],
        problems: lc("H|Count of Smaller Numbers After Self", "H|Create Sorted Array through Instructions"),
        resources: [cp("data_structures/fenwick", "Fenwick tree"), vis("fenwicktree", "Fenwick tree")],
      },
      {
        id: "sparse-sqrt",
        title: "Sparse table & sqrt decomposition",
        days: 1,
        learnMin: 120,
        practiceMin: 60,
        concepts: ["O(1) range-min queries", "√n blocks", "When to use which structure"],
        problems: lc("H|Sliding Window Maximum"),
        resources: [cp("data_structures/sparse-table", "Sparse table"), cp("data_structures/sqrt_decomposition", "Sqrt decomposition")],
      },
      {
        id: "string-hashing",
        title: "String hashing & rolling hash",
        days: 1,
        learnMin: 60,
        practiceMin: 120,
        concepts: ["Polynomial hash", "Double hashing to avoid collisions", "Binary search + hashing"],
        problems: lc("M|Repeated DNA Sequences", "H|Longest Duplicate Substring"),
        resources: [cp("string/string-hashing", "String hashing")],
      },
    ],
  },
  {
    id: 18,
    title: "Revision and Mock Interviews",
    short: "Revision",
    colour: "#78716c",
    topics: [
      {
        id: "revision",
        title: "Mixed revision & timed mock interviews",
        days: 7,
        learnMin: 30,
        practiceMin: 150,
        concepts: [
          "Re-solve problems you marked hard without looking",
          "45-minute timed sessions: 2 problems each",
          "Explain your approach out loud (as in an interview)",
          "Write a one-line pattern note for every problem",
        ],
        problems: lc(
          "M|Word Break",
          "M|Time Based Key-Value Store",
          "M|Design Twitter",
          "H|Longest Valid Parentheses",
          "M|LRU Cache",
          "M|Course Schedule",
          "M|Longest Substring Without Repeating Characters",
        ),
        resources: [web("NeetCode roadmap", "https://neetcode.io/roadmap"), A2Z, yt("Mock coding interview Java", "mock coding interview java")],
      },
    ],
  },
];

// ---------- day-by-day plan ----------
export interface PlanDay {
  day: number; // 1-based position in the current plan (changes when days are split/added)
  key: string; // stable id: "topicId#part" or "topicId#part.sub" for split days
  phase: Phase;
  topic: Topic;
  part: number; // 1..topic.days
  sub?: { index: number; of: number }; // set when a day was split
  concepts: string[];
  problems: Problem[];
  learnMin: number;
  practiceMin: number;
  reviseMin: number;
}

/** Learner customisations that reshape the plan (saved in their progress). */
export interface PlanConfig {
  customPhases?: { id: number; title: string; short: string }[];
  customTopics?: { id: string; phaseId: number; title: string; days: number; concepts: string[] }[];
  extraConcepts?: Record<string, string[]>; // topicId → concepts added by the learner
  splits?: Record<string, number>; // "topicId#part" → split into 2 or 3 days
}

const chunk = <T,>(arr: T[], parts: number, i: number): T[] => {
  const size = Math.ceil(arr.length / parts);
  return arr.slice(i * size, (i + 1) * size);
};

/** Base phases + extra concepts + custom topics + custom phases. */
export function buildPhases(cfg: PlanConfig = {}): Phase[] {
  const out: Phase[] = BASE_PHASES.map((ph) => ({
    ...ph,
    topics: ph.topics.map((t) => (cfg.extraConcepts?.[t.id]?.length ? { ...t, concepts: [...t.concepts, ...cfg.extraConcepts[t.id]] } : t)),
  }));
  for (const cp of cfg.customPhases ?? []) out.push({ id: cp.id, title: cp.title, short: cp.short, colour: "#6366f1", topics: [], custom: true });
  for (const ct of cfg.customTopics ?? []) {
    const ph = out.find((p) => p.id === ct.phaseId);
    if (!ph) continue;
    ph.topics = [
      ...ph.topics,
      {
        id: ct.id,
        title: ct.title,
        days: Math.max(1, Math.min(10, ct.days)),
        learnMin: 90,
        practiceMin: 90,
        concepts: [...ct.concepts, ...(cfg.extraConcepts?.[ct.id] ?? [])],
        problems: [],
        resources: [],
        custom: true,
      },
    ];
  }
  return out;
}

export function buildPlan(ph: Phase[], splits: Record<string, number> = {}): PlanDay[] {
  const days: PlanDay[] = [];
  for (const phase of ph) {
    for (const topic of phase.topics) {
      for (let i = 0; i < topic.days; i++) {
        const key = `${topic.id}#${i + 1}`;
        const concepts = chunk(topic.concepts, topic.days, i);
        const problems = chunk(topic.problems, topic.days, i);
        const n = Math.max(1, Math.min(3, splits[key] ?? 1));
        for (let j = 0; j < n; j++) {
          days.push({
            day: days.length + 1,
            key: n > 1 ? `${key}.${j + 1}` : key,
            phase,
            topic,
            part: i + 1,
            sub: n > 1 ? { index: j + 1, of: n } : undefined,
            concepts: n > 1 ? chunk(concepts, n, j) : concepts,
            problems: n > 1 ? chunk(problems, n, j) : problems,
            learnMin: topic.learnMin,
            practiceMin: topic.practiceMin,
            reviseMin: 15,
          });
        }
      }
    }
  }
  return days;
}

export const planKeysFor = (cfg: PlanConfig) => buildPlan(buildPhases(cfg), cfg.splits).map((d) => d.key);

/**
 * Live phases and plan. They start as the built-in curriculum and are rebuilt
 * in place (same array objects) when the learner customises the plan, so every
 * module that imported them sees the current version.
 */
export const phases: Phase[] = buildPhases();
export const plan: PlanDay[] = buildPlan(phases);

let version = 0;
let lastSig = "{}";
export const planVersion = () => version;

export function applyPlanConfig(cfg: PlanConfig) {
  const sig = JSON.stringify({ a: cfg.customPhases ?? [], b: cfg.customTopics ?? [], c: cfg.extraConcepts ?? {}, d: cfg.splits ?? {} });
  if (sig === lastSig) return;
  lastSig = sig;
  const nextPhases = buildPhases(cfg);
  phases.splice(0, phases.length, ...nextPhases);
  plan.splice(0, plan.length, ...buildPlan(phases, cfg.splits));
  version++;
}

export const totalProblems = new Set(plan.flatMap((d) => d.problems.map((p) => p.slug))).size;
export const totalMinutes = plan.reduce((s, d) => s + d.learnMin + d.practiceMin + d.reviseMin, 0);

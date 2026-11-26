// Multiple-choice mock tests: five questions per phase, each with an explanation.

export interface Question {
  q: string;
  options: string[];
  answer: number; // index into options
  why: string;
}

export const quizzes: Record<number, Question[]> = {
  0: [
    { q: "What does System.out.println(7 / 2) print in Java?", options: ["3.5", "3", "4", "Compile error"], answer: 1, why: "Both operands are int, so integer division truncates toward zero." },
    { q: "Which comparison checks whether two String objects have the same characters?", options: ["a == b", "a.equals(b)", "a.compareTo(b) == 1", "a.hashCode() == b"], answer: 1, why: "== compares references; equals compares content." },
    { q: "Integer a = 1000, b = 1000; what is a == b?", options: ["true", "false", "Compile error", "Throws an exception"], answer: 1, why: "Only −128..127 are cached; 1000 creates two distinct objects, so == compares different references." },
    { q: "Why prefer StringBuilder over s += c inside a loop?", options: ["It uses less code", "String concatenation copies the whole string each time (O(n²) total)", "Strings can't hold chars", "StringBuilder is thread-safe"], answer: 1, why: "Strings are immutable, so each += builds a new string. StringBuilder appends in amortised O(1)." },
    { q: "What prints for int x = Integer.MAX_VALUE; System.out.println(x + 1);?", options: ["2147483648", "-2147483648", "0", "OverflowException"], answer: 1, why: "int overflow wraps around silently to Integer.MIN_VALUE." },
  ],
  1: [
    { q: "What is the time complexity of: for (i = 1; i < n; i *= 2) {}?", options: ["O(n)", "O(log n)", "O(n log n)", "O(√n)"], answer: 1, why: "i doubles each iteration, so it takes about log₂ n steps." },
    { q: "Simplify O(3n² + 10n + 50).", options: ["O(3n²)", "O(n² + n)", "O(n²)", "O(n)"], answer: 2, why: "Drop constants and lower-order terms." },
    { q: "For n = 10⁵, which complexity is usually too slow on a judge?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 2, why: "10¹⁰ operations far exceed the ~10⁸ per second budget." },
    { q: "Using the Master Theorem, T(n) = 2T(n/2) + O(n) is:", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 1, why: "a = 2, b = 2, f(n) = n equals n^(log₂2) → case 2 → Θ(n log n)." },
    { q: "Why is ArrayList.add O(1) amortised even though resizing costs O(n)?", options: ["Resizing never happens", "Capacity grows geometrically, so total copying over n adds is O(n)", "Java uses a linked list internally", "It's actually O(log n)"], answer: 1, why: "Geometric growth spreads the occasional O(n) copy over many cheap adds." },
  ],
  2: [
    { q: "Which structure gives O(log n) floorKey / ceilingKey queries?", options: ["HashMap", "TreeMap", "ArrayList", "LinkedHashMap"], answer: 1, why: "TreeMap is a red-black tree that keeps keys sorted." },
    { q: "Which is the recommended stack implementation in modern Java?", options: ["Stack", "Vector", "ArrayDeque", "LinkedHashSet"], answer: 2, why: "ArrayDeque is faster and unsynchronised; Stack is legacy." },
    { q: "new PriorityQueue<Integer>() keeps which element at the head?", options: ["Largest", "Smallest", "Most recently added", "First added"], answer: 1, why: "PriorityQueue is a min-heap by default." },
    { q: "What does list.remove(1) do on a List<Integer> containing [5, 1, 9]?", options: ["Removes the value 1", "Removes the element at index 1 (the value 1 here by coincidence)", "Throws an exception", "Removes all 1s"], answer: 1, why: "remove(int) removes by index. Use remove(Integer.valueOf(1)) to remove by value." },
    { q: "A safe comparator for sorting int[] pairs by first element is:", options: ["(a, b) -> a[0] - b[0]", "(a, b) -> Integer.compare(a[0], b[0])", "(a, b) -> a[0] > b[0] ? 1 : 0", "(a, b) -> b[0]"], answer: 1, why: "Subtraction can overflow; Integer.compare is always correct." },
  ],
  3: [
    { q: "What is the complexity of checking primality by trial division up to √n?", options: ["O(n)", "O(√n)", "O(log n)", "O(n log n)"], answer: 1, why: "Any factor pair has one member ≤ √n." },
    { q: "gcd(48, 18) = ?", options: ["3", "6", "9", "12"], answer: 1, why: "48 → 18 → 12 → 6 → 0 with Euclid's algorithm." },
    { q: "n & (n − 1) == 0 (with n > 0) means:", options: ["n is even", "n is a power of two", "n is prime", "n has two set bits"], answer: 1, why: "A power of two has exactly one set bit, which n − 1 clears." },
    { q: "What does XOR-ing all elements of [4, 1, 2, 1, 2] give?", options: ["0", "4", "10", "2"], answer: 1, why: "Pairs cancel (a ^ a = 0), leaving 4." },
    { q: "Binary exponentiation computes xⁿ in:", options: ["O(n)", "O(log n)", "O(√n)", "O(1)"], answer: 1, why: "It squares the base and halves the exponent each step." },
  ],
  4: [
    { q: "Best approach for 'maximum subarray sum'?", options: ["Sort then sum", "Kadane's algorithm", "Binary search", "Two nested loops only"], answer: 1, why: "Kadane decides extend-or-restart at each element in O(n)." },
    { q: "Range sum a[l..r] with prefix array pre (pre[0] = 0) is:", options: ["pre[r] − pre[l]", "pre[r + 1] − pre[l]", "pre[r] − pre[l − 1] + 1", "pre[r + 1] + pre[l]"], answer: 1, why: "pre[i] is the sum of the first i elements." },
    { q: "Rotating an array right by k in O(1) extra space uses:", options: ["A queue", "Three reversals", "Sorting", "A HashMap"], answer: 1, why: "Reverse all, reverse the first k, reverse the rest." },
    { q: "Longest substring without repeating characters is best solved with:", options: ["Sliding window", "Binary search", "Heap", "Union-Find"], answer: 0, why: "Expand right, shrink left while a character repeats — O(n)." },
    { q: "3Sum avoids duplicate triplets by:", options: ["Using a HashSet of lists only", "Sorting and skipping equal neighbours", "Using recursion", "It can't avoid them"], answer: 1, why: "After sorting, skipping equal values at each pointer prevents repeats." },
  ],
  5: [
    { q: "Fastest way to check if two lowercase strings are anagrams?", options: ["Sort both: O(n log n)", "int[26] counts: O(n)", "Compare hash codes", "Check lengths only"], answer: 1, why: "Counting characters is linear." },
    { q: "How many centres does expand-around-centre check for a string of length n?", options: ["n", "2n − 1", "n²", "n / 2"], answer: 1, why: "n character centres plus n − 1 gaps for even-length palindromes." },
    { q: "KMP's LPS array stores, for each prefix of the pattern:", options: ["The number of vowels", "The longest proper prefix that is also a suffix", "The last occurrence of each char", "Hash values"], answer: 1, why: "It tells KMP how far to fall back after a mismatch." },
    { q: "KMP string matching runs in:", options: ["O(n·m)", "O(n + m)", "O(n log m)", "O(m²)"], answer: 1, why: "The text pointer never moves backwards." },
    { q: "Group Anagrams usually uses which key?", options: ["The word's length", "The sorted letters (or letter counts)", "The first letter", "Its hash code"], answer: 1, why: "Anagrams share the same sorted form." },
  ],
  6: [
    { q: "What is missing if a recursive function causes StackOverflowError on every input?", options: ["A return type", "A reachable base case", "A loop", "Static keyword"], answer: 1, why: "Without a base case the calls never stop." },
    { q: "How many subsets does a set of n elements have?", options: ["n", "n²", "2ⁿ", "n!"], answer: 2, why: "Each element is either in or out." },
    { q: "In backtracking, after exploring a choice you must:", options: ["Return immediately", "Undo the choice", "Sort the input", "Clear all results"], answer: 1, why: "Choose → explore → un-choose keeps state correct for siblings." },
    { q: "N-Queens checks diagonals in O(1) using which indices?", options: ["r + c and r − c", "r · c", "r / c", "Only r"], answer: 0, why: "Cells on the same diagonal share r − c or r + c." },
    { q: "How many permutations does [1, 2, 3, 4] have?", options: ["16", "24", "12", "10"], answer: 1, why: "4! = 24." },
  ],
  7: [
    { q: "Which sort is stable and always O(n log n)?", options: ["Quick sort", "Heap sort", "Merge sort", "Selection sort"], answer: 2, why: "Merge sort guarantees O(n log n) and keeps equal elements in order." },
    { q: "Why compute mid = lo + (hi − lo) / 2?", options: ["It's faster", "To avoid integer overflow of lo + hi", "To round up", "Java requires it"], answer: 1, why: "lo + hi can exceed Integer.MAX_VALUE." },
    { q: "Quick sort's worst case O(n²) happens when:", options: ["The array is random", "The pivot is always the smallest or largest element", "There are no duplicates", "n is even"], answer: 1, why: "Unbalanced partitions; a random pivot avoids it in practice." },
    { q: "'Minimum capacity to ship packages in D days' is solved with:", options: ["Binary search on the answer", "DFS", "Sorting only", "Trie"], answer: 0, why: "Feasibility is monotonic in capacity." },
    { q: "Insertion sort is a good choice when:", options: ["The data is nearly sorted or small", "n is huge and random", "You need O(n log n) worst case", "Never"], answer: 0, why: "It runs in near-linear time on nearly-sorted input." },
  ],
  8: [
    { q: "Average time for HashMap get/put is:", options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"], answer: 1, why: "Hashing finds the bucket directly." },
    { q: "Subarray Sum Equals K (with negative numbers) uses:", options: ["Sliding window", "Prefix sum + HashMap", "Two pointers", "Sorting"], answer: 1, why: "Count earlier prefixes equal to sum − k; sliding windows fail with negatives." },
    { q: "Separate chaining handles collisions by:", options: ["Probing the next slot", "Storing a list (or tree) per bucket", "Rehashing every insert", "Rejecting duplicates"], answer: 1, why: "Colliding keys share a bucket's list." },
    { q: "What must you override together for custom HashMap keys?", options: ["toString and equals", "hashCode and equals", "compareTo and hashCode", "clone and equals"], answer: 1, why: "Equal objects must have equal hash codes." },
    { q: "Longest Consecutive Sequence in O(n) starts counting only from x when:", options: ["x is even", "x − 1 is not in the set", "x is the minimum", "x + 1 is in the set"], answer: 1, why: "That x is the start of a run, so each run is counted once." },
  ],
  9: [
    { q: "Floyd's algorithm detects a cycle by:", options: ["Counting nodes", "Moving slow and fast pointers until they meet", "Using a HashSet", "Reversing the list"], answer: 1, why: "In a cycle the fast pointer laps the slow one." },
    { q: "Why use a dummy node?", options: ["To save memory", "To avoid special cases at the head", "To make the list circular", "It's required by Java"], answer: 1, why: "The real head becomes dummy.next, so head edits look like any other." },
    { q: "Reversing a singly linked list iteratively needs how much extra space?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], answer: 1, why: "Only three pointers: prev, cur, next." },
    { q: "LRU cache with O(1) operations combines:", options: ["Array + stack", "HashMap + doubly linked list", "TreeMap + queue", "Heap + set"], answer: 1, why: "HashMap finds nodes; the list keeps recency order." },
    { q: "Best sort for a linked list:", options: ["Quick sort", "Merge sort", "Heap sort", "Counting sort"], answer: 1, why: "Merge sort needs only sequential access." },
  ],
  10: [
    { q: "Next Greater Element for all positions is best solved with:", options: ["Monotonic stack", "Two nested loops", "Binary search", "Trie"], answer: 0, why: "Each index is pushed and popped once: O(n)." },
    { q: "Sliding window maximum in O(n) uses:", options: ["PriorityQueue", "Monotonic deque", "TreeMap", "Sorting"], answer: 1, why: "A decreasing deque keeps the max at the front." },
    { q: "Queue using two stacks has amortised cost per operation:", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], answer: 1, why: "Each element moves between stacks at most once." },
    { q: "Valid Parentheses fails when:", options: ["The stack is empty at the end", "A closing bracket doesn't match the top or the stack isn't empty at the end", "There are only round brackets", "The string is long"], answer: 1, why: "Every closer must match the most recent opener, and nothing may remain." },
    { q: "Evaluating ['4', '13', '5', '/', '+'] (RPN) gives:", options: ["6", "4", "17", "2"], answer: 0, why: "13 / 5 = 2 (integer), 4 + 2 = 6." },
  ],
  11: [
    { q: "Inorder traversal of a BST yields:", options: ["Random order", "Sorted order", "Level order", "Reverse insertion order"], answer: 1, why: "Left < node < right at every node." },
    { q: "Level-order traversal uses a:", options: ["Stack", "Queue", "Heap", "HashMap"], answer: 1, why: "Breadth-first search processes nodes level by level." },
    { q: "Validating a BST correctly requires:", options: ["Comparing each node with its children only", "Passing min/max bounds down the tree", "Checking the height", "Counting nodes"], answer: 1, why: "A node deep in the left subtree must still be smaller than every ancestor it's left of." },
    { q: "Deleting a BST node with two children replaces it with:", options: ["Its parent", "Its inorder successor (or predecessor)", "The root", "A random leaf"], answer: 1, why: "The successor keeps the BST property." },
    { q: "Why do AVL / red-black trees exist?", options: ["To store duplicates", "To keep height O(log n) and avoid degenerating to a list", "To use less memory", "To support hashing"], answer: 1, why: "Sorted insertions make plain BSTs O(n) tall." },
  ],
  12: [
    { q: "In an array-based heap, the children of index i are:", options: ["i + 1, i + 2", "2i + 1, 2i + 2", "i / 2, i / 2 + 1", "2i, 3i"], answer: 1, why: "With 0-based indexing." },
    { q: "To find the K largest elements efficiently use:", options: ["A max-heap of all n elements", "A min-heap of size K", "Sorting only", "A stack"], answer: 1, why: "O(n log K): the heap keeps the K largest seen so far." },
    { q: "Building a heap from n elements with heapify costs:", options: ["O(n log n)", "O(n)", "O(log n)", "O(n²)"], answer: 1, why: "Most nodes are near the bottom and sift down very little." },
    { q: "A running median uses:", options: ["One min-heap", "A max-heap for the lower half and a min-heap for the upper half", "A sorted array", "A queue"], answer: 1, why: "The tops of the two heaps give the median." },
    { q: "Merging K sorted lists with a heap costs (N total nodes):", options: ["O(N log N)", "O(N log K)", "O(NK)", "O(K log N)"], answer: 1, why: "The heap only ever holds K nodes." },
  ],
  13: [
    { q: "Greedy works when a problem has:", options: ["Overlapping subproblems only", "The greedy-choice property and optimal substructure", "Negative numbers", "A sorted input"], answer: 1, why: "Then a local best choice is part of some global optimum." },
    { q: "Coins {1, 3, 4}, amount 6: greedy (largest first) uses how many coins?", options: ["2", "3", "4", "1"], answer: 1, why: "4 + 1 + 1 = 3 coins, but 3 + 3 = 2 is optimal — greedy fails here." },
    { q: "To select the maximum number of non-overlapping intervals, sort by:", options: ["Start time", "End time", "Length", "Random"], answer: 1, why: "Finishing earliest leaves the most room." },
    { q: "Fractional knapsack is solved by sorting items by:", options: ["Weight", "Value", "Value / weight ratio", "Index"], answer: 2, why: "Take the best ratio first, splitting the last item if needed." },
    { q: "Huffman coding repeatedly merges:", options: ["The two most frequent symbols", "The two least frequent nodes", "Adjacent symbols", "Random pairs"], answer: 1, why: "Rare symbols end up deepest, getting the longest codes." },
  ],
  14: [
    { q: "Shortest path in an unweighted graph:", options: ["DFS", "BFS", "Dijkstra only", "Kruskal"], answer: 1, why: "BFS explores in order of distance in edges." },
    { q: "Dijkstra fails with:", options: ["Directed edges", "Negative edge weights", "Cycles", "Large graphs"], answer: 1, why: "A finalised node could later get a shorter path via a negative edge." },
    { q: "Kahn's algorithm detects a cycle when:", options: ["The queue is empty at the start", "Fewer than V nodes are output", "A node has in-degree 0", "There are two components"], answer: 1, why: "Nodes in a cycle never reach in-degree 0." },
    { q: "Union-Find with path compression and union by rank has per-operation cost:", options: ["O(log n)", "O(α(n)) — effectively constant", "O(n)", "O(1) exactly"], answer: 1, why: "α is the inverse Ackermann function." },
    { q: "Kruskal's algorithm builds an MST by:", options: ["Growing from one vertex", "Adding edges in increasing weight unless they form a cycle", "Removing the heaviest edges", "BFS"], answer: 1, why: "Union-Find detects cycles quickly." },
  ],
  15: [
    { q: "DP needs which two properties?", options: ["Sorting and hashing", "Overlapping subproblems and optimal substructure", "Recursion and loops", "Greedy choice and stability"], answer: 1, why: "Repeated subproblems make caching worthwhile; substructure makes combining valid." },
    { q: "In 1D 0/1 knapsack, the capacity loop runs:", options: ["Low to high", "High to low", "Any order", "Only once"], answer: 1, why: "High to low ensures each item is used at most once." },
    { q: "Edit distance between 'horse' and 'ros' is:", options: ["2", "3", "4", "5"], answer: 1, why: "Replace h→r, delete r, delete e." },
    { q: "LIS in O(n log n) maintains:", options: ["A heap", "The smallest tail for each subsequence length", "A prefix sum", "A trie"], answer: 1, why: "Binary search replaces the first tail ≥ x." },
    { q: "Longest palindromic subsequence of s equals:", options: ["LCS(s, reverse(s))", "Longest palindromic substring", "s.length() / 2", "Edit distance to reverse(s)"], answer: 0, why: "A palindrome reads the same in s and its reverse." },
  ],
  16: [
    { q: "Trie search for a word of length L costs:", options: ["O(log n)", "O(L)", "O(n·L)", "O(1)"], answer: 1, why: "One step per character, independent of the number of words." },
    { q: "Why does each trie node need an end-of-word flag?", options: ["To save memory", "So prefixes aren't mistaken for whole words", "To sort words", "To store counts"], answer: 1, why: "'app' is a prefix of 'apple' but may not be a word itself." },
    { q: "Maximum XOR of two numbers uses a trie of:", options: ["Characters", "Bits from the highest to the lowest", "Digits", "Words"], answer: 1, why: "Greedily prefer the opposite bit at each level." },
    { q: "startsWith(prefix) returns true when:", options: ["The prefix path exists", "The prefix is a complete word", "The trie is non-empty", "The prefix has no children"], answer: 0, why: "Any word below that path starts with the prefix." },
    { q: "Wildcard '.' search in a trie must:", options: ["Fail", "Try every child at that position", "Skip the character", "Restart from the root"], answer: 1, why: "'.' matches any letter, so all branches are explored." },
  ],
  17: [
    { q: "A segment tree answers range queries in:", options: ["O(1)", "O(log n)", "O(n)", "O(√n)"], answer: 1, why: "A range splits into O(log n) covered nodes." },
    { q: "In a Fenwick tree, i & −i gives:", options: ["The highest set bit", "The lowest set bit", "i squared", "The parity"], answer: 1, why: "It determines the block each index covers." },
    { q: "Sparse tables answer range-minimum queries in O(1) because min is:", options: ["Commutative only", "Idempotent (overlap doesn't matter)", "Invertible", "Associative only"], answer: 1, why: "Two overlapping power-of-two ranges cover any query." },
    { q: "Lazy propagation is used for:", options: ["Point updates", "Range updates in segment trees", "Sorting", "Hashing"], answer: 1, why: "It postpones updates until a node's children are needed." },
    { q: "Double hashing for strings is used to:", options: ["Speed up hashing", "Make collisions extremely unlikely", "Sort substrings", "Compress strings"], answer: 1, why: "Two independent moduli would both have to collide." },
  ],
  18: [
    { q: "What should you do first in a coding interview?", options: ["Start coding", "Clarify inputs, constraints and edge cases", "Write tests", "Optimise"], answer: 1, why: "Misunderstanding the problem is the most expensive mistake." },
    { q: "'Contiguous subarray with at most K distinct values' suggests:", options: ["Sliding window", "DFS", "Heap", "Trie"], answer: 0, why: "Contiguous + rule on the window → sliding window." },
    { q: "'Minimum number of steps in a grid' suggests:", options: ["DP only", "BFS", "Sorting", "Binary search"], answer: 1, why: "Unweighted shortest path → BFS." },
    { q: "'Course prerequisites ordering' suggests:", options: ["Topological sort", "Kadane", "KMP", "Heap sort"], answer: 0, why: "Dependencies form a DAG." },
    { q: "After stating a brute force, the next step is usually to:", options: ["Code the brute force immediately", "Identify the bottleneck and a pattern that removes it", "Ask for hints", "Skip testing"], answer: 1, why: "Explain why it's slow and which pattern improves it." },
  ],
};

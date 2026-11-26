import type { TopicContent } from "./types";

// Phases 0–3: Java fundamentals, complexity, collections, maths & bits.
export const content: Record<string, TopicContent> = {
  "java-setup": {
    summary: "Install Java, learn the primitive types and read input and print output — the toolkit every DSA program needs.",
    explanation: [
      "Java code is written in .java files, compiled by javac into bytecode, and run by the Java Virtual Machine (JVM). Every runnable program needs a class with a public static void main(String[] args) method — that is where execution starts.",
      "Java is statically typed: every variable has a fixed type. The eight primitive types (byte, short, int, long, float, double, char, boolean) hold raw values directly. In DSA you will mostly use int (about ±2.1 billion), long (about ±9.2 × 10¹⁸), double, char and boolean.",
      "When a value goes past a type's range it silently wraps around (overflow). Integer division drops the fraction (7 / 2 == 3). Converting a smaller type to a bigger one happens automatically (widening); going the other way needs an explicit cast and may lose information.",
      "For input, Scanner is the simplest reader. For output, System.out.println prints a line and System.out.printf formats values.",
    ],
    prerequisites: ["A computer with a terminal", "No programming experience needed"],
    objectives: ["Compile and run a Java program from the terminal and an IDE", "Choose the right primitive type and spot overflow", "Read numbers and strings with Scanner and print formatted output"],
    analogy: "Primitive types are boxes of fixed size. An int box holds numbers up to about 2.1 billion; pour in more and it overflows back to negative, like a car odometer rolling over from 999999 to 000000.",
    code: [
      {
        title: "Read two numbers, print sum, average and overflow demo",
        java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();

        long sum = (long) a + b;          // widen first to avoid overflow
        double avg = ((long) a + b) / 2.0; // widen, then 2.0 forces floating-point division

        System.out.println("Sum = " + sum);
        System.out.printf("Average = %.2f%n", avg);

        int big = Integer.MAX_VALUE;      // 2147483647
        System.out.println(big + 1);      // -2147483648 (overflow!)
        System.out.println(7 / 2);        // 3 (integer division)
        System.out.println((char) ('a' + 2)); // c
    }
}`,
      },
    ],
    steps: [
      { title: "Write", detail: "Save the code as Main.java — the file name must match the public class name." },
      { title: "Compile", detail: "Run javac Main.java. This creates Main.class (bytecode)." },
      { title: "Run", detail: "Run java Main, type 2147483647 1 and press Enter." },
      { title: "Observe", detail: "Sum prints 2147483648 because we cast to long first; the overflow line prints a negative number." },
    ],
    mistakes: ["Computing a + b in int and only then storing it in a long — the overflow already happened", "Expecting 5 / 2 to be 2.5", "Comparing doubles with == instead of checking Math.abs(a - b) < 1e-9", "File name not matching the public class name"],
    complexity: [{ op: "Reading n numbers with Scanner", time: "O(n)", space: "O(1) extra" }],
    revision: ["int ≈ ±2.1×10⁹, long ≈ ±9.2×10¹⁸", "Cast before the operation: (long) a * b", "Integer division truncates toward zero", "Scanner for simple input, printf for formatting"],
    visual: "bits",
  },

  "java-control": {
    summary: "Operators, if/switch and loops — the control flow you will use in every algorithm.",
    explanation: [
      "Operators combine values: arithmetic (+ - * / %), relational (< <= == !=), logical (&& || !) and the ternary cond ? a : b. The modulo operator % gives the remainder and is the key to digit problems: n % 10 is the last digit, n / 10 removes it.",
      "if / else-if / else chooses between branches. switch picks a branch by value; modern Java's switch expression (case X -> value) returns a value and has no fall-through.",
      "Loops repeat work. Use for when you know the count, while when you loop until a condition changes, and do-while when the body must run at least once. break exits a loop, continue skips to the next iteration.",
      "Pattern printing (nested loops drawing stars) builds the habit of reasoning about what the outer and inner loop variables mean — the same habit you need for 2D arrays and DP tables.",
    ],
    prerequisites: ["Java setup & data types"],
    objectives: ["Use % and / to process digits", "Pick the right loop for a task", "Trace nested loops by hand"],
    analogy: "A loop is a washing machine cycle: it repeats the same steps until a condition (time up, clothes clean) says stop. break is pulling the plug; continue is skipping one rinse.",
    code: [
      {
        title: "Reverse digits and check palindrome number",
        java: `public class Main {
    static int reverse(int n) {
        int rev = 0;
        while (n != 0) {
            int digit = n % 10;      // last digit
            rev = rev * 10 + digit;  // append it
            n /= 10;                 // drop last digit
        }
        return rev;
    }

    public static void main(String[] args) {
        int x = 12321;
        System.out.println(reverse(x));              // 12321
        System.out.println(x == reverse(x) ? "palindrome" : "not palindrome");

        // Right-angled star triangle
        for (int row = 1; row <= 4; row++) {
            for (int col = 1; col <= row; col++) System.out.print("* ");
            System.out.println();
        }
    }
}`,
      },
    ],
    steps: [
      { title: "n = 123, rev = 0", detail: "digit = 3, rev = 3, n = 12" },
      { title: "n = 12", detail: "digit = 2, rev = 32, n = 1" },
      { title: "n = 1", detail: "digit = 1, rev = 321, n = 0 → loop stops" },
      { title: "Result", detail: "reverse(123) = 321. Each loop removes one digit, so it runs once per digit: O(number of digits)." },
    ],
    mistakes: ["Using = instead of == in conditions", "Forgetting break in an old-style switch (fall-through)", "Off-by-one loop bounds (< vs <=)", "Reversing a large int can overflow — use long or check before multiplying"],
    complexity: [{ op: "Process digits of n", time: "O(log₁₀ n)", space: "O(1)" }, { op: "Nested loop pattern of n rows", time: "O(n²)", space: "O(1)" }],
    revision: ["n % 10 = last digit, n / 10 drops it", "for = known count, while = unknown count", "switch expression: case 1 -> \"one\";", "Trace loops on paper with a small input"],
  },

  "java-methods-arrays": {
    summary: "Break code into methods and store collections of values in 1D and 2D arrays.",
    explanation: [
      "A method is a named, reusable block: it takes parameters, does work and may return a value. Methods with the same name but different parameter lists are overloaded.",
      "Java is always pass-by-value. For primitives the value is copied. For arrays and objects the value copied is the reference (address), so a method can change the contents of an array you pass in, but cannot make your variable point to a new array.",
      "An array is a fixed-size block of same-type elements with O(1) access by index (0 to length − 1). Arrays.toString prints it and Arrays.sort sorts it in O(n log n).",
      "A 2D array int[rows][cols] is an array of arrays. Rows can even have different lengths (jagged arrays). Traverse row by row with nested loops: grid[r][c].",
    ],
    prerequisites: ["Operators, conditionals & loops"],
    objectives: ["Write and overload methods", "Explain why changing an array in a method changes it outside", "Traverse 1D and 2D arrays and find max/min/second max"],
    analogy: "An array is a row of numbered lockers. Passing an array to a method is like handing someone a copy of the locker key — they can change what is inside the lockers, but they can't move your lockers.",
    code: [
      {
        title: "Second largest and 2D traversal",
        java: `import java.util.Arrays;

public class Main {
    static int secondLargest(int[] a) {
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int x : a) {
            if (x > first) { second = first; first = x; }
            else if (x > second && x != first) second = x;
        }
        return second;
    }

    static void doubleAll(int[] a) {          // modifies caller's array
        for (int i = 0; i < a.length; i++) a[i] *= 2;
    }

    public static void main(String[] args) {
        int[] a = {4, 9, 1, 9, 7};
        System.out.println(secondLargest(a)); // 7
        doubleAll(a);
        System.out.println(Arrays.toString(a)); // [8, 18, 2, 18, 14]

        int[][] grid = {{1, 2, 3}, {4, 5, 6}};
        int total = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[r].length; c++) total += grid[r][c];
        System.out.println(total); // 21
    }
}`,
      },
    ],
    steps: [
      { title: "Start", detail: "first = second = −∞" },
      { title: "x = 4", detail: "4 > first → second = −∞, first = 4" },
      { title: "x = 9", detail: "9 > first → second = 4, first = 9" },
      { title: "x = 1, 9", detail: "1 is smaller than both; the second 9 equals first so it is skipped" },
      { title: "x = 7", detail: "7 > second (4) → second = 7. Answer: 7 in one pass." },
    ],
    mistakes: ["ArrayIndexOutOfBoundsException from using <= a.length", "Expecting a method to swap two int parameters for the caller", "Printing an array directly (prints a memory reference) instead of Arrays.toString", "Assuming all rows of a jagged array have the same length"],
    complexity: [{ op: "Access a[i]", time: "O(1)", space: "O(1)" }, { op: "Linear search / max", time: "O(n)", space: "O(1)" }, { op: "Arrays.sort (primitives)", time: "O(n log n)", space: "O(log n)" }],
    revision: ["Indices 0..length−1", "Pass-by-value: references are copied", "grid.length = rows, grid[r].length = columns", "Track first and second in one pass"],
    visual: "sorting",
  },

  "java-strings": {
    summary: "Strings are immutable; use StringBuilder for building text and char arithmetic for counting letters.",
    explanation: [
      "A String is an immutable sequence of chars: methods like toUpperCase or substring return new strings. String literals are stored in a shared string pool, which is why == sometimes looks like it works — always compare content with .equals().",
      "Useful methods: charAt(i), length(), substring(begin, end) (end exclusive), indexOf, split(regex), toCharArray(), String.valueOf(x).",
      "Because strings are immutable, s = s + c inside a loop copies the whole string each time — O(n²) overall. StringBuilder keeps a resizable char buffer, so append is O(1) amortised; call toString() at the end.",
      "A char is a 16-bit number, so arithmetic works: c - 'a' maps 'a'..'z' to 0..25, perfect as an index into an int[26] count array.",
    ],
    prerequisites: ["Methods & arrays"],
    objectives: ["Explain immutability and == vs equals", "Build strings efficiently with StringBuilder", "Count characters with int[26]"],
    analogy: "A String is a printed page — to change one word you reprint the page. A StringBuilder is a whiteboard — you can add and erase in place.",
    code: [
      {
        title: "Reverse words and count letters",
        java: `public class Main {
    static String reverseWords(String s) {
        String[] words = s.trim().split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(' ');
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(reverseWords("  the sky  is blue ")); // blue is sky the

        int[] freq = new int[26];
        for (char c : "banana".toCharArray()) freq[c - 'a']++;
        System.out.println("a=" + freq[0] + " n=" + freq['n' - 'a']); // a=3 n=2

        String a = new String("hi"), b = "hi";
        System.out.println(a == b);        // false (different objects)
        System.out.println(a.equals(b));   // true  (same content)
    }
}`,
      },
    ],
    steps: [
      { title: "Trim and split", detail: "\"  the sky  is blue \" → [\"the\", \"sky\", \"is\", \"blue\"] (\\s+ swallows repeated spaces)" },
      { title: "Walk backwards", detail: "Append blue, is, sky, the with single spaces between" },
      { title: "toString", detail: "One final copy: \"blue is sky the\" — O(n) total instead of O(n²)" },
    ],
    mistakes: ["Using == to compare strings", "Concatenating in a loop with + (quadratic time)", "substring end index is exclusive", "Forgetting that split takes a regular expression (\".\" needs escaping)"],
    complexity: [{ op: "charAt / length", time: "O(1)", space: "O(1)" }, { op: "substring / toCharArray", time: "O(n)", space: "O(n)" }, { op: "StringBuilder.append", time: "O(1) amortised", space: "O(n) total" }],
    revision: ["Strings are immutable → use StringBuilder in loops", ".equals() for content", "c - 'a' → 0..25", "substring(i, j) excludes j"],
  },

  "java-oop": {
    summary: "Classes, objects, interfaces and generics — and the Node class every linked list and tree is built on.",
    explanation: [
      "A class is a blueprint; an object is an instance created with new. Constructors initialise fields; this refers to the current object; static members belong to the class itself.",
      "The four OOP pillars: encapsulation (private fields + methods), inheritance (extends), polymorphism (one interface, many implementations — a List variable can hold an ArrayList or LinkedList), and abstraction (interfaces and abstract classes hide details).",
      "Collections only store objects, so Java wraps primitives in wrapper classes (int → Integer). Autoboxing converts automatically. Trap: Integer caches −128..127, so == compares references and fails for larger values — always use .equals() or compare int values.",
      "Generics let one class work with any type: class Box<T> { T value; }. They give compile-time type safety. A Node<T> with a value and a next/left/right reference is the building block of linked lists and trees.",
    ],
    prerequisites: ["Strings & StringBuilder"],
    objectives: ["Design a simple class with constructor and methods", "Avoid the Integer == trap", "Write a generic Node class"],
    analogy: "A class is a cookie cutter, objects are the cookies. Generics are an adjustable cutter that shapes any dough you give it.",
    code: [
      {
        title: "Generic Node and the Integer cache trap",
        java: `public class Main {
    static class Node<T> {
        T val;
        Node<T> next;
        Node(T val) { this.val = val; }
    }

    interface Shape { double area(); }
    record Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }
    record Square(double s) implements Shape { public double area() { return s * s; } }

    public static void main(String[] args) {
        Node<String> head = new Node<>("A");
        head.next = new Node<>("B");
        for (Node<String> cur = head; cur != null; cur = cur.next) System.out.print(cur.val + " ");
        System.out.println();

        Shape[] shapes = { new Circle(1), new Square(2) };   // polymorphism
        for (Shape s : shapes) System.out.printf("%.2f%n", s.area());

        Integer x = 127, y = 127, p = 1000, q = 1000;
        System.out.println(x == y);       // true  (cached)
        System.out.println(p == q);       // false (different objects!)
        System.out.println(p.equals(q));  // true
    }
}`,
      },
    ],
    steps: [
      { title: "Create head", detail: "new Node<>(\"A\") allocates an object whose next is null" },
      { title: "Link", detail: "head.next = new Node<>(\"B\") — now A → B → null" },
      { title: "Traverse", detail: "Start at head and follow next until null, printing A B" },
    ],
    mistakes: ["Comparing Integer objects with ==", "Forgetting new and getting a NullPointerException", "Making every field public (breaks encapsulation)", "Raw types (List instead of List<Integer>) losing type safety"],
    complexity: [{ op: "Create an object", time: "O(1)", space: "O(1)" }, { op: "Autoboxing in a hot loop", time: "O(1) but slower", space: "extra objects" }],
    revision: ["Use .equals() for wrapper objects", "Program to interfaces: List<Integer> list = new ArrayList<>()", "static = belongs to the class", "Node<T> { T val; Node<T> next; }"],
    visual: "linked-list",
  },

  "java-io": {
    summary: "Fast input/output, overflow traps and how LeetCode's Solution class works.",
    explanation: [
      "Scanner is convenient but slow for large inputs. BufferedReader reads lines in big chunks; StringTokenizer splits them; PrintWriter buffers output. Together they are many times faster — important on judges with 10⁵–10⁶ inputs.",
      "Overflow is the most common silent bug. Sums of many ints, products of two ints and squared distances should be long. Math.abs(Integer.MIN_VALUE) is still negative because +2147483648 does not fit in an int.",
      "Integer.MAX_VALUE and Integer.MIN_VALUE are handy sentinels for 'infinity' when looking for a minimum or maximum — but adding to MAX_VALUE overflows, so use long or a smaller sentinel like 1e9 when you need to add.",
      "On LeetCode you don't write main: you implement a method inside class Solution, and the judge calls it with parsed inputs. On other judges (Codeforces, HackerRank) you read stdin yourself.",
    ],
    prerequisites: ["OOP basics", "Strings"],
    objectives: ["Read large input fast", "Recognise and prevent overflow", "Switch comfortably between LeetCode and stdin formats"],
    analogy: "Scanner fetches water one cup at a time; BufferedReader fills a bucket and pours from it.",
    code: [
      {
        title: "Fast I/O template",
        java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long sum = 0;                       // long: n ints can exceed int range
        int min = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            int x = Integer.parseInt(st.nextToken());
            sum += x;
            min = Math.min(min, x);
        }
        out.println(sum + " " + min);
        out.flush();                        // don't forget, or nothing prints
    }
}`,
      },
    ],
    steps: [
      { title: "Line 1", detail: "Read n with readLine and parseInt" },
      { title: "Line 2", detail: "Tokenise the numbers and parse each one" },
      { title: "Accumulate", detail: "Keep sum in a long and min starting at Integer.MAX_VALUE" },
      { title: "Flush", detail: "PrintWriter buffers output; flush (or close) writes it" },
    ],
    mistakes: ["Forgetting out.flush()", "Using int for sums of up to 10⁵ values of 10⁹", "Math.abs(Integer.MIN_VALUE) assumptions", "Adding 1 to Integer.MAX_VALUE as 'infinity'"],
    complexity: [{ op: "Read n tokens (BufferedReader)", time: "O(total chars)", space: "O(line length)" }],
    revision: ["BufferedReader + StringTokenizer + PrintWriter", "Use long for sums and products", "flush at the end", "LeetCode = implement a method in class Solution"],
  },

  "big-o": {
    summary: "Measure how an algorithm's work grows with input size using Big-O, Big-Ω and Big-Θ.",
    explanation: [
      "Running time in seconds depends on the machine, so we instead count how the number of basic steps grows as the input size n grows. That growth rate is what Big-O describes.",
      "Big-O is an upper bound (grows no faster than), Big-Ω a lower bound (at least this fast), Big-Θ a tight bound (both). We also distinguish best, average and worst case — linear search is O(1) best case and O(n) worst case. Interviews usually ask for the worst case.",
      "Simplify by dropping constants and lower-order terms: 3n² + 5n + 7 is O(n²). Loops one after another add; nested loops multiply. A loop that halves n each time is O(log n).",
      "Common classes from fastest to slowest: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!). A judge does roughly 10⁸ simple operations per second, so n = 10⁵ needs O(n log n) or better, while n ≤ 20 allows O(2ⁿ). Space complexity counts extra memory (auxiliary space), including the recursion stack.",
    ],
    prerequisites: ["Loops", "Basic algebra (powers and logarithms)"],
    objectives: ["Derive the Big-O of loops and nested loops", "Explain best/average/worst case", "Use input limits to pick a target complexity"],
    analogy: "Big-O is like comparing travel by how the trip scales with distance: walking is O(n) in distance, a lift ride is O(1) whatever the floor.",
    code: [
      {
        title: "Count operations of common patterns",
        java: `public class Main {
    public static void main(String[] args) {
        int n = 1024;
        long ops;

        ops = 0; for (int i = 0; i < n; i++) ops++;                       // O(n)
        System.out.println("linear: " + ops);

        ops = 0; for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ops++; // O(n^2)
        System.out.println("quadratic: " + ops);

        ops = 0; for (int i = n; i > 1; i /= 2) ops++;                    // O(log n)
        System.out.println("logarithmic: " + ops);

        ops = 0; for (int i = 0; i < n; i++) for (int j = 1; j < n; j *= 2) ops++; // O(n log n)
        System.out.println("n log n: " + ops);
    }
}`,
      },
    ],
    steps: [
      { title: "Linear", detail: "One loop of n steps → 1,024 operations" },
      { title: "Quadratic", detail: "n × n → 1,048,576 operations (1,000× more for this n)" },
      { title: "Logarithmic", detail: "Halving 1024 → 512 → … → 1 takes 10 steps (log₂ 1024)" },
      { title: "n log n", detail: "n outer × log n inner ≈ 10,240 operations" },
    ],
    mistakes: ["Counting constants (O(2n) is just O(n))", "Assuming two nested loops are always O(n²) — check the inner bound", "Ignoring recursion stack space", "Forgetting that string concatenation or list.contains inside a loop adds a hidden factor of n"],
    complexity: [
      { op: "Array index / HashMap get", time: "O(1)", space: "—" },
      { op: "Binary search", time: "O(log n)", space: "O(1)" },
      { op: "Merge sort", time: "O(n log n)", space: "O(n)" },
      { op: "All subsets", time: "O(2ⁿ)", space: "O(n)" },
    ],
    revision: ["Drop constants and lower-order terms", "Sequential = add, nested = multiply", "Halving = log n", "10⁸ ops/sec: n=10⁵ → O(n log n), n=20 → O(2ⁿ)"],
    visual: "complexity",
  },

  recurrence: {
    summary: "Analyse recursive algorithms with recurrence relations, recursion trees, the Master Theorem and amortised analysis.",
    explanation: [
      "A recursive algorithm's cost is written as a recurrence: binary search does one O(1) step and recurses on half, so T(n) = T(n/2) + O(1) = O(log n). Merge sort splits in two and merges in linear time: T(n) = 2T(n/2) + O(n) = O(n log n).",
      "The recursion-tree method draws each call as a node with its own cost and sums the costs level by level. For merge sort every level costs n and there are log n levels.",
      "The Master Theorem solves T(n) = aT(n/b) + f(n). Compare f(n) with n^(log_b a): if f is smaller, T = Θ(n^(log_b a)); if equal, T = Θ(n^(log_b a) · log n); if larger (and regular), T = Θ(f(n)).",
      "Amortised analysis averages cost over a sequence of operations. ArrayList doubles its capacity when full: one append occasionally costs O(n), but n appends cost O(n) total, so each append is O(1) amortised.",
    ],
    prerequisites: ["Big-O notation", "Basic recursion idea"],
    objectives: ["Write the recurrence for a recursive function", "Apply the Master Theorem", "Explain amortised O(1) for dynamic arrays"],
    analogy: "Amortised cost is like a monthly gym fee: one big payment spread across 30 visits makes each visit cheap.",
    code: [
      {
        title: "Recursive power: T(n) = T(n/2) + O(1)",
        java: `public class Main {
    static long calls = 0;

    static long power(long x, int n) {
        calls++;
        if (n == 0) return 1;
        long half = power(x, n / 2);       // one recursive call on n/2
        return (n % 2 == 0) ? half * half : half * half * x;
    }

    public static void main(String[] args) {
        System.out.println(power(2, 30));   // 1073741824
        System.out.println("calls = " + calls); // about log2(30) + 2 = 6
    }
}`,
      },
    ],
    steps: [
      { title: "Recurrence", detail: "power(x, n) calls power(x, n/2) once plus O(1) work → T(n) = T(n/2) + O(1)" },
      { title: "Master Theorem", detail: "a = 1, b = 2, f(n) = O(1); n^(log₂1) = n⁰ = 1 equals f(n) → case 2 → Θ(log n)" },
      { title: "Check", detail: "n = 30 → 15 → 7 → 3 → 1 → 0: six calls" },
    ],
    mistakes: ["Calling power(x, n/2) twice — that becomes T(n) = 2T(n/2) + O(1) = O(n)", "Forgetting the cost of combining results (the f(n) term)", "Applying the Master Theorem to unequal splits like T(n−1)"],
    complexity: [
      { op: "T(n) = T(n/2) + O(1)", time: "O(log n)", space: "O(log n) stack" },
      { op: "T(n) = 2T(n/2) + O(n)", time: "O(n log n)", space: "O(n)" },
      { op: "T(n) = 2T(n−1) + O(1)", time: "O(2ⁿ)", space: "O(n) stack" },
      { op: "ArrayList.add", time: "O(1) amortised", space: "O(n)" },
    ],
    revision: ["Recurrence = calls × size + combine cost", "Master: compare f(n) with n^(log_b a)", "Recursion tree: cost per level × levels", "Doubling growth → O(1) amortised"],
    visual: "recursion",
  },

  lists: {
    summary: "ArrayList and LinkedList: how they work inside, when each wins, and iterating safely.",
    explanation: [
      "List is an ordered collection interface. ArrayList stores elements in a resizable array: get(i) is O(1), add at the end is O(1) amortised, but inserting or removing in the middle shifts elements — O(n).",
      "LinkedList is a doubly linked list: adding or removing at either end is O(1), but get(i) walks the nodes — O(n). It also implements Deque. In practice ArrayList (or ArrayDeque) is faster for almost everything because arrays are cache-friendly.",
      "Iterator walks a collection. Modifying a list while looping over it with for-each throws ConcurrentModificationException — use iterator.remove() or list.removeIf().",
      "Helpers: Collections.sort(list), Collections.reverse(list), List.of(1, 2, 3) (immutable), new ArrayList<>(List.of(...)) for a mutable copy.",
    ],
    prerequisites: ["OOP & generics", "Big-O"],
    objectives: ["Choose ArrayList vs LinkedList", "Remove items while iterating safely", "Use Collections utilities"],
    analogy: "An ArrayList is a bookshelf: grabbing book #5 is instant, but inserting a book in the middle means sliding the rest over. A LinkedList is a treasure hunt: each clue points to the next.",
    code: [
      {
        title: "ArrayList operations and safe removal",
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(5, 3, 8, 1, 4));
        list.add(7);                 // O(1) amortised
        list.add(0, 9);              // O(n): shifts everything right
        System.out.println(list.get(2)); // O(1) → 3

        list.removeIf(x -> x % 2 == 0);  // safe removal while iterating
        Collections.sort(list);
        System.out.println(list);        // [1, 3, 5, 7, 9]

        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) if (it.next() > 5) it.remove();
        System.out.println(list);        // [1, 3, 5]
    }
}`,
      },
    ],
    steps: [
      { title: "add(7)", detail: "Placed at the end; if the backing array is full it is copied into one about 1.5× larger" },
      { title: "add(0, 9)", detail: "All elements shift one place right" },
      { title: "removeIf", detail: "Filters in one pass without ConcurrentModificationException" },
    ],
    mistakes: ["list.remove(1) on List<Integer> removes index 1, not the value 1 — use remove(Integer.valueOf(1))", "Modifying a list inside for-each", "Trying to add to List.of(...) (immutable)", "Using LinkedList.get(i) in a loop (O(n²))"],
    complexity: [
      { op: "ArrayList get / set", time: "O(1)", space: "—" },
      { op: "ArrayList add at end", time: "O(1) amortised", space: "—" },
      { op: "ArrayList insert/remove middle", time: "O(n)", space: "—" },
      { op: "LinkedList add/remove at ends", time: "O(1)", space: "—" },
      { op: "LinkedList get(i)", time: "O(n)", space: "—" },
    ],
    revision: ["Default to ArrayList", "remove(int index) vs remove(Object o)", "Use removeIf / iterator.remove", "List.of is immutable"],
    visual: "linked-list",
  },

  "maps-sets": {
    summary: "HashMap/HashSet for O(1) lookups and TreeMap/TreeSet for sorted keys with floor and ceiling queries.",
    explanation: [
      "A HashMap stores key → value pairs. put, get, containsKey and remove are O(1) on average. getOrDefault(key, 0) and merge(key, 1, Integer::sum) make frequency counting a one-liner.",
      "Under the hood, key.hashCode() picks a bucket in an array; equals() finds the exact key inside the bucket. When the map gets fuller than its load factor (0.75), it doubles and rehashes. Custom key classes must override both hashCode and equals consistently.",
      "HashSet is a HashMap with only keys — perfect for 'have I seen this?' checks. LinkedHashMap keeps insertion order (and can act as an LRU cache).",
      "TreeMap and TreeSet keep keys sorted using a red-black tree: operations are O(log n), and you get floorKey (largest ≤ x), ceilingKey (smallest ≥ x), firstKey, lastKey and range views.",
    ],
    prerequisites: ["ArrayList & generics"],
    objectives: ["Count frequencies with a HashMap", "Explain hashCode/equals and load factor", "Answer 'closest key' queries with TreeMap"],
    analogy: "A HashMap is a coat check: you hand over your ticket number (key) and get your coat (value) instantly. A TreeMap is a dictionary: words are in order so you can find the nearest word even if yours is missing.",
    code: [
      {
        title: "Frequency map and TreeMap floor/ceiling",
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : "mississippi".toCharArray()) freq.merge(c, 1, Integer::sum);
        System.out.println(freq.get('s') + " " + freq.getOrDefault('z', 0)); // 4 0

        Set<Integer> seen = new HashSet<>();
        int[] nums = {3, 1, 4, 1, 5};
        for (int x : nums) if (!seen.add(x)) System.out.println("duplicate " + x);

        TreeMap<Integer, String> prices = new TreeMap<>(Map.of(10, "pen", 50, "book", 30, "bag"));
        System.out.println(prices.floorKey(40));   // 30 (largest <= 40)
        System.out.println(prices.ceilingKey(40)); // 50 (smallest >= 40)
        System.out.println(prices.firstKey() + " " + prices.lastKey()); // 10 50
    }
}`,
      },
    ],
    steps: [
      { title: "merge", detail: "For each char: if absent put 1, else add 1 → m:1 i:4 s:4 p:2" },
      { title: "HashSet.add", detail: "Returns false when the element already exists → detects the second 1" },
      { title: "floorKey(40)", detail: "Walks the tree to the largest key ≤ 40 → 30 in O(log n)" },
    ],
    mistakes: ["Using a mutable object as a key and changing it afterwards", "Overriding equals without hashCode", "Expecting HashMap iteration order to be sorted", "Calling get on a missing key and unboxing null → NullPointerException"],
    complexity: [
      { op: "HashMap put/get/remove", time: "O(1) average", space: "O(n)" },
      { op: "TreeMap put/get/floor/ceiling", time: "O(log n)", space: "O(n)" },
      { op: "Iterate all entries", time: "O(n)", space: "—" },
    ],
    revision: ["merge(k, 1, Integer::sum) for counts", "hashCode picks bucket, equals finds key", "TreeMap = sorted + floor/ceiling", "LinkedHashMap keeps insertion order"],
    visual: "hash",
  },

  "deque-pq": {
    summary: "ArrayDeque as stack and queue, PriorityQueue as a heap, and custom ordering with Comparable and Comparator.",
    explanation: [
      "ArrayDeque is a resizable circular array that supports O(1) operations at both ends. Use push/pop/peek for a stack and offer/poll/peek for a queue. Prefer it over the old synchronized Stack class.",
      "PriorityQueue is a binary heap. By default the smallest element is at the head (min-heap). For a max-heap pass Collections.reverseOrder() or a comparator (a, b) -> b - a. offer and poll are O(log n), peek is O(1).",
      "Comparable defines a class's natural order through compareTo. Comparator defines an external, custom order — usually a lambda such as (a, b) -> a[0] - b[0] to sort int arrays by first element.",
      "Subtraction in comparators can overflow for large values (e.g. Integer.MIN_VALUE). Integer.compare(a, b) or Comparator.comparingInt are always safe.",
    ],
    prerequisites: ["Lists & maps", "Lambdas (basic)"],
    objectives: ["Use ArrayDeque for stack and queue", "Build min- and max-heaps", "Write safe comparators"],
    analogy: "A PriorityQueue is a hospital emergency room: patients are served by urgency, not arrival time.",
    code: [
      {
        title: "Stack, queue, heaps and comparators",
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1); stack.push(2); stack.push(3);
        System.out.println(stack.pop());     // 3 (LIFO)

        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(1); queue.offer(2); queue.offer(3);
        System.out.println(queue.poll());    // 1 (FIFO)

        PriorityQueue<Integer> minHeap = new PriorityQueue<>(List.of(5, 1, 8, 3));
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        maxHeap.addAll(List.of(5, 1, 8, 3));
        System.out.println(minHeap.poll() + " " + maxHeap.poll()); // 1 8

        int[][] intervals = {{5, 6}, {1, 9}, {3, 4}};
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // safe comparator
        System.out.println(Arrays.deepToString(intervals)); // [[1, 9], [3, 4], [5, 6]]
    }
}`,
      },
    ],
    steps: [
      { title: "Stack", detail: "push 1, 2, 3 → pop returns the last pushed: 3" },
      { title: "Queue", detail: "offer 1, 2, 3 → poll returns the first offered: 1" },
      { title: "Heaps", detail: "Min-heap head is 1, max-heap head is 8 — each poll is O(log n)" },
    ],
    mistakes: ["Iterating a PriorityQueue expecting sorted order (only poll gives order)", "Comparator a - b overflowing", "Using Stack/Vector (slow, legacy)", "Calling pop on an empty deque (NoSuchElementException) — check isEmpty or use poll"],
    complexity: [
      { op: "ArrayDeque push/pop/offer/poll", time: "O(1) amortised", space: "O(n)" },
      { op: "PriorityQueue offer/poll", time: "O(log n)", space: "O(n)" },
      { op: "PriorityQueue peek", time: "O(1)", space: "—" },
      { op: "Heapify a collection", time: "O(n)", space: "O(n)" },
    ],
    revision: ["ArrayDeque for both stack and queue", "PQ is a min-heap by default", "reverseOrder() for max-heap", "Integer.compare in comparators"],
    visual: "stack-queue",
  },

  "math-basics": {
    summary: "Divisors and prime checks in O(√n), the Sieve of Eratosthenes and prime factorisation.",
    explanation: [
      "Divisors come in pairs: if i divides n, so does n / i, and one of each pair is at most √n. Looping i from 1 while i * i <= n finds all divisors in O(√n).",
      "A number n > 1 is prime if no i in 2..√n divides it — again O(√n).",
      "To find all primes up to N, the Sieve of Eratosthenes starts with everything marked prime and, for each prime p, crosses out p², p² + p, … Total work is O(N log log N), nearly linear.",
      "Prime factorisation divides out each factor starting from 2 while i * i <= n; if something greater than 1 is left, it is itself a prime factor.",
    ],
    prerequisites: ["Loops", "Big-O"],
    objectives: ["Enumerate divisors in O(√n)", "Write an O(√n) primality test", "Implement the sieve and factorisation"],
    analogy: "The sieve is like a teacher crossing out multiples on a 1–100 chart: whatever survives being crossed out is prime.",
    code: [
      {
        title: "Divisors, primality, sieve, factorisation",
        java: `import java.util.*;

public class Main {
    static List<Integer> divisors(int n) {
        List<Integer> d = new ArrayList<>();
        for (int i = 1; (long) i * i <= n; i++)
            if (n % i == 0) { d.add(i); if (i != n / i) d.add(n / i); }
        Collections.sort(d);
        return d;
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; (long) i * i <= n; i++) if (n % i == 0) return false;
        return true;
    }

    static boolean[] sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        for (int p = 2; (long) p * p <= n; p++)
            if (!composite[p])
                for (int m = p * p; m <= n; m += p) composite[m] = true;
        return composite; // index i is prime if i >= 2 && !composite[i]
    }

    static Map<Integer, Integer> factorise(int n) {
        Map<Integer, Integer> f = new TreeMap<>();
        for (int i = 2; (long) i * i <= n; i++)
            while (n % i == 0) { f.merge(i, 1, Integer::sum); n /= i; }
        if (n > 1) f.merge(n, 1, Integer::sum);
        return f;
    }

    public static void main(String[] args) {
        System.out.println(divisors(36));       // [1, 2, 3, 4, 6, 9, 12, 18, 36]
        System.out.println(isPrime(97));        // true
        boolean[] c = sieve(30);
        for (int i = 2; i <= 30; i++) if (!c[i]) System.out.print(i + " ");
        System.out.println();
        System.out.println(factorise(360));     // {2=3, 3=2, 5=1}
    }
}`,
      },
    ],
    steps: [
      { title: "divisors(36)", detail: "i=1→(1,36), 2→(2,18), 3→(3,12), 4→(4,9), 6→(6) stop when i*i > 36" },
      { title: "sieve(30)", detail: "p=2 crosses 4,6,8…; p=3 crosses 9,12,15…; p=5 crosses 25,30; 6² > 30 so stop" },
      { title: "factorise(360)", detail: "360 → /2 three times → 45 → /3 twice → 5 → leftover 5 is prime" },
    ],
    mistakes: ["i * i overflowing int for n near 2³¹ — cast to long", "Adding √n twice for perfect squares", "Starting the sieve's inner loop at 2p instead of p² (correct but slower)", "Forgetting the leftover prime > √n in factorisation"],
    complexity: [
      { op: "All divisors", time: "O(√n)", space: "O(number of divisors)" },
      { op: "Primality test", time: "O(√n)", space: "O(1)" },
      { op: "Sieve up to N", time: "O(N log log N)", space: "O(N)" },
      { op: "Factorisation", time: "O(√n)", space: "O(log n)" },
    ],
    revision: ["Divisors pair up around √n", "Loop while i * i <= n", "Sieve starts at p²", "Leftover > 1 is a prime factor"],
  },

  "gcd-mod": {
    summary: "Euclid's GCD, LCM, modular arithmetic with 1e9+7, and fast exponentiation in O(log n).",
    explanation: [
      "Euclid's algorithm: gcd(a, b) = gcd(b, a % b) with gcd(a, 0) = a. Each step shrinks the numbers quickly, giving O(log min(a, b)). LCM = a / gcd(a, b) × b (divide first to avoid overflow).",
      "When answers get huge, problems ask for the result modulo 1,000,000,007 (a prime). Addition and multiplication can be reduced at every step: (a + b) % m and (a × b) % m — use long for the product. For subtraction add m before taking % to stay non-negative.",
      "Binary exponentiation computes xⁿ by squaring: xⁿ = (x^(n/2))² if n is even, times x if odd. That is O(log n) multiplications instead of n.",
      "Because 1e9+7 is prime, Fermat's little theorem gives the modular inverse: a⁻¹ ≡ a^(m−2) mod m, which lets you 'divide' under a modulus.",
    ],
    prerequisites: ["Number theory basics", "Recursion idea"],
    objectives: ["Compute GCD/LCM", "Keep big computations correct under a modulus", "Implement binary exponentiation"],
    analogy: "Modular arithmetic is clock arithmetic: 9 o'clock plus 5 hours is 2 o'clock, because you wrap around at 12.",
    code: [
      {
        title: "GCD, LCM and modular power",
        java: `public class Main {
    static final long MOD = 1_000_000_007L;

    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
    static long lcm(long a, long b) { return a / gcd(a, b) * b; }

    static long modPow(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) result = result * base % mod; // odd: take one base
            base = base * base % mod;                          // square
            exp >>= 1;                                         // halve exponent
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(gcd(84, 36) + " " + lcm(4, 6));   // 12 12
        System.out.println(modPow(2, 10, MOD));              // 1024
        System.out.println(modPow(2, 1_000_000_000L, MOD));  // fast even for huge exponents
        long inv3 = modPow(3, MOD - 2, MOD);                 // modular inverse of 3
        System.out.println(6 * inv3 % MOD);                  // 2  (6 / 3)
    }
}`,
      },
    ],
    steps: [
      { title: "gcd(84, 36)", detail: "→ gcd(36, 12) → gcd(12, 0) → 12" },
      { title: "modPow(2, 10)", detail: "exp 10 (1010₂): skip, square→4; take (res=4), square→16; skip, square→256; take res=4·256=1024" },
      { title: "Inverse", detail: "3^(MOD−2) mod MOD is 3⁻¹, so 6 × 3⁻¹ ≡ 2" },
    ],
    mistakes: ["Multiplying two values < MOD in int (overflow) — use long", "Negative results from (a − b) % m — use ((a − b) % m + m) % m", "Computing lcm as a * b / gcd (overflow)", "Using 1e9+7 as a double literal instead of 1_000_000_007L"],
    complexity: [
      { op: "gcd(a, b)", time: "O(log min(a, b))", space: "O(log) recursive" },
      { op: "modPow", time: "O(log exp)", space: "O(1)" },
    ],
    revision: ["gcd(a, b) = gcd(b, a % b)", "lcm = a / gcd × b", "Reduce mod after every + and ×", "Square-and-multiply = O(log n)"],
    visual: "bits",
  },

  bits: {
    summary: "Work directly with binary: two's complement, bitwise operators, masks and XOR tricks.",
    explanation: [
      "Integers are stored in binary. Java's int is 32 bits in two's complement: the top bit is the sign, and −x equals ~x + 1. That is why Integer.MIN_VALUE has no positive partner.",
      "Bitwise operators work on every bit: & (and), | (or), ^ (xor), ~ (not), << (shift left = multiply by 2), >> (arithmetic shift right keeps the sign), >>> (logical shift right fills with 0).",
      "Masks: check bit i with (n >> i) & 1, set it with n | (1 << i), clear it with n & ~(1 << i), toggle with n ^ (1 << i). n & (n − 1) removes the lowest set bit, so n is a power of two exactly when n > 0 and n & (n − 1) == 0.",
      "XOR rules: a ^ a = 0, a ^ 0 = a, and order doesn't matter. XOR-ing all numbers where everything appears twice except one leaves the single number. Integer.bitCount and Integer.toBinaryString help with debugging.",
    ],
    prerequisites: ["Data types", "Number systems (binary)"],
    objectives: ["Convert between decimal and binary", "Check/set/clear/toggle bits", "Use XOR and n & (n−1) tricks"],
    analogy: "A 32-bit int is a row of 32 light switches. Masks are stencils that let you flip only the switches you want.",
    code: [
      {
        title: "Bit tricks",
        java: `public class Main {
    static boolean isSet(int n, int i) { return ((n >> i) & 1) == 1; }

    public static void main(String[] args) {
        int n = 0b1011;                                  // 11
        System.out.println(Integer.toBinaryString(n));   // 1011
        System.out.println(isSet(n, 2));                 // false
        System.out.println(n | (1 << 2));                // 15 (set bit 2)
        System.out.println(n & ~(1 << 0));               // 10 (clear bit 0)
        System.out.println(n ^ (1 << 3));                // 3  (toggle bit 3)
        System.out.println(Integer.bitCount(n));         // 3 set bits

        int x = 64;
        System.out.println(x > 0 && (x & (x - 1)) == 0); // true: power of two

        int[] nums = {4, 1, 2, 1, 2};
        int single = 0;
        for (int v : nums) single ^= v;                  // pairs cancel out
        System.out.println(single);                      // 4

        System.out.println(-8 >> 1);                     // -4 (keeps sign)
        System.out.println(-8 >>> 28);                   // 15 (fills with zeros)
    }
}`,
      },
    ],
    steps: [
      { title: "n = 1011₂", detail: "Bits 0, 1 and 3 are on (8 + 2 + 1 = 11)" },
      { title: "Set bit 2", detail: "1011 | 0100 = 1111 = 15" },
      { title: "x & (x − 1)", detail: "64 = 1000000, 63 = 0111111, AND = 0 → power of two" },
      { title: "XOR all", detail: "4^1^2^1^2 = 4^(1^1)^(2^2) = 4" },
    ],
    mistakes: ["Operator precedence: n & 1 == 0 parses as n & (1 == 0) — add parentheses", "Using >> when you need >>> for unsigned shifts", "1 << 31 is negative in int; use 1L << i for long masks", "Shifting by ≥ 32 wraps around in Java (shift distance is taken mod 32)"],
    complexity: [{ op: "Any bitwise operation", time: "O(1)", space: "O(1)" }, { op: "Count bits by n &= n − 1", time: "O(set bits)", space: "O(1)" }],
    revision: ["Check (n >> i) & 1, set |, clear & ~, toggle ^", "n & (n − 1) drops lowest set bit", "a ^ a = 0", "Parenthesise bitwise expressions"],
    visual: "bits",
  },
};

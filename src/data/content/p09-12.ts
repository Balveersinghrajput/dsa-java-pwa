import type { TopicContent } from "./types";

// Phases 9–12: Linked lists, stacks & queues, trees, heaps.
export const content: Record<string, TopicContent> = {
  "ll-basics": {
    summary: "Build a singly linked list from nodes, insert and delete anywhere, use a dummy node and reverse it iteratively and recursively.",
    explanation: [
      "A linked list is a chain of nodes; each node stores a value and a reference to the next node. Unlike arrays, nodes aren't contiguous, so there's no O(1) indexing — but inserting or deleting next to a known node is O(1).",
      "Insert at head: new node points to the old head. Delete: make the previous node skip over the target (prev.next = prev.next.next). Reaching index i takes O(i) steps.",
      "A dummy (sentinel) node placed before the head removes special cases: the real head is just dummy.next, so deleting or inserting at the front looks like any other position.",
      "Reverse iteratively with three pointers — prev, cur, next — flipping one arrow at a time. Recursively: reverse the rest, then make the next node point back to the current one.",
    ],
    prerequisites: ["OOP & Node class", "References"],
    objectives: ["Implement insert/delete/search on a singly linked list", "Use a dummy node", "Reverse a list both ways"],
    analogy: "A linked list is a scavenger hunt: each clue (node) tells you where the next clue is. To insert a new clue you only rewrite one pointer.",
    code: [
      {
        title: "Linked list basics with a dummy node and reversal",
        java: `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (int v : vals) { tail.next = new ListNode(v); tail = tail.next; }
        return dummy.next;
    }

    static ListNode deleteValue(ListNode head, int target) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        for (ListNode prev = dummy; prev.next != null; ) {
            if (prev.next.val == target) prev.next = prev.next.next;  // skip it
            else prev = prev.next;
        }
        return dummy.next;
    }

    static ListNode reverse(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;   // save
            cur.next = prev;            // flip arrow
            prev = cur; cur = next;     // advance
        }
        return prev;
    }

    static ListNode reverseRec(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseRec(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }

    static void print(ListNode h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? " -> " : "");
        System.out.println(sb);
    }

    public static void main(String[] args) {
        ListNode head = build(1, 2, 3, 2, 4);
        head = deleteValue(head, 2);
        print(head);               // 1 -> 3 -> 4
        head = reverse(head);
        print(head);               // 4 -> 3 -> 1
        print(reverseRec(head));   // 1 -> 3 -> 4
    }
}`,
      },
    ],
    steps: [
      { title: "prev=null, cur=1", detail: "Save next (3), point 1 → null, move prev=1, cur=3" },
      { title: "cur=3", detail: "Save next (4), point 3 → 1, prev=3, cur=4" },
      { title: "cur=4", detail: "Point 4 → 3, prev=4, cur=null → return 4 (new head)" },
    ],
    mistakes: ["Losing the rest of the list by overwriting cur.next before saving it", "NullPointerException from not checking cur != null / cur.next != null", "Special-casing the head instead of using a dummy node", "Returning the old head after reversing"],
    complexity: [{ op: "Insert/delete at head", time: "O(1)", space: "O(1)" }, { op: "Access / search index i", time: "O(n)", space: "O(1)" }, { op: "Reverse (iterative)", time: "O(n)", space: "O(1)" }, { op: "Reverse (recursive)", time: "O(n)", space: "O(n) stack" }],
    revision: ["Dummy node removes head edge cases", "prev.next = prev.next.next deletes", "Reverse: save, flip, advance"],
    visual: "linked-list",
  },

  "ll-fast-slow": {
    summary: "Two pointers moving at different speeds find the middle, detect cycles, locate the cycle start and the n-th node from the end.",
    explanation: [
      "Move slow by one and fast by two. When fast reaches the end, slow is at the middle.",
      "Floyd's cycle detection: if there's a cycle, fast eventually laps slow and they meet inside the loop. To find where the cycle starts, reset one pointer to head and move both one step at a time — they meet at the cycle's entrance (a consequence of the distances involved).",
      "N-th node from the end: move a lead pointer n steps ahead, then move both until lead hits the end. Using a dummy node makes deleting that node clean.",
      "Palindrome list: find the middle, reverse the second half, compare the halves, then (optionally) reverse back to restore the list.",
    ],
    prerequisites: ["Linked list basics"],
    objectives: ["Find the middle in one pass", "Detect a cycle and its start in O(1) space", "Remove the n-th node from the end"],
    analogy: "Two runners on a circular track: the faster one will eventually lap the slower one — that's how you know the track is a loop.",
    code: [
      {
        title: "Middle, cycle start and n-th from end",
        java: `public class Main {
    static class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }

    static ListNode middle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        return slow;
    }

    static ListNode cycleStart(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) {                       // met inside the cycle
                slow = head;
                while (slow != fast) { slow = slow.next; fast = fast.next; }
                return slow;                          // entrance
            }
        }
        return null;
    }

    static ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0); dummy.next = head;
        ListNode lead = dummy, lag = dummy;
        for (int i = 0; i <= n; i++) lead = lead.next;
        while (lead != null) { lead = lead.next; lag = lag.next; }
        lag.next = lag.next.next;
        return dummy.next;
    }

    public static void main(String[] args) {
        ListNode[] nodes = new ListNode[6];
        for (int i = 0; i < 6; i++) nodes[i] = new ListNode(i + 1);
        for (int i = 0; i < 5; i++) nodes[i].next = nodes[i + 1];
        System.out.println(middle(nodes[0]).val);              // 4 (second middle of 6)
        ListNode h = removeNthFromEnd(nodes[0], 2);            // removes 5
        for (ListNode c = h; c != null; c = c.next) System.out.print(c.val + " ");
        System.out.println();
        nodes[5].next = nodes[2];                              // 6 -> 3 creates a cycle
        System.out.println(cycleStart(nodes[0]).val);          // 3
    }
}`,
      },
    ],
    steps: [
      { title: "Start", detail: "slow = fast = 1" },
      { title: "Steps", detail: "slow 2, fast 3 → slow 3, fast 5 → slow 4, fast null (past 6)" },
      { title: "Result", detail: "slow is at 4, the middle" },
    ],
    mistakes: ["Checking only fast.next != null (NPE when fast is null)", "Off-by-one moving the lead pointer n vs n + 1 steps", "Using a HashSet for cycle detection when O(1) space is required"],
    complexity: [{ op: "Middle / n-th from end", time: "O(n)", space: "O(1)" }, { op: "Floyd's cycle detection", time: "O(n)", space: "O(1)" }],
    revision: ["fast moves 2, slow moves 1", "Meet → reset one to head → step together → entrance", "Lead pointer n + 1 ahead from dummy"],
    visual: "linked-list",
  },

  "ll-merge": {
    summary: "Merge sorted lists, reorder and rotate lists, reverse a sub-range and sort a linked list with merge sort.",
    explanation: [
      "Merging two sorted lists: keep a tail pointer from a dummy node, repeatedly attach the smaller head, and append whatever remains at the end. O(n + m) time and O(1) extra space — nodes are relinked, not copied.",
      "Reorder list (L0 → Ln → L1 → Ln−1 …) combines three building blocks: find the middle, reverse the second half, then weave the halves together.",
      "Rotate right by k: connect the tail to the head to form a ring, then cut it at position n − k % n.",
      "Merge sort is the natural sort for linked lists: split at the middle with fast/slow pointers, sort both halves, merge — O(n log n) without random access.",
    ],
    prerequisites: ["Fast & slow pointers", "Merge sort"],
    objectives: ["Merge sorted lists in place", "Combine middle + reverse + merge", "Sort a linked list in O(n log n)"],
    analogy: "Merging sorted lists is like zipping a zip: teeth from both sides are joined one at a time in order.",
    code: [
      {
        title: "Merge two sorted lists and sort a list",
        java: `public class Main {
    static class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }

    static ListNode merge(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;
        return dummy.next;
    }

    static ListNode sort(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;          // fast starts ahead → left half gets the middle
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode right = slow.next;
        slow.next = null;                               // cut
        return merge(sort(head), sort(right));
    }

    static ListNode build(int... v) {
        ListNode d = new ListNode(0), t = d;
        for (int x : v) { t.next = new ListNode(x); t = t.next; }
        return d.next;
    }

    public static void main(String[] args) {
        for (ListNode c = merge(build(1, 4, 7), build(2, 3, 9)); c != null; c = c.next) System.out.print(c.val + " ");
        System.out.println();                            // 1 2 3 4 7 9
        for (ListNode c = sort(build(5, 1, 4, 2, 3)); c != null; c = c.next) System.out.print(c.val + " ");
        System.out.println();                            // 1 2 3 4 5
    }
}`,
      },
    ],
    steps: [
      { title: "Compare heads", detail: "1 vs 2 → attach 1; 4 vs 2 → attach 2; 4 vs 3 → attach 3" },
      { title: "Continue", detail: "4 vs 9 → 4; 7 vs 9 → 7" },
      { title: "Append the rest", detail: "First list is empty → attach 9" },
    ],
    mistakes: ["Forgetting to cut the list in half (infinite recursion)", "Starting fast = head in sort (two-node lists never split)", "Allocating new nodes instead of relinking", "Forgetting to append the remaining list"],
    complexity: [{ op: "Merge two sorted lists", time: "O(n + m)", space: "O(1)" }, { op: "Merge sort on list", time: "O(n log n)", space: "O(log n) stack" }, { op: "Reorder / rotate", time: "O(n)", space: "O(1)" }],
    revision: ["Dummy + tail for building", "Reorder = middle + reverse + weave", "Rotate = ring + cut", "Linked lists sort best with merge sort"],
    visual: "linked-list",
  },

  "ll-advanced": {
    summary: "Doubly and circular lists, the LRU cache (HashMap + doubly linked list) and deep-copying lists with random pointers.",
    explanation: [
      "A doubly linked list adds a prev pointer, so a node can remove itself in O(1) if you hold a reference to it. Sentinel head and tail nodes avoid null checks.",
      "An LRU (least recently used) cache needs O(1) get and put. A HashMap maps key → node for instant lookup; a doubly linked list keeps nodes ordered by recency. On access, move the node to the front; when full, evict the node before the tail.",
      "Copy List with Random Pointer: either map original → copy in a HashMap (two passes), or interleave copies (A → A' → B → B'), set random pointers with copy.random = orig.random.next, then separate the lists — O(1) extra space.",
    ],
    prerequisites: ["Linked list basics", "HashMap"],
    objectives: ["Implement a doubly linked list with sentinels", "Build an O(1) LRU cache", "Deep copy a list with random pointers"],
    analogy: "An LRU cache is your desk: whatever you used last sits on top of the pile, and when the desk is full you file away the paper at the bottom.",
    code: [
      {
        title: "LRU cache",
        java: `import java.util.*;

public class Main {
    static class LRUCache {
        class Node { int key, val; Node prev, next; Node(int k, int v) { key = k; val = v; } }
        private final int capacity;
        private final Map<Integer, Node> map = new HashMap<>();
        private final Node head = new Node(0, 0), tail = new Node(0, 0);   // sentinels

        LRUCache(int capacity) { this.capacity = capacity; head.next = tail; tail.prev = head; }

        private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
        private void addFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }

        int get(int key) {
            Node n = map.get(key);
            if (n == null) return -1;
            remove(n); addFront(n);              // mark as most recently used
            return n.val;
        }

        void put(int key, int value) {
            Node n = map.get(key);
            if (n != null) { n.val = value; remove(n); addFront(n); return; }
            if (map.size() == capacity) {         // evict least recently used
                Node lru = tail.prev;
                remove(lru); map.remove(lru.key);
            }
            n = new Node(key, value);
            map.put(key, n); addFront(n);
        }
    }

    public static void main(String[] args) {
        LRUCache c = new LRUCache(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println(c.get(1));   // 1  (now 1 is most recent)
        c.put(3, 3);                    // evicts key 2
        System.out.println(c.get(2));   // -1
        System.out.println(c.get(3));   // 3
    }
}`,
      },
    ],
    steps: [
      { title: "put 1, put 2", detail: "List: head ⇄ 2 ⇄ 1 ⇄ tail" },
      { title: "get(1)", detail: "Move 1 to front: head ⇄ 1 ⇄ 2 ⇄ tail" },
      { title: "put 3 (full)", detail: "Evict tail.prev (2), insert 3 at front: head ⇄ 3 ⇄ 1 ⇄ tail" },
    ],
    mistakes: ["Forgetting to remove the evicted key from the map", "Not updating both prev and next pointers", "Using LinkedHashMap in an interview that asks you to build it yourself (fine in practice: new LinkedHashMap<>(cap, 0.75f, true))"],
    complexity: [{ op: "LRU get / put", time: "O(1)", space: "O(capacity)" }, { op: "Copy random list (interleave)", time: "O(n)", space: "O(1) extra" }],
    revision: ["HashMap for lookup + DLL for order", "Sentinels remove null checks", "Move to front on every access"],
    visual: "linked-list",
  },

  "stack-queue-impl": {
    summary: "Implement stacks and queues from arrays and linked lists, a circular queue, conversions between them and a min stack.",
    explanation: [
      "A stack is last-in, first-out (LIFO): push and pop at the top. An array with a top index or a linked list with insert/delete at the head gives O(1) operations.",
      "A queue is first-in, first-out (FIFO). A circular array queue keeps front and size and wraps indices with % capacity, so freed slots at the front are reused.",
      "Queue using two stacks: push onto an input stack; when popping and the output stack is empty, move everything over (reversing the order). Each element moves at most once, so operations are O(1) amortised.",
      "Min stack: store pairs (value, minimum so far) or keep a second stack of minimums, so getMin is O(1).",
    ],
    prerequisites: ["Arrays", "Linked list basics"],
    objectives: ["Implement stack and circular queue", "Simulate one with the other", "Design an O(1) min stack"],
    analogy: "A stack is a pile of plates (take from the top); a queue is a line at a ticket counter (first come, first served).",
    code: [
      {
        title: "Circular queue, queue via two stacks and min stack",
        java: `import java.util.*;

public class Main {
    static class CircularQueue {
        int[] data; int front = 0, size = 0;
        CircularQueue(int k) { data = new int[k]; }
        boolean enqueue(int x) { if (size == data.length) return false; data[(front + size++) % data.length] = x; return true; }
        int dequeue() { if (size == 0) throw new NoSuchElementException(); int x = data[front]; front = (front + 1) % data.length; size--; return x; }
    }

    static class MyQueue {
        Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
        void push(int x) { in.push(x); }
        int pop() { if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop()); return out.pop(); }
    }

    static class MinStack {
        Deque<int[]> st = new ArrayDeque<>();                       // {value, minSoFar}
        void push(int x) { st.push(new int[]{x, st.isEmpty() ? x : Math.min(x, st.peek()[1])}); }
        void pop() { st.pop(); }
        int top() { return st.peek()[0]; }
        int getMin() { return st.peek()[1]; }
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(3);
        q.enqueue(1); q.enqueue(2); q.enqueue(3);
        System.out.println(q.enqueue(4) + " " + q.dequeue());     // false 1
        q.enqueue(4);                                                // reuses the freed slot
        MyQueue mq = new MyQueue(); mq.push(1); mq.push(2);
        System.out.println(mq.pop());                                // 1
        MinStack ms = new MinStack(); ms.push(5); ms.push(2); ms.push(7);
        System.out.println(ms.getMin()); ms.pop(); ms.pop();
        System.out.println(ms.getMin());                             // 2 then 5
    }
}`,
      },
    ],
    steps: [
      { title: "enqueue 1, 2, 3", detail: "front = 0, size = 3 — full" },
      { title: "dequeue", detail: "Returns 1, front = 1, size = 2" },
      { title: "enqueue 4", detail: "Index (1 + 2) % 3 = 0 — wraps around into the freed slot" },
    ],
    mistakes: ["Moving elements from in to out on every pop (O(n) each)", "Forgetting the wrap-around % capacity", "Min stack that recomputes the min by scanning"],
    complexity: [{ op: "Stack push/pop", time: "O(1)", space: "O(n)" }, { op: "Circular queue enqueue/dequeue", time: "O(1)", space: "O(k)" }, { op: "Queue via two stacks", time: "O(1) amortised", space: "O(n)" }, { op: "Min stack getMin", time: "O(1)", space: "O(n)" }],
    revision: ["LIFO vs FIFO", "Circular index = (front + size) % cap", "Transfer only when out is empty", "Store min alongside each value"],
    visual: "stack-queue",
  },

  "stack-classic": {
    summary: "Use a stack for matching brackets, evaluating expressions, simulating collisions and decoding nested strings.",
    explanation: [
      "Whenever the most recent unmatched item matters, think stack. Balanced brackets: push opening brackets; on a closing bracket, the top must be its matching opener.",
      "Postfix (reverse Polish) evaluation: push numbers; on an operator pop two operands, apply, push the result. The final stack holds the answer.",
      "Simulation problems — asteroid collisions, simplifying Unix paths, removing adjacent duplicates — keep a stack of 'survivors' and resolve conflicts with the top.",
      "Nested decoding like 3[a2[c]] uses two stacks (counts and partial strings) or recursion: on '[' save the current state, on ']' repeat the inner string and append it to the saved one.",
    ],
    prerequisites: ["Stack & queue implementation"],
    objectives: ["Validate brackets", "Evaluate postfix expressions", "Decode nested patterns"],
    analogy: "Opening brackets are doors you walk through; closing brackets must close the most recently opened door first.",
    code: [
      {
        title: "Valid parentheses, RPN evaluation and decode string",
        java: `import java.util.*;

public class Main {
    static boolean valid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')'); else if (c == '[') st.push(']'); else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }

    static int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+" -> st.push(st.pop() + st.pop());
                case "*" -> st.push(st.pop() * st.pop());
                case "-" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }
                case "/" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }
                default -> st.push(Integer.parseInt(t));
            }
        }
        return st.pop();
    }

    static String decode(String s) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<StringBuilder> parts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { counts.push(k); parts.push(cur); cur = new StringBuilder(); k = 0; }
            else if (c == ']') { String inner = cur.toString(); cur = parts.pop(); cur.append(inner.repeat(counts.pop())); }
            else cur.append(c);
        }
        return cur.toString();
    }

    public static void main(String[] args) {
        System.out.println(valid("{[()]}") + " " + valid("([)]"));          // true false
        System.out.println(evalRPN(new String[]{"2", "1", "+", "3", "*"}));  // 9
        System.out.println(decode("3[a2[c]]"));                              // accaccacc
    }
}`,
      },
    ],
    steps: [
      { title: "'{', '[', '('", detail: "Push expected closers: }, ], )" },
      { title: "')'", detail: "Pop ) → matches" },
      { title: "']' then '}'", detail: "Pop ] and } → match; stack empty → valid" },
    ],
    mistakes: ["Forgetting to check the stack is empty at the end", "Wrong operand order for − and / (second pop is the left operand)", "Multi-digit repeat counts in decode string"],
    complexity: [{ op: "Valid parentheses", time: "O(n)", space: "O(n)" }, { op: "RPN evaluation", time: "O(n)", space: "O(n)" }, { op: "Decode string", time: "O(output size)", space: "O(n)" }],
    revision: ["Push the expected closer", "Pop b then a for a − b", "Save state on '[' and restore on ']'"],
    visual: "stack-queue",
  },

  "monotonic-stack": {
    summary: "Keep a stack in increasing or decreasing order to find next/previous greater or smaller elements in O(n).",
    explanation: [
      "A monotonic stack holds indices whose values are kept in sorted order. When a new element breaks the order, pop elements — and for each popped element, the new element is its 'next greater' (or smaller).",
      "Every index is pushed and popped at most once, so the total work is O(n) even though there's a loop inside a loop.",
      "Stock span = distance to the previous greater element. Largest rectangle in a histogram: for each bar, find the previous and next smaller bars; the bar's height times that width is a candidate area.",
      "Sum of subarray minimums counts, for each element, how many subarrays it's the minimum of: (distance to previous smaller) × (distance to next smaller).",
    ],
    prerequisites: ["Stacks"],
    objectives: ["Write next greater element with a monotonic stack", "Solve largest rectangle in histogram", "Explain why it's O(n)"],
    analogy: "People standing in a line looking right: each person's view is blocked by the next taller person. When a tall person arrives, everyone shorter in front of them now knows who blocks their view.",
    code: [
      {
        title: "Next greater element and largest rectangle",
        java: `import java.util.*;

public class Main {
    static int[] nextGreater(int[] a) {
        int[] res = new int[a.length];
        Arrays.fill(res, -1);
        Deque<Integer> st = new ArrayDeque<>();     // indices, values decreasing
        for (int i = 0; i < a.length; i++) {
            while (!st.isEmpty() && a[st.peek()] < a[i]) res[st.pop()] = a[i];
            st.push(i);
        }
        return res;
    }

    static int largestRectangle(int[] h) {
        Deque<Integer> st = new ArrayDeque<>();     // indices, heights increasing
        int best = 0;
        for (int i = 0; i <= h.length; i++) {
            int cur = (i == h.length) ? 0 : h[i];   // sentinel 0 flushes the stack
            while (!st.isEmpty() && h[st.peek()] > cur) {
                int height = h[st.pop()];
                int left = st.isEmpty() ? -1 : st.peek();
                best = Math.max(best, height * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[]{2, 1, 2, 4, 3}))); // [4, 2, 4, -1, -1]
        System.out.println(largestRectangle(new int[]{2, 1, 5, 6, 2, 3}));         // 10
    }
}`,
      },
    ],
    steps: [
      { title: "i=0 (2), i=1 (1)", detail: "Push both; stack values [2, 1] (decreasing)" },
      { title: "i=2 (2)", detail: "1 < 2 → next greater of 1 is 2; push 2" },
      { title: "i=3 (4)", detail: "Pop 2 and 2 → both get 4; push 4" },
      { title: "i=4 (3)", detail: "3 < 4, push. Leftovers get −1" },
    ],
    mistakes: ["Storing values instead of indices (you need positions for widths)", "Forgetting to flush the stack at the end (use a sentinel)", "Using ≤ vs < inconsistently when duplicates exist (double counting)"],
    complexity: [{ op: "Next greater / smaller", time: "O(n)", space: "O(n)" }, { op: "Largest rectangle", time: "O(n)", space: "O(n)" }],
    revision: ["Pop while the new element breaks the order", "Popped element's answer = current element", "Store indices", "Each index pushed/popped once → O(n)"],
    visual: "stack-queue",
  },

  deque: {
    summary: "A deque supports both ends in O(1) — the monotonic deque gives sliding-window maximum in O(n).",
    explanation: [
      "A double-ended queue (ArrayDeque) adds and removes at both the front and the back in O(1).",
      "Sliding window maximum: keep a deque of indices whose values are decreasing. Before adding index i, pop smaller values from the back (they can never be the maximum again). Pop the front if it has left the window. The front is always the current window's maximum.",
      "Queue simulation problems (e.g. time needed to buy tickets, Dota2 senate) model rounds of a process by polling from the front and offering to the back.",
    ],
    prerequisites: ["Monotonic stack", "Sliding window"],
    objectives: ["Use ArrayDeque at both ends", "Compute sliding-window maximum in O(n)"],
    analogy: "A queue of candidates for 'tallest in view': when a taller person arrives, everyone shorter behind them gives up — they'll never be the tallest while that person is in view.",
    code: [
      {
        title: "Sliding window maximum",
        java: `import java.util.*;

public class Main {
    static int[] maxSlidingWindow(int[] a, int k) {
        int[] res = new int[a.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();           // indices, values decreasing
        for (int i = 0; i < a.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();     // left the window
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast(); // useless now
            dq.offerLast(i);
            if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
        }
        return res;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3)));
        // [3, 3, 5, 5, 6, 7]
    }
}`,
      },
    ],
    steps: [
      { title: "i=0..2", detail: "Deque ends with indices of [3, −1] → first window max 3" },
      { title: "i=3 (−3)", detail: "Append → [3, −1, −3], max 3" },
      { title: "i=4 (5)", detail: "Index of 3 expired; 5 removes −1 and −3 → [5], max 5" },
    ],
    mistakes: ["Storing values (can't tell when they leave the window)", "Using a heap (O(n log n)) when O(n) is expected", "Checking expiry with < instead of <="],
    complexity: [{ op: "Sliding window max", time: "O(n)", space: "O(k)" }, { op: "Deque operations", time: "O(1)", space: "—" }],
    revision: ["Front = max, back = newest", "Pop smaller from back, expired from front", "Store indices"],
    visual: "sliding-window",
  },

  "tree-traversal": {
    summary: "Binary tree vocabulary and the four traversals — preorder, inorder, postorder (recursive and iterative) and level order.",
    explanation: [
      "A binary tree node has a value and up to two children. The root has no parent; leaves have no children. Depth is the distance from the root; height is the longest path down to a leaf.",
      "Depth-first traversals differ only in when the node itself is visited: preorder (node, left, right), inorder (left, node, right), postorder (left, right, node). Recursive versions are three lines each.",
      "Iterative versions replace the call stack with an explicit stack — useful when the tree is very deep.",
      "Level order (breadth-first) uses a queue: process the nodes of one level (queue size at the start of the level), adding their children for the next level.",
    ],
    prerequisites: ["Recursion", "Stacks & queues"],
    objectives: ["Write all traversals recursively", "Write inorder iteratively", "Do level-order traversal level by level"],
    analogy: "Preorder is reading a book's table of contents top-down; postorder is cleaning up a project — finish all sub-tasks before closing the parent task.",
    code: [
      {
        title: "Traversals",
        java: `import java.util.*;

public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static void pre(TreeNode n, List<Integer> out) { if (n == null) return; out.add(n.val); pre(n.left, out); pre(n.right, out); }
    static void in(TreeNode n, List<Integer> out)  { if (n == null) return; in(n.left, out); out.add(n.val); in(n.right, out); }
    static void post(TreeNode n, List<Integer> out){ if (n == null) return; post(n.left, out); post(n.right, out); out.add(n.val); }

    static List<Integer> inorderIterative(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }   // go left
            cur = st.pop();
            out.add(cur.val);
            cur = cur.right;
        }
        return out;
    }

    static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> levels = new ArrayList<>();
        Queue<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int size = q.size(); size > 0; size--) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            levels.add(level);
        }
        return levels;
    }

    public static void main(String[] args) {
        //        1
        //       / \\
        //      2   3
        //     / \\
        //    4   5
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2); root.right = new TreeNode(3);
        root.left.left = new TreeNode(4); root.left.right = new TreeNode(5);
        List<Integer> a = new ArrayList<>(), b = new ArrayList<>(), c = new ArrayList<>();
        pre(root, a); in(root, b); post(root, c);
        System.out.println(a + " " + b + " " + c);   // [1, 2, 4, 5, 3] [4, 2, 5, 1, 3] [4, 5, 2, 3, 1]
        System.out.println(inorderIterative(root));  // [4, 2, 5, 1, 3]
        System.out.println(levelOrder(root));        // [[1], [2, 3], [4, 5]]
    }
}`,
      },
    ],
    steps: [
      { title: "Inorder: go left", detail: "Push 1, 2, 4 while moving left" },
      { title: "Pop 4", detail: "Visit 4, no right child; pop 2, visit, go right to 5" },
      { title: "Finish", detail: "Visit 5, pop 1, visit, go right to 3, visit → 4 2 5 1 3" },
    ],
    mistakes: ["Forgetting the null base case", "Level order without capturing the size at the start of each level", "Confusing height (edges vs nodes) — be consistent"],
    complexity: [{ op: "Any traversal", time: "O(n)", space: "O(h) DFS / O(w) BFS" }],
    revision: ["Pre: N L R, In: L N R, Post: L R N", "Iterative inorder: go left, pop, go right", "BFS: queue + level size"],
    visual: "tree",
  },

  "tree-properties": {
    summary: "Compute height, diameter, balance and path sums by returning information from children (post-order thinking).",
    explanation: [
      "Most tree problems follow one shape: ask the left and right subtrees for an answer, combine their answers at the current node, and return something to the parent. That's postorder traversal.",
      "Height = 1 + max(height(left), height(right)). A tree is balanced if, at every node, the two heights differ by at most 1 — return −1 to signal 'unbalanced' and stop early.",
      "Diameter (longest path between any two nodes) passes through some node as left height + right height. Track the best seen in a field while returning heights.",
      "Maximum path sum is the same idea with values: each node returns the best downward path (ignoring negative branches), and the answer considers left + node + right.",
      "Same tree, symmetric tree and invert tree compare or swap children recursively.",
    ],
    prerequisites: ["Tree traversals"],
    objectives: ["Return values up the tree", "Compute diameter and max path sum in O(n)", "Check balance with early exit"],
    analogy: "A company asks each department head for their team's best number; the head combines reports from sub-teams before reporting upward.",
    code: [
      {
        title: "Height, balanced check and diameter",
        java: `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static int diameter = 0;

    static int height(TreeNode n) {                  // also updates diameter
        if (n == null) return 0;
        int l = height(n.left), r = height(n.right);
        diameter = Math.max(diameter, l + r);        // path through n (edges)
        return 1 + Math.max(l, r);
    }

    static int balancedHeight(TreeNode n) {          // -1 means unbalanced
        if (n == null) return 0;
        int l = balancedHeight(n.left);
        if (l == -1) return -1;
        int r = balancedHeight(n.right);
        if (r == -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }

    static TreeNode invert(TreeNode n) {
        if (n == null) return null;
        TreeNode t = n.left; n.left = invert(n.right); n.right = invert(t);
        return n;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2); root.right = new TreeNode(3);
        root.left.left = new TreeNode(4); root.left.right = new TreeNode(5);
        System.out.println(height(root) + " " + diameter);       // 3 3
        System.out.println(balancedHeight(root) != -1);          // true
        System.out.println(invert(root).left.val);               // 3
    }
}`,
      },
    ],
    steps: [
      { title: "Leaves 4, 5, 3", detail: "Each returns height 1" },
      { title: "Node 2", detail: "l = 1, r = 1 → diameter candidate 2, returns 2" },
      { title: "Root 1", detail: "l = 2, r = 1 → diameter 3 (4 → 2 → 1 → 3), returns 3" },
    ],
    mistakes: ["Computing height separately at every node (O(n²))", "Mixing up 'path through node' (combine both) with 'value returned to parent' (one side only)", "Including negative branches in max path sum"],
    complexity: [{ op: "Height / diameter / balance", time: "O(n)", space: "O(h)" }],
    revision: ["Ask children, combine, return", "Diameter = max(l + r) over nodes", "Return −1 for early exit", "Return one branch, answer uses both"],
    visual: "tree",
  },

  "tree-views": {
    summary: "Right/left views, zigzag order, vertical order with a TreeMap and maximum width using position indices.",
    explanation: [
      "Right view = the last node of each level in a level-order traversal (left view = the first). A DFS that visits right before left and records the first node at each new depth also works.",
      "Zigzag level order alternates direction each level; collect a level normally and reverse it on odd levels, or insert at the front of a LinkedList.",
      "Vertical order assigns each node a column: root 0, left child col − 1, right child col + 1. A TreeMap<Integer, List> keyed by column returns columns in sorted order. Top view keeps the first node per column in BFS order; bottom view keeps the last.",
      "Maximum width numbers nodes like a heap (left = 2i, right = 2i + 1). Width of a level = last index − first index + 1. Re-base indices per level to avoid overflow.",
    ],
    prerequisites: ["Level-order traversal", "TreeMap"],
    objectives: ["Produce left/right/top/bottom views", "Group nodes by column", "Measure width with indices"],
    analogy: "Standing on the right side of a building, you only see the right-most lit window on each floor.",
    code: [
      {
        title: "Right view and vertical order",
        java: `import java.util.*;

public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static List<Integer> rightView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Queue<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode n = q.poll();
                if (i == size - 1) out.add(n.val);     // last of the level
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
        }
        return out;
    }

    static Collection<List<Integer>> verticalOrder(TreeNode root) {
        TreeMap<Integer, List<Integer>> cols = new TreeMap<>();
        Queue<Object[]> q = new ArrayDeque<>();
        q.offer(new Object[]{root, 0});
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            TreeNode n = (TreeNode) cur[0]; int c = (int) cur[1];
            cols.computeIfAbsent(c, k -> new ArrayList<>()).add(n.val);
            if (n.left != null) q.offer(new Object[]{n.left, c - 1});
            if (n.right != null) q.offer(new Object[]{n.right, c + 1});
        }
        return cols.values();
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9); root.right = new TreeNode(20);
        root.right.left = new TreeNode(15); root.right.right = new TreeNode(7);
        System.out.println(rightView(root));       // [3, 20, 7]
        System.out.println(verticalOrder(root));   // [[9], [3, 15], [20], [7]]
    }
}`,
      },
    ],
    steps: [
      { title: "Columns", detail: "3 → 0, 9 → −1, 20 → +1, 15 → 0, 7 → +2" },
      { title: "BFS order", detail: "Ensures nodes in the same column appear top to bottom" },
      { title: "TreeMap", detail: "Iterates columns −1, 0, 1, 2 in sorted order" },
    ],
    mistakes: ["Using DFS for vertical order without tracking row (wrong top-to-bottom order)", "Width indices overflowing in deep trees", "Forgetting the size snapshot per level"],
    complexity: [{ op: "Views / zigzag", time: "O(n)", space: "O(w)" }, { op: "Vertical order (TreeMap)", time: "O(n log n)", space: "O(n)" }],
    revision: ["Right view = last per level", "Column: left −1, right +1", "Width index: 2i and 2i + 1"],
    visual: "tree",
  },

  "tree-lca": {
    summary: "Lowest common ancestor, root-to-leaf paths, building trees from traversals and serialising trees to strings.",
    explanation: [
      "The lowest common ancestor (LCA) of p and q is the deepest node that has both in its subtree. Recursively: if the current node is null, p or q, return it. Otherwise search both sides; if both return non-null, the current node is the LCA; else pass up whichever side found something.",
      "Root-to-leaf paths use backtracking: add the node to the path, recurse into children, and remove it when returning. Path Sum problems carry the remaining target.",
      "A tree can be rebuilt from preorder + inorder: preorder's first value is the root; its position in inorder splits left and right subtrees. A HashMap of value → inorder index makes it O(n).",
      "Serialise with preorder and a marker for null (e.g. '#'), then deserialise by reading tokens in the same order.",
    ],
    prerequisites: ["Tree traversals", "Recursion"],
    objectives: ["Find the LCA in O(n)", "Enumerate root-to-leaf paths", "Build a tree from traversals and serialise it"],
    analogy: "The LCA of two employees is their closest shared manager in the org chart.",
    code: [
      {
        title: "LCA and build from preorder + inorder",
        java: `import java.util.*;

public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode l = lca(root.left, p, q), r = lca(root.right, p, q);
        if (l != null && r != null) return root;   // p and q on different sides
        return l != null ? l : r;
    }

    static int preIdx = 0;
    static TreeNode build(int[] pre, Map<Integer, Integer> inPos, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(pre[preIdx++]);
        int mid = inPos.get(root.val);
        root.left = build(pre, inPos, lo, mid - 1);
        root.right = build(pre, inPos, mid + 1, hi);
        return root;
    }

    static void serialize(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.append("# "); return; }
        sb.append(n.val).append(' ');
        serialize(n.left, sb); serialize(n.right, sb);
    }

    public static void main(String[] args) {
        int[] pre = {3, 9, 20, 15, 7}, in = {9, 3, 15, 20, 7};
        Map<Integer, Integer> pos = new HashMap<>();
        for (int i = 0; i < in.length; i++) pos.put(in[i], i);
        TreeNode root = build(pre, pos, 0, in.length - 1);
        StringBuilder sb = new StringBuilder();
        serialize(root, sb);
        System.out.println(sb.toString().trim());                       // 3 9 # # 20 15 # # 7 # #
        System.out.println(lca(root, root.right.left, root.right.right).val); // 20
    }
}`,
      },
    ],
    steps: [
      { title: "Root", detail: "pre[0] = 3; in inorder it's at index 1 → left [9], right [15, 20, 7]" },
      { title: "Left subtree", detail: "pre[1] = 9 → a leaf" },
      { title: "Right subtree", detail: "pre[2] = 20 splits [15] | [7]" },
    ],
    mistakes: ["Searching inorder linearly for each root (O(n²))", "Building the right subtree before the left (preorder index goes out of sync)", "Not backtracking the path list"],
    complexity: [{ op: "LCA (binary tree)", time: "O(n)", space: "O(h)" }, { op: "Build from traversals", time: "O(n)", space: "O(n)" }, { op: "Serialize / deserialize", time: "O(n)", space: "O(n)" }],
    revision: ["LCA: both sides non-null → current node", "Preorder gives roots, inorder splits", "Serialize with null markers"],
    visual: "tree",
  },

  bst: {
    summary: "Binary search trees: search, insert, delete, validate with bounds, and use inorder = sorted.",
    explanation: [
      "In a BST every node's left subtree holds smaller keys and its right subtree larger keys. Search, insert and delete walk one path from the root: O(h), which is O(log n) when the tree is balanced.",
      "Delete has three cases: a leaf (remove it), one child (replace the node by its child), two children (copy the inorder successor — the smallest key in the right subtree — into the node, then delete the successor).",
      "Validate a BST by passing down allowed (min, max) bounds; checking only parent–child pairs is not enough.",
      "Inorder traversal of a BST visits keys in sorted order — the basis for k-th smallest, BST iterators and converting a sorted array into a balanced BST (pick the middle as root).",
    ],
    prerequisites: ["Tree traversals", "Binary search"],
    objectives: ["Implement search, insert and delete", "Validate a BST correctly", "Use inorder for sorted-order problems"],
    analogy: "A BST is the 'higher or lower' game made into a structure: at each node you go left for smaller, right for larger.",
    code: [
      {
        title: "Insert, delete, validate",
        java: `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    static TreeNode insert(TreeNode n, int key) {
        if (n == null) return new TreeNode(key);
        if (key < n.val) n.left = insert(n.left, key);
        else if (key > n.val) n.right = insert(n.right, key);
        return n;
    }

    static TreeNode delete(TreeNode n, int key) {
        if (n == null) return null;
        if (key < n.val) n.left = delete(n.left, key);
        else if (key > n.val) n.right = delete(n.right, key);
        else {
            if (n.left == null) return n.right;          // 0 or 1 child
            if (n.right == null) return n.left;
            TreeNode s = n.right;                        // inorder successor
            while (s.left != null) s = s.left;
            n.val = s.val;
            n.right = delete(n.right, s.val);
        }
        return n;
    }

    static boolean valid(TreeNode n, long lo, long hi) {
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }

    static void inorder(TreeNode n, StringBuilder sb) { if (n == null) return; inorder(n.left, sb); sb.append(n.val).append(' '); inorder(n.right, sb); }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        root = delete(root, 50);                        // two children → successor 60
        StringBuilder sb = new StringBuilder(); inorder(root, sb);
        System.out.println(sb.toString().trim());       // 20 30 40 60 70 80
        System.out.println(root.val + " " + valid(root, Long.MIN_VALUE, Long.MAX_VALUE)); // 60 true
    }
}`,
      },
    ],
    steps: [
      { title: "Find 50", detail: "It's the root and has two children" },
      { title: "Successor", detail: "Smallest in right subtree: 70 → 60" },
      { title: "Replace and delete", detail: "Copy 60 into the root, then delete the old 60 leaf" },
    ],
    mistakes: ["Validating only node vs its direct children", "Using int bounds (fails for nodes equal to Integer.MIN/MAX) — use long or null", "Forgetting to reassign n.left = delete(...)"],
    complexity: [{ op: "Search / insert / delete", time: "O(h): O(log n) balanced, O(n) skewed", space: "O(h)" }, { op: "Inorder (sorted)", time: "O(n)", space: "O(h)" }],
    revision: ["Left < node < right (whole subtrees)", "Delete with two children → inorder successor", "Validate with (min, max) bounds", "Inorder = sorted"],
    visual: "tree",
  },

  "balanced-trees": {
    summary: "Why BSTs can degrade to O(n), and how AVL rotations and red-black rules keep height O(log n).",
    explanation: [
      "Inserting sorted keys into a plain BST produces a linked-list-shaped tree with height n, so every operation becomes O(n). Balanced BSTs restructure themselves to keep height O(log n).",
      "An AVL tree stores each node's height and requires the balance factor (left height − right height) to stay in −1..1. After an insert, the first unbalanced ancestor is fixed with a rotation: LL → right rotation, RR → left rotation, LR → left then right, RL → right then left.",
      "A red-black tree colours nodes red or black with rules (the root is black, no two reds in a row, every path has the same number of blacks). It's slightly less strictly balanced than AVL but needs fewer rotations; Java's TreeMap and TreeSet are red-black trees.",
      "In interviews you rarely implement these fully — but you should explain rotations and know that TreeMap gives guaranteed O(log n).",
    ],
    prerequisites: ["Binary search trees"],
    objectives: ["Explain BST degradation", "Perform the four AVL rotation cases", "Know where red-black trees are used"],
    analogy: "A mobile hanging from the ceiling: when one side gets too heavy you re-hang the pieces so it balances again.",
    code: [
      {
        title: "AVL insert with rotations",
        java: `public class Main {
    static class Node { int key, height = 1; Node left, right; Node(int k) { key = k; } }

    static int h(Node n) { return n == null ? 0 : n.height; }
    static void update(Node n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }

    static Node rotateRight(Node y) { Node x = y.left; y.left = x.right; x.right = y; update(y); update(x); return x; }
    static Node rotateLeft(Node x)  { Node y = x.right; x.right = y.left; y.left = x; update(x); update(y); return y; }

    static Node insert(Node n, int key) {
        if (n == null) return new Node(key);
        if (key < n.key) n.left = insert(n.left, key); else n.right = insert(n.right, key);
        update(n);
        int balance = h(n.left) - h(n.right);
        if (balance > 1 && key < n.left.key) return rotateRight(n);                                   // LL
        if (balance < -1 && key > n.right.key) return rotateLeft(n);                                  // RR
        if (balance > 1) { n.left = rotateLeft(n.left); return rotateRight(n); }                       // LR
        if (balance < -1) { n.right = rotateRight(n.right); return rotateLeft(n); }                    // RL
        return n;
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k = 1; k <= 7; k++) root = insert(root, k);   // sorted input!
        System.out.println("root=" + root.key + " height=" + root.height); // root=4 height=3 (plain BST would be 7)
    }
}`,
      },
    ],
    steps: [
      { title: "Insert 1, 2, 3", detail: "1 → 2 → 3 is right-heavy (RR) → rotate left at 1 → root 2" },
      { title: "Insert 4, 5", detail: "RR at 3 → rotate left → 4 with children 3, 5" },
      { title: "Insert 6, 7", detail: "More left rotations keep the height at 3 for 7 nodes" },
    ],
    mistakes: ["Updating heights in the wrong order after rotation (child before parent)", "Forgetting to update the height on the way back up", "Thinking HashMap is balanced — it's TreeMap that is"],
    complexity: [{ op: "AVL / red-black search, insert, delete", time: "O(log n) guaranteed", space: "O(n)" }, { op: "Rotation", time: "O(1)", space: "O(1)" }],
    revision: ["Sorted inserts break plain BSTs", "Balance factor ∈ {−1, 0, 1}", "LL→R, RR→L, LR→L+R, RL→R+L", "TreeMap = red-black tree"],
    visual: "tree",
  },

  "heap-impl": {
    summary: "A heap is a complete binary tree stored in an array: sift up, sift down, build in O(n) and heap sort.",
    explanation: [
      "A min-heap keeps every parent ≤ its children, so the minimum is at the root. Because the tree is complete, it fits in an array: children of i are 2i + 1 and 2i + 2, the parent of i is (i − 1) / 2.",
      "Insert: add at the end and sift up (swap with the parent while smaller). Extract-min: move the last element to the root and sift down (swap with the smaller child while larger). Both are O(log n).",
      "Building a heap from n items by sifting down from the last parent to the root is O(n) — most nodes are near the bottom and move very little.",
      "Heap sort builds a max-heap, then repeatedly swaps the root to the end and sifts down the shrinking heap: O(n log n), in place, not stable.",
    ],
    prerequisites: ["Trees", "Arrays"],
    objectives: ["Map tree positions to array indices", "Implement sift up and sift down", "Build a heap in O(n) and heap sort"],
    analogy: "A company where every manager is more senior than their reports: the CEO (root) is always the most senior, and when someone leaves, people shuffle up one level at a time.",
    code: [
      {
        title: "Array-based min-heap and heap sort",
        java: `import java.util.*;

public class Main {
    static class MinHeap {
        int[] a = new int[16]; int size = 0;
        void push(int x) {
            if (size == a.length) a = Arrays.copyOf(a, size * 2);
            a[size] = x;
            for (int i = size++; i > 0 && a[(i - 1) / 2] > a[i]; i = (i - 1) / 2) swap(a, i, (i - 1) / 2); // sift up
        }
        int pop() {
            int top = a[0];
            a[0] = a[--size];
            siftDown(a, 0, size, true);
            return top;
        }
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void siftDown(int[] a, int i, int n, boolean min) {
        while (true) {
            int l = 2 * i + 1, r = l + 1, best = i;
            if (l < n && (min ? a[l] < a[best] : a[l] > a[best])) best = l;
            if (r < n && (min ? a[r] < a[best] : a[r] > a[best])) best = r;
            if (best == i) return;
            swap(a, i, best); i = best;
        }
    }

    static void heapSort(int[] a) {
        for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, i, a.length, false); // build max-heap O(n)
        for (int end = a.length - 1; end > 0; end--) { swap(a, 0, end); siftDown(a, 0, end, false); }
    }

    public static void main(String[] args) {
        MinHeap h = new MinHeap();
        for (int x : new int[]{5, 3, 8, 1, 9, 2}) h.push(x);
        StringBuilder sb = new StringBuilder();
        while (h.size > 0) sb.append(h.pop()).append(' ');
        System.out.println(sb.toString().trim());          // 1 2 3 5 8 9
        int[] arr = {4, 10, 3, 5, 1};
        heapSort(arr);
        System.out.println(Arrays.toString(arr));           // [1, 3, 4, 5, 10]
    }
}`,
      },
    ],
    steps: [
      { title: "push 5, 3", detail: "3 < parent 5 → swap: [3, 5]" },
      { title: "push 1", detail: "Added at index 3, sifts past 5 then 3 → root becomes 1" },
      { title: "pop", detail: "Return 1, move the last element to the root and sift it down" },
    ],
    mistakes: ["Index formulas off by one (1-based vs 0-based)", "Sifting down towards the larger child in a min-heap", "Building a heap by n inserts (O(n log n)) when O(n) heapify is available"],
    complexity: [{ op: "push / pop", time: "O(log n)", space: "—" }, { op: "peek", time: "O(1)", space: "—" }, { op: "Build heap", time: "O(n)", space: "O(1)" }, { op: "Heap sort", time: "O(n log n)", space: "O(1)" }],
    revision: ["Children 2i+1, 2i+2; parent (i−1)/2", "Insert → sift up; extract → sift down", "Heapify from n/2 − 1 down to 0"],
    visual: "heap",
  },

  "top-k": {
    summary: "Keep a heap of size K to find the K largest, most frequent or closest items, and schedule tasks greedily with heaps.",
    explanation: [
      "To find the K largest elements, keep a min-heap of size K: push each element and pop when the size exceeds K. The heap always holds the K largest seen so far, and its top is the K-th largest. Time O(n log K).",
      "Top K frequent: count with a HashMap, then keep a size-K min-heap ordered by frequency (or bucket sort by frequency for O(n)).",
      "K closest points: max-heap of size K ordered by distance; pop the farthest when the heap grows past K.",
      "Scheduling problems (task scheduler, meeting rooms, IPO) use a heap to always pick the best available option at the current time.",
    ],
    prerequisites: ["Heap implementation", "PriorityQueue", "HashMap"],
    objectives: ["Use a size-K heap", "Combine frequency maps with heaps", "Choose min- vs max-heap correctly"],
    analogy: "Keeping a 'top 10 scores' board: a new score only gets on if it beats the lowest score currently on the board, which then drops off.",
    code: [
      {
        title: "K-th largest and top K frequent",
        java: `import java.util.*;

public class Main {
    static int kthLargest(int[] a, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap of size k
        for (int x : a) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();                  // drop the smallest
        }
        return heap.peek();
    }

    static List<Integer> topKFrequent(int[] a, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : a) freq.merge(x, 1, Integer::sum);
        PriorityQueue<Map.Entry<Integer, Integer>> heap = new PriorityQueue<>(Map.Entry.comparingByValue());
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            heap.offer(e);
            if (heap.size() > k) heap.poll();
        }
        List<Integer> res = new ArrayList<>();
        while (!heap.isEmpty()) res.add(heap.poll().getKey());
        Collections.reverse(res);
        return res;
    }

    public static void main(String[] args) {
        System.out.println(kthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));        // 5
        System.out.println(topKFrequent(new int[]{1, 1, 1, 2, 2, 3}, 2));      // [1, 2]
    }
}`,
      },
    ],
    steps: [
      { title: "3, 2", detail: "Heap {2, 3}" },
      { title: "1", detail: "{1, 2, 3} → size 3 > 2 → pop 1" },
      { title: "5, 6, 4", detail: "Each push pops the smallest → heap ends as {5, 6}; top = 5" },
    ],
    mistakes: ["Using a max-heap of all n elements (O(n log n) and O(n) space)", "Wrong heap type: K largest needs a min-heap", "Sorting the whole array when only K items are needed"],
    complexity: [{ op: "Top K with heap", time: "O(n log k)", space: "O(k)" }, { op: "Top K frequent (bucket sort)", time: "O(n)", space: "O(n)" }],
    revision: ["K largest → min-heap of size K", "K smallest → max-heap of size K", "Count first, heap second"],
    visual: "heap",
  },

  "heap-hard": {
    summary: "Two heaps for a running median and a heap for merging K sorted lists.",
    explanation: [
      "Running median: keep the smaller half in a max-heap and the larger half in a min-heap, with sizes equal or the max-heap one bigger. The median is the max-heap's top (odd count) or the average of both tops (even count). Each insert is O(log n).",
      "To add a number, push it to the max-heap, move the max-heap's top to the min-heap (keeps order), then if the min-heap became bigger, move its top back.",
      "Merge K sorted lists: put the head of each list in a min-heap. Repeatedly pop the smallest node, append it to the result and push that node's successor. Total O(N log K) for N nodes.",
    ],
    prerequisites: ["Top-K patterns", "Linked lists"],
    objectives: ["Maintain a running median", "Merge K sorted sequences with a heap"],
    analogy: "Two piles of numbers on a table: the left pile shows its biggest on top, the right pile its smallest. The median is wherever the two piles meet.",
    code: [
      {
        title: "Median finder",
        java: `import java.util.*;

public class Main {
    static class MedianFinder {
        PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
        PriorityQueue<Integer> high = new PriorityQueue<>();                          // min-heap

        void add(int x) {
            low.offer(x);
            high.offer(low.poll());                  // keep every low <= every high
            if (high.size() > low.size()) low.offer(high.poll());
        }

        double median() {
            return low.size() > high.size() ? low.peek() : (low.peek() + high.peek()) / 2.0;
        }
    }

    public static void main(String[] args) {
        MedianFinder m = new MedianFinder();
        for (int x : new int[]{5, 15, 1, 3}) {
            m.add(x);
            System.out.print(m.median() + " ");      // 5.0 10.0 5.0 4.0
        }
        System.out.println();
    }
}`,
      },
    ],
    steps: [
      { title: "add 5", detail: "low {5}, high {} → median 5" },
      { title: "add 15", detail: "low {5}, high {15} → median 10" },
      { title: "add 1", detail: "low {5, 1}, high {15} → median 5" },
      { title: "add 3", detail: "low {3, 1}, high {5, 15} → median (3 + 5) / 2 = 4" },
    ],
    mistakes: ["Integer division when averaging two tops", "Letting the heaps become unbalanced by more than one", "Pushing all nodes of all lists into the heap at once (O(N log N))"],
    complexity: [{ op: "Median add", time: "O(log n)", space: "O(n)" }, { op: "Median query", time: "O(1)", space: "—" }, { op: "Merge K lists", time: "O(N log K)", space: "O(K)" }],
    revision: ["Max-heap for low half, min-heap for high half", "Balance after every insert", "K-way merge: heap of current heads"],
    visual: "heap",
  },
};

# Cheat Sheet — last thing you read

The one-page version of everything in this course. Read it the morning of the interview.

## The 40-second answers

**How Java Actually Runs (JDK / JRE / JVM)** — Java is compiled to bytecode by javac, and the JVM interprets or JIT-compiles that bytecode at runtime. That bytecode layer is what gives Java platform independence — the same class file runs anywhere a JVM exists.

**Data Types, Variables & Wrappers** — There are 8 primitives with fixed sizes across platforms; everything else is a reference. Wrappers give me objects for collections and generics, and autoboxing converts automatically — but I always compare them with equals(), because == compares references and the Integer cache only covers -128 to 127.

**Operators & Precedence** — Java operators follow C-like precedence. The two things I'm careful about: `++i` vs `i++` in expressions, and using `&&`/`||` deliberately for short-circuiting — `&` and `|` evaluate both operands and can turn a safe null check into an NPE.

**Control Flow: switch, loops, break/continue** — I default to the modern arrow switch and switch expressions — no fall-through, it returns a value, and the compiler forces exhaustiveness. I know the classic colon form falls through without break, which is exactly why I avoid it.

**Arrays** — Arrays are fixed-size, zero-indexed, and default-initialised. `arr.length` is a field, not a method. For anything dynamic I'd reach for ArrayList instead, but for coding rounds I'm comfortable with two-pointer and sliding-window patterns directly on arrays.

**Strings, Immutability & the String Pool** — String is immutable — every modification returns a new object, which is why it's thread-safe and safe as a HashMap key. Literals are interned in the string pool and reused; `new String()` forces a separate object. I compare strings with equals(), never ==, and I use StringBuilder when I'm building strings in a loop.

**Input / Output & Formatting** — I use Scanner for quick input but BufferedReader with StringTokenizer for large inputs, because Scanner is regex-based and slow. And I know the classic nextInt-then-nextLine newline bug — you consume the leftover newline or read lines and parse.

**Stack, Heap & Pass-by-Value** — Java is strictly pass-by-value. When I pass an object, the value being copied is the reference — so mutating the object through that reference affects the original, but reassigning the parameter never changes the caller's variable. That's why a plain swap(x, y) method can't work.

**Packages, Access Modifiers & the static Keyword** — static means the member belongs to the class rather than an instance — one shared copy, callable without an object, and it can't touch instance state or use this. Access modifiers go private → package-private → protected → public, widening at each step, and protected also grants access to subclasses in other packages.

**Varargs, Enums & Command-Line Args** — Varargs is just an array parameter with a friendlier call site, and it must be last. Enums are full classes — constants are singletons, so == is safe, and they can carry fields, methods and even per-constant behaviour.

**The 4 Pillars of OOP (with real examples)** — Encapsulation hides state behind behaviour, inheritance reuses code through an IS-A relationship, polymorphism lets the same call take many forms — overloading at compile time, overriding at runtime — and abstraction exposes what an object does via interfaces and abstract classes. In practice I favour composition over inheritance, because it keeps classes decoupled and testable.

**Constructors, this & super** — Constructors have no return type and aren't inherited or overridable. this() and super() must be the first statement, so a constructor can only do one or the other. If I don't write one, the compiler inserts a call to super() — which is why a subclass fails to compile when the parent only has a parameterised constructor.

**Overloading vs Overriding & Dynamic Dispatch** — Overloading is compile-time polymorphism — the compiler picks the method from the declared argument types. Overriding is runtime polymorphism — the JVM picks it from the actual object type. When overriding, the signature is identical, the return type can be a covariant subtype, I can widen access but never narrow it, and I can't throw broader checked exceptions. And I always add @Override so the compiler catches my typos.

**Abstract Class vs Interface** — An abstract class models an IS-A relationship with shared state and a constructor — I use it for template-method style skeletons. An interface is a capability contract; since Java 8 it can carry default and static implementations, and a class can implement many of them, which is how Java supports multiple inheritance of type. For DI and testability I program to interfaces.

**Object Methods & the equals/hashCode Contract** — Every class inherits from Object. The key contract: if two objects are equal their hash codes must be equal, so I always override equals and hashCode together, using the same fields. I use Objects.equals and Objects.hash for null safety, instanceof for the type check, and I keep those fields immutable so an object can't go missing inside a HashMap.

**Exception Handling** — Throwable splits into Error, which I never catch, and Exception. Exceptions are checked — the compiler forces me to catch or declare them — or unchecked RuntimeExceptions, which usually indicate a bug I should fix rather than catch. I use try-with-resources so resources always close, I catch specific types from most- to least-specific, and when I wrap an exception I always pass the original as the cause.

**Collections Framework: List & Set** — Collection splits into List, Set and Queue, and Map sits in its own hierarchy. ArrayList is my default — backed by a resizable array with O(1) random access; LinkedList only wins for frequent insertions at both ends. For unique elements I use HashSet for speed, LinkedHashSet when I need insertion order, and TreeSet when I need them sorted. HashSet relies on hashCode to find the bucket and equals to confirm the duplicate, which is why I override them together.

**Map & HashMap Internals** — HashMap is an array of buckets indexed by hash(key) & (n-1). On a collision the entries are chained in a linked list, and since Java 8 a bucket with more than 8 entries is treeified into a red-black tree so the worst case stays O(log n). It resizes by doubling when size exceeds 0.75 × capacity. Keys must implement equals and hashCode properly and be immutable. For concurrency I'd use ConcurrentHashMap, not Hashtable — it locks per-bin and doesn't allow nulls.

**Iterators, Comparable vs Comparator** — Comparable gives a class one natural ordering via compareTo; Comparator is an external strategy via compare, which is better when I need several orderings or can't modify the class. With Java 8 I compose comparators with comparing, thenComparing and reversed. For iteration, collection iterators are fail-fast — structural modification outside the iterator throws ConcurrentModificationException, so I use iterator.remove() or removeIf; concurrent collections are fail-safe instead.

**Generics & Wildcards** — Generics give compile-time type safety and eliminate casts. Java implements them with type erasure — the type parameters are gone at runtime, so List<String> and List<Integer> are the same class, which is why I can't instantiate a type parameter or test instanceof on a parameterized type. For wildcards I follow PECS: use ? extends when I only read from the structure, ? super when I only write into it.

**Lambdas & Method References** — A lambda is a concise instance of a functional interface — an interface with exactly one abstract method. Parameters types are inferred, and it can capture local variables as long as they're effectively final, because those values are copied. Method references are just shorthand when the lambda body only calls an existing method.

**Streams API** — A stream is a lazy pipeline over a data source: a source, zero or more intermediate operations like filter and map, and one terminal operation that triggers execution and produces a result. It doesn't store data or modify the source, and it can only be consumed once. I reach for Collectors like groupingBy and joining to build results, and I only use parallelStream for large CPU-bound work because the overhead and ordering caveats usually aren't worth it.

**Optional & the Date/Time API** — Optional is a container that may hold a value, designed as a return type so absence is handled explicitly — I use orElse, orElseGet, orElseThrow and map/flatMap chains instead of get(), and I never use it as a field or parameter. For dates I use java.time: it's immutable and thread-safe, unlike Date and Calendar, and DateTimeFormatter can be shared across threads where SimpleDateFormat can't.

**Modern Java: 9 → 17 Features** — I'm comfortable on Java 11 and 17, the current LTS versions. Beyond Java 8 I use records for immutable DTOs instead of Lombok boilerplate, sealed interfaces with pattern-matching switch for closed hierarchies, var where the type is obvious, text blocks for SQL and JSON, and the Java 11 HTTP Client instead of HttpURLConnection.

**Threads: Creation, Lifecycle & Basics** — A thread is a lightweight unit of execution inside a process; threads share heap memory but each has its own stack. I implement Runnable and call start() — never run() directly, which would just execute on the calling thread. For lifecycle: NEW, RUNNABLE, RUNNING, BLOCKED/WAITING/TIMED_WAITING, TERMINATED. And the key difference: sleep() keeps the lock, wait() releases it and must be called inside a synchronized block.

**Synchronization, volatile & Deadlock** — synchronized provides both mutual exclusion and the visibility guarantees of happens-before, and it's reentrant. volatile gives visibility and prevents reordering but not atomicity, so I use it for flags and safe publication, never for compound operations like i++. For deadlock, the practical fix is consistent lock ordering, plus tryLock with a timeout; in production I'd diagnose with jstack or a profiler.

**ExecutorService & Concurrent Collections** — I never create threads directly in production — I submit tasks to an ExecutorService so threads are reused and the pool can be bounded. I construct ThreadPoolExecutor explicitly rather than using the Executors factories, because the default unbounded queue can cause an OOM under load. For results I use Future or CompletableFuture when I need to compose async work, and ConcurrentHashMap or a BlockingQueue instead of synchronizing collections by hand.

**File I/O & Serialization** — For file work I use NIO.2 — Files and Paths — which is cleaner and throws better exceptions than the old io streams, and I always close streams with try-with-resources. Serialization converts an object to bytes via the Serializable marker; I declare serialVersionUID to keep compatibility across versions and mark sensitive or non-serializable fields transient. In modern apps I'd usually serialize to JSON with Jackson instead.

**JDBC — Connecting Java to a Database** — JDBC is the layer under JPA: get a connection from the pool, prepare a statement, bind parameters, execute, process the ResultSet and close everything in try-with-resources. I always use PreparedStatement — it's precompiled, faster on repeat, and critically it prevents SQL injection because the values are sent separately from the SQL. For writes I turn off auto-commit, commit on success and roll back on any exception.

**Design Patterns You Must Know** — I know the classic GoF patterns by category — creational like Singleton, Factory and Builder; structural like Adapter, Decorator and Proxy; behavioural like Strategy, Observer and Template Method. For Singleton I'd normally use the enum implementation: the JVM guarantees a single instance and it's safe against reflection and serialization. And I can point at where Spring uses each — @Transactional is a proxy, JdbcTemplate is template method, events are observer.

**Spring Core: IoC, DI & Beans** — IoC means the framework controls object creation and wiring instead of my code doing `new` everywhere. DI is how it's delivered — Spring injects dependencies, and I prefer constructor injection because it keeps fields final, makes dependencies explicit and makes unit testing trivial without Spring. A bean is any object managed by the container, singleton-scoped by default.

**Spring Boot: Auto-configuration, Starters & Config** — Spring Boot is Spring with opinionated defaults. Its auto-configuration inspects the classpath and conditionally configures beans — Tomcat because spring-boot-starter-web is present, a DataSource because a JDBC driver is — but it backs off the moment I define my own bean. Starters bundle compatible dependency versions, the app runs as a plain JAR with an embedded server, and config is externalised into application.yml bound with @ConfigurationProperties and separated by profiles.

**Spring MVC & REST Controllers** — A request hits the DispatcherServlet, which uses a HandlerMapping to find the controller method, binds parameters via HttpMessageConverters, runs the service layer and returns a value that Jackson serializes to JSON. I use constructor injection, return DTOs rather than entities so the API contract is stable and internal fields never leak, validate incoming bodies with @Valid, and centralise error responses in a @RestControllerAdvice so the client always gets a consistent JSON error shape.

**JPA & Hibernate** — JPA is the specification and Hibernate is the implementation; Spring Data JPA generates repositories from interface method names. I map entities with @Entity/@Id/@GeneratedValue, set @ManyToOne to LAZY rather than accepting the EAGER default, and watch for the N+1 problem — which I fix with JOIN FETCH or @EntityGraph. Transactions belong on the service layer: Hibernate's dirty checking means I don't need to call save() on managed entities, and the commit happens when the transactional method exits.

**SQL Essentials for Interviews** — I'm comfortable writing joins, group-by with having, subqueries and window functions. I know WHERE filters before grouping and HAVING after, that indexes speed reads but cost writes, and that a LEFT JOIN plus IS NULL finds unmatched rows. For slow queries I read the EXPLAIN plan first and look for full scans, functions on indexed columns and leading wildcards.

**Maven, Build & Project Structure** — Maven uses a POM with GAV coordinates and a fixed lifecycle: validate, compile, test, package, verify, install, deploy. The Spring Boot parent POM manages dependency versions so I don't have to align them myself. I scope dependencies properly — test for JUnit/Mockito, provided for Lombok — and the spring-boot-maven-plugin produces an executable fat JAR I can run with java -jar.

**Spring Security & JWT** — Spring Security is a filter chain in front of my controllers. For a stateless API I use JWTs: the user logs in, I verify the password with BCrypt, issue a signed token carrying subject, roles and expiry, and a filter validates that token on each request and populates the SecurityContext. I disable CSRF for stateless APIs but configure CORS explicitly, and I use @PreAuthorize for method-level authorization. Passwords are BCrypt-hashed with a per-user salt — never encrypted or stored in plain text.

**Testing: JUnit 5 & Mockito** — I write JUnit 5 tests with Mockito: @Mock the dependencies and @InjectMocks the class under test, then given/when/then with AssertJ's fluent assertions. For Spring layers I use test slices — @WebMvcTest with MockMvc for controllers and @DataJpaTest for repositories — because they're far faster than loading the full context with @SpringBootTest. The pyramid I aim for is lots of unit tests, some integration tests, and a few end-to-end tests.

**Microservices & Architecture Overview** — I'd start with a modular monolith and only split into microservices for a concrete reason — independent scaling, team autonomy or different availability needs. If we go distributed, each service owns its data, they communicate via REST or events, sit behind an API gateway, and need circuit breakers, centralised logging and distributed tracing, because partial failure and eventual consistency are the real costs.

**Explaining Your Project (the round that decides it)** — Structure beats talent here. Rehearse your 45-second pitch out loud today — problem, stack, your contribution, one hard problem with a measurable result, and one improvement. Then every bullet on your resume should survive two minutes of follow-up questions.

**Output Prediction Traps (Part 1: Strings & Numbers)** — String literals are interned in a pool and reused; `new String()` always creates a fresh object. Compile-time constants get folded, but concatenation involving a variable happens at runtime. Wrappers cache -128 to 127, so == works there and fails beyond it — which is why I always use equals().

**Output Prediction Traps (Part 2: OOP & Exceptions)** — Instance methods are dispatched at runtime by the object's type, but static methods are hidden and resolved at compile time by the reference type — and fields are never polymorphic at all. Initialisation runs static blocks once, parent before child, then instance blocks and constructors per object. And finally always runs; a return in finally overrides the try's return, though the returned value is snapshotted before finally executes.

**One-Minute Answers (Verbal Rapid Fire)** — Answer in three beats: what it is, how it works, why it matters. Two sentences, then stop and let them ask for more.

**HR & Behavioural Questions** — Every behavioural answer is a short story with a measurable result, and I never criticise a past employer or manager. My weaknesses are real but paired with what I'm doing about them, and I always have two questions about the team and its practices.

**Final 24 Hours: What To Do & Skip** — Four days ago this all felt forgotten. You now have the language back, the framework story straight, and a project pitch that lands. Sleep tonight — recall beats cramming.

---

## All flashcards

### Day 1 — Core Java: The Language, Again

**How Java Actually Runs (JDK / JRE / JVM)**

- **Difference between JDK, JRE and JVM?** JVM runs bytecode. JRE = JVM + libraries, enough to run. JDK = JRE + dev tools like javac, used to develop.
- **Is Java compiled or interpreted?** Both. javac compiles source to bytecode; the JVM interprets/JIT-compiles that bytecode into native machine code.
- **What does WORA mean and what makes it possible?** Write Once Run Anywhere. The .class bytecode is platform-neutral; each OS has its own JVM that executes it.
- **Why must main be static?** The JVM calls main before any object of the class exists, so it must be invocable on the class itself, not an instance.
- **Can you overload main()?** Yes — you can write many main methods with different parameters, but only public static void main(String[]) is the entry point.
- **Since Java 11, do you need to install the JRE separately?** No. The JDK includes everything; there's no separate JRE download for modern versions.

**Data Types, Variables & Wrappers**

- **Why does `Integer a=127, b=127; a==b` print true but `128` prints false?** The Integer cache reuses objects for -128..127. Above that range, each boxing creates a new object, so == compares different references.
- **What's the default value of a local variable vs an instance variable?** Instance/class fields get defaults (0, false, null). Local variables have NO default — using one before assigning is a compile error.
- **Is `boolean` 1 bit in Java?** Size is JVM-dependent (often 1 byte in arrays, 4 bytes as a local). What's guaranteed: it holds only true/false, and unlike C, 0/1 are not booleans.
- **Why does `byte c = a + b;` fail to compile when a and b are bytes?** byte/short/char are promoted to int during arithmetic, so the result is int and needs an explicit cast back to byte.
- **What's the difference between `parseInt` and `valueOf`?** parseInt returns a primitive int; valueOf returns an Integer object (and uses the -128..127 cache).
- **What exception does `Integer.parseInt("abc")` throw?** NumberFormatException — it's unchecked (extends IllegalArgumentException / RuntimeException).
- **What is autoboxing? Give a risk it creates.** Automatic primitive↔wrapper conversion (int → Integer). Risk: unboxing a null wrapper throws NullPointerException, and == on wrappers compares references.
- **final on a variable — what exactly is final?** The reference can't be reassigned. The object's internal state can still change (final List can still have elements added).

**Operators & Precedence**

- **Difference between && and &?** && short-circuits (skips the right operand if the left decides the result); & always evaluates both. On integers, & is bitwise AND.
- **What is `a = a++;` when a is 10?** a stays 10. a++ returns the old value (10) and that value is assigned back to a.
- **What is -8 >>> 1?** 2147483644. >>> is the unsigned right shift — it fills with zeros instead of the sign bit.
- **How do you swap two ints with XOR?** a = a ^ b; b = a ^ b; a = a ^ b; — works because x^x == 0 and x^0 == x.
- **Is the ternary operator a statement or an expression?** An expression — it produces a value, so both branches must have compatible types and it can't stand alone as a statement.
- **How do you check if a number is a power of two?** n > 0 && (n & (n - 1)) == 0 — powers of two have exactly one set bit.

**Control Flow: switch, loops, break/continue**

- **What is switch fall-through and how do you avoid it?** In colon-style switch, without `break` execution continues into the next case. Use arrow syntax `case 1 ->` (no fall-through) or add break.
- **What is a switch expression and which keyword yields a value from a block?** A switch that returns a value (Java 14+): `int x = switch (...) { case 1 -> 10; default -> { yield 0; } }`. `yield` returns a value from a block.
- **Which types can you switch on?** byte, short, char, int and their wrappers, String, enums, and since Java 21, type patterns. Not long, float, double, or boolean.
- **Difference between break, continue and a labelled break?** break exits the innermost loop/switch; continue skips to the next iteration; `label: ... break label;` exits an outer labelled loop.
- **Which loop always executes its body at least once?** do-while — the condition is checked after the body.
- **Can you use `break` outside a loop or switch?** No — compile error, unless it's a labelled break targeting an enclosing labelled block.

**Arrays**

- **Why do you need Arrays.toString(arr) instead of printing the array?** Arrays don't override toString(), so `System.out.println(arr)` prints the default Object form like [I@1b6d3586. Arrays.toString() gives readable output.
- **arr.length vs String.length() vs List.size()?** Array length is a public final *field*; String and List use *methods* — s.length() and list.size().
- **What is a jagged array in Java?** A 2D array whose rows have different lengths — Java's multi-dimensional arrays are arrays of arrays, so each row is independent.
- **What does Arrays.asList() return and what's the catch?** A fixed-size List backed by the array — add/remove throw UnsupportedOperationException, but set() works and mutates the original array.
- **Difference between List.of() and Arrays.asList()?** List.of() (Java 9) is fully immutable and rejects nulls; Arrays.asList() is fixed-size but allows set() and nulls.
- **What must be true before Arrays.binarySearch()?** The array must be sorted in ascending order, otherwise the result is undefined.
- **Default values in a new int[] vs new String[]?** int[] → 0; String[] → null. All arrays are default-initialised.

**Strings, Immutability & the String Pool**

- **Why is String immutable in Java?** For security, thread-safety, hashcode caching and string-pool reuse. Since strings are used as keys and parameters everywhere, immutability makes them safely shareable.
- **How many objects are created by `String s = new String("hello");`?** Two (if "hello" isn't already pooled): one literal in the pool and one new object on the heap. One if the literal is already interned.
- **What does intern() do?** Returns the canonical pooled instance of the string, adding it to the pool if absent. Useful for making == work and saving memory with many duplicates.
- **StringBuilder vs StringBuffer?** Both mutable; StringBuilder is not synchronized (faster, default choice), StringBuffer methods are synchronized (thread-safe, legacy).
- **String vs StringBuilder vs StringBuffer on equals()?** String overrides equals() to compare contents. StringBuilder/StringBuffer do NOT — their equals() is reference equality.
- **Does `String s = "a" + "b";` create 3 objects?** No — the compiler folds it into the single literal "ab", which is pooled.
- **trim() vs strip()?** trim() removes characters <= U+0020 only; strip() (Java 11) is Unicode-aware and removes all whitespace. Prefer strip().
- **Can a String be used as a key in HashMap safely?** Yes — String is immutable and caches its hashcode, so the hash never changes after insertion.
- **What does `s.substring(1, 4)` return for "Programming"?** "rog" — the begin index is inclusive and the end index is exclusive.

**Input / Output & Formatting**

- **Scanner vs BufferedReader for input?** Scanner is convenient (nextInt, nextLine, hasNext) but slow because it uses regex. BufferedReader reads raw characters fast and you parse manually — preferred for large inputs.
- **Why does nextLine() return empty right after nextInt()?** nextInt() reads the number but leaves the newline in the buffer, so nextLine() immediately consumes that empty remainder. Fix: an extra nextLine() to flush it, or read everything as lines.
- **What's the difference between %n and \n in printf?** %n is the platform-independent line separator; \n is always a Unix newline. Prefer %n in formatted output.
- **How do you print a double with exactly 2 decimals?** System.out.printf("%.2f", value) — it rounds automatically (HALF_UP for most values, though it uses the default rounding mode).
- **Why avoid println inside a large loop?** Each call flushes/does I/O work; it's dramatically slower than accumulating into a StringBuilder or BufferedWriter and printing once.

**Stack, Heap & Pass-by-Value**

- **Is Java pass-by-value or pass-by-reference?** Always pass-by-value. For objects the value copied is the reference, which is why mutation of the object is visible but reassignment of the parameter is not.
- **Why doesn't `void swap(int a, int b)` work in Java?** a and b are copies of the caller's values; swapping the copies has no effect. You must mutate a shared container/object or return the values.
- **What's stored on the stack vs the heap?** Stack: method frames, local primitives and object references (per thread). Heap: all objects and their instance fields (shared, GC-managed).
- **Why does passing a StringBuilder and appending work, but assigning a new one inside the method not work?** append() mutates the shared object through the copied reference. Assigning a new object only changes the local copy of the reference.
- **Where do string literals live since Java 7?** On the heap, in the string pool. (Before Java 7 they were in PermGen.)
- **Does `final` on a method parameter prevent modifying the object?** No — it only prevents reassigning the parameter. You can still mutate the object's state.

**Packages, Access Modifiers & the static Keyword**

- **What does static mean on a field?** One copy belonging to the class, shared by all instances, initialised when the class is loaded — not per-object.
- **Can a static method access instance variables or use this?** No. Static context has no instance; referring to instance members or this/super is a compile error.
- **Can static methods be overridden?** No — they're hidden. Redeclaring a static method in a subclass resolves by the reference type at compile time, not by the runtime object.
- **Order of execution for static block, instance block, constructor?** Static block first (once, at class load), then per object: instance initialiser block, then constructor body.
- **Can you overload static methods? Can main be overloaded?** Yes to both — overloading depends on the parameter list, not staticness. Only public static void main(String[]) is the entry point.
- **What's the difference between protected and package-private?** protected = package access PLUS subclasses in other packages. Package-private (no modifier) = same package only, no subclass exception.
- **Why is main() static?** So the JVM can invoke it without instantiating the class — no object exists yet at startup.
- **Does `import java.util.*;` cost memory or load all classes?** No. Imports are compile-time name resolution only; the JVM loads classes lazily on first use.

**Varargs, Enums & Command-Line Args**

- **Rules for varargs parameters?** Only one per method, must be the last parameter, internally it's an array, and it accepts zero arguments.
- **Can an enum have a constructor and methods?** Yes — an enum is a class. Constructors are implicitly private, and constants can even override methods individually (constant-specific class bodies).
- **Is == safe for comparing enums?** Yes — each constant is a single instance, so == is both correct and null-safe (unlike equals).
- **What do values() and valueOf() do?** Compiler-generated: values() returns all constants as an array; valueOf(String) returns the constant with that exact name or throws IllegalArgumentException.
- **Why is using ordinal() in a database a bad idea?** ordinal() is the declaration position; reordering or inserting a constant silently changes the persisted meaning. Store the name or an explicit code.
- **Can an enum implement an interface?** Yes, but it can't extend a class (enums implicitly extend java.lang.Enum, and Java is single-inheritance).

### Day 2 — OOP, Collections, Exceptions & Generics

**The 4 Pillars of OOP (with real examples)**

- **Name the 4 pillars of OOP with a one-line example each.** Encapsulation (private balance + deposit()), Inheritance (SavingsAccount extends BankAccount), Polymorphism (PaymentService p = new CreditCardPayment()), Abstraction (interface PaymentService).
- **Why prefer composition over inheritance?** Inheritance couples the subclass to the superclass's implementation and breaks encapsulation. Composition (has-a) lets you swap behaviour at runtime and keeps classes independent.
- **What's the difference between association, aggregation and composition?** Association is a loose 'uses-a'. Aggregation is a weak 'has-a' where parts outlive the whole (Car–Wheel). Composition is a strong 'has-a' where parts die with the whole (House–Room).
- **Does Java support multiple inheritance?** Not for classes (one extends only). But a class can implement multiple interfaces, which gives multiple inheritance of TYPE — and since Java 8, of behaviour too via default methods.
- **Compile-time vs runtime polymorphism?** Compile-time = method overloading (decided by the compiler from the argument types). Runtime = method overriding (decided by the JVM from the actual object type).
- **What problem does encapsulation actually solve?** It protects invariants — validation lives in one place (setters/methods), internals can change without breaking callers, and fields can be made read-only.

**Constructors, this & super**

- **Why can't this() and super() appear in the same constructor?** Both are required to be the very first statement, so they're mutually exclusive.
- **Does the compiler always add a default constructor?** Only if you declare NO constructors at all. Write any constructor and the no-arg one disappears until you add it back.
- **Are constructors inherited or overridable?** Neither. Constructors aren't members in that sense — a subclass must define its own and chain to a parent one with super().
- **What is constructor chaining?** Each constructor delegates up the hierarchy (super) or across (this), guaranteeing Object → parent → child initialisation order.
- **Are fields polymorphic like methods?** No. Field access is resolved at compile time by the *reference* type; only instance method calls use dynamic dispatch.
- **How do you prevent a class from being instantiated?** Make the constructor private (optionally throwing AssertionError) — used for utility classes and singletons.
- **Why do JPA entities and Jackson DTOs need a no-arg constructor?** Frameworks instantiate the object reflectively before populating fields, so they need a no-argument constructor (it can be protected/private for JPA).

**Overloading vs Overriding & Dynamic Dispatch**

- **Overloading vs overriding in one sentence each?** Overloading: same name, different parameters, resolved at compile time. Overriding: same signature in a subclass, resolved at runtime.
- **Can you override a private method?** No. Private methods aren't inherited, so a same-signature method in the subclass is a brand-new method, not an override.
- **Can you override a static method?** No — a static method with the same signature hides the parent's. The call is resolved by the declared type at compile time, not dynamically.
- **Can you change the return type when overriding?** Yes, if it's a covariant (subtype) return — parent returns Number, child may return Integer. Primitives must match exactly.
- **Can an overriding method throw a broader checked exception?** No. It may throw the same, a narrower checked exception, none, or any unchecked exception.
- **Can an overriding method reduce visibility?** No. Public must stay public; protected can become public; you can never go more restrictive.
- **Which is chosen for `Object o = "hi"; f(o);` with f(Object) and f(String)?** f(Object) — overloading is resolved from the declared (static) type of the argument, not the runtime type.
- **What does @Override actually do?** It's a compile-time marker annotation: the compiler errors if the method doesn't actually override anything — catching typos and signature drift.

**Abstract Class vs Interface**

- **When would you choose an abstract class over an interface?** When you need shared instance state, a constructor, or a common skeleton of concrete methods for closely related classes (template method pattern).
- **Can an interface have a constructor?** No — interfaces have no instance state and can't be instantiated; only classes have constructors.
- **What is a default method and why was it introduced?** A method with a body in an interface (Java 8). It lets interfaces evolve (e.g. Stream added to Collection) without breaking every existing implementation.
- **How do you resolve a default-method conflict from two interfaces?** Override the method in the class and call the one you want explicitly: `A.super.method()`.
- **What is a functional interface?** An interface with exactly one abstract method — the target type for lambdas. Annotate with @FunctionalInterface so the compiler enforces it.
- **Name the four core java.util.function interfaces.** Predicate<T> (T→boolean), Function<T,R> (T→R), Consumer<T> (T→void), Supplier<T> (()→T).
- **What is a marker interface? Give two examples.** An interface with no methods used to tag a class: Serializable, Cloneable, Remote. Annotations have largely replaced them.
- **Are interface methods public by default? Fields?** Methods are implicitly public (abstract/default/private variants aside). Fields are implicitly public static final — constants only.
- **Can an interface extend multiple interfaces?** Yes — unlike classes, an interface can extend several interfaces.

**Object Methods & the equals/hashCode Contract**

- **State the equals/hashCode contract.** If a.equals(b) then a.hashCode() == b.hashCode(). The converse isn't required (collisions are legal). Equal hashCodes don't imply equality.
- **What breaks if you override equals but not hashCode?** Hash-based collections (HashMap, HashSet) put equal objects in different buckets, so contains/get/remove return false even though the object is present.
- **List the 5 properties equals() must satisfy.** Reflexive (x.equals(x)), symmetric (x.equals(y) ⇒ y.equals(x)), transitive, consistent across calls, and x.equals(null) is false.
- **Why use instanceof instead of getClass() in equals()?** getClass() breaks equality for subclasses and proxies (Hibernate/Spring use proxies); instanceof allows subtype equality. Either is acceptable if you're consistent, but instanceof is the common convention.
- **Shallow copy vs deep copy?** Shallow duplicates the top-level object but shares nested references; deep recursively copies all referenced objects.
- **Why is clone() considered broken?** Cloneable is a marker interface with no clone() method, clone() is protected, it bypasses constructors, and it does a shallow copy by default. Prefer copy constructors or factory methods.
- **Is finalize() recommended?** No — deprecated since Java 9. It's unpredictable and slows GC. Use try-with-resources and AutoCloseable.
- **Which Object methods are final?** getClass(), notify(), notifyAll(), wait() — they can't be overridden.

**Exception Handling**

- **Difference between checked and unchecked exceptions?** Checked (IOException, SQLException) are verified at compile time — catch or declare. Unchecked (RuntimeException and subclasses) aren't; they usually signal a programming error.
- **What is the difference between Error and Exception?** Error is a serious JVM-level failure (OutOfMemoryError, StackOverflowError) you should not catch. Exception represents recoverable conditions an application can handle.
- **Does finally always execute?** Yes, except when System.exit() is called, the JVM crashes, the thread is killed, or a daemon thread's finally when the JVM exits.
- **What happens if both try and finally have a return?** The finally block's return wins and the try's return is discarded (and any exception in try is swallowed). Never return from finally.
- **throw vs throws?** throw is the statement that actually throws an exception object; throws is the method declaration listing which checked exceptions may propagate.
- **What is try-with-resources and what's the requirement?** A try that auto-closes resources declared in parentheses; they must implement AutoCloseable. Closed in reverse order, even if the body throws.
- **What is a suppressed exception?** When the try body and close() both throw, the close() exception is attached to the primary one via addSuppressed() instead of replacing it.
- **Can you catch multiple exception types in one block?** Yes (Java 7): `catch (IOException | SQLException e)`. The parameter is implicitly final, and the types can't be related by subclassing.
- **Is NumberFormatException checked or unchecked?** Unchecked — it extends IllegalArgumentException, which extends RuntimeException.
- **Why is catching Exception or Throwable bad practice?** It swallows errors you can't handle (like OutOfMemoryError) and hides bugs. Catch the most specific type you can actually recover from.

**Collections Framework: List & Set**

- **ArrayList vs LinkedList — when do you use each?** ArrayList (dynamic array): O(1) random access, O(n) insert/delete in the middle — the default. LinkedList (doubly-linked): O(1) insert/delete at the ends, O(n) access — good as a deque/queue.
- **Does Map extend Collection?** No. Map has its own hierarchy and is not a Collection. (You bridge them with keySet(), values(), entrySet().)
- **HashSet vs LinkedHashSet vs TreeSet?** HashSet: fastest, no order. LinkedHashSet: insertion order. TreeSet: sorted order, O(log n), supports range queries.
- **How does HashSet detect a duplicate?** It uses hashCode() to pick the bucket, then equals() to check whether an equal element already exists in that bucket.
- **What is the default capacity and growth factor of ArrayList?** Default capacity 10; when full it grows by ~1.5x (oldCapacity + oldCapacity >> 1) and copies the array.
- **Vector vs ArrayList?** Vector is legacy and synchronizes every method (slower, grows 2x). ArrayList is not synchronized — use Collections.synchronizedList or CopyOnWriteArrayList if you need thread safety.
- **How do you make a list immutable?** List.of(...) (Java 9) or Collections.unmodifiableList(...) / List.copyOf(...) for a defensive snapshot.
- **Why does remove() behave oddly on a List<Integer>?** Overload ambiguity: remove(int) removes by index, remove(Object) removes by value. `list.remove(1)` removes index 1; you need `list.remove(Integer.valueOf(1))` to remove the value 1.
- **What's the difference between Collection and Collections?** Collection is the root interface of the framework; Collections is a utility class with static helpers (sort, max, reverse, synchronizedList, unmodifiableList).

**Map & HashMap Internals**

- **Explain HashMap's put() internals.** hash(key) → bucket index = hash & (n-1) → scan the bucket: if an equal key exists (same hash && equals) replace the value, else append a node. Treeify at >8 entries, resize (2x) past 0.75 load.
- **How does HashMap handle collisions?** Separate chaining (linked list per bucket) since always; since Java 8 a bucket with >8 nodes and table ≥64 becomes a red-black tree, degrading back to a list below 6.
- **Default capacity and load factor of HashMap?** Capacity 16, load factor 0.75 → resizes (doubles + rehashes) once the 13th entry is added.
- **Why must HashMap keys be immutable?** The bucket is computed from the key's hash at insertion. Mutating the key changes its hash, so get/remove look in the wrong bucket and the entry is orphaned (a leak).
- **HashMap vs Hashtable?** HashMap: unsynchronized, allows one null key and null values, modern. Hashtable: legacy, every method synchronized (slow), no nulls allowed.
- **HashMap vs ConcurrentHashMap?** CHM is thread-safe with per-bin locking/CAS, doesn't allow nulls, and its iterators are weakly consistent (never throw ConcurrentModificationException). HashMap isn't thread-safe.
- **How do you safely remove from a map while iterating?** Use iterator.remove(), or entrySet().removeIf(...) — never map.remove() inside an enhanced for loop (ConcurrentModificationException).
- **How do you implement an LRU cache in Java?** Extend LinkedHashMap in access-order mode (constructor flag true) and override removeEldestEntry to evict past a max size. Or use Caffeine/Guava in production.
- **Time complexity of HashMap get/put?** O(1) average, O(log n) worst case since Java 8 (treeified buckets); a badly-distributed hashCode degrades everything to one bucket.
- **What does computeIfAbsent do?** If the key is absent (or maps to null), computes the value from the function, inserts it and returns it — atomic on ConcurrentHashMap. Perfect for building Map<K, List<V>> groupings.

**Iterators, Comparable vs Comparator**

- **Comparable vs Comparator?** Comparable is internal natural ordering (compareTo, one per class). Comparator is an external comparison strategy (compare), allowing many orderings without touching the class.
- **Fail-fast vs fail-safe iterators?** Fail-fast (ArrayList, HashMap) throw ConcurrentModificationException on concurrent structural modification. Fail-safe (ConcurrentHashMap, CopyOnWriteArrayList) iterate a snapshot without throwing.
- **How do you remove elements while iterating a list?** Use iterator.remove(), or the Java 8 removeIf(). Modifying the list directly inside a for-each throws ConcurrentModificationException.
- **What should compare() return?** A negative int if a < b, 0 if equal, positive if a > b — per the agreed ordering.
- **Why is `a - b` a bad comparator for ints?** Integer overflow: for extreme values the subtraction wraps around and returns the wrong sign. Use Integer.compare(a, b).
- **What does ListIterator add over Iterator?** Bidirectional traversal (hasPrevious/previous), plus add() and set() during iteration, and nextIndex/previousIndex.
- **Should compareTo be consistent with equals?** Yes, ideally: compareTo returning 0 should mean equals returns true. Otherwise TreeSet may treat distinct objects as the same element.

**Generics & Wildcards**

- **What is type erasure?** The compiler strips generic type information from bytecode: List<String> becomes List at runtime. It enables backwards compatibility but blocks things like `new T()`, generic arrays and `instanceof List<String>`.
- **What does PECS stand for and mean?** Producer extends, Consumer super. Use `? extends T` when the structure only produces (you read) T, and `? super T` when it only consumes (you write) T.
- **Can you add to a `List<? extends Number>`?** No (except null) — the compiler can't know whether the actual list is List<Integer> or List<Double>, so adding could corrupt it.
- **Can you add to a `List<? super Integer>`?** Yes — any supertype of Integer can hold an Integer. But reading only gives you Object.
- **What is a raw type and why avoid it?** A generic type used without type arguments (List instead of List<T>). It exists for pre-Java-5 compatibility, disables type checking and can cause heap pollution.
- **What is a bounded type parameter?** A type parameter with a constraint: `<T extends Comparable<T>>` (upper bound). Multiple bounds use & with the class first: `<T extends Number & Comparable<T>>`.
- **Can you use primitives as type arguments?** No — generics require reference types. List<int> is illegal; use List<Integer> and rely on autoboxing.
- **Are generic methods possible with static?** Yes: `static <T> void m(T t)`. The type parameter is declared on the method, so it's independent of the class's type parameters.

### Day 3 — Modern Java: Streams, Concurrency, JDBC & Patterns

**Lambdas & Method References**

- **What is a lambda expression in Java?** A concise way to provide an implementation of a functional interface — essentially an anonymous function passed as data.
- **What must be true about the target type of a lambda?** It must be a functional interface: exactly one abstract method (default/static methods don't count).
- **What does 'effectively final' mean?** A local variable that isn't declared final but is never reassigned after initialisation — lambdas and anonymous classes may capture those (and only those).
- **Why must captured variables be effectively final?** The lambda may outlive the stack frame, so Java copies the value. If it could change, the copy would silently diverge from the original.
- **What does `this` refer to inside a lambda?** The enclosing class instance — lambdas don't introduce a new scope. (Anonymous inner classes have their own `this`.)
- **Name the four types of method reference.** ClassName::staticMethod, object::instanceMethod, ClassName::instanceMethod, ClassName::new.
- **Can a lambda declare a checked exception?** Only if the functional interface's method declares it (e.g. Callable.call throws Exception). Otherwise you must handle it inside the body.

**Streams API**

- **Is a stream a data structure?** No — it's a view/pipeline over a source (collection, array, generator). It doesn't store elements and never modifies the source.
- **What's the difference between intermediate and terminal operations?** Intermediate (filter, map, sorted) are lazy and return a new Stream. Terminal (collect, forEach, count, reduce) are eager and trigger the whole pipeline.
- **What happens if you use a stream twice?** IllegalStateException: stream has already been operated upon or closed. Create a new stream from the source instead.
- **map vs flatMap?** map is 1→1 (each element becomes one element). flatMap is 1→many and flattens the resulting streams into one (List<List<T>> → Stream<T>).
- **How do you avoid the duplicate-key crash in Collectors.toMap?** Pass a merge function as the third argument: `toMap(keyFn, valueFn, (a, b) -> a)`.
- **groupingBy vs partitioningBy?** groupingBy groups by any key function (n groups). partitioningBy splits by a predicate into exactly two groups keyed true/false.
- **When would you use parallelStream()?** For large, CPU-bound, stateless work where order doesn't matter. Avoid for small data, I/O, side effects or shared state — the ForkJoinPool overhead usually outweighs the gain.
- **Why use IntStream instead of Stream<Integer>?** Avoids boxing/unboxing overhead and provides sum/average/min/max/summaryStatistics directly.
- **Give the alphabetic order of a typical pipeline.** source → filter → map → sorted → distinct → limit → collect.
- **What does peek() do and when is it appropriate?** Performs an action on each element as they flow through — intended for debugging/logging (e.g. proving laziness). Using it for real side effects is discouraged.

**Optional & the Date/Time API**

- **What problem does Optional solve?** It makes absence explicit in the type system, forcing callers to handle the empty case instead of hitting NullPointerException.
- **orElse vs orElseGet?** orElse takes a value that is ALWAYS evaluated; orElseGet takes a Supplier evaluated only when the Optional is empty. Use orElseGet for expensive defaults.
- **Optional.of vs Optional.ofNullable?** of(null) throws NullPointerException; ofNullable(null) returns Optional.empty(). Use ofNullable when the value may be null.
- **Should Optional be used as a field or method parameter?** No — it's designed as a return type. As a field it's not Serializable and adds overhead; as a parameter it forces callers to wrap values.
- **Why is java.time better than java.util.Date?** java.time is immutable and thread-safe, has a clear API (LocalDate/LocalDateTime/Instant/ZonedDateTime), real month numbers, and a thread-safe DateTimeFormatter.
- **LocalDate vs Instant?** LocalDate is a calendar date with no time or zone (a birthday). Instant is a machine timestamp on the UTC timeline (audit fields, DB timestamps).
- **Is SimpleDateFormat thread-safe?** No — sharing a static instance across threads corrupts results. DateTimeFormatter in java.time IS immutable and thread-safe.
- **Period vs Duration?** Period measures calendar time (years, months, days). Duration measures exact machine time (seconds, nanos).

**Modern Java: 9 → 17 Features**

- **What is a record and when do you use it?** A transparent, immutable data carrier (Java 16): `record Point(int x, int y)`. The compiler generates a canonical constructor, accessors, equals, hashCode and toString. Use it for DTOs, API models and Map keys.
- **What is a sealed class/interface?** Java 17: `sealed interface Shape permits Circle, Square` restricts which types may implement it. Permitted subclasses must be final, sealed or non-sealed — enabling exhaustiveness checks.
- **Where can you use var?** Only for local variables with an initialiser (and lambda parameters since Java 11). Not fields, method parameters, return types, or with null.
- **What does `instanceof String s` do?** Pattern matching (Java 16): tests the type and, if it matches, declares and assigns the variable in one step, scoping it to where the match is guaranteed.
- **What is a text block?** A multi-line string literal delimited by triple quotes (Java 15) that preserves formatting and strips incidental indentation — ideal for SQL, JSON and HTML.
- **Which Java versions are LTS?** 8, 11, 17 and 21. Most enterprises run 11 or 17.
- **What replaced HttpURLConnection?** The java.net.http.HttpClient (Java 11) — supports HTTP/1.1, HTTP/2, synchronous and asynchronous calls, and WebSockets.
- **What is JShell?** The Java REPL (Java 9) for quickly experimenting with snippets: type `jshell` at the terminal.

**Threads: Creation, Lifecycle & Basics**

- **Thread vs Runnable — which should you use and why?** Implement Runnable. Java has single inheritance, so extending Thread wastes your one superclass, and Runnable separates the task from the thread running it (so it also works with executors).
- **What happens if you call run() instead of start()?** No new thread is created — run() executes synchronously on the current thread. Only start() creates a thread; calling start() twice throws IllegalThreadStateException.
- **sleep() vs wait()?** sleep is a Thread static method that pauses without releasing the lock. wait is an Object method that releases the monitor and must be called inside synchronized; it needs notify/notifyAll to resume.
- **Why must wait() be inside a synchronized block?** Because wait() releases the monitor the thread owns — if it doesn't own it, you get IllegalMonitorStateException. Reacquisition is also required on wake.
- **What is a daemon thread?** A background/service thread. The JVM terminates when only daemon threads remain — used for GC and background housekeeping.
- **What is a race condition?** When the result depends on the unpredictable interleaving of threads accessing shared mutable state — e.g. count++ (read-modify-write) losing updates.
- **Why should wait() be called in a loop?** Because of spurious wakeups (the JVM may wake a thread without notify) and because the condition may still be false when the lock is reacquired.
- **What is a deadlock?** Two or more threads each hold a lock the other needs, so all block forever. Prevent it with consistent lock ordering, timeouts (tryLock), or by avoiding nested locks.
- **notify vs notifyAll?** notify wakes one arbitrary waiting thread; notifyAll wakes all of them (they then compete for the lock). Prefer notifyAll unless exactly one waiter is guaranteed.

**Synchronization, volatile & Deadlock**

- **What does synchronized guarantee?** Mutual exclusion (only one thread in the block) and visibility/happens-before (changes are flushed to main memory and seen by the next thread to acquire the lock).
- **Is synchronized reentrant?** Yes — a thread that holds a monitor can re-enter any synchronized block on that same monitor, which prevents self-deadlock when synchronized methods call each other.
- **What does volatile guarantee?** Visibility (writes are immediately visible to other threads), ordering (no reordering across the volatile access), and atomicity of single reads/writes — but NOT compound operations.
- **Is `volatile int i; i++` thread-safe?** No. i++ is read-modify-write. Use AtomicInteger, synchronized, or LongAdder.
- **What lock does a static synchronized method use?** The Class object (Counter.class), not an instance — so it's independent of any instance-level synchronized method.
- **What are the four conditions for deadlock?** Mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one (usually circular wait via consistent ordering) to prevent deadlock.
- **Deadlock vs livelock vs starvation?** Deadlock: blocked forever holding locks. Livelock: threads keep responding to each other but make no progress. Starvation: a thread never gets resources.
- **synchronized vs ReentrantLock?** ReentrantLock adds tryLock with timeout, fairness policy, interruptible locking and multiple conditions — but you must unlock in a finally block. Prefer synchronized for simplicity unless you need those features.
- **How do you detect a deadlock in production?** Take a thread dump: `jstack <pid>` (it reports 'Found one Java-level deadlock'), or use JConsole/VisualVM/YourKit.
- **How does AtomicInteger work?** It uses CAS (compare-and-swap) CPU instructions in a loop — lock-free and generally faster than synchronized for simple counters.

**ExecutorService & Concurrent Collections**

- **Why use a thread pool instead of new Thread()?** Thread creation is expensive (~1MB stack each) and unbounded threads exhaust memory. A pool reuses a fixed set of workers, bounds concurrency and adds queueing, monitoring and rejection policies.
- **Runnable vs Callable?** Runnable.run() returns void and can't throw checked exceptions. Callable.call() returns a value and can throw — submit it to an ExecutorService to get a Future.
- **What is a Future?** A handle to an asynchronous computation: get() blocks for the result, cancel() attempts cancellation, isDone() polls. Exceptions surface as ExecutionException.
- **shutdown vs shutdownNow?** shutdown() stops accepting new tasks and lets queued/running ones finish. shutdownNow() attempts to interrupt running tasks and returns the pending queue.
- **What's wrong with Executors.newCachedThreadPool()?** It creates unbounded threads under bursty load — each with its own stack — which can OOM. Prefer a fixed pool backed by a bounded queue.
- **What is CallerRunsPolicy?** A ThreadPoolExecutor rejection policy where the submitting thread runs the rejected task itself — which applies backpressure and slows the producer down.
- **How do you size a thread pool?** CPU-bound: ≈ number of cores. I/O-bound: cores × (1 + wait/compute time). Measure and tune; the queue must stay bounded.
- **CountDownLatch vs CyclicBarrier?** CountDownLatch is a one-shot countdown (N events → waiting threads proceed). CyclicBarrier makes N threads wait for each other and is reusable.
- **What's a Semaphore used for?** Limiting concurrent access to a resource — acquire() takes a permit, release() gives it back. Think connection pools and rate limiting.
- **BlockingQueue vs ConcurrentLinkedQueue?** BlockingQueue blocks on put/take (perfect for producer–consumer, supports bounds). ConcurrentLinkedQueue is non-blocking and unbounded.

**File I/O & Serialization**

- **What is serialVersionUID and why declare it?** A version stamp for a Serializable class. If it changes (or is absent and the class structure changes), deserializing old data throws InvalidClassException.
- **What does transient do?** Marks a field to be skipped during serialization — used for passwords, derived data and non-serializable members.
- **Is a static field serialized?** No — static fields belong to the class, not the object. Neither are transient-marked fields.
- **Is the constructor called during deserialization?** No. The object is rebuilt from the byte stream without invoking any constructor.
- **java.io vs java.nio.file?** java.io is the legacy stream API; NIO.2 (java.nio.file.Files/Paths) is modern, supports symbolic links, file attributes, directory walking and better exceptions.
- **Why is Java serialization considered risky?** Deserializing untrusted data can execute attacker-controlled code via gadget chains. Prefer JSON and validate input; use serialization filters if you must.
- **How do you read a large file without loading it all into memory?** Stream it: Files.lines(path) or a BufferedReader inside try-with-resources.

**JDBC — Connecting Java to a Database**

- **What are the 7 JDBC steps?** Register the driver (automatic since JDBC 4), open a Connection, create a Statement/PreparedStatement, execute the query, process the ResultSet, close the resources, handle SQLException.
- **Statement vs PreparedStatement?** PreparedStatement is precompiled, allows parameter binding, prevents SQL injection, handles dates/LOBs cleanly, and is faster when executed repeatedly. Prefer it always.
- **How does PreparedStatement prevent SQL injection?** The SQL is compiled first with placeholders; user values are then sent as data and can never be parsed as SQL syntax.
- **executeQuery vs executeUpdate vs execute?** executeQuery → SELECT, returns a ResultSet. executeUpdate → INSERT/UPDATE/DELETE, returns the affected row count. execute → any statement, returns a boolean indicating whether a ResultSet was produced.
- **How do you manage a JDBC transaction?** setAutoCommit(false), do the work, commit() on success, rollback() in the catch block, and restore auto-commit in a finally.
- **What is connection pooling and why?** A pool (HikariCP) keeps physical DB connections open and reuses them, avoiding the ~10-50ms cost of establishing and authenticating each connection. Spring Boot uses HikariCP by default.
- **Are JDBC parameters 0-indexed or 1-indexed?** 1-indexed — ps.setString(1, value) refers to the first `?` placeholder.
- **Name the four ACID properties.** Atomicity (all-or-nothing), Consistency (invariants preserved), Isolation (transactions don't interfere), Durability (committed data survives crashes).
- **What are the transaction isolation levels?** READ_UNCOMMITTED (dirty reads), READ_COMMITTED (default for Postgres/Oracle), REPEATABLE_READ (MySQL default), SERIALIZABLE (fully isolated, slowest).
- **How do you get the generated key after an INSERT?** Prepare with Statement.RETURN_GENERATED_KEYS, then read ps.getGeneratedKeys().

**Design Patterns You Must Know**

- **What is the Singleton pattern and how do you implement it safely?** One instance per JVM: private constructor + a static accessor. The enum implementation is preferred (serialization- and reflection-safe); alternatives are the holder idiom and double-checked locking with volatile.
- **How can a Singleton be broken?** Reflection (setAccessible on the private constructor), serialization (a new instance on deserialize — fix with readResolve), and cloning (don't implement Cloneable). Multiple classloaders also create one per loader.
- **Why is volatile needed in double-checked locking?** Without it, another thread can see a partially constructed object due to instruction reordering (the reference published before the constructor finished). volatile establishes the happens-before needed.
- **When is the Builder pattern better than constructors?** With many optional parameters — it avoids telescoping constructors, keeps objects immutable, and lets you validate in build().
- **Factory vs Abstract Factory?** Factory creates one type of object based on input (NotificationFactory.of("email")). Abstract Factory is a factory of factories, producing families of related objects.
- **What is the Strategy pattern used for?** Encapsulating interchangeable algorithms behind an interface so you can swap behaviour at runtime — the basis of dependency injection.
- **Template Method vs Strategy?** Template Method uses inheritance: a fixed algorithm in an abstract class with abstract steps. Strategy uses composition: an injected interface. Strategy is usually preferred (more flexible, testable).
- **Which Spring feature is an example of the Proxy pattern?** @Transactional (and @Cacheable, @Async) — Spring wraps the bean in an AOP proxy that adds behaviour around the method call.
- **What is the DAO pattern?** Data Access Object — an interface + implementation that hides persistence details (SQL/JPA) from the service layer, so the business logic is decoupled from the database.

### Day 4 — Full Stack: Spring Boot, JPA, REST & SQL

**Spring Core: IoC, DI & Beans**

- **What is IoC (Inversion of Control)?** The principle that object creation and lifecycle management is handled by a framework/container rather than your own code — 'don't call us, we'll call you'.
- **What is Dependency Injection?** The implementation of IoC: dependencies are supplied to a class from the outside (constructor, setter or field) instead of being created inside it.
- **Why prefer constructor injection?** Dependencies can be final/immutable, they're explicit and mandatory, circular dependencies fail fast, and you can unit test with plain mocks — no Spring context or reflection needed.
- **What is a Spring bean?** Any object instantiated, assembled and managed by the Spring IoC container, defined via a stereotype annotation or an @Bean method.
- **List the bean scopes.** singleton (default, one per container), prototype (new per injection), and for web apps: request, session, application, websocket.
- **@Component vs @Service vs @Repository vs @Controller?** All are @Component specialisations. @Service marks business logic, @Repository marks data access and adds exception translation, @Controller/@RestController handle web requests.
- **How do you resolve two beans of the same type?** Use @Qualifier("beanName") at the injection point, or mark one @Primary.
- **@PostConstruct vs @PreDestroy?** @PostConstruct runs after dependency injection completes (init); @PreDestroy runs just before the bean is removed/container shuts down (cleanup).
- **What is ApplicationContext?** The Spring IoC container interface: it holds bean definitions, manages their lifecycle, wires dependencies and provides features like events, i18n and resource loading.
- **Is a singleton bean thread-safe?** Spring only guarantees one instance — it does NOT make it thread-safe. Keep singleton beans stateless (no mutable instance fields), or use synchronization/atomics.

**Spring Boot: Auto-configuration, Starters & Config**

- **Spring vs Spring Boot?** Boot adds auto-configuration, starter dependencies, an embedded server, externalised config and Actuator — so you write far less boilerplate and run with `java -jar`.
- **What is auto-configuration?** Boot inspects the classpath and existing beans, then applies @Conditional configuration (e.g. @ConditionalOnClass, @ConditionalOnMissingBean) to set up sensible defaults.
- **How do you override an auto-configured bean?** Just define your own bean — auto-configuration classes use @ConditionalOnMissingBean and back off automatically.
- **What is a Spring Boot starter?** A curated Maven/Gradle dependency bundle that brings in all the libraries needed for a feature with compatible versions (e.g. spring-boot-starter-web, -data-jpa, -security, -test).
- **@Value vs @ConfigurationProperties?** @Value injects one property (good for single values). @ConfigurationProperties binds a whole typed, validated group — better for related settings and supports records.
- **How do you separate dev and prod config?** Profiles: @Profile on beans, spring.profiles.active in config or as a runtime arg, plus profile-specific files (application-dev.yml) or --- documents in one YAML file.
- **What is Spring Boot Actuator?** Production monitoring endpoints: /actuator/health, /info, /metrics, /loggers, /env, /beans, /conditions — usually secured and partially exposed.
- **What does @SpringBootApplication combine?** @Configuration + @EnableAutoConfiguration + @ComponentScan.
- **Why keep the main class at the root package?** @ComponentScan scans the package of the main class and everything below it — a class outside that tree simply won't be picked up (a very common 'bean not found' bug).
- **What does spring.jpa.hibernate.ddl-auto=update do?** Hibernate updates the schema to match entities on startup. Fine for dev; in production prefer `validate` or `none` and manage migrations with Flyway/Liquibase.

**Spring MVC & REST Controllers**

- **What is DispatcherServlet?** Spring MVC's front controller: it receives every HTTP request and routes it to the right handler via HandlerMapping, then renders/converts the result.
- **@Controller vs @RestController?** @RestController = @Controller + @ResponseBody. It serializes return values to JSON instead of resolving a view name.
- **@PathVariable vs @RequestParam vs @RequestBody?** @PathVariable from the URL path (/users/{id}); @RequestParam from the query string (?page=0); @RequestBody from the JSON body, deserialized into an object.
- **Why use DTOs instead of returning JPA entities?** They protect internal/sensitive fields, decouple the API from the DB schema, let you shape data per endpoint, and avoid infinite JSON recursion from bidirectional relationships.
- **How do you validate a request body?** Annotate the DTO fields with Jakarta validation (@NotNull, @NotBlank, @Email, @Size) and mark the parameter @Valid; handle MethodArgumentNotValidException in a @ControllerAdvice.
- **What status code for a successful POST?** 201 Created, ideally with a Location header pointing at the new resource (ResponseEntity.created(uri).body(dto)).
- **What does @ControllerAdvice do?** It's a global, cross-cutting handler: @ExceptionHandler methods in it apply to all controllers, centralising error-to-HTTP-response mapping.
- **Filter vs Interceptor?** Filters are servlet-level and run before DispatcherServlet (used by Spring Security). Interceptors are Spring MVC-level and run around the handler, with access to the handler/model.
- **What makes a REST API 'RESTful'?** Statelessness, resource-based URLs (nouns, not verbs), correct HTTP verbs, proper status codes, HATEOAS (optional) and a uniform interface — commonly JSON over HTTP.
- **What is the difference between PUT and PATCH?** PUT replaces the whole resource; PATCH applies a partial update.

**JPA & Hibernate**

- **JPA vs Hibernate vs Spring Data JPA?** JPA is the specification (interfaces and annotations). Hibernate is the implementation. Spring Data JPA is a layer on top that generates repository implementations from interfaces.
- **What are the entity lifecycle states?** Transient/New (not persisted), Managed/Persistent (attached to a session), Detached (session closed), Removed (scheduled for deletion).
- **Lazy vs Eager fetching — what are the defaults?** @OneToMany and @ManyToMany default to LAZY; @ManyToOne and @OneToOne default to EAGER. Always declare fetch explicitly, and prefer LAZY.
- **What is the N+1 problem and how do you fix it?** One query for the parents plus one per child collection. Fix with JOIN FETCH, @EntityGraph, @BatchSize, or a DTO projection.
- **What is LazyInitializationException?** Accessing a lazy association after the session/transaction closed. Fix by fetching inside the transaction, using a DTO projection, or widening @Transactional — not by enabling open-in-view.
- **Where should @Transactional go?** On the service layer (the unit of work), not on controllers or repositories. Use readOnly = true for queries. It won't apply to private or self-invoked methods because it's proxy-based.
- **What is dirty checking?** Hibernate snapshots managed entities and automatically issues UPDATEs at flush time for any that changed — you don't need to call save() on a managed entity.
- **GenerationType.IDENTITY vs SEQUENCE?** IDENTITY uses DB auto-increment (blocks JDBC batching). SEQUENCE uses a DB sequence and allows batching — generally preferred for performance with Hibernate.
- **First-level vs second-level cache?** First-level is the persistence context (per transaction, always enabled). Second-level is shared across sessions and needs a provider like Ehcache/Caffeine plus @Cacheable.
- **Why @Enumerated(EnumType.STRING)?** It stores the enum NAME instead of the ordinal. Ordinals break silently when you reorder or insert enum constants.
- **What does mappedBy mean?** It marks the inverse (non-owning) side of a bidirectional relationship and names the field on the owning side that holds the foreign key.
- **orphanRemoval vs cascade = REMOVE?** cascade REMOVE deletes children when the parent is deleted. orphanRemoval also deletes a child when it's removed from the parent's collection.

**SQL Essentials for Interviews**

- **WHERE vs HAVING?** WHERE filters individual rows before grouping (can't use aggregates). HAVING filters groups after GROUP BY (can use COUNT/SUM/AVG).
- **What's the SQL query execution order?** FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. (Which is why a SELECT alias works in ORDER BY but not WHERE.)
- **INNER vs LEFT JOIN?** INNER returns only matching rows from both tables. LEFT returns every row from the left table, with NULLs where there's no match.
- **How do you find rows with no match in another table?** LEFT JOIN and then `WHERE right_table.id IS NULL`.
- **UNION vs UNION ALL?** UNION removes duplicates (extra sort/dedupe cost); UNION ALL keeps everything and is faster.
- **What is the Nth-highest-salary pattern?** SELECT DISTINCT salary ORDER BY salary DESC LIMIT 1 OFFSET N-1, or a subquery with MAX(salary) < (SELECT MAX(...)), or DENSE_RANK() over the ordered salaries.
- **How do indexes work and what's the trade-off?** An index (usually a B-tree) lets the DB find rows without a full scan: much faster reads, but every INSERT/UPDATE/DELETE must also maintain it, and it costs storage.
- **What is the leftmost-prefix rule?** A composite index on (a, b) can serve queries filtering on a, or a+b, but not b alone — the leading column must be used.
- **Why is `WHERE YEAR(date) = 2024` slow?** Applying a function to an indexed column prevents index usage; the DB must evaluate it per row. Use a range comparison instead.
- **EXISTS vs IN?** EXISTS stops scanning at the first match and is generally better for large subqueries; IN materialises the full result set first.
- **What are the normal forms?** 1NF: atomic column values, no repeating groups. 2NF: 1NF + no partial dependency on part of a composite key. 3NF: 2NF + no transitive dependency on non-key columns.
- **What is a deadlock in a database?** Two transactions each hold a lock the other needs. The DB detects it and rolls one back (that's the deadlock error you see in logs) — prevent it with consistent lock ordering and short transactions.

**Maven, Build & Project Structure**

- **What are Maven's GAV coordinates?** groupId (organisation, reverse domain), artifactId (project name), version (SNAPSHOT = in-development).
- **List the Maven lifecycle phases.** validate, compile, test, package, verify, install, deploy. Running a later phase executes all the earlier ones.
- **What does `mvn package` do vs `mvn install`?** package builds the artifact into target/. install does that AND installs it into the local ~/.m2 repository so other projects can depend on it.
- **What is a Maven dependency scope?** compile (default, everywhere), provided (JDK/container provides it at runtime), runtime, test (test classpath only), system, import (BOM imports).
- **What is a BOM / dependency management?** A 'bill of materials' POM that pins compatible versions of many libraries, so you declare dependencies without versions and never hit conflicts.
- **What is a fat/uber JAR?** An executable JAR containing your classes plus all dependencies and an embedded server — built by spring-boot-maven-plugin, runnable with java -jar.
- **Maven vs Gradle?** Maven uses declarative XML with a fixed lifecycle. Gradle uses a Groovy/Kotlin DSL, is generally faster with incremental builds and caching, and is the default for Android. Same core concepts.
- **What does @RequiredArgsConstructor do and why is it popular in Spring?** Lombok generates a constructor for all final/@NonNull fields — which is exactly what constructor-based dependency injection needs, with zero boilerplate.

**Spring Security & JWT**

- **Authentication vs authorization?** Authentication verifies identity (who are you? → 401 if it fails). Authorization verifies permissions (what can you do? → 403 if it fails).
- **What is a JWT and what's in it?** A stateless, signed token: header (algorithm), payload (claims like subject, roles, expiry) and a signature. Base64-encoded — readable by anyone, so never put secrets in it.
- **Why is JWT called stateless?** The server stores no session; all the information is in the token itself, verified cryptographically on each request. That's what makes it scale horizontally.
- **How do you invalidate a JWT before it expires?** You can't easily — that's the main drawback. Use short expiry plus refresh tokens, or maintain a server-side denylist/token version in the DB.
- **Why BCrypt instead of SHA-256 for passwords?** BCrypt is deliberately slow and includes a per-password salt, defeating rainbow tables and GPU brute force. General-purpose hashes are fast, which is exactly wrong for passwords.
- **CSRF vs CORS?** CSRF tricks a browser into sending an authenticated request (mitigated by tokens/same-site cookies). CORS is a browser policy controlling which origins may read responses (configured on the server). They're unrelated problems.
- **401 vs 403?** 401 Unauthorized = not authenticated (no or bad credentials). 403 Forbidden = authenticated but lacking permission.
- **What is the Spring Security filter chain?** A chain of servlet filters each request passes through before the DispatcherServlet — handling auth, JWT validation, exception translation and authorization.

**Testing: JUnit 5 & Mockito**

- **@BeforeEach vs @BeforeAll?** @BeforeEach runs before every test method; @BeforeAll runs once before all tests in the class (and must be static unless the class is @TestInstance(PER_CLASS)).
- **@Mock vs @InjectMocks?** @Mock creates a mock of a dependency. @InjectMocks creates a real instance of the class under test and injects the mocks into it.
- **@WebMvcTest vs @DataJpaTest vs @SpringBootTest?** @WebMvcTest loads only the web layer (use @MockBean for services). @DataJpaTest loads JPA against an embedded DB. @SpringBootTest loads the whole context — slowest, used for integration tests.
- **@Mock vs @MockBean?** @Mock is a plain Mockito mock (unit tests). @MockBean is Spring Boot's — it adds or replaces a bean in the Spring context (used in slice tests).
- **What is MockMvc?** A Spring test utility that drives HTTP requests against your controllers without starting a real server, letting you assert status codes and JSON responses.
- **What does verify() do in Mockito?** It asserts that an interaction happened — e.g. verify(mock, times(1)).method(args), verify(..., never()), verifyNoMoreInteractions().
- **What is the test pyramid?** Many fast unit tests at the base, fewer integration tests in the middle, and few slow end-to-end/UI tests at the top.
- **What should you NOT mock?** The class under test, simple value objects/DTOs, and (in integration tests) the database — mocking your own DB hides real query bugs.

**Microservices & Architecture Overview**

- **Monolith vs microservices — the core trade-off?** Monoliths are simpler to build, test, debug and deploy. Microservices give independent scaling, deployment and team autonomy, but add network failures, distributed data problems and operational complexity.
- **What is an API Gateway?** A single entry point for clients that handles routing, authentication, rate limiting, CORS and request aggregation — so those concerns aren't duplicated in every service.
- **What is a circuit breaker?** A resilience pattern (Resilience4j) that stops calling a failing downstream service and returns a fallback, giving it time to recover and preventing cascading failures.
- **What is service discovery?** A registry (Eureka, Consul, Kubernetes DNS) where services register themselves and look each other up by name instead of hard-coded host:port.
- **What is the Saga pattern?** A way to manage data consistency across services without distributed transactions: each service commits locally and emits an event, with compensating transactions to roll back if a later step fails.
- **What is eventual consistency?** The system may be briefly inconsistent while updates propagate, but converges to a consistent state — the normal trade-off when each service owns its own database.
- **State the CAP theorem.** During a network partition, a distributed system must choose between Consistency (all nodes see the same data) and Availability (every request gets a response) — it can't guarantee both.
- **What is distributed tracing?** Propagating a trace ID across service calls so you can follow one request end to end (Sleuth/Micrometer + Zipkin or Jaeger).
- **What's the database-per-service rule?** Each microservice owns its data and no other service reads it directly — sharing a database creates a distributed monolith and couples deployments.

**Explaining Your Project (the round that decides it)**

- **Give the 6-part structure for explaining a project.** What it does → Who uses it → Tech stack → Your specific contribution → A challenge and how you solved it → What you'd improve.
- **What is the STAR method?** Situation, Task, Action, Result — a structure for answering behavioural questions with a concrete story and a measurable outcome.
- **How long should your initial project explanation be?** 30-60 seconds. Then let their questions drive the depth — rambling for five minutes loses the room.
- **What's the strongest thing you can include in a project answer?** A specific problem you diagnosed, the technique you used, and a measurable result ("N+1 query, fixed with JOIN FETCH, 3s → 180ms").
- **What should you never put on your resume?** Anything you can't discuss for two minutes. Every bullet is an invitation to ask about it.
- **What questions should you ask the interviewer?** About the stack and Java version, engineering practices (reviews, testing, deploys), what success looks like in six months, and current technical challenges.
- **How do you answer 'what's your weakness?'** Name a real, non-fatal weakness and show what you're doing about it — e.g. "I used to skip writing tests; now I write them alongside the service layer."
- **What should you do if you don't know an answer?** Say so honestly, then reason aloud: "I haven't used that directly, but here's how I'd approach it..." Interviewers rate the reasoning, not the guess.

### Rapid Fire — Rapid Fire: Traps, HR & Last-Minute Drill

**Output Prediction Traps (Part 1: Strings & Numbers)**

- **`String a="hi"; String b=new String("hi"); a==b`?** false — new String() creates a separate heap object instead of reusing the pooled literal.
- **`Integer a=127,b=127; a==b` and `Integer c=128,d=128; c==d`?** true then false — the Integer cache covers -128..127 only.
- **`"5"+2+3` vs `5+2+"3"`?** "523" and "73" — evaluation is left to right and the first String encountered converts the rest.
- **Does `null + "!"` throw NPE?** No — String concatenation converts null to the text "null". Calling a method on null throws NPE.
- **Do StringBuilder and StringBuffer override equals()?** No — their equals() is reference equality. Convert to String first to compare contents.

**Output Prediction Traps (Part 2: OOP & Exceptions)**

- **Are fields polymorphic in Java?** No. Only instance methods use dynamic dispatch. Field access is resolved by the declared (reference) type at compile time.
- **What is method hiding vs overriding?** Static methods are hidden (resolved by reference type at compile time); instance methods are overridden (resolved by object type at runtime).
- **Does a cast change which overridden method runs?** No — casting only changes the compile-time view. The JVM still dispatches to the actual object's method.
- **Full initialisation order for `new Child()` where Child extends Parent?** Parent static → Child static → Parent instance block → Parent constructor → Child instance block → Child constructor. Statics run only once per class load.
- **Why shouldn't a constructor call an overridable method?** The subclass's fields aren't initialised yet (super() runs first), so the overridden method sees default values — a classic source of NPEs.
- **What does `try { return 1; } finally { return 2; }` return?** 2. A return in finally overrides the try's return and swallows any exception — which is why it's an anti-pattern.

**One-Minute Answers (Verbal Rapid Fire)**

- **Give a 2-sentence answer for 'what is polymorphism?'** Polymorphism lets the same call take many forms: overloading is resolved at compile time from argument types, overriding at runtime from the actual object type. It's what lets me write `List l = new ArrayList<>()` and swap the implementation without changing callers.
- **Give a 2-sentence answer for 'what is dependency injection?'** DI means a class receives its dependencies from outside rather than creating them with `new`. I prefer constructor injection because it keeps fields final, makes dependencies explicit and enables unit testing with plain mocks.
- **Give a 2-sentence answer for 'how does HashMap work?'** It's an array of buckets indexed by hash(key) & (n-1); on a collision entries are chained, and since Java 8 buckets over 8 entries are treeified to keep the worst case at O(log n). It doubles and rehashes when size exceeds 0.75 × capacity.
- **Give a 2-sentence answer for 'what is the N+1 problem?'** One query fetches the parents and then one more fires per parent to lazily load each child collection. I fix it with JOIN FETCH or @EntityGraph so it becomes a single query.
- **Give a 2-sentence answer for 'checked vs unchecked exceptions?'** Checked exceptions are verified at compile time — I must catch or declare them — while unchecked RuntimeExceptions usually indicate a bug I should fix. Error types like OutOfMemoryError should never be caught.
- **How do you handle a question you don't know?** Say honestly that you haven't used it, then reason aloud from first principles about how you'd approach it. Interviewers score the reasoning far higher than a confident guess.
- **Why is pausing before you answer a good thing?** A two-second pause signals thoughtfulness instead of panic, and it stops you from rambling into an answer you can't defend.

**HR & Behavioural Questions**

- **What is the 'Present → Past → Future' structure?** The shape for 'tell me about yourself': who you are now, what you've done that's relevant, and what you're looking for next. 90 seconds maximum.
- **How do you answer 'what's your weakness?'** A real, non-fatal weakness plus concrete evidence you're fixing it. Avoid fake humility ('I work too hard') and anything central to the job.
- **What is STAR?** Situation, Task, Action, Result — the structure for every behavioural answer. Own the action with 'I' and put a number in the result.
- **How should you talk about a previous employer?** Neutrally or positively, always. Criticising a past manager or company is a major red flag regardless of whether you're right.
- **Should you ask questions at the end?** Yes, always — two of them, about the team's stack, engineering practices or current challenges. Never about salary in a technical round.
- **What's the biggest resume mistake?** Listing a technology you can't discuss for two minutes. Everything on the page is an invitation to ask about it.
- **How do you handle a salary question you're not ready for?** Deflect politely: 'I'd like to understand the role better first, but I'm open based on the full package' — and research the market range beforehand so you're never guessing.

**Final 24 Hours: What To Do & Skip**

- **What's the single best use of your last day?** Retrieval practice: re-run the quizzes and flashcards you got wrong, and say answers out loud. Reading new material makes you feel prepared without actually improving recall.
- **What should you NOT do on the last day?** Start a brand-new topic or framework. It won't stick, and it undermines confidence in what you already know.
- **What should you hand-write on paper?** One full REST controller, five stream pipelines, and your project pitch. Hand-writing exposes the gaps an IDE hides.
- **What do you say when you blank on syntax?** "I'd look up the exact method name, but the approach is..." — then describe the approach. Interviewers care about the reasoning, not the spelling.
- **Why is sleep actually part of the plan?** Memory consolidation happens during sleep. Cramming all night reliably produces worse recall than a rested brain.
- **What's the fastest credibility-builder in a technical round?** Admitting a gap honestly and then reasoning toward an answer. It shows both self-awareness and how you think under pressure.

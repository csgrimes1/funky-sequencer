## funky-sequencer  [![Build Status](https://travis-ci.org/csgrimes1/funky-sequencer.svg?branch=master)](https://travis-ci.org/csgrimes1/funky-sequencer)

An immutable generator library.

### Installation

```bash
npm install --save funky-sequencer
```

### REPL Fun

```javascript 1.6
$ node

> const funky = require('funky-sequencer');
undefined
> const iterable1 = funky
    .startingWith(1)
    .repeat(i => i + 1)
    .while(i => i < 10);
undefined
> Array.from(iterable1());
[ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
>
> const iterable2 = funky
    .startingWith(1)
    .repeat(i => i + 1)
    .while(i => i < 10)
    .resolve(i => 100 + i);
undefined
> Array.from(iterable2());
[ 101, 102, 103, 104, 105, 106, 107, 108, 109 ]
>
> const iterable3 = funky.when(true);
undefined
> Array.from(iterable3());
[ true ]
>
> const iterable4 = funky.when(false);
undefined
> Array.from(iterable4());
[]
> 
```

### Value Proposition

If you ever happen to dabble with a language such as `Erlang`, you'll notice
that the language does not support loops. You must rely on techniques such
as *tail recursion* to repeat a block of code.

There are many reasons why a functional language would lack support for
loops. First, loops encourage mutation of variables, whereas functional
programming favors immutability. Second, bugs like to lurk in the recesses
of loops and branches, where variables change and unit test branch coverage
misses these edge cases. Finally, functions may be used rather than
keywords such as `for` and `if` to control flow.

Regarding that last point, functional programmers would argue that a void
function is a missed opportunity. Keywords such as
`while` and `for` act like void function calls. These keywords are a
missed opportunity. Example:

```javascript
let ar = [];
for (let i=0; i<10; i++) {
    ar.push(i);
}
```

The `for` loop has no *output* value; therefore, you must mutate a variable
in the loop body. The equivalent code using *funky-sequencer*:

```javascript
const iterator = funky.startingWith(0)
    .repeat(i => i + 1)
    .while(i < 10);
const ar = Array.from(iterator());
```

The first expression of this last example returns an `Iterable` that 
gets consumed to create
the array. The second example is completely immutable because
of loop logic creating output.

A final benefit of the `Iterable` in ECMAScript is the ability to
consume it in a lazy manner. In other words, each member in the
sequence is generated only when a consumer needs it. You don't 
generate 100 elements when you only need to use 10.

### Methods

The module exports a fluent API as shown in the REPL
examples above.

* **_funky.startingWith_** is optional. When not called,
`repeat`'s callback is first called with `undefined`.
* _**funky.repeat**_ can be called from the module or
from the result of `startingWith`. Its parameter is a function
that maps the last value to the next value in the sequence.
* **_while_** is an optional function taking a predicate
function. When the predicate returns `false`, `repeat` will
not be called again, and the sequence will end. It creates
an infinite sequence when `while` is not used.
* _**resolve**_ is a mapping function called on each item
in the sequence.
* _**funky.when**_ implements an pattern resembling Scala's
Option. If the argument to `when` is truthy, the resulting sequence has
1 member. If the argument is falsy, the resulting sequence is empty.
This provides a means of providing boolean logic when processing
lists without using `if` or `switch`.

### Examples
* The `fibonacci` example demonstrates a pure algorithm, defining
an infinite sequence. The example uses `wave-collapse` to consume
and terminate the sequence.
* The `loop-decision` example demonstrates all of the methods
shown above, including when. It also uses `wave-collapse` to
perform combinatorics on the resulting sequences.
* The `doodles` example demonstrates repeating expensive, 
promise-based calls, consuming them with wave-collapse. It calls
the Google Doodles API to render the doodles information and
images over a date range.

### Patterns

The patterns discussed here are addressed in the *doodles*,
*loop-decision*, and *fibonacci* examples, respectively.

##### Expensive Calls

The `repeat` call, by nature, will take place `n + 1` times in a
finite sequence generating `n` elements. If you are generating
expensive output based on expensive queries, such as HTTP requests,
it's best to limit the number of such calls. 

Thankfully, `funky` offers a simple pattern to solve this problem.
The `repeat()` method can simply generate "control" data for the
loop, and the `resolve()` method can render expensive calls on
behalf of the control data. To illustrate, the `doodles` example
uses the `repeat()` method to generate a sequence of months. The
`while()` method is used to terminate the months when past the
requested date range. And finally, the `resolve()` method does the
work of making calls to the Google Doodles API.

This pattern is similar to a `for` loop, with `repeat()` doing the
work of the top of the loop, and `resolve()` doing the work of the
loop's body.

##### Boolean Control

The number of combinations between `n` sets is calculated with the
following formula:

```
s1 * s2 * ... * sN
```

`s1` to `sN` represent the number of elements in each set. If
any of the member counts is zero, then there are *no combinations*
of the sets. This fact can be useful when iterating over set
combinations.

Say you want to look at combinations only when
one or more conditions are true. The most ready solution is to use
one or more `if` statements. But instead of creating such code branches,
you can represent your conditions as iterables, and these
iterables can be passed to the combinator. When any such condition
is `false`, no combinations will be rendered. As a bonus, using
`funky.when()` does not introduce a branch in your code. (There is
a branch, but it's in this library, and it has full unit test
coverage!)

Please look at the `loop-decision` example to illustrate the use
of the `funky.when()` method for this purpose.

##### Pure Algorithms

I would argue that implementing an algorithm such as Fibonacci
with a terminating condition (`while` in this API) is a "leaky
abstraction". In other words, we have coupled the termination
logic to the sequencing logic. This coupling arbitrarily
restricts the ranges for which the sequence can be consumed.

To avoid this sort of coupling, simply implement sequencing
algorithms as infinite sequences. An API like `wave-collapse`
provides `skip` and `take`, allowing you to select a finite
number of elements from the underlying infinite sequence. By
doing so, the `repeat()` call defines a pure algorithm for
Fibonacci.

Of course, you must avoid infinite loops! The fibonacci example
defines the infinite sequence algorithm first, then it defines
consumers that walk only a finite part of the sequence.

## funky-sequencer

An immutable generator library. ![Disco](disco.gif)

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
* _**funky.when**_ is an implements an algorithm resembling Scala's
Option. If the argument to `when` is truthy, the resulting sequence has
1 member. If the argument is falsy, the resulting sequence is empty.
This provides a means of providing boolean logic when processing
lists without using `if` or `switch`.

### Examples
* The `loop-decision` example demonstrates all of the methods
shown above, including when. It also uses `wave-collapse` on
the resulting sequences.

### Remarks

I would argue that implementing an algorithm such as Fibonacci
with a terminating condition (`while` in this API) is a "leaky
abstraction". In other words, we have coupled the termination
logic to the sequencing logic. This coupling arbitrarily
restricts the ranges for which the sequence can be consumed.

To avoid this sort of coupling, simply implement sequencing
algorithms as infinite sequences. An API like `wave-collapse`
provides `skip` and `take`, allowing you to select a finite
number of elements from the underlying infinite sequence.

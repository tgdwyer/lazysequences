/*
    Exercise 1 - General Purpose infinite sequence function
 */

interface LazySequence<T> {
  value: T;
  next(): LazySequence<T>;
}

// Implement the function:
function initSequence<T>(
  transform: (value: T) => T
): (initialValue: T) => LazySequence<T> {
  return function _next(v: T): LazySequence<T> {
    return {
      value: v,
      next: () => _next(transform(v)),
    };
  };
}

/*
    Exercise 2 - map, filter, take, reduce
 */
function map<T, V>(func: (v: T) => V, seq: LazySequence<T>): LazySequence<V> {
  return {
    value: func(seq.value),
    next: () => map(func, seq.next()),
  };
}

function filter<T>(
  func: (v: T) => boolean,
  seq: LazySequence<T>
): LazySequence<T> {
  if (func(seq.value)) {
    return {
      value: seq.value,
      next: () => filter(func, seq.next()),
    };
  }
  return filter(func, seq.next());
}

/**
 * Creates a sequence of finite length (terminated by undefined) from a longer or infinite sequence.
 * Take returns a sequence that contains the specified number of elements of the sequence, and then 'undefined'.
 * That is, the next attribute of the last element in the returned sequence, will be a function that returns 'undefined'
 * @param n number of elements to return before returning undefined
 * @param seq the sequence
 */
function take<T>(n: number, seq: LazySequence<T>): LazySequence<T> | undefined {
  if (n) {
    return {
      value: seq.value,
      next: () => take(n - 1, seq.next()),
    } as LazySequence<T>;
  }
  return undefined;
}

/**
 * reduce a finite sequence to a value using the specified aggregation function
 * @param func aggregation function
 * @param seq either a sequence or undefined if we have reached the end of the sequence
 * @param start starting value of the reduction past as first parameter to first call of func
 */
function reduce<T, V>(
  func: (_: V, x: T) => V,
  seq: LazySequence<T> | undefined,
  start: V
): V {
  if (seq !== undefined) {
    return reduce(
      func,
      seq.next !== undefined ? seq.next() : undefined,
      func(start, seq.value)
    );
  }
  return start;
}

function reduceRight<T, V>(
  func: (_: V, x: T) => V,
  seq: LazySequence<T> | undefined,
  start: V
): V {
  if (seq !== undefined) {
    return func(reduceRight(func, seq.next(), start), seq.value);
  }
  return start;
}

function toArray<T>(seq: LazySequence<T> | undefined): T[] {
  return reduce((acc, el) => acc.concat([el]), seq, [] as T[]);
}

/*
    Exercise 3 - Reduce Practice
 */

function maxNumber(lazyList: LazySequence<number>): number {
  // ******** YOUR CODE HERE ********
  // Use __only__ reduce on the
  // lazyList passed in. The lazyList
  // will terminate so don't use `take`
  // inside this function body.
  return reduce((acc, num) => (acc > num ? acc : num), lazyList, -Infinity);
  // return reduce((acc, num) => Math.max(acc, num), lazyList, -Infinity);
  // return reduce(Math.max, lazyList, -Infinity);
}

function lengthOfSequence<T>(lazyList: LazySequence<T>): number {
  // ******** YOUR CODE HERE ********
  // Again only use reduce and don't
  // use `take` inside this function.
  return reduce((a, _) => a + 1, lazyList, 0);
  // return reduce((a, b) => a + b, map(() => 1, lazyList), 0)
}

/*
    Exercise 4 - Lazy Pi Approximations
 */

// This is a solution by map, take and reduce.
function piApproximation(seriesLength: number): number {
  function nextSeq(n: number) {
    return -1 * (n > 0 ? n + 2 : n - 2);
  }
  const seq1 = initSequence(nextSeq)(1);
  const seq2 = map((x) => 1 / x, seq1);
  const finiteSeq = take(seriesLength, seq2);
  return 4*reduce((a, b) => a + b, finiteSeq, 0);

  // here is the same thing, but without any intermediate variables:
  // return reduce((a,b)=>a+b,
  //   take(seriesLength,
  //        map(x=>1/x,
  //         initSequence((n:number) => -1 * (n > 0 ? n+2 : n-2))(1)))
  //        ,0);
}

const naturals = initSequence<number>(x=>x+1)(1)
const showTen = s => console.log(toArray(take(10,s)));
showTen(naturals)
showTen(map(x=>x+10,naturals))
showTen(filter(x=>Boolean(x%2),naturals)) // odds only
const last = s => reduce((_,e)=>e,s,null)
console.log(piApproximation(100))
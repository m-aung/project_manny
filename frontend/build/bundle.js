/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _css_tailwind_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14);
/* harmony import */ var _js_myDOM__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(24);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }





var routes = [{
  path: "/",
  title: 'Home',
  props: {},
  view: function view(props) {
    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Home)(props);
    });
  }
}, {
  path: "/videos",
  title: 'Videos',
  props: {},
  view: function view(props) {
    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Videos)(props);
    });
  }
}, {
  path: "/contact",
  title: 'Contact',
  props: {},
  view: function view(props) {
    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Contact)(props);
    });
  }
}, {
  path: "/about",
  title: 'About',
  props: {},
  view: function view(props) {
    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.About)(props);
    });
  }
}, {
  path: "/message/confirmation",
  title: 'Confirmation',
  props: {},
  view: function view(props) {
    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.MessageSent)(props);
    });
  }
}];

var navigateTo = function navigateTo(url) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  // const inputURL = new URL(url)
  // console.log(inputURL)
  history.pushState(null, null, url);
  router(props);
};

var router = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var properties,
        potentialMatches,
        match,
        _match$route,
        view,
        title,
        props,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            properties = _args.length > 0 && _args[0] !== undefined ? _args[0] : null;
            // Test each route for potential match
            potentialMatches = routes.map(function (route) {
              return {
                route: _objectSpread(_objectSpread({}, route), {}, {
                  'props': properties
                }),
                isMatch: location.pathname === route.path
              };
            });
            match = potentialMatches.find(function (potentialMatch) {
              return potentialMatch.isMatch;
            }); // error pathnames

            if (!match) {
              console.error("".concat(location.pathname, " not found"));
              match = {
                route: {
                  path: "/error",
                  title: '404 Not Found',
                  props: {},
                  view: function view(props) {
                    return (0,_components__WEBPACK_IMPORTED_MODULE_2__.Layout)(function () {
                      return (0,_components__WEBPACK_IMPORTED_MODULE_2__.ErrorMessage)({
                        code: '404',
                        message: "Page Not Found."
                      });
                    });
                  }
                },
                isMatch: true // [location.pathname]

              };
            }

            console.log('after match:', match);
            _match$route = match.route, view = _match$route.view, title = _match$route.title, props = _match$route.props;
            _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].setup(view, title, props, '#root');

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function router() {
    return _ref.apply(this, arguments);
  };
}();

var validateEmail = function validateEmail(email) {
  if (!email) return {
    message: 'Email is required!'
  };
  var validEmail = /^\S+@\S+$/g;
  return validEmail.test(email) ? null : {
    message: 'Email is invalid!'
  };
};

var validateName = function validateName(_ref2) {
  var firstName = _ref2.firstName,
      lastName = _ref2.lastName;
  if (!firstName || !lastName) return {
    message: 'Both First and Last name are required!'
  };
  var validName = /^(0-9)/g;
  return !validName.test(firstName) && !validName.test(lastName) ? null : {
    message: 'Numbers are not allowed in both names'
  };
};

var validSubject = function validSubject(subject) {
  return subject ? null : {
    message: 'Subject is required!'
  };
};

var validMessageBody = function validMessageBody(messageBody) {
  return messageBody ? null : {
    message: 'Message Body is required!'
  };
};

window.addEventListener("popstate", router);
setTimeout(router, 0);
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(e) {
      var errorList, firstName, lastName, email, subject, messageBody, nameErrorMessage, emailErrorMessage, messageBodyErrorMessage, subjectErrorMessage, i, routeIndex, props;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (e.target.matches("[data-navLink]")) {
                e.preventDefault(); // for(const route in routes) {
                //   if (route['title'] === document.title) route['props']['selected'] = document.title
                // }

                navigateTo(e.target.href);
              }

              if (!e.target.matches("[data-submitBtn]")) {
                _context2.next = 32;
                break;
              }

              e.preventDefault();
              errorList = [];
              _context2.next = 6;
              return _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].getValue('#firstname');

            case 6:
              firstName = _context2.sent;
              _context2.next = 9;
              return _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].getValue('#lastname');

            case 9:
              lastName = _context2.sent;
              _context2.next = 12;
              return _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].getValue('#email');

            case 12:
              email = _context2.sent;
              _context2.next = 15;
              return _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].getValue('#subject');

            case 15:
              subject = _context2.sent;
              _context2.next = 18;
              return _js_myDOM__WEBPACK_IMPORTED_MODULE_3__["default"].getValue('#message-body');

            case 18:
              messageBody = _context2.sent;
              nameErrorMessage = validateName({
                firstName: firstName,
                lastName: lastName
              });
              nameErrorMessage ? errorList.push(nameErrorMessage.message) : null;

              if (email) {
                emailErrorMessage = validateEmail(email);
                emailErrorMessage ? errorList.push(emailErrorMessage) : null;
              }

              if (messageBody) {
                messageBodyErrorMessage = validMessageBody(messageBody);
                messageBodyErrorMessage ? errorList.push(messageBody) : null;
              }

              subjectErrorMessage = validSubject(subject); // make is a drop down

              console.log(errorList);

              if (!errorList.length) {
                _context2.next = 31;
                break;
              }

              console.log("errorList: ".concat(errorList));

              for (i = 0; i < errorList.length; i++) {
                if (errorList[i]) alert(errorList[i]);
              }

              return _context2.abrupt("return");

            case 31:
              if (!errorList.length) {
                routeIndex = routes.findIndex(function (route) {
                  return route['title'] === 'Confirmation';
                });
                props = {
                  firstName: firstName,
                  lastName: lastName,
                  email: email
                }; // formContainer.submit()

                navigateTo('/message/confirmation', props);
              }

            case 32:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }());
  router();
});

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),
/* 9 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".svg-icon__search{background-image:url(https://img.icons8.com/ios-glyphs/30/000000/search--v2.png);background-position:0 0;background-repeat:no-repeat;padding-left:15px}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_tailwind_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_tailwind_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_tailwind_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_tailwind_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_tailwind_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),
/* 13 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*! tailwindcss v3.0.15 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:\"\"}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{color:inherit;font-family:inherit;font-size:100%;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder, textarea::-moz-placeholder{color:#9ca3af;opacity:1}input:-ms-input-placeholder, textarea:-ms-input-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.relative{position:relative}.mr-2{margin-right:.5rem}.ml-\\[5\\%\\]{margin-left:5%}.mr-\\[5\\%\\]{margin-right:5%}.block{display:block}.flex{display:flex}.table{display:table}.hidden{display:none}.h-full{height:100%}.h-48{height:12rem}.h-auto{height:auto}.h-screen{height:100vh}.h-\\[80\\%\\]{height:80%}.w-full{width:100%}.w-screen{width:100vw}.w-auto{width:auto}.w-fit{width:-webkit-fit-content;width:-moz-fit-content;width:fit-content}.w-36{width:9rem}.w-20{width:5rem}.w-60{width:15rem}.w-24{width:6rem}.w-\\[75\\%\\]{width:75%}.w-\\[80\\%\\]{width:80%}.w-\\[40\\%\\]{width:40%}.flex-auto{flex:1 1 auto}.flex-initial{flex:0 1 auto}@-webkit-keyframes bounce{0%,to{-webkit-animation-timing-function:cubic-bezier(.8,0,1,1);animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{-webkit-animation-timing-function:cubic-bezier(0,0,.2,1);animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}@keyframes bounce{0%,to{-webkit-animation-timing-function:cubic-bezier(.8,0,1,1);animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{-webkit-animation-timing-function:cubic-bezier(0,0,.2,1);animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}.animate-bounce{-webkit-animation:bounce 1s infinite;animation:bounce 1s infinite}.resize{resize:both}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-around{justify-content:space-around}.justify-evenly{justify-content:space-evenly}.gap-3{gap:.75rem}.gap-y-3{row-gap:.75rem}.gap-x-3{-moz-column-gap:.75rem;column-gap:.75rem}.space-x-5>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1.25rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1.25rem*var(--tw-space-x-reverse))}.overflow-hidden{overflow:hidden}.overflow-scroll{overflow:scroll}.overflow-x-scroll{overflow-x:scroll}.scroll-smooth{scroll-behavior:smooth}.rounded-xl{border-radius:.75rem}.rounded-lg{border-radius:.5rem}.rounded-full{border-radius:9999px}.rounded-\\[30\\%\\]{border-radius:30%}.border{border-width:1px}.border-blue-300{--tw-border-opacity:1;border-color:rgb(147 197 253/var(--tw-border-opacity))}.bg-blue-300{--tw-bg-opacity:1;background-color:rgb(147 197 253/var(--tw-bg-opacity))}.bg-rose-400{--tw-bg-opacity:1;background-color:rgb(251 113 133/var(--tw-bg-opacity))}.bg-blue-100{--tw-bg-opacity:1;background-color:rgb(219 234 254/var(--tw-bg-opacity))}.bg-red-300{--tw-bg-opacity:1;background-color:rgb(252 165 165/var(--tw-bg-opacity))}.bg-rose-300{--tw-bg-opacity:1;background-color:rgb(253 164 175/var(--tw-bg-opacity))}.bg-red-400{--tw-bg-opacity:1;background-color:rgb(248 113 113/var(--tw-bg-opacity))}.bg-red-200{--tw-bg-opacity:1;background-color:rgb(254 202 202/var(--tw-bg-opacity))}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.pt-2{padding-top:.5rem}.pb-2{padding-bottom:.5rem}.pl-4{padding-left:1rem}.pr-4{padding-right:1rem}.pl-2{padding-left:.5rem}.pb-10{padding-bottom:2.5rem}.pr-2{padding-right:.5rem}.pl-3{padding-left:.75rem}.pr-3{padding-right:.75rem}.pt-56{padding-top:14rem}.pt-3{padding-top:.75rem}.text-center{text-align:center}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-5xl{font-size:3rem;line-height:1}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-blue-400{--tw-text-opacity:1;color:rgb(96 165 250/var(--tw-text-opacity))}.text-blue-500{--tw-text-opacity:1;color:rgb(59 130 246/var(--tw-text-opacity))}.text-red-500{--tw-text-opacity:1;color:rgb(239 68 68/var(--tw-text-opacity))}.text-rose-700{--tw-text-opacity:1;color:rgb(190 18 60/var(--tw-text-opacity))}.opacity-80{opacity:.8}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.hover\\:text-blue-900:hover{--tw-text-opacity:1;color:rgb(30 58 138/var(--tw-text-opacity))}.hover\\:text-red-900:hover{--tw-text-opacity:1;color:rgb(127 29 29/var(--tw-text-opacity))}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Home": () => (/* reexport safe */ _Home__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "About": () => (/* reexport safe */ _About__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "Contact": () => (/* reexport safe */ _Contact__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   "Footer": () => (/* reexport safe */ _Footer__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "Layout": () => (/* reexport safe */ _Layout__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "MessageSent": () => (/* reexport safe */ _MessageSent__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   "Nav": () => (/* reexport safe */ _Nav__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   "Videos": () => (/* reexport safe */ _Videos__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   "ErrorMessage": () => (/* reexport safe */ _ErrorMessage__WEBPACK_IMPORTED_MODULE_8__["default"])
/* harmony export */ });
/* harmony import */ var _Home__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15);
/* harmony import */ var _About__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _Contact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony import */ var _Footer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(18);
/* harmony import */ var _Layout__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(19);
/* harmony import */ var _MessageSent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(21);
/* harmony import */ var _Nav__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);
/* harmony import */ var _Videos__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(22);
/* harmony import */ var _ErrorMessage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(23);











/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Home = function Home(props) {
  // fetch video data here
  var spotlightVideo = {
    videoName: 'Demo Spotlight',
    video: 'https://youtube.com/embed/cpzxtUaOsEE'
  };
  var latestVideos = [{
    videoName: 'Demo latest 1',
    video: 'https://youtube.com/embed/yxW5yuzVi8w'
  }, {
    videoName: 'Demo latest 2',
    video: 'https://youtube.com/embed/RnpyRe_7jZA'
  }, {
    videoName: 'Demo latest 4',
    video: 'https://youtube.com/embed/6OcOO1k-vGE'
  }, {
    videoName: 'Demo latest 5',
    video: 'https://youtube.com/embed/kymHxgBwbm4'
  }, {
    videoName: 'Demo latest 6',
    video: 'https://youtube.com/embed/XcYajuXs5cw'
  }, {
    videoName: 'Demo latest 8',
    video: 'https://youtube.com/embed/cpzxtUaOsEE'
  }];
  var featureVideo = {
    videoName: 'Demo latest 6',
    video: 'https://youtube.com/embed/XcYajuXs5cw'
  };
  var videoHeight = window.screen.height < 800 ? 600 : window.screen.height * 0.55;
  var videoWidth = window.screen.width < 800 ? 400 : window.screen.width * 0.55;
  return "\n    <div class=\"relative w-full h-full flex flex-col align-center gap-y-3 pt-2 bg-blue-300\"> \n      <div id=\"spotlight-video\" class=\"relative flex justify-center\"> \n        <iframe alt=\"".concat(spotlightVideo.videoName, "\" class=\"relative flex-initial border bg-rose-400\" width=\"").concat(videoWidth, "\" height=\"").concat(videoHeight, "\" src=\"").concat(spotlightVideo.video, "\" frameborder=\"0\" allowfullscreen></iframe> \n      </div> \n      <div id=\"latest-videos\" class=\"relative flex gap-3 overflow-x-scroll\"> \n        ").concat(latestVideos.map(function (_ref, idx) {
    var videoName = _ref.videoName,
        video = _ref.video;
    return "<iframe key=\"".concat(idx, "\" alt=\"").concat(videoName, "\" class=\"relative flex-initial border bg-rose-400\" id=\"spotlight-video\" width=\"").concat(videoWidth, "\" height=\"").concat(videoHeight, "\" src=\"").concat(video, "\" frameborder=\"0\" allowfullscreen></iframe>");
  }), "\n      </div> \n      <div id=\"feature-video\" class=\"relative flex justify-center\"> \n        <iframe alt=\"").concat(featureVideo.videoName, "\" class=\"relative flex-initial border bg-rose-400\" width=\"").concat(videoWidth, "\" height=\"").concat(videoHeight, "\" src=\"").concat(featureVideo.video, "\" frameborder=\"0\" allowfullscreen></iframe> \n      </div>\n    </div> \n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var About = function About(props) {
  return "\n  <div class=\"relative w-full h-screen flex flex-col align-center bg-blue-300\">\n    <h1 class=\" p-3 text-3xl text-center\"> About Vevo </h1>\n    <p class=\" ml-[5%] mr-[5%] p-2 w-fit text-m\">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dignissimos tempora distinctio deleniti beatae ut repellendus, aspernatur animi placeat nisi, molestiae veniam neque impedit quasi hic voluptates vero amet quidem sapiente.</p>\n  </div>\n  ";
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (About);

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Contact = function Contact(props) {
  return "\n  <div id=\"form-container\" class=\"relative w-full h-screen flex flex-col justify-center items-center align-center gap-x-3 bg-blue-300\">\n    <form id=\"contact-form\" class=\"relative flex flex-col w-[75%] h-[80%] justify-center items-center h-full gap-y-3 border rounded-xl bg-blue-100\" action=\"http://localhost:8080/api\">\n      <h1 class=\"text-center pt-2 pb-2 text-2xl text-blue-400 text-bold\">Contact Us</h1>\n      <!-- user information -->\n      <small>Fill all the fields below</small>\n      <div class=\"flex flex-wrap justify-center w-[80%] gap-x-3 gap-y-3\">\n          <fieldset class=\"flex-auto\">\n            <input autofocus class=\"w-full p-1 rounded-lg\" name=\"firstname\" id=\"firstname\" placeholder=\"First Name\" type=\"text\" required/>\n          </fieldset>\n          <fieldset class=\"flex-auto\">\n            <input autofocus class=\"w-full p-1 rounded-lg\" name=\"lastname\" id=\"lastname\" placeholder=\"Last Name\" type=\"text\" required/>\n          </fieldset>\n          <fieldset class=\"flex-auto\">\n          <input class=\"w-full p-1 rounded-lg\" name=\"email\" id=\"email\" placeholder=\"Email\" type=\"email\"/>\n          </fieldset>\n\n      </div>\n      <!-- message information -->\n      <div class=\"relative flex flex-col justify-around w-[80%] gap-y-3 \">\n          <input class=\"p-1 rounded-lg\" name=\"subject\" placeholder=\"Subject\" id=\"subject\" type=\"text\"/>\n          <textarea style=\"resize: none;\" class=\"rounded-lg overflow-scroll\" name=\"messagebody\" id=\"message-body\" rows=\"10\" placeholder=\"Type your message here\" ></textarea>\n      </div>\n      <div class=\"p-2 \">\n        <button id=\"contact-form-submit\" class=\"w-auto h-auto p-2 rounded-full bg-red-300\" type=\"submit\" data-submitBtn>Send</button>\n      </div>\n    </form>\n  </div>\n  ";
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Contact);

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Footer = function Footer() {
  return "\n  <footer class=\"relative text-center text-blue-500 bg-red-300 p-3\"> \n    <span class=\"pt-2 pl-3 pb-2 pr-2 mr-2 bg-blue-300 text-rose-700 hover:text-blue-900\"> \n      <a href=\"\">\n        <i class=\"fab fa-facebook-f\"></i>\n      </a> \n    </span> \n    <span class=\"pt-2 pl-3 pb-2 pr-2 mr-2 bg-blue-300 text-rose-700 hover:text-blue-900\"> \n      <a href=\"\">\n        <i class=\"fab fa-instagram\"></i>\n      </a> \n      </span> \n      <span class=\"pt-2 pl-3 pb-2 pr-2 mr-2 bg-blue-300 text-rose-700 hover:text-blue-900\">\n          <a href=\"\"><i class=\"fab fa-twitter\"></i>\n        </a> \n      </span> \n      <span class=\"pt-2 pl-3 pb-2 pr-3 bg-blue-300 text-rose-700 hover:text-blue-900\">\n        <a href=\"\"><i class=\"fab fa-youtube\"></i>\n        </a> \n      </span> \n  </footer> \n  ";
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Footer);

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Nav__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);
/* harmony import */ var _Footer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);



var Layout = function Layout() {
  var greetings = {
    title: 'Welcome to Vevo',
    subtitleOne: 'Where you can find latest Vevo videos here',
    subtitleTwo: 'Exclusive videos are listed here'
  };
  var LandingElement = "\n    <header class=\"flex flex-col justify-between w-screen h-screen bg-rose-300\">\n      <div class=\"animate-ease_in relative flex-col gap-3 pt-56 pl-4\">\n        <h1 class=\"text-5xl\">".concat(greetings.title, "</h1>\n        <p class=\"pt-3 text-lg\">").concat(greetings.subtitleOne, "</p>\n        <p class\"pt-2 text-lg\">").concat(greetings.subtitleTwo, "</p>\n\n      </div>\n      <span class=\"animate-bounce border w-36 p-3 rounded-lg opacity-80 bg-red-400\">\n      <a class=\"text-center\" href=\"#main\">Skip Navigation</a>\n      </span>\n    </header>\n  ");
  var currentTab = '';
  var tabs = [{
    path: '/',
    tabName: 'Home'
  }, {
    path: '/videos',
    tabName: 'Video'
  }, {
    path: '/about',
    tabName: 'About'
  }, {
    path: '/contact',
    tabName: 'Contact'
  }];
  tabs.forEach(function (_ref) {
    var path = _ref.path,
        tabName = _ref.tabName;
    if (location.pathname === path) currentTab = tabName;
  });

  for (var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++) {
    children[_key] = arguments[_key];
  }

  return " \n    ".concat(location.pathname === '/' ? LandingElement : '', "\n    <div id=\"main\" class=\"relative flex flex-col w-screen h-full justify-between overflow-hidden bg-blue-300\"> \n      ").concat((0,_Nav__WEBPACK_IMPORTED_MODULE_0__["default"])(), "\n      <div class=\"relative w-full h-full flex flex-col justify-center align-center items-center overflow-scroll gap-x-3 bg-blue-300\"> \n        ").concat(children.map(function (child) {
    return child();
  }), "\n      </div> \n        ").concat((0,_Footer__WEBPACK_IMPORTED_MODULE_1__["default"])(), "\n    </div>\n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Layout);

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Nav = function Nav(props) {
  var selectedClass = 'pt-2 pl-2 pb-10 pr-2 border-blue-300 rounded-[30%] text-red-500 bg-blue-300 ';
  return "\n    <nav class=\"p-3 text-blue-500 bg-red-300\"> \n      <div class=\"relative flex justify-end space-x-5\"> \n        <span class=\"relative\"> \n          <a class=\"".concat(location.pathname === '/' ? selectedClass : '', " hover:text-red-900\" href=\"/\" data-navLink>\n            Home\n          </a> \n        </span> \n        <span> \n          <a class=\"").concat(location.pathname === '/videos' ? selectedClass : '', " hover:text-red-900\" href=\"/videos\" data-navLink>\n            Videos\n          </a> \n        </span> \n        <span> \n          <a class=\"").concat(location.pathname === '/about' ? selectedClass : '', " hover:text-red-900\" href=\"/about\" data-navLink>\n            About\n          </a> \n        </span> \n        <span> \n          <a class=\"").concat(location.pathname === '/contact' ? selectedClass : '', " hover:text-red-900\" href=\"/contact\" data-navLink>\n            Contact\n          </a>\n        </span> \n      </div> \n    </nav> \n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Nav);

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var MessageSent = function MessageSent(props) {
  var firstName = props.firstName,
      lastName = props.lastName,
      email = props.email;
  return "\n  <div class=\"relative w-full h-[80%] flex flex-col align-center gap-x-3 bg-blue-300\">\n    <h1 class=\"p-3 text-3xl text-center\"> Thank you ".concat(firstName, " ").concat(lastName, "</h1>\n    <div class=\"flex flex-col justify-center items-center gap-y-3 p-2\" >\n    <p class=\"ml-[5%] mr-[5%] text-m\">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dignissimos tempora distinctio deleniti beatae ut repellendus, aspernatur animi placeat nisi, molestiae veniam neque impedit quasi hic voluptates vero amet quidem sapiente.</p>\n    <p class=\"text-m\">We will contact you shortly via ").concat(email, "</p>\n    </div>\n  </div>\n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MessageSent);

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Videos = function Videos(props) {
  var currentScreenHeight = window.screen.height * 0.55;
  var videoList = [{
    videoName: 'Demo latest 1',
    video: 'https://youtube.com/embed/yxW5yuzVi8w'
  }, {
    videoName: 'Demo latest 2',
    video: 'https://youtube.com/embed/RnpyRe_7jZA'
  }, {
    videoName: 'Demo latest 4',
    video: 'https://youtube.com/embed/6OcOO1k-vGE'
  }, {
    videoName: 'Demo latest 5',
    video: 'https://youtube.com/embed/kymHxgBwbm4'
  }, {
    videoName: 'Demo latest 6',
    video: 'https://youtube.com/embed/XcYajuXs5cw'
  }, {
    videoName: 'Demo latest 8',
    video: 'https://youtube.com/embed/cpzxtUaOsEE'
  }];
  var videoHeight = window.screen.height < 800 ? 600 : window.screen.height * 0.55;
  var videoWidth = window.screen.width < 800 ? 400 : window.screen.width * 0.55;
  return "\n  <section id=\"latest-videos\" class=\"relative flex flex-wrap flex-col justify-evenly w-screen h-screen pt-2 pb-2 pl-4 pr-4\">\n      <div class=\"flex flex-between w-[40%] gap-x-3\">\n      <button id=\"btn-list\" class=\"w-20 h-auto p-3 rounded-lg bg-rose-300\">List</button>\n      <button id=\"btn-detail\" class=\"w-20 h-auto p-3 rounded-lg bg-rose-300\">Detail</button>\n      <button id=\"btn-latest\" class=\"w-30 h-auto p-3 rounded-lg bg-rose-300\">Latest</button>\n      <button id=\"btn-popular\" class=\"w-30 h-auto p-3 rounded-lg bg-rose-300\">Popular</button>\n      </div>\n      <fieldset class=\"flex flex-between w-[40%] gap-x-3\">\n        <input id=\"input-search\" class=\"w-60 p-3 bg-red-200\" type=\"search\" />\n        <button id=\"btn-search\" class=\"w-24 h-auto p-1 rounded-lg bg-rose-300\">Search</button>\n      </fieldset>\n    <div id=\"latest-videos\" class=\"relative flex w-screen gap-3 overflow-x-scroll\"> \n      ".concat(videoList.map(function (_ref, idx) {
    var videoName = _ref.videoName,
        video = _ref.video;
    return "<iframe key=\"".concat(idx, "\" alt=\"").concat(videoName, "\" class=\"flex-initial border border bg-rose-400\" id=\"spotlight-video\" width=\"").concat(videoWidth, "\" height=\"").concat(videoHeight, "\" src=\"").concat(video, "\" frameborder=\"0\" allowfullscreen></iframe>");
  }), "\n    </div> \n  </section>\n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Videos);

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ErrorMessage = function ErrorMessage(_ref) {
  var code = _ref.code,
      message = _ref.message;

  var goBack = function goBack(e) {
    e.preventDefault();
    console.log('clicked!');
    history.back();
  };

  return "\n  <div class=\"relative w-full h-screen flex flex-col justify-center align-center gap-x-3 bg-blue-300\">\n    <h1 class=\"p-3 text-3xl text-center\"> Error Code: ".concat(code, "</h1>\n    <div class=\"flex flex-col justify-center items-center gap-y-3 p-2\" >\n    <p class=\"ml-[5%] mr-[5%] text-m\">").concat(message, "</p>\n    <p class=\"ml-[5%] mr-[5%] text-m\">Back to <span class=\"p-1 text-md><a href=\"/\">Home</a></span></p>\n    </div>\n  </div>\n  ");
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ErrorMessage);

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var myDOM = {
  componentToRender: null,
  rootNode: '',
  title: '',
  props: {},
  errorList: [],
  setup: function setup(component, titleInput, props, node) {
    myDOM.props = props;
    component ? myDOM.componentToRender = component(myDOM.props) : myDOM.errorReport('No component to render!');
    node ? myDOM.rootNode = node : myDOM.errorReport('No root node to load the DOM!');
    myDOM.title = titleInput;
    myDOM.setTitle(myDOM.title);
    document.addEventListener('DOMContentLoaded', myDOM.render); // render the components

    myDOM.render();
  },
  setTitle: function setTitle(title) {
    document.title = title;
  },
  render: function () {
    var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var root;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;

              if (!(myDOM.errorList.length > 0)) {
                _context.next = 4;
                break;
              }

              myDOM.errorList.forEach(function (err) {
                console.error(err);
              });
              return _context.abrupt("return");

            case 4:
              _context.next = 6;
              return document.querySelector(myDOM.rootNode);

            case 6:
              root = _context.sent;

              if (root) {
                root.innerHTML = '';
                root.innerHTML = myDOM.componentToRender;
              }

              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](0);
              // make error statement
              console.error(_context.t0);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 10]]);
    }));

    function render() {
      return _render.apply(this, arguments);
    }

    return render;
  }(),
  getValue: function () {
    var _getValue = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(htmlSelector) {
      var htmlElement;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return document.querySelector(htmlSelector);

            case 3:
              htmlElement = _context2.sent;

              if (!htmlElement) {
                _context2.next = 6;
                break;
              }

              return _context2.abrupt("return", htmlElement.value);

            case 6:
              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              //make a new error statement
              console.error(_context2.t0);

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 8]]);
    }));

    function getValue(_x) {
      return _getValue.apply(this, arguments);
    }

    return getValue;
  }(),
  errorReport: function errorReport(errMessage) {
    myDOM.errorList.push(errMessage);
    console.error(errMessage);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (myDOM);

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__(0);
/******/ 	var __webpack_exports__ = __webpack_require__(1);
/******/ 	
/******/ })()
;
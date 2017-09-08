'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('./PolyFills.js');

var ArrayProto = Array.prototype;
var nodeError = new Error('Passed arguments must be of Node');
var blurEvent;
var blurList = [];
var Events = [];

function isNode(val) {
  return val instanceof window.Node;
}
function isNodeList(val) {
  return val instanceof window.NodeList || val instanceof NodeList || val instanceof window.HTMLCollection || val instanceof Array;
}

var NodeList = function () {
  function NodeList(args) {
    _classCallCheck(this, NodeList);

    var nodes = args;
    if (args[0] === window) {
      nodes = [window];
    } else if (typeof args[0] === 'string') {
      nodes = (args[1] || document).querySelectorAll(args[0]);
      if (args[1]) {
        this.owner = args[1];
      }
    } else if (0 in args && !isNode(args[0]) && args[0] && 'length' in args[0]) {
      nodes = args[0];
      if (args[1]) {
        this.owner = args[1];
      }
    }
    if (nodes) {
      for (var i in nodes) {
        this[i] = nodes[i];
      }
      this.length = nodes.length;
    } else {
      this.length = 0;
    }
    window.prueba = this;
  }

  _createClass(NodeList, [{
    key: 'concat',
    value: function concat() {
      var nodes = ArrayProto.slice.call(this);
      function flatten(arr) {
        ArrayProto.forEach.call(arr, function (el) {
          if (isNode(el)) {
            if (!~nodes.indexOf(el)) nodes.push(el);
          } else if (isNodeList(el)) {
            flatten(el);
          }
        });
      }

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      ArrayProto.forEach.call(args, function (arg) {
        if (isNode(arg)) {
          if (!~nodes.indexOf(arg)) nodes.push(arg);
        } else if (isNodeList(arg)) {
          flatten(arg);
        } else {
          throw Error('Concat arguments must be of a Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)');
        }
      });
      return NodeListJS(nodes, this);
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var notRemoved = flatten(this).filter(function (el) {
        if (el.remove) {
          el.remove();
        } else if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
        return document.body.contains(el);
      });
      if (notRemoved.length) console.warn('NodeList: Some nodes could not be deleted.');
      return notRemoved;
    }
  }, {
    key: 'each',
    value: function each() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      ArrayProto.forEach.apply(this, args);
      return this;
    }
  }, {
    key: 'filter',
    value: function filter() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return NodeListJS(ArrayProto.filter.apply(this, args), this);
    }
  }, {
    key: 'find',
    value: function find(element) {
      var nodes = [];
      if (typeof element === 'string') flatten(this).forEach(function (node) {
        nodes.push(node.querySelectorAll(element));
      });
      if (isNode(element)) flatten(this).forEach(function (node) {
        if (node !== element && node.contains(element)) nodes.push(element);
      });
      if (isNodeList(element)) {
        var els = flatten(element);
        flatten(this).forEach(function (node) {
          els.forEach(function (el) {
            if (node !== el && node.contains(el)) nodes.push(el);
          });
        });
      }
      return flatten(nodes, this.owner);
    }
  }, {
    key: 'forEach',
    value: function forEach() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      ArrayProto.forEach.apply(this, args);
      return this;
    }
  }, {
    key: 'includes',
    value: function includes(element, index) {
      return ~this.indexOf(element, index);
    }
  }, {
    key: 'map',
    value: function map() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      var mapped = ArrayProto.map.apply(this, args);
      return mapped.some(function (el) {
        return isNode(el) || isNodeList(el);
      }) ? flatten(mapped, this) : mapped;
    }
  }, {
    key: 'parent',
    value: function parent() {
      return flatten(this.map(function (el) {
        return el.parentNode;
      }), this);
    }
  }, {
    key: 'pop',
    value: function pop(amount) {
      if (typeof amount !== 'number') {
        amount = 1;
      }
      var nodes = [];
      var pop = ArrayProto.pop.bind(this);
      while (amount--) {
        nodes.push(pop());
      }return NodeListJS(nodes, this);
    }
  }, {
    key: 'push',
    value: function push() {
      var _this = this;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      ArrayProto.forEach.call(args, function (arg) {
        if (!isNode(arg)) throw nodeError;
        if (!~_this.indexOf(arg)) ArrayProto.push.call(_this, arg);
      });
      return this;
    }
  }, {
    key: 'shift',
    value: function shift(amount) {
      if (typeof amount !== 'number') {
        amount = 1;
      }
      var nodes = [];
      while (amount--) {
        nodes.push(ArrayProto.shift.call(this));
      }return nodes.length == 1 ? nodes[0] : NodeListJS(nodes, this);
    }
  }, {
    key: 'slice',
    value: function slice() {
      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return NodeListJS(ArrayProto.slice.apply(this, args), this);
    }
  }, {
    key: 'splice',
    value: function splice() {
      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      for (var i = 2, l = args.length; i < l; i++) {
        if (!isNode(args[i])) throw nodeError;
      }
      ArrayProto.splice.apply(this, args);
      return this;
    }
  }, {
    key: 'unshift',
    value: function unshift() {
      var _this2 = this;

      var unshift = ArrayProto.unshift.bind(this);

      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      ArrayProto.forEach.call(args, function (arg) {
        if (!isNode(arg)) throw nodeError;
        if (!~_this2.indexOf(arg)) unshift(arg);
      });
      return this;
    }
  }, {
    key: 'addClass',
    value: function addClass(classes) {
      return this.toggleClass(classes, true);
    }
  }, {
    key: 'removeClass',
    value: function removeClass(classes) {
      return this.toggleClass(classes, false);
    }
  }, {
    key: 'toggleClass',
    value: function toggleClass(classes) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var method = value === undefined || value === null ? 'toggle' : value ? 'add' : 'remove';
      if (typeof classes === 'string') {
        classes = classes.trim().replace(/\s+/, ' ').split(' ');
      }
      return this.each(function (el) {
        return classes.forEach(function (c) {
          return el.classList[method](c);
        });
      });
    }
  }, {
    key: 'get',
    value: function get(prop) {
      var arr = [];
      this.each(function (el) {
        if (el !== null) {
          el = el[prop];
        }
        arr.push(el);
      });
      return flatten(arr, this);
    }
  }, {
    key: 'set',
    value: function set(prop, value) {
      if (prop.constructor === Object) {
        this.each(function (el) {
          if (el) {
            for (var key in prop) {
              if (key in el) {
                el[key] = prop[key];
              }
            }
          }
        });
      } else {
        this.each(function (el) {
          if (prop in el) {
            el[prop] = value;
          }
        });
      }
      return this;
    }
  }, {
    key: 'call',
    value: function call() {
      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      var method = ArrayProto.shift.call(args);
      var arr = [];
      var returnThis = true;
      this.each(function (el) {
        if (el && el[method] instanceof Function) {
          el = el[method].apply(el, args);
          arr.push(el);
          if (returnThis && el !== undefined) {
            returnThis = false;
          }
        } else {
          arr.push(undefined);
        }
      });
      return returnThis ? this : flatten(arr, this);
    }
  }, {
    key: 'item',
    value: function item(index) {
      return NodeListJS([this[index]], this);
    }
  }, {
    key: 'on',


    // event handlers
    value: function on(events, selector, callback) {
      if (typeof events === 'string') {
        events = events.trim().replace(/\s+/, ' ').split(' ');
      }
      if (!this || !this.length) return this;
      if (callback === undefined) {
        callback = selector;
        selector = null;
      }
      if (!callback) return this;
      var fn = callback;
      callback = selector ? function (e) {
        var els = NodeListJS(selector, this);
        if (!els.length) {
          return;
        }
        els.some(function (el) {
          var target = el.contains(e.target);
          if (target) fn.call(el, e, el);
          return target;
        });
      } : function (e) {
        fn.apply(this, [e, this]);
      };
      this.each(function (el) {
        events.forEach(function (event) {
          if (el === window || isNode(el)) {
            el.addEventListener(event, callback, false);
            Events.push({
              el: el,
              event: event,
              callback: callback
            });
          }
        });
      });
      return this;
    }
  }, {
    key: 'off',
    value: function off(events, callback) {
      if (events instanceof Function) {
        callback = events;
        events = null;
      }
      events = events instanceof Array ? events : typeof events === 'string' ? events.trim().replace(/\s+/, ' ').split(' ') : null;
      this.each(function (el) {
        Events = Events.filter(function (e) {
          if (e && e.el === el && (!callback || callback === e.callback) && (!events || ~events.indexOf(e.event))) {
            e.el.removeEventListener(e.event, e.callback);
            return false;
          }
          return true;
        });
      });
      return this;
    }
  }, {
    key: 'onBlur',
    value: function onBlur(callback) {
      if (!this || !this.length) return this;
      if (!callback) return this;
      this.each(function (el) {
        blurList.push({ el: el, callback: callback });
      });
      if (!blurEvent) {
        blurEvent = function blurEvent(e) {
          blurList.forEach(function (item) {
            var target = item.el.contains(e.target) || item.el === e.target;
            if (!target) item.callback.call(item.el, e, item.el);
          });
        };
        document.addEventListener('click', blurEvent, false);
        document.addEventListener('touchstart', blurEvent, false);
      }
      return this;
    }
  }, {
    key: 'offBlur',
    value: function offBlur(callback) {
      this.each(function (el) {
        blurList = blurList.filter(function (blur) {
          if (blur && blur.el === el && (!callback || blur.callback === callback)) {
            return false;
          }
          return el;
        });
      });
      return this;
    }
  }, {
    key: 'asArray',
    get: function get() {
      return ArrayProto.slice.call(this);
    }
  }]);

  return NodeList;
}();

var NL = NodeList.prototype;

function flatten(arr, owner) {
  var list = [];
  ArrayProto.forEach.call(arr, function (el) {
    if (isNode(el)) {
      if (!~list.indexOf(el)) list.push(el);
    } else if (isNodeList(el)) {
      for (var id in el) {
        if (!~list.indexOf(el[id])) list.push(el[id]);
      }
    } else if (el !== null) {
      arr.get = NL.get;
      arr.set = NL.set;
      arr.call = NL.call;
      arr.owner = owner;
      return arr;
    }
  });
  return NodeListJS(list, owner);
}

var exceptions = ['join', 'copyWithin', 'fill', 'find', 'forEach'];
Object.getOwnPropertyNames(ArrayProto).forEach(function (key) {
  if (!~exceptions.indexOf(key) && NL[key] === undefined) {
    NL[key] = ArrayProto[key];
  }
});
if (window.Symbol && Symbol.iterator) {
  NL[Symbol.iterator] = NL.values = ArrayProto[Symbol.iterator];
}
var div = document.createElement('div');
function setterGetter(prop) {
  var _this3 = this;

  if (NL[prop]) return;
  if (div[prop] instanceof Function) {
    NL[prop] = function () {
      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      var arr = [];
      var returnThis = true;
      for (var i in NL) {
        var el = NL[i];
        if (el && el[prop] instanceof Function) {
          el = el[prop].apply(el, args);
          arr.push(el);
          if (returnThis && el !== undefined) {
            returnThis = false;
          }
        } else {
          arr.push(undefined);
        }
      }
      return returnThis ? _this3 : flatten(arr, _this3);
    };
  } else {
    Object.defineProperty(NL, prop, {
      get: function get() {
        var arr = [];
        this.each(function (el) {
          if (el !== null) {
            el = el[prop];
          }
          arr.push(el);
        });
        return flatten(arr, this);
      },
      set: function set(value) {
        this.each(function (el) {
          if (el && prop in el) {
            el[prop] = value;
          }
        });
      }
    });
  }
}
for (var prop in div) {
  setterGetter(prop);
}function NodeListJS() {
  for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
    args[_key12] = arguments[_key12];
  }

  return new NodeList(args);
}
window.NL = NodeListJS;

exports.default = NodeListJS;
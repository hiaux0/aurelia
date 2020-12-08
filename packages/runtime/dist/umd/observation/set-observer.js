(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../observation.js", "./collection-length-observer.js", "./subscriber-collection.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSetObserver = exports.SetObserver = exports.disableSetObservation = exports.enableSetObservation = void 0;
    const observation_js_1 = require("../observation.js");
    const collection_length_observer_js_1 = require("./collection-length-observer.js");
    const subscriber_collection_js_1 = require("./subscriber-collection.js");
    const observerLookup = new WeakMap();
    const proto = Set.prototype;
    const $add = proto.add;
    const $clear = proto.clear;
    const $delete = proto.delete;
    const native = { add: $add, clear: $clear, delete: $delete };
    const methods = ['add', 'clear', 'delete'];
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    const observe = {
        // https://tc39.github.io/ecma262/#sec-set.prototype.add
        add: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                $add.call(this, value);
                return this;
            }
            const oldSize = this.size;
            $add.call(this, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.clear
        clear: function () {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $clear.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                // deepscan-disable-next-line
                for (const _ of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    i++;
                }
                $clear.call(this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.delete
        delete: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $delete.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedItems.push(indexMap[i]);
                    }
                    indexMap.splice(i, 1);
                    const deleteResult = $delete.call(this, value);
                    if (deleteResult === true) {
                        o.notify();
                    }
                    return deleteResult;
                }
                i++;
            }
            return false;
        }
    };
    const descriptorProps = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    const def = Reflect.defineProperty;
    for (const method of methods) {
        def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    let enableSetObservationCalled = false;
    function enableSetObservation() {
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, { ...descriptorProps, value: observe[method] });
            }
        }
    }
    exports.enableSetObservation = enableSetObservation;
    function disableSetObservation() {
        for (const method of methods) {
            if (proto[method].observing === true) {
                def(proto, method, { ...descriptorProps, value: native[method] });
            }
        }
    }
    exports.disableSetObservation = disableSetObservation;
    class SetObserver {
        constructor(observedSet) {
            this.type = 34 /* Set */;
            if (!enableSetObservationCalled) {
                enableSetObservationCalled = true;
                enableSetObservation();
            }
            this.inBatch = false;
            this.collection = observedSet;
            this.indexMap = observation_js_1.createIndexMap(observedSet.size);
            this.lengthObserver = (void 0);
            observerLookup.set(observedSet, this);
        }
        notify() {
            var _a;
            if ((_a = this.lifecycle) === null || _a === void 0 ? void 0 : _a.batch.depth) {
                if (!this.inBatch) {
                    this.inBatch = true;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                this.flushBatch(0 /* none */);
            }
        }
        getLengthObserver() {
            var _a;
            return (_a = this.lengthObserver) !== null && _a !== void 0 ? _a : (this.lengthObserver = new collection_length_observer_js_1.CollectionSizeObserver(this));
        }
        flushBatch(flags) {
            const indexMap = this.indexMap;
            const size = this.collection.size;
            this.inBatch = false;
            this.indexMap = observation_js_1.createIndexMap(size);
            this.callCollectionSubscribers(indexMap, 8 /* updateTarget */);
        }
    }
    exports.SetObserver = SetObserver;
    subscriber_collection_js_1.collectionSubscriberCollection()(SetObserver);
    function getSetObserver(observedSet, lifecycle) {
        let observer = observerLookup.get(observedSet);
        if (observer === void 0) {
            observer = new SetObserver(observedSet);
            if (lifecycle != null) {
                observer.lifecycle = lifecycle;
            }
        }
        return observer;
    }
    exports.getSetObserver = getSetObserver;
});
//# sourceMappingURL=set-observer.js.map
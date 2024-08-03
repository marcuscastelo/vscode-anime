import { describe, it, beforeEach } from 'mocha';
import { Registry } from '../../core/registry/registry';

import assert = require('assert');

class MyReg extends Registry<string> {}

describe("Registry", () => {
    describe("When only in variable form", () => {
        it("should be able to be instantiated", () => {
            const registry = new MyReg();
            assert(registry !== undefined);
        });

        it("should be have nothing", () => {
            const registry = new MyReg();
            assert(registry.listKeys().length === 0);
            assert(registry.get("key") === undefined);
        });

        it("should be able to register", () => {
            const registry = new MyReg();
            registry.register("key", "value");
            assert(registry.listKeys().length === 1);
            assert(registry.get("key") === "value");
        });
    });

    describe("When converted back from json", () => {
        let registry: MyReg;
        beforeEach(() => {
            const oldReg = new MyReg();
            oldReg.register("key", "value");
            const oldJson = oldReg.toJson();
            const newReg = MyReg.fromJson(oldJson, () => new MyReg());
            registry = newReg;
        });
        
        it("should still have the keys it had", () => {
            assert(registry.listKeys().length === 1);
            assert(registry.get("key") === "value");
        });

        it("should be able to register new keys", () => {
            registry.register("key2", "value2");
            assert(registry.listKeys().length === 2);
            assert(registry.get("key2") === "value2");
        });
    });
});
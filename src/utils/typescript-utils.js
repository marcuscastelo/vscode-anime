"use strict";
var Util;
(function (Util) {
    function typeGuard(arg, type) {
        if (typeof type === 'string') {
            return typeof arg === type;
        }
        return arg instanceof type;
    }
    Util.typeGuard = typeGuard;
})(Util || (Util = {}));
//# sourceMappingURL=typescript-utils.js.map
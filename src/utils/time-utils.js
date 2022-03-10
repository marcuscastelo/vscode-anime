"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
async function sleep(waitTime) {
    if (waitTime <= 0) {
        return;
    }
    await new Promise(r => setTimeout(r, waitTime));
}
exports.sleep = sleep;
//# sourceMappingURL=time-utils.js.map
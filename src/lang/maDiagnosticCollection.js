"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
class MADiagnosticController {
    constructor(context, collectionName) {
        this.context = context;
        this.collectionName = collectionName;
        this.currentDiagnostics = [];
        this.collection = vscode_2.languages.createDiagnosticCollection(collectionName);
        this.document = vscode_2.window.activeTextEditor?.document;
    }
    static register(context, collectionName) {
        const provider = new MADiagnosticController(context, collectionName);
        return provider;
    }
    clearDiagnostics() {
        this.currentDiagnostics = [];
        this.collection.clear();
    }
    setCurrentDocument(document) {
        this.clearDiagnostics();
        this.document = document;
        this.publish();
    }
    addLineDiagnostic(line, message, extra) {
        this.addDiagnostic({
            range: line.range,
            message,
            ...extra
        });
    }
    addDiagnostic(diagnostic) {
        const defaultSeverity = vscode_1.DiagnosticSeverity.Error;
        this.currentDiagnostics.push({
            severity: defaultSeverity,
            ...diagnostic,
        });
        //TODO: do it from time to time instead of every addition
        this.publish();
    }
    publish() {
        if (!this.document) {
            return;
        }
        this.collection.set(this.document.uri, this.currentDiagnostics);
    }
}
exports.default = MADiagnosticController;
//# sourceMappingURL=maDiagnosticCollection.js.map
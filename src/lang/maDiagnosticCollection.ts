import { Diagnostic, DiagnosticSeverity, Position, Range, TextDocument, TextEditor, TextLine, Uri } from "vscode";
import { DiagnosticCollection, ExtensionContext, languages, window } from "vscode";

export default class MADiagnosticController {
    public static register(context: ExtensionContext, collectionName: string) {
        const provider = new MADiagnosticController(context, collectionName);
        return provider;
    }

    private currentDiagnostics: Diagnostic[] = [];
    private collection: DiagnosticCollection;
    private document?: TextDocument;

    private constructor(
        private readonly context: ExtensionContext,
        private readonly collectionName: string
    ) {
        this.collection = languages.createDiagnosticCollection(collectionName);
        this.document = window.activeTextEditor?.document;
    }

    public clearDiagnostics(): void {
        this.currentDiagnostics = [];
        this.collection.clear();
    }

    public setCurrentDocument(document?: TextDocument) {
        this.clearDiagnostics();
        this.document = document;
        this.publish();
    }

    public addLineDiagnostic(line: TextLine, message: string, extra?: Partial<Diagnostic>) {
        this.addDiagnostic({
            range: line.range,
            message,
            ...extra
        })
    }

    public addDiagnostic(diagnostic: Partial<Diagnostic> & { message: string, range: Range }) {
        const defaultSeverity = DiagnosticSeverity.Error;
        this.currentDiagnostics.push({
            severity: defaultSeverity,
            ...diagnostic,
        });

        //TODO: do it from time to time instead of every addition
        this.publish();
    }
    
    public publish(): void {
        if (!this.document) { return; }
        this.collection.set(this.document.uri, this.currentDiagnostics);
    }
}
import { Diagnostic, DiagnosticSeverity, Position, Range, TextDocument, TextEditor, TextLine, Uri } from "vscode";
import { DiagnosticCollection, ExtensionContext, languages, window } from "vscode";

export default class MADiagnosticController {
    public static register(context: ExtensionContext, collectionName: string) {
        const provider = new MADiagnosticController(context, collectionName);
        window.onDidChangeActiveTextEditor(editor => provider.setCurrentDocument(editor?.document));
        return provider;
    }

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
        this.collection.clear();
    }

    public setCurrentDocument(document?: TextDocument) {
        this.collection.clear();
        this.document = document;
    }

    private addDiagnostic() {

    }

    public markUnknownLineType(line: TextLine) {
        let diag: Diagnostic = {
            message: 'Unknown syntax (line type not recognized)',
            range: line.range,
            severity: DiagnosticSeverity.Error
        };

        this.addDiagnostic();
    }
}
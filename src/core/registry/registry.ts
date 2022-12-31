import { ExtensionContext } from "vscode";

export abstract class Registry<T> {
    protected _registry: Map<string, T> = new Map();

    public static getOrCreateWorkspaceRegistry<T, U extends Registry<T>>(context: ExtensionContext, key: string, constructor: () => U): U {
        const hasKey = context.workspaceState.get(key) !== undefined;

        if (!hasKey) {
            const newRegistry = constructor();
            newRegistry.save(context, key);
            return newRegistry;
        }

        const registryJson = context.workspaceState.get(key);

        if (typeof registryJson !== 'string') {
            throw new Error(`Registry ${key} is not a string`);
        }

        return Registry.fromJson<T, U>(registryJson, constructor);

    }

    public static fromJson<T, U extends Registry<T>>(json: string, constructor: () => U): U {
        const registry = constructor();
        const registryJson = JSON.parse(json);
        const registryMap = new Map<string, T>(Object.entries(registryJson));
        registry._registry = registryMap;
        return registry;
    }

    public toJson(): string {
        return JSON.stringify(Object.fromEntries(this._registry));
    }

    public register(key: string, value: T): void {
        this._registry.set(key, value);
    }

    public get(key: string): T | undefined {
        return this._registry.get(key);
    }

    public incorporate(registry: Registry<T>): void {
        for (const [key, value] of registry._registry) {
            this.register(key, value);
        }
    }

    public listKeys(): string[] {
        return Array.from(this._registry.keys());
    }

    public save(context: ExtensionContext, key: string): void {
        const registryJson = JSON.stringify(this._registry);
        context.workspaceState.update(key, registryJson);
    }

    public load(context: ExtensionContext, key: string): void {
        const registryJson = context.workspaceState.get<string>(key);

        if (registryJson && typeof registryJson === 'string' && registryJson.length > 0) {
            const registryMap = new Map<string, T>(Object.entries(JSON.parse(registryJson)));
            this._registry = registryMap;
        }
    }
        
}
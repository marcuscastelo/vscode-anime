import { ExtensionContext } from "vscode";

export abstract class Registry<T> {
  protected _registry: Map<string, T> = new Map();

  /**
   * @deprecated
   */
  public static getOrCreateWorkspaceRegistry<T, U extends Registry<T>>(
    context: ExtensionContext,
    key: string,
    constructor: () => U,
  ): U {
    const hasKey = context.globalState.get(key) !== undefined;

    if (!hasKey) {
      const newRegistry = constructor();
      newRegistry.save(context, key);
      return newRegistry;
    }

    const registryJson = context.globalState.get(key);

    if (typeof registryJson !== "string") {
      throw new Error(`Registry ${key} is not a string`);
    }

    return Registry.fromJson<T, U>(registryJson, constructor);
  }

  public static fromJson<T, U extends Registry<T>>(
    json: string,
    constructor: () => U,
  ): U {
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

  public has(key: string): boolean {
    return this._registry.has(key);
  }

  public clear(): void {
    this._registry.clear();
  }

  public incorporate(registry: Registry<T>): void {
    for (const [key, value] of registry._registry) {
      this.register(key, value);
    }
  }

  public listKeys(): string[] {
    return Array.from(this._registry.keys());
  }

  /**
   * @deprecated
   */
  public save(context: ExtensionContext, key: string): void {
    console.debug(`[marucs-anime::registry] Saving registry ${key}`);
    const registryJson = JSON.stringify(Object.fromEntries(this._registry));

    context.globalState.update(key, registryJson);
    console.debug(
      `[marucs-anime::registry] Registry ${key} saved! ${registryJson}`,
    );
  }

  /**
   * @deprecated
   */
  public load(context: ExtensionContext, key: string): void {
    console.debug(`[marucs-anime::registry] Loading registry ${key}`);
    const registryJson = context.globalState.get<string>(key);

    if (
      registryJson &&
      typeof registryJson === "string" &&
      registryJson.length > 0
    ) {
      const registryMap = new Map<string, T>(
        Object.entries(JSON.parse(registryJson)),
      );
      this._registry = registryMap;
    }

    console.debug(
      `[marucs-anime::registry] Registry ${key} loaded! ${this.toJson()}`,
    );
  }
}

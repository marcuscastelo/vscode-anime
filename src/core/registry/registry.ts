export abstract class Registry<T> {
	protected _registry: Map<string, T> = new Map();

	public static fromJson<T, U extends Registry<T>>(json: string, constructor: () => U): U {
		const registry = constructor();
		const registryJson = JSON.parse(json) as Record<string, T>;
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
}

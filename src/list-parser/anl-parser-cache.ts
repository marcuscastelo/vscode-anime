import { createHash } from "crypto";
import { ExtensionContext, Range, TextDocument } from "vscode";
import { MAX_CACHE_SIZE } from "../constants";
import ShowRegistry from "../core/registry/show-registry";

type CacheValidity = {
  documentUri: string;
  lineCount: number;
  textHash: string;
};

type AnlParserCache = {
  createdAt: string;
  jsonCache: string;
  validity: CacheValidity;
};

export class AnlParserCacheManager {
  private caches: AnlParserCache[] = [];
  constructor(
    private readonly context: ExtensionContext,
    private readonly maxCaches = MAX_CACHE_SIZE,
  ) {
    this.loadCaches();
  }

  public onCheckpoint({
    storage,
    document,
    lineCount,
  }: {
    storage: ShowRegistry;
    document: TextDocument;
    lineCount: number;
  }): void {
    const textRange = new Range(0, 0, lineCount, 100);
    const text = document.getText(textRange);
    const textHash = this.hashText(text);

    if (text.trim().length === 0) {
      console.log(
        "[marucs-anime::cache::onCheckpoint] Skipping cache checkpoint because text is empty",
      );
      return;
    }

    const validity: CacheValidity = {
      documentUri: document.uri.toString(),
      lineCount,
      textHash,
    };

    const cache: AnlParserCache = {
      createdAt: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      jsonCache: storage.toJson(),
      validity,
    };

    console.log(
      `[marucs-anime::cache::onCheckpoint] Registering cache checkpoint for ${document.uri}, line count: ${lineCount}`,
    );

    // Used to purge invalid caches, should be a separate method...
    const _ = this.findValidCache(document);

    // For document-complete caches, we replace the last cache instead of adding a
    // new one since it probably differs only in the last few lines
    if (this.caches.length < this.maxCaches) {
      this.caches.push(cache);
    } else {
      this.caches[this.caches.length - 1] = cache;
    }
    this.persistCaches();
  }

  public findValidCache(document: TextDocument): AnlParserCache | undefined {
    console.log(
      `[marucs-anime::cache::findValidCache] Finding valid cache for ${document.uri}`,
    );
    if (this.caches.length === 0) {
      console.log("[marucs-anime::cache::findValidCache] No caches found");
      return undefined;
    }
    console.log(
      `[marucs-anime::cache::findValidCache] Found ${this.caches.length} caches`,
    );

    console.log(
      `[marucs-anime::cache::findValidCache] Purging caches to max of ${this.maxCaches}`,
    );
    this.caches = this.caches.slice(0, this.maxCaches);
    this.persistCaches();

    const indexOfFirstInvalidCache = this.caches.findIndex((cache) => {
      const invalid = !this.isCacheValid(document, cache);
      if (invalid) {
        console.log(
          `[marucs-anime::cache::findValidCache] Invalid cache found for ${document.uri}`,
        );
      }
      return invalid;
    });

    if (indexOfFirstInvalidCache === -1) {
      console.log(
        "[marucs-anime::cache::findValidCache] All caches are valid, returning last",
      );
      return this.caches[this.caches.length - 1];
    }

    console.log(
      `[marucs-anime::cache::findValidCache] Invalid cache found at ${indexOfFirstInvalidCache}, removing ${this.caches.length - indexOfFirstInvalidCache} invalid caches`,
    );
    this.caches = this.caches.slice(0, indexOfFirstInvalidCache);

    if (this.caches.length === 0) {
      console.log(
        "[marucs-anime::cache::findValidCache] No valid cache remained after purge, returning undefined",
      );
      return undefined;
    }

    const lastValidCache = this.caches[this.caches.length - 1];
    this.persistCaches();

    console.log(
      `[marucs-anime::cache::findValidCache] Returning last valid cache`,
    );
    return lastValidCache;
  }

  public listCaches() {
    return this.caches.slice();
  }

  public clearCaches(): void {
    console.log("[marucs-anime::cache::clearCaches] Clearing all caches");
    this.caches = [];
    this.persistCaches();
  }

  private isCacheValid(document: TextDocument, cache: AnlParserCache): boolean {
    if (document.uri.toString() !== cache.validity.documentUri) {
      console.debug(
        `[marucs-anime::cache::isCacheValid] Invalid! Reason: Different document`,
      );
      return false;
    }

    if (document.lineCount < cache.validity.lineCount) {
      console.debug(
        `[marucs-anime::cache::isCacheValid] Invalid! Reason: Document line count is less than cache`,
      );
      return false;
    }

    const textRange = new Range(0, 0, cache.validity.lineCount, 100);
    const text = document.getText(textRange);
    const textHash = this.hashText(text);

    const valid = textHash === cache.validity.textHash;
    if (!valid) {
      console.debug(
        `[marucs-anime::cache::isCacheValid] Invalid! Reason: Text hash mismatch`,
      );
    }
    return valid;
  }

  private hashText(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  private persistCaches(): void {
    const totalCacheCharacters = this.caches.reduce(
      (acc, cache) => acc + cache.jsonCache.length,
      0,
    );
    console.log(
      `[marucs-anime::cache::persistCaches] Persisting ${this.caches.length} caches (${(totalCacheCharacters / 1000000).toFixed(2)} MB)`,
    );

    for (const cache of this.caches) {
      const percentage =
        (cache.validity.lineCount /
          this.caches[this.caches.length - 1].validity.lineCount) *
        100;
      const missingLines =
        this.caches[this.caches.length - 1].validity.lineCount -
        cache.validity.lineCount;
      console.log(
        `[marucs-anime::cache::persistCaches]   - Cache for ${cache.validity.lineCount} lines (${percentage.toFixed(2)}%, missing ${missingLines} lines) created at ${cache.createdAt}`,
      );
    }

    const stringifiedCaches = JSON.stringify(this.caches);
    this.context.globalState.update("anl-parser-cache", stringifiedCaches);
  }

  private loadCaches() {
    console.log("[marucs-anime::cache::loadCaches] Loading caches");
    const stringifiedCaches =
      this.context.globalState.get<string>("anl-parser-cache");

    if (!stringifiedCaches) {
      this.caches = [];
      console.log("[marucs-anime::cache::loadCaches] No caches found");
      return;
    }

    this.caches = JSON.parse(stringifiedCaches);
    console.log(
      `[marucs-anime::cache::loadCaches] Loaded ${this.caches.length} caches`,
    );
  }
}

import {relative} from 'path';
import {PluginContext} from 'rollup';
import {glob} from './glob-promise';
import {FullConfigurableCopiable, FullPatternOptions} from './private-types';
import {readFile} from './promise-fs';

function dedupeAndFlattenResult(result: string[][]): Set<string> {
  return new Set<string>(result.flat());
}

/** @internal */
export class CopiableProcessor {
  private readonly readCache: Map<string, Promise<Buffer>> = new Map();

  public constructor(private readonly watch: boolean) {
  }

  public invalidate(fileName: string): void {
    this.readCache.delete(fileName);
  }

  /** @return Set of file paths */
  public processCopiable(ctx: PluginContext, copiable: FullConfigurableCopiable): Promise<Set<string>> {
    return Promise.all(copiable.from.map(c => this.processPattern(ctx, c, copiable.opts)))
      .then(dedupeAndFlattenResult);
  }

  private loadFile(filePath: string): Promise<Buffer> {
    return this.readCache.get(filePath) || this.readFile(filePath);
  }

  private processPattern(ctx: PluginContext, pattern: string, cfg: FullPatternOptions): Promise<string[]> {
    return glob(pattern, {...cfg.glob, absolute: true})
      .then<string[]>(files => {
        if (!files.length) {
          return [];
        }

        const rootDir: string = cfg.glob.cwd || process.cwd();
        const promises: Promise<void>[] = files
          .map((f): Promise<void> => {
            this.watch && ctx.addWatchFile(f);

            return this.loadFile(f)
              .then(source => {
                ctx.emitFile({
                  [cfg.emitNameKind]: relative(rootDir, f),
                  source,
                  type: 'asset'
                });
              });
          });

        return Promise.all(promises)
          .then(() => files);
      });
  }

  private readFile(filePath: string): Promise<Buffer> {
    const out$ = readFile(filePath);
    this.readCache.set(filePath, out$);

    return out$;
  }
}

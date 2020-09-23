import {IOptions as GlobOptions} from 'glob';

export type EmitNameKind = 'fileName' | 'name';

export interface PatternOptions {
  emitNameKind?: EmitNameKind;

  glob?: GlobOptions;
}

export interface ConfigurableCopiable {
  from: string | string[];

  opts?: PatternOptions;
}

export type Copiable = string | ConfigurableCopiable;

export interface CopyPluginOptions {
  copy: Copiable[];

  defaultOpts?: PatternOptions;

  /** @default false */
  watch?: boolean;
}

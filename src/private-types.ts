import {ConfigurableCopiable, Copiable, CopyPluginOptions, PatternOptions} from './public-types';

/** @internal */
export type FullPatternOptions = Required<PatternOptions>;

/** @internal */
export interface FullConfigurableCopiable {
  from: string[];

  opts: FullPatternOptions;
}

function transformPatternOpts(inp?: PatternOptions): FullPatternOptions {
  return {
    emitNameKind: 'name',
    glob: {},
    ...(inp || {})
  };
}

function transformConfigurableCopiable(opts: FullPatternOptions, inp?: ConfigurableCopiable): FullConfigurableCopiable {
  if (!inp) {
    throw new Error('configurableCopiable missing');
  } else if (!inp.from) {
    throw new Error(`configurableCopiable.from missing:\n${JSON.stringify(inp, null, 2)}`); //tslint:disable-line:no-magic-numbers max-line-length
  }

  const fromIsArray = Array.isArray(inp.from);
  let fromAsArray: string[];
  if (fromIsArray) {
    if (!inp.from.length) {
      throw new Error(`confiruableCopiable.from empty:\n${JSON.stringify(inp, null, 2)}`); //tslint:disable-line:no-magic-numbers max-line-length
    }
    fromAsArray = inp.from as string[];
  } else {
    fromAsArray = [inp.from as string];
  }

  return {
    from: fromAsArray,
    opts: {
      ...opts,
      ...(inp.opts || {}) // don't use transformPatternOpts here
    }
  };
}

function transformCopiable(opts: FullPatternOptions, inp?: Copiable): FullConfigurableCopiable {
  if (!inp) {
    throw new Error('empty copiable');
  }

  return transformConfigurableCopiable(opts, typeof inp === 'string' ? {from: inp} : inp);
}

/** @internal */
export function getCopiables(opts?: CopyPluginOptions): FullConfigurableCopiable[] {
  if (!opts) {
    throw new Error('copy-plugin: options missing');
  } else if (!opts.copy?.length) {
    throw new Error('copy-plugin: nothing to copy');
  }

  const defaultOpts = transformPatternOpts(opts.defaultOpts);

  return opts.copy.map(v => transformCopiable(defaultOpts, v));
}

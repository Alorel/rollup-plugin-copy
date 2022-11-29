import {FunctionPluginHooks, OutputPlugin, Plugin, PluginContext} from 'rollup';
import {CopiableProcessor} from './CopiableProcessor';
import {mergeSets} from './mergeSets';
import {getCopiables} from './private-types';
import {ConfigurableCopiable, Copiable, CopyPluginOptions, EmitNameKind, PatternOptions} from './public-types';

//tslint:disable:no-invalid-this

interface WatchOptions extends Omit<CopyPluginOptions, 'watch'> {
  watch: true;
}

interface RegularOptions extends Omit<CopyPluginOptions, 'watch'> {
  watch?: false;
}

function copyPlugin(pluginOptions: WatchOptions): Plugin;
function copyPlugin(pluginOptions: RegularOptions): OutputPlugin;
function copyPlugin(pluginOptions: CopyPluginOptions): Plugin | OutputPlugin;
function copyPlugin(pluginOptions: CopyPluginOptions): Plugin | OutputPlugin {
  const copiables = getCopiables(pluginOptions);
  const {watch = false} = pluginOptions;
  const processor = new CopiableProcessor(watch);

  function run(ctx: PluginContext): Promise<Set<string>[]> {
    return Promise.all(copiables.map(c => processor.processCopiable(ctx, c)));
  }

  const out: Plugin = {
    name: 'copy-plugin',
  };

  if (watch) {
    let assets: Set<string>;
    (out as FunctionPluginHooks).buildStart = function buildStart(): Promise<void> {
      return run(this).then(sets => {
        assets = mergeSets(sets);
      });
    };
    (out as FunctionPluginHooks).watchChange = function watchChange(id): void {
      if (assets.has(id)) {
        processor.invalidate(id);
      }
    };
  } else {
    out.renderStart = async function renderStart(): Promise<void> {
      await run(this);
    };
  }

  return out;
}

export {
  EmitNameKind,
  Copiable,
  PatternOptions,
  ConfigurableCopiable,
  CopyPluginOptions,
  copyPlugin
};

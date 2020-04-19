import {Plugin, PluginContext} from 'rollup';
import {CopiableProcessor} from './CopiableProcessor';
import {mergeSets} from './mergeSets';
import {getCopiables} from './private-types';
import {ConfigurableCopiable, Copiable, CopyPluginOptions, EmitNameKind, PatternOptions} from './public-types';

//tslint:disable:no-invalid-this

function copyPlugin(pluginOptions: CopyPluginOptions): Plugin {
  const copiables = getCopiables(pluginOptions);
  const processor = new CopiableProcessor();

  let assets: Set<string>;

  return {
    name: 'copy-plugin',
    buildStart(this: PluginContext): Promise<void> {
      return Promise.all(copiables.map(c => processor.processCopiable(this, c)))
        .then(sets => {
          assets = mergeSets(sets);
        });
    },
    watchChange(id) {
      if (assets.has(id)) {
        processor.invalidate(id);
      }
    }
  };
}

export {
  EmitNameKind,
  Copiable,
  PatternOptions,
  ConfigurableCopiable,
  CopyPluginOptions,
  copyPlugin
};

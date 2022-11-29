import _glob, {type IOptions} from 'glob';
import {promisify} from 'util';

/** @internal */
export const glob: (pattern: string, opts?: IOptions) => Promise<string[]> = promisify(_glob) as any;

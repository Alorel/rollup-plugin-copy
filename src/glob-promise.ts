import * as _glob from 'glob';
import {promisify} from 'util';

/** @internal */
export const glob: (pattern: string, opts?: _glob.IOptions) => Promise<string[]> = promisify(_glob) as any;

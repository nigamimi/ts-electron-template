import type fs from "fs";
type CreateWriteStreamOption =
    | string
    | {
          flags?: string;
          encoding?: BufferEncoding;
          fd?: number;
          mode?: number;
          autoClose?: boolean;
          emitClose?: boolean;
          start?: number;
          highWaterMark?: number;
      };

declare namespace bfj {
    function walk(): Function;
    function match(): Function;
    function parse(): Function;
    function unpipe(): Function;
    function read(): Function;
    function eventify(): Function;
    function streamify(): Function;
    function stringify(): Function;
    function write(path: fs.PathLike, data: any, option?: CreateWriteStreamOption): Promise<void>;
    function events(): Function;
}
declare const bfjNamespaceConst: typeof bfj;
export default bfjNamespaceConst;
//  bfj = require("bfj") as {
//     write: (path: fs.PathLike, data: any, option?: CreateWriteStreamOption) => Promise<void>;
// };

// export { bfj };

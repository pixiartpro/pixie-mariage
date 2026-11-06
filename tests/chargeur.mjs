// Le code du site importe sans extension (« ./data ») comme le fait Next. Pour Node, on ajoute « .js ».
import { register } from "node:module";
register("data:text/javascript," + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx); }
  catch (e) {
    if (e.code === "ERR_MODULE_NOT_FOUND" && (spec.startsWith(".") || spec.startsWith("/")) && !spec.endsWith(".js")) return next(spec + ".js", ctx);
    throw e;
  }
}`));

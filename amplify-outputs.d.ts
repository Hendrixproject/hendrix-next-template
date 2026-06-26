/**
 * Lets the app type-check before `amplify_outputs.json` is generated.
 * The real file is produced by `ampx sandbox` / pipeline deploy and is
 * git-ignored; this declaration just gives the import a type until then.
 */
declare module "@/amplify_outputs.json" {
  const outputs: Record<string, unknown>;
  export default outputs;
}

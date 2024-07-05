import type {BuildConfig} from 'bun';

export async function bundleBackgroundAndContentScripts(config: BuildConfig) {
  const result = await Bun.build(config);

  if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    throw new AggregateError(result.logs, "Build failed");
  }

  console.log('Bun build completed successfully');
}

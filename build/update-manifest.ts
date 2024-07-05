import {join} from 'path';
import {readFile, writeFile} from 'fs/promises';
import chalk from 'chalk';

export async function updateManifest() {
  try {
    const arg = process.argv[2];
    const browser = arg && arg === 'firefox' ? 'firefox' : 'chrome';

    const packageJsonPath = join(import.meta.dir, 'package.json');
    const {version} = await import(packageJsonPath);

    const manifestPath = join(import.meta.dir, 'public', 'manifest.json');
    const manifestData = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestData);

    manifest.version = version;

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(
        chalk.green('Version updated successfully in manifest.json for ' + browser + ' Browser!',
        ),
    );
  } catch (error) {
    console.error(chalk.red('Error updating version: ' + error));
    process.exit(1);
  }
}

updateManifest();

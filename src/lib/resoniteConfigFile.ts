import config from '../../config.json';
import type { container, dockerMount, HeadlessConfig } from '../types';

async function getConfigPath(container: container): Promise<string | null> {
  // To make sure we get the correct config file for the correct headless. since in debug it runs outside of a container this function was split into two functions
  if (process.env.container) {
    const projectName = container.Labels['com.docker.compose.project'];
    return projectName ? `${config.headless.global.dockerConfigFolder}/${projectName}.json` : null;
  }
  const foundMount = container.Mounts.find((mount) =>
    mount.Destination.toLocaleLowerCase().includes(config.headless.global.configFileName)
  );
  return foundMount ? foundMount.Source : null;
}

export async function getConfig(container: container) {
  const path = await getConfigPath(container);
  if (!path) return { successful: false, response: 'Path to config could not be found.' };
  const file = Bun.file(path);
  const contents = (await file.json()) as HeadlessConfig;
  if (
    !(contents &&
    contents.$schema ===
      'https://raw.githubusercontent.com/Yellow-Dog-Man/JSONSchemas/main/schemas/HeadlessConfig.schema.json')
  )
    return { successful: false, response: 'Config file doesn\'t have a "$schema". Is it a headless config?' };
  return { successful: true, contents };
}

export async function writeConfig() {}

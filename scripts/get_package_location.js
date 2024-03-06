import { getDependency, getPackageLocation, ROOT_DIR_PATH } from './lib.js'

import { $ } from 'zx'

async function main() {
  const packageName = await getDependency()
  const packageLocation = await getPackageLocation(packageName)
  console.log(packageLocation)
  if (packageLocation) {
    await $`cp ${packageLocation.replace(`/node_modules/${packageName}/`, '')} ${ROOT_DIR_PATH}`
  }
}

await main()

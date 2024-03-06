import { fileURLToPath } from 'node:url'

import pnp from 'pnpapi'
import prompts from 'prompts'

export const ROOT_DIR_PATH = fileURLToPath(new URL('../', import.meta.url))

export async function getPackageLocation(packageName) {
  const rootPackageDependencies = getRootPackageDependencies()
  const ref = rootPackageDependencies.get(packageName)
  const pkgLoc = pnp.getLocator(packageName, ref)
  const pkgInfo = pnp.getPackageInformation(pkgLoc)

  return pkgInfo.packageLocation
}

export function getRootPackageDependencies() {
  const [rootPkg] = pnp.getDependencyTreeRoots()
  const rootPkgInfo = pnp.getPackageInformation(rootPkg)
  return rootPkgInfo.packageDependencies
}

export async function getDependency() {
  const rootPackageDependencies = getRootPackageDependencies()

  const choices = [...rootPackageDependencies.entries()]
    .filter(([, ref]) => ref !== 'workspace:.')
    .map(([name]) => {
      return {
        title: name,
        value: name
      }
    })

  const { packageName } = await prompts(
    {
      name: 'packageName',
      message: 'Which package?',
      type: 'autocomplete',
      choices,
      suggest(input, choices) {
        return Promise.resolve(choices.filter(choice => choice.title.includes(input)))
      }
    },
    {
      onCancel() {
        throw new Error('User cancelled')
      }
    }
  )

  return packageName
}

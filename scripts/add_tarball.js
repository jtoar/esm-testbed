import { ROOT_DIR_PATH } from './lib.js'

import prompts from 'prompts'
import { cd, fs, path, spinner, within, $ } from 'zx'

async function main() {
  const packageData = await getPackageData()

  await buildFramework()
  await createTarball(packageData)
  await copyTarball(packageData)
  await addTarball(packageData)
}

$.verbose = false
await main()

// helpers
// -------

async function getPackageData() {
  const frameworkPackageData = await getFrameworkPackageData()

  const res = await prompts(
    {
      name: 'packageName',
      message: 'Which package?',
      type: 'autocomplete',
      choices: frameworkPackageData.map(packageData => {
        return {
          title: packageData.name,
          value: packageData.name,
        }
      }),
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

  const packageName = res.packageName

  const packagePath = frameworkPackageData
    .find(packageData => packageData.name === packageName)
    .location

  return {
    name: packageName,
    path: path.join(process.env.RWFW_PATH, packagePath),
    tarball: `${packageName.replace('@', '').replace('/', '-')}.tgz`
  }
}

async function getFrameworkPackageData() {
  let frameworkPackageData

  await within(async () => {
    cdToRwfwPath()

    frameworkPackageData = (await $`yarn workspaces list --json`)
      .stdout
      .trim()
      .split('\n')
      .map(JSON.parse)
      .filter(packageData => packageData.name)
  })

  return frameworkPackageData
}

function cdToRwfwPath() {
  cd(process.env.RWFW_PATH)
}

async function buildFramework() {
  await within(async () => {
    cdToRwfwPath()
    await spinner('yarn build', () => $`yarn build`)
  })
}

function cdToPackagePath(packagePath) {
  cd(packagePath)
}

async function createTarball(packageData) {
  await within(async () => {
    cdToPackagePath(packageData.path)
    await spinner('yarn build:pack', () => $`yarn build:pack`)
  })
}

async function copyTarball(packageData) {
  await within(async () => {
    const tarballsDir = path.join(ROOT_DIR_PATH, 'tarballs')
    await fs.ensureDir(tarballsDir)

    cdToPackagePath(packageData.path)
    await $`cp ${packageData.tarball} ${tarballsDir}`
  })
}

async function addTarball(packageData) {
  await within(async () => {
    cd(ROOT_DIR_PATH)
    await spinner(
      `yarn add ./tarballs/${packageData.tarball}`,
      () => $`yarn add ./tarballs/${packageData.tarball}`
    )
  })
}

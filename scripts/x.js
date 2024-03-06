import path from 'node:path'

import { PosixFS } from '@yarnpkg/fslib'
import { getLibzipSync, ZipOpenFS } from '@yarnpkg/libzip'
import { chalk } from 'zx'

import { getDependency, getPackageLocation } from './lib.js'

const separator = chalk.dim('-'.repeat(process.stdout.columns))

async function main() {
  const zipOpenFs = new ZipOpenFS({ libzip: getLibzipSync() });
  const cfs = new PosixFS(zipOpenFs);

  const packageName = await getDependency()
  console.log()
  const packageLocation = await getPackageLocation(packageName)

  const packageConfig = cfs.readJsonSync(path.join(packageLocation, 'package.json'), 'utf-8')
  printPackageConfig()
  console.log()

  const files = await getFiles()
  printStats()
  printExports()
  printErrors()

  // fns
  // ---
  function printPackageConfig() {
    console.log([
      ['name'.padEnd(10), packageConfig.name].join(''),
      ['type'.padEnd(10), packageConfig.type].join(''),
      '',
      ['main'.padEnd(10), packageConfig.main].join(''),
      ['types'.padEnd(10), packageConfig.types].join(''),
      '',
      ['files'.padEnd(10), packageConfig.files.join(', ')].join(''),
    ].join('\n'))

    if (packageConfig.exports) {
      console.log()
      console.log('exports')
      console.log(JSON.stringify(packageConfig.exports, null, 2))
    }
  }

  async function getFiles() {
    const files = []

    for (const file of cfs.readdirSync(packageLocation, { recursive: true })) {
      const fileObj = {
        packageImport: path.join(packageName, file)
      }

      files.push(fileObj)

      try {
        const mod = await import(fileObj.packageImport)
        const exports = Reflect.ownKeys(mod);

        fileObj.canImport = true
        fileObj.canImportPretty = '✅'
        fileObj.exports = exports
      } catch (error) {
        fileObj.canImport = false
        fileObj.canImportPretty = '❌'

        fileObj.errorCode = error.code
        fileObj.errorMessage = error.message
      }
    }

    return files
  }

  function printStats() {
    console.log(separator)
    for (const file of files) {
      console.log(`${file.canImportPretty} ${file.packageImport.padEnd(80)}`)
    }
  }

  function printExports() {
    console.log(separator)
    for (const file of files.filter(file => file.canImport)) {
      console.log(file.packageImport)
      console.log(file.exports)
      console.log()
    }
  }

  function printErrors() {
    console.log(separator)
    for (const file of files.filter(file => !file.canImport)) {
      console.log(file.packageImport)
      if (file.errorCode) {
        console.log(file.errorCode)
      }
      console.log(file.errorMessage)
      console.log()
    }
  }
}

await main()

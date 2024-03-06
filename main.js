// example cjs
// -----------

import { default as hello } from './hello.cjs'
import helloSugar from './hello.cjs'

console.dir(hello, { depth: null })
console.dir(helloSugar, { depth: null })
console.log(hello === helloSugar)

hello()
helloSugar()
console.log()

// vite
// ----

import { default as redwood } from '@redwoodjs/vite';
import redwoodSugar from '@redwoodjs/vite'

console.dir(redwood, { depth: null })
console.dir(redwoodSugar, { depth: null })
console.log(redwood === redwoodSugar)

redwood()
redwoodSugar()

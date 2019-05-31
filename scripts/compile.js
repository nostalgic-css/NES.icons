#!/usr/bin/env node

// Module imports
const fs = require('fs')
const Listr = require('listr')
const path = require('path')
const postcss = require('postcss')
const program = require('commander')
const sass = require('node-sass')
const util = require('util')
const webfont = require("webfont").default





// Local imports
const scssFunctions = require('../scripts/scssFunctions')





// Promisify non-promisables
const mkdirAsync = util.promisify(fs.mkdir)
const sassRenderAsync = util.promisify(sass.render)
const writeFileAsync = util.promisify(fs.writeFile)





// Useful constants
const isProduction = process.env.NODE_ENV === 'production'
const fontOutputDestination = path.resolve('fonts')
const outputDestination = path.resolve('css')
const outputFilename = path.resolve(outputDestination, 'nes-icons')
const variableOutputFilename = path.resolve(outputDestination, 'nes-icons-variables')





// Create CLI flags
program.version('1.0.0')
program.option('-w, --watch', 'Watch files and recompile when changes are made')
program.option('-v, --verbose', 'Verbose logging')
program.option('-s, --silent', 'Suppress all logging')
program.parse(process.argv)





const createFoldersTask = new Listr([
  {
    title: 'Create folders',
    task: () => {
      return new Listr([
        {
          title: '`css/`',
          task: async () => {
            try {
              await mkdirAsync('css')
            } catch (error) {}
          },
        },

        {
          title: '`fonts/`',
          task: async () => {
            try {
              await mkdirAsync('fonts')
            } catch (error) {}
          },
        },
      ], { concurrent: true })
    },
  },
])

const createWebfontsTask = new Listr([
  {
    title: 'Create webfonts',
    task: () => new Listr([
      {
        title: 'Create font files',
        task: () => new Listr([
          {
            title: 'Generate',
            task: async ctx => {
              ctx.webfontResults = await webfont({
                files: path.resolve('icons', '*.svg'),
                fontName: 'nes-icons',
              })
            },
          },

          {
            title: 'Save',
            task: ctx => new Listr(['eot', 'svg', 'ttf', 'woff', 'woff2'].map(format => {
              const destination = path.resolve(fontOutputDestination, `nes-icons.${format}`)
              return {
                title: format,
                task: async () => writeFileAsync(destination, ctx.webfontResults[format]),
              }
            }), { concurrent: true }),
          },
        ]),
      },

      {
        title: 'Create Sass variable file',
        task: () => new Listr([
          {
            title: 'Generate',
            task: async ctx => {
              ctx.sassVariableResults = await webfont({
                files: path.resolve('icons', '*.svg'),
                fontName: 'nes-icons',
                formats: [],
                template: path.resolve('templates', 'variables.scss.njk'),
              })
            },
          },

          {
            title: 'Save',
            task: async ctx => writeFileAsync(`${variableOutputFilename}.scss`, ctx.sassVariableResults.template),
          },
        ]),
      },

      {
        title: 'Create CSS variable file',
        task: () => new Listr([
          {
            title: 'Generate',
            task: async ctx => {
              ctx.cssVariableResults = await webfont({
                files: path.resolve('icons', '*.svg'),
                fontName: 'nes-icons',
                formats: [],
                template: path.resolve('templates', 'variables.css.njk'),
              })
            },
          },

          {
            title: 'Save',
            task: async ctx => writeFileAsync(`${variableOutputFilename}.css`, ctx.cssVariableResults.template),
          },
        ]),
      },
    ], { concurrent: true }),
  },
])

const createStylesheetsTask = new Listr([
  {
    title: 'Create stylesheets',
    task: () => new Listr([
      {
        title: 'Compile Sass',
        task: async ctx => {
          ctx.nodeSassResults = await sassRenderAsync({
            file: path.resolve('scss', 'style.scss'),
            functions: scssFunctions,
            outputStyle: 'expanded',
          })
        },
      },

      {
        title: 'Process with PostCSS',
        task: async ctx => {
          ctx.postCSSResults = await postcss([
            require('postcss-preset-env')(),
            require('doiuse')(program.watch ? false : {
              browsers: ['> 1%'],
              onFeatureUsage: usageInfo => (ctx.usageInfo || (ctx.usageInfo = [])).push(usageInfo),
            }),
          ]).process(ctx.nodeSassResults.css, {
            from: `${outputFilename}.css`,
            map: {
              inline: false,
              prev: ctx.nodeSassResults.map,
            },
            to: `${outputFilename}.css`,
          })
        },
      },

      {
        title: 'Save non-minified files',
        task: () => new Listr([
          {
            title: 'Save CSS',
            task: async ctx => writeFileAsync(`${outputFilename}.css`, ctx.postCSSResults.css),
          },

          {
            title: 'Save sourcemap',
            task: async ctx => writeFileAsync(`${outputFilename}.css.map`, ctx.postCSSResults.map),
          },
        ], { concurrent: true }),
      },

      {
        title: 'Minify CSS',
        task: ctx => new Listr([
          {
            title: 'Generate',
            task: async ctx => {
              ctx.minificationResults = await postcss([
                require('postcss-clean')(),
              ]).process(ctx.postCSSResults.css, {
                from: `${outputFilename}.css`,
                map: false,
                to: `${outputFilename}.min.css`,
              })
            },
          },

          {
            title: 'Save',
            task: async ctx => writeFileAsync(`${outputFilename}.min.css`, ctx.minificationResults.css),
          },
        ]),
      },
    ]),
  },
], {
  renderer: (() => {
    if (program.verbose) {
      return 'verbose'
    }

    if (program.silent) {
      return 'silent'
    }

    return 'default'
  })(),
})





;(async () => {
  await Promise.all([
    createFoldersTask.run(),
    createWebfontsTask.run(),
    createStylesheetsTask.run(),
  ]).catch(error => console.error(error))

  if (program.watch) {
    const iconsPath = path.resolve('icons')
    const scssPath = path.resolve('scss')
    const watchOptions = {
      persistent: true,
      recursive: true,
    }

    console.log('Watching for file changes...')

    fs.watch(scssPath, watchOptions, async (eventType, filename) => {
      console.log('Detected a change to styles. Rebuilding...')

      try {
        await createStylesheetsTask.run()
      } catch (error) {
        console.error(error)
      }

      console.log('Watching for file changes...')
    })

    fs.watch(iconsPath, watchOptions, async (eventType, filename) => {
      console.log('Detected a change to icons. Rebuilding...')

      try {
        await Promise.all([
          createWebfontsTask.run(),
          createStylesheetsTask.run(),
        ]).catch(error => console.error(error))
      } catch (error) {
        console.error(error)
      }

      console.log('Watching for file changes...')
    })

    process.stdin.resume()

    function exitHandler(options, exitCode) {
      console.log('Cleaning up...')

      fs.unwatchFile(scssPath)
      fs.unwatchFile(iconsPath)

      process.exit()
    }

    // do something when app is closing
    process.on('exit', exitHandler)

    // catches ctrl+c event
    process.on('SIGINT', exitHandler)

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler)
    process.on('SIGUSR2', exitHandler)

    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler)
  }
})()

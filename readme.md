# better-stencil-postcss

This package is used to integrate PostCSS and all its plugins with Stencil projects.

**Compatible with Tailwind CSS v4**  
Our plugin now supports Tailwind CSS v4. To use it, install Tailwind v4 and import the styles as follows:

```scss
@import 'tailwindcss/index.css';
@import 'tailwindcss/utilities.css';
```

## Installation

First, run the following command in your project:

`npm install better-stencil-postcss --save-dev`

Next, in your project’s stencil.config.ts file, import the plugin and add it to the plugins configuration. In the example below, we’re using the autoprefixer PostCSS plugin, so you’ll also need to install:

`npm install autoprefixer @types/autoprefixer --save-dev`

This plugin requires Node.js 20 or higher. For older Node versions, please refer to the 1.x release.

*stencil.config.ts*
```js
import { Config } from '@stencil/core';
import { postcss } from 'better-stencil-postcss';
import autoprefixer from 'autoprefixer';

export const config: Config = {
  plugins: [
    postcss({
      plugins: {
        autoprefixer: {},
        // You can add other PostCSS plugins here, e.g.:
        // "@tailwindcss/postcss": {}
      }
    })
  ]
};
```
During development, this plugin will use PostCSS to process any plugins you pass along.

## Options

PostCSS has a robust ecosystem of plugins (a plugin for a plugin, if you will). In our example, we’re using the autoprefixer plugin and configuring its options. You can pass any valid autoprefixer option.
```js
exports.config = {
  plugins: [
    postcss({
      plugins: {
        autoprefixer: {
          browsers: ['last 6 versions'],
          cascade: false
        }
      }
    })
  ]
};
```
## Inject Global Paths

The injectGlobalPaths option is an array of paths that are automatically added as @import declarations to all components. This is useful for injecting variables, mixins, and functions to override defaults from external libraries. Relative paths in injectGlobalPaths should be relative to your stencil.config.ts file.
```js
exports.config = {
  plugins: [
    postcss({
      injectGlobalPaths: [
        'src/globals/variables.pcss',
        'src/globals/mixins.pcss'
      ]
    })
  ]
};
```
Note: Each of these files is added to every component, so they should not contain CSS that generates output (to avoid duplication). Instead, injectGlobalPaths should be used only for Sass variables, mixins, and functions.

## Valid File Extensions

This plugin processes files with the following extensions: .css, .pcss, .postcss, .scss, and .sass.

## Importing Tailwind CSS v4

To use Tailwind CSS v4 with this plugin, install Tailwind v4 and configure your global styles file as follows:
```css
@import 'tailwindcss/index.css';
@import 'tailwindcss/utilities.css';
```

Contributing

Please see our Contributor Code of Conduct for information on our rules of conduct.
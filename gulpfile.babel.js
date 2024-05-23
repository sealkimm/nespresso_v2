import { src, dest, watch, series, parallel } from 'gulp';
import del from 'del';
import path from 'path';
import { create as browserSyncCreate } from 'browser-sync';
const browserSync = browserSyncCreate();
const browserSyncReload = browserSync.reload;

import nunjucksRender from 'gulp-nunjucks-render';
import indent from 'indent.js'
import through2 from 'through2';
import data from 'gulp-data';
import htmlhint from 'gulp-htmlhint';

import gulpSass from 'gulp-sass';
import dartSass from 'sass';
const sass = gulpSass(dartSass);
import sassGlob from 'gulp-sass-glob-use-forward';
import replace from 'gulp-replace';
import autoprefixer from 'gulp-autoprefixer';
import postcss from 'gulp-postcss';
import reporter from 'postcss-reporter';
import syntax_scss from 'postcss-scss';
import mqpacker from 'css-mqpacker';
import sortCSSmq from 'sort-css-media-queries';
import dgbl from 'del-gulpsass-blank-lines';

import listFilepaths from 'list-filepaths';

import stylelint from 'stylelint';
import babel from 'gulp-babel';

import mergeStream from 'merge-stream';

import spritesmith from 'gulp.spritesmith-multi'
import gulpWebp from 'gulp-webp';
import buffer from 'vinyl-buffer';
import merge from 'merge-stream';

/* ---------------------------------------------------------------------------------- */
// Settings
const baseDir = './dist';
const env = process.env.NODE_ENV;
const isDevEnv = env === 'development';
const isProdEnv = env === 'production';
const port = 8010;
/* ---------------------------------------------------------------------------------- */

const serve = callback => {
  const config = {
    open: true,
    https: false,
    logFileChanges: false,
    port: port,
    ui: { port: port + 1 },
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    },
    server: {
      baseDir: baseDir,
      directory: true,
    }
  };

  browserSync.init(config);
  callback();
};


/* ---------------------------------------------------------------------------------- */
const delHtml = filepath => {
  const isSingleFile = typeof filepath === 'string';
  const distPath = isSingleFile ? `./${filepath.replace('src', 'dist')}` : `${baseDir}/html`;

  return del(distPath);
};

const buildHtml = filepath => {
  const isSingleFile = typeof filepath === 'string';
  const isIncFile = isSingleFile && filepath.includes('@inc');
  const isComponentsFile = isSingleFile && filepath.includes('@components');
  const isBuildOnlyOne = isSingleFile && !isIncFile && !isComponentsFile;
  const srcPath = isBuildOnlyOne ? filepath : ['./src/html/**/*.html', '!./src/html/**/@inc/**/*.html', '!./src/html/**/@components/**/*.html'];
  const scrOptions = {
    base: './src',
    allowEmpty: true
  }
  const replacePath = file => {
    const relPath = path.relative('./src', file.path);
    const depth = relPath.split(path.sep).length - 1;
    const base = '../'.repeat(depth).slice(0,-1);

    return {
      path: relPath,
      base: base,
      htmlBase: `${base}/html`,
      cssBase: `${base}/css`,
      imgBase: `${base}/img`,
      // jsBase: `${base}/js`,
      port: port,
    };
  }

  const nunjucksOptions = {
    path: './src/html',
    ext: '.html',
    envOptions: {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    }
  }

  const insertTabIndent = (file, enc, callback) => {
    // <!-- disableAutoIndent --> 주석이 있는 파일은 auto indent 제외
    if(file.contents.includes('<!-- disableAutoIndent -->')) return callback(null, file);

    const indentHTML = indent.html(String(file.contents), { tabString: '	' });

    file.contents = Buffer.from(indentHTML);

    return callback(null, file);
  }

  const reportTask = () => {
    if(isSingleFile) {
      if(isSingleFile && !isIncFile && !isComponentsFile) {
        console.log('\x1b[35m%s\x1b[0m', 'buildHtml', `Changed : ./${filepath.replace('\\', '/')}`);
      } else {
        console.log('\x1b[35m%s\x1b[0m', 'buildHtml', `Changed : ./src/html/**/*.html`);
      }
    }
  }

  return src(srcPath, scrOptions)
  .pipe(data(replacePath))
  .pipe(nunjucksRender(nunjucksOptions))
  .on('error', console.error)
  .pipe(through2({ objectMode: true }, insertTabIndent))
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.reporter())
  .pipe(dest(`${baseDir}`))
  .pipe(browserSyncReload({ stream: true }))
  .on('end', reportTask);

};

const html = series(delHtml, buildHtml);

/* ---------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------- */

const delSprite = () => {
  const distPath = [
    `${baseDir}/img/sprite/**/*.png`,
    `${baseDir}/img/sprite/**/*.webp`,
    `./src/scss/vendors/*-sprite.scss`
  ];

  return del(distPath);
};

const createSprite = () => {
  const stream = merge();

  listFilepaths('./src/img/sprites')
  .then(filepaths => {
    const dirs = [
      ...new Set(
        filepaths && filepaths.map((v) => {
          let dir = v.split(path.sep);
          dir.pop();
          dir = dir.join(path.sep);
          dir = path.relative('./src/img/sprites', dir);

          return dir;
        })
      )
    ];

    return dirs;
  })
  .catch(console.error)
  .then(dirs => {
    dirs.forEach((dir, index) => {
      const spriteData = src(`./src/img/sprites/${dir}/**/*.png`)
      .pipe(spritesmith({
        spritesmith: (options, sprite, icons) => {
          options.imgPath = `@@img/sprites/${options.imgName.slice(0,options.imgName.length - 3)}webp`;
          options.cssName = `_${sprite}-sprite.scss`;
          options.cssTemplate = null;
          options.cssSpritesheetName = sprite;
          options.padding = 10;
          options.cssVarMap = (sp) => {
          sp.name = `${sprite}-${sp.name}`;
        };
          return options;
        }
      }))
      .on('error', err => {
        console.log(err)
      });
      const imgStream = spriteData.img
      .pipe(buffer())
      .pipe(gulpWebp({quality: 100}))
      .pipe(dest(`${baseDir}/img/sprites`));
      const cssStream = spriteData.css.pipe(dest(`./src/scss/vendors`));

      stream.add(imgStream);
      stream.add(cssStream);
    });
  });

  return stream;
};

const sprite = series(delSprite, createSprite);

/* ---------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------- */

const delStyle = () => {
  const distPath = `${baseDir}/css`;
  return del(distPath);
}

const lintStyle = data => {
  const stylelintrc = require('./.stylelintrc.json');
  const isSingleFile = typeof data === 'object';
  const srcPath = isSingleFile
  ? data.srcPath
  : [
    './src/scss/**/*.scss',
    '!./src/scss/vendors/**/*.scss',
    '!./src/scss/base/_reset.scss',
    '!./src/scss/base/_base.scss'
  ];
  let errorLength = 0;

  const srcOptions = { allowEmpty: true };
  const reportOpt = {
    clearReportedMessages: true,
    clearMessages: true,
    throwError: false,
    filter: () => {
      errorLength += 1;

      return true;
    }
  };
  const fixScss = (file, enc, callback) => {
    const filePath = path.relative('./', file.path);

    if(isSingleFile && errorLength) {
      const watchScss = data.watchScss;

      watchScss.unwatch(filePath);
      setTimeout(() => watchScss.add(filePath), 1000);
      errorLength = 0;
    }

    stylelint.lint({
      files: filePath,
      fix: true,
      customSyntax: syntax_scss
    });

    return callback(null, file);
  }

  return src(srcPath, srcOptions)
  .pipe(postcss([
    stylelint(stylelintrc),
    reporter(reportOpt)
  ], { syntax: syntax_scss }))
  .pipe(through2({ objectMode: true }, fixScss));
}

const buildStyle = filepath => {
  const isSingleFile = typeof filepath === 'string';
  const srcPath = './src/scss/**/*.scss';
  const srcOptions = {
    allowEmpty: true,
    sourcemaps: false
  };
  const sassOptions = {
    indentType: 'tab',
    indentWidth: 1,
    errLogToConsole: true,
    outputStyle: 'compressed'
  };
  const replacePath = function() {
    const relPath = path.relative('./src/scss', this.file.path);
    const paths = relPath.split(path.sep);
    const depth = paths.length;
    const base = '../'.repeat(depth).slice(0, -1);

    return `${base}/img${depth > 2 ? `/${paths[1]}` : ''}`;
  }
  const autoprefixerOptions = {
    cascade: true,
    remove: false
  }
  const reportTask = () => {
    if(isSingleFile) {
      console.log('\x1b[35m%s\x1b[0m', 'buildStyle', `Changed : ./${filepath.replace('\\', '/')}`);
    }
  }
  
  return src(srcPath, srcOptions)
  .pipe(sassGlob())
  .pipe(sass(sassOptions)
  .on('error', sass.logError))
  .pipe(replace('@@img', replacePath))
  .pipe(autoprefixer(autoprefixerOptions))
  .pipe(postcss([mqpacker({sort: sortCSSmq})]))
  .pipe(dgbl())
  .pipe(dest(`${baseDir}/css`, { sourcemaps: false }))
  .pipe(browserSyncReload({ stream: true }))
  .on('end', reportTask);
}

const style = series(delStyle, lintStyle, buildStyle);

/* ---------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------- */

const watchFiles = () => {
  const copyTask = (task, parameter) => {
    const cloneTask = () => task(parameter);
    cloneTask.displayName = task.name;
    return cloneTask;
  };

  const watchHtml = (type, file) => {
    const srcPath = path.relative('./', file);
    const isIncHtml = file.includes('@inc');
    const isPopupHtml = file.includes('popup');

    if(type === 'delete' && (isIncHtml || isPopupHtml)) {
      series(delHtml, copyTask(buildHtml, srcPath))();
    } else {
      series(copyTask(type === 'change' ? buildHtml : delHtml, srcPath))();
    }
  };

  watch('./src/**/*.html')
    .on('add', file => watchHtml('change', file))
    .on('change', file => watchHtml('change', file))
    .on('unlink', file => watchHtml('delete', file));

  
  const watchStyle = file => {
    const srcPath = path.relative('./', file);
    const ignore = ['vendors'];
    const isIgnoreFile = file.split(path.sep).some(srcWord => ignore.includes(srcWord));

    if (isIgnoreFile) {
      series(copyTask(buildStyle, srcPath))();
    } else {
      series(
        copyTask(lintStyle, { srcPath: srcPath, watchScss: watch('./src/scss/**/*.scss') }),
        copyTask(buildStyle, srcPath)
      )();
    }
  };

  watch('./src/scss/**/*.scss')
    .on('add', watchStyle)
    .on('change', watchStyle)
    .on('unlink', watchStyle);

    const watchSprites = file => {
      const srcPath = path.relative('./', file);
      series(copyTask(createSprite, srcPath), buildStyle)();
    };

    watch('./src/img/sprites/**/*.png')
      .on('add', watchSprites)
      .on('change', watchSprites)
      .on('unlink', watchSprites);  
    
    browserSyncReload();
}

/* ---------------------------------------------------------------------------------- */


const dev = series(parallel(html, series(sprite, style)), serve, watchFiles);

export const build = parallel(html, series(sprite, style));
export const watchFile = parallel(serve, watchFiles);
export default dev;
'use strict';

// load plugins
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const cssNano = require('cssnano');
const postCSS = require('gulp-postcss');
const plumber = require('gulp-plumber');
const esLint = require('gulp-eslint');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const gulp = require('gulp');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');

// load config
const CONFIG = require('./gulpfile.config');

// remove files for fresh build
function clean() {
  return del(CONFIG.clean);
}

// initialize browser sync
function initServe(done) {
  browserSync.init({
    server: {
      baseDir: './dist/'
    },
    port: 8080
  });
  done();
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// compile styles specific for DropLoad
function dlStyles() {
  return gulp
      .src(CONFIG.styles.src)
      .pipe(plumber())
      // normal file
      .pipe(sourceMaps.init())
      .pipe(gulpSass({ outputStyle: 'expanded' }))
      .pipe(gulp.dest(CONFIG.styles.dist))
      // minified versions
      .pipe(rename({ suffix: '.min' }))
      .pipe(postCSS([autoprefixer(['last 2 versions']), cssNano()]))
      .pipe(gulp.dest(CONFIG.styles.dist))
      // concatenated
      .pipe(concat('app.css'))
      .pipe(gulp.dest(CONFIG.styles.dist))
      .pipe(browserSync.stream());
}

// generate images
function copyImages() {
  return gulp.src(CONFIG.images.src)
      .pipe(changed(CONFIG.images.dist))
      .pipe(gulp.dest(CONFIG.images.dist))
      .pipe(imagemin({
        optimizationLevel: 5,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true
      }))
      .pipe(rename({ suffix: '_minified' }))
      .pipe(gulp.dest(CONFIG.images.dist));
}

// lint all styles
function lintStyles() {
  return gulp
      .src([CONFIG.styles.src])
      .pipe(plumber())
      .pipe(sassLint())
      .pipe(sassLint.format())
      .pipe(sassLint.failOnError());
}

function scripts() {
  return (
    gulp
        .src(CONFIG.scripts.src)
        .pipe(plumber())
        // normal file
        .pipe(sourceMaps.init())
        .pipe(babel({
          presets: ['@babel/env']
        }))
        .pipe(gulp.dest(CONFIG.scripts.dist))
        // minified
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(CONFIG.scripts.dist))
        // concatenated
        .pipe(concat('app.js'))
        .pipe(gulp.dest(CONFIG.scripts.dist))
        .pipe(browserSync.stream())
  );
}


function lintScripts() {
  return gulp
      .src(CONFIG.scripts.src)
      .pipe(plumber())
      .pipe(esLint())
      .pipe(esLint.format())
      .pipe(esLint.failOnError());
}

// file watchers
function watchFiles() {
  gulp.watch(CONFIG.styles.watch, gulp.parallel(dlStyles, lintStyles));
  gulp.watch(CONFIG.scripts.watch, gulp.parallel(scripts, lintScripts));
  gulp.watch(CONFIG.html.watch, html, browserSyncReload);
  gulp.watch(CONFIG.fonts.watch, fonts, browserSyncReload);
}

function copyHtml() {
  return (
    gulp
        .src(CONFIG.html.src)
        .pipe(gulp.dest(CONFIG.html.dist))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(rename({ suffix: '_min' }))
        .pipe(gulp.dest(CONFIG.html.dist))
        .pipe(browserSync.stream())
  );
}

function copyFonts() {
  return (
    gulp
        .src(CONFIG.fonts.src)
        .pipe(gulp.dest(CONFIG.fonts.dist))
        .pipe(browserSync.stream())
  );
}

const js = gulp.parallel(scripts, lintScripts);
const styles = gulp.parallel(dlStyles, lintStyles);
const images = gulp.parallel(copyImages);
const html = gulp.parallel(copyHtml);
const fonts = gulp.parallel(copyFonts);
const build = gulp.series(clean, gulp.parallel(styles, js, images, html, fonts));
const watch = gulp.parallel(watchFiles, initServe);
const dev = gulp.series(build, watch);

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.dev = dev;
exports.default = build;

'use strict';

// load plugins
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass')(require('sass'));
const cssNano = require('cssnano');
const postCSS = require('gulp-postcss');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const gulp = require('gulp');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const injectPartials = require('gulp-inject-partials');

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
function compileStyles() {
  return (
    gulp
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
        .pipe(browserSync.stream())
  );
}

// generate images
function copyImages() {
  return (
    gulp.src(CONFIG.images.src)
        .pipe(changed(CONFIG.images.dist))
        .pipe(gulp.dest(CONFIG.images.dist))
        .pipe(imagemin({
          optimizationLevel: 5,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          interlaced: true
        }))
        .pipe(rename({ suffix: '_minified' }))
        .pipe(gulp.dest(CONFIG.images.dist))
        .pipe(browserSync.stream())
  );
}

// generate scripts
function scripts() {
  return (
    gulp
        .src(CONFIG.scripts.src)
        .pipe(plumber())
        // normal file
        .pipe(sourceMaps.init())
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

// copy and minify html
function copyHtml() {
  return (
    gulp
        .src(CONFIG.html.src)
        .pipe(injectPartials())
        .pipe(gulp.dest(CONFIG.html.dist))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(rename({ suffix: '_min' }))
        .pipe(gulp.dest(CONFIG.html.dist))
        .pipe(browserSync.stream())
  );
}

// copy font
function copyFonts() {
  return (
    gulp
        .src(CONFIG.fonts.src)
        .pipe(gulp.dest(CONFIG.fonts.dist))
        .pipe(browserSync.stream())
  );
}

// copy already generated css
function copyCss() {
  return (
    gulp
        .src(CONFIG.css.src)
        .pipe(gulp.dest(CONFIG.css.dist))
        .pipe(browserSync.stream())
  );
}

// file watchers
function watchFiles() {
  gulp.watch(CONFIG.styles.watch, compileStyles, browserSyncReload);
  gulp.watch(CONFIG.scripts.watch, scripts, browserSyncReload);
  gulp.watch(CONFIG.html.watch, html, browserSyncReload);
  gulp.watch(CONFIG.fonts.watch, fonts, browserSyncReload);
  gulp.watch(CONFIG.css.watch, styles, browserSyncReload);
}

const js = gulp.parallel(scripts);
const styles = gulp.parallel(compileStyles, copyCss);
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

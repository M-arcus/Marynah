module.exports = {
  scripts: {
    src: 'src/js/**/*.js',
    dist: 'dist/js',
    watch: 'src/js/**/*.js'
  },
  styles: {
    src: 'src/scss/**/*.scss',
    dist: 'dist/css',
    watch: 'src/scss/**/*.scss'
  },
  fonts: {
    src: 'src/fonts/**/*.*',
    dist: 'dist/fonts',
    watch: 'src/fonts/**/*.*'
  },
  html: {
    src: 'src/*.html',
    dist: 'dist',
    watch: 'src/*.html'
  },
  images: {
    src: 'src/img/**/*.*',
    dist: 'dist/img'
  },
  clean: [
    'dist'
  ]
};

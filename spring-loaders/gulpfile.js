'use strict';

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const beautify = require('gulp-cssbeautify');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

// SASS
gulp.task('sass', () => {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass({
      onError(err) {
        let file = err.file.split('/').pop();
        let message = 'FILE: ' + file + ':' + err.line + ':' + err.column;
        console.log('Error', 'CSS', message);
      },
      outputStyle: 'nested'
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(beautify({
      indent: '  ',
      autosemicolon: true
    }))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', () => {
  return gulp.src([
      'src/scripts/vendors/*.js',
      'src/scripts/Polygon.js',
      'src/scripts/Spinner.js',
      'src/scripts/demo.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', (e) => {
      console.log(e);
    })
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());
});

// Task for grid demo only.
gulp.task('js-grid', () => {
  return gulp.src([
      'src/scripts/vendors/*.js',
      'src/scripts/Polygon.js',
      'src/scripts/Spinner.grid.js',
      'src/scripts/demo.grid.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', (e) => {
      console.log(e);
    })
    .pipe(concat('main.grid.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());
});

// Default task
gulp.task('default', ['js', 'js-grid'/*, 'sass'*/], () => {

  browserSync.init({
    server: {
      baseDir: './build'
    }
  });

  // gulp.watch('src/**/*.scss', ['sass']);
  gulp.watch('src/**/*.js', ['js', 'js-grid']);
});

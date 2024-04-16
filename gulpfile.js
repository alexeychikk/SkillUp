var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var autoPrefixer = require('gulp-autoprefixer');
//if node version is lower than v.0.1.2
require('es6-promise').polyfill();
var cssComb = require('gulp-csscomb');
var cmq = require('gulp-merge-media-queries');
var minifyCss = require('gulp-minify-css');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('css',function(){
    return gulp.src(['front/**/*.css'])
        .pipe(plumber())
        .pipe(autoPrefixer())
        .pipe(cssComb())
        .pipe(cmq({log:true}))
        .pipe(concat('main.css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist'));
});
gulp.task('js',function(){
    return gulp.src(['front/app.module.js', 'front/app.constants.js', 'front/app.config.js', 'front/app.run.js',
        'front/**/!(app.module, app.constants, app.config, app.run)*.js'])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(ngAnnotate())
        .pipe(browserify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
gulp.task('html',function(){
    return gulp.src(['front/**/*.html'])
        .pipe(plumber())
        .pipe(minifyHtml())
        .pipe(gulp.dest('dist'));
});
gulp.task('images', function() {
    return gulp.src('front/images/*').pipe(gulp.dest('dist/images'));
});
gulp.task('clean', function() {
    return del(['dist']);
});
gulp.task('clean-build', function() {
    return runSequence('clean', ['images', 'js', 'css'], 'html');
});
gulp.task('clean-build-reload', function() {
    return runSequence('clean', ['images', 'js', 'css'], 'html', reload);
});

gulp.task('watch', function(){
    browserSync.init({
        proxy: "localhost:80"
    });
    return gulp.watch('front/**/*', ['clean-build-reload']);
});

gulp.task('default', ['clean-build-reload'], function(){
    browserSync.init({
        proxy: "localhost:80",
        open: false
    });
    return gulp.watch('front/**/*', ['clean-build-reload']);
});
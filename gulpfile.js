var browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    cssnano = require('gulp-cssnano'),
    del = require('del'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    ngAnnotate = require('gulp-ng-annotate'),
    prefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    strip = require('gulp-strip-comments');


gulp.task('default',function()
{

});


gulp.task('concatAndStash',['clean'], function ()
{
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(gulp.dest('tmp'));
});

gulp.task('minifyCss', function()
{
    return gulp.src('tmp/styles/main.css')
    .pipe(cssnano())
    .pipe(gulp.dest('build/styles'));
});

gulp.task('uglifyJs', function()
{
    return gulp.src('app/scripts/services.js')
        .pipe(strip())
        .pipe(sourcemaps.init())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
});



gulp.task('clean', function()
{
    return del(['tmp','build']);
});    
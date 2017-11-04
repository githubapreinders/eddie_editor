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
    useref = require('gulp-useref');

gulp.task('default',function()
{

});

gulp.task('js', function () {
    gulp.src(['app/js/jquery.js','app/js/angular.js','app/js/controller.js', 'app/js/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'))
});

    gulp.task('js_dev', ['checkJs'], function () {
        gulp.src(['app/scripts/*.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('main.min.js'))
            .pipe(ngAnnotate())
            //.pipe(uglify()) throws an error with ES6 class declaration TODO
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('app/js'))
    })

gulp.task('compile_sass',function()
{
return gulp.src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(prefixer({browsers:['last 2 versions', 'ios_saf >=5', 'safari >=7']}))
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.stream());
});

gulp.task('copy_css',['compile_sass'], function()
{
 return gulp.src('app/*.html')
     .pipe(useref())
     .pipe(gulpIf('*.css' , cssnano()))
     .pipe(gulp.dest('build'))
});



gulp.task('watch',['browser_Sync', 'compile_sass','js_dev'], function()
{
    gulp.watch('app/scss/**/*.scss', ['compile_sass']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/scripts/*.js', ['js_dev']);
});

gulp.task('checkJs',function()
{
    return gulp.src('app/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(browserSync.stream());
});


gulp.task('browser_Sync',function()
{
browserSync.init(
    {
        server:{baseDir:'app'}
    });
});

gulp.task('browser_Sync_build', function()
{
    browserSync.init(
        {
            server:{baseDir:'build'}
        });
    browserSync.reload;
});



gulp.task('clean', function()
{
    return del(['build']);
});

gulp.task('copy_html', function()
{
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest('build'))
});

gulp.task('copy_fonts', function()
{
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('copy_images', function()
{
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin())
        .pipe(gulp.dest('build/images'));
});

    gulp.task('build',function(callback)
    {
        runSequence('clean',['copy_fonts','copy_images','copy_css','js'],'browser_Sync_build',callback)
    });
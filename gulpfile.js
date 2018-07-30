let gulp = require('gulp');
let serve = require('gulp-serve');
let browserSync = require('browser-sync').create();
let watch = require('gulp-watch');
let sass = require('gulp-sass');
let watchSass = require("gulp-watch-sass");

gulp.task('default', ['sass']);

gulp.task('browser-reload',function () {
    setTimeout(reload, 100);

    function reload() {
        browserSync.reload();
    }
});

gulp.task('browser-sync', function () {
    gulp.watch("app/*.html").on('change', browserSync.reload);
    browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });
});
gulp.task('sass', function () {
    gulp.src('app/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/content/css'));
});
gulp.task('watch', function () {
    gulp.watch('./app/**/*.scss', ['sass']);

});

gulp.task('start', ['sass', 'browser-sync'], function () {
    gulp.watch('app/**/*.scss', ['sass', 'browser-reload']);
    gulp.watch('app/**/*.js', ['browser-reload']);
    gulp.watch('app/**/*.html', ['browser-reload']);
});
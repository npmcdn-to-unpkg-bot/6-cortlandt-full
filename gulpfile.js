var buildDir = '6cortlandt-build';

//GENERAL MODULES
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    changed = require('gulp-changed'),
    babel = require('gulp-babel'),
    replace = require('gulp-replace');
//HTML MINIFIERS
var htmlclean = require('gulp-htmlclean');
//CSS PROCESSING
var sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    mqpacker = require('css-mqpacker'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano');
//POSTCSS PROCESSORS
var postcssprocessors = [
    autoprefixer({ browsers: ['last 3 versions'] }),
    mqpacker,
    cssnano({discardComments: {removeAll: true}})
];
//JS PROCESSING
var uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint');

//IMAGE PROCESSING
var svgstore = require('gulp-svgstore'),
    imagemin = require('gulp-imagemin');

//Generic sass Processor
function sassProcessor(blob, dest) {
  gulp.src(blob)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssprocessors))
    .pipe(gulp.dest(dest));
}
//Generic js Processor
function jsProcessor(blob, dest, newName) {
  gulp.src(blob)
    .pipe(uglify())
    .on('error', console.error.bind(console))
    .pipe(concat(newName))
    .pipe(gulp.dest(dest));
}
//Generic html Processor
function htmlProcessor(blob, dest) {
  gulp.src(blob)
    .pipe(changed(dest))
    .pipe(htmlclean({}))
    .pipe(gulp.dest(dest));
}



//SASS CSS TASK
gulp.task('sass', function () {
  sassProcessor(['sass/main.scss', 'sass/expanded.scss','sass/ie-fixes.scss','sass/editor-styles.scss'], '../'+buildDir+'/css');
});

//JS TASK
gulp.task('js', function () {
  jsProcessor([ 'js/plugins/*.js', 'js/site.js', 'js/modules/*.js'], '../'+buildDir+'/js', 'main.js');

});

//JS LINTING
gulp.task('lint', function() {
  return gulp.src(['js/site.js', 'modules/*.js', 'js/inline-load.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//HTML TASK
gulp.task('templatecrush', function() {
  htmlProcessor(['*.php','*.html','!custom-module-functions.php'], '../'+buildDir);
});


//SVG SPRITE TASK
gulp.task('svgstore', function () {
    return gulp
        .src('assets/svgs/*.svg')
        .pipe(imagemin())
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(gulp.dest('../'+buildDir+'/assets'));
});

//IMAGE MINIFYING TASK
gulp.task('imgmin', function () {
  gulp.src('assets/imgs/**/*')
    .pipe(changed('../'+buildDir+'/assets/imgs'))
    .pipe(imagemin({interlaced: true, progressive: true,svgoPlugins: [{removeViewBox: false}],use: []}))
    .pipe(gulp.dest('../'+buildDir+'/assets/imgs'));
});

//DUMPS
gulp.task('fontdump', function(){
  gulp.src('assets/fonts/**/*')
    .pipe(gulp.dest('../'+buildDir+'/assets/fonts'));
});

gulp.task('wpdump', function(){
  gulp.src(['style.css', 'screenshot.png'])
    .pipe(gulp.dest('../'+buildDir));
});

//PRESS SECTION
gulp.task('presssection', function(){
  gulp.src(['press-section/components/*.js'])
  .pipe(concat('build.js'))
  .pipe(babel({
			presets: ['es2015', 'react']
		}))
  .pipe(uglify({mangle:false}))
  .pipe(replace('$(', 'jQuery('))
  .pipe(gulp.dest('../'+buildDir+'/press-section'));
  jsProcessor([ ], '../'+buildDir+'/press-section', 'plain.js');

  sassProcessor(['press-section/main.scss'],'../'+buildDir+'/press-section')
  htmlProcessor(['press-section/*.html','press-section/*.php'],'../'+buildDir+'/press-section')
});

gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['js']);
    gulp.watch(['sass/**/*'], ['sass']);
    gulp.watch('assets/imgs/**/*', ['imgmin']);
    gulp.watch('assets/fonts/**/*', ['fontdump']);
    gulp.watch(['*.php', '*.html'], ['templatecrush']);
    gulp.watch(['style.css', 'screenshot.png'], ['wpdump']);
    gulp.watch(['assets/svgs/*.svg'], ['svgstore']);
    gulp.watch(['press-section/**/*'], ['presssection']);
});
gulp.task('build', [ 'js', 'imgmin', 'templatecrush', 'fontdump', 'wpdump','sass', 'svgstore', 'presssection']);

'use strict'

import gulp        from 'gulp';
import sass        from 'gulp-sass';
import sourcemaps  from 'gulp-sourcemaps';
import concat      from 'gulp-concat';
import gutil       from 'gulp-util';
import babel       from 'gulp-babel';
import browserSync from 'browser-sync';
import browserify  from 'browserify';
import babelify    from 'babelify';
import source      from 'vinyl-source-stream';
import buffer      from 'vinyl-buffer';
import ghPages     from 'gulp-gh-pages';

const scssSrcPath = './src/styles/**/*.scss';
const jsSrcPath   = './src/js/**/*.{js,jsx}';
const imgSrcPath  = './src/imgs/**/*.{gif,jpg,jpeg,png}';
const htmlSrcPath = './src/**/*.html';
const dataSrcPath = './src/data/**/*.{json,md}';

const assetsPath  = './public/assets';

// SASS Rendering
gulp.task('build-scss', () => gulp
  .src(scssSrcPath)
  .pipe(sourcemaps.init()) // Add the map to modified source.
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write()) // Add the map to modified source.
  .pipe(gulp.dest(assetsPath + '/styles'))
);

// JS minify and concat
gulp.task('build-js', () => browserify({
    extensions: ['.js', '.jsx'],
    entries: 'src/js/index.js',
    paths: ['./node_modules','./src/js/']
  })
  .transform(babelify.configure({
      ignore: /(bower_components)|(node_modules)/
  }))
  .bundle()
  .on("error", function (err) { console.log("Error : " + err.message); })
  .pipe(source('app.js'))
  // .pipe('buffer')
  // .pipe(sourcemaps.init())
  // // .pipe(concat('app.js'))
  // //only uglify if gulp is ran with '--type production'
  // .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
  // .pipe(sourcemaps.write())
  .pipe(gulp.dest(assetsPath + '/js'))
);

gulp.task('copy-html', () => gulp
  .src(htmlSrcPath)
  .pipe(gulp.dest('./public/'))
);

gulp.task('copy-img', () => gulp
  .src(imgSrcPath)
  .pipe(gulp.dest(assetsPath + '/imgs'))
);

gulp.task('copy-data', () => gulp
  .src(dataSrcPath)
  .pipe(gulp.dest(assetsPath + '/data'))
);

gulp.task('copy-fonts', () => gulp
  .src('node_modules/font-awesome/fonts/*')
  .pipe(gulp.dest(assetsPath + '/fonts'))
);

gulp.task('default', [
  'build-scss',
  'build-js',
  'copy-img',
  'copy-html',
  'copy-data',
  'copy-fonts'
]);

// Watch task
gulp.task('watch', ['default'], () => {
  browserSync.create().init({
    server: {
      baseDir: "./public"
    }
  });

  gulp.watch(scssSrcPath, ['build-scss']);
  gulp.watch(jsSrcPath,   ['build-js']);
  gulp.watch(htmlSrcPath, ['copy-html']);
  gulp.watch(imgSrcPath,  ['copy-img']);
});

gulp.task('deploy', function() {
  return gulp.src('./public/**/*')
    .pipe(ghPages());
});

(function () {
  var jade = require('jade'),
    path = require("path"),
    _ = require("lodash"),
    fs = require("fs"),
    gulp = require("gulp"),
    gulpJade = require("gulp-jade"),
    gulpData = require('gulp-data'),
    gulpStylus = require('gulp-stylus'),
    gulpVulcanize = require("gulp-vulcanize"),
    del = require("del");

  // see https://github.com/Polymer/web-component-tester#gulp
  require('web-component-tester').gulp.init(gulp);
  // XXX HACK submit PR to wct guys or write gulp plugin replacement
  ['test', 'test:local', 'test:remote'].forEach(function (task) {
    gulp.tasks[task].dep.push('build');
  });

  var pkgName = require("./package.json").name;
  var srcPath = 'src';
  var paths = {
    src: srcPath,
    clean: ['*.html', '*.css', 'test/*.html', 'test', 'dist/*.html', 'dist'],
    dest: '.',
    testSrc: path.join(srcPath, 'test/*.jade'),
    testDest: 'test',
    elementSrc: path.join(srcPath, '*.jade'),
    elementDest: '.',
    stylusSrc: path.join(srcPath, pkgName + '.styl'),
    stylusDest: '.',
    vulcanSrc: pkgName + '.html',
    vulcanDest: 'dist'
  };
  var options = {
    jade: {
      jade: jade,
      pretty: true
    },
    vulcanize: {
      dest: paths.dest,
      strip: true,
      inline: true
    }
  };


  // This is how you add custom filters to jade. Could not find documentation
  // on this feature.
  jade.filters.escape = function( block ) {
    return _.escape(block);
  };

  // see https://github.com/phated/gulp-jade#use-with-gulp-data
  var getJsonData = function(file, cb) {
    var jsonPath = file.path.replace(/\.jade$/, '.json');
    fs.exists(jsonPath, function (exists) {
      if (exists) {
        fs.readFile(jsonPath, {encoding: 'utf8'}, function (err, data) {
          var json;
          if (err) return cb(err);
          try {
            json = JSON.parse(data);
          } catch (e) {
            return cb(e);
          }
          cb(null, json);
        });
      } else
        cb(null, {});
    });
  };
  gulp.task('clean', function (done) {
    del(paths.clean, done);
  });
  // see https://github.com/stevelacy/gulp-stylus
  // see http://learnboost.github.io/stylus/
  gulp.task('stylus', function () {
    gulp.src(paths.stylusSrc)
      .pipe(gulpStylus({
        sourcemap: {
          inline: true,
          sourceRoot: paths.src,
          basePath: paths.dest
        }
      }))
      .pipe(gulp.dest(paths.stylusDest));
  });
  // see https://github.com/phated/gulp-jade
  // see http://jade-lang.com/
  gulp.task("jade:test", function () {
    return gulp.src(paths.testSrc)
      .pipe(gulpData(getJsonData))
      .pipe(gulpJade(options.jade))
      .pipe(gulp.dest(paths.testDest));
  });
  gulp.task("jade:element", function () {
    return gulp.src(paths.elementSrc)
      .pipe(gulpData(getJsonData))
      .pipe(gulpJade(options.jade))
      .pipe(gulp.dest(paths.elementDest));
  });
  gulp.task("jade", ['stylus', 'jade:test', 'jade:element']);
  // see https://github.com/sindresorhus/gulp-vulcanize
  // see https://github.com/polymer/vulcanize
  gulp.task("vulcanize", ["jade"], function () {
    return gulp.src(paths.vulcanSrc)
      .pipe(gulpVulcanize(options.vulcanize))
      .pipe(gulp.dest(paths.vulcanDest));
  });
  gulp.task("build", ["jade", "vulcanize"]);
  gulp.task("watch", function () {
    gulp.watch([paths.testSrc, paths.elementSrc], ['build']);
  });
})();

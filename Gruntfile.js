module.exports = function (grunt) {

  var path = require('path');
  var logLevel = grunt.cli.options.debug ? 'trace' : 'info';

  logLevel = grunt.option('log-level') || logLevel;

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true
      },
      all: [ 'Gruntfile.js', 'index.js', 'lib/**/*.js' ]
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: [ 'test/*.js' ]
    },

    clean: {
      "app": [ 'test/fake-titanium-app/build' ],
      "modules": [ 'test/fake-titanium-app/modules' ],
      "spec": [ 'test/fake-titanium-app/Resources/spec' ]
    },

    titaniumifier: {
      "module": {}
    },

    titanium: {
      options: {
        command: 'build',
        logLevel: logLevel,
        projectDir: './test/fake-titanium-app',
        failure: /TESTS WITH FAILURES/i,
        success: /TESTS ALL OK/i
      },
      "ios": { options: { platform: 'ios' } },
      "droid": { options: { platform: 'android' } }
    },

    unzip: {
      "module": {
        src: '<%= pkg.name %>-commonjs-<%= pkg.version %>.zip',
        dest: 'test/fake-titanium-app'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-titanium');
  grunt.loadNpmTasks('grunt-titaniumifier');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('copy:specs', 'Copies specs into the titanium app', function () {
    var resourcesDir = 'test/fake-titanium-app/Resources';
    var specsDir = resourcesDir + '/spec';

    grunt.file.mkdir(specsDir);
    grunt.file.glob.sync('test/*.js').forEach(function (file) {
      grunt.file.copy(file, specsDir + '/' + path.basename(file));
    });

    grunt.file.copy(
      require.resolve('ti-mocha/ti-mocha'), resourcesDir + '/ti-mocha.js');
    grunt.file.copy(
      require.resolve('should/should'), resourcesDir + '/should.js');
  });

  grunt.registerTask('test:node', [ 'mochaTest' ]);

  grunt.registerTask('build:titanium', [ 'titaniumifier:module' ]);
  grunt.registerTask('test:ios', [ 'unzip:module', 'copy:specs', 'titanium:ios' ]);
  grunt.registerTask('test:droid', [ 'unzip:module', 'copy:specs', 'titanium:droid' ]);

  grunt.registerTask('ios', [ 'jshint:all', 'clean', 'build:titanium', 'test:ios' ]);
  grunt.registerTask('droid', [ 'jshint:all', 'clean', 'build:titanium', 'test:droid' ]);
  grunt.registerTask('node', [ 'jshint:all', 'test:node' ]);

  grunt.registerTask('default', [ 'node' ]);

};

module.exports = function (grunt) {

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
      "modules": [ 'test/fake-titanium-app/modules' ],
      "app": [ 'test/fake-titanium-app/build' ]
    },

    titaniumifier: {
      "module": {}
    },

    titanium: {
      "ios": {
        options: {
          command: 'build',
          logLevel: 'trace',
          projectDir: './test/fake-titanium-app',
          platform: 'ios'
        }
      },
      "droid": {
        options: {
          command: 'build',
          logLevel: 'trace',
          projectDir: './test/fake-titanium-app',
          platform: 'android',
          deviceId: grunt.option('device-id')
        }
      }
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

  grunt.registerTask('test:node', [ 'mochaTest' ]);

  grunt.registerTask('build:titanium', [ 'titaniumifier:module' ]);
  grunt.registerTask('test:ios', [ 'unzip:module', 'titanium:ios' ]);
  grunt.registerTask('test:droid', [ 'unzip:module', 'titanium:droid' ]);

  grunt.registerTask('ios', [ 'jshint:all', 'clean', 'build:titanium', 'test:ios' ]);
  grunt.registerTask('droid', [ 'jshint:all', 'clean', 'build:titanium', 'test:droid' ]);
  grunt.registerTask('node', [ 'jshint:all', 'test:node' ]);

  grunt.registerTask('default', [ 'node' ]);

};

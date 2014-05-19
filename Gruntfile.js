'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      before: ['templates/'],
      after: ['.tmp']
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd:'src/templates/',
          src: ['**'],
          dest: 'templates/',
          filter: 'isFile'
        },
        {
          expand: true,
          cwd:'./',
          src: ['src/public/**', '!src/public/**/*.js', '!src/public/**/*.css'],
          dest: 'public/',
          filter: 'isFile'
        }]
      },
      bowerjsdeps: {
        files: [
          {expand: true,
           flatten: true,
           src: ['bower_components/jquery/dist/jquery.js',
                 'bower_components/bootstrap/dist/js/bootstrap.js',],
           dest: 'src/public/scripts/vendor/',
           filter: 'isFile'} // flattens results to a single level
        ]
      },
      bowercssdeps: {
        files: [
          {expand: true,
           flatten: true,
           src: ['bower_components/bootstrap/dist/css/bootstrap.css',
                 'bower_components/bootstrap/dist/css/bootstrap-theme.css'],
           dest: 'src/public/styles/vendor/',
           filter: 'isFile'} // flattens results to a single level
        ]
      },
    },
    useminPrepare: {
      html: 'templates/**/*.html',
      options: {
        root: './',
        dest: './'
      }
    },
    usemin: {
      html: 'templates/**/*.html',
      options: {
        assetsDirs: ['./']
      }
    },
    uglify: {
      otpions: {
        preserveComments: 'some'
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 1
      }
    },
    rev: {
      main: {
        files: {
          source: ['public/**/*.{js,css}']
        }
      }
    },
    htmlmin: {
      main: {
        files: [{
          expand: true,
          cwd: 'templates/',
          src: '{,*/}*.html',
          dest: 'templates/'
        }],
        options: {
          removeComments: true,
          collapseWhitespace: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-rev');

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['clean:before', 'copy', 'useminPrepare',
    'concat', 'uglify', 'cssmin', 'rev', 'usemin', 'htmlmin',
    'clean:after']);
};

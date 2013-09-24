module.exports = function(grunt) {
  grunt.initConfig({

    clean: ['dist'],

    useminPrepare: {
      options: {
        dest: 'dist'
      },
      html: ['src/*.html']
    },

    cssmin: {
    },

    copy: {
      main: {
        files: [
          {expand: true,
           flatten: true,
           src: ['src/*'],
           dest: 'dist/',
           filter: 'isFile'} // flattens results to a single level
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '{,*/}*.html',
          dest: 'dist'
        }]
      }
    },

    rev: {
      files: {
        src: ['dist/**/*.{js,css,png,jpg}']
      }
    },

    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/{,*/}*.css'],
      options: {
        dirs: ['dist']
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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('minify-js', ['uglify']);
  grunt.registerTask('minify-css', ['cssmin']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['clean',
                                 'copy',
                                 'useminPrepare',
                                 'concat',
                                 'cssmin',
                                 'uglify',
                                 'rev',
                                 'usemin',
                                 'htmlmin']);
};

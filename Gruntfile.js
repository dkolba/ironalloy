module.exports = function(grunt) {
  grunt.initConfig({

    cssmin: {
      add_banner: {
        options: {
          banner: '/* Minify all css files */'
        },
        files: {
        'public/css/bootstrap.min.css': ['bower_components/bootstrap/dist/css/bootstrap.css']
        }
      }
    },

    uglify: {
      my_target: {
        files: {
          'public/js/scripts.min.js':
            ['bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/jquery/jquery.js']
        }
      },
      options: {
        compress: {
          global_defs: {
            "DEBUG": false,
          dead_code: true
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('minify-css', ['cssmin']);
  grunt.registerTask('minify-js', ['uglify']);
  grunt.registerTask('default', ['cssmin','uglify']);
};

module.exports = function(grunt) {
  grunt.initConfig({

    recess: {
      dist: {
        options: {
          compile: true
        },
        files: {
          'public/css/adminbootstrap.css': [
            'bower_components/bootstrap/less/bootstrap.less',
            'bower_components/bootstrap/less/theme.less'
          ]
        }
      }
    },

    cssmin: {
      add_banner: {
        options: {
          banner: '/* Minify all css files */'
        },
        files: {
        'public/css/adminbootstrap.min.css': ['public/css/adminbootstrap.css']
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

  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('bootstrap', ['recess']);
  grunt.registerTask('minify-css', ['cssmin']);
  grunt.registerTask('minify-js', ['uglify']);
  grunt.registerTask('default', ['recess', 'cssmin','uglify']);
};

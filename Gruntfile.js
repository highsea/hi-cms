module.exports = function(grunt) {
    //init初始化
    grunt.initConfig({
        //读取 package
        pkg : grunt.file.readJSON('package.json'),
        //合并插件的 设置
        concat : {
            options : {
                stripBanners: true,
                // 正则匹配文件
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            // 原始位置，输出位置
            dist : {
                src: ['public/javascripts/a.js', 'public/javascripts/b.js'],
                dest: 'public/assets/built.js'
            }
        },
        //压缩插件的设置
        uglify : {
            options : {
                banner : '/*! <%= pkg.name %> '+
                         '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build : {
                src : 'public/assets/built.js',
                dest : 'public/assets/built.min.js'
            }
        }
    });
    //载入执行依赖
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //注册任务 
    grunt.registerTask('default', ['concat', 'uglify']);
};
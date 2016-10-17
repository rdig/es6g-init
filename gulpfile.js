const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;
const del = require('del');

const runType = process.argv[process.argv.length-1].slice(2);

const configObject = {
	paths: {
		build: path.resolve('build'),
		source: path.resolve('source')
	},
	extensions: {
		js: '*.js',
		jsMin: '*.min.js'
	},
	settings: {}
};

gulp.task('clean', [], () => del(configObject.paths.build + '/*'));

gulp.task('transpile', [], () => {});

gulp.task('server', ['clean'], () => {});

gulp.task('watch', ['clean'], () => {});

gulp.task(
	'default',
	(runType === 'browser') ? ['server', 'watch'] : ['watch']
);

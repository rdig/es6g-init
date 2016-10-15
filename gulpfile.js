const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;

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

gulp.task('clean', [], () => {});

gulp.task('move', ['clean'], () => {});

gulp.task('transpile', ['move'], () => {});

gulp.task('server', ['transpile'], () => {});

gulp.task('watch', ['transpile'], () => {});

gulp.task(
	'default',
	runType === 'browser' ? ['server', 'watch'] : ['transpile', 'watch']
);

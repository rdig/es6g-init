const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;
const del = require('del');
const babel = require('gulp-babel');

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
	settings: {
		babel: {
			presets: ['es2015', 'stage-0'],
			comments: false
		}
	}
};

del.sync(configObject.paths.build + '/*');

gulp.task('move', [], () => {

	gulp.src(configObject.paths.source + '/**/' + configObject.extensions.jsMin)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

})

gulp.task('transpile/browser', ['move'], () => {

	const fileGlobs = [
		configObject.paths.source + '/**/' + configObject.extensions.js,
		'!' + configObject.paths.source + '/**/' + configObject.extensions.jsMin
	];

	gulp.src(fileGlobs)
		.pipe(
			babel(configObject.settings.babel)
		)
		.on(
			'error',
			console.error.bind(console)
		)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

});

gulp.task('transpile/terminal', [], () => {});

gulp.task('server', ['transpile/browser'], () => {});

gulp.task('watch', [], () => {});

gulp.task(
	'default',
	(runType === 'browser') ? ['server', 'watch'] : ['watch', 'transpile/terminal']
);

const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;
const del = require('del');
const babel = require('gulp-babel');
const inject = require('gulp-inject');

const runType = process.argv[process.argv.length-1].slice(2);

const configObject = {
	paths: {
		build: path.resolve('build'),
		source: path.resolve('source')
	},
	extensions: {
		html: 'index.html',
		js: '*.js',
		jsMin: '*.min.js'
	},
	options: {
		babel: {
			presets: ['es2015', 'stage-0'],
			comments: false
		},
		gulp: {
			src: {
				read: false
			}
		},
		inject: {
			relative: true
		}
	}
};

del.sync(configObject.paths.build + '/*')

gulp.task('move', [], () => {

	gulp.src(configObject.paths.source + '/**/' + configObject.extensions.jsMin)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

});

gulp.task('transpile/browser', ['move'], () => {

	const fileGlobs = [
		configObject.paths.source + '/**/' + configObject.extensions.js,
		'!' + configObject.paths.source + '/**/' + configObject.extensions.jsMin
	];

	gulp.src(fileGlobs)
		.pipe(
			babel(configObject.options.babel)
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

gulp.task('source', ['transpile/browser'], () => {

	gulp.src(configObject.paths.source + '/' + configObject.extensions.html)
		.pipe(
			inject(
				gulp.src(
					configObject.paths.source + '/**/' + configObject.extensions.js,
					configObject.options.gulp.src
				),
				configObject.options.inject
			)
		)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

});

gulp.task('server', ['source'], () => {});

gulp.task('watch', [], () => {});

gulp.task(
	'default',
	(runType === 'browser') ? ['server', 'watch'] : ['watch', 'transpile/terminal']
);

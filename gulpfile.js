const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;
const del = require('del');
const babel = require('gulp-babel');
const inject = require('gulp-inject');
const connect = require('gulp-connect');
const concat = require('gulp-concat');

const runType = process.argv[process.argv.length-1].slice(2);

const configObject = {
	paths: {
		build: path.resolve('build'),
		source: path.resolve('source')
	},
	extensions: {
		html: 'index.html',
		js: '*.js',
		minJs: '*.min.js'
	},
	options: {
		babel: {
			presets: ['es2015', 'stage-0'],
			comments: false,
			ignore: '*.min.js'
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
configObject.options.connect = {
	root: configObject.paths.build,
	port: 8080,
	livereload: true
};

del.sync(configObject.paths.build + '/*');

gulp.task('transpile/browser', [], () => {

	gulp.src(configObject.paths.source + '/**/' + configObject.extensions.js)
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

/*
 * Gulp task: Transpile files using babel w/ presets
 *
 * Notice that we are using an array of file globs, where the minfied files go first. This is
 * because we assume that any minified file is an external library and should be run before our
 * files (non-minified). Also, the minified files will not be transpiled.
 *
 * Since we are running this in a terminal using node, this limits us at running only one file at
 * once. Because of this, we concatenate all the files into one.
 */
gulp.task('transpile/terminal', [], () => {

	const filesGlob = [
		configObject.paths.source + '/**/' + configObject.extensions.minJs,
		configObject.paths.source + '/**/' + configObject.extensions.js
	];

	gulp.src(filesGlob)
		.pipe(
			babel(configObject.options.babel)
		)
		.on(
			'error',
			console.error.bind(console)
		)
		.pipe(
			concat('bundle.js')
		)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

});

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
		)
		.pipe(
			connect.reload()
		);

});

gulp.task('server', ['source'], () => connect.server(configObject.options.connect));

gulp.task('watch', [], () => {});

gulp.task(
	'default',
	(runType === 'browser') ? ['server', 'watch'] : ['watch', 'transpile/terminal']
);

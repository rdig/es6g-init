const gulp = require('gulp');
const path = require('path');
const exec = require('child_process').exec;
const del = require('del');
const babel = require('gulp-babel');
const inject = require('gulp-inject');
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const wait = require('wait-on');

const mode = process.argv[process.argv.length-1].slice(2);

const configObject = {
	paths: {
		build: path.resolve('build'),
		source: path.resolve('source')
	},
	files: {
		bundle: 'bundle.js'
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
		},
		wait: {
			delay: 0,
			interval: 0,
			timeout: 30000,
			window: 0
		}
	}
};
configObject.options.connect = {
	root: configObject.paths.build,
	port: 8080,
	livereload: true
};

/**
 * Helper function to execute our bundle file via nodejs. It clears the console window, calculates
 * the script's execution time, and logs the output to screen.
 * Notice the wait() function which will wait for our file to become available an only then try to
 * execute it.
 *
 * @method terminalExec
 *
 * @param {string} file String containing file name including path
 *
 * @return {bool} Function returns false, since it's used only for display
 */
const terminalExec = (file) => {

	/*
	 * Clear the terminal / console
	 */
	process.stdout.write("\u001b[2J\u001b[0;0H");

	const options = Object.assign(
		{},
		configObject.options.wait,
		{ resources: [file] }
	);
	const startExecution = Date.now();

	/*
	 * Wait for our file to become available else, we get an error
	 */
	wait(options, function (err) {

		if (err) {
			return handleError(err);
		}

		exec('nodejs ' + file, (err, stdout, stderr) => {

			const executionTime = (Date.now() - startExecution);

			const displayTime = 'Execution time: ' + executionTime  + 'ms ';

			/*
			 * Display execution time / delimiter
			 */
			console.log(
				displayTime,
				Array
					.from({ length: process.stdout.columns - displayTime.length - 1})
					.map((column) => column = '-')
					.join(''),
				''
			);

			console.log(stdout);

			if (stderr) {
				console.log(stderr);
			}

		});

		return false;

	});

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
			concat(configObject.files.bundle)
		)
		.pipe(
			gulp.dest(configObject.paths.build)
		);

});

gulp.task('source', ['transpile/browser'], () => {

	const filesGlob = [
		configObject.paths.source + '/**/' + configObject.extensions.minJs,
		configObject.paths.source + '/**/' + configObject.extensions.js
	];

	gulp.src(configObject.paths.source + '/' + configObject.extensions.html)
		.pipe(
			inject(
				gulp.src(filesGlob, configObject.options.gulp.src),
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

/*
 * Gulp task: File watcher for browser / terminal mode
 *
 * Based on the mode we are in (browser/terminal) we start different watchers for file / files
 * types.
 * For the terminal mode, besides the task, after the file change is detected, the watcher will also
 * call a function (helper function to display our bundle in the terminal)
 */
gulp.task('watch', [], () => {

	if (mode === 'browser') {

		gulp.watch(
			[
				configObject.paths.source + '/**/' + configObject.extensions.js,
				configObject.paths.source + '/**/' + configObject.extensions.html
			],
			['source']
		);

	} else {

		const watcher = gulp.watch(
			configObject.paths.source + '/**/' + configObject.extensions.js,
			['transpile/terminal']
		);
		const file = configObject.paths.build + '/' + configObject.files.bundle;

		/*
		 * Execute it initially, then the onChange event will call it for us
		 */
		terminalExec(file);

		watcher.on('change', () => terminalExec(file));

	}

});

/*
 * Gulp task: Default Gulp task
 *
 * Based of the mode that we run in, constructs two different arrays of dependency tasks to
 * call upon
 */
gulp.task(
	'default',
	(mode === 'browser') ? ['server', 'watch'] : ['transpile/terminal', 'watch']
);

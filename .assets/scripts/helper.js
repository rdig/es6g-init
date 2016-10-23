const { exec } = require('child_process');
const fs = require('fs');

/**
 * Wrapper for child_process.exec() method from Node.js's core library.
 *
 * Spawns a shell and executes the command in it, buffering the output.
 * More info: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_op
 * tions_callback
 *
 * @method execute
 *
 * @param {string} command Command to execute
 * @param {string} [workDir=path.resolve()] (optional) Path in which to execute the commmand.
 * Defaults to the current path (./).
 *
 * @return {function} The exec() method with our params
 */
const execute = (command, workDir = path.resolve()) => {
	/*
	 * Warn the user to expect delays.
	 * Since we are not streaming the output (known bug, see issues, please fix), at least we
	 * can do is warn the user to expect a long wait.
	 */
	console.log(
		'This operation will take a long time,',
		'and output will only be shown when done (buffered).',
		'\n',
		'You can go and grab a cup of coffee in the meantime...',
		'\n'
	);
	return exec(
		command,
		{ cwd: workDir },
		(err, stdout, stderr) => {
			if (err) { return console.log(err); }
			if (stderr) { return console.log(stderr); }
			return console.log(stdout);
		}
	);
};

/**
 * Syncronous function to detect if a folder exists.
 *
 * It's basically a wrapper for the fs.lstatSync() method.
 * More info: https://nodejs.org/docs/latest/api/fs.html#fs_fs_lstatsync_path
 *
 * We need to use the try/catch block because the Sync method doesn't have a callback, and because
 * we couldn't use the async method fs.lstat().
 *
 * @method directoryExists
 *
 * @param {string} path The path to check for
 * @param {function} [cbIfTrue] Callback to call if path exists
 * @param {function} [cbIfFalse] Callback to call if path doesn't exist
 *
 * @return {function} The fs.lstatSync() method
 */
const directoryExists = (
	path,
	cbIfTrue = () => console.log('Directory exists'),
	cbIfFalse = () => console.log('Directory does not exist')
) => {
	try {
		fs.lstatSync(path);
		cbIfTrue();
	}
	catch(e) {
		cbIfFalse();
	}
}

module.exports = {
	execute,
	directoryExists
};

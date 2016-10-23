const { exec } = require('child_process');
const path = require('path');

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
		'and output will only be shown when done (buffered).'
	);
	console.log(
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

module.exports = {
	execute
};

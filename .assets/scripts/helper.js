const { exec } = require('child_process');

const execute = (command) => exec(
	command,
	(err, stdout, stderr) => {
		if (err) { return console.log(err); }
		if (stderr) { return console.log(stderr); }
		return console.log(
			'command output:',
			stdout
		);
	}
);

module.exports = {
	execute
}

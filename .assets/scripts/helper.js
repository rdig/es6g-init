const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const rmrf = require('rimraf');

/**
 * Wrapper function that logs a colorized message to the console
 *
 * It's relying on ANSI terminal codes to change the color of the output. First it will change the
 * color, write the message, than reset to color back (otherwise anything else that get written
 * to the console will have the initial color);
 * List of ANSI codes:
 * https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
 *
 * @method log
 *
 * @param {string} message The string to be written to the console
 * @param {string} [color='green'] The color to write the message in.
 *
 * @return {Function} The console.log() method with the formatted message as argument
 */
const log = (message, color = 'green') => {
	const ansiColors = new function() {
		this._reset = 0;
		this.black = 30;
		this.red = 31;
		this.green = 32;
		this.yellow = 33;
		this.blue = 34;
		this.magenta = 35;
		this.cyan = 36;
		this.white = 37;
		/*
		 * Aliases
		 */
		this.success = this.green;
		this.warn = this.yellow;
		this.error = this.red;
	};

	let currentColor = '_reset';
	if (color in ansiColors) {
		currentColor = color;
	}

	return console.log(
		/*
		 * Set the color
		 */
		'\x1b[' + ansiColors[currentColor] + 'm' +
		message +
		/*
		 * Reset the color to intial state
		 */
		'\x1b[' + ansiColors._reset + 'm'
	);
};

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
 * @param {string} [workDir=path.resolve()] Path in which to execute the commmand. Defaults to the
 * current path (./).
 * @param {Function} [callback=(cmd)=>{...}] Callback to execute if the command executes
 * successfully. Takes in the command as parameter.
 *
 * @return {Function} The exec() method with our params
 */
const execute = (
	command,
	workDir = path.resolve(),
	callback = (cmd) => log('Command `' + cmd + '` executed successfully' + '\n', 'success')
) => {
	/*
	 * Warn the user to expect delays.
	 *
	 * Since we are not streaming the output (known bug, see issues, please fix), at least we
	 * can do is warn the user to expect a long wait.
	 *
	 * Ideally we should only show this if the script doesn't end after a certain time
	 * (eg: 1 min).
	 */
	const delayMessage = 'This operation will take a long time, ' +
		'and output will only be shown when done (buffered).' +	'\n' +
		'You can go and grab a cup of coffee in the meantime...' + '\n';

	log(delayMessage, 'warn');

	const commandToExecute = command;

	return exec(
		commandToExecute,
		{ cwd: workDir },
		(err, stdout, stderr) => {
			if (err) {
				return log('Command `' + command + '` failed to execute. ' + err, 'error');
			}
			log(stderr, 'warn');
			log(stdout, '_reset');
			return callback(command);
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
 * @param {function} [cbIfTrue=()=>{...}] Callback to call if path exists
 * @param {function} [cbIfFalse=()=>{...}] Callback to call if path doesn't exist
 *
 * @return {function} The fs.lstatSync() method
 */
const directoryExists = (
	path,
	cbIfTrue = () => log('Directory exists', 'success'),
	cbIfFalse = () => log('Directory does not exist', 'error')
) => {
	try {
		fs.lstatSync(path);
		cbIfTrue();
	}
	catch(e) {
		cbIfFalse();
	}
}

/**
 * Generate a package.json file from a given source file.
 *
 * The gist of how it works: get the source file -> add the seed object -> write to destination.
 *
 * @method generatePackageJson
 *
 * @param {string} sourcePath The path to the source file
 * @param {string} destinationPath Path to the destination file
 * @param {Object} [seedObject={}] The object that will overwrite values in the source file
 *
 * @return {Function} The function that reads the source -> writes the destionation
 */
const generatePackageJson = (sourcePath, destinationPath, seedObject = {}) => fs.readFile(
	sourcePath,
	(err, data) => {
		if (err) {
			return log(
				'Could not read ' + sourcePath + 'file' + '\n' + 'Error: ' + err,
				'error'
			);
		}

		if (typeof seedObject !== 'object') {
			return log(
				'You did not specify a valid seed object to generate package.json',
				'error'
			);
		}
		/*
		 * Convert and generate the new object
		 */
		const packageObject = JSON.parse(data);
		const newPackageObject = Object.assign(
			{},
			packageObject,
			seedObject
		);
		/*
		 * Turn it back to a string, and write to the disk
		 */
		const packageJson = JSON.stringify(newPackageObject, null, '  ');
		fs.writeFile(
			destinationPath,
			packageJson,
			'utf8',
			(err) => {
				if (err) {
					return log(
						'Could not write to ' + destinationPath + '. Error: ' + err,
						'error'
					);
				}
			}
		);
	}
);

/**
 * Retrieve files recursively from a given search path, that match a given extension filter.
 *
 * As it stands it works for us, but we should write a better implementation since this only
 * goes one level deep (for folders) so the files won't get the correct folder path chain
 * prepended if there are more than one nesting levels.
 *
 * If no filter is supplied, it will return all files that it finds.
 *
 * @method getFilesByExt
 *
 * @param {string} searchPath Path to search for files
 * @param {string} [extFilter=''] Extension to match against files when filtering
 * @param {Array} [filesArray=[]] Used for recursion. Stores found files.
 * @param {string} [folder=''] Used for recursion. Stores current folder name.
 *
 * @return {Array} Array of found files that match the given filter.
 */
const getFilesByExt = (searchPath, extFilter = '', filesArray = [], folder = '') => {
	const files = fs.readdirSync(searchPath);
	files.forEach((file) => {
		if (fs.statSync(path.join(searchPath, file)).isDirectory()) {
			filesArray = getFilesByExt(
				path.join(searchPath, file),
				extFilter,
				filesArray,
				file
			);
		} else {
			if (!extFilter) {
				filesArray.push(folder ? folder + '/' + file : file);
			} else {
				if (file.endsWith(extFilter)) {
					filesArray.push(folder ? folder + '/' + file : file);
				}
			}
		}
	});
	return filesArray;
};

/**
 * Retrieve folders recursively from a given search path, that containing files match a given
 * extension filter.
 * As it stands it works for us, but we should write a better implementation since this only
 * goes one level deep (for folders).
 *
 * If no filter is supplied, it will return all folders that it finds.
 * @method getFoldersByFileExt
 *
 * @param {string} searchPath Path to search for files
 * @param {string} [extFilter=''] Extension to match against files when filtering
 * @param {Array} [filesArray=[]] Used for recursion. Stores found files.
 * @param {Set} [foldersSet=new Set()] Used for recursion. Stores found folders.
 * @param {string} [folder=''] Used for recursion. Stores current folder name.
 *
 * @return {Array} Array of found folders that contain files matching the given extension filter.
 */
const getFoldersByFileExt = (searchPath, extFilter = '', filesArray = [], foldersSet = new Set(), folder = '') => {
	const files = fs.readdirSync(searchPath);
	files.forEach((file) => {
		if (fs.statSync(path.join(searchPath, file)).isDirectory()) {
			filesArray = getFoldersByFileExt(
				path.join(searchPath, file),
				extFilter,
				filesArray,
				foldersSet,
				file
			);
		} else {
			if (folder) {
				if (!extFilter) {
					foldersSet.add(folder);
				} else {
					if (file.endsWith(extFilter)) {
						foldersSet.add(folder);
					}
				}
			}
		}
	});
	return [...foldersSet];
};

/**
 * Move files from source to destination with optional rename
 *
 * You can either supply a string containing the file, or an Array of strings.
 * If you supply an optional rename function, the files will be passed through it before moving
 * them to their final destination.
 * The rename function must return a value, otherwise the destination file will have no name.
 *
 * @method moveFiles
 *
 * @param {string/Array} files A string with the file name, or an Array of strings
 * @param {string} [sourcePath=path.resolve()] The source path that will be prepended to files
 * @param {string} [destPath=path.resolve()] The destination path that will be prepended to files
 * @param {Function} [rename=()=>{...}] Rename function that file names will pass through. Must
 * return a value.
 *
 * @return {Function} The fs.rename() method with the supplied arguments
 */
const moveFiles = (
	files,
	sourcePath = path.resolve(),
	destPath = path.resolve(),
	rename = (file) => file
) => {
	if (!files) {
		return log('You did not supply a list of files to be moved', 'error');
	}
	if (typeof files !== 'object' && typeof files !== 'string') {
		return log(
			'You did not supply a list of files in a recognized format (string or array)',
			'error'
		);
	}
	if (typeof files === 'object') {
		return (() => {
			for (let file of files) {
				fs.rename(
					sourcePath + '/' + file,
					destPath + '/' + rename(file),
					(err) => {
						if (err) {
							return log(
								'Could not move file ' + sourcePath + '/' + file + ' to ' +
								destPath + '/' + rename(file) + '\n' + 'Error:' + err,
								'error'
							);
						}
					}
				);
			}
		})();
	}
	return fs.rename(
		sourcePath + '/' + files,
		destPath + '/' + rename(files),
		(err) => {
			if (err) {
				return log(
					'Could not move file ' + sourcePath + '/' + file + ' to ' +
					destPath + '/' + rename(file) + '\n' + 'Error:' + err,
					'error'
				);
			}
		}
	);
};

/**
 * Create folders (from a supplied list) into the destionation path
 *
 * You can either supply a string containing the file, or an Array of strings.
 *
 * @method createFolders
 *
 * @param {string/Array} folders A string with the folder name, or an Array of strings
 * @param {string} [destPath=path.resolve()] The destination path that will be prepended to folders
 *
 * @return {Function} The fs.mkdir() method with the supplied arguments
 */
const createFolders = (folders,	destPath = path.resolve()) => {
	if (!folders) {
		return log('You did not supply a list of folders to be created', 'error');
	}
	if (typeof folders !== 'object' && typeof folders !== 'string') {
		return log(
			'You did not supply a list of folders in a recognized format (string or array)',
			'error'
		);
	}
	if (typeof folders === 'object') {
		return (() => {
			for (let folder of folders) {
				fs.mkdir(
					destPath + '/' + folder,
					(err) => {
						if (err) {
							return console.log(
								'Could not create folder ' + folder + ' in ' + destPath + '\n' +
								'Error: ' + err,
								'error'
							);
						}
					}
				);
			}
		})();
	}
	return fs.mkdir(
		destPath + '/' + folder,
		(err) => {
			if (err) {
				return console.log(
					'Could not create folder ' + folder + ' in ' + destPath + '\n' +
					'Error: ' + err,
					'error'
				);
			}
		}
	);
};

/**
 * Delete items (files/folders) from a supplied list
 *
 * Rimraf (the underlying application that deletes the items for us) does not care if the item
 * exists or not, so you won't get any errors is you supply non-existent items. In most cases
 * the only way you'll get an error is if you don't have permissions to remove the item.
 *
 * @method deleteItems
 *
 * @param {string/Array} items A string with the item name, or an Array of strings
 * @param {string} [destPath=path.resolve()] The destination path that will be prepended to items
 *
 * @return {Function} The rmrf() method with the supplied arguments
 */
const deleteItems = (items, destPath = path.resolve()) => {
	if (!items) {
		return log('You did not supply a list of items (files/folders) to be deleted', 'error');
	}
	if (typeof items !== 'object' && typeof items !== 'string') {
		return log(
			'You did not supply a list of items (files/folders)' +
			'in a recognized format (string or array)',
			'error'
		);
	}
	if (typeof items === 'object') {
		return (() => {
			for (let item of items) {
				rmrf(
					destPath + '/' + item,
					(err) => {
						if (err) {
							return console.log(
								'Could not delete ' + destPath + '/' + item + '\n' +
								'Error: ' + err,
								'error'
							);
						}
					}
				);
			}
		})();
	}
	return rmrf(
		destinationPath + '/' + item,
		(err) => {
			if (err) {
				return console.log(
					'Could not delete ' + destPath + '/' + item + '\n' +
					'Error: ' + err,
					'error'
				);
			}
		}
	);
};

module.exports = {
	execute,
	directoryExists,
	generatePackageJson,
	getFilesByExt,
	getFoldersByFileExt,
	moveFiles,
	createFolders,
	deleteItems,
	log
};

const path = require('path');
const { execute, directoryExists, generatePackageJson } = require('./helper.js');
const { name } = require('../../package.json');

/*
 * Local path which will be used as source.
 * This will be generated correctly by path.resolve() in either mode, so no need to worry
 * about this.
 */
const sourcePath = path.resolve('./.assets/basefiles');
/*
 * Destination path.
 * This will change if the mode is 'repository'
 */
let targetPath = path.resolve('../../');
/*
 * The mode in which we were invoked.
 * Possible values are 'package' (npm) and 'repository' (git).
 * We detect this using the directoryExists() method.
 */
let mode = 'package';

directoryExists(
	path.resolve('../../node_modules/' + name),
	/*
	 * We are installed as an npm package
	 */
	() => mode = 'package',
	/*
	 * We are a cloned repository
	 */
	() => {
		// targetPath = path.resolve('.');
		mode = 'repository';
	}
);

/*
 * Get the new project's folder name
 */
const currentFolderName = path.basename(targetPath);

generatePackageJson(
	sourcePath + '/package.json.base',
	targetPath + '/package.json',
	{ name: currentFolderName }
);

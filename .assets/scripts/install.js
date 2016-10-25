const path = require('path');
const {
	execute,
	directoryExists,
	generatePackageJson,
	getFilesByExt,
	getFoldersByFileExt,
	moveFiles,
	createFolders,
	deleteItems,
	log
} = require('./helper.js');
const { name } = require('../../package.json');

/*
 * These will get deleted if we are in repository mode
 */
const repositoryExtraItems = [
	'.git',
	'.gitignore',
	'.npmignore',
	'.github',
	'.assets'
];
/*
 * These will be moved to the targetFolder if we are in package mode
 */
const packagesRequiredItems = [
	'LICENSE',
	'README.md'
];

/*
 * Local path which will be used as source.
 *
 * This will be generated correctly by path.resolve() in either mode, so no need to worry
 * about this.
 */
let sourcePath = path.resolve('./.assets/basefiles');
/*
 * Destination path.
 *
 * This will change if the mode is 'repository'
 */
let targetPath = path.resolve('../../');
/*
 * The mode in which we were invoked.
 *
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
		targetPath = path.resolve('.');
		mode = 'repository'
	}
);

/*
 * Tell the user the mode we are in
 */
log('Installation started:', 'success');
log('MODE: ' + mode + '\n', 'white');

/*
 * Get the new project's folder name
 */
const currentFolderName = path.basename(targetPath);

/*
 * Generate the new package.json file.
 *
 * If we are in repository mode, the old package.json gets overwritten, while in package mode,
 * this does not matter as it doesn't exist yet. Even if there is an edge case in which it exists,
 * it will also get overwritten.
 */
generatePackageJson(
	sourcePath + '/package.json.base',
	targetPath + '/package.json',
	{ name: currentFolderName }
);

/*
 * Tell the user we are generating the package.json file
 */
log('Generating new package.json based on environment:', 'success');
log('GENERATED: ' + targetPath + '/package.json' + '\n', 'white');

/*
 * Get a list of solders from our sourcePath and create it in our targetPath.
 * This prevents the moveFiles() for throwing an error if it has to move files in
 * non-existent folders.
 */
const sourceFolders = getFoldersByFileExt(sourcePath, '.base');
createFolders(
	sourceFolders,
	targetPath
);

/*
 * Tell the user we are creating source folders
 */
log('Creating source folders:', 'success');
sourceFolders.map((folder) => log('CREATED: ' + targetPath + '/' + folder, 'white'));
log('');

/*
 * Get a list of files from our sourcePath and move them to our targetPath.
 * Also, we rename the files upon move (removing the .base extension).
 */
const sourceFiles = getFilesByExt(sourcePath, '.base');
moveFiles(
	sourceFiles,
	sourcePath,
	targetPath,
	(file) => file.replace('.base', '')
);

/*
 * Tell the user we are moving source files into their destionation
 */
log('Moving source files:', 'success');
sourceFiles.map((file) => log('MOVED: ' + targetPath + '/' + file.replace('.base', ''), 'white'));

/*
 * If we are in repository mode, delete the extra files and folders, else, if we are in package
 * mode move the required files into the target path
 */
if (mode === 'repository') {

	deleteItems(repositoryExtraItems, targetPath);

	/*
	 * Tell the user that we are deleting extra items
	 */
	log('\n');
	log('Deleting extra items not required for this prototype:', 'success');
	// for (let item in repositoryExtraItems) {
	// 	log('DELETED: ' + targetPath + '/' + item, 'white');
	// }
	repositoryExtraItems.map((item) => log('DELETED: ' + targetPath + '/' + item, 'white'));
	log('');

} else {

	/*
	 * We don't use the sourcePath for any other actions at this point so we can overwrite it, as
	 * to not use another variable :)
	 */
	sourcePath = path.resolve();
	moveFiles(
		packagesRequiredItems,
		sourcePath,
		targetPath
	);

	/*
	 * Tell the user that we are moving the rest of his source files
	 */
	packagesRequiredItems.map((item) => log('MOVED: ' + targetPath + '/' + item, 'white'));
	log('');

}

/*
 * Tell the user that we are installing his node packages.
 * As opposed to the other instances, we are notifying him first, because this action takes a long
 * time and the user should be aware of what's happening.
 */
log('Installing required node packages:' + '\n', 'success');

/*
 * At this point we finished preparing the targetPath so we can safely install the needed npm
 * packages.
 */
execute(
	'npm install',
	targetPath,
	/*
	 * Tell the user that his installation finished sucessfully
	 */
	() => log(
		'Installation completed successfully.' + '\n' +
		'You can start working by running `npm run terminal` or `npm run browser`.' + '\n' +
		'Happy coding!' + '\n',
		'success'
	)
);

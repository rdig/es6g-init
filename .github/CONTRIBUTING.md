# Contributing

Hi there contributor! Thanks for taking the time to contribute!

If you don't know were to start check out the [issues](https://github.com/rdig/es6g-init/issues).

If you are a first timer look for those [labeled `good-first-bug`](https://github.com/rdig/es6g-init/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-bug) or just ask around, there should be some helpful people around willing to set you on the right track.

If you still have no idea on how all these work or are fuzzy on the details, may I suggest watching the excelent [How to Contribute to an Open Source Project](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) course on [egghead.io](https://egghead.io/) *(Not relationship whatsoever, not endorsing, no refferal code)*.

## Issues

If you want a particular feature, or noticed a bug head over to the [issues section](https://github.com/rdig/es6g-init/issues) and [open new one](https://github.com/rdig/es6g-init/issues/new).

### Bugs

Before submitting a new bug have a look at the issues [labeled `bug`](https://github.com/rdig/es6g-init/issues?utf8=%E2%9C%93&q=label%3Abug%20) or [labeled `known-issue`](https://github.com/rdig/es6g-init/issues?utf8=%E2%9C%93&q=label%3Aknown-issue%20) to make sure it wasn't already posted.

### New features

Before suggesting a new feature take a look at the [roadmap](https://github.com/rdig/es6g-init#roadmap) or the issues [labeled `roadmap`](https://github.com/rdig/es6g-init/issues?utf8=%E2%9C%93&q=label%3Aroadmap%20), maybe it's already scheduled. If it's not, [submit it](https://github.com/rdig/es6g-init/issues/new)!

### Manual testing

A lesser known method of contributing to a project is to manual install / clone the package and see it's working on different architectures / operating systems.

Since most of the times these are overlooked, we would gladly accept issues / PRs discovered through testing in this manner.

## Code

If you want to contribute code, fix bugs or add new features, here is what you need to know:

### Outline

This is a quick outline of the code contributing process:

1. Fork the repo
2. Create a new brach
3. Write new code / bugfix existing code
4. Test your code ***
5. Submit a pull request to this repo

** Manually, this is a simple project, doesn't need to be over-complicated with unit / integrations tests (but hey, if you -really- want them in, submit a PR)*

### Getting started

Fork, then clone the repo *(change repo name as per your namespace / fork name)*:
```bash
git clone git@github.com:<your-name>/<es6g-init-your-fork-name>.git
```

Since **this** project doesn't have any dependencies there's no need to install any packages via `npm`. (The actual, final projects, does, and will be installed with the help of the `postinstall` hook via the `install.js` script)

The way the package is working (*or if you're here, how it should be working...*):
1. The hidden `.assets` folder contains the final package structure
2. The `postinstall` npm script will run the `.assets/scripts/install.js` script, which will remove the current project related files and folders (`.git`, `package.json`, etc...) and replace them with ones from `.assets/basefiles`
4. Then, after all the files are moved, the same script will run `npm install` for you to install the needed dependencies.

To test that this is working we make use of `npm install`'s support of the file protocol. Basically:
- Make a new folder
- Install this repo into your new folder
- The install script should trigger and you should see the final version live.

Example:
```bash
mkdir <a-folder-for-testing>
cd <a-folder-for-testing>
npm i <location/to/your/forked-repo>
```

Happy coding!

*PS: If it still doesn't make sense, feel free to [open a new issue](https://github.com/rdig/es6g-init/issues/new) or [contact me](./../package.json) and we'll straiten things out.*

### Code of conduct

See the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).

### Contributing section

If you submit a new feature / bufix, and this is your first one, please make sure to also add you name / email *([npm person Object format](https://docs.npmjs.com/files/package.json#people-fields-author-contributors))* to the [contributors section](./../package.json) inside of package.json

**Thanks for being awesome!**

# 2D-JupyterLab-TS

[![Github Actions Status](https://github.com/TomWoah123/2D-JupyterLab-TS/workflows/Build/badge.svg)](https://github.com/TomWoah123/2D-JupyterLab-TS/actions/workflows/build.yml)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/TomWoah123/2D-JupyterLab-TS/main?urlpath=lab)
2D JupyterLab extension using TypeScript

## Requirements

- JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install 2D-JupyterLab-TS
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall 2D-JupyterLab-TS
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the 2D-JupyterLab-TS directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall 2D-JupyterLab-TS
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `2D-JupyterLab-TS` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)

# 2D-JupyterLab-TS Documentation

## What We Accomplished

The purpose of this project is to implement a 2-dimensional version of Jupyter Notebooks within Jupyter Lab. The project aims 
to implement a column system where cells can be rearranged vertically within a given column, and horizontally by being moved to 
a particular column. 
The project currently supports adding and removing columns in the Jupyter Notebook, as well as adding cells 
automatically to a column within the Jupyter Notebook. The code used to add and remove cells was adapted from elizabethc99's code
which can be found under resources. The project also supports moving cells from one column to another column using the PIN button that
is appended to each cell upon its creation.

## What Needs To Get Done

This project is a work in progress and still has several unfinished components. The primary next steps for this project are as follows:

* Implement reindexing the cells to align with the columns that they are in. For example, moving a cell to another
column should change the execution order of the cells when the run all button is enabled. 
* Implement moving full columns around, even though the widgets for those columns are already created. 
* Implement adding a cell to a newly created column instead of creating an empty column.
* Implement adding cells within columns using the add cell button on top of the column. 
* Update Styling to scroll horizontally when the number of columns overflow the screen.
* Implement arrow key navigation within the 2D Jupyter Notebook. Supporting left/right and up/down arrow keys.
* Implement restoration of 2D state after saving and closing the notebook. 
    * Store data in JSON object in notebook metadata, use JSON object to restore notebook state upon load
## Resources

* https://jupyterlab.readthedocs.io/en/stable/index.html: Official documentation for JupyterLab

* https://github.com/elizabethc99/2D-Jupyter: This is elizabethc99's project was used an example for the functionality of this project. The project is written in JavaScript for Jupyter Notebook while our project is written in TypeScript for Jupyter Notebook in Jupyter Lab.

* https://github.com/mje-nz/jupyterlab-show-cell-tags: This project was used a basis for manipulating cells upon their creation. For this project, we changed the code from appending an annotation to each cell to adding the cell to a selected column.

* https://github.com/jrgranadoswest/jpnb_t1: This project exemplifies how to add buttons with extra functionality to cells in JupyterLab notebooks. It is an updated version of the project https://github.com/ibqn/jupyterlab-codecellbtn, for JupyterLab 3.


## Project file structure
The project files are organized in directories as follows: 
```
2D-JupyterLab-TS        Version/setup files folder
├───__init__.py
└───_version.py
src
└───index.ts            Primary source code file for extension
style                   Styling files for project
├───base.css
├───index.css
└───index.js
buildext.sh             Helper script to rebuild extension
compile.sh              Alternative script to build extension
tsconfig.json           TypeScript configuration
package-lock.json       Track project dependencies
package.json   
```
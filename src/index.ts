import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the 2D-JupyterLab-TS extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '2D-JupyterLab-TS:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension 2D-JupyterLab-TS is activated!');
  }
};

export default plugin;

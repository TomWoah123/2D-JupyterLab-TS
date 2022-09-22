import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

/**
 * Initialization data for the 2D-JupyterLab-TS extension.
 */

 const extension: JupyterFrontEndPlugin<void> = {
  id: '2D-JupyterLab-TS',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension 2D-JupyterLab-TS is activated!');
  
    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = '2D-JupyterLab-TS';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;
  
    // Add an application command
    const command: string = 'apod:open';
    app.commands.addCommand(command, {
      label: '2D JupyterLab TS',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });
  
    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
  }
};

export default extension;

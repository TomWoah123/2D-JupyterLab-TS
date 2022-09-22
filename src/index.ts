import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
};

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

/**
 * Initialization data for the 2D-JupyterLab-TS extension.
 */

 const extension: JupyterFrontEndPlugin<void> = {
  id: '2D-JupyterLab-TS',
  autoStart: true,
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension 2D-JupyterLab-TS is activated!');
  
    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    content.addClass('my-apodWidget'); // new line
    const widget = new MainAreaWidget({ content });
    widget.id = '2D-JupyterLab-TS';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;

    // Add an image element to the content
    let img = document.createElement('img');
    content.node.appendChild(img);

    let summary = document.createElement('p');
    content.node.appendChild(summary);

    // Get a random date string in YYYY-MM-DD format
    function randomDate() {
      const start = new Date(2010, 1, 1);
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 10);
    }

    // Fetch info about a random picture
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${randomDate()}`);
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        summary.innerText = data.error.message;
      } else {
        summary.innerText = response.statusText;
      }
    } else {
      const data = await response.json() as APODResponse;

      if (data.media_type === 'image') {
        // Populate the image
        img.src = data.url;
        img.title = data.title;
        summary.innerText = data.title;
        if (data.copyright) {
          summary.innerText += ` (Copyright ${data.copyright})`;
        }
      } else {
        summary.innerText = 'Random APOD fetched was not an image.';
      }
    }

    // Add an application command
    const command: string = 'apod:open';
    app.commands.addCommand(command, {
      label: 'My-Command',
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

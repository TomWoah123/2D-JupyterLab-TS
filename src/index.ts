import { JupyterFrontEnd,JupyterFrontEndPlugin,} from '@jupyterlab/application';
// import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import {  NotebookPanel} from '@jupyterlab/notebook';

import {
  INotebookTracker,
  NotebookActions
} from '@jupyterlab/notebook';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { IEditorServices } from '@jupyterlab/codeeditor';
import '../style/index.css';

import { ButtonExtension,update_styling } from './ButtonExtension';
import ContentFactoryWithFooterButton from './ContentFactoryWithFooterButton';
import ShowCellsInColumns from './ShowCellsInColumns';

// import {CodeCell} from '@jupyterlab/cells';
// import {
//   NBTestUtils
// } from '@jupyterlab/testutils';

// import $ from '@types/jquery';

// const rendermime = NBTestUtils.defaultRenderMime();

// import { CodeCell, CodeCellModel }e from '@jupyterlab/cells';

/**
 * The CSS classes added to the cell footer.
 */



/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(app: JupyterFrontEnd,notebookTracker: INotebookTracker): void {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
  app.docRegistry.addWidgetExtension('Notebook', new ShowCellsInColumns());
  initialize(notebookTracker)
}


function initialize (notebookTracker: INotebookTracker) {
  // //set intial run indexes
  // var cells = Jupyter.notebook.get_cells();
  // var ncells = Jupyter.notebook.ncells();

  // for (var i=0; i<ncells; i++){
  //       var cell = cells[i];
  //       var index = Jupyter.notebook.find_cell_index(cell);
  //       cell.metadata.index = index;
      
  //       var box = document.getElementsByClassName("repos")[i]; 
  //       if(typeof box !== 'undefined'){
  //           $(box)[0].innerHTML = "";
  //           $(box).append(index + 1);
  //       }
        
  // }
  // // draw columns
  // if(!Jupyter.notebook.metadata.columns || Jupyter.notebook.metadata.columns === null){
  //     Jupyter.notebook.metadata.columns = 1;
  // }
  // nCols = Jupyter.notebook.metadata.columns;
  // update_styling();
  console.log("Initialization");
  update_styling(notebookTracker);
}



/**
 * The foot button extension for the code cell.
 */
const footerButtonExtension: JupyterFrontEndPlugin<void> = {
  id: 'jpnb_t1',
  autoStart: true,
  activate: activateCommands,
  requires: [INotebookTracker]
};
 
 function activateCommands(
   app: JupyterFrontEnd,
   tracker: INotebookTracker
 ): Promise<void> {
   // tslint:disable-next-line:no-console
   console.log('JupyterLab extension jupyterlab-cellcodebtn is activated!');
   console.log('update 2')
   Promise.all([app.restored]).then(([params]) => {
     const { commands, shell } = app;
 
     function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
       const widget = tracker.currentWidget;
       const activate = args.activate !== false;
 
       if (activate && widget) {
         shell.activateById(widget.id);
       }
       var columns: HTMLCollectionOf<Element> = document.getElementsByClassName("column");
       var notebook: HTMLCollectionOf<Element> = document.getElementsByClassName("jp-Notebook");
      if(notebook.length == 0) {
        // Upon initial call, the jp-Notebook element likely has not loaded yet
        console.log("Error: no jp-Notebook class elements found");
        console.log(notebook);
      } else {
        // For now, assume one column, and we are completing initial page setup
        // var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
        // var nCols = columns.length;
        var colIdx = 0;
        // Find selected column
        for(var c = 0; c<columns.length; c++){
            if(columns[c].classList.contains("selected")) {
                colIdx = c;
                break;
            }
        }
        // figure out which cell actually was clicked, and add it to selected col for first col if none selected
        //https://jupyterlab.readthedocs.io/en/3.3.x/api/interfaces/notebook.inotebooktracker.html#notes
        var jp_cells = (notebook[0] as HTMLElement).getElementsByClassName("jp-Cell");
        console.log(jp_cells.length);
        for(var i = 0; i < jp_cells.length; i++) {
          if(jp_cells[i].classList.contains("jp-mod-selected")) {
            columns[colIdx].append(jp_cells[i]);
            console.log("append attempted: ", jp_cells[i]);
            break;
          }
        }
      }
      return widget;
    }
 
     function isEnabled(): boolean {
       return (
         tracker.currentWidget !== null &&
         tracker.currentWidget === app.shell.currentWidget
       );
     }
 
     commands.addCommand('run-selected-codecell', {
       label: 'Run Cell',
       execute: args => {
         const current = getCurrent(args);
 
         if (current) {
           const { context, content } = current;
           NotebookActions.run(content, context.sessionContext);
           // current.content.mode = 'edit';
         }
       },
       isEnabled
     });
   });
 
   return Promise.resolve();
 }

/**
 * The notebook cell factory provider.
 */
 const cellFactory: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: 'jpnb_t1:factory',
  provides: NotebookPanel.IContentFactory,
  requires: [IEditorServices],
  autoStart: true,
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {
    // tslint:disable-next-line:no-console
    console.log(
      'JupyterLab extension jupyterlab-cellcodebtn',
      'overrides default nootbook content factory'
    );

    const { commands } = app;
    const editorFactory = editorServices.factoryService.newInlineEditor;
    return new ContentFactoryWithFooterButton(commands, { editorFactory });
  }
};

/**
 * The plugin registration information.
 */
 const two_dim_jup_plugin: JupyterFrontEndPlugin<void> = {
  requires: [INotebookTracker],
  activate,
  id: 'toolbar-button',
  autoStart: true,
};

/**
 * Initialization data for the jpnb_t1 extension.
 */
const plugins: Array<JupyterFrontEndPlugin<any>> = [
  footerButtonExtension,
  cellFactory,
  two_dim_jup_plugin
]
export default plugins;





// /**
//  * Export the plugin as default.
//  */
// export default plugin;
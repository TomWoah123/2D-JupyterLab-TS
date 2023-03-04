import { DocumentRegistry } from '@jupyterlab/docregistry';
import UpdateCellsTracker from './UpdateCellsTracker';
import {  NotebookPanel} from '@jupyterlab/notebook';



export class ShowCellsInColumns implements DocumentRegistry.WidgetExtension {
    createNew(panel: NotebookPanel) {
      // panel.toolbar.insertItem(5, 'add cell', )
      return new UpdateCellsTracker(panel);
    }
}

export default ShowCellsInColumns;
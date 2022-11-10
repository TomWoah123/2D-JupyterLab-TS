import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { PanelLayout } from '@lumino/widgets';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  IObservableList,
  IObservableUndoableList
} from '@jupyterlab/observables';
import { ICellModel } from '@jupyterlab/cells';
import { ToolbarButton } from '@jupyterlab/apputils';

export class UpdateCellsTracker implements IDisposable {
  constructor(panel: NotebookPanel) {
    this._panel = panel;
    const cells = this._panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCells, this);
  }

  get isDisposed() {
    return this._isDisposed;
  }

  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    const cells = this._panel.context.model.cells;
    cells.changed.disconnect(this.updateConnectedCells, this);
    // this._panel = null;
  }

  updateConnectedCells(cells: IObservableUndoableList<ICellModel>, changed: IObservableList.IChangedArgs<ICellModel>) {
    changed.newValues.forEach(cell => this.updateCell(cell));
  }

  private updateCell(cellModel: ICellModel) {
    const cell = this._panel.content.widgets.find(
      widget => widget.model === cellModel
    );
    var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>);
    if (columns.length == 0) {
      console.log("No Columns found........");
    }
    else {
      var columnIndex = 0;
      for (var c = 0; c < columns.length; c++) {
        if (columns[c].classList.contains("selected")) {
          columnIndex = c;
          break;
        }
      }
      columns[columnIndex].append(cell as unknown as HTMLElement);
      console.log("Attempting to add the cell to the notebook")
    }
  }

  private _panel: NotebookPanel;
  private _isDisposed = false;
}

export class ShowCellsInColumns implements DocumentRegistry.WidgetExtension {
  createNew(panel: NotebookPanel) {
    return new UpdateCellsTracker(panel);
  }
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'Update Cells to fit in columns',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    app.docRegistry.addWidgetExtension('Notebook', new ShowCellsInColumns());
  }
}

export default plugin;
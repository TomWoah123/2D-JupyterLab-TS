import { IObservableList, IObservableUndoableList} from '@jupyterlab/observables';
import { IDisposable } from '@lumino/disposable';
import {ICellModel } from '@jupyterlab/cells';
import {  NotebookPanel} from '@jupyterlab/notebook';
import { reindex } from './ButtonExtension';



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
        var columnIndex = columns.length - 1;
        for (var c = 0; c < columns.length; c++) {
          if (columns[c].classList.contains("selected")) {
            columnIndex = c;
            break;
          }
        }
        var notebook: HTMLCollectionOf<Element> = document.getElementsByClassName("jp-Notebook");
        const cells = (notebook[0] as HTMLElement).getElementsByClassName("jp-Cell");
        console.log(cells.length);
        const newCell = cells[cells.length - 1];
        console.log(cell?.id);
        columns[columnIndex].append(newCell);
        console.log("Attempting to add the cell to the notebook")
        reindex();
      }
    }
  
    private _panel: NotebookPanel;
    private _isDisposed = false;
}

export default UpdateCellsTracker;
   
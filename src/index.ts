import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  NotebookActions,
  NotebookPanel,
  INotebookModel,
} from '@jupyterlab/notebook';

//import { CodeCell, ICellModel, CodeCellModel, ICodeCellModel } from '@jupyterlab/cells';

/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'toolbar-button',
  autoStart: true,
};

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const clearOutput = () => {
      NotebookActions.clearAllOutputs(panel.content);
    };

    function resizeColumns(e: any) {
      
    }

    function createColumnToolbar(column: number) {
      var toolbar = document.createElement('div');
      toolbar.style.backgroundColor = "white";
      toolbar.classList.add("col-toolbar");
      toolbar.id = "columnToolbar" + column;

      var buttons = document.createElement('div');
      buttons.style.width = '100%';
      buttons.style.height = '35px';
      buttons.style.border = '1.5px solid black';

      var resize = document.createElement('div');
      resize.classList.add('resizeMe');
      resize.id = 'resizeCol' + column;
      resize.style.width = '20px';
      resize.style.height = '33px';
      resize.style.float = 'right';
      resize.style.backgroundColor = 'lightgrey';
      resize.style.cursor = 'col-resize';
      resize.addEventListener("mousedown", resizeColumns);

      buttons.append(resize);

      var addCell = document.createElement('button');
      addCell.classList.add('btn');
      addCell.classList.add('btn-default');
      addCell.style.float = 'left';
      addCell.innerHTML = '<i class = "fa fa-plus"></i>';
      addCell.onclick = function() {
        if (column == 0) {
          
        }
      }

      return toolbar;
    }

    const addColumn = () => {
      var numColumns = document.getElementsByClassName("column").length;
      numColumns++;
      document.getElementById("id-1349d5f6-4846-4247-a0a8-a0a0caabcbe8")!.style!.width = numColumns * 600 + "px";
      var insertAfter = numColumns;
      var selection = false;

      var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
      for (var c = 0; c < columns.length; c++) {
        columns[c].style.float = 'left';
        columns[c].style.margin = '10px';
        var columnId = columns[c].id;
        var colId = parseInt(columnId.replace("column", ""));
        if (colId >= insertAfter) {
          var oldIndex = colId;
          colId++;
          columns[c].id = "column" + colId;
          columns[c].querySelector("#click" + oldIndex)!.id = "click" + colId;
          columns[c].querySelector("#columnToolbar" + oldIndex)!.id = "columnToolbar" + colId;
          columns[c].querySelector("#resizeCol" + oldIndex)!.id = "resizeCol" + colId;
        }
        if (columns[c].classList.contains("selected")) {
          selection = true;
          insertAfter = parseInt(columns[c].id.replace("column", ""));
        }
      }

      var insertAt = numColumns;
      if (selection) {
        insertAt = insertAfter + 1;
      }

      var newColumn = document.createElement("div");
      newColumn.classList.add("column");
      newColumn.id = "column" + insertAt.toString();
      newColumn.style.width = "500px";
      newColumn.style.float = "left";
      newColumn.style.margin = "10px";
      newColumn.style.height = "inherit";
      newColumn.style.minHeight = "30px";
      newColumn.style.backgroundColor = "rgba(255, 255, 255, 1)";

      var columnIndex = newColumn.id;
      columnIndex = columnIndex.replace("column", "");
      var toolbar = createColumnToolbar(parseInt(columnIndex));
      newColumn.prepend(toolbar);


      //var newCodeCell = new CodeCell();
    }

    const addColumnButton = new ToolbarButton({
      className: 'add-col',
      label: 'Add Column',
      onClick: addColumn,
      tooltip: 'Adds a column to the notebook',
    });

    const removeColumnButton = new ToolbarButton({
      className: 'add-col',
      label: 'Remove Column',
      onClick: clearOutput,
      tooltip: 'Removes a column to the notebook',
    });

    panel.toolbar.insertItem(10, 'addColumns', addColumnButton);
    panel.toolbar.insertItem(11, 'removeColumns', removeColumnButton);
    return new DisposableDelegate(() => {
      addColumnButton.dispose();
      removeColumnButton.dispose();
    });
  }
}

/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(app: JupyterFrontEnd): void {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
}

/**
 * Export the plugin as default.
 */
export default plugin;
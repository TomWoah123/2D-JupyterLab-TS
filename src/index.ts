import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
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

    const removeColumn = () => {
      var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
      if(columns.length == 0) {
        console.log("No columns found; can't delete");
      }
      else {
        if(nCols != columns.length) {
          console.log("Error: inconsistent num columns: " + nCols + " : " + columns.length);
          nCols = columns.length;
        }
        var lastColumn = columns[nCols-1];
        var selection = false;
        // var deletedCol;
        for(var c = 0; c<columns.length; c++){
            if(columns[c].classList.contains("selected")) {
                // deletedCol = c;
                selection = true;
                columns[c].remove();
                break;
            }
        } 
        if(!selection){
            lastColumn.remove();
        }
        nCols--;
      }
    }

    const addColumn = () => {
      var numColumns = document.getElementsByClassName("column").length;
      // NOTE: currently assuming a column element exists already
      numColumns++;
      (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.width = numColumns * 600 + "px";
      // NOTE: uncaught type error for when getElementsByClassName returns NULL
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

      var notebook: HTMLCollectionOf<Element> = document.getElementsByClassName("jp-Notebook");
      if(notebook.length == 0) {
        // Upon initial call, the jp-Notebook element likely has not loaded yet
        console.log("Error: no jp-Notebook class elements found");
        console.log(notebook);
      } else {
        // Add column on right side of notebook
        // TODO: resize columns/notebook after add
        notebook[0].appendChild(newColumn);
        var columnIndex = newColumn.id;
        columnIndex = columnIndex.replace("column", "");
        // console.log("Adding col: " + parseInt(columnIndex));
        var toolbar = createColumnToolbar(parseInt(columnIndex));
        newColumn.prepend(toolbar);
      }
      //var newCodeCell = new CodeCell();
    }

    const addColumnButton = new ToolbarButton({
      className: 'add-col',
      label: 'Add Col',
      onClick: addColumn,
      tooltip: 'Adds a column to the notebook',
    });

    const removeColumnButton = new ToolbarButton({
      className: 'add-col',
      label: 'Remove Col',
      onClick: removeColumn,
      tooltip: 'Removes a column to the notebook',
    });

    const refreshColumnButton = new ToolbarButton({
      className: 'ref-col',
      label: '(R)',
      onClick: update_styling,
      tooltip: 'Refreshes 2D features of notebook',
    });

    panel.toolbar.insertItem(10, 'addColumns', addColumnButton);
    panel.toolbar.insertItem(11, 'removeColumns', removeColumnButton);
    panel.toolbar.insertItem(12, 'refreshCols', refreshColumnButton);
    return new DisposableDelegate(() => {
      addColumnButton.dispose();
      removeColumnButton.dispose();
      refreshColumnButton.dispose();
    });
  }
}

// Global var in limbo (TODO: add to class)
var nCols:number = 1; // default to 1
function initialize () {
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
  update_styling();
}
function update_styling() {
  console.log("Running update_styling()");
  // Get the existing number of columns, and if there are none then set to 1 column
  var columns: HTMLCollectionOf<Element> = document.getElementsByClassName("column");
  nCols = columns.length;
  if(nCols == 0) {
    nCols = 2; // default to at least 2
  }
  // var newColumnWidth = 100/nCols - 2;
  var newNbContainerWidth = 900*nCols + 50;
  
  // Tries to get jp-Notebook page element, which there should be one and only one of 
  var notebook: HTMLCollectionOf<Element> = document.getElementsByClassName("jp-Notebook");
  if(notebook.length == 0) {
    // Upon initial call, the jp-Notebook element likely has not loaded yet
    console.log("Error: no jp-Notebook class elements found");
    console.log(notebook);
  } else {
    // If jp-Notebook is found, add columns to it as appropriate
    (notebook[0] as HTMLElement).style.width = newNbContainerWidth.toString() + "px";
    // (notebook[0] as HTMLElement).style.backgroundColor = "#00ff00";
    (notebook[0] as HTMLElement).style.overflowX = "visible";
    (notebook[0] as HTMLElement).style.overflowY = "visible";
    (notebook[0] as HTMLElement).style.height = 'inherit';

    var new_columns = [];
    for(var c = 0; c < nCols; c++){
      new_columns[c] = document.createElement('div');   
      new_columns[c].classList.add("column");
      new_columns[c].id = "column" + (c+1).toString();
      new_columns[c].style.width = "500px";
      // colWidths[c] = newColumnWidth.toString() + "%";
      new_columns[c].style.float = 'left';
      new_columns[c].style.margin = "10px";
      new_columns[c].style.height = "inherit";
      new_columns[c].style.minHeight = "30px";
      new_columns[c].style.backgroundColor = "rgba(255,255,255,0.5)";

      notebook[0].appendChild(new_columns[c]);
      var colIndex = new_columns[c].id;
      colIndex = colIndex.replace('column', '');
      console.log("Made column");
      console.log(new_columns[c].toString())
      var toolbar = createColumnToolbar(parseInt(colIndex));
      new_columns[c].prepend(toolbar);

    }
    // For now, assume one column, and we are completing initial page setup
    var jp_cells = (notebook[0] as HTMLElement).getElementsByClassName("jp-Cell");
    console.log(jp_cells.length)
    for(var i = 0; i < jp_cells.length; i++) {
      new_columns[0].append(jp_cells[i]);
      console.log("append attempted");
    }

  }
}

function resizeColumns(e: any) {
  console.log("resize not implemented");
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
  // TODO: what is the purpose of classes fa and fa-plus?
  addCell.innerHTML = '<i class = "fa fa-plus"></i>';
  addCell.onclick = function() {
    console.log("Clicked toolbar addCell");
    if (column == 0) {
      // Insert cell at index method?
    }
  };
  buttons.append(addCell);

  var moveColRight = document.createElement('button');
  moveColRight.classList.add("btn");
  moveColRight.classList.add("btn-default");
  moveColRight.style.float = "right";
  moveColRight.innerHTML = '<i class = "fa fa-arrow-right"></i>';
  moveColRight.onclick = function(){
    console.log("moveColRight btn clicked");
  };
  buttons.append(moveColRight);

  var moveColLeft = document.createElement('button');
  moveColLeft.classList.add("btn");
  moveColLeft.classList.add("btn-default");
  moveColLeft.style.float = "right";
  
  moveColLeft.innerHTML = '<i class = "fa fa-arrow-left"></i>';
  moveColLeft.onclick = function(){
    console.log("moveColLeft btn clicked");
  }
  buttons.append(moveColLeft);

  var clickable = document.createElement('div');
  clickable.classList.add("clickable-area")
  clickable.id = "click" + column;
  clickable.style.height = "35px";
  clickable.addEventListener("click", selectColumn);
  buttons.append(clickable);

  
  toolbar.append(buttons);
  return toolbar;
}

function selectColumn(this: any){
  var ele: any = this;
  console.log(ele.toString())
  var colIndex = ele.id.replace('click', '');
  console.log("selected column " + colIndex)
  var previousSelection = document.querySelector(".column.selected");
  var column = document.getElementById("column" + colIndex);

  if(previousSelection != null && previousSelection != column){
    var previousSelection = document.querySelector(".column.selected"); 
    if(previousSelection) {
      (previousSelection as HTMLElement).style.border = "";
      previousSelection.classList.remove('selected');
    }
  }

  if(column) {
    column.classList.toggle("selected");
    if(column.classList.contains("selected")){
        column.style.border = "5px solid #42a5f5";
    }
    else{
        column.style.border = "";
    }
  }

}

/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(app: JupyterFrontEnd): void {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
  initialize()
}

/**
 * Export the plugin as default.
 */
export default plugin;
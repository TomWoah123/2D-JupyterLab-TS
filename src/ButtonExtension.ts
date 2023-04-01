import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel,INotebookModel } from '@jupyterlab/notebook';
import { ToolbarButton, } from '@jupyterlab/apputils';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';
// Global var in limbo (TODO: add to class)
var nCols:number = 1; // default to 1

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

    const runCellsInOrder = () => {
      console.log("Inside runCellsInOrder.............");
      var notebook = panel.content;
      console.log(notebook.widgets.length);
      var currentIndex = 1;
      while (currentIndex < notebook.widgets.length + 1) {
        var foundCell = false;
        for (var cellIndex = 0; cellIndex < notebook.widgets.length && !foundCell; cellIndex++) {
          var cell = notebook.widgets[cellIndex];
          var cellsIndex = cell.node.getAttribute("index");
          console.log(cellsIndex);
          if (parseInt(cellsIndex || "-1") == currentIndex) {
            console.log("Running the cell at index " + cellsIndex);
            NotebookActions.deselectAll(notebook);
            notebook.select(cell);
            NotebookActions.run(notebook, panel.context.sessionContext);
            foundCell = true;
          }
        }
        currentIndex++;
      }
    }

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
      reindex();
    }

    const addColumn = () => {
      var numColumns = document.getElementsByClassName("column").length;
      console.log(`numsColumns : ${numColumns}`);
      // NOTE: currently assuming a column element exists already
      numColumns++;
      const maxWidth = (document.getElementsByClassName("jp-NotebookPanel")[0] as HTMLElement)!.style!.width;
      console.log(maxWidth);
      const width = parseInt(maxWidth.substring(0, maxWidth.length - 2));
      console.log(width);
      (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.width = numColumns * 600 + "px";
      (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.overflowX = "scroll";
      // (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.display = "inline-block";
      if (numColumns * 600 > width) {
        //(document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.width = maxWidth;
        //(document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.height = "100%";
        // (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.overflowX = "scroll";
        // (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.overflowY = "scroll";
        // (document.getElementsByClassName("jp-Notebook")[0] as HTMLElement)!.style!.whiteSpace = "nowrap";
      }
      // NOTE: uncaught type error for when getElementsByClassName returns NULL
      var insertAfter = numColumns;
      var selection = false;

      var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
      console.log(`columnsList : ${columns}`)
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
        var toolbar = createColumnToolbar(parseInt(columnIndex),panel);
        newColumn.prepend(toolbar);
        newColumn.append()
        if (parseInt(columnIndex) === 1) {

          const fragment = document.createDocumentFragment();

          var initialCells = Array.from(document.getElementsByClassName("jp-Notebook-cell") as HTMLCollectionOf<HTMLElement>)
          initialCells.forEach(cell => {
            cell.parentNode?.removeChild(cell);
            fragment.appendChild(cell);
            
          });
          newColumn.append(fragment);
          
          // reorderedColumns.forEach(col => {
          //   col.parentNode?.removeChild(col);
          //   fragment.appendChild(col);
          // });

        }
      }
      reindex();

      // const cellFactory = NBTestUtils.createCodeCellFactory();
      // const cellModel = new CodeCellModel({});
      // var newCodeCell = new CodeCell({model:cellModel, contentFactory:cellFactory, rendermime });
      // newCodeCell.setPrompt('');
      // newCodeCell.model.metadata.set("column", numColumns + 1);
      // $(newColumn).append(newCodeCell as unknown as HTMLDivElement);
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

    const runCellsInOrderButton = new ToolbarButton({
      className: 'run-cells',
      label: 'Run Cells',
      onClick: runCellsInOrder,
      tooltip: 'Runs the cells in order by the cells'
    });

    // const refreshColumnButton = new ToolbarButton({
    //   className: 'ref-col',
    //   label: '(R)',
    //   onClick: function(){
    //     notebookTracker
    //     update_styling();
    //   },
    //   tooltip: 'Refreshes 2D features of notebook',
    // });

    panel.toolbar.insertItem(10, 'addColumns', addColumnButton);
    panel.toolbar.insertItem(11, 'removeColumns', removeColumnButton);
    // panel.toolbar.insertItem(12, 'refreshCols', refreshColumnButton);
    panel.toolbar.insertItem(12, 'runCellsInOrder', runCellsInOrderButton);
    return new DisposableDelegate(() => {
      addColumnButton.dispose();
      removeColumnButton.dispose();
      runCellsInOrderButton.dispose();
      // refreshColumnButton.dispose();
    });
  }
}

function reindex() {
    console.log("Inside reindex function....................");
    var columns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>);
    var index = 1;
    for (var i = 0; i < columns.length; i++) {
      var cells = (columns[i] as HTMLElement).getElementsByClassName("jp-Cell");
      for (var j = 0; j < cells.length; j++) {
        cells[j].setAttribute("index", "" + index);
        console.log(cells[j].getAttribute("index"));
        index++;
      }
    }
}

function createColumnToolbar(column: number, panel: NotebookPanel ) {
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
      // Get the current active notebook panel
      // const panel = notebookTracker.currentWidget as NotebookPanel;
  
      // Get the index of the currently selected cell
      const index = panel.content.activeCellIndex;
      console.log(index)
      // Insert a new cell below the selected cell
      NotebookActions.insertBelow(panel.content);
  
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
    moveColRight.onclick =async function () {
      console.log("moveColRight btn clicked");
      var reorderedColumns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
      var moveColumnIndex = 0;
      for (var i = 0; i < reorderedColumns.length; i++){
        const stripNum = (reorderedColumns[i].id).match(/(\d+)/);
        if (stripNum){
          if (parseInt(stripNum[0]) === column){
            moveColumnIndex = i;
            break;
          }
        }
      }
      for (var i = moveColumnIndex; i < reorderedColumns.length - 1; i++){
        const swapColumn = reorderedColumns[i];
        reorderedColumns[i] = reorderedColumns[i + 1];
        reorderedColumns[i + 1] = swapColumn;
      }
      // Create a document fragment to hold the reordered columns
      const fragment = document.createDocumentFragment();
      // Append each reordered column to the fragment
      const parentElement = reorderedColumns[0].parentNode;
      reorderedColumns.forEach(col => {
        col.parentNode?.removeChild(col);
        fragment.appendChild(col);
      });
      // Replace the original columns with the reordered columns
      parentElement?.appendChild(fragment);
      console.log("moveRight successful");
    };
    buttons.append(moveColRight);
  
    var moveColLeft = document.createElement('button');
    moveColLeft.classList.add("btn");
    moveColLeft.classList.add("btn-default");
    moveColLeft.style.float = "right";
    
    moveColLeft.innerHTML = '<i class = "fa fa-arrow-left"></i>';
    moveColLeft.onclick = function () {
      console.log("moveColLeft btn clicked");
      var reorderedColumns = Array.from(document.getElementsByClassName("column") as HTMLCollectionOf<HTMLElement>)
      var moveColumnIndex = 0;
      for (var i = 0; i < reorderedColumns.length; i++){
        const stripNum = (reorderedColumns[i].id).match(/(\d+)/);
        if (stripNum){
          if (parseInt(stripNum[0]) === column){
            moveColumnIndex = i;
            break;
          }
        }
      }
      console.log(moveColumnIndex);
      for (var i = moveColumnIndex; i > 0 ; i--){
        const swapColumn = reorderedColumns[i];
        reorderedColumns[i] = reorderedColumns[i - 1];
        reorderedColumns[i -1] = swapColumn;
      }
      // Create a document fragment to hold the reordered columns
      const fragment = document.createDocumentFragment();
      // Append each reordered column to the fragment
      const parentElement = reorderedColumns[0].parentNode;
      reorderedColumns.forEach(col => {
        col.parentNode?.removeChild(col);
        fragment.appendChild(col);
      });

      // Replace the original columns with the reordered columns
      parentElement?.appendChild(fragment);
      console.log("moveLeft succesful");
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

function resizeColumns(e: any) {
    console.log("resize not implemented");
  }


function update_styling(notebookTracker: INotebookTracker) {
    console.log("Running update_styling()");
    console.log(notebookTracker);
    // Get the existing number of columns, and if there are none then set to 1 column
    var columns: HTMLCollectionOf<Element> = document.getElementsByClassName("column");
    var nCols = columns.length;
    if(nCols == 0) {
      nCols = 2; // default to at least 2
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
          const panel = notebookTracker.currentWidget as NotebookPanel;
          var toolbar = createColumnToolbar(parseInt(colIndex),panel);
          new_columns[c].prepend(toolbar);
        }
      }
      var columns: HTMLCollectionOf<Element> = document.getElementsByClassName("column");
      // Assume there are columns now
      // For now, assume one column, and we are completing initial page setup
      var jp_cells = (notebook[0] as HTMLElement).getElementsByClassName("jp-Cell");
      console.log(jp_cells.length)
      for(var i = 0; i < jp_cells.length; i++) {
        columns[0].append(jp_cells[i]);
        console.log("append attempted: ", jp_cells[i]);
      }
    }
}

export default ButtonExtension

export {update_styling, reindex}

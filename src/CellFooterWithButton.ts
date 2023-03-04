import * as React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { ICellFooter } from '@jupyterlab/cells';
import { CommandRegistry } from '@lumino/commands';


const CELL_FOOTER_CLASS = 'jp-CellFooter';
const CELL_FOOTER_DIV_CLASS = 'ccb-cellFooterContainer';
const CELL_FOOTER_BUTTON_CLASS = 'ccb-cellFooterBtn';


 /**
  * Extend default implementation of a cell footer.
  */
export class CellFooterWithButton extends ReactWidget implements ICellFooter {
    /**
     * Construct a new cell footer.
     */
    constructor(commands: CommandRegistry) {
      super();
      this.addClass(CELL_FOOTER_CLASS);
      this.commands = commands;
    }
 
    private readonly commands: CommandRegistry;
 
    render() {
       console.log('Rendering element');
       return React.createElement("div", {className: CELL_FOOTER_DIV_CLASS }, 
         React.createElement("button",{
             className: CELL_FOOTER_BUTTON_CLASS,
             onClick: () => {
               console.log("Clicked run cell");
               this.commands.execute('run-selected-codecell');
             },
           },"pin"));
   }
}

export default CellFooterWithButton

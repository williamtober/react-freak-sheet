// TYPE IMPORTS
import { Matrix, CellBase } from 'react-spreadsheet';

// base options for the toolkit
type ToolkitOptions = {
    objectDiff?: boolean; // if true, the toolkit will sort the { key: object: { subKey: subValue } } and output multiple SpreadsheetToolkitProps for the different data...  if false, the toolkit will smash the objects and data into one SpreadsheetToolkitProps
    columnOverride?: Array<string>; // if provided, the toolkit will use the columnOverride as the columnLabels and the rest of the keys found in teh data will be concatenated.
}

// this is the idea of the toolkit... so if we have it like this... it loads faster... ideally we want to save data like this in databases.
type SpreadsheetToolkitProps = {
    data: Matrix<CellBase>;
    columnLabels: Array<string>;
    rowLabels: Array<string>;
}

// fallback prop which is just an object with key value pairs...
// if the object has other object values... then we will treat the first keys as the rowLabels and the rest as column labels... and the values as the data.
type FallbackProps = {
    [key: string]: string | { [key: string]: string };
}

// when adding columns, we can declare the label of the column, the position of the column, and the target index of the column. or just add it to the end of the columns.
type AddColumnProps = {
    columnLabel?: string; // if left undefined, it will add an empty column.
    position?: "before" | "after"; // if left udnefined, it will add it after the targetIndex or at the end of the columns.
    targetIndex?: number | string; // if left undefined, it will add it at the end of the columns.
}

class SpreadsheetToolkit {
    state: SpreadsheetToolkitProps;
    constructor(initialState:SpreadsheetToolkitProps) {
        this.state = {
            data: initialState.data || [[]],
            columnLabels: initialState.columnLabels || [],
            rowLabels: initialState.rowLabels || []
        }
        // the columnLabels and rowLabels if less than the data length will need to be filled with empty strings.
        if (this.state.columnLabels.length < this.state.data[0].length) {
            this.state.columnLabels = this.state.columnLabels.concat(new Array(this.state.data[0].length - this.state.columnLabels.length).fill(''));
        }

        // the columnLabels and rowLabels if less than the data length will need to be filled with empty strings.
        if (this.state.rowLabels.length < this.state.data.length) {
            this.state.rowLabels = this.state.rowLabels.concat(new Array(this.state.data.length - this.state.rowLabels.length).fill(''));
        }

    }

    getState = () => {
        return this.state;
    }

    setData = (data:Matrix<CellBase>) => {
        this.state.data = data;
    }

    setColumnLabels = (columnLabels:Array<string>) => {
        this.state.columnLabels = columnLabels;
    }

    setRowLabels = (rowLabels:Array<string>) => {
        this.state.rowLabels = rowLabels;
    }

    // add a row to the state
    addRow = (rowLabel?: string, row?:Array<CellBase>) => {
        // add row label and row to the state... if not provided add empty row and label
        this.state = {
            data: this.state.data.concat([row || new Array(this.state.data[0].length).fill('')]),
            columnLabels: this.state.columnLabels,
            rowLabels: this.state.rowLabels.concat([rowLabel || ''])
        }
    }

    // add a column to the state
    // column can be before or after target index or string
    addColumn = (props:AddColumnProps) => {
        // if targetIndex is a string, find the index of the column.
        let targetIndex = typeof props.targetIndex === 'string' ? this.state.columnLabels.indexOf(props.targetIndex) : props.targetIndex;
        // add it after the target index if the position is not provided, otherwise add it before the target index... do not delete other columns.
        this.state = {
            data: this.state.data.map((row, _index) => {
                return targetIndex ? row.slice(0, targetIndex + (props.position === 'before' ? 0 : 1)).concat([{ value: "" }]).concat(row.slice(targetIndex + (props.position === 'before' ? 0 : 1))) : row.concat([{ value: "" }]);
            }),
            // if the targetIndex is not provided, add the column to the end of the columnLabels
            columnLabels: targetIndex ? this.state.columnLabels.slice(0, targetIndex + (props.position === 'before' ? 0 : 1)).concat(['']).concat(this.state.columnLabels.slice(targetIndex + (props.position === 'before' ? 0 : 1))) : this.state.columnLabels.concat(['']),
            rowLabels: this.state.rowLabels
        }
    }

}

export default SpreadsheetToolkit;
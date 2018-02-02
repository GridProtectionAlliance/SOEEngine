class Table extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        var headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table className="table table-condensed table-hover">
                <thead>{headerComponents}</thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    }

    generateHeaders(){
        var cols = this.props.cols;  // [{key, label}]

        // generate our header (th) cell components
        return (<tr>{cols.map(function(colData) {
            return <th key={colData.key}>{colData.label}</th>;
        })}</tr>
        );
    }

    generateRows() {
        var ctrl = this;
        var cols = ctrl.props.cols,  // [{key, label}]
            data = ctrl.props.data;

        return data.map(function(item) {
            // build each cell
            var cells = cols.map(function(colData) {
                // colData.key might be "firstName"
                return <td key={item[colData.key] + colData.key} onClick={ctrl.handleClick }>{item[colData.key]}</td>;
            });

            return <tr key={item.id}>{cells}</tr>;
        });
    }

    handleClick(event){
        console.log(event);
    }
};


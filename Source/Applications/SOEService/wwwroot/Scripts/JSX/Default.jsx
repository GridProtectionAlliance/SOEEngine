class MainPage extends React.Component {
    render() {
        return (
            <div>
                <Table cols={cols} data={data  } />
            </div>
            );
    }
}
ReactDOM.render(<MainPage/>, document.getElementById('content'));
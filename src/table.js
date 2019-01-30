import Tabulator from 'tabulator-tables';
import _ from 'lodash';

function addTable(electionResult, selector, type) {
  const tableData = electionResult.parties;

  const nTotalVoteColumn = {
    title: 'จำนวนเสียงรวม',
    field: 'nTotalVote',
    align: 'center',
    formatter: cell => {
      return cell
        .getValue()
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    visible: false,
    bottomCalc: values => {
      const sum = _.sum(values);
      return sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  //create Tabulator on DOM element with id "example-table"
  var table = new Tabulator(selector, {
    virtualDom: false,
    movableRows: true,
    movableColumns: true,
    data: tableData, //assign data to table
    layout: 'fitDataFill', //fit columns to width of table (optional)
    columns: [
      //Define Table Columns
      { title: 'พรรค', field: 'name' },
      { title: 'สี', field: 'color', formatter: 'color', width: '46' },
      {
        title: 'ส.ส.แบ่งเขต ●',
        field: 'nConstituentSeat',
        align: 'center',
        visible: false,
        bottomCalc: 'sum'
      },
      nTotalVoteColumn,
      {
        title: 'ส.ส.พึงมี เริ่มต้น ■',
        field: 'nInitialAllocatedSeat',
        align: 'center',
        visible: false,
        bottomCalc: 'sum'
      },
      {
        title: 'ส.ส.พึงมีครบแล้ว (● >= ■)',
        field: 'bAllocationFilled',
        formatter: 'tickCross',
        align: 'center',
        visible: false
      },
      {
        title: 'ส.ส.พึงมียังไม่ครบ (● < ■)',
        field: 'bPartyListNeeded',
        formatter: 'tickCross',
        align: 'center',
        visible: false
      },
      {
        title: 'ส.ส.พึงมี ■',
        field: 'nAllocatedSeat',
        align: 'center',
        visible: false,
        bottomCalc: 'sum'
      },
      {
        title: 'ส.ส.บัญชีรายชื่อ ◆',
        field: 'nPartyListSeat',
        align: 'center',
        visible: false,
        bottomCalc: 'sum'
      },
      {
        title: 'ส.ส.รวม ●◆',
        field: 'nTotalSeat',
        align: 'center',
        visible: false,
        bottomCalc: 'sum'
      }
    ]
  });

  switch (type) {
    case 'constituent':
      table.showColumn('nConstituentSeat');
      table.setSort([
        { column: 'nTotalVote', dir: 'desc' },
        { column: 'nConstituentSeat', dir: 'desc' }
      ]);
      break;
    case 'initial-allocation':
      table.showColumn('nConstituentSeat');
      table.showColumn('nTotalVote');
      table.showColumn('nInitialAllocatedSeat');
      table.showColumn('bAllocationFilled');
      table.setSort([{ column: 'nTotalVote', dir: 'desc' }]);
      break;
    case 'final-allocation':
      table.showColumn('nConstituentSeat');
      // table.showColumn('bAllocationFilled');
      table.showColumn('nAllocatedSeat');
      table.showColumn('nPartyListSeat');
      table.setSort([{ column: 'nTotalVote', dir: 'desc' }]);
      table.setFilter('bPartyListNeeded', '=', true);
      break;
    case 'conclusion':
      table.showColumn('nConstituentSeat');
      table.showColumn('nPartyListSeat');
      table.showColumn('nTotalSeat');
      // table.setGroupBy(data => data.side);
      table.setSort([
        { column: 'nTotalSeat', dir: 'desc' },
        { column: 'nConstituentSeat', dir: 'desc' }
      ]);
      break;
    case 'sides':
      table.deleteColumn('nTotalVote');
      table.addColumn(nTotalVoteColumn);
      table.showColumn('nConstituentSeat');
      table.showColumn('nPartyListSeat');
      table.showColumn('nTotalSeat');
      table.showColumn('nTotalVote');
      table.setSort([
        { column: 'nTotalSeat', dir: 'desc' },
        { column: 'nConstituentSeat', dir: 'desc' }
      ]);
      table.addColumn({
        rowHandle: true,
        formatter: 'handle',
        headerSort: false,
        frozen: true,
        width: 30,
        minWidth: 30
      });
      table.setGroupBy(data => data.side);
      break;
    case 'all':
      table.deleteColumn('nTotalVote');
      table.addColumn(nTotalVoteColumn);
      table.showColumn('nConstituentSeat');
      table.showColumn('nInitialAllocatedSeat');
      table.showColumn('bAllocationFilled');
      table.showColumn('nAllocatedSeat');
      table.showColumn('nPartyListSeat');
      table.showColumn('nTotalSeat');
      table.showColumn('nTotalVote');
      table.setGroupBy(data => data.side);
      table.setSort([
        { column: 'nTotalSeat', dir: 'desc' },
        { column: 'nConstituentSeat', dir: 'desc' }
      ]);
      break;
  }
}

export { addTable };

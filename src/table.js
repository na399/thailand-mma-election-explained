import Tabulator from 'tabulator-tables';
import _ from 'lodash';

function addTable(electionResult, selector, type) {
  const tableData = electionResult.parties;

  const table = new Tabulator(selector, {
    virtualDom: false,
    movableRows: true,
    movableColumns: true,
    data: tableData,
    layout: 'fitDataFill',
    columns: [
      { title: 'พรรค', field: 'name' },
      { title: 'สี', field: 'color', formatter: 'color', width: '46' }
    ]
  });

  const nTotalVote = {
    title: 'จำนวนเสียงรวม',
    field: 'nTotalVote',
    align: 'center',
    formatter: cell => {
      return cell
        .getValue()
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    bottomCalc: values => {
      const sum = _.sum(values);
      return sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  const nConstituentSeat = {
    title: 'ส.ส.แบ่งเขต ●',
    field: 'nConstituentSeat',
    align: 'center',
    bottomCalc: 'sum'
  };

  const nInitialAllocatedSeat = {
    title: 'ส.ส.พึงมี เริ่มต้น ■',
    field: 'nInitialAllocatedSeat',
    align: 'center',
    bottomCalc: 'sum'
  };

  const bAllocationFilled = {
    title: 'ส.ส.พึงมีครบแล้ว (● >= ■)',
    field: 'bAllocationFilled',
    formatter: 'tickCross',
    align: 'center'
  };

  const bPartyListNeeded = {
    title: 'ส.ส.พึงมียังไม่ครบ (● < ■)',
    field: 'bPartyListNeeded',
    formatter: 'tickCross',
    align: 'center'
  };

  const nAllocatedSeat = {
    title: 'ส.ส.พึงมี ■',
    field: 'nAllocatedSeat',
    align: 'center',
    bottomCalc: 'sum'
  };

  const nPartyListSeat = {
    title: 'ส.ส.บัญชีรายชื่อ ◆',
    field: 'nPartyListSeat',
    align: 'center',
    bottomCalc: 'sum'
  };

  const nTotalSeat = {
    title: 'ส.ส.รวม ●◆',
    field: 'nTotalSeat',
    align: 'center',
    bottomCalc: 'sum'
  };

  switch (type) {
    case 'constituent':
      table.addColumn(nConstituentSeat);
      table.addColumn(nTotalVote);
      table.setSort([
        { column: 'nTotalVote', dir: 'desc' },
        { column: 'nConstituentSeat', dir: 'desc' }
      ]);
      break;
    case 'initial-allocation':
      table.addColumn(nInitialAllocatedSeat);
      table.addColumn(bAllocationFilled);
      table.addColumn(nConstituentSeat);
      table.addColumn(nTotalVote);
      table.setSort([{ column: 'nTotalVote', dir: 'desc' }]);
      break;
    case 'final-allocation':
      table.addColumn(nAllocatedSeat);
      table.addColumn(nConstituentSeat);
      table.addColumn(nPartyListSeat);
      table.addColumn(nTotalVote);
      table.setSort([{ column: 'nTotalVote', dir: 'desc' }]);
      table.setGroupBy(data => data.bAllocationFilled);
      table.setGroupHeader(value => {
        if (value) {
          return 'ส.ส.พึงมีครบแล้ว (ไม่ได้รับส.ส.บัญชีรายชื่อเพิ่ม)';
        } else {
          return 'ส.ส.พึงมียังไม่ครบ';
        }
      });
      // table.setFilter('bPartyListNeeded', '=', true);
      break;
    case 'conclusion':
      table.addColumn(nTotalSeat);
      table.addColumn(nConstituentSeat);
      table.addColumn(nPartyListSeat);
      table.addColumn(nTotalVote);
      table.setSort([
        { column: 'nConstituentSeat', dir: 'desc' },
        { column: 'nTotalSeat', dir: 'desc' }
      ]);
      break;
    case 'sides':
      table.addColumn(nTotalSeat);
      table.addColumn(nConstituentSeat);
      table.addColumn(nPartyListSeat);
      table.addColumn(nTotalVote);
      table.setSort([
        { column: 'nConstituentSeat', dir: 'desc' },
        { column: 'nTotalSeat', dir: 'desc' }
      ]);
      table.setGroupBy(data => data.side);
      table.addColumn({
        rowHandle: true,
        formatter: 'handle',
        headerSort: false,
        frozen: true,
        width: 30,
        minWidth: 30
      });
      break;
    case 'all':
      table.addColumn(nTotalSeat);
      table.addColumn(nConstituentSeat);
      table.addColumn(nInitialAllocatedSeat);
      table.addColumn(bAllocationFilled);
      table.addColumn(nAllocatedSeat);
      table.addColumn(nPartyListSeat);
      table.addColumn(nTotalVote);
      table.setGroupBy(data => data.side);
      table.setSort([
        { column: 'nConstituentSeat', dir: 'desc' },
        { column: 'nTotalSeat', dir: 'desc' }
      ]);
      break;
  }
}

export { addTable };

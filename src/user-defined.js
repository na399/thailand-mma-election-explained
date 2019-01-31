import * as main from './main';
import * as table from './table';
import seedrandom from 'seedrandom';

seedrandom('full', { global: true });

let parties = [
  new main.Party({
    name: 'เพื่อไทย',
    color: 'red',
    nTotalVote: 14125219,
    nConstituentSeat: 204
  }),
  new main.Party({
    name: 'ประชาธิปัตย์',
    color: 'skyblue',
    nTotalVote: 10095250,
    nConstituentSeat: 115,
    side: 'ฝ่ายค้าน'
  }),
  new main.Party({
    name: 'ภูมิใจไทย',
    color: 'green',
    nTotalVote: 3485153,
    nConstituentSeat: 29,
    side: 'ฝ่ายค้าน'
  }),
  new main.Party({
    name: 'ชาติไทยพัฒนา',
    color: 'orange',
    nTotalVote: 1515320,
    nConstituentSeat: 15
  }),
  new main.Party({
    name: 'ชาติพัฒนาเพื่อแผ่นดิน',
    color: 'yellow',
    nTotalVote: 1242084,
    nConstituentSeat: 5
  }),
  new main.Party({
    name: 'มาตุภูมิ',
    color: 'pink',
    nTotalVote: 369526,
    nConstituentSeat: 1
  }),
  new main.Party({
    name: 'พลังชล',
    color: 'blue',
    nTotalVote: 246879,
    nConstituentSeat: 6
  }),
  new main.Party({
    name: 'รักษ์สันติ',
    color: 'lime',
    nTotalVote: 138758,
    nConstituentSeat: 0
  }),
  new main.Party({
    name: 'อื่นๆ',
    color: 'grey',
    nTotalVote: 278175,
    nConstituentSeat: 0
  })
];

let config = new main.ElectionConfig({
  nConstituentSeat: 375,
  nParty: parties.length
});

const result = main.runAllocation(config, { parties });

main.drawWaffle(result, config, '#parliament-seats-constituent', 'constituent');
main.drawInitialAllocation(result, config, '#initial-allocation');
main.drawWaffle(result, config, '#parliament-seats-party-list', 'partyList');
main.drawFinalAllocation(result, config, '#final-allocation');
main.drawWaffle(result, config, '#parliament-seats-all', 'all');

main.addIntroText(config, '#text-intro', '', false);
main.addConstituentText(result, config, '#text-constituent-seats');
main.addInitialAllocationText(result, config, '#text-initial-allocation');
main.addInitialAllocatedText(result, config, '#text-initial-allocated-seats');
main.addFinalAllocationText(result, config, '#text-final-allocation');

table.addTable(result, '#table-constituent', 'constituent');
table.addTable(result, '#table-initial-allocation', 'initial-allocation');
table.addTable(result, '#table-final-allocation', 'final-allocation');
table.addTable(result, '#table-conclusion', 'conclusion');
table.addTable(result, '#table-sides', 'sides');
// table.addTable(result, '#table-all', 'all');

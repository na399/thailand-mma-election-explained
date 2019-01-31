import * as main from './main';
import * as table from './table';
import seedrandom from 'seedrandom';

seedrandom('starter', { global: true });

let config = new main.ElectionConfig({
  nTotalSeat: 5,
  nConstituentSeat: 3,
  nVoter: 500000,
  pVoterTurnout: 0.7,
  nParty: 4
});

const result = main.runFullElection(config)

main.drawResultConstituents(result, config, '#result-constituents');
main.drawWaffle(result, config, '#parliament-seats-constituent', 'constituent');
main.drawInitialAllocation(result, config, '#initial-allocation');
main.drawWaffle(result, config, '#parliament-seats-party-list', 'partyList');
main.drawFinalAllocation(result, config, '#final-allocation');
main.drawWaffle(result, config, '#parliament-seats-all', 'all');

main.addIntroText(
  config,
  '#text-intro',
  'เพื่อให้เข้าใจง่ายขึ้น เรามาเริ่มต้นกันด้วยแบบจำลองฉบับย่อกันก่อน'
);
main.addConstituentText(result, config, '#text-constituent-seats');
main.addInitialAllocationText(result, config, '#text-initial-allocation');
main.addInitialAllocatedText(result, config, '#text-initial-allocated-seats');
main.addFinalAllocationText(result, config, '#text-final-allocation');

table.addTable(result, '#table-constituent', 'constituent');
table.addTable(result, '#table-initial-allocation', 'initial-allocation');
table.addTable(result, '#table-final-allocation', 'final-allocation');
table.addTable(result, '#table-conclusion', 'conclusion');
// table.addTable(result, '#table-sides', 'sides');
// table.addTable(result, '#table-all', 'all');

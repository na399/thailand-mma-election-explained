import * as main from './main';
import * as table from './table';
import seedrandom from 'seedrandom';

seedrandom('starter', { global: true });

let starterConfig = new main.ElectionConfig({
  nTotalSeat: 5,
  nConstituentSeat: 3,
  nVoter: 500000,
  pVoterTurnout: 0.7,
  nParty: 4
});

const starterResult = main.runElection(starterConfig);

main.addIntroText(
  starterConfig,
  '#intro',
  'เพื่อลดความสับสน จึงขอเริ่มต้นกันด้วยแบบจำลองฉบับย่อกันก่อน'
);
main.drawResultConstituents(starterResult, starterConfig, '#constituents');
main.drawWaffle(
  starterResult,
  starterConfig,
  '#parliament-seats',
  'constituent'
);
main.addConstituentText(starterResult, starterConfig, '#constituent-seats');
main.drawInitialAllocation(starterResult, starterConfig, '#initial-allocation');
main.addAllocatedText(starterResult, starterConfig, '#allocated-seats');
main.drawFinalAllocation(starterResult, starterConfig, '#final-allocation');
main.addPartyListText(starterResult, starterConfig, '#party-list-seats');

table.addTable(starterResult, '#table-constituent', 'constituent');
table.addTable(starterResult, '#table-initial-allocation', 'initial-allocation');
table.addTable(starterResult, '#table-final-allocation', 'final-allocation');
table.addTable(starterResult, '#table-conclusion', 'conclusion');
table.addTable(starterResult, '#table-all', 'all');

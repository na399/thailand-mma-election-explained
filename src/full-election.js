import * as main from './main';
import * as table from './table';
import seedrandom from 'seedrandom';

seedrandom('full', { global: true });

let fullConfig = new main.ElectionConfig({
  nParty: 8
});

const fullResult = main.runElection(fullConfig);

main.addIntroText(fullConfig, '#intro', '');
main.drawResultConstituents(fullResult, fullConfig, '#constituents');
main.drawWaffle(fullResult, fullConfig, '#parliament-seats', 'constituent');
main.addConstituentText(fullResult, fullConfig, '#constituent-seats');
main.drawInitialAllocation(fullResult, fullConfig, '#initial-allocation');
main.addAllocatedText(fullResult, fullConfig, '#allocated-seats');
main.drawFinalAllocation(fullResult, fullConfig, '#final-allocation');
main.addPartyListText(fullResult, fullConfig, '#party-list-seats');

table.addTable(fullResult, '#table-constituent', 'constituent');
table.addTable(fullResult, '#table-initial-allocation', 'initial-allocation');
table.addTable(fullResult, '#table-final-allocation', 'final-allocation');
table.addTable(fullResult, '#table-conclusion', 'conclusion');
table.addTable(fullResult, '#table-sides', 'sides');
table.addTable(fullResult, '#table-all', 'all');

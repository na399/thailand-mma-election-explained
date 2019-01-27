import * as main from './main';
import seedrandom from 'seedrandom';

seedrandom('full', { global: true });

let fullConfig = new main.ElectionConfig({
  nParty: 8
});

const fullResult = main.runElection(fullConfig);

main.drawResultConstituents(fullResult, fullConfig);
main.drawWaffle(fullResult, fullConfig, "#parliament-seats", "constituent")
main.drawInitialAllocation(fullResult, fullConfig);
main.drawFinalAllocation(fullResult, fullConfig);

main.addIntroText(fullConfig, '');
main.addConstituentText(fullResult, fullConfig);
main.addAllocatedText(fullResult, fullConfig);
main.addPartyListText(fullResult, fullConfig);

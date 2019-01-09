import * as main from './main';
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

main.drawResultConstituents(starterResult, starterConfig);
main.drawInitialAllocation(starterResult, starterConfig);
main.drawFinalAllocation(starterResult, starterConfig);

console.log(starterResult);
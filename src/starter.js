import * as index from './index';
import seedrandom from 'seedrandom';

seedrandom('starter', { global: true });

let starterConfig = new index.ElectionConfig({
  nTotalSeat: 5,
  nConstituentSeat: 3,
  nVoter: 500000,
  pVoterTurnout: 0.7,
  nParty: 4
});

const starterResult = index.runElection(starterConfig);

index.drawResultConstituents(starterResult, starterConfig);
index.drawInitialAllocation(starterResult, starterConfig);
index.drawFinalAllocation(starterResult, starterConfig);

console.log(starterResult);
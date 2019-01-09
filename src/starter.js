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

main.addIntroText(starterConfig, 'เพื่อลดความสับสน จึงขอเริ่มต้นกันด้วยแบบจำลองฉบับย่อกันก่อน');
main.drawResultConstituents(starterResult, starterConfig);
main.addConstituentText(starterResult, starterConfig);
main.drawInitialAllocation(starterResult, starterConfig);
main.addAllocatedText(starterResult, starterConfig);
main.drawFinalAllocation(starterResult, starterConfig);
main.addPartyListText(starterResult, starterConfig);

console.log(starterResult);
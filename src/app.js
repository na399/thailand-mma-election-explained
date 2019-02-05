import * as main from './main';
import { ElectionConfig, Party } from './main';
import * as table from './table';
import seedrandom from 'seedrandom';

function runApp(config, option, parties) {
  seedrandom(option.randomSeed, { global: true });

  /*******************************
  Election Simulation or Allocation
  ********************************/
  let result;

  if (option.onlyAllocation) {
    result = main.runAllocation(config, { parties });
  } else {
    result = main.runFullElection(config);
  }

  /*******************************
  Narration
  ********************************/
  if (option.starter) {
    main.addIntroText(
      config,
      '#text-intro',
      'เพื่อให้เข้าใจง่ายขึ้น เรามาเริ่มต้นกันด้วยแบบจำลองฉบับย่อกันก่อน'
    );
  } else {
    if (!option.onlyAllocation) {
      main.addIntroText(config, '#text-intro', '');
    }
  }

  main.addConstituentText(result, config, '#text-constituent-seats');
  main.addInitialAllocationText(result, config, '#text-initial-allocation');
  main.addInitialAllocatedText(result, config, '#text-initial-allocated-seats');
  main.addFinalAllocationText(result, config, '#text-final-allocation');

  /*******************************
  Tables
  ********************************/
  table.addTable(result, '#table-constituent', 'constituent');
  table.addTable(result, '#table-initial-allocation', 'initial-allocation');
  table.addTable(result, '#table-final-allocation', 'final-allocation');
  table.addTable(result, '#table-conclusion', 'conclusion');

  if (option.side) {
    table.addTable(result, '#table-sides', 'sides');
  }

  if (option.all) {
    table.addTable(result, '#table-all', 'all');
  }

  /*******************************
  Plots
  ********************************/
  if (!option.onlyAllocation) {
    main.drawResultConstituents(result, config, '#result-constituents');
  }
  main.drawWaffle(
    result,
    config,
    '#parliament-seats-constituent',
    'constituent'
  );
  main.drawInitialAllocation(result, config, '#initial-allocation');
  main.drawWaffle(result, config, '#parliament-seats-party-list', 'partyList');
  main.drawFinalAllocation(result, config, '#final-allocation');
  main.drawWaffle(result, config, '#parliament-seats-all', 'all');
}

export { runApp, ElectionConfig, Party };

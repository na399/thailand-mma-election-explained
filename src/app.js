import * as main from './main';
import { ElectionConfig, Party } from './main';
import * as table from './table';
import * as parliament from './parliament';
import seedrandom from 'seedrandom';
import * as d3 from 'd3';

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
    } else {
      d3.select('#text-intro').html('');
    }
  }

  main.addConstituentText(result, config, '#text-constituent-seats');
  main.addInitialAllocationText(result, config, '#text-initial-allocation');
  main.addInitialAllocatedText(result, config, '#text-initial-allocated-seats');
  main.addFinalAllocationText(result, config, '#text-final-allocation');

  d3.select('#text-party-list').html(`
    <h4>จำนวนส.ส.บัญชีรายชื่อ</h4>
    <p>
      จากกราฟข้างบน แบ่งจำนวนส.ส.พึงมี ■ และ ส.ส.บัญชีรายชื่อ ◆
      (ส่วนต่างระหว่างจำนวนส.ส.พึงมี ■ - จำนวนส.ส.แบ่งเขต ●)
      ให้แต่ละพรรคได้ดังต่อไปนี้
    </p>`);

  d3.select('#text-conclusion').html(`
    <h3>สรุปจำนวนส.ส.ทั้งหมด</h3>`);
  /*******************************
  Tables
  ********************************/
  table.addTable(result, '#table-constituent', 'constituent');
  table.addTable(result, '#table-initial-allocation', 'initial-allocation');
  table.addTable(result, '#table-final-allocation', 'final-allocation');
  table.addTable(result, '#table-conclusion', 'conclusion');

  if (option.side) {
    d3.select('#text-sides').html(`
      <h3>การจัดตั้งฝ่ายรัฐบาลและฝ่ายค้าน</h3>
      <p>
        พรรคหรือการรวมกันของพรรคที่มีจำนวนที่นั่งส.ส.ในสภารวมกันได้เกินกึ่งหนึ่ง
        หรือ 251 ที่นั่งขึ้นไป มีโอกาสจัดตั้งเป็นฝ่ายรัฐบาล
      </p>
      <p>
        แต่การได้มาซึ่งนายกรัฐมนตรีนั้นมาจากการลงคะแนนเสียงของทั้งสภาผู้แทนราษฎร
        (ส.ส.) จำนวน 500 เสียง และวุฒิสภา (ส.ว.) อีกจำนวน 250 เสียง
        ดั้งนั้นจึงต้องใช้เสียงเกินกึ่งหนึ่ง หรือ 376 เสียงขึ้นไป
      </p>
      <p>
        ด้วยเหตุนี้ หากเกรงว่า
        ส.ว.ทั้งหมดจะออกเสียงไม่ตรงกับฝ่ายรัฐบาลในการเลือกนายกรัฐมนตรี
        ฝ่ายรัฐบาลจึงต้องการส.ส.ถึง 376 ที่นั่ง แทนที่จะเป็น 251 ที่นั่ง
        เพื่อให้แน่ใจว่าจะได้เลือกนายกรัฐมนตรีที่ฝ่ายรัฐบาลเองต้องการ
        มาดำรงตำแหน่ง
      </p>`);
    table.addTable(result, '#table-sides', 'sides');
  } else {
    d3.select('#text-sides').html('');
    d3.select('#table-sides').html('');
  }

  if (option.all) {
    table.addTable(result, '#table-all', 'all');
  } else {
    d3.select('#table-all').html('');
  }

  /*******************************
  Plots
  ********************************/
  if (!option.onlyAllocation) {
    d3.select('#result-constituents').html('');
    main.drawResultConstituents(result, config, '#result-constituents');
  } else {
    d3.select('#result-constituents').html('');
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
  // main.drawWaffle(result, config, '#parliament-seats-all', 'all');

  parliament.drawParliament(result, '#parliament-seats-all');
}

export { runApp, ElectionConfig, Party };

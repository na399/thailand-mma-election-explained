import * as d3 from 'd3';
import _ from 'lodash';

class ElectionConfig {
  constructor({
    nTotalSeat = 500,
    nConstituentSeat = 350,
    nPartyListSeat,
    nVoter = 50000000,
    pVoterTurnout = 0.7,
    nVote,
    nParty = 5
  } = {}) {
    this.nTotalSeat = nTotalSeat;
    this.nConstituentSeat = nConstituentSeat;
    this.nPartyListSeat = nTotalSeat - nConstituentSeat;
    this.nVoter = nVoter;
    this.pVoterTurnout = pVoterTurnout;
    this.nVote = nVoter * pVoterTurnout;
    this.nParty = nParty;
  }
}

class ElectionResult {
  constructor(
    parties,
    resultConstituents,
    constituentSeatsNames,
    nTotalVote,
    nVotePerSeat,
    nPartyWithoutPartyListNeeded,
    nVotePerRemainingSeat,
    nUnallocatedSeat,
    nTotalInitialAllocatedSeat,
    nTotalAllocatedSeat,
    nTotalConstituentSeat,
    nTotalPartyListSeat,
    parliamentSeat
  ) {
    this.parties = parties;
    this.resultConstituents = resultConstituents;
    this.constituentSeatsNames = constituentSeatsNames;
    this.nTotalVote = nTotalVote;
    this.nVotePerSeat = nVotePerSeat;
    this.nPartyWithoutPartyListNeeded = nPartyWithoutPartyListNeeded;
    this.nVotePerRemainingSeat = nVotePerRemainingSeat;
    this.nUnallocatedSeat = nUnallocatedSeat;
    this.nTotalInitialAllocatedSeat = nTotalInitialAllocatedSeat;
    this.nTotalAllocatedSeat = nTotalAllocatedSeat;
    this.nTotalConstituentSeat = nTotalConstituentSeat;
    this.nTotalPartyListSeat = nTotalPartyListSeat;
    this.parliamentSeat = parliamentSeat;
  }
}

class Party {
  constructor({
    name = '',
    color = '',
    pParty = 0,
    nTotalVote = 0,
    nConstituentSeat = 0,
    nExpectedConstituentSeat = 0,
    nPartyListSeat = 0,
    nInitialAllocatedSeat = 0,
    nAllocatedSeat = 0,
    nTotalSeat = 0,
    bPartyListNeeded = true,
    bAllocationFilled = false,
    nRemainderVote = 0,
    side,
  } = {}) {
    this.name = name;
    this.color = color;
    this.pParty = pParty;
    this.nTotalVote = nTotalVote;
    this.nConstituentSeat = nConstituentSeat;
    this.nPartyListSeat = nPartyListSeat;
    this.nInitialAllocatedSeat = nInitialAllocatedSeat;
    this.nAllocatedSeat = nAllocatedSeat;
    this.nTotalSeat = nTotalSeat;
    this.bPartyListNeeded = bPartyListNeeded;
    this.bAllocationFilled = bAllocationFilled,
    this.nRemainderVote = nRemainderVote;
    this.nExpectedConstituentSeat = nExpectedConstituentSeat;
    this.side = side;
  }
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function simulateResultConstituent(parties, nVote, expectedConstituentSeats) {
  /* USE PROBABILITIES FOR VOTE
  let resultConstituent = parties.map(party => {
    return {
      name: party.name,
      nVote: Math.round(
        party.pParty * nVote * (Math.random() * (0.7 - 1.3) + 0.7)
      )
    };
  });
  */

  let rankings = [];
  // let winningParty = _.sample(expectedConstituentSeats);
  // prefer Math.random(), which is controlled by seedrandom
  let winningParty =
    expectedConstituentSeats[
      Math.floor(Math.random() * expectedConstituentSeats.length)
    ];

  let partyNames = parties.map(party => party.name);

  // simulate ranking for the constituent
  rankings.push(winningParty);
  rankings = rankings.concat(
    shuffle(partyNames.filter(name => name != winningParty))
  );

  // simulate vote for each pary
  let votes = Array.from({ length: parties.length }, () => Math.random());
  votes = votes.map(vote => _.round((vote / _.sum(votes)) * nVote));
  votes = _.reverse(_.sortBy(votes));

  let resultConstituent = rankings.map((name, i) => {
    return {
      name: name,
      nVote: votes[i]
    };
  });

  return resultConstituent;
}

function runElection(electionConfig) {
  // get party winning propablities
  let pParties = Array.from({ length: electionConfig.nParty }, () =>
    Math.random()
  );

  pParties = pParties.map(p => p / _.sum(pParties));

  const partyNames = [
    'แดง',
    'ฟ้า',
    'เขียว',
    'ส้ม',
    'ชมพู',
    'น้ำเงิน',
    'เขียวอ่อน',
    'ส้มอ่อน',
    'ม่วง',
    'น้ำตาล',
    'ม่วงอ่อน',
    'เหลือง'
  ];

  const partyColors = [
    '#e31a1c',
    '#a6cee3',
    '#33a02c',
    '#ff7f00',
    '#fb9a99',
    '#1f78b4',
    '#b2df8a',
    '#fdbf6f',
    '#6a3d9a',
    '#b15928',
    '#cab2d6',
    '#ffff99'
  ]; // must be unique

  const sides = [
    'ฝ่ายรัฐบาล',
    'ฝ่ายค้าน'
  ]

  // assign winning propabilities and party names, i.e., colours
  let parties = pParties.map((p, i) => {
    let party = new Party({
      name: partyNames[i],
      color: partyColors[i],
      pParty: p,
      nExpectedConstituentSeat: _.round(p * electionConfig.nConstituentSeat),
      side: sides[i % 2]
    });
    return party;
  });

  // array of possible winners to be drawn from randomly
  let expectedConstituentSeats = parties.map(party => {
    return Array.from(
      { length: party.nExpectedConstituentSeat },
      () => party.name
    );
  });

  expectedConstituentSeats = _.flatten(expectedConstituentSeats);

  // calculate number of votes per each constituent
  let nVotePerConstituent = Math.floor(
    electionConfig.nVote / electionConfig.nConstituentSeat
  );

  // generate result for all constituents
  let resultConstituents = Array.from(
    { length: electionConfig.nConstituentSeat },
    () =>
      simulateResultConstituent(
        parties,
        nVotePerConstituent,
        expectedConstituentSeats
      )
  );

  // find winners from constituents
  let constituentSeats = resultConstituents.map(resultConstituent => {
    let seat = resultConstituent.reduce(
      (seat, resultParty) => {
        if (resultParty.nVote > seat.nVote) {
          seat = resultParty;
        } else if (resultParty.nVote == seat.nVote) {
          // if draw, randomly pick one
          if (Math.random() > 0.5) {
            seat = resultParty;
          }
        }
        return seat;
      },
      { nVote: 0 }
    );
    return seat;
  });

  const constituentSeatsNames = constituentSeats.map(party => party.name);

  // count constituentSeats won by party
  parties = parties.map(party => {
    party.nConstituentSeat = constituentSeatsNames.filter(
      name => name == party.name
    ).length;
    return party;
  });

  // find total votes from all constituents by party
  parties = parties.map(party => {
    party.nTotalVote = resultConstituents.reduce(
      (nTotalPartyVote, resultConstituent) => {
        nTotalPartyVote += resultConstituent.filter(
          i => i.name == party.name
        )[0].nVote;
        return nTotalPartyVote;
      },
      0
    );
    return party;
  });

  // find total votes from all constituents
  const nTotalVote = parties.reduce((nTotalVote, party) => {
    nTotalVote += party.nTotalVote;
    return nTotalVote;
  }, 0);

  // calculate allocated seats
  let nVotePerSeat = Math.floor(nTotalVote / electionConfig.nTotalSeat);

  parties = parties.map(party => {
    party.nInitialAllocatedSeat = Math.floor(party.nTotalVote / nVotePerSeat);
    return party;
  });

  parties = parties.map(party => {
    party.nInitialRemainderVote =
        party.nTotalVote % (party.nInitialAllocatedSeat * nVotePerSeat) ||
        party.nTotalVote; // in case of party.nInitialAllocatedSeat == 0
        return party;
  });

  parties = _.orderBy(parties, 'nInitialRemainderVote', 'desc');

  const nInitialUnallocatedSeat = parties.reduce(
    (nInitialUnallocatedSeat, party) =>
      nInitialUnallocatedSeat - (party.nInitialAllocatedSeat),
    electionConfig.nTotalSeat
  );

  for (let i = 0; i < nInitialUnallocatedSeat ; i++) {
    parties[i % electionConfig.nParty].nInitialAllocatedSeat += 1;
  }


  // check whether nConstituentSeat exceeds nInitialAllocatedSeats
  for (let party of parties) {
    if (party.nConstituentSeat >= party.nInitialAllocatedSeat) {
      party.bPartyListNeeded = false;
      party.bAllocationFilled = true;
    }
  }

  // recalculate votes per remaining seat if there is at least one party with nConstituentSeat exceeds nInitialAllocatedSeats
  const nPartyWithoutPartyListNeeded = _.filter(parties, [
    'bPartyListNeeded',
    false
  ]).length;

  if (_.filter(parties, ['bPartyListNeeded', false]).length > 0) {
    const nRemainingSeat = _.filter(parties, [
      'bPartyListNeeded',
      false
    ]).reduce(
      (nRemainingSeat, party) => nRemainingSeat - party.nConstituentSeat,
      electionConfig.nTotalSeat
    );

    let nTotalRemainingVote = parties.reduce((nTotalRemainingVote, party) => {
      if (party.bPartyListNeeded) {
        nTotalRemainingVote += party.nTotalVote;
      }
      return nTotalRemainingVote;
    }, 0);

    var nVotePerRemainingSeat = Math.floor(
      nTotalRemainingVote / nRemainingSeat
    );
  } else {
    var nVotePerRemainingSeat = nVotePerSeat;
  }

  parties = parties.map(party => {
    if (party.bPartyListNeeded) {
      party.nAllocatedSeat = Math.floor(
        party.nTotalVote / nVotePerRemainingSeat
      );
      party.nRemainderVote =
        party.nTotalVote % (party.nAllocatedSeat * nVotePerRemainingSeat) ||
        party.nTotalVote; // in case of party.nAllocatedSeat == 0
    } else {
      party.nAllocatedSeat = party.nConstituentSeat;
    }
    return party;
  });

  // allocate party list seats
  parties = parties.map(party => {
    party.nPartyListSeat = party.nAllocatedSeat - party.nConstituentSeat;
    return party;
  });

  // assing unallocated seats
  const nUnallocatedSeat = parties.reduce(
    (nUnallocatedSeat, party) =>
      nUnallocatedSeat - (party.nConstituentSeat + party.nPartyListSeat),
    electionConfig.nTotalSeat
  );

  parties = _.orderBy(parties, 'nRemainderVote', 'desc');
  let nPartiesGettingPartyList = _.filter(parties, 'bPartyListNeeded').length;

  for (let i = 0; i < nUnallocatedSeat; i++) {
    parties[i % nPartiesGettingPartyList].nAllocatedSeat += 1;
    parties[i % nPartiesGettingPartyList].nPartyListSeat += 1;
  }

  // calculate final total seat numbers
  parties = parties.map(party => {
    party.nTotalSeat = party.nConstituentSeat + party.nPartyListSeat;
    return party;
  });

  const nTotalInitialAllocatedSeat = parties.reduce(
    (n, party) => n + party.nInitialAllocatedSeat,
    0
  );

  const nTotalAllocatedSeat = parties.reduce(
    (n, party) => n + party.nAllocatedSeat,
    0
  );

  const nTotalConstituentSeat = parties.reduce(
    (n, party) => n + party.nConstituentSeat,
    0
  );

  const nTotalPartyListSeat = parties.reduce(
    (n, party) => n + party.nPartyListSeat,
    0
  );

  // fill parliament seats
  const partyNamesBySeat = _.orderBy(
    parties,
    ['nTotalSeat', 'nConstituentSeat', 'nTotalVote'],
    ['desc', 'desc', 'desc']
  ).map(party => party.name);

  let parliamentSeat = { all: [], constituent: [], partyList: [] };

  let iAll = 0;
  let iConstituent = 0;
  let iPartyList = 0;

  for (let partyName of partyNamesBySeat) {
    const party = _.find(parties, ['name', partyName]);

    for (let i of _.range(iAll, iAll + party.nTotalSeat)) {
      parliamentSeat.all.push({
        i: i,
        iOfParty: i - iAll,
        name: party.name,
        color: party.color,
        party: party
      });
    }
    iAll += party.nTotalSeat;

    for (let i of _.range(
      iConstituent,
      iConstituent + party.nConstituentSeat
    )) {
      parliamentSeat.constituent.push({
        i: i,
        iOfParty: i - iConstituent,
        name: party.name,
        color: party.color,
        party: party
      });
    }
    iConstituent += party.nConstituentSeat;

    for (let i of _.range(iPartyList, iPartyList + party.nPartyListSeat)) {
      parliamentSeat.partyList.push({
        i: i,
        iOfParty: i - iPartyList,
        name: party.name,
        color: party.color,
        party: party
      });
    }
    iPartyList += party.nPartyListSeat;
  }

  let electionResult = new ElectionResult(
    parties,
    resultConstituents,
    constituentSeatsNames,
    nTotalVote,
    nVotePerSeat,
    nPartyWithoutPartyListNeeded,
    nVotePerRemainingSeat,
    nUnallocatedSeat,
    nTotalInitialAllocatedSeat,
    nTotalAllocatedSeat,
    nTotalConstituentSeat,
    nTotalPartyListSeat,
    parliamentSeat
  );

  return electionResult;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/*******************************
 Bar plots for votes from each constituent
********************************/
function getResultConstituentConfig() {
  const width = 400;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  return {
    width,
    height,
    margin
  };
}

function getResultConstituentScales(electionResult, config) {
  const { width, height, margin } = config;

  const yMax = _.max(
    electionResult.resultConstituents.map(constituent =>
      _.max(constituent.map(party => party.nVote))
    )
  );

  const partyNames = _.orderBy(
    electionResult.parties,
    'nTotalVote',
    'desc'
  ).map(party => party.name);

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top])
    .nice();

  const xScale = d3
    .scaleBand()
    .domain(partyNames)
    .range([margin.left, width - margin.right])
    .paddingOuter(0.4)
    .paddingInner(0.8)
    .round(true);

  return { xScale, yScale };
}

function drawResultConstituent(
  electionResult,
  resultConstituent,
  selector,
  config,
  scales
) {
  const { width, height, margin } = config;
  const { xScale, yScale } = scales;

  const svg = d3
    .select(selector)
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

  const bars = svg
    .append('g')
    .selectAll('.bar')
    .data(resultConstituent);

  bars
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.name))
    .attr('y', d => yScale(d.nVote))
    .attr('width', xScale.bandwidth())
    .attr('height', d => yScale(0) - yScale(d.nVote))
    .attr('fill', d => {
      const p = _.find(electionResult.parties, ['name', d.name]);
      return p.color;
    });

  // draw circle on the winner
  const maxVote = _.max(_.map(resultConstituent, d => d.nVote));
  for (let party of resultConstituent) {
    if (party.nVote == maxVote) {
      svg
        .datum(party)
        .append('circle')
        .attr('cx', d => xScale(d.name) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.nVote) + xScale.bandwidth())
        .attr('r', xScale.bandwidth())
        .attr('fill', d => {
          const p = _.find(electionResult.parties, ['name', d.name]);
          return p.color;
        })
        .attr('stroke', d => {
          const p = _.find(electionResult.parties, ['name', d.name]);
          return d3.color(p.color).darker();
        })
        .attr('stroke-width', 3);
    }
  }

  // // paint losing parties with white
  //   const maxVote = _.max(_.map(resultConstituent, d => d.nVote));
  // for (let party of resultConstituent) {
  //   if (party.nVote != maxVote) {
  //     svg
  //       .datum(party)
  //       .append('rect')
  //       .attr('x', d => xScale(d.name) + 3)
  //       .attr('y', d => yScale(d.nVote) + 3)
  //       .attr('width', xScale.bandwidth() - 6)
  //       .attr('height', d => yScale(0) - yScale(d.nVote) - 3)
  //       .attr('fill', 'white');
  //   }
  // }

  const yAxis = d3
    .axisLeft()
    .tickFormat(d => (d % 20000 === 0 ? `${numberWithCommas(d)}` : ''))
    .scale(yScale);

  const yAxisG = svg
    .append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

  yAxisG.select('.domain').remove();

  const xAxis = d3
    .axisBottom()
    .tickSizeOuter(0)
    .scale(xScale);
  svg
    .append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${yScale(0)})`)
    .call(xAxis);
}

function drawResultConstituents(electionResult, electionConfig, selector) {
  const config = getResultConstituentConfig();
  const scales = getResultConstituentScales(electionResult, config);
  for (let i = 0; i < electionConfig.nConstituentSeat; i++) {
    d3.select(selector)
      .append('svg')
      .attr('id', `constituent${i}`);

    drawResultConstituent(
      electionResult,
      electionResult.resultConstituents[i],
      `#constituent${i}`,
      config,
      scales
    );
  }
}

/*******************************
 Waffle Plots for parliament seats 
********************************/
// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

function drawWaffle(electionResult, electionConfig, selector, seatType) {
  const seatData = electionResult.parliamentSeat[seatType]; // 'all', 'constituent', 'partyList'

  const nCol = 25;
  const nRow = Math.ceil(seatData.length / nCol);

  const grid = cartesian(d3.range(nRow), d3.range(nCol));

  const gridSize = 15;
  const padding = 5;

  const width = nCol * (gridSize + padding);
  const height = nRow * (gridSize + padding);
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

  const seats = svg
    .append('g')
    .selectAll('rect')
    .data(seatData);

  // circle
  seats
    .enter()
    .append('circle')
    .attr('cx', gridSize / 2)
    .attr('cy', gridSize / 2)
    .attr('r', gridSize / 2)
    .attr('fill', d => d.color)
    .attr('stroke', d => d3.color(d.color).darker())
    .attr('stroke-width', gridSize / 10)
    .attr(
      'transform',
      (d, i) =>
        `translate(${grid[i][1] * (gridSize + padding)}, 
        ${grid[i][0] * (gridSize + padding)})`
    );

  // // diamond
  // seats
  //   .enter()
  //   .append('rect')
  //   .attr('width', gridSize)
  //   .attr('height', gridSize)
  //   .attr('fill', d => d.color)
  //   .attr('stroke', d => d3.color(d.color).darker())
  //   .attr('stroke-width', gridSize / 10)
  //   .attr(
  //     'transform',
  //     (d, i) =>
  //       `translate(${grid[i][1] * (gridSize + padding)},
  //       ${grid[i][0] * (gridSize + padding)})
  //       rotate(45 ${gridSize / 2} ${gridSize / 2})
  //       scale(0.6)`
  //   );
}

/*******************************
 Bar plots for votes from entire country 
********************************/
function getAllocationConfig(electionResult, electionConfig, stage) {
  const width = 1000;
  const height =
    stage == 'initial'
      ? electionConfig.nParty * 80
      : (electionConfig.nParty - electionResult.nPartyWithoutPartyListNeeded) *
        100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  return {
    width,
    height,
    margin
  };
}

function getAllocationScales(electionResult, config, stage) {
  const { width, height, margin } = config;

  const xMax = _.max(electionResult.parties.map(party => party.nTotalVote));
  let partyNames;

  if (stage == 'initial') {
    partyNames = _.orderBy(electionResult.parties, 'nTotalVote', 'asc').map(
      party => party.name
    );
  } else {
    const remainingParties = _.filter(
      electionResult.parties,
      'bPartyListNeeded'
    );
    // xMax = _.max(remainingParties.map(party => party.nTotalVote));
    partyNames = _.orderBy(remainingParties, 'nTotalVote', 'asc').map(
      party => party.name
    );
  }

  const xScale = d3
    .scaleLinear()
    .domain([0, xMax])
    .range([margin.left, width - margin.right])
    .nice();

  const yScale = d3
    .scaleBand()
    .domain(partyNames)
    .range([height - margin.bottom, margin.top])
    .padding(0.5)
    .round(true);

  return { xScale, yScale, xMax };
}

function drawAllocationChart(electionResult, selector, config, scales, stage) {
  const { width, height, margin } = config;
  let { xScale, yScale, xMax } = scales;

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

  const bars = svg
    .append('g')
    .selectAll('.bar')
    .data(
      stage == 'initial'
        ? electionResult.parties
        : _.filter(electionResult.parties, 'bPartyListNeeded')
    );

  bars
    .enter()
    .append('rect')
    .attr('y', d => yScale(d.name))
    .attr('x', margin.left)
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d.nTotalVote) - xScale(0))
    .attr('fill', d => d.color);

  const xAxis = d3
    .axisBottom()
    .tickFormat(d => (d % 20000 === 0 ? `${numberWithCommas(d)}` : ''))
    .scale(xScale);

  const xAxisG = svg
    .append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  xAxisG.select('.domain').remove();

  const yAxis = d3
    .axisLeft()
    .tickSizeOuter(0)
    .scale(yScale);
  svg
    .append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

  // seat allocation
  const nVotePerSeat =
    stage == 'initial'
      ? electionResult.nVotePerSeat
      : electionResult.nVotePerRemainingSeat;

  const blockWidth = xScale(nVotePerSeat) - xScale(0);
  const markSize = blockWidth < 20 ? Math.floor(blockWidth) : 20;

  xMax =
    stage == 'initial'
      ? xMax
      : _.max(
          _.filter(electionResult.parties, 'bPartyListNeeded').map(
            party => party.nTotalVote
          )
        );

  let i = 0;
  while (nVotePerSeat * i <= xMax) {
    i++;
    svg
      .append('line')
      .attr('x1', xScale(nVotePerSeat * i))
      .attr('x2', xScale(nVotePerSeat * i))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    svg
      .append('text')
      .attr('y', margin.top)
      .attr('x', xScale(nVotePerSeat * (i - 0.5)))
      .attr('text-anchor', 'middle')
      .attr('font-size', markSize * 0.8)
      .text(i);
  }

  // draw constituent seats won by each party
  let seatData = electionResult.parliamentSeat['constituent'];
  // remove filled parties
  seatData =
    stage == 'initial'
      ? seatData
      : _.filter(seatData, 'party.bPartyListNeeded');

  const seats = svg
    .append('g')
    .selectAll('circle')
    .data(seatData);

  seats
    .enter()
    .append('circle')
    // .attr('cy', d => yScale(d.name) + yScale.bandwidth() / 2)
    .attr('cy', d => yScale(d.name))
    .attr('cx', d => xScale(nVotePerSeat * (d.iOfParty + 0.5)))
    .attr('r', markSize / 2)
    // .attr('fill', d => d3.color(d.color).brighter(2))
    .attr('fill', 'white')
    .attr('stroke', d => d3.color(d.color).darker())
    .attr('stroke-width', 2);

  seats
    .enter()
    .append('text')
    // .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2 + markSize * 0.25)
    .attr('y', d => yScale(d.name) + markSize * 0.25)
    .attr('x', d => xScale(nVotePerSeat * (d.iOfParty + 0.5)))
    .attr('text-anchor', 'middle')
    .attr('font-size', markSize * 0.7)
    .text(d => d.iOfParty + 1);

  // draw party list seats
  if (stage != 'initial') {
    const seatDataPL = electionResult.parliamentSeat['partyList'];

    const seatsPL = svg
      .append('g')
      .selectAll('circle')
      .data(seatDataPL);

    seatsPL
      .enter()
      .append('rect')
      // .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2 - markSize / 2)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() - markSize / 2)
      .attr('x', d =>
        xScale(nVotePerSeat * (d.iOfParty + d.party.nConstituentSeat + 0.5))
      )
      .attr('width', markSize * 0.8)
      .attr('height', markSize * 0.8)
      .attr('transform', d => {
        // const cy = yScale(d.name) + yScale.bandwidth() / 2 - markSize / 2;
        const cy = yScale(d.name) + yScale.bandwidth() - markSize / 2;
        const cx = xScale(
          nVotePerSeat * (d.iOfParty + d.party.nConstituentSeat + 0.5)
        );
        return `rotate(45 ${cx} ${cy})`;
      })
      // .attr('fill', d => d3.color(d.color).brighter(2))
      .attr('fill', 'white')
      .attr('stroke', d => d3.color(d.color).darker())
      .attr('stroke-width', 2);

    seatsPL
      .enter()
      .append('text')
      // .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2 + markSize * 0.25)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() + markSize * 0.25)
      .attr('x', d =>
        xScale(nVotePerSeat * (d.iOfParty + d.party.nConstituentSeat + 0.5))
      )
      .attr('text-anchor', 'middle')
      .attr('font-size', markSize * 0.7)
      .text(d => d.iOfParty + 1);
  }
}

function drawInitialAllocation(electionResult, electionConfig, selector) {
  const config = getAllocationConfig(electionResult, electionConfig, 'initial');
  const scales = getAllocationScales(electionResult, config, 'initial');
  drawAllocationChart(electionResult, selector, config, scales, 'initial');
}

function drawFinalAllocation(electionResult, electionConfig, selector) {
  const config = getAllocationConfig(electionResult, electionConfig, 'final');
  const scales = getAllocationScales(electionResult, config, 'final');
  drawAllocationChart(electionResult, selector, config, scales, 'final');
}

/*******************************
 Descriptions
********************************/
function addIntroText(electionConfig, selector, additionalText) {
  const introText = `
    <p>การเลือกตั้งที่จะถึงนี้ จะเป็นครั้งแรกของการลงคะแนนเสียงแบบใหม่ ตามรัฐธรรมนูญฉบับปีพ.ศ.2560 
    ที่เรียกว่า ระบบเลือกตั้งแบบจัดสรรปันส่วนผสม (mixed member apportionment system หรือ MMA)
    <p>จากเดิมผู้มีสิทธิ์จะได้รับบัตรเลือกตั้ง 2 ใบ โดยสามารถเลือกได้ทั้งผู้สมัครส.ส. แบบแบ่งเขตเลือกตั้ง 
    และผู้สมัครส.ส. แบบบัญชีรายชื่อผ่านการเลือกพรรคการเมือง</p>
    <p>แต่การเลือกตั้งในวันที่ 24 มีนาคม 2562 เราจะได้รับบัตรเลือกตั้งเหลือเพียงแค่ใบเดียวคือ 
    การเลือกผู้สมัครแบบแบ่งเขตเลือกตั้งเท่านั้น
    ส่วนส.ส.แบบบัญชีรายชื่อ จะได้มาจากการคำนวณโดยอ้อม ซึ่งมีความสลับซับซ้อน สร้างความงุนงงให้กับผู้คนทั่วไป
    </p>
    <p>ต่อไปนี้จะไปการแสดงแบบจำลองสมมติของการเลือกตั้ง และการนับจำนวนส.ส. แบบต่าง ๆ
    เพื่อเราจะได้เข้าใจระบบเลือกตั้งแบบจัดสรรปันส่วนผสมนี้ดียิ่งขึ้น</p>
    <br />
    <p>${additionalText}</p>
    <p>กำหนดให้ในสภามีจำนวน ส.ส. ทั้งหมด ${electionConfig.nTotalSeat} ที่นั่ง 
    แบ่งเป็นแบบแบ่งเขต ${electionConfig.nConstituentSeat} ที่นั่ง 
    และแบบบัญชีรายชื่อ ${electionConfig.nPartyListSeat} ที่นั่ง</p>
    <p>ดังนั้นจึงมีเขตเลือกตั้งทั้งหมด ${electionConfig.nConstituentSeat} เขต 
    โดยสมมติว่าทุกเขตมีผู้ลงสมัครครบทุกพรรค รวม ${electionConfig.nParty} พรรค 
    แต่ละพรรคแทนด้วยสีที่สมมติขึ้นมา</p>
    <p>และมีผู้มาใช้สิทธิ์เลือกตั้ง จำนวน 
    ${numberWithCommas(electionConfig.nVote)} คน 
    โดยสมมติว่าบัตรเลือกตั้งทุกใบเป็นบัตรดีและลงคะแนนเสียง</p>
    <p>(จำนวนเสียงในแต่ละเขตนั้นเป็นจำนวนสุ่ม 
      ไม่ได้อ้างอิงมาจากการเลือกตั้งครั้งก่อนหรือผลโพลในปัจจุบันแต่อย่างใด)</p>
    <br />
    <h3>ผลการนับคะแนนแบบแบ่งเขตเลือกตั้ง</h3>
    <p>กราฟแท่งด้านล่างแสดงคะแนนของผู้สมัครแต่ละเขต 
    ทั้ง ${electionConfig.nConstituentSeat} เขต 
    โดยผู้สมัครที่ได้คะแนนสูงสุดเป็นผู้ได้รับเลือกตั้งในเขตนั้นไป</p>
  `;

  d3.select(selector).html(introText);
}

function addConstituentText(electionResult, electionConfig, selector) {
  const winningParties = _.uniq(electionResult.constituentSeatsNames);
  const winningPartiesCount = winningParties.map(
    party => electionResult.constituentSeatsNames.filter(n => n == party).length
  );
  const winners = _.zipObject(winningParties, winningPartiesCount);
  const keysSorted = Object.keys(winners).sort(function(a, b) {
    return winners[b] - winners[a];
  });

  let winnersText = ``;

  for (let party of keysSorted) {
    winnersText += `<li>พรรค ${party} ได้ส.ส.แบบแบ่งเขตเลือกตั้ง ${
      winners[party]
    } ที่นั่ง</li>`;
  }

  const constituentText = `
  <p>จากเขตเลือกตั้ง ${electionConfig.nConstituentSeat} เขต มีผู้ชนะดังนี้</p>
  <ul>${winnersText}</ul>
  <br />
  <h3>ผลคะแนนรวมทั่วประเทศ</h3>
  <p>ขั้นตอนต่อไปของการเลือกตั้งคือการจัดสรรจำนวนส.ส.แบบบัญชีรายชื่อให้ผู้สมัครแต่ละพรรค 
  โดยคิดคำนวณจากคะแนนรวมทั้งประเทศจากการเลือกตั้งแบบแบ่งเขตในขั้นตอนแรก</p>
  <p>จำนวนส.ส.ทั้งหมดที่แต่ละพรรคพึงมีได้นั้น มาจากจำนวนเสียงทั้งหมด 
  ${numberWithCommas(electionConfig.nVote)} เสียง 
  หารด้วยจำนวนส.ส.ทั้งหมด ${electionConfig.nTotalSeat} ที่นั่ง 
  ได้ผลลัพธ์ว่าต้องใช้ ${numberWithCommas(electionResult.nVotePerSeat)} เสียง 
  ต่อ 1 ที่นั่งในสภา</p>
  <p>จำนวนดังกล่าวแทนด้วยแต่ละบล็อกในกราฟแท่งด้านล่าง แต่ละพรรคจะได้รับจำนวนส.ส.พึงมี 
  ตามจำนวนเสียงที่ได้เต็มบล็อก จนครบกว่าจะครบทั้ง ${electionConfig.nTotalSeat}
  ที่นั่งในสภา เมื่อรวมทุกพรรคแล้ว</p>
  <p>หากยังไม่ครบ จะจัดที่นั่งที่เหลืออยู่ให้พรรคที่มีจำนวนเสียงเป็นเศษมากที่สุดก่อน 
  (บล็อกกว้างสุด แต่ยังไม่เต็มบล็อก) เรียงลำดับต่อไปจนกว่าจะครบ</p>
  <p>แต่ถ้าหากมีพรรคใดได้รับส.ส.แบบแบ่งเขตเลือกตั้งเป็นจำนวนเท่ากับหรือมากกว่าส.ส.พึงมี 
  ให้นำพรรคนั้นออกจากการคำนวณ และได้ส.ส.แบบแบ่งเขตเลือกตั้งตามที่ได้มา แต่ไม่ได้รับส.ส.แบบบัญชีรายชื่อเพิ่มเติม 
  ส่วนพรรคที่เหลือนำไปคำนวณส.ส.พึงมีใหม่อีกครั้งตามจำนวนส.ส.ที่เหลืออยู่</p>
  `;

  d3.select(selector).html(constituentText);
}

function addAllocatedText(electionResult, electionConfig, selector) {
  const parties = _.orderBy(
    electionResult.parties,
    ['nInitialAllocatedSeat', 'nTotalVote'],
    ['desc', 'desc']
  );

  let text = ``;

  for (let party of parties) {
    text += `<li>พรรค ${party.name} ได้ส.ส.พึงมีจำนวน ${
      party.nInitialAllocatedSeat
    } ที่นั่ง</li>`;
  }

  const AllocatedText = `
  <h4>จำนวนส.ส.พึงมี</h4>
  <p>จากกราฟข้างบน แบ่งจำนวนส.ส.พึงมีให้แต่ละพรรคดังต่อไปนี้</p>
  <ul>${text}</ul>
  <br />
  <p>เนื่องจากมี ${electionResult.nPartyWithoutPartyListNeeded} 
  พรรค ได้รับจำนวนส.ส.แบบเบ่งเขต ไปครบจำนวนส.ส.พึงมีแล้ว จึงกำหนดให้ 
  ${electionResult.nPartyWithoutPartyListNeeded} 
  พรรคนี้ได้รับส.ส.ตามที่ชนะมาจากแบบแบ่งเขตเลือกตั้ง แต่ไม่สามารถมีส.ส.แบบบัญชีรายชื่อได้อีก</p>
  <p>ดังนั้นการจัดสรรส.ส.พึงมีและส.ส.บัญชีรายชื่อจึงพิจารณาจาก ${electionConfig.nParty -
    electionResult.nPartyWithoutPartyListNeeded} พรรคที่เหลือเพียงเท่านั้น</p>
  <br />
  <h3>ผลการแบ่งส.ส.บัญชีรายชื่อ</h3>
  `;

  d3.select(selector).html(AllocatedText);
}

function addPartyListText(electionResult, electionConfig, selector) {
  const parties = _.orderBy(
    electionResult.parties,
    ['nAllocatedSeat', 'nTotalVote'],
    ['desc', 'desc']
  );

  let text = ``;

  for (let party of parties) {
    text += `<li>พรรค ${party.name} พึงมีส.ส.จำนวน ${party.nAllocatedSeat} 
    ที่นั่ง และได้ส.ส.บัญชีรายชื่อจำนวน ${party.nPartyListSeat} ที่นั่ง</li>`;
  }

  const parties2 = _.orderBy(
    electionResult.parties,
    ['nAllocatedSeat', 'nConstituentSeat', 'nPartyListSeat', 'nTotalVote'],
    ['desc', 'desc', 'desc', 'desc']
  );

  let text2 = ``;

  for (let party of parties2) {
    text2 += `<li>พรรค ${party.name} ได้ส.ส.รวม ${party.nConstituentSeat +
      party.nPartyListSeat} ที่นั่ง 
      แบ่งเป็น ส.ส.แบบแบ่งเขต ${party.nConstituentSeat} ที่นั่ง 
      และ ส.ส.แบบบัญชีรายชื่อ ${party.nPartyListSeat} ที่นั่ง</li>`;
  }

  const partyListText = `
  <h4>จำนวนส.ส.บัญชีรายชื่อ</h4>
  <p>จากกราฟข้างบน แบ่งจำนวนส.ส.พึงมี และ ส.ส.บัญชีรายชื่อ 
  (ส่วนต่างระหว่างจำนวนส.ส.พึงมี - จำนวนส.ส.แบ่งเขต) ให้แต่ละพรรคได้ดังต่อไปนี้</p>
  <ul>${text}</ul>
  <br />
  <h3>สรุปจำนวนส.ส.ทั้งหมด</h3>
  <ul>${text2}</ul>
  <br />
      `;
  d3.select(selector).html(partyListText);
}

export {
  runElection,
  ElectionConfig,
  drawResultConstituents,
  drawWaffle,
  drawInitialAllocation,
  drawFinalAllocation,
  addIntroText,
  addConstituentText,
  addAllocatedText,
  addPartyListText
};

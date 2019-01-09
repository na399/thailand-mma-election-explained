import * as d3 from 'd3';
import _ from 'lodash';
import seedrandom from 'seedrandom';

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
    nTotalPartyListSeat
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
  }
}

class Party {
  constructor({
    name = '',
    pParty = 0,
    nTotalVote = 0,
    nConstituentSeat = 0,
    nExpectedConstituentSeat = 0,
    nPartyListSeat = 0,
    nInitialAllocatedSeat = 0,
    nAllocatedSeat = 0,
    bPartyListNeeded = true,
    nRemainderVote = 0
  } = {}) {
    this.name = name;
    this.pParty = pParty;
    this.nTotalVote = nTotalVote;
    this.nConstituentSeat = nConstituentSeat;
    this.nPartyListSeat = nPartyListSeat;
    this.nInitialAllocatedSeat = nInitialAllocatedSeat;
    this.nAllocatedSeat = nAllocatedSeat;
    this.bPartyListNeeded = bPartyListNeeded;
    this.nRemainderVote = nRemainderVote;
    this.nExpectedConstituentSeat = nExpectedConstituentSeat;
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
    'Red',
    'Blue',
    'Green',
    'Orange',
    'Pink',
    'Yellow',
    'Lime'
  ]; // must be unique

  // assign winning propabilities and party names, i.e., colours
  let parties = pParties.map((p, i) => {
    let party = new Party({
      name: partyNames[i],
      pParty: p,
      nExpectedConstituentSeat: _.round(p * electionConfig.nConstituentSeat)
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
    party.nInitialAllocatedSeat = Math.round(party.nTotalVote / nVotePerSeat);
    return party;
  });

  // check whether nConstituentSeat exceeds nInitialAllocatedSeats
  for (let party of parties) {
    if (party.nConstituentSeat >= party.nInitialAllocatedSeat) {
      party.bPartyListNeeded = false;
    }
  }

  // recalculate votes per remaining seat if there is at least one party with nConstituentSeat exceeds nInitialAllocatedSeats
  const nPartyWithoutPartyListNeeded = _.filter(parties, [
    'bPartyListNeeded',
    false
  ]).length;

  if (_.filter(parties, ['bPartyListNeeded', false]).length > 0) {
    let nTotalRemainingVote = parties.reduce((nTotalRemainingVote, party) => {
      if (party.bPartyListNeeded) {
        nTotalRemainingVote += party.nTotalVote;
      }
      return nTotalRemainingVote;
    }, 0);

    var nVotePerRemainingSeat = Math.floor(
      nTotalRemainingVote / electionConfig.nPartyListSeat
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
    nTotalPartyListSeat
  );

  return electionResult;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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
    .padding(0.2);

  return { xScale, yScale };
}

function drawResultConstituent(resultConstituent, idSvg, config, scales) {
  const { width, height, margin } = config;
  const { xScale, yScale } = scales;

  const svg = d3
    .select(`#${idSvg}`)
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
    .attr('fill', d => d.name);

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

function drawResultConstituents(electionResult, electionConfig) {
  const config = getResultConstituentConfig();
  const scales = getResultConstituentScales(electionResult, config);
  for (let i = 0; i < electionConfig.nConstituentSeat; i++) {
    d3.select('#constituents')
      .append('svg')
      .attr('id', `constituent${i}`);

    drawResultConstituent(
      electionResult.resultConstituents[i],
      `constituent${i}`,
      config,
      scales
    );
  }
}

function getAllocationConfig(electionResult, electionConfig, stage) {
  const width = 800;
  const height =
    stage == 'initial'
      ? electionConfig.nParty * 100
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
    .domain([0, xMax * 1.1])
    .range([margin.left, width - margin.right])
    .nice();

  const yScale = d3
    .scaleBand()
    .domain(partyNames)
    .range([height - margin.bottom, margin.top])
    .padding(0.2);

  return { xScale, yScale, xMax };
}

function drawAllocationChart(electionResult, idSvg, config, scales, stage) {
  const { width, height, margin } = config;
  const { xScale, yScale, xMax } = scales;

  const svg = d3
    .select(`#${idSvg}`)
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
    .attr('x', d => margin.left)
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d.nTotalVote))
    .attr('fill', d => d.name);

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

  // nVotePerSeat
  let i = 1;
  if (stage == 'initial') {
    while (electionResult.nVotePerSeat * i < xMax) {
      svg
        .append('line')
        .attr('x1', xScale(electionResult.nVotePerSeat * i))
        .attr('x2', xScale(electionResult.nVotePerSeat * i))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');
      i++;
    }
  } else {
    while (electionResult.nVotePerRemainingSeat * i < xMax) {
      svg
        .append('line')
        .attr('x1', xScale(electionResult.nVotePerRemainingSeat * i))
        .attr('x2', xScale(electionResult.nVotePerRemainingSeat * i))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');
      i++;
    }
  }
}

function drawInitialAllocation(electionResult, electionConfig) {
  const config = getAllocationConfig(electionResult, electionConfig, 'initial');
  const scales = getAllocationScales(electionResult, config, 'initial');
  drawAllocationChart(
    electionResult,
    'initial-allocation',
    config,
    scales,
    'initial'
  );
}

function drawFinalAllocation(electionResult, electionConfig) {
  const config = getAllocationConfig(electionResult, electionConfig, 'final');
  const scales = getAllocationScales(electionResult, config, 'final');
  drawAllocationChart(
    electionResult,
    'final-allocation',
    config,
    scales,
    'final'
  );
}

export {
  runElection,
  ElectionConfig,
  drawResultConstituents,
  drawInitialAllocation,
  drawFinalAllocation
};

import * as d3 from 'd3';
import _ from 'lodash';
import seedrandom from 'seedrandom';

class Election {
  constructor({
    nTotalSeat = 500,
    nConstituentSeat = 350,
    nPartyListSeat = nTotalSeat - nConstituentSeat,
    nVoter = 50000000,
    pVoterTurnout = 0.7,
    nVote = nVoter * pVoterTurnout,
    nParty = 20
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

class Party {
  constructor({
    name = '',
    pParty = 0,
    nTotalVote = 0,
    nConstituentSeat = 0,
    nExpectedConstituentSeat = 0,
    nPartyListSeat = 0,
    nPreAllocatedSeat = 0,
    nAllocatedSeat = 0,
    bPartyListNeeded = true,
    nRemainderVote = 0
  } = {}) {
    this.name = name;
    this.pParty = pParty;
    this.nTotalVote = nTotalVote;
    this.nConstituentSeat = nConstituentSeat;
    this.nPartyListSeat = nPartyListSeat;
    this.nPreAllocatedSeat = nPreAllocatedSeat;
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
  let winningParty = expectedConstituentSeats[Math.floor(Math.random() * expectedConstituentSeats.length)];

  let partyNames = parties.map(party => party.name)

  // simulate ranking for the constituent
  rankings.push(winningParty);
  rankings = rankings.concat(shuffle(partyNames.filter(name => name != winningParty)))

  // simulate vote for each pary
  let votes = Array.from({ length: parties.length }, () => Math.random());
  votes = votes.map(vote => _.round((vote / _.sum(votes)) * nVote));
  votes = _.reverse(_.sortBy(votes));

  let resultConstituent = rankings.map((name, i) => {
    return {
      name: name,
      nVote: votes[i]
    }
  });

  return resultConstituent;
}

function sum(arr) {
  return arr.reduce((a, b) => {
    return a + b;
  }, 0);
}

const partyNames = ['red', 'blue', 'green', 'orange', 'pink', 'yellow', 'lime']; // must be unique

function starter() {
  let election = new Election({
    // nTotalSeat: 5,
    // nConstituentSeat: 3,
    // nVoter: 500000,
    // pVoterTurnout: 0.7,
    nParty: 4
  });

  // get party vote/win propablities
  let pParties = Array.from({ length: election.nParty }, () => Math.random());

  pParties = pParties.map(p => p / _.sum(pParties));

  console.log('pParties :', pParties);

  // assign vote propabilities and party names, i.e., colours
  let parties = pParties.map((p, i) => {
    let party = new Party({
      name: partyNames[i],
      pParty: p,
      nExpectedConstituentSeat: _.round(p * election.nConstituentSeat)
    });
    return party;
  });

  /* USE PROBABILITIES FOR WINNING CONSTITUENT SEATS */
  let expectedConstituentSeats = parties.map(party => {
    return Array.from(
      { length: party.nExpectedConstituentSeat },
      () => party.name
    );
  });

  expectedConstituentSeats = _.flatten(expectedConstituentSeats);

  console.log('expectedConstituentSeats :', expectedConstituentSeats);

  // calculate number of votes per each constituent
  let nVotePerConstituent = Math.floor(
    election.nVote / election.nConstituentSeat
  );

  // generate result for all constituents
  let resultConstituents = Array.from(
    { length: election.nConstituentSeat },
    () => simulateResultConstituent(parties, nVotePerConstituent, expectedConstituentSeats)
  );
  console.log('resultConstituents :', resultConstituents);

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

  let constituentSeatsNames = constituentSeats.map(party => party.name);

  console.log('constituentSeats :', constituentSeats);
  console.log('constituentSeatsNames :', constituentSeatsNames);

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
  let nTotalVote = parties.reduce((nTotalVote, party) => {
    nTotalVote += party.nTotalVote;
    return nTotalVote;
  }, 0);

  console.log('nTotalVote :', nTotalVote);

  // calculate allocated seats
  let nVotePerSeat = Math.floor(nTotalVote / election.nTotalSeat);

  console.log('nVotePerSeat :', nVotePerSeat);

  parties = parties.map(party => {
    party.nPreAllocatedSeat = Math.round(party.nTotalVote / nVotePerSeat);
    return party;
  });

  // check whether nConstituentSeat exceeds nPreAllocatedSeats
  for (let party of parties) {
    if (party.nConstituentSeat >= party.nPreAllocatedSeat) {
      party.bPartyListNeeded = false;
    }
  }

  // recalculate votes per remaining seat if there is at least one party with nConstituentSeat exceeds nPreAllocatedSeats
  console.log('nParty without PartyListNeeded :', _.filter(parties, ['bPartyListNeeded', false]).length);

  if (_.filter(parties, ['bPartyListNeeded', false]).length > 0) {
    let nTotalRemainingVote = parties.reduce((nTotalRemainingVote, party) => {
      if (party.bPartyListNeeded) {
        nTotalRemainingVote += party.nTotalVote;
      }
      return nTotalRemainingVote;
    }, 0);

    var nVotePerRemainingSeat = Math.floor(
      nTotalRemainingVote / election.nPartyListSeat
    );
  } else {
    var nVotePerRemainingSeat = nVotePerSeat;
  }

  console.log('nVotePerRemainingSeat :', nVotePerRemainingSeat);

  parties = parties.map(party => {
    if (party.bPartyListNeeded) {
      party.nAllocatedSeat = Math.floor(
        party.nTotalVote / nVotePerRemainingSeat
      );
      party.nRemainderVote =
        party.nTotalVote % (party.nAllocatedSeat * nVotePerRemainingSeat) || party.nTotalVote; // in case of party.nAllocatedSeat == 0
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
  let nUnallocatedSeat = parties.reduce(
    (nUnallocatedSeat, party) =>
      nUnallocatedSeat - (party.nConstituentSeat + party.nPartyListSeat),
    election.nTotalSeat
  );

  console.log('nUnallocatedSeat :', nUnallocatedSeat);

  parties = _.orderBy(parties, 'nRemainderVote', 'desc');
  let nPartiesGettingPartyList = _.filter(parties, 'bPartyListNeeded').length;

  for (let i = 0; i < nUnallocatedSeat; i++) {
    parties[i % nPartiesGettingPartyList].nAllocatedSeat += 1;
    parties[i % nPartiesGettingPartyList].nPartyListSeat += 1;
  }

  console.log(parties);

  console.log(
    'nTotalPreAllocatedSeat',
    parties.reduce((n, party) => n + party.nPreAllocatedSeat, 0)
  );
  console.log(
    'nTotalAllocatedSeat',
    parties.reduce((n, party) => n + party.nAllocatedSeat, 0)
  );
  console.log(
    'nTotalConstituentSeat',
    parties.reduce((n, party) => n + party.nConstituentSeat, 0)
  );
  console.log(
    'nTotalPartyListSeat',
    parties.reduce((n, party) => n + party.nPartyListSeat, 0)
  );
}

seedrandom('starter', { global: true });
starter();

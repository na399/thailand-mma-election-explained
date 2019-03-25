import * as d3 from 'd3';
import _ from 'lodash';

function series(s, n) {
  let r = 0;
  for (let i = 0; i <= n; i++) {
    r += s(i);
  }
  return r;
}

function drawParliament(electionResult, selector) {
  /* 
  Modified from d3-parliament by Geoffrey Brossard (me@geoffreybrossard.fr)
  under MIT License
  */

  let parliamentData = electionResult.parties;

  // keep only parties with seats
  parliamentData = _.filter(parliamentData, 'nTotalSeat');

  // order by numbers of seat
  parliamentData = _.orderBy(parliamentData, 'nTotalSeat', 'desc');

  // reverse the order of the opposition side and place on another end
  parliamentData = _.filter(parliamentData, ['side', 'ฝ่ายรัฐบาล']).concat(
    _.filter(parliamentData, ['side', 'ฝ่ายค้าน']).reverse()
  );

  const width = 500;
  const height = width / 2;

  const innerRadiusCoef = 0.4;

  const outerParliamentRadius = Math.min(width / 2, height);
  const innerParliementRadius = outerParliamentRadius * innerRadiusCoef;

  /* init the svg */
  d3.select(selector)
    .selectAll('*')
    .remove();

  const svg = d3
    .select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

  /***
   * compute number of seats and rows of the parliament */
  let nSeats = 0;
  parliamentData.forEach(function(p) {
    nSeats += p.nTotalSeat;
  });

  let nRows = 0;
  let maxSeatNumber = 0;
  let b = 0.4
  
  if (nSeats <= 5) {
    b = 1;
  } 

  (function() {
    let a = innerRadiusCoef / (1 - innerRadiusCoef);
    while (maxSeatNumber < nSeats) {
      nRows++;
      b += a;
      /* NOTE: the number of seats available in each row depends on the total number
      of rows and floor() is needed because a row can only contain entire seats. So,
      it is not possible to increment the total number of seats adding a row. */
      maxSeatNumber = series(function(i) {
        return Math.floor(Math.PI * (b + i));
      }, nRows - 1);
    }
  })();

  /***
   * create the seats list */
  /* compute the cartesian and polar coordinates for each seat */
  let rowWidth = (outerParliamentRadius - innerParliementRadius) / nRows;

  let seats = [];
  (function() {
    let seatsToRemove = maxSeatNumber - nSeats;
    for (let i = 0; i < nRows; i++) {
      let rowRadius = innerParliementRadius + rowWidth * (i + 0.5);
      let rowSeats =
        Math.floor(Math.PI * (b + i)) -
        Math.floor(seatsToRemove / nRows) -
        (seatsToRemove % nRows > i ? 1 : 0);
      let anglePerSeat = Math.PI / rowSeats;
      for (let j = 0; j < rowSeats; j++) {
        let s = {};
        s.polar = {
          r: rowRadius,
          theta: -Math.PI + anglePerSeat * (j + 0.5)
        };
        s.cartesian = {
          x: s.polar.r * Math.cos(s.polar.theta) + width / 2,
          y: s.polar.r * Math.sin(s.polar.theta) + outerParliamentRadius
        };
        seats.push(s);
      }
    }
  })();

  /* sort the seats by angle */
  seats.sort(function(a, b) {
    return a.polar.theta - b.polar.theta || b.polar.r - a.polar.r;
  });

  /* fill the seat objects with data of its party and of itself if existing */
  (function() {
    let partyIndex = 0;
    let seatIndex = 0;
    seats.forEach(function(s) {
      /* get current party and go to the next one if it has all its seats filled */
      let party = parliamentData[partyIndex];
      let nSeatsInParty = party.nTotalSeat;
      if (seatIndex >= nSeatsInParty) {
        partyIndex++;
        seatIndex = 0;
        party = parliamentData[partyIndex];
      }

      /* set party data */
      s.data = party;
      s.seatIndex = seatIndex;

      /* set seat type */
      if (seatIndex < party.nConstituentSeat) {
        s.seatType = 'constituent';
      } else {
        s.seatType = 'partyList';
      }

      seatIndex++;
    });
  })();

  /***
   * helpers to get value from seat data */
  const seatClasses = function(d) {
    let c = 'seat ';
    c += d.data.name.replace(/ /g, '') || '';
    return c;
  };
  const seatX = function(d) {
    return d.cartesian.x;
  };
  const seatY = function(d) {
    return d.cartesian.y;
  };
  const seatColor = function(d) {
    return d.data.color;
  };
  const seatRadius = function(d) {
    let r = 0.4 * rowWidth;
    // limit radius to 40
    r = r > 40 ? 40 : r;
    if (d.data && typeof d.data.size === 'number') {
      r *= d.data.size;
    }
    return r;
  };
  const seatWidth = function(d) {
    return 2 * seatRadius(d);
  };
  const seatTransform = function(d) {
    return `translate(${seatX(d) - seatRadius(d)}, ${seatY(d) -
      seatRadius(d) / 2})
    rotate(45 ${seatRadius(d)} ${seatRadius(d)})
    scale(0.7)`;
  };

  /***
   * fill svg with seats as circles */
  /* container of the parliament */
  let container = svg;
  // if (container.empty()) {
  //   container = svg.append('g');
  //   container.classed('parliament', true);
  // }
  // container.attr(
  //   'transform',
  //   'translate(' + width / 2 + ',' + outerParliamentRadius + ')'
  // );

  /* constituent seats as circles */
  let circles = container.append('g').selectAll('.seat');
  let circlesEnter = circles
    .data(seats.filter(d => d.seatType === 'constituent'))
    .enter()
    .append('circle');
  circlesEnter.attr('class', seatClasses);
  circlesEnter.attr('cx', seatX);
  circlesEnter.attr('cy', seatY);
  circlesEnter.attr('r', seatRadius);
  circlesEnter.attr('fill', seatColor);

  /* party list seats as diamonds */
  let diamonds = container.append('g').selectAll('.seat');
  let diamondsEnter = diamonds
    .data(seats.filter(d => d.seatType === 'partyList'))
    .enter()
    .append('rect');
  diamondsEnter.attr('class', seatClasses);
  diamondsEnter.attr('width', seatWidth);
  diamondsEnter.attr('height', seatWidth);
  diamondsEnter.attr('fill', seatColor);
  diamondsEnter.attr('transform', seatTransform);

  const svgLegend = d3
    .select(selector)
    .append('svg')
    .attr('width', 200)
    .attr('height', height)
    .style('overflow', 'visible');

  svgLegend
    .append('g')
    .selectAll('text')
    .data(parliamentData)
    .enter()
    .append('text')
    .attr('font-size', 16)
    .attr('y', (_d, i) => ((i % 13) + 1) * 20)
    .attr('x', (_d, i) => i < 13 ? 100 : 400)
    .text(d => `พรรค${d.name}`);

  svgLegend
    .append('g')
    .selectAll('text')
    .data(parliamentData)
    .enter()
    .append('text')
    .attr('font-size', 16)
    .attr('y', (_d, i) => ((i % 13) + 1) * 20)
    .attr('x', (_d, i) => i < 13 ? 40 : 340)
    .attr('fill', d => d.color)
    .attr('text-anchor', 'end')
    .text(d => `${d.nConstituentSeat} ●`);

  svgLegend
    .append('g')
    .selectAll('text')
    .data(parliamentData)
    .enter()
    .append('text')
    .attr('font-size', 16)
    .attr('y', (_d, i) => ((i % 13) + 1) * 20)
    .attr('x', (_d, i) => i < 13 ? 90 : 390)
    .attr('fill', d => d.color)
    .attr('text-anchor', 'end')
    .text(d => `${d.nPartyListSeat} ◆`);
}

export { drawParliament };

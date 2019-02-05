<template>
  <div id="app">
    <div>
      <div>
        <p>จำนวนพรรค</p>
        <el-input-number v-model="nParty" :min="2" :max="30" @change="updateNParty"></el-input-number>
      </div>
      <div>
        <p>จำนวนเสียงรวม</p>
        <p>{{ nVote }}</p>
      </div>

      <party-params
        v-for="n in nParty"
        :key="n-1"
        :ref="`party${n-1}`"
        :name-initial="partyName[n-1]"
        :color-initial="partyColor[n-1]"
        :side-initial="partySide[n-1]"
        :n-constituent-seat-initial="partyNConstituentSeat[n-1]"
        :n-total-vote-initial="partyNTotalVote[n-1]"
      ></party-params>
      <el-button @click="clickStart">ส่งผลการนับคะแนนใหม่</el-button>
    </div>
  </div>
</template>

<script>
import { EventBus } from "./event-bus.js";
import _ from "lodash";
import * as app from "./app.js";

export default {
  name: "UserDefinedParams",
  data() {
    return {
      nParty: 2,
      nConstituentSeat: 350,
      nVote: 35000000,
      partyName: ["พรรคที่ 1", "อื่นๆ"],
      partyColor: ["hsl(0, 90%, 60%)", "hsl(0, 0%, 60%)"],
      partySide: ["ฝ่ายรัฐบาล", "ฝ่ายค้าน"],
      partyNConstituentSeat: [175, 175],
      partyNTotalVote: [17500000, 17500000]
    };
  },
  created() {
    EventBus.$on("params-changed", (data, key) => {
      // Update the parent data
      const toUpdate = {
        partyName: "name",
        partyColor: "color",
        partySide: "side",
        partyNConstituentSeat: "nConstituentSeat",
        partyNTotalVote: "nTotalVote"
      };

      for (const [param, value] of Object.entries(toUpdate)) {
        this[param][key] = data[value];
      }

      // adjust the nTotalVote of the parent data
      this.nVote = _.sum(this.partyNTotalVote);

      // Given a fixed nConstituentSeat, adjust the nConstituentSeat of the last party and, if needed, other parties
      let nSeatDiff = this.nConstituentSeat - _.sum(this.partyNConstituentSeat);

      let partyNConstituentSeatFiltered = {};

      for (const n in _.range(this.nParty)) {
        partyNConstituentSeatFiltered[n] = this.partyNConstituentSeat[n];
      }

      // ignore the current slider being dragged
      delete partyNConstituentSeatFiltered[key];

      _.keys(partyNConstituentSeatFiltered)
        .reverse()
        .forEach(n => {
          if (nSeatDiff + partyNConstituentSeatFiltered[n] >= 0) {
            partyNConstituentSeatFiltered[n] =
              nSeatDiff + partyNConstituentSeatFiltered[n];
            nSeatDiff = 0;
          } else if (nSeatDiff + partyNConstituentSeatFiltered[n] < 0) {
            nSeatDiff = nSeatDiff + partyNConstituentSeatFiltered[n];
            partyNConstituentSeatFiltered[n] = 0;
          }
        });

      for (const [n, value] of Object.entries(partyNConstituentSeatFiltered)) {
        this.partyNConstituentSeat.splice(n, 1, value);
        this.$set(this.$refs[`party${n}`][0], "nConstituentSeat", value);
      }
    });
  },
  methods: {
    updateNParty() {
      if (this.nParty > this.partyName.length) {
        // When nParty increases, add a new party before 'Other' party;
        this.partyName.splice(this.nParty - 2, 0, `พรรคที่ ${this.nParty - 1}`);

        this.partyColor.splice(
          this.nParty - 2,
          0,
          `hsl(${(95 * (this.nParty - 2)) % 360}, 90%, 60%)`
        );

        this.partySide.splice(this.nParty - 2, 0, "ฝ่ายค้าน");

        this.partyNConstituentSeat.push(
          Math.ceil(this.partyNConstituentSeat.pop() / 2)
        );
        this.partyNConstituentSeat.push(
          this.nConstituentSeat - _.sum(this.partyNConstituentSeat)
        );

        this.partyNTotalVote.push(Math.ceil(this.partyNTotalVote.pop() / 2));
        this.partyNTotalVote.push(this.nVote - _.sum(this.partyNTotalVote));

        // the last party is to be created by v-for
        const toUpdate = {
          name: this.partyName[this.nParty - 2],
          color: this.partyColor[this.nParty - 2],
          side: this.partySide[this.nParty - 2],
          nConstituentSeat: this.partyNConstituentSeat[this.nParty - 2],
          nTotalVote: this.partyNTotalVote[this.nParty - 2]
        };

        for (const [key, value] of Object.entries(toUpdate)) {
          this.$set(this.$refs[`party${this.nParty - 2}`][0], key, value);
        }
      } else if (this.nParty < this.partyName.length) {
        // when nParty decreases, delete a party before 'Other' party.
        this.partyName.splice(this.nParty - 1, 1);
        this.partyColor.splice(this.nParty - 1, 1);
        this.partySide.splice(this.nParty - 1, 1);

        // delete the last two parties, find sum of them, and put the sum back
        this.partyNConstituentSeat.push(
          _.sum(this.partyNConstituentSeat.splice(this.nParty - 1, 2))
        );
        this.partyNTotalVote.push(
          _.sum(this.partyNTotalVote.splice(this.nParty - 1, 2))
        );

        const toUpdate = {
          name: this.partyName[this.nParty - 1],
          color: this.partyColor[this.nParty - 1],
          side: this.partySide[this.nParty - 1],
          nConstituentSeat: this.partyNConstituentSeat[this.nParty - 1],
          nTotalVote: this.partyNTotalVote[this.nParty - 1]
        };

        for (const property in toUpdate) {
          this.$set(
            this.$refs[`party${this.nParty - 1}`][0],
            property,
            toUpdate[property]
          );
        }
      }
    },
    clickStart() {
      let parties = [];

      for (const n in _.range(this.nParty)) {
        parties.push(
          new app.Party({
            name: this.partyName[n],
            color: this.partyColor[n],
            side: this.partySide[n],
            nConstituentSeat: this.partyNConstituentSeat[n],
            nTotalVote: this.partyNTotalVote[n]
          })
        );
      }

      const config = new app.ElectionConfig({
        nConstituentSeat: this.nConstituentSeat,
        nParty: this.nParty
      });

      app.runApp(config, { onlyAllocation: true, side: true }, parties);

      this.$notify({
        title: "การเลือกตั้งสำเร็จ!",
        type: "success",
        message: "เลื่อนลงเพื่อดูผลการเลือกตั้ง",
        duration: 2000
      });
    }
  }
};
</script>

<style>
#app {
  text-align: center;
}
</style>
<template>
  <div id="app">
    <div>
      <div>
        <p>จำนวนพรรค</p>
        <el-input-number v-model="nParty" :min="2" :max="30" @change="updateNParty"></el-input-number>
      </div>
      <div>
        <p>จำนวนเสียง</p>
        <el-input-number v-model="nVote" :min="1" :max="60000000" @change="updateNVote"></el-input-number>
      </div>

      <party-params
        v-for="n in nParty"
        :key="n"
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
    EventBus.$on("update-params", () => {
      // TODO: Update the parent data
      // TODO: Given a fixed nConstituentSeat, adjust the nConstituentSeat of the last party and, if needed, other parties
      // TODO: Given variable nTotalVote, adjust the nTotalVote of the parent data
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

        for (let property in toUpdate) {
          this.$set(
            this.$refs[`party${this.nParty - 2}`][0],
            property,
            toUpdate[property]
          );
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

        for (let property in toUpdate) {
          this.$set(
            this.$refs[`party${this.nParty - 1}`][0],
            property,
            toUpdate[property]
          );
        }
      }
    },
    updateNVote() {
      // TODO: Adjust nTotalVote of the last party
    },
    clickStart() {
      let parties = [];

      for (let n in _.range(this.nParty)) {
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
<template>
  <div id="app">
    <el-tabs type="border-card">
      <el-tab-pane label="1 แบบจำลอง (ย่อ)">
        <el-button type="primary" @click="runStarter">จำลองผลการเลือกตั้ง แบบย่อ</el-button>
        <p v-if="nSimulationRun > 0">
          <small>กดปุ่มซำ้ เพื่อสุ่มผลใหม่</small>
        </p>
      </el-tab-pane>
      <el-tab-pane label="2 แบบจำลอง (เต็ม)">
        <el-button type="primary" @click="runFull">จำลองผลการเลือกตั้ง แบบเต็ม</el-button>
        <p v-if="nSimulationRun > 0">
          <small>กดปุ่มซำ้ เพื่อสุ่มผลใหม่</small>
        </p>
      </el-tab-pane>
      <el-tab-pane label="3 กำหนดเอง">
        <div>
          <p>ค่าเริ่มต้น</p>
          <el-radio-group v-model="template" @change="reset(template)">
            <el-radio-button label="เริ่มต้น"></el-radio-button>
            <el-radio-button label="ผลการเลือกตั้งพ.ศ. 2554"></el-radio-button>
            <el-radio-button label="พรรคเด่น พ.ศ. 2562"></el-radio-button>
          </el-radio-group>
        </div>
        <br>
        <hr>
        <div>
          <div>
            <p>จำนวนพรรค</p>
            <el-input-number v-model="nParty" :min="2" :max="30" @change="updateNParty"></el-input-number>
          </div>
          <div>
            <p>จำนวนเสียงรวม</p>
            <p>{{ numberWithCommas(nVote) }}</p>
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
          <el-button type="primary" @click="runUserDefined">ส่งผลการนับคะแนน</el-button>
          <el-button @click="reset(template)">เริ่มใหม่</el-button>
        </div>
        <br>
        <el-alert
          v-if="paramChanged"
          title="กรุณากดปุ่ม ส่งผลการนับคะแนน เพื่อดูผลใหม่"
          type="warning"
          center
          show-icon
        ></el-alert>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { EventBus } from "./event-bus.js";
import _ from "lodash";
import * as app from "./app.js";

function notify(t) {
  t.$notify({
    title: "การเลือกตั้งสำเร็จ!",
    type: "success",
    message: "เลื่อนลงเพื่อดูผลการเลือกตั้ง",
    duration: 2000
  });
  t.paramChanged = false;
}

function updateParams(t) {
  t.paramChanged = true;
  const toUpdate = {
    name: t.partyName,
    color: t.partyColor,
    side: t.partySide,
    nConstituentSeat: t.partyNConstituentSeat,
    nTotalVote: t.partyNTotalVote
  };
  for (const n in _.range(t.nParty)) {
    for (const [key, value] of Object.entries(toUpdate)) {
      t.$set(t.$refs[`party${n}`][0], key, value[n]);
    }
  }
}

export default {
  name: "UserDefinedParams",
  data() {
    return {
      nSimulationRun: 0,
      template: "เริ่มต้น",
      nParty: 2,
      nConstituentSeat: 350,
      nVote: 35000000,
      partyName: ["พรรคที่ 1", "อื่นๆ"],
      partyColor: ["hsl(30, 90%, 60%)", "hsl(0, 0%, 60%)"],
      partySide: ["ฝ่ายรัฐบาล", "ฝ่ายค้าน"],
      partyNConstituentSeat: [175, 175],
      partyNTotalVote: [17500000, 17500000],
      paramChanged: false
    };
  },
  created() {
    EventBus.$on("params-changed", (data, key) => {
      this.paramChanged = true;
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
          `hsl(${(95 * (this.nParty - 2)) % 360}, 90%, 50%)`
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
    runUserDefined() {
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

      notify(this);
    },
    runStarter() {
      const config = new app.ElectionConfig({
        nTotalSeat: 5,
        nConstituentSeat: 3,
        nVoter: 500000,
        pVoterTurnout: 0.7,
        nParty: 4
      });

      app.runApp(config, {
        randomSeed: (this.nSimulationRun += 1),
        starter: true
      });

      notify(this);
    },
    runFull() {
      const config = new app.ElectionConfig({
        nParty: 6
      });

      app.runApp(config, {
        randomSeed: (this.nSimulationRun += 1),
        side: true
      });

      notify(this);
    },
    reset(template) {
      switch (template) {
        case "เริ่มต้น":
          this.nParty = 2;
          this.nConstituentSeat = 350;
          this.nVote = 35000000;
          this.partyName = ["พรรคที่ 1", "อื่นๆ"];
          this.partyColor = ["hsl(0, 90%, 50%)", "hsl(0, 0%, 60%)"];
          this.partySide = ["ฝ่ายรัฐบาล", "ฝ่ายค้าน"];
          this.partyNConstituentSeat = [175, 175];
          this.partyNTotalVote = [17500000, 17500000];
          break;
        case "ผลการเลือกตั้งพ.ศ. 2554":
          this.nParty = 17;
          this.nConstituentSeat = 375;
          this.nVote = 31760760;
          this.partyName = [
            "เพื่อไทย",
            "ประชาธิปัตย์",
            "ภูมิใจไทย",
            "ชาติไทยพัฒนา",
            "ชาติพัฒนาเพื่อแผ่นดิน",
            "มาตุภูมิ",
            "พลังชล",
            "รักษ์สันติ",
            "กิจสังคม",
            "ความหวังใหม่",
            "ประชาธรรม",
            "เครือข่ายชาวนาแห่งประเทศไทย",
            "ประชาสันติ",
            "เพื่อฟ้าดิน",
            "เพื่อเกษตรกรไทย",
            "พลังคนกีฬา",
            "อื่นๆ"
          ];
          this.partyColor = [
            "hsl(0, 90%, 50%)",
            "hsl(200, 90%, 50%)",
            "hsl(220, 90%, 50%)",
            "hsl(20, 90%, 50%)",
            "hsl(330, 90%, 50%)",
            "hsl(180, 90%, 50%)",
            "hsl(240, 90%, 50%)",
            "hsl(70, 90%, 50%)",
            "hsl(0, 100%, 80%)",
            "hsl(200, 100%, 80%)",
            "hsl(220, 100%, 80%)",
            "hsl(20, 100%, 80%)",
            "hsl(330, 100%, 80%)",
            "hsl(180, 100%, 80%)",
            "hsl(240, 100%, 80%)",
            "hsl(70, 100%, 80%)",
            "hsl(0, 0%, 60%)"
          ];
          this.partySide = [
            "ฝ่ายรัฐบาล",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายค้าน",
            "ฝ่ายรัฐบาล",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน",
            "ฝ่ายค้าน"
          ];
          this.partyNConstituentSeat = [
            204,
            115,
            29,
            15,
            5,
            1,
            6,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ];
          this.partyNTotalVote = [
            14272771,
            10138045,
            3523331,
            1534027,
            1258464,
            369526,
            246879,
            138758,
            114978,
            31246,
            26229,
            20133,
            20084,
            13674,
            13580,
            13148,
            25887
          ];
          break;
        case "พรรคเด่น พ.ศ. 2562":
          this.nParty = 11;
          this.nConstituentSeat = 350;
          this.nVote = 35000000;
          this.partyName = [
            "เพื่อไทย",
            "อนาคตใหม่",
            "ประชาธิปัตย์",
            "พลังประชารัฐ",
            "เสรีรวมไทย",
            "ประชาชาติ",
            "ภูมิใจไทย",
            "รวมพลังประชาชาติไทย",
            "ชาติไทยพัฒนา",
            "ชาติพัฒนา",
            "อื่นๆ"
          ];
          this.partyColor = [
            "hsl(0, 90%, 50%)",
            "hsl(30, 90%, 60%)",
            "hsl(200, 90%, 50%)",
            "hsl(240, 90%, 50%)",
            "hsl(55, 90%, 50%)",
            "hsl(70, 90%, 50%)",
            "hsl(260, 100%, 50%)",
            "hsl(220, 90%, 50%)",
            "hsl(320, 90%, 50%)",
            "hsl(25, 90%, 50%)",
            "hsl(0, 0%, 60%)"
          ];
          this.partySide = [
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายรัฐบาล",
            "ฝ่ายค้าน"
          ];
          this.partyNConstituentSeat = [
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            50
          ];
          this.partyNTotalVote = [
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            3000000,
            5000000
          ];
          break;
      }

      updateParams(this);
    },
    numberWithCommas(x) {
      return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    }
  }
};
</script>

<style>
#app {
  text-align: center;
}

@media only screen and (min-width: 768px) {
  #app {
    max-width: 90%;
  }
}
</style>
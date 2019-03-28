<template>
  <div id="app">
    <el-tabs type="border-card">
      <el-tab-pane label="กำหนดเอง">
        <div>
          <p>ค่าเริ่มต้น</p>
          <el-radio-group v-model="template" @change="reset(template)">
            <el-radio-button label="เริ่มต้น"></el-radio-button>
            <el-radio-button label="ผลคะแนนเมื่อ 25 มี.ค. 13:06"></el-radio-button>
            <el-radio-button label="ผลคะแนนเมื่อ 28 มี.ค. 17:00"></el-radio-button>
          </el-radio-group>
        </div>
        <br>
        <hr>
        <div>
          <div>
            <p>จำนวนพรรค</p>
            <el-input-number v-model="nParty" :min="2" :max="100" @change="updateNParty"></el-input-number>
          </div>
          <div>
            <p>จำนวนเสียงรวม</p>
            <p>{{ numberWithCommas(nVote) }}</p>
          </div>
          <el-container
            style="height: 600px; border: 2px solid #eee; background-color: #F6FAFF; margin: 0px 0px 20px"
          >
            <el-main>
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
            </el-main>
          </el-container>
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
      <el-tab-pane label="แบบจำลอง (ย่อ)">
        <el-button type="primary" @click="runStarter">จำลองผลการเลือกตั้ง แบบย่อ</el-button>
        <p v-if="nSimulationRun > 0">
          <small>กดปุ่มซำ้ เพื่อสุ่มผลใหม่</small>
        </p>
      </el-tab-pane>
      <el-tab-pane label="แบบจำลอง (เต็ม)">
        <el-button type="primary" @click="runFull">จำลองผลการเลือกตั้ง แบบเต็ม</el-button>
        <p v-if="nSimulationRun > 0">
          <small>กดปุ่มซำ้ เพื่อสุ่มผลใหม่</small>
        </p>
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
      template: "ผลคะแนนเมื่อ 28 มี.ค. 17:00",
      nParty: 81,
      nConstituentSeat: 350,
      nVote: 35532647,
      partyName: [
        "เพื่อไทย",
        "พลังประชารัฐ",
        "อนาคตใหม่",
        "ประชาธิปัตย์",
        "ภูมิใจไทย",
        "เสรีรวมไทย",
        "ชาติไทยพัฒนา",
        "ประชาชาติ",
        "เศรษฐกิจใหม่",
        "เพื่อชาติ",
        "รวมพลังประชาชาติไทย",
        "ชาติพัฒนา",
        "พลังท้องถิ่นไท",
        "รักษ์ผืนป่าประเทศไทย",
        "พลังปวงชนไทย",
        "พลังชาติไทย",
        "ประชาภิวัฒน์",
        "พลังไทยรักไทย",
        "ไทยศรีวิไลย์",
        "ครูไทยเพื่อประชาชน",
        "ประชานิยม",
        "ประชาธรรมไทย",
        "ประชาชนปฏิรูป",
        "พลเมืองไทย",
        "ประชาธิปไตยใหม่",
        "พลังธรรมใหม่",
        "ไทรักธรรม",
        "เพื่อแผ่นดิน",
        "ทางเลือกใหม่",
        "ภราดรภาพ",
        "พลังประชาธิปไตย",
        "เพื่อคนไทย",
        "พลังไทสร้างชาติ",
        "กรีน",
        "แผ่นดินธรรม",
        "มหาชน",
        "พลังสังคม",
        "สยามพัฒนา",
        "เครือข่ายชาวนาแห่งประเทศไทย",
        "แทนคุณแผ่นดิน",
        "เพื่อธรรม",
        "รวมใจไทย",
        "คลองไทย",
        "ผึ้งหลวง",
        "ภาคีเครือข่ายไทย",
        "ประชากรไทย",
        "ประชาไทย",
        "พลังไทยรักชาติ",
        "ชาติพันธุ์ไทย",
        "พลังศรัทธา",
        "ความหวังใหม่",
        "เพื่อไทยพัฒนา",
        "ถิ่นกาขาวชาววิไล",
        "พลังครูไทย",
        "ไทยธรรม",
        "สังคมประชาธิปไตยไทย",
        "กลาง",
        "สามัญชน",
        "ฐานรากไทย",
        "พลังรัก",
        "พลังแผ่นดินทอง",
        "ไทยรุ่งเรือง",
        "ภูมิพลังเกษตรกรไทย",
        "รักท้องถิ่นไทย",
        "พลังแรงงานไทย",
        "คนธรรมดาแห่งประเทศไทย",
        "พลังไทยดี",
        "พลังสหกรณ์",
        "เพื่อชีวิตใหม่",
        "พัฒนาประเทศไทย",
        "เพื่อสหกรณ์ไทย",
        "มติประชา",
        "ยางพาราไทย",
        "ประชาธิปไตยเพื่อประชาชน",
        "รักษ์ธรรม",
        "อนาคตไทย",
        "กสิกรไทย",
        "คนงานไทย",
        "เพื่อนไทย",
        "พลังคนกีฬา",
        "ไทยรักษาชาติ"
      ],
      partyColor: [
        "hsl(0, 90%, 50%)",
        "hsl(240, 90%, 50%)",
        "hsl(22, 90%, 60%)",
        "hsl(200, 90%, 50%)",
        "hsl(260, 100%, 50%)",
        "hsl(55, 90%, 50%)",
        "hsl(320, 90%, 50%)",
        "hsl(70, 90%, 50%)",
        "hsl(230, 100%, 70%)",
        "hsl(340, 100%, 70%)",
        "hsl(220, 90%, 50%)",
        "hsl(25, 90%, 50%)",
        "#0f41ce",
        "#33338f",
        "#829aa7",
        "#e6b750",
        "#0c327a",
        "#da3731",
        "#f20707",
        "#ffaf41",
        "#2b2d66",
        "#ff72a8",
        "#ad1b34",
        "#209fa0",
        "#d32524",
        "#01019a",
        "#35899a",
        "#000099",
        "#eb4138",
        "#7a3e21",
        "#175a38",
        "#395a3d",
        "#259747",
        "#bd646d",
        "#8dbf44",
        "#e43ba2",
        "#b49e31",
        "#3839a8",
        "#c0bcc3",
        "#c4403a",
        "#0c5a38",
        "#fef102",
        "#aa6a9b",
        "#d9771c",
        "#27ac67",
        "#e08119",
        "#dc8428",
        "#d63a40",
        "#026aec",
        "#2f3293",
        "#076350",
        "#2d3180",
        "#313091",
        "#e9b54a",
        "#dfde4a",
        "#ef7824",
        "#ec5c2c",
        "#bc0911",
        "#0c5197",
        "#303d8e",
        "#f7c704",
        "#0a217d",
        "#181f97",
        "#245896",
        "#08663b",
        "#a35f26",
        "#594835",
        "#0eafeb",
        "#c32429",
        "#ea1f25",
        "#1f68dd",
        "#6e2fff",
        "#674590",
        "#36aadc",
        "#406887",
        "#148e14",
        "#c67328",
        "#73c9ec",
        "#6ab36d",
        "#059b3a",
        "#fbf008",
        "#c3067e"
      ],
      partySide: [],
      partyNConstituentSeat: [
        137,
        97,
        30,
        33,
        39,
        0,
        6,
        6,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      partyNTotalVote: [
        7920630,
        8433137,
        6265950,
        3947726,
        3732883,
        826530,
        782031,
        485436,
        485664,
        419393,
        416324,
        252044,
        213129,
        136597,
        81733,
        73871,
        69417,
        60840,
        60421,
        56339,
        56617,
        47848,
        45508,
        44766,
        39792,
        35533,
        33748,
        31307,
        29607,
        27799,
        26617,
        26598,
        23059,
        22662,
        21463,
        17867,
        17683,
        16839,
        17664,
        17112,
        15365,
        13457,
        12946,
        12576,
        12268,
        11839,
        11043,
        9685,
        9757,
        9561,
        9074,
        8095,
        6799,
        6398,
        5942,
        5447,
        5321,
        5334,
        4786,
        4624,
        4568,
        4237,
        3535,
        3254,
        2951,
        2536,
        2343,
        2353,
        1595,
        1079,
        905,
        791,
        610,
        562,
        446,
        198,
        183
      ],
      paramChanged: false
    };
  },
  created() {
    this.runUserDefined();

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
        this.partyName.splice(this.nParty - 2, 0, (this.nParty - 1).toString());

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

      app.runApp(config, { onlyAllocation: true, side: false }, parties);

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
        side: false
      });

      notify(this);
    },
    reset(template) {
      switch (template) {
        case "เริ่มต้น":
          this.nParty = 2;
          this.nConstituentSeat = 350;
          this.nVote = 35000000;
          this.partyName = ["ตัวอย่าง", "อื่นๆ"];
          this.partyColor = ["hsl(30, 90%, 60%)", "hsl(0, 0%, 60%)"];
          this.partySide = ["ฝ่ายรัฐบาล", "ฝ่ายค้าน"];
          this.partyNConstituentSeat = [175, 175];
          this.partyNTotalVote = [17500000, 17500000];
          break;
        case "ผลคะแนนเมื่อ 28 มี.ค. 17:00":
          this.nParty = 81;
          this.nConstituentSeat = 350;
          this.nVote = 35532647;
          this.partyName = [
            "เพื่อไทย",
            "พลังประชารัฐ",
            "อนาคตใหม่",
            "ประชาธิปัตย์",
            "ภูมิใจไทย",
            "เสรีรวมไทย",
            "ชาติไทยพัฒนา",
            "ประชาชาติ",
            "เศรษฐกิจใหม่",
            "เพื่อชาติ",
            "รวมพลังประชาชาติไทย",
            "ชาติพัฒนา",
            "พลังท้องถิ่นไท",
            "รักษ์ผืนป่าประเทศไทย",
            "พลังปวงชนไทย",
            "พลังชาติไทย",
            "ประชาภิวัฒน์",
            "พลังไทยรักไทย",
            "ไทยศรีวิไลย์",
            "ครูไทยเพื่อประชาชน",
            "ประชานิยม",
            "ประชาธรรมไทย",
            "ประชาชนปฏิรูป",
            "พลเมืองไทย",
            "ประชาธิปไตยใหม่",
            "พลังธรรมใหม่",
            "ไทรักธรรม",
            "เพื่อแผ่นดิน",
            "ทางเลือกใหม่",
            "ภราดรภาพ",
            "พลังประชาธิปไตย",
            "เพื่อคนไทย",
            "พลังไทสร้างชาติ",
            "กรีน",
            "แผ่นดินธรรม",
            "มหาชน",
            "พลังสังคม",
            "สยามพัฒนา",
            "เครือข่ายชาวนาแห่งประเทศไทย",
            "แทนคุณแผ่นดิน",
            "เพื่อธรรม",
            "รวมใจไทย",
            "คลองไทย",
            "ผึ้งหลวง",
            "ภาคีเครือข่ายไทย",
            "ประชากรไทย",
            "ประชาไทย",
            "พลังไทยรักชาติ",
            "ชาติพันธุ์ไทย",
            "พลังศรัทธา",
            "ความหวังใหม่",
            "เพื่อไทยพัฒนา",
            "ถิ่นกาขาวชาววิไล",
            "พลังครูไทย",
            "ไทยธรรม",
            "สังคมประชาธิปไตยไทย",
            "กลาง",
            "สามัญชน",
            "ฐานรากไทย",
            "พลังรัก",
            "พลังแผ่นดินทอง",
            "ไทยรุ่งเรือง",
            "ภูมิพลังเกษตรกรไทย",
            "รักท้องถิ่นไทย",
            "พลังแรงงานไทย",
            "คนธรรมดาแห่งประเทศไทย",
            "พลังไทยดี",
            "พลังสหกรณ์",
            "เพื่อชีวิตใหม่",
            "พัฒนาประเทศไทย",
            "เพื่อสหกรณ์ไทย",
            "มติประชา",
            "ยางพาราไทย",
            "ประชาธิปไตยเพื่อประชาชน",
            "รักษ์ธรรม",
            "อนาคตไทย",
            "กสิกรไทย",
            "คนงานไทย",
            "เพื่อนไทย",
            "พลังคนกีฬา",
            "ไทยรักษาชาติ"
          ];
          (this.partyColor = [
            "hsl(0, 90%, 50%)",
            "hsl(240, 90%, 50%)",
            "hsl(22, 90%, 60%)",
            "hsl(200, 90%, 50%)",
            "hsl(260, 100%, 50%)",
            "hsl(55, 90%, 50%)",
            "hsl(320, 90%, 50%)",
            "hsl(70, 90%, 50%)",
            "hsl(230, 100%, 70%)",
            "hsl(340, 100%, 70%)",
            "hsl(220, 90%, 50%)",
            "hsl(25, 90%, 50%)",
            "#0f41ce",
            "#33338f",
            "#829aa7",
            "#e6b750",
            "#0c327a",
            "#da3731",
            "#f20707",
            "#ffaf41",
            "#2b2d66",
            "#ff72a8",
            "#ad1b34",
            "#209fa0",
            "#d32524",
            "#01019a",
            "#35899a",
            "#000099",
            "#eb4138",
            "#7a3e21",
            "#175a38",
            "#395a3d",
            "#259747",
            "#bd646d",
            "#8dbf44",
            "#e43ba2",
            "#b49e31",
            "#3839a8",
            "#c0bcc3",
            "#c4403a",
            "#0c5a38",
            "#fef102",
            "#aa6a9b",
            "#d9771c",
            "#27ac67",
            "#e08119",
            "#dc8428",
            "#d63a40",
            "#026aec",
            "#2f3293",
            "#076350",
            "#2d3180",
            "#313091",
            "#e9b54a",
            "#dfde4a",
            "#ef7824",
            "#ec5c2c",
            "#bc0911",
            "#0c5197",
            "#303d8e",
            "#f7c704",
            "#0a217d",
            "#181f97",
            "#245896",
            "#08663b",
            "#a35f26",
            "#594835",
            "#0eafeb",
            "#c32429",
            "#ea1f25",
            "#1f68dd",
            "#6e2fff",
            "#674590",
            "#36aadc",
            "#406887",
            "#148e14",
            "#c67328",
            "#73c9ec",
            "#6ab36d",
            "#059b3a",
            "#fbf008",
            "#c3067e"
          ]),
            (this.partySide = []);
          this.partyNConstituentSeat = [
            137,
            97,
            30,
            33,
            39,
            0,
            6,
            6,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
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
            7920630,
            8433137,
            6265950,
            3947726,
            3732883,
            826530,
            782031,
            485436,
            485664,
            419393,
            416324,
            252044,
            213129,
            136597,
            81733,
            73871,
            69417,
            60840,
            60421,
            56339,
            56617,
            47848,
            45508,
            44766,
            39792,
            35533,
            33748,
            31307,
            29607,
            27799,
            26617,
            26598,
            23059,
            22662,
            21463,
            17867,
            17683,
            16839,
            17664,
            17112,
            15365,
            13457,
            12946,
            12576,
            12268,
            11839,
            11043,
            9685,
            9757,
            9561,
            9074,
            8095,
            6799,
            6398,
            5942,
            5447,
            5321,
            5334,
            4786,
            4624,
            4568,
            4237,
            3535,
            3254,
            2951,
            2536,
            2343,
            2353,
            1595,
            1079,
            905,
            791,
            610,
            562,
            446,
            198,
            183
          ];
          break;
        case "ผลคะแนนเมื่อ 25 มี.ค. 13:06":
          this.nParty = 81;
          this.nConstituentSeat = 350;
          (this.nVote = 33353799),
            (this.partyName = [
              "เพื่อไทย",
              "พลังประชารัฐ",
              "อนาคตใหม่",
              "ประชาธิปัตย์",
              "ภูมิใจไทย",
              "เสรีรวมไทย",
              "ชาติไทยพัฒนา",
              "ประชาชาติ",
              "เศรษฐกิจใหม่",
              "เพื่อชาติ",
              "รวมพลังประชาชาติไทย",
              "ชาติพัฒนา",
              "พลังท้องถิ่นไท",
              "รักษ์ผืนป่าประเทศไทย",
              "พลังปวงชนไทย",
              "พลังชาติไทย",
              "ประชาภิวัฒน์",
              "พลังไทยรักไทย",
              "ไทยศรีวิไลย์",
              "ครูไทยเพื่อประชาชน",
              "ประชานิยม",
              "ประชาธรรมไทย",
              "ประชาชนปฏิรูป",
              "พลเมืองไทย",
              "ประชาธิปไตยใหม่",
              "พลังธรรมใหม่",
              "ไทรักธรรม",
              "เพื่อแผ่นดิน",
              "ทางเลือกใหม่",
              "ภราดรภาพ",
              "พลังประชาธิปไตย",
              "เพื่อคนไทย",
              "พลังไทสร้างชาติ",
              "กรีน",
              "แผ่นดินธรรม",
              "มหาชน",
              "พลังสังคม",
              "สยามพัฒนา",
              "เครือข่ายชาวนาแห่งประเทศไทย",
              "แทนคุณแผ่นดิน",
              "เพื่อธรรม",
              "รวมใจไทย",
              "คลองไทย",
              "ผึ้งหลวง",
              "ภาคีเครือข่ายไทย",
              "ประชากรไทย",
              "ประชาไทย",
              "พลังไทยรักชาติ",
              "ชาติพันธุ์ไทย",
              "พลังศรัทธา",
              "ความหวังใหม่",
              "เพื่อไทยพัฒนา",
              "ถิ่นกาขาวชาววิไล",
              "พลังครูไทย",
              "ไทยธรรม",
              "สังคมประชาธิปไตยไทย",
              "กลาง",
              "สามัญชน",
              "ฐานรากไทย",
              "พลังรัก",
              "พลังแผ่นดินทอง",
              "ไทยรุ่งเรือง",
              "ภูมิพลังเกษตรกรไทย",
              "รักท้องถิ่นไทย",
              "พลังแรงงานไทย",
              "คนธรรมดาแห่งประเทศไทย",
              "พลังไทยดี",
              "พลังสหกรณ์",
              "เพื่อชีวิตใหม่",
              "พัฒนาประเทศไทย",
              "เพื่อสหกรณ์ไทย",
              "มติประชา",
              "ยางพาราไทย",
              "ประชาธิปไตยเพื่อประชาชน",
              "รักษ์ธรรม",
              "อนาคตไทย",
              "กสิกรไทย",
              "คนงานไทย",
              "เพื่อนไทย",
              "พลังคนกีฬา",
              "ไทยรักษาชาติ"
            ]);
          this.partyColor = [
            "hsl(0, 90%, 50%)",
            "hsl(240, 90%, 50%)",
            "hsl(22, 90%, 60%)",
            "hsl(200, 90%, 50%)",
            "hsl(260, 100%, 50%)",
            "hsl(55, 90%, 50%)",
            "hsl(320, 90%, 50%)",
            "hsl(70, 90%, 50%)",
            "hsl(230, 100%, 70%)",
            "hsl(340, 100%, 70%)",
            "hsl(220, 90%, 50%)",
            "hsl(25, 90%, 50%)",
            "#0f41ce",
            "#33338f",
            "#829aa7",
            "#e6b750",
            "#0c327a",
            "#da3731",
            "#f20707",
            "#ffaf41",
            "#2b2d66",
            "#ff72a8",
            "#ad1b34",
            "#209fa0",
            "#d32524",
            "#01019a",
            "#35899a",
            "#000099",
            "#eb4138",
            "#7a3e21",
            "#175a38",
            "#395a3d",
            "#259747",
            "#bd646d",
            "#8dbf44",
            "#e43ba2",
            "#b49e31",
            "#3839a8",
            "#c0bcc3",
            "#c4403a",
            "#0c5a38",
            "#fef102",
            "#aa6a9b",
            "#d9771c",
            "#27ac67",
            "#e08119",
            "#dc8428",
            "#d63a40",
            "#026aec",
            "#2f3293",
            "#076350",
            "#2d3180",
            "#313091",
            "#e9b54a",
            "#dfde4a",
            "#ef7824",
            "#ec5c2c",
            "#bc0911",
            "#0c5197",
            "#303d8e",
            "#f7c704",
            "#0a217d",
            "#181f97",
            "#245896",
            "#08663b",
            "#a35f26",
            "#594835",
            "#0eafeb",
            "#c32429",
            "#ea1f25",
            "#1f68dd",
            "#6e2fff",
            "#674590",
            "#36aadc",
            "#406887",
            "#148e14",
            "#c67328",
            "#73c9ec",
            "#6ab36d",
            "#059b3a",
            "#fbf008",
            "#c3067e"
          ];
          (this.partySide = []),
            (this.partyNConstituentSeat = [
              137,
              97,
              30,
              33,
              39,
              0,
              6,
              6,
              0,
              0,
              1,
              1,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]);
          this.partyNTotalVote = [
            7423361,
            7939937,
            5871137,
            3704654,
            3512446,
            771534,
            736948,
            457482,
            457432,
            393909,
            391728,
            237287,
            200097,
            122494,
            77350,
            69840,
            63602,
            57058,
            56555,
            52894,
            52675,
            44427,
            42331,
            41589,
            36850,
            33287,
            31634,
            28788,
            27149,
            26188,
            25057,
            24482,
            21788,
            20753,
            19825,
            16758,
            16528,
            16285,
            15899,
            15759,
            14175,
            12660,
            12167,
            11579,
            11109,
            10996,
            10080,
            9318,
            9174,
            9091,
            8348,
            7570,
            6320,
            6201,
            5496,
            4922,
            4883,
            4646,
            4423,
            4328,
            4311,
            3873,
            3202,
            3111,
            2724,
            2560,
            2419,
            2209,
            1551,
            1004,
            869,
            757,
            571,
            548,
            435,
            192,
            180,
            0,
            0,
            0,
            0
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
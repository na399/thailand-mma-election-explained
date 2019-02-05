
<template>
  <div style="margin: 20px">
    <div>
      <b>พรรค</b>
    </div>
    <div style="margin: 20px 0px">
      <el-autocomplete
        class="inline-input"
        v-model="name"
        :fetch-suggestions="querySearch"
        placeholder="ชื่อ"
        @select="handleSelect"
        @change="changeParams"
      ></el-autocomplete>
      <el-color-picker v-model="color" :predefine="predefinedColors" @change="changeParams"></el-color-picker>
      <el-radio-group v-model="side" size="small" @change="changeParams">
        <el-radio-button label="ฝ่ายรัฐบาล"></el-radio-button>
        <el-radio-button label="ฝ่ายค้าน"></el-radio-button>
      </el-radio-group>
    </div>
    <div>
      <span>จำนวนส.ส.แบบแบ่งเขตเลือกตั้ง</span>
      <el-slider v-model="nConstituentSeat" :max="350" show-input @change="changeParams"></el-slider>
    </div>
    <div>
      <span>จำนวนเสียงที่ได้รับทั้งประเทศ</span>
      <el-slider
        v-model="nTotalVote"
        :max="35000000"
        show-input
        :format-tooltip="numberWithCommas"
        @change="changeParams"
      ></el-slider>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../event-bus.js";

export default {
  props: [
    "name-initial",
    "n-constituent-seat-initial",
    "n-total-vote-initial",
    "side-initial",
    "color-initial"
  ],
  data() {
    return {
      name: this.nameInitial || "",
      nConstituentSeat: this.nConstituentSeatInitial || 0,
      nTotalVote: this.nTotalVoteInitial || 0,
      side: this.sideInitial || "ฝ่ายรัฐบาล",
      color: this.colorInitial || "#777777",
      predefinedColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff"
      ]
    };
  },
  mounted() {
    this.parties = this.loadAll();
  },
  methods: {
    changeParams() {
      EventBus.$emit("params-changed", this.$data, this.$vnode.key);
    },
    numberWithCommas(x) {
      return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    },
    querySearch(queryString, cb) {
      var parties = this.parties;
      var results = queryString
        ? parties.filter(this.createFilter(queryString))
        : parties;
      // call callback function to return suggestions
      cb(results);
    },
    createFilter(queryString) {
      return party => {
        return party.value.indexOf(queryString) === 0;
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    loadAll() {
      return [
        { value: "กรีน" },
        { value: "กลาง" },
        { value: "กสิกรไทย" },
        { value: "คนธรรมดาแห่งประเทศไทย" },
        { value: "ครูไทยเพื่อประชาชน" },
        { value: "คลองไทย" },
        { value: "ความหวังใหม่" },
        { value: "เครือข่ายชาวนาแห่งประเทศไทย" },
        { value: "เงินเดือนประชาชน" },
        { value: "ชาติไทยพัฒนา" },
        { value: "ชาติไทยสามัคคี" },
        { value: "ชาติประชาธิปไตยก้าวหน้า" },
        { value: "ชาติพัฒนา" },
        { value: "ชาติพันธุ์ไทย" },
        { value: "ฐานรากไทย" },
        { value: "ถิ่นกาขาว" },
        { value: "ทวงคืนผืนป่าประเทศไทย" },
        { value: "ทางเลือกใหม่" },
        { value: "แทนคุณแผ่นดิน" },
        { value: "ไทยธรรม" },
        { value: "ไทยมหารัฐพัฒนา" },
        { value: "ไทยรักธรรม" },
        { value: "ไทยรักษาชาติ" },
        { value: "ไทยรุ่งเรือง" },
        { value: "ไทยศรีวิไลย์" },
        { value: "ธรรมาภิบาลสังคม" },
        { value: "ปฏิรูปไทย" },
        { value: "ประชากรไทย" },
        { value: "ประชาชนปฏิรูป" },
        { value: "ประชาชาติ" },
        { value: "ประชาไทย" },
        { value: "ประชาธรรม" },
        { value: "ประชาธรรมไทย" },
        { value: "ประชาธิปไตยเพื่อประชาชน" },
        { value: "ประชาธิปไตยใหม่" },
        { value: "ประชาธิปัตย์" },
        { value: "ประชานิยม" },
        { value: "ประชาภิวัฒน์" },
        { value: "ประชาสามัคคี" },
        { value: "แผ่นดินธรรม" },
        { value: "พลังเกษตรกรไทย" },
        { value: "พลังคนกีฬา" },
        { value: "พลังครูไทย" },
        { value: "พลังเครือข่ายประชาชน" },
        { value: "พลังชล" },
        { value: "พลังชาติไทย" },
        { value: "พลังท้องถิ่นไท" },
        { value: "พลังไทยเครือข่าย" },
        { value: "พลังไทยดี" },
        { value: "พลังไทยรักชาติ" },
        { value: "พลังไทยรักไทย" },
        { value: "พลังไทสร้างชาติ" },
        { value: "พลังธรรมใหม่" },
        { value: "พลังประชาธิปไตย" },
        { value: "พลังประชารัฐ" },
        { value: "พลังประเทศไทย" },
        { value: "พลังปวงชนไทย" },
        { value: "พลังแผ่นดินทอง" },
        { value: "พลังพลเมือง" },
        { value: "พลังพลเมืองไทย" },
        { value: "พลังเพื่อไทย" },
        { value: "พลังรัก" },
        { value: "พลังแรงงานไทย" },
        { value: "พลังศรัทธา" },
        { value: "พลังสหกรณ์" },
        { value: "พลังสังคม" },
        { value: "พัฒนาประเทศไทย" },
        { value: "เพื่อคนไทย" },
        { value: "เพื่อชาติ" },
        { value: "เพื่อชีวิตใหม่" },
        { value: "เพื่อไทย" },
        { value: "เพื่อไทยพัฒนา" },
        { value: "เพื่อธรรม" },
        { value: "เพื่อนไทย" },
        { value: "เพื่อแผ่นดิน" },
        { value: "เพื่อฟ้าดิน" },
        { value: "เพื่อสหกรณ์ไทย" },
        { value: "เพื่อสันติ" },
        { value: "เพื่ออนาคต" },
        { value: "ภราดรภาพ" },
        { value: "ภาคีเครือข่ายไทย" },
        { value: "ภูมิใจไทย" },
        { value: "ภูมิพลังเกษตรกรไทย" },
        { value: "มติประชา" },
        { value: "มหาชน" },
        { value: "มหาประชาชน" },
        { value: "มาตุภูมิ" },
        { value: "เมืองไทยของเรา" },
        { value: "ยางพาราไทย" },
        { value: "รวมใจไทย" },
        { value: "รวมพลังไทย" },
        { value: "รวมพลังประชาชาติไทย" },
        { value: "ร่วมพัฒนาชาติไทย" },
        { value: "รักท้องถิ่นไทย" },
        { value: "รักประเทศไทย" },
        { value: "รักษ์ธรรม" },
        { value: "รักษ์สันติ" },
        { value: "เศรษฐกิจใหม่" },
        { value: "สยามพัฒนา" },
        { value: "สร้างไทย" },
        { value: "สังคมประชาธิปไตยไทย" },
        { value: "สามัญชน" },
        { value: "เสรีนิยม" },
        { value: "เสรีรวมไทย" },
        { value: "อนาคตไทย" },
        { value: "อนาคตใหม่" },
        { value: "เอกราชไทย" }
      ];
    }
  }
};
</script>

<style>
.el-slider__input {
  width: 150px;
}
.el-slider__runway.show-input {
  margin-right: 180px;
  width: auto;
}
.el-color-picker {
  vertical-align: bottom;
}
</style>
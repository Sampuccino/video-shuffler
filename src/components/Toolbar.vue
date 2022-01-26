<template>
  <div class="toolbar p-5">
    <div class="columns">
      <div
        class="column control is-1 has-text-centered my-auto"
        @click="onPreviousTrack()"
      >
        <i class="fas fa-backward"></i>
      </div>
      <div
        class="column control control-active is-1 has-text-centered my-auto"
        @click="onTogglePlay()"
      >
        <i v-if="!play" class="fas fa-play"></i>
        <i v-else class="fas fa-pause"></i>
      </div>
      <div
        class="column control is-1 has-text-centered my-auto"
        @click="onNextTrack()"
      >
        <i class="fas fa-forward"></i>
      </div>
      <div
        class="column control is-1 has-text-centered my-auto"
        :class="shuffle ? 'control-active' : ''"
        @click="onToggleShuffle()"
      >
        <i class="fas fa-random"></i>
      </div>
      <div class="column is-8">
        <b-field label="">
          <b-autocomplete
            rounded
            v-model="name"
            :data="filteredDataArray"
            placeholder="e.g. filename"
            icon="magnify"
            clearable
            @select="(option) => (selected = option)"
          >
            <template #empty>No results found</template>
          </b-autocomplete>
        </b-field>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    shuffle: Boolean,
    mediaFiles: Array,
  },
  data() {
    return {
      play: false,
      data: [...this.mediaFiles],
      name: "",
      selected: null,
    };
  },
  watch: {
    selected: function (selected) {
      selected ? this.$emit("onSearchedTrack", selected) : null;
    },
  },
  methods: {
    onPreviousTrack() {
      console.log("Previous Track");
      this.$emit("previousTrack", true);
    },
    onNextTrack() {
      this.$emit("nextTrack", true);
    },
    onToggleShuffle() {
      console.log("Toolbar: Shuffle Toggled");
      this.$emit("onToggleShuffle", !this.shuffle);
    },
    onTogglePlay() {
      this.play = !this.play;
      this.$emit("onTogglePlay", this.play);
    },
    onTrackSelected(option) {
      console.log("onTrackSelected ", option);
    },
  },
  computed: {
    filteredDataArray() {
      return this.data.filter((option) => {
        return (
          option.toString().toLowerCase().indexOf(this.name.toLowerCase()) >= 0
        );
      });
    },
  },
};
</script>
<style>
.toolbar {
  background-color: #ffffff;
  border-radius: 0.75rem;
}
.control:hover {
  background-color: #f4f5fe;
  transition: all 0.25s ease-in-out;
  cursor: pointer;
  color: black;
  border-radius: 0.75rem;
}
.control-active {
  /* background-color: #f4f5fe; */
  background-color: black;
  color: white;
  border-radius: 0.75rem;
  transition: all 0.5s ease-in-out;
}
</style> 
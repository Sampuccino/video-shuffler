<template>
  <!-- Things to display. ID / Image or File Icon / Favorite / Filename / Directory -->
  <div
    class="p-3 media-row"
    @dblclick="onPlaySelectedTrack(source.filepath, source.filename)"
  >
    <b class="mr-5">{{ index }}</b>
    <span v-if="!source.favorited" class="mr-5">
      <i class="fas fa-heart follow-unfollow" @click="hasFavorited(source)"></i>
    </span>
    <span v-else class="mr-5">
      <i
        class="fas fa-heart favorited follow-unfollow"
        @click="hasFavorited(source)"
      ></i>
    </span>
    <span class="mr-5">
      <u>{{ source.directory }}</u>
    </span>
    <span class="mr-5">{{ source.filename }}</span>
    <div class="underline-border"></div>
  </div>
</template>
<style>
.underline-border {
  margin-top: 1rem;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.164);
}
.media-row {
  border-radius: 0.5rem;
}
.media-row:hover {
  cursor: pointer;
  background-color: black !important;
  color: white;
  transition: all 0.25s ease-in-out;
}
.favorited {
  color: red;
}
.follow-unfollow:hover {
  color: white !important;
}
</style>

<script>
export default {
  name: "item-component",
  props: {
    index: {
      // index of current item
      type: Number,
    },
    source: {
      // here is: {media_id: 'unique_1', filename: 'abc'}
      type: Object,
    },
    favorited: {
      type: Boolean,
    },
  },
  methods: {
    hasFavorited(source) {
      const flag = source.favorited ? false : true;
      window.api.send("onUpdateFavorited", {
        id: source.media_id,
        favorited: flag,
        fileObj: source,
      });
      if (flag) {
        this.$buefy.toast.open({
          message: "Item has been removed from favorites",
          position: "is-bottom",
          type: "is-success",
        });
      } else {
        this.$buefy.toast.open({
          message: "Item has been favorited",
          position: "is-bottom",
          type: "is-success",
        });
      }
    },
    onPlaySelectedTrack(filepath, filename) {
      document
        .getElementById("videoPlayer")
        .getElementsByTagName("video")[0].src = "file://" + filepath;
      // Play the selected video
      document
        .getElementById("videoPlayer")
        .getElementsByTagName("video")[0]
        .play();
      this.$buefy.toast.open({
        message: `Now playing ${filename}`,
        position: "is-bottom",
        type: "is-success",
      });
    },
  },
};
</script>
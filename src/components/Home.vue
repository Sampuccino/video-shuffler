<template >
  <div class="container-fluid">
    <div class="columns mt-1">
      <div class="column is-8">
        <div class="white-container p-3">
          <video ref="videoPlayer" id="videoPlayer" class="video-js"></video>
          <br />
          <h4 class="title is-6">Now Playing</h4>
          <div class="subtitle media-row is-6 p-2">
            <span v-if="favorited !== null" class="mr-2">
              <span v-if="!favorited.favorited" class="mr-2">
                <i
                  class="fas fa-heart follow-unfollow"
                  @click="hasFavorited(favorited)"
                ></i>
              </span>
              <span v-else class="mr-5">
                <i
                  class="fas fa-heart favorited follow-unfollow"
                  @click="hasFavorited(favorited)"
                ></i>
              </span>
            </span>
            <span v-else></span>
            {{ playing }}
          </div>
        </div>
      </div>
      <div class="column is-4">
        <div class="white-container up-next p-3">
          <h4>
            <b><u>Up Next</u></b>
          </h4>
          <div v-for="(n, index) in next" :key="index" class="mt-3">
            <div class="up-next mb-3">
              <span
                ><b class="mr-2">{{ index + 1 }}</b></span
              >{{ n.f }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-show="imageEtensions.includes(extensionType[extensionType.length - 1])"
      class="columns image-container"
      style="margin-top: -1rem"
    >
      <div class="column is-12">
        <b-button type="is-light image-container-button" @click="resizeImage">
          <i class="fas fa-expand-arrows-alt"></i>
        </b-button>
        <div
          class="white-container p-3 has-text-centered"
          style="padding-bottom: 0.35rem !important"
        >
          <img
            :class="resize ? 'scaled-image-100' : 'scaled-image-50'"
            :src="imageSource"
          />
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-12">
        <div class="white-container p-3">
          <virtual-list
            style="height: 650px; overflow-y: auto"
            :data-key="'media_id'"
            :data-sources="mediaFiles"
            :data-component="itemComponent"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Item from "./Item";
import videojs from "video.js";
import VirtualList from "vue-virtual-scroll-list";
export default {
  props: {
    directoryId: Number,
    mediaFiles: Array,
    playing: String,
    next: Array,
    source: String,
    play: Boolean,
    favorited: Object,
  },
  components: {
    "virtual-list": VirtualList,
  },
  data() {
    return {
      itemComponent: Item,
      files: this.mediaFiles,
      player: null,
      cluster: null,
      resize: false,
      imageSource: null,
      imageEtensions: ["png", "jpeg", "jpg"],
      extensionType: ["", ""],
      selected: {},
      options: {
        autoplay: false,
        controls: true,
        controlBar: {
          timeDivider: false,
          durationDisplay: false,
        },
        sources: [
          {
            // Put a placeholder video here
            src: this.source,
            // type: "video/mp4",
          },
        ],
        width: "670px",
        height: "400px",
      },
    };
  },
  beforeCreate() {
    // Create the next source here
    // console.log("HOME with Directory ID ", this.directoryId);
    // window.api.files.then((data) => {
    //   this.files = data;
    //   if (this.files.length > 0) {
    //     console.warn("We got some files!");
    //     // file:///home/samuel/Downloads/🔴 Transfer-XXX/Cheating Wife Secretly Fucks Friend while her Husband Unaware next to them _ Amateur Hotwife.mp4
    //     // file:///home/samuel/Downloads/Super Hot Rough Sex - Amateur Couple in Quarantine.mp4
    //     // console.log(this.files[0].filepath + this.files[0].filename)
    //   }
    // });
  },
  mounted() {
    this.player = videojs(
      this.$refs.videoPlayer,
      this.options,
      function onPlayerReady() {
        // console.log("onPlayerReady", this);
      }
    );
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods: {
    updateVideoSource(path) {
      // Create the next source file to play when al the files mount since there can be 2 places to play a song. It can be throuh the controls or the user selected the next video to play.
      // Also take into account photos and hhow to play or show those

      let extensionTypePath = path;
      this.extensionType = extensionTypePath.split(".");

      console.log(
        "Image extensions allowed ",
        this.imageEtensions,
        " with a result of ",
        this.extensionType[this.extensionType.length - 1]
      );

      console.warn("Update source ", path);

      if (
        !this.imageEtensions.includes(
          this.extensionType[this.extensionType.length - 1]
        )
      ) {
        this.player.pause();
        this.player.reset(); // in IE11 (mode IE10) direct usage of src() when <src> is already set, generated errors,
        this.player.src(path);
        this.player.play();
      } else {
        this.imageSource = path;
      }
    },
    resizeImage() {
      this.resize = !this.resize;
    },
    hasFavorited(source) {
      const flag = source.favorited ? false : true;
      window.api.send("onUpdateFavorited", {
        id: source.media_id,
        favorited: flag,
        fileObj: source,
      });
      if (flag) {
        this.$buefy.toast.open({
          message: "Item has been added to favorites",
          position: "is-bottom",
          type: "is-success",
        });
      } else {
        this.$buefy.toast.open({
          message: "Item has been removed from favorited",
          position: "is-bottom",
          type: "is-success",
        });
      }
    },
  },
  watch: {
    source() {
      // console.log("Home: Source updated ", value);
      this.updateVideoSource("file://" + this.source);
    },
    play(value) {
      console.log("Home: play ", value);
      value ? this.player.play() : this.player.pause();
    },
  },
};
</script>
<style>
.white-container {
  background-color: #ffffff;
  border-radius: 0.75rem;
}
.up-next {
  /* inline-size: 22rem; */
  /* overflow-wrap: break-word; */
  word-break: break-all;
}
.scaled-image-50 {
  width: 50%;
  object-position: center;
  object-fit: cover;
}
.scaled-image-100 {
  width: 100%;
  object-position: center;
  object-fit: cover;
}
.image-container {
  position: relative;
}
.image-container-button {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
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
<template>
  <section id="app" class="columns mt-0 mb-0">
    <!-- Sidebar -->
    <article
      class="column is-one-fifth sidebar has-text-centered"
      style="width: 8rem"
    >
      <ul>
        <li>
          <img
            src="./assets/Importspark-NoBG.9976916a.9976916a.svg"
            width="35"
            alt=""
          />
        </li>
        <li
          class="sidebar-item sidebar-item-active"
          @click="onMenuItemSelected(0)"
        >
          <span class="icon"><i class="fas fa-home"></i> </span>
        </li>
        <li class="sidebar-item" @click="onMenuItemSelected(1)">
          <span class="icon"> <i class="fas fa-duotone fa-heart"></i> </span>
        </li>
        <li class="sidebar-item" @click="onMenuItemSelected(2)">
          <span class="icon">
            <i class="fas fa-cog"></i>
          </span>
        </li>
      </ul>
    </article>
    <article class="column is-four-fifth app-main">
      <!-- Feed data here for the seaching portion -->
      <Toolbar
        v-if="active === 0"
        :shuffle="shuffle"
        :mediaFiles="
          this.files.map((m) => {
            return m.filename;
          })
        "
        @nextTrack="nextTrack($event)"
        @previousTrack="previousTrack($event)"
        @onTogglePlay="onTogglePlay($event)"
        @onToggleShuffle="onToggleShuffle($event)"
        @onSearchedTrack="onSearchedTrack($event)"
      />
      <!-- Home -->
      <!-- Files -->
      <Home
        v-show="active === 0"
        :directoryId="directoryID"
        :mediaFiles="files"
        :playing="playing"
        :favorited="favorited"
        :next="next"
        :source="source"
        :play="play"
      />
      <!-- Favorites -->
      <Favorites v-if="active === 1" :mediaFiles="files" />
      <!-- Settings -->
      <Settings
        v-show="active === 2"
        @directoryID="exposedDirectoryID($event)"
      />
    </article>
  </section>
</template>

<script>
import Settings from "./components/Settings.vue";
import Home from "./components/Home.vue";
import Favorites from "./components/Favorites.vue";
import Toolbar from "./components/Toolbar.vue";
import file_data from "./database/files.json";
export default {
  name: "App",
  components: { Settings, Home, Toolbar, Favorites },
  data() {
    return {
      files: file_data,
      playing: null,
      favorited: null,
      previous: [],
      previousTrackIndex: -1,
      next: [], // Will hold next 5 videos/photos whether Shufffle / List Play
      source: "https://samexplains.com/video-shuffle-default/default.mp4",
      play: false,
      shuffle: false, // true means its toggled at launch and default
      active: 0,
      directoryID: null,
    };
  },
  mounted() {
    this.arrangeNextFiveSongs();
  },
  methods: {
    onMenuItemSelected(itemNumber) {
      // 0...2
      // Remove from current class
      document.getElementsByClassName("sidebar-item")[
        // eslint-disable-next-line no-unexpected-multiline
        this.active
      ].classList.remove("sidebar-item-active");
      //Add to new class
      this.active = itemNumber;
      // Add classes to new menu item
      document.getElementsByClassName("sidebar-item")[
        // eslint-disable-next-line no-unexpected-multiline
        this.active
      ].classList.add("sidebar-item-active");
    },
    exposedDirectoryID(ID) {
      this.directoryID = ID;
    },
    nextTrack() {
      /**
       * IMPORTANT
       * Implement maybe
       * Whenever shuffle is toggled then unntoggled meaning off, try and continue the tracklist from the last song that was left off on instead
       * of starting right from the beginning when shufle is turned off.
       *
       *
       */

      // Update source with next element
      const old_source = this.next[0];
      // Add next track to previous list
      this.previousTrackIndex++;
      this.previous.push(old_source); // [{p,f...]}]
      // this.source =
      //   "file:///home/samuel/Downloads/Super Hot Rough Sex - Amateur Couple in Quarantine.mp4";

      // Only do random shuffle if SHUFFLE is toggled otherwise go downwards on the list
      const randomNum = parseInt(
        Math.random() * (this.files.length - 1 - 0) + 0
      );
      // const path = this.files[randomNum].filename;
      // Add old track to previous list. This adds the first element of next[] into previous[] as next[0] will be removed
      this.source = old_source.p;
      this.playing = old_source.f;
      this.favorited = old_source.favorited;
      console.log("App : source ", this.source);
      // Remove first element
      this.next.shift();
      this.next.push({
        f: this.files[randomNum].filename,
        p: this.files[randomNum].filepath,
        favorited: this.files[randomNum].favorited,
      });
    },
    onTogglePlay(toggle) {
      this.play = toggle;
    },
    onToggleShuffle(s) {
      this.shuffle = s;
      this.arrangeNextFiveSongs();
    },
    previousTrack() {
      // Get the lenght of the prrevious tracks array
      // Decrement until it recheas -1 meaning the end
      // Alert if the end was reached
      this.previousTrackIndex--;
      // console.log(
      //   "Previous tracks ",
      //   this.previousTrackIndex,
      //   "  ",
      //   this.previous
      // );
      // console.log("Previous track is ", this.previous[this.previousTrackIndex]);

      if (this.previousTrackIndex > -1) {
        this.source = this.previous[this.previousTrackIndex].p;
      } else {
        this.$buefy.toast.open({
          message: "No files left in previous queue.",
          position: "is-top-right",
          type: "is-danger",
        });
      }
    },
    arrangeNextFiveSongs() {
      if (this.files.length > 0) {
        // Reset Next
        this.next = [];
        // Generate the 5 songs to be played
        // If Shuffle is toggled update the next[] with 5 next random tracks
        if (this.shuffle) {
          for (let i = 0; i < 5; i++) {
            const randomNum = parseInt(
              Math.random() * (this.files.length - 1 - 0) + 0
            );
            this.next.push({
              f: this.files[randomNum].filename,
              p: this.files[randomNum].filepath,
              favorited: {
                media_id: this.files[randomNum].media_id,
                favorited: this.files[randomNum].favorited,
              },
            });
          }
        } else {
          for (let i = 0; i < 5; i++) {
            this.next.push({
              f: this.files[i].filename,
              p: this.files[i].filepath,
              favorited: {
                media_id: this.files[i].media_id,
                favorited: this.files[i].favorited,
              },
            });
          }
        }
      }
    },
    onSearchedTrack(searched) {
      // Filter track to selected one.
      const found = this.files.findIndex((obj) => {
        return obj.filename === searched;
      });
      this.source = this.files[found].filepath;
    },
  },
};
</script>

<style>
::-webkit-scrollbar {
  width: 0px;
}
/* Utilities */
.is-dark {
  background-color: black !important;
  border-radius: 0;
}
/* Border radius 1 */
.br-1 {
  border-radius: 1rem;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

.sidebar {
  background-color: #ffffff;
  padding-right: 0;
  height: 100vh;
}

.sidebar-item {
  color: #717072;
  font-weight: 700;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem;
  position: relative;
  cursor: pointer;
}

.sidebar-item-active {
  background-color: #15111e;
  color: #ffffff;
  transition: all 0.35s ease-in-out;
}

.app-main {
  background-color: #e7e9fc;
  padding-left: 1rem;
  padding-right: 1.75rem;
  overflow: scroll;
  height: 100vh;
}
</style>

<template>
  <div class="container-fluid">
    Favorites
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
import FavoriteItem from "./FavoriteItem.vue";
import VirtualList from "vue-virtual-scroll-list";
export default {
  props: {
    mediaFiles: Array,
  },
  components: {
    "virtual-list": VirtualList,
  },
  data() {
    return {
      itemComponent: FavoriteItem,
      files: this.mediaFiles,
    };
  },
};
</script>
<style lang="">
</style>
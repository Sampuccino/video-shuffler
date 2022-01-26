<template>
  <div class="p-5 settings-component br-1 mr-3">
    <section>
      <!-- Directory Selector -->
      <article>
        <p class="has-text-weight-bold mb-2">Save a directory</p>
        <p class="mb-2">
          Please select a file within the directory you wish to use. The file or
          contents of the file is irrelevant as we only need to know where to
          start building the file directory from.
        </p>
        <p class="mb-2">
          <b>Directory to be used: </b
          ><b-tag type="is-dark" size="">{{ directory }}</b-tag>
        </p>
        <p class="mb-2">
          <b>Filepath to be saved: </b>
          <b-tag type="is-dark" size="">{{ path }}</b-tag>
        </p>
        <div class="file has-name mb-4">
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              name="directory"
              @change="handleFileChange"
            />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label"> Choose a file… </span>
            </span>
            <span class="file-name"> {{ filename }} </span>
          </label>
        </div>

        <!-- Store button -->
        <b-button type="is-dark" @click="onSaveSetting">save</b-button>
      </article>

      <hr style="margin-top: 2rem" />

      <article>
        <!-- Load saved paths -->
        <p class="has-text-weight-bold mb-2">Load saved directory</p>
        <p class="mb-2">
          Select one of your saved directory below to load those files.
        </p>

        <!-- <b-field label="Directories">
          <b-select placeholder="Select a directory" v-model="selected">
            <option
              class="has-background-dark has-text-white"
              v-for="option in options"
              :value="option.settings_id"
              :key="option.settings_id"
            >
              {{ option.filepath }}
            </option>
          </b-select>
        </b-field> -->

        <b-table
          :data="options"
          :columns="columns"
          :checked-rows.sync="checkedRows"
          checkable
          :checkbox-position="checkboxPosition"
        ></b-table>

        <b-button type="is-dark" class="mt-5" @click="onLoadDirectoryFiles()"
          >load</b-button
        >
      </article>
    </section>
  </div>
</template>
<script>
export default {
  data() {
    return {
      path: "",
      directory: null,
      filename: "some_file_in_base_directory",
      options: [],
      selected: null,
      checkboxPosition: "left",
      checkedRows: [],
      columns: [
        {
          field: "settings_id",
          label: "ID",
          width: "40",
          numeric: true,
        },
        {
          field: "directory",
          label: "Directory",
        },
        {
          field: "filepath",
          label: "Filepath",
        },
      ],
    };
  },
  mounted() {
    window.api.content.then(
      (data) =>
        (this.options = [
          {
            settings_id: "EVERYTHING",
            directory: "Everything",
            filepath: "/everything",
          },
          ...data,
        ])
    );
  },
  methods: {
    handleFileChange(e) {
      // Reset variables
      this.path = "";
      this.directory = null;
      this.filename = "some_file_in_base_directory";

      const splitPath = e.target.files[0].path.split("/");
      // Remove first element from array which is ""
      splitPath.shift();
      // Remove last element wich is the irrelevant file selected inside the directory to be used
      splitPath.pop();
      // Set Directory
      this.directory = splitPath[splitPath.length - 1];
      // Set Filepath
      splitPath.forEach((sp, index) => {
        if (index === 0) {
          this.path += `/${sp}/`;
        } else {
          this.path += `${sp}/`;
        }
      });
      // Set filename
      this.filename = e.target.files[0].name;
    },
    onSaveSetting() {
      if (this.path !== "" && this.directory !== null) {
        window.api.send("onSaveSetting", {
          directory: this.directory,
          path: this.path,
        });

        window.api.receive("lastID", (data) => {
          this.options.push({
            settings_id: data,
            directory: this.directory,
            filepath: this.path,
          });
        });

        this.$buefy.toast.open({
          message: "Directory has been saved.",
          position: "is-bottom",
          type: "is-success",
        });
      } else {
        this.$buefy.toast.open({
          message: "Please select a file.",
          position: "is-bottom",
          type: "is-danger",
        });
      }
    },
    onLoadDirectoryFiles() {
      // Check if EVERYTHING is inlcluded
      const EVERYTHING = this.checkedRows.find(
        (o) => o.settings_id === "EVERYTHING"
      );
      let checked = [];
      if (EVERYTHING !== undefined) {
        this.checkedRows.forEach((c) => {
          c.settings_id === "EVERYTHING" ? checked.push(c.settings_id) : null;
        });
      } else {
        this.checkedRows.forEach((c) => {
          checked.push(c.settings_id);
        });
      }
      console.log(checked);
      window.api.send("onLoadDirectoryFiles", checked);
      this.$emit("directoryID", this.selected);
    },
  },
};
</script>
<style >
.settings-component {
  background-color: #ffffff;
}
</style>
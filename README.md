# video-shuffler
This project is made with Electron, VueJS and SQLITE3. The primary focus of this project is to create a local media file eadinng and shuffler for those wanting to watch their favorite TV Shows, Movies or whatever in a random order.
### Compiles and hot-reloads for development
Rename the files.example.json to files.json and shuffle.example.db to shuffle.db

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```


### Other configuration
The package.json provides commands for launching the Electron application instead of the web version as listed above as well as build commands depending on the operating system.

### Features
The features included are listed below
1. Play, Pause, Shuffle, Search (and play selected searched track)
2. Loading custom media folder sources with recurssive file searching to add in files within folders.
3. Load a single, multiple or all directories at once.
4. Directory paths and file references are stored in a SQLITE3 database.
5. The last active source loaded will be stored in a .JSON file to reduce the amount of times the application has to reference the database and is only updated when a CRUD opration is triggered.
6. A favorites tab to list all favorited tracks based on the current/multiple sources seleted or if all sources are selected.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### A few application images
#### Default UI with example video
![VS-Demo-001](/video-shuffler-001.png)

#### Default UI while playing a video playlist
![VS-Demo-001](/video-shuffler-002.png)

#### The Favorites list tab
![VS-Demo-001](/favorites-list.png)

#### The Settings list tab
The settings tab is a bit interesting so here is some more information about it. When you are loading in a directory with 2 subdirectories, in order to capture those 2 subdirectories, it is best to have any time of file like a image or whatever inside the base directory and select that image in the base directory when choosing the filepath. This will allow the program to utilize and start reading and building the new items filepaths from that location and will recursiely also get those 2 subdirectories and those files within.
![VS-Demo-001](/settings-view.png)
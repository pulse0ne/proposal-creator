<template>
  <div id="app">
    <div class="controls" v-if="!hideControls">
        <button @click="print()">Create PDF</button>
        <textarea v-model="testmodel"></textarea>
    </div>
    <div class="content" :style="contentStyle">
        <h1 id="header">PROPOSAL</h1>
        <p>{{ testmodel }}</p>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
    name: 'proposal-creator',
    data () {
        return { hideControls: false, testmodel: '' };
    },
    mounted: function () {
        ipcRenderer.on('wrote-pdf', (event, path) => {
            this.hideControls = false;
        });
    },
    methods: {
        print () {
            this.hideControls = true;
            ipcRenderer.send('print-to-pdf');
        }
    },
    computed: {
        contentStyle () {
            if (!this.hideControls) {
                return { border: '1px solid rgba(0, 0, 0, 0.3)' };
            }
        }
    }
};
</script>

<style>
@font-face {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 900;
    src: local('Poppins Black'), local('Poppins-Black'), url(./assets/Poppins.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

* {
    font-family: sans-serif;
}

#header {
    font-family: 'Poppins', sans-serif;
    font-size: 72px;
    letter-spacing: -4px;
    margin: -16px 0;
}

.content {
    padding: 18px;
}
</style>

<template>
  <div id="app">
    <div class="controls" v-if="!hideControls">
        <div class="inputs">
            <div class="input-group">
                <span>My name:</span>
                <input type="text" v-model="myName">
            </div>
            <div class="input-group">
                <span>My email:</span>
                <input type="email" v-model="myEmail">
            </div>
            <div class="input-group">
                <span>My phone:</span>
                <input type="tel" v-model="myPhone">
            </div>
            <div class="input-group">
                <span>Client name:</span>
                <input type="text" v-model="clientName">
            </div>
            <div class="input-group">
                <span>Project ID:</span>
                <input type="text" v-model="projectId">
            </div>
            <div class="input-group">
                <span>Project Name:</span>
                <input type="text" v-model="projectName">
            </div>
            <div class="input-group">
                <span>Test Input: </span>
                <textarea v-model="testmodel"></textarea>
            </div>
        </div>
        <button @click="print()">Create PDF</button>
    </div>
    <div class="content" :style="contentStyle">
        <div class="header-line">
            <h1 id="header">PROPOSAL</h1>
            <div class="header-info">
                <div>{{ myName }}</div>
                <div><a :href="emailLink">{{ myEmail }}</a></div>
                <div><a :href="phoneLink">{{ myPhone }}</a></div>
            </div>
        </div>
        <div class="project-info">
            <div v-if="clientName">
                <strong>Client: </strong>
                <span v-html="clientName"></span>
            </div>
            <div v-if="projectId">
                <strong>Project ID: </strong>
                <span v-html="projectId"></span>
            </div>
        </div>
        <div class="project-title">
            {{ projectName }}
        </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
    name: 'proposal-creator',
    data () {
        return {
            hideControls: false,
            testmodel: '',
            myName: '',
            myEmail: '',
            myPhone: '',
            clientName: '',
            projectName: '',
            projectId: ''
        };
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
        },
        phoneLink () {
            if (this.myPhone) {
                return 'tel:' + this.myPhone.replace(/[^\d]/g, '');
            }
        },
        emailLink () {
            if (this.myEmail) {
                return 'mailto:' + this.myEmail;
            }
        }
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Montserrat:900i|Source+Sans+Pro');

/** TODO: remove the packaged font **/
@font-face {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 900;
    src: local('Poppins Black'), local('Poppins-Black'), url(./assets/Poppins.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

* {
    font-family: 'Source Sans Pro', sans-serif;
}

.header-line {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.header-info {
    text-align: right;
}

.project-title {
    text-align: center;
    font-size: 24px;
    margin: 20px;
}

#header {
    font-family: 'Montserrat', 'Poppins', sans-serif;
    font-size: 92px;
    letter-spacing: -4px;
    margin: -16px 0;
    color: #121212;
}

.content {
    padding: 18px;
}

.controls {
    font-size: 10px;
}

.inputs {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.input-group {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 8px;
}

.input-group > span {
    margin-right: 4px;
}

textarea, input {
    font-size: inherit;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 2px;
}

textarea:focus, input:focus {
    box-shadow: 0 0 0 1px #05a86a;
    outline: none;
}

button {
    border: none;
    background: #05a86a;
    color: white;
    border-radius: 12px;
    font-size: inherit;
    padding: 6px 12px;
    cursor: pointer;
}

a {
    color: #072a74;
}
</style>

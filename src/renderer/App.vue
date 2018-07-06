<template>
  <div id="app">
    <div class="controls" v-show="!hideControls">
        <div class="inputs">
            <div class="input-group">
                <span>My name:</span>
                <autocomplete-input :options="devNameOptions" v-model="devName" />
            </div>
            <div class="input-group">
                <span>My email:</span>
                <autocomplete-input :options="devEmailOptions" v-model="devEmail" />
            </div>
            <div class="input-group">
                <span>My phone:</span>
                <autocomplete-input :options="devPhoneOptions" v-model="devPhone" />
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
        </div>
        <button @click="saveToPdf()">Create PDF</button>
        <button @click="saveToHtml()">Save HTML</button>
    </div>
    <div class="content" :style="contentStyle" ref="content">
        <div class="header-line">
            <h1 id="header">PROPOSAL</h1>
            <div class="header-info">
                <div>{{ devName }}</div>
                <div><a :href="emailLink">{{ devEmail }}</a></div>
                <div><a :href="phoneLink">{{ devPhone }}</a></div>
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
import { ipcRenderer as ipc } from 'electron';
import AutocompleteInput from './components/AutocompleteInput.vue';

export default {
    name: 'proposal-creator',
    components: { AutocompleteInput },
    data () {
        return {
            devNameOptions: [],
            devPhoneOptions: [],
            devEmailOptions: [],
            hideControls: false,
            devName: '',
            devEmail: '',
            devPhone: '',
            clientName: '',
            projectName: '',
            projectId: ''
        };
    },
    mounted: function () {
        ipc.on('wrote-pdf', () => {
            this.hideControls = false;
        });

        ipc.on('wrote-html', () => {
            this.hideControls = false;
        });

        ipc.on('error', (event, msg) => {
            this.hideControls = false;
            // TODO: show toast
            console.error(msg);
        });

        ipc.on('autocompletes', (event, ac) => {
            Object.keys(ac).forEach(k => this[k + 'Options'] = ac[k]);
        });

        ipc.send('get-autocompletes');
    },
    methods: {
        saveToPdf () {
            this.updateAutocompletes();
            this.hideControls = true;
            this.$nextTick(() => ipc.send('save-to-pdf'));
        },
        saveToHtml () {
            this.updateAutocompletes();
            this.hideControls = true;
            this.$nextTick(() => ipc.send('save-to-html', { head: document.head.innerHTML, body: document.body.innerHTML }));
        },
        updateAutocompletes () {
            const autocompletes = {
                devName: this.devName,
                devEmail: this.devEmail,
                devPhone: this.devPhone
            };
            Object.keys(autocompletes).forEach(a => {
                const options = this[a + 'Options'];
                const val = autocompletes[a];
                if (!options.includes(val)) {
                    options.push(val);
                }
            });
            ipc.send('update-autocompletes', autocompletes);
        }
    },
    computed: {
        contentStyle () {
            if (!this.hideControls) {
                return { border: '1px solid rgba(0, 0, 0, 0.3)' };
            }
        },
        phoneLink () {
            if (this.devPhone) {
                return 'tel:' + this.devPhone.replace(/[^\d]/g, '');
            }
        },
        emailLink () {
            if (this.devEmail) {
                return 'mailto:' + this.devEmail;
            }
        }
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Montserrat:700,900i|Source+Sans+Pro');

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
    font-family: 'Montserrat', 'Source Sans Pro', sans-serif;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 20px;
}

#header {
    font-family: 'Montserrat', sans-serif;
    font-style: italic;
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
    padding: 18px;
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
    box-sizing: border-box;
}

textarea:focus, input:focus {
    border: 1px solid #05a86a;
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
    margin: 4px;
}

a {
    color: #072a74;
}
</style>

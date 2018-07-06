<template>
    <div class="autocomplete-input">
        <input
            ref="search"
            :placeholder="placeholder"
            :class="{ open: open && matches.length}"
            v-model="searchText"
            @input="searchChanged"
            @keydown.enter="suggestionSelected(matches[selected])"
            @keydown.down="down"
            @keydown.up="up"
            @keydown.esc="setOpen(false)"
            @blur="setOpen(false)"
            @focus="focus"
        >
        <ul class="suggestions" v-if="open && matches.length" :style="listStyle">
            <li
                v-for="(item, ix) in matches" 
                :key="ix"
                :class="{ active: ix === selected }"
                @mousedown.prevent
                @click="suggestionSelected(item)"
            >
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data () {
        return {
            searchText: '',
            open: false,
            selected: 0
        };
    },
    mounted () {
        if (this.value) {
            this.updateComponentWithValue(this.value);
        }
    },
    props: {
        value: [String, Number],
        options: { type: Array, required: true },
        placeholder: String,
        openOnFocus: { type: Boolean, default: true }
    },
    methods: {
        updateComponentWithValue (newValue) {
            this.searchText = newValue;
        },
        setOpen (open) {
            this.open = open;
            if (this.open) {
                this.$refs.search.focus();
            }
        },
        searchChanged (event) {
            if (!this.open) {
                this.open = true;
            }
            this.selected = 0;
            this.$emit('input', event.target.value);
        },
        suggestionSelected (suggestion) {
            this.open = false;
            this.searchText = suggestion;
            this.$emit('input', suggestion);
        },
        up () {
            if (this.open) {
                if (this.selected > 0) {
                    this.selected--;
                }
            } else {
                this.setOpen(true);
            }
        },
        down () {
            if (this.open) {
                if (this.selected < this.matches.length - 1) {
                    this.selected++;
                }
            } else {
                this.setOpen(true);
            }
        },
        focus () {
            if (this.openOnFocus) {
                this.setOpen(true);
            }
        }
    },
    computed: {
        matches () {
            return this.options.filter(option => option.toUpperCase().includes(this.searchText.toUpperCase()));
        },
        listStyle () {
            return `top: ${this.$refs.search.clientHeight}px`;
        }
    },
    watch: {
        value (newValue) {
            this.updateComponentWithValue(newValue);
        }
    }
};
</script>

<style scoped>
.autocomplete-input {
    position: relative;
}

.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.suggestions {
    background-color: #fefefe;
    position: absolute;
    top: 18px;
    left: 0;
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 0 0 4px 4px;
    border-top: none;
    box-sizing: border-box;
    list-style: none;
    z-index: 99;
    padding: 0;
    margin: 0;
}

.suggestions li {
    cursor: pointer;
    padding: 2px 4px;
}

.suggestions li:hover {
    background-color: #e5e5e5;
}

.suggestions li.active {
    color: #ffffff;
    background-color: #05a86a;
}
</style>

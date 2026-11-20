import { mount } from 'svelte'
import './tokens.css'
import './app.css'
import App from './App.svelte'
import { settings } from './lib/settings.svelte'

settings.apply()
mount(App, { target: document.getElementById('app')! })

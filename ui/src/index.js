import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import {initReactI18next} from 'react-i18next';
import i18n from 'i18next';
import en from './translations/en.json';
import de from './translations/de.json';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cache from 'i18next-localstorage-cache';

i18n
.use(initReactI18next)
.use(Cache)
.use(LanguageDetector)
.init({
  resources: {
    en: en,
    de: de
  },
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

ReactDOM.render(  
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

serviceWorker.unregister();

/* global Module */

/* Magic Mirror
 * Module: MMM-COVID19
 *
 * By Jose Forte
 * MIT Licensed.
 */

Module.register("MMM-COVID19", {
  countriesStats: {},
  globalStats: { "total_cases": "", "total_deaths": "", "total_recovered": "" }, // beautify things at start
  defaults: {
    header: 'COVID-19',
    countries: [ "Argentina", "Italy", "Spain", "Germany" ], // default list
    orderCountriesByName: false, // false will sort by total number of confirmed cases 
    orderAscending: false, // sort order, true = ascending, false = descending
    lastUpdateInfo: false,
    worldStats: false,
    delta: false,
    showExtraInfo: false,
    highlightCountry: "", // when containing a valid country ("countries:...") the row's background colour will be changed to enhance visibility 
    rapidapiKey : "", // X-RapidAPI-Key provided at https://rapidapi.com/astsiatsko/api/coronavirus-monitor
    headerRowClass: "small", // small, medium or big
    infoRowClass: "big", // small, medium or big
    updateInterval: 300000, // update interval in milliseconds
    fadeSpeed: 4000, 
    timeFormat: "MMMM Do YYYY, h:mm:ss a" // April 7th 2020, 03:08:10 pm
  },

  getStyles: function() {
    return ["MMM-COVID19.css"]
  },
  
  getTranslations: function() {
    return {
      en: "translations/en.json",
      de: "translations/de.json",
      es: "translations/es.json",
      hu: "translations/hu.json",
      pl: "translations/pl.json",
      fr: "translations/fr.json",
	  ko: "translations/ko.json"
	}
  },

  start: function() {
	  this.getInfo()
    this.scheduleUpdate()
  },

  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay
    }
    var self = this
    setInterval(function() {
      self.getInfo()
    }, nextLoad)
  },

  getInfo: function () {
    this.sendSocketNotification('GET_BY_COUNTRY_STATS', this.config.rapidapiKey)

    if (this.config.worldStats) {
      this.sendSocketNotification('GET_GLOBAL_STATS', this.config.rapidapiKey)
    }
  },

  socketNotificationReceived: function(notification, payload) {
    var self = this
    if (notification === "BYCOUNTRY_RESULT") {
      this.countriesStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
    if (notification === "GLOBAL_RESULT") {
      this.globalStats = payload
      this.updateDom(self.config.fadeSpeed)
    }
  },

  

  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.className = "covid19";
    wrapper.innerHTML = "Loading...";
    var countriesList = this.config.countries
    var countriesStats = this.countriesStats["countries_stat"]
    var globalStats = this.globalStats

    for (let key in countriesStats) {
      let value = countriesStats[key]
      if (countriesList.indexOf(value["country_name"]) != -1) {        
        cases = value["cases"];
        deaths = value["deaths"];
        serious = value["serious_critical"];
        newCases = value["new_cases"];
        newDeaths = value["new_deaths"];
        totalRecovered = value["total_recovered"];
        activeCases = value["active_cases"];
        casesPerM = value["total_cases_per_1m_population"];    
        wrapper.innerHTML = "☣ COVID19  +"+newCases+"";    
      }
    }

		return wrapper
  },
  // sort according to the key (currently country_name or cases), 
  // sort order either ascending or descending as per variable orderAscending
  compareValues: function(key, order ) {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0
      }
  
	  let varAlpha = Number(a[key].replace(/,/g,''))
	  let varBeta = Number(b[key].replace(/,/g,''))
	  
	  const varA = (Number.isNaN(varAlpha))
        ? a[key].toUpperCase() : varAlpha
      const varB = (Number.isNaN(varBeta))
        ? b[key].toUpperCase() : varBeta
  
      let comparison = 0
      if (varA > varB) {
        comparison = 1
      } else if (varA < varB) {
        comparison = -1
      }
      return (
        (!order) ? (comparison * -1) : comparison
      );
    }
  },  
  // insert separating commas into a number at thousands, millions, etc
  numberWithCommas: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
})
await window.PraxisI18n.init({baseUrl:'../locales/',namespaceList:['common','info']});
document.querySelector('[data-info-language]').append(window.PraxisI18n.createSelector());

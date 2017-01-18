// transpile to es5:
// install babel, babel-preset-2015 and (optionally) uglifyjs, then:
// `babel superbugs.js | uglifyjs > superbugs.min.js`

// load geojson and csvdata asynchrously, but only once
d3.json('./europe.topo.json', d => {

  // convert topojson to geojson
  const geoData = topojson.feature(d, d.objects.europe_clipped)

  d3.csv('./superbugs.csv', d => {
    const data = d
    const columns = d.columns

    // set defaults for each map, including geojson & csvdata
    d3.playbooks.choroplethMap.defaults({
      data,
      geoData,
      width: 400,
      height: 400,
      nullColor: '#eee',
      cssNamespace: 'superbugs-map',
      responsiveSvg: true,
      getId: f => f.properties.iso_a2,
      yExtent: [0, 64],
      color: d3.schemeYlOrRd[9],  // needs `d3-scale-chromatic`
      drawExtra: C => {
        // draw simple legend
        C.element.append('div')
          .attr('class', 'superbugs-map__legend --delete-on-update')
          .text('Resistance in %')
          .append('ul')
          .selectAll('li')
        .data(C.getColor.quantiles()).enter()
          .append('li')
          .attr('class', 'superbugs-map__legend-item')
          .text(d => Math.round(d))
          .append('span')
          .style('background-color', d => C.getColor(d))
      }
    })

    // function to render map based on column name
    const renderMap = yCol => {

      // get metadata (see below)
      const meta = META_DATA[yCol]

      // add some infos around the map
      const wrapper = d3.select('.main')
        .append('div')
          .attr('class', 'superbugs-map__container')
          .attr('id', yCol)  // to render map into this actual element
      const title = wrapper.append('div')
          .attr('class', 'superbugs-map__title')
      title.append('h3').text(meta.title)
      title.append('p').attr('class', 'subtitle').text(meta.subtitle)
      title.append('p').attr('class', 'desc').text(meta.text)
      title.append('p').append('a').attr('href', meta.url).text('more info')

      // render actual map
      const map = d3.playbooks.choroplethMap({yCol, elementId: yCol}).render()

      const infoDiv = wrapper.append('div').attr('class', 'superbugs-map__info')

      if (meta.euData) {
        // render overall eu data into map container
        d3.select('#'+yCol)
          .select('.superbugs-map__wrapper')
        .append('p')
          .attr('class', 'eudata')
          .text('EU: ' + meta.euData + ' %')
      }

      infoDiv.append('p').attr('class', 'source').text('Source: ' + meta.source)

      return map
    }

    // render map for each column (except `id`)
    const MAPS = columns.filter(c => c !== 'id').map(c => renderMap(c))

    // add colorScheme switcher buttons
    const schemeKeys = Object.keys(COLOR_SCHEMES)
    const changeScheme = (map, scheme) => {
      if (scheme === '__random__') {
        const i = Math.random() * schemeKeys.length | 0
        scheme = COLOR_SCHEMES[schemeKeys[i]]
      }
      // change color for map and update rendering
      map.color(scheme).update()
    }
    const switcher = d3.select('.colorswitcher')
    switcher.selectAll('.button')
      .data(Object.keys(COLOR_SCHEMES)).enter()
        .append('button')
        .attr('class', 'colorswitcher__button')
        .text(d => d)
        .on('click', d => MAPS.map(m => changeScheme(m, COLOR_SCHEMES[d])))
    switcher.append('button')
        .attr('class', 'colorswitcher__button')
        .text('RANDOM')
        .on('click', d => MAPS.map(m => changeScheme(m, '__random__')))
  })

})


// metadata for each map
const META_DATA = {
  ecoli1: {
    title: 'E. coli – Cephalosporins',
    subtitle: 'Escherichia coli vs cephalosporins',
    text: 'Resistance to 3rd generation cephalosporins in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    euData: 12,
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-e-coli-cephalosporins/'
  },
  ecoli2: {
    title: 'E. coli – Fluoroquinolones',
    subtitle: 'Escherichia coli vs fluoroquinolones ',
    text: 'Resistance to fluoroquinolones in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    euData: 22.4,
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-e-coli-fluoroquinol/'
  },
  kp1: {
    title: 'Klebsiella pneumoniae – Cephalosporins',
    subtitle: 'Klebsiella pneumoniae vs cephalosporins',
    text: 'Resistance to 3rd generation cephalosporins in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    euData: 28,
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-klebsiella-cephalosporins/'
  },
  kp2: {
    title: 'Klebsiella pneumoniae – Carbapenems',
    subtitle: 'Klebsiella pneumoniae vs carbapenems',
    text: 'Resistance to carbapenems in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    euData: 7.3,
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-klebsiella-carbapenems/'
  },
  mrsa: {
    title: 'MRSA',
    subtitle: 'Staphylococcus aureus vs methicillin',
    text: 'MRSA in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    euData: 17.4,
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-mrsa/'
  },
  sp: {
    title: 'Streptococcus pneumoniae – Penicillin',
    subtitle: 'Streptococcus pneumoniae vs penicillin',
    text: 'Resistance to penicillin in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'ECDC Surveillance report 2014, except Poland (2013)',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-streptococcus-pneumoniae-penicillin/'
  },
  nts: {
    title: 'Salmonella – Fluoroquinolones',
    subtitle: 'Salmonella vs fluoroquinolones',
    text: 'Resistance to fluoroquinolones in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'WHO Surveillance report 2014',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-salmonella-fluoroquinolones/'
  },
  shigella: {
    title: 'Shigella – Fluoroquinolones',
    subtitle: 'Shigella vs fluoroquinolones',
    text: 'Resistance to fluoroquinolones in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'WHO Surveillance report 2014',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-shigella-fluoroquinolones/'
  },
  neisseria: {
    title: 'Neisseria gonorrhoea – Cephalosporins',
    subtitle: 'Neisseria gonorrhoea vs cephalosporins',
    text: 'Resistance to 3rd generation cephalosporins in percent. Of all infections with this bacterium, this percentage was resistant to this antibiotic.',
    source: 'WHO Surveillance report 2014',
    url: 'https://correctiv.org/en/investigations/superbugs/atlas/superbug-atlas-neisseria-gonorrhoea-cephalosporins/'
  }
}

// https://github.com/d3/d3-scale-chromatic
const COLOR_SCHEMES = {
  BrBG: d3.schemeBrBG[9],
  PRGn: d3.schemePRGn[9],
  PiYG: d3.schemePiYG[9],
  PuOr: d3.schemePuOr[9],
  RdBu: d3.schemeRdBu[9],
  RdGy: d3.schemeRdGy[9],
  RdYlBu: d3.schemeRdYlBu[9],
  RdYlGn: d3.schemeRdYlGn[9],
  Spectral: d3.schemeSpectral[9],
  Blues: d3.schemeBlues[9],
  Greens: d3.schemeGreens[9],
  Greys: d3.schemeGreys[9],
  Oranges: d3.schemeOranges[9],
  Purples: d3.schemePurples[9],
  Reds: d3.schemeReds[9],
  BuGn: d3.schemeBuGn[9],
  BuPu: d3.schemeBuPu[9],
  GnBu: d3.schemeGnBu[9],
  OrRd: d3.schemeOrRd[9],
  PuBuGn: d3.schemePuBuGn[9],
  PuBu: d3.schemePuBu[9],
  PuRd: d3.schemePuRd[9],
  RdPu: d3.schemeRdPu[9],
  YlGnBu: d3.schemeYlGnBu[9],
  YlGn: d3.schemeYlGn[9],
  YlOrBr: d3.schemeYlOrBr[9],
  YlOrRd: d3.schemeYlOrRd[9]
}

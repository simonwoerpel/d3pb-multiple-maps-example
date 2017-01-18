# Multiple maps example

This example demonstrates how to use [`d3-playbooks-maps`](https://github.com/simonwoerpel/d3-playbooks-maps) to render multiple responsive static maps efficiently and how to change map options (like color) and update them after they are already rendered.

https://simonwoerpel.github.io/d3pb-multiple-maps-example/

## Load data only once

`d3-playbooks-maps` accepts either data as urls to load asynchrously via the `geoDataUrl` and `dataUrl` attributes during initialization (see documentation) or `geoData` and `data` attributes directly where data is already present. Another feature of `d3-playbooks-maps` is to define defaults for your map(s) before render specific ones.

Wrapping these feautures into the async data loading callbacks is a way to render multiple maps without loading async data multiple times:

```javascript
d3.json('./europe.topo.json', d => {
  const geoData = topojson.feature(d, d.objects.europe_clipped)
  d3.csv('./superbugs.csv', d => {
    const data = d
    // set global defaults for each map
    d3.playbooks.choroplethMap.defaults({
      data,
      geoData,
      // more defaults like width / colors go here...
    })

    // render maps
    const map1 = d3.playbooks.choroplethMap({...}).render()
    const map2 = d3.playbooks.choroplethMap({...}).render()
    // ...

  })
})
```

## Change maps after rendered

Every setting has a getter / setter method:
```javascript
myMap.color()       // return actual color
myMap.color("red")  // set new color
```

Also, `d3-playbooks-maps` offers public methods for each map instance like `render`, `resize`, `update` (and some more if used together with `d3-playbooks-riot-components`).

Therefore changing the `colorScheme` and re-render the map is as simple as:

```javascript
myMap.color(d3.schemeBlues[9]).update()
```

Setters can also be chained:

```javascript
myMap.color("red").width(800).height(600).update()
```

For further information, have a look at the documentation of [`d3-playbooks-maps`](https://github.com/simonwoerpel/d3-playbooks-maps)

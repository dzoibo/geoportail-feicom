<script>
  // @ts-nocheck
  import { dataStore } from '../../shared/store';
  import { getSumOf, findMinMax } from '../../shared/utilitaire';
  import Chart from 'chart.js/auto';

  import {
    MapLibre,
    GeolocateControl,
    NavigationControl,
    ScaleControl,
    AttributionControl,
    FullscreenControl,
    Control,
    ControlGroup,
    ControlButton,
    VectorTileSource,
    FillLayer,
    LineLayer,
    hoverStateFilter,
    JoinedData,
    GeoJSON,
    MarkerLayer,
    SymbolLayer,
    Popup
  } from 'svelte-maplibre';
  import { onMount, afterUpdate } from 'svelte';
  let clickedFeature;
  let trigger = true;
  let dataArr2 = [];
  let statisticsPerRegion = [];
  let MinMax = {};
  let geojsonRegionCentroid;

  // Utilisez le store dans votre composant Map
  const unsubscribe = dataStore.subscribe((dataArr) => {
    dataArr2 = dataArr;
  });

  onMount(async () => {
    const response = await fetch('./data/gadm41_CMR_1_centroid.geojson');
    geojsonRegionCentroid = await response.json();
    console.log(geojsonRegionCentroid);
  });

  onMount(() => {
    // Utilisez onMount pour charger le GeoJSON depuis l'URL externe
    /*  const ctx = document.getElementById('chart');
    const chart = new Chart(ctx, {
      //Type of the chart
      type: 'pie',
      data: {
        //labels on x-axis
        labels: [],
        datasets: [
          {
            //The label for the dataset which appears in the legend and tooltips.
            label: 'Price',
            //data for the line
            data: [],
            //styling of the chart
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          //make sure Y-axis starts at 0
          y: {
            beginAtZero: true
          }
        }
      }
    }); */
  });

  $: {
    if (dataArr2.length > 0 && trigger == true) {
      statisticsPerRegion = getSumOf(dataArr2, 'Région');
      MinMax = findMinMax(statisticsPerRegion, 'value');
      let trigger = false;
    }
  }
</script>

{#if clickedFeature && trigger}
  <p class="z-1000">
    Number of Earthquakes:
    <span class="font-bold text-gray-800">{clickedFeature['NAME_1']}</span>
  </p>
  <p>
    Average Magnitude:
    <span class="font-bold text-gray-800">
      {clickedFeature['Région']}
    </span>
  </p>
  <p>Magnitude: <span class="font-bold text-gray-800">{clickedFeature.NAME_1}</span></p>
{/if}
<!-- Use the reactive dataArr to update the JoinedData component -->
{#if dataArr2.length > 0 && trigger == true}
  <div />

  <MapLibre
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    center={[12, 6]}
    zoom={5}
    attributionControl={false}
    let:map
    class="w-screen"
  >
    <!-- Tu peux également définir l'attribut `standardControls` de la carte pour créer ces contrôles. -->
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 25 }} />
    <FullscreenControl position="top-right" />
    <ScaleControl />

    <VectorTileSource url={'pmtiles://data/region.pmtiles'} promoteId={'NAME_1'}>
      <FillLayer
        paint={{
          'fill-opacity': hoverStateFilter(0.7, 0.4),

          'fill-opacity': hoverStateFilter(0.7, 0.4),
          'fill-color': [
            'case',
            ['!=', ['feature-state', 'value'], null],
            [
              'interpolate',
              ['linear'],
              ['feature-state', 'value'],
              MinMax.min,
              'rgba(222,235,247,1)',
              MinMax.max,
              'rgba(49,130,189,1)'
            ],
            'rgba(255, 255, 255, 0)'
          ]
        }}
        manageHoverState
        sourceLayer={'regions'}
        maxzoom={8}
        on:click={(e) => console.log(e.detail.features?.[0]?.state)}
      />
      <JoinedData data={statisticsPerRegion} idCol="Région" sourceLayer="regions" />
    </VectorTileSource>

    <GeoJSON data={geojsonRegionCentroid}>
      <JoinedData data={statisticsPerRegion} idCol="Région" />
      <MarkerLayer let:feature maxzoom={8}>
        {#each statisticsPerRegion as { Région, value }}
          {#if feature.properties.NAME_1 === Région}
            <div class="bg-gray-200 rounded-full p-2 shadow align flex flex-col items-center">
              <div class="text-sm font-bold">{feature.properties.NAME_1}</div>
              <div class="text-sm font-bold">{value} projets</div>
            </div>
          {/if}
        {/each}
      </MarkerLayer>
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/departements.pmtiles'} promoteId={'NAME_1'}>
      <FillLayer
        paint={{
          'fill-opacity': 0.6,
          'fill-color': 'green'
        }}
        sourceLayer={'departements'}
        minzoom={8}
        maxzoom={13}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-width': 3,
          'line-color': 'orange'
        }}
        sourceLayer={'departements'}
        minzoom={8}
      />
    </VectorTileSource>

    <VectorTileSource url={'pmtiles://data/municipalites.pmtiles'} promoteId={'NAME_1'}>
      <FillLayer
        paint={{
          'fill-opacity': 0,
          'fill-color': 'red'
        }}
        sourceLayer={'municipalites'}
        minzoom={10}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-color': 'white'
        }}
        sourceLayer={'municipalites'}
        minzoom={10}
      />
    </VectorTileSource>
  </MapLibre>
{/if}
